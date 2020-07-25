const { check, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Users = require("../models/User")
const loadSignup = (req, res) => {
    const title = "Create new account"
    const errors = []
    res.render("register", { title, errors, inputs: {}, login: false });
}

const loadLogin = (req, res) => {
    const title = "User login"
    res.render("login", { title, errors: [], inputs: {}, login: false })
}

const loginValidations = [
    check('email').not().isEmpty().withMessage('Valid email is required'),
    check('password').not().isEmpty().withMessage('Password is required')
]

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("login", { title: 'User Login', errors: errors.array(), inputs: req.body, login: false })
    } else {
        const checkEmail = await Users.findOne({ email })
        if (checkEmail !== null) {
            const id = checkEmail._id;
            const dbPassword = checkEmail.password;
            const passwordVerify = await bcrypt.compare(password, dbPassword)
            if (passwordVerify) {
                //  Create token
                const token = jwt.sign({ userID: id }, process.env.JWT_SECRET, {
                    expiresIn: "7d"
                })
                console.log("user token: ", token)
                // Create session variable
                req.session.user = token;
                res.redirect("/profile");
            } else {
                res.render("login", { title: 'User Login', errors: [{ msg: 'Your password is wrong' }], inputs: req.body, login: false })
            }
        } else {
            res.render("login", { title: 'User Login', errors: [{ msg: 'Email is not found' }], inputs: req.body, login: false })
        }
    }
}

const registerValidations = [
    check('name').isLength({ min: 3 }).withMessage('Name is requried & must be 3 characters long'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be 6 characters long')
]

const postRegister = async (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const title = "Create new account"
        res.render("register", { title, errors: errors.array(), inputs: req.body, login: false })
    } else {
        try {
            const userEmail = await Users.findOne({ email })
            if (userEmail === null) {
                const salt = await bcrypt.genSalt(10)
                const hashed = await bcrypt.hash(password, salt)
                console.log("Your salt: ", salt)
                const newUser = new Users({
                    name: name,
                    email: email,
                    password: hashed

                })
                try {
                    const createdUser = await newUser.save();
                    req.flash('success', "Your account has been created successfully")
                    res.redirect('/login')
                } catch (err) {
                    console.log(err.message)
                }
            } else {
                res.render("register", { title: 'Create new account', errors: [{ msg: 'Email is already exist' }], inputs: req.body, login: false })
            }
        } catch (err) {
            console.log(err.message)
        }
    }

}

module.exports = {
    loadSignup,
    loadLogin,
    registerValidations,
    postRegister,
    postLogin,
    loginValidations
}