import express from "express";
import {auth, db, deleteUser} from "../firebase.js";

const router = express.Router();

router.post("/user/currentUser", async (req, res) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return res.status(401).json({ message: "You are not logged in!" });
    }

    deleteUser(currentUser).then(() => {
        console.log(`User: ${currentUser} deleted successfully.`);
        return res.status(200).json({ message: `Deleted user ${currentUser} successfully.` });
    }).catch((err) => {
        console.log(`Could not delete user: ${currentUser}`);
        return res.status(401).json({ message: `Unable to delete user: ${currentUser} Reason: ${err}` });
    });


})

router.post("/semester/student", async (req, res) => {
    const { semester, student_id} = req.body;

    try {
        await deleteDoc(doc(db, "Semester", semester, "students", student_id));

        console.log(`Student ${student_id} document successfully removed from semester: ${semester}.`);
        res.status(200).json({
            status: "success",
            submission: req.body,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: `An error occurred: ${error}`,
            submission: req.body,
        })
    }
})

export default router;