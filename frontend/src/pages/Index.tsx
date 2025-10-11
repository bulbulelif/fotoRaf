import { useState } from "react";
import { Hero } from "@/components/Hero";
import fotoRafLogo from "@/assets/fotoraf-logo.png";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Benefits } from "@/components/Benefits";
import { SocialProof } from "@/components/SocialProof";
import { FinalCTA } from "@/components/FinalCTA";
import { UploadPanel } from "@/components/UploadPanel";
import { BackgroundPanel } from "@/components/BackgroundPanel";
import { DescriptionPanel } from "@/components/DescriptionPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles } from "lucide-react";

type Step = "hero" | "upload" | "background" | "description" | "export";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const handleUpload = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
        <Features />
        <HowItWorks />
        <Benefits />
        <SocialProof />
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
            />
            <DescriptionPanel isOpen={currentStep === "description"} />
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
              disabled={!uploadedFile && currentStep === "upload"}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8"
            >
              Continue to {steps[currentStepIndex + 1]}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
