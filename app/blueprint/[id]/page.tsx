"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { exportBlueprintToPDF } from "@/lib/pdfExport";
import Link from "next/link";

interface Blueprint {
  id: string;
  projectName: string;
  idea: string;
  features: {
    mvp: string[];
    phase2: string[];
    phase3: string[];
  };
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  };
  database: {
    tables: Array<{
      name: string;
      fields: string[];
      relations: string;
    }>;
  };
  roadmap: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  createdAt: string;
  isPublic?: boolean;
  shareToken?: string;
}

export default function BlueprintPage() {
  const params = useParams();
  const router = useRouter();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copying, setCopying] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const fetchBlueprint = useCallback(async () => {
    try {
      const res = await fetch(`/api/blueprints/${params.id}`);
      if (res.ok) {
        const data: Blueprint = await res.json();
        setBlueprint(data);
      } else if (res.status === 404) {
        router.push("/history");
      }
    } catch (error) {
      console.error("Error fetching blueprint:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchBlueprint();
  }, [fetchBlueprint]);

  useEffect(() => {
    if (blueprint?.isPublic && blueprint?.shareToken) {
      setIsShared(true);
      setShareUrl(`${window.location.origin}/share/${blueprint.shareToken}`);
    }
  }, [blueprint]);

  const regenerateSection = async (section: string) => {
    setRegenerating(section);
    setShowEditModal(false);

    try {
      const res = await fetch(`/api/blueprints/${params.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBlueprint(updated);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error regenerating section:", error);
      alert("Failed to regenerate section");
    } finally {
      setRegenerating(null);
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetch(`/api/blueprints/${params.id}/share`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.shareUrl);
        setIsShared(true);
        setShowShareModal(true);
        fetchBlueprint();
      } else {
        alert("Failed to share blueprint");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share blueprint");
    }
  };

  const handleUnshare = async () => {
    if (!confirm("Are you sure you want to make this blueprint private?"))
      return;

    try {
      const res = await fetch(`/api/blueprints/${params.id}/share`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsShared(false);
        setShareUrl("");
        fetchBlueprint();
      }
    } catch (error) {
      console.error("Error unsharing:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadMarkdown = () => {
    if (!blueprint) return;
    setShowDownloadMenu(false);

    const markdown = `# ${blueprint.projectName}

## Original Idea
${blueprint.idea}

## Features

### MVP (Phase 1)
${blueprint.features.mvp.map((f) => `- ${f}`).join("\n")}

### Phase 2
${blueprint.features.phase2.map((f) => `- ${f}`).join("\n")}

### Phase 3
${blueprint.features.phase3.map((f) => `- ${f}`).join("\n")}

## Tech Stack
- **Frontend:** ${blueprint.techStack.frontend}
- **Backend:** ${blueprint.techStack.backend}
- **Database:** ${blueprint.techStack.database}
- **Auth:** ${blueprint.techStack.auth}
- **Hosting:** ${blueprint.techStack.hosting}

## Database Schema
${JSON.stringify(blueprint.database, null, 2)}

## Development Roadmap

### Month 1
${blueprint.roadmap.month1.map((t) => `- ${t}`).join("\n")}

### Month 2
${blueprint.roadmap.month2.map((t) => `- ${t}`).join("\n")}

### Month 3
${blueprint.roadmap.month3.map((t) => `- ${t}`).join("\n")}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.projectName.replace(/\s+/g, "-")}-blueprint.md`;
    a.click();
  };

  const downloadPDF = () => {
    if (!blueprint) return;
    setShowDownloadMenu(false);
    exportBlueprintToPDF(blueprint);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading blueprint...</p>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Blueprint not found
          </h2>
          <Link href="/history" className="text-blue-500 hover:underline">
            Go back to history
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <nav className="border-b border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            AI Blueprint Generator
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/history"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              History
            </Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Regenerate Section
            </h2>
            <p className="text-gray-400 mb-6">
              Select which section you did like to regenerate with AI:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => regenerateSection("features")}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-left"
              >
                🎯 Features Roadmap
              </button>
              <button
                onClick={() => regenerateSection("techStack")}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-left"
              >
                🛠️ Tech Stack
              </button>
              <button
                onClick={() => regenerateSection("database")}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-left"
              >
                🗄️ Database Schema
              </button>
              <button
                onClick={() => regenerateSection("roadmap")}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition text-left"
              >
                📅 Development Roadmap
              </button>
            </div>
            <button
              onClick={() => setShowEditModal(false)}
              className="w-full mt-4 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              🔗 Share Blueprint
            </h2>
            <p className="text-gray-400 mb-6">
              Anyone with this link can view your blueprint (no login required)
            </p>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">Share Link:</p>
              <p className="text-white break-all text-sm">{shareUrl}</p>
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-3"
            >
              {copying ? "✅ Copied!" : "📋 Copy Link"}
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {blueprint.projectName}
              </h1>
              <p className="text-gray-400">{blueprint.idea}</p>
              <p className="text-sm text-gray-500 mt-2">
                Created{" "}
                {new Date(blueprint.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-end">
              {isShared ? (
                <>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    🔗 Shared
                  </button>
                  <button
                    onClick={handleUnshare}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    🔒 Unshare
                  </button>
                </>
              ) : (
                <button
                  onClick={handleShare}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  🔗 Share
                </button>
              )}
              <button
                onClick={() => setShowEditModal(true)}
                disabled={!!regenerating}
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                ✏️ Edit
              </button>

              {/* Download Dropdown */}
              {/* Download Dropdown - FIXED VERSION */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  📥 Download ▼
                </button>
                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        downloadMarkdown();
                      }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-t-lg transition"
                    >
                      📄 Markdown (.md)
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        downloadPDF();
                      }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 rounded-b-lg transition"
                    >
                      📕 PDF Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {regenerating && (
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-white">
                Regenerating {regenerating}... This may take 10-20 seconds.
              </span>
            </div>
          )}

          <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {(["mvp", "phase2", "phase3"] as const).map((phase) => (
                <div key={phase}>
                  <h4 className="font-semibold text-gray-300 mb-2 capitalize">
                    {phase === "mvp" ? "MVP" : phase.replace("phase", "Phase ")}
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {blueprint.features[phase].map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">🛠️ Tech Stack</h3>
            <ul className="space-y-1">
              {Object.entries(blueprint.techStack).map(([k, v]) => (
                <li key={k}>
                  <span className="font-semibold text-gray-300 capitalize">
                    {k}:
                  </span>{" "}
                  {v}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              🗄️ Database Schema
            </h3>
            <pre className="bg-black border border-gray-700 p-4 rounded-lg text-sm overflow-x-auto text-gray-200">
              {JSON.stringify(blueprint.database, null, 2)}
            </pre>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">📅 Roadmap</h3>
            {Object.entries(blueprint.roadmap).map(([month, tasks]) => (
              <div key={month} className="mb-4">
                <h4 className="font-semibold text-gray-300">
                  {month.replace("month", "Month ")}
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
