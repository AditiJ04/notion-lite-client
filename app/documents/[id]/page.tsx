"use client";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CollaborativeEditor, {
  CollaborativeEditorHandle,
} from "@/components/CollaborativeEditor";
import VersionHistory from "@/components/VersionHistory";
import Comments from "@/components/Comments";
import Share from "@/components/Share";

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; color: string } | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [pendingSelection, setPendingSelection] = useState<{
    from: number;
    to: number;
    text: string;
  } | null>(null);
  const editorRef = useRef<CollaborativeEditorHandle>(null);
  const supabase = createClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session?.access_token}` };
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user)
        setUser({ name: data.user.email ?? "Anonymous", color: "#5B4EF2" });
    });

    getAuthHeader().then(async (headers) => {
      const res = await fetch(`${apiUrl}/documents/${id}`, { headers });
      const doc = await res.json();
      setTitle(doc.title ?? "Untitled");
    });
  }, [id]);

  if (!user) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#F6F4EF",
          fontFamily: "Inter, sans-serif",
          color: "#8A8580",
        }}
      >
        Loading…
      </main>
    );
  }

  const handleRestore = (base64Data: string) => {
    editorRef.current?.restoreVersion(base64Data);
  };

  const handleCheckSelection = () => {
    setPendingSelection(editorRef.current?.getSelection() ?? null);
  };

  const handleCommentClick = (from: number, to: number) => {
    editorRef.current?.focusComment(from, to);
  };

  const handleTitleBlur = async () => {
    const headers = await getAuthHeader();
    await fetch(`${apiUrl}/documents/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    const headers = await getAuthHeader();
    await fetch(`${apiUrl}/documents/${id}`, { method: "DELETE", headers });
    router.push("/documents");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F6F4EF" }}>
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid #E5E2DA",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link
            href="/documents"
            style={{ fontFamily: "Inter, sans-serif", color: "#8A8580" }}
            className="text-sm hover:opacity-70 transition-opacity shrink-0"
          >
            ← Documents
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="text-sm font-medium outline-none bg-transparent min-w-0 flex-1"
            style={{ fontFamily: "Inter, sans-serif", color: "#1B1B1F" }}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Share documentId={id} />
          <button
            onClick={handleCheckSelection}
            className="rounded-full px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              fontFamily: "Inter, sans-serif",
              backgroundColor: "#FDF3DA",
              color: "#8A6D1F",
            }}
          >
            💬 Comment on selection
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ fontFamily: "Inter, sans-serif", color: "#B3261E" }}
          >
            Delete
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ fontFamily: "Inter, sans-serif", color: "#8A8580" }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_320px] gap-6 px-6 py-8">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E2DA" }}
        >
          <CollaborativeEditor
            ref={editorRef}
            documentId={id}
            userName={user.name}
            userColor={user.color}
          />
        </div>

        <div className="space-y-6">
          <Comments
            documentId={id}
            pendingSelection={pendingSelection}
            onCommentAdded={() => setPendingSelection(null)}
            onCommentClick={handleCommentClick}
          />
          <VersionHistory documentId={id} onRestore={handleRestore} />
        </div>
      </div>
    </main>
  );
}
