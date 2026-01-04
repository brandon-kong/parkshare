# ParkShare 🅿️

A peer-to-peer parking spot marketplace. List your unused parking spots or find parking near your destination.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Mapbox
- **Backend**: Go, Chi router, PostgreSQL + PostGIS
- **Engines**: C++ (geo-indexing, pricing, availability)
- **Infrastructure**: Docker, Redis

## Project Structure

```
parkshare/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Go backend
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configurations
├── engines/
│   ├── geo-engine/   # C++ spatial indexing
│   ├── pricing-engine/
│   └── availability-engine/
└── infrastructure/
    └── docker/       # Docker Compose files
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Go 1.22+
- Docker & Docker Compose
- CMake 3.20+ (for C++ engines)

## Getting Started

### 1. Clone and Setup

```bash
git clone https://github.com/brandon-kong/parkshare.git
cd parkshare
make setup
```

This will:

- Install Node.js dependencies
- Create `.env` files from examples
- Start Postgres and Redis containers
- Run database migrations

### 2. Start Development

```bash
# Start all services
make dev

# Or start individually:
make api-dev   # Go API on :8080
make web-dev   # Next.js on :3000
```

### 3. Open the App

- Frontend: http://localhost:3000
- API: http://localhost:8080
- API Health: http://localhost:8080/health

## Available Commands

```bash
make help           # Show all commands

# Development
make dev            # Run all services
make api-dev        # Run Go API
make web-dev        # Run Next.js

# Building
make build          # Build everything
make api-build      # Build Go binary
make engines-build  # Build C++ engines

# Testing
make test           # Run all tests
make api-test       # Run Go tests

# Database
make api-migrate         # Run migrations
make api-migrate-down    # Rollback migration
make docker-psql         # Connect to Postgres

# Docker
make docker-up      # Start containers
make docker-down    # Stop containers
make docker-logs    # View logs
```

## Environment Variables

### API (`apps/api/.env`)

```env
DATABASE_URL=postgres://parkshare:parkshare@localhost:5432/parkshare?sslmode=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PORT=8080
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

## Architecture

```
Browser → Next.js (SSR) → Go API → PostgreSQL
                            ↓
                       C++ Engines (via cgo)
```

## License

MIT
