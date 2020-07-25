const express = require("express");
const router = express.Router();

const { postForm, storePost, posts, details, updateForm, postUpdate, postValidations, deletePost } = require("../controllers/postsController")
const { auth } = require("../middlewares/auth")

router.get('/createPost', auth, postForm)
router.post('/createPost', auth, storePost)
router.get('/posts/:page', auth, posts)
router.get("/details/:id", auth, details);
router.get('/update/:id', auth, updateForm);
router.post('/update', [postValidations, auth], postUpdate);
router.post('/delete', auth, deletePost);

module.exports = router;