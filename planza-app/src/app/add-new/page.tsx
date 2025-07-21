'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Home,
  FileText,
  Plus,
  X,
  User,
  MoreHorizontal,
  ArrowLeft,
  File,
  FileSpreadsheet,
  Download,
  Layers,
  BookOpen,
  Sparkles
} from 'lucide-react'

// Processing stages for the beautiful animation
const PROCESSING_STAGES = [
  {
    id: 'uploading',
    title: 'Uploading Documents',
    description: 'Your floorplans, specifications, and scope documents are being securely uploaded for processing.',
    icon: Upload,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    duration: 3000
  },
  {
    id: 'reading',
    title: 'Reading Floorplans and Specifications', 
    description: 'Our AI is analyzing your construction documents and extracting key information.',
    icon: BookOpen,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100', 
    duration: 4000
  },
  {
    id: 'detecting',
    title: 'Detecting Materials and Surfaces',
    description: 'Our AI is identifying structural elements like walls, doors, and finishes, and quantifying all material and surface areas.',
    icon: Layers,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    duration: 5000
  },
  {
    id: 'estimating',
    title: 'Preparing the Final Estimate',
    description: 'Combining material prices and labor rates to form a detailed cost structure.',
    icon: Sparkles,
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    duration: 3000
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

const SAMPLE_SCOPE_ITEMS = [
  {
    id: 1,
    title: "Communication",
    description: "Wireless Access Points, Audio-Video Devices, Data Communication Servers.",
    checked: true
  },
  {
    id: 2,
    title: "Conveying Equipment", 
    description: "Dumbwaiters, Elevators, Escalators and Moving Walks, Lifts, Material Handling, Hoists and Cranes, Turntables, Scaffolding, Transportation.",
    checked: true
  },
  {
    id: 3,
    title: "Demolition",
    description: "Structural Demolition, Interior Demolition, Exterior Demolition, Site Demolition, Salvageable Materials, Waste and Debris Removal, Utility Disconnection, Site Remediation",
    checked: true
  },
  {
    id: 4,
    title: "Drywall",
    description: "Drywall Panels, Taping and Mudding, Corner Bead, Joint Tape, Drywall Screws, Drywall Primer, Soundproofing and Insulation, Drywall Grid Systems, Plaster and Gypsum board.",
    checked: true
  },
  {
    id: 5,
    title: "Earthwork",
    description: "Lighting Fixtures, Lighting Controls, PVC Fittings, Rigid Fittings, EMT Fittings, Plates, Motor Control, Liquidtite, Hangers & Supports, Switchgear Panels, Grounding, Conduit, Conductors, Cable Tray, Wiring, Switches, Panels & Circuit Breakers, Low Voltage & Other Devices, Fuses, Receptacles, Feeders, Switchboards, Branch Devices.",
    checked: true
  },
  {
    id: 6,
    title: "Electronic Safety And Security",
    description: "Keypads and Access Control Cards, Card Readers, Fire Detection and Alarm, Duct Smoke Detection, Horns and Strobes.",
    checked: true
  },
  {
    id: 7,
    title: "Equipment",
    description: "All Types of Equipment, Food Services Equipment, Healthcare Equipment.",
    checked: true
  },
  {
    id: 8,
    title: "Finishes",
    description: "Rubber, VCT Tiling, Wooden, Vinyl, LVT, Tile, Laminate, Wall finishes, Acoustic ceiling",
    checked: true
  }
]

const SAMPLE_TAGS = [
  "Mechanical takeoff",
  "First Merge takeoff - test takeoff ignore", 
  "Southridge Behavioral Hospital",
  "Landscape sample"
]

export default function AddNewTakeoffPage() {
  const [propertyName, setPropertyName] = useState('')
  const [scope, setScope] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, size: number, type: string, id: string}>>([])
  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, number>>({})
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [stageProgress, setStageProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [processingResult, setProcessingResult] = useState<any>(null)

  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      return { icon: FileText, color: 'bg-red-100 text-red-600' }
    }
    if (fileType.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls') {
      return { icon: FileSpreadsheet, color: 'bg-green-100 text-green-600' }
    }
    if (extension === 'csv') {
      return { icon: FileSpreadsheet, color: 'bg-blue-100 text-blue-600' }
    }
    return { icon: File, color: 'bg-gray-100 text-gray-600' }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }



  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      id: Date.now() + Math.random().toString()
    }))

    setFiles(prev => [...prev, ...acceptedFiles])
    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((file) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
        }
        setFileUploadProgress(prev => ({ ...prev, [file.id]: progress }))
      }, 200)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxSize: 250 * 1024 * 1024
  })

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index]
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setFiles(prev => prev.filter((_, i) => i !== index))
    setFileUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileToRemove.id]
      return newProgress
    })
  }

  const handleSubmit = async () => {
    if (!propertyName || uploadedFiles.length === 0) {
      alert('Please provide a property name and upload at least one file.')
      return
    }

    setIsProcessing(true)
    setCurrentStage(0)
    setStageProgress(0)
    setIsComplete(false)
    setShowSuccess(false)
    setProcessingResult(null)

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('propertyName', propertyName);
      formData.append('scope', scope);
      
      // Append the actual files from files state (not just uploadedFiles metadata)
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Connect to Server-Sent Events endpoint
      const response = await fetch('/api/process-takeoff', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      // Process Server-Sent Events
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              // Map server stages to UI stage indices
              const stageMap = {
                'uploading': 0,
                'reading': 1, 
                'detecting': 2,
                'estimating': 3
              };
              
              const stageIndex = stageMap[data.stage as keyof typeof stageMap];
              if (stageIndex !== undefined) {
                setCurrentStage(stageIndex);
                setStageProgress(data.progress);
              }
              
              // Handle completion
              if (data.stage === 'complete') {
                setProcessingResult(data.result);
                setIsComplete(true);
                
                // Save takeoff to localStorage and redirect to main takeoffs page
                setTimeout(() => {
                  if (data.result?.sessionId) {
                    // Save takeoff data
                    const takeoffData = {
                      id: data.result.sessionId,
                      name: propertyName,
                      scope: scope,
                      created: new Date().toISOString(),
                      files: data.result.files,
                      sessionId: data.result.sessionId,
                      status: 'completed'
                    };
                    
                    // Get existing takeoffs from localStorage
                    const existingTakeoffs = JSON.parse(localStorage.getItem('planza-takeoffs') || '[]');
                    
                    // Add new takeoff to the beginning of the list
                    const updatedTakeoffs = [takeoffData, ...existingTakeoffs];
                    
                    // Save back to localStorage
                    localStorage.setItem('planza-takeoffs', JSON.stringify(updatedTakeoffs));
                    
                    setShowSuccess(true);
                    
                    // Redirect to takeoffs page after showing success briefly
                    setTimeout(() => {
                      window.location.href = '/takeoffs';
                    }, 3000);
                  }
                }, 2000); // Wait 2 seconds for file to be ready
                
                break;
              }
              
              // Handle errors
              if (data.stage === 'error') {
                console.error('Processing error:', data.error);
                alert(`Processing failed: ${data.message}`);
                setIsProcessing(false);
                break;
              }
              
            } catch (e) {
              // Ignore malformed JSON
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('Takeoff processing failed:', error);
      alert(`Processing failed: ${error.message}`);
      setIsProcessing(false);
    }
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
              <a href="/takeoffs" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">Takeoff's</span>
                </div>
              </a>
              
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold">Add New</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Recent Takeoff's */}
          <div className="mt-8">
            <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Takeoff's
            </h3>
            <div className="space-y-1">
              {RECENT_TAKEOFFS.map((takeoff) => (
                <a 
                  key={takeoff.id}
                  href="#" 
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${takeoff.color} shadow-sm`} />
                  <span className="text-sm text-gray-900 truncate group-hover:text-gray-700">{takeoff.name}</span>
                </a>
              ))}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Center Panel */}
        <div className="flex-1 flex flex-col bg-white relative">
          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-95 processing-overlay z-50 flex items-center justify-center overflow-auto">
              <div className="max-w-7xl w-full mx-auto px-4 py-8">
                {showSuccess ? (
                                      // Simple Success Animation
                    <div className="text-center animate-in fade-in duration-1000">
                      <div className="w-32 h-32 mx-auto mb-8 bg-emerald-100 rounded-full flex items-center justify-center success-animation">
                        <CheckCircle className="w-16 h-16 text-emerald-500 animate-pulse" />
                      </div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">Takeoff Complete!</h1>
                      <p className="text-xl text-gray-600 mb-8">
                        Your construction takeoff "{propertyName}" has been successfully saved to your project list.
                      </p>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-6 mb-6">
                          <div className="flex items-center justify-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-gray-900">Takeoff Saved Successfully</span>
                          </div>
                          <p className="text-gray-600 text-center">
                            Your project has been added to the Takeoff's dashboard. Redirecting you back in a moment...
                          </p>
                        </div>
                        
                        <div className="flex space-x-4 justify-center">
                          <button 
                            onClick={() => {
                              window.location.href = '/takeoffs';
                            }}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <FileSpreadsheet className="w-5 h-5" />
                            <span>View All Takeoffs</span>
                          </button>
                          <button 
                            onClick={() => {
                              setIsProcessing(false);
                              setShowSuccess(false);
                              setIsComplete(false);
                              setPropertyName('');
                              setScope('');
                              setFiles([]);
                              setUploadedFiles([]);
                            }}
                            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200"
                          >
                            Create Another
                          </button>
                        </div>
                      </div>
                    </div>
                ) : (
                  // Processing Animation
                  (() => {
                    const stage = PROCESSING_STAGES[currentStage]
                    const IconComponent = stage.icon
                    
                    return (
                      <div className="max-w-xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
                        {/* Animated Icon */}
                        <div className={`w-24 h-24 mx-auto mb-8 ${stage.bgColor} rounded-full flex items-center justify-center`}>
                          <div className="relative">
                            <IconComponent className={`w-12 h-12 ${stage.color} animate-pulse`} />
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200">
                              <div 
                                className={`absolute inset-0 rounded-full border-4 ${stage.color.replace('text-', 'border-')} transition-all duration-300`}
                                style={{
                                  borderRightColor: 'transparent',
                                  borderTopColor: 'transparent',
                                  transform: `rotate(${stageProgress * 3.6}deg)`
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Stage Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          {stage.title}
                        </h1>

                        {/* Stage Description */}
                        <p className="text-lg text-gray-600 mb-8">
                          {stage.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${stageProgress}%` }}
                          />
                        </div>

                        {/* Progress Percentage */}
                        <p className="text-sm font-medium text-gray-500 mb-8">
                          {Math.round(stageProgress)}% Complete
                        </p>

                        {/* Stage Indicators */}
                        <div className="flex justify-center space-x-3">
                          {PROCESSING_STAGES.map((stageItem, index) => (
                            <div
                              key={stageItem.id}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index < currentStage 
                                  ? 'bg-emerald-500' 
                                  : index === currentStage 
                                    ? stageItem.bgColor.replace('bg-', 'bg-')
                                    : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center space-x-4 mb-3">
              <a 
                href="/takeoffs"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </a>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="font-medium">TAKEOFF'S</span>
                <span className="text-gray-300">/</span>
                <span className="font-medium">ADD NEW</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add new Takeoff</h1>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-3xl space-y-8">
              {/* Property Name */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Property name
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Enter property name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Upload plans and spec docs
                </label>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag & Drop files or{' '}
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold">Choose file</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Files supported: PDF, XLSX | Max file size: 250 MB
                  </p>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Uploaded Files ({uploadedFiles.length})
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(uploadedFiles.reduce((total, file) => total + file.size, 0))} total
                      </span>
                    </div>
                    
                    <div className="grid gap-3">
                      {uploadedFiles.map((file, index) => {
                        const { icon: IconComponent, color } = getFileIcon(file.name, file.type)
                        const progress = fileUploadProgress[file.id] || 0
                        const isComplete = progress >= 100
                        
                        return (
                          <div 
                            key={file.id} 
                            className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 animate-in slide-in-from-top-2 fade-in"
                          >
                            {/* Progress Bar Background */}
                            {!isComplete && (
                              <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-60">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                            
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                {/* File Icon */}
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} shadow-sm`}>
                                  <IconComponent className="w-6 h-6" />
                                </div>
                                
                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    {isComplete && (
                                      <div className="flex items-center space-x-1">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-medium text-emerald-600">Complete</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-gray-500 font-medium">
                                      {formatFileSize(file.size)}
                                    </span>
                                    
                                    {!isComplete && (
                                      <>
                                        <span className="text-xs text-blue-600 font-medium">
                                          {Math.round(progress)}% uploaded
                                        </span>
                                        <div className="flex-1 max-w-24">
                                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                              style={{ width: `${progress}%` }}
                                            />
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2">
                                {isComplete && (
                                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group/download">
                                    <Download className="w-4 h-4 text-gray-400 group-hover/download:text-blue-500" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => removeFile(index)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 group/remove"
                                >
                                  <X className="w-4 h-4 text-gray-400 group-hover/remove:text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Specify Scope */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">
                    Specify the scope
                  </label>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
                    Upload file
                  </button>
                </div>
                
                <textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Please select the scope upto 2000 characters are allowed"
                  rows={8}
                  maxLength={2000}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white"
                />

                {/* Sample Tags */}
                <div className="flex flex-wrap gap-3">
                  {SAMPLE_TAGS.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => setScope(prev => prev + (prev ? ' ' : '') + tag)}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 hover:scale-105 transition-all duration-200 border border-blue-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Note */}
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <AlertCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-2">Note</p>
                      <ul className="text-sm text-blue-800 space-y-1.5">
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>Specify Master Format Divisions, Titles or Trades.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>Please refer to the sample scope for the appropriate level of detail.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <a 
                  href="/takeoffs"
                  className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </a>
                <button 
                  onClick={handleSubmit}
                  disabled={!propertyName || uploadedFiles.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Add Takeoff
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-sm">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sample scope items</h2>
            <p className="text-sm text-gray-600">Category wise example of takeoff items</p>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-6">
              {SAMPLE_SCOPE_ITEMS.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 