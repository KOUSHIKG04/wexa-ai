"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RecipeDetailsResponse } from "@/lib/types";

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

  async function loadRecipe() {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();

      excludedAllergens.forEach((allergen) => {
        query.append("allergen", allergen);
      });

      const response = await fetch(
        `/api/recipes/${encodeURIComponent(recipeId)}?${query}`,
        { cache: "no-store" },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message ?? "Unable to load recipe.");
      }

      setData(responseData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load recipe.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecipe();
  }, [recipeId, excludedAllergens.join("|")]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="h-10 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-5 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-10 h-80 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-bold text-red-950">
            Unable to load this recipe
          </h1>
          <p className="mt-3 text-red-800">{error}</p>
          <button
            type="button"
            onClick={loadRecipe}
            className="mt-5 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const { recipe, substitutions } = data;

  const unsafeIngredients = recipe.ingredients.filter((ingredient) =>
    ingredient.allergens.some((allergen) =>
      excludedAllergens.includes(allergen),
    ),
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="font-semibold text-emerald-800 hover:underline"
        >
          ← Back to recipes
        </Link>

        <header className="mt-8 rounded-3xl bg-emerald-950 p-8 text-white sm:p-12">
          <p className="font-medium text-emerald-300">{recipe.cuisine}</p>

          <h1 className="mt-3 text-4xl font-bold">{recipe.name}</h1>

          <p className="mt-5 max-w-2xl text-lg text-emerald-100">
            {recipe.description}
          </p>

          <div className="mt-7 flex gap-6 text-sm">
            <span>{recipe.prepMinutes} minutes</span>
            <span>{recipe.difficulty}</span>
          </div>
        </header>

        {excludedAllergens.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7">
            <h2 className="text-xl font-bold">Your selected allergens</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {excludedAllergens.map((allergen) => (
                <span
                  key={allergen}
                  className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-950"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </section>
        )}

        {unsafeIngredients.length > 0 && (
          <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-7">
            <h2 className="text-xl font-bold text-red-950">Allergy warning</h2>

            <p className="mt-2 text-red-800">
              This recipe contains ingredients connected to your selected
              allergens.
            </p>

            <ul className="mt-5 space-y-3">
              {unsafeIngredients.map((ingredient) => (
                <li key={ingredient.id} className="rounded-xl bg-white p-4">
                  <strong>{ingredient.name}</strong>:{" "}
                  {ingredient.allergens
                    .filter((allergen) => excludedAllergens.includes(allergen))
                    .join(", ")}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-bold">Ingredients</h2>

            <ul className="mt-5 divide-y divide-slate-200">
              {recipe.ingredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex justify-between gap-4 py-4"
                >
                  <div>
                    <span className="font-medium">{ingredient.name}</span>

                    {ingredient.optional && (
                      <span className="ml-2 text-sm text-slate-500">
                        Optional
                      </span>
                    )}

                    {ingredient.allergens.length > 0 && (
                      <p className="mt-1 text-sm text-red-700">
                        Contains: {ingredient.allergens.join(", ")}
                      </p>
                    )}
                  </div>

                  <span className="text-slate-600">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-bold">Graph substitutions</h2>

            <p className="mt-2 text-slate-600">
              These alternatives were found by traversing up to two CAN_REPLACE
              relationships.
            </p>

            {excludedAllergens.length === 0 && (
              <p className="mt-6 rounded-xl bg-slate-100 p-4 text-slate-700">
                Select allergens on the home page to receive substitution
                suggestions.
              </p>
            )}

            {excludedAllergens.length > 0 && substitutions.length === 0 && (
              <p className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-900">
                No safe substitution path was found for the selected allergens.
              </p>
            )}

            <ul className="mt-5 space-y-4">
              {substitutions.map((substitution) => (
                <li
                  key={`${substitution.unsafeIngredient}-${substitution.replacement}`}
                  className="rounded-2xl bg-emerald-50 p-5"
                >
                  <p className="font-semibold text-emerald-950">
                    Replace {substitution.unsafeIngredient} with{" "}
                    {substitution.replacement}
                  </p>

                  <p className="mt-2 text-sm text-emerald-800">
                    Avoids {substitution.allergen} · {substitution.hops}-hop
                    graph path
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
