# File Share Server

Welcome to File Share Backend, a powerful backend solution for sharing encrypted files with different users. This project is built using Postgre SQL, Express, and Node.js, providing a robust foundation for CRUD operations and file management. Whether you are developing a personal project or an enterprise-level application, File Share Backend has you covered. This repository contains the backend codebase for a powerful file sharing application built using Node.js, Postgre SQL, and Express. The backend system serves as the robust foundation for managing files, their encryptions, user details and authentication, and associated functionalities seamlessly.

## Key Specifications
### Technologies Used:
POSTgre SQL: A SQL database used for storing file-related info.

Express: A web application framework for Node.js, facilitating the creation of robust APIs.

Node.js: A runtime environment for executing JavaScript code server-side.

### Purpose:
POSTgre SQL: Used to store and retrieve file data efficiently.

Express: Provides a set of features for building web and mobile applications, including robust routing.

Node.js: Powers the server-side logic, handling requests and responses.

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

### Architecture
The project follows a Model, Routes, and Controllers architecture:

Model: Defines the table structure for data and file details.

Routes: Handles incoming HTTP requests and routes them to the appropriate controller.

Controllers: Contains the logic for handling different API endpoints.

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

### Folder Structure
file-share-api/

|-- config/

|-- controllers/

|-- emailAndOtp/

|-- models/

|-- routes/

|-- validators/

|-- .env

|-- .gitignore

|-- index.js

|-- package.json

|-- README.md

### Contributing
Feel free to contribute to the project by opening issues or submitting pull requests. Your feedback and contributions are highly appreciated!
