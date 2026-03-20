import Link from "next/link";
import { LoginForm } from "./login-form";
import { Header } from "@/components/layout/header";

export default function LoginPage({
  searchParams
}: {
  searchParams: { sent?: string; error?: string; verified?: string; redirect?: string };
}) {
  const redirectTo = searchParams.redirect || "/dashboard";

  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-10">
        <div className="w-full rounded-2xl border border-blue-900/40 bg-[#13213d] p-6 shadow-panel">
          <h1 className="text-2xl font-bold text-white">Welcome to Sohaya</h1>
          <p className="mt-2 text-sm text-blue-100">Sign in or create your account.</p>

          {searchParams.sent === "1" && (
            <p className="mt-4 rounded-lg bg-green-900/30 p-3 text-sm text-green-200">Magic link sent to your email.</p>
          )}
          {searchParams.verified === "1" && (
            <p className="mt-4 rounded-lg bg-green-900/30 p-3 text-sm text-green-200">OTP verified. Redirecting...</p>
          )}
          {searchParams.error && (
            <p className="mt-4 rounded-lg bg-red-900/40 p-3 text-sm text-red-200">{searchParams.error}</p>
          )}

          <LoginForm redirectTo={redirectTo} />

          <Link href="/" className="mt-4 inline-block text-sm text-blue-200 underline-offset-2 hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    </>
  );
}
