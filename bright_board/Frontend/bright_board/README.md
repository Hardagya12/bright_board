# Bright Board Frontend Application

## Technical Stack

The frontend application is a Single Page Application (SPA) built to deliver a highly responsive and state-of-the-art user interface.

- **Framework**: React.js 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Recharts & Chart.js
- **Animations**: Framer Motion

## Application Architecture

The frontend is divided into two primary execution contexts: The Administrative Portal and the Student Portal.

```mermaid
graph TD
    A[App Initialization] --> B{Role Check Context}
    
    B -->|Admin Role| C[Admin Layout]
    B -->|Student Role| D[Student Layout]
    
    subgraph Administrative Context
        C --> E[Dashboard]
        C --> F[Student Management]
        C --> G[Exam Management]
        C --> H[Attendance Tracking]
        C --> I[Material Repository]
    end
    
    subgraph Student Context
        D --> J[Student Dashboard]
        D --> K[Exam Interface]
        D --> L[Study Materials]
        D --> M[Performance Analytics]
    end
```

## Component Hierarchy

```mermaid
graph LR
    A[App.jsx] --> B[ProtectedRoutes.jsx]
    B --> C[Layouts]
    C --> D[AdminSidebar.jsx]
    C --> E[StudentSidebar.jsx]
    
    C --> F[Pages]
    F --> G[Components]
    G --> H[UI Elements: Button, InputGroup, Card]
```

## State Management and Data Flow

The application relies on a modular service architecture for API communications rather than monolithic state containers.

```mermaid
sequenceDiagram
    participant Component
    participant ServiceLayer
    participant AxiosClient
    participant ExternalAPI

    Component->>ServiceLayer: callFunction
    ServiceLayer->>AxiosClient: Format Request
    AxiosClient->>ExternalAPI: Network Request
    ExternalAPI-->>AxiosClient: JSON Response
    AxiosClient-->>ServiceLayer: Parse & Error Handle
    ServiceLayer-->>Component: Return Clean Data
    Component->>Component: Update Local State & Render
```

## Build and Compilation Process

The application utilizes Vite for rapid development and optimized production builds.

```mermaid
graph TD
    A[Source Code] --> B[esbuild Compiler]
    B --> C[Code Splitting Strategy]
    C --> D[Vendor Chunk]
    C --> E[Charts Chunk]
    C --> F[Application Core]
    
    D --> G[dist/assets]
    E --> G
    F --> G
```

### Development Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Compiles and minifies for production, dropping console output.
- `npm run preview`: Serves the production build locally.
