import { Wand2, Sparkles, FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Wand2,
    title: "Yapay Zeka ile Arka Plan Oluşturma",
    description: "Mükemmel sahnenizi tanımlayın veya sadece görselinizi yükleyin, gerisini bize bırakın.",
    color: "text-secondary"
  },
  {
    icon: Sparkles,
    title: "Akıllı Nesne Temizleme",
    description: "Arka planları, gölgeleri ve dikkat dağıtıcı unsurları otomatik olarak kaldırın. Anında temiz, profesyonel ürün çekimleri elde edin.",
    color: "text-primary"
  },
  {
    icon: FileText,
    title: "Pazarlama Metni Oluşturucu",
    description: "Marka sesinize ve hedef kitlenize özel etkileyici ürün açıklamaları, başlıklar ve reklam metinleri oluşturun.",
    color: "text-secondary"
  },
  {
    icon: Download,
    title: "Her Platform İçin Dışa Aktar",
    description: "Trendyol, Amazon, Shopify, Instagram veya baskı için optimize edilmiş görselleri indirin.",
    color: "text-primary"
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-6 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 mt-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Özellikler</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Online Dünyada Öne Çıkmak İçin
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              İhtiyacınız Olan Her Şey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            E-ticaret satıcıları için özel olarak tasarlanmış profesyonel fotoğraf düzenleme ve pazarlama araçları
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx}
              className="p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
