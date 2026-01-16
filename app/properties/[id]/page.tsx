'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

// --- Icons (Same as Home Page for consistency) ---
const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
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
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

interface Property {
  id: string
  title: string
  property_category: string
  property_type: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  city: string
  status: string
  description: string
  mobile_number: string
  custom_fields: string
  created_at: string
}

export default function PropertyDetailsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.id as string

  useEffect(() => {
    if (propertyId) {
      checkUser()
    }
  }, [propertyId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    await fetchProperty()
    setLoading(false)
  }

  const fetchProperty = async () => {
    try {
      if (!propertyId) return;
      
      const response = await fetch(`/api/properties?id=${propertyId}`)
      if (!response.ok) throw new Error('Failed to fetch property')
      const data = await response.json()
      
      let customFields = {};
      try {
        if (typeof data.custom_fields === 'string') {
          customFields = JSON.parse(data.custom_fields);
        } else if (typeof data.custom_fields === 'object') {
          customFields = data.custom_fields || {};
        }
      } catch (e) { console.error(e); }

      const anyCF = customFields as any;

      const normalizedProperty = {
        ...data,
        title: anyCF.property_name_compound_name || data.title,
        price: Number(data.price || anyCF.total_price || anyCF.price || 0),
        city: data.city || anyCF.area || anyCF.location || anyCF.compound || '',
        property_type: data.property_type || anyCF.type || anyCF.property_type || 'Unknown',
        property_category: data.property_category || anyCF.category || 'General',
        status: data.status || anyCF.unit_for || 'Available',
        bedrooms: data.bedrooms || anyCF.rooms || anyCF.bedrooms || 0,
        bathrooms: data.bathrooms || anyCF.bathrooms || 0,
        area: data.area || anyCF.space || anyCF.area || 0,
        description: data.description || anyCF.description || '',
        mobile_number: '01002778090', // Default contact
      };

      setProperty(normalizedProperty)
    } catch (error) {
      console.error('Error fetching property:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">العقار غير موجود</h2>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-bold">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900" dir="rtl">
      
      {/* Public Header - Consistent with Home */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg border border-emerald-500">
                R
              </div>
              <span className="text-2xl font-bold tracking-tight text-white hover:text-emerald-100 transition-colors">
                الرواد العقارية
              </span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 space-x-reverse items-center">
              {[
                ['الرئيسية', '/'],
                ['بيع', '/sell'],
                ['إيجار', '/rent'],
                ['من نحن', '/about'],
                ['اتصل بنا', '/contact']
              ].map(([label, href]) => (
                <Link 
                  key={label}
                  href={href} 
                  className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 ltr:flex-row-reverse text-emerald-400">
                 <span dir="ltr" className="font-bold text-sm">0100 277 8090</span>
                 <PhoneIcon className="w-4 h-4" />
              </div>
              {user && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs bg-emerald-900/50 text-emerald-400 ring-1 ring-emerald-500/50 hover:bg-emerald-900"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>لوحة التحكم</span>
                  </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
                 <MenuIcon className="w-6 h-6" />
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-xl p-4 md:hidden flex flex-col gap-4">
            <Link href="/" className="px-4 py-3 rounded-lg hover:bg-slate-700 text-white font-medium">الرئيسية</Link>
            {user && (
               <Link href="/dashboard" className="px-4 py-3 rounded-lg bg-emerald-700 text-white font-medium text-center">لوحة التحكم</Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-16">
        
        {/* Gallery / Hero for Property */}
        <div className="relative h-[400px] md:h-[500px] bg-slate-800">
           {/* Placeholder for real images */}
           <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg className="w-32 h-32 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
           </div>
           
           <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900/90 to-transparent">
              <div className="max-w-7xl mx-auto">
                 <div className="flex gap-2 mb-4">
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                       {property.status}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                       {property.property_category}
                    </span>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
                    {property.title}
                 </h1>
                 <div className="flex items-center text-slate-300 text-lg">
                    <LocationIcon className="w-5 h-5 ml-2 text-emerald-400" />
                    {property.city}
                 </div>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                 {/* Key Stats Card */}
                 <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-wrap justify-around gap-6 text-center ring-1 ring-slate-100">
                    <div>
                       <div className="text-slate-400 text-sm mb-1">السعر المطلوب</div>
                       <div className="text-3xl font-bold text-emerald-700">
                          {property.price ? Number(property.price).toLocaleString() : 'اتصل'}
                          {property.price ? <span className="text-lg text-slate-500 font-normal mr-1">ج.م</span> : ''}
                       </div>
                    </div>
                    <div className="w-px bg-slate-100 h-16 hidden md:block"></div>
                    <div>
                       <div className="text-slate-400 text-sm mb-1">المساحة</div>
                       <div className="text-2xl font-bold text-slate-800 flex items-center gap-1 justify-center">
                          {property.area} <span className="text-sm font-normal text-slate-500">م²</span>
                       </div>
                    </div>
                    <div className="w-px bg-slate-100 h-16 hidden md:block"></div>
                    <div>
                       <div className="text-slate-400 text-sm mb-1">غرف نوم</div>
                       <div className="text-2xl font-bold text-slate-800 flex items-center gap-2 justify-center">
                          <BedIcon className="w-6 h-6 text-emerald-500" />
                          {property.bedrooms}
                       </div>
                    </div>
                    <div className="w-px bg-slate-100 h-16 hidden md:block"></div>
                     <div>
                       <div className="text-slate-400 text-sm mb-1">حمامات</div>
                       <div className="text-2xl font-bold text-slate-800 flex items-center gap-2 justify-center">
                          <BathIcon className="w-6 h-6 text-emerald-500" />
                          {property.bathrooms}
                       </div>
                    </div>
                 </div>

                 {/* Description */}
                 <div className="bg-white rounded-3xl shadow-sm p-8 ring-1 ring-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">تفاصيل العقار</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                       {property.description || 'لا يوجد وصف متاح لهذا العقار حالياً.'}
                    </p>
                 </div>

                 {/* Features List (Placeholder for now based on category) */}
                 <div className="bg-white rounded-3xl shadow-sm p-8 ring-1 ring-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">المميزات</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {['موقع متميز', 'تشطيب فاخر', 'أمن وحراسة', 'جراج خاص', 'مصعد', 'حديقة'].map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-slate-600">
                             <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                             {feat}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Sidebar Contact */}
              <div className="space-y-6">
                 <div className="bg-white rounded-3xl shadow-xl p-6 ring-1 ring-emerald-100 sticky top-24">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
                          R
                       </div>
                       <div>
                          <div className="text-sm text-slate-500">تم النشر بواسطة</div>
                          <div className="font-bold text-lg text-slate-900">الرواد العقارية</div>
                          <div className="text-xs text-emerald-600 font-medium">وكيل معتمد</div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <a 
                          href={`tel:${property.mobile_number}`}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                        >
                          <PhoneIcon className="w-5 h-5" />
                          اتصل الآن
                       </a>
                       <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-bold text-lg hover:border-emerald-500 hover:text-emerald-600 transition">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.637 3.891 1.685 5.61l-1.082 3.945 4.887-1.254z"/></svg>
                          واتساب
                       </button>
                    </div>

                    {user && (
                       <div className="mt-8 pt-6 border-t border-slate-100">
                          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">أدوات المشرف</p>
                          <Link 
                             href={`/properties/${property.id}/edit`} 
                             className="block w-full text-center py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-medium"
                          >
                             تعديل هذا العقار
                          </Link>
                       </div>
                    )}
                 </div>
              </div>

           </div>
        </div>
      </main>

      {/* Footer - Consistent with Home */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="mb-4 text-emerald-500 font-bold text-xl">الرواد العقارية</p>
            <p className="text-sm text-slate-500">
              جميع الحقوق محفوظة &copy; 2026
            </p>
        </div>
      </footer>
    </div>
  )
}
