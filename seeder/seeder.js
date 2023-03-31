/* eslint-disable no-unused-vars */
const dotenv = require('dotenv');
const db = require('../src/db');

dotenv.config({ path: '../.env' });
const user = require('../src/models/User');
const book = require('../src/models/Book');
const category = require('../src/models/Category');
const author = require('../src/models/Author');
const data = require('./data');

async function main() {
    try {
        await db(process.env.MONGO_URI);
    } catch (error) {
        throw new Error(error);
    }

    let result = await user.insertMany(data.users);
    console.log('Users inserted successfully');

    result = await book.insertMany(data.books);
    console.log('Books inserted successfully');

    result = await category.insertMany(data.categories);
    console.log('categories inserted successfully');

    result = await author.insertMany(data.authors);
    console.log('authors inserted successfully');
    return 'Done';
}

main();
