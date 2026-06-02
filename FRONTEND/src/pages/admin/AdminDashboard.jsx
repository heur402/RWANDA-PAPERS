import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Download, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { getDashboardStats } from '../../api/admin.js'
import Spinner from '../../components/common/Spinner.jsx'

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString() ?? '–'}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of Rwanda Papers platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Documents"  value={stats.totalDocuments}  icon={FileText}     color="text-primary-600"  bg="bg-primary-50"  />
        <StatCard title="Total Downloads"  value={stats.totalDownloads}  icon={Download}     color="text-green-600"   bg="bg-green-50"   />
        <StatCard title="Pending Review"   value={stats.pendingUploads}  icon={Clock}        color="text-yellow-600"  bg="bg-yellow-50"  />
        <StatCard title="Approved"         value={stats.approvedUploads} icon={CheckCircle}  color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Downloaded */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Most Downloaded
            </div>
            <Link to="/admin/documents" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!stats.mostDownloaded?.length ? (
              <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
            ) : (
              stats.mostDownloaded.map((doc, idx) => (
                <div key={doc._id} className="flex items-center gap-3 px-6 py-3">
                  <span className="text-lg font-bold text-gray-300 w-6">#{idx + 1}</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500">{doc.category?.name}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                    <Download className="w-3 h-3" /> {doc.downloads?.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="card">
          <div className="flex items-center gap-2 font-semibold text-gray-900 px-6 py-4 border-b border-gray-100">
            <Clock className="w-5 h-5 text-primary-600" />
            Recent Downloads
          </div>
          <div className="divide-y divide-gray-50">
            {!stats.recentDownloads?.length ? (
              <p className="text-gray-400 text-sm text-center py-6">No downloads yet</p>
            ) : (
              stats.recentDownloads.slice(0, 8).map((dl) => (
                <div key={dl._id} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {dl.documentId?.title || 'Unknown document'}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(dl.downloadedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {stats.pendingUploads > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-yellow-900">
                {stats.pendingUploads} document{stats.pendingUploads !== 1 ? 's' : ''} pending review
              </p>
              <p className="text-sm text-yellow-700">Review and approve or reject submissions</p>
            </div>
          </div>
          <Link
            to="/admin/documents?status=pending"
            className="btn-primary flex-shrink-0 !bg-yellow-600 hover:!bg-yellow-700"
          >
            Review Now
          </Link>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
