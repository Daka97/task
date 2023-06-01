# Simple Express.js REST API with SQLite

This project is a simple Express.js REST API that uses SQLite for data persistence. It provides basic functionality for user registration, login, and post management.

## Setup

1. Clone this repository to your local machine.
2. Install the necessary dependencies by running `npm install` in the project root directory.
3. Start the server by running `npm run dev` in the project root directory.

## Endpoints

### User Routes

- `POST /users/register`: Register a new user. The request body should contain an `email` and a `password`. If the user already exists, an error message will be returned.
- `POST /users/login`: Log in an existing user. The request body should contain the user's `email` and `password`. If the user does not exist or the password is incorrect, an error message will be returned.
- `GET /users`: Get all users with pagination. The page number and limit can be specified through query parameters.

### Post Routes

- `POST /posts`: Create a new post. The request body should contain a `title`, `content`, and the `authorId` of the user creating the post.
- `GET /posts`: Get all posts with pagination. The page number and limit can be specified through query parameters.
