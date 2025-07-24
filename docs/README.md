# FixFlow Documentation Hub

Welcome to the comprehensive documentation for FixFlow - the AI-powered platform for managing your software business.

## 📚 Documentation Overview

This documentation suite provides complete guidance for developers, users, and contributors working with FixFlow. Whether you're building features, integrating APIs, or just getting started, you'll find everything you need here.

## 📋 Quick Navigation

### 🚀 Getting Started
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Setup, development workflow, and best practices
- **[Component Reference](./COMPONENT_REFERENCE.md)** - UI components and design system

### 🏗️ Architecture & Design
- **[Project Structure](#project-structure)** - How the codebase is organized
- **[Technology Stack](#technology-stack)** - Technologies and frameworks used
- **[Database Schema](#database-schema)** - Data model and relationships

### 🔧 Development
- **[Environment Setup](#environment-setup)** - Local development setup
- **[API Integration](#api-integration)** - Working with internal and external APIs
- **[Testing Strategy](#testing-strategy)** - Testing approaches and tools

### 📖 Reference
- **[Component Library](#component-library)** - Reusable UI components
- **[Utility Functions](#utility-functions)** - Helper functions and utilities
- **[Hooks & Context](#hooks--context)** - Custom React hooks

## 🎯 What is FixFlow?

FixFlow is an AI-powered platform that helps developers and indie makers manage everything around their software business. From auto-generating documentation to breaking down complex milestones, FixFlow keeps you focused on building while handling the business side seamlessly.

### Key Features

- **🤖 AI-Powered Documentation** - Auto-generates docs from GitHub commits
- **📊 Smart Progress Reports** - Manual and automatic reporting with client-friendly translations
- **🎯 AI Milestone Planning** - Break down big visions into actionable phases
- **🎨 Complete Project Management** - Branding, infrastructure tracking, legal documents
- **🎧 Customer Support System** - AI-powered support chatbot with knowledge base integration

## 🏗️ Project Structure

```
fixflow/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 api/               # API endpoints
│   │   │   ├── 📁 ai/           # AI-powered features
│   │   │   ├── 📁 github/       # GitHub integration
│   │   │   └── 📁 stripe/       # Payment processing
│   │   ├── 📁 apps/             # Main application pages
│   │   ├── 📁 repo/             # Repository browser
│   │   └── 📄 layout.tsx        # Root layout component
│   ├── 📁 components/            # React components
│   │   ├── 📁 app/              # Application components
│   │   └── 📁 ui/               # UI design system
│   ├── 📁 hooks/                 # Custom React hooks
│   ├── 📁 lib/                   # Utility functions
│   └── 📁 supabase/             # Database configuration
├── 📁 docs/                      # Documentation (you are here!)
├── 📁 public/                    # Static assets
└── 📄 README.md                  # Project overview
```

## 💻 Technology Stack

### Frontend
- **⚛️ React 19** - UI library
- **🔷 Next.js 15** - Full-stack framework
- **📘 TypeScript** - Type safety
- **🎨 Tailwind CSS** - Styling
- **🧩 Radix UI** - Component primitives

### Backend & Services
- **🗄️ Supabase** - Database and authentication
- **🔐 Clerk** - User management
- **🤖 Google Gemini** - AI integration
- **📊 GitHub API** - Repository integration
- **💳 Stripe** - Payment processing

### Development Tools
- **📦 npm/yarn** - Package management
- **🔍 ESLint** - Code linting
- **✨ Prettier** - Code formatting
- **🧪 Jest** - Testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- GitHub account
- Google AI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fixflow.git
cd fixflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Start development server
npm run dev
```

**📖 For detailed setup instructions, see [Developer Guide](./DEVELOPER_GUIDE.md)**

## 🗄️ Database Schema

FixFlow uses Supabase (PostgreSQL) with the following main entities:

```sql
📊 apps           # Main application entities
📄 documents      # Documentation storage  
🔐 vault          # Environment variables
✅ todos          # Task management
🐛 bugs           # Bug tracking
🎨 brand          # Branding assets
🔗 platforms      # Deployment platforms
```

**📖 For complete schema documentation, see [API Documentation](./API_DOCUMENTATION.md#database-schema)**

## 🔌 API Integration

### Core API Endpoints

#### AI-Powered Features
- `POST /api/ai/create-doc` - Generate documentation
- `POST /api/ai/chat` - AI chat interface  
- `POST /api/ai/code-review` - Code analysis
- `POST /api/ai/report-bugs` - Bug reporting

#### GitHub Integration
- `GET /api/github/repo` - Repository contents
- `GET /api/github/callback` - OAuth callback

#### Payment Processing
- `POST /api/create-checkout-session` - Stripe checkout
- `POST /api/stripe` - Webhook handler

**📖 For complete API reference, see [API Documentation](./API_DOCUMENTATION.md)**

## 🧩 Component Library

### UI Components
- **Button** - Flexible button with variants
- **Card** - Container with header/content/footer
- **Dialog** - Modal dialogs
- **Input/Textarea** - Form inputs
- **Select** - Dropdown selections
- **Tabs** - Tabbed interfaces

### Application Components
- **AddAppDialog** - App creation modal
- **MdRenderer** - Markdown renderer
- **RepoBrowser** - GitHub repository browser
- **ThemeSwitcher** - Dark/light mode toggle

**📖 For detailed component docs, see [Component Reference](./COMPONENT_REFERENCE.md)**

## 🪝 Hooks & Context

### Custom Hooks
- `useRepoData` - GitHub repository data fetching
- `useIsSubscribed` - Subscription status
- `useIsMobile` - Responsive breakpoint detection

### Context Providers
- **Clerk** - Authentication context
- **Supabase** - Database client
- **Theme** - Dark/light mode state

## 🧪 Testing Strategy

### Testing Tools
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **Playwright** - E2E testing (planned)

### Test Categories
- **Unit Tests** - Individual functions/components
- **Integration Tests** - API endpoints
- **Component Tests** - UI interactions

**📖 For testing guidelines, see [Developer Guide](./DEVELOPER_GUIDE.md#testing)**

## 🚀 Deployment

### Supported Platforms
- **Vercel** - Recommended (zero-config)
- **Docker** - Containerized deployment
- **Self-hosted** - Custom infrastructure

### Environment Variables
```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# GitHub Integration
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=

# AI Features
NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**📖 For deployment guides, see [Developer Guide](./DEVELOPER_GUIDE.md#deployment)**

## 🔧 Development Workflow

### Code Organization
1. **Components** - Reusable UI in `/components/ui/`
2. **Pages** - Route handlers in `/app/`
3. **API Routes** - Backend logic in `/app/api/`
4. **Hooks** - Custom React hooks in `/hooks/`
5. **Utils** - Helper functions in `/lib/`

### Best Practices
- TypeScript for type safety
- Component composition over inheritance
- Custom hooks for reusable logic
- API route organization by feature
- Consistent error handling

**📖 For detailed workflows, see [Developer Guide](./DEVELOPER_GUIDE.md)**

## 📝 Contributing

### Development Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow TypeScript best practices
- Use Prettier for formatting
- Write tests for new features
- Update documentation
- Follow semantic commit messages

## 🆘 Getting Help

### Documentation Resources
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Development setup and workflows
- **[Component Reference](./COMPONENT_REFERENCE.md)** - UI component library

### Support Channels
- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Questions and community help
- **Email** - support@fixflow.dev (coming soon)

## 🔄 Updates & Changelog

### Latest Version: 0.1.0 (Development)

#### Current Features ✅
- User authentication with Clerk
- App management dashboard
- GitHub repository integration
- AI-powered documentation generation
- Basic project management (todos, bugs)
- Markdown rendering
- Subscription management

#### In Development 🚧
- Enhanced AI features
- Advanced project analytics
- Team collaboration
- Mobile application
- API rate limiting
- Advanced testing coverage

#### Planned Features 📋
- Multi-language support
- Advanced integrations (Vercel, Railway)
- Real-time collaboration
- Advanced reporting
- Plugin system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Vercel** - Hosting and deployment platform
- **Supabase** - Database and authentication
- **Clerk** - User management
- **Google** - AI services (Gemini)
- **GitHub** - Repository hosting and API
- **Stripe** - Payment processing
- **Radix UI** - Component primitives
- **Tailwind CSS** - Styling framework

---

**Made with ❤️ by developers who got tired of juggling 10 different tools.**

*FixFlow - Where chaos becomes clarity.*