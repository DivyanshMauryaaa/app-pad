# FixFlow Developer Guide

Complete guide for developers working with FixFlow - from setup to deployment.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [Development Workflow](#development-workflow)
5. [API Integration](#api-integration)
6. [Database Operations](#database-operations)
7. [Authentication](#authentication)
8. [GitHub Integration](#github-integration)
9. [AI Features](#ai-features)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Best Practices](#best-practices)

## Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- **PostgreSQL** database (or Supabase account)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fixflow.git
cd fixflow

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
fixflow/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API routes
│   │   │   ├── ai/           # AI-powered endpoints
│   │   │   ├── github/       # GitHub integration
│   │   │   └── stripe/       # Payment processing
│   │   ├── apps/             # Main application pages
│   │   │   └── [id]/         # Dynamic app routes
│   │   ├── repo/             # Repository browser
│   │   ├── sign-in/          # Authentication pages
│   │   ├── sign-up/
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/            # React components
│   │   ├── app/              # Application-specific components
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── supabase/             # Database configuration
│   └── middleware.ts         # Next.js middleware
├── public/                    # Static assets
├── docs/                      # Documentation
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.ts
```

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# GitHub App Integration
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYour private key here\n-----END RSA PRIVATE KEY-----"
GITHUB_INSTALLATION_ID=87654321

# Google AI (Gemini)
NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY=your_google_ai_key_here

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Database Setup

1. **Create Supabase Project**:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Copy the URL and anon key

2. **Run Database Migrations**:
   ```bash
   # Execute the schema file
   psql -h your-supabase-host -d postgres -U postgres -f src/supabase/schemea.sql
   ```

3. **Set up Row Level Security** (RLS):
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   ALTER TABLE vault ENABLE ROW LEVEL SECURITY;
   ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;

   -- Create policies for user access
   CREATE POLICY "Users can view own apps" ON apps
     FOR SELECT USING (user_id = auth.jwt() ->> 'sub');
   
   CREATE POLICY "Users can insert own apps" ON apps
     FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');
   ```

### GitHub App Setup

1. **Create GitHub App**:
   - Go to GitHub Settings > Developer settings > GitHub Apps
   - Click "New GitHub App"
   - Fill in the required information:
     - **App name**: Your app name
     - **Homepage URL**: `https://your-domain.com`
     - **Callback URL**: `https://your-domain.com/api/github/callback`
     - **Webhook URL**: `https://your-domain.com/api/github/webhook`

2. **Set Permissions**:
   - Repository permissions:
     - Contents: Read
     - Issues: Read & Write
     - Metadata: Read
     - Pull requests: Read & Write

3. **Generate Private Key**:
   - Download the private key
   - Add it to your environment variables

## Development Workflow

### Running the Development Server

```bash
# Start with Turbopack (faster)
npm run dev

# Standard Next.js dev server
next dev

# Run on specific port
npm run dev -- -p 3001
```

### Code Organization

#### Components

Create new components in appropriate directories:

```bash
# UI components (reusable)
src/components/ui/new-component.tsx

# Application-specific components
src/components/app/feature-component.tsx
```

#### API Routes

Create API routes following the established pattern:

```bash
# AI endpoints
src/app/api/ai/new-feature/route.ts

# GitHub endpoints
src/app/api/github/new-endpoint/route.ts
```

#### Custom Hooks

Create custom hooks for reusable logic:

```typescript
// src/hooks/use-custom-hook.ts
import { useState, useEffect } from 'react';

export function useCustomHook(param: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Hook logic here
  }, [param]);
  
  return { data, loading };
}
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting errors
npm run lint -- --fix

# Type checking
npx tsc --noEmit
```

## API Integration

### Creating New API Endpoints

Follow this pattern for new API routes:

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const param = searchParams.get('param');

    // Validate inputs
    if (!param) {
      return NextResponse.json({ error: 'Missing param' }, { status: 400 });
    }

    // Process request
    const result = await processData(param);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // Validate body schema
    
    const result = await createData(body, userId);
    
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

### Error Handling

Implement consistent error handling:

```typescript
// src/lib/api-utils.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Database Operations

### Using Supabase Client

```typescript
// Basic CRUD operations
import supabase from '@/supabase/client';

// Create
async function createApp(appData: AppData, userId: string) {
  const { data, error } = await supabase
    .from('apps')
    .insert({
      ...appData,
      user_id: userId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Read
async function getApps(userId: string) {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Update
async function updateApp(appId: string, updates: Partial<AppData>) {
  const { data, error } = await supabase
    .from('apps')
    .update(updates)
    .eq('id', appId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete
async function deleteApp(appId: string) {
  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', appId);

  if (error) throw error;
}
```

### Real-time Subscriptions

```typescript
// Listen to database changes
function useRealtimeApps(userId: string) {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('apps_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apps',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setApps(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setApps(prev => prev.map(app => 
              app.id === payload.new.id ? payload.new : app
            ));
          } else if (payload.eventType === 'DELETE') {
            setApps(prev => prev.filter(app => app.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return apps;
}
```

## Authentication

### Using Clerk

#### Protecting Routes

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

#### Server-Side Authentication

```typescript
// In API routes
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Proceed with authenticated logic
}
```

#### Client-Side Authentication

```typescript
// In React components
import { useUser, useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  if (!user) return <div>Please sign in</div>;
  
  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## GitHub Integration

### Setting Up GitHub App Authentication

```typescript
// src/lib/github-auth.ts
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

export function createGitHubClient(installationId: string) {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      installationId: installationId,
    },
  });
}
```

### Repository Operations

```typescript
// Fetch repository contents
async function getRepoContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string = ''
) {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  return Array.isArray(data) ? data : [data];
}

// Create or update files
async function updateFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string
) {
  // Get current file SHA if it exists
  let sha: string | undefined;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    if ('sha' in data) {
      sha = data.sha;
    }
  } catch (error) {
    // File doesn't exist, that's fine
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha && { sha }),
  });
}
```

## AI Features

### Integrating with Google Gemini

```typescript
// src/lib/ai-client.ts
interface AIRequest {
  prompt: string;
  context?: string;
  model?: string;
}

export async function generateContent({ prompt, context, model = 'gemini-2.0-flash' }: AIRequest) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY!
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: context ? `${context}\n\n${prompt}` : prompt
          }]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}
```

### Creating AI-Powered Features

```typescript
// Example: Code review feature
async function generateCodeReview(code: string, context?: string) {
  const prompt = `
    Please review the following code and provide:
    1. Code quality assessment
    2. Potential bugs or issues
    3. Performance improvements
    4. Best practice recommendations
    
    Code to review:
    \`\`\`
    ${code}
    \`\`\`
  `;

  const review = await generateContent({
    prompt,
    context: context ? `Context: ${context}` : undefined
  });

  return review;
}
```

## Testing

### Setting Up Tests

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

### Component Testing

```typescript
// src/__tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });
});
```

### API Testing

```typescript
// src/__tests__/api/apps.test.ts
import { GET, POST } from '@/app/api/apps/route';
import { NextRequest } from 'next/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' }))
}));

describe('/api/apps', () => {
  test('GET returns user apps', async () => {
    const request = new NextRequest('http://localhost:3000/api/apps');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data.apps)).toBe(true);
  });

  test('POST creates new app', async () => {
    const appData = {
      name: 'Test App',
      description: 'Test Description'
    };
    
    const request = new NextRequest('http://localhost:3000/api/apps', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.app.name).toBe('Test App');
  });
});
```

## Deployment

### Vercel Deployment

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Environment Variables**:
   ```bash
   # Add all environment variables in Vercel dashboard
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=...
   # ... etc
   ```

3. **Build Configuration**:
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Database Migrations

```bash
# Production migration script
#!/bin/bash
set -e

echo "Running database migrations..."

# Run schema updates
psql $DATABASE_URL -f src/supabase/migrations/001_initial.sql

# Update RLS policies
psql $DATABASE_URL -f src/supabase/migrations/002_rls_policies.sql

echo "Migrations completed successfully"
```

## Best Practices

### Code Organization

1. **Component Structure**:
   ```typescript
   // components/feature/MyComponent.tsx
   interface MyComponentProps {
     // Props interface first
   }
   
   export function MyComponent({ prop1, prop2 }: MyComponentProps) {
     // Hooks at the top
     const [state, setState] = useState();
     
     // Event handlers
     const handleClick = () => {
       // Handler logic
     };
     
     // Early returns
     if (!data) return <Loading />;
     
     // Main render
     return (
       <div>
         {/* Component JSX */}
       </div>
     );
   }
   ```

2. **Custom Hooks**:
   ```typescript
   // hooks/use-api-data.ts
   export function useApiData<T>(url: string) {
     const [data, setData] = useState<T | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     
     useEffect(() => {
       let cancelled = false;
       
       const fetchData = async () => {
         try {
           setLoading(true);
           const response = await fetch(url);
           if (!response.ok) throw new Error('Failed to fetch');
           
           const result = await response.json();
           if (!cancelled) {
             setData(result);
             setError(null);
           }
         } catch (err) {
           if (!cancelled) {
             setError(err instanceof Error ? err.message : 'Unknown error');
           }
         } finally {
           if (!cancelled) {
             setLoading(false);
           }
         }
       };
       
       fetchData();
       
       return () => {
         cancelled = true;
       };
     }, [url]);
     
     return { data, loading, error };
   }
   ```

### Performance Optimization

1. **Code Splitting**:
   ```typescript
   // Lazy load heavy components
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   
   function MyPage() {
     return (
       <Suspense fallback={<Loading />}>
         <HeavyComponent />
       </Suspense>
     );
   }
   ```

2. **Memoization**:
   ```typescript
   // Memoize expensive calculations
   const expensiveValue = useMemo(() => {
     return heavyCalculation(data);
   }, [data]);
   
   // Memoize callback functions
   const handleClick = useCallback(() => {
     onItemClick(item.id);
   }, [item.id, onItemClick]);
   ```

3. **Database Optimization**:
   ```typescript
   // Use indexes for frequent queries
   CREATE INDEX idx_apps_user_id ON apps(user_id);
   CREATE INDEX idx_documents_app_id ON documents(app_id);
   
   // Limit and paginate large datasets
   const { data } = await supabase
     .from('apps')
     .select('*')
     .range(0, 9) // Get first 10 items
     .order('created_at', { ascending: false });
   ```

### Security Considerations

1. **Input Validation**:
   ```typescript
   // Use Zod for schema validation
   import { z } from 'zod';
   
   const appSchema = z.object({
     name: z.string().min(1).max(100),
     description: z.string().max(500).optional(),
     homepage: z.string().url().optional(),
   });
   
   export async function POST(req: NextRequest) {
     const body = await req.json();
     const validated = appSchema.parse(body); // Throws if invalid
     // ... rest of handler
   }
   ```

2. **Rate Limiting**:
   ```typescript
   // Implement rate limiting for API routes
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '1 m'),
   });
   
   export async function POST(req: NextRequest) {
     const ip = req.ip ?? '127.0.0.1';
     const { success } = await ratelimit.limit(ip);
     
     if (!success) {
       return NextResponse.json(
         { error: 'Too many requests' },
         { status: 429 }
       );
     }
     
     // ... rest of handler
   }
   ```

### Error Handling

1. **Error Boundaries**:
   ```typescript
   // components/ErrorBoundary.tsx
   class ErrorBoundary extends Component<
     { children: ReactNode },
     { hasError: boolean }
   > {
     constructor(props: { children: ReactNode }) {
       super(props);
       this.state = { hasError: false };
     }
     
     static getDerivedStateFromError() {
       return { hasError: true };
     }
     
     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
       console.error('Error caught by boundary:', error, errorInfo);
       // Log to error reporting service
     }
     
     render() {
       if (this.state.hasError) {
         return <ErrorFallback />;
       }
       
       return this.props.children;
     }
   }
   ```

2. **Global Error Handling**:
   ```typescript
   // lib/error-handler.ts
   export function setupGlobalErrorHandler() {
     if (typeof window !== 'undefined') {
       window.addEventListener('unhandledrejection', (event) => {
         console.error('Unhandled promise rejection:', event.reason);
         // Report to error service
       });
       
       window.addEventListener('error', (event) => {
         console.error('Global error:', event.error);
         // Report to error service
       });
     }
   }
   ```

This developer guide provides comprehensive information for working with the FixFlow codebase. Follow these patterns and practices to maintain code quality and consistency across the project.