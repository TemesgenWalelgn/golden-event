"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin"); // Redirect to dashboard on success
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)] p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[var(--brand-green)]">
            GOLDEN Admin
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Secure portal access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 outline-none focus:border-[var(--brand-green)] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 outline-none focus:border-[var(--brand-green)] text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[var(--brand-green)] text-white rounded-xl font-bold shadow-md hover:opacity-95 transition-all mt-4"
          >
            {loading ? "Verifying..." : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
}