'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// --- Icons ---
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
import { FacebookIcon } from '@/app/components/FacebookIcon'

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
const ArrowIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, aparments: 0, villas: 0, commercial: 0, admin: 0 })
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchLatestProperties()
    checkUser()

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchLatestProperties = async () => {
      try {
        const response = await fetch('/api/properties?limit=6')
        if (response.ok) {
           const result = await response.json()
           const rawData = result.data || result
           
           const processed = (Array.isArray(rawData) ? rawData : []).map((p: any) => {
               let cf = {};
               try {
                  if (typeof p.custom_fields === 'string') cf = JSON.parse(p.custom_fields);
                  else cf = p.custom_fields || {};
               } catch { cf = {}; }
               const acf = cf as any;
               
               return {
                  ...p,
                  title: acf.property_name_compound_name || p.title,
                  price: Number(p.price || acf.total_price || acf.price || 0),
                  city: p.city || acf.area || acf.location || '',
                  status: p.status || acf.unit_for || 'Available',
                  property_type: p.property_type || acf.type || 'Property',
                  property_category: p.property_category || acf.category || 'General',
                  bedrooms: p.bedrooms || acf.rooms || acf.bedrooms || 0,
                  bathrooms: p.bathrooms || acf.bathrooms || 0,
                  area: p.area || acf.space || acf.area || 0,
                  mobile_number: '01002778090',
               };
           });
           setProperties(processed)
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900" dir="rtl">
      
      {/* Header */}
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg border border-emerald-600">
                R
              </div>
              <span className="text-2xl font-bold tracking-tight text-white transition-colors">
                الرواد العقارية
              </span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-10 items-center">
              <Link href="/" className="text-sm font-medium transition-colors text-white/90 hover:text-emerald-400">الرئيسية</Link>
              <Link href="/all-properties?type=sale" className="text-sm font-medium transition-colors text-white/90 hover:text-emerald-400">بيع</Link>
              <Link href="/all-properties?type=rent" className="text-sm font-medium transition-colors text-white/90 hover:text-emerald-400">إيجار</Link>
              
              <div className="w-px h-4 bg-slate-600/50 mx-2"></div> {/* Separator */}

              <Link href="/about" className="text-sm font-medium transition-colors text-white/90 hover:text-emerald-400">من نحن</Link>
              <Link href="/contact" className="text-sm font-medium transition-colors text-white/90 hover:text-emerald-400">اتصل بنا</Link>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
               {/* Facebook Icon */}
               <a 
                 href="https://www.facebook.com/elrowadrealestates" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-[#1877F2] text-white transition-all duration-300"
                 aria-label="Facebook"
               >
                  <FacebookIcon className="w-4 h-4" />
               </a>

               {/* Phone Number */}
               <div className="flex items-center gap-2 ltr:flex-row-reverse text-emerald-100">
                  <span dir="ltr" className="font-bold text-sm">0100 277 8090</span>
                  <PhoneIcon className="w-4 h-4" />
               </div>

               {/* Login Button - Only show if user is logged in */}
               {user && (
                   <Link
                     href="/dashboard"
                     className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200"
                   >
                     <UserIcon className="w-5 h-5" />
                     <span>لوحة التحكم</span>
                   </Link>
               )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center text-white">
               <button 
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                 className="p-2 rounded-md text-white"
               >
                 {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-xl p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            <Link href="/" className="px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200 font-medium">الرئيسية</Link>
            <Link href="/all-properties?type=sale" className="px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200 font-medium">بيع</Link>
            <Link href="/all-properties?type=rent" className="px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200 font-medium">إيجار</Link>
            <Link href="/about" className="px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200 font-medium">من نحن</Link>
            <Link href="/contact" className="px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200 font-medium">اتصل بنا</Link>
            
            <a 
              href="https://www.facebook.com/elrowadrealestates" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-200 font-medium"
            >
               <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
               <span>تابعنا على فيسبوك</span>
            </a>

            <hr className="border-slate-800" />
            {user && (
              <Link 
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold"
              >
                <UserIcon className="w-5 h-5" />
                لوحة التحكم
              </Link>
            )}
          </div>
        )}
      </header>

   {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
         {/* Background with Gradient Overlay */}
         <div className="absolute inset-0 bg-slate-900 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-900/90 z-10"></div>
             {/* Realistic Background Image - Using a high quality real estate image */}
             <div 
               className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-22b5c12752f9?q=80&w=2666&auto=format&fit=crop')" }}
             ></div>
         </div>

         <div className="relative z-20 w-full max-w-5xl px-4 flex flex-col items-center text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 backdrop-blur-md mb-8 ring-1 ring-emerald-500/20">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse box-shadow-emerald"></span>
               <span className="text-sm font-medium tracking-wide">وجهتك العقارية الأولى في مصر</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
               اكتشف رقي المعيشة <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-500">
                 بأعلى معايير الفخامة
               </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
               نقدم لك نخبة من أرقى العقارات السكنية والتجارية، مصممة لتواكب تطلعاتك نحو حياة الرفاهية والاستثمار الآمن.
            </p>

            {/* Search Box */}
            <div className="w-full max-w-3xl bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 transition-all hover:bg-white hover:shadow-emerald-900/20">
               <div className="flex-1 flex items-center px-4 h-14 bg-slate-50 rounded-xl sm:bg-transparent">
                  <SearchIcon className="w-6 h-6 text-slate-400 ml-3" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن المدينة، المنطقة، أو الكمبوند..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 h-full font-medium text-lg"
                  />
               </div>
               <button className="h-14 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all transform active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                  <span>بحث</span>
               </button>
            </div>
            
            {/* Stats */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 text-white/80">
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">{loading ? '...' : stats.total}</span>
                  <span className="text-sm">عقار متاح</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">
                      {loading ? '...' : stats.aparments}
                  </span>
                  <span className="text-sm">شقة</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">
                      {loading ? '...' : stats.villas}
                  </span>
                  <span className="text-sm">فيلا</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">
                      {loading ? '...' : stats.commercial}
                  </span>
                  <span className="text-sm">تجاري</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">
                       {loading ? '...' : stats.admin}
                  </span>
                  <span className="text-sm">إداري</span>
               </div>
            </div>
         </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 relative inline-block">
               أحدث العقارات
               <span className="absolute bottom-1 right-0 w-full h-3 bg-emerald-100 -z-10 rounded-sm transform -rotate-1"></span>
            </h2>
            <p className="text-slate-500 text-lg">تصفح أحدث الفرص المميزة المضافة حديثاً</p>
          </div>
          <Link href="/all-properties" className="text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1 group">
             عرض كل العقارات
             <ArrowIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div 
                key={property.id} 
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-emerald-100"
              >
                {/* Image Section */}
                <div className="relative h-64 bg-slate-200 overflow-hidden">
                   {/* Placeholder Pattern */}
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
                      <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                   </div>
                   
                   {/* Gradient Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80"></div>

                   {/* Badges */}
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
            ))}
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 relative overflow-hidden">
        {/* Decorative Light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              {/* Brand Col */}
              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-white">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-emerald-900/50">R</div>
                    <span className="text-xl font-bold tracking-tight">الرواد العقارية</span>
                 </div>
                 <p className="text-sm leading-relaxed text-slate-400">
                    نحن نعيد تعريف تجربة العقارات في مصر من خلال تقديم خدمات استشارية متكاملة وحلول عقارية مبتكرة تلبي طموحاتك.
                 </p>
                 <div className="flex gap-4">
                    {/* Social Placeholders */}
                    {[1, 2, 3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Links Col 1 */}
              <div>
                 <h4 className="text-white font-bold mb-6 text-lg">الشركة</h4>
                 <ul className="space-y-4 text-sm">
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>عن الشركة</Link></li>
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>فريق العمل</Link></li>
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>الوظائف</Link></li>
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>الأخبار</Link></li>
                 </ul>
              </div>

              {/* Links Col 2 */}
              <div>
                 <h4 className="text-white font-bold mb-6 text-lg">العقارات</h4>
                 <ul className="space-y-4 text-sm">
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>شقق للبيع</Link></li>
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>فيلات للبيع</Link></li>
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>عقارات تجارية</Link></li>
                    <li><Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>أحدث العروض</Link></li>
                 </ul>
              </div>

              {/* Contact Col */}
              <div>
                 <h4 className="text-white font-bold mb-6 text-lg">تواصل معنا</h4>
                 <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3 text-slate-300">
                       <LocationIcon className="w-5 h-5 text-emerald-500 mt-1" />
                       <span className="leading-relaxed">شارع التسعين، التجمع الخامس<br />القاهرة الجديدة، مصر</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                       <PhoneIcon className="w-5 h-5 text-emerald-500" />
                       <span dir="ltr" className="hover:text-emerald-400 transition-colors font-medium">+20 100 277 8090</span>
                    </div>
                    <div className="pt-6">
                       <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-900/20 active:scale-95">
                          اطلب استشارة مجانية
                       </button>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <p>&copy; 2026 الرواد العقارية. جميع الحقوق محفوظة.</p>
              <div className="flex gap-6">
                 <Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                 <Link href="#" className="hover:text-white transition-colors">شروط الاستخدام</Link>
              </div>
           </div>
        </div>
      </footer>
    </div>
  )
}
