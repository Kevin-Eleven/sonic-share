# Sonic Share

Sonic Share is a real-time file and text sharing application that allows users to instantly share content with others through unique, shareable links. It uses a combination of Next.js for the frontend and a custom Node.js server with Socket.IO for real-time communication.

## Features

- **Real-time Sharing**: Share files and text snippets instantly with anyone.
- **Unique Shareable Links**: Each sharing session has a unique URL.
- **Instant Updates**: Leverages Socket.IO for bidirectional and low-latency communication.
- **Persistent Storage**: Uses MongoDB to store file and text metadata.
- **Modern Tech Stack**: Built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Real-time Communication**: [Socket.IO](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend Runtime**: [Node.js](https://nodejs.org/)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A [MongoDB](https://www.mongodb.com/try/download/community) instance (local or a cloud-based service like MongoDB Atlas)

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sonic-share.git
cd sonic-share
```

### 2. Install Dependencies

Install the necessary packages using npm:

```bash
npm install
```

### 3. Set Up Environment Variables

The project requires a MongoDB connection string. Create a `.env.local` file in the root of the project and add your connection string:

```
MONGODB_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with the actual URI of your MongoDB database.

### 4. Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This command starts the custom Node.js server with `nodemon`, which will watch for changes in `server.ts` and automatically restart. The Next.js application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

Here is an overview of the key directories and files in the project:

- **`/app`**: Contains the core Next.js application, including pages and API routes.
- **`/components`**: Reusable React components.
- **`/lib`**: Helper functions and utilities, including the database connection logic.
- **`/models`**: Mongoose schemas for the MongoDB database.
- **`/public`**: Static assets like images and icons.
- **`/server.ts`**: The custom Node.js server that handles Socket.IO connections.
- **`package.json`**: Lists the project dependencies and scripts.

## How to Contribute

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1.  **Fork the Repository**: Create a fork of the repository to your own GitHub account.
2.  **Create a New Branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Make Your Changes**: Implement your feature or bug fix.
4.  **Commit Your Changes**:
    ```bash
    git commit -m "feat: Add your commit message"
    ```
5.  **Push to Your Branch**:
    ```bash
    git push origin feature/your-feature-name
    ```
6.  **Create a Pull Request**: Open a pull request from your forked repository to the main repository.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
