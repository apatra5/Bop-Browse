# Bop-Browse API Documentation

The Bop-Browse API is a RESTful API for a Tinder-like fashion browsing application. It provides endpoints for managing users, items, categories, and outfits.

**Base URL:** 
- Local Development: `http://localhost:8000`
- Production: ==TODO==



***

## User API

### Overview

The User API provides endpoints for creating, retrieving, updating, and deleting user accounts in the Bop-Browse system.



### Endpoints

#### 1. Create User

Creates a new user account in the system.

**Endpoint:** `POST /users/`

**Request Body:**

| Field    | Type   | Required | Description                      |
| -------- | ------ | -------- | -------------------------------- |
| username | string | Yes      | Unique username for the account  |
| password | string | Yes      | User's password (will be hashed) |

**Example Request:**

```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Success Response:**

**Status Code:** `201 Created`

```json
{
  "username": "john_doe",
  "id": 1
}
```

**Error Responses:**

| Status Code              | Description             | Response Body                               |
| ------------------------ | ----------------------- | ------------------------------------------- |
| 400 Bad Request          | Username already exists | `{"detail": "Username already registered"}` |
| 422 Unprocessable Entity | Invalid request body    | Validation error details                    |



***

#### 2. Get User

Retrieves user information by username.

**Endpoint:** `GET /users/{username}`

**Path Parameters:**

| Parameter | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| username  | string | Yes      | The username to retrieve |

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "username": "john_doe",
  "id": 1
}
```

**Error Responses:**

| Status Code   | Description         | Response Body                  |
| ------------- | ------------------- | ------------------------------ |
| 404 Not Found | User does not exist | `{"detail": "User not found"}` |



***

#### 3. Update User

Updates an existing user's username and/or password.

**Endpoint:** `PUT /users/{username}`

**Path Parameters:**

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| username  | string | Yes      | Current username of the user to update |

**Request Body:**

| Field    | Type   | Required | Description                   |
| -------- | ------ | -------- | ----------------------------- |
| username | string | No       | New username (must be unique) |
| password | string | No       | New password (will be hashed) |

**Notes:**

- Both fields are optional
- If changing the username, the new username must not already exist
- Password will be securely hashed before storage

**Example Request:**

```json
{
  "username": "jane_doe",
  "password": "NewSecurePass456"
}
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "username": "jane_doe",
  "id": 1
}
```

**Error Responses:**

| Status Code              | Description                | Response Body                              |
| ------------------------ | -------------------------- | ------------------------------------------ |
| 404 Not Found            | User does not exist        | `{"detail": "User not found"}`             |
| 400 Bad Request          | New username already taken | `{"detail": "New username already taken"}` |
| 422 Unprocessable Entity | Invalid request body       | Validation error details                   |



------

#### 4. Delete User ==TODO==

Deletes an existing user account from the system. Requires password authentication to confirm user identity.

**Endpoint:** `DELETE /users/{username}`

**Path Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| username  | string | Yes      | The username of the user to delete |

**Request Body:**

| Field    | Type   | Required | Description                        |
| -------- | ------ | -------- | ---------------------------------- |
| password | string | Yes      | User's password for authentication |

**Example Request:**

```json
{
  "password": "SecurePass123"
}
```

**Success Response:**

**Status Code:** `204 No Content`

No response body is returned on successful deletion.

**Error Responses:**

| Status Code              | Description         | Response Body                    |
| ------------------------ | ------------------- | -------------------------------- |
| 401 Unauthorized         | Invalid password    | `{"detail": "Invalid password"}` |
| 404 Not Found            | User does not exist | `{"detail": "User not found"}`   |
| 422 Unprocessable Entity | Missing password    | Validation error details         |



***

## Items API ==TODO==

### Overview

The Items API provides endpoints for browsing and retrieving clothing items. It supports category filtering and pagination for an optimal swiping experience.



### Endpoints

#### 1. Get Items Feed

Retrieves a paginated list of items for the user to browse/swipe. Supports optional category filtering.

**Endpoint:** `GET /items/feed`

**Query Parameters:**

| Parameter    | Type    | Required | Description                                                  |
| ------------ | ------- | -------- | ------------------------------------------------------------ |
| category_ids | string  | No       | Comma-separated list of category IDs to filter by (e.g., "123,456") |
| offset       | integer | No       | Number of items to skip for pagination (default: 0)          |
| limit        | integer | No       | Maximum number of items to return (default: 20, max: 50)     |

