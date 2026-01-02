"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface Blueprint {
  id: string;
  projectName: string;
  idea: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    try {
      const res = await fetch("/api/blueprints");
      if (res.ok) {
        const data: Blueprint[] = await res.json();
        setBlueprints(data);
      }
    } catch (error) {
      console.error("Error fetching blueprints:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlueprint = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blueprint?")) return;

    try {
      const res = await fetch(`/api/blueprints/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBlueprints((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Error deleting blueprint:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      {/* HEADER */}
      <nav className="border-b border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            AI Blueprint Generator
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition"
            >
              New Blueprint
            </Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <SignedOut>
          <div className="text-center py-24">
            <h2 className="text-3xl font-bold text-white">
              Sign in to view your history
            </h2>
          </div>
        </SignedOut>

        <SignedIn>
          {/* PAGE HEADER */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Blueprint History
            </h1>
            <p className="text-gray-400">
              View and manage your generated project blueprints
            </p>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-400">Loading blueprints...</p>
            </div>
          ) : blueprints.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No blueprints yet
              </h2>
              <p className="text-gray-400 mb-6">
                Create your first project blueprint to get started
              </p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Create Blueprint
              </Link>
            </div>
          ) : (
            /* LIST */
            <div className="grid gap-6">
              {blueprints.map((blueprint) => (
                <div
                  key={blueprint.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {blueprint.projectName}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {blueprint.idea}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created{" "}
                        {new Date(blueprint.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/blueprint/${blueprint.id}`)
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteBlueprint(blueprint.id)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SignedIn>
      </div>
    </div>
  );
}
