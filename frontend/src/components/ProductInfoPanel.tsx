import { useState, useEffect } from "react";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductInfo {
  mainProductType: string;
  subcategory: string;
  targetAudience: string;
  priceRange: string;
  useCase: string;
  styleDesign: string;
  seasonOccasion: string;
  industrialType: string;
  vibe: string;
}

interface ProductInfoPanelProps {
  uploadedImage: string | null;
  isVisible: boolean;
}

export const ProductInfoPanel = ({ uploadedImage, isVisible }: ProductInfoPanelProps) => {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeProduct = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    const loadingToast = toast.loading("Ürün analiz ediliyor...");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            imageUrl: uploadedImage,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ürün analizi başarısız");
      }

      const analysisData = await response.json();
      setProductInfo(analysisData);
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

  useEffect(() => {
    if (uploadedImage && !productInfo && !isAnalyzing) {
      analyzeProduct();
    }
  }, [uploadedImage]);

  if (!isVisible || !uploadedImage) return null;

  const infoFields = [
    { key: "mainProductType", label: "Ana Ürün Tipi" },
    { key: "subcategory", label: "Alt Kategori" },
    { key: "targetAudience", label: "Hedef Kitle" },
    { key: "priceRange", label: "Fiyat Aralığı" },
    { key: "useCase", label: "Kullanım Alanı" },
    { key: "styleDesign", label: "Stil & Tasarım" },
    { key: "seasonOccasion", label: "Sezon/Özel Gün" },
    { key: "industrialType", label: "Endüstri Tipi" },
    { key: "vibe", label: "Atmosfer" },
  ] as const;

  return (
    <div className="bg-card rounded-2xl p-8 shadow-soft border border-border animate-scale-in mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ürün Analizi</h2>
          <p className="text-sm text-muted-foreground">Yapay zeka destekli ürün içgörüleri</p>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Ürününüz analiz ediliyor...</p>
          </div>
        </div>
      ) : productInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {field.label}
              </label>
              <div className="p-3 bg-muted rounded-lg border border-border">
                <span className="text-sm">
                  {productInfo[field.key] || "Tespit edilemedi"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Button 
            onClick={analyzeProduct}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Brain className="w-4 h-4 mr-2" />
            Ürünü Analiz Et
          </Button>
        </div>
      )}
    </div>
  );
};
