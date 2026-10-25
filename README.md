
# Job Portal API

A REST API for a job portal built using Node.js, Express.js, MongoDB and Mongoose.

## Features

- User registration and login with JWT authentication
- Candidate and employer role-based access
- Create, browse, search, filter and manage job listings
- Job sorting, pagination and statistics
- Submit and manage job applications
- Application status transitions and withdrawal
- Input validation and centralized error handling
- MongoDB data models and duplicate-application prevention

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- dotenv

## Installation

1. Clone or download this repository.
2. Install dependencies:

   npm install

3. Create a `.env` file in the project root:

   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_long_random_secret
   JWT_EXPIRES_IN=1d

4. Start the development server:

   npm run dev

   If no development script is configured, run:

   node server.js

## Base URL

http://localhost:5000

## Main API Routes

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Jobs
- POST /api/jobs
- GET /api/jobs
- GET /api/jobs/:id
- PATCH /api/jobs/:id
- PATCH /api/jobs/:id/status
- DELETE /api/jobs/:id
- GET /api/jobs/stats

### Applications
- POST /api/applications/job/:jobId
- GET /api/applications/my
- GET /api/applications/employer/job/:jobId
- PATCH /api/applications/:id/status
- DELETE /api/applications/:id

## Authentication

Protected endpoints require a JWT token in the Authorization header:

Authorization: Bearer YOUR_TOKEN

Employers can manage only their own job listings and associated applications. Candidates can manage only their own applications.

## Application Status Flow

- applied -> shortlisted
- applied -> rejected
- shortlisted -> hired
- shortlisted -> rejected

Candidates can withdraw applications while their status is `applied`.

## Error Responses

The API uses appropriate HTTP status codes, including 400, 401, 403, 404, 409 and 500.

## Environment Variables

Never commit `.env` or real credentials to version control.

## Testing

API requests can be tested using Thunder Client, Postman or curl. Save request examples and test results in the project documentation.

## Author

Add your name and academic details here.
