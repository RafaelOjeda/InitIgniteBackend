import express from "express";
import {arrayRemove, auth, db, deleteDoc, deleteUser, doc, updateDoc} from "../firebase.js";

const router = express.Router();

router.post("/user/currentUser", async (req, res) => {
    const currentUser = auth.currentUser;
    const currentUserId = currentUser.uid;
    if (!currentUser) {
        return res.status(401).json({ message: "You are not logged in!" });
    }

    deleteUser(currentUser).then(() => {
        console.log(
            `User: ${currentUser} deleted from Authentication successfully.`
        );
    }).catch((err) => {
        console.log(
            `Could not delete user: ${currentUserId} from Authentication. Reason: ${err}`
        );
        return res.status(400).json(
            {
                message: `Unable to delete user: ${currentUserId} from Authentication. Reason: ${err}`
            }
            );
    });
    console.log(currentUserId)
    deleteDoc(doc(db, "Users", currentUserId)).then(() => {
        console.log(
            `User: ${currentUser} deleted from Users collection successfully.`
        );
    }).catch((err) => {
        console.log(
            `Could not delete user: ${currentUserId} from Users collection. Reason: ${err}`
        );
        return res.status(400).json(
            {
                message: `Unable to delete user: ${currentUserId} from Users collection. Reason: ${err}`
            }
        );
    })

    return res.status(200).json(
        {
            message: `Deleted user ${currentUser}`
        }
        );
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

router.post("/semester/school/student", async (req, res) => {
    const { semester_id, school_id, student_id } = req.body;
    const studentDocument = doc(db, "Semester", semester_id, "Schools", school_id);

    try {
        // Update the Firestore document to remove the student_id from the Students array
        await updateDoc(studentDocument, {
            Students: arrayRemove(student_id),
        });

        console.log(`Successfully removed UID: ${student_id} from document: ${school_id}`);

        return res.status(200).json({
            message: `Deleted student ${student_id} from semester ${semester_id} and school ${school_id}.`,
        });
    } catch (err) {
        console.error(`Error removing student ${student_id}:`, err);

        return res.status(400).json({
            message: `Unable to delete student ${student_id} from semester ${semester_id} and school ${school_id}.`,
        });
    }
});

export default router;