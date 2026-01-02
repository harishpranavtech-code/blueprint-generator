"use client";

import { useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

/* -------------------- TYPES -------------------- */
interface Blueprint {
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
  database: unknown;
  roadmap: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
}

/* -------------------- COMPONENT -------------------- */
export default function Home() {
  const [idea, setIdea] = useState("");
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!idea.trim()) {
      setError("Please enter an idea");
      return;
    }

    setLoading(true);
    setError("");
    setBlueprint(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data: Blueprint = await res.json();
      setBlueprint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!blueprint) return;

    const markdown = `# ${blueprint.projectName}

${blueprint.idea}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.projectName}.md`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      {/* Header */}
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            🚀 AI Blueprint Generator
          </h1>

          <div className="flex items-center gap-4">
            <SignedIn>
              <Link
                href="/history"
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-900 transition"
              >
                History
              </Link>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SignedOut>
          <div className="text-center py-24">
            <h2 className="text-4xl font-bold text-white mb-4">
              Turn Ideas Into Technical Blueprints
            </h2>
            <p className="text-gray-400 mb-8">
              Dark, clean, professional AI planning tool
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
            {/* INPUT */}
            <label className="block font-semibold text-white mb-2">
              Describe your project idea
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full h-40 p-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
              placeholder="Example: A SaaS platform for..."
            />

            {error && (
              <div className="mb-4 p-3 bg-gray-800 border border-gray-700 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600"
            >
              {loading ? "Generating..." : "Generate Blueprint"}
            </button>

            {/* RESULT */}
            {blueprint && (
              <div className="mt-12 space-y-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white">
                    {blueprint.projectName}
                  </h2>
                  <button
                    onClick={downloadMarkdown}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Download
                  </button>
                </div>

                {/* FEATURES */}
                <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Features
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {(["mvp", "phase2", "phase3"] as const).map((phase) => (
                      <div key={phase}>
                        <h4 className="font-semibold text-gray-300 mb-2 capitalize">
                          {phase}
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

                {/* TECH STACK */}
                <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Tech Stack
                  </h3>
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

                {/* DATABASE */}
                <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Database Schema
                  </h3>
                  <pre className="bg-black text-gray-200 p-4 rounded-lg overflow-x-auto text-sm border border-gray-700">
                    {JSON.stringify(blueprint.database, null, 2)}
                  </pre>
                </section>

                {/* ROADMAP */}
                <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Roadmap</h3>
                  {Object.entries(blueprint.roadmap).map(([month, tasks]) => (
                    <div key={month} className="mb-4">
                      <h4 className="font-semibold text-gray-300">
                        {month.replace("month", "Month ")}
                      </h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {(tasks as string[]).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
