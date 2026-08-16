"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { io, Socket } from "socket.io-client";
import {
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import RemoteCursors, {
  remoteCursorsPluginKey,
  RemoteCursor,
} from "./RemoteCursors";

export interface CollaborativeEditorHandle {
  restoreVersion: (base64Data: string) => void;
  getSelection: () => { from: number; to: number; text: string } | null;
  focusComment: (from: number, to: number) => void;
}

interface Props {
  documentId: string;
  userName: string;
  userColor: string;
}

const CollaborativeEditor = forwardRef<CollaborativeEditorHandle, Props>(
  function CollaborativeEditor({ documentId, userName, userColor }, ref) {
    const ydoc = useMemo(() => new Y.Doc(), [documentId]);
    const socketRef = useRef<Socket | null>(null);
    const remoteCursors = useRef<Record<string, RemoteCursor>>({});

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({ document: ydoc }),
        RemoteCursors,
      ],
      onSelectionUpdate: ({ editor }) => {
        socketRef.current?.emit("cursor-update", {
          documentId,
          cursor: {
            from: editor.state.selection.from,
            name: userName,
            color: userColor,
          },
        });
      },
    });

    useEffect(() => {
      let socket: Socket;

      const connect = async () => {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          auth: { token },
        });
        socketRef.current = socket;
        socket.emit("join-document", documentId);

        const updateHandler = (update: Uint8Array, origin: unknown) => {
          if (origin === "remote") return;
          socket.emit("yjs-update", { documentId, update });
        };
        ydoc.on("update", updateHandler);

        socket.on("yjs-update", (update: ArrayBuffer | Uint8Array) => {
          Y.applyUpdate(ydoc, new Uint8Array(update), "remote");
        });

        socket.on(
          "cursor-update",
          ({
            socketId,
            cursor,
          }: {
            socketId: string;
            cursor: RemoteCursor;
          }) => {
            remoteCursors.current = {
              ...remoteCursors.current,
              [socketId]: cursor,
            };
            if (editor) {
              const tr = editor.state.tr.setMeta(
                remoteCursorsPluginKey,
                remoteCursors.current,
              );
              editor.view.dispatch(tr);
            }
          },
        );

        socket.on("cursor-left", ({ socketId }: { socketId: string }) => {
          const updated = { ...remoteCursors.current };
          delete updated[socketId];
          remoteCursors.current = updated;
          if (editor) {
            const tr = editor.state.tr.setMeta(remoteCursorsPluginKey, updated);
            editor.view.dispatch(tr);
          }
        });
      };

      connect();

      return () => {
        ydoc.off("update", () => {});
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }, [documentId, editor]);

    useImperativeHandle(ref, () => ({
      restoreVersion: (base64Data: string) => {
        const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const oldDoc = new Y.Doc();
        Y.applyUpdate(oldDoc, bytes);
        const oldFragment = oldDoc.getXmlFragment("default");
        const currentFragment = ydoc.getXmlFragment("default");
        const clonedNodes = oldFragment.toArray().map((node) => node.clone());
        ydoc.transact(() => {
          currentFragment.delete(0, currentFragment.length);
          currentFragment.insert(
            0,
            clonedNodes as (Y.XmlElement | Y.XmlText)[],
          );
        });
      },
      getSelection: () => {
        if (!editor) return null;
        const { from, to } = editor.state.selection;
        if (from === to) return null;
        const text = editor.state.doc.textBetween(from, to, " ");
        return { from, to, text };
      },
      focusComment: (from: number, to: number) => {
        if (!editor) return;
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .scrollIntoView()
          .run();
      },
    }));

    return (
      <EditorContent
        editor={editor}
        className="prose max-w-none p-6 min-h-[70vh] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[70vh]"
      />
    );
  },
);

export default CollaborativeEditor;
