"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface ArticleRendererProps {
  htmlContent: string;
}

export function ArticleRenderer({ htmlContent }: ArticleRendererProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: true }),
    ],
    content: htmlContent,
    editable: false,
    immediatelyRender: false,
  });

  return (
    <div className="prose prose-neutral max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:bg-accent/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-strong:text-foreground prose-p:leading-relaxed">
      <EditorContent editor={editor} />
    </div>
  );
}
