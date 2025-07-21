'use client'

import { useState, useEffect } from 'react'
import { Home, Download, Printer } from 'lucide-react'

interface TakeoffResultsPageProps {
  params: { sessionId: string }
}

export default function TakeoffResultsPage({ params }: TakeoffResultsPageProps) {
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [propertyName, setPropertyName] = useState('Property Takeoff')
  const [scope, setScope] = useState('Construction Analysis')
  const [error, setError] = useState<string | null>(null)

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n')
    if (lines.length === 0) return { columns: [], data: [] }
    
    // Simple CSV parser that handles quoted fields
    const parseCsvLine = (line: string) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }
    
    // Parse header row
    const headers = parseCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, ''))
    
    // Parse data rows
    const data = lines.slice(1).map(line => {
      const values = parseCsvLine(line).map(v => v.replace(/^"|"$/g, ''))
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    }).filter(row => Object.values(row).some(value => value.length > 0))
    
    return { columns: headers, data }
  }

  useEffect(() => {
    const fetchCsvData = async () => {
      try {
        // First, get the list of files for this session
        const response = await fetch(`/api/session/${params.sessionId}/files`)
        if (!response.ok) {
          throw new Error('Failed to fetch session files')
        }
        
        const files = await response.json()
        const csvFile = files.find((file: any) => 
          file.type === 'csv' || file.fileName.toLowerCase().includes('.csv')
        )
        
        if (!csvFile) {
          throw new Error('No CSV file found for this session')
        }
        
        // Fetch the CSV content
        const csvResponse = await fetch(csvFile.downloadUrl)
        if (!csvResponse.ok) {
          throw new Error('Failed to fetch CSV data')
        }
        
        const csvText = await csvResponse.text()
        const { columns, data } = parseCsvData(csvText)
        
        setCsvColumns(columns)
        setCsvData(data)
        
        // Try to extract property info from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search)
        setPropertyName(urlParams.get('property') || 'Construction Takeoff')
        setScope(urlParams.get('scope') || 'General Construction Analysis')
        
      } catch (error) {
        console.error('Error loading CSV data:', error)
        setError('Failed to load takeoff data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCsvData()
  }, [params.sessionId])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadCsv = async () => {
    try {
      const response = await fetch(`/api/session/${params.sessionId}/files`)
      const files = await response.json()
      const csvFile = files.find((file: any) => 
        file.type === 'csv' || file.fileName.toLowerCase().includes('.csv')
      )
      
      if (csvFile) {
        window.open(csvFile.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading takeoff results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.close()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close Window
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="bg-white px-8 py-6 border-b border-gray-300">
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          {/* Left side - Logo and Property */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planza</h1>
                <p className="text-sm text-gray-600">AI-Powered Construction Takeoff Platform</p>
              </div>
            </div>
            <div className="border-l border-gray-300 pl-6">
              <h2 className="text-lg font-semibold text-gray-900">{propertyName}</h2>
              <p className="text-sm text-gray-600 mt-1">{scope}</p>
              <p className="text-xs text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Right side - Contact and Actions */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-4">
              <p>📞 (555) 835-3278</p>
              <p>✉️ planza@constructing.com</p>
              <p>🏢 AI Urban General Contracting</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 text-sm flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button 
                onClick={handleDownloadCsv}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-sm flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Table */}
      <div className="max-w-full mx-auto px-4 py-6">
        <div className="bg-white shadow-lg overflow-hidden">
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="border-b border-gray-300">
                  {csvColumns.map((column, index) => (
                    <th key={index} className={`px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase ${index < csvColumns.length - 1 ? 'border-r border-gray-300' : ''} min-w-24`}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    {csvColumns.map((column, colIndex) => (
                      <td key={colIndex} className={`px-4 py-3 text-sm text-gray-900 ${colIndex < csvColumns.length - 1 ? 'border-r border-gray-200' : ''}`}>
                        <div className="max-w-xs" title={row[column] || ''}>
                          {row[column] || '—'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 