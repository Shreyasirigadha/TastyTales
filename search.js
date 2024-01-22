// search.js

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const searchResultsContainer = document.getElementById('searchResultsContainer');

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const searchTerm = document.getElementById('searchInput').value;

        try {
            const response = await fetch(`/?search=${encodeURIComponent(searchTerm)}`);
            const recipes = await response.json();

            // Clear previous search results
            searchResultsContainer.innerHTML = '';

            // After fetching and parsing the response
            console.log('Fetched Recipes:', recipes);

            // Display new search results
            if (recipes.length === 0) {
                const p = document.createElement('p');
                p.textContent = 'No results found.';
                searchResultsContainer.appendChild(p);
            } else {
                recipes.forEach(recipe => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <h3>${recipe.title}</h3>
                        <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                        <p><strong>Procedure:</strong> ${recipe.procedure}</p>
                        <p><strong>Tags:</strong> ${recipe.tags.join(', ')}</p>
                        <form action="/delete/${recipe._id}" method="POST">
                            <button type="submit">Delete Recipe</button>
                        </form>
                    `;
                    searchResultsContainer.appendChild(div);
                });
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    });
});
