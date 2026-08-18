"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Network,
  RefreshCw,
  ShieldCheck,
  // Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { RecipeDetailsResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecipeDetailsProps {
  recipeId: string;
  excludedAllergens: string[];
}

export default function RecipeDetails({
  recipeId,
  excludedAllergens,
}: RecipeDetailsProps) {
  const [data, setData] = useState<RecipeDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchRecipe() {
      try {
        const query = new URLSearchParams();
        excludedAllergens.forEach((allergen) =>
          query.append("allergen", allergen),
        );

        const response = await fetch(
          `/api/recipes/${encodeURIComponent(recipeId)}?${query.toString()}`,
          { cache: "no-store" },
        );
        const responseData = await response.json();

        if (ignore) return;
        if (!response.ok) {
          throw new Error(responseData.message ?? "Unable to load recipe.");
        }

        setData(responseData);
        setError("");
      } catch (caughtError) {
        if (ignore) return;
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load recipe.",
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void fetchRecipe();
    return () => {
      ignore = true;
    };
  }, [recipeId, excludedAllergens, reloadKey]);

  function retry() {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  }

  const homeQuery = new URLSearchParams();
  excludedAllergens.forEach((allergen) =>
    homeQuery.append("allergen", allergen),
  );
  const backHref =
    homeQuery.size > 0
      ? `/recipes?${homeQuery.toString()}`
      : "/recipes";

  if (loading) return <RecipeDetailsSkeleton />;

  if (error || !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f8f3] px-5 py-16">
        <section className="w-full max-w-lg rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
            <AlertTriangle className="size-6" />
          </span>
          <h1 className="mt-5 font-heading text-2xl font-bold">
            We could not load this recipe
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={backHref}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
            >
              <ArrowLeft className="size-4" /> Back
            </Link>
            <Button
              type="button"
              onClick={retry}
              className="h-10 rounded-xl bg-emerald-800 px-4 text-white hover:bg-emerald-900"
            >
              <RefreshCw className="size-4" /> Retry
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const { recipe, substitutions } = data;
  const unsafeIngredients = recipe.ingredients.filter((ingredient) =>
    ingredient.allergens.some((allergen) =>
      excludedAllergens.includes(allergen),
    ),
  );
  const isSafe = excludedAllergens.length > 0 && unsafeIngredients.length === 0;

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#062f27] text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_15%,rgba(190,242,100,0.16),transparent_28%),radial-gradient(circle_at_20%_100%,rgba(45,212,191,0.12),transparent_30%)]" />
        <div className="absolute -right-20 top-20 -z-10 size-72 rounded-full border-[36px] border-white/[0.04]" />

        <div className="mx-auto flex max-w-7xl items-center px-5 pt-6 sm:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-100 transition hover:text-lime-300"
          >
            <ArrowLeft className="size-4" /> Recipe network
          </Link>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 lg:grid-cols-[1fr_22rem] lg:items-end lg:pt-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-lime-200/20 bg-lime-200/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-lime-200">
                {recipe.cuisine}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-emerald-100/80">
                <Clock3 className="size-3.5" /> {recipe.prepMinutes} minutes
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-emerald-100/80">
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="mt-6 max-w-4xl font-heading text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-7xl">
              {recipe.name}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-emerald-100/75 sm:text-lg">
              {recipe.description}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-2xl",
                  excludedAllergens.length === 0
                    ? "bg-white/10 text-emerald-100"
                    : isSafe
                      ? "bg-lime-300 text-emerald-950"
                      : "bg-amber-300 text-amber-950",
                )}
              >
                {isSafe ? (
                  <ShieldCheck className="size-5" />
                ) : excludedAllergens.length > 0 ? (
                  <AlertTriangle className="size-5" />
                ) : (
                  <Network className="size-5" />
                )}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/55">
                  Graph verdict
                </p>
                <p className="mt-1 font-heading text-lg font-bold">
                  {excludedAllergens.length === 0
                    ? "Ready to compare"
                    : isSafe
                      ? "Safe as written"
                      : `${unsafeIngredients.length} ingredient${unsafeIngredients.length === 1 ? "" : "s"} to swap`}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-emerald-100/65">
              {excludedAllergens.length === 0
                ? "Choose an allergen profile from the recipe network to activate substitutions."
                : isSafe
                  ? `No ingredients connect to ${excludedAllergens.join(", ")}.`
                  : `SafePlate found ${substitutions.length} candidate replacement${substitutions.length === 1 ? "" : "s"}.`}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {excludedAllergens.length > 0 && (
          <div className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-800">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Active safety profile
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {excludedAllergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href={backHref}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Edit profile
            </Link>
          </div>
        )}

        {unsafeIngredients.length > 0 && (
          <div className="mb-8 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-200 text-amber-950">
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-xl font-bold text-amber-950">
                  This recipe needs a few thoughtful swaps
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900/75">
                  These ingredients connect directly to your selected allergen
                  nodes. The substitution graph below shows safer paths.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {unsafeIngredients.map((ingredient) => (
                    <span
                      key={ingredient.id}
                      className="rounded-full border border-amber-300 bg-white/70 px-3 py-1.5 text-xs font-bold text-amber-950"
                    >
                      {ingredient.name} ·{" "}
                      {ingredient.allergens
                        .filter((allergen) =>
                          excludedAllergens.includes(allergen),
                        )
                        .join(", ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-2 lg:items-stretch">
          <section className="h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Recipe composition
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                Ingredients
              </h2>
            </div>
            <ul className="divide-y divide-slate-100 px-6">
              {recipe.ingredients.map((ingredient) => {
                const conflicts = ingredient.allergens.filter((allergen) =>
                  excludedAllergens.includes(allergen),
                );
                return (
                  <li
                    key={ingredient.id}
                    className={cn(
                      "flex gap-4 py-4",
                      conflicts.length > 0 && "-mx-3 bg-amber-50/70 px-3",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl",
                        conflicts.length > 0
                          ? "bg-amber-200 text-amber-900"
                          : "bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {conflicts.length > 0 ? (
                        <AlertTriangle className="size-4" />
                      ) : (
                        <Check className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold">
                          {ingredient.name}
                          {ingredient.optional && (
                            <span className="ml-2 text-xs font-normal text-slate-400">
                              optional
                            </span>
                          )}
                        </p>
                        <p className="shrink-0 font-mono text-xs text-slate-500">
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                      </div>
                      {ingredient.allergens.length > 0 && (
                        <p
                          className={cn(
                            "mt-1.5 text-xs",
                            conflicts.length > 0
                              ? "font-bold text-amber-800"
                              : "text-slate-400",
                          )}
                        >
                          Linked allergen: {ingredient.allergens.join(", ")}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Multi-hop traversal
                </p>
                <h2 className="mt-2 font-heading text-2xl font-bold">
                  Graph substitutions
                </h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                <Network className="size-3.5" /> CAN_REPLACE · 1–2 hops
              </div>
            </div>

            <div className="p-6">
              {excludedAllergens.length === 0 && (
                <EmptyGraphState
                  icon={Network}
                  title="Activate your safety profile"
                  description="Return to the recipe network and choose at least one allergen to explore substitution paths."
                  href="/recipes"
                  linkLabel="Choose allergens"
                />
              )}

              {isSafe && (
                <EmptyGraphState
                  icon={ShieldCheck}
                  title="Already safe as written"
                  description={`No ingredient in this recipe connects to ${excludedAllergens.join(", ")}, so the graph does not need to propose a replacement.`}
                />
              )}

              {unsafeIngredients.length > 0 && substitutions.length === 0 && (
                <EmptyGraphState
                  icon={AlertTriangle}
                  title="No safe path is available yet"
                  description="A conflict exists, but the current dataset does not contain a safe CAN_REPLACE path for it."
                />
              )}

              {substitutions.length > 0 && (
                <div className="space-y-4">
                  {substitutions.map((substitution, index) => (
                    <article
                      key={`${substitution.unsafeIngredient}-${substitution.replacement}`}
                      className="rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50/60 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                            Path {index + 1} · {substitution.hops} hop
                            {substitution.hops === 1 ? "" : "s"}
                          </p>
                          <h3 className="mt-2 font-heading text-xl font-bold text-emerald-950">
                            Use {substitution.replacement}
                          </h3>
                          <p className="mt-1 text-sm text-emerald-800/75">
                            A safer alternative for {substitution.unsafeIngredient}
                            , avoiding {substitution.allergen}.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                        <GraphNode label={substitution.replacement} safe />
                        <ArrowRight className="size-4 shrink-0 text-emerald-500" />
                        {substitution.hops === 2 && (
                          <>
                            <GraphNode label="related substitute" />
                            <ArrowRight className="size-4 shrink-0 text-emerald-500" />
                          </>
                        )}
                        <GraphNode label={substitution.unsafeIngredient} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function GraphNode({ label, safe = false }: { label: string; safe?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-3 py-2",
        safe
          ? "border-emerald-300 bg-white text-emerald-900"
          : "border-slate-200 bg-white/80 text-slate-600",
      )}
    >
      {label}
    </span>
  );
}

function EmptyGraphState({
  icon: Icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: typeof Network;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-heading text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {href && linkLabel && (
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline"
        >
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

function RecipeDetailsSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f7f8f3]">
      <div className="h-[30rem] bg-emerald-950" />
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-12 sm:px-8 lg:grid-cols-2">
        <div className="h-96 rounded-[2rem] bg-slate-200" />
        <div className="h-96 rounded-[2rem] bg-slate-200" />
      </div>
    </main>
  );
}
