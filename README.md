# AI Airia chat client

## Overview
A lightweight **React (Vite)** client for chatting with an AI Agent through a secure Node/Express proxy. The app includes a minimal login that stores a JWT in `localStorage` and attaches it to all subsequent API requests.

## Features
- Simple login → retrieves JWT from server and stores it locally
- Authenticated requests to protected endpoints
- Tailwind-friendly UI (optional)
- Single configurable API base URL

## Prerequisites
- Node 18+ and npm
- The **Airia Server** (Node/Express) running locally or in the cloud

## Getting Started

```bash
# 1) Install dependencies
npm install

# 2) Create env file
cp .env.example .env

# 3) Run dev server
npm run dev
# Vite defaults to http://localhost:5173
```

### .env.example
```env
# Base URL of your Node/Express API (Airia proxy)
VITE_API_BASE_URL=http://localhost:8787
```

## Environment Variables

| Name                | Required | Example                 | Description |
|---------------------|----------|-------------------------|-------------|
| `VITE_API_BASE_URL` | Yes      | `http://localhost:8787` | Base URL for your API server. Used by the client to call `/api/auth/login` and `/api/agent/chat`. |

> Tip: In your API client (Axios or fetch), read `import.meta.env.VITE_API_BASE_URL` to build requests.

## Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start Vite dev server           |
| `npm run build`   | Build production assets         |
| `npm run preview` | Preview the production build    |

## Auth Flow (Client)
1. User submits username/password to `POST /api/auth/login`.
2. Server returns a JWT → client saves it in `localStorage` as `token`.
3. Client attaches `Authorization: Bearer <token>` on subsequent requests (e.g., `POST /api/agent/chat`).

## Axios Setup (example)

```ts
// src/utils/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
```