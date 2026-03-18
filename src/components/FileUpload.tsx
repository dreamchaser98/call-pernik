'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadedFile {
  file: File;
  preview?: string;
}

interface Props {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function FileUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 20,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError('');
      const toAdd: UploadedFile[] = [];
      const currentCount = files.length;

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];

        if (currentCount + toAdd.length >= maxFiles) {
          setError(`Максимум ${maxFiles} файла`);
          break;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          setError('Позволени са само изображения (JPG, PNG, GIF, WebP), PDF и Word документи');
          continue;
        }

        const newTotal = totalSize + toAdd.reduce((s, f) => s + f.file.size, 0) + file.size;
        if (newTotal > maxSizeMB * 1024 * 1024) {
          setError(`Общият размер на файловете не може да надвишава ${maxSizeMB}MB`);
          break;
        }

        const uploaded: UploadedFile = { file };
        if (file.type.startsWith('image/')) {
          uploaded.preview = URL.createObjectURL(file);
        }
        toAdd.push(uploaded);
      }

      if (toAdd.length > 0) {
        onFilesChange([...files, ...toAdd]);
      }
    },
    [files, onFilesChange, maxFiles, maxSizeMB, totalSize]
  );

  const removeFile = (index: number) => {
    const updated = [...files];
    if (updated[index].preview) {
      URL.revokeObjectURL(updated[index].preview!);
    }
    updated.splice(index, 1);
    onFilesChange(updated);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    return '📎';
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Прикачени документи
      </label>

      <p className="text-xs text-slate-500">
        Можете да прикачите до {maxFiles} файла (общо до {maxSizeMB}MB). 
        Позволени формати: JPG, PNG, GIF, WebP, PDF, DOC/DOCX.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#2d4a7a] bg-blue-50 scale-[1.01]'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        } ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-[#2d4a7a]">Изберете файл</span> или го довлачете тук
          </p>
          <p className="text-xs text-slate-400">
            {files.length}/{maxFiles} файла • {formatFileSize(totalSize)}/{maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg p-3 group"
            >
              {f.preview ? (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <span className="text-2xl flex-shrink-0">{getFileIcon(f.file.type)}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {f.file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(f.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
