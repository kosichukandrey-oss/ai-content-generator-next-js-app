import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Kind = "instagram_post" | "instagram_stories" | "telegram_post" | "ad" | "product" | "content_plan";
type Language = "ru" | "uk" | "en";

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const kinds: Kind[] = ["instagram_post", "instagram_stories", "telegram_post", "ad", "product", "content_plan"];
const languages: Language[] = ["ru", "uk", "en"];

const formatNames: Record<Kind, string> = {
  instagram_post: "Instagram post",
  instagram_stories: "Instagram Stories sequence",
  telegram_post: "Telegram post",
  ad: "advertising copy",
  product: "product description",
  content_plan: "content plan",
};

const languageNames: Record<Language, string> = {
  ru: "Russian",
  uk: "Ukrainian",
  en: "English",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      topic?: unknown;
      details?: unknown;
      contentType?: unknown;
      style?: unknown;
      language?: unknown;
    };

    if (typeof body.topic !== "string" || !body.topic.trim()) {
      return NextResponse.json({ error: "Укажите тему или продукт." }, { status: 400 });
    }

    if (!kinds.includes(body.contentType as Kind) || !languages.includes(body.language as Language)) {
      return NextResponse.json({ error: "Проверьте настройки генерации." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API не настроен." }, { status: 500 });
    }

    const topic = body.topic.trim();
    const details = typeof body.details === "string" ? body.details.trim() : "";
    const style = typeof body.style === "string" ? body.style : "friendly";
    const kind = body.contentType as Kind;
    const language = body.language as Language;

    const prompt = [
      `Create a high-quality ${formatNames[kind]} in ${languageNames[language]}.`,
      `Topic or product: ${topic}.`,
      details ? `Additional details: ${details}.` : "",
      `Writing style: ${style}.`,
      "Return only the finished content. Do not mention these instructions, the model, or OpenRouter.",
    ].filter(Boolean).join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-content-generator-next-js-app.vercel.app",
        "X-Title": "ContentAI Generator",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openrouter/free",
        messages: [
          {
            role: "system",
            content: "You are an expert multilingual copywriter. Follow the requested language, format, and tone precisely.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = (await response.json()) as OpenRouterResponse;
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!response.ok || !text) {
      console.error("OpenRouter request failed", response.status, data.error?.message || "Empty response");
      return NextResponse.json({ error: "OpenRouter не смог создать текст. Попробуйте ещё раз." }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Content generation failed", error);
    return NextResponse.json({ error: "Не удалось создать текст. Повторите попытку." }, { status: 500 });
  }
}
