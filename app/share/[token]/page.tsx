"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
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
}

export default function SharedBlueprintPage() {
  const params = useParams();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const fetchBlueprint = useCallback(async () => {
    try {
      const res = await fetch(`/api/share/${params.token}`);
      if (res.ok) {
        const data: Blueprint = await res.json();
        setBlueprint(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching blueprint:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [params.token]);

  useEffect(() => {
    fetchBlueprint();
  }, [fetchBlueprint]);

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

---
Generated with AI Blueprint Generator
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
          <p className="mt-4">Loading shared blueprint...</p>
        </div>
      </div>
    );
  }

  if (notFound || !blueprint) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Blueprint Not Found
          </h2>
          <p className="mb-6">
            This blueprint does not exist or is no longer shared.
          </p>
          <Link href="/" className="text-blue-500 hover:underline">
            Create your own blueprint
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
            <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-lg text-sm">
              📤 Shared Blueprint
            </span>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </nav>

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
                })}
              </p>
            </div>

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

          <div className="mt-8 text-center border-t border-gray-800 pt-8">
            <p className="text-gray-500 mb-4">
              Want to create your own project blueprints?
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold"
            >
              Try AI Blueprint Generator Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
