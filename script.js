document.addEventListener('DOMContentLoaded', () => {
    const introSection = document.getElementById('intro-section');
    const mainContent = document.getElementById('main-content');
    const enterSiteButton = document.getElementById('enter-site-button');

    const allRecipesSection = document.getElementById('all-recipes-section');
    const myRecipesSection = document.getElementById('my-recipes-section');
    const recipeFormSection = document.getElementById('recipe-form-section');
    const recipeDetailSection = document.getElementById('recipe-detail-section');

    const allRecipesLink = document.getElementById('all-recipes-link');
    const myRecipesLink = document.getElementById('my-recipes-link');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    const addRecipeButton = document.getElementById('add-recipe-button');
    const recipeForm = document.getElementById('recipe-form');
    const categoryFilter = document.getElementById('category-filter');
    const levelFilter = document.getElementById('level-filter');
    const searchFilter = document.getElementById('search-filter');
    const applyFiltersButton = document.getElementById('apply-filters');

    let isLoggedIn = false;
    let userRecipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
    let editingRecipeId = null;


    // Event listeners for navigation
    allRecipesLink.addEventListener('click', () => {
        allRecipesSection.style.display = 'block';
        myRecipesSection.style.display = 'none';
        recipeFormSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        addRecipeButton.classList.remove('show');
        loadAllRecipes();
    });

    myRecipesLink.addEventListener('click', () => {
        if (isLoggedIn) {
            allRecipesSection.style.display = 'none';
            myRecipesSection.style.display = 'block';
            recipeFormSection.style.display = 'none';
            recipeDetailSection.style.display = 'none';
            addRecipeButton.classList.add('show');
            loadUserRecipes();
        } else {
            alert('אנא התחבר כדי לראות את המתכונים שלך.');
        }
    });

    loginLink.addEventListener('click', () => {
        isLoggedIn = true;
        loginLink.style.display = 'none';
        logoutLink.style.display = 'inline';
    });

    logoutLink.addEventListener('click', () => {
        isLoggedIn = false;
        loginLink.style.display = 'inline';
        logoutLink.style.display = 'none';
        myRecipesSection.style.display = 'none';
        recipeFormSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        allRecipesSection.style.display = 'block';
        addRecipeButton.classList.remove('show');
    });

    addRecipeButton.addEventListener('click', () => {
        recipeFormSection.style.display = 'block';
        myRecipesSection.style.display = 'none';
        allRecipesSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        resetForm();
        editingRecipeId = null;
    });

    recipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const recipe = {
            id: editingRecipeId || Date.now(), // מזהה ייחודי לכל מתכון
            name: document.getElementById('recipe-name').value,
            ingredients: document.getElementById('ingredients').value,
            level: document.getElementById('level').value,
            category: document.getElementById('category').value,
            instructions: document.getElementById('instructions').value,
        };
        if (editingRecipeId) {
            updateRecipe(recipe);
        } else {
            addRecipe(recipe);
        }
    });

    applyFiltersButton.addEventListener('click', () => {
        applyFilters();
    });

    function addRecipe(recipe) {
        const recipeImageInput = document.getElementById('recipe-image');
        if (recipeImageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                recipe.image = resizeImage(e.target.result);
                saveRecipe(recipe);
            };
            reader.readAsDataURL(recipeImageInput.files[0]);
        } else {
            recipe.image = getCategoryImage(recipe.category);
            saveRecipe(recipe);
        }
    }
    
    function updateRecipe(updatedRecipe) {
        const recipeImageInput = document.getElementById('recipe-image');
        if (recipeImageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                updatedRecipe.image = resizeImage(e.target.result);
                saveUpdatedRecipe(updatedRecipe);
            };
            reader.readAsDataURL(recipeImageInput.files[0]);
        } else {
            updatedRecipe.image = getCategoryImage(updatedRecipe.category);
            saveUpdatedRecipe(updatedRecipe);
        }
    }
    

    function saveRecipe(recipe) {
        userRecipes.push(recipe);
        localStorage.setItem('userRecipes', JSON.stringify(userRecipes));
        alert('המתכון נוסף בהצלחה!');
        resetForm();
        loadAllRecipes();
        allRecipesSection.style.display = 'block';
        recipeFormSection.style.display = 'none';
    }
    
    function saveUpdatedRecipe(updatedRecipe) {
        userRecipes = userRecipes.map(recipe => recipe.id === updatedRecipe.id ? updatedRecipe : recipe);
        localStorage.setItem('userRecipes', JSON.stringify(userRecipes));
        alert('המתכון עודכן בהצלחה!');
        resetForm();
        loadAllRecipes();
        myRecipesSection.style.display = 'block';
        recipeFormSection.style.display = 'none';
    }

    function resetForm() {
        document.getElementById('recipe-id').value = '';
        document.getElementById('recipe-name').value = '';
        document.getElementById('ingredients').value = '';
        document.getElementById('level').value = 'easy';
        document.getElementById('category').value = 'breads';
        document.getElementById('instructions').value = '';
    }

    function loadAllRecipes() {
        const recipesList = document.getElementById('recipes-list');
        recipesList.innerHTML = '';
        userRecipes.forEach((recipe) => {
            const recipeItem = document.createElement('div');
            recipeItem.classList.add('recipe-item');
            recipeItem.innerHTML = `
                <h3>${recipe.name}</h3>
                <img src="${recipe.image || getCategoryImage(recipe.category)}" alt="${recipe.category}" class="recipe-image">
            `;
            recipeItem.addEventListener('click', () => {
                displayRecipe(recipe);
            });
            recipesList.appendChild(recipeItem);
        });
    }

    function loadUserRecipes() {
        const myRecipesList = document.getElementById('my-recipes-list');
        myRecipesList.innerHTML = '';
        userRecipes.forEach((recipe) => {
            const recipeItem = document.createElement('div');
            recipeItem.classList.add('recipe-item');
            recipeItem.innerHTML = `
                <h3>${recipe.name}</h3>
                <button class="edit-recipe-button" data-id="${recipe.id}">ערוך</button>
                <button class="delete-recipe-button" data-id="${recipe.id}">מחק</button>
            `;
            recipeItem.querySelector('.edit-recipe-button').addEventListener('click', (e) => {
                e.stopPropagation();
                editRecipe(recipe.id);
            });
            recipeItem.querySelector('.delete-recipe-button').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('האם אתה בטוח שאתה רוצה למחוק את המתכון?')) {
                    deleteRecipe(recipe.id);
                }
            });
            myRecipesList.appendChild(recipeItem);
        });
    }

    function editRecipe(recipeId) {
        const recipe = userRecipes.find(recipe => recipe.id === recipeId);
        if (recipe) {
            document.getElementById('recipe-id').value = recipe.id;
            document.getElementById('recipe-name').value = recipe.name;
            document.getElementById('ingredients').value = recipe.ingredients;
            document.getElementById('level').value = recipe.level;
            document.getElementById('category').value = recipe.category;
            document.getElementById('instructions').value = recipe.instructions;
            recipeFormSection.style.display = 'block';
            myRecipesSection.style.display = 'none';
            allRecipesSection.style.display = 'none';
            recipeDetailSection.style.display = 'none';
            editingRecipeId = recipe.id;
        } else {
            alert('המתכון לא נמצא');
        }
    }
    
    function displayRecipe(recipe) {
        recipeDetailSection.innerHTML = `
            <h2>${recipe.name}</h2>
            <img src="${recipe.image || getCategoryImage(recipe.category)}" alt="${recipe.category}" class="recipe-image">
            <div class="ingredients">
                <p><strong>מצרכים:</strong></p>
                <p style="white-space: pre-line;">${recipe.ingredients}</p>
            </div>
            <div class="instructions">
                <h3>הוראות:</h3>
                <p id="recipe-instructions" style="white-space: pre-line;">${recipe.instructions}</p>
            </div>
            <button id="back-to-recipes">חזור למתכונים</button>
        `;
        recipeDetailSection.style.display = 'block';
        allRecipesSection.style.display = 'none';
        myRecipesSection.style.display = 'none';
        recipeFormSection.style.display = 'none';
    
        document.getElementById('back-to-recipes').addEventListener('click', () => {
            recipeDetailSection.style.display = 'none';
            allRecipesSection.style.display = 'block';
        });
    }

    function deleteRecipe(recipeId) {
        userRecipes = userRecipes.filter(recipe => recipe.id !== recipeId);
        localStorage.setItem('userRecipes', JSON.stringify(userRecipes));
        loadUserRecipes();
        loadAllRecipes();
    }

    function applyFilters() {
        const category = categoryFilter.value;
        const level = levelFilter.value;
        const search = searchFilter.value.toLowerCase();

        const filteredRecipes = userRecipes.filter(recipe => {
            return (category === 'all' || recipe.category === category) &&
                   (level === 'all' || recipe.level === level) &&
                   (search === '' || recipe.name.toLowerCase().includes(search));
        });

        displayFilteredRecipes(filteredRecipes);
    }

    function displayFilteredRecipes(recipes) {
        const recipesList = document.getElementById('recipes-list');
        recipesList.innerHTML = '';
        recipes.forEach((recipe) => {
            const recipeItem = document.createElement('div');
            recipeItem.classList.add('recipe-item');
            recipeItem.innerHTML = `
                <h3>${recipe.name}</h3>
                <img src="${getCategoryImage(recipe.category)}" alt="${recipe.category}" class="recipe-image">
            `;
            recipeItem.addEventListener('click', () => {
                displayRecipe(recipe);
            });
            recipesList.appendChild(recipeItem);
        });
    }

    function getCategoryImage(category) {
        switch (category) {
            case 'breads':
                return 'bread.jpg';
            case 'cakes':
                return 'cake.jpg';
            case 'main-dishes':
                return 'main-dishes.jpg';
            case 'sides':
                return 'sides.jpg';
            case 'other':
                return 'other.jpg';
            default:
                return 'default.jpg';
        }
    }
    function resizeImage(image) {
        const maxWidth = 200;
        const maxHeight = 150;
    
        const img = new Image();
        img.src = image;
    
        img.onload = () => {
            let width = img.width;
            let height = img.height;
    
            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height = Math.round((maxHeight * height) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((maxWidth * width) / height);
                    height = maxHeight;
                }
            } else {
                if (width < maxWidth) {
                    height = Math.round((maxHeight * height) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((maxWidth * width) / height);
                    height = maxHeight;
                }
            }
    
            img.width = width;
            img.height = height;
        };
    
        return img.src;
    }
    

    // Initial load of all recipes
    loadAllRecipes();
});

