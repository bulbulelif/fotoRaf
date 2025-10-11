import { useState } from "react";
import { Hero } from "@/components/Hero";
import fotoRafLogo from "@/assets/fotoraf-logo.png";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { SocialProof } from "@/components/SocialProof";
import { FinalCTA } from "@/components/FinalCTA";
import { UploadPanel } from "@/components/UploadPanel";
import { BackgroundPanel } from "@/components/BackgroundPanel";
import { DescriptionPanel } from "@/components/DescriptionPanel";
import { ExportPanel } from "@/components/ExportPanel";
import CircularGallery from "@/components/CircularGallery";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles } from "lucide-react";
import { uploadFile } from "@/services/api";
import { toast } from "sonner";

type Step = "hero" | "upload" | "background" | "description" | "export";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [usedPrompt, setUsedPrompt] = useState<string>("");

  const handleUpload = async (file: File) => {
    setUploadedFile(file);
    
    // Önizleme için local olarak oku
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Backend'e yükle
    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      setUploadedUrl(result.url);
      toast.success("Görsel başarıyla yüklendi!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Görsel yükleme başarısız"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const steps: Step[] = ["upload", "background", "description", "export"];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    } else {
      setCurrentStep("hero");
    }
  };

  if (currentStep === "hero") {
    return (
      <div className="min-h-screen">
        <Hero onGetStarted={() => setCurrentStep("upload")} />
        <section className="py-24 px-6">
          <div className="container max-w-6xl">
            <div className="text-center space-y-4 mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Galeri</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                İşimizi
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Eylemde Görün
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Yapay zeka destekli fotoğraf dönüşümünün büyüsünü deneyimleyin
              </p>
            </div>
            <div className="h-[600px] w-full">
              <CircularGallery />
            </div>
          </div>
        </section>
        <Features />
        <HowItWorks />
        <FinalCTA onGetStarted={() => setCurrentStep("upload")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-primary/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img 
                  src={fotoRafLogo} 
                  alt="fotoRaf" 
                  className="h-14 w-auto"
                />
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx <= currentStepIndex 
                      ? "w-8 bg-gradient-primary" 
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left panel - Always shows upload state */}
          <div className="lg:col-span-1">
            <UploadPanel 
              onUpload={handleUpload} 
              isOpen={true}
            />
          </div>

          {/* Middle panel - Context dependent */}
          <div className="lg:col-span-1">
            <BackgroundPanel 
              isOpen={currentStep === "background"} 
              uploadedImage={uploadedPreview}
              uploadedImageUrl={uploadedUrl || undefined}
              onGenerated={(imageUrl, prompt) => {
                setGeneratedImage(imageUrl);
                setUsedPrompt(prompt);
              }}
            />
            <DescriptionPanel 
              isOpen={currentStep === "description"}
              generatedImage={generatedImage}
              usedPrompt={usedPrompt}
            />
          </div>

          {/* Right panel - Export */}
          <div className="lg:col-span-1">
            <ExportPanel isOpen={currentStep === "export"} />
          </div>
        </div>

        {/* Navigation buttons */}
        {currentStep !== "export" && (
          <div className="flex justify-center mt-8">
            <Button 
              size="lg"
              onClick={handleNext}
              disabled={(!uploadedFile && currentStep === "upload") || isUploading}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8"
            >
              {isUploading ? "Yükleniyor..." : `${steps[currentStepIndex + 1] === 'background' ? 'Arka Plan' : steps[currentStepIndex + 1] === 'description' ? 'Açıklama' : 'Dışa Aktarım'} Adımına Devam Et`}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
