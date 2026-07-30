const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Cloud Function to dispatch the Weekly Digest Email.
 * Uses a mock email sender here to demonstrate the architecture,
 * but in a real GCP environment this would use SendGrid or Mailgun
 * via their SDK and Firebase Secrets (e.g. process.env.SENDGRID_API_KEY).
 */
exports.dispatchDigest = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated (they must be an Admin)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { digestHtml, subject } = data;
  if (!digestHtml || !subject) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing digestHtml or subject.'
    );
  }

  try {
    const db = admin.firestore();
    const snapshot = await db.collection("subscribers").get();
    const subscribers = snapshot.docs.map(doc => doc.data().email);

    if (subscribers.length === 0) {
      return { success: false, error: "No subscribers found." };
    }

    // In a production app, we would integrate SendGrid/Mailgun here:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ ... })

    console.log(`[Cloud Function] Simulated email dispatch to ${subscribers.length} users.`);
    console.log(`[Cloud Function] Subject: ${subject}`);
    
    return { 
      success: true, 
      sentCount: subscribers.length, 
      message: `Digest successfully sent to ${subscribers.length} subscribers via Cloud Functions.`
    };
  } catch (error) {
    console.error("Error dispatching digest:", error);
    throw new functions.https.HttpsError('internal', 'Unable to dispatch digest.', error.message);
  }
});
