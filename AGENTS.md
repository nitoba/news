# @news - Agent Guidelines

<critical>
- **MANDATORY**: This is a **web application** built with TanStack Start (SSR), React 19, and server-side APIs
- **ALWAYS** follow the established patterns before making changes
- **NEVER** mix behavior logic with visual rendering - extract logic into focused custom hooks
- **MUST** run `bun run lint`, `bun run check`, and `bun run test` (only for backend) before completing any changes
- **ALWAYS** use design tokens (`bg-background`, `text-foreground`) instead of explicit colors (`bg-white`, `text-black`)
- **ALWAYS** use kebab-case naming for React files (components, hooks, stores)
- **MANDATORY**: Follow the better-result pattern for all service layers - wrap DB calls in `Result.tryPromise`
- **MANDATORY**: All service class methods return `Result<T, Error>` types using TaggedError classes

### ⚠️ CRITICAL: Git Commands Restriction ⚠️

- **🚫 ABSOLUTELY FORBIDDEN**: **NEVER** run `git restore`, `git checkout`, `git reset`, `git clean`, `git rm`, or any other git commands that modify or discard working directory changes **WITHOUT EXPLICIT USER PERMISSION**.
- **⚠️ DATA LOSS RISK**: These commands can **PERMANENTLY LOSE CODE CHANGES** and cannot be easily recovered.
- **✅ REQUIRED ACTION**: If you need to revert or discard changes, **YOU MUST ASK THE USER FIRST** and wait for explicit permission before executing any destructive git command.
- **🚨 VIOLATION CONSEQUENCE**: Running destructive git commands without explicit permission will result in **IMMEDIATE TASK REJECTION** and potential **IRREVERSIBLE DATA LOSS**.
  </critical>

## Package Overview

`@news` is a **web application** built with TanStack Start (SSR), React 19, providing a platform for animal adoption management. This is a full-stack application with:

- **Frontend**: React 19 with TanStack Router and TanStack Query
- **Backend**: Nitro + ORPC for type-safe RPC APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Authorization**: Permix for role-based permissions

**Key Technologies:**

- **React 19**: Latest features (use(), Actions, useOptimistic, useFormStatus)
- **TanStack Start**: SSR framework with file-based routing
- **TanStack Router**: Type-safe file-based routing with search params
- **TanStack Query**: Server state management with caching and optimistic updates
- **TanStack Form**: Headless, type-safe form management with Zod validation
- **ORPC**: Type-safe RPC for client-server communication
- **Drizzle ORM**: Type-safe database queries
- **Better Result**: Railway-oriented programming with Result types and TaggedError
- **Better Auth**: Authentication library
- **Permix**: Authorization and permissions system
- **Shadcn UI + Tailwind CSS v4**: Copy-paste components with utility-first styling
- **Zod**: Runtime validation
- **Biome**: Linting and formatting
- **Vitest**: Testing framework (only for backend)

## Architecture

### Directory Structure

```
src/
├── routes/              # TanStack Router file-based routes
├── components/          # React components
│   └── ui/             # Shadcn UI components
├── lib/
│   ├── services/       # Service classes (business logic)
│   ├── orpc/          # RPC routes and client
│   ├── permix/        # Authorization configuration
│   ├── errors/        # TaggedError definitions
│   ├── validators/    # Zod schemas
│   └── auth/          # Authentication config
├── db/
│   └── schemas/       # Drizzle ORM schemas
└── hooks/             # Custom React hooks
```

### Service Layer Pattern

**CRITICAL PATTERN**: All database operations go through Service classes using the better-result pattern.

**Reference**: See `src/lib/services/animal-service.ts` for complete example.

