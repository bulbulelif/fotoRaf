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
from typing import Optional, Any
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
        # Use FAL's nano-banana model for image generation
        try:
            # Build prompt for product photography with background
            full_prompt = f"{prompt}, product photography, high quality, professional lighting"
            
            # Build arguments for nano-banana
            arguments = {
                "prompt": full_prompt,
                "image_url": image_url,
                "image_size": "square_hd",
                "num_inference_steps": 4,
                "num_images": 1,
                "enable_safety_checker": True
            }
            
            # Queue update callback for logs
            def on_queue_update(update):
                if isinstance(update, fal_client.InProgress):
                    for log in update.logs:
                        print(f"[nano-banana] {log.get('message', '')}", file=sys.stderr)
            
            # Use fal_client.subscribe for synchronous call with logs
            result = fal_client.subscribe(
                "fal-ai/nano-banana",
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


# Smoke test
if __name__ == "__main__":
    print("FAL Client - Smoke Test", file=sys.stderr)
    print("=" * 50, file=sys.stderr)
    
    try:
        client = FalClient()
        print("✓ Client initialized successfully", file=sys.stderr)
        
        # Test any_llm_complete
        print("\nTesting any_llm_complete...", file=sys.stderr)
        result = client.any_llm_complete(
            prompt="Write a 2-sentence product description for an ergonomic coffee mug.",
            model="google/gemini-2.5-flash-lite",
            temperature=0.7,
            max_tokens=100,
            with_logs=False
        )
        
        print("\nResult:", file=sys.stderr)
        print(f"Output: {result['output']}", file=sys.stderr)
        print(f"Error: {result['error']}", file=sys.stderr)
        
        # Print JSON output for Node.js integration
        import json
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        sys.exit(1)

