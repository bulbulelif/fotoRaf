# FAL Python Services

Python wrapper for FAL AI services with advanced features:
- **Multimodal Vision**: Enterprise LLM endpoint with image analysis support
- **Product Categorization**: 9-category AI-powered product classification
- **GPT-Powered Prompts**: Intelligent prompt generation for backgrounds
- **Multiple Styles**: Generate variations with different background styles
- **Background Replacement**: Professional e-commerce product photography

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Required packages:
- `fal-client>=0.5.0` - Official FAL Python client
- `requests>=2.32.3` - HTTP requests for photokit API
- `python-dotenv>=1.0.1` - Environment variable management

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
# FAL API Key (required)
FAL_KEY=your_fal_key_here
```

Get your FAL API key from: https://fal.ai/dashboard/keys

## Usage

### Python Module (`fal_service.py`)

Import and use programmatically:

```python
from services.fal_service import FalClient

client = FalClient()

# ========================================
# 1. BASIC TEXT GENERATION
# ========================================

# Complete text generation (blocking)
result = client.any_llm_complete(
    prompt="Write a 2-sentence product description in Turkish.",
    model="google/gemini-2.5-flash-lite",
    temperature=0.7,
    max_tokens=200,
    system_prompt="You are a senior e-commerce copywriter."
)
print(result["output"])

# ========================================
# 2. ENTERPRISE LLM (MULTIMODAL VISION)
# ========================================

# Use premium models like Gemini 2.5 Pro
result = client.any_llm_enterprise(
    prompt="What's in this image? Image URL: https://example.com/product.jpg",
    model="google/gemini-2.5-pro",
    temperature=0.3
)
print(result["output"])

# ========================================
# 3. PRODUCT IMAGE ANALYSIS (9 CATEGORIES)
# ========================================

# Upload and analyze product image
image_url = client.upload_file("product.jpg")

# Get 9-category classification
analysis = client.analyze_product_image(image_url)
categories = analysis["categories"]

print(f"Product Type: {categories['main_product_type']}")
print(f"Subcategory: {categories['subcategory']}")
print(f"Target Audience: {categories['target_audience']}")
print(f"Price Range: {categories['price_range']}")
print(f"Use Case: {categories['use_case']}")
print(f"Style: {categories['style_design']}")
print(f"Season: {categories['season_occasion']}")
print(f"Industry: {categories['industrial_type']}")
print(f"Vibe: {categories['vibe']}")

# ========================================
# 4. GPT-POWERED PROMPT GENERATION
# ========================================

# Generate professional background prompt
prompt_result = client.generate_background_prompt(
    categories=categories,
    style_type="Clean white studio background for e-commerce"
)
print(f"Generated prompt: {prompt_result['prompt']}")

# ========================================
# 5. MULTIPLE BACKGROUND VARIATIONS
# ========================================

# Generate 3 different background styles automatically
result = client.generate_multiple_backgrounds(
    image_url=image_url,
    categories=categories
)

# Or use custom styles
custom_styles = [
    {
        "name": "Studio",
        "description": "Clean white studio background"
    },
    {
        "name": "Lifestyle",
        "description": "Natural lifestyle setting"
    }
]
result = client.generate_multiple_backgrounds(
    image_url=image_url,
    categories=categories,
    styles=custom_styles
)

for img in result["images"]:
    print(f"{img['style_name']}: {img['image_url']}")

# ========================================
# 6. SINGLE BACKGROUND REPLACEMENT
# ========================================

bg_result = client.background_replace(
    image_url="https://cdn.example.com/mug.jpg",
    prompt="cozy scandinavian living room, warm tones"
)
print(f"New background: {bg_result['image']['url']}")
```

### CLI Worker (`fal_worker.py`)

Command-line interface for Node.js integration:

#### Text Generation (Complete)

```bash
python src/services/fal_worker.py any-llm-complete \
  --prompt "Write a 2-sentence ergonomic product description in Turkish." \
  --model "openai/gpt-4o-mini" \
  --temperature 0.7 \
  --max_tokens 200 \
  --system "You are a senior e-commerce copywriter."
```

Output (JSON):
```json
{
  "output": "Bu ergonomik kupa...",
  "reasoning": null,
  "partial": false,
  "error": null,
  "raw": {...}
}
```

#### Async Job Submission

```bash
# Submit job
python src/services/fal_worker.py any-llm-submit \
  --prompt "Short Turkish product pitch" \
  --webhook_url "https://frontend.example.com/api/webhooks/openrouter"

# Output: {"request_id": "abc123..."}

# Check status
python src/services/fal_worker.py any-llm-status --request_id abc123

# Get result
python src/services/fal_worker.py any-llm-result --request_id abc123
```

#### Background Replacement

```bash
python src/services/fal_worker.py background \
  --image_url "https://cdn.example.com/uploads/mug.jpg" \
  --prompt "cozy scandinavian living room, warm tones" \
  --remove_bg true
