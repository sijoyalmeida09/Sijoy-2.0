import Link from "next/link";

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-amber-700/40 bg-gradient-to-br from-[#1a1a0a] to-[#0d1a30] p-8 text-center">
        <div className="text-6xl">&#127929;</div>
        <h1 className="mt-4 text-2xl font-bold text-white">Studio Recording & Music Video</h1>
        <p className="mt-2 text-blue-200">
          Upgrade your artist profile with professional recordings. JoSho production partners offer
          studio time and music video shoots in the Vasai-Virar region.
        </p>
        <p className="mt-4 text-sm text-amber-300">
          Coming soon. For now, email us at{" "}
          <a href="mailto:music@joshoit.com" className="underline hover:text-amber-200">
            music@joshoit.com
          </a>{" "}
          with &quot;Studio inquiry&quot; in the subject.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-block rounded-full bg-joshoBlue px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          Back to Discover
        </Link>
      </div>
    </main>
  );
}
