# FAL Python Services

Python wrapper for FAL AI services (any-llm via OpenRouter + photokit background replacement).

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

### Python Module (`fal_client.py`)

Import and use programmatically:

```python
from services.fal_client import FalClient

client = FalClient()

# Complete text generation (blocking)
result = client.any_llm_complete(
    prompt="Write a 2-sentence product description in Turkish.",
    model="openai/gpt-4o-mini",
    temperature=0.7,
    max_tokens=200,
    system_prompt="You are a senior e-commerce copywriter."
)
print(result["output"])

# Submit async job
request_id = client.any_llm_submit(
    prompt="Short product pitch",
    webhook_url="https://example.com/webhook"
)

# Check status
status = client.any_llm_status(request_id)

# Get result
result = client.any_llm_result(request_id)

# Background replacement
bg_result = client.background_replace(
    image_url="https://cdn.example.com/mug.jpg",
    prompt="cozy scandinavian living room, warm tones"
)
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

Default model: `google/gemini-2.5-flash-lite`

Other supported models (via OpenRouter):
- `openai/gpt-4o-mini`
- `openai/gpt-4o`
- `anthropic/claude-3-5-sonnet`
- `google/gemini-pro-1.5`
- See FAL docs for full list

## Testing

Run smoke test:

```bash
cd backend
export FAL_KEY=your_key_here
python src/services/fal_client.py
```

Expected output: JSON with generated product description.

