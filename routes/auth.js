import express from "express";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "../firebase.js"; // Firebase client SDK
import { db } from "../firebase.js";

const router = express.Router();

/* Register a new user */
router.post("/register", async (req, res) => {
    const { email, name, password } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, "Users", userCredential.user.uid);

        await setDoc(userDocRef, { email, name });
        console.log("User successfully created:", userCredential.user.uid);

        res.status(200).json({
            name,
            email: userCredential.user.email,
            token: userCredential.user.uid,
        });
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            const errorMessage =
                "Bad request. Check if the user account exists already, or check server connection.";
            res.status(400).json({ errorMessage });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

/* Log in an existing user */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, "Users", userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User document not found." });
        }

        const userData = userDoc.data();
        res.status(200).json({
            name: userData.name,
            email: userCredential.user.email,
            token: userCredential.user.uid,
        });
    } catch (error) {
        if (error.code === "auth/invalid-credential") {
            res.status(401).json({ errorMessage: "Incorrect credentials. Try again." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

/* Reset a user's password */
router.post("/reset", async (req, res) => {
    const { email } = req.body;

    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent successfully.");
        res.status(200).json({ message: "Password reset email sent." });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        res.status(500).json({ message: "Error sending email", error: error.message });
    }
});

/* Log out the current user */
router.post("/logout", async (req, res) => {
    try {
        await signOut(auth);
        res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* Get the current logged-in user */
router.post("/currentUser", (req, res) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return res.status(401).json({ message: "You are not logged in!" });
    }

    res.status(200).json({ currentUser });
});

export default router;
