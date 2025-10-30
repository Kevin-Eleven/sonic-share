# Project Overview

This is a Next.js application that allows users to share files and text in real-time. It uses a custom server with Socket.IO to enable real-time communication between clients. The application uses MongoDB for storing information about the uploaded files and text.

## Main Technologies

*   **Framework**: [Next.js](https://nextjs.org/)
*   **Real-time Communication**: [Socket.IO](https://socket.io/)
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
*   **File Uploads**: [Multer](https://github.com/expressjs/multer)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Lucide React](https://lucide.dev/guide/packages/lucide-react) for icons and [react-hot-toast](https://react-hot-toast.com/) for notifications.

## Architecture

The application is divided into a client-side and a server-side.

*   **Client-side**: The client-side is a Next.js application that uses React components to render the UI. The main component is `UploadForm.tsx`, which handles file and text uploads. It uses `socket.io-client` to communicate with the server in real-time.
*   **Server-side**: The server-side is a custom Express server that is integrated with Next.js. It uses Socket.IO to handle real-time communication with the clients. It also has an API endpoint for handling file uploads.

# Building and Running

To build and run the project, you need to have Node.js and npm installed.

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Set up environment variables**:
    Create a `.env.local` file in the root of the project and add the following environment variable:
    ```
    MONGODB_URI=<your-mongodb-connection-string>
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    This will start the development server at `http://localhost:3000`.

4.  **Build for production**:
    ```bash
    npm run build
    ```
5.  **Start the production server**:
    ```bash
    npm run start
    ```

# Development Conventions

*   **Coding Style**: The project uses the default Next.js coding style. It also uses ESLint to enforce a consistent coding style.
*   **Testing**: There are no tests in the project.
*   **Contribution Guidelines**: There are no contribution guidelines in the project.
