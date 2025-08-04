// File: components/learning/TextModuleView.tsx (LENGKAP)
import type { FullModuleData } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function TextModuleView({ module }: { module: FullModuleData }) {
  const content = module.textContent?.content;
  if (!content)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Konten teks tidak tersedia.
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
        {module.title}
      </h1>
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
