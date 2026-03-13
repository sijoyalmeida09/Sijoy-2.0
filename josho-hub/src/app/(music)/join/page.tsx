import { JoinWizard } from "./join-wizard";

export default function JoinPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <section className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-joshoBlue">For Musicians</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Join Vasaikar Live</h1>
        <p className="mt-2 text-sm text-blue-200">
          100% free. Get discovered. Get booked. Get paid.<br />
          We only earn 10% when you successfully complete a gig.
        </p>
      </section>
      <JoinWizard />
    </main>
  );
}
