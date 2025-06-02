# System Patterns
## System Architecture
The system follows a modular monorepo architecture:
```
┌─────────────┐       ┌─────────────┐
│  Frontend   │◄─────►│   Backend   │
│ (Next.js)   │ HTTP  │ (NestJS)    │
└─────────────┘       └─────────────┘
       ▲                    ▲
       │                    │
┌─────────────┐       ┌─────────────┐
│   Shared    │       │  Database   │
│  (Prisma)   │──────►│ (MariaDB)   │
└─────────────┘       └─────────────┘
```
Key characteristics:
- Frontend: Next.js app using React with App Router
- Backend: NestJS modular architecture with controllers/services
- Database: MariaDB with Prisma ORM
- Shared: Prisma schema and TypeScript types in packages

## Key Technical Decisions
1. **Monorepo Structure:**
   - Using pnpm workspaces for dependency management
   - Shared code in packages directory
   - Apps separated by domain (frontend, backend)
2. **Modular Backend:**
   - NestJS modules for features (users, materials, maintenance)
   - Shared modules for common functionality (auth, prisma)
3. **State Management:**
   - TanStack Query for server state management
   - Context API for global UI state
4. **API Design:**
   - RESTful endpoints with JSON responses
   - JWT authentication

## Design Patterns in Use
- **MVC (Model-View-Controller):**
  - Backend: NestJS controllers/services/entities
  - Frontend: Components (View), Services (Controller), State (Model)
- **Repository Pattern:** Prisma client as data access layer
- **Dependency Injection:** Used extensively in NestJS
- **Observer Pattern:** Winston logger with multiple transports

## Component Relationships
- **Backend Modules:**
  - Auth: Handles authentication
  - Users: Manages user accounts
  - Materials: Tracks inventory
  - Maintenance: Manages work orders
- **Frontend Structure:**
  - App Router with layout hierarchy
  - (auth) route group for authentication
  - (main) route group for application
  - Shared UI components

## Critical Implementation Paths
1. User authentication flow
2. Work order creation process
3. Material tracking system
4. Reporting module
