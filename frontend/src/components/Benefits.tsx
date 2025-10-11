import { Clock, TrendingUp, Palette, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Clock,
    title: "Save 10+ Hours Per Week",
    description: "Stop wrestling with Photoshop. What used to take hours now takes seconds.",
    stat: "95%",
    statLabel: "faster than manual editing"
  },
  {
    icon: TrendingUp,
    title: "Boost Conversions",
    description: "Professional imagery increases click-through rates and customer trust dramatically.",
    stat: "3.5x",
    statLabel: "higher engagement"
  },
  {
    icon: Palette,
    title: "Unlimited Creativity",
    description: "Test unlimited variations and styles. Find what resonates with your audience.",
    stat: "∞",
    statLabel: "design possibilities"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your images and data are encrypted and protected. GDPR compliant infrastructure.",
    stat: "100%",
    statLabel: "data privacy"
  }
];

export const Benefits = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-6xl">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Why E-Commerce Sellers
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Choose fotoRaf
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of sellers who've transformed their product photography workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, idx) => (
            <Card 
              key={idx}
              className="relative p-8 overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <benefit.icon className="w-7 h-7 text-secondary" strokeWidth={1.5} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {benefit.stat}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      {benefit.statLabel}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
