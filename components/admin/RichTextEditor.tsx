"use client";

import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImageFile } from "./upload-client";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-40",
        active && "border-primary bg-primary/10 text-primary",
      )}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({ value, onChange }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
      }),
      Image,
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose max-w-none min-h-[320px] p-4 focus:outline-none" },
    },
  });

  if (!editor) return <div className="min-h-[360px] rounded-lg border" />;

  function setLink() {
    const previous = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập đường dẫn (để trống để gỡ link)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor!.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function insertImage(file: File) {
    try {
      const url = await uploadImageFile(file);
      editor!.chain().focus().setImage({ src: url, alt: "" }).run();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tải được ảnh");
    }
  }

  const inTable = editor.isActive("table");

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex flex-wrap gap-1 border-b p-2">
        <ToolButton label="B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolButton label="I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolButton label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolButton label="• Danh sách" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolButton label="1. Danh sách" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolButton label="Link" active={editor.isActive("link")} onClick={setLink} />
        <ToolButton label="Ảnh" onClick={() => fileInput.current?.click()} />
        <ToolButton
          label="Bảng"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        {inTable && (
          <>
            <ToolButton label="+ Hàng" onClick={() => editor.chain().focus().addRowAfter().run()} />
            <ToolButton label="- Hàng" onClick={() => editor.chain().focus().deleteRow().run()} />
            <ToolButton label="+ Cột" onClick={() => editor.chain().focus().addColumnAfter().run()} />
            <ToolButton label="- Cột" onClick={() => editor.chain().focus().deleteColumn().run()} />
            <ToolButton label="Xóa bảng" onClick={() => editor.chain().focus().deleteTable().run()} />
          </>
        )}
        <ToolButton label="Hoàn tác" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolButton label="Làm lại" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) insertImage(file);
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
