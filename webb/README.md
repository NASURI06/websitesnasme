# Webb Website - Database & Authentication Setup

This is a full-stack website with a Node.js/SQLite backend for contact form submissions and user authentication.

## Project Structure

```
webb/
├── index.html          # Home page
├── about.html          # About page
├── contact.html        # Contact page with form
├── login.html          # Login page
├── signup.html         # Sign up page
├── style.css           # Styling for all pages
├── script.js           # Frontend JavaScript (forms & auth)
├── server.js           # Node.js Express backend
├── package.json        # Project dependencies
└── contacts.db         # SQLite database (created on first run)
```

## Setup Instructions

### 1. Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org)

### 2. Install Dependencies
Open a terminal in the `webb` folder and run:
```bash
npm install
```

This will install:
- **Express** - Web framework
- **SQLite3** - Database
- **CORS** - Cross-origin requests
- **Body-parser** - Parse request body

### 3. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

You should see:
```
Connected to SQLite database
Contacts table ready
Server is running on http://localhost:3000
```

### 4. Open the Website
Open your browser and go to:
```
http://localhost:3000
```

## Features

### Contact Form
- Users can submit contact forms on `/contact.html`
- Form data is saved to SQLite database
- Real-time feedback (success/error messages)

### User Authentication
- Users can sign up on `/signup.html`
- Users can log in on `/login.html`
- Passwords are hashed and stored securely
- "Remember me" option saves session token

### REST API Endpoints

#### Contact Endpoints
```
GET http://localhost:3000/api/contacts
```
Get all contacts

```
GET http://localhost:3000/api/contacts/:id
```
Get specific contact

```
POST http://localhost:3000/api/contacts
Body: { name, email, subject, message }
```
Submit new contact

```
PUT http://localhost:3000/api/contacts/:id
Body: { name, email, subject, message }
```
Update contact

```
DELETE http://localhost:3000/api/contacts/:id
```
Delete contact

#### Authentication Endpoints
```
POST http://localhost:3000/api/signup
Body: { fullname, email, username, password }
```
Create new user account

```
POST http://localhost:3000/api/login
Body: { username, password, remember }
```
Login user and get auth token

```
GET http://localhost:3000/api/users/:username
```
Get user profile information

## Database Schema

### contacts table
```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### users table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    fullname TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Troubleshooting

### "Server is not running"
- Make sure you ran `npm start` in the terminal
- Check that port 3000 is not in use

### "Cannot find module 'express'"
- Run `npm install` again to ensure all dependencies are installed

### Form submission fails
- Open browser console (F12) to see error messages
- Make sure the server is running on localhost:3000
- Check CORS settings if getting cross-origin errors

## Stopping the Server
Press `Ctrl + C` in the terminal

## Viewing Submitted Data

You can view all submitted contacts via the API:
```
http://localhost:3000/api/contacts
```

Or using curl:
```bash
curl http://localhost:3000/api/contacts
```

## Future Enhancements

- Add admin dashboard to view/manage contacts
- Add email notifications on form submission
- Add user authentication
- Add form validation on backend
- Deploy to cloud hosting (Heroku, AWS, etc.)
