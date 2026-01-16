'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function ImportPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [entityType, setEntityType] = useState<'contact' | 'property' | 'organization' | 'lead'>('contact');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'csv':
        return '📄';
      case 'vcf':
        return '👤';
      case 'txt':
        return '💬';
      default:
        return '📁';
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);

      try {
        const response = await fetch('/api/import/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ Successfully uploaded ${file.name}`, result);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          console.error(`❌ Failed to upload ${file.name}`, result);
          alert(`Failed to upload ${file.name}\n\nError: ${result.error || 'Unknown error'}\nDetails: ${result.details || 'No details available'}`);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        }
      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error);
        alert(`Error uploading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    }

    setUploading(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/properties" className="group flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="ms-2 font-medium">Back to Properties</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/import/history"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Import History
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ms-3">
              <h3 className="text-sm font-medium text-blue-800">Supported File Formats</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>📊 Excel: .xlsx, .xls | 📄 CSV: .csv | 👤 vCard: .vcf | 💬 WhatsApp: .txt</p>
                <p className="mt-1">All column headers will be preserved. Dynamic fields stored automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Type Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Import To
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'contact', label: 'Contacts', icon: '👤' },
              { value: 'property', label: 'Properties', icon: '🏢' },
              { value: 'organization', label: 'Organizations', icon: '🏛️' },
              { value: 'lead', label: 'Leads', icon: '🎯' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setEntityType(type.value as any)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  entityType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.vcf,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload up to 100 files at once (Max 50MB per file)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Select Files
            </button>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Selected Files ({selectedFiles.length})
                </h3>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(file.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    {uploadProgress[file.name] !== undefined && (
                      <div className="mx-4">
                        {uploadProgress[file.name] === 100 ? (
                          <span className="text-green-600">✓</span>
                        ) : uploadProgress[file.name] === -1 ? (
                          <span className="text-red-600">✗</span>
                        ) : (
                          <span className="text-blue-600">{uploadProgress[file.name]}%</span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600"
                      disabled={uploading}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className={`px-8 py-3 rounded-lg font-medium ${
                    uploading || selectedFiles.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Imports */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Total Imports</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Records</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Duplicates</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500">Custom Fields</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
