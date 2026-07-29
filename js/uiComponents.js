/**
 * VegePower - UI Components & Template Generators
 * Clean metric system display, consolidated retail store pack sizes,
 * and interactive Thumbs Up / Thumbs Down voting system.
 */

const UIComponents = {
  /**
   * Calculate Store Packaging Recommendation for Metric System
   */
  calculateStorePackage(name, amount, unit) {
    const lower = name.toLowerCase();
    
    let metricAmt = amount;
    let metricUnit = unit;
    if (unit === 'cup') { metricAmt = amount * 150; metricUnit = 'g'; }
    if (unit === 'oz') { metricAmt = amount * 28; metricUnit = 'g'; }
    if (unit === 'lb' || unit === 'lbs') { metricAmt = amount * 450; metricUnit = 'g'; }

    // Metric Grams
    if (metricUnit === 'g') {
      if (metricAmt >= 1000) {
        const kg = (metricAmt / 1000).toFixed(1).replace(/\.0$/, '');
        return { display: `${kg} kg`, storePack: `🛒 Buy ${kg} kg` };
      }
      if (lower.includes('tofu') || lower.includes('tempeh') || lower.includes('seitan')) {
        const packs = Math.max(1, Math.ceil(metricAmt / 250));
        return { display: `${metricAmt}g`, storePack: `🛒 Buy ${packs}x 250g pack${packs > 1 ? 's' : ''}` };
      }
      if (lower.includes('lentil') || lower.includes('quinoa') || lower.includes('rice') || lower.includes('flour') || lower.includes('gluten') || lower.includes('pasta') || lower.includes('oats')) {
        const bags = Math.max(1, Math.ceil(metricAmt / 500));
        return { display: `${metricAmt}g`, storePack: `🛒 Buy ${bags}x 500g bag${bags > 1 ? 's' : ''}` };
      }
      if (lower.includes('chickpea') || lower.includes('bean') || lower.includes('corn')) {
        const cans = Math.max(1, Math.ceil(metricAmt / 400));
        return { display: `${metricAmt}g`, storePack: `🛒 Buy ${cans}x 400g can${cans > 1 ? 's' : ''}` };
      }
      return { display: `${metricAmt}g`, storePack: `🛒 Buy ~${metricAmt}g` };
    }

    // Metric Milliliters
    if (metricUnit === 'ml') {
      if (metricAmt >= 1000) {
        const l = (metricAmt / 1000).toFixed(1).replace(/\.0$/, '');
        return { display: `${l} L`, storePack: `🛒 Buy ${l} L bottle` };
      }
      if (metricAmt <= 250) return { display: `${metricAmt}ml`, storePack: `🛒 Buy 1x 250ml bottle` };
      if (metricAmt <= 500) return { display: `${metricAmt}ml`, storePack: `🛒 Buy 1x 500ml bottle` };
      return { display: `${metricAmt}ml`, storePack: `🛒 Buy 1x 1L bottle` };
    }

    // Cans / Packs / Jars
    if (metricUnit.includes('can')) {
      const numCans = Math.max(1, Math.ceil(metricAmt));
      return { display: `${numCans} cans`, storePack: `🛒 Buy ${numCans}x 400g cans` };
    }

    return { display: `${metricAmt} ${metricUnit}`, storePack: `🛒 ${metricAmt} ${metricUnit}` };
  },

  /**
   * Render Single Recipe Card for Main Grid with Thumbs Up / Down Voting Controls
   */
  renderRecipeCard(recipe, isSelected = false, userVote = null) {
    const sourceClass = recipe.proteinSource || 'tofu';
    const sourceLabel = (recipe.proteinSource || 'tofu').toUpperCase();
    
    const likes = recipe.likesCount || 0;
    const dislikes = recipe.dislikesCount || 0;
    const totalVotes = likes + dislikes;
    const approvalRatio = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : 98;

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
            <span>&bull;</span>
            <span><i data-lucide="flame" style="width:14px"></i> ${recipe.calories} kcal</span>
            <span>&bull;</span>
            <span><i data-lucide="thumbs-up" style="width:13px"></i> ${approvalRatio}% (${likes})</span>
          </div>

          <h3 class="card-title">${recipe.title}</h3>
          <p class="card-description">${recipe.description}</p>

          <!-- Thumbs Up / Down Interactive Voting Control -->
          <div class="voting-container" data-recipe-id="${recipe.id}">
            <button class="btn-vote btn-vote-up ${userVote === 'up' ? 'active-up' : ''}" data-vote="up" title="Vote Good Recipe">
              <i data-lucide="thumbs-up" style="width:14px"></i>
              <span>${likes}</span>
            </button>
            <button class="btn-vote btn-vote-down ${userVote === 'down' ? 'active-down' : ''}" data-vote="down" title="Vote Needs Improvement">
              <i data-lucide="thumbs-down" style="width:14px"></i>
              <span>${dislikes}</span>
            </button>
          </div>

          <div class="card-footer">
            <button class="btn btn-add-cart ${isSelected ? 'added' : ''}" data-recipe-id="${recipe.id}">
              <i data-lucide="${isSelected ? 'check' : 'plus'}"></i>
              <span>${isSelected ? 'Added to List' : 'Add Ingredients'}</span>
            </button>
            
            <button class="btn btn-outline btn-sm btn-view-detail" style="padding: 6px 12px; font-size: 0.8rem;">
              <span>View Recipe</span>
              <i data-lucide="chevron-right" style="width:14px"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Detailed View Modal for a Recipe
   */
  renderRecipeDetail(recipe, servingsMultiplier = 1, isAdded = false, userVote = null) {
    const likes = recipe.likesCount || 0;
    const dislikes = recipe.dislikesCount || 0;

    const ingredientsHtml = recipe.ingredients.map(ing => {
      const amount = (ing.amount * servingsMultiplier).toFixed(1).replace(/\.0$/, '');
      const pkg = this.calculateStorePackage(ing.name, ing.amount * servingsMultiplier, ing.unit);
      return `
        <li class="ingredient-item">
          <span>${ing.name}</span>
          <div style="text-align:right">
            <div class="ingredient-amount">${amount} ${ing.unit}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600">${pkg.storePack}</div>
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
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; gap:8px;">
            <span class="badge badge-source ${recipe.proteinSource}">${(recipe.proteinSource || 'tofu').toUpperCase()}</span>
            <span class="badge badge-protein"><i data-lucide="zap" style="width:12px"></i> ${recipe.proteinGrams * servingsMultiplier}g Total Protein</span>
          </div>

          <!-- Modal Voting Control -->
          <div class="voting-container" data-recipe-id="${recipe.id}">
            <button class="btn-vote btn-vote-up ${userVote === 'up' ? 'active-up' : ''}" data-vote="up">
              <i data-lucide="thumbs-up" style="width:14px"></i>
              <span>${likes} Good</span>
            </button>
            <button class="btn-vote btn-vote-down ${userVote === 'down' ? 'active-down' : ''}" data-vote="down">
              <i data-lucide="thumbs-down" style="width:14px"></i>
              <span>${dislikes}</span>
            </button>
          </div>
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
          <h3>Ingredients (Metric System)</h3>
          <div class="serving-selector-inline">
            <span>Servings:</span>
            <button class="serving-btn btn-modal-servings-dec" data-recipe-id="${recipe.id}">-</button>
            <strong style="color:var(--forest-900)">${recipe.servings * servingsMultiplier}</strong>
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
   * Render Shopping List Aisle Categorized Items with Store Package Consolidation
   */
  renderShoppingAisles(shoppingList, globalMultiplier = 1) {
    if (Object.keys(shoppingList).length === 0 || Object.values(shoppingList).every(arr => arr.length === 0)) {
      return `
        <div class="empty-state" style="padding:40px 10px;">
          <div class="empty-icon"><i data-lucide="shopping-bag"></i></div>
          <h3>Your Shopping List is Empty</h3>
          <p>Browse recipes and click "Add" to generate your aggregated metric ingredient checklist for Google Keep.</p>
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
            <label class="aisle-item-checkbox" style="display:flex; align-items:center; gap:10px; flex:1;">
              <input type="checkbox" data-aisle="${aisle}" data-item-idx="${idx}" ${item.checked ? 'checked' : ''}>
              <div>
                <div style="font-weight:600">${item.name}</div>
                <div style="font-size:0.75rem; color:var(--emerald-600); font-weight:700">${pkg.storePack}</div>
              </div>
            </label>
            <span style="font-weight:700; color:var(--text-secondary); font-size:0.88rem;">${pkg.display}</span>
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
