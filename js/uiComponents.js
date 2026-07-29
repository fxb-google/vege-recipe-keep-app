/**
 * VegePower - 1980s Retro Arcade UI Components & Template Generators
 * Clean metric system display & consolidated retail store pack sizes.
 */

const UIComponents = {
  /**
   * Calculate Store Packaging Recommendation for Metric System
   */
  calculateStorePackage(name, amount, unit) {
    const lower = name.toLowerCase();
    
    // Normalize legacy imperial to metric if present
    let metricAmt = amount;
    let metricUnit = unit;
    if (unit === 'cup') { metricAmt = amount * 150; metricUnit = 'g'; }
    if (unit === 'oz') { metricAmt = amount * 28; metricUnit = 'g'; }
    if (unit === 'lb' || unit === 'lbs') { metricAmt = amount * 450; metricUnit = 'g'; }

    // Metric Grams
    if (metricUnit === 'g') {
      if (metricAmt >= 1000) {
        const kg = (metricAmt / 1000).toFixed(1).replace(/\.0$/, '');
        return { display: `${kg} kg`, storePack: `🛒 BUY ${kg} KG` };
      }
      if (lower.includes('tofu') || lower.includes('tempeh') || lower.includes('seitan')) {
        const packs = Math.max(1, Math.ceil(metricAmt / 250));
        return { display: `${metricAmt}g`, storePack: `🛒 BUY ${packs}X 250g PACK` };
      }
      if (lower.includes('lentil') || lower.includes('quinoa') || lower.includes('rice') || lower.includes('flour') || lower.includes('gluten') || lower.includes('pasta') || lower.includes('oats')) {
        const bags = Math.max(1, Math.ceil(metricAmt / 500));
        return { display: `${metricAmt}g`, storePack: `🛒 BUY ${bags}X 500g BAG` };
      }
      if (lower.includes('chickpea') || lower.includes('bean') || lower.includes('corn')) {
        const cans = Math.max(1, Math.ceil(metricAmt / 400));
        return { display: `${metricAmt}g`, storePack: `🛒 BUY ${cans}X 400g CAN` };
      }
      return { display: `${metricAmt}g`, storePack: `🛒 BUY ~${metricAmt}g` };
    }

    // Metric Milliliters
    if (metricUnit === 'ml') {
      if (metricAmt >= 1000) {
        const l = (metricAmt / 1000).toFixed(1).replace(/\.0$/, '');
        return { display: `${l} L`, storePack: `🛒 BUY ${l} L BOTTLE` };
      }
      if (metricAmt <= 250) return { display: `${metricAmt}ml`, storePack: `🛒 BUY 1X 250ml BOTTLE` };
      if (metricAmt <= 500) return { display: `${metricAmt}ml`, storePack: `🛒 BUY 1X 500ml BOTTLE` };
      return { display: `${metricAmt}ml`, storePack: `🛒 BUY 1X 1L BOTTLE` };
    }

    // Cans / Packs / Jars
    if (metricUnit.includes('can')) {
      const numCans = Math.max(1, Math.ceil(metricAmt));
      return { display: `${numCans} CANS`, storePack: `🛒 BUY ${numCans}X 400g CANS` };
    }

    return { display: `${metricAmt} ${metricUnit.toUpperCase()}`, storePack: `🛒 ${metricAmt} ${metricUnit.toUpperCase()}` };
  },

  /**
   * Render Single Recipe Card for Main Grid
   */
  renderRecipeCard(recipe, isSelected = false) {
    const sourceClass = recipe.proteinSource || 'tofu';
    const sourceLabel = (recipe.proteinSource || 'tofu').toUpperCase();
    
    return `
      <div class="recipe-card" data-recipe-id="${recipe.id}">
        <div class="card-image-wrapper">
          <img src="${recipe.image}" alt="${recipe.title}" class="card-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'">
          <div class="card-badges-top">
            <span class="badge badge-source ${sourceClass}">${sourceLabel}</span>
            <span class="badge pixel-badge-gold"><i data-lucide="zap" style="width:10px"></i> +${recipe.proteinGrams}g HP</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-meta">
            <span><i data-lucide="clock" style="width:12px"></i> ${recipe.prepTime}</span>
            <span>&bull;</span>
            <span><i data-lucide="flame" style="width:12px"></i> ${recipe.calories} KCAL</span>
            <span>&bull;</span>
            <span><i data-lucide="users" style="width:12px"></i> ${recipe.servings} SERV</span>
          </div>

          <h3 class="card-title">${recipe.title}</h3>
          <p class="card-description">${recipe.description}</p>

          <div class="card-footer">
            <button class="btn pixel-btn ${isSelected ? 'pixel-btn-yellow' : 'pixel-btn-green'} btn-add-cart" data-recipe-id="${recipe.id}">
              <i data-lucide="${isSelected ? 'check' : 'plus'}"></i>
              <span>${isSelected ? 'ADDED' : 'ADD INGREDIENTS'}</span>
            </button>
            
            <button class="btn pixel-btn pixel-btn-cyan btn-view-detail" style="padding: 6px 10px; font-size: 0.65rem;">
              <span>INSPECT</span>
              <i data-lucide="chevron-right" style="width:12px"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Detailed View Modal for a Recipe
   */
  renderRecipeDetail(recipe, servingsMultiplier = 1, isAdded = false) {
    const ingredientsHtml = recipe.ingredients.map(ing => {
      const amount = (ing.amount * servingsMultiplier).toFixed(1).replace(/\.0$/, '');
      const pkg = this.calculateStorePackage(ing.name, ing.amount * servingsMultiplier, ing.unit);
      return `
        <li class="ingredient-item">
          <span>${ing.name}</span>
          <div style="text-align:right">
            <div class="ingredient-amount" style="font-weight:700">${amount} ${ing.unit.toUpperCase()}</div>
            <div style="font-size:0.75rem; color:var(--arcade-yellow); font-weight:700">${pkg.storePack}</div>
          </div>
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
          <span class="badge pixel-badge-gold"><i data-lucide="zap" style="width:12px"></i> +${recipe.proteinGrams * servingsMultiplier}g TOTAL HP</span>
        </div>
        <h2 class="detail-title">${recipe.title}</h2>
        <p class="pixel-text-sub" style="margin-bottom:12px;">${recipe.description}</p>

        <div class="detail-macros-grid">
          <div class="macro-box">
            <div class="macro-box-val">${recipe.proteinGrams * servingsMultiplier}g</div>
            <div class="macro-box-lbl">PROTEIN (HP)</div>
          </div>
          <div class="macro-box">
            <div class="macro-box-val">${recipe.calories * servingsMultiplier}</div>
            <div class="macro-box-lbl">CALORIES</div>
          </div>
          <div class="macro-box">
            <div class="macro-box-val">${recipe.prepTime}</div>
            <div class="macro-box-lbl">TIME</div>
          </div>
          <div class="macro-box">
            <div class="macro-box-val">${recipe.servings * servingsMultiplier}</div>
            <div class="macro-box-lbl">SERVINGS</div>
          </div>
        </div>

        <div class="ingredients-section-header">
          <h3>METRIC INGREDIENTS</h3>
          <div class="serving-selector-inline">
            <span>SERVINGS:</span>
            <button class="serving-btn btn-modal-servings-dec" data-recipe-id="${recipe.id}">-</button>
            <strong class="pixel-text-yellow">${recipe.servings * servingsMultiplier}</strong>
            <button class="serving-btn btn-modal-servings-inc" data-recipe-id="${recipe.id}">+</button>
          </div>
        </div>

        <ul class="detail-ingredients-list">
          ${ingredientsHtml}
        </ul>

        <h3 class="pixel-text-cyan" style="margin-bottom:14px;">STEP-BY-STEP MISSION INSTRUCTIONS</h3>
        <div class="instructions-list" style="margin-bottom:24px;">
          ${instructionsHtml}
        </div>

        <div style="display:flex; gap:12px; margin-top:20px;">
          <button class="btn pixel-btn ${isAdded ? 'pixel-btn-yellow' : 'pixel-btn-green'} btn-modal-add-cart" data-recipe-id="${recipe.id}" style="flex:1;">
            <i data-lucide="${isAdded ? 'check' : 'plus'}"></i>
            <span>${isAdded ? 'ADDED TO INVENTORY' : 'ADD INGREDIENTS TO INVENTORY'}</span>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render Shopping List Aisle Categorized Items with Store Package Consolidation
   */
  renderShoppingAisles(shoppingList, globalMultiplier = 1) {
    if (Object.keys(shoppingList).length === 0 || Object.values(shoppingList).every(arr => arr.length === 0)) {
      return `
        <div class="empty-state pixel-border-box" style="padding:30px 10px;">
          <div class="empty-icon"><i data-lucide="shopping-bag"></i></div>
          <h3 class="pixel-text-gold">INVENTORY EMPTY</h3>
          <p class="pixel-text-sub">ADD POWER RECIPES TO GENERATE YOUR AGGREGATED METRIC CHECKLIST FOR GOOGLE KEEP.</p>
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
        const totalAmount = item.amount * globalMultiplier;
        const pkg = this.calculateStorePackage(item.name, totalAmount, item.unit);

        return `
          <div class="aisle-item ${item.checked ? 'checked' : ''}">
            <label class="aisle-item-checkbox" style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;">
              <input type="checkbox" data-aisle="${aisle}" data-item-idx="${idx}" ${item.checked ? 'checked' : ''}>
              <div>
                <div style="font-weight:700; color:#fff;">${item.name}</div>
                <div style="font-size:0.8rem; color:var(--arcade-yellow); font-weight:700">${pkg.storePack}</div>
              </div>
            </label>
            <span style="font-family:var(--font-subpixel); font-weight:700; color:var(--arcade-cyan); font-size:0.8rem;">${pkg.display}</span>
          </div>
        `;
      }).join('');

      html += `
        <div class="shopping-aisle" style="margin-bottom:16px;">
          <div class="aisle-header pixel-text-gold" style="margin-bottom:8px; font-family:var(--font-pixel); font-size:0.75rem;">${icon} ${aisle.toUpperCase()} (${items.length})</div>
          <div class="aisle-items-list" style="display:flex; flex-direction:column; gap:8px;">${itemsHtml}</div>
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
