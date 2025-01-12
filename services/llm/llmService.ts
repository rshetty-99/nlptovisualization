import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
//import { createCompletion } from 'ai';
import { spawn } from "child_process";

export enum LLMProvider {
  OpenAI = "openai",
  Anthropic = "anthropic",
  Ollama = "ollama",
}

interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
}

export class LLMService {
  private config: LLMConfig;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      provider: LLMProvider.Ollama,
      model: "llama2",
      ...config,
    } as LLMConfig;
    this.initializeClient();
  }

  private initializeClient() {
    switch (this.config.provider) {
      case LLMProvider.OpenAI:
        this.openai = new OpenAI({ apiKey: this.config.apiKey });
        break;
      case LLMProvider.Anthropic:
        this.anthropic = new Anthropic({ apiKey: this.config.apiKey });
        break;
    }
  }

  async generateText(prompt: string): Promise<string> {
    switch (this.config.provider) {
      case LLMProvider.OpenAI:
        return this.generateOpenAIText(prompt);
      case LLMProvider.Anthropic:
        return this.generateAnthropicText(prompt);
      case LLMProvider.Ollama:
        return this.generateOllamaText(prompt);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async generateOpenAIText(prompt: string): Promise<string> {
    if (!this.openai) throw new Error("OpenAI not initialized");
    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content || "";
  }

  private async generateAnthropicText(prompt: string): Promise<string> {
    if (!this.anthropic) throw new Error("Anthropic not initialized");
    const response = await this.anthropic.completions.create({
      model: this.config.model,
      prompt,
      max_tokens_to_sample: 300,
    });
    return response.completion;
  }

  private async generateOllamaText(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ollamaProcess = spawn("ollama", ["run", this.config.model, prompt]);
      let output = "";

      ollamaProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      ollamaProcess.stderr.on("data", (data) => {
        console.error(`Ollama Error: ${data}`);
      });

      ollamaProcess.on("close", (code) => {
        if (code === 0) resolve(output.trim());
        else reject(new Error(`Ollama exited with code ${code}`));
      });
    });
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    switch (this.config.provider) {
      case LLMProvider.OpenAI:
        return this.generateOpenAIStream(prompt);
      case LLMProvider.Anthropic:
        return this.generateAnthropicStream(prompt);
      case LLMProvider.Ollama:
        return this.generateOllamaStream(prompt);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async generateOpenAIStream(prompt: string): Promise<ReadableStream> {
    if (!this.openai) throw new Error("OpenAI not initialized");
    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    return new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          controller.enqueue(chunk.choices[0]?.delta?.content || "");
        }
        controller.close();
      },
    });
  }

  private async generateAnthropicStream(
    prompt: string
  ): Promise<ReadableStream> {
    if (!this.anthropic) throw new Error("Anthropic not initialized");
    const response = await this.anthropic.completions.create({
      model: this.config.model,
      prompt,
      max_tokens_to_sample: 300,
      stream: true,
    });

    return new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          controller.enqueue(chunk.completion);
        }
        controller.close();
      },
    });
  }

  private async generateOllamaStream(prompt: string): Promise<ReadableStream> {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        const ollamaProcess = spawn("ollama", [
          "run",
          this.config.model,
          prompt,
        ]);

        ollamaProcess.stdout.on("data", (data) => {
          controller.enqueue(encoder.encode(data.toString()));
        });

        ollamaProcess.stderr.on("data", (data) => {
          console.error(`Ollama Error: ${data}`);
        });

        ollamaProcess.on("close", (code) => {
          if (code === 0) controller.close();
          else controller.error(new Error(`Ollama exited with code ${code}`));
        });
      },
    });
  }
}
