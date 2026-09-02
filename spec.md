# Product Specification: FieldFlow CRM

## Core Purpose
A lightweight, mobile-first CRM and scheduling platform built for independent local field trade contractors (plumbers, electricians, HVAC technicians) to manage customers, track active tasks, and change job statuses live from work sites.

## Target User Personas
1. **Dispatchers / Admins (Desktop Users):** Need a wide dashboard overview to schedule, view, and organize customer requests.
2. **Technicians (Mobile Browser Users):** Need an ultra-clean, fast interface to see their assigned jobs and mark progress while on site.

## MVP Scope & Strict Requirements
- **Authentication:** Must handle user logins, registrations, and private dashboards out-of-the-box via Laravel Breeze.
- **Data Architecture:** A strictly relational architecture connecting Customers to Jobs.
- **UI Architecture:** Fully responsive dashboard using shadcn/ui component primitives.
- **Performance:** Instant, zero-refresh navigation powered by Inertia.js 3.0 with native optimistic status updates.

## Technical Constraints
- Backend: Laravel 13+ / PHP 8.3+
- Frontend: React 19+ / Inertia.js 3.0+ / Tailwind CSS v4+
- UI Library: shadcn/ui components
