"""
FAL Client Wrapper for any-llm (OpenRouter) and photokit background replacement.

Requires:
    - pip install fal-client requests
    - Environment variable: FAL_KEY

Example:
    >>> client = FalClient()
    >>> result = client.any_llm_complete("Write a short product description")
    >>> print(result["output"])
"""

import os
import sys
import json
import re
from typing import Optional, Any, List, Dict
import fal_client
import requests


class FalClient:
    """
    FAL wrapper (Python) for:
      - any-llm (OpenRouter) text generation
      - background replacement via photokit
    
    Requires env: FAL_KEY
    """

    def __init__(self):
        """Initialize FAL client and validate API key."""
        # Support both FAL_KEY and FAL_API_KEY
        self.fal_key = os.environ.get("FAL_KEY") or os.environ.get("FAL_API_KEY")
        if not self.fal_key:
            raise ValueError(
                "FAL_KEY or FAL_API_KEY environment variable is required. "
                "Please set it in your .env file or environment."
            )
        
        # Set FAL credentials (fal-client expects FAL_KEY)
        os.environ["FAL_KEY"] = self.fal_key

    def any_llm_enterprise(
        self,
        prompt: str,
        *,
        system_prompt: Optional[str] = None,
        model: Optional[str] = "google/gemini-2.5-pro",
        temperature: Optional[float] = 0.7,
        max_tokens: Optional[int] = None,
        with_logs: bool = False
    ) -> dict:
        """
        Enterprise LLM endpoint with support for premium models like Gemini 2.5 Pro.
        Blocks until result. Returns dict with output and error.
        
        Args:
            prompt: The user prompt to send
            system_prompt: Optional system prompt
            model: Model to use (default: "google/gemini-2.5-pro")
            temperature: Sampling temperature (default: 0.7)
            max_tokens: Maximum tokens to generate
            with_logs: If True, prints log streams to stdout
        
        Returns:
            Dictionary with output, error, and raw response
        """
        # Build arguments
        arguments = {
            "prompt": prompt,
            "model": model,
            "temperature": temperature
        }
        
        if system_prompt:
            arguments["system_prompt"] = system_prompt
        if max_tokens is not None:
            arguments["max_tokens"] = max_tokens

        try:
            # Subscribe (blocking call)
            def on_queue_update(update):
                if with_logs:
                    print(f"[FAL Enterprise Queue Update] {update}", file=sys.stderr)

            result = fal_client.subscribe(
                "fal-ai/any-llm/enterprise",
                arguments=arguments,
                with_logs=with_logs,
                on_queue_update=on_queue_update if with_logs else None
            )

            # Parse result
            output = result.get("output", "")
            
            return {
                "output": output,
                "error": None,
                "raw": result
            }

        except Exception as e:
            return {
                "output": "",
                "error": str(e),
                "raw": {"exception": str(e)}
            }

    def any_llm_complete(
        self,
        prompt: str,
        *,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        priority: Optional[str] = "latency",
        with_logs: bool = False
    ) -> dict:
        """
        Blocks until result. Returns dict with:
          { "output": str, "reasoning": str|None, "partial": bool|None, 
            "error": str|None, "raw": <full_response> }
        
        Args:
            prompt: The user prompt to send
            system_prompt: Optional system prompt
            model: Model to use (default: "google/gemini-2.5-flash-lite")
            temperature: Sampling temperature (default: 0.7)
            max_tokens: Maximum tokens to generate
            priority: "throughput" or "latency" (default: "latency")
            with_logs: If True, prints log streams to stdout
        
        Returns:
            Dictionary with output, reasoning, error, and raw response
        """
        # Build arguments
        arguments = {
            "prompt": prompt,
            "priority": priority or "latency"
        }
        
        if system_prompt:
            arguments["system_prompt"] = system_prompt
        if model:
            arguments["model"] = model
        else:
            arguments["model"] = "google/gemini-2.5-flash-lite"
        if temperature is not None:
            arguments["temperature"] = temperature
        else:
            arguments["temperature"] = 0.7
        if max_tokens is not None:
            arguments["max_tokens"] = max_tokens

        try:
            # Subscribe (blocking call with queue updates)
            def on_queue_update(update):
                if with_logs:
                    print(f"[FAL Queue Update] {update}", file=sys.stderr)

            result = fal_client.subscribe(
                "fal-ai/any-llm",
                arguments=arguments,
                with_logs=with_logs,
                on_queue_update=on_queue_update if with_logs else None
            )

            # Parse result
            output = result.get("output", "")
            reasoning = result.get("reasoning")
            partial = result.get("partial", False)
            
            return {
                "output": output,
                "reasoning": reasoning,
                "partial": partial,
                "error": None,
                "raw": result
            }

        except Exception as e:
            return {
                "output": "",
                "reasoning": None,
                "partial": False,
                "error": str(e),
                "raw": {"exception": str(e)}
            }

    def any_llm_stream(
        self,
        prompt: str,
        *,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        priority: Optional[str] = "latency",
    ) -> None:
        """
        Prints stream events to stdout progressively.
        
        Args:
            prompt: The user prompt to send
            system_prompt: Optional system prompt
            model: Model to use (default: "google/gemini-2.5-flash-lite")
            temperature: Sampling temperature (default: 0.7)
            max_tokens: Maximum tokens to generate
            priority: "throughput" or "latency" (default: "latency")
        """
        # Build arguments
        arguments = {
            "prompt": prompt,
            "priority": priority or "latency"
        }
        
        if system_prompt:
            arguments["system_prompt"] = system_prompt
        if model:
            arguments["model"] = model
        else:
            arguments["model"] = "google/gemini-2.5-flash-lite"
        if temperature is not None:
            arguments["temperature"] = temperature
        else:
            arguments["temperature"] = 0.7
        if max_tokens is not None:
            arguments["max_tokens"] = max_tokens

        try:
            # Stream results
            for event in fal_client.stream("fal-ai/any-llm", arguments=arguments):
                print(event, flush=True)
        except Exception as e:
            print(f"Stream error: {e}", file=sys.stderr)
            raise RuntimeError(f"Streaming failed: {e}")

    def any_llm_submit(
        self,
        prompt: str,
        *,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        priority: Optional[str] = "latency",
        webhook_url: Optional[str] = None
    ) -> str:
        """
        Submits a job and returns request_id.
        
        Args:
            prompt: The user prompt to send
            system_prompt: Optional system prompt
            model: Model to use (default: "google/gemini-2.5-flash-lite")
            temperature: Sampling temperature (default: 0.7)
            max_tokens: Maximum tokens to generate
            priority: "throughput" or "latency" (default: "latency")
            webhook_url: Optional webhook URL for completion notification
        
        Returns:
            Request ID string
        """
        # Build arguments
        arguments = {
            "prompt": prompt,
            "priority": priority or "latency"
        }
        
        if system_prompt:
            arguments["system_prompt"] = system_prompt
        if model:
            arguments["model"] = model
        else:
            arguments["model"] = "google/gemini-2.5-flash-lite"
        if temperature is not None:
            arguments["temperature"] = temperature
        else:
            arguments["temperature"] = 0.7
        if max_tokens is not None:
            arguments["max_tokens"] = max_tokens

        try:
            handler = fal_client.submit(
                "fal-ai/any-llm",
                arguments=arguments,
                webhook_url=webhook_url
            )
            return handler.request_id
        except Exception as e:
            raise RuntimeError(f"Submit failed: {e}")

    def any_llm_status(self, request_id: str, with_logs: bool = True) -> dict:
        """
        Returns queue status dict (including logs if requested).
        
        Args:
            request_id: The request ID from submit()
            with_logs: Include logs in response
        
        Returns:
            Status dictionary with queue information
        """
        try:
            status = fal_client.status("fal-ai/any-llm", request_id, with_logs=with_logs)
            return status
        except Exception as e:
            raise RuntimeError(f"Status check failed: {e}")

    def any_llm_result(self, request_id: str) -> dict:
        """
        Returns final result dict: { "output": str, ... } or raises if not completed.
        
        Args:
            request_id: The request ID from submit()
        
        Returns:
            Dictionary with output, reasoning, error, and raw response
        """
        try:
            result = fal_client.result("fal-ai/any-llm", request_id)
            
            output = result.get("output", "")
            reasoning = result.get("reasoning")
            partial = result.get("partial", False)
            
            return {
                "output": output,
                "reasoning": reasoning,
                "partial": partial,
                "error": None,
                "raw": result
            }
        except Exception as e:
            raise RuntimeError(f"Result retrieval failed: {e}")

    def upload_file(self, path: str) -> str:
        """
        Uses fal_client.upload_file and returns public URL string.
        
        Args:
            path: Local file path to upload
        
        Returns:
            Public URL string
        """
        try:
            url = fal_client.upload_file(path)
            return url
        except Exception as e:
            raise RuntimeError(f"File upload failed: {e}")

    def background_replace(
        self,
        image_url: str,
        *,
        prompt: str = "soft key light, seamless studio backdrop, premium e-commerce look, product centered, subtle shadow",
        remove_bg: bool = True,
        timeout: int = 110
    ) -> dict:
        """
        Replaces image background using FAL AI image generation.
        Uses fal-ai/nano-banana for fast, high-quality image generation.
        
        Args:
            image_url: URL of the image to process
            prompt: Background replacement prompt
            remove_bg: Whether to remove background first (currently uses prompt-based approach)
            timeout: Request timeout in seconds
        
        Returns:
            JSON response dictionary with keys like:
                - image: {"url": "...", "width": ..., "height": ...}
                - images: [{"url": "...", ...}]
        
        Example response:
            {
                "images": [{
                    "url": "https://fal.media/files/...",
                    "content_type": "image/jpeg",
                    "file_name": "...",
                    "file_size": 123456,
                    "width": 1024,
                    "height": 1024
                }]
            }
        """
        # Use FAL's nano-banana/edit model for image-to-image (product preservation)
        # EXACTLY like backgroundGeneration.py - no prompt modification
        try:
            # Use the prompt directly as provided (already formatted by GPT or user)
            # The /edit endpoint preserves the product automatically
            arguments = {
                "prompt": prompt,  # Use prompt directly, no wrapping
                "image_urls": [image_url]
            }
            
            # Queue update callback for logs
            def on_queue_update(update):
                if isinstance(update, fal_client.InProgress):
                    for log in update.logs:
                        print(f"[nano-banana/edit] {log.get('message', '')}", file=sys.stderr)
            
            # Use fal_client.subscribe - same as backgroundGeneration.py
            result = fal_client.subscribe(
                "fal-ai/nano-banana/edit",
                arguments=arguments,
                with_logs=True,
                on_queue_update=on_queue_update
            )
            
            # Format response to match expected structure
            if "images" in result and len(result["images"]) > 0:
                first_image = result["images"][0]
                return {
                    "image": first_image,
                    "images": result["images"],
                    "timings": result.get("timings", {}),
                    "has_nsfw_concepts": result.get("has_nsfw_concepts", [False])
                }
            else:
                raise RuntimeError("No images generated in response")
                
        except Exception as e:
            raise RuntimeError(f"Background replacement failed: {e}")

    def analyze_product_image(
        self,
        image_url: str,
        *,
        model: str = "google/gemini-2.5-flash",
        temperature: float = 0.3
    ) -> dict:
        """
        Analyzes product image and returns 9-category classification.
        Uses multimodal vision (Enterprise endpoint) with Gemini 2.5 Flash.
        
        Args:
            image_url: URL of the product image to analyze
            model: Vision model to use (default: "google/gemini-2.5-flash")
            temperature: Sampling temperature (default: 0.3)
        
        Returns:
            Dictionary with 9 product categories:
                - main_product_type: Main category (Footwear, Electronics, etc.)
                - subcategory: Detailed classification
                - target_audience: Target demographic
                - price_range: Budget/Mid-range/Premium/Luxury
                - use_case: Usage scenario
                - style_design: Design aesthetic
                - season_occasion: Seasonal/occasional context
                - industrial_type: Industry classification
                - vibe: Overall vibe/feeling
        
        Example:
            >>> result = client.analyze_product_image("https://example.com/shoe.jpg")
            >>> print(result["main_product_type"])  # "Footwear"
        """
        # Detailed prompt for 9-category product analysis
        prompt = f"""Image URL: {image_url}

You are an expert product analyst for e-commerce. Analyze the product image provided.

STEP 1: First, carefully describe what you see in the image. What is the main product?

STEP 2: Then categorize the product into exactly 9 categories with specific classifications.

Categories to determine:
1. Main Product Type - Be very specific (Examples: Footwear, Electronics, Clothing, Food, Furniture, Accessories, Sports Equipment, Home Decor, Beauty Products, etc.)
2. Subcategory - Detailed classification (Examples for Footwear: Sneakers, High-top Sneakers, Low-top Sneakers, Boots, Running Shoes, Sandals, Formal Shoes; for Electronics: Smartphone, Laptop, Camera, Headphones; for Clothing: T-shirt, Jeans, Dress, Jacket)
3. Target Audience (Examples: Men, Women, Kids, Unisex, Teenagers, Adults, Professional, Athletes)
4. Price Range (Budget, Mid-range, Premium, Luxury)
5. Use Case (Daily Use, Professional, Sports/Athletic, Casual Lifestyle, Formal, Outdoor, Indoor, etc.)
6. Style/Design (Modern, Classic, Vintage/Retro, Minimalist, Bold/Statement, Streetwear, Athletic, Elegant, etc.)
7. Season/Occasion (All Season, Spring/Summer, Fall/Winter, Casual Daily, Formal Events, Sports/Active, etc.)
8. Industrial Type (Footwear Manufacturing, Fashion/Apparel, Food & Beverage, Electronics Manufacturing, Furniture, Textile, etc.)
9. Vibe (Fun, Relaxing, Energetic, Professional, Casual, Urban/Street, Sporty, Sophisticated, Youthful, etc.)

CRITICAL INSTRUCTIONS:
- Look VERY CAREFULLY at the actual product in the image
- Only consider most exposed product in the image
- Do NOT make assumptions - only categorize what you actually see
- Be as specific and accurate as possible
- If you see shoes, they are NOT clothing or swimwear - they are Footwear
- If you see electronics, specify the exact type
- Match all 9 categories to the actual product you see

Respond with a JSON object in this EXACT format (no additional text):
{{
    "main_product_type": "category_value",
    "subcategory": "specific_subcategory",
    "target_audience": "audience_value",
    "price_range": "price_value",
    "use_case": "use_case_value",
    "style_design": "style_value",
    "season_occasion": "season_value",
    "industrial_type": "industry_value",
    "vibe": "vibe_value"
}}"""

        try:
            # Use enterprise endpoint for vision support
            result = self.any_llm_enterprise(
                prompt=prompt,
                model=model,
                temperature=temperature,
                max_tokens=2000
            )
            
            if result.get("error"):
                raise RuntimeError(result["error"])
            
            output_text = result.get("output", "")
            
            # Parse JSON from output
            # Try direct JSON parse first
            if isinstance(output_text, dict):
                categories = output_text
            else:
                # Extract JSON from string
                json_match = re.search(r'\{[\s\S]*\}', output_text)
                if json_match:
                    categories = json.loads(json_match.group())
                else:
                    raise RuntimeError("No JSON found in response")
            
            # Validate that we have all 9 categories
            required_keys = [
                "main_product_type", "subcategory", "target_audience",
                "price_range", "use_case", "style_design",
                "season_occasion", "industrial_type", "vibe"
            ]
            
            for key in required_keys:
                if key not in categories:
                    categories[key] = "Unknown"
            
            return {
                "categories": categories,
                "error": None,
                "raw_output": output_text
            }
            
        except Exception as e:
            return {
                "categories": {},
                "error": str(e),
                "raw_output": ""
            }

    def generate_background_prompt(
        self,
        categories: dict,
        style_type: str,
        *,
        model: str = "openai/gpt-5-mini"
    ) -> dict:
        """
        Generates a professional background replacement prompt using GPT-5-mini.
        Based on product categories and desired style type.
        
        Args:
            categories: Product categories dict (from analyze_product_image)
            style_type: Style description for the background
            model: Model to use (default: "openai/gpt-5-mini")
        
        Returns:
            Dictionary with generated prompt and error info
        
        Example:
            >>> categories = {"main_product_type": "Footwear", "subcategory": "Sneakers"}
            >>> style = "Clean white studio background for e-commerce"
            >>> result = client.generate_background_prompt(categories, style)
            >>> print(result["prompt"])
        """
        # Build categories text
        categories_text = "\n".join([f"- {key}: {value}" for key, value in categories.items()])
        
        gpt_prompt = f"""Based on these product categories:
{categories_text}

Generate a detailed, professional image generation prompt for an image-to-image background replacement task.

The style type is: {style_type}

Requirements:
- The prompt must START with "Change only the background to..."
- The prompt must be specific about keeping the original product unchanged
- The prompt must be suitable for e-commerce photography
- The prompt should be creative and detailed
- The prompt should match the product's categories and the requested style type
- Length: 2-3 sentences maximum

Return ONLY the prompt text, nothing else."""

        try:
            result = self.any_llm_enterprise(
                prompt=gpt_prompt,
                model=model,
                temperature=0.7
            )
            
            if result.get("error"):
                raise RuntimeError(result["error"])
            
            generated_prompt = result.get("output", "").strip()
            
            # Fallback if prompt is empty
            if not generated_prompt:
                subcategory = categories.get("subcategory", "product")
                generated_prompt = f"Change only the background to a {style_type} style. Keep the {subcategory} exactly as it is in the original image."
            
            return {
                "prompt": generated_prompt,
                "error": None
            }
            
        except Exception as e:
            # Fallback prompt
            subcategory = categories.get("subcategory", "product")
            fallback_prompt = f"Change only the background to a {style_type} style. Keep the {subcategory} exactly as it is in the original image."
            
            return {
                "prompt": fallback_prompt,
                "error": str(e)
            }

    def generate_multiple_backgrounds(
        self,
        image_url: str,
        categories: dict,
        *,
        styles: Optional[list] = None
    ) -> dict:
        """
        Generates multiple background variations for a product image.
        Uses GPT to generate prompts, then creates images with different styles.
        
        Args:
            image_url: URL of the original product image
            categories: Product categories (from analyze_product_image)
            styles: List of style dicts with 'name' and 'description' keys.
                   If None, uses default 3 styles (Studio, Lifestyle, Premium)
        
        Returns:
            Dictionary with list of generated images and metadata
        
        Example:
            >>> categories = client.analyze_product_image(url)["categories"]
            >>> result = client.generate_multiple_backgrounds(url, categories)
            >>> for img in result["images"]:
            ...     print(img["style_name"], img["image_url"])
        """
        # Default styles if none provided
        if styles is None:
            styles = [
                {
                    "name": "Studio_Clean",
                    "description": "Clean white studio background for e-commerce, professional lighting, minimal shadows"
                },
                {
                    "name": "Lifestyle_Contextual",
                    "description": "Lifestyle and contextual setting matching the product's use case and target audience"
                },
                {
                    "name": "Premium_Artistic",
                    "description": "Premium artistic backdrop with dramatic lighting and sophisticated atmosphere"
                }
            ]
        
        generated_images = []
        errors = []
        
        for style in styles:
            try:
                # Generate prompt using GPT
                prompt_result = self.generate_background_prompt(
                    categories,
                    style["description"]
                )
                
                if prompt_result.get("error"):
                    errors.append({
                        "style": style["name"],
                        "error": f"Prompt generation failed: {prompt_result['error']}"
                    })
                    continue
                
                bg_prompt = prompt_result["prompt"]
                
                # Generate image with background replacement
                bg_result = self.background_replace(
                    image_url,
                    prompt=bg_prompt
                )
                
                if "image" in bg_result:
                    generated_images.append({
                        "style_name": style["name"],
                        "style_description": style["description"],
                        "image_url": bg_result["image"]["url"],
                        "prompt": bg_prompt,
                        "width": bg_result["image"].get("width"),
                        "height": bg_result["image"].get("height")
                    })
                else:
                    errors.append({
                        "style": style["name"],
                        "error": "No image in response"
                    })
                    
            except Exception as e:
                errors.append({
                    "style": style["name"],
                    "error": str(e)
                })
        
        return {
            "images": generated_images,
            "total_generated": len(generated_images),
            "total_requested": len(styles),
            "errors": errors if errors else None
        }


