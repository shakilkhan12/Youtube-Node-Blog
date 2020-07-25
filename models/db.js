const mongoose = require("mongoose");
const connect = async () => {
    try {
        await mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log('DB Connection created')
    } catch (err) {
        console.log(err.message)
    }
}
module.exports = connect;