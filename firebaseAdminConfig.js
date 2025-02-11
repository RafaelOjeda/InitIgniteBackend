// Import and configure dotenv to load environment variables
import dotenv from "dotenv";
dotenv.config();

const typesdk = process.env.FIREBASE_ADMIN_TYPE;
const projectid = process.env.FIREBASE_ADMIN_PROJECT_ID;
const privateKeyId = process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const clientId = process.env.FIREBASE_ADMIN_CLIENT_ID;
const authUri = process.env.FIREBASE_ADMIN_AUTH_URI;
const tokenUri = process.env.FIREBASE_ADMIN_TOKEN_URI;
const authProvider = process.env.FIREBASE_ADMIN_AUTH_PROVIDER;
const clientCertUrl = process.env.FIREBASE_ADMIN_CLIENT_CERT_URL;
const universeDomain = process.env.FIREBASE_ADMIN_UNIVERSAL_DOMAIN;

const firebaseAdminConfig = {
  type: typesdk,
  project_id: projectid,
  private_key_id: privateKeyId,
  private_key: privateKey,
  client_email: clientEmail,
  client_id: clientId,
  auth_uri: authUri,
  token_uri: tokenUri,
  auth_provider_x509_cert_url: authProvider, // Use the correct variable name here
  client_x509_cert_url: clientCertUrl,
  universe_domain: universeDomain
};

export default firebaseAdminConfig;

