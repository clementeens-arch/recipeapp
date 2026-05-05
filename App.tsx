import { useState, useEffect } from 'react';
import { ChefHat, Heart, Calendar, Search as SearchIcon } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeModal } from './components/RecipeModal';
import { mockRecipes, Recipe } from './data/mockRecipes';

type View = 'search' | 'favorites' | 'meal-plan';

export default function App() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentView, setCurrentView] = useState<View>('search');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');

  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipeFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const handleAddIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient.toLowerCase())) {
      setSelectedIngredients([...selectedIngredients, ingredient.toLowerCase()]);
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const handleToggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('recipeFavorites', JSON.stringify(newFavorites));
  };

  const getFilteredRecipes = () => {
    let filtered = mockRecipes;

    if (currentView === 'favorites') {
      filtered = mockRecipes.filter(recipe => favorites.includes(recipe.id));
    } else if (currentView === 'meal-plan') {
      const planRecipes = mockRecipes
        .filter(recipe => favorites.includes(recipe.id))
        .slice(0, 7);

      if (planRecipes.length === 0) {
        return mockRecipes.slice(0, 7);
      }
      return planRecipes;
    } else if (selectedIngredients.length > 0) {
      filtered = mockRecipes.filter(recipe =>
        selectedIngredients.some(ingredient =>
          recipe.ingredients.some(recipeIngredient =>
            recipeIngredient.toLowerCase().includes(ingredient)
          )
        )
      );
    }

    if (dietaryFilter !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.dietaryTags.includes(dietaryFilter)
      );
    }

    return filtered;
  };

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="w-8 h-8" />
            <h1>Personalized Recipe Finder</h1>
          </div>
          <p className="text-green-100">
            Discover delicious recipes based on ingredients you have at home
          </p>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('search')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                currentView === 'search'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <SearchIcon className="w-5 h-5" />
              <span>Search Recipes</span>
            </button>
            <button
              onClick={() => setCurrentView('favorites')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                currentView === 'favorites'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>Favorites ({favorites.length})</span>
            </button>
            <button
              onClick={() => setCurrentView('meal-plan')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                currentView === 'meal-plan'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Weekly Meal Plan</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'search' && (
          <>
            <SearchBar
              ingredients={selectedIngredients}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
            />

            <div className="mt-6 bg-white rounded-lg shadow-md p-4">
              <label className="block mb-2">Filter by dietary preference:</label>
              <select
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Recipes</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="high-protein">High Protein</option>
              </select>
            </div>
          </>
        )}

        {currentView === 'meal-plan' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="mb-2">Your Weekly Meal Plan</h2>
            <p className="text-gray-700">
              {favorites.length > 0
                ? "Here's a weekly meal plan based on your favorite recipes!"
                : "Here's a suggested weekly meal plan. Add recipes to favorites to personalize your plan!"}
            </p>
          </div>
        )}

        <div className="mt-6">
          {filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">
                {currentView === 'favorites'
                  ? "You haven't added any favorites yet. Click the heart icon on recipes you love!"
                  : selectedIngredients.length > 0
                  ? "No recipes found with those ingredients. Try different ingredients or remove filters."
                  : "Enter ingredients above to find recipes!"}
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2>
                  {currentView === 'meal-plan'
                    ? `Your Meal Plan (${filteredRecipes.length} recipes)`
                    : `Found ${filteredRecipes.length} recipe${filteredRecipes.length !== 1 ? 's' : ''}`}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isFavorite={favorites.includes(recipe.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={setSelectedRecipe}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </div>
  );
}