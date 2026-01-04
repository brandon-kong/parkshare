# ParkShare — Parking Spot Marketplace

## Overview

A peer-to-peer marketplace where people can list and rent parking spots. Think Airbnb, but for parking.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Client                                │
│                    (Browser / Mobile App)                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                           │
│              (SSR, Static Pages, Auth UI, Maps)                 │
│                        TypeScript                               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼ REST / GraphQL
┌─────────────────────────────────────────────────────────────────┐
│                        Go API Server                            │
│         (Business Logic, Auth, Validation, WebSockets)          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Auth     │  │    Spots    │  │  Bookings   │  ...        │
│  │   Feature   │  │   Feature   │  │   Feature   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                           │                                     │
│                    ┌──────┴──────┐                             │
│                    │ cgo bindings │                             │
│                    └──────┬──────┘                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   Geo Engine     │ │   Pricing    │ │   Availability   │
│      (C++)       │ │   Engine     │ │     Engine       │
│                  │ │    (C++)     │ │      (C++)       │
│ • Spatial index  │ │ • Demand     │ │ • Calendar       │
│ • Distance calc  │ │   modeling   │ │   conflicts      │
│ • Walk time      │ │ • Dynamic    │ │ • RRULE parsing  │
│                  │ │   pricing    │ │                  │
└──────────────────┘ └──────────────┘ └──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL + PostGIS                         │
│                         + Redis                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature List

### Phase 1: Core MVP

**User Management**
- Sign up / login (email + OAuth)
- User profiles (photo, bio, verification status)
- Role handling (users can be both hosts and renters)

**Spot Listings**
- Create listing with photos, description, location
- Set spot attributes (size, covered, EV charging, security features)
- Define availability (one-time, recurring schedule, always available)
- Set pricing (hourly, daily, monthly rates)

**Search & Discovery**
- Map-based browsing
- Search by location with radius
- Filter by date/time, price, attributes
- Sort by distance, price, rating

**Booking**
- Check availability for a time range
- Request or instant book
- Booking confirmation and calendar sync

**Payments**
- Secure checkout
- Host payouts
- Cancellation and refund handling

**Reviews**
- Renters review spots
- Hosts review renters
- Rating aggregation

### Phase 2: Enhanced Experience

**Real-time Features**
- Messaging between host and renter
- Push notifications (booking confirmed, new message, spot available)
- Live availability updates

**Smart Pricing (C++ Engine)**
- Demand-based price suggestions
- Event-aware pricing (concerts, sports games nearby)
- Competitor analysis

**Advanced Search (C++ Engine)**
- Geospatial indexing for fast queries
- Walking distance calculation (not just straight-line)
- Availability conflict resolution

### Phase 3: Growth & Trust

**Verification**
- Photo verification of spots
- Identity verification for users
- Address verification

**Analytics Dashboard**
- Host earnings and occupancy stats
- Renter spending history
- Platform-wide metrics (admin)

**Mobile Apps**
- iOS and Android (React Native or native)
- Navigation integration

---

## Data Model