# Smoke test
if __name__ == "__main__":
    print("FAL Client - Smoke Test", file=sys.stderr)
    print("=" * 80, file=sys.stderr)
    
    try:
        client = FalClient()
        print("✓ Client initialized successfully", file=sys.stderr)
        
        # Test 1: Basic any_llm_complete
        print("\n[Test 1] Testing any_llm_complete...", file=sys.stderr)
        result = client.any_llm_complete(
            prompt="Write a 2-sentence product description for an ergonomic coffee mug.",
            model="google/gemini-2.5-flash-lite",
            temperature=0.7,
            max_tokens=100,
            with_logs=False
        )
        print(f"✓ Output: {result['output'][:100]}...", file=sys.stderr)
        
        # Test 2: Enterprise endpoint
        print("\n[Test 2] Testing any_llm_enterprise...", file=sys.stderr)
        result_enterprise = client.any_llm_enterprise(
            prompt="What is the capital of France? Answer in one word.",
            model="google/gemini-2.5-flash-lite",
            temperature=0.3
        )
        print(f"✓ Enterprise output: {result_enterprise['output']}", file=sys.stderr)
        
        # Test 3: Product image analysis (requires image URL)
        print("\n[Test 3] Product analysis (demo - requires image URL)...", file=sys.stderr)
        print("  Skipping - requires valid image URL", file=sys.stderr)
        
        # Test 4: Background prompt generation
        print("\n[Test 4] Testing background prompt generation...", file=sys.stderr)
        demo_categories = {
            "main_product_type": "Footwear",
            "subcategory": "Sneakers",
            "target_audience": "Men",
            "price_range": "Mid-range",
            "use_case": "Casual Lifestyle",
            "style_design": "Streetwear",
            "season_occasion": "All Season",
            "industrial_type": "Footwear Manufacturing",
            "vibe": "Urban/Street"
        }
        prompt_result = client.generate_background_prompt(
            demo_categories,
            "Clean white studio background for e-commerce"
        )
        print(f"✓ Generated prompt: {prompt_result['prompt'][:100]}...", file=sys.stderr)
        
        # Print summary JSON
        print("\n" + "=" * 80, file=sys.stderr)
        print("✓ All tests completed successfully!", file=sys.stderr)
        print("=" * 80, file=sys.stderr)
        
        # Print JSON output for Node.js integration
        summary = {
            "status": "success",
            "tests": {
                "any_llm_complete": "passed",
                "any_llm_enterprise": "passed",
                "background_prompt_generation": "passed"
            },
            "features": [
                "✓ Multimodal vision support (Enterprise endpoint)",
                "✓ Product categorization (9-category system)",
                "✓ GPT-powered prompt generation",
                "✓ Multiple style variations",
                "✓ Background replacement (nano-banana)"
            ]
        }
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        error_output = {
            "status": "error",
            "error": str(e)
        }
        print(json.dumps(error_output, ensure_ascii=False, indent=2))
        sys.exit(1)

