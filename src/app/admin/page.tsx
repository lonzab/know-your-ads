'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ad, AdStatus } from '@/types'

interface AdFormData {
  title: string
  advertiserName: string
  destinationUrl: string
  categoryTags: string
  status: AdStatus
  creativeVideoUrl: string
  creativePosterUrl: string
  creativeDurationSeconds: string
}

const initialFormData: AdFormData = {
  title: '',
  advertiserName: '',
  destinationUrl: '',
  categoryTags: '',
  status: 'draft',
  creativeVideoUrl: '',
  creativePosterUrl: '',
  creativeDurationSeconds: '15',
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AdFormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const getAuthHeader = useCallback(() => {
    return {
      Authorization: `Bearer ${password}`,
      'Content-Type': 'application/json',
    }
  }, [password])

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ads', {
        headers: getAuthHeader(),
      })
      if (res.ok) {
        const data = await res.json()
        setAds(data.ads)
      } else if (res.status === 401) {
        setIsAuthenticated(false)
        setAuthError('Session expired. Please log in again.')
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    }
    setLoading(false)
  }, [getAuthHeader])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAds()
    }
  }, [isAuthenticated, fetchAds])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    try {
      const res = await fetch('/api/ads', {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      })

      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        setAuthError('Invalid password')
      }
    } catch {
      setAuthError('Connection error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      title: formData.title,
      advertiserName: formData.advertiserName,
      destinationUrl: formData.destinationUrl,
      categoryTags: formData.categoryTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      status: formData.status,
      creativeVideoUrl: formData.creativeVideoUrl,
      creativePosterUrl: formData.creativePosterUrl || null,
      creativeDurationSeconds: formData.creativeDurationSeconds
        ? parseInt(formData.creativeDurationSeconds)
        : null,
    }

    try {
      const url = editingId ? `/api/ads/${editingId}` : '/api/ads'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setFormData(initialFormData)
        setEditingId(null)
        setShowForm(false)
        fetchAds()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save ad')
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      alert('Failed to save ad')
    }
  }

  const handleEdit = (ad: Ad) => {
    setFormData({
      title: ad.title,
      advertiserName: ad.advertiserName,
      destinationUrl: ad.destinationUrl,
      categoryTags: ad.categoryTags.join(', '),
      status: ad.status,
      creativeVideoUrl: ad.creativeVideoUrl,
      creativePosterUrl: ad.creativePosterUrl || '',
      creativeDurationSeconds: ad.creativeDurationSeconds?.toString() || '15',
    })
    setEditingId(ad.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return

    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      })

      if (res.ok) {
        fetchAds()
      } else {
        alert('Failed to delete ad')
      }
    } catch {
      alert('Failed to delete ad')
    }
  }

  const handleStatusChange = async (id: string, status: AdStatus) => {
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        fetchAds()
      }
    } catch {
      alert('Failed to update status')
    }
  }

  const getStatusColor = (status: AdStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-600'
      case 'draft':
        return 'bg-gray-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'rejected':
        return 'bg-red-600'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">KnowYourAds Admin</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormData(initialFormData)
                setEditingId(null)
                setShowForm(true)
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              + New Ad
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false)
                setPassword('')
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {showForm && (
          <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Ad' : 'Create New Ad'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Advertiser Name *</label>
                  <input
                    type="text"
                    value={formData.advertiserName}
                    onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Destination URL *</label>
                  <input
                    type="url"
                    value={formData.destinationUrl}
                    onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category Tags</label>
                  <input
                    type="text"
                    value={formData.categoryTags}
                    onChange={(e) => setFormData({ ...formData, categoryTags: e.target.value })}
                    placeholder="fashion, summer, clothing"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Video URL *</label>
                  <input
                    type="url"
                    value={formData.creativeVideoUrl}
                    onChange={(e) => setFormData({ ...formData, creativeVideoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                  <input
                    type="url"
                    value={formData.creativePosterUrl}
                    onChange={(e) => setFormData({ ...formData, creativePosterUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={formData.creativeDurationSeconds}
                    onChange={(e) =>
                      setFormData({ ...formData, creativeDurationSeconds: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as AdStatus })
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData(initialFormData)
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-semibold">
              All Ads ({ads.length})
              {loading && <span className="text-gray-400 ml-2">Loading...</span>}
            </h2>
          </div>
          <div className="divide-y divide-gray-700">
            {ads.map((ad) => (
              <div key={ad.id} className="p-4 hover:bg-gray-750">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{ad.title}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(ad.status)}`}
                      >
                        {ad.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{ad.advertiserName}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ad.categoryTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-700 rounded-full text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <select
                      value={ad.status}
                      onChange={(e) => handleStatusChange(ad.id, e.target.value as AdStatus)}
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => handleEdit(ad)}
                      className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {ads.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-400">
                No ads yet. Click &quot;New Ad&quot; to create one.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
