
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    outlet: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'customer'],
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;