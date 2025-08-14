# DiscoverHealth: A Healthcare Resource Finder

This document provides a comprehensive overview of the DiscoverHealth application, detailing its purpose, features, technology stack, and the development journey from its initial state to the final, refactored version.

## 1. Project Goal

The primary goal of this project was to refactor and enhance a full-stack healthcare resource finder. The application allows users to find, add, and review healthcare services in different regions. Key objectives included improving code quality, strengthening security, optimizing performance, and ensuring a consistent and intuitive user experience.

## 2. Technology Stack

-   **Backend**: Node.js, Express.js
-   **Database**: SQLite with `better-sqlite3`
-   **Frontend**: React (with Vite)
-   **Mapping**: Leaflet
-   **Security**: `express-session` for session management, `bcryptjs` for password hashing, `express-validator` for input validation, and `helmet` for securing HTTP headers.

---

## 3. Development Journey & Thought Process

This section outlines the step-by-step process of refactoring and improving the application, including the rationale behind key decisions.

### Phase 1: Initial Refactoring (Renaming `recommend` to `like`)

-   **Problem**: The initial codebase used the term "recommend" for liking a resource, which was inconsistent with the project requirements. The first task was to standardize this to "like" across the entire application.
-   **Process**:
    1.  **Backend**: The database schema, DAO functions (`incrementLikes`), and API routes were updated to use `likes` instead of `recommends`.
    2.  **Frontend**: The React components (`MapView.jsx`) were modified to call the new `/like` endpoint and display "Likes" instead of "Recommends."
-   **Thought Process**: This initial step was crucial for establishing a consistent domain language, which makes the code easier to understand and maintain.

### Phase 2: Securing the Application

-   **Problem**: Critical features, such as adding new resources, were not protected. Any visitor could add a resource, posing a significant security risk.
-   **Process**:
    1.  **Centralized State Management**: The user's authentication state, previously managed within the `AuthBar` component, was lifted up to the main `App.jsx` component. This created a single source of truth for the user's login status.
    2.  **Protected Routes & UI**: The centralized user state was passed down as props to child components. This allowed for conditional rendering of UI elements (e.g., showing the "Add Resource" button only to logged-in users) and protecting the `/add` route from unauthenticated access.
    3.  **Backend Middleware**: The `requireAuth` middleware was applied to the resource creation endpoint in the backend, ensuring that only authenticated users could create new resources.
-   **Thought Process**: Lifting state up is a fundamental React pattern that simplifies state management and prevents inconsistencies. By combining frontend UI restrictions with backend middleware, we created a robust security model.

### Phase 3: Enhancing the Reviews API

-   **Problem**: The reviews API had several shortcomings: it allowed users to post multiple reviews for the same resource, and the request body parameters were inconsistent.
-   **Process**:
    1.  **Duplicate Review Prevention**: A check was added to the `reviewsDao.js` to verify if a user had already reviewed a specific resource. If a duplicate was detected, the server returned a `409 Conflict` error, which was handled gracefully on the frontend.
    2.  **API Consistency**: The request body for creating a review was updated to use `resource_id` and `review` for consistency with the rest of the API.
-   **Thought Process**: A robust API should be idempotent where appropriate and have a consistent interface. These changes made the API more predictable and reliable.

### Phase 4: Optimizing Frontend Performance

-   **Problem**: The application was making a separate API call to fetch reviews for every single resource displayed on the map. This resulted in a large number of requests (an "N+1" query problem), which triggered the server's rate limiter and caused a `429 Too Many Requests` error.
-   **Process**:
    1.  **Data Embedding**: The backend was refactored to embed all reviews for a resource directly within the resource object itself. The `resourcesDao.js` was updated to use a `GROUP_CONCAT` subquery to aggregate reviews for each resource.
    2.  **Frontend Refactoring**: The `MapView.jsx` component was simplified to use this new data structure. The `useEffect` hook that fetched reviews individually was removed, and the component was updated to render the embedded reviews.
-   **Thought Process**: This was a critical performance optimization. By changing the shape of the data returned by the API, we dramatically reduced the number of HTTP requests, leading to a faster, more efficient, and more scalable application.

### Phase 5: Server & Environment Configuration

-   **Problem**: The backend and frontend development servers were both trying to run on the same port (`3000`), causing conflicts. Additionally, the backend server was prone to crashing without cleanly restarting, leading to `EADDRINUSE` (address already in use) errors.
-   **Process**:
    1.  **Port Separation**: The backend server was moved to port `3001`, while the Vite development server was configured to run on port `3000`.
    2.  **API Proxy**: Vite's proxy was configured to forward any requests to `/api` from the frontend to the backend server on port `3001`. This allows the frontend to make API calls to the same origin, avoiding CORS issues during development.
    3.  **`prestart` Script**: To solve the `EADDRINUSE` error, a `prestart` script was added to `package.json`. This script automatically finds and kills any process using port `3001` before the server starts, ensuring a clean slate for every run.
-   **Thought Process**: A clean separation of frontend and backend environments is standard practice in modern web development. The `prestart` script was a pragmatic solution to a recurring development environment issue, improving the developer experience.

---

## 4. How to Run the Application

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm

### Development Mode

This is the recommended way to run the application for development.

1.  **Start the Backend Server**:

    ```bash
    # From the project root
    npm start
    ```

2.  **Start the Frontend Dev Server**:

    ```bash
    # From the project root
    cd client
    npm run dev
    ```

3.  Open your browser and navigate to `http://localhost:3000`.

### Production Mode

To run the application as it would be deployed:

1.  **Install Dependencies**:

    ```bash
    # From the project root
    npm install
    cd client
    npm install
    ```

2.  **Build the Frontend**:

    ```bash
    # From the client directory
    npm run build
    ```

3.  **Start the Production Server**:

    ```bash
    # From the project root
    npm start
    ```

The application will be served from `http://localhost:3001`.
