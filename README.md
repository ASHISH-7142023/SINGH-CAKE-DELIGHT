<div align="center">
  <img src="Main_Logo.jpg" alt="Singh Cake Delight Banner" width="480" style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); margin-bottom: 20px;" />
  
  # ✨ Singh Cake Delight ✨
  
  **Artisanal Curation • Smart Orchestration • Seamless WhatsApp Delivery**
  
  An elegant, premium, full-stack cake-ordering system designed with custom themes, interactive schedulers, robust database synchronization, and admin control panels.
  
  [![React](https://img.shields.io/badge/Frontend-React%2018-pink?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Express](https://img.shields.io/badge/Server-Express%205-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
  [![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle%20ORM-orange?style=for-the-badge)](https://orm.drizzle.team/)
  [![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

  ---
</div>

## 🎨 Visual Identity & Design Aesthetics

Singh Cake Delight is crafted with a meticulous visual system that delivers a warm, comforting, and modern bakery storefront experience.

*   **Colors & Palette (Soft Cream & Warm Bakery Theme)**:
    *   **Light Mode**: Features a soft cream-yellow background (`#FFF9E6`), warm beige cards, and rich dark chocolate text (`#2D1E17`), accented with soft pastel pink (`#FDF2FF`) and golden caramel (`#F59E0B`).
    *   **Dark Mode**: Leans gracefully into a deep dark chocolate theme (`#1F130E` / `hsl(12, 25%, 12%)`) with high-contrast cream labels.
*   **Typography**:
    *   **Display Text**: Elegant `'Playfair Display', serif` for headers and key highlights to reinforce a high-end, premium boutique identity.
    *   **Body Text**: Clean `'DM Sans', sans-serif` to ensure modern, accessible, and fatigue-free reading across components.
*   **Micro-Animations & Delighters**:
    *   **Dynamic Cursor Trail**: Custom `CursorTrail.tsx` canvas renderer that draws a smooth, playful pastel star-trail following mouse movement.
    *   **Transitions**: Smooth page routing transitions and scroll-driven hover effects using `framer-motion`.

---

## ⚙️ Tech Stack

The application uses a modern, highly-integrated TypeScript stack spanning client and server layers:

| Layer | Technology | Key Purpose / Feature |
| :--- | :--- | :--- |
| **Frontend** | React 18 & TypeScript | Type-safe, declarative component architecture. |
| **Routing** | Wouter | Lightweight, fast client-side router with a clean hook-based API. |
| **State & Query** | TanStack React Query (v5) | Automatic caching, request deduplication, and zero-config query invalidation. |
| **Animations** | Framer Motion | Fluid animations, card entry hover layouts, and slide-in panels. |
| **UI Components** | Shadcn UI (Radix Primitives) | Accessible, customizable design building blocks (Popovers, Calendars, Dialogs). |
| **Server Engine** | Express.js (v5) | Handles REST API endpoints, security, and static single-page asset hosting. |
| **Database & ORM** | PostgreSQL + Drizzle | Node-Postgres connection engine and Drizzle ORM connecting to local/cloud Postgres instances. |
| **Validation** | Zod & Drizzle-Zod | Strict input validation ensuring fail-safe API payload matching. |
| **Automation** | Nodemailer | Dynamic emails for admin logins, recovery OTPs, and system notifications. |
| **Cloud Sync** | Google Sheets REST API | Real-time service-account integration replicating users, catalog, and orders onto Google Sheets. |
| **Data Export** | SheetJS (xlsx) | Automatic and manual table synchronization to offline Microsoft Excel spreadsheets. |
| **Security** | Helmet & Express Rate Limit | Enforces strict CSP and rate-limiting rules to prevent spam and Stored XSS. |
| **Build Tools** | Vite & tsx | High-speed bundler and hot-module server execution scripts. |

---

## 🔄 Core Workflows & Logic

```mermaid
flowchart TD
    %% Styling
    classDef default fill:#FFFDF6,stroke:#D946EF,stroke-width:1px,color:#2D1E17;
    classDef actor fill:#FDF2FF,stroke:#D946EF,stroke-width:2px,font-weight:bold,color:#D946EF;
    classDef system fill:#FFF5F5,stroke:#DC2626,stroke-width:1.5px,color:#DC2626;

    subgraph Customer Workflow
        C_Start([Customer Auth]) --> C_Browse[Browse Menu & Gallery]
        C_Browse --> C_Form[Fill Booking Form]
        C_Form --> C_Val{"Validate Schedule<br>(Date >= Today+4 Days & Time 7 AM - 8 PM)"}
        C_Val -- Invalid --> C_Form
        C_Val -- Valid --> C_Save[Save Order & Trigger Cloud / Excel Sync]
        C_Save --> C_Confirm[Order Submitted Toast]
        C_Confirm --> C_WA[WhatsApp Order Finalization Redirect]
    end

    subgraph Admin Management Loop
        A_Start([Admin Login]) --> A_Alert[Email Security Alert Dispatched]
        A_Alert --> A_Dash[Access Dashboard]
        A_Dash --> A_Manage[Manage Catalog / Gallery Images]
        A_Orders[Track Live Orders Grid]
        A_Orders --> A_Update[Change Order Status]
        A_Orders --> A_Contact[Contact Customer via Pre-filled WA Link]
        A_Dash --> A_Backup[Sync & Download Tables as Excel Spreadsheets]
    end

    class C_Start,A_Start actor;
    class C_Val,A_Alert system;
```

### 1. How Ordering Works (Step-by-Step Customer Journey)

<div align="center">
  <img src="frontend/public/ordering_workflow.jpg" alt="Singh Cake Delight Ordering Process Workflow" width="720" style="max-width: 100%; border-radius: 12px; margin-bottom: 20px;" />
</div>

Here is a simple, step-by-step walkthrough of how a customer orders a cake on Singh Cake Delight:

1. **Browsing & Ordering**: 
   - A customer visits the bakery website and clicks **Order Now** or goes to customize their cake.
2. **Account Login or Sign-up**: 
   - If they aren't logged in, the website guides them to log in or create a quick account (using their email and password) so their order details and booking history are saved safely.
3. **Configuring the Cake**: 
   - The customer fills out a simple form to choose their cake flavor, select size/tiers, describe modifications, and upload a photo of their desired custom design.
4. **Selecting a Delivery Date & Time**: 
   - The customer picks when they want to receive the cake:
     - **Preparation Rule**: The delivery date must be at least **4 days in advance** so the bakers have time to prepare custom designs.
     - **Delivery Hours**: Times must fall within bakery hours (**7:00 AM to 8:00 PM**).
5. **Placing the Order**: 
   - The customer clicks **Place Order**. Behind the scenes, the website automatically:
     - Saves the order in the bakery database.
     - Syncs details to the bakery's live **Google Sheet**.
     - Updates the local **Excel Spreadsheet** logs.
     - Sends a confirmation **email receipt** directly to the customer's inbox.
6. **Finalizing on WhatsApp**: 
   - The website redirects the customer to WhatsApp with a pre-written message containing their Order ID. Sending this text lets the baker verify payment and finalize customization details directly with the customer.

### 2. Admin Security & Dashboard Loop
*   **Admin Shield**: The Admin Dashboard is restricted to a dedicated email. Upon successful authentication:
    *   **Email Alert Dispatch**: The server geolocates the incoming IP address (using IP-API), parses the device User-Agent, formats the timestamps into Indian Standard Time (IST), and emails a stylized security alert to the admin inbox.
    *   **Secure OTP Loop**: Forgotten admin passwords trigger a 6-digit verification code sent via Nodemailer. Once verified, the server hashes the new password using scrypt, updates the database, writes it directly back to the secure `.env` file, and pushes it to active memory.

### 3. Admin Dashboard Control Loop
*   **Live Order Tracking Grid**: Displayed in a responsive table layout. Admins can view order states, details, custom notes, and click customer references to open a fullscreen image preview overlay.
*   **Status Management**: Admins can change order status (Pending ⇄ Completed) with a single click, or permanently delete requests.
*   **Art Catalog & Gallery Control**: Admins can add, edit, or delete items directly from the catalog (which updates the customer menu in real-time) and manage the home gallery images.
*   **Database Excel Backups & Settings**:
    *   **Auto Sync**: Database updates automatically sync to Excel and Google Sheets tables.
    *   **Configuration Manager**: Allows resetting passwords and checking active system logs inside the browser.

---

## 📂 Project Directory Structure

```text
├── backend/               # Express server implementation
│   ├── auth.ts            # Password hashing, verification, & session cookies
│   ├── db.ts              # PostgreSQL database configuration via Drizzle
│   ├── email.ts           # SMTP Nodemailer configs & local audit logging fallback
│   ├── excel.ts           # Spreadsheet export & sync logic (SheetJS)
│   ├── googleSheets.ts    # Google Sheets API client & in-memory JWT signer
│   ├── index.ts           # Global server setup, CSP (Helmet), & static file router
│   ├── migration.ts       # Database migrations & structure initialization
│   ├── routes.ts          # API Endpoints (Auth, Orders, Products, OTP, Metrics)
│   ├── static.ts          # Production asset serving configuration
│   └── storage.ts         # SQL database query interface & repository layer
├── shared/                # Code shared between frontend and backend
│   ├── schema.ts          # Database tables, Drizzle definitions, & Zod schemas
│   └── routes.ts          # Client-Server API route constant definitions
├── frontend/              # Single Page Application frontend
│   ├── public/            # Static assets (images, icons, vectors)
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── ui/        # Accessible Radix primitives customized for the bakery theme
│   │   │   ├── Navbar.tsx # Glassmorphism navigation bar
│   │   │   ├── Footer.tsx # Footer structure
│   │   │   └── CursorTrail.tsx # Canvas mouse trailing animation
│   │   ├── hooks/         # Custom React hooks (theming, state queries)
│   │   ├── lib/           # Helper scripts (Tailwind merger, API client queries)
│   │   ├── pages/         # Full-page views
│   │   │   ├── Home.tsx   # Public boutique showcase, catalog, & booking form
│   │   │   ├── Admin.tsx  # Order console, catalog, & db actions
│   │   │   ├── Auth.tsx   # Login, registration, & OTP interfaces
│   │   │   └── not-found.tsx # Custom 404 handler
│   │   ├── index.css      # Core tailwind directives, CSS variables, & design tokens
│   │   └── main.tsx       # SPA bootstrap entrypoint
│   └── index.html         # Frontend main mounting index
├── drizzle.config.ts      # Drizzle migration parameters & schemas mapping
├── tailwind.config.ts     # Styling layout custom metrics, extensions & animations
└── package.json           # Package manifests & scripts
```

---

## 🚀 Installation & Local Development

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   PostgreSQL instance (local or cloud like Supabase/Neon)

### 1. Environment Configuration
Create a `.env` file in the root directory:
```env
# Administrative Password
ADMIN_PASSWORD=your_secure_password_here

# PostgreSQL Database Connection URL (required)
DATABASE_URL="postgresql://username:password@hostname:5432/database"

# Google Sheets Integration (required for Sheets sync, optional for core features)
GOOGLE_SPREADSHEET_ID="your_google_sheet_id_here"
GCP_CLIENT_EMAIL="sheets-sync@your-project-id.iam.gserviceaccount.com"
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key_lines_here\n-----END PRIVATE KEY-----"

# SMTP Email Configuration (optional; logs to sent_emails.log if omitted)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=singhcakedelight1981.official@gmail.com
```
> [!NOTE]
> If SMTP environment variables are left empty, the server will gracefully fall back to local file logging. All emails (e.g., OTP codes, login alerts) will be logged to [sent_emails.log](file:///d:/ASHISH%20GITHUB/SINGH-CAKE-DELIGHT/sent_emails.log) inside the project root for local testing.

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Database Schema Push
Push your schema changes and initialize the PostgreSQL database tables:
```bash
npm run db:push
```

### 4. Running the Development Server
Launch the full-stack development environment (Vite HMR + Express server):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5000` to preview the site.

---

## 📦 Production Deployment (Vercel Serverless)

This application is fully optimized for serverless hosting on **Vercel** with a decoupled frontend/backend router configuration.

### Vercel Routing Configuration (`vercel.json`)
The routing configuration is managed by the root [`vercel.json`](file:///d:/ASHISH%20GITHUB/SINGH-CAKE-DELIGHT/vercel.json):
*   Routes `/api/*` requests directly to the serverless function handler (`backend/index.ts`).
*   Serves compiled frontend static assets natively at the CDN level.
*   Enforces fallback routing to `/index.html` to support React client-side routing.

### Critical Database Connection Rules on Vercel
> [!IMPORTANT]
> **Use Supabase Connection Pooler (Port 6543)**
> Supabase direct database hostnames (`db.[project-id].supabase.co`) are **IPv6-only**. Because Vercel serverless containers do not support outbound IPv6 network resolutions, using the direct hostname will result in `getaddrinfo ENOTFOUND` errors.
>
> You **MUST** configure the `DATABASE_URL` in Vercel to use the **Supabase Transaction Pooler** (which resolves to IPv4 and runs on port **`6543`**).
>
> **Format:**
> ```text
> postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
> ```
> *Note: Be sure to append the project ID to the username (`postgres.[PROJECT_ID]`) so the pooler can identify your database tenant, and percent-encode any special characters in the password (e.g., `@` as `%40`).*

### ES Modules ESM Rules
The project compiles as standard ES Modules (`"type": "module"`). In accordance with strict ESM rules:
*   All relative imports in the backend must include explicit file extensions (e.g., `import { db } from "./db.js";`).
*   Express static serving is automatically bypassed on Vercel (`!process.env.VERCEL`) to prevent container boot crashes caused by the missing public directory in serverless builds.

---

## 🔒 Stateless Sessions & Spreadsheet Safeguards

### 1. Stateless Session Persistence
To ensure that admin and user authentication sessions survive Vercel serverless scale-downs, container resets, and cold starts, this application uses **stateless, client-side signed cookies** via `cookie-session`.
* Sessions do not rely on server RAM (`MemoryStore`), which would get wiped on container boots.
* Session tokens are signed using the `SESSION_SECRET` key to prevent client tampering.

### 2. Excel Cell Size Limit Protection
Excel (`.xlsx` files generated by SheetJS) has a strict cell length limit of **32,767 characters**. Custom cake design uploads contain heavy base64 image data strings that exceed this limit and will crash the exporter.
* The exporter automatically omits base64 image strings and replaces them with a clean placeholder (`[Custom Image Uploaded]`).
* Direct database records are kept intact; only the exports are sanitized for safety.

### 3. Google Sheets Private Key Formatting
When configuring `GCP_PRIVATE_KEY` for Google Cloud Service Account authentication:
* Copy the private key value exactly as it is represented in the downloaded JSON credentials file (with literal `\n` sequence characters on a single line).
* This prevents cryptographic decryption errors (`DECODER routines::unsupported`) in Node's crypto modules.