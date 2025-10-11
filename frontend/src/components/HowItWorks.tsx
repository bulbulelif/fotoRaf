import { Upload, Wand2, Sparkles, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Ürününüzü Yükleyin",
    description: "Ürün fotoğrafınızı sürükleyip bırakın. Her görsel kalitesi ve arka planla çalışır."
  },
  {
    icon: Wand2,
    number: "02",
    title: "Stilinizi Seçin",
    description: "Mükemmel sahnenizi tanımlayın veya gerisini bize bırakın."
  },
  {
    icon: Sparkles,
    number: "03",
    title: "İçerik Oluşturun",
    description: "fotoRaf'ın dönüşüm sağlayan etkileyici ürün açıklamaları ve pazarlama içerikleri oluşturmasına izin verin."
  },
  {
    icon: Download,
    number: "04",
    title: "İndirin ve Yayınlayın",
    description: "Her platform için optimize edilmiş stüdyo kalitesinde görseller edinin. Dakikalar içinde satışa başlayın."
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-transparent opacity-50" />
      
      <div className="container max-w-6xl relative z-10">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Basit Süreç</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Yüklemeden Yayınlamaya
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Dakikalar İçinde
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Karmaşık yazılım yok. Tasarım becerisi gerekmiyor. Sadece muhteşem sonuçlar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="relative animate-fade-in"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-secondary/50 to-transparent" />
              )}
              
              <div className="relative">
                <div className="mb-4 relative">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <step.icon className="w-8 h-8 text-secondary" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-2 -right-2 text-6xl font-bold text-muted/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
