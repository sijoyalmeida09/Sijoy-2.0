"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav border-b border-white/5 shadow-[0_1px_30px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-josho-bg/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">🎵</span>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gradient-electric">Sohaya</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="/discover"
            className="text-sm font-medium text-secondary transition-colors hover:text-white"
          >
            Find Artists
          </Link>
          <Link
            href="/tonight"
            className="flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-white"
          >
            <span
              className="inline-block h-2 w-2 rounded-full bg-crimson"
              style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
            />
            Tonight
          </Link>
          <Link
            href="/gear"
            className="text-sm font-medium text-secondary transition-colors hover:text-white"
          >
            Gear Rental
          </Link>
          <Link
            href="/join"
            className="text-sm font-medium text-secondary transition-colors hover:text-white"
          >
            Join as Artist
          </Link>
        </div>

        {/* Desktop Right */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-josho-border" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="rounded-full border border-white/[0.15] bg-white/[0.08] px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-electric/60 hover:bg-electric/10"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/discover"
                className="btn-electric px-5 py-2 text-sm"
              >
                Book Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-secondary hover:bg-josho-surface md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Slide-down Drawer */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-96 border-t border-josho-border" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-1 bg-black/90 px-4 py-4 backdrop-blur-xl">
          <Link
            href="/discover"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium text-secondary transition-colors hover:bg-josho-elevated hover:text-white"
          >
            Find Artists
          </Link>
          <Link
            href="/tonight"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-secondary transition-colors hover:bg-josho-elevated hover:text-white"
          >
            <span
              className="inline-block h-2 w-2 rounded-full bg-crimson"
              style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }}
            />
            Tonight
          </Link>
          <Link
            href="/gear"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium text-secondary transition-colors hover:bg-josho-elevated hover:text-white"
          >
            Gear Rental
          </Link>
          <Link
            href="/join"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium text-secondary transition-colors hover:bg-josho-elevated hover:text-white"
          >
            Join as Artist
          </Link>
          <div className="mt-2 border-t border-josho-border pt-3">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl bg-electric px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-center text-sm font-medium text-secondary"
                >
                  Login
                </Link>
                <Link
                  href="/discover"
                  onClick={() => setMenuOpen(false)}
                  className="btn-electric flex-1 py-2.5 text-sm text-center"
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