```typescript
import { Result } from "better-result";
import { db } from "src/db";
import { animals } from "src/db/schemas";
import { DatabaseError } from "@/lib/errors";

type SelectAnimals = typeof animals.$inferSelect;
type InsertAnimals = typeof animals.$inferInsert;
type UpdateAnimals = Partial<Omit<typeof animals.$inferInsert, "id">>;

export class AnimalService {
  static async getById(
    id: string,
  ): Promise<Result<SelectAnimals | null, DatabaseError>> {
    return Result.tryPromise({
      try: () => db.select().from(animals).where(eq(animals.id, id)).limit(1),
      catch: (e) => new DatabaseError({ operation: "getById", cause: e }),
    });
  }

  static async create(
    input: InsertAnimals,
  ): Promise<Result<SelectAnimals, DatabaseError>> {
    const result = await Result.tryPromise({
      try: () => db.insert(animals).values(input).returning(),
      catch: (e) => new DatabaseError({ operation: "create", cause: e }),
    });
    if (Result.isError(result)) {
      return result;
    }
    return Result.ok(result.value[0]);
  }

  static async update(
    id: string,
    data: UpdateAnimals,
  ): Promise<Result<SelectAnimals, DatabaseError>> {
    const result = await Result.tryPromise({
      try: () =>
        db.update(animals).set(data).where(eq(animals.id, id)).returning(),
      catch: (e) => new DatabaseError({ operation: "update", cause: e }),
    });
    if (Result.isError(result)) {
      return result;
    }
    return Result.ok(result.value[0]);
  }

  static async delete(id: string): Promise<Result<boolean, DatabaseError>> {
    return Result.tryPromise({
      try: () => db.delete(animals).where(eq(animals.id, id)),
      catch: (e) => new DatabaseError({ operation: "delete", cause: e }),
    });
  }
}
```

### ORPC Routes Pattern

**CRITICAL**: All RPC routes use Result.match to handle service errors.

**Reference**: See `src/lib/orpc/router/routes/animals.ts` for complete example.

```typescript
import { ORPCError } from "@orpc/server";
import { checkPermissionMiddleware } from "@/lib/permix";
import { AnimalService } from "@/lib/services/animal-service";
import { protectedWithPermissionsProcedure, publicProcedure } from "../..";

const getAnimals = publicProcedure()
  .input(z.object({ id: z.uuid() }))
  .output(SelectAnimalsSchema.nullable())
  .handler(async ({ input }) => {
    const result = await AnimalService.getById(input.id);

    return result.match({
      ok: (animal) => animal,
      err: (error) => {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message,
        });
      },
    });
  });

const createAnimals = protectedWithPermissionsProcedure()
  .use(checkPermissionMiddleware("animals", "create"))
  .input(InsertAnimalsSchema)
  .output(SelectAnimalsSchema)
  .handler(async ({ input }) => {
    const result = await AnimalService.create(input);

    return result.match({
      ok: (animal) => animal,
      err: (error) => {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message,
        });
      },
    });
  });

const updateAnimals = protectedWithPermissionsProcedure()
  .input(z.object({ id: z.uuid(), data: UpdateAnimalsSchema }))
  .output(SelectAnimalsSchema)
  .handler(async ({ input, context }) => {
    const animalResult = await AnimalService.getById(input.id);

    const animal = animalResult.match({
      ok: (animal) => animal,
      err: (error) => {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message,
        });
      },
    });

    if (!animal) {
      throw new ORPCError("NOT_FOUND");
    }

    if (!context.permix?.check("animals", "update", animal)) {
      throw new ORPCError("FORBIDDEN");
    }

    const result = await AnimalService.update(input.id, input.data);

    return result.match({
      ok: (animal) => animal,
      err: (error) => {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message,
        });
      },
    });
  });
```

### Error Handling (better-result Pattern)

**CRITICAL**: All errors use TaggedError classes from better-result.

**Reference**: See `.opencode/skill/better-result-adopt/SKILL.md` for complete better-result patterns.

**Available TaggedError Types** (defined in `src/lib/errors/index.ts`):

```typescript
export class NotFoundError extends TaggedError('NotFoundError')<{
  resource: string
  id: string
  message: string
}>

export class ValidationError extends TaggedError('ValidationError')<{
  field: string
  message: string
}>

export class DatabaseError extends TaggedError('DatabaseError')<{
  operation: string
  message: string
  cause?: unknown
}>

export class PermissionDeniedError extends TaggedError('PermissionDeniedError')<{
  resource: string
  action: string
  message: string
}>

export class InfrastructureError extends TaggedError('InfrastructureError')<{
  message: string
  cause?: unknown
}>
```

### Authorization (Permix)

**CRITICAL**: All protected routes use Permix for authorization.

**Reference**: See `src/lib/permix/index.ts` for complete permission configuration.

