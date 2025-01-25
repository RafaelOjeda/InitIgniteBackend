import express from "express";
import {collection, getDoc, getDocs} from "firebase/firestore";
import {db, doc} from "../firebase.js"; // Firebase client SDK
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
router.post("/users", async (req, res) => {
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
router.post("/teacher_students", async (req, res) => {
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

/* Get all semesters */
router.post("/semesters", async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "Semester"));
        const semesters = querySnapshot.docs.map((doc) => ({
            semester_end_date: doc.data().semester_end_date,
            semester_id: doc.data().semester_id,
            semester_name: doc.data().semester_name,
            semester_start_date: doc.data().semester_start_date,
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

/* Get all teachers */
router.post("/teachers", async (req, res) => {
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

router.post("/semester/schools/students", async (req, res) => {
    const { semester_id, school_id } = req.body;
    const studentDocument = doc(db, "Semester", semester_id, "Schools", school_id)

    const students = getDoc(studentDocument).then((snapshot) => {
        const data = snapshot.data()
        const students = data.Students
        return res.status(200).json({students})
    }).catch((err) => {
        return res.status(400).json({
            message: `Unable to retrieve students from semester ${semester_id} and school ${school_id}`,
        })
    });
})

export default router;
