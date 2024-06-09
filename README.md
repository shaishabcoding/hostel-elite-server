# Hostel Elite Server

## Description

Hostel Elite is a Hostel Management system designed for university administrators to efficiently manage student meals and food reviews. This server-side application handles various functionalities such as user management, meal management, payment processing, and more.

## Admin Credentials

- **Username:** admin@gmail.com
- **Password:** Admin1#

## Live Site URL

[Hostel Elite Server Live Site](https://hostel-elite.vercel.app/)

## Features

1. **User Management**: Manage user accounts with roles and permissions.
2. **Meal Management**: Add, edit, and delete meals with details such as title, likes, reviews, and distributor.
3. **Review System**: Allow users to leave reviews for meals.
4. **Authorization**: Implement role-based access control for admin-specific functionalities.
5. **Search and Filter**: Easily search and filter meals based on various criteria such as category, price, and title.
6. **Pagination**: Implement pagination for displaying a limited number of meals at a time.
7. **Stripe Integration**: Enable secure payment processing using the Stripe API for purchasing meal packages.
8. **Token-based Authentication**: Implement token-based authentication for user authorization and access control.
9. **Admin Dashboard**: Provide an intuitive dashboard interface for admins to monitor and manage meals, users, and payments.
10. **Responsive Design**: Ensure compatibility across devices with a responsive user interface.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/programming-hero-web-course1/b9a12-server-side-shaishabcoding.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables: Create a `.env` file and define the following variables:

```
PORT=5000
DB_USER=your-db-user
DB_PASS=your-db-password
STRIPE_SK_KEY=your-stripe-secret-key
ACCESS_TOKEN_SECRET=your-access-token-secret
```

4. Start the server:

```bash
npm run dev
```

## API Documentation

### Authentication

- **POST /jwt**: Generates a JSON Web Token (JWT) for authentication.

### User Management

- **POST /users**: Create a new user account.
- **GET /users**: Retrieve a list of users.
- **GET /users/suggestions**: Retrieve user suggestions based on search query.
- **GET /users/profile**: Retrieve user profile information.
- **GET /users/admin**: Check if a user is an admin.
- **GET /users/reviews**: Retrieve reviews submitted by a user.
- **PUT /users/admin/:email**: Promote a user to admin status.

### Meal Management

- **POST /meals**: Create a new meal.
- **POST /meals/upcoming**: Add a meal to upcoming meals list.
- **GET /meals**: Retrieve a list of meals.
- **GET /meals/admin**: Retrieve a list of meals for admin view.
- **GET /meals/upcoming**: Retrieve a list of upcoming meals.
- **GET /meals/category/:category**: Retrieve meals by category.
- **GET /meals/:id**: Retrieve a meal by ID.
- **GET /meals/upcoming/:id**: Retrieve an upcoming meal by ID.
- **PUT /meals/:id**: Update a meal.
- **PUT /meals/:id/like**: Like a meal.
- **PUT /meals/upcoming/:id/like**: Like an upcoming meal.
- **PUT /meals/:id/review**: Add or update a review for a meal.
- **PUT /meals/serve/:id**: Mark a requested meal as delivered.
- **DELETE /meals/:id**: Delete a meal.
- **DELETE /meals/upcoming/:id**: Delete an upcoming meal.
- **DELETE /meals/request/:id**: Delete a meal request.

### Payment

- **GET /payment/history**: Retrieve payment history for a user.
- **POST /create-payment-intent**: Create a payment intent for Stripe integration.
- **POST /payments**: Record a payment transaction.

## Dependencies

- `cors`: ^2.8.5,
- `dotenv`: ^16.4.5,
- `express`: ^4.19.2,
- `jsonwebtoken`: ^9.0.2,
- `mongodb`: ^6.7.0,
- `stripe`: ^15.9.0

## License

[MIT](LICENSE)

---

Feel free to customize it further to fit your project's specific details and requirements!
