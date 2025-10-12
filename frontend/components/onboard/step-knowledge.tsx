'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileList, FileUpload } from '@/components/ui/file-upload';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SuccessMessage } from '@/components/ui/success-message';

interface StepKnowledgeProps {
  tenantId: string;
  onNext: () => void;
}

export function StepKnowledge({ tenantId, onNext }: StepKnowledgeProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setUploadSuccess(false);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      // Read file contents
      const documents = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          return {
            filename: file.name,
            content,
            metadata: JSON.stringify({ uploadedAt: new Date().toISOString() }),
          };
        })
      );

      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, documents }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload documents');
      }

      setUploadSuccess(true);
      setFiles([]);
    } catch (err) {
      setError('Failed to upload documents. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const canContinue = uploadSuccess || files.length === 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-fg0 mb-4 text-lg font-semibold">Upload Knowledge Base Files</h3>
          <FileUpload onFilesSelected={handleFilesSelected} accept=".txt,.md" />
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-fg1 text-sm">{files.length} file(s) selected</p>
              <Button onClick={handleUpload} disabled={uploading} size="sm" variant="outline">
                {uploading ? <LoadingSpinner size="sm" /> : 'Upload Files'}
              </Button>
            </div>
            <FileList files={files} onRemove={handleRemoveFile} />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {uploadSuccess && (
          <SuccessMessage message="Documents uploaded successfully to your knowledge base!" />
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!canContinue || uploading}
          variant={canContinue ? 'primary' : undefined}
        >
          {files.length > 0 && !uploadSuccess ? 'Skip for Now' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