### Users
```
User {
  id: UUID
  email: string (unique)
  password_hash: string
  name: string
  avatar_url: string?
  phone: string?
  is_verified: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Spots
```
Spot {
  id: UUID
  host_id: UUID -> User
  title: string
  description: string
  
  // Location
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  latitude: decimal
  longitude: decimal
  
  // Attributes
  spot_type: enum (driveway, garage, lot, street)
  vehicle_size: enum (compact, standard, large, oversized)
  is_covered: boolean
  has_ev_charging: boolean
  has_security: boolean
  access_instructions: string?
  
  // Pricing (cents to avoid float issues)
  hourly_rate: integer?
  daily_rate: integer?
  monthly_rate: integer?
  
  // Status
  status: enum (draft, active, paused, deleted)
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Spot Photos
```
SpotPhoto {
  id: UUID
  spot_id: UUID -> Spot
  url: string
  display_order: integer
  created_at: timestamp
}
```

### Availability
```
Availability {
  id: UUID
  spot_id: UUID -> Spot
  
  // For one-time availability
  start_time: timestamp?
  end_time: timestamp?
  
  // For recurring availability
  recurrence_rule: string? (iCal RRULE format)
  
  created_at: timestamp
}
```

### Bookings
```
Booking {
  id: UUID
  spot_id: UUID -> Spot
  renter_id: UUID -> User
  
  start_time: timestamp
  end_time: timestamp
  
  // Pricing snapshot at time of booking
  total_cents: integer
  currency: string
  
  status: enum (pending, confirmed, active, completed, cancelled)
  cancellation_reason: string?
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Payments
```
Payment {
  id: UUID
  booking_id: UUID -> Booking
  payer_id: UUID -> User
  
  amount_cents: integer
  currency: string
  status: enum (pending, completed, refunded, failed)
  
  stripe_payment_id: string?
  
  created_at: timestamp
}
```

### Payouts
```
Payout {
  id: UUID
  host_id: UUID -> User
  
  amount_cents: integer
  currency: string
  status: enum (pending, processing, completed, failed)
  
  stripe_transfer_id: string?
  
  created_at: timestamp
}
```

### Reviews
```
Review {
  id: UUID
  booking_id: UUID -> Booking
  reviewer_id: UUID -> User
  reviewee_id: UUID -> User
  
  rating: integer (1-5)
  comment: string?
  review_type: enum (spot_review, renter_review)
  
  created_at: timestamp
}
```

### Messages
```
Conversation {
  id: UUID
  booking_id: UUID? -> Booking (optional, can message before booking)
  spot_id: UUID -> Spot
  host_id: UUID -> User
  renter_id: UUID -> User
  created_at: timestamp
}

Message {
  id: UUID
  conversation_id: UUID -> Conversation
  sender_id: UUID -> User
  content: string
  read_at: timestamp?
  created_at: timestamp
}
```

---

## Monorepo Structure (Feature-Based)

```
parkshare/
├── README.md
├── package.json                    # Workspace root (for TS packages)
├── turbo.json                      # Turborepo config
├── pnpm-workspace.yaml             # pnpm workspaces
├── Makefile                        # Top-level build commands
│
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── src/
│   │   │   ├── app/                # Next.js app router
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── spots/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   └── new/
│   │   │   │   ├── bookings/
│   │   │   │   └── profile/
│   │   │   ├── features/           # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   │   └── SignupForm.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useAuth.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── spots/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── SpotCard.tsx
│   │   │   │   │   │   ├── SpotMap.tsx
│   │   │   │   │   │   ├── SpotForm.tsx
│   │   │   │   │   │   ├── SpotGallery.tsx
│   │   │   │   │   │   └── SpotFilters.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useSpots.ts
│   │   │   │   │   │   └── useSpotSearch.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── bookings/
│   │   │   │   ├── payments/
│   │   │   │   ├── reviews/
│   │   │   │   ├── messaging/
│   │   │   │   └── profile/
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── utils/
│   │   │   ├── lib/
│   │   │   │   └── api-client.ts   # Typed client for Go API
│   │   │   └── styles/
│   │   └── public/
│   │
│   ├── api/                        # Go backend API
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   │   └── config.go
│   │   │   ├── server/
│   │   │   │   ├── server.go
│   │   │   │   ├── routes.go
│   │   │   │   └── middleware.go
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── handler.go
│   │   │   │   │   ├── service.go
│   │   │   │   │   ├── repository.go
│   │   │   │   │   ├── models.go
│   │   │   │   │   └── middleware.go
│   │   │   │   ├── spots/
│   │   │   │   │   ├── handler.go      # HTTP handlers
│   │   │   │   │   ├── service.go      # Business logic
│   │   │   │   │   ├── repository.go   # Database access
│   │   │   │   │   ├── models.go       # Domain models
│   │   │   │   │   └── dto.go          # Request/response types
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── handler.go
│   │   │   │   │   ├── service.go
│   │   │   │   │   ├── repository.go
│   │   │   │   │   └── models.go
│   │   │   │   ├── payments/
│   │   │   │   ├── reviews/
│   │   │   │   └── messaging/
│   │   │   ├── database/
│   │   │   │   ├── postgres.go
│   │   │   │   ├── migrations/
│   │   │   │   │   ├── 001_create_users.up.sql
│   │   │   │   │   ├── 001_create_users.down.sql
│   │   │   │   │   ├── 002_create_spots.up.sql
│   │   │   │   │   └── ...
│   │   │   │   └── seeds/
│   │   │   ├── engines/            # Go bindings to C++ engines
│   │   │   │   ├── geo/
│   │   │   │   │   └── geo.go      # cgo wrapper for geo-engine
│   │   │   │   ├── pricing/
│   │   │   │   │   └── pricing.go  # cgo wrapper for pricing-engine
│   │   │   │   └── availability/
│   │   │   │       └── availability.go
│   │   │   └── shared/
│   │   │       ├── errors/
│   │   │       │   └── errors.go
│   │   │       ├── response/
│   │   │       │   └── response.go
│   │   │       └── validation/
│   │   │           └── validation.go
│   │   ├── pkg/                    # Public packages (if needed)
│   │   │   └── types/
│   │   │       └── types.go
│   │   └── tests/
│   │       ├── integration/
│   │       └── e2e/
│   │
│   └── mobile/                     # React Native app (Phase 3)
│       └── ...
│
├── packages/
│   ├── shared-types/               # Shared TypeScript types
│   │   ├── package.json
│   │   └── src/
│   │       ├── user.ts
│   │       ├── spot.ts
│   │       ├── booking.ts
│   │       └── index.ts
│   │
│   ├── ui/                         # Shared UI component library
│   │   ├── package.json
│   │   └── src/
│   │       ├── Button/
│   │       ├── Input/
│   │       ├── Modal/
│   │       └── index.ts
│   │
│   ├── utils/                      # Shared utilities
│   │   ├── package.json
│   │   └── src/
│   │       ├── formatting.ts
│   │       ├── validation.ts
│   │       └── dates.ts
│   │
│   └── config/                     # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── engines/                        # C++ engines
│   ├── pricing-engine/
│   │   ├── CMakeLists.txt
│   │   ├── src/
│   │   │   ├── pricing.cpp
│   │   │   ├── pricing.hpp
│   │   │   ├── demand_model.cpp
│   │   │   └── demand_model.hpp
│   │   ├── bindings/
│   │   │   ├── wasm/              # WebAssembly bindings
│   │   │   │   └── pricing_wasm.cpp
│   │   │   └── node/              # Node.js native addon
│   │   │       └── pricing_node.cpp
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── geo-engine/
│   │   ├── CMakeLists.txt
│   │   ├── src/
│   │   │   ├── spatial_index.cpp
│   │   │   ├── spatial_index.hpp
│   │   │   ├── distance.cpp
│   │   │   └── walking_time.cpp
│   │   ├── bindings/
│   │   └── tests/
│   │
│   └── availability-engine/
│       ├── CMakeLists.txt
│       ├── src/
│       │   ├── calendar.cpp
│       │   ├── conflict_resolver.cpp
│       │   └── rrule_parser.cpp
│       ├── bindings/
│       └── tests/
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── docker-compose.yml
│   ├── terraform/                  # Infrastructure as code
│   └── k8s/                        # Kubernetes configs
│
├── scripts/
│   ├── setup.sh
│   ├── build-engines.sh
│   └── seed-db.ts
│
└── docs/
    ├── architecture.md
    ├── api.md
    └── engines.md
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | TypeScript, Next.js 14+, Tailwind, Mapbox/Google Maps |
| API | Go 1.22+, Chi or Echo router, sqlc or GORM |
| Database | PostgreSQL 16 + PostGIS |
| Migrations | golang-migrate |
| Cache | Redis |
| C++ Engines | CMake, cgo (Go bindings), Emscripten (WASM for browser) |
| Monorepo | Turborepo (TS), Make (Go/C++) |
| Testing | Vitest + Playwright (frontend), Go testing + testify (backend), Google Test (C++) |
| Infrastructure | Docker, GitHub Actions |

### Go Libraries to Consider

| Purpose | Library |
|---------|---------|
| HTTP Router | chi, echo, or gin |
| Database | pgx (Postgres driver), sqlc (type-safe queries) |
| Migrations | golang-migrate |
| Validation | go-playground/validator |
| Auth/JWT | golang-jwt/jwt |
| Config | viper or envconfig |
| Logging | zerolog or zap |
| Testing | testify, gomock |

---

## Next Steps

1. **Initialize the monorepo**
   - Set up Turborepo + pnpm for TypeScript packages
   - Create top-level Makefile for Go and C++ builds
   - Configure shared ESLint/Prettier for frontend

2. **Set up the Go API skeleton**
   - Initialize Go module in `apps/api`
   - Set up Chi/Echo router with basic middleware
   - Configure database connection with pgx
   - Run first migration (users table)

3. **Set up the Next.js frontend**
   - Initialize Next.js 14 with App Router
   - Set up Tailwind and base components
   - Create typed API client for Go backend

4. **Build auth feature end-to-end**
   - Go: JWT auth with refresh tokens
   - Next.js: Login/signup forms, auth context
   - Database: Users table with proper indexing

5. **Build spots feature end-to-end**
   - Go: CRUD endpoints, PostGIS queries
   - Next.js: Listing form, map view, search
   - First integration test

6. **First C++ engine (geo-engine)**
   - Set up CMake project
   - Implement spatial indexing (R-tree)
   - Create cgo bindings for Go
   - Benchmark against pure PostGIS

7. **Docker development environment**
   - Compose file with Postgres, Redis, Go API
   - Hot reload for all services

---

## Open Questions

- Instant book vs. request to book — or both?
- How to handle cancellations? Strict, moderate, flexible policies?
- Identity verification — DIY or use a service like Stripe Identity?
- Mobile first or web first?