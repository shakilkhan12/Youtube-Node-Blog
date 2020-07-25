const express = require("express");

const router = express.Router();
const { profile, logout } = require("../controllers/profileController")
const { auth } = require("../middlewares/auth")

router.get('/profile', auth, profile)
router.get('/logout', logout)

module.exports = router;