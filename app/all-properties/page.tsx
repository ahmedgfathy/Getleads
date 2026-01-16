'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// --- Reusing Icons for consistency ---
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const BedIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6h18v4a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
)
const BathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a6 6 0 0112 0v2M4 8v12h18V8M4 8H3m14-2H5" /> 
  </svg>
)
const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
)

import { FacebookIcon } from '@/app/components/FacebookIcon'

function AllPropertiesContent() {
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const searchParams = useSearchParams()
    
    // Status can be 'sale', 'rent', or anything
    const typeParam = searchParams.get('type')
    const filterTitle = typeParam === 'sale' ? 'عقارات للبيع' : typeParam === 'rent' ? 'عقارات للإيجار' : 'كل العقارات'

    useEffect(() => {
        checkUser()
        fetchProperties()
    }, [typeParam])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
    }

    const fetchProperties = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/properties')
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            
            const processedData = (data || []).map((p: any) => {
                let customFields = {};
                try {
                   if (typeof p.custom_fields === 'string') customFields = JSON.parse(p.custom_fields);
                   else customFields = p.custom_fields || {};
                } catch { customFields = {}; }
                const anyCF = customFields as any;
                
                return {
                  ...p,
                  title: anyCF.property_name_compound_name || p.title,
                  price: Number(p.price || anyCF.total_price || anyCF.price || 0),
                  city: p.city || anyCF.area || anyCF.location || anyCF.compound || '',
                  property_type: p.property_type || anyCF.type || anyCF.property_type || 'Unknown',
                  property_category: p.property_category || anyCF.category || 'General',
                  status: p.status || anyCF.unit_for || 'Available',
                  bedrooms: p.bedrooms || anyCF.rooms || anyCF.bedrooms || 0,
                  bathrooms: p.bathrooms || anyCF.bathrooms || 0,
                  area: p.area || anyCF.space || anyCF.area || 0,
                  description: String(p.description || anyCF.description || ''),
                  mobile_number: '01002778090',
                };
            });

            // Filter logic
            let filtered = processedData;
            if (typeParam === 'sale') {
                filtered = processedData.filter((p: any) => 
                    p.status.toLowerCase().includes('sale') || 
                    p.status.includes('بيع') ||
                    p.listing_type?.toLowerCase() === 'sale'
                );
            } else if (typeParam === 'rent') {
                 filtered = processedData.filter((p: any) => 
                    p.status.toLowerCase().includes('rent') || 
                    p.status.includes('إيجار') ||
                     p.listing_type?.toLowerCase() === 'rent'
                );
            }

            setProperties(filtered)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
             {/* Simple Header for Subpages */}
             <header className="bg-slate-900 text-white py-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center font-bold">R</div>
                        <span className="font-bold text-xl">الرواد العقارية</span>
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-emerald-400 text-slate-300">الرئيسية</Link>
                        <Link href="/all-properties?type=sale" className={`hover:text-emerald-400 ${typeParam === 'sale' ? 'text-white' : 'text-slate-300'}`}>بيع</Link>
                        <Link href="/all-properties?type=rent" className={`hover:text-emerald-400 ${typeParam === 'rent' ? 'text-white' : 'text-slate-300'}`}>إيجار</Link>
                        <Link href="/about" className="hover:text-emerald-400 text-slate-300">من نحن</Link>
                        <Link href="/contact" className="hover:text-emerald-400 text-slate-300">اتصل بنا</Link>
                        
                        <div className="flex items-center gap-3 mr-4 border-r border-slate-700 pr-4">
                            <a 
                                href="https://www.facebook.com/elrowadrealestates" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] text-white transition-all duration-300"
                                aria-label="Facebook"
                            >
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </nav>
                </div>
             </header>

             <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8 border-b border-slate-200 pb-4">
                    <h1 className="text-3xl font-bold text-slate-900">{filterTitle}</h1>
                    <p className="text-slate-500 mt-2">عرض {properties.length} عقار</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {properties.length > 0 ? properties.map((property) => (
                             <div 
                                key={property.id} 
                                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-emerald-100"
                              >
                                {/* Image Section */}
                                <div className="relative h-64 bg-slate-200 overflow-hidden">
                                   <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
                                      <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                      </svg>
                                   </div>
                                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80"></div>
                                   <div className="absolute top-4 right-4 flex gap-2">
                                      <span className="bg-white/95 backdrop-blur-sm text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ring-1 ring-emerald-500/20">
                                        {property.status}
                                      </span>
                                   </div>
                                   <div className="absolute bottom-4 right-4 text-white drop-shadow-md">
                                      <p className="text-xl font-bold tracking-tight">
                                        {property.price ? Number(property.price).toLocaleString() : 'اتصل للسعر'} 
                                        {property.price ? <span className="text-sm font-normal mr-1 text-emerald-300">ج.م</span> : ''}
                                      </p>
                                   </div>
                                </div>
                
                                {/* Content Section */}
                                <div className="p-6">
                                   <div className="flex items-center text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wider">
                                      {property.property_type} • {property.property_category}
                                   </div>
                                   
                                   <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                     {property.title}
                                   </h3>
                                   
                                   <div className="flex items-center text-slate-500 text-sm mb-6">
                                      <LocationIcon className="w-4 h-4 ml-1 flex-shrink-0 text-slate-400" />
                                      <span className="truncate">{property.city}</span>
                                   </div>
                
                                   {/* Features */}
                                   <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-2xl p-4 mb-6 ring-1 ring-slate-100">
                                      <div className="flex flex-col items-center gap-1">
                                         <div className="flex items-center gap-1 font-bold text-slate-900">
                                            <BedIcon className="w-5 h-5 text-emerald-500" />
                                            {property.bedrooms}
                                         </div>
                                         <span className="text-xs">غرف</span>
                                      </div>
                                      <div className="w-px h-8 bg-slate-200"></div>
                                      <div className="flex flex-col items-center gap-1">
                                         <div className="flex items-center gap-1 font-bold text-slate-900">
                                            <BathIcon className="w-5 h-5 text-emerald-500" />
                                            {property.bathrooms}
                                         </div>
                                         <span className="text-xs">حمام</span>
                                      </div>
                                      <div className="w-px h-8 bg-slate-200"></div>
                                      <div className="flex flex-col items-center gap-1">
                                         <div className="flex items-center gap-1 font-bold text-slate-900">
                                            <span>{property.area}</span>
                                         </div>
                                         <span className="text-xs">متر²</span>
                                      </div>
                                   </div>
                
                                   {/* Action */}
                                   <div className="flex items-center gap-3">
                                      <Link 
                                        href={`/properties/${property.id}`} 
                                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-medium text-center hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-emerald-600/20"
                                      >
                                        التفاصيل
                                      </Link>
                                      <a 
                                        href={`tel:${property.mobile_number}`}
                                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all ring-1 ring-emerald-100 hover:ring-emerald-600"
                                        aria-label="Call"
                                      >
                                         <PhoneIcon className="w-5 h-5" />
                                      </a>
                                   </div>
                                </div>
                              </div>
                        )) : (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                                <p className="text-slate-500 text-lg">لا توجد عقارات مطابقة حالياً.</p>
                                <Link href="/all-properties" className="text-emerald-600 font-bold mt-2 inline-block">عرض الكل</Link>
                            </div>
                        )}
                    </div>
                )}
             </main>
        </div>
    )
}

export default function AllPropertiesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AllPropertiesContent />
        </Suspense>
    )
}
