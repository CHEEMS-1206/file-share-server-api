# File Share Server

A secure, scalable, and cloud-ready file sharing backend built with Node.js, Express, and PostgreSQL. This system enables contributors to upload encrypted files and receivers to securely access them with proper authentication, authorization, and download tracking.

## Key Specifications
### Features 
🔐 JWT-based Authentication & Authorization

📁 Secure File Upload & Download

🔑 File-level Password Protection

📧 Email-based OTP Verification

👥 Role-based Access (Contributor / Receiver)

📊 Download Tracking & History

⚡ Scalable & Modular Architecture

🐳 Dockerized application for consistent and portable deployments

☁️ AWS S3 simulation using LocalStack to replicate real-world cloud storage locally

🌐 Cloud-ready architecture (easy migration from LocalStack → AWS S3)

⚙️ Environment-driven configuration for secure deployments

🚦 Designed with scalability in mind (rate limiting, modularization, microservices-ready)

### Technologies Used:
Backend ->	Node.js, Express

Database	-> PostgreSQL (NeonDB / Local)

File Storage ->	AWS S3 (LocalStack for local dev)

Auth ->	JWT, bcrypt

Email ->	Nodemailer

DevOps	-> Docker, LocalStack

Utilities ->	dotenv, multer

### Architecture 
Routes → Controllers → (Service Layer - planned) → Models → Database

Routes → API endpoints

Controllers → Core business logic

Models → Database interaction

Middleware → Auth, validation, error handling

### 🔐 Authentication Flow
User registers → OTP sent via email

OTP verification → Account activated

Login → JWT issued

Protected routes accessed using JWT

### Endpoints

#### Authentication
api/new-user/register POST - Endpoint to set user type and start user registration

api/new-user/email-verification POST - OTP generation for email

api/new-user/otp-verify POST - OTP verification and registration

api/login POST - Log in to the system

api/forgot-password POST - generate otp to mail for user password change

api/otp-verify POST - verify otp for user password change

api/change-password POST - change user password

#### Contributor Router Endpoints
api/contributor/profile GET - Retrieve the profile data of the contributor.

api/contributor/my-files GET - Fetch all files uploaded by the contributor.

api/contributor/my-file/:file_id GET - Get detailed information about a specific file uploaded by the contributor.

api/contributor/my-file/:file_id PUT - Update details of a specific file (complete replacement).

api/contributor/my-file/:file_id PATCH - Partially update details of a specific file.

api/contributor/my-file/:file_id DELETE - Delete a specific file uploaded by the contributor.

api/contributor/add-new POST - Upload a new file.

api/contributor/my-file-downloads GET - Retrieve the download history of the contributor's files.

api/contributor/my-file/reset-password/:file_id PATCH - Reset the password for a specific file uploaded by the contributor.

#### Receiver Router Endpoints
api/receiver/profile GET - Retrieve the profile data of the receiver.

api/receiver/all-files GET - View all available files.

api/receiver/file/:file_id GET - Get details of a specific file.

api/receiver/all-contributors GET - Fetch a list of all contributors and their files.

api/receiver/about-contributor/:contributor_id GET - Retrieve information about a specific contributor.

api/receiver/contributor/files/:contributor_id GET - View all files uploaded by a specific contributor.

api/receiver/file/download/:file_id POST - Download a specific file.

api/receiver/my-download-history GET - View the download history for the receiver.

### Packages Used
bcrypt: Provides password hashing and verification, ensuring secure storage of user credentials by generating and validating hashed passwords.

cors: Enables Cross-Origin Resource Sharing, allowing controlled access to resources from external origins in your web application.

dotenv: Loads environment variables from a .env file into process.env, simplifying the management of sensitive configuration details like API keys and database credentials.

express: A fast and minimalist web framework for Node.js that provides a robust set of features for building web and mobile applications, such as routing and middleware support.

fs: A built-in Node.js module for interacting with the file system, enabling operations like reading, writing, deleting, and modifying files.

jsonwebtoken: Implements JSON Web Tokens (JWT) for user authentication and authorization, allowing secure transmission of information between client and server.

multer: A middleware for handling multipart/form-data, commonly used for uploading files in Node.js applications.

nodemailer: A library for sending emails from Node.js applications, supporting various transport mechanisms such as SMTP and Gmail.

nodemon: A development utility that monitors for changes in source files and automatically restarts the server, improving developer productivity.

uuid: A library for generating unique identifiers (UUIDs) for objects or entities, ensuring uniqueness across distributed systems or databases.

file-type: To get the mime type of the file sent by the user for storage, to enhance security and scrutinity.

aws-sdk: To simulate AWS cloud nature using localstack.

### Architecture
The project follows a Model, Routes, and Controllers architecture:

Model: Defines the table structure for data and file details.

Routes: Handles incoming HTTP requests and routes them to the appropriate controller.

Controllers: Contains the logic for handling different API endpoints.

Services: In future, service layers can be introduced to remove clutter and violation of DRY principle and make code mor readable and modular.

### Getting Started
Clone the repository:
git clone https://github.com/CHEEMS-1206/file-share-server-api.git

Install dependencies:
cd file-share-api
npm install

Set up your environment variables:
Create a .env file in the root of your project and add the necessary environment variables. You can use the provided .env.example as a template.

Run the development server:
npm run dev

### Sample .env 
DB_PASS=

DB_USERNAME=

DB_URI=

DB_NAME=


PORT=

JWT_SECRET=


HOST_EMAIL_USER=

HOST_EMAIL_PASSWORD=


S3_BUCKET=

S3_ENDPOINT=

AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=

AWS_REGION=

LOCALSTACK_AUTH_TOKEN=


/// Extras ///


For local database ->

DB_PASS_LOCAL=

DB_USERNAME_LOCAL=


For NeonDB (cloud database) -> 

DB_PASS_NEON=

DB_USERNAME_NEON=

### Folder Structure
file-share-api/

│── config/          # DB & app config

│── controllers/     # Business logic

│── models/          # DB schema

│── routes/          # API routes

│── middleware/      # Auth & validation

│── utils/           # Helpers (OTP, mail)

│── validators/      # Request validation

│── uploads/         # File storage (local) / if using s3 from aws or localstack no need for this.

│── index.js         # Entry point

│── package.json

│── Dockerfile

│── README.md

### Docker Setup
-> Build image
docker build -t file-share-api .

-> Run container
docker run -p 4000:4000 file-share-api --env-file .env

### 🔒 Security Practices
Password hashing using bcrypt

JWT-based authentication

Environment-based secrets

Input validation & sanitization

Secure file access controls

### 🚀 Future Improvements
Service Layer abstraction

Centralized error handling

Logging (Winston / Morgan)

Rate limiting (Redis)

AWS S3 production integration

CI/CD pipeline

Microservices migration

### 🤝 Contributing
-> git checkout -b feature/your-feature

-> git commit -m "Add feature"

-> git push origin feature/your-feature

### Created by 
Priyanshu Singh 
