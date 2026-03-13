interface ClientViewProps {
  itProjectStatus: string;
  savedListings: string[];
}

export function ClientView({ itProjectStatus, savedListings }: ClientViewProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-white">My JoSho Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
          <p className="text-sm uppercase tracking-wide text-blue-200">IT Project Status</p>
          <p className="mt-3 text-lg font-medium text-white">{itProjectStatus}</p>
        </div>
        <div className="rounded-xl border border-blue-800/40 bg-[#162746] p-4">
          <p className="text-sm uppercase tracking-wide text-blue-200">Saved Real Estate Listings</p>
          <ul className="mt-3 space-y-2 text-sm text-blue-100">
            {savedListings.length === 0 ? <li>No saved listings yet.</li> : savedListings.map((x) => <li key={x}>- {x}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
