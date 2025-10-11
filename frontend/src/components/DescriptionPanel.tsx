import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Copy, RefreshCw, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateMarketingKit } from "@/services/api";

interface DescriptionPanelProps {
  isOpen: boolean;
}

export const DescriptionPanel = ({ isOpen }: DescriptionPanelProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [productTitle, setProductTitle] = useState("");
  const [productFeatures, setProductFeatures] = useState("");
  const [industry, setIndustry] = useState("");
  
  // Results state
  const [marketingKit, setMarketingKit] = useState<{
    tagline: string;
    bullets: string[];
    hashtags: string[];
    captions: { ig: string; tt: string };
    altText: string;
  } | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Panoya kopyalandı!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    if (!productTitle.trim()) {
      toast.error("Lütfen ürün başlığı girin");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Pazarlama içerikleri oluşturuluyor...");

    try {
      const features = productFeatures
        .split("\n")
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const result = await generateMarketingKit({
        title: productTitle,
        features: features.length > 0 ? features : undefined,
        industry: industry.trim() || undefined,
        tone: 'concise',
        language: 'tr',
      });

      setMarketingKit(result.kit);
      toast.success("Pazarlama içerikleri başarıyla oluşturuldu!", { id: loadingToast });
    } catch (error) {
      console.error("Error generating marketing kit:", error);
      toast.error(
        error instanceof Error ? error.message : "İçerik oluşturma başarısız",
        { id: loadingToast }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-card rounded-2xl p-8 shadow-soft border border-border animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Pazarlama Kiti</h2>
            <p className="text-sm text-muted-foreground">AI ile ürün içerikleri oluştur</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {!marketingKit && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Ürün Başlığı *
            </label>
            <Input
              placeholder="Örn: Ergonomik Seramik Kupa 300ml"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Ürün Özellikleri (her satıra bir özellik)
            </label>
            <Textarea
              placeholder="ergonomik sap&#10;bulaşık makinesinde yıkanabilir&#10;ısıyı iyi muhafaza eder"
              value={productFeatures}
              onChange={(e) => setProductFeatures(e.target.value)}
              className="min-h-[100px]"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Endüstri (opsiyonel)
            </label>
            <Input
              placeholder="Örn: housewares, electronics, fashion"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !productTitle.trim()}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Pazarlama Kiti Oluştur
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {marketingKit && (
        <div className="space-y-4">
          {/* Tagline */}
          <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-sm">Slogan</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCopy(marketingKit.tagline, 'tagline')}
                className="shrink-0 h-8 w-8"
              >
                {copied === 'tagline' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{marketingKit.tagline}</p>
          </div>

          {/* Bullets */}
          <div className="p-4 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-sm">Özellikler</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCopy(marketingKit.bullets.join('\n'), 'bullets')}
                className="shrink-0 h-8 w-8"
              >
                {copied === 'bullets' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <ul className="text-sm space-y-2">
              {marketingKit.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hashtags */}
          <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border border-secondary/20">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-sm">Hashtagler</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCopy(marketingKit.hashtags.join(' '), 'hashtags')}
                className="shrink-0 h-8 w-8"
              >
                {copied === 'hashtags' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm">{marketingKit.hashtags.join(' ')}</p>
          </div>

          {/* Instagram Caption */}
          <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-sm">Instagram</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCopy(marketingKit.captions.ig, 'ig')}
                className="shrink-0 h-8 w-8"
              >
                {copied === 'ig' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{marketingKit.captions.ig}</p>
          </div>

          {/* TikTok Caption */}
          <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-sm">TikTok</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCopy(marketingKit.captions.tt, 'tt')}
                className="shrink-0 h-8 w-8"
              >
                {copied === 'tt' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{marketingKit.captions.tt}</p>
          </div>

          {/* Alt Text */}
          <div className="p-4 bg-gradient-to-br from-muted to-muted/50 rounded-xl border border-border">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-sm">Alt Text (Erişilebilirlik)</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCopy(marketingKit.altText, 'alt')}
                className="shrink-0 h-8 w-8"
              >
                {copied === 'alt' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{marketingKit.altText}</p>
          </div>

          {/* Regenerate Button */}
          <Button 
            onClick={() => setMarketingKit(null)}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yeni İçerik Oluştur
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium mb-1">Tek Tıkla Pazarlama Kiti</p>
            <p className="text-muted-foreground text-xs">
              GPT-4o-mini ile slogan, özellikler, hashtagler, sosyal medya içerikleri ve erişilebilirlik metni oluşturulur (~2-5 saniye)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
