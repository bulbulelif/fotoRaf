import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Download, RefreshCw, Brain } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { generateBackground, analyzeProduct, AnalyzeProductResponse } from "@/services/api";

interface BackgroundPanelProps {
  isOpen: boolean;
  uploadedImage: string | null;
  uploadedImageUrl?: string;
  onGenerated?: (imageUrl: string, prompt: string) => void;
}

export const BackgroundPanel = ({ isOpen, uploadedImage, uploadedImageUrl, onGenerated }: BackgroundPanelProps) => {
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [usedPrompt, setUsedPrompt] = useState<string>("");
  
  // Ürün analizi state'leri
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productCategories, setProductCategories] = useState<AnalyzeProductResponse | null>(null);

  const handleGenerate = async () => {
    if (!uploadedImageUrl) {
      toast.error("Lütfen önce bir görsel yükleyin");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Arka plan oluşturuluyor...");

    try {
      const result = await generateBackground({
        inputImageUrl: uploadedImageUrl,
        prompt: backgroundPrompt.trim() || undefined,
        removeBg: true,
        categories: productCategories || undefined,
      });

      setGeneratedImage(result.resultUrl);
      setUsedPrompt(result.usedPrompt);
      
      // Parent component'e bildir
      if (onGenerated) {
        onGenerated(result.resultUrl, result.usedPrompt);
      }
      
      toast.success("Arka plan başarıyla oluşturuldu!", { id: loadingToast });
    } catch (error) {
      console.error("Error generating background:", error);
      toast.error(
        error instanceof Error ? error.message : "Arka plan oluşturma başarısız",
        { id: loadingToast }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `fotoraf-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Görsel indiriliyor!");
  };

  const handleAnalyze = async () => {
    if (!uploadedImageUrl) {
      toast.error("Lütfen önce bir görsel yükleyin");
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading("Ürün analiz ediliyor...");

    try {
      const categories = await analyzeProduct({
        imageUrl: uploadedImageUrl,
      });

      setProductCategories(categories);
      toast.success("Ürün analizi tamamlandı!", { id: loadingToast });
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast.error(
        error instanceof Error ? error.message : "Ürün analizi başarısız",
        { id: loadingToast }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Otomatik analiz - görsel yüklendiğinde
  useEffect(() => {
    if (uploadedImageUrl && !productCategories && !isAnalyzing && isOpen) {
      handleAnalyze();
    }
  }, [uploadedImageUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="bg-card rounded-2xl p-8 shadow-soft border border-border animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">AI Arka Plan</h2>
          <p className="text-sm text-muted-foreground">Profesyonel arka plan oluştur</p>
        </div>
      </div>

      {/* Ürün Kategorileri */}
      {isAnalyzing && (
        <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Ürün analiz ediliyor...</span>
          </div>
        </div>
      )}

      {productCategories && (
        <div className="mb-6 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Ürün Kategorileri</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Ürün Tipi:</span>
              <span className="ml-1 font-medium">{productCategories.main_product_type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Alt Kategori:</span>
              <span className="ml-1 font-medium">{productCategories.subcategory}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hedef Kitle:</span>
              <span className="ml-1 font-medium">{productCategories.target_audience}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fiyat:</span>
              <span className="ml-1 font-medium">{productCategories.price_range}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Kullanım:</span>
              <span className="ml-1 font-medium">{productCategories.use_case}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stil:</span>
              <span className="ml-1 font-medium">{productCategories.style_design}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sezon:</span>
              <span className="ml-1 font-medium">{productCategories.season_occasion}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Vibe:</span>
              <span className="ml-1 font-medium">{productCategories.vibe}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="mt-3 w-full"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Yeniden Analiz Et
          </Button>
        </div>
      )}

      {/* Arka plan önizlemesi */}
      {generatedImage && (
        <div className="mb-6">
          <img 
            src={generatedImage} 
            alt="Oluşturulan arka plan" 
            className="w-full rounded-xl border border-border"
          />
          {usedPrompt && (
            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
              <strong>Kullanılan prompt:</strong> {usedPrompt}
            </p>
          )}
        </div>
      )}

      {/* Prompt girişi */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Arka Plan Açıklaması (opsiyonel)
          </label>
          <Textarea
            placeholder={productCategories 
              ? "Boş bırakın, ürün kategorilerine göre otomatik arka plan oluşturulacak..." 
              : "Örn: lüks oturma odası, modern dekorasyon, yumuşak ışık"}
            value={backgroundPrompt}
            onChange={(e) => setBackgroundPrompt(e.target.value)}
            className="min-h-[100px]"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {productCategories 
              ? "✨ Kategorilere göre otomatik prompt oluşturulacak (istersen değiştirebilirsin)" 
              : "Boş bırakırsanız varsayılan bir arka plan oluşturulur"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !uploadedImageUrl}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Oluşturuluyor...
              </>
            ) : generatedImage ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yeniden Oluştur
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Arka Plan Oluştur
              </>
            )}
          </Button>
          {generatedImage && (
            <Button 
              onClick={handleDownload}
              variant="outline"
              size="icon"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Bilgi kutusu */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">AI Destekli Arka Plan</p>
            <p className="text-muted-foreground text-xs">
              {productCategories 
                ? "Ürün kategorilerinize göre otomatik arka plan oluşturulur. Gemini 2.5 analizi + nano-banana görsel üretimi (~10-15 saniye)" 
                : "GPT-4o-mini ile prompt iyileştirme ve nano-banana modeli ile hızlı görsel oluşturma (~7-12 saniye)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
