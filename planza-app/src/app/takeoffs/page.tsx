'use client'

import { useState, useEffect } from 'react'
import { 
  Search,
  Home,
  FileText,
  Plus,
  User,
  Settings,
  MoreHorizontal,
  Star,
  Filter,
  Grid3X3,
  List,
  Calendar
} from 'lucide-react'

// Sample takeoff data for when no saved takeoffs exist
const SAMPLE_TAKEOFFS = [
  {
    id: 1,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    borderColor: "border-blue-300",
    starred: false,
    collaborators: []
  },
  {
    id: 2,
    name: "Ridgeway High School — Classroom Block A", 
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-purple-100 to-purple-200",
    borderColor: "border-purple-300",
    starred: false,
    collaborators: []
  },
  {
    id: 3,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago", 
    color: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    borderColor: "border-yellow-300",
    starred: false,
    collaborators: []
  },
  {
    id: 4,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    borderColor: "border-blue-300", 
    starred: false,
    collaborators: [
      { id: 1, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format" },
      { id: 2, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b3?w=32&h=32&fit=crop&crop=face&auto=format" },
      { id: 3, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format" }
    ]
  },
  {
    id: 5,
    name: "Meadow Park Villas — Foundation Takeoff",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-slate-100 to-slate-200", 
    borderColor: "border-slate-300",
    starred: false,
    collaborators: [
      { id: 1, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format" },
      { id: 2, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b3?w=32&h=32&fit=crop&crop=face&auto=format" }
    ]
  },
  {
    id: 6,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    borderColor: "border-blue-300",
    starred: false,
    collaborators: []
  },
  {
    id: 7,
    name: "Ridgeway High School — Classroom Block A", 
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-cyan-100 to-cyan-200",
    borderColor: "border-cyan-300",
    starred: false,
    collaborators: []
  },
  {
    id: 8,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-purple-100 to-purple-200", 
    borderColor: "border-purple-300",
    starred: false,
    collaborators: []
  },
  {
    id: 9,
    name: "Meadow Park Villas — Foundation Takeoff", 
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    borderColor: "border-blue-300",
    starred: false,
    collaborators: [
      { id: 1, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format" },
      { id: 2, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format" }
    ]
  },
  {
    id: 10,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    borderColor: "border-yellow-300",
    starred: false,
    collaborators: []
  },
  {
    id: 11,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago", 
    color: "bg-gradient-to-br from-green-100 to-green-200",
    borderColor: "border-green-300",
    starred: false,
    collaborators: []
  },
  {
    id: 12,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    borderColor: "border-blue-300",
    starred: false,
    collaborators: []
  },
  {
    id: 13,
    name: "Meadow Park Villas — Foundation Takeoff",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-yellow-100 to-yellow-200", 
    borderColor: "border-yellow-300",
    starred: false,
    collaborators: [
      { id: 1, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format" },
      { id: 2, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5b3?w=32&h=32&fit=crop&crop=face&auto=format" }
    ]
  },
  {
    id: 14,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago", 
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    borderColor: "border-blue-300",
    starred: false,
    collaborators: []
  },
  {
    id: 15,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-purple-100 to-purple-200",
    borderColor: "border-purple-300", 
    starred: false,
    collaborators: []
  },
  {
    id: 16,
    name: "Ridgeway High School — Classroom Block A",
    created: "Created 5 day ago",
    color: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    borderColor: "border-yellow-300",
    starred: false,
    collaborators: []
  }
]

const RECENT_TAKEOFFS = [
  {
    id: 1,
    name: "Office Renovation Phase 1",
    status: "completed",
    color: "bg-emerald-500"
  },
  {
    id: 2,
    name: "Hospital Main Wing Takeoff",
    status: "in-progress", 
    color: "bg-amber-500"
  },
  {
    id: 3,
    name: "Retail Shell Estimate July",
    status: "completed",
    color: "bg-emerald-500"
  },
  {
    id: 4,
    name: "Warehouse Structural Plan",
    status: "completed",
    color: "bg-emerald-500"
  },
  {
    id: 5,
    name: "Mixed-Use Building Core Only with...",
    status: "completed",
    color: "bg-emerald-500"
  }
]

export default function TakeoffsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [takeoffs, setTakeoffs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load takeoffs from localStorage on component mount
  useEffect(() => {
    const loadTakeoffs = () => {
      try {
        const savedTakeoffs = JSON.parse(localStorage.getItem('planza-takeoffs') || '[]')
        
        if (savedTakeoffs.length > 0) {
          // Add display properties to saved takeoffs
          const formattedTakeoffs = savedTakeoffs.map((takeoff: any, index: number) => ({
            ...takeoff,
            color: getColorForIndex(index),
            borderColor: getBorderColorForIndex(index),
            starred: false,
            collaborators: [],
            created: formatDate(takeoff.created)
          }))
          setTakeoffs(formattedTakeoffs)
        } else {
          // Use sample data if no saved takeoffs
          setTakeoffs(SAMPLE_TAKEOFFS)
        }
      } catch (error) {
        console.error('Error loading takeoffs:', error)
        setTakeoffs(SAMPLE_TAKEOFFS)
      } finally {
        setIsLoading(false)
      }
    }

    loadTakeoffs()
  }, [])

  // Helper functions for styling
  const getColorForIndex = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-100 to-blue-200',
      'bg-gradient-to-br from-purple-100 to-purple-200', 
      'bg-gradient-to-br from-yellow-100 to-yellow-200',
      'bg-gradient-to-br from-green-100 to-green-200',
      'bg-gradient-to-br from-red-100 to-red-200',
      'bg-gradient-to-br from-indigo-100 to-indigo-200'
    ]
    return colors[index % colors.length]
  }

  const getBorderColorForIndex = (index: number) => {
    const borderColors = [
      'border-blue-300',
      'border-purple-300',
      'border-yellow-300', 
      'border-green-300',
      'border-red-300',
      'border-indigo-300'
    ]
    return borderColors[index % borderColors.length]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Created 1 day ago'
    if (diffDays < 7) return `Created ${diffDays} days ago`
    if (diffDays < 30) return `Created ${Math.ceil(diffDays / 7)} weeks ago`
    return `Created ${Math.ceil(diffDays / 30)} months ago`
  }

  // Handle viewing individual takeoff
  const viewTakeoff = (takeoff: any) => {
    if (takeoff.sessionId) {
      const resultsUrl = `/takeoff-results/${takeoff.sessionId}?property=${encodeURIComponent(takeoff.name)}&scope=${encodeURIComponent(takeoff.scope || '')}`
      window.open(resultsUrl, '_blank')
    }
  }

  const toggleStar = (id: number) => {
    // Handle starring logic here
    console.log(`Toggle star for takeoff ${id}`)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Planza</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-200 border border-gray-300 rounded">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-200 border border-gray-300 rounded">K</kbd>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-4">
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 group">
              <Home className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold">Takeoff's</span>
                </div>
              </div>
              
              <a href="/add-new" className="w-full flex items-center space-x-3 px-6 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group">
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">Add New</span>
              </a>
            </div>

            <div className="pt-4 space-y-1">
              <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 group">
                <Star className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                <span className="text-sm font-medium">Starred</span>
              </a>
              
              <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 group">
                <User className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                <span className="text-sm font-medium">Shared with me</span>
              </a>
            </div>
          </nav>

          {/* Recent Takeoff's */}
          <div className="mt-8">
            <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Takeoff's
            </h3>
            <div className="space-y-1">
              {takeoffs.slice(0, 5).map((takeoff) => (
                <button
                  key={takeoff.id}
                  onClick={() => viewTakeoff(takeoff)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 group text-left"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${takeoff.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-sm`} />
                  <span className="text-sm text-gray-900 truncate group-hover:text-gray-700">{takeoff.name}</span>
                </button>
              ))}
              {takeoffs.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No takeoffs yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Reona Satio</p>
              <p className="text-xs text-gray-500 truncate">reonasatio@gmail.com</p>
            </div>
            <button className="p-1 hover:bg-gray-200 rounded-md transition-colors duration-200">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Takeoff's</h1>
              <p className="text-gray-600 mt-1">Manage and organize your construction takeoffs</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Button */}
              <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>

              {/* Add New Button */}
              <a 
                href="/add-new"
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </a>
            </div>
          </div>
        </div>

        {/* Takeoffs Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading your takeoffs...</p>
              </div>
            </div>
          ) : takeoffs.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No takeoffs yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first construction takeoff</p>
                <a 
                  href="/add-new"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Takeoff</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {takeoffs.map((takeoff) => (
                <div 
                  key={takeoff.id} 
                  onClick={() => viewTakeoff(takeoff)}
                  className={`${takeoff.color} ${takeoff.borderColor} border rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] cursor-pointer group relative`}
                >
                {/* Header Icons */}
                <div className="flex items-start justify-between mb-4">
                  <button 
                    onClick={() => toggleStar(takeoff.id)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      takeoff.starred 
                        ? 'text-yellow-500 bg-yellow-100' 
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={takeoff.starred ? 'currentColor' : 'none'} />
                  </button>
                  
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Project Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-gray-700">
                  {takeoff.name}
                </h3>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm text-gray-500 font-medium">
                    {takeoff.created}
                  </span>
                  
                  {/* Collaborators */}
                  {takeoff.collaborators.length > 0 && (
                    <div className="flex items-center -space-x-2">
                      {takeoff.collaborators.slice(0, 3).map((collaborator, index) => (
                        <div 
                          key={collaborator.id}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden"
                          style={{ zIndex: takeoff.collaborators.length - index }}
                        >
                          <img 
                            src={collaborator.avatar} 
                            alt="Collaborator"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {takeoff.collaborators.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">
                            +{takeoff.collaborators.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 