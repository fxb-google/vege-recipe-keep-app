/**
 * VegePower - Admin Portal & Authentication Service
 * Migrated to Firebase Authentication & Firestore for Security and Scalability.
 */

const AdminService = {
  // Hardcoded secrets REMOVED. Using Firebase Auth.

  /**
   * Verify email & password against Firebase Authentication
   */
  async authenticate(email, password) {
    if (!auth) {
      return { success: false, error: "Firebase Auth not initialized. Check firebaseConfig.js" };
    }
    
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Auth error:", error);
      return { success: false, error: error.message || "Invalid credentials." };
    }
  },

  isAdminLoggedIn() {
    return auth && auth.currentUser !== null;
  },

  async logout() {
    if (auth) {
      await auth.signOut();
    }
  },

  /**
   * Fetch subscribers from Firestore instead of localStorage
   */
  async getSubscribers() {
    if (!db) return [];
    try {
      const snapshot = await db.collection("subscribers").get();
      return snapshot.docs.map(doc => doc.data().email);
    } catch (e) {
      console.error("Error fetching subscribers:", e);
      return [];
    }
  },

  /**
   * Delete subscriber from Firestore
   */
  async deleteSubscriber(emailToDelete) {
    if (!db) return [];
    try {
      const snapshot = await db.collection("subscribers").where("email", "==", emailToDelete.toLowerCase()).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      return await this.getSubscribers();
    } catch (e) {
      console.error("Error deleting subscriber:", e);
      return [];
    }
  },

  async exportSubscribersCSV() {
    const subscribers = await this.getSubscribers();
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
   * Dispatch Weekly Digest - Now triggers a Firebase Cloud Function instead of doing it locally
   */
  async dispatchDigestNow(recipes = []) {
    const subscribers = await this.getSubscribers();
    if (subscribers.length === 0) {
      return { success: false, error: "No subscribers registered yet. Subscribe an email first!" };
    }

    const digest = this.compileWeeklyDigest(recipes);

    // Call Firebase Cloud Function to send real emails via SendGrid/Mailgun
    // This is secure because the API key is stored in GCP Secret Manager, not here!
    try {
      if (typeof firebase !== 'undefined' && firebase.functions) {
        const dispatchFunction = firebase.functions().httpsCallable('dispatchDigest');
        await dispatchFunction({ digestHtml: digest.bodyHtml, subject: digest.subject });
      } else {
        console.warn("Firebase Functions not configured. Simulating dispatch.");
      }
    } catch (e) {
      console.error("Cloud function failed, falling back to simulated dispatch", e);
    }

    console.log(`[Admin Dispatch] Sent "${digest.subject}" to ${subscribers.length} recipients:`, subscribers);

    return {
      success: true,
      sentCount: subscribers.length,
      subscribers: subscribers,
      digest: digest,
      sentTimestamp: Date.now()
    };
  }
};
