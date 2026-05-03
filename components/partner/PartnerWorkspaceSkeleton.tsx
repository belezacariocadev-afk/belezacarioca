export function PartnerWorkspaceSkeleton() {
  return (
    <main className="relative z-10 min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f6efe6_100%)]">
      <section className="bc-section pt-8 md:pt-10">
        <div className="bc-container animate-pulse">
          <div className="h-44 rounded-[2rem] border border-[rgba(120,84,162,0.12)] bg-white/80" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-[1.5rem] border border-[rgba(120,84,162,0.12)] bg-white/80"
              />
            ))}
          </div>
          <div className="mt-6 h-72 rounded-[1.8rem] border border-[rgba(120,84,162,0.12)] bg-white/80" />
          <div className="mt-6 h-80 rounded-[1.8rem] border border-[rgba(120,84,162,0.12)] bg-white/80" />
        </div>
      </section>
    </main>
  );
}
