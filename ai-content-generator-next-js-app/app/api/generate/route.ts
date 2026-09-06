import { NextResponse } from "next/server";

export const runtime = "nodejs";

const contentLabels = {
  instagram_post: "Instagram post",
  instagram_stories: "Instagram Stories",
  telegram_post: "Telegram post",
  ad: "ad",
  product: "product description",
  content_plan: "content plan",
} as const;

const styleLabels = {
  selling: "sales-focused",
  expert: "expert",
  friendly: "friendly",
  premium: "premium",
} as const;

type ContentType = keyof typeof contentLabels;
type Style = keyof typeof styleLabels;
type Language = "ru" | "uk" | "en";

type SearchResult = {
  AbstractText?: string;
  AbstractURL?: string;
  RelatedTopics?: Array<{ Text?: string; FirstURL?: string; Topics?: SearchResult["RelatedTopics"] }>;
};

const isContentType = (value: unknown): value is ContentType =>
  typeof value === "string" && value in contentLabels;
const isStyle = (value: unknown): value is Style =>
  typeof value === "string" && value in styleLabels;
const isLanguage = (value: unknown): value is Language =>
  value === "ru" || value === "uk" || value === "en";

function firstRelatedTopic(topics: SearchResult["RelatedTopics"]): { text?: string; url?: string } {
  for (const topic of topics ?? []) {
    if (topic.Text) return { text: topic.Text, url: topic.FirstURL };
    const nested = firstRelatedTopic(topic.Topics);
    if (nested.text) return nested;
  }
  return {};
}

