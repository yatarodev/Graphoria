<h1 align="center">Graphica.fun</h1>

<p align="center">
  ⚡ <em>The open-source AI engine for visual storytelling</em> ⚡
</p>

<p align="center">
  <a href="https://www.graphica.fun/"><img src="https://img.shields.io/badge/App-graphica.fun-blue?style=social" alt="Try it out"></a>
  <a href="https://x.com/graphicadotfun"><img src="https://img.shields.io/badge/X.com-Follow-1DA1F2?style=social&logo=x&logoColor=white" alt="Follow on X.com"></a>
</p>

<div align="center">
  <a href="https://graphica.fun">
    <img src="public/graphica_logo.png" style="margin: 15px; max-width: 150px" width="15%" alt="Logo">
  </a>
</div>

# Graphica Links

Graphica official website: [graphica.fun](https://www.graphica.fun/)
  
Graphica official X: [x.com/graphicadotfun](https://x.com/graphicaai)

Graphica Pump.fun: [pump.fun](https://pump.fun/)

Graphica CA: **Coming Soon**

## 
## Running locally

Provider config:
- `LLM_ENGINE`: can be one of `INFERENCE_API`, `INFERENCE_ENDPOINT`, `OPENAI`, `GROQ`, `ANTHROPIC`
- `RENDERING_ENGINE`: can be one of: "INFERENCE_API", "INFERENCE_ENDPOINT", "REPLICATE", "VIDEOCHAIN", "OPENAI" for now, unless you code your custom solution


Rendering config:
- `RENDERING_HF_INFERENCE_ENDPOINT_URL`: necessary if you decide to use a custom inference endpoint
- `RENDERING_REPLICATE_API_MODEL_VERSION`: url to the VideoChain API server
- `RENDERING_HF_INFERENCE_ENDPOINT_URL`: optional, default to nothing
- `RENDERING_HF_INFERENCE_API_BASE_MODEL`: optional, defaults to "stabilityai/stable-diffusion-xl-base-1.0"
- `RENDERING_HF_INFERENCE_API_REFINER_MODEL`: optional, defaults to "stabilityai/stable-diffusion-xl-refiner-1.0"
- `RENDERING_REPLICATE_API_MODEL`: optional, defaults to "stabilityai/sdxl"
- `RENDERING_REPLICATE_API_MODEL_VERSION`: optional, in case you want to change the version

Language model config (depending on the LLM engine you decide to use):
- `LLM_HF_INFERENCE_ENDPOINT_URL`: "<use your own>"
- `LLM_HF_INFERENCE_API_MODEL`: "HuggingFaceH4/zephyr-7b-beta"
- `LLM_OPENAI_API_BASE_URL`: "https://api.openai.com/v1"
- `LLM_OPENAI_API_MODEL`: "gpt-4o-mini"
- `LLM_GROQ_API_MODEL`: "mixtral-8x7b-32768"
- `LLM_ANTHROPIC_API_MODEL`: "claude-3-opus-20240229"

Please read the `.env` default config file for more informations.
To customise a variable locally, you should create a `.env.local`
(do not commit this file).

-> If you intend to run it with local, cloud-hosted and/or proprietary models **you are going to need to code 👨‍💻**.

## The LLM API (Large Language Model)

Currently Graphica uses the OpenAI API to generate stories.

### Option 1: Use an Image Inference API model

This is a new option added recently, where you can use one of the models from the Hugging Face Hub. By default we suggest to use [zephyr-7b-beta](https://huggingface.co/HuggingFaceH4/zephyr-7b-beta) as it will provide better results than the 7b model.

To activate it, create a `.env.local` configuration file:

```bash
LLM_ENGINE="INFERENCE_API"

HF_API_TOKEN="Your Hugging Face token"

# "HuggingFaceH4/zephyr-7b-beta" is used by default, but you can change this
# note: You should use a model able to generate JSON responses,
# so it is storngly suggested to use at least the 34b model
HF_INFERENCE_API_MODEL="HuggingFaceH4/zephyr-7b-beta"
```

### Option 2: use Groq

```bash
LLM_ENGINE="GROQ"

LLM_GROQ_API_MODEL="mixtral-8x7b-32768"

AUTH_GROQ_API_KEY="Your own GROQ API Key"
```
### Option 3: use Anthropic (Claude)

```bash
LLM_ENGINE="ANTHROPIC"

LLM_ANTHROPIC_API_MODEL="claude-3-opus-20240229"

AUTH_ANTHROPIC_API_KEY="Your own ANTHROPIC API Key"
```