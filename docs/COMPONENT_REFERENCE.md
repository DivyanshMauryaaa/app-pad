# FixFlow Component Reference

A comprehensive guide to all React components available in the FixFlow design system.

## UI Components

### Button

A versatile button component supporting multiple variants and sizes with accessibility features.

```typescript
interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  disabled?: boolean;
}
```

**Variants:**
- `default`: Primary button with brand colors
- `destructive`: Red button for dangerous actions
- `outline`: Outlined button with transparent background
- `secondary`: Secondary button with muted colors
- `ghost`: Minimal button with no background
- `link`: Text-only button styled as a link

**Sizes:**
- `default`: Standard button height (36px)
- `sm`: Small button height (32px)
- `lg`: Large button height (40px)
- `icon`: Square button for icons (36px × 36px)

**Examples:**
```tsx
// Primary action button
<Button variant="default" size="lg">
  Submit Form
</Button>

// Destructive action
<Button variant="destructive">
  Delete Account
</Button>

// Icon button
<Button variant="outline" size="icon">
  <SearchIcon />
</Button>

// As child (renders as different element)
<Button asChild>
  <Link href="/profile">Go to Profile</Link>
</Button>
```

### Card

A flexible card container with optional header, content, and footer sections.

```typescript
interface CardProps extends React.ComponentProps<"div"> {
  className?: string;
}

// Sub-components
function CardHeader(props: React.ComponentProps<"div">): JSX.Element
function CardTitle(props: React.ComponentProps<"div">): JSX.Element
function CardDescription(props: React.ComponentProps<"div">): JSX.Element
function CardContent(props: React.ComponentProps<"div">): JSX.Element
function CardFooter(props: React.ComponentProps<"div">): JSX.Element
function CardAction(props: React.ComponentProps<"div">): JSX.Element
```

**Features:**
- Responsive grid layout
- Built-in spacing and typography
- Border and shadow styling
- Flexible content areas

