"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { uploadImage } from "@/app/admin/actions";

function Btn({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-8 border px-2 py-1 font-display text-[11px] font-bold tracking-[0.05em] transition-colors ${
        active
          ? "border-tincture bg-tincture text-paper"
          : "border-rule bg-card text-ink-soft hover:border-tincture hover:text-tincture"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onPickImage }: { editor: Editor; onPickImage: () => void }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") return void editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-rule p-2">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        B
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <span className="italic">I</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
        <span className="underline">U</span>
      </Btn>
      <span className="mx-1 w-px bg-rule" />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        H3
      </Btn>
      <span className="mx-1 w-px bg-rule" />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        • List
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        1. List
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        &ldquo; &rdquo;
      </Btn>
      <span className="mx-1 w-px bg-rule" />
      <Btn onClick={setLink} active={editor.isActive("link")}>
        Link
      </Btn>
      <Btn onClick={onPickImage}>Image</Btn>
    </div>
  );
}

export function RichEditor({ name, initialHtml = "" }: { name: string; initialHtml?: string }) {
  const [html, setHtml] = useState(initialHtml);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, horizontalRule: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  async function insertImage(file: File) {
    if (!editor) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "blog");
    const res = await uploadImage(fd);
    setUploading(false);
    if (res.url) editor.chain().focus().setImage({ src: res.url }).run();
  }

  return (
    <div className="border border-rule-strong bg-card">
      <input type="hidden" name={name} value={html} />
      {editor && <Toolbar editor={editor} onPickImage={() => fileRef.current?.click()} />}
      <div className="px-4 py-3 text-base [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:outline-none [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-tincture [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:font-display [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:font-display [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_a]:text-tincture [&_.ProseMirror_a]:underline [&_.ProseMirror_img]:my-3 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6">
        <EditorContent editor={editor} />
        {uploading && <p className="mt-2 text-base italic text-ink-faint">Uploading image…</p>}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) insertImage(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
