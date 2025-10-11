import { Button } from "@/components/ui/button";
import { Download, Share2, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ExportPanelProps {
  isOpen: boolean;
}

const exportOptions = [
  {
    id: "social",
    icon: Share2,
    title: "Sosyal Medya Kiti",
    description: "Instagram, Facebook, Pinterest için optimize edilmiş",
    formats: "JPG, PNG (1080x1080, 1200x628)"
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    title: "E-ticaret Paketi",
    description: "Trendyol, Amazon, Shopify için ürün görselleri",
    formats: "Beyaz arka planlı yüksek çözünürlüklü PNG"
  },
  {
    id: "custom",
    icon: ImageIcon,
    title: "Özel Dışa Aktarım",
    description: "Kendi boyut ve formatınızı seçin",
    formats: "Her boyut, JPG/PNG/WEBP"
  }
];

export const ExportPanel = ({ isOpen }: ExportPanelProps) => {
  const handleExport = (optionId: string) => {
    toast.success(`${optionId} kiti dışa aktarılıyor...`);
    // Simulate download
    setTimeout(() => {
      toast.success("İndirme tamamlandı!");
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-card rounded-2xl p-8 shadow-soft border border-border animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Dışa Aktar & Paylaş</h2>
          <p className="text-sm text-muted-foreground">İyileştirilmiş fotoğraflarınızı indirin</p>
        </div>
      </div>

      <div className="space-y-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="group p-6 bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border hover:border-primary/50 hover:shadow-medium transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                  <p className="text-xs text-muted-foreground/70 mb-4">{option.formats}</p>
                  <Button 
                    onClick={() => handleExport(option.id)}
                    className="bg-gradient-primary w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-6 bg-gradient-secondary rounded-xl text-secondary-foreground">
        <div className="flex items-start gap-3">
          <ShoppingCart className="w-5 h-5 shrink-0 mt-1" />
          <div>
            <p className="font-bold mb-1">Mağazanıza eklemeye hazır mısınız?</p>
            <p className="text-sm opacity-90 mb-4">
              E-ticaret platformunuzu bağlayın ve doğrudan ürün kataloğunuza yayınlayın.
            </p>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-secondary-foreground border-white/30">
              Mağazayı Bağla
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
