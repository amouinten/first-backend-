# OuinShop Backend: E-Commerce REST API

**Student name:** OUINTNE Mohammed Amine (Group: AI G2)
**Module:** WAMD, TD-TP 3 (ENSTA, SS/IA, First Semester 2026)

## Application description

OuinShop Backend is the REST API for the e-commerce application built in TD-TP 2 (React + Redux). Instead of keeping products in a local JavaScript array, the frontend can now fetch them from a MongoDB database through this API. The backend also handles user registration and login, and protects the product management endpoints with JWT authentication.

The React frontend never talks to MongoDB directly. It sends HTTP requests to this API and receives JSON responses.

```
React + Redux Frontend  <--HTTP / JSON-->  Node.js + Express REST API  <-->  MongoDB
```

## Technologies used

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | Web framework for the REST API |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT creation and verification |
| express-rate-limit | Rate limiting |
| cors | Cross-origin requests from the React app |
| helmet | Security headers |
| dotenv | Environment variables |
| Thunder Client | API testing |

## Project structure

```
ouinshop-backend/
├── src/
│   ├── config/        # Database connection and configuration
│   ├── controllers/   # Request handling logic
│   ├── middleware/    # JWT authentication, rate limiting, error handling
│   ├── models/        # Mongoose models (User, Product)
│   ├── routes/        # Route definitions
│   └── utils/         # Helper functions
├── scripts/           # Database seed script
├── data/              # Sample data
├── postman/           # API request collection
├── .env.example       # Environment variable placeholders
└── package.json
```

## Database models

### Product

| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| description | String | |
| price | Number | Required |
| category | String | One of: Timepieces, Fragrance & Beauty, Leather & Footwear, Eyewear & Jewels, Tech, Maison |
| imageUrl | String | Image URL |
| stock | Number | Stock quantity |

### User

| Field | Type | Notes |
|---|---|---|
| name | String | Required, at least 2 characters |
| email | String | Required, unique |
| passwordHash | String | bcrypt hash, never returned in responses |

Passwords are never stored as plain text, and the password hash is never included in API responses.

## API endpoints

### Authentication

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Log in and receive a JWT | Public |

### Products

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/products` | Retrieve all products | Public |
| GET | `/api/products/:id` | Retrieve one product | Public |
| POST | `/api/products` | Create a product | JWT required |
| PUT | `/api/products/:id` | Update a product | JWT required |
| DELETE | `/api/products/:id` | Delete a product | JWT required |

Role-based authorization (administrator vs. customer) is not implemented, as allowed by the lab. Any logged-in user can manage products. In production this would require additional authorization.

### Example requests

Register:

```json
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@mail.com",
  "password": "password123"
}
```

Login:

```json
POST /api/auth/login
{
  "email": "test@mail.com",
  "password": "password123"
}
```

Create a product (requires the `Authorization` header):

```json
POST /api/products
{
  "name": "Test product",
  "description": "Demo product",
  "price": 99,
  "category": "Tech",
  "imageUrl": "https://example.com/a.jpg",
  "stock": 10
}
```

### Status codes

| Code | Meaning |
|---|---|
| 200 | Successful retrieval, update or deletion |
| 201 | Successful creation |
| 400 | Invalid input (validation failed) |
| 401 | Missing or invalid authentication |
| 404 | Resource or route not found |
| 409 | Duplicate email |
| 429 | Too many requests (rate limit exceeded) |
| 500 | Unexpected server error |

### Response format

Successful responses:

```json
{
  "success": true,
  "data": { }
}
```

Error responses are consistent across the API:

```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Validation failed",
    "details": {
      "password": "password is required (at least 8 characters)"
    }
  }
}
```

## JWT authentication

1. The user registers with a name, email and password. The password is hashed with bcrypt before being stored in MongoDB.
2. The user logs in with email and password. The backend verifies the credentials and, if they are valid, generates a JWT signed with `JWT_SECRET` and returns it.
3. For protected endpoints, the client sends the token in the HTTP header:

   ```
   Authorization: Bearer <JWT_TOKEN>
   ```

4. An authentication middleware extracts the token from the header, verifies its signature and expiry, and either lets the request continue or returns `401 Unauthorized`.

The JWT secret is stored in an environment variable and is never hardcoded in the source code.

## Rate limiting

Implemented with `express-rate-limit`:

| Scope | Limit |
|---|---|
| General API | 100 requests per 15 minutes per IP |
| Login endpoint | 5 requests per 15 minutes per IP |

When a limit is exceeded, the API returns `429 Too Many Requests`.

## OAuth 2.0

> TODO: complete or remove this section depending on what you implemented. Describe the provider used (for example Google), the flow (Authorization Code with PKCE), and how the backend verifies the access token on protected endpoints.

## Installation and setup

### Prerequisites

- Node.js (LTS version)
- MongoDB Community Server running locally (or a MongoDB Atlas connection string)

### 1. Install dependencies

```bash
cd ouinshop-backend
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

Contents of `.env`:

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ouinshop
JWT_SECRET=replace_with_a_long_random_secret
```

| Variable | Description |
|---|---|
| PORT | Port the server listens on |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret used to sign JWTs |

The `.env` file is excluded from Git through `.gitignore`. Never commit real credentials or secrets.

### 3. Configure MongoDB

**Local MongoDB:** make sure the MongoDB service is running (on Windows: `net start MongoDB`), then use `mongodb://127.0.0.1:27017/ouinshop` as `MONGODB_URI`. The database and collections are created automatically.

**MongoDB Atlas:** create a free cluster, add a database user, allow your IP address, copy the connection string, and put it in `MONGODB_URI`.

### 4. Seed sample products (optional)

```bash
npm run seed
```

### 5. Run the server

```bash
npm run dev     # development, with auto-restart
npm start       # production
```

The API is available at `http://localhost:3000`. To check it, open `http://localhost:3000/api/products` in a browser.

## Testing

The API was tested with Thunder Client (VS Code extension). The tests covered:

- Registering a user, and rejecting a duplicate email (409)
- Logging in with valid credentials (JWT returned) and invalid credentials (401)
- Listing, retrieving, creating, updating and deleting products
- Requests without a token and with an invalid token (401)
- Invalid product ID, non-existent product (404) and invalid product data (400)
- Rate limiting on the login endpoint (429)

A request collection is available in the `postman/` folder.

## CORS

The backend accepts requests from the React development server (for example `http://localhost:5173` with Vite), so the frontend from TD-TP 2 can consume the API in the next stage.
