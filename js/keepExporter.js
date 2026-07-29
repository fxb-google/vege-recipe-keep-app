/**
 * VegePower - Google Keep Exporter Service
 * Formats ingredient lists into Google Keep checklist format
 * with consolidated retail store package recommendations and metric units.
 */

const KeepExporterService = {
  /**
   * Formats aggregated shopping items into a clean Google Keep checklist
   */
  formatKeepChecklist(shoppingList, selectedRecipes = [], globalMultiplier = 1) {
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const recipeTitles = selectedRecipes.map(r => r.title).join(', ');
    let lines = [];

    // Note Header
    lines.push(`🌱 VEGETARIAN POWER SHOPPING LIST (${dateStr})`);
    if (recipeTitles) {
      lines.push(`Recipes (${globalMultiplier}x Servings): ${recipeTitles}`);
    }
    lines.push(`----------------------------------------`);
    lines.push(``);

    // Aisle Categories
    const categoryIcons = {
      "Produce": "🥦",
      "Protein & Chilled": "🫘",
      "Pantry": "🏺",
      "Spices": "🧂",
      "Other": "🛒"
    };

    let totalItems = 0;

    for (const [category, items] of Object.entries(shoppingList)) {
      if (items.length === 0) continue;

      const icon = categoryIcons[category] || "🛒";
      lines.push(`${icon} ${category.toUpperCase()}`);

      items.forEach(item => {
        const checkedMark = item.checked ? "[x]" : "[ ]";
        const totalAmt = item.amount * globalMultiplier;
        const pkg = UIComponents.calculateStorePackage(item.name, totalAmt, item.unit);
        lines.push(`${checkedMark} ${item.name} — ${pkg.display} (${pkg.storePack})`);
        totalItems++;
      });

      lines.push(``);
    }

    lines.push(`----------------------------------------`);
    lines.push(`Total Checklist Items: ${totalItems}`);
    lines.push(`Created with VegePower & Google Keep Sync`);

    return lines.join('\n');
  },

  formatAmount(val) {
    if (val === Math.floor(val)) return val.toString();
    return val.toFixed(1).replace(/\.0$/, '');
  },

  /**
   * Export via Web Share API (Primary mobile target)
   */
  async exportViaWebShare(title, text) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text
        });
        return { success: true, method: 'webshare' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn("Web Share API failed, falling back to keep.new:", err);
          this.openKeepNew(text);
          return { success: true, method: 'keep.new' };
        }
        return { success: false, method: 'cancelled' };
      }
    } else {
      this.openKeepNew(text);
      return { success: true, method: 'keep.new' };
    }
  },

  /**
   * Fallback 1: Deep link to keep.new with clipboard copy
   */
  async openKeepNew(text) {
    await this.copyToClipboard(text);
    window.open('https://keep.new', '_blank', 'noopener,noreferrer');
  },

  /**
   * Fallback 2: Direct Clipboard Copy
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      return false;
    }
  }
};
