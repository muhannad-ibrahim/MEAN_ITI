/* eslint-disable import/no-unresolved */
/* eslint-disable import/order */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const dotenv = require('dotenv');
const dbConnection = require('./src/db');

// connecting with cluster MongoDB
// const MongoDB = require('mongodb').MongoClient;
const router = require('./src/routes');

// Loading environment variables
dotenv.config();
const port = process.env.PORT;

// Creating express app
const app = express();

// Middleware for CORS policy
const corsOptions = {
    credentials: true,
    origin: 'http://localhost:4200',
};
app.use(cors(corsOptions));

// Middleware for parsing urlencoded data
app.use(express.static('images'));

// Middleware for parsing json data
app.use(express.json());
app.use(router);
app.use((err, req, res, next) => {
    res.status(400).json(
        {
            message: err.message,
        },
    );
    next();
});
app.use(cookieParser());

// Middleware for sanitizing data against NoSQL query injection
app.use(mongoSanitize());

// Middleware for setting security HTTP headers
app.use(helmet());

// Prevent http param pollution
app.use(hpp());

// Establishing connection with database
async function main() {
    try {
        await dbConnection(process.env.MONGO_URI);
    } catch (error) {
        console.error(error);
    }
}

// middleware for error handling
app.use((err, req, res, next) => {
    // For duplicating error code
    if (err.code === 11000) {
        res.status(400).json(
            {
                message: 'Email is already resgistered',
            },
        );
        next();
    }
    // For other errors
    res.status(400).json(
        {
            message: err.message,
        },
    );
    next();
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

// Starting the DB server
main();