**Examples:**
```tsx
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main card content goes here.</p>
  </CardContent>
</Card>

// Card with action
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
    <CardAction>
      <Button variant="outline" size="sm">Edit</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    Configuration options
  </CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

### Input

A styled text input component with consistent design and accessibility.

```typescript
interface InputProps extends React.ComponentProps<"input"> {
  className?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

**Features:**
- Focus states and animations
- Error state styling via `aria-invalid`
- Consistent padding and typography
- Support for all HTML input types

**Examples:**
```tsx
// Text input
<Input 
  type="text" 
  placeholder="Enter your name" 
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Email input with validation
<Input 
  type="email" 
  placeholder="user@example.com"
  aria-invalid={!isValidEmail}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Disabled input
<Input 
  value="Read-only value" 
  disabled 
/>
```

### Textarea

A multi-line text input component.

```typescript
interface TextareaProps extends React.ComponentProps<"textarea"> {
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

**Features:**
- Resize control
- Consistent styling with Input component
- Auto-expanding option
- Character count support

**Examples:**
```tsx
// Basic textarea
<Textarea 
  placeholder="Enter your message"
  rows={4}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

// Controlled height
<Textarea 
  className="min-h-[100px] max-h-[300px]"
  placeholder="Description"
/>
```

### Dialog

A modal dialog component built on Radix UI primitives.

```typescript
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

// Sub-components
function DialogTrigger(props: DialogTriggerProps): JSX.Element
function DialogContent(props: DialogContentProps): JSX.Element
function DialogHeader(props: DialogHeaderProps): JSX.Element
function DialogTitle(props: DialogTitleProps): JSX.Element
function DialogDescription(props: DialogDescriptionProps): JSX.Element
function DialogFooter(props: DialogFooterProps): JSX.Element
```

**Features:**
- Keyboard navigation
- Focus management
- Escape key handling
- Backdrop click to close
- Portal rendering

**Examples:**
```tsx
// Controlled dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleConfirm}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Uncontrolled dialog
<Dialog>
  <DialogTrigger asChild>
    <Button>Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Application Settings</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      {/* Settings form */}
    </div>
  </DialogContent>
</Dialog>
```

### Select

A dropdown select component with search and multi-select capabilities.

```typescript
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

// Sub-components
function SelectTrigger(props: SelectTriggerProps): JSX.Element
function SelectValue(props: SelectValueProps): JSX.Element
function SelectContent(props: SelectContentProps): JSX.Element
function SelectItem(props: SelectItemProps): JSX.Element
function SelectGroup(props: SelectGroupProps): JSX.Element
function SelectLabel(props: SelectLabelProps): JSX.Element
```

**Examples:**
```tsx
// Basic select
<Select value={selectedValue} onValueChange={setSelectedValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// Grouped select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a framework" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Frontend</SelectLabel>
      <SelectItem value="react">React</SelectItem>
      <SelectItem value="vue">Vue</SelectItem>
      <SelectItem value="angular">Angular</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectLabel>Backend</SelectLabel>
      <SelectItem value="nodejs">Node.js</SelectItem>
      <SelectItem value="python">Python</SelectItem>
      <SelectItem value="go">Go</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### Tabs

A tabbed interface component for organizing content.

```typescript
interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

// Sub-components from @radix-ui/react-tabs
function TabsList(props: TabsListProps): JSX.Element
function TabsTrigger(props: TabsTriggerProps): JSX.Element
function TabsContent(props: TabsContentProps): JSX.Element
```

**Examples:**
```tsx
// Horizontal tabs
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <h2>Overview Content</h2>
  </TabsContent>
  <TabsContent value="settings">
    <h2>Settings Content</h2>
  </TabsContent>
  <TabsContent value="advanced">
    <h2>Advanced Content</h2>
  </TabsContent>
</Tabs>

// Vertical tabs
<Tabs orientation="vertical">
  <TabsList className="flex-col h-full">
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <div className="flex-1">
    <TabsContent value="profile">Profile settings</TabsContent>
    <TabsContent value="billing">Billing information</TabsContent>
    <TabsContent value="security">Security options</TabsContent>
  </div>
</Tabs>
```

### Badge

A small status indicator component.

```typescript
interface BadgeProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

**Examples:**
```tsx
<Badge variant="default">New</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

### Checkbox

A checkbox input component with custom styling.

```typescript
interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
```

**Examples:**
```tsx
<Checkbox 
  checked={isChecked} 
  onCheckedChange={setIsChecked}
  id="terms"
/>
<Label htmlFor="terms">Accept terms and conditions</Label>
```

### Label

A form label component that works with form controls.

```typescript
interface LabelProps extends React.ComponentProps<"label"> {
  htmlFor?: string;
}
```

### Separator

A visual separator component.

```typescript
interface SeparatorProps extends React.ComponentProps<typeof SeparatorPrimitive.Root> {
  orientation?: 'horizontal' | 'vertical';
}
```

**Examples:**
```tsx
<Separator />
<Separator orientation="vertical" className="h-4" />
```

### Skeleton

A loading placeholder component.

```typescript
interface SkeletonProps extends React.ComponentProps<"div"> {}
```

**Examples:**
```tsx
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-4 w-[150px]" />
```

### Tooltip

A tooltip component for providing additional context.

```typescript
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}
```

**Examples:**
```tsx
<Tooltip content="This is a helpful tooltip">
  <Button>Hover me</Button>
</Tooltip>

<Tooltip content="Save your changes" side="top">
  <Button variant="outline" size="icon">
    <SaveIcon />
  </Button>
</Tooltip>
```

### ThemeSwitcher

A component for toggling between light and dark themes.

```typescript
function ThemeSwitcher(): JSX.Element
```

**Features:**
- Automatic theme detection
- Smooth transitions
- Persistent theme preference
- Icon indicators

**Example:**
```tsx
<ThemeSwitcher />
```

## Application Components

### AddAppDialog

A dialog component for creating new applications with form validation.

```typescript
function AddAppDialog(): JSX.Element
```

**Features:**
- Form validation
- Supabase integration
- Success/error feedback
- Responsive design

**Fields:**
- App name (required)
- Description (optional)
- Homepage URL
- GitHub repository URL

### MdRenderer

A markdown renderer with syntax highlighting and GitHub-flavored markdown support.

```typescript
interface MdRendererProps {
  content: string;
}

function MdRenderer(props: MdRendererProps): JSX.Element
```

**Features:**
- GitHub Flavored Markdown (GFM)
- Syntax highlighting with rehype-highlight
- Auto-linked headings
- Custom table styling
- Checkbox support
- Line breaks preservation
- Responsive design

**Supported Markdown Features:**
- Headers (H1-H6)
- Code blocks with syntax highlighting
- Inline code
- Tables
- Lists (ordered and unordered)
- Checkboxes
- Links with auto-linking
- Images
- Blockquotes
- Horizontal rules

### RepoBrowser

A GitHub repository browser with file navigation and content display.

```typescript
interface RepoBrowserProps {
  installationId: string;
  githubRepo: string;
  app: any;
}

function RepoBrowser(props: RepoBrowserProps): JSX.Element
```

**Features:**
- File tree navigation
- File content preview
- Loading states
- Error handling
- GitHub API integration
- Performance optimizations

## Layout Components

### RootLayout

The main application layout with authentication and theme providers.

```typescript
interface RootLayoutProps {
  children: React.ReactNode;
}

function RootLayout(props: RootLayoutProps): JSX.Element
```

**Features:**
- Clerk authentication wrapper
- Font loading (Geist Sans, Geist Mono)
- Global CSS injection
- Header with auth controls
- Toast notifications
- Theme switching

## Page Components

### Home

The main landing page showing user applications.

```typescript
function Home(): JSX.Element
```

**Features:**
- App grid display
- Search functionality (commented out)
- Add new app dialog
- Delete app functionality
- Responsive card layout

### App Dashboard

Individual application dashboard with tabbed navigation.

```typescript
interface AppDashboardProps {
  params: { id: string };
}

function AppDashboard(props: AppDashboardProps): JSX.Element
```

**Features:**
- Tabbed interface
- App overview
- Todo management
- Bug tracking
- Document management
- GitHub integration
- Settings panel
- Subscription status

**Tabs:**
- Home: App overview and quick actions
- Todo: Task management
- Bugs: Bug tracking
- Documents: Documentation management
- Vault: Environment variables
- AI: AI-powered features
- GitHub: Repository browser
- Settings: App configuration

## Component Composition Patterns

### Form Components

```tsx
// Typical form structure
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <Label htmlFor="name">Name</Label>
      <Input 
        id="name" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        aria-invalid={!!errors.name}
      />
      {errors.name && (
        <p className="text-sm text-destructive">{errors.name}</p>
      )}
    </div>
    
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea 
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>
    
    <div className="flex gap-2">
      <Button type="submit">Save</Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
</form>
```

### Card Layouts

```tsx
// Dashboard card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} className="cursor-pointer hover:scale-105 transition-transform">
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {item.stats}
        </p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Modal Patterns

```tsx
// Confirmation dialog
<Dialog open={showConfirm} onOpenChange={setShowConfirm}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowConfirm(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Styling Guidelines

### CSS Classes

All components use Tailwind CSS classes and follow these conventions:

- Use semantic color tokens (`primary`, `secondary`, `destructive`, etc.)
- Responsive design with mobile-first approach
- Dark mode support via `dark:` prefixes
- Focus states for accessibility
- Consistent spacing using Tailwind's spacing scale

### Custom Properties

Components support custom CSS properties for advanced styling:

```css
.custom-button {
  --button-radius: 8px;
  --button-padding: 12px 24px;
}
```

### Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance