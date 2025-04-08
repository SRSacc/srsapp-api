# srsapp-api

A robust RESTful API for the SRS application, built with Express.js and modern JavaScript.

## Overview

srsapp-api provides a secure and scalable backend service for the SRS application. It handles authentication, data validation, and resource management with a focus on performance and security.

## Features

- **Secure Authentication**: JWT-based authentication system
- **Data Validation**: Request validation using express-validator
- **Rate Limiting**: Protection against abuse with express-rate-limit
- **Security**: Implemented with helmet for HTTP security headers
- **Cloud Storage**: Image and file uploads with Cloudinary integration
- **API Documentation**: Comprehensive API documentation with Swagger

## Documentation

The API is fully documented using Swagger:

[API Documentation](https://srsapp-api.onrender.com/api/docs)

## Technologies

- Node.js
- Express.js
- MongoDB (based on dependencies)
- JWT Authentication
- Cloudinary
- Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js (v16.x or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with required environment variables
4. Start the development server: `npm run dev`

## API Endpoints

For detailed endpoint documentation, please refer to the [API Documentation](https://srsapp-api.onrender.com/api/docs).

## Deployment

This API is deployed on [Render](https://render.com) and can be accessed at:
[srsapp-api.onrender.com](https://srsapp-api.onrender.com)

## License

This project is licensed under the ISC License.
