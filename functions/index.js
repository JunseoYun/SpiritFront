/**
 * Import Firebase functions and admin SDK
 */
const {onCall} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Define the getApiKey function
exports.getApiKey = onCall(async data => {
  const platform = data.platform; // 예: 'kakao', 'google'
  const db = admin.firestore();

  try {
    const doc = await db.collection('api_keys').doc(platform).get();
    if (!doc.exists) {
      return {error: 'API Key not found'};
    }
    return {key: doc.data().key}; // API 키 반환
  } catch (error) {
    console.error('Error fetching API key:', error);
    return {error: 'Internal Server Error'};
  }
});
