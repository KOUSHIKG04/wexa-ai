"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Something went wrong</h1>

        <p className="mt-3 text-slate-600">
          SafePlate could not complete this request.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
