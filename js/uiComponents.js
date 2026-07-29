/**
 * VegePower - UI Renderer Components
 * Handles rendering recipe cards, detail view modal, shopping list drawer,
 * and toast notifications.
 */

const UIComponents = {
  /**
   * Render single Recipe Card HTML
   */
  renderRecipeCard(recipe, isAdded = false) {
    const sourceClass = recipe.proteinSource || 'tofu';
    const sourceLabel = (recipe.proteinSource || 'tofu').toUpperCase();
    const onlineBadge = recipe.isOnline ? `<span class="badge badge-secondary" style="background: rgba(6,182,212,0.2); color:#06b6d4;"><i data-lucide="globe" style="width:12px"></i> Online</span>` : '';

    return `
      <div class="recipe-card" data-recipe-id="${recipe.id}">
        <div class="card-image-wrapper">
          <img src="${recipe.image}" alt="${recipe.title}" class="card-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'">
          <div class="card-badges-top">
            <span class="badge badge-source ${sourceClass}">${sourceLabel}</span>
            <span class="badge badge-protein"><i data-lucide="zap" style="width:12px"></i> ${recipe.proteinGrams}g Protein</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-meta">
            <span><i data-lucide="clock" style="width:14px"></i> ${recipe.prepTime}</span>
            <span><i data-lucide="flame" style="width:14px"></i> ${recipe.calories} kcal</span>
            ${onlineBadge}
          </div>

          <h3 class="card-title">${recipe.title}</h3>
          <p class="card-description">${recipe.description}</p>

          <div class="card-footer">
            <div class="card-macros">
              <div class="macro-pill">
                <span class="macro-val">${recipe.proteinGrams}g</span>
                <span class="macro-lbl">Protein</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn btn-outline btn-sm btn-view-detail" data-recipe-id="${recipe.id}">
                <i data-lucide="eye" style="width:14px"></i> View
              </button>
              <button class="btn-add-cart ${isAdded ? 'added' : ''}" data-recipe-id="${recipe.id}">
                <i data-lucide="${isAdded ? 'check' : 'plus'}" style="width:14px"></i> ${isAdded ? 'In List' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Recipe Detail Modal Content
   */
  renderRecipeDetail(recipe, servingsMultiplier = 1, isAdded = false) {
    const ingredientsHtml = recipe.ingredients.map(ing => {
      const amount = (ing.amount * servingsMultiplier).toFixed(1).replace(/\.0$/, '');
      return `
        <li class="ingredient-item">
          <span>${ing.name}</span>
          <span class="ingredient-amount">${amount} ${ing.unit}</span>
        </li>
      `;
    }).join('');

    const instructionsHtml = recipe.instructions.map((step, idx) => `
      <div class="step-item">
        <div class="step-num">${idx + 1}</div>
        <div class="step-text">${step}</div>
      </div>
    `).join('');

    return `
      <div class="recipe-detail-header">
        <img src="${recipe.image}" alt="${recipe.title}" class="detail-hero-image" onerror="this.src='https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'">
      </div>

      <div class="detail-title-section">
        <div style="display:flex; gap:8px; margin-bottom:8px;">
          <span class="badge badge-source ${recipe.proteinSource}">${(recipe.proteinSource || 'tofu').toUpperCase()}</span>
          <span class="badge badge-protein"><i data-lucide="zap" style="width:12px"></i> ${recipe.proteinGrams * servingsMultiplier}g Total Protein</span>
        </div>
        <h2 class="detail-title">${recipe.title}</h2>
        <p style="color: var(--text-secondary); font-size: 0.92rem;">${recipe.description}</p>

        <div class="detail-macros-grid">
          <div class="macro-box">
            <div class="macro-box-val">${recipe.proteinGrams * servingsMultiplier}g</div>
            <div class="macro-box-lbl">Protein</div>
          </div>
          <div class="macro-box">
            <div class="macro-box-val">${recipe.calories * servingsMultiplier}</div>
            <div class="macro-box-lbl">Calories</div>
          </div>
          <div class="macro-box">
            <div class="macro-box-val">${recipe.prepTime}</div>
            <div class="macro-box-lbl">Prep</div>
          </div>
          <div class="macro-box">
            <div class="macro-box-val">${recipe.servings * servingsMultiplier}</div>
            <div class="macro-box-lbl">Servings</div>
          </div>
        </div>

        <div class="ingredients-section-header">
          <h3>Ingredients</h3>
          <div class="serving-selector-inline">
            <span>Servings:</span>
            <button class="serving-btn btn-modal-servings-dec" data-recipe-id="${recipe.id}">-</button>
            <strong style="color:var(--emerald-400)">${recipe.servings * servingsMultiplier}</strong>
            <button class="serving-btn btn-modal-servings-inc" data-recipe-id="${recipe.id}">+</button>
          </div>
        </div>

        <ul class="detail-ingredients-list">
          ${ingredientsHtml}
        </ul>

        <h3 style="margin-bottom:14px;">Step-by-Step Instructions</h3>
        <div class="instructions-list" style="margin-bottom:24px;">
          ${instructionsHtml}
        </div>

        <div style="display:flex; gap:12px; margin-top:20px;">
          <button class="btn btn-primary btn-modal-add-cart ${isAdded ? 'added' : ''}" data-recipe-id="${recipe.id}" style="flex:1;">
            <i data-lucide="${isAdded ? 'check' : 'plus'}"></i>
            <span>${isAdded ? 'Added to Shopping List' : 'Add Ingredients to Shopping List'}</span>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render Shopping List Aisle Categorized Items
   */
  renderShoppingAisles(shoppingList, globalMultiplier = 1) {
    if (Object.keys(shoppingList).length === 0 || Object.values(shoppingList).every(arr => arr.length === 0)) {
      return `
        <div class="empty-state" style="padding:40px 10px;">
          <div class="empty-icon"><i data-lucide="shopping-bag"></i></div>
          <h3>Your Shopping List is Empty</h3>
          <p>Browse recipes and click "Add" to generate your aggregated ingredient checklist for Google Keep.</p>
        </div>
      `;
    }

    const aisleIcons = {
      "Produce": "🥦",
      "Protein & Chilled": "🫘",
      "Pantry": "🏺",
      "Spices": "🧂",
      "Other": "🛒"
    };

    let html = '';

    for (const [aisle, items] of Object.entries(shoppingList)) {
      if (items.length === 0) continue;

      const icon = aisleIcons[aisle] || "🛒";
      const itemsHtml = items.map((item, idx) => {
        const totalAmount = (item.amount * globalMultiplier).toFixed(1).replace(/\.0$/, '');
        return `
          <div class="aisle-item ${item.checked ? 'checked' : ''}">
            <label class="aisle-item-checkbox">
              <input type="checkbox" data-aisle="${aisle}" data-item-idx="${idx}" ${item.checked ? 'checked' : ''}>
              <span>${item.name}</span>
            </label>
            <span style="font-weight:600; color:var(--emerald-400);">${totalAmount} ${item.unit}</span>
          </div>
        `;
      }).join('');

      html += `
        <div class="shopping-aisle">
          <div class="aisle-header">${icon} ${aisle} (${items.length})</div>
          <div class="aisle-items-list">${itemsHtml}</div>
        </div>
      `;
    }

    return html;
  },

  /**
   * Render Toast Message
   */
  showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const iconName = type === 'success' ? 'check-circle' : 'info';
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i data-lucide="${iconName}" style="width:16px;"></i> <span>${message}</span>`;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }
};
