'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Property {
  id: string
  title: string
  property_category: string
  property_type: string
  price: number
  city: string
  status: string
  created_at: string
  description?: string
  owner_name?: string
  mobile_number?: string
}

export default function PropertiesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [areaFilter, setAreaFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(30)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [deduplicating, setDeduplicating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/')
    } else {
      setUser(user)
      await fetchProperties()
    }
    setLoading(false)
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties?limit=50');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      
      // Handle new pagination structure
      const data = result.data || result;
      
      // Process properties to handle custom_fields
      const processedData = (Array.isArray(data) ? data : []).map((p: any) => {
        let customFields = {};
        try {
          if (typeof p.custom_fields === 'string') {
            customFields = JSON.parse(p.custom_fields);
          } else if (typeof p.custom_fields === 'object') {
            customFields = p.custom_fields || {};
          }
        } catch (e) {
          console.error('Error parsing custom_fields', e);
        }

        const anyP = p as any;
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
          owner_name: String(anyCF.name || anyCF.owner_name || anyCF.property_offered_by || ''),
          mobile_number: String(anyCF.mobile_no || anyCF.egar_contact_no || anyCF.mobile || ''),
        };
      });

      setProperties(processedData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  }

  const handleDeduplicate = async () => {
    if (!confirm('Are you sure you want to scan and remove duplicate properties? This action cannot be undone.')) {
      return
    }

    setDeduplicating(true)
    try {
      const response = await fetch('/api/properties/deduplicate', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (response.ok) {
        alert(data.message)
        fetchProperties() // Refresh list
      } else {
        throw new Error(data.error || 'Failed to remove duplicates')
      }
    } catch (error) {
      console.error('Error removing duplicates:', error)
      alert('Failed to remove duplicates. Check console for details.')
    } finally {
      setDeduplicating(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Get unique values for filters
  const uniqueStatuses = ['All', ...Array.from(new Set(properties.map(p => p.status))).filter(Boolean).sort()]
  const uniqueTypes = ['All', ...Array.from(new Set(properties.map(p => p.property_type))).filter(Boolean).sort()]
  const uniqueAreas = ['All', ...Array.from(new Set(properties.map(p => p.city))).filter(Boolean).sort()]

  const filteredProperties = properties.filter(property => {
    const searchLower = searchTerm.toLowerCase()
    
    const matchesSearch = 
      String(property.title || '').toLowerCase().includes(searchLower) ||
      String(property.city || '').toLowerCase().includes(searchLower) ||
      String(property.property_category || '').toLowerCase().includes(searchLower) ||
      String(property.property_type || '').toLowerCase().includes(searchLower) ||
      String(property.status || '').toLowerCase().includes(searchLower) ||
      String(property.description || '').toLowerCase().includes(searchLower) ||
      String(property.owner_name || '').toLowerCase().includes(searchLower) ||
      String(property.mobile_number || '').toLowerCase().includes(searchLower) ||
      String(property.price || '').toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'All' || property.status === statusFilter
    const matchesType = typeFilter === 'All' || property.property_type === typeFilter
    const matchesArea = areaFilter === 'All' || property.city === areaFilter

    return matchesSearch && matchesStatus && matchesType && matchesArea
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'residential': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'manufacturing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'sold': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'rented': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setTypeFilter('All')
    setAreaFilter('All')
    setCurrentPage(1)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProperties = filteredProperties.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner border border-emerald-600">R</div>
               <div>
                  <h1 className="font-bold text-xl leading-none">إدارة العقارات</h1>
                  <span className="text-xs text-slate-400">الرواد العقارية</span>
               </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-1 bg-slate-800/50 p-1 rounded-xl">
               <Link href="/dashboard" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg font-medium text-sm transition-all">الرئيسية</Link>
               <Link href="/properties" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm shadow-sm transition-all">العقارات</Link>
               <Link href="/import" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg font-medium text-sm transition-all">استيراد بيانات</Link>
               <Link href="/" className="px-4 py-2 text-emerald-400 hover:bg-emerald-900/30 rounded-lg font-medium text-sm transition-all flex items-center gap-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                   الموقع العام
               </Link>
            </nav>
            {/* Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                 <span className="text-sm font-bold text-slate-200">{user?.email?.split('@')[0]}</span>
                 <span className="text-xs text-slate-400">مدير النظام</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all text-sm font-bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">العقارات</h2>
              <p className="text-slate-500 mt-1">
                إجمالي {properties.length} عقار
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="بحث في العقارات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm text-sm"
                  />
                  <svg className="absolute right-3 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Link
                  href="/properties/new"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  إضافة عقار
                </Link>
                <button
                  onClick={handleDeduplicate}
                  disabled={deduplicating}
                  className={`inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium text-sm transition-all shadow-sm ${
                    deduplicating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Remove duplicate properties"
                >
                  {deduplicating ? (
                    'جاري المعالجة...'
                  ) : (
                    <>
                      <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      فحص التكرار
                    </>
                  )}
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-600 shadow-sm appearance-none"
                    aria-label="تصفية حسب الحالة"
                  >
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'All' ? 'كل الحالات' : status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-600 shadow-sm appearance-none"
                    aria-label="تصفية حسب المنطقة"
                  >
                    {uniqueAreas.map(area => (
                      <option key={area} value={area}>
                        {area === 'All' ? 'كل المناطق' : area}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-600 shadow-sm appearance-none"
                    aria-label="تصفية حسب النوع"
                  >
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'All' ? 'كل الأنواع' : type}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-all shadow-sm flex items-center justify-center"
                  title="إعادة التعيين"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-slate-900">
                {searchTerm ? 'لم يتم العثور على عقارات' : 'لا توجد عقارات'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? 'جرب تغيير كلمات البحث' : 'ابدأ بإضافة عقار جديد للنظام'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    href="/properties/new"
                    className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
                  >
                    <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة أول عقار
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  عرض <span className="font-medium text-slate-900">{startIndex + 1}</span> إلى <span className="font-medium text-slate-900">{Math.min(endIndex, filteredProperties.length)}</span> من أصل <span className="font-medium text-slate-900">{filteredProperties.length}</span> نتيجة
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">العرض:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="text-sm border-slate-200 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-1 bg-white text-slate-700"
                  >
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={99}>99</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4 min-h-[3rem]">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {property.title}
                        </h3>
                      </div>
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center text-sm text-slate-500">
                          <svg className="h-4 w-4 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {property.city}
                        </div>
                        <div className="flex items-center text-lg font-bold text-emerald-600">
                          <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {property.price?.toLocaleString()} ريال
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getCategoryColor(property.property_category)}`}>
                          {property.property_category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                          {property.property_type}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                         <span className="text-xs text-slate-400 font-mono">#{property.id}</span>
                        <Link href={`/properties/${property.id}`} className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                          عرض التفاصيل
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-6">
                  {/* Mobile Pagination */}
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      السابق
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      التالي
                    </button>
                  </div>
                  
                  {/* Desktop Pagination */}
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                         صفحة <span className="font-bold text-slate-900">{currentPage}</span> من <span className="font-bold text-slate-900">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md bg-white shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0 ${
                            currentPage === 1
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="sr-only">السابق</span>
                          <svg className="h-5 w-5 rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              aria-current={currentPage === pageNum ? 'page' : undefined}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                currentPage === pageNum
                                  ? 'z-10 bg-emerald-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
                                  : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0 ${
                            currentPage === totalPages
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="sr-only">التالي</span>
                          <svg className="h-5 w-5 rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 end-8 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
          title="Scroll to top"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  )
}
