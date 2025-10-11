import { Wand2, Sparkles, FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Wand2,
    title: "AI Background Generation",
    description: "Describe your perfect scene or just upload your image and let us handle it.",
    color: "text-secondary"
  },
  {
    icon: Sparkles,
    title: "Smart Object Removal",
    description: "Automatically remove backgrounds, shadows, and distractions. Get clean, professional product shots instantly.",
    color: "text-primary"
  },
  {
    icon: FileText,
    title: "Marketing Copy Generator",
    description: "Generate compelling product descriptions, titles, and ad copy tailored to your brand voice and audience.",
    color: "text-secondary"
  },
  {
    icon: Download,
    title: "Export for Any Platform",
    description: "Download optimized images for Trendyol,Amazon, Shopify, Instagram, or print.",
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
            <span className="text-sm font-medium text-secondary">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Everything You Need to
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Stand Out Online
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional photo editing and marketing tools designed specifically for e-commerce sellers
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
