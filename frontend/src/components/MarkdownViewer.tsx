"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <article className="markdown-body prose prose-invert prose-sm sm:prose-base max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 text-2xl font-bold tracking-tight text-white first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-8 border-b border-white/10 pb-2 text-xl font-semibold text-white/95">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-lg font-semibold text-white/90">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-7 text-zinc-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1.5 pl-6 text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1.5 pl-6 text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-emerald-200/90">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-sm text-emerald-300">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-0">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/5">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-white/90">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-zinc-300">{children}</td>
          ),
          tr: ({ children }) => (
            <tr className="border-t border-white/5 even:bg-white/[0.02]">
              {children}
            </tr>
          ),
          hr: () => <hr className="my-8 border-white/10" />,
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-violet-500/50 pl-4 italic text-zinc-400">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-sky-400 underline decoration-sky-400/30 underline-offset-2 transition hover:text-sky-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
