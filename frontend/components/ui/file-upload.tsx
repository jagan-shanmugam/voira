"use client";

import { useRef, useState } from "react";
import { FileTextIcon, UploadIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

export function FileUpload({
  onFilesSelected,
  accept = ".txt,.md,.pdf,.docx",
  multiple = true,
  maxSize = 10,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter by size
    const validFiles = files.filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragActive ? "border-primary bg-primary/10" : "border-separator2 hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary/10 rounded-full p-4">
            <UploadIcon size={32} className="text-primary" />
          </div>

          <div>
            <p className="text-fg1 mb-1">
              <Button
                type="button"
                variant="link"
                onClick={handleButtonClick}
                className="h-auto p-0"
              >
                Click to upload
              </Button>{" "}
              or drag and drop
            </p>
            <p className="text-fg3 text-sm">
              {accept.split(",").join(", ")} (max {maxSize}MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="bg-bg2 border-separator2 flex items-center gap-3 rounded-lg border p-3"
        >
          <FileTextIcon size={24} className="text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-fg0 truncate text-sm">{file.name}</p>
            <p className="text-fg3 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
            <XIcon size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}
