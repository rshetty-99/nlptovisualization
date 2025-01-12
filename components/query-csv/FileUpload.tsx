'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UploadCloud } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [downloadURL, setDownloadURL] = useState<string | null>(null)
  const { toast } = useToast()

  const validateFileExtension = (file: File) => {
    const validExtensions = ['.csv', '.xls', '.xlsx', '.pdf'];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && validateFileExtension(acceptedFiles[0])) {
      setFile(acceptedFiles[0]);
      setDownloadURL(null);
      if (DEBUG_MODE) console.log('File selected:', acceptedFiles[0].name);
    } else {
      toast({
        title: "Error",
        description: "Please upload a valid CSV, Excel, or PDF file.",
        variant: "destructive",
      });
      if (DEBUG_MODE) console.log('Invalid file selected');
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    if (DEBUG_MODE) console.log('Starting file upload...');

    const formData = new FormData()
    formData.append('file', file)

    try {
      if (DEBUG_MODE) console.log('Sending file to server...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setDownloadURL(result.url)
        if (DEBUG_MODE) console.log('File uploaded successfully:', result.url);
        toast({
          title: "Success",
          description: "File uploaded successfully to Firebase Storage",
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      if (DEBUG_MODE) console.log('Upload failed:', error);
      toast({
        title: "Error",
        description: "File upload to Firebase Storage failed",
        variant: "destructive",
      })
    }
    setUploading(false)
    setFile(null)
    if (DEBUG_MODE) console.log('Upload process completed');
  }

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="csv-file" className="text-foreground mb-2">Upload File</Label>
        <div 
          {...getRootProps()} 
          className={`h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-accent bg-accent/10' 
              : 'border-accent/20 hover:border-accent/50 dark:border-accent/30 dark:hover:border-accent/60'
            }
            ${file ? 'bg-accent/10' : 'bg-white/20 dark:bg-white/10'}
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <UploadCloud className="mx-auto h-10 w-10 text-accent mb-2" />
            <p className="text-sm text-foreground">
              {file ? file.name : isDragActive
                ? "Drop the CSV, Excel, or PDF file here"
                : "Drag & drop a CSV, Excel, or PDF file here, or click to select"}
            </p>
          </div>
        </div>
      </div>
      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className="bg-accent hover:bg-accent/90 text-black dark:text-white rounded-full px-8 font-semibold h-12 w-full"
      >
        {uploading ? 'Uploading to Firebase...' : 'Upload File'}
      </Button>
      {downloadURL && (
        <div className="mt-4">
          <Label className="text-foreground mb-2">Firebase Storage URL:</Label>
          <a href={downloadURL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
            {downloadURL}
          </a>
        </div>
      )}
    </div>
  )
}

