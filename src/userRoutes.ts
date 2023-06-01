// usersRoutes.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import { User } from './models';
import { secretKey } from './app';

const db = new sqlite3.Database('database.db');

const router = express.Router();


/**
 * Registering user
 */
router.post('/register', (req: Request, res: Response) => {
  try{
    const { email, password } = req.body;

    // Validate the request body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if the user already exists in the database
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, userExists: User) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (userExists) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const user: User = {
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
  } catch(error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * LOGIN
 */
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  try{
  // Validate the request body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check if the user exists in the database
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user: User) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare input and stored password
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ email: user.email, userId: user.id }, secretKey);

    return res.status(200).json({ token });
  })}
  catch(error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  };
});

/**
 * GET ALL THE USERS
 */
router.get('/users', (req: Request, res: Response) => {
  try{
    const { page, limit } = req.query;

    //if not present, then default values
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    const offset = (pageNumber - 1) * pageSize;

    // Get users with pagination
    db.all(
      'SELECT * FROM users LIMIT ? OFFSET ?',
      [pageSize, offset],
      (err, users) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        return res.status(200).json({ users });
      }
    );
  } catch(error){
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET ALL THE POSTS of a user 
 */
router.get('/users/:userId/posts', (req: Request, res: Response) => {
  const { userId } = req.params;
  let { page, limit } = req.query;

  // Set default values for page and limit
  const pageNumber = parseInt(page as string, 10)||1;
  const pageSize = parseInt(limit as string, 10)||15;

  const offset = (pageNumber - 1) * pageSize;

  // Get the posts by the user from the database
  db.all(
    'SELECT * FROM posts WHERE authorId = ? LIMIT ? OFFSET ?',
    [userId, pageSize, offset],
    (err, posts) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json({ posts });
    }
  );
});

export { router as userRoutes };
