"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretKey = void 0;
//entry point of the application
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const userRoutes_1 = require("./userRoutes");
const postRoutes_1 = require("./postRoutes");
//as this is just test, secret key is random and usually I would not store like this.
exports.secretKey = "ro8BS6Hiivgzy8Xuu09JDjlNLnSLldY5";
const app = (0, express_1.default)();
app.use(express_1.default.json());
const db = new sqlite3_1.default.Database('database.db');
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
app.use(userRoutes_1.userRoutes);
// Mount the postRoutes on '/posts' path
app.use(postRoutes_1.postRoutes);
app.listen(4000, () => {
    console.log('Server started on port 3000');
});
