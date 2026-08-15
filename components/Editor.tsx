"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

type EditorProps = {
  content: JSONContent;
  onSave: (json: JSONContent) => void;
};

export default function Editor({
  content,
  onSave,
}: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
  });

  useEffect(() => {
    if (!editor) return;

    const handleBlur = () => {
      onSave(editor.getJSON());
    };

    editor.on("blur", handleBlur);

    return () => {
      editor.off("blur", handleBlur);
    };
  }, [editor, onSave]);

  return (
    <EditorContent
      editor={editor}
      className="prose max-w-none p-4"
    />
  );
}