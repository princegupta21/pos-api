const express = require('express');
const connectMongoDb = require('./db_connection')
require('dotenv').config()
const userRouter = require('./routes/user')
const categoryRoutes = require('./routes/categoryRoute')
const productRoutes = require('./routes/productRoute')
const uploadRoutes = require('./routes/uploadRoute')
const {graphqlHTTP} = require('express-graphql');
const { schema, root } = require('./schema');

const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.json({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true, // Allow credentials (cookies)
}));
app.use(cookieParser());
const connection = connectMongoDb(process.env.MONGO_URL);
connection.then((res)=>{
    console.log('server connected')
}).catch((err)=>console.log('connection error', err))
app.get('/', (req, res)=> {
    res.send('test')
})
app.use("/api", userRouter)
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Set up GraphQL endpoint
app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue: root,
      graphiql: true, // Enable GraphiQL interface for testing
    })
  );

app.listen(process.env.PORT, ()=> {
    console.log(`server is running on port 8000`)
})