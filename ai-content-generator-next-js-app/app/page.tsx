"use client";

import { FormEvent, useEffect, useState } from "react";

const contentTypes = [
  { id: "instagram_post", icon: "▦" }, { id: "instagram_stories", icon: "◫" }, { id: "telegram_post", icon: "✈" },
  { id: "ad", icon: "↗" }, { id: "product", icon: "◇" }, { id: "content_plan", icon: "✦" },
] as const;

const styles = [
  { id: "selling" }, { id: "expert" }, { id: "friendly" }, { id: "premium" },
] as const;

const translations = {
  ru: { lang: "ru", title: "ContentAI Generator — контент, который работает", ai: "Ваш AI-копирайтер", badge: "Тексты для бизнеса и соцсетей за минуты", hero: ["Идея есть.", "Слова найдутся."], intro: "Выберите формат, расскажите о своей задаче — ContentAI подготовит контент, который хочется дочитать.", create: "Создаём контент", steps: "Настройте задачу в трёх шагах", language: "Язык результата", format: "Выберите формат", topic: "Тема или продукт", topicPlaceholder: "Например: новая коллекция десертов", details: "Описание задачи", optional: "необязательно", detailsPlaceholder: "Расскажите о целевой аудитории, главной выгоде или желаемом призыве к действию", style: "Стиль текста", generate: "Сгенерировать контент", generating: "AI пишет текст…", result: "Ваш результат", resultHint: "Готовый текст появится здесь", empty: "Здесь будет ваш текст", emptyHint: "Заполните форму слева и нажмите «Сгенерировать контент».", copy: "Копировать текст", copied: "✓ Текст скопирован", ideas: "Не знаете, с чего начать?", validation: "Введите тему или название продукта — без неё AI не сможет начать.", fallback: "Что-то пошло не так. Попробуйте ещё раз.", types: [["Instagram пост", "публикация с призывом"], ["Instagram Stories", "серия вовлекающих экранов"], ["Telegram пост", "живой текст для канала"], ["Рекламное объявление", "коротко и убедительно"], ["Описание товара", "выгоды и характеристики"], ["Идея контент-плана", "темы, рубрики и рост"]], styles: ["Продающий", "Экспертный", "Дружелюбный", "Премиальный"], examples: ["новая коллекция десертов", "акция на кроссовки"] },
  uk: { lang: "uk", title: "ContentAI Generator — контент, що працює", ai: "Ваш AI-копірайтер", badge: "Тексти для бізнесу й соцмереж за хвилини", hero: ["Є ідея.", "Знайдуться слова."], intro: "Оберіть формат, розкажіть про своє завдання — ContentAI підготує контент, який хочеться дочитати.", create: "Створюємо контент", steps: "Налаштуйте завдання за три кроки", language: "Мова результату", format: "Оберіть формат", topic: "Тема або продукт", topicPlaceholder: "Наприклад: нова колекція десертів", details: "Опис завдання", optional: "необов’язково", detailsPlaceholder: "Розкажіть про аудиторію, головну перевагу або бажаний заклик до дії", style: "Стиль тексту", generate: "Згенерувати контент", generating: "AI пише текст…", result: "Ваш результат", resultHint: "Готовий текст з’явиться тут", empty: "Тут буде ваш текст", emptyHint: "Заповніть форму ліворуч і натисніть «Згенерувати контент».", copy: "Копіювати текст", copied: "✓ Текст скопійовано", ideas: "Не знаєте, з чого почати?", validation: "Введіть тему або назву продукту — без неї AI не зможе почати.", fallback: "Щось пішло не так. Спробуйте ще раз.", types: [["Instagram допис", "публікація із закликом"], ["Instagram Stories", "серія залучаючих екранів"], ["Telegram допис", "живий текст для каналу"], ["Рекламне оголошення", "коротко й переконливо"], ["Опис товару", "переваги та характеристики"], ["Ідея контент-плану", "теми, рубрики та зростання"]], styles: ["Продаючий", "Експертний", "Дружній", "Преміальний"], examples: ["нова колекція десертів", "акція на кросівки"] },
  en: { lang: "en", title: "ContentAI Generator — content that works", ai: "Your AI copywriter", badge: "Social and business copy in minutes", hero: ["You have the idea.", "Words will follow."], intro: "Choose a format, tell us about your task, and ContentAI will prepare copy people want to read.", create: "Create content", steps: "Set up your task in three steps", language: "Result language", format: "Choose a format", topic: "Topic or product", topicPlaceholder: "For example: a new dessert collection", details: "Task description", optional: "optional", detailsPlaceholder: "Tell us about the audience, key benefit, or desired call to action", style: "Writing style", generate: "Generate content", generating: "AI is writing…", result: "Your result", resultHint: "Your finished copy will appear here", empty: "Your copy will appear here", emptyHint: "Complete the form on the left and click “Generate content”.", copy: "Copy text", copied: "✓ Text copied", ideas: "Not sure where to start?", validation: "Enter a topic or product name so AI can get started.", fallback: "Something went wrong. Please try again.", types: [["Instagram post", "a post with a call to action"], ["Instagram Stories", "an engaging story sequence"], ["Telegram post", "lively copy for your channel"], ["Ad copy", "short and persuasive"], ["Product description", "benefits and features"], ["Content plan idea", "topics, formats, and growth"]], styles: ["Sales-focused", "Expert", "Friendly", "Premium"], examples: ["a new dessert collection", "a sneaker sale"] },
} as const;

