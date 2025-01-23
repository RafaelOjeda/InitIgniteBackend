import express from "express";
import {deleteDoc, doc, setDoc} from "firebase/firestore";
import {db} from "../firebase.js";

const router = express.Router();

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