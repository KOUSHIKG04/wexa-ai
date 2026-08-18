"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ALLERGENS, type RecipeSummary } from "@/lib/types";

export default function RecipeExplorer() {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadRecipes(allergens: string[]) {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();

      allergens.forEach((allergen) => {
        query.append("allergen", allergen);
      });

      const response = await fetch(`/api/recipes?${query.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to load recipes.");
      }

      setRecipes(data.recipes);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load recipes.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecipes(selectedAllergens);
  }, [selectedAllergens]);

  function toggleAllergen(allergen: string) {
    setSelectedAllergens((current) =>
      current.includes(allergen)
        ? current.filter((item) => item !== allergen)
        : [...current, allergen],
    );
  }

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return recipes;
    }

    return recipes.filter((recipe) => {
      return (
        recipe.name.toLowerCase().includes(normalizedSearch) ||
        recipe.description.toLowerCase().includes(normalizedSearch) ||
        recipe.cuisine.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [recipes, search]);

  function recipeUrl(recipeId: string) {
    const query = new URLSearchParams();

    selectedAllergens.forEach((allergen) => {
      query.append("allergen", allergen);
    });

    const suffix = query.toString();

    return suffix ? `/recipes/${recipeId}?${suffix}` : `/recipes/${recipeId}`;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-emerald-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 font-medium text-emerald-300">
            Graph-powered recipe discovery
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Find recipes that work for you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-emerald-100">
            SafePlate follows the relationships between recipes, ingredients,
            allergens and substitutions to suggest safer meals.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">What do you need to avoid?</h2>

          <p className="mt-1 text-sm text-slate-600">
            Select one or more allergens to hide unsafe recipes.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {ALLERGENS.map((allergen) => {
              const selected = selectedAllergens.includes(allergen);

              return (
                <button
                  key={allergen}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleAllergen(allergen)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300 bg-white hover:border-emerald-600"
                  }`}
                >
                  {allergen}
                </button>
              );
            })}
          </div>

          {selectedAllergens.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAllergens([])}
              className="mt-5 text-sm font-semibold text-emerald-800 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Safe recipes</h2>
            <p className="text-slate-600">
              Recipes are filtered through their ingredient and allergen
              relationships.
            </p>
          </div>

          <input
            type="search"
            placeholder="Search recipes or cuisines"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 sm:max-w-sm"
          />
        </div>

        {loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="font-semibold text-red-900">
              We could not reach the recipe database
            </h3>

            <p className="mt-2 text-red-800">{error}</p>

            <button
              type="button"
              onClick={() => loadRecipes(selectedAllergens)}
              className="mt-4 rounded-xl bg-red-700 px-4 py-2 font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredRecipes.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-xl font-semibold">No matching recipes</h3>
            <p className="mt-2 text-slate-600">
              Try removing an allergen filter or changing your search.
            </p>
          </div>
        )}

        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <article
                key={recipe.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-900">
                    {recipe.cuisine}
                  </span>

                  <span className="text-slate-500">
                    {recipe.prepMinutes} min
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">{recipe.name}</h3>

                <p className="mt-3 flex-1 text-slate-600">
                  {recipe.description}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {recipe.difficulty}
                  </span>

                  <Link
                    href={recipeUrl(recipe.id)}
                    className="font-semibold text-emerald-800 hover:underline"
                  >
                    View recipe →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
