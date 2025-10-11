import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const FinalCTA = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5 animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-4xl relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Bugün Ücretsiz Başlayın</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Ürün Fotoğraflarınızı Dönüştürmeye
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Hazır mısınız?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Saniyeler içinde stüdyo kalitesinde görseller oluşturan binlerce e-ticaret satıcısına katılın. 
            Başlamak için kredi kartı gerekmez.
          </p>

          <div className="flex justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="group bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
              onClick={onGetStarted}
            >
              Ücretsiz Oluşturmaya Başla
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>Sonsuza kadar ücretsiz plan mevcut</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>İstediğiniz zaman yükseltin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>İstediğiniz zaman iptal edin</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
