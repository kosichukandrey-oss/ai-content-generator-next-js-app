import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Kind = "instagram_post" | "instagram_stories" | "telegram_post" | "ad" | "product" | "content_plan";
type Language = "ru" | "uk" | "en";

type SearchResult = { AbstractText?: string; AbstractURL?: string };

const profiles: Record<Kind, { query: string; focus: string }> = {
  instagram_post: { query: "Instagram content best practices Meta Business", focus: "Meta Business и профессиональные рекомендации по Instagram" },
  instagram_stories: { query: "Instagram Stories restaurant best practices Meta Business", focus: "Meta Business и рекомендации для ресторанного контента" },
  telegram_post: { query: "Telegram channel content best practices", focus: "практики ведения Telegram-каналов" },
  ad: { query: "advertising copy best practices Google Ads Meta", focus: "Google Ads и Meta Business" },
  product: { query: "product description ecommerce best practices", focus: "практики e-commerce и описаний товаров" },
  content_plan: { query: "content marketing plan best practices", focus: "профессиональные практики контент-маркетинга" },
};

function isRestaurant(topic: string, details: string) {
  return /ресторан|кафе|бар|меню|блюд|десерт|restaurant|cafe|menu|food/i.test(`${topic} ${details}`);
}

function createText(topic: string, kind: Kind, language: Language, details: string, fact: string, url: string) {
  const note = details ? ` ${details}` : "";
  const title = language === "en" ? `Topic: ${topic}.` : language === "uk" ? `Тема: ${topic}.` : `Тема: ${topic}.`;
  const restaurant = isRestaurant(topic, details);
  const formats: Record<Kind, string> = {
    instagram_post: `✨ ${topic}

${title}${note}

Почему это стоит внимания?
• Понятная польза для аудитории
• Деталь, которую хочется рассмотреть
• Повод сохранить публикацию

Напишите нам в сообщения — расскажем подробнее.

#новинка #контент`,
    instagram_stories: restaurant
      ? `СТОРИС 1/5
НАСТРОЕНИЕ ДНЯ
${topic}

СТОРИС 2/5
Покажите крупным планом текстуру, подачу или атмосферу.

СТОРИС 3/5
Почему стоит попробовать?
${title}${note}

СТОРИС 4/5
Опрос: «Сладкое или солёное?»
[Сладкое] [Солёное]

СТОРИС 5/5
Забронируйте столик или заходите сегодня →`
      : `СТОРИС 1/5
${topic}

СТОРИС 2/5
Что в этом особенного?
${title}${note}

СТОРИС 3/5
Главная выгода — больше удобства и уверенности.

СТОРИС 4/5
Опрос: «Хотите узнать подробнее?»
[Да] [Конечно]

СТОРИС 5/5
Напишите нам «ХОЧУ» — расскажем всё важное.`,
    telegram_post: `**${topic}**

${title}${note}

Что важно знать:
— главное в первых двух строках
— одна конкретная польза
— простой следующий шаг

Хотите подробности? Напишите в комментариях.`,
    ad: `${topic}

${title}${note}

Одна понятная выгода. Один призыв к действию.

Узнать подробнее →`,
    product: `**${topic}**

${title}${note}

**Преимущества:**
• Польза для покупателя
• Практичная деталь
• Удобство в использовании

Добавьте в избранное, чтобы вернуться позже.`,
    content_plan: `Контент-план на 7 дней: ${topic}

День 1 — знакомство с идеей
День 2 — ключевая польза
День 3 — закулисье или процесс
День 4 — ответ на частый вопрос
День 5 — отзыв или пример
День 6 — сравнение «до / после»
День 7 — предложение и призыв к действию`,
  };
  const research = fact ? `

🔎 Справка из открытого поиска: ${fact}${url ? `
${url}` : ""}` : "";
  return formats[kind] + research;
}

async function research(topic: string, kind: Kind) {
  const searchUrl = new URL("https://api.duckduckgo.com/");
  searchUrl.searchParams.set("q", `${topic} ${profiles[kind].query}`);
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("no_html", "1");
  searchUrl.searchParams.set("skip_disambig", "1");
  try {
    const response = await fetch(searchUrl, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { fact: "", url: "" };
    const data = await response.json() as SearchResult;
    return { fact: data.AbstractText || "", url: data.AbstractURL || "" };
  } catch {
    return { fact: "", url: "" };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { topic?: unknown; details?: unknown; contentType?: unknown; language?: unknown };
    const kinds: Kind[] = ["instagram_post", "instagram_stories", "telegram_post", "ad", "product", "content_plan"];
    const languages: Language[] = ["ru", "uk", "en"];
    if (typeof body.topic !== "string" || !body.topic.trim()) return NextResponse.json({ error: "Укажите тему или продукт." }, { status: 400 });
    if (!kinds.includes(body.contentType as Kind) || !languages.includes(body.language as Language)) return NextResponse.json({ error: "Проверьте настройки генерации." }, { status: 400 });
    const topic = body.topic.trim();
    const kind = body.contentType as Kind;
    const details = typeof body.details === "string" ? body.details.trim() : "";
    const source = await research(topic, kind);
    return NextResponse.json({ text: createText(topic, kind, body.language as Language, details, source.fact, source.url), researchFocus: profiles[kind].focus });
  } catch {
    return NextResponse.json({ error: "Не удалось создать текст. Повторите попытку." }, { status: 500 });
  }
}