function createText({ topic, details, contentType, style, language, fact, sourceUrl }: {
  topic: string;
  details: string;
  contentType: ContentType;
  style: Style;
  language: Language;
  fact: string;
  sourceUrl?: string;
}) {
  const source = fact ? `\n\n🔎 ${language === "uk" ? "Довідка" : language === "en" ? "Background" : "Справка"}: ${fact}${sourceUrl ? `\n${sourceUrl}` : ""}` : "";
  const tone = styleLabels[style];
  const task = details ? ` ${details}` : "";

  if (language === "en") {
    const base = `Topic: ${topic}. Tone: ${tone}.${task}`;
    const templates: Record<ContentType, string> = {
      instagram_post: `✨ ${topic}\n\nA fresh reason to pay attention. ${base}\n\nSave this post and share it with someone who will love it.\n\n#content #idea #new`,
      instagram_stories: `Story 1 — ${topic}\nStory 2 — Why it matters: ${base}\nStory 3 — Your turn: tap, reply, or visit us today.`,
      telegram_post: `**${topic}**\n\n${base}\n\nThe key point: make the next step simple. Tell us what you think in the comments.`,
      ad: `${topic}\n\n${base}\n\nDiscover it today →`,
      product: `**${topic}**\n\nMade for people who value a thoughtful choice. ${base}\n\n• Clear benefit\n• Convenient use\n• Worth trying`,
      content_plan: `Content plan: ${topic}\n\n1. Introduce the idea\n2. Show a real benefit\n3. Answer a common question\n4. Share a review\n5. Invite people to act\n\n${base}`,
    };
    return templates[contentType] + source;
  }

  if (language === "uk") {
    const base = `Тема: ${topic}. Стиль: ${style === "selling" ? "продаючий" : style === "expert" ? "експертний" : style === "premium" ? "преміальний" : "дружній"}.${task}`;
    const templates: Record<ContentType, string> = {
      instagram_post: `✨ ${topic}\n\nЧас звернути увагу на те, що може вас приємно здивувати. ${base}\n\nЗбережіть допис і поділіться з тим, кому це буде цікаво.\n\n#контент #ідея #новинка`,
      instagram_stories: `Сторіс 1 — ${topic}\nСторіс 2 — Чому це важливо: ${base}\nСторіс 3 — Напишіть нам або переходьте дізнатися більше.`,
      telegram_post: `**${topic}**\n\n${base}\n\nГоловне — зробити наступний крок простим. Що думаєте?`,
      ad: `${topic}\n\n${base}\n\nСпробуйте вже сьогодні →`,
      product: `**${topic}**\n\nПродуманий вибір для тих, хто цінує якість. ${base}\n\n• Зрозуміла перевага\n• Зручність\n• Варто спробувати`,
      content_plan: `Контент-план: ${topic}\n\n1. Познайомте з ідеєю\n2. Покажіть користь\n3. Дайте відповідь на запитання\n4. Додайте відгук\n5. Запросіть до дії\n\n${base}`,
    };
    return templates[contentType] + source;
  }

  const base = `Тема: ${topic}. Стиль: ${style === "selling" ? "продающий" : style === "expert" ? "экспертный" : style === "premium" ? "премиальный" : "дружелюбный"}.${task}`;
  const templates: Record<ContentType, string> = {
    instagram_post: `✨ ${topic}\n\n${base}\n\nПочему стоит обратить внимание?\n• Подходит тем, кто ценит продуманный выбор\n• Помогает получить больше от привычного\n• Оставляет приятное впечатление\n\nСохраните пост, чтобы не потерять, и напишите нам в сообщения.\n\n#${topic.replace(/\s+/g, "").toLowerCase()} #новинка #контент`,
    instagram_stories: `СТОРИС 1/5\n${topic}\n\nСТОРИС 2/5\nЧто в этом особенного?\n${base}\n\nСТОРИС 3/5\nГлавная выгода — больше удобства и уверенности в выборе.\n\nСТОРИС 4/5\nОпрос: «Хотите узнать подробнее?»\n[Да] [Конечно]\n\nСТОРИС 5/5\nНапишите нам слово «ХОЧУ» — расскажем всё самое важное.`,
    telegram_post: `**${topic}**\n\n${base}\n\nЧто важно знать:\n— понятная польза без лишнего\n— выбор для тех, кто ценит качество\n— легко начать уже сегодня\n\nХотите подробности? Напишите в комментариях или личных сообщениях.`,
    ad: `${topic}\n\n${base}\n\nВыберите то, что делает обычное лучше.\n\nУзнать подробнее →`,
    product: `**${topic}**\n\nКоротко о товаре\n${base}\n\n**Преимущества:**\n• Практичный выбор на каждый день\n• Внимание к деталям\n• Удобно использовать\n\nДобавьте в избранное, чтобы вернуться к нему позже.`,
    content_plan: `Контент-план на 7 дней: ${topic}\n\nДень 1 — знакомство: почему появилась эта идея\nДень 2 — ключевая польза для клиента\nДень 3 — закулисье или процесс\nДень 4 — ответ на частый вопрос\nДень 5 — отзыв или пример использования\nДень 6 — сравнение «до / после»\nДень 7 — предложение и призыв к действию\n\n${base}`,
  };
  return templates[contentType] + source;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const { topic, details, contentType, style, language } = body as Record<string, unknown>;

    if (typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Укажите тему или продукт." }, { status: 400 });
    }
    if (!isContentType(contentType) || !isStyle(style) || !isLanguage(language)) {
      return NextResponse.json({ error: "Проверьте выбранный тип, стиль и язык." }, { status: 400 });
    }

    const searchUrl = new URL("https://api.duckduckgo.com/");
    searchUrl.searchParams.set("q", topic.trim());
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("no_html", "1");
    searchUrl.searchParams.set("no_redirect", "1");
    searchUrl.searchParams.set("skip_disambig", "1");

    const response = await fetch(searchUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Search service is unavailable");

    const search = (await response.json()) as SearchResult;
    const related = firstRelatedTopic(search.RelatedTopics);
    const fact = search.AbstractText || related.text || "";
    const sourceUrl = search.AbstractURL || related.url;

    return NextResponse.json({
      text: createText({
        topic: topic.trim(),
        details: typeof details === "string" ? details.trim() : "",
        contentType,
        style,
        language,
        fact,
        sourceUrl,
      }),
    });
  } catch (error) {
    console.error("Content research failed:", error);
    return NextResponse.json(
      { error: "Не удалось получить информацию из поиска. Проверьте подключение и повторите попытку." },
      { status: 502 },
    );
  }
}
