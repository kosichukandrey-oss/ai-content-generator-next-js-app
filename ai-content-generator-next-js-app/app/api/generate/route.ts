import { NextResponse } from "next/server";

type Kind = "instagram_post" | "instagram_stories" | "telegram_post" | "ad" | "product" | "content_plan";
type Language = "ru" | "uk" | "en";

function text(topic: string, kind: Kind, language: Language, details: string) {
  const note = details ? ` ${details}` : "";
  const title = language === "en" ? `Topic: ${topic}.` : language === "uk" ? `Тема: ${topic}.` : `Тема: ${topic}.`;
  const formats: Record<Kind, string> = {
    instagram_post: `✨ ${topic}\n\n${title}${note}\n\nПочему это стоит внимания?\n• Понятная польза\n• Продуманные детали\n• Приятный выбор на каждый день\n\nСохраните пост и напишите нам в сообщения.\n\n#новинка #контент`,
    instagram_stories: `СТОРИС 1/5\n${topic}\n\nСТОРИС 2/5\n${title}${note}\n\nСТОРИС 3/5\nГлавная выгода — больше удобства и уверенности.\n\nСТОРИС 4/5\nОпрос: «Хотите узнать подробнее?»\n[Да] [Конечно]\n\nСТОРИС 5/5\nНапишите нам «ХОЧУ» — расскажем всё важное.`,
    telegram_post: `**${topic}**\n\n${title}${note}\n\nЧто важно знать:\n— понятная польза\n— внимание к качеству\n— легко начать уже сегодня\n\nХотите подробности? Напишите в комментариях.`,
    ad: `${topic}\n\n${title}${note}\n\nВыберите то, что делает обычное лучше.\n\nУзнать подробнее →`,
    product: `**${topic}**\n\n${title}${note}\n\n**Преимущества:**\n• Практичный выбор\n• Внимание к деталям\n• Удобно использовать\n\nДобавьте в избранное, чтобы вернуться позже.`,
    content_plan: `Контент-план на 7 дней: ${topic}\n\nДень 1 — знакомство с идеей\nДень 2 — ключевая польза\nДень 3 — закулисье\nДень 4 — ответ на вопрос\nДень 5 — отзыв\nДень 6 — сравнение «до / после»\nДень 7 — предложение и призыв к действию`,
  };
  return formats[kind];
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { topic?: unknown; details?: unknown; contentType?: unknown; language?: unknown };
    const kinds: Kind[] = ["instagram_post", "instagram_stories", "telegram_post", "ad", "product", "content_plan"];
    const languages: Language[] = ["ru", "uk", "en"];
    if (typeof body.topic !== "string" || !body.topic.trim()) return NextResponse.json({ error: "Укажите тему или продукт." }, { status: 400 });
    if (!kinds.includes(body.contentType as Kind) || !languages.includes(body.language as Language)) return NextResponse.json({ error: "Проверьте настройки генерации." }, { status: 400 });
    return NextResponse.json({ text: text(body.topic.trim(), body.contentType as Kind, body.language as Language, typeof body.details === "string" ? body.details.trim() : "") });
  } catch {
    return NextResponse.json({ error: "Не удалось создать текст. Повторите попытку." }, { status: 500 });
  }
}
