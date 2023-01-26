const express = require("express");
const router = express.Router();

// firebase config
const admin = require("firebase-admin");
const auth = require("firebase-admin/auth");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.CLIENT_EMAIL,
  }),
});

// ---------------------------------------------
// DELETEING A FIREBASE USER (USING FIREBASE SDK)
// ---------------------------------------------
router.get("/deleteUser/:email", async (req, res) => {
  const email = req.params.email;
  auth
    .getAuth()
    .getUserByEmail(email)
    .then((user) => {
      auth
        .getAuth()
        .deleteUser(user.uid)
        .then(() => {
          res.send({ status: "success", message: "User deleted successfully" });
        })
        .catch((error) => {
          res.send({ status: "error", message: "Error deleting user" });
        });
    })
    .catch((error) => {
      res.send({ status: "error", message: "User not found" });
    });
});

module.exports = router;
