import { NextResponse } from "next/server";
import { fallbackHermesResponse } from "@/lib/ai/fallback";
import { buildHermesSystemPrompt, buildHermesUserPrompt } from "@/lib/ai/prompts";
import type { ChatRequest, ChainSummary } from "@/lib/market/types";
import { normalizeTicker } from "@/lib/market/provider";

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChainSummary(value: unknown): value is ChainSummary {
  return value === undefined || isRecord(value);
}

function sanitizeHermesMessage(message: string): string {
  const sanitized = message
    .replace(/\bguaranteed profit\b/gi, "certain outcome")
    .replace(/\brisk-free profit\b/gi, "certain outcome")
    .replace(/\bbuy\b/gi, "consider")
    .replace(/\bsell\b/gi, "exit")
    .replace(/\bguaranteed\b/gi, "certain")
    .replace(/\brisk-free\b/gi, "low-uncertainty")
    .trim();

  if (/educational analysis/i.test(sanitized)) {
    return sanitized;
  }

  return `${sanitized}\n\nThis is educational analysis, not financial advice.`;
}

function parseChatRequest(body: unknown): ChatRequest | null {
  if (!isRecord(body)) {
    return null;
  }

  const ticker = typeof body.ticker === "string" ? normalizeTicker(body.ticker) : null;
  const expiration = typeof body.expiration === "string" ? body.expiration : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const chainSummary = body.chainSummary;

  if (!ticker || !expiration || !/^\d{4}-\d{2}-\d{2}$/.test(expiration) || !message) {
    return null;
  }

  if (!isChainSummary(chainSummary)) {
    return null;
  }

  return {
    ticker,
    expiration,
    message: message.slice(0, 1200),
    chainSummary,
  };
}

async function askOpenAI(request: ChatRequest): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 520,
        messages: [
          {
            role: "system",
            content: buildHermesSystemPrompt(),
          },
          {
            role: "user",
            content: buildHermesUserPrompt(request),
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OpenAIChatResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseChatRequest(body);

  if (!parsed) {
    return NextResponse.json({ error: "A valid chat request is required." }, { status: 400 });
  }

  const aiMessage = await askOpenAI(parsed);
  const message = sanitizeHermesMessage(aiMessage ?? fallbackHermesResponse(parsed));

  return NextResponse.json({ message });
}
