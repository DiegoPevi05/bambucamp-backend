<p align="center">
  <a href="https://bambucamp.com" target="_blank">
    <img src="https://github.com/DiegoPevi05/bambucamp-backend/blob/main/public/logo.png" width="150">
  </a>
</p>

# BAMBUCAMP Reservation System

<p align="center">
  <!-- Example badges -->
  <a href="https://github.com/DiegoPevi05/bambucamp-backend/releases">
    <img src="https://img.shields.io/github/v/release/DiegoPevi05/bambucamp-backend" alt="Version">
  </a>
  <a href="https://github.com/DiegoPevi05/bambucamp-backend">
    <img src="https://img.shields.io/github/languages/top/DiegoPevi05/bambucamp-backend" alt="Top Language">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  </a>
</p>


This is a full-featured reservation system built with Express.js and TypeScript. It serves as a sales point for making reservations and managing various entities such as products, experiences, discount codes, promotions, and glamping tents (referred to as `tents`). The application also includes authentication and authorization services for secure access to its features.

## Links

- **Client Webpage**: [http://your-client-hostname](http://your-client-hostname)
- **Admin Webpage**: [http://your-admin-hostname](http://your-admin-hostname)
- **Author**: [DigitalProcessIT](https://digitalprocessit.com/es/)
- **Contact**: [DigitalProcessIT Contact](https://digitalprocessit.com/es/contacto)

## Features

- **Authentication**: Secure login and registration.
- **Reservations**: Create, update, delete, and manage reservations for tents, products, and experiences.
- **Products Management**: Add, edit, delete, and list products available for reservation.
- **Experiences Management**: Manage experiences tied to reservations.
- **Discount Codes & Promotions**: Create and apply discount codes and promotions.
- **Tents (Glamping)**: Manage glamping tents available for reservation.
- **Notification System**: Admins and users can receive notifications related to their activities.

## Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (version 18.x or later)
- **npm** (Node package manager)
- **TypeScript** (`npm install -g typescript`)
- **PostgreSQL** (or any supported database for Prisma)

## Installation on Linux

1. **Clone the Repository**:

   ```bash
    git clone https://github.com/DiegoPevi05/bambucamp-backend.git
    cd bambucamp-backend
   ```

2. **Install Node.js & npm (if not already installed):**

    On Ubuntu/Debian-based systems:
   ```bash
    sudo apt update
    sudo apt install nodejs npm
   ```

3. **Install PostgreSQL:**

   ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib
   ```

4. **Install Dependencies:**

    Install the necessary Node.js packages:
   ```bash
    npm install
   ```

5. **Setup Prisma:**

    Generate the Prisma client and migrate the database:
   ```bash
    npx prisma generate
    npx prisma migrate dev
   ```

5. **Environment Variables:**

    Create a .env file in the root directory and configure it with your database and environment variables. Here is an example:

   ```bash
    DATABASE_URL="postgresql://user:password@localhost:5432/bambucamp_db"
    ADMIN_HOSTNAME="http://your-admin-hostname"
    CLIENT_HOSTNAME="http://your-client-hostname"
    ```

6. **Create Folder of Images:**

    Create a folder at public folder named images, in order that the models have a place where the images are stored:

   ```bash
   cd public mkdir images
    ```
7. **Run the Application:**

    Start the development server using ts-node-dev:

   ```bash
    npm run dev
    ```

## Running Migrations

To keep your database schema up-to-date with your Prisma schema, you need to run migrations whenever you make changes to your models.

   ```bash
    npx prisma migrate dev
   ```

## Technologies Used

- **Node.js**: Backend server.
- **Express.js**: Web framework.
- **TypeScript**: Type safety and modern JavaScript features.
- **Prisma**: ORM for database interactions.
- **i18next**: Internationalization support.
- **bcryptjs**: Password hashing.
- **jsonwebtoken**: Token-based authentication.
- **Multer**: File upload handling (used for uploading images).
- **Nodemailer**: Email sending service.
- **CORS**: Handling Cross-Origin Resource Sharing for secure communication between the client and server.
  
## API Routes

The application is structured into different routes to manage various resources:

- **/users**: User management.
- **/auth**: Authentication (login, registration).
- **/categories**: Manage product or experience categories.
- **/experiences**: Manage experiences.
- **/products**: Manage products.
- **/discounts**: Manage discount codes.
- **/promotions**: Manage promotions.
- **/tents**: Manage glamping tents.
- **/reserves**: Manage reservations.
- **/notifications**: Notification system.
- **/chats**: Chat functionality (if retained in the future).

## Project Structure

```bash
src/
├── config/         # Configuration files (e.g., i18n)
├── routes/         # API route handlers
├── services/       # Business logic for various features
├── controllers/    # Controller logic for handling requests
├── middlewares/    # Custom middleware (e.g., authentication, validation)
├── prisma/         # Prisma ORM setup and schemas
└── server.ts       # Entry point of the application
```

## Notes

- The application will serve static files (like images) from the `public/images` directory.
- The app uses i18next for internationalization. Translation files are located in `src/locales/`.
- Make sure your environment variables are set correctly for connecting to the database and specifying client origins for CORS.



## License

This project is licensed under the ISC License.
