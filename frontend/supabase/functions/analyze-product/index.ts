import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing imageUrl" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const analysisPrompt = `Analyze this product image and provide detailed information in the following JSON format:
{
  "mainProductType": "Main category of the product",
  "subcategory": "Specific subcategory within the main type",
  "targetAudience": "Primary target demographic",
  "priceRange": "Estimated price range (e.g., $10-50, $100-200)",
  "useCase": "Primary use case or application",
  "styleDesign": "Design style and aesthetic",
  "seasonOccasion": "Seasonal relevance or occasion",
  "industrialType": "Industry or sector classification",
  "vibe": "Overall mood or feeling of the product"
}

Please analyze the product carefully and provide accurate, specific information for each field.`;

    console.log("Analyzing product with prompt:", analysisPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis generated");
    }

    // Try to parse JSON from the response
    let productInfo;
    try {
      // Extract JSON from the response text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisText);
      // Fallback to mock data if parsing fails
      productInfo = {
        mainProductType: "Product",
        subcategory: "General",
        targetAudience: "General audience",
        priceRange: "Not specified",
        useCase: "General use",
        styleDesign: "Not specified",
        seasonOccasion: "All-season",
        industrialType: "General",
        vibe: "Not specified"
      };
    }

    return new Response(
      JSON.stringify(productInfo),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-product:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