```

Output (JSON):
```json
{
  "image": {
    "url": "https://fal.media/files/...",
    "width": 1024,
    "height": 1024
  },
  "timings": {...}
}
```

## Node.js Integration

Example TypeScript/JavaScript usage:

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function generateDescription(prompt: string) {
  const { stdout } = await execFileAsync('python3', [
    'src/services/fal_worker.py',
    'any-llm-complete',
    '--prompt', prompt,
    '--model', 'openai/gpt-4o-mini',
    '--temperature', '0.7',
    '--max_tokens', '200'
  ], { 
    timeout: 120000,
    cwd: process.cwd() + '/backend'
  });

  const data = JSON.parse(stdout);
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.output;
}

// Usage
const description = await generateDescription(
  'Türkçe 2 cümlelik ergonomi odaklı ürün açıklaması yaz.'
);
console.log(description);
```

## API Reference

### FalClient Class

#### `any_llm_enterprise(prompt, **kwargs) -> dict`

**NEW** - Enterprise LLM endpoint with support for premium models and multimodal vision.

**Parameters:**
- `prompt` (str): User prompt (can include "Image URL: ..." for vision)
- `system_prompt` (str, optional): System prompt
- `model` (str, optional): Model name (default: "google/gemini-2.5-pro")
- `temperature` (float, optional): Sampling temperature (default: 0.7)
- `max_tokens` (int, optional): Maximum tokens to generate
- `with_logs` (bool): Print queue logs to stderr (default: False)

**Returns:** `dict`
```python
{
  "output": str,        # Generated text
  "error": str | None,  # Error message if failed
  "raw": dict          # Full API response
}
```

**Example:**
```python
result = client.any_llm_enterprise(
    prompt="Image URL: https://example.com/product.jpg\n\nDescribe this product.",
    model="google/gemini-2.5-pro",
    temperature=0.3
)
```

#### `analyze_product_image(image_url, **kwargs) -> dict`

**NEW** - Analyzes product image and returns 9-category classification using multimodal vision.

**Parameters:**
- `image_url` (str): URL of the product image to analyze
- `model` (str, optional): Vision model to use (default: "google/gemini-2.5-pro")
- `temperature` (float, optional): Sampling temperature (default: 0.3)

**Returns:** `dict`
```python
{
  "categories": {
    "main_product_type": str,    # e.g., "Footwear"
    "subcategory": str,          # e.g., "Sneakers"
    "target_audience": str,      # e.g., "Men"
    "price_range": str,          # e.g., "Mid-range"
    "use_case": str,            # e.g., "Casual Lifestyle"
    "style_design": str,        # e.g., "Streetwear"
    "season_occasion": str,     # e.g., "All Season"
    "industrial_type": str,     # e.g., "Footwear Manufacturing"
    "vibe": str                 # e.g., "Urban/Street"
  },
  "error": str | None,
  "raw_output": str
}
```

**Example:**
```python
analysis = client.analyze_product_image("https://example.com/shoe.jpg")
print(analysis["categories"]["main_product_type"])  # "Footwear"
```

#### `generate_background_prompt(categories, style_type, **kwargs) -> dict`

**NEW** - Generates professional background replacement prompt using GPT based on product categories.

**Parameters:**
- `categories` (dict): Product categories (from `analyze_product_image`)
- `style_type` (str): Style description for the background
- `model` (str, optional): Model to use (default: "openai/gpt-5-mini")

**Returns:** `dict`
```python
{
  "prompt": str,        # Generated prompt text
  "error": str | None   # Error message if failed
}
```

**Example:**
```python
prompt_result = client.generate_background_prompt(
    categories={"main_product_type": "Footwear", "subcategory": "Sneakers"},
    style_type="Clean white studio background for e-commerce"
)
print(prompt_result["prompt"])
```

#### `generate_multiple_backgrounds(image_url, categories, **kwargs) -> dict`

**NEW** - Generates multiple background variations for a product image using GPT-powered prompts.

**Parameters:**
- `image_url` (str): URL of the original product image
- `categories` (dict): Product categories (from `analyze_product_image`)
- `styles` (list[dict], optional): List of style dicts with 'name' and 'description' keys. If None, uses default 3 styles (Studio, Lifestyle, Premium)

**Returns:** `dict`
```python
{
  "images": [
    {
      "style_name": str,
      "style_description": str,
      "image_url": str,
      "prompt": str,
      "width": int,
      "height": int
    }
  ],
  "total_generated": int,
  "total_requested": int,
  "errors": list | None
}
```

**Example:**
```python
result = client.generate_multiple_backgrounds(
    image_url="https://example.com/product.jpg",
    categories=categories
)

for img in result["images"]:
    print(f"{img['style_name']}: {img['image_url']}")
```

#### `any_llm_complete(prompt, **kwargs) -> dict`

