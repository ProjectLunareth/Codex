# Overview

This is a mystical knowledge management application called "The Codex of Hidden Knowing" - a React-based web app for browsing, searching, and interacting with a collection of esoteric and spiritual texts. The application features a sophisticated interface for exploring codex entries organized by categories like Cosmogenesis, Psychogenesis, and Mystagogy, with an integrated Oracle consultation system powered by OpenAI.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with **React 18** using TypeScript and follows a component-based architecture. The application uses **Vite** as the build tool and development server for fast hot module replacement. State management is handled through **TanStack Query** for server state and React's built-in state management for local UI state.

**Routing**: Implemented with `wouter` for lightweight client-side routing, currently supporting a single home route with a catch-all 404 page.

**UI Framework**: Built on **shadcn/ui** components with **Radix UI** primitives, providing a comprehensive set of accessible UI components. The design system uses **Tailwind CSS** with custom CSS variables for theming, featuring a mystical dark theme with golden accents.

**Component Structure**: Organized into logical folders:
- `/components/ui/` - Base UI components (buttons, inputs, modals, etc.)
- `/components/layout/` - Layout components (sidebar, main content)
- `/components/codex/` - Domain-specific components (entry cards, modals, search)

## Backend Architecture
The backend uses **Express.js** with TypeScript in ESM format, following a RESTful API design pattern. The server is structured around route handlers, services, and storage layers for clean separation of concerns.

**API Design**: RESTful endpoints under `/api/` namespace:
- `/api/codex/entries` - CRUD operations for codex entries
- `/api/codex/search` - Full-text search functionality
- `/api/bookmarks` - User bookmark management
- `/api/oracle/consult` - Oracle consultation service

**Service Layer**: Modular services handle business logic:
- `CodexService` - Manages codex data initialization and processing
- Oracle service integrates with OpenAI's GPT API for mystical consultations

## Data Storage Solutions
The application uses **Drizzle ORM** with **PostgreSQL** as the primary database. The database schema is defined in TypeScript with proper type inference.

**Schema Design**:
- `codex_entries` - Core content with metadata, full text, and categorization
- `bookmarks` - User bookmarks and personal notes with timestamps
- `oracle_consultations` - Historical Oracle consultation records

**Storage Abstraction**: Implements an `IStorage` interface with both memory-based (`MemStorage`) and database implementations, allowing for flexible storage backends and easier testing.

## Authentication and Authorization
Currently implements a session-based approach using `connect-pg-simple` for PostgreSQL session storage, though specific authentication middleware is not yet implemented in the codebase.

## External Dependencies

### Third-party Services
- **OpenAI API** - Powers the Oracle consultation feature using GPT models for generating mystical responses and insights
- **Neon Database** - Serverless PostgreSQL hosting via `@neondatabase/serverless`

### Key Libraries
- **Frontend**: React 18, TanStack Query, Wouter (routing), Fuse.js (client-side search), React Hook Form with Zod validation
- **Backend**: Express.js, Drizzle ORM, Zod (schema validation)
- **UI/Styling**: Tailwind CSS, Radix UI, shadcn/ui, Lucide React (icons)
- **Development**: Vite, TypeScript, ESBuild

### Fonts and Assets
- **Google Fonts**: Cinzel (headings), EB Garamond (body text), Courier New (monospace)
- **Attached Assets**: Contains processed codex documents in text format with metadata

The application follows modern React patterns with TypeScript throughout, emphasizing type safety and developer experience while maintaining a mystical, scholarly aesthetic appropriate for its esoteric content domain.