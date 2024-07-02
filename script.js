document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipe-form');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const allRecipesSection = document.getElementById('all-recipes-section');
    const myRecipesSection = document.getElementById('my-recipes-section');
    const recipeFormSection = document.getElementById('recipe-form-section');
    const recipeDetailSection = document.getElementById('recipe-detail-section');
    const addRecipeButton = document.getElementById('add-recipe-button');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const allRecipesLink = document.getElementById('all-recipes-link');
    const myRecipesLink = document.getElementById('my-recipes-link');
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');

    let userRecipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let editingRecipeId = null;

    if (currentUser) {
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        allRecipesSection.style.display = 'block';
        loginLink.style.display = 'none';
        logoutLink.style.display = 'inline';
        addRecipeButton.style.display = 'flex';
    } else {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
        allRecipesSection.style.display = 'none';
       
        addRecipeButton.style.display = 'none';
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            loginSection.style.display = 'none';
            allRecipesSection.style.display = 'block';
            loginLink.style.display = 'none';
            logoutLink.style.display = 'inline';
            addRecipeButton.style.display = 'flex';
            loadAllRecipes();
        } else {
            alert('אימייל או סיסמה שגויים');
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        if (users.some(user => user.email === email)) {
            alert('האימייל הזה כבר רשום');
        } else {
            const newUser = { email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            alert('הרשמה הצליחה! כעת אפשר להתחבר');
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
        }
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    });

    logoutLink.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        loginLink.style.display = 'inline';
        logoutLink.style.display = 'none';
        allRecipesSection.style.display = 'none';
        myRecipesSection.style.display = 'none';
        recipeFormSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        loginSection.style.display = 'block';
        addRecipeButton.style.display = 'none';
    });

    addRecipeButton.addEventListener('click', () => {
        if (!currentUser) {
            alert('אנא התחבר כדי להוסיף מתכון');
            return;
        }
        recipeFormSection.style.display = 'block';
        myRecipesSection.style.display = 'none';
        allRecipesSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        resetForm();
        editingRecipeId = null;
        document.getElementById('recipe-creator').value = currentUser.email;
    });

    recipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const recipe = {
            id: editingRecipeId || Date.now(),
            name: document.getElementById('recipe-name').value,
            ingredients: document.getElementById('ingredients').value,
            level: document.getElementById('level').value,
            category: document.getElementById('category').value,
            instructions: document.getElementById('instructions').value,
            creator: currentUser.email,
            image: document.getElementById('recipe-image').files[0] ? URL.createObjectURL(document.getElementById('recipe-image').files[0]) : getCategoryImage(document.getElementById('category').value)
        };
        if (editingRecipeId) {
            updateRecipe(recipe);
        } else {
            addRecipe(recipe);
        }
    });

    function addRecipe(recipe) {
        userRecipes.push(recipe);
        localStorage.setItem('userRecipes', JSON.stringify(userRecipes));
        alert('המתכון נוסף בהצלחה!');
        resetForm();
        loadAllRecipes();
        allRecipesSection.style.display = 'block';
        recipeFormSection.style.display = 'none';
    }

    function updateRecipe(updatedRecipe) {
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
        document.getElementById('recipe-image').value = '';
        document.getElementById('recipe-creator').value = '';
    }

    allRecipesLink.addEventListener('click', () => {
        allRecipesSection.style.display = 'block';
        myRecipesSection.style.display = 'none';
        recipeFormSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        loadAllRecipes();
    });

    myRecipesLink.addEventListener('click', () => {
        if (!currentUser) {
            alert('אנא התחבר כדי לראות את המתכונים שלך');
            return;
        }
        allRecipesSection.style.display = 'none';
        myRecipesSection.style.display = 'block';
        recipeFormSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        loadUserRecipes();
    });

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
        userRecipes.filter(recipe => recipe.creator === currentUser.email).forEach((recipe) => {
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
        if (recipe.creator !== currentUser.email) {
            alert('רק הממציא יכול לערוך את המתכון');
            return;
        }
        document.getElementById('recipe-id').value = recipe.id;
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('ingredients').value = recipe.ingredients;
        document.getElementById('level').value = recipe.level;
        document.getElementById('category').value = recipe.category;
        document.getElementById('instructions').value = recipe.instructions;
        document.getElementById('recipe-creator').value = recipe.creator;
        recipeFormSection.style.display = 'block';
        myRecipesSection.style.display = 'none';
        allRecipesSection.style.display = 'none';
        recipeDetailSection.style.display = 'none';
        editingRecipeId = recipe.id;
    }

    function displayRecipe(recipe) {
        recipeDetailSection.innerHTML = `
            <h2>${recipe.name}</h2>
            <img src="${recipe.image || getCategoryImage(recipe.category)}" alt="${recipe.category}" class="recipe-image">
            <p><strong>מצרכים:</strong> ${recipe.ingredients}</p>
            <p><strong>רמת קושי:</strong> ${recipe.level}</p>
            <p><strong>שם הממציא:</strong> ${recipe.creator}</p>
            <div class="instructions">
                <h3>הוראות:</h3>
                <p id="recipe-instructions-display" style="white-space: pre-line;">${recipe.instructions}</p>
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
        const category = document.getElementById('category-filter').value;
        const level = document.getElementById('level-filter').value;
        const search = document.getElementById('search-filter').value.toLowerCase();
        const creator = document.getElementById('creator-filter').value.toLowerCase();

        const filteredRecipes = userRecipes.filter(recipe => {
            return (category === 'all' || recipe.category === category) &&
                   (level === 'all' || recipe.level === level) &&
                   (search === '' || recipe.name.toLowerCase().includes(search)) &&
                   (creator === '' || recipe.creator.toLowerCase().includes(creator));
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
                <img src="${recipe.image || getCategoryImage(recipe.category)}" alt="${recipe.category}" class="recipe-image">
            `;
            recipeItem.addEventListener('click', () => {
                displayRecipe(recipe);
            });
            recipesList.appendChild(recipeItem);
        });
    }

    document.getElementById('apply-filters').addEventListener('click', applyFilters);

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

    // Initial load of all recipes
    loadAllRecipes();
});
