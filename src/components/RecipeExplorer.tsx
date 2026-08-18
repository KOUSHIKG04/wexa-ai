"use client";

import {
  ArrowUpRight,
  Check,
  Clock3,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALLERGENS, type RecipeSummary } from "@/lib/types";

interface RecipeExplorerProps {
  initialAllergens?: string[];
}

export default function RecipeExplorer({
  initialAllergens = [],
}: RecipeExplorerProps) {
  const [selectedAllergens, setSelectedAllergens] =
    useState<string[]>(initialAllergens);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchRecipes() {
      try {
        const query = new URLSearchParams();
        selectedAllergens.forEach((allergen) =>
          query.append("allergen", allergen),
        );

        const response = await fetch(`/api/recipes?${query.toString()}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (ignore) return;
        if (!response.ok) {
          throw new Error(data.message ?? "Unable to load recipes.");
        }

        setRecipes(data.recipes);
        setError("");
      } catch (caughtError) {
        if (ignore) return;
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load recipes.",
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void fetchRecipes();
    return () => {
      ignore = true;
    };
  }, [selectedAllergens, reloadKey]);

  const visibleRecipes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return recipes;

    return recipes.filter((recipe) =>
      [recipe.name, recipe.description, recipe.cuisine].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [recipes, search]);

  const conflictCount = recipes.filter((recipe) => recipe.hasConflict).length;
  const safeCount = recipes.length - conflictCount;

  function toggleAllergen(allergen: string) {
    setLoading(true);
    setError("");
    setSelectedAllergens((current) =>
      current.includes(allergen)
        ? current.filter((item) => item !== allergen)
        : [...current, allergen],
    );
  }

  function clearAllergens() {
    setLoading(true);
    setError("");
    setSelectedAllergens([]);
  }

  function retry() {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  }

  function recipeUrl(recipeId: string) {
    const query = new URLSearchParams();
    selectedAllergens.forEach((allergen) => query.append("allergen", allergen));
    const suffix = query.toString();
    return suffix ? `/recipes/${recipeId}?${suffix}` : `/recipes/${recipeId}`;
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#fbfcf8] text-slate-950 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">
      <section className="lg:grid lg:h-full lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="bg-[#fbfcf8] p-5 sm:p-7 lg:h-full lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Your safety profile
              </p>
              <h2 className="mt-2 font-heading text-md font-bold tracking-tight">
                What should we avoid?
              </h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Select allergens to compare every recipe and reveal graph-powered
            replacements.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {ALLERGENS.map((allergen) => {
              const selected = selectedAllergens.includes(allergen);
              return (
                <button
                  key={allergen}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleAllergen(allergen)}
                  className={cn(
                    "flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 text-left text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
                    selected
                      ? "border-emerald-700 bg-emerald-700 text-white shadow-[0_8px_24px_rgba(4,120,87,0.18)]"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50",
                  )}
                >
                  {allergen}
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border",
                      selected
                        ? "border-white/30 bg-white/15"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {selected && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 min-h-9 border-t border-slate-100 pt-4">
            {selectedAllergens.length > 0 ? (
              <button
                type="button"
                onClick={clearAllergens}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-emerald-800"
              >
                <X className="size-3.5" />
                Clear profile
              </button>
            ) : (
              <p className="text-xs text-slate-400">No allergens selected</p>
            )}
          </div>
        </aside>

        <div className="min-w-0 lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
          <div className="flex shrink-0 flex-col gap-5 px-5 py-7 sm:px-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Recipe network
              </p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                {selectedAllergens.length > 0
                  ? "Compare every recipe"
                  : "Explore the collection"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {selectedAllergens.length > 0
                  ? `${safeCount} safe as written · ${conflictCount} with graph substitutions to explore`
                  : "Select a recipe, or build an allergen profile to reveal conflicts and alternatives."}
              </p>
            </div>

            <label className="relative block w-full xl:max-w-sm">
              <span className="sr-only">Search recipes or cuisines</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search recipes or cuisines"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white pl-11 pr-4 shadow-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/15"
              />
            </label>
          </div>

          <div
            className="px-5 py-7 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[scrollbar-gutter:stable]"
            aria-live="polite"
          >
            {loading && <RecipeSkeletons />}

            {!loading && error && (
              <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-7">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                    <ShieldAlert className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-rose-950">
                      The recipe graph is unavailable
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-rose-800">
                      {error}
                    </p>
                    <Button
                      type="button"
                      onClick={retry}
                      className="mt-5 h-10 rounded-xl bg-rose-700 px-4 text-white hover:bg-rose-800"
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && visibleRecipes.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Search className="mx-auto size-8 text-slate-300" />
                <h3 className="mt-4 font-heading text-xl font-bold">
                  No recipes match that search
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try a recipe name, cuisine, or clear the search field.
                </p>
              </div>
            )}

            {!loading && !error && visibleRecipes.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    href={recipeUrl(recipe.id)}
                    hasProfile={selectedAllergens.length > 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function RecipeCard({
  recipe,
  href,
  hasProfile,
}: {
  recipe: RecipeSummary;
  href: string;
  hasProfile: boolean;
}) {
  return (
    <article className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-emerald-300">
      <div className="flex flex-1 flex-col">
        <span className="mb-4 w-fit text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
          {recipe.cuisine}
        </span>

        {hasProfile && (
          <div
            className={cn(
              "mb-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
              recipe.hasConflict
                ? "bg-amber-100 text-amber-900"
                : "bg-emerald-100 text-emerald-800",
            )}
          >
            {recipe.hasConflict ? (
              <ShieldAlert className="size-3.5" />
            ) : (
              <ShieldCheck className="size-3.5" />
            )}
            {recipe.hasConflict
              ? `Swap needed · ${recipe.matchedAllergens.join(", ")}`
              : "Safe as written"}
          </div>
        )}

        <h3 className="font-heading text-xl font-bold leading-tight tracking-tight">
          {recipe.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {recipe.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <Clock3 className="size-3" /> {recipe.prepMinutes} min
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">
              {recipe.difficulty}
            </span>
          </div>

          <Link
            href={href}
            aria-label={`Explore ${recipe.name}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-800 underline-offset-4 transition-colors hover:text-emerald-600 hover:underline"
          >
            View recipe
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function RecipeSkeletons() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="space-y-4">
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="h-5 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
