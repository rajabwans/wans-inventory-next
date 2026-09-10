"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/wans/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
              W
            </div>
            <span className="text-2xl font-bold tracking-tight">WANPLAN</span>
          </div>
          <p className="mt-8 text-xl text-purple-100">
            Simple inventory & sales management for your business
          </p>
          <ul className="mt-8 space-y-3 text-purple-100">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-400 rounded-full" />
              Track products, sales & expenses
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-400 rounded-full" />
              Manage credit & debtors
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-400 rounded-full" />
              Works offline on any phone
            </li>
          </ul>
        </div>
        <p className="text-purple-200 text-sm">
          &copy; 2024 WANPLAN &middot; wanland planner
        </p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              W
            </div>
            <span className="text-2xl font-bold text-indigo-600">WANPLAN</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Business Login</h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Enter business slug (e.g. wans)"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600 text-sm">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-indigo-600 font-medium text-sm hover:underline">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}