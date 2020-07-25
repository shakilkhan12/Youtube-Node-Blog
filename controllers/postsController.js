const formidable = require('formidable');
const { v4: uuidv4 } = require('uuid');
const fs = require("fs")
const { check, validationResult } = require("express-validator")
const Users = require("../models/User")
const Posts = require("../models/Posts")
const dateFormat = require('dateformat');
const postForm = (req, res) => {
    res.render('createPost', { title: 'Create new post', login: true, errors: [], input_title: '', body: '' })
}

const storePost = (req, res) => {

    const form = formidable();
    form.parse(req, (err, fields, files) => {
        const errors = []
        const { title, body } = fields;
        if (title.length === 0) {
            errors.push({ msg: 'Title is required' })
        }
        if (body.length === 0) {
            errors.push({ msg: 'Body is required' })
        }
        const imageName = files.image.name;
        const split = imageName.split(".");
        const imageExt = split[split.length - 1].toUpperCase();
        if (files.image.name.length === 0) {
            errors.push({ msg: 'Image is required' })
        } else if (imageExt !== "JPG" && imageExt !== "PNG") {
            errors.push({ msg: 'Only jpg and png are allowed' })
        }

        if (errors.length !== 0) {
            res.render("createPost", { title: 'Create new post', login: true, errors, input_title: title, body })
        } else {
            files.image.name = uuidv4() + "." + imageExt;
            const oldPath = files.image.path
            const newPath = __dirname + "/../views/assets/img/" + files.image.name;
            fs.readFile(oldPath, (err, data) => {
                if (!err) {
                    fs.writeFile(newPath, data, (err) => {
                        if (!err) {
                            fs.unlink(oldPath, async (err) => {
                                if (!err) {
                                    const id = req.id;
                                    try {
                                        const user = await Users.findOne({ _id: id })
                                        const name = user.name;
                                        const newPost = new Posts({
                                            userID: id,
                                            title,
                                            body,
                                            image: files.image.name,
                                            userName: name
                                        })
                                        try {
                                            const result = await newPost.save();
                                            if (result) {
                                                req.flash('success', "Your post has been added successfully")
                                                res.redirect('/posts/1')
                                            }
                                        } catch (err) {
                                            res.send(err.msg)
                                        }
                                    } catch (err) {
                                        res.send(err.msg);
                                    }
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

const posts = async (req, res) => {
    const id = req.id;
    let currentPage = 1;
    let page = req.params.page;
    if (page) {
        currentPage = page;
    }
    const perPage = 4;
    const skip = (currentPage - 1) * perPage;
    const allPosts = await Posts.find({ userID: id })
        .skip(skip)
        .limit(perPage)
        .sort({ updatedAt: -1 });
    const count = await Posts.find({ userID: id }).countDocuments();
    res.render("Posts", { title: 'Posts', login: true, posts: allPosts, formate: dateFormat, count, perPage, currentPage })
}

const details = async (req, res) => {
    const id = req.params.id;
    try {
        const details = await Posts.findOne({ _id: id });
        res.render('details', { title: 'Post details', login: true, details })
    } catch (err) {
        res.send(err)
    }
}

const updateForm = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await Posts.findOne({ _id: id });
        res.render('update', { title: 'Update Post', login: true, errors: [], post });
    } catch (err) {
        res.send(err)
    }
}

const postValidations = [
    check('title').not().isEmpty().withMessage('Title is required'),
    check('body').not().isEmpty().withMessage('Body is required')
]

const postUpdate = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const id = req.body.hiddenID;
        const post = await Posts.findOne({ _id: id });
        res.render('update', { title: 'Update Post', login: true, errors: errors.array(), post });
    } else {
        const { hiddenID, title, body } = req.body;
        try {
            const updateResult = await Posts.findByIdAndUpdate(hiddenID, { title, body })
            if (updateResult) {
                req.flash('success', "Your post has been updated successfully")
                res.redirect('/posts/1')
            }
        } catch (err) {
            res.send(err)
        }
    }
}

const deletePost = async (req, res) => {
    const id = req.body.deleteID;
    try {
        const response = await Posts.findByIdAndRemove(id);
        if (response) {
            req.flash('success', "Your post has been deleted successfully")
            res.redirect('/posts/1')
        }
    } catch (err) {
        res.send(err)
    }
}

module.exports = {
    postForm,
    storePost,
    posts,
    details,
    updateForm,
    postUpdate,
    postValidations,
    deletePost
}