const languages = [
  { id: "ru", label: "Русский", flag: "RU" },
  { id: "uk", label: "Українська", flag: "UA" },
  { id: "en", label: "English", flag: "EN" },
] as const;

export default function Home() {
  const [contentType, setContentType] = useState<(typeof contentTypes)[number]["id"]>("instagram_post");
  const [style, setStyle] = useState<(typeof styles)[number]["id"]>("friendly");
  const [language, setLanguage] = useState<(typeof languages)[number]["id"]>("ru");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = t.lang;
    document.title = t.title;
  }, [t]);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopied(false);
    if (!topic.trim()) {
      setError(t.validation);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, details, contentType, style, language }),
      });
      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !data.text) throw new Error(data.error ?? t.fallback);
      setResult(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.fallback);
    } finally {
      setLoading(false);
    }
  }

  async function copyText() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = result;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copiedWithFallback = document.execCommand("copy");
        textarea.remove();
        if (!copiedWithFallback) throw new Error("Copy is unavailable");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(t.fallback);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f8ff]">
      <div className="pointer-events-none absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#ded9ff] blur-3xl opacity-70" />
      <div className="pointer-events-none absolute right-[-15rem] top-[22rem] h-[36rem] w-[36rem] rounded-full bg-[#d8f9ee] blur-3xl opacity-70" />

      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight text-[#17152a]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#5b4cf0] text-lg text-white shadow-lg shadow-violet-200">✦</span>
            <span>ContentAI <span className="text-[#766e92]">Generator</span></span>
          </a>
          <span className="hidden rounded-full border border-[#e5e2f4] bg-white/70 px-4 py-2 text-xs font-medium text-[#716c89] sm:block">{t.ai}</span>
        </header>

        <div id="top" className="mx-auto max-w-3xl py-14 text-center sm:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#6054c9] shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#6ed3aa]" />{t.badge}</div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#19172b] sm:text-6xl">{t.hero[0]}<br /><span className="text-[#5b4cf0]">{t.hero[1]}</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#6f6983] sm:text-lg">{t.intro}</p>
        </div>

        <form onSubmit={generate} className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-glow backdrop-blur sm:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-[#26233c]">{t.create}</p><p className="mt-1 text-sm text-[#7d7890]">{t.steps}</p></div><div className="sm:text-right"><p className="mb-2 text-xs font-medium text-[#77718b]">{t.language}</p><div className="flex flex-wrap gap-1.5 sm:justify-end">{languages.map((item) => <button key={item.id} type="button" onClick={() => setLanguage(item.id)} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${language === item.id ? "border-[#6858f2] bg-[#f1efff] text-[#4d3fd4]" : "border-[#e8e5f0] bg-white text-[#716c80] hover:border-[#cfc9ff]"}`}><span className={`rounded px-1 py-0.5 text-[9px] font-bold ${language === item.id ? "bg-[#6858f2] text-white" : "bg-[#f3f2f7] text-[#77718b]"}`}>{item.flag}</span>{item.label}</button>)}</div></div></div>

            <label className="mb-3 block text-sm font-medium text-[#4c4861]">{t.format}</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {contentTypes.map((item, index) => <button key={item.id} type="button" onClick={() => setContentType(item.id)} className={`rounded-2xl border p-3 text-left transition ${contentType === item.id ? "border-[#6858f2] bg-[#f1efff] shadow-sm" : "border-[#eeecf5] bg-white hover:border-[#cfc9ff]"}`}><span className={`mb-2 grid h-7 w-7 place-items-center rounded-lg text-sm ${contentType === item.id ? "bg-[#6858f2] text-white" : "bg-[#f4f3f9] text-[#77718b]"}`}>{item.icon}</span><span className="block text-sm font-semibold text-[#38334f]">{t.types[index][0]}</span><span className="mt-1 block text-[11px] leading-4 text-[#878196]">{t.types[index][1]}</span></button>)}
            </div>

            <div className="mt-7 grid gap-5">
              <div><label htmlFor="topic" className="mb-2 block text-sm font-medium text-[#4c4861]">{t.topic} <span className="text-[#e75b68]">*</span></label><input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t.topicPlaceholder} className="w-full rounded-2xl border border-[#e8e5f0] bg-[#fcfcff] px-4 py-3.5 text-sm text-[#302d43] outline-none transition placeholder:text-[#aaa6b5] focus:border-[#8579f4] focus:ring-4 focus:ring-violet-100" /></div>
              <div><label htmlFor="details" className="mb-2 block text-sm font-medium text-[#4c4861]">{t.details} <span className="font-normal text-[#a39eae]">({t.optional})</span></label><textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder={t.detailsPlaceholder} className="w-full resize-none rounded-2xl border border-[#e8e5f0] bg-[#fcfcff] px-4 py-3.5 text-sm leading-6 text-[#302d43] outline-none transition placeholder:text-[#aaa6b5] focus:border-[#8579f4] focus:ring-4 focus:ring-violet-100" /></div>
            </div>

            <div className="mt-7"><label className="mb-3 block text-sm font-medium text-[#4c4861]">{t.style}</label><div className="flex flex-wrap gap-2">{styles.map((item, index) => <button key={item.id} type="button" onClick={() => setStyle(item.id)} className={`rounded-full px-4 py-2 text-sm transition ${style === item.id ? "bg-[#26233c] text-white shadow-md" : "bg-[#f5f4f8] text-[#716c80] hover:bg-[#ece9f8]"}`}>{t.styles[index]}</button>)}</div></div>
            {error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#bb4050]">{error}</p>}
            <button disabled={loading} type="submit" className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5b4cf0] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-[#4e40da] disabled:cursor-wait disabled:opacity-70">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{t.generating}</> : <>{t.generate} <span className="text-lg leading-none">→</span></>}</button>
          </section>

          <aside className="flex min-h-[420px] flex-col rounded-[2rem] border border-[#e9e7f2] bg-[#25233b] p-5 text-white shadow-xl shadow-indigo-100 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{t.result}</p><p className="mt-1 text-sm text-[#aaa6c0]">{t.resultHint}</p></div><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[#bdb7ff]">✦</span></div>
            {result ? <div className="mt-6 flex flex-1 flex-col"><div className="flex-1 whitespace-pre-wrap rounded-2xl bg-white/[0.07] p-5 text-sm leading-7 text-[#f0eff7]">{result}</div><button type="button" onClick={copyText} className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#38334f] transition hover:bg-[#e9e7ff]">{copied ? t.copied : t.copy}</button></div> : <div className="grid flex-1 place-items-center py-12 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/[0.07] text-3xl text-[#bdb7ff]">✧</div><p className="mt-5 text-sm font-medium text-[#ddd9ef]">{t.empty}</p><p className="mx-auto mt-2 max-w-[15rem] text-xs leading-5 text-[#9691ad]">{t.emptyHint}</p></div></div>}
          </aside>
        </form>

        <section className="mt-8 rounded-[1.75rem] border border-[#ebe8f4] bg-white/70 px-5 py-5 sm:px-7"><p className="text-sm font-semibold text-[#4a465e]">{t.ideas}</p><div className="mt-3 flex flex-wrap gap-2">{t.examples.map((example) => <button key={example} type="button" onClick={() => setTopic(example)} className="rounded-full bg-[#f2f0fb] px-3 py-2 text-xs text-[#655f7b] transition hover:bg-[#e6e1ff]">«{example}»</button>)}</div></section>
      </section>
    </main>
  );
}
