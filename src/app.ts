//entry point of the application
import express, { Application } from 'express';
import sqlite3 from 'sqlite3';
import { userRoutes } from './userRoutes';
import { postRoutes } from './postRoutes';

//as this is just test, secret key is random and usually I would not store like this.
export const secretKey = "ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5"; 

const app: Application = express();
app.use(express.json());
const db: sqlite3.Database = new sqlite3.Database('database.db');
// Create the 'users' table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER,
    email TEXT,
    password TEXT
  )
`);
// Create the 'posts' table if it doesn't exist

db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER,
    title TEXT,
    content TEXT,
    authorId INTEGER,
    FOREIGN KEY (authorId) REFERENCES users(id)
  )
`);


// Mount the userRoutes on '/users' path
app.use(userRoutes);

// Mount the postRoutes on '/posts' path
app.use(postRoutes);

app.listen(4000, () => {
  console.log('Server started on port 3000');
});