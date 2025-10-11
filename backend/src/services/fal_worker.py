#!/usr/bin/env python3
"""
FAL Worker CLI - Command-line interface for FAL operations.

Usage:
    python fal_worker.py any-llm-complete --prompt "Your prompt here"
    python fal_worker.py any-llm-enterprise --prompt "Your prompt here"
    python fal_worker.py any-llm-submit --prompt "Your prompt here"
    python fal_worker.py any-llm-status --request_id <id>
    python fal_worker.py any-llm-result --request_id <id>
    python fal_worker.py background --image_url "https://..." --prompt "..."
    python fal_worker.py analyze-product --image_url "https://..."
    python fal_worker.py generate-bg-prompt --categories '{"main_product_type":"Footwear"}' --style_type "Clean studio"
    python fal_worker.py generate-multiple-bg --image_url "https://..." --categories '{"main_product_type":"Footwear"}'

Examples:
    # Complete text generation
    python fal_worker.py any-llm-complete \\
      --prompt "Write a 2-sentence ergonomic product description in Turkish." \\
      --model "openai/gpt-4o-mini" \\
      --temperature 0.7 \\
      --max_tokens 200 \\
      --system "You are a senior e-commerce copywriter."

    # Enterprise endpoint (vision support)
    python fal_worker.py any-llm-enterprise \\
      --prompt "What is in this image?" \\
      --model "google/gemini-2.5-pro" \\
      --temperature 0.3

    # Submit async job
    python fal_worker.py any-llm-submit \\
      --prompt "Short Turkish product pitch" \\
      --webhook_url "https://frontend.example.com/api/webhooks/openrouter"

    # Check status
    python fal_worker.py any-llm-status --request_id abc123

    # Get result
    python fal_worker.py any-llm-result --request_id abc123

    # Background replacement
    python fal_worker.py background \\
      --image_url "https://cdn.example.com/uploads/mug.jpg" \\
      --prompt "cozy scandinavian living room, warm tones" \\
      --remove_bg true

    # Analyze product image
    python fal_worker.py analyze-product \\
      --image_url "https://cdn.example.com/uploads/shoe.jpg" \\
      --model "google/gemini-2.5-pro"

    # Generate background prompt
    python fal_worker.py generate-bg-prompt \\
      --categories '{"main_product_type":"Footwear","subcategory":"Sneakers"}' \\
      --style_type "Clean white studio background for e-commerce"

    # Generate multiple backgrounds
    python fal_worker.py generate-multiple-bg \\
      --image_url "https://cdn.example.com/uploads/shoe.jpg" \\
      --categories '{"main_product_type":"Footwear"}'
"""

import argparse
import json
import sys
import traceback
import os


