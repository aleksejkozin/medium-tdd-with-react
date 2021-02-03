import React, { useEffect, useState } from 'react';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAllRecipes = async () => {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const jsonResponse = await response.json();
        setRecipes(jsonResponse.recipes);
      } else {
        setErrorMessage(
          `Failed to fetch recipes, error message: ${response.statusText}`);
      }
    };

    fetchAllRecipes();
  }, []);

  const handleOnInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const fetchRecipeByIngredient = async (ingredient) => {
    const response = await fetch(`/api/recipes?ingredient=${ingredient}`);
    if (response.ok) {
      const jsonResponse = await response.json();
      setSearchCriteria(ingredient);
      setRecipes(jsonResponse.recipes);
    }
  };

  const handleOnSubmitForm = (event) => {
    event.preventDefault();
    fetchRecipeByIngredient(inputValue);
  };

  return (
    <div>
      <h1>Recipe Finder</h1>
      <form onSubmit={handleOnSubmitForm}>
        <input type="text" name="ingredient"
               placeholder="Enter an ingredient to find recipes..."
               value={inputValue}
               onChange={handleOnInputChange}
        />
        <button type="submit">Find</button>
      </form>
      {errorMessage && (
        <p>{errorMessage}</p>
      )}
      {searchCriteria && (
        <p>Showing results for {searchCriteria}:</p>
      )}
      <ul>
        {recipes.map((recipe) => (
          <li
            key={recipe.id}
          >{recipe.title}</li>
        ))}
      </ul>
    </div>
  )
};

export default Recipes;
