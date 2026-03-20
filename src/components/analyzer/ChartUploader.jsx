import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileImage, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ChartUploader({ onUpload, isAnalyzing, disabled }) {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      onUpload(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          onUpload(file);
        }
        break;
      }
    }
  };

  useEffect(() => {
    const zone = dropZoneRef.current;
    if (!zone) return;

    zone.addEventListener('paste', handlePaste);
    return () => {
      zone.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardContent className="p-0">
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          className={`relative ${disabled ? 'opacity-50' : ''}`}
        >
          <div
            ref={dropZoneRef}
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              disabled 
                ? 'border-slate-600 cursor-not-allowed' 
                : 'border-slate-600 hover:border-blue-500 cursor-pointer'
            }`}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            
            {isAnalyzing ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Processing Chart</h3>
                  <p className="text-slate-400">AI is analyzing your chart...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {disabled ? 'Complete Settings First' : 'Upload Chart Image'}
                  </h3>
                  <p className="text-slate-400 mb-4">
                   {disabled 
                     ? 'Please fill in instrument and timeframe above'
                     : 'Drop, paste or click to browse'
                   }
                  </p>
                  {!disabled && (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-200 hover:bg-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Supported formats: PNG, JPG, PDF
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}