Synchronous text generation (blocks until complete).

**Parameters:**
- `prompt` (str): User prompt
- `system_prompt` (str, optional): System prompt
- `model` (str, optional): Model name (default: "google/gemini-2.5-flash-lite")
- `temperature` (float, optional): Sampling temperature (default: 0.7)
- `max_tokens` (int, optional): Maximum tokens to generate
- `priority` (str, optional): "latency" or "throughput" (default: "latency")
- `with_logs` (bool): Print queue logs to stderr (default: False)

**Returns:** `dict`
```python
{
  "output": str,        # Generated text
  "reasoning": str,     # Optional reasoning (if supported)
  "partial": bool,      # Whether result is partial
  "error": str | None,  # Error message if failed
  "raw": dict          # Full API response
}
```

#### `any_llm_stream(prompt, **kwargs) -> None`

Stream text generation to stdout.

**Parameters:** Same as `any_llm_complete` (except `with_logs`)

#### `any_llm_submit(prompt, **kwargs) -> str`

Submit async job, returns request ID.

**Parameters:** Same as `any_llm_complete` + `webhook_url` (optional)

**Returns:** `str` - Request ID

#### `any_llm_status(request_id, with_logs=True) -> dict`

Check job status.

**Returns:** Queue status dict

#### `any_llm_result(request_id) -> dict`

Get final result (raises if not completed).

**Returns:** Same format as `any_llm_complete`

#### `upload_file(path) -> str`

Upload local file to FAL storage.

**Returns:** Public URL string

#### `background_replace(image_url, **kwargs) -> dict`

Replace image background using photokit.

**Parameters:**
- `image_url` (str): Image URL to process
- `prompt` (str): Background description
- `remove_bg` (bool): Remove background first (default: True)
- `timeout` (int): Request timeout seconds (default: 110)

**Returns:** `dict`
```python
{
  "image": {
    "url": str,
    "width": int,
    "height": int,
    "content_type": str,
    "file_size": int
  },
  "timings": {...}
}
```

## Error Handling

All errors are returned as JSON with `error` and `trace` fields:

```json
{
  "error": "FAL_KEY environment variable is required...",
  "trace": "Traceback (most recent call last):\n..."
}
```

Exit codes:
- `0` - Success
- `1` - Error (check JSON output for details)

## Security Notes

- **Never log or commit `FAL_KEY`** - Keep it in `.env` and `.gitignore`
- Worker outputs are designed for stdout parsing (JSON only)
- Stderr is used for logs/debug info

## Model Options

### Standard Endpoint (`any_llm_complete`)
Default model: `google/gemini-2.5-flash-lite`

Supported models (via OpenRouter):
- `openai/gpt-4o-mini`
- `openai/gpt-4o`
- `anthropic/claude-3-5-sonnet`
- `google/gemini-pro-1.5`

### Enterprise Endpoint (`any_llm_enterprise`, `analyze_product_image`, `generate_background_prompt`)
Default models:
- Vision/Analysis: `google/gemini-2.5-pro` (multimodal)
- Prompt Generation: `openai/gpt-5-mini`

Supported premium models:
- `google/gemini-2.5-pro` - Best for vision and complex reasoning
- `google/gemini-2.5-flash` - Fast multimodal
- `openai/gpt-5-mini` - Cost-effective text generation
- `openai/gpt-4-turbo` - High-quality text

See [FAL AI docs](https://fal.ai/models) for full model list.

## Testing

Run smoke test:

```bash
cd backend
export FAL_KEY=your_key_here
python src/services/fal_service.py
```

Expected output: 
- Basic LLM completion test
- Enterprise endpoint test
- Background prompt generation test
- JSON summary with all features

## Complete Workflow Example

Here's a complete e-commerce workflow using all features:

```python
from services.fal_service import FalClient

client = FalClient()

# 1. Upload product image
image_url = client.upload_file("product.jpg")
print(f"Image uploaded: {image_url}")

# 2. Analyze product (9 categories)
analysis = client.analyze_product_image(image_url)
categories = analysis["categories"]
print(f"Product: {categories['main_product_type']} - {categories['subcategory']}")

# 3. Generate multiple background variations
result = client.generate_multiple_backgrounds(
    image_url=image_url,
    categories=categories
)

print(f"Generated {result['total_generated']} variations:")
for img in result["images"]:
    print(f"  - {img['style_name']}: {img['image_url']}")

# 4. (Optional) Generate product description
desc = client.any_llm_complete(
    prompt=f"Write a 2-sentence product description in Turkish for a {categories['subcategory']}",
    model="google/gemini-2.5-flash-lite"
)
print(f"Description: {desc['output']}")
```

This workflow:
1. Uploads the product image
2. Analyzes it using AI vision (9 categories)
3. Generates 3 professional background variations
4. Creates marketing copy

Perfect for e-commerce automation!

