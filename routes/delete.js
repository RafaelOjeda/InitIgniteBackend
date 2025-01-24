import express from "express";
import {auth, db, deleteDoc, deleteUser, doc} from "../firebase.js";

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

router.post("/school/student", async (req, res) => {
    const { student_id, semester_id } = req.body;
})

export default router;