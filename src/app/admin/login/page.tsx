"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ===== THEME STATE =====
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Read Dark Mode Preference so it matches the User/Admin pages
  useEffect(() => {
    const cachedDark = localStorage.getItem(`${siteConfig.storagePrefix}_dark_mode`);
    if (cachedDark !== null) {
      setIsDarkMode(cachedDark === "true");
    }
  }, []);

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
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""} flex items-center justify-center bg-[var(--brand-bg)] p-4 transition-colors duration-300`}>
      <div className="bg-[var(--surface-card)] max-w-md w-full rounded-3xl shadow-xl p-8 border border-[var(--border-subtle)] transition-colors duration-300">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[var(--brand-gold)]">
            {siteConfig.name.en.split(" ")[0]} Admin
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Secure portal access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[var(--border-subtle)] rounded-xl bg-[var(--surface-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-gold)] text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-[var(--border-subtle)] rounded-xl bg-[var(--surface-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-gold)] text-sm transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[var(--brand-gold)] text-[var(--text-on-gold)] rounded-xl font-bold shadow-md hover:opacity-95 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Secure Login"}
          </button>
        </form>

      </div>
    </div>
  );
}