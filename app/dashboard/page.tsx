'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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
        router.push('/')
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
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const fetchStats = async () => {
    try {
      // Fetch properties data from API
      const response = await fetch('/api/properties')
      if (!response.ok) throw new Error('Failed to fetch properties')
      const items = await response.json()

      if (items) {
        // Calculate statistics based on properties
        
        // Helper to safely get property attributes
        const getAttr = (item: any, attr: string, ...customKeys: string[]): string => {
           let val = item[attr];
           // If value exists and isn't generic/placeholder, use it
           if (val && !['other', 'general', 'unknown', '--', 'undefined', 'null'].includes(String(val).toLowerCase())) {
              return String(val).toLowerCase();
           }
           
           let cf = item.custom_fields;
           if (typeof cf === 'string') {
             try { cf = JSON.parse(cf); } catch { cf = {}; }
           }
           if (!cf) cf = {};
           
           for (const k of customKeys) {
             if (cf[k]) return String(cf[k]).toLowerCase();
           }
           // Fallback to the generic value if no custom field found
           return val ? String(val).toLowerCase() : '';
        }

        const commercial = items.filter((i: any) => {
           const cat = getAttr(i, 'property_category', 'category', 'Unit Category');
           return cat.includes('commercial');
        }).length
        
        const residential = items.filter((i: any) => {
           const cat = getAttr(i, 'property_category', 'category', 'Unit Category');
           return cat.includes('residential');
        }).length
        
        const manufacturing = items.filter((i: any) => {
           const cat = getAttr(i, 'property_category', 'category', 'Unit Category');
           return cat.includes('manufacturing');
        }).length
        
        const apartments = items.filter((i: any) => {
           const type = getAttr(i, 'property_type', 'type', 'Unit Type');
           return type.includes('apartment') || type.includes('flat') || type.includes('studio');
        }).length
        
        const villas = items.filter((i: any) => {
           const type = getAttr(i, 'property_type', 'type', 'Unit Type');
           return type.includes('villa') || type.includes('house') || type.includes('stand alone') || type.includes('town') || type.includes('twin') || type.includes('palace');
        }).length

        // Group by status
        const bySource: { [key: string]: number } = {}
        items.forEach((item: any) => {
          const status = getAttr(item, 'status', 'Status') || 'unknown';
          bySource[status] = (bySource[status] || 0) + 1
        })

        // Group by type
        const byType: { [key: string]: number } = {}
        items.forEach((item: any) => {
          const type = getAttr(item, 'property_type', 'type', 'Unit Type') || 'unknown';
          // Capitalize for display
          const displayType = type.charAt(0).toUpperCase() + type.slice(1);
          byType[displayType] = (byType[displayType] || 0) + 1
        })

        setStats({
          totalLeads: items.length, // Displaying total properties count
          commercial,
          residential,
          manufacturing,
          apartments,
          villas,
          leadsBySource: bySource,
          leadsByType: byType
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GetLeads</h1>
              <div className="flex space-x-2">
                <a href="/dashboard" className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" title="Dashboard">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </a>
                <a href="/properties" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Properties">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </a>
                <a href="/contacts" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Contacts">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </a>
                <a href="/leads" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Leads">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </a>
                <a href="/organizations" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Organizations">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </a>
                <a href="/import" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Bulk Import">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.email?.split('@')[0]}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here's an overview of your real estate leads
            </p>
          </div>

          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Leads
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalLeads}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Commercial
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.commercial}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Residential
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.residential}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Manufacturing
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.manufacturing}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Property Types & Lead Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Property Types */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Property Types
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Apartments</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 me-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stats.totalLeads > 0 ? (stats.apartments / stats.totalLeads) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-end">
                      {stats.apartments}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Villas</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 me-3">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${stats.totalLeads > 0 ? (stats.villas / stats.totalLeads) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-end">
                      {stats.villas}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Sources */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Lead Sources
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.leadsBySource).length > 0 ? (
                  Object.entries(stats.leadsBySource).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{source}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 me-3">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-end">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No lead sources yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Lead Types */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Lead Types Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.leadsByType).length > 0 ? (
                Object.entries(stats.leadsByType).map(([type, count]) => (
                  <div key={type} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">
                      {type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No leads data available yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Start adding leads to see statistics
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
