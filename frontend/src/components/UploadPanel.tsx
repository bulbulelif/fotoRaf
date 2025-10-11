import { useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadPanelProps {
  onUpload: (file: File) => void;
  isOpen: boolean;
}

export const UploadPanel = ({ onUpload, isOpen }: UploadPanelProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Lütfen bir görsel dosyası yükleyin");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onUpload(file);
    toast.success("Görsel başarıyla yüklendi!");
  };

  const clearPreview = () => {
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-card rounded-2xl p-8 shadow-soft border border-border animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ürün Fotoğrafı Yükle</h2>
          <p className="text-sm text-muted-foreground">Sürükle & bırak veya yüklemek için tıkla</p>
        </div>
      </div>

      {preview ? (
        <div className="relative group">
          <img 
            src={preview} 
            alt="Önizleme" 
            className="w-full h-64 object-contain rounded-xl bg-muted"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={clearPreview}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept="image/*"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <p className="text-lg font-semibold mb-1">Görselinizi buraya bırakın</p>
              <p className="text-sm text-muted-foreground">veya göz atmak için tıklayın</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Desteklenen formatlar: JPG, PNG, WEBP (maks 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