```typescript
// Permission middleware
const protectedProcedure = protectedWithPermissionsProcedure().use(
  checkPermissionMiddleware("animals", "create"),
);

// Check permission in handler
if (!context.permix?.check("animals", "update", animal)) {
  throw new ORPCError("FORBIDDEN");
}

// Available role permissions
adminPermissions; // Full access to all resources
adopterPermissions(userId); // Limited access for adopters
donorPermissions(userId); // Limited access for donors
bothPermissions(userId); // Combined adopter + donor permissions
shelterManagerPermissions({ userId, shelterIds }); // Shelter-specific access
```

## Build, Test, and Development Commands

From package root:

```bash
bun run dev            # Start dev server on port 3001
bun run build          # Production build
bun run preview        # Preview production build
bun run test           # Run all tests (Vitest)
bun run lint           # Lint with Biome
bun run format         # Format with Biome
bun run check          # Run Biome format + lint
bun run db:generate    # Generate Drizzle migrations
bun run db:migrate     # Run Drizzle migrations
bun run db:push        # Push schema changes to DB
bun run db:pull        # Pull schema from DB
bun run db:studio      # Open Drizzle Studio
```

## Coding Style & Conventions

### TypeScript Standards

- React 19 + TypeScript (strict mode)
- **Indentation**: Tabs (Biome config)
- **Quotes**: Single quotes
- **Semicolons**: As-needed
- **NO** `React.FC` - type props directly on functions
- Use `React.ComponentProps<'element'>` for extending HTML elements
- Leverage TypeScript inference - avoid manual generics when possible

### File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `issue-list.tsx`, `issue-detail.tsx`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-issues.ts`, `use-mobile.ts`)
- **Services**: `*-service.ts` (e.g., `animal-service.ts`, `shelter-service.ts`)
- **Validators**: `*.zod.ts` (e.g., `animals.zod.ts`, `shelters.zod.ts`)
- **Types**: `*.types.ts` (e.g., `animals.ts`, `shelters.ts`)
- **Stories**: `*.stories.tsx` (e.g., `button.stories.tsx`)

### Import Organization

1. React and framework imports
2. Third-party libraries
3. Workspace packages
4. Local imports (components, hooks, types)

### Type Definitions

```typescript
// Use Drizzle's type inference for schema types
type SelectAnimals = typeof animals.$inferSelect;
type InsertAnimals = typeof animals.$inferInsert;
type UpdateAnimals = Partial<Omit<typeof animals.$inferInsert, "id">>;
```

## Three-Tier Boundaries: Frontend Rules

### Tier 1: MANDATORY (Task Rejection)

**Violations will result in immediate task rejection:**

1. **Design Tokens**: ALWAYS use design tokens (`bg-background`, `text-foreground`) instead of explicit colors
2. **Service Layer**: NEVER access database directly from components - always use Service classes
3. **Result Types**: ALL service methods MUST return `Result<T, Error>` types using better-result
4. **File Naming**: ALWAYS use kebab-case for React files (components, hooks)
5. **Testing**: MUST run `bun run lint && bun run check && bun run test` before completing tasks
6. **Error Handling**: ALWAYS wrap DB calls in `Result.tryPromise` with proper TaggedError
7. **Authorization**: ALWAYS use Permix for protected routes
8. **Code Style**: Follow Biome config (tabs, single quotes, as-needed semicolons)

### Tier 2: SHOULD (Strong Guidance)

**Follow these patterns unless there's a compelling reason not to:**

1. **State Management Hierarchy**: Local state → TanStack Query → URL state
2. **Component Organization**: Group by feature/domain, not technical layer
3. **Form Handling**: Use TanStack Form + Zod for complex forms, React 19 Actions for simple forms
4. **Error Handling**: Use Error Boundaries at strategic levels, provide fallback UI
5. **Accessibility**: Use semantic HTML first, ensure keyboard navigation, preserve Radix UI attributes

### Tier 3: ENCOURAGED (Best Practices)

**Adopt these patterns for optimal code quality:**

1. **React 19 Features**: Use `use()`, Actions, `useOptimistic()`, `useFormStatus()`
2. **Performance**: Code splitting, prefetching, React.memo when needed
3. **Type Safety**: Leverage TypeScript inference, use Zod for runtime validation
4. **Storybook**: Create stories for all UI components, document states and variants

