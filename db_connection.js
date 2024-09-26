const mongoose = require('mongoose');

async function connectMongoDb (url) {
    return mongoose.connect(url)
}
//mongoose.connect('mongodb://127.0.0.1:27017/testdb').then(()=> console.log('mongodb connected')).catch((err)=> console.log('mongodb error', err));
module.exports = connectMongoDb