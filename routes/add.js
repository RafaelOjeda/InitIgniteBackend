import express from "express";
import { doc, setDoc } from "firebase/firestore";
import {arrayRemove, db, updateDoc} from "../firebase.js"; // Firebase client SDK

const router = express.Router();

router.post("/semester/school/student", async (req, res) => {
    const { semester_id, school_id, student_id } = req.body;

    // Reference to the Firestore document
    const studentDocument = doc(db, "Semester", semester_id, "Schools", school_id);

    try {
        // Update the Firestore document to remove the student_id from the Students array
        await updateDoc(studentDocument, {
            Students: arrayRemove(student_id),
        });

        console.log(`Successfully added UID: ${student_id} from document: ${school_id}`);

        return res.status(200).json({
            message: `Added student ${student_id} from semester ${semester_id} and school ${school_id}.`,
        });
    } catch (err) {
        console.error(`Error removing student ${student_id}:`, err);

        return res.status(400).json({
            message: `Unable to add student ${student_id} from semester ${semester_id} and school ${school_id}.`,
        });
    }
});

/* Add a student to a semester */
router.post("/users", async (req, res) => {
    const { studentId, studentName, semester } = req.body;

    if (!studentId || !studentName || !semester) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields: studentId, studentName, or semester.",
            submission: req.body,
        });
    }

    try {
        const docRef = doc(db, "Semester", semester, "students", studentId);
        await setDoc(docRef, {
            name: studentName,
        });
        console.log("Student document successfully written.");
        res.status(200).json({
            status: "success",
            submission: req.body,
        });
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to write document.",
            submission: req.body,
        });
    }
});

/* Add a semester */
router.post("/semester", async (req, res) => {
    const { semester_id, semester_name, start_date, end_date } = req.body;

    if (!semester_id || !semester_name || !start_date || !end_date) {
        return res.status(400).json({
            status: "error",
            message: "semester_id, semester_name, start_date, and end_date are required.",
            submission: req.body,
        });
    }

    try {
        const docRef = doc(db, "Semester", semester_id);
        await setDoc(docRef, {
            semester_id,
            semester_name,
            semester_start_date: start_date,
            semester_end_date: end_date,
        });
        console.log("Semester document successfully written.");
        res.status(200).json({
            status: "success",
            submission: req.body,
        });
    } catch (error) {
        console.error("Error adding semester:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to write document.",
            submission: req.body,
        });
    }
});

/* Add a task */
router.post("/task", async (req, res) => {
    const { taskName, taskType, taskDeadline, semester } = req.body;

    if (!taskName || !taskType || !taskDeadline || !semester) {
        return res.status(400).json({
            status: "error",
            message: "taskName, taskType, taskDeadline, and semester are required.",
            submission: req.body,
        });
    }

    try {
        // Logic for adding the task can be implemented here. For now, this is a placeholder.
        console.log("Task details:", { taskName, taskType, taskDeadline, semester });
        res.status(200).json({
            status: "success",
            submission: req.body,
        });
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to add task.",
            submission: req.body,
        });
    }
});

export default router;
