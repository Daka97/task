"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
// postRoutes.ts
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("./app");
const db = new sqlite3_1.default.Database('database.db');
const router = express_1.default.Router();
exports.postRoutes = router;
/**
 * Posts
 */
router.post('/posts', (req, res) => {
    const { title, content } = req.body;
    const userId = getUserIdFromToken(req.headers.authorization);
    // Validate the request body
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }
    // Find the user based on id
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid user' });
        }
        const post = {
            id: Math.floor(Math.random() * 100) + 1,
            title,
            content,
            author: user
        };
        // Save the new post to the database
        db.run('INSERT INTO posts (id, title, content, authorId) VALUES (?, ?, ?, ?)', [post.id, post.title, post.content, user.id], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (!user.posts) {
                user.posts = []; //to prevent from an error
            }
            user.posts.push(post);
            return res.status(201).json({ postId: post.id });
        });
    });
});
router.get('/posts/:postId', (req, res) => {
    const { postId } = req.params;
    db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, posts) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!posts) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // get the author of the post
        db.get('SELECT email FROM users WHERE id = ?', [posts.authorId], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (!user) {
                return res.status(500).json({ error: 'Invalid user' });
            }
            // Create a post object with the author included
            const post = {
                id: posts.id,
                title: posts.title,
                content: posts.content,
                author: user
            };
            // Return the post in the response
            return res.status(200).json({ post });
        });
    });
});
/**
 * GET ALL THE POSTS of a user
 */
router.get('/users/:userId/posts', (req, res) => {
    const { userId } = req.params;
    let { page, limit } = req.query;
    // Set default values for page and limit
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 15;
    const offset = (pageNumber - 1) * pageSize;
    // Get the posts by the user from the database
    db.all('SELECT * FROM posts WHERE authorId = ? LIMIT ? OFFSET ?', [userId, pageSize, offset], (err, posts) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ posts });
    });
});
//function to verify the jwt token and return user id
function getUserIdFromToken(header) {
    const token = header && header.split(" ")[1];
    if (!token) {
        return 0;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, app_1.secretKey);
        return decodedToken.userId;
    }
    catch (error) {
        console.error('JWT verification error:', error);
        return 0;
    }
}
