'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_category: 'residential',
    property_type: 'apartment',
    listing_type: 'sale',
    address: '',
    city: '',
    area: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    status: 'available',
    source: 'direct'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to add properties')
      }

      const { error: insertError } = await supabase
        .from('properties')
        .insert([{
          ...formData,
          area: formData.area ? parseFloat(formData.area) : null,
          price: formData.price ? parseFloat(formData.price) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          owner_id: user.id
        }])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/properties')
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Failed to add property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GetLeads</h1>
              <div className="flex space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Dashboard
                </Link>
                <Link href="/properties" className="text-indigo-600 dark:text-indigo-400 font-medium">
                  Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/properties" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              ← Back to Properties
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Add New Property
            </h2>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-800 dark:text-green-400">Property added successfully! Redirecting...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Luxury 3BR Apartment in Downtown"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Describe the property features and amenities..."
                    />
                  </div>

                  <div>
                    <label htmlFor="property_category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Property Category *
                    </label>
                    <select
                      name="property_category"
                      id="property_category"
                      required
                      value={formData.property_category}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="manufacturing">Manufacturing</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Property Type *
                    </label>
                    <select
                      name="property_type"
                      id="property_type"
                      required
                      value={formData.property_type}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="studio">Studio</option>
                      <option value="office">Office</option>
                      <option value="shop">Shop</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="land">Land</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="listing_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Listing Type *
                    </label>
                    <select
                      name="listing_type"
                      id="listing_type"
                      required
                      value={formData.listing_type}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status *
                    </label>
                    <select
                      name="status"
                      id="status"
                      required
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Dubai"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 500000"
                    />
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Area (sq m)
                    </label>
                    <input
                      type="number"
                      name="area"
                      id="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 150"
                    />
                  </div>

                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      id="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 3"
                    />
                  </div>

                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      id="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 2"
                    />
                  </div>

                  <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Source
                    </label>
                    <select
                      name="source"
                      id="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="direct">Direct</option>
                      <option value="agent">Agent</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/properties"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
