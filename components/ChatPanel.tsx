"use client";

import { FormEvent, useState } from "react";
import type { ChainSummary, ChatResponse } from "@/lib/market/types";

type ChatMessage = {
  role: "user" | "hermes";
  content: string;
};

type ChatPanelProps = {
  ticker: string;
  expiration: string | null;
  chainSummary: ChainSummary | null;
};

const prompts = [
  "Explain this setup.",
  "Find liquid contracts.",
  "What does high IV mean?",
  "What are the risks?",
];

export function ChatPanel({ ticker, expiration, chainSummary }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "hermes",
      content:
        "Ask about liquidity, volatility, risk, or what stands out in the selected chain. I will keep it educational.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || !expiration) {
      return;
    }

    setError(null);
    setLoading(true);
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker,
          expiration,
          message: trimmed,
          chainSummary: chainSummary ?? undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Hermes could not analyze this request.");
      }

      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [...current, { role: "hermes", content: data.message }]);
    } catch (caught) {
      const messageText = caught instanceof Error ? caught.message : "Hermes is unavailable.";
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <aside className="flex h-[680px] flex-col rounded-lg border border-white/10 bg-panel">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white">Ask Hermes</h2>
        <p className="text-sm text-slate-500">
          {ticker}
          {expiration ? ` · ${expiration}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={loading || !expiration}
            onClick={() => void sendMessage(prompt)}
            className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-signal/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-8 rounded-md bg-signal px-3 py-2 text-sm text-ink"
                : "mr-6 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-slate-200"
            }
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="mr-6 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-400">
            Hermes is reading the chain...
          </div>
        )}
        {error && <div className="text-sm text-red-300">{error}</div>}
      </div>

      <form onSubmit={submit} className="border-t border-white/10 p-3">
        <label htmlFor="hermes-message" className="sr-only">
          Ask Hermes
        </label>
        <textarea
          id="hermes-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="What stands out in this data?"
          rows={3}
          className="w-full resize-none rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-signal"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !expiration}
          className="mt-2 min-h-10 w-full rounded-md bg-signal px-4 text-sm font-semibold text-ink transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </aside>
  );
}
