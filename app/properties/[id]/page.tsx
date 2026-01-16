'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Property {
  id: string
  title: string
  property_category: string
  property_type: string
  listing_type: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  city: string
  state: string
  country: string
  status: string
  reference_number: string
  street_address: string
  description: string
  custom_fields: string
  created_at: string
  updated_at: string
}

export default function PropertyDetailsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
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
    
    if (!user) {
      router.push('/')
    } else {
      setUser(user)
      await fetchProperty()
    }
    setLoading(false)
  }

  const fetchProperty = async () => {
    try {
      if (!propertyId) return;
      
      const response = await fetch(`/api/properties?id=${propertyId}`)
      if (!response.ok) throw new Error('Failed to fetch property')
      const data = await response.json()
      
      // Normalize data from custom_fields if standard fields are missing
      let customFields = {};
      try {
        if (typeof data.custom_fields === 'string') {
          customFields = JSON.parse(data.custom_fields);
        } else if (typeof data.custom_fields === 'object') {
          customFields = data.custom_fields || {};
        }
      } catch (e) {
        console.error('Error parsing custom_fields', e);
      }

      const anyP = data as any;
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
      };

      setProperty(normalizedProperty)
    } catch (error) {
      console.error('Error fetching property:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'commercial': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'residential': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'manufacturing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'sold': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'rented': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const parseCustomFields = (customFieldsStr: string) => {
    try {
      return JSON.parse(customFieldsStr || '{}')
    } catch {
      return {}
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Property not found</h2>
          <Link href="/properties" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  const customFields = parseCustomFields(property.custom_fields)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GetLeads</h1>
              <div className="flex space-x-2">
                <Link href="/dashboard" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Dashboard">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
                <Link href="/properties" className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" title="Properties">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </Link>
                <Link href="/contacts" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Contacts">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </Link>
                <Link href="/leads" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Leads">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </Link>
                <Link href="/organizations" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Organizations">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </Link>
                <Link href="/import" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" title="Import">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.email}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/properties" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
            ← Back to Properties
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {property.title || 'Untitled Property'}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.property_category && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getCategoryColor(property.property_category)}`}>
                      {property.property_category}
                    </span>
                  )}
                  {property.status && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  )}
                  {property.property_type && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                      {property.property_type}
                    </span>
                  )}
                  {property.listing_type && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                      {property.listing_type}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/properties/${property.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="h-4 w-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Section */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Price</h3>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {property.price ? `$${property.price.toLocaleString()}` : 'Not specified'}
                </p>
              </div>

              {/* Area Section */}
              {property.area && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Area</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {property.area} sq ft
                  </p>
                </div>
              )}

              {/* Bedrooms & Bathrooms */}
              {(property.bedrooms || property.bathrooms) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Rooms</h3>
                  <div className="flex gap-4">
                    {property.bedrooms && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{property.bedrooms}</p>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{property.bathrooms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reference Number */}
              {property.reference_number && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reference Number</h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {property.reference_number}
                  </p>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.street_address && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Street Address</p>
                    <p className="text-gray-900 dark:text-white">{property.street_address}</p>
                  </div>
                )}
                {property.city && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                    <p className="text-gray-900 dark:text-white">{property.city}</p>
                  </div>
                )}
                {property.state && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">State</p>
                    <p className="text-gray-900 dark:text-white">{property.state}</p>
                  </div>
                )}
                {property.country && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                    <p className="text-gray-900 dark:text-white">{property.country}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            {property.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Custom Fields */}
            {Object.keys(customFields).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(customFields).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="ms-2 text-gray-900 dark:text-white">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
                {property.updated_at && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                    <span className="ms-2 text-gray-900 dark:text-white">
                      {new Date(property.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
