'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, ImageIcon, FileText, Eye, Loader2 } from 'lucide-react';

type ProjectProof = {
  id: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
  uploader: { name: string | null };
};

type TaskProof = {
  id: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
  uploader: { name: string | null };
  task: { id: string; sequence: number; name: string };
};

type ProofRow = {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  linkedTask: string;
};

type ProjectTask = {
  id: string;
  sequence: number;
  name: string;
};

const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.dwg';

export default function ProofsPage() {
  const params = useParams<{ projectId?: string | string[] }>();
  const projectId = useMemo(() => {
    const raw = params?.projectId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [rows, setRows] = useState<ProofRow[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState('project');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fetchProofs = async (activeProjectId: string) => {
    setError('');
    const response = await fetch(`/api/projects/${activeProjectId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Failed to load proofs.');
    }

    const data = await response.json();
    const projectProofs: ProjectProof[] = data?.project?.proofs ?? [];
    const taskProofs: TaskProof[] = data?.project?.taskProofs ?? [];

    const normalizedProjectProofs: ProofRow[] = projectProofs.map((proof) => ({
      id: `project-${proof.id}`,
      name: proof.fileUrl?.split('/').pop() || `Project proof ${proof.id}`,
      type: proof.type || 'document',
      fileUrl: proof.fileUrl,
      uploadedAt: proof.uploadedAt,
      uploadedBy: proof.uploader?.name || 'Unknown',
      linkedTask: 'Project level',
    }));

    const normalizedTaskProofs: ProofRow[] = taskProofs.map((proof) => ({
      id: `task-${proof.id}`,
      name: proof.fileUrl?.split('/').pop() || `Task proof ${proof.id}`,
      type: proof.type || 'document',
      fileUrl: proof.fileUrl,
      uploadedAt: proof.uploadedAt,
      uploadedBy: proof.uploader?.name || 'Unknown',
      linkedTask: proof.task?.name || 'Task proof',
    }));

    const merged = [...normalizedTaskProofs, ...normalizedProjectProofs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    setRows(merged);
  };

  const fetchTasks = async (activeProjectId: string) => {
    const response = await fetch(`/api/projects/${activeProjectId}/tasks`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Failed to load project tasks.');
    }

    const data = await response.json();
    const taskList: ProjectTask[] = Array.isArray(data?.tasks) ? data.tasks : [];
    setTasks(taskList.map((task) => ({ id: task.id, sequence: task.sequence, name: task.name })));
  };

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError('Invalid project id.');
      return;
    }

    let cancelled = false;

    const loadPageData = async () => {
      try {
        await Promise.all([fetchProofs(projectId), fetchTasks(projectId)]);
      } catch (fetchError) {
        console.error('Failed to load proofs page data:', fetchError);
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load proofs data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleUpload = async () => {
    if (!projectId) {
      setUploadError('Invalid project id.');
      return;
    }

    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskId', selectedTaskId);
      if (note.trim()) {
        formData.append('note', note.trim());
      }

      const response = await fetch(`/api/projects/${projectId}/proofs`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Upload failed.');
      }

      await fetchProofs(projectId);
      setSelectedFile(null);
      setSelectedTaskId('project');
      setNote('');
      setUploadMessage('Proof uploaded successfully.');
    } catch (uploadErr) {
      console.error('Upload failed:', uploadErr);
      setUploadError(uploadErr instanceof Error ? uploadErr.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    const normalized = type.toLowerCase();
    if (normalized.includes('image') || normalized.includes('photo')) {
      return ImageIcon;
    }
    return FileText;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Proof Vault</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">All project documentation and evidence from live records</p>
        </div>
        <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm disabled:opacity-60">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Upload Proof'}</span>
        </Button>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border mb-6 space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Upload New Proof</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">File</label>
            <input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Allowed: PDF, JPG, PNG, DWG (max 100 MB)</p>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Assign to Task</label>
            <select
              value={selectedTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="project">Project level (not task-specific)</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  #{task.sequence} - {task.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-2">Note (optional)</label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Add context for this proof upload"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {selectedFile && (
          <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
        )}

        {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
        {uploadMessage && <p className="text-sm text-emerald-600">{uploadMessage}</p>}

        <div>
          <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading
              </span>
            ) : (
              'Upload File'
            )}
          </Button>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading proofs...</div>}
      {!loading && error && <div className="text-sm text-destructive">{error}</div>}

      {/* Files List */}
      <div className="space-y-3">
        {!loading && !error && rows.length === 0 && (
          <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border text-sm text-muted-foreground">
            No proofs uploaded yet for this project.
          </div>
        )}

        {rows.map((proof) => {
          const Icon = getFileIcon(proof.type);
          return (
            <div key={proof.id} className="bg-card rounded-lg sm:rounded-xl p-4 border border-border hover:border-indigo-300 hover:shadow-md transition">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2.5 rounded-lg ${proof.type.toLowerCase().includes('image') ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${proof.type.toLowerCase().includes('image') ? 'text-blue-600' : 'text-red-600'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="text-sm sm:text-base font-medium text-foreground truncate">{proof.name}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 capitalize">{proof.type}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
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
                  <button
                    onClick={() => window.open(proof.fileUrl, '_blank', 'noopener,noreferrer')}
                    className="p-2 hover:bg-accent rounded-lg transition"
                    title="Open proof"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
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
