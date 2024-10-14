# MPC-Lab-X-server

MPC-Lab-X-server is the backend component of the MPC-Lab-X project. It handles question generation, problem solving, and data management for mathematics, physics, and chemistry.

## Features

- Randomized question generation in various subjects (mathematics, physics, chemistry).
- Provides solutions and detailed steps for each generated question.
- Supports multiple categories and detailed sub-types of questions.
- Uses Express.js for API handling and MongoDB for data storage.
- Supports user authentication and session management.
- Classroom creation, student management, TA/admin management, task creation/management (using mpclab library for problem generation), and task grading.

## Prerequisites

- Node.js
- MongoDB
- SMTP server for sending emails

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MPC-Lab-X/MPC-Lab-X-server.git
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=5000 # Port number for the server (default: 5000)
HOST=localhost # Host address for the server (default: localhost)
MONGO_URI=mongodb://localhost/mpc-lab-x # MongoDB connection URI
JWT_SECRET=secret # Secret key for JWT token generation
EMAIL_HOST=smtp-relay.brevo.com # SMTP host for sending emails
EMAIL_PORT=587 # SMTP port for sending emails
EMAIL_SECURE=false # SMTP secure connection (default: false)
EMAIL_USERNAME=user # SMTP username
EMAIL_PASSWORD=pass # SMTP password
EMAIL_SENDER=no-reply@example.com # Email sender address
```

> Note: The SMTP host, port, username, password, and sender address should be replaced with your own SMTP server details.

4. Start the server:

```bash
npm start
```

## Usage

The server provides a RESTful API for question generation, problem solving, and data management. The API endpoints are documented in the [docs/API.md](docs/API.md) file.

## Testing

The server uses Jest for testing. To run the tests, use the following command.

```bash
npm test
```

## Acknowledgements

We would like to thank the following libraries and tools for making this project possible:

- [Express.js](https://expressjs.com/): A fast, unopinionated, minimalist web framework for Node.js.
- [MongoDB](https://www.mongodb.com/): A NoSQL database program that uses JSON-like documents with optional schemas.
- [Jest](https://jestjs.io/): A delightful JavaScript testing framework with a focus on simplicity.
- [Nodemailer](https://nodemailer.com/): A module for Node.js to send emails easily.
- [JWT](https://jwt.io/): A compact, URL-safe means of representing claims to be transferred between two parties.
- [bcrypt](https://www.npmjs.com/package/bcrypt): A library to help you hash passwords.
- [mpclab](https://www.npmjs.com/package/mpclab): A problem generator for mathematics, physics, and chemistry.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