## Data Fetching Patterns

### TanStack Query + ORPC

Use the ORPC client for type-safe data fetching:

```typescript
import { orpc } from "@/lib/orpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";

// Fetch data
const { data: animals } = useQuery({
  queryKey: ["animals"],
  queryFn: () => orpc.animals.list(),
});

// Create mutation
const createMutation = useMutation({
  mutationFn: (data: InsertAnimals) => orpc.animals.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["animals"] });
  },
});
```

### TanStack Router Loaders

For SSR data loading, use route loaders:

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/animals/")({
  loader: async () => {
    return await orpc.animals.list();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const animals = Route.useLoaderData();
  // ...
}
```

## State Management Patterns

### Local State

Use React 19 built-in state for component-local state:

```typescript
const [isOpen, setIsOpen] = useState(false);
```

### TanStack Query

Use TanStack Query for server state:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["animals", params],
  queryFn: () => orpc.animals.list(params),
});
```

## Form Handling Patterns

### TanStack Form + Zod

**Reference**: See TanStack Form documentation for complete patterns.

```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";

const form = useForm({
  defaultValues: {
    name: "",
    type: "dog",
  },
  onSubmit: async ({ value }) => {
    await createMutation.mutateAsync(value);
  },
  validatorAdapter: zodValidator(),
});
```

### React 19 Actions

For simple forms, use React 19 Actions:

```typescript
async function handleSubmit(formData: FormData) {
  "use server";
  // server-side validation and processing
}
```

## Shadcn Components

Add new UI components using:

```bash
bun dlx shadcn@latest add button
```

Components located in `src/components/ui/` with Radix UI primitives and Tailwind CSS v4 styling.

### Design Tokens

**ALWAYS** use design tokens instead of explicit colors:

```tsx
// ❌ WRONG
<div className="bg-white text-black">

// ✅ CORRECT
<div className="bg-background text-foreground">
```

## Testing Guidelines

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### Service Tests

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { AnimalService } from "@/lib/services/animal-service";

describe("AnimalService", () => {
  beforeEach(() => {
    // setup mocks
  });

  it("should return animal by id", async () => {
    const result = await AnimalService.getById("some-id");
    expect(Result.isOk(result)).toBe(true);
  });
});
```

## Common Pitfalls to Avoid

<common_pitfalls>
**NEVER do these:**

1. ❌ Use explicit colors instead of design tokens
2. ❌ Access database directly from components (use Service classes)
3. ❌ Return plain Promises from service methods (use Result<T, E>)
4. ❌ Throw exceptions instead of returning Result errors
5. ❌ Forget to run `bun run lint && bun run check && bun run test`
6. ❌ Use camelCase instead of kebab-case for React files
7. ❌ Skip using TaggedError classes for errors
8. ❌ Use `React.FC` type annotation
9. ❌ Implement custom utilities when TanStack Query provides them
10. ❌ Remove Radix UI accessibility attributes from Shadcn components
11. ❌ Use workarounds in tests instead of proper solutions
12. ❌ Forget to check permissions in protected routes
    </common_pitfalls>

## Checklist Before Completing Tasks

- [ ] Service classes use Result<T, E> pattern
- [ ] All DB calls wrapped in Result.tryPromise
- [ ] TaggedError classes used for all errors
- [ ] All React files use kebab-case naming
- [ ] Design tokens used (no explicit colors)
- [ ] Forms use TanStack Form + Zod
- [ ] Protected routes use Permix
- [ ] Error boundaries implemented
- [ ] Accessibility attributes preserved
- [ ] `bun run lint` passes
- [ ] `bun run check` passes
- [ ] No workarounds used (especially in tests)

## Key Resources

- **AGENTS.md**: This file - primary agent guidelines
- **README.md**: Project overview and getting started
- **better-result**: `.opencode/skill/better-result-adopt/SKILL.md` - Result type patterns
- **Permix**: `src/lib/permix/index.ts` - Authorization configuration
- **Services**: `src/lib/services/` - Service layer examples
- **ORPC**: `src/lib/orpc/router/routes/` - Route examples

**Enforcement:** Violating these standards results in immediate task rejection.
