import Link from "next/link";
import { sendMagicLink } from "@/app/login/actions";

export default function LoginPage({
  searchParams
}: {
  searchParams: { sent?: string; error?: string };
}) {
  const sent = searchParams.sent === "1";
  const error = searchParams.error;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-blue-900/40 bg-[#13213d] p-6 shadow-panel">
        <h1 className="text-2xl font-bold text-white">Login to One JoSho</h1>
        <p className="mt-2 text-sm text-blue-100">Use your email to receive a secure magic login link.</p>

        {sent && <p className="mt-4 rounded-lg bg-green-900/30 p-3 text-sm text-green-200">Magic link sent.</p>}
        {error && <p className="mt-4 rounded-lg bg-red-900/40 p-3 text-sm text-red-200">{error}</p>}

        <form action={sendMagicLink} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-blue-100">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-blue-700 bg-[#0f1a31] px-3 py-2 text-white outline-none ring-joshoBlue focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-joshoBlue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Send Magic Link
          </button>
        </form>

        <Link href="/" className="mt-4 inline-block text-sm text-blue-200 underline-offset-2 hover:underline">
          Back to landing
        </Link>
      </div>
    </main>
  );
}
