# Silver Star Facility Management Pvt. Ltd. — Digital Platform Prototype

**Official Client Website:** [https://silverstarindia.net/](https://silverstarindia.net/)  
**Primary Reference Proposal:** `Silver_Star_Facility_Management_Proposal_Report.pdf`

---

## 1. System Architecture Overview

This monorepo contains the complete, production-ready frontend suite consisting of **5 interactive applications**, driven by a single centralized source of truth for demonstration records (`packages/mock-data/mockData.ts`):

| # | Application | Platform | Default Port | Primary Target Role |
|---|---|---|---|---|
| 1 | **Super Admin Web Panel** | React + TS + Tailwind v4 + Vite | `http://localhost:5173` | Executive Governance & System Administration |
| 2 | **HR Management Web Panel** | React + TS + Tailwind v4 + Vite | `http://localhost:5174` | Human Resources & Onboarding Pipeline |
| 3 | **Operations Management Panel** | React + TS + Tailwind v4 + Vite | `http://localhost:5175` | Field Ops, Geofencing & Site Rosters |
| 4 | **Client Mobile Application** | React + TS + Mobile Shell + Vite | `http://localhost:5176` | Corporate Facility Clients (InfoSys, DLF, etc.) |
| 5 | **Employee Mobile Application** | React + TS + Mobile Shell + Vite | `http://localhost:5177` | Field Workforce (Guards, Housekeeping, Techs) |

---

## 2. Centralized Demo Credentials

All demonstration accounts are linked directly to `packages/mock-data/mockData.ts`:

| Application | Username / ID | Password | Context / Role |
|---|---|---|---|
| **Super Admin** | `admin` | `admin123` | Super Admin with full governance rights |
| **HR Panel** | `hr` | `hr123` | HR Executive (9-step onboarding, eKYC) |
| **Operations Panel** | `ops` | `ops123` | Operations Manager (Rosters, GPS breaches) |
| **Client Mobile** | `infosys_client` | `client123` | InfoSys Tech Park (SITE001 & SITE002 only) |
| **Employee Mobile** | `SS-10001` | `emp123` | Ramesh Kumar (Security Guard @ InfoSys Block A) |

---

## 3. Quick Start & Execution

### Run any individual application:
From the root `platform/` directory:

```bash
# Super Admin Portal (Port 5173)
npm run dev:admin

# HR Management Panel (Port 5174)
npm run dev:hr

# Operations Management Panel (Port 5175)
npm run dev:ops

# Client Mobile Application (Port 5176)
npm run dev:client

# Employee Mobile Application (Port 5177)
npm run dev:employee
```

### Or run directly inside any app folder:
```bash
cd apps/super-admin
npm run dev
```

### Validate all 5 builds simultaneously:
```bash
npm run build:all
```

---

## 4. Key Architectural Highlights

### 4.1 Single Source of Truth (`packages/mock-data/mockData.ts`)
- **Zero scattered mock data:** Every employee, client, site coordinate, shift, and attendance record originates from `packages/mock-data/mockData.ts`.
- **Relational Integrity:** Employee `EMP001` (Ramesh Kumar, `SS-10001`) is deployed at `SITE001` (InfoSys - Block A) under client `CLI001` (InfoSys Tech Park) with supervisor `EMP003` (Suresh Nair) across Super Admin, HR, Operations, and both Mobile apps.
- **Backend-Ready:** Mock models mirror the planned PostgreSQL and REST API schemas for seamless Phase 2 integration.

### 4.2 Corporate Branding
- Official Silver Star Navy Blue (`#202B75`) as primary brand anchor.
- Cyan/Teal (`#26BCEE`) as high-contrast active indicator.
- Official enhanced corporate logo and vectors deployed locally across all portals and DB.
- Currency formatting strictly in **Indian Rupees (INR ₹)**.

### 4.3 GPS Geofencing Engine Simulation
- Interactive multi-step animated attendance verification:
  1. High-accuracy GPS acquisition (Latitude, Longitude, Accuracy radius).
  2. OS Anti-Spoofing & Mock Location validation check.
  3. Spherical Haversine distance computation to site perimeter.
  4. Real-time approval or geofence boundary rejection toast.
- Includes a live toggle in the Employee Mobile App to switch between **Inside Site (38m)** and **Outside Site (185m)** to demonstrate exception blocking.

