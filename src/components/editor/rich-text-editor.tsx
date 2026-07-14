// filepath: src/components/editor/rich-text-editor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Code,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "본문을 입력하세요…",
  className = "",
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[220px] px-4 py-3 focus:outline-none text-foreground",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    //만 외부 value 변경 시 동기화 (초기/저장 후)
    if (value !== current && value !== editor.getText()) {
      const empty = !value || value === "<p></p>";
      const curEmpty = current === "<p></p>" || !editor.getText().trim();
      if (empty && curEmpty) return;
      if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL", prev || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function addImage() {
    const url = window.prompt("이미지 URL");
    if (!url?.trim()) return;
    editor!.chain().focus().setImage({ src: url.trim() }).run();
  }

  const btn = (active: boolean) =>
    `rounded p-1.5 ${active ? "bg-primary/15 text-primary" : "hover:bg-accent text-muted-foreground"}`;

  return (
    <div className={`rounded-xl border border-border bg-white overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-accent/40 px-2 py-1.5">
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="굵게">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="기울임">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="제목">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="목록">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="번호 목록">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive("link"))} onClick={setLink} title="링크">
          <LinkIcon className="h-4 w-4" />
        </button>
        <button type="button" className={btn(false)} onClick={addImage} title="이미지">
          <ImageIcon className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="HTML/코드">
          <Code className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()} title="실행 취소">
          <Undo className="h-4 w-4" />
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()} title="다시 실행">
          <Redo className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
      <details className="border-t border-border bg-muted/30 px-3 py-2 text-xs">
        <summary className="cursor-pointer text-muted-foreground">HTML 소스 직접 편집</summary>
        <textarea
          className="mt-2 w-full min-h-[100px] rounded-lg border border-border bg-white p-2 font-mono text-[11px]"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            editor.commands.setContent(e.target.value || "", { emitUpdate: false });
          }}
        />
      </details>
    </div>
  );
}
