import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Ayşe Yılmaz",
    role: "Trendyol Mağaza Sahibi",
    initials: "AY",
    rating: 5,
    text: "fotoRaf ürün listelerimi bir gecede dönüştürdü. İlk ayda satışlar %40 arttı. Yapay zeka arka planları inanılmaz görünüyor.",
    metric: "+%40 satış"
  },
  {
    name: "Mehmet Demir",
    role: "Amazon Satıcısı",
    initials: "MD",
    rating: 5,
    text: "Ürün fotoğrafçılığına ayda 15.000 TL harcıyordum. Şimdi kendim dakikalar içinde daha iyi sonuçlar alıyorum. Bu araç maliyetini anında geri çıkardı.",
    metric: "Yılda 180K TL tasarruf"
  },
  {
    name: "Elif Kaya",
    role: "E-ticaret Girişimcisi",
    initials: "EK",
    rating: 5,
    text: "Pazarlama metni oluşturucu dahiyane. Marka sesimi mükemmel anlıyor ve gerçekten dönüşüm sağlayan açıklamalar yazıyor.",
    metric: "3 kat daha hızlı iş akışı"
  }
];

const stats = [
  { value: "50K+", label: "Oluşturulan Fotoğraf" },
  { value: "2,500+", label: "Aktif Satıcı" },
  { value: "4.9/5", label: "Ortalama Puan" },
  { value: "%98", label: "Tavsiye Eder" }
];

export const SocialProof = () => {
  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="container max-w-6xl">
        {/* Stats banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 animate-fade-in">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="text-center"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials header */}
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            E-Ticaret Satıcılarının
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Favorisi
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ürün fotoğrafçılığını dönüştüren satıcılardan gerçek hikayeler
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card 
              key={idx}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 animate-fade-in"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12 border-2 border-secondary/20">
                  <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              <Quote className="w-8 h-8 text-muted/20 mb-2" />
              <p className="text-muted-foreground leading-relaxed mb-4">
                {testimonial.text}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
                <span className="text-sm font-medium text-secondary">{testimonial.metric}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
