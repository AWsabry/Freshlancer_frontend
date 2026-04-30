# Freshlancer Frontend

Modern React frontend for the Freshlancer platform - A student freelance marketplace with advanced features.

## Features

### Student Features
- **Student Verification System** - Upload documents for admin approval
- **Subscription Management** - Free tier (10 apps/month) vs Premium ($19.99/month unlimited)
- **Job Browsing & Application** - Structured applications (no free-text, only dropdowns/numbers)
- **Contract Management** - Milestone-based project tracking
- **Profile Management** - Skills, portfolio, intro video
- **Reviews & Ratings** - Mutual review system

### Client Features
- **Points-Based Profile Access** - Purchase packages to unlock student profiles
  - Basic: $29.99 (50 points)
  - Professional: $79.99 (150 points)
  - Enterprise: $249.99 (500 points)
- **Anonymized Profiles** - Preview limited info before unlocking (10 points each)
- **Job Posting** - Create jobs (open or invite-only)
- **Application Management** - Review, accept, reject applicants
- **Contract Creation** - Create milestone-based contracts
- **Messaging** - Initiate conversations with students

### Admin Features
- **Verification Management** - Approve/reject student verifications
- **User Management** - Suspend/manage all users
- **System Monitoring** - Revenue stats, transaction tracking
- **Review Moderation** - Hide inappropriate reviews

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool & dev server
- **React Router v7** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form validation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   ├── Loading.jsx
│   │   ├── Alert.jsx
│   │   └── ProtectedRoute.jsx
│   ├── student/         # Student-specific components
│   ├── client/          # Client-specific components
│   └── admin/           # Admin-specific components
├── pages/
│   ├── student/         # Student dashboard & pages
│   ├── client/          # Client dashboard & pages
│   └── admin/           # Admin dashboard & pages
├── services/            # API service layer
│   ├── api.js           # Axios instance with interceptors
│   ├── authService.js
│   ├── verificationService.js
│   ├── subscriptionService.js
│   ├── packageService.js
│   ├── jobService.js
│   ├── applicationService.js
│   ├── profileService.js
│   ├── conversationService.js
│   ├── contractService.js
│   ├── notificationService.js
│   ├── reviewService.js
│   └── transactionService.js
├── stores/
│   └── authStore.js     # Zustand auth store
├── layouts/
│   └── DashboardLayout.jsx
├── App.jsx              # Route configuration
└── main.jsx             # App entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (default `http://localhost:8080`—match `VITE_API_BASE_URL` in `.env`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## API Integration

The dev server proxies `/api` to `VITE_API_BASE_URL` from your env (see `vite.config.js`). Point `VITE_API_BASE_URL` at the same host/port as your local API (commonly `http://localhost:8080`).

All API requests are handled through `src/services/api.js` which:
- Automatically adds JWT tokens from localStorage
- Handles 401 errors and redirects to login
- Returns unwrapped response data

## Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token included in all API requests via interceptor
4. Role-based routing redirects to appropriate dashboard

## Key Business Logic

### 1. Student Verification (Required)
- Students must upload verification documents
- Admin approves/rejects within 24-48 hours
- Cannot apply for jobs until verified

### 2. Application Limits
- Free tier: 10 applications/month
- Premium: Unlimited applications
- Auto-resets monthly
- Enforced before submitting applications

### 3. Points System (Client Monetization)
- Clients purchase packages (Basic/Pro/Enterprise)
- Each profile unlock costs 10 points
- Anonymized preview shows limited data
- Full profile shows name, contact, portfolio

### 4. Chat Restrictions
- Students CANNOT initiate conversations
- Only clients/admins can start chats
- Students can only respond

### 5. Structured Applications
- NO free-text fields in applications
- Only dropdowns and numbers allowed
- Enforces structured data collection

## Component Usage Examples

### Button Component
```jsx
<Button variant="primary" loading={isLoading} onClick={handleClick}>
  Submit
</Button>
```

Variants: `primary`, `secondary`, `outline`, `danger`, `success`

### Input Component
```jsx
<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  {...register('email')}
/>
```

### Card Component
```jsx
<Card title="My Card" actions={<Button>Action</Button>}>
  Content goes here
</Card>
```

### Badge Component
```jsx
<Badge variant="success">Approved</Badge>
```

Variants: `success`, `warning`, `error`, `info`, `primary`

## Environment Variables

Vite injects only variables prefixed with `VITE_`. Copy [`.env.example`](.env.example) to `.env` for local development, and use `.env.production` for production builds (`npm run build` loads it automatically per [Vite env modes](https://vitejs.dev/guide/env-and-mode.html)).

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API origin (no trailing slash), e.g. `http://localhost:8080` in dev, your HTTPS API in production |
| `VITE_CANONICAL_ORIGIN` | Public site origin for Open Graph and sharing (required for production; set in `.env.production`) |
| `VITE_ENCRYPTION_KEY` | Must match the API `ENCRYPTION_KEY` where client-side crypto is used |
| `VITE_PAYMOB_PUBLIC_KEY` | Must match the API Paymob public key and environment (test vs live) |

**Dev vs production:** use `.env` / `.env.development` for daily work (test API), and `.env.production` for the live API URL and canonical origin when you run `npm run build`.

## Deployment

### Production Build

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## API Endpoints Used

### Authentication
- `POST /users/signup` - Register
- `POST /users/login` - Login

### Student Verification
- `POST /verifications/upload` - Upload document
- `GET /verifications/me` - Get my verifications
- `GET /verifications/status` - Check status

### Subscriptions
- `GET /subscriptions/me` - Get subscription
- `GET /subscriptions/check-limit` - Check application limit
- `POST /subscriptions/upgrade` - Upgrade to premium

### Client Packages
- `GET /packages/available` - Available packages
- `POST /packages/purchase` - Purchase package
- `GET /packages/points-balance` - Points balance

### Profile Access
- `POST /profiles/anonymized` - Get anonymized profile (free)
- `POST /profiles/unlock` - Unlock full profile (costs 10 points)

### Jobs & Applications
- `GET /jobs` - Browse jobs
- `POST /applications` - Apply to job
- `GET /applications/me` - My applications

### Contracts
- `POST /contracts` - Create contract
- `POST /contracts/:id/milestones/:milestoneId/submit` - Submit milestone

### Notifications
- `GET /notifications` - Get notifications
- `GET /notifications/unread-count` - Unread count

## Troubleshooting

### API Connection Issues
- Ensure the backend is running and matches `VITE_API_BASE_URL` in `.env`
- Check proxy configuration in `vite.config.js`
- Verify CORS is enabled on backend

### Authentication Errors
- Clear localStorage and login again
- Check JWT token expiration
- Verify backend auth endpoints

### Build Errors
- Delete `node_modules` and run `npm install`
- Clear Vite cache: `npm run dev -- --force`

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

Proprietary - Freshlancer Platform

## Support

For support, email support@freshlancer.com
