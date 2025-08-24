# Repository Overview

- **Name**: structure-management-app
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS (utility classes present), custom UI components
- **Routing**: react-router-dom
- **HTTP**: axios via centralized ApiService
- **State/Hooks**: Custom hooks (useStructures, useStructure, useAuth, etc.)

## App Entry
- `src/main.tsx` and `src/App.tsx` set up the app and routes.

## API Configuration
- **Base URL**: `src/utils/constants.ts` → `API_BASE_URL = 'http://localhost:5000/api'`
- **Endpoints**: `STRUCTURE_ENDPOINTS`
  - `LIST`: `/structures`
  - `DETAILS`: `/structures/:id`
  - `REMARKS`: `/structures/:id/remarks`

- **ApiService**: `src/services/api.ts`
  - Adds Authorization header from `localStorage` tokens (STORAGE_KEYS)
  - Handles 401 with refresh flow using `AUTH_ENDPOINTS.REFRESH`
  - Logs requests and errors

## Structures Service
- `src/services/structures.ts`
  - `getStructures(params)`
    - Now normalizes multiple response shapes to `StructuresResponse`.
  - `getStructureById(id, includeImages?, includeRatings?)`
    - Accepts `{ success, data }` or direct object response.
  - `getStructureRemarks`, `addRemark`, `updateRemark`, `deleteRemark`

## Types
- `src/types/structure.ts` defines `Structure`, `StructuresResponse`, remarks and nested data types.
- `src/types/api.ts` defines `ApiResponse` and pagination meta.

## Hooks
- `src/hooks/useStructures.tsx`
  - Manage list state, pagination, summary, errors, loading.
  - Syncs external params: page, search, status, sortBy, sortOrder.
  - `useStructure(id)` loads a single structure by id.
- `src/hooks/useAuth.tsx` provides user and permissions.

## UI Components
- `src/components/dashboard/StructureList.tsx` displays list with search, filters, sort, pagination, grid/list views.
- `src/components/dashboard/StructureCard.tsx` renders individual cards.
- `src/components/modals/StructureDetailModal.tsx` shows detailed info for selected structure using `useStructure`.

## Pages
- `src/pages/DashboardPage.tsx` uses `StructureList`, `DashboardStats`, and `StructureDetailModal`.

## Common Issues & Fixes
- If structures aren’t showing:
  1. Ensure backend responds at `${API_BASE_URL}/structures` and returns either:
     - `{ success: true, data: { structures: [...], pagination: {...}, summary: {...} } }` or
     - Any of `items/results` arrays; normalization handles it.
  2. Confirm auth tokens exist in localStorage if API is protected.
  3. Check network logs from ApiService console outputs for URL and errors.
- For details modal not loading:
  - `getStructureById` accepts both wrapped and direct responses.

## Environment
- `.env` / `.env.local` can override `API_BASE_URL` via build-time replacement if wired in Vite config (currently hardcoded in constants.ts).

## Development
- Scripts: `npm run dev`, `npm run build`, `npm run preview`.
