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
- `pnpm` for monorepo management
- `prisma` for database operations
- `nest` CLI for backend development
- `next` for frontend development
