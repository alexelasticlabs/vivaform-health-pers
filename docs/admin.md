# Admin Panel — Technical Overview (EN)

This document contains the technical overview and implementation notes for the Admin Panel.

## Goals
- Provide role-based access to admin features (RBAC: ADMIN, MANAGER, SUPPORT).
- Allow user management: search, view, edit, suspend, impersonate.
- Provide audit logs for critical admin actions.
- Provide a quiz editor for managing quiz content and experiments.
- Expose health and metrics for operations.

## Backend
- Folder: `apps/backend/src/modules/admin`
- Controllers: `admin.controller.ts` (REST endpoints)
- Services: `admin.service.ts` (business logic)
- DTOs / Types: use `@vivaform/shared` for shared types
- DB: use Prisma migrations to add `AuditLog` and `FeatureToggle` models

## API Contracts (examples)
- GET /admin/users?query=&page=&limit=
- PATCH /admin/users/:id -> { role: 'ADMIN' | 'USER' | 'MANAGER', active: boolean }
- GET /admin/audit?page=&limit=&action=
- POST /admin/quizzes -> { title_en, config }

## UI
- Folder: `apps/web/src/pages/admin`
- Use English for all user-facing copy.
- Provide search and filters at the top of lists.
- Use confirmation modal for destructive actions.

## Security
- Protect routes with RBAC guard.
- Log actions to `AuditLog` model for traceability.
- CSRF protection is enabled; ensure admin form submits have CSRF token.


