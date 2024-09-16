# API Documentation

The server provides a RESTful API for question generation, problem solving, and data management. The API endpoints are documented below.

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected routes, the client must include a valid JWT token in the `Authorization` header of the HTTP request. (Access tokens are valid for 15 minutes, and refresh tokens are valid for 30 days.)

## Endpoints

### Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
  - [User Registration](#user-registration)
  - [Complete Registration](#complete-registration)
  - [User Login](#user-login)
  - [Refresh Token](#refresh-token)
  - [Reset Password](#reset-password)
  - [Complete Reset Password](#complete-reset-password)

### Authentication Endpoints

#### User Registration

- **URL:** `/api/auth/register`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "callbackUrl": "https://example.com/verify-email"
  }
  ```

  > **Note:** The `callbackUrl` is the URL will be the url sent to the user in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

  ```json
  {
    "status": "success",
    "data": null,
    "message": "Verification email sent."
  }
  ```

  - **Status:** `400 Bad Request`

  ```json
  {
    "status": "error",
    "message": "Invalid email address.",
    "error": {
      "code": "INVALID_EMAIL",
      "details": {}
    }
  }
  ```

  - **Status:** `500 Internal Server Error`

  ```json
  {
    "status": "error",
    "message": "Error sending verification email.",
    "error": {
      "code": "SEND_EMAIL_ERROR",
      "details": {}
    }
  }
  ```

#### Complete Registration

- **URL:** `/api/auth/complete-registration`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "token": "JWT_TOKEN (received in email)",
    "username": "username",
    "password": "password"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

  ```json
  {
    "status": "success",
    "data": {},
    "message": "User created successfully."
  }
  ```

  > **Note:** The user data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

  ```json
  {
    "status": "error",
    "message": "Invalid username.",
    "error": {
      "code": "INVALID_USERNAME",
      "details": {}
    }
  }
  ```

  - **Status:** `401 Unauthorized`

  ```json
  {
    "status": "error",
    "message": "Token expired.",
    "error": {
      "code": "TOKEN_EXPIRED",
      "details": {}
    }
  }
  ```

  - **Status:** `500 Internal Server Error`

  ```json
  {
    "status": "error",
    "message": "Error creating user.",
    "error": {
      "code": "CREATE_USER_ERROR",
      "details": {}
    }
  }
  ```

#### User Login

- **URL:** `/api/auth/login`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "identifier": "email or username",
    "password": "password"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

  ```json
  {
    "status": "success",
    "data": {
      "user": {},
      "refreshToken": "JWT_TOKEN",
      "accessToken": "JWT_TOKEN"
    },
    "message": "User logged in successfully."
  }
  ```

  > **Note:** The user data, refresh token, and access token will be returned in the response (`data` field). The access token should be used to access protected routes, and the refresh token should be used to generate a new access token when it expires.

  - **Status:** `400 Bad Request`

  ```json
  {
    "status": "error",
    "message": "Invalid email or username.",
    "error": {
      "code": "INVALID_IDENTIFIER",
      "details": {}
    }
  }
  ```

  - **Status:** `401 Unauthorized`

  ```json
  {
    "status": "error",
    "message": "Invalid password.",
    "error": {
      "code": "INVALID_PASSWORD",
      "details": {}
    }
  }
  ```

  - **Status:** `404 Not Found`

  ```json
  {
    "status": "error",
    "message": "User not found.",
    "error": {
      "code": "USER_NOT_FOUND",
      "details": {}
    }
  }
  ```

  - **Status:** `403 Forbidden`

  ```json
  {
    "status": "error",
    "message": "Account locked.",
    "error": {
      "code": "ACCOUNT_LOCKED",
      "details": {}
    }
  }
  ```

  - **Status:** `500 Internal Server Error`

  ```json
  {
    "status": "error",
    "message": "Error logging in user.",
    "error": {
      "code": "LOGIN_USER_ERROR",
      "details": {}
    }
  }
  ```

#### Refresh Token

- **URL:** `/api/auth/refresh-token`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "refreshToken": "JWT_TOKEN"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "accessToken": "JWT_TOKEN"
      },
      "message": "Access token refreshed successfully."
    }
    ```

    - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid refresh token.",
      "error": {
        "code": "INVALID_REFRESH_TOKEN",
        "details": {}
      }
    }
    ```

    - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid token.",
      "error": {
        "code": "INVALID_TOKEN",
        "details": {}
      }
    }
    ```

    - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Token expired.",
      "error": {
        "code": "TOKEN_EXPIRED",
        "details": {}
      }
    }
    ```

    - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error refreshing token.",
      "error": {
        "code": "REFRESH_TOKEN_ERROR",
        "details": {}
      }
    }
    ```

#### Reset Password

- **URL:** `/api/auth/reset-password`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "callbackUrl": "https://example.com/reset-password"
  }
  ```

  > **Note:** The `callbackUrl` is the URL will be the url sent to the user in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

  ```json
  {
    "status": "success",
    "data": null,
    "message": "Password reset email sent."
  }
  ```

  - **Status:** `400 Bad Request`

  ```json
  {
    "status": "error",
    "message": "Invalid email address.",
    "error": {
      "code": "INVALID_EMAIL",
      "details": {}
    }
  }
  ```

  - **Status:** `404 Not Found`

  ```json
  {
    "status": "error",
    "message": "User not found.",
    "error": {
      "code": "USER_NOT_FOUND",
      "details": {}
    }
  }
  ```

  - **Status:** `500 Internal Server Error`

  ```json
  {
    "status": "error",
    "message": "Error sending password reset email.",
    "error": {
      "code": "SEND_EMAIL_ERROR",
      "details": {}
    }
  }
  ```

#### Complete Reset Password

- **URL:** `/api/auth/complete-reset-password`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "token": "JWT_TOKEN",
    "password": "new_password"
  }
  ```

- **Response**:

  - **Status:** `200 OK`

  ```json
  {
    "status": "success",
    "data": {},
    "message": "Password reset successfully."
  }
  ```

  - **Status:** `400 Bad Request`

  ```json
  {
    "status": "error",
    "message": "Invalid password.",
    "error": {
      "code": "INVALID_PASSWORD",
      "details": {}
    }
  }
  ```

  - **Status:** `400 Bad Request`

  ```json
  {
    "status": "error",
    "message": "Invalid token.",
    "error": {
      "code": "INVALID_TOKEN",
      "details": {}
    }
  }
  ```

  - **Status:** `401 Unauthorized`

  ```json
  {
    "status": "error",
    "message": "Token expired.",
    "error": {
      "code": "TOKEN_EXPIRED",
      "details": {}
    }
  }
  ```

  - **Status:** `500 Internal Server Error`

  ```json
  {
    "status": "error",
    "message": "Error verifying token.",
    "error": {
      "code": "VERIFY_TOKEN_ERROR",
      "details": {}
    }
  }
  ```

  - **Status:** `404 Not Found`

  ```json
  {
    "status": "error",
    "message": "User not found.",
    "error": {
      "code": "USER_NOT_FOUND",
      "details": {}
    }
  }
  ```

  - **Status:** `500 Internal Server Error`

  ```json
  {
    "status": "error",
    "message": "Error resetting password.",
    "error": {
      "code": "RESET_PASSWORD_ERROR",
      "details": {}
    }
  }
  ```
