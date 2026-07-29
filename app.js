/**
 * VegePower - Dual Theme Application Controller (8-Bit Arcade vs. Pastel Watercolor)
 * Features: Dynamic Style Switcher, Mouse Parallax, Metric Consolidation, and Keep Export.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Database
  await VegeDB.initDB();
  const dbRecipes = await VegeDB.getAllRecipes();

  // Application State
  const AppState = {
    allRecipes: dbRecipes.length > 0 ? dbRecipes : [...VEGE_RECIPES],
    selectedRecipeIds: new Set(JSON.parse(localStorage.getItem('vege_selected_recipes') || '[]')),
    activeFilter: 'all',
    searchQuery: '',
    sortBy: 'protein-desc',
    globalMultiplier: 2,
    detailServingsMultiplier: 1,
    checkedIngredients: new Set(),
    currentDetailRecipeId: null,
    styleTheme: localStorage.getItem('vege_style_theme') || 'arcade'
  };

  // DOM Elements
  const btnStyleToggle = document.getElementById('btn-style-toggle');
  const styleToggleLabel = document.getElementById('style-toggle-label');
  const brandTitleText = document.getElementById('brand-title-text');
  const brandSubText = document.getElementById('brand-sub-text');
  const appVersionTag = document.getElementById('app-version-tag');
  
  const recipeGrid = document.getElementById('recipe-grid');
  const emptyState = document.getElementById('empty-state');
  const recipeCountBadge = document.getElementById('recipe-count-badge');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const sortSelect = document.getElementById('sort-select');
  const proteinPills = document.getElementById('protein-filter-pills');

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

  // Online Modal
  const btnFetchOnline = document.getElementById('btn-fetch-online');
  const onlineModal = document.getElementById('online-modal');
  const btnCloseOnlineModal = document.getElementById('btn-close-online-modal');
  const onlineSearchInput = document.getElementById('online-search-input');
  const btnSearchOnlineApi = document.getElementById('btn-search-online-api');
  const onlineResultsContainer = document.getElementById('online-results-container');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');

  /* ==========================================================================
     Dynamic Style Theme Switcher (Arcade 8-Bit vs. Pastel Watercolor)
     ========================================================================== */
  function applyStyleTheme(theme) {
    AppState.styleTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vege_style_theme', theme);

    if (theme === 'pastel') {
      styleToggleLabel.textContent = '8-BIT MODE';
      if (brandTitleText) brandTitleText.textContent = 'VegePower';
      if (brandSubText) brandSubText.textContent = 'Watercolor & Plant Recipes';
      if (appVersionTag) appVersionTag.textContent = 'v2.5-PASTEL';
    } else {
      styleToggleLabel.textContent = 'PASTEL MODE';
      if (brandTitleText) brandTitleText.textContent = 'VEGEPOWER';
      if (brandSubText) brandSubText.textContent = '< 1980s ARCADE EDITION >';
      if (appVersionTag) appVersionTag.textContent = 'v2.5-ARCADE';
    }

    renderGrid();
    if (window.lucide) lucide.createIcons();
  }

  btnStyleToggle.addEventListener('click', () => {
    const newTheme = AppState.styleTheme === 'arcade' ? 'pastel' : 'arcade';
    applyStyleTheme(newTheme);
    UIComponents.showToast(`Switched theme to ${newTheme === 'pastel' ? 'Soft Pastel Watercolor' : '1980s Arcade 8-Bit'}!`, 'success');
  });

  // Mouse Parallax Movement
  const retroBg = document.getElementById('retro-bg-parallax');
  if (retroBg) {
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetX = normX * 35;
      targetY = normY * 35;
    });

    function animateParallax() {
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;
      retroBg.style.transform = `translate3d(${-mouseX}px, ${-mouseY}px, 0)`;
      requestAnimationFrame(animateParallax);
    }
    animateParallax();
  }

  /* ==========================================================================
     Daily Background Auto-Sync & Deduplication Check
     ========================================================================== */
  async function triggerDailySync() {
    try {
      const syncResult = await RecipeApiService.checkAndRunDailyAutoFetch(AppState.allRecipes);
      if (syncResult.synced && syncResult.newRecipes.length > 0) {
        for (const recipe of syncResult.newRecipes) {
          await VegeDB.saveRecipe(recipe);
          AppState.allRecipes.unshift(recipe);
        }
        UIComponents.showToast(`Daily Sync: Added ${syncResult.newRecipes.length} new unique plant recipes!`, 'success');
        renderGrid();
      }
    } catch (err) {
      console.warn("Daily sync error:", err);
    }
  }

  /* ==========================================================================
     Filtering & Sorting
     ========================================================================== */
  function getFilteredRecipes() {
    let list = [...AppState.allRecipes];

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
      if (AppState.sortBy === 'calories-asc') return a.calories - b.calories;
      if (AppState.sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (AppState.sortBy === 'time-asc') return parseInt(a.prepTime) - parseInt(b.prepTime);
      return 0;
    });

    return list;
  }

  function renderGrid() {
    const filtered = getFilteredRecipes();
    const isPastel = AppState.styleTheme === 'pastel';
    recipeCountBadge.textContent = isPastel ? `${filtered.length} recipes` : `${filtered.length} RECIPES FOUND`;

    if (filtered.length === 0) {
      recipeGrid.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    recipeGrid.classList.remove('hidden');

    recipeGrid.innerHTML = filtered.map(r => 
      UIComponents.renderRecipeCard(r, AppState.selectedRecipeIds.has(r.id))
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
    const isPastel = AppState.styleTheme === 'pastel';

    if (headerCartBadge) headerCartBadge.textContent = count;
    if (cartBadgeCount) cartBadgeCount.textContent = count;
    if (cartRecipesCount) cartRecipesCount.textContent = isPastel ? `${count} recipes selected` : `${count} RECIPES SELECTED`;
    if (drawerRecipesSummary) drawerRecipesSummary.textContent = isPastel ? `${count} recipes selected for Keep` : `${count} RECIPES SELECTED FOR KEEP`;
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
    const btnAdd = e.target.closest('.btn-add-cart');
    const btnView = e.target.closest('.btn-view-detail') || e.target.closest('.recipe-card');

    if (btnAdd) {
      e.stopPropagation();
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
    recipeModalContent.innerHTML = UIComponents.renderRecipeDetail(recipe, servingsMultiplier, isAdded);

    recipeModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  btnCloseRecipeModal.addEventListener('click', () => recipeModal.classList.add('hidden'));

  recipeModalContent.addEventListener('click', (e) => {
    const btnAddModal = e.target.closest('.btn-modal-add-cart');
    const btnInc = e.target.closest('.btn-modal-servings-inc');
    const btnDec = e.target.closest('.btn-modal-servings-dec');

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

  // Online Modal
  btnFetchOnline.addEventListener('click', () => {
    onlineModal.classList.remove('hidden');
    triggerOnlineSearch('Tofu');
  });

  btnCloseOnlineModal.addEventListener('click', () => onlineModal.classList.add('hidden'));

  btnSearchOnlineApi.addEventListener('click', () => {
    const q = onlineSearchInput.value.trim() || 'Tofu';
    triggerOnlineSearch(q);
  });

  async function triggerOnlineSearch(query) {
    onlineResultsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px;"><i data-lucide="loader" class="spin"></i> Fetching online recipes for "${query}"...</div>`;
    if (window.lucide) lucide.createIcons();

    const fetched = await RecipeApiService.searchOnlineRecipes(query);

    if (fetched.length === 0) {
      onlineResultsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No online recipes found for "${query}". Try Tofu, Lentil, or Curry.</div>`;
      return;
    }

    onlineResultsContainer.innerHTML = fetched.map(recipe => {
      const isDup = RecipeApiService.isDuplicateRecipe(recipe, AppState.allRecipes);
      return `
        <div class="recipe-card" style="border:3px solid #000">
          <div class="card-image-wrapper" style="height:130px">
            <img src="${recipe.image}" class="card-image">
          </div>
          <div class="card-body" style="padding:12px;">
            <h4 style="font-size:0.85rem; margin-bottom:4px;">${recipe.title}</h4>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">${recipe.ingredients.length} INGREDIENTS | +${recipe.proteinGrams}g HP</p>
            ${isDup ? `<span class="badge pixel-badge-cyan"><i data-lucide="check-circle" style="width:10px"></i> IN DATABASE</span>` : `
              <button class="btn pixel-btn pixel-btn-green btn-import-online" data-online-id="${recipe.id}">
                <i data-lucide="plus"></i> IMPORT RECIPE
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
            UIComponents.showToast('RECIPE ALREADY EXISTS IN DATABASE!', 'info');
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

  // Initial Load & Apply Style Theme
  applyStyleTheme(AppState.styleTheme);
  await triggerDailySync();
});
