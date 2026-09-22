import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

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

const formatInstructions: Record<Kind, string> = {
  instagram_post: [
    "Write one complete Instagram caption, not a plan or a list of slides.",
    "Structure: a strong opening hook, 2-4 short readable paragraphs, one clear call to action, then 3-7 relevant hashtags.",
    "Emojis are optional and should be used sparingly.",
  ].join(" "),
  instagram_stories: [
    "Create exactly 5 separate story screens.",
    "Label every screen from 1 to 5 using labels in the requested language.",
    "Each screen must contain no more than 25 words.",
    "Use this sequence: hook, problem, solution or benefit, proof or detail, interactive call to action.",
    "Do not write a continuous caption, hashtags, or a long article.",
  ].join(" "),
  telegram_post: [
    "Write one Telegram channel post with a short headline and 3-5 concise paragraphs.",
    "Make it useful and conversational, with one clear closing call to action.",
    "Do not add Instagram-style hashtag blocks or story-screen labels.",
  ].join(" "),
  ad: [
    "Create exactly 3 clearly separated advertising variations.",
    "For every variation include a short headline, body copy of no more than 35 words, and a concise call-to-action line.",
    "Make each variation use a different angle. Do not add hashtags, an article, or a content plan.",
  ].join(" "),
  product: [
    "Write a product-card description.",
    "Structure: product title, one-sentence value proposition, 4-6 bullet points with concrete benefits or characteristics, a short suitable-for section, and one closing call to action.",
    "Do not invent technical facts that were not provided; phrase unknown details generically. Do not add hashtags.",
  ].join(" "),
  content_plan: [
    "Create a practical 7-day content plan, not a finished social media post.",
    "List Day 1 through Day 7 using labels in the requested language.",
    "For every day include: topic, publishing format, opening hook, goal, and call to action.",
    "Vary the formats and goals across the week. Do not write full captions or hashtag blocks.",
  ].join(" "),
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
    const kind = body.contentType as Kind;
    const language = body.language as Language;

    const prompt = [
      `Create a high-quality ${formatNames[kind]} in ${languageNames[language]}.`,
      `Topic or product: ${topic}.`,
      details ? `Additional details: ${details}.` : "",
      `Required format: ${formatInstructions[kind]}`,
      "Use natural language appropriate for the selected platform. Keep every heading, label, and call to action in the requested language.",
      "Use only facts supplied by the user. Do not invent prices, discounts, materials, measurements, certifications, test results, statistics, or technical specifications.",
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
        model: process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free",
        messages: [
          {
            role: "system",
            content: "You are an expert multilingual copywriter. Each content type has a distinct purpose and structure. Follow the requested language and required format precisely. Never replace the requested format with a generic social media post.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: kind === "content_plan" ? 1400 : 1200,
      }),
      signal: AbortSignal.timeout(60000),
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