def load_env_file(env_file: str) -> None:
    """Load environment variables from .env file using python-dotenv."""
    try:
        from dotenv import load_dotenv
        load_dotenv(env_file)
        print(f"Loaded environment from {env_file}", file=sys.stderr)
    except ImportError:
        print(
            "Warning: python-dotenv not installed. Cannot load .env file.",
            file=sys.stderr
        )


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="FAL Worker CLI for any-llm and photokit operations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        "--env_file",
        default=".env",
        help="Path to .env file (default: .env)"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # any-llm-complete
    complete_parser = subparsers.add_parser(
        "any-llm-complete",
        help="Complete text generation (blocking)"
    )
    complete_parser.add_argument("--prompt", required=True, help="User prompt")
    complete_parser.add_argument("--system", dest="system_prompt", help="System prompt")
    complete_parser.add_argument(
        "--model",
        default="google/gemini-2.5-flash-lite",
        help="Model name (default: google/gemini-2.5-flash-lite)"
    )
    complete_parser.add_argument(
        "--temperature",
        type=float,
        default=0.7,
        help="Temperature (default: 0.7)"
    )
    complete_parser.add_argument(
        "--max_tokens",
        type=int,
        help="Maximum tokens to generate"
    )
    complete_parser.add_argument(
        "--priority",
        choices=["latency", "throughput"],
        default="latency",
        help="Priority mode (default: latency)"
    )
    complete_parser.add_argument(
        "--with_logs",
        action="store_true",
        help="Print log streams to stderr"
    )
    
    # any-llm-enterprise
    enterprise_parser = subparsers.add_parser(
        "any-llm-enterprise",
        help="Enterprise LLM endpoint with vision support"
    )
    enterprise_parser.add_argument("--prompt", required=True, help="User prompt")
    enterprise_parser.add_argument("--system", dest="system_prompt", help="System prompt")
    enterprise_parser.add_argument(
        "--model",
        default="google/gemini-2.5-pro",
        help="Model name (default: google/gemini-2.5-pro)"
    )
    enterprise_parser.add_argument(
        "--temperature",
        type=float,
        default=0.7,
        help="Temperature (default: 0.7)"
    )
    enterprise_parser.add_argument(
        "--max_tokens",
        type=int,
        help="Maximum tokens to generate"
    )
    enterprise_parser.add_argument(
        "--with_logs",
        action="store_true",
        help="Print log streams to stderr"
    )
    
    # any-llm-stream
    stream_parser = subparsers.add_parser(
        "any-llm-stream",
        help="Stream text generation"
    )
    stream_parser.add_argument("--prompt", required=True, help="User prompt")
    stream_parser.add_argument("--system", dest="system_prompt", help="System prompt")
    stream_parser.add_argument(
        "--model",
        default="google/gemini-2.5-flash-lite",
        help="Model name"
    )
    stream_parser.add_argument("--temperature", type=float, default=0.7)
    stream_parser.add_argument("--max_tokens", type=int)
    stream_parser.add_argument(
        "--priority",
        choices=["latency", "throughput"],
        default="latency"
    )
    
    # any-llm-submit
    submit_parser = subparsers.add_parser(
        "any-llm-submit",
        help="Submit async text generation job"
    )
    submit_parser.add_argument("--prompt", required=True, help="User prompt")
    submit_parser.add_argument("--system", dest="system_prompt", help="System prompt")
    submit_parser.add_argument(
        "--model",
        default="google/gemini-2.5-flash-lite",
        help="Model name"
    )
    submit_parser.add_argument("--temperature", type=float, default=0.7)
    submit_parser.add_argument("--max_tokens", type=int)
    submit_parser.add_argument(
        "--priority",
        choices=["latency", "throughput"],
        default="latency"
    )
    submit_parser.add_argument("--webhook_url", help="Webhook URL for completion")
    
    # any-llm-status
    status_parser = subparsers.add_parser(
        "any-llm-status",
        help="Check job status"
    )
    status_parser.add_argument("--request_id", required=True, help="Request ID")
    status_parser.add_argument(
        "--with_logs",
        action="store_true",
        default=True,
        help="Include logs (default: true)"
    )
    
    # any-llm-result
    result_parser = subparsers.add_parser(
        "any-llm-result",
        help="Get job result"
    )
    result_parser.add_argument("--request_id", required=True, help="Request ID")
    
    # background
    background_parser = subparsers.add_parser(
        "background",
        help="Replace image background using photokit"
    )
    background_parser.add_argument(
        "--image_url",
        required=True,
        help="Image URL to process"
    )
    background_parser.add_argument(
        "--prompt",
        default="soft key light, seamless studio backdrop, premium e-commerce look, product centered, subtle shadow",
        help="Background replacement prompt"
    )
    background_parser.add_argument(
        "--remove_bg",
        type=lambda x: x.lower() in ("true", "1", "yes"),
        default=True,
        help="Remove background first (true/false, default: true)"
    )
    background_parser.add_argument(
        "--timeout",
        type=int,
        default=110,
        help="Request timeout in seconds (default: 110)"
    )
    
    # analyze-product
    analyze_parser = subparsers.add_parser(
        "analyze-product",
        help="Analyze product image and return 9-category classification"
    )
    analyze_parser.add_argument(
        "--image_url",
        required=True,
        help="Product image URL to analyze"
    )
    analyze_parser.add_argument(
        "--model",
        default="google/gemini-2.5-pro",
        help="Vision model to use (default: google/gemini-2.5-pro)"
    )
    analyze_parser.add_argument(
        "--temperature",
        type=float,
        default=0.3,
        help="Temperature (default: 0.3)"
    )
    
    # generate-bg-prompt
    bg_prompt_parser = subparsers.add_parser(
        "generate-bg-prompt",
        help="Generate background replacement prompt from categories"
    )
    bg_prompt_parser.add_argument(
        "--categories",
        required=True,
        help="Product categories as JSON string"
    )
    bg_prompt_parser.add_argument(
        "--style_type",
        required=True,
        help="Style description for the background"
    )
    bg_prompt_parser.add_argument(
        "--model",
        default="openai/gpt-5-mini",
        help="Model to use (default: openai/gpt-5-mini)"
    )
    
    # generate-multiple-bg
    multiple_bg_parser = subparsers.add_parser(
        "generate-multiple-bg",
        help="Generate multiple background variations"
    )
    multiple_bg_parser.add_argument(
        "--image_url",
        required=True,
        help="Original product image URL"
    )
    multiple_bg_parser.add_argument(
        "--categories",
        required=True,
        help="Product categories as JSON string"
    )
    multiple_bg_parser.add_argument(
        "--styles",
        help="Optional: Custom styles as JSON array"
    )
    
    # upload-file
    upload_parser = subparsers.add_parser(
        "upload-file",
        help="Upload a local file to FAL CDN"
    )
    upload_parser.add_argument(
        "--file_path",
        required=True,
        help="Local file path to upload"
    )
    
    args = parser.parse_args()
    
    # Load .env if specified and exists
    if os.path.exists(args.env_file):
        load_env_file(args.env_file)
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    try:
        # Import here to allow --help without FAL_KEY
        from pathlib import Path
        
        # Add parent directory to path to import fal_service module
        sys.path.insert(0, str(Path(__file__).parent))
        from fal_service import FalClient
        
        client = FalClient()
        result = None
        
        if args.command == "any-llm-complete":
            result = client.any_llm_complete(
                prompt=args.prompt,
                system_prompt=args.system_prompt,
                model=args.model,
                temperature=args.temperature,
                max_tokens=args.max_tokens,
                priority=args.priority,
                with_logs=args.with_logs
            )
        
        elif args.command == "any-llm-enterprise":
            result = client.any_llm_enterprise(
                prompt=args.prompt,
                system_prompt=args.system_prompt,
                model=args.model,
                temperature=args.temperature,
                max_tokens=args.max_tokens,
                with_logs=args.with_logs
            )
        
        elif args.command == "any-llm-stream":
            # Stream outputs directly to stdout
            client.any_llm_stream(
                prompt=args.prompt,
                system_prompt=args.system_prompt,
                model=args.model,
                temperature=args.temperature,
                max_tokens=args.max_tokens,
                priority=args.priority
            )
            # No JSON output for streaming
            sys.exit(0)
        
        elif args.command == "any-llm-submit":
            request_id = client.any_llm_submit(
                prompt=args.prompt,
                system_prompt=args.system_prompt,
                model=args.model,
                temperature=args.temperature,
                max_tokens=args.max_tokens,
                priority=args.priority,
                webhook_url=args.webhook_url
            )
            result = {"request_id": request_id}
        
        elif args.command == "any-llm-status":
            result = client.any_llm_status(
                request_id=args.request_id,
                with_logs=args.with_logs
            )
        
        elif args.command == "any-llm-result":
            result = client.any_llm_result(request_id=args.request_id)
        
        elif args.command == "background":
            result = client.background_replace(
                image_url=args.image_url,
                prompt=args.prompt,
                remove_bg=args.remove_bg,
                timeout=args.timeout
            )
        
        elif args.command == "analyze-product":
            result = client.analyze_product_image(
                image_url=args.image_url,
                model=args.model,
                temperature=args.temperature
            )
        
        elif args.command == "generate-bg-prompt":
            # Parse categories JSON
            categories = json.loads(args.categories)
            result = client.generate_background_prompt(
                categories=categories,
                style_type=args.style_type,
                model=args.model
            )
        
        elif args.command == "generate-multiple-bg":
            # Parse categories JSON
            categories = json.loads(args.categories)
            # Parse styles JSON if provided
            styles = None
            if args.styles:
                styles = json.loads(args.styles)
            result = client.generate_multiple_backgrounds(
                image_url=args.image_url,
                categories=categories,
                styles=styles
            )
        
        elif args.command == "upload-file":
            # Upload local file to FAL CDN
            url = client.upload_file(args.file_path)
            result = {
                "url": url,
                "error": None
            }
        
        # Output JSON result to stdout
        if result is not None:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        # Output error as JSON for Node.js parsing
        error_output = {
            "error": str(e),
            "trace": traceback.format_exc()
        }
        print(json.dumps(error_output, ensure_ascii=False, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()

