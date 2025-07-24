# FixFlow API Documentation

## Table of Contents

1. [Overview](#overview)
2. [REST API Endpoints](#rest-api-endpoints)
3. [React Components](#react-components)
4. [Custom Hooks](#custom-hooks)
5. [Utility Functions](#utility-functions)
6. [Database Schema](#database-schema)
7. [Configuration](#configuration)
8. [Examples](#examples)

## Overview

FixFlow is an AI-powered platform that helps developers and indie makers manage their software business. It provides features for documentation generation, project management, GitHub integration, and AI-powered assistance.

**Tech Stack:**
- Frontend: Next.js 15 with TypeScript
- Styling: Tailwind CSS
- Authentication: Clerk
- Database: Supabase
- AI Integration: Google Gemini
- GitHub Integration: Octokit

## REST API Endpoints

### AI-Powered Endpoints

#### POST /api/ai/create-doc
Generate AI-powered documentation from code and repository context.

**Request Body:**
```typescript
{
  prompt: string;           // Documentation prompt/request
  owner?: string;          // GitHub repository owner
  repo?: string;           // GitHub repository name
  installationId?: string; // GitHub app installation ID
  app_id?: string;         // Application ID
  user_id?: string;        // User ID
  file_path?: string;      // Specific file path to document
}
```

**Response:**
```typescript
{
  title: string;    // Generated document title
  content: string;  // Generated markdown content
}
```

**Example:**
```bash
curl -X POST /api/ai/create-doc \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate documentation for authentication system",
    "owner": "myorg",
    "repo": "myproject",
    "installationId": "12345"
  }'
```

#### POST /api/ai/chat
AI-powered chat interface with repository context.

**Request Body:**
```typescript
{
  message: string;         // User message
  history?: Array<{        // Chat history
    role: 'user' | 'assistant';
    content: string;
  }>;
  owner?: string;          // GitHub repository owner
  repo?: string;           // GitHub repository name
  installationId?: string; // GitHub app installation ID
  app_id?: string;         // Application ID
  user_id?: string;        // User ID
  repoContext?: string;    // Additional repository context
}
```

**Response:**
```typescript
{
  response: string; // AI-generated response
}
```

#### POST /api/ai/code-review
Generate AI-powered code reviews.

**Request Body:**
```typescript
{
  code: string;            // Code to review
  context?: string;        // Additional context
  owner?: string;          // GitHub repository owner
  repo?: string;           // GitHub repository name
  installationId?: string; // GitHub app installation ID
}
```

#### POST /api/ai/report-bugs
AI-powered bug reporting and analysis.

**Request Body:**
```typescript
{
  description: string;     // Bug description
  context?: string;        // Additional context
  severity?: string;       // Bug severity level
}
```

#### POST /api/ai/create-todo-list
Generate AI-powered todo lists from project descriptions.

**Request Body:**
```typescript
{
  project: string;         // Project description
  context?: string;        // Additional context
}
```

### GitHub Integration Endpoints

#### GET /api/github/repo
Fetch GitHub repository contents and structure.

**Query Parameters:**
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `path` (optional): Specific path within repository
- `installation_id` (required): GitHub app installation ID

**Response:**
```typescript
// Array of repository contents or single file/directory
Array<{
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;     // Base64 encoded for files
  size?: number;
  download_url?: string;
}>
```

**Example:**
```bash
curl "/api/github/repo?owner=myorg&repo=myproject&installation_id=12345"
```

#### GET /api/github/callback
GitHub OAuth callback handler for app installation.

**Query Parameters:**
- `installation_id`: GitHub app installation ID
- `state`: Application state parameter

### Payment Integration

#### POST /api/create-checkout-session
Create Stripe checkout session for subscription.

**Request Body:**
```typescript
{
  priceId: string;  // Stripe price ID
  userId: string;   // User ID
  appId: string;    // Application ID
}
```

#### POST /api/stripe
Stripe webhook handler for payment events.

## React Components

### UI Components

#### Button
A flexible button component with multiple variants and sizes.

```typescript
interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

function Button(props: ButtonProps): JSX.Element
```

**Example:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Click me
</Button>
```

#### Card
A card container component with header, content, and footer sections.

```typescript
function Card(props: React.ComponentProps<"div">): JSX.Element
function CardHeader(props: React.ComponentProps<"div">): JSX.Element
function CardTitle(props: React.ComponentProps<"div">): JSX.Element
function CardDescription(props: React.ComponentProps<"div">): JSX.Element
function CardContent(props: React.ComponentProps<"div">): JSX.Element
function CardFooter(props: React.ComponentProps<"div">): JSX.Element
```

**Example:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Input
A styled input component.

```typescript
interface InputProps extends React.ComponentProps<"input"> {}
function Input(props: InputProps): JSX.Element
```

#### Dialog
Modal dialog component with trigger, content, and action areas.

```typescript
function Dialog(props: DialogProps): JSX.Element
function DialogTrigger(props: DialogTriggerProps): JSX.Element
function DialogContent(props: DialogContentProps): JSX.Element
function DialogHeader(props: DialogHeaderProps): JSX.Element
function DialogTitle(props: DialogTitleProps): JSX.Element
function DialogDescription(props: DialogDescriptionProps): JSX.Element
```

#### Select
Dropdown select component with options.

```typescript
function Select(props: SelectProps): JSX.Element
function SelectTrigger(props: SelectTriggerProps): JSX.Element
function SelectValue(props: SelectValueProps): JSX.Element
function SelectContent(props: SelectContentProps): JSX.Element
function SelectItem(props: SelectItemProps): JSX.Element
```

#### ThemeSwitcher
A component for switching between light and dark themes.

```typescript
function ThemeSwitcher(): JSX.Element
```

**Example:**
```tsx
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

<ThemeSwitcher />
```

### Application Components

#### AddAppDialog
Dialog for creating new applications.

```typescript
function AddAppDialog(): JSX.Element
```

**Features:**
- App name input
- Description textarea
- Homepage URL input
- GitHub repository URL input
- Validates and submits to Supabase

**Example:**
```tsx
import AddAppDialog from '@/components/app/AddAppDialog';

<AddAppDialog />
```

#### MdRenderer
Markdown renderer with syntax highlighting and GitHub-flavored markdown support.

```typescript
interface MdRendererProps {
  content: string; // Markdown content to render
}

function MdRenderer(props: MdRendererProps): JSX.Element
```

**Features:**
- GitHub-flavored markdown (GFM)
- Syntax highlighting
- Auto-linked headings
- Custom styling for tables, checkboxes
- Responsive design

**Example:**
```tsx
import MdRenderer from '@/components/mdrenderer';

<MdRenderer content="# Hello\nThis is **markdown** content" />
```

#### RepoBrowser
GitHub repository browser with file exploration.

```typescript
interface RepoBrowserProps {
  installationId: string; // GitHub app installation ID
  githubRepo: string;     // Repository URL
  app: any;              // Application object
}

function RepoBrowser(props: RepoBrowserProps): JSX.Element
```

**Features:**
- Repository file tree navigation
- File content display
- Integration with GitHub API
- Loading states and error handling

## Custom Hooks

### useRepoData
Hook for fetching and managing GitHub repository data.

```typescript
interface RepoDataOptions {
  owner: string;        // Repository owner
  repo: string;         // Repository name
  installationId: string; // GitHub app installation ID
  path?: string;        // Optional path within repository
}

interface RepoDataReturn {
  contents: FileContent[];     // Repository contents
  loading: boolean;           // Loading state
  error: string;              // Error message
  limitWarning: string;       // Warning about content limits
  limits: {                   // Content limits
    maxFiles: number;
    maxLinesPerFile: number;
  };
}

function useRepoData(options: RepoDataOptions): RepoDataReturn
```

**Features:**
- Automatic content fetching
- File and line limits for performance
- Error handling
- Loading states

**Example:**
```tsx
import { useRepoData } from '@/hooks/use-repo-data';

function MyComponent() {
  const { contents, loading, error } = useRepoData({
    owner: 'myorg',
    repo: 'myproject',
    installationId: '12345'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {contents.map(file => (
        <div key={file.path}>{file.name}</div>
      ))}
    </div>
  );
}
```

### useIsSubscribed
Hook for checking user subscription status.

```typescript
function useIsSubscribed(appId: string): string | null
```

**Returns:** Subscription status or null

**Example:**
```tsx
import { useIsSubscribed } from '@/hooks/use-is-subscribed';

function SubscriptionStatus({ appId }: { appId: string }) {
  const isSubscribed = useIsSubscribed(appId);
  
  return (
    <div>
      Status: {isSubscribed ? 'Active' : 'Inactive'}
    </div>
  );
}
```

### useIsMobile
Hook for responsive design detection.

```typescript
function useIsMobile(): boolean
```

**Returns:** Boolean indicating if the current viewport is mobile-sized

**Example:**
```tsx
import { useIsMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      Content
    </div>
  );
}
```

## Utility Functions

### cn
Utility function for merging CSS classes with conflict resolution.

```typescript
function cn(...inputs: ClassValue[]): string
```

**Example:**
```tsx
import { cn } from '@/lib/utils';

const className = cn(
  'base-class',
  condition && 'conditional-class',
  { 'object-class': true }
);
```

### fetchAllRepoFilesWithContent
Recursively fetch all files from a GitHub repository with their content.

```typescript
interface FetchOptions {
  octokit: any;     // Octokit instance
  owner: string;    // Repository owner
  repo: string;     // Repository name
  path?: string;    // Starting path (optional)
}

async function fetchAllRepoFilesWithContent(
  options: FetchOptions
): Promise<Array<{ path: string; content: string }>>
```

**Example:**
```tsx
import { fetchAllRepoFilesWithContent } from '@/lib/github';

const files = await fetchAllRepoFilesWithContent({
  octokit,
  owner: 'myorg',
  repo: 'myproject'
});
```

## Database Schema

### Apps Table
Main application entities.

```sql
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    homepage TEXT,
    github_repo TEXT,
    github_installation_id TEXT,
    is_subscribed TEXT DEFAULT 'false',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Documents Table
Application documentation storage.

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'markdown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Vault Table
Environment variables and secrets storage.

```sql
CREATE TABLE vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Todos Table
Task management.

```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    description TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Bugs Table
Bug tracking and management.

```sql
CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    resolved BOOLEAN DEFAULT false,
    description TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration

### Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# GitHub App
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
GITHUB_INSTALLATION_ID=

# Google AI
NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Next.js Configuration

```typescript
// next.config.ts
const config = {
  experimental: {
    turbo: true,
  },
  // Other configurations
};
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
};
```

## Examples

### Complete Application Setup

```tsx
// 1. Create a new app
import { useState } from 'react';
import supabase from '@/supabase/client';

function CreateApp() {
  const [app, setApp] = useState(null);
  
  const createApp = async () => {
    const { data, error } = await supabase
      .from('apps')
      .insert({
        name: 'My New App',
        description: 'App description',
        user_id: 'user-123',
        homepage: 'https://myapp.com',
        github_repo: 'https://github.com/user/repo'
      })
      .select()
      .single();
    
    if (error) throw error;
    setApp(data);
  };
  
  return (
    <button onClick={createApp}>
      Create App
    </button>
  );
}
```

### AI Documentation Generation

```tsx
// 2. Generate documentation with AI
async function generateDocumentation() {
  const response = await fetch('/api/ai/create-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Generate API documentation for user authentication',
      owner: 'myorg',
      repo: 'myproject',
      installationId: '12345'
    })
  });
  
  const { title, content } = await response.json();
  
  // Save to database
  await supabase
    .from('documents')
    .insert({
      app_id: 'app-uuid',
      name: title,
      content: content,
      type: 'markdown'
    });
}
```

### GitHub Repository Integration

```tsx
// 3. Browse repository files
import { useRepoData } from '@/hooks/use-repo-data';

function RepoExplorer() {
  const { contents, loading, error } = useRepoData({
    owner: 'myorg',
    repo: 'myproject',
    installationId: '12345',
    path: 'src'
  });
  
  if (loading) return <div>Loading repository...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Repository Contents</h2>
      {contents.map(item => (
        <div key={item.path}>
          <strong>{item.name}</strong>
          {item.type === 'file' && (
            <pre>{item.content}</pre>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Complete Dashboard Example

```tsx
// 4. Complete dashboard component
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRepoData } from '@/hooks/use-repo-data';
import { useIsSubscribed } from '@/hooks/use-is-subscribed';

function AppDashboard({ appId }: { appId: string }) {
  const [app, setApp] = useState(null);
  const isSubscribed = useIsSubscribed(appId);
  
  const { contents: repoContents, loading } = useRepoData({
    owner: app?.github_repo?.split('/')[3],
    repo: app?.github_repo?.split('/')[4],
    installationId: app?.github_installation_id
  });
  
  useEffect(() => {
    // Fetch app data
    supabase
      .from('apps')
      .select('*')
      .eq('id', appId)
      .single()
      .then(({ data }) => setApp(data));
  }, [appId]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{app?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{app?.description}</p>
          <p>Status: {isSubscribed ? 'Active' : 'Free'}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Repository Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {repoContents.map(file => (
                <li key={file.path}>{file.name}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Authentication Flow

```tsx
// 5. Complete authentication setup
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

function AuthenticatedApp() {
  return (
    <ClerkProvider>
      <header>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      
      <main>
        <SignedIn>
          {/* Protected app content */}
          <AppDashboard />
        </SignedIn>
        <SignedOut>
          {/* Public content */}
          <LandingPage />
        </SignedOut>
      </main>
    </ClerkProvider>
  );
}
```

This documentation provides comprehensive coverage of all public APIs, components, hooks, and utilities in the FixFlow application. Each section includes detailed type definitions, usage examples, and integration patterns to help developers effectively use and extend the platform.