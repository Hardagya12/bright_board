# Bright Board Backend API Service

## Technical Stack

The backend service is a RESTful API built to handle data persistence, business logic, and system security.

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Native Driver)
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Helmet, Express Rate Limit, Cors

## Core Architecture

The backend implements a standard layered architecture pattern.

```mermaid
graph TD
    A[Incoming HTTPS Request] --> B[Security Middleware]
    B --> C[Rate Limiter]
    C --> D[Express Router]
    
    D --> E[Authentication Router]
    D --> F[Admin Resources Router]
    D --> G[Student Data Router]
    
    E --> H[Business Logic Controllers]
    F --> H
    G --> H
    
    H --> I[MongoDB Driver]
    I --> J[(MongoDB Cluster)]
```

## Database Schema Model

The data layer is structured to support multi-tenant relationships between the institute, students, and academic entities.

```mermaid
erDiagram
    INSTITUTE ||--o{ STUDENT : enrolls
    INSTITUTE ||--o{ BATCH : creates
    INSTITUTE ||--o{ EXAM : manages
    BATCH ||--o{ STUDENT : contains
    EXAM ||--o{ QUESTION : includes
    STUDENT ||--o{ ATTENDANCE : logs
    STUDENT ||--o{ EXAM_ATTEMPT : submits
    
    INSTITUTE {
        string _id
        string name
        string email
    }
    STUDENT {
        string _id
        string name
        string batchId
        string instituteId
    }
    EXAM {
        string _id
        string title
        int durationMinutes
        string instituteId
    }
```

## Exam Evaluation Workflow

The backend contains specialized logic for secure and automated exam evaluation.

```mermaid
flowchart TD
    A[Receive Exam Submission] --> B[Validate JWT Token]
    B --> C{Submission Valid?}
    
    C -->|No| D[Return 400 Bad Request]
    C -->|Yes| E[Fetch Correct Answers from DB]
    
    E --> F[Initialize Score Counter]
    F --> G[Iterate Through Submitted Answers]
    
    G --> H{Answer Correct?}
    H -->|Yes| I[Add Positive Marks]
    H -->|No| J{Negative Marking Enabled?}
    
    J -->|Yes| K[Deduct Penalty Marks]
    J -->|No| L[0 Marks Added]
    
    I --> M[Store Attempt Record]
    K --> M
    L --> M
    
    M --> N[Return Final Score to Client]
```

## Security Posture

```mermaid
graph LR
    A[Threat Vector] --> B{Defense Mechanism}
    
    B -->|Brute Force| C[Express Rate Limit]
    B -->|XSS / Injection| D[Helmet Headers]
    B -->|Unauthorized Access| E[JWT Authorization Middleware]
    B -->|Payload Overload| F[Body Parser Limits]
```

### Development Scripts

- `npm start`: Runs the server for production.
- `npm run dev`: Runs the server with Nodemon for hot-reloading during development.
