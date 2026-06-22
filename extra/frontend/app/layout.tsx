import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Task — AI Agent Engineering Showcase",
    template: "%s | Task",
  },
  description:
    "10 Cursor coding agents and 14 runnable project sandboxes for repository analysis, architecture discovery, testing, implementation, and infra engineering.",
  keywords: [
    "AI Agents", "Software Engineering Agents", "Repository Analysis",
    "Code Understanding", "Documentation Automation", "Architecture Discovery",
    "Testing Automation", "Cursor Agents",
  ],
  openGraph: {
    title: "Task — AI Agent Engineering Showcase",
    description: "Specialized AI agents for real software engineering workflows",
    type: "website",
    url: "https://github.com/t-divyanshupatel/Task",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "Task — AI Agent Engineering Library",
  description: "10 Cursor agents and 14 project sandboxes for software engineering evaluation",
  codeRepository: "https://github.com/t-divyanshupatel/Task",
  programmingLanguage: ["Python", "TypeScript", "Rust", "JavaScript"],
  applicationCategory: "DeveloperApplication",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
