# Yummi

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-20.0.0-635BFF?logo=stripe)](https://stripe.com/)

A food delivery and restaurant management backend API built with NestJS. This application provides authentication, restaurant management, menu item management, and order processing with Stripe payment integration.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Special Instructions](#special-instructions)
- [Third-Party Libraries](#third-party-libraries)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

## Features

### Authentication

- User registration and login
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- Token refresh mechanism

### Restaurant Management

- Create, read, update, and delete restaurants
- Search restaurants by city and name
- Sort restaurants by name, delivery price, estimated delivery time, or last updated
- Pagination support for restaurant listings
- View your own restaurants

### Menu Management

- Add, update, and delete menu items for restaurants
- Restaurant owners can manage their menu items

### Order Management

- Create orders with multiple items
- Stripe payment integration for checkout
- Webhook handling for payment confirmation
- View your order history
- Order status tracking (Placed, Paid, In Progress, Out for Delivery, Delivered)

### Security Features

- Rate limiting/throttling to prevent abuse
- Input validation using class-validator
- JWT token-based authorization
- Protected routes with authentication guards

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher recommended)
- npm or yarn
- PostgreSQL database (v12 or higher)
- Stripe account (for payment processing)

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd yummi

# Install dependencies
npm install

# Create environment file
cp .env.example .env.development
# Edit .env.development with your configuration

# Create database
createdb yummi_db

# Generate JWT secrets (run twice for access and refresh tokens)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run the application
npm run start:dev
```

The application will be available at `http://localhost:3000`

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd yummi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create environment files based on your environment (development, production, etc.):

```bash
# For development
cp .env.example .env.development
```

Configure the following environment variables in your `.env.development` (or `.env.production`) file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=yummi_db

# JWT Configuration
JWT_ACCESS_SECRET=your_access_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_jwt_secret_key

# Stripe Configuration
STRIPE_API_KEY=your_stripe_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Frontend Configuration
FRONTEND_URI=http://localhost:3001

# Rate Limiting Configuration
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

**Important Notes:**

- Use strong, random strings for JWT secrets (at least 32 characters)
- Generate secure secrets using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Get your Stripe API keys from the [Stripe Dashboard](https://dashboard.stripe.com/)
- Set up your Stripe webhook endpoint to point to `https://your-domain.com/order/checkout/webhook`
- Adjust `THROTTLE_TTL` (time window in milliseconds) and `THROTTLE_LIMIT` (max requests per window) as needed

### 4. Database Setup

Make sure PostgreSQL is running and create a database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE yummi_db;

# Exit psql
\q
```

### 5. Run the Application

```bash
# Development mode (with hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The application will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Environment Variables

| Variable                | Description                   | Required | Default | Example                     |
| ----------------------- | ----------------------------- | -------- | ------- | --------------------------- |
| `PORT`                  | Server port number            | No       | 3000    | `3000`                      |
| `NODE_ENV`              | Environment mode              | Yes      | -       | `development`, `production` |
| `DB_HOST`               | PostgreSQL host address       | Yes      | -       | `localhost`                 |
| `DB_PORT`               | PostgreSQL port number        | Yes      | -       | `5432`                      |
| `DB_USERNAME`           | Database username             | Yes      | -       | `postgres`                  |
| `DB_PASSWORD`           | Database password             | Yes      | -       | `your_password`             |
| `DB_DATABASE`           | Database name                 | Yes      | -       | `yummi_db`                  |
| `JWT_ACCESS_SECRET`     | Secret key for access tokens  | Yes      | -       | Generated hex string        |
| `JWT_REFRESH_SECRET`    | Secret key for refresh tokens | Yes      | -       | Generated hex string        |
| `STRIPE_API_KEY`        | Stripe API secret key         | Yes      | -       | `sk_test_...`               |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes      | -       | `whsec_...`                 |
| `FRONTEND_URI`          | Frontend application URL      | Yes      | -       | `http://localhost:3001`     |
| `THROTTLE_TTL`          | Rate limit time window (ms)   | No       | 60000   | `60000`                     |
| `THROTTLE_LIMIT`        | Max requests per time window  | No       | 10      | `10`                        |

## API Documentation

### Authentication Endpoints

#### Register User

**Endpoint:** `POST /auth/signUp`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "addressLine": "123 Main Street",
  "city": "New York",
  "country": "USA"
}
```

**Response:** `201 Created`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "addressLine": "123 Main Street",
    "city": "New York",
    "country": "USA"
  }
}
```

#### Login

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Headers:**

```
Authorization: Bearer <refresh_token>
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Restaurant Endpoints

#### Get All Restaurants

**Endpoint:** `GET /restaurant`

**Query Parameters:**

- `city` (optional): Filter by city
- `searchQuery` (optional): Search by restaurant name
- `sortOption` (optional): Sort by `name`, `deliveryPrice`, `estimatedDeliveryTime`, or `updatedAt`
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Example:** `GET /restaurant?city=New York&sortOption=deliveryPrice&page=1&limit=10`

**Response:** `200 OK`

```json
{
  "restaurants": [
    {
      "id": 1,
      "restaurantName": "Pizza Palace",
      "city": "New York",
      "country": "USA",
      "deliveryPrice": 5.99,
      "estimatedDeliveryTime": 30,
      "imageUrl": "https://example.com/image.jpg",
      "menu": [
        {
          "id": 1,
          "name": "Margherita Pizza",
          "price": 12.99
        }
      ],
      "owner": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### Create Restaurant

**Endpoint:** `POST /restaurant`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "restaurantName": "Pizza Palace",
  "city": "New York",
  "country": "USA",
  "deliveryPrice": 5.99,
  "estimatedDeliveryTime": 30,
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "restaurantName": "Pizza Palace",
  "city": "New York",
  "country": "USA",
  "deliveryPrice": 5.99,
  "estimatedDeliveryTime": 30,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Get Restaurant by ID

**Endpoint:** `GET /restaurant/:id`

**Response:** `200 OK`

```json
{
  "id": 1,
  "restaurantName": "Pizza Palace",
  "city": "New York",
  "country": "USA",
  "deliveryPrice": 5.99,
  "estimatedDeliveryTime": 30,
  "imageUrl": "https://example.com/image.jpg",
  "menu": [...],
  "owner": {...}
}
```

### Menu Item Endpoints

#### Add Menu Item

**Endpoint:** `POST /restaurant/menu/:restaurantID`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Margherita Pizza",
  "price": 12.99
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "name": "Margherita Pizza",
  "price": 12.99,
  "restaurant": {
    "id": 1,
    "restaurantName": "Pizza Palace"
  }
}
```

### Order Endpoints

#### Create Checkout Session

**Endpoint:** `POST /order/create-checkout-session`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "restaurantId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2
    },
    {
      "menuItemId": 3,
      "quantity": 1
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

#### Get User Orders

**Endpoint:** `GET /order`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "restaurant": {
      "id": 1,
      "restaurantName": "Pizza Palace"
    },
    "items": [
      {
        "id": 1,
        "menuItem": {
          "id": 1,
          "name": "Margherita Pizza",
          "price": 12.99
        },
        "quantity": 2
      }
    ],
    "totalAmount": 25.98,
    "status": "paid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### User Endpoints

#### Get Current User Profile

**Endpoint:** `GET /users/me`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "addressLine": "123 Main Street",
  "city": "New York",
  "country": "USA"
}
```

#### Update User Profile

**Endpoint:** `PATCH /users/update-profile`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:** (all fields optional)

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "addressLine": "456 Oak Avenue",
  "city": "Los Angeles"
}
```

### Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 4 characters"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**404 Not Found:**

```json
{
  "statusCode": 404,
  "message": "Restaurant not found"
}
```

**429 Too Many Requests:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Project Structure

```
yummi/
├── src/                          # Source code directory
│   ├── auth/                     # Authentication module
│   │   ├── dto/                  # Data Transfer Objects
│   │   │   └── login.dto.ts      # Login request DTO
│   │   ├── entities/             # Database entities
│   │   │   └── auth.entity.ts    # Auth entity (placeholder)
│   │   ├── guards/               # Authentication guards
│   │   │   └── auth.guard.ts     # Refresh token guard
│   │   ├── auth.controller.ts    # Auth endpoints (signup, login, refresh)
│   │   ├── auth.service.ts       # Auth business logic
│   │   └── auth.module.ts        # Auth module configuration
│   │
│   ├── user/                     # User management module
│   │   ├── decorators/           # Custom decorators
│   │   │   └── current-user.decorator.ts  # Extract user from request
│   │   ├── dto/                  # User DTOs
│   │   │   ├── create-user.dto.ts    # User registration DTO
│   │   │   └── update-user.dto.ts    # User update DTO
│   │   ├── entities/             # Database entities
│   │   │   └── user.entity.ts    # User entity with relationships
│   │   ├── guards/               # Authorization guards
│   │   │   └── authUser.guard.ts # Access token guard
│   │   ├── user.controller.ts    # User endpoints (CRUD, profile)
│   │   ├── user.service.ts       # User business logic
│   │   └── user.module.ts        # User module configuration
│   │
│   ├── restaurant/               # Restaurant management module
│   │   ├── dto/                  # Restaurant DTOs
│   │   │   ├── create-restaurant.dto.ts    # Create restaurant DTO
│   │   │   ├── update-restaurant.dto.ts    # Update restaurant DTO
│   │   │   ├── create-menuItem.dto.ts      # Create menu item DTO
│   │   │   └── update-menuItem.dto.ts      # Update menu item DTO
│   │   ├── entities/             # Database entities
│   │   │   ├── restaurant.entity.ts   # Restaurant entity
│   │   │   └── menuItem.entity.ts     # Menu item entity
│   │   ├── restaurant.controller.ts   # Restaurant endpoints
│   │   ├── restaurant.service.ts      # Restaurant business logic
│   │   └── restaurant.module.ts       # Restaurant module configuration
│   │
│   ├── order/                    # Order processing module
│   │   ├── dto/                  # Order DTOs
│   │   │   └── create-order.dto.ts    # Create order DTO
│   │   ├── entities/             # Database entities
│   │   │   ├── order.entity.ts        # Order entity
│   │   │   └── orderItem.entity.ts    # Order item entity
│   │   ├── order.controller.ts       # Order endpoints (checkout, webhook)
│   │   ├── order.service.ts          # Order business logic & Stripe integration
│   │   └── order.module.ts           # Order module configuration
│   │
│   ├── jwt/                      # JWT configuration modules
│   │   ├── access/               # Access token configuration
│   │   │   └── access-jwt.module.ts
│   │   └── refresh/              # Refresh token configuration
│   │       └── refresh-jwt.module.ts
│   │
│   ├── utils/                    # Utility functions and constants
│   │   ├── constants.ts          # Application constants (JWT tokens)
│   │   └── types.ts              # TypeScript types and enums (OrderStatus, JWTPayloadType)
│   │
│   ├── app.controller.ts         # Root controller
│   ├── app.service.ts            # Root service
│   ├── app.module.ts             # Root module (app configuration)
│   └── main.ts                   # Application entry point (bootstrap)
│
├── test/                         # End-to-end tests
│   ├── app.e2e-spec.ts          # E2E test suite
│   └── jest-e2e.json            # E2E Jest configuration
│
├── dist/                         # Compiled JavaScript output
├── node_modules/                # Dependencies
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tsconfig.build.json          # TypeScript build configuration
├── nest-cli.json                # NestJS CLI configuration
├── eslint.config.mjs            # ESLint configuration
└── README.md                    # This file
```

### Module Responsibilities

- **Auth Module**: Handles user registration, login, and token refresh. Uses bcrypt for password hashing and JWT for token generation.
- **User Module**: Manages user profiles, CRUD operations, and provides authentication guards for protected routes.
- **Restaurant Module**: Handles restaurant and menu item management. Supports search, filtering, sorting, and pagination.
- **Order Module**: Processes orders, integrates with Stripe for payments, and handles webhook events for payment confirmation.
- **JWT Modules**: Configure separate JWT modules for access tokens (15min expiry) and refresh tokens (longer expiry).

## Database Schema

### Entity Relationships

```
User (users)
├── One-to-Many → Restaurant (restaurants)
└── One-to-Many → Order (orders)

Restaurant (restaurants)
├── Many-to-One → User (owner)
├── One-to-Many → MenuItem (menuItems)
└── One-to-Many → Order (orders)

MenuItem (menuItems)
└── Many-to-One → Restaurant

Order (orders)
├── Many-to-One → Restaurant
├── Many-to-One → User
└── One-to-Many → OrderItem (orderItems)

OrderItem (orderItems)
├── Many-to-One → Order
└── Many-to-One → MenuItem
```

### Entity Details

**User Entity:**

- `id` (Primary Key)
- `firstName`, `lastName`, `email` (unique)
- `password` (hashed with bcrypt)
- `addressLine`, `city`, `country`
- `createdAt`, `updatedAt` (timestamps)

**Restaurant Entity:**

- `id` (Primary Key)
- `restaurantName`, `city`, `country`
- `deliveryPrice`, `estimatedDeliveryTime`
- `imageUrl` (nullable)
- `owner` (Foreign Key → User)
- `createdAt`, `updatedAt` (timestamps)

**MenuItem Entity:**

- `id` (Primary Key)
- `name`, `price`
- `restaurant` (Foreign Key → Restaurant)

**Order Entity:**

- `id` (Primary Key)
- `restaurant` (Foreign Key → Restaurant)
- `user` (Foreign Key → User)
- `totalAmount` (decimal)
- `status` (enum: placed, paid, inProgress, outForDelivery, delivered)
- `createdAt`, `updatedAt` (timestamps)

**OrderItem Entity:**

- `id` (Primary Key)
- `order` (Foreign Key → Order, CASCADE delete)
- `menuItem` (Foreign Key → MenuItem)
- `quantity`

## Special Instructions

### Authentication

- Include the access token in the `Authorization` header: `Bearer <access_token>`
- Access tokens expire in 15 minutes
- Use the refresh token endpoint to get a new access token
- Refresh tokens are used for the refresh endpoint only
- Passwords must be at least 4 characters long

### Stripe Webhook

- The webhook endpoint requires the raw request body for signature verification
- Configure your Stripe webhook URL to: `https://your-domain.com/order/checkout/webhook`
- Use the webhook secret from your Stripe dashboard in the `STRIPE_WEBHOOK_SECRET` environment variable
- The webhook endpoint is configured to accept raw body for Stripe signature verification
- Test webhooks locally using Stripe CLI: `stripe listen --forward-to localhost:3000/order/checkout/webhook`

### Rate Limiting

- The API has rate limiting enabled to prevent abuse
- Default: 10 requests per 60 seconds (configurable via environment variables)
- Rate limit headers are included in responses
- When rate limit is exceeded, a `429 Too Many Requests` error is returned

### Order Status Flow

Orders progress through the following statuses:

1. **placed** - Order created, payment pending
2. **paid** - Payment confirmed via Stripe webhook
3. **inProgress** - Restaurant preparing order
4. **outForDelivery** - Order is being delivered
5. **delivered** - Order completed

## Third-Party Libraries

### Core Framework

- **@nestjs/common, @nestjs/core** - Core NestJS framework for building scalable Node.js applications with dependency injection, decorators, and modular architecture
- **@nestjs/platform-express** - Express platform adapter for NestJS, enabling Express.js middleware and routing

### Database & ORM

- **@nestjs/typeorm** - TypeORM integration module for NestJS, providing database connection and repository injection
- **typeorm** - TypeScript ORM for database operations, supporting PostgreSQL, MySQL, SQLite, and more
- **pg** - PostgreSQL client library for Node.js, used by TypeORM for database connections

### Authentication & Security

- **@nestjs/jwt** - JWT module for NestJS, handling token generation and verification
- **bcrypt** - Password hashing library for secure password storage using bcrypt algorithm
- **@nestjs/throttler** - Rate limiting/throttling module to prevent API abuse and DDoS attacks

### Validation & Transformation

- **class-validator** - Decorator-based validation library for DTOs, ensuring data integrity
- **class-transformer** - Transform plain objects to class instances and vice versa, enabling DTO validation
- **@nestjs/mapped-types** - Utility types for creating DTOs from existing entities (PartialType, PickType, etc.)

### Payment Processing

- **stripe** - Official Stripe SDK for payment processing, checkout session creation, and webhook handling

### Configuration

- **@nestjs/config** - Configuration module for managing environment variables and application settings

### Utilities

- **rxjs** - Reactive programming library used by NestJS for handling asynchronous operations and observables
- **reflect-metadata** - Metadata reflection API required for TypeScript decorators and dependency injection
