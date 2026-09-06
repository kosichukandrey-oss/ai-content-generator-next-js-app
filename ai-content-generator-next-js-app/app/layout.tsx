import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentAI Generator — контент, который работает",
  description: "AI-помощник для создания контента для соцсетей и бизнеса.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
