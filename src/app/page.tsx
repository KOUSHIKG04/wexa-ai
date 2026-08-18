import { ArrowRight, ChefHat,  Network, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-[#fbfcf8] text-slate-950">
      <section className="bg-[#fbfcf8]">
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-16 sm:px-8 sm:py-24 lg:py-28">
          <div>
            <h1 className="max-w-6xl font-heading text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-emerald-950 sm:text-7xl lg:text-[6.25rem]">
              Eat freely.{" "}
              <span className="text-emerald-600">Know every link.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
              Explore how recipes connect to ingredients, allergens, and safe
              replacements. SafePlate turns a complex food graph into clear,
              useful choices.
            </p>

            <Link
              href="/recipes"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white transition-transform duration-150 hover:bg-emerald-800 active:scale-95"
            >
              Explore Recipe Network
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#fbfcf8]">
        <div className="mx-auto max-w-7xl px-5 pt-12 pb-20 sm:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              How it works
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight">
              Simple choices, backed by a real graph.
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <Feature
              // number="01"
              icon={ShieldCheck}
              title="Choose allergens"
              description="Create a temporary safety profile with the ingredients you need to avoid."
            />
            <Feature
              // number="02"
              icon={ChefHat}
              title="Compare recipes"
              description="See which recipes are safe as written and which contain direct graph conflicts."
            />
            <Feature
              // number="03"
              icon={Network}
              title="Follow substitutions"
              description="Explore one- and two-hop CAN_REPLACE paths to safer ingredients."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  // number,
  icon: Icon,
  title,
  description,
}: {
  // number: string;
  icon: typeof Network;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white  py-7 px-5 ">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold">{title}</h3>
        <span className="grid size-7 place-items-center rounded-md bg-emerald-950 text-lime-300">
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}
