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
- [User Endpoints](#user-endpoints)
  - [Get User](#get-user)
  - [Get Safety Records](#get-safety-records)
  - [Update Username](#update-username)
  - [Update Display Name](#update-display-name)
  - [Update Email](#update-email)
  - [Complete Email Update](#complete-email-update)
  - [Update Password](#update-password)
- [Class Endpoints](#class-endpoints)
  - [Create Class](#create-class)
  - [Delete Class](#delete-class)
  - [Rename Class](#rename-class)
  - [Get Classes](#get-classes)
  - [Get Class](#get-class)
  - [Add Admin](#add-admin)
  - [Remove Admin](#remove-admin)
  - [Add Student](#add-student)
  - [Rename Student](#rename-student)
  - [Delete Student](#delete-student)
- [Task Endpoints](#task-endpoints)
  - [Create Task](#create-task)
  - [Get Tasks](#get-tasks)
  - [Get Task](#get-task)
  - [Delete Task](#delete-task)
  - [Get Task Problems](#get-task-problems)
  - [Rename Task](#rename-task)
  - [Update Description](#update-description)
  - [Update Grading Status](#update-grading-status)
- [Problem Generation Endpoints](#problem-generation-endpoints)
  - [Get Problem Generator Index](#get-problem-generator-index)
  - [Generate Problem](#generate-problem)

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

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Email already in use.",
      "error": {
        "code": "EMAIL_IN_USE",
        "details": {}
      }
    }
    ```

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Username already in use.",
      "error": {
        "code": "USERNAME_IN_USE",
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

### User Endpoints

#### Get User

- **URL:** `/api/users/:id`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the user to get.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "User found successfully."
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
      "message": "Error getting user.",
      "error": {
        "code": "GET_USER_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Safety Records

- **URL:** `/api/users/:id/safety-records`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the user to get safety records for.

- **Query Parameters**:

  - `limit`: The number of safety records to return (default: 10).
  - `offset`: The number of safety records to skip (default: 0).

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": [],
      "message": "Safety records found successfully."
    }
    ```

  > **Note:** The safety records will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid limit.",
      "error": {
        "code": "INVALID_LIMIT",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid offset.",
      "error": {
        "code": "INVALID_OFFSET",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to get safety records for this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error getting safety records.",
      "error": {
        "code": "GET_SAFETY_RECORDS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only get safety records for their own account.

#### Update Username

- **URL:** `/api/users/:id/username`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "username": "new_username"
  }
  ```

  > **Note:** The new username to update.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Username updated successfully."
    }
    ```

    > **Note:** The updated user data will be returned in the response (`data` field).

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

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Username already taken.",
      "error": {
        "code": "USERNAME_TAKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error updating username.",
      "error": {
        "code": "UPDATE_USERNAME_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own username.

#### Update Display Name

- **URL:** `/api/users/:id/display-name`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "displayName": "new_display_name"
  }
  ```

  > **Note:** The new display name to update.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Display name updated successfully."
    }
    ```

    > **Note:** The updated user data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid display name.",
      "error": {
        "code": "INVALID_DISPLAY_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error updating display name.",
      "error": {
        "code": "UPDATE_DISPLAY_NAME_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own display name.

#### Update Email

- **URL:** `/api/users/:id/email`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "email": "new_email",
    "callbackUrl": "https://example.com/verify-email"
  }
  ```

  > **Note:** The new email to update and the `callbackUrl` is the URL will be the url sent to the user in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": null,
      "message": "Email verification sent successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid email.",
      "error": {
        "code": "INVALID_EMAIL",
        "details": {}
      }
    }
    ```

  - **Status:** `409 Conflict`

    ```json
    {
      "status": "error",
      "message": "Email already taken.",
      "error": {
        "code": "EMAIL_TAKEN",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
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

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own email.

#### Complete Email Update

- **URL:** `/api/users/:id/email/complete`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "token": "JWT_TOKEN"
  }
  ```

  > **Note:** The token received in the email for email verification.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Email updated successfully."
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

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error updating email.",
      "error": {
        "code": "UPDATE_EMAIL_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own email.

#### Update Password

- **URL:** `/api/users/:id/password`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the user to update.

- **Request Body**:

  ```json
  {
    "currentPassword": "current_password",
    "newPassword": "new_password"
  }
  ```

  > **Note:** The current password and the new password to update.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Password updated successfully."
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
      "message": "Invalid new password.",
      "error": {
        "code": "INVALID_NEW_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `401 Unauthorized`

    ```json
    {
      "status": "error",
      "message": "Incorrect password.",
      "error": {
        "code": "INCORRECT_PASSWORD",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "Forbidden to update this user.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error updating password.",
      "error": {
        "code": "UPDATE_PASSWORD_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it. The user can only update their own password.

### Class Endpoints

#### Create Class

- **URL:** `/api/classes`
- **Method:** `POST`

- **Request Body**:

  ```json
  {
    "className": "class_name"
  }
  ```

  > **Note:** The name of the class to create.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Class created successfully."
    }
    ```

    > **Note:** The created class data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class name.",
      "error": {
        "code": "INVALID_CLASS_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error creating class.",
      "error": {
        "code": "CREATE_CLASS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Delete Class

- **URL:** `/api/classes/:id`
- **Method:** `DELETE`

- **Request Parameters**:

  - `id`: The ID of the class to delete.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": null,
      "message": "Class deleted successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to delete this class.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error deleting class.",
      "error": {
        "code": "DELETE_CLASS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Rename Class

- **URL:** `/api/classes/:id/name`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the class to rename.

- **Request Body**:

  ```json
  {
    "name": "new_class_name"
  }
  ```

  > **Note:** The new name of the class.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Class renamed successfully."
    }
    ```

    > **Note:** The updated class data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class name.",
      "error": {
        "code": "INVALID_CLASS_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to rename this class.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error renaming class.",
      "error": {
        "code": "RENAME_CLASS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Classes

- **URL:** `/api/classes`
- **Method:** `GET`

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": [],
      "message": "Classes found successfully."
    }
    ```

    > **Note:** The classes will be returned in the response (`data` field).

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error getting classes.",
      "error": {
        "code": "GET_CLASSES_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Class

- **URL:** `/api/classes/:id`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the class to get.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Class found successfully."
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to view this class.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error getting class.",
      "error": {
        "code": "GET_CLASS_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Add Admin

- **URL:** `/api/classes/:id/admins`
- **Method:** `POST`

- **Request Parameters**:

  - `id`: The ID of the class to add an admin to.

- **Request Body**:

  ```json
  {
    "identifier": "email or username or user_id"
  }
  ```

  > **Note:** The email, username, or ID of the user to add as an admin.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Admin added successfully."
    }
    ```

    > **Note:** The updated class data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
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

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to add an admin to this class.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error adding admin.",
      "error": {
        "code": "ADD_ADMIN_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Remove Admin

- **URL:** `/api/classes/:id/admins`
- **Method:** `DELETE`

- **Request Parameters**:

  - `id`: The ID of the class to remove an admin from.

- **Request Body**:

  ```json
  {
    "userId": "user_id"
  }
  ```

  > **Note:** The ID of the user to remove as an admin.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Admin removed successfully."
    }
    ```

    > **Note:** The updated class data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
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

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to remove an admin from this class.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error removing admin.",
      "error": {
        "code": "REMOVE_ADMIN_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Add Student

- **URL:** `/api/classes/:id/students`
- **Method:** `POST`

- **Request Parameters**:

  - `id`: The ID of the class to add a student to.

- **Request Body**:

  ```json
  {
    "name": "student_name"
  }
  ```

  > **Note:** The name of the student to add.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Student added successfully."
    }
    ```

    > **Note:** The updated class data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid student name.",
      "error": {
        "code": "INVALID_STUDENT_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to add a student to this class.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error adding student.",
      "error": {
        "code": "ADD_STUDENT_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Rename Student

- **URL:** `/api/classes/:id/students/:studentNumber`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the class to rename a student in.
  - `studentNumber`: The student number of the student to rename.

- **Request Body**:

  ```json
  {
    "name": "new_student_name"
  }
  ```

  > **Note:** The new name of the student.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Student renamed successfully."
    }
    ```

    > **Note:** The updated class data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid student number.",
      "error": {
        "code": "INVALID_STUDENT_NUMBER",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid student name.",
      "error": {
        "code": "INVALID_STUDENT_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to rename this student.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error renaming student.",
      "error": {
        "code": "RENAME_STUDENT_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Delete Student

- **URL:** `/api/classes/:id/students/:studentNumber`
- **Method:** `DELETE`

- **Request Parameters**:

  - `id`: The ID of the class to delete a student from.
  - `studentNumber`: The student number of the student to delete.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Student deleted successfully."
    }
    ```

    > **Note:** The updated class data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid student number.",
      "error": {
        "code": "INVALID_STUDENT_NUMBER",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to delete a student from this class.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error deleting student.",
      "error": {
        "code": "DELETE_STUDENT_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

### Task Endpoints

#### Create Task

- **URL:** `/api/classes/:classId/tasks`
- **Method:** `POST`

- **Request Parameters**:

  - `classId`: The ID of the class to create a task for.

- **Request Body**:

  ```json
  {
    "name": "Task Name",
    "description": "Task Description",
    "options": {
      "isIndividualTask": true,
      "topics": [
        {
          "path": ["algebra", "linearEquations", "oneVariable", "solving"],
          "options": {
            "count": 5,
            "...moreOptions": "..."
          }
        },
        {
          "path": ["geometry", "triangles", "area", "solving"],
          "options": {
            "count": 5,
            "...moreOptions": "..."
          }
        }
      ],
      "shuffle": true
    }
  }
  ```

  > **Note:** The `options` field specifies the problem generation options for the task.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "taskId": "60f7b3b7b9b3b40015f3b3b7"
      },
      "message": "Task created successfully."
    }
    ```

    > **Note:** The ID of the created task will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid class ID.",
      "error": {
        "code": "INVALID_CLASS_ID",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid task name.",
      "error": {
        "code": "INVALID_TASK_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid task description.",
      "error": {
        "code": "INVALID_TASK_DESCRIPTION",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Options are required.",
      "error": {
        "code": "OPTIONS_REQUIRED",
        "details": {}
      }
    }
    ```

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "No students found in class.",
      "error": {
        "code": "NO_STUDENTS_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to create task.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in creating task.",
      "error": {
        "code": "TASK_CREATION_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Tasks

- **URL:** `/api/classes/:classId/tasks`
- **Method:** `GET`

- **Request Parameters**:

  - `classId`: The ID of the class to get tasks for.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "60f7b3b7b9b3b40015f3b3b7",
          "classId": "60f7b3b7b9b3b40015f3b3b6",
          "name": "Task Name",
          "description": "Task Description",
          "createdAt": "2021-07-21T12:00:00.000Z",
          "updatedAt": "2021-07-21T12:00:00.000Z"
        }
      ],
      "message": "Tasks retrieved successfully."
    }
    ```

    > **Note:** The array of tasks will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to get tasks.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in retrieving tasks.",
      "error": {
        "code": "TASKS_RETRIEVAL_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Task

- **URL:** `/api/tasks/:id`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the task to get.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "_id": "60f7b3b7b9b3b40015f3b3b7",
        "classId": "60f7b3b7b9b3b40015f3b3b6",
        "name": "Task Name",
        "description": "Task Description",
        "userTasks": [
          {
            "studentNumber": "123456",
            "graded": false
          }
        ],
        "createdAt": "2021-07-21T12:00:00.000Z",
        "updatedAt": "2021-07-21T12:00:00.000Z"
      },
      "message": "Task retrieved successfully."
    }
    ```

    > **Note:** The task data will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Task not found.",
      "error": {
        "code": "TASK_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to get task.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in retrieving task.",
      "error": {
        "code": "TASK_RETRIEVAL_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Delete Task

- **URL:** `/api/tasks/:id`
- **Method:** `DELETE`

- **Request Parameters**:

  - `id`: The ID of the task to delete.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Task deleted successfully."
    }
    ```

    > **Note:** The updated task data will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Task not found.",
      "error": {
        "code": "TASK_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to delete task.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in deleting task.",
      "error": {
        "code": "TASK_DELETION_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Get Task Problems

- **URL:** `/api/tasks/:id/problems/:studentNumber`
- **Method:** `GET`

- **Request Parameters**:

  - `id`: The ID of the task to get problems for.
  - `studentNumber`: The student number to get problems for.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": [
        {
          "problemId": "60f7b3b7b9b3b40015f3b3b8",
          "problem": "2x + 3 = 7",
          "solution": "x = 2"
        }
      ],
      "message": "Problems retrieved successfully."
    }
    ```

    > **Note:** The problems data will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Problems not found.",
      "error": {
        "code": "PROBLEMS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to get problems.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in retrieving problems.",
      "error": {
        "code": "PROBLEMS_RETRIEVAL_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Rename Task

- **URL:** `/api/tasks/:id/name`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the task to rename.

- **Request Body**:

  ```json
  {
    "name": "New Task Name"
  }
  ```

  > **Note:** The `name` field specifies the new name for the task.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "_id": "60f7b3b7b9b3b40015f3b3b7",
        "classId": "60f7b3b7b9b3b40015f3b3b6",
        "name": "New Task Name",
        "description": "Task Description",
        "createdAt": "2021-07-21T12:00:00.000Z",
        "updatedAt": "2021-07-21T12:00:00.000Z"
      },
      "message": "Task renamed successfully."
    }
    ```

    > **Note:** The updated task data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid task name.",
      "error": {
        "code": "INVALID_TASK_NAME",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Task not found.",
      "error": {
        "code": "TASK_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to rename task.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in renaming task.",
      "error": {
        "code": "TASK_RENAME_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Update Description

- **URL:** `/api/tasks/:id/description`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the task to update description for.

- **Request Body**:

  ```json
  {
    "description": "New Task Description"
  }
  ```

  > **Note:** The `description` field specifies the new description for the task.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "_id": "60f7b3b7b9b3b40015f3b3b7",
        "classId": "60f7b3b7b9b3b40015f3b3b6",
        "name": "Task Name",
        "description": "New Task Description",
        "createdAt": "2021-07-21T12:00:00.000Z",
        "updatedAt": "2021-07-21T12:00:00.000Z"
      },
      "message": "Task description updated successfully."
    }
    ```

    > **Note:** The updated task data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid task description.",
      "error": {
        "code": "INVALID_TASK_DESCRIPTION",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Task not found.",
      "error": {
        "code": "TASK_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to update task description.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in updating task description.",
      "error": {
        "code": "TASK_DESCRIPTION_UPDATE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

#### Update Grading Status

- **URL:** `/api/tasks/:id/grade/:studentNumber`
- **Method:** `PUT`

- **Request Parameters**:

  - `id`: The ID of the task to update grading status for.
  - `studentNumber`: The student number to update grading status for.

- **Request Body**:

  ```json
  {
    "graded": true
  }
  ```

  > **Note:** The `graded` field specifies the new grading status for the task.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {
        "_id": "60f7b3b7b9b3b40015f3b3b7",
        "classId": "60f7b3b7b9b3b40015f3b3b6",
        "name": "Task Name",
        "description": "Task Description",
        "createdAt": "2021-07-21T12:00:00.000Z",
        "updatedAt": "2021-07-21T12:00:00.000Z"
      },
      "message": "Task grading status updated successfully."
    }
    ```

    > **Note:** The updated task data will be returned in the response (`data` field).

  - **Status:** `400 Bad Request`

    ```json
    {
      "status": "error",
      "message": "Invalid graded status.",
      "error": {
        "code": "INVALID_GRADED_STATUS",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Task not found.",
      "error": {
        "code": "TASK_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Class not found.",
      "error": {
        "code": "CLASS_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `403 Forbidden`

    ```json
    {
      "status": "error",
      "message": "You are not authorized to update grading status.",
      "error": {
        "code": "ACCESS_DENIED",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error in updating grading status.",
      "error": {
        "code": "GRADING_STATUS_UPDATE_ERROR",
        "details": {}
      }
    }
    ```

> **Note:** The endpoint is protected, and the user must be authenticated to access it.

### Problem Generation Endpoints

#### Get Problem Generator Index

- **URL:** `/api/problems`
- **Method:** `GET`

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": [],
      "message": "Problem generator index retrieved successfully."
    }
    ```

    > **Note:** The problem generator index will be returned in the response (`data` field).

#### Generate Problem

- **URL:** `/api/problems/:topics/:subtopics/:...`
- **Method:** `GET`

- **Request Parameters**:

  - `topics`: The topics to generate the problem for.
  - `subtopics`: The subtopics to generate the problem for.
  - `...`: More subtopics if needed.

  > **Note:** The topics and subtopics are separated by `/`.

- **Query Parameters**:

  - `options`: The problem generation options. (Optional, object (Use JSON string))

  > **Note:** The problem generation options are passed as a query parameter. Please use `JSON.stringify` to pass the object.

- **Response**:

  - **Status:** `200 OK`

    ```json
    {
      "status": "success",
      "data": {},
      "message": "Problem generated successfully."
    }
    ```

    > **Note:** The generated problem will be returned in the response (`data` field).

  - **Status:** `404 Not Found`

    ```json
    {
      "status": "error",
      "message": "Generator not found.",
      "error": {
        "code": "GENERATOR_NOT_FOUND",
        "details": {}
      }
    }
    ```

  - **Status:** `500 Internal Server Error`

    ```json
    {
      "status": "error",
      "message": "Error generating problem.",
      "error": {
        "code": "GENERATE_PROBLEM_ERROR",
        "details": {}
      }
    }
    ```
