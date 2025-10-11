import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Shopify Store Owner",
    initials: "SC",
    rating: 5,
    text: "fotoRaf transformed my product listings overnight. Sales increased 40% in the first month. The AI backgrounds look incredible.",
    metric: "+40% sales"
  },
  {
    name: "Marcus Rodriguez",
    role: "Amazon Seller",
    initials: "MR",
    rating: 5,
    text: "I was spending $500/month on product photography. Now I do it myself in minutes with better results. This tool paid for itself instantly.",
    metric: "$6K saved/year"
  },
  {
    name: "Emily Parker",
    role: "Etsy Entrepreneur",
    initials: "EP",
    rating: 5,
    text: "The marketing copy generator is genius. It understands my brand voice perfectly and writes descriptions that actually convert.",
    metric: "3x faster workflow"
  }
];

const stats = [
  { value: "50K+", label: "Photos Generated" },
  { value: "2,500+", label: "Active Sellers" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "98%", label: "Would Recommend" }
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
            Loved by E-Commerce
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Sellers Worldwide
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from sellers who transformed their product photography
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
