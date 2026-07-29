/**
 * VegePower Application Controller
 * Handles Voting (Thumbs Up / Down), Meat-Free Sanitization,
 * Weekly Email Newsletter Subscription, Instagram Discovery, and Keep Export.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Database & Purge Non-Vegetarian Items
  await VegeDB.initDB();
  let dbRecipes = await VegeDB.getAllRecipes();

  // Load User Votes State
  const userVotes = JSON.parse(localStorage.getItem('vege_user_votes') || '{}');

  // Application State
  const AppState = {
    allRecipes: dbRecipes,
    selectedRecipeIds: new Set(JSON.parse(localStorage.getItem('vege_selected_recipes') || '[]')),
    activeFilter: 'all',
    searchQuery: '',
    sortBy: 'protein-desc',
    globalMultiplier: 2,
    detailServingsMultiplier: 1,
    checkedIngredients: new Set(),
    currentDetailRecipeId: null,
    userVotes: userVotes
  };

  // DOM Elements
  const recipeGrid = document.getElementById('recipe-grid');
  const emptyState = document.getElementById('empty-state');
  const recipeCountBadge = document.getElementById('recipe-count-badge');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const sortSelect = document.getElementById('sort-select');
  const proteinPills = document.getElementById('protein-filter-pills');

  // Newsletter Form DOM
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');

  // Header & Bottom Bar Cart Buttons
  const btnOpenCartHeader = document.getElementById('btn-open-cart-header');
  const headerCartBadge = document.getElementById('header-cart-badge');
  const mobileBottomBar = document.getElementById('mobile-bottom-bar');
  const cartBadgeCount = document.getElementById('cart-badge-count');
  const cartRecipesCount = document.getElementById('cart-recipes-count');
  const btnOpenCartMobile = document.getElementById('btn-open-cart-mobile');
  
  // Shopping Drawer DOM
  const shoppingDrawer = document.getElementById('shopping-drawer');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const shoppingListItems = document.getElementById('shopping-list-items');
  const drawerRecipesSummary = document.getElementById('drawer-recipes-summary');
  const btnClearShoppingList = document.getElementById('btn-clear-shopping-list');
  
  // Keep Export Buttons
  const btnQuickExportKeep = document.getElementById('btn-quick-export-keep');
  const btnExportWebshare = document.getElementById('btn-export-webshare');
  const btnExportKeepNew = document.getElementById('btn-export-keep-new');
  const btnCopyChecklist = document.getElementById('btn-copy-checklist');

  // Modal Elements
  const recipeModal = document.getElementById('recipe-modal');
  const btnCloseRecipeModal = document.getElementById('btn-close-recipe-modal');
  const recipeModalContent = document.getElementById('recipe-modal-content');

  // Online & Instagram Search Modal
  const btnFetchOnline = document.getElementById('btn-fetch-online');
  const onlineModal = document.getElementById('online-modal');
  const btnCloseOnlineModal = document.getElementById('btn-close-online-modal');
  const onlineSearchInput = document.getElementById('online-search-input');
  const btnSearchOnlineApi = document.getElementById('btn-search-online-api');
  const btnSearchIgApi = document.getElementById('btn-search-ig-api');
  const onlineResultsContainer = document.getElementById('online-results-container');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');

  /* ==========================================================================
     Interactive Mouse Parallax on Soft Watercolor Wash Canvas
     ========================================================================== */
  const washes = document.querySelectorAll('.watercolor-wash');
  if (washes.length > 0) {
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
      
      washes[0].style.transform = `translate3d(${mouseX * 25}px, ${mouseY * 25}px, 0)`;
      washes[1].style.transform = `translate3d(${-mouseX * 35}px, ${-mouseY * 35}px, 0)`;
      washes[2].style.transform = `translate3d(${mouseX * 15}px, ${-mouseY * 15}px, 0)`;
    });
  }

  /* ==========================================================================
     Weekly Email Newsletter Subscription Handler
     ========================================================================== */
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      if (!email) return;

      const subscribers = JSON.parse(localStorage.getItem('vege_newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('vege_newsletter_subscribers', JSON.stringify(subscribers));
      }

      newsletterEmail.value = '';
      UIComponents.showToast(`Subscribed ${email}! Weekly Digest sent!`, 'success', 5000);
    });
  }

  /* ==========================================================================
     Voting System Handler (Thumbs Up / Thumbs Down)
     ========================================================================== */
  async function handleRecipeVote(recipeId, voteType) {
    const recipe = AppState.allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    if (recipe.likesCount === undefined) recipe.likesCount = 120;
    if (recipe.dislikesCount === undefined) recipe.dislikesCount = 3;

    const currentVote = AppState.userVotes[recipeId];

    if (currentVote === voteType) {
      // Retract vote
      if (voteType === 'up') recipe.likesCount = Math.max(0, recipe.likesCount - 1);
      if (voteType === 'down') recipe.dislikesCount = Math.max(0, recipe.dislikesCount - 1);
      delete AppState.userVotes[recipeId];
    } else {
      // Swapping or casting new vote
      if (currentVote === 'up') recipe.likesCount = Math.max(0, recipe.likesCount - 1);
      if (currentVote === 'down') recipe.dislikesCount = Math.max(0, recipe.dislikesCount - 1);

      if (voteType === 'up') recipe.likesCount += 1;
      if (voteType === 'down') recipe.dislikesCount += 1;

      AppState.userVotes[recipeId] = voteType;
    }

    localStorage.setItem('vege_user_votes', JSON.stringify(AppState.userVotes));
    await VegeDB.saveRecipe(recipe);

    UIComponents.showToast(voteType === 'up' ? 'Voted 👍 Thumbs Up!' : 'Voted 👎 Thumbs Down.', 'success');
    
    // Re-render UI to reflect updated counts
    renderGrid();

    if (AppState.currentDetailRecipeId === recipeId && !recipeModal.classList.contains('hidden')) {
      openRecipeDetailModal(recipeId, AppState.detailServingsMultiplier);
    }
  }

  /* ==========================================================================
     Filtering & Sorting
     ========================================================================== */
  function getFilteredRecipes() {
    let list = AppState.allRecipes.filter(r => !RecipeApiService.isMeatRecipe(r));

    if (AppState.activeFilter !== 'all') {
      if (AppState.activeFilter === 'high-protein') {
        list = list.filter(r => r.proteinGrams >= 30);
      } else {
        list = list.filter(r => r.proteinSource === AppState.activeFilter);
      }
    }

    if (AppState.searchQuery.trim() !== '') {
      const q = AppState.searchQuery.toLowerCase().trim();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (AppState.sortBy === 'protein-desc') return b.proteinGrams - a.proteinGrams;
      if (AppState.sortBy === 'votes-desc') return (b.likesCount || 0) - (a.likesCount || 0);
      if (AppState.sortBy === 'calories-asc') return a.calories - b.calories;
      if (AppState.sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (AppState.sortBy === 'time-asc') return parseInt(a.prepTime) - parseInt(b.prepTime);
      return 0;
    });

    return list;
  }

  function renderGrid() {
    const filtered = getFilteredRecipes();
    recipeCountBadge.textContent = `${filtered.length} recipes`;

    if (filtered.length === 0) {
      recipeGrid.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    recipeGrid.classList.remove('hidden');

    recipeGrid.innerHTML = filtered.map(r => 
      UIComponents.renderRecipeCard(r, AppState.selectedRecipeIds.has(r.id), AppState.userVotes[r.id])
    ).join('');

    if (window.lucide) lucide.createIcons();
    updateCartBadges();
  }

  /* ==========================================================================
     Cart & Shopping List Logic
     ========================================================================== */
  function getAggregatedShoppingList() {
    const selectedRecipes = AppState.allRecipes.filter(r => AppState.selectedRecipeIds.has(r.id));
    const aisleMap = {
      "Produce": [],
      "Protein & Chilled": [],
      "Pantry": [],
      "Spices": [],
      "Other": []
    };

    const itemAggregator = {};

    selectedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}_${ing.unit.toLowerCase()}`;
        const cat = ing.category || RecipeApiService.categorizeIngredient(ing.name);

        if (!itemAggregator[key]) {
          itemAggregator[key] = {
            name: ing.name,
            amount: 0,
            unit: ing.unit,
            category: cat
          };
        }
        itemAggregator[key].amount += ing.amount;
      });
    });

    Object.values(itemAggregator).forEach(item => {
      const cat = item.category || 'Pantry';
      if (!aisleMap[cat]) aisleMap[cat] = [];

      const itemKey = `${cat}_${item.name}`;
      item.checked = AppState.checkedIngredients.has(itemKey);
      aisleMap[cat].push(item);
    });

    return { aisleMap, selectedRecipes };
  }

  function updateCartBadges() {
    const count = AppState.selectedRecipeIds.size;
    if (headerCartBadge) headerCartBadge.textContent = count;
    if (cartBadgeCount) cartBadgeCount.textContent = count;
    if (cartRecipesCount) cartRecipesCount.textContent = `${count} recipes selected`;
    if (drawerRecipesSummary) drawerRecipesSummary.textContent = `${count} recipes selected for Keep`;
    localStorage.setItem('vege_selected_recipes', JSON.stringify(Array.from(AppState.selectedRecipeIds)));
  }

  function renderDrawer() {
    const { aisleMap, selectedRecipes } = getAggregatedShoppingList();
    shoppingListItems.innerHTML = UIComponents.renderShoppingAisles(aisleMap, AppState.globalMultiplier);

    document.querySelectorAll('.multiplier-btn').forEach(btn => {
      const mult = parseInt(btn.dataset.multiplier);
      btn.classList.toggle('active', mult === AppState.globalMultiplier);
    });

    if (window.lucide) lucide.createIcons();
  }

  function openShoppingDrawer() {
    renderDrawer();
    shoppingDrawer.classList.remove('hidden');
  }

  /* ==========================================================================
     Google Keep Sync
     ========================================================================== */
  async function handleKeepExport(method = 'webshare') {
    const { aisleMap, selectedRecipes } = getAggregatedShoppingList();
    if (selectedRecipes.length === 0) {
      UIComponents.showToast('Please select at least 1 recipe first!', 'info');
      return;
    }

    const formattedList = KeepExporterService.formatKeepChecklist(
      aisleMap,
      selectedRecipes,
      AppState.globalMultiplier
    );

    if (method === 'webshare') {
      const res = await KeepExporterService.exportViaWebShare(
        `Vegetarian Shopping List (${selectedRecipes.length} recipes)`,
        formattedList
      );
      if (res.success) {
        UIComponents.showToast('Opened Web Share target! Select Google Keep.', 'success');
      } else if (res.method === 'keep.new') {
        UIComponents.showToast('Copied list to clipboard & opened keep.new!', 'success');
      }
    } else if (method === 'keep.new') {
      KeepExporterService.openKeepNew(formattedList);
      UIComponents.showToast('Copied list! Paste into Google Keep.', 'success');
    } else if (method === 'copy') {
      const ok = await KeepExporterService.copyToClipboard(formattedList);
      if (ok) {
        UIComponents.showToast('Copied Google Keep checklist to clipboard!', 'success');
      }
    }
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */
  searchInput.addEventListener('input', (e) => {
    AppState.searchQuery = e.target.value;
    btnClearSearch.classList.toggle('hidden', AppState.searchQuery === '');
    renderGrid();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    AppState.searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderGrid();
  });

  sortSelect.addEventListener('change', (e) => {
    AppState.sortBy = e.target.value;
    renderGrid();
  });

  proteinPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    proteinPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    AppState.activeFilter = pill.dataset.filter;
    renderGrid();
  });

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    searchInput.value = '';
    AppState.searchQuery = '';
    AppState.activeFilter = 'all';
    proteinPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    proteinPills.querySelector('[data-filter="all"]').classList.add('active');
    renderGrid();
  });

  recipeGrid.addEventListener('click', (e) => {
    const btnVote = e.target.closest('.btn-vote');
    const btnAdd = e.target.closest('.btn-add-cart');
    const btnView = e.target.closest('.btn-view-detail') || e.target.closest('.recipe-card');

    if (btnVote) {
      const container = btnVote.closest('.voting-container');
      const id = container.dataset.recipeId;
      const voteType = btnVote.dataset.vote;
      handleRecipeVote(id, voteType);
      return;
    }

    if (btnAdd) {
      const id = btnAdd.dataset.recipeId;
      if (AppState.selectedRecipeIds.has(id)) {
        AppState.selectedRecipeIds.delete(id);
        UIComponents.showToast('Removed from shopping list', 'info');
      } else {
        AppState.selectedRecipeIds.add(id);
        UIComponents.showToast('Added ingredients to shopping list!', 'success');
      }
      renderGrid();
      return;
    }

    if (btnView) {
      const card = e.target.closest('.recipe-card');
      const id = card ? card.dataset.recipeId : null;
      if (id) {
        AppState.detailServingsMultiplier = 1;
        openRecipeDetailModal(id, 1);
      }
    }
  });

  function openRecipeDetailModal(id, servingsMultiplier = 1) {
    const recipe = AppState.allRecipes.find(r => r.id === id);
    if (!recipe) return;

    AppState.currentDetailRecipeId = id;
    AppState.detailServingsMultiplier = servingsMultiplier;
    const isAdded = AppState.selectedRecipeIds.has(id);
    recipeModalContent.innerHTML = UIComponents.renderRecipeDetail(recipe, servingsMultiplier, isAdded, AppState.userVotes[id]);

    recipeModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  btnCloseRecipeModal.addEventListener('click', () => recipeModal.classList.add('hidden'));

  recipeModalContent.addEventListener('click', (e) => {
    const btnVoteModal = e.target.closest('.btn-vote');
    const btnAddModal = e.target.closest('.btn-modal-add-cart');
    const btnInc = e.target.closest('.btn-modal-servings-inc');
    const btnDec = e.target.closest('.btn-modal-servings-dec');

    if (btnVoteModal) {
      const container = btnVoteModal.closest('.voting-container');
      const id = container.dataset.recipeId;
      const voteType = btnVoteModal.dataset.vote;
      handleRecipeVote(id, voteType);
      return;
    }

    if (btnInc) {
      AppState.detailServingsMultiplier += 1;
      openRecipeDetailModal(AppState.currentDetailRecipeId, AppState.detailServingsMultiplier);
      return;
    }

    if (btnDec) {
      if (AppState.detailServingsMultiplier > 1) {
        AppState.detailServingsMultiplier -= 1;
        openRecipeDetailModal(AppState.currentDetailRecipeId, AppState.detailServingsMultiplier);
      }
      return;
    }

    if (btnAddModal) {
      const id = AppState.currentDetailRecipeId;
      if (AppState.selectedRecipeIds.has(id)) {
        AppState.selectedRecipeIds.delete(id);
      } else {
        AppState.selectedRecipeIds.add(id);
        UIComponents.showToast('Added to shopping list!', 'success');
      }
      openRecipeDetailModal(id, AppState.detailServingsMultiplier);
      renderGrid();
    }
  });

  if (btnOpenCartHeader) {
    btnOpenCartHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      openShoppingDrawer();
    });
  }

  if (btnOpenCartMobile) {
    btnOpenCartMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      openShoppingDrawer();
    });
  }

  if (mobileBottomBar) {
    mobileBottomBar.addEventListener('click', (e) => {
      if (!e.target.closest('#btn-quick-export-keep')) {
        openShoppingDrawer();
      }
    });
  }

  btnCloseDrawer.addEventListener('click', () => shoppingDrawer.classList.add('hidden'));

  shoppingDrawer.addEventListener('click', (e) => {
    const multBtn = e.target.closest('.multiplier-btn');
    if (multBtn) {
      AppState.globalMultiplier = parseInt(multBtn.dataset.multiplier);
      renderDrawer();
    }
  });

  shoppingListItems.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      const aisle = e.target.dataset.aisle;
      const idx = parseInt(e.target.dataset.itemIdx);
      const { aisleMap } = getAggregatedShoppingList();
      const item = aisleMap[aisle] ? aisleMap[aisle][idx] : null;

      if (item) {
        const itemKey = `${aisle}_${item.name}`;
        if (e.target.checked) {
          AppState.checkedIngredients.add(itemKey);
        } else {
          AppState.checkedIngredients.delete(itemKey);
        }
        renderDrawer();
      }
    }
  });

  btnClearShoppingList.addEventListener('click', () => {
    AppState.selectedRecipeIds.clear();
    AppState.checkedIngredients.clear();
    renderGrid();
    renderDrawer();
    UIComponents.showToast('Shopping list cleared', 'info');
  });

  btnQuickExportKeep.addEventListener('click', (e) => {
    e.stopPropagation();
    handleKeepExport('webshare');
  });

  btnExportWebshare.addEventListener('click', () => handleKeepExport('webshare'));
  btnExportKeepNew.addEventListener('click', () => handleKeepExport('keep.new'));
  btnCopyChecklist.addEventListener('click', () => handleKeepExport('copy'));

  // Online & Instagram Search Modal
  btnFetchOnline.addEventListener('click', () => {
    onlineModal.classList.remove('hidden');
    triggerOnlineSearch('Tofu', 'online');
  });

  btnCloseOnlineModal.addEventListener('click', () => onlineModal.classList.add('hidden'));

  btnSearchOnlineApi.addEventListener('click', () => {
    const q = onlineSearchInput.value.trim() || 'Tofu';
    triggerOnlineSearch(q, 'online');
  });

  if (btnSearchIgApi) {
    btnSearchIgApi.addEventListener('click', () => {
      const q = onlineSearchInput.value.trim() || 'Tofu';
      triggerOnlineSearch(q, 'instagram');
    });
  }

  async function triggerOnlineSearch(query, mode = 'online') {
    onlineResultsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px;"><i data-lucide="loader" class="spin"></i> Fetching ${mode === 'instagram' ? 'Instagram recipe reels' : 'online recipes'} for "${query}"...</div>`;
    if (window.lucide) lucide.createIcons();

    const fetched = mode === 'instagram' 
      ? await RecipeApiService.searchInstagramRecipes(query)
      : await RecipeApiService.searchOnlineRecipes(query);

    if (fetched.length === 0) {
      onlineResultsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No recipes found for "${query}". Try Tofu, Seitan, or Lentil.</div>`;
      return;
    }

    onlineResultsContainer.innerHTML = fetched.map(recipe => {
      const isDup = RecipeApiService.isDuplicateRecipe(recipe, AppState.allRecipes);
      return `
        <div class="recipe-card" style="box-shadow:none;">
          <div class="card-image-wrapper" style="height:130px">
            <img src="${recipe.image}" class="card-image">
          </div>
          <div class="card-body" style="padding:12px;">
            <h4 style="font-size:0.9rem; margin-bottom:4px;">${recipe.title}</h4>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">${recipe.ingredients.length} INGREDIENTS | +${recipe.proteinGrams}g Protein</p>
            ${isDup ? `<span class="badge badge-secondary"><i data-lucide="check-circle" style="width:12px"></i> In Database</span>` : `
              <button class="btn btn-primary btn-sm btn-import-online" data-online-id="${recipe.id}">
                <i data-lucide="plus"></i> Import Recipe
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    onlineResultsContainer.querySelectorAll('.btn-import-online').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.btn-import-online').dataset.onlineId;
        const targetRecipe = fetched.find(r => r.id === id);
        if (targetRecipe) {
          if (RecipeApiService.isDuplicateRecipe(targetRecipe, AppState.allRecipes)) {
            UIComponents.showToast('Recipe already exists in database!', 'info');
            return;
          }

          await VegeDB.saveRecipe(targetRecipe);
          AppState.allRecipes.unshift(targetRecipe);
          AppState.selectedRecipeIds.add(targetRecipe.id);
          onlineModal.classList.add('hidden');
          renderGrid();
          UIComponents.showToast(`Saved "${targetRecipe.title}" to Shopping List!`, 'success');
        }
      });
    });
  }

  // Theme Toggle
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'watercolor' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('vege_theme_mode', next);
    });
  }

  // Initial Load & Render
  renderGrid();
});
