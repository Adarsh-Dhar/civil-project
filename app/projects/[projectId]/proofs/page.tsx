'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, ImageIcon, FileText, Eye, Trash2 } from 'lucide-react';

const PROOFS = [
  {
    id: '1',
    name: 'Foundation Inspection Photos',
    type: 'Image',
    size: '24.5 MB',
    uploadedBy: 'Bob Collins',
    uploadedAt: '2024-03-15',
    linkedTask: 'Foundation Pouring',
  },
  {
    id: '2',
    name: 'Structural Steel Certification',
    type: 'PDF',
    size: '2.3 MB',
    uploadedBy: 'Charlie Davis',
    uploadedAt: '2024-03-10',
    linkedTask: 'Structural Steel',
  },
  {
    id: '3',
    name: 'Site Safety Inspection Report',
    type: 'PDF',
    size: '1.8 MB',
    uploadedBy: 'Alice Morgan',
    uploadedAt: '2024-03-08',
    linkedTask: 'Site Preparation',
  },
  {
    id: '4',
    name: 'Electrical Wiring Compliance',
    type: 'PDF',
    size: '3.2 MB',
    uploadedBy: 'Engineer A',
    uploadedAt: '2024-03-05',
    linkedTask: 'Electrical Wiring',
  },
];

export default function ProofsPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Proof Vault</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">All project documentation and evidence</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload File</span>
        </Button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center mb-8 hover:border-indigo-400 hover:bg-indigo-50 transition cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop files here to upload</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">or click to browse</p>
        <p className="text-xs text-gray-500">Maximum file size: 100 MB</p>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {PROOFS.map((proof) => {
          const Icon = proof.type === 'PDF' ? FileText : ImageIcon;
          return (
            <div key={proof.id} className="bg-white rounded-lg sm:rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2.5 rounded-lg ${proof.type === 'PDF' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${proof.type === 'PDF' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{proof.name}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">{proof.size}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-600">
                    <span>{proof.linkedTask}</span>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={`https://avatar.vercel.sh/${proof.uploadedBy.split(' ')[0].toLowerCase()}`} />
                        <AvatarFallback className="text-[9px]">{proof.uploadedBy[0]}</AvatarFallback>
                      </Avatar>
                      <span>{proof.uploadedBy}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(proof.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-red-100 rounded-lg transition">
                    <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
