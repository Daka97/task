"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
// usersRoutes.ts
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("./app");
const db = new sqlite3_1.default.Database('database.db');
const router = express_1.default.Router();
exports.userRoutes = router;
/**
 * Registering user
 */
router.post('/register', (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate the request body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if the user already exists in the database
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, userExists) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (userExists) {
                return res.status(409).json({ error: 'User already exists' });
            }
            const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
            const user = {
                id: Math.floor(Math.random() * 100) + 1,
                email,
                password: hashedPassword,
                posts: []
            };
            // Save user in db
            db.run('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [user.id, user.email, user.password], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                return res.status(201).json({ message: 'User registered successfully' });
            });
        });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * LOGIN
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    try {
        // Validate the request body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if the user exists in the database
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            // Compare input and stored password
            const passwordMatch = bcryptjs_1.default.compareSync(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            // Generate a JWT token
            const token = jsonwebtoken_1.default.sign({ email: user.email, userId: user.id }, app_1.secretKey);
            return res.status(200).json({ token });
        });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    ;
});
/**
 * GET ALL THE USERS
 */
router.get('/users', (req, res) => {
    try {
        const { page, limit } = req.query;
        //if not present, then default values
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const offset = (pageNumber - 1) * pageSize;
        // Get users with pagination
        db.all('SELECT * FROM users LIMIT ? OFFSET ?', [pageSize, offset], (err, users) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.status(200).json({ users });
        });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
