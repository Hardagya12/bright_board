# Deployed Link:
https://brightboard-seven.vercel.app/
# Bright Board

## System Overview

Bright Board is a comprehensive Educational Technology (EdTech) management platform designed to streamline administrative workflows and enhance the student learning experience. The system is split into a robust Node.js backend API and a high-performance React.js frontend application.

## High-Level Architecture

The architecture follows a standard client-server model with a clear separation of concerns between the presentation layer and the data processing layer.

```mermaid
graph TD
    subgraph Client Layer
        A[Administrator Portal] --> C[React SPA]
        B[Student Portal] --> C
    end

    subgraph API Gateway
        C -- HTTP/REST --> D[Node.js Express Server]
    end

    subgraph Services Layer
        D --> E[Authentication Service]
        D --> F[Student Management Service]
        D --> G[Exam Engine Service]
        D --> H[Analytics Service]
    end

    subgraph Data Layer
        E --> I[(MongoDB Database)]
        F --> I
        G --> I
        H --> I
    end
```

## User Access and Authentication Workflow

The system implements Role-Based Access Control (RBAC) to differentiate capabilities between administrative personnel and enrolled students.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthAPI
    participant Database

    User->>Frontend: Submit credentials
    Frontend->>AuthAPI: POST /login
    AuthAPI->>Database: Verify credentials
    Database-->>AuthAPI: Return verification status
    
    alt is Valid
        AuthAPI-->>Frontend: Return JWT Token & User Context
        Frontend->>User: Redirect to Role Dashboard
    else is Invalid
        AuthAPI-->>Frontend: 401 Unauthorized
        Frontend->>User: Display Error Message
    end
```

## Directory Structure

```mermaid
graph LR
    A[Bright Board Root] --> B[Frontend Application]
    A --> C[Backend Service]
    
    B --> D[src]
    B --> E[dist]
    
    C --> F[routes]
    C --> G[middleware]
    C --> H[uploads]
```

## Deployment Guidelines

The project is configured for split deployment:
1. **Frontend**: Optimized for static hosting environments via Vite build output.
2. **Backend**: Optimized for Node.js containerized or serverless hosting environments.

For detailed instructions, refer to the individual module documentation:
- [Frontend Documentation](bright_board/Frontend/bright_board/README.md)
- [Backend Documentation](bright_board/Backend/README.md)
