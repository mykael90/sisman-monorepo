# Tech Context
## Technologies Used
- **Backend:** 
  - NestJS (Node.js/TypeScript)
  - Prisma ORM
  - Winston for logging
- **Frontend:**
  - Next.js (React)
  - Tailwind CSS
  - TanStack (React Query, React Table)
- **Database:**
  - MariaDB
- **Testing:** 
  - Jest (backend)
  - (Frontend testing TBD)
- **Build Tools:**
  - pnpm (workspace management)
  - TypeScript
  - ESLint, Prettier, commitlint
- **Deployment:**
  - Docker (docker-compose.yaml present)
  - (Production deployment TBD)

## Development Setup
1. **Prerequisites:**
   - Node.js (version TBD)
   - pnpm
   - Docker (for database containerization)
2. **Installation:**
   ```bash
   pnpm install
   ```
3. **Database Setup:**
   ```bash
   docker-compose up -d  # Start database container
   pnpm run prisma:migrate  # Apply migrations
   ```
4. **Running Applications:**
   - Backend: `pnpm --filter backend run start:dev`
   - Frontend: `pnpm --filter frontend run dev`

## Technical Constraints
- Single developer resource constraint
- MVP scope limitation
- Need for open-source stack
- Future interoperability requirements with IFES systems

## Dependencies
See:
- `pnpm-lock.yaml` for exact versions
- Individual `package.json` files in apps and packages

## Tool Usage Patterns
- `pnpm` for monorepo management (preferred package manager)
- `prisma` for database operations
- `nest` CLI for backend development
- `next` for frontend development

## Key pnpm Commands

Here are the main pnpm commands used in this monorepo, including common package management operations:

- `pnpm install`: Installs all dependencies for the monorepo.
- `pnpm add <package-name>`: Adds a package to the current project.
- `pnpm add -g <package-name>`: Installs a package globally.
- `pnpm add -D <package-name>`: Adds a package as a development dependency.
- `pnpm remove <package-name>`: Removes a package from the current project.
- `pnpm <command>`: Executes a command defined in the `scripts` section of `package.json`.
- `pnpm --filter <project-name> <command>`: Executes a command within a specific project in the monorepo.
- `pnpm --filter sisman-backend start:dev`: Starts the backend application in development mode.
- `pnpm --filter sisman-backend seed:dev`: Seeds the backend database for development.
- `pnpm --filter sisman-frontend start:dev`: Starts the frontend application in development mode.
- `pnpm --filter scraping-api start:dev`: Starts the scraping API in development mode.
- `pnpm run --recursive build`: Builds all projects in the monorepo.
- `pnpm run --recursive lint`: Runs linting across all projects.
- `pnpm run --recursive format`: Formats code across all projects.
- `pnpm --filter @sisman/prisma db:generate`: Generates Prisma client.
- `pnpm --filter @sisman/prisma db:migrate:dev`: Applies Prisma migrations in development.
- `pnpm --filter @sisman/prisma db:migrate:reset`: Resets and reapplies Prisma migrations.
- `pnpm --filter @sisman/prisma db:studio`: Opens Prisma Studio.
- `pnpm --filter @sisman/prisma db:db:push`: Pushes the Prisma schema to the database.
- `pnpm --filter @sisman/prisma db:db:pull`: Pulls the database schema to Prisma.
- `pnpm run --recursive typecheck`: Runs type checking across all projects.
