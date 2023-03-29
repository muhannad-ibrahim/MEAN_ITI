const express = require('express');
const dotenv = require('dotenv');
const dbConnection = require('./src/db');

dotenv.config();
const app = express();

app.use(express.json());

async function main() {
    try {
        await dbConnection(process.env.MONGO_URI);
    } catch (error) {
        console.error(error);
    }
}

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
main();
