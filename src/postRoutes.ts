// postRoutes.ts
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import { secretKey } from './app';
import { User, Post } from './models';

const db = new sqlite3.Database('database.db');

const router = express.Router();

interface PostRow {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

/**
 * Posts
 */
router.post('/posts', (req: Request, res: Response) => {
  const { title, content } = req.body;
  const userId = getUserIdFromToken(req.headers.authorization);

  // Validate the request body
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Find the user based on id
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user: User) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const post: Post = {
      id:Math.floor(Math.random() * 100) + 1,
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


router.get('/posts/:postId', (req: Request, res: Response) => {
  const { postId } = req.params;

  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, posts: PostRow) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!posts) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // get the author of the post
    db.get('SELECT email FROM users WHERE id = ?', [posts.authorId], (err, user: User) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(500).json({ error: 'Invalid user' });
      }

      // Create a post object with the author included
      const post: Post = {
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

//function to verify the jwt token and return user id
function getUserIdFromToken(header: string | undefined): number {
  const token = header && header.split(" ")[1]
  if (!token) {
    return 0;
  }
  try {
    const decodedToken: any = jwt.verify(token, secretKey);
    return decodedToken.userId;
  } catch (error) {
    console.error('JWT verification error:', error);
    return 0;
  }
}
export { router as postRoutes };

