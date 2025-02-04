import express from "express";
import {db} from "../firebase.js"; // Firebase client SDK
import Airtable from "airtable";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

const apiKey = process.env.AIRTABLE_API_KEY;
const databaseID = process.env.AIRTABLE_DATABASE_ID;
const teacherScheduleTableID = process.env.AIRTABLE_TEACHER_SCHEDULE_TABLE_ID;

if (!apiKey) {
    throw new Error("Airtable API key is missing. Ensure AIRTABLE_API_KEY is set in the .env file.");
}

if (!databaseID) {
    throw new Error("Airtable Database ID is missing. Ensure AIRTABLE_DATABASE_ID is set in the .env file.");
}

/* Get users by semester */
router.get("/users", async (req, res) => {
    const { semester_id } = req.body;

    if (!semester_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required field: semester_id.",
        });
    }

    try {
        const querySnapshot = await getDocs(collection(db, "Semester", semester_id, "students"));
        const students = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            email: doc.data().email,
            school: doc.data().school,
        }));

        res.status(200).json({
            status: "success",
            data: {
                semester_id,
                students,
            },
        });
    } catch (error) {
        console.error("Error fetching students:", error.message);
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

/* Get all teacher's students */
router.get("/teacher_students", async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "Users"));
        const students = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            email: doc.data().email,
            name: doc.data().name,
        }));

        res.status(200).json({
            status: "success",
            data: students,
        });
    } catch (error) {
        console.error("Error fetching teacher's students:", error.message);
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

/* Get all teachers */
router.get("/teachers", async (req, res) => {
    const teachers = [];
    const base = new Airtable(
        { apiKey })
        .base(databaseID);

    try {
        await new Promise((resolve, reject) => {
            base(teacherScheduleTableID)
                .select({ view: "Grid view" })
                .eachPage(
                    (records, fetchNextPage) => {
                        records.forEach((record) => teachers.push(record));
                        fetchNextPage();
                    },
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
        });

        const filteredTeachers = teachers.map((teacher) => ({
            id: teacher.id,
            fields: teacher.fields,
        }));

        res.status(200).json({
            status: "success",
            teacher_list: filteredTeachers,
        });
    } catch (error) {
        console.error("Error fetching data from Airtable:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch teacher data.",
        });
    }
});

/* Get all semesters */
router.get("/semesters", async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "Semester"));
        const semesters = querySnapshot.docs.map((doc) => ({
            semester_id: doc.id,
            semester_start_date: doc.data().semester_start_date,
            semester_end_date: doc.data().semester_end_date,
            teachers: doc.data().teachers,
            teacher_students: doc.data().teacher_students
        }));

        res.status(200).json({
            status: "success",
            data: semesters,
        });
    } catch (error) {
        console.error("Error fetching semesters:", error.message);
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

export default router;
