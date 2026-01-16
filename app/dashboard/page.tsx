'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import AdminHeader from '@/app/components/AdminHeader'

export const dynamic = 'force-dynamic'

// --- Icons ---
const HomeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
)
const BuildingIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
)
const UploadIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
)
const LogoutIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
)

interface Stats {
  totalLeads: number
  commercial: number
  residential: number
  manufacturing: number
  apartments: number
  villas: number
  leadsBySource: { [key: string]: number }
  leadsByType: { [key: string]: number }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    commercial: 0,
    residential: 0,
    manufacturing: 0,
    apartments: 0,
    villas: 0,
    leadsBySource: {},
    leadsByType: {}
  })
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        await fetchStats()
      }
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()

      setStats({
          totalLeads: data.total || 0,
          commercial: data.commercial || 0,
          residential: (data.aparments + data.villas) || 0,
          manufacturing: 0,
          apartments: data.aparments || 0,
          villas: data.villas || 0,
          leadsBySource: { 'Total': data.total || 0 },
          leadsByType: {
            'Apartments': data.aparments || 0,
            'Villas': data.villas || 0,
            'Commercial': data.commercial || 0,
            'Admin': data.admin || 0 
          }
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
      <AdminHeader user={user} title="لوحة التحكم" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">مرحباً بك مجدداً 👋</h2>
            <p className="text-slate-500 mt-2">إليك ملخص سريع لأداء العقارات والبيانات المسجلة.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/properties/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
                <span>+ إضافة عقار</span>
             </Link>
             <Link href="/import" className="bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 px-5 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2">
                <UploadIcon className="w-5 h-5" />
                <span>رفع ملفات</span>
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           {/* Total Card */}
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <BuildingIcon className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">الكل</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">إجمالي العقارات</h3>
              <p className="text-3xl font-bold text-slate-900">{stats.totalLeads.toLocaleString()}</p>
           </div>

           {/* Residential Card */}
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <HomeIcon className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">سكني</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">شقق وفيلات</h3>
              <p className="text-3xl font-bold text-slate-900">{stats.residential.toLocaleString()}</p>
           </div>

           {/* Commercial Card */}
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                 </div>
                 <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">تجاري</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">محلات ومكاتب</h3>
              <p className="text-3xl font-bold text-slate-900">{stats.commercial.toLocaleString()}</p>
           </div>

           {/* Admin Card */}
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                 </div>
                 <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">إداري</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">مكاتب إدارية</h3>
              <p className="text-3xl font-bold text-slate-900">{(stats.leadsByType['Admin'] || 0).toLocaleString()}</p>
           </div>
        </div>

        {/* Detailed Stats */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Property Types Detail */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                 توزيع الوحدات
              </h3>
              <div className="space-y-6">
                 {Object.entries(stats.leadsByType).map(([key, value]) => (
                    <div key={key}>
                       <div className="flex justify-between items-end mb-2">
                          <span className="font-medium text-slate-700">{key === 'Apartments' ? 'شقق' : key === 'Villas' ? 'فيلل' : key === 'Commercial' ? 'تجاري' : key === 'Admin' ? 'إداري': key}</span>
                          <span className="font-bold text-slate-900">{value}</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                             className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" 
                             style={{ width: `${stats.totalLeads > 0 ? (value / stats.totalLeads) * 100 : 0}%` }}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>

            {/* Quick Tips or Empty State */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                   <h3 className="text-2xl font-bold mb-4">نصيحة إدارية 💡</h3>
                   <p className="text-slate-300 leading-relaxed text-lg mb-8">
                      تأكد من تحديث حالة العقارات بشكل دوري. العقارات ذات البيانات المكتملة (صور، موقع دقيق، سعر) تحصل على فرص بيع أعلى بنسبة 40%.
                   </p>
                   <Link href="/properties" className="inline-block bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                      إدارة العقارات
                   </Link>
                </div>
            </div>
         </div>

      </main>
    </div>
  )
}
