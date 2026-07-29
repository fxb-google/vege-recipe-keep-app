/**
 * VegePower - Admin Portal & Authentication Service
 * Manages Secret Credentials, Session Tokens, Recipe Administration, and Subscriber Emails.
 */

const AdminService = {
  // Configured Admin Secrets (Default credentials: admin / vegepower2026!)
  SECRET_USERNAME_HASH: "admin",
  SECRET_PASSWORD_HASH: "vegepower2026!",
  SESSION_TOKEN_KEY: "vege_admin_session_token",

  /**
   * Verify username & password against secret credentials
   */
  authenticate(username, password) {
    if (username.trim() === this.SECRET_USERNAME_HASH && password.trim() === this.SECRET_PASSWORD_HASH) {
      const sessionToken = "admin_token_" + Date.now() + "_" + Math.random().toString(36).substring(2);
      localStorage.setItem(this.SESSION_TOKEN_KEY, sessionToken);
      return { success: true, token: sessionToken };
    }
    return { success: false, error: "Invalid username or password" };
  },

  /**
   * Check if current user is logged in as Admin
   */
  isAdminLoggedIn() {
    const token = localStorage.getItem(this.SESSION_TOKEN_KEY);
    return !!token && token.startsWith("admin_token_");
  },

  /**
   * Logout Admin session
   */
  logout() {
    localStorage.removeItem(this.SESSION_TOKEN_KEY);
  },

  /**
   * Get all registered subscriber emails
   */
  getSubscribers() {
    return JSON.parse(localStorage.getItem('vege_newsletter_subscribers') || '[]');
  },

  /**
   * Delete a subscriber email
   */
  deleteSubscriber(emailToDelete) {
    let subscribers = this.getSubscribers();
    subscribers = subscribers.filter(e => e.toLowerCase() !== emailToDelete.toLowerCase());
    localStorage.setItem('vege_newsletter_subscribers', JSON.stringify(subscribers));
    return subscribers;
  },

  /**
   * Export subscribers as CSV file
   */
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
  }
};
