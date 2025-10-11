import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Check, Brain, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface BackgroundPanelProps {
  isOpen: boolean;
  uploadedImage: string | null;
}

interface ProductInfo {
  main_product_type: string;
  subcategory: string;
  target_audience: string;
  price_range: string;
  use_case: string;
  style_design: string;
  season_occasion: string;
  industrial_type: string;
  vibe: string;
}

const backgrounds = [
  { id: 1, name: "Studio White", preview: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)" },
  { id: 2, name: "Minimal Gray", preview: "linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%)" },
  { id: 3, name: "Warm Beige", preview: "linear-gradient(135deg, #f5e6d3 0%, #e8d5c4 100%)" },
  { id: 4, name: "Cool Blue", preview: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" },
  { id: 5, name: "Soft Pink", preview: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)" },
  { id: 6, name: "Nature Green", preview: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)" },
];

export const BackgroundPanel = ({ isOpen, uploadedImage }: BackgroundPanelProps) => {
  const [selectedBg, setSelectedBg] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);

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

  const handleModifyCategories = async () => {
    if (!modificationPrompt.trim()) {
      toast.error("Lütfen bir değişiklik açıklaması girin");
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading("Kategoriler güncelleniyor...");

    try {
      // TODO: API endpoint'ini ekleyin
      // Şimdilik basit bir mock güncelleme yapıyoruz
      toast.success("Kategoriler güncellendi!", { id: loadingToast });
      setModificationPrompt("");
      setShowPromptInput(false);
    } catch (error) {
      console.error("Error modifying categories:", error);
      toast.error(
        error instanceof Error ? error.message : "Kategoriler güncellenemedi",
        { id: loadingToast }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (uploadedImage && !productInfo && !isAnalyzing && isOpen) {
      analyzeProduct();
    }
  }, [uploadedImage, isOpen]);

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedBg) return;

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating AI background...");

    try {
      const selectedBackground = backgrounds.find(bg => bg.id === selectedBg);
      if (!selectedBackground) throw new Error("Background not found");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-background`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            imageUrl: uploadedImage,
            backgroundStyle: selectedBackground.name,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate background");
      }

      const data = await response.json();
      
      setGeneratedImages(prev => ({
        ...prev,
        [selectedBg]: data.imageUrl,
      }));

      toast.success("Background generated successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error generating background:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate background",
        { id: loadingToast }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      {/* Product Analysis Section */}
      <div className="bg-card rounded-2xl p-8 shadow-soft border border-border animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Ürün Analizi</h2>
            <p className="text-sm text-muted-foreground">AI destekli ürün kategorileri</p>
          </div>
          {productInfo && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPromptInput(!showPromptInput)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
          )}
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Ürününüz analiz ediliyor...</p>
            </div>
          </div>
        ) : productInfo ? (
          <>
            <div className="bg-muted/50 rounded-lg p-4 mb-4 font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`{
  "main_product_type": "${productInfo.main_product_type}",
  "subcategory": "${productInfo.subcategory}",
  "target_audience": "${productInfo.target_audience}",
  "price_range": "${productInfo.price_range}",
  "use_case": "${productInfo.use_case}",
  "style_design": "${productInfo.style_design}",
  "season_occasion": "${productInfo.season_occasion}",
  "industrial_type": "${productInfo.industrial_type}",
  "vibe": "${productInfo.vibe}"
}`}
              </pre>
            </div>

            {showPromptInput && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Kategorileri nasıl değiştirmek istersiniz? (örn: 'Hedef kitleyi 'Kadın' olarak değiştir ve vibe'ı 'Lüks' yap')"
                  value={modificationPrompt}
                  onChange={(e) => setModificationPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleModifyCategories}
                    disabled={!modificationPrompt.trim()}
                    className="flex-1"
                  >
                    Kategorileri Güncelle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPromptInput(false);
                      setModificationPrompt("");
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Button 
              onClick={analyzeProduct}
              disabled={isAnalyzing || !uploadedImage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Brain className="w-4 h-4 mr-2" />
              Ürünü Analiz Et
            </Button>
          </div>
        )}
      </div>

      {/* AI Backgrounds Section */}
      <div className="bg-card rounded-2xl p-8 shadow-soft border border-border animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Arka Planlar</h2>
            <p className="text-sm text-muted-foreground">Harika arka planlar seçin ve oluşturun</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBg(bg.id)}
              className={`relative rounded-xl p-4 h-32 transition-all duration-300 hover:scale-105 ${
                selectedBg === bg.id 
                  ? "ring-2 ring-primary shadow-glow" 
                  : "hover:shadow-medium"
              }`}
              style={{ background: bg.preview }}
            >
              {selectedBg === bg.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-xs font-medium bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
                  {bg.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-6">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !uploadedImage || !selectedBg}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? "Oluşturuluyor..." : "Oluştur"}
          </Button>
        </div>

        {uploadedImage && selectedBg && generatedImages[selectedBg] && (
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <p className="text-sm font-medium mb-2">AI Oluşturulan Sonuç</p>
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={generatedImages[selectedBg]} 
                alt="AI generated product" 
                className="w-full h-64 object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
