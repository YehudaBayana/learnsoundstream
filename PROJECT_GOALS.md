# Music Streaming Platform - Backend Learning Project

## 🎯 Project Overview
This project is a **Fullstack** music streaming web application designed primarily as a **learning vehicle for transitioning from a frontend developer to a backend engineer using Go**. 

The goal is to build a complete end-to-end system where the frontend (Next.js) consumes high-performance streams served by the backend (Go), ensuring a seamless user experience.

The core philosophy is to build real-world backend infrastructure without relying on "magic" frameworks, forcing a deep understanding of core backend engineering skills.

## 🎵 Core App Mechanics
- **Fullstack Streaming:** The application is a fullstack system. The backend fetches and pipes audio data using `yt-dlp`, while the frontend provides the UI and player logic to stream and playback this data in real-time.
- **Streaming Mechanism:** The backend streams songs dynamically via the `yt-dlp` CLI/package tool.
- **Storage Rule:** Audio files are **NOT** stored in the database. 
- **Database Scope:** The database is strictly reserved for application and user state (e.g., users, playback history, liked songs, playlists, etc.).

## 🏗️ Technology Stack

### Frontend
- **Framework:** Next.js
- **Language:** TypeScript

### Backend
- **Language:** Go (Golang) - *Chosen for simplicity, concurrency, and lack of heavy OOP/framework magic.*
- **API Architecture:** REST APIs (and potentially gRPC later)
- **Database:** PostgreSQL (Relational data: users, history, likes)
- **Cache:** Redis (Session data, rate limiting, frequently accessed lookups)
- **Object Storage:** AWS S3 (For user avatars, playlist covers, etc. - NOT for song audio)
- **Realtime:** WebSockets (Live updates, concurrent listening sessions)
- **Message Queue:** RabbitMQ or Apache Kafka (Background jobs, transcoding, analytics pipelines)
- **Deployment & Infrastructure:** Docker

## 🧠 Learning Objectives (What to Master)
The primary goal is to learn **Backend Architecture** through Go by mastering:
- APIs and Clean Backend Design
- Concurrency (Goroutines & Channels)
- Scalable Services & Microservices boundaries
- Networking & The HTTP Lifecycle
- Caching Strategies
- Message Queues & Event-Driven Architecture
- Streaming Systems
- Infrastructure Thinking

### ⚠️ Constraints (What to Avoid)
- Overly complex syntax
- Heavy Object-Oriented Programming (OOP) paradigms
- Massive "framework magic" that hides underlying mechanisms

### 🛠️ Core Skills to Force-Learn
- Raw HTTP lifecycle handling
- Database connection pooling & management
- Goroutines, concurrency patterns, and channels
- Memory efficiency and garbage collection awareness
- Defining strict service boundaries
- Context cancellation (critical in Go)
- Distributed systems basics

## 🚀 Real-World Problems to Solve in this Project
Building this music platform will naturally introduce and require solving these backend challenges:
1. **Authentication & Authorization:** Secure user login and session management.
2. **Streaming Files:** Efficiently piping data from `yt-dlp` through the Go server to the client without memory bloat.
3. **Uploads:** Handling user-generated images (avatars, covers) to S3.
4. **Transcoding Pipelines:** Processing audio or image formats.
5. **Queues / Jobs:** Offloading heavy tasks to background workers.
6. **Recommendation Systems:** Querying listening history to suggest songs.
7. **WebSocket Realtime Updates:** Syncing "currently playing" status across devices.
8. **Caching & Rate Limiting:** Protecting APIs and speeding up repeated queries using Redis.
9. **CDN Concepts:** Distributing static assets efficiently.
10. **Search Systems:** Quickly finding songs, artists, or users.
11. **Database Scaling:** Structuring PostgreSQL for growing tables (like history logs).
12. **Background Workers:** Processing tasks asynchronously from the main API thread.

## 📁 Project Structure
The repository is split into two main domains:
- `/frontend`: The Next.js application.
- `/backend`: The Go application(s) and infrastructure configurations.

---
*Note for AI Agents: Read this document thoroughly before proposing architectures or writing code. Prioritize explicit, understandable Go code over clever shortcuts. The user is learning backend principles—explain the "why" behind connection handling, memory management, and concurrency choices.*
