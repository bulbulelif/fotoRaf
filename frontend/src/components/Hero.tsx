import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import fotoRafLogo from "@/assets/fotoraf-logo.png";

export const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10 animate-pulse-glow" />
      
      <div className="container max-w-6xl relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Powered by AI</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <img 
              src={fotoRafLogo} 
              alt="fotoRaf logo" 
              className="h-48 md:h-64 w-auto"
            />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Product Photos That Sell
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform ordinary product shots into studio-quality images with AI-powered backgrounds and instant marketing copy. Built for e-commerce sellers who refuse to compromise on quality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="group bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
              onClick={onGetStarted}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>
          
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Studio quality in seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>No design skills needed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
