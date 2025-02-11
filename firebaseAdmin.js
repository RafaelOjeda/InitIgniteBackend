import admin from "firebase-admin";
import firebaseAdminConfig from "./firebaseAdminConfig.js";

admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig)
});

const admin_auth = admin.auth();
export { admin_auth };