**Success Response:**

**Status Code:** `200 OK`

**Error Responses:**

| Status Code     | Description              | Response Body                               |
| --------------- | ------------------------ | ------------------------------------------- |
| 400 Bad Request | Invalid query parameters | `{"detail": "Invalid category_ids format"}` |

**Example (cURL):**

```bash
# Get all items (no filter)
curl -X GET "http://localhost:8000/items/feed?limit=20&offset=0"

# Get items filtered by categories
curl -X GET "http://localhost:8000/items/feed?category_ids=74369,74373&limit=20&offset=0"
```

**Notes:**

- When `category_ids` is empty or omitted, returns items from all categories
- For Tinder-like experience, fetch in batches and prefetch next batch when user reaches 75% of current batch



#### 2. Get Item Pictures

Use Shopbop API



#### 3. Get Item Details

Use Shopbop API



#### 4. Get Item Outfits

Use Shopbop API



## Categories API ==TODO==

### Ovewview

The Categories API provides endpoints to retrieve available product categories for filtering



### Endpoints

#### 1. Get All Categories

Retrieves a list of all available categories.

**Endpoint:** `GET /categories`

**Success Response:**

**Status Code:** `200 OK`



## Likes API ==TODO==

### Ovewview

The Likes API allows users to save items they're interested in (swipe right) and manage their liked items collection.



### Endpoints

#### 1. Like an Item

Records that a user likes a specific item

**Endpoint:** `POST /users/{user_id}/likes`

**Path Parameters:**

| Parameter | Type    | Required | Description        |
| --------- | ------- | -------- | ------------------ |
| user_id   | integer | Yes      | The ID of the user |

**Request Body:**

| Field   | Type   | Required | Description                    |
| ------- | ------ | -------- | ------------------------------ |
| item_id | string | Yes      | The ID of the item being liked |

**Example Request:**

```json
{
  "item_id": "PROD123"
}
```

**Success Response:**

**Status Code:** `201 Created`

```json
{
  "user_id": 1,
  "item_id": "PROD123",
  "liked_at": "2025-10-15T14:30:00Z"
}
```

**Error Responses:**

| Status Code     | Description            | Response Body                                                |
| --------------- | ---------------------- | ------------------------------------------------------------ |
| 400 Bad Request | Item already liked     | `{"detail": "Item already liked by user"}`                   |
| 404 Not Found   | User or item not found | `{"detail": "User not found"}` or `{"detail": "Item not found"}` |



#### 2. Get User's Liked Item

Retrieves all items that a user has liked.

**Endpoint:** `GET /users/{user_id}/likes`

**Path Parameters:**

| Parameter | Type    | Required | Description        |
| --------- | ------- | -------- | ------------------ |
| user_id   | integer | Yes      | The ID of the user |

**Query Parameters:**

| Parameter | Type    | Required | Description                                         |
| --------- | ------- | -------- | --------------------------------------------------- |
| offset    | integer | No       | Number of items to skip for pagination (default: 0) |
| limit     | integer | No       | Maximum number of items to return (default: 20)     |

**Success Response:**

**Status Code:** `200 OK`

**Error Responses:**

| Status Code   | Description    | Response Body                  |
| ------------- | -------------- | ------------------------------ |
| 404 Not Found | User not found | `{"detail": "User not found"}` |



#### 3. Unlike an Item

Removes an item from the user's liked items.

**Endpoint:** `DELETE /users/{user_id}/likes/{item_id}`

**Path Parameters:**

| Parameter | Type    | Required | Description                  |
| --------- | ------- | -------- | ---------------------------- |
| user_id   | integer | Yes      | The ID of the user           |
| item_id   | string  | Yes      | The ID of the item to unlike |

**Success Response:**

**Status Code:** `204 No Content`

No response body is returned on successful deletion.

**Error Responses:**

| Status Code   | Description            | Response Body                  |
| ------------- | ---------------------- | ------------------------------ |
| 404 Not Found | User or like not found | `{"detail": "Like not found"}` |





## SPECIAL NOTES

### Questions

1. Categories: API vs Hardcoding
2. Many brands can clutter the UI, do we need a brand filter?
3. Authentication methods? 