'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead, LeadStatus, LeadPriority } from '@/types/lead'
import AdminHeader from '@/app/components/AdminHeader'

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    initPage()
  }, [params])

  useEffect(() => {
    if (!id) return
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      await fetchLead()
    }
    checkAuth()
  }, [router, id])

  const fetchLead = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads/${id}`)
      if (!response.ok) throw new Error('Failed to fetch lead')
      const data = await response.json()
      
      const leadData = data.lead
      
      // Normalize with custom_fields
      let customFields = {};
      try {
        if (typeof leadData.custom_fields === 'string') {
          customFields = JSON.parse(leadData.custom_fields);
        } else {
          customFields = leadData.custom_fields || {};
        }
      } catch (e) { console.error(e) }

      const anyCF = customFields as any;

      const normalizedLead = {
        ...leadData,
        first_name: leadData.first_name || anyCF.first_name || 'Unknown',
        last_name: leadData.last_name || anyCF.last_name || '',
        email: leadData.email || anyCF.email || '',
        phone: leadData.phone || anyCF.mobile || anyCF.phone || '',
        lead_status: leadData.lead_status || 'new',
        custom_fields: customFields
      };

      setLead(normalizedLead)
    } catch (error) {
      console.error('Error fetching lead:', error)
      // Only redirect on actual error, usually user might be on a valid ID but deleted
      if (error instanceof Error && error.message.includes('404')) {
          router.push('/leads')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('leads')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
        })
        .eq('id', id)

      if (error) throw error

      router.push('/leads')
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Failed to delete lead')
    }
  }

  const getStatusColor = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      proposal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getPriorityColor = (priority: LeadPriority) => {
    const colors: Record<LeadPriority, string> = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!lead) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <Link href="/leads" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 text-sm">
              ← Back to Leads
            </Link>
            <div className="mt-2 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lead.first_name} {lead.last_name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {lead.job_title && `${lead.job_title}${lead.company ? ' at ' : ''}`}
                  {lead.company && <span className="font-medium">{lead.company}</span>}
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/leads/${lead.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="mb-6 flex space-x-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(lead.lead_status)}`}>
              Status: {lead.lead_status}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(lead.lead_priority)}`}>
              Priority: {lead.lead_priority}
            </span>
            {lead.lead_type && (
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                Type: {lead.lead_type}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lead.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                          {lead.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {lead.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                          {lead.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {lead.mobile && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a href={`tel:${lead.mobile}`} className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                          {lead.mobile}
                        </a>
                      </dd>
                    </div>
                  )}
                  {lead.contact_preference && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{lead.contact_preference}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Property Information */}
              {(lead.property_category || lead.property_type) && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Property Information
                  </h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lead.property_category && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{lead.property_category}</dd>
                      </div>
                    )}
                    {lead.property_type && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{lead.property_type}</dd>
                      </div>
                    )}
                    {lead.property_location && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{lead.property_location}</dd>
                      </div>
                    )}
                    {lead.property_budget && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          ${lead.property_budget.toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {lead.property_size && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Size</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {lead.property_size} sq m
                        </dd>
                      </div>
                    )}
                    {lead.property_requirements && (
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Requirements</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">
                          {lead.property_requirements}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Description and Notes */}
              {(lead.description || lead.notes) && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Additional Details
                  </h2>
                  {lead.description && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{lead.description}</p>
                    </div>
                  )}
                  {lead.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{lead.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lead Details */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Lead Details
                </h2>
                <dl className="space-y-3">
                  {lead.lead_source && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{lead.lead_source}</dd>
                    </div>
                  )}
                  {lead.estimated_value && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Value</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        ${lead.estimated_value.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {lead.expected_close_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Close</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(lead.expected_close_date).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {lead.probability !== undefined && lead.probability !== null && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Probability</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{lead.probability}%</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(lead.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Address */}
              {(lead.street_address || lead.city || lead.state || lead.country) && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Address
                  </h2>
                  <address className="text-sm text-gray-900 dark:text-white not-italic">
                    {lead.street_address && <div>{lead.street_address}</div>}
                    <div>
                      {lead.city && <span>{lead.city}</span>}
                      {lead.state && <span>, {lead.state}</span>}
                      {lead.postal_code && <span> {lead.postal_code}</span>}
                    </div>
                    {lead.country && <div>{lead.country}</div>}
                  </address>
                </div>
              )}

              {/* Social Links */}
              {(lead.website || lead.linkedin_url || lead.facebook_url) && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Links
                  </h2>
                  <div className="space-y-2">
                    {lead.website && (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        Website →
                      </a>
                    )}
                    {lead.linkedin_url && (
                      <a
                        href={lead.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        LinkedIn →
                      </a>
                    )}
                    {lead.facebook_url && (
                      <a
                        href={lead.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        Facebook →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
