import express from "express";
import {
    arrayRemove,
    auth,
    db,
    deleteDoc,
    deleteUser,
    doc,
    updateDoc
} from "../firebase.js";

const router = express.Router();

router.delete("/user/currentUser", async (req, res) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return res.status(401).json({ message: "You are not logged in!" });
    }

    const currentUserId = currentUser.uid;

    try {
        await deleteUser(currentUser);
        console.log(`User: ${currentUserId} deleted from Authentication successfully.`);

        await deleteDoc(doc(db, "Users", currentUserId));
        console.log(`User: ${currentUserId} deleted from Users collection successfully.`);

        return res.status(200).json({ message: `Deleted user ${currentUserId}` });
    } catch (err) {
        console.error(`Error deleting user ${currentUserId}: ${err}`);
        return res.status(500).json({
            message: `Unable to delete user: ${currentUserId}. Reason: ${err.message}`
        });
    }
});

router.delete("/semester/", async (req, res) => {
    const { semester_id } = req.body;

    if (!semester_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required field: semester_id.",
            submission: req.body,
        });
    }

    try {
        await deleteDoc(doc(db, "Semester", semester_id));
        console.log(`Semester ${semester_id} successfully removed.`);

        return res.status(200).json({
            status: "success",
            message: "Semester successfully removed.",
            submission: req.body,
        });
    } catch (error) {
        console.error(`Error removing semester ${semester_id}:`, error);
        return res.status(500).json({
            status: "error",
            message: "Failed to remove semester.",
            submission: req.body,
        });
    }
});

router.post("/semester/teacher", async (req, res) => {
    const { semester_id, teacher_id } = req.body;

    if (!semester_id || !teacher_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields: teacher_id or semester_id.",
            submission: req.body,
        });
    }

    const semesterRef = doc(db, "Semester", semester_id);
    const teacherRef = doc(db, "Teacher", teacher_id);

    try {
        await updateDoc(teacherRef, { semesters: arrayRemove(semester_id) });
        await updateDoc(semesterRef, { teachers: arrayRemove(teacher_id) });

        console.log(`Teacher ${teacher_id} successfully removed from semester ${semester_id}.`);
        return res.status(200).json({
            status: "success",
            message: "Teacher successfully removed from semester.",
            submission: req.body,
        });
    } catch (error) {
        console.error(`Error removing teacher ${teacher_id} from semester ${semester_id}:`, error);
        return res.status(500).json({
            status: "error",
            message: "Failed to update documents.",
            submission: req.body,
        });
    }
});

router.delete("/semester/student", async (req, res) => {
    const { student_id, semester_id } = req.body;

    if (!student_id || !semester_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields: student_id or semester_id.",
            submission: req.body,
        });
    }

    const semesterRef = doc(db, "Semester", semester_id);
    const studentRef = doc(db, "Users", student_id);

    try {
        await updateDoc(studentRef, { semesters: arrayRemove(semester_id) });
        await updateDoc(semesterRef, { students: arrayRemove(student_id) });

        console.log(`Student ${student_id} successfully removed from semester ${semester_id}.`);
        return res.status(200).json({
            status: "success",
            message: "Student successfully removed from semester.",
            submission: req.body,
        });
    } catch (error) {
        console.error(`Error removing student ${student_id} from semester ${semester_id}:`, error);
        return res.status(500).json({
            status: "error",
            message: "Failed to update documents.",
            submission: req.body,
        });
    }
});

export default router;
