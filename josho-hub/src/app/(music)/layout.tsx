import Link from "next/link";

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-blue-900/30 bg-[#0a1628]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">Vasaikar</span>
          <span className="text-lg font-bold text-joshoBlue">Live</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/join" className="text-sm text-blue-200 hover:text-white">
            I&apos;m a Musician
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-joshoBlue px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
