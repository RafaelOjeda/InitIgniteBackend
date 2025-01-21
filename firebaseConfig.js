// Import and configure dotenv to load environment variables
import dotenv from "dotenv";
dotenv.config();

const firebaseAPI = process.env.FIREBASE_API_KEY
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN
const firebaseProjectID = process.env.FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderID = process.env.FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppID = process.env.FIREBASE_APP_ID;
const measurementId = process.env.FIREBASE_MEASUREMENT_ID;


const firebaseConfig = {
    apiKey: firebaseAPI,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectID,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderID,
    appId: firebaseAppID,
    measurementId: measurementId
};

export default firebaseConfig;

