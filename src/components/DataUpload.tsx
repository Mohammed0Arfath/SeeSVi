import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface DataUploadProps {
  onDataLoaded: (data: any[], fileName: string) => void;
}

export function DataUpload({ onDataLoaded }: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileProcessing = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      const text = await file.text();
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            toast({
              title: "CSV Parse Warning",
              description: `Found ${results.errors.length} parsing issues, but continuing with data loading.`,
              variant: "default"
            });
          }
          
          onDataLoaded(results.data, file.name);
          toast({
            title: "CSV Loaded Successfully",
            description: `Loaded ${results.data.length} rows from ${file.name}`,
          });
        },
        error: (error) => {
          toast({
            title: "Error Loading CSV",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error Processing File",
        description: "Failed to read the CSV file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [onDataLoaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileProcessing(csvFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
    }
  }, [handleFileProcessing, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcessing(file);
    }
  }, [handleFileProcessing]);

  return (
    <Card className="border-2 border-dashed border-border hover:border-primary transition-colors">
      <CardContent className="p-8">
        <div
          className={`relative rounded-lg border-2 border-dashed transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="mb-4">
              {isUploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              ) : (
                <Upload className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isUploading ? 'Processing CSV...' : 'Upload your CSV file'}
            </h3>
            
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Drag and drop your CSV file here, or click to browse. We'll automatically analyze your data and generate insights.
            </p>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                disabled={isUploading}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>
        
        <div className="mt-6 text-xs text-muted-foreground text-center">
          Supported format: CSV files up to 200MB
        </div>
      </CardContent>
    </Card>
  );
}