import Link from "next/link";

export default function IneligiblePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(79,70,229,0.18),_transparent_60%)]"
      />
      <div className="relative w-full max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6 px-8 py-12 sm:px-12">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-300/30">
              <svg
                className="h-7 w-7 text-emerald-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6v6m0 4h.01M4.5 12a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="text-center text-3xl font-semibold leading-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                Thank you for your interest
              </span>
            </h1>
            <div className="space-y-3 text-center text-base leading-relaxed text-slate-200/80">
              <p>
                Unfortunately, you are not eligible to participate in this research study at this
                time. Participation is limited to individuals who are at least 16 years of age.
              </p>
              <p>
                We sincerely appreciate your curiosity and willingness to contribute. Your interest
                helps us continue building thoughtful, inclusive research experiences.
              </p>
              <p className="text-sm text-slate-300">
                If you have any questions about the study, please reach out to the research team
                using the contact information provided in your invitation materials.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-white transition hover:border-emerald-300/60 hover:bg-emerald-400/10"
              >
                Return to home
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.25 4.5 15.75 12l-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="mailto:research@moralmaps.org"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-5 py-2.5 text-emerald-200 transition hover:bg-emerald-400/30"
              >
                Contact the team
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
