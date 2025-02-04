import express from "express";
import {collection, doc, setDoc} from "../firebase.js";
import {arrayUnion, db, updateDoc, writeBatch} from "../firebase.js";
import dotenv from "dotenv";
import Airtable from "airtable";

dotenv.config(); // Load environment variables from .env file

const router = express.Router();

const apiKey = process.env.AIRTABLE_API_KEY;
const databaseID = process.env.AIRTABLE_DATABASE_ID;

async function getTeachersInfo(teacher_airtable_id) {
    const teachers = [];
    const base = new Airtable({ apiKey }).base(databaseID);

    try {
        await new Promise((resolve, reject) => {
            base(teacher_airtable_id)
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

        return teachers.map((teacher) => ({
            id: teacher.id,
            fields: teacher.fields,
        }));
    } catch (error) {
        console.error("Error fetching data from Airtable:", error);
        throw new Error("Failed to fetch teacher data.");
    }
}

function filterTeachers(response) {
    return {
        teacher_list: response.map(teacher => ({
            teacher_id: teacher["id"],
            name: teacher.fields["Name"],
            email: teacher.fields["Name copy"], // Assuming "Name copy" contains the email
            phone_number: teacher.fields["Phone Number"],
            school_id: teacher.fields["School Address"].toLowerCase().hashCode().toString(),
        }))
    };
}

function filterSchools(response) {
    return {
        school_list: response.map(teacher => ({
            teacher_id: teacher["id"],
            school_name: teacher.fields["School Name"],
            school_address: teacher.fields["School Address"],
            school_id: teacher.fields["School Address"].toLowerCase().hashCode().toString(),
        }))
    };
}

async function addClassroom(school_id, semester_id, teacher_id) {
    const appendedKey = semester_id.toString() + teacher_id.toString();
    const hashedKey = appendedKey.hashCode()

    const docRef = doc(db, "Classroom", hashedKey.toString())
    await setDoc( docRef, {
        school_id: doc(db, "School", school_id),
        semester_id: doc(db, "Semester", semester_id),
        teacher_id: doc(db, "Teacher", teacher_id),
        teacher_students: []
    });
}

String.prototype.hashCode = function() {
    let hash = 0,
        i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
        hash = Math.abs(hash)
    }
    return hash;
}

if (!apiKey) {
    throw new Error("Airtable API key is missing. Ensure AIRTABLE_API_KEY is set in the .env file.");
}

if (!databaseID) {
    throw new Error("Airtable Database ID is missing. Ensure AIRTABLE_DATABASE_ID is set in the .env file.");
}

router.post("/semester/teachers", async (req, res) => {
    const {airtable_id, semester_id} = req.body

    try {
        const teacherList = await getTeachersInfo(airtable_id);
        const teacherListResponse = filterTeachers(teacherList);

        const teacherBatch = writeBatch(db);

        const semesterRef = doc(collection(db, "Semester"), semester_id);

        for (const teacher of teacherListResponse.teacher_list) {
            const teacherRef = doc(collection(db, "Teacher"), teacher.teacher_id);

            await updateDoc(semesterRef, {
                teachers: arrayUnion(teacherRef),
            });

            teacherBatch.set(teacherRef, {
                name: teacher.name,
                email: teacher.email,
                phone_number: teacher.phone_number,
                school_id: doc(db, "Schools", teacher.school_id),
                semester_id: doc(db, "Semester", semester_id)
            });

            addClassroom(teacher.school_id, semester_id, teacher.teacher_id);
        }

        await teacherBatch.commit(); // ✅ Commit batch writes

        return res.status(200).json(teacherListResponse);

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.post("/semester/schools", async (req, res) => {
    const {airtable_id} = req.body;

    if (!airtable_id) {
        return res.status(400).json({ status: "error", message: "Missing airtable_id" });
    }

    try {
        const schoolList = await getTeachersInfo(airtable_id);
        if (!schoolList || !Array.isArray(schoolList)) {
            return res.status(404).json({ status: "error", message: "No schools found" });
        }

        const schoolListResponse = filterSchools(schoolList);
        if (!schoolListResponse.school_list || schoolListResponse.school_list.length === 0) {
            return res.status(404).json({ status: "error", message: "No valid schools found after filtering" });
        }

        console.log("Filtered Schools:", schoolListResponse.school_list);

        const schoolBatch = writeBatch(db);

        schoolListResponse.school_list.forEach((school) => {
            if (!school.school_name) {
                console.error("Skipping school due to missing name:", school);
                return; // Skip writing if school_name is missing
            }

            const schoolRef = doc(collection(db, "School"), school.school_id);
            schoolBatch.set(schoolRef, {
                school_name: school.school_name,
                school_address: school.school_address,
                teachers: []
            });
        });

        await schoolBatch.commit(); // ✅ Commit batch writes

        return res.status(200).json({
            status: "success",
            message: "Schools added successfully",
        });

    } catch (error) {
        console.error("Error adding schools:", error);
        return res.status(500).json({
            status: "error",
            message: error.message || "Internal server error",
        });
    }

})

/* Add a student to a semester */
router.post("/semester/student", async (req, res) => {
    const { student_id, semester_id } = req.body;

    if (!student_id || !semester_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields: studentId or semester.",
            submission: req.body,
        });
    }

    const semesterRef = doc(db, "Semester", semester_id);
    const studentRef = doc(db, "Users", student_id);

    try {
        // Add semester reference to the student's active semesters
        await updateDoc(studentRef, {
            semester_id: arrayUnion(semesterRef),
        });

        // Add student UUID to the semester's students array
        await updateDoc(semesterRef, {
            students: arrayUnion(student_id),
        });

        console.log("Student successfully added to semester.");
        res.status(200).json({
            status: "success",
            submission: req.body,
        });
    } catch (error) {
        console.error("Error adding student to semester:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to update documents.",
            submission: req.body,
        });
    }
});

/* Add a semester */
router.post("/semester", async (req, res) => {
    const { semester_id, start_date, end_date } = req.body;

    if (!semester_id || !start_date || !end_date) {
        return res.status(400).json({
            status: "error",
            message: "semester_id, start_date, and end_date are required.",
            submission: req.body,
        });
    }

    try {
        const docRef = doc(db, "Semester", semester_id);
        await setDoc(docRef, {
            semester_start_date: start_date,
            semester_end_date: end_date,
            teachers: [],
            teacher_students: []
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

export default router;
