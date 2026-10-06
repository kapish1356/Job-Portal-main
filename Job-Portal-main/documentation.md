# Project Documentation: Job Finding & Hiring Platform

## 1. Understanding the Project
The "Job Finding & Hiring Platform" is a full-stack web application designed to bridge the gap between job seekers and local businesses. Unlike traditional job portals that list text-based ads, this platform emphasizes visual location-based discovery. It simulates a "Google Maps" interface where users can see businesses hiring near them, filter by distance and salary, and apply immediately. This project was developed to provide a seamless, interactive experience for finding employment opportunities.

## 2. Problem Statement
Job seekers often struggle to find opportunities within their immediate vicinity. Traditional job boards can be cluttered, and filtering by specific hyper-local criteria is often difficult. Furthermore, small local businesses may not have the budget for expensive recruitment platforms. There is a need for a simplified, map-centric platform where location is the primary discovery mechanism.

## 3. Project Objectives
-   **Visual Discovery**: Enable users to find jobs using an interactive map interface.
-   **Simplified Application**: reduce the friction of applying to jobs.
-   **Business Management**: Provide admins (business owners) with a simple dashboard to manage their presence and view applicants.
-   **Accessibility**: Ensure the main search and discovery features are public and easy to use.

## 4. Project Scope
-   **Job Seekers**: Can search jobs, view map locations, filter by type/distance/salary, and apply to positions (requiring a profile).
-   **Admins (Recruiters)**: Can log in securely (OTP), add their business details (including location), post jobs, and view applications.
-   **System**: Handles authentication, data persistence, and simulated geo-spatial logic.

## 5. User Personas
1.  **The Job Seeker (User)**: Looking for employment nearby to minimize commute time. Wants a quick visual way to see who is hiring.
2.  **The Business Owner (Admin)**: A local business owner (e.g., Hotel, Sales Office) who needs staff. Wants a free or simple way to list their shop on a map and receive applications.

## 6. Functional Requirements
-   **Search & Filter**: Users must be able to search by keyword/location and filter by Job Type, Distance, and Salary Range.
-   **Map Integration**: The system must verify visual markers for businesses.
-   **Authentication**: Secure Email/Password login for Users; OTP-based login for Admins.
-   **Application System**: Users can submit profiles to specific businesses; Admins can view these submissions.
-   **Messaging**: A basic inbox system for communication.

## 7. Non-Functional Requirements
-   **Performance**: The map and list should load quickly (simulated via efficient React state).
-   **Responsiveness**: The UI must adapt to Full Screen (Laptop/Search) layout.
-   **Usability**: High contrast visibility for forms and navigation.
-   **Security**: Passwords must be hashed (bcrypt); Routes protected by JWT.

## 8. System Design
The system follows a **MVC (Model-View-Controller)** pattern on the backend and a **Component-Based Architecture** on the frontend.
-   **Frontend**: React.js handles the View layer, managing state and API calls.
-   **Backend**: Node.js/Express acts as the Controller, processing requests and routing them.
-   **Database**: MongoDB acts as the Model, storing structured data.

## 9. Technology Stack
-   **Frontend**: React.js, Vite, Axios, React Router DOM, Leaflet (Map), CSS3.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB, Mongoose ODM.
-   **Authentication**: JSON Web Tokens (JWT), Bcryptjs.
-   **Tools**: Postman (Testing), Git (Version Control).

## 10. Database Design
The schema consists of heavily relational data stored in a NoSQL format (Mongoose Refs):
-   **Users**: Stores applicant profiles.
-   **Admins**: Stores recruiter credentials/OTP.
-   **Businesses**: Linked to Admin. Contains Lat/Lng and Address.
-   **Jobs**: Linked to Business.
-   **Applications**: Links User -> Job.

## 11. UI Overview
-   **Home Page**: Full-width layout featuring a Hero section, Search/Filter bar, Interactive Leaflet Map, and a Grid of "Top Hiring Businesses".
-   **Navbar**: Dynamic links based on login Role (Admin/User/Guest). Active state highlighting.
-   **Dashboards**: Tabbed interfaces for managing data (My Profile, Inbox, My Businesses).

## 12. Security Considerations
-   **Token-Based Auth**: Stateless JWTs prevent session hijacking risks.
-   **Password Hashing**: User passwords are never stored in plain text.
-   **Environment Variables**: Secrets and DB URIs are stored in `.env` (not committed).
-   **CORS**: Configured to allow frontend-backend communication securely.

## 13. Testing Strategy
-   **Manual Testing**: Verifying all user flows (Login -> Apply -> Admin Check).
-   **Visual Verification**: Checking responsiveness and Map marker accuracy.
-   **API Testing**: Ensuring backend endpoints return correct JSON structures.
-   **Future Scope**: Unit tests with Jest/React Testing Library.

## 14. Conclusion
The "Job Finding & Hiring Platform" successfully demonstrates a modern approach to recruitment. By leveraging the MERN stack and integrating map capabilities, it provides a unique value proposition for local hiring. The project is scalable and lays a solid foundation for future features like real-time chat or payment integration.
