'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchProperties()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchProperties = async () => {
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
          // MASKED DATA FOR PUBLIC
          owner_name: 'الرواد العقارية',
          mobile_number: '01002778090',
          original_owner: String(anyCF.name || anyCF.owner_name || ''), // For admin if needed
        };
      });

      setProperties(processedData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                الرواد العقارية
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8 space-x-reverse items-center">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">الرئيسية</button>
              <button className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">بيع</button>
              <button className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">إيجار</button>
              <button className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">من نحن</button>
              <button className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">اتصل بنا</button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-indigo-600 hidden sm:block" dir="ltr">0100 277 8090</span>
              <Link 
                href={user ? "/dashboard" : "/login"} 
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                title={user ? "لوحة التحكم" : "تسجيل دخول"}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-indigo-700 relative overflow-hidden h-[400px] flex items-center justify-center text-center px-4">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            ابحث عن منزلك المثالي مع الرواد
          </h1>
          <p className="text-xl text-indigo-100 mb-8">
            أفضل العقارات في أرقى المناطق بأسعار تنافسية
          </p>
          <div className="bg-white p-2 rounded-full shadow-lg max-w-md mx-auto flex">
            <input 
              type="text" 
              placeholder="ابحث عن منطقة، نوع عقار..." 
              className="flex-1 px-6 py-3 rounded-full focus:outline-none text-gray-800"
            />
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 font-bold transition">
              بحث
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            أحدث العقارات المضافة
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            تصفح قائمتنا المختارة من أفضل الفرص المتاحة حالياً
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                {/* Image Placeholder */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative group">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute top-4 start-4">
                     <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                       {property.status}
                     </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                       {property.property_type}
                     </div>
                     <div className="text-sm text-gray-500">
                       {new Date(property.created_at).toLocaleDateString()}
                     </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {property.title || 'عقار بدون عنوان'}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    <svg className="h-4 w-4 me-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{property.city}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm text-gray-500 border-t border-b border-gray-100 dark:border-gray-700 py-3">
                     <div>
                       <span className="block font-bold text-gray-900 dark:text-white">{property.bedrooms}</span>
                       <span>غرف</span>
                     </div>
                     <div>
                       <span className="block font-bold text-gray-900 dark:text-white">{property.bathrooms}</span>
                       <span>حمام</span>
                     </div>
                     <div>
                       <span className="block font-bold text-gray-900 dark:text-white">{property.area}</span>
                       <span>م²</span>
                     </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-gray-500 text-xs">السعر</span>
                        <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                          {property.price ? Number(property.price).toLocaleString() : 'اتصل للسعر'} 
                          {property.price ? ' ج.م' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                       <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                             ال
                          </div>
                          <div className="ms-3">
                             <p className="text-xs text-gray-500">للتواصل المباشر</p>
                             <p className="font-bold text-sm text-gray-900 dark:text-white">{property.owner_name}</p>
                          </div>
                       </div>
                       <a href={`tel:${property.mobile_number}`} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                       </a>
                    </div>
                    
                    <Link 
                      href={user ? `/properties/${property.id}` : `/properties/${property.id}`} 
                      className="mt-4 w-full block text-center bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
               <h3 className="text-white text-xl font-bold mb-4">الرواد العقارية</h3>
               <p className="text-sm">نوفر لك أفضل الخيارات العقارية في السوق المصري بأعلى معايير المصداقية والاحترافية.</p>
            </div>
            <div>
               <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">الرئيسية</a></li>
                  <li><a href="#" className="hover:text-white">عقارات للبيع</a></li>
                  <li><a href="#" className="hover:text-white">عقارات للإيجار</a></li>
                  <li><a href="#" className="hover:text-white">من نحن</a></li>
               </ul>
            </div>
            <div>
               <h3 className="text-white font-bold mb-4">تواصل معنا</h3>
               <p className="flex items-center mb-2">
                  <svg className="h-5 w-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  0100 277 8090
               </p>
            </div>
         </div>
         <div className="text-center mt-12 pt-8 border-t border-gray-800 text-sm">
            © 2026 الرواد العقارية. جميع الحقوق محفوظة.
         </div>
      </footer>
    </div>
  )
}
