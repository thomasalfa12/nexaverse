import type { FullModuleData } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TextModuleView({ module }: { module: FullModuleData }) {
  if (!module.textContent) return null;

  return (
    <ScrollArea className="h-full">
      <div className="p-8 lg:p-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {module.title}
        </h1>
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypePrism]}
          >
            {module.textContent.content}
          </ReactMarkdown>
        </article>
      </div>
    </ScrollArea>
  );
}
