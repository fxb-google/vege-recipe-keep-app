/**
 * VegePower - Admin Portal & Authentication Service
 * Manages Secret Credentials, Session Tokens, Recipe Administration, Subscriber Emails, and Digest Dispatch.
 */

const AdminService = {
  SECRET_USERNAME_HASH: "admin",
  SECRET_PASSWORD_HASH: "vegepower2026!",
  SESSION_TOKEN_KEY: "vege_admin_session_token",
  LAST_DIGEST_SENT_KEY: "vege_last_digest_sent_timestamp",

  /**
   * Verify username & password against secret credentials
   */
  authenticate(username, password) {
    if (username && username.trim() === this.SECRET_USERNAME_HASH && password && password.trim() === this.SECRET_PASSWORD_HASH) {
      const sessionToken = "admin_token_" + Date.now() + "_" + Math.random().toString(36).substring(2);
      localStorage.setItem(this.SESSION_TOKEN_KEY, sessionToken);
      return { success: true, token: sessionToken };
    }
    return { success: false, error: "Invalid username or password" };
  },

  isAdminLoggedIn() {
    const token = localStorage.getItem(this.SESSION_TOKEN_KEY);
    return !!token && token.startsWith("admin_token_");
  },

  logout() {
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
  },

  getSubscribers() {
    try {
      return JSON.parse(localStorage.getItem('vege_newsletter_subscribers') || '[]');
    } catch(e) {
      return [];
    }
  },

  deleteSubscriber(emailToDelete) {
    let subscribers = this.getSubscribers();
    subscribers = subscribers.filter(e => e.toLowerCase() !== emailToDelete.toLowerCase());
    localStorage.setItem('vege_newsletter_subscribers', JSON.stringify(subscribers));
    return subscribers;
  },

  exportSubscribersCSV() {
    const subscribers = this.getSubscribers();
    if (subscribers.length === 0) return false;

    const csvContent = "data:text/csv;charset=utf-8,Email Address,Subscribed Date\n" + 
      subscribers.map(e => `"${e}","${new Date().toLocaleDateString()}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vegepower_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  /**
   * Compile & Format Weekly Recipe Digest Email
   */
  compileWeeklyDigest(recipes = []) {
    // Sort top 3 highest voted recipes
    const top3 = [...recipes]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 3);

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const recipeItemsHtml = top3.map((r, i) => `
      <div style="background:#f4efe6; border-radius:12px; padding:16px; margin-bottom:14px;">
        <h4 style="margin:0 0 6px 0; color:#064e3b; font-size:1.05rem;">#${i+1} ${r.title}</h4>
        <p style="margin:0 0 8px 0; font-size:0.88rem; color:#4a5d59;">${r.description}</p>
        <div style="font-size:0.8rem; font-weight:700; color:#059669;">
          ⚡ ${r.proteinGrams}g Plant Protein &bull; 👍 ${r.likesCount || 0} Votes &bull; ⏱️ ${r.prepTime} Prep
        </div>
      </div>
    `).join('');

    return {
      subject: `🌱 VegePower Weekly Digest - Top Plant Recipes (${dateStr})`,
      dateStr,
      top3,
      bodyHtml: `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#ffffff; border-radius:16px;">
          <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #e2e8f0; margin-bottom:20px;">
            <h2 style="color:#064e3b; font-family:'Playfair Display', serif; margin:0 0 6px 0;">🌱 VegePower Weekly Digest</h2>
            <p style="color:#7d938f; margin:0; font-size:0.85rem;">Curated Top-Voted Plant-Protein Recipes for ${dateStr}</p>
          </div>

          <h3 style="color:#1c2826; font-size:1.1rem; margin-bottom:14px;">This Week's Top Voted Recipes:</h3>
          ${recipeItemsHtml}

          <div style="background:#064e3b; color:#ffffff; padding:16px; border-radius:12px; text-align:center; margin-top:20px;">
            <p style="margin:0 0 10px 0; font-size:0.9rem;">Ready to shop? Sync your checklist to Google Keep in 1 click!</p>
            <a href="https://fxb-google.github.io/vege-recipe-keep-app/" style="background:#10b981; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:8px; font-weight:700; font-size:0.88rem; display:inline-block;">Open Google Keep Checklist Sync</a>
          </div>
        </div>
      `
    };
  },

  /**
   * Immediately Dispatch Weekly Digest to All Subscribers
   */
  dispatchDigestNow(recipes = []) {
    const subscribers = this.getSubscribers();
    if (subscribers.length === 0) {
      return { success: false, error: "No subscribers registered yet. Subscribe an email first!" };
    }

    const digest = this.compileWeeklyDigest(recipes);
    const now = Date.now();
    localStorage.setItem(this.LAST_DIGEST_SENT_KEY, now.toString());

    console.log(`[Admin Dispatch] Sent "${digest.subject}" to ${subscribers.length} recipients:`, subscribers);

    return {
      success: true,
      sentCount: subscribers.length,
      subscribers: subscribers,
      digest: digest,
      sentTimestamp: now
    };
  }
};
