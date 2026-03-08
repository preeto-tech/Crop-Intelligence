Crop Intelligence API Documentation
This document provides a comprehensive overview of the backend API for the Crop Intelligence platform.

Base URL: http://localhost:5001

🔐 Authentication
Base Path: /api/auth

1. User Signup
Endpoint: POST /signup
Description: Register a new user (Farmer or Admin).
Request Body:
json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "farmer" // Optional: 'farmer' (default) or 'admin'
}
Response (201 Created):
json
{
  "_id": "65e...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "farmer",
  "token": "eyJhbG..."
}
2. User Login
Endpoint: POST /login
Description: Authenticate an existing user.
Request Body:
json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
Response (200 OK): Same as Signup response.
🌾 Crops
Base Path: /api/crops

1. Get All Crops
Endpoint: GET /
Description: Fetch list of crops with optional filtering.
Query Parameters:
search (string): Search by name or soil type.
season (string): Filter by season (e.g., 'Kharif', 'Rabi').
Response (200 OK):
json
[
  {
    "id": 1,
    "name": "Rice",
    "nameHi": "चावल",
    "season": "Kharif",
    "soil": "Clayey, Loamy",
    "irrigation": "...",
    "fertilizer": "...",
    "pests": "...",
    "image": "🌾",
    "color": "..."
  }
]
💬 Community Forum
Base Path: /api/posts

WARNING

The current implementation uses an in-memory array. Data will be lost on server restart.

1. Get All Posts
Endpoint: GET /
Description: Retrieve all forum posts.
Response (200 OK): Array of post objects.
2. Create Post
Endpoint: POST /
Description: Create a new forum post.
Request Body:
json
{
  "title": "How to handle Rice pests?",
  "body": "I am seeing brown planthoppers...",
  "author": "Farmer John"
}
Response (200 OK): The created post object with a generated ID.
📈 Mandi Prices
Base Path: /api/mandi

1. Get Mandi Data
Endpoint: GET /
Description: Fetch district-wise mandi prices and 6-month trends.
Response (200 OK):
json
{
  "crops": ["Rice", "Wheat", ...],
  "districts": ["Pune", "Nashik", ...],
  "priceTable": { ... },
  "trends": { ... },
  "months": ["Jan", "Feb", ...]
}
🚚 Transport
Base Path: /api/transport

CAUTION

Bug Alert: The /book endpoint currently references the wrong database model (Transport instead of TransportRequest) which may cause validation errors.

1. Book Transport
Endpoint: POST /book
Description: Submit a request for crop transportation.
Request Body:
json
{
  "farmerName": "John Doe",
  "crop": "Rice",
  "quantity": "500kg",
  "pickupLocation": "Village A, Sector 4",
  "phone": "9876543210",
  "preferredDate": "2024-03-15"
}
Response (201 Created):
json
{
  "message": "Transport request created",
  "request": { ... }
}
☁️ Weather
Base Path: /api/weather

1. Get Current Weather
Endpoint: GET /
Description: Get live weather data for a specific city.
Query Parameters:
city (string, Required): Name of the city.
Response (200 OK):
json
{
  "city": "Delhi",
  "temperature": 28,
  "humidity": 45,
  "windSpeed": 5.2,
  "condition": "Clear",
  "icon": "01d"
}
🛠️ Implementation Notes & Inconsistencies
During documentation, the following technical issues were identified that should be addressed in the next development phase:

Community Module: 
routes/communityRoutes.js
 uses a local posts array instead of the 
communityController.js
 and 
Post
 Mongoose model.
Mandi Module: 
routes/mandiRoutes.js
 returns a dummy message, while the actual data resides in 
controllers/mandiController.js
.
Transport Module:
routes/transportRoutes.js
 imports models/Transport but attempts to save TransportRequest fields.
It contains duplicate POST /book route handlers.
It bypasses 
controllers/transportController.js
 which has advanced features like driver assignment and status updates.
Middleware: While 
authController.js
 generates JWT tokens, the routes currently do not enforce authentication middleware (e.g., protect or admin guards).