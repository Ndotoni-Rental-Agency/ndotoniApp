# Quick Start: Schema Generation

Get started with GraphQL schema generation in 3 simple steps!

## Step 1: Install Dependencies

```bash
cd ndotoniApp
pnpm install
```

This will install:
- `@graphql-codegen/cli` - GraphQL Code Generator
- `@graphql-codegen/typescript` - TypeScript plugin

## Step 2: Download Schema

```bash
pnpm run schema:download
```

This downloads the latest schema from AWS AppSync to `schema.graphql`.

## Step 3: Generate Types

```bash
pnpm run schema:generate
```

This will:
1. Clean up placeholder fields
2. Generate TypeScript types in `lib/API.ts`

## That's it! 🎉

Your generated types will be in `lib/API.ts`.

## Daily Workflow

When the backend schema changes, just run:

```bash
pnpm run schema:update
```

This downloads the schema and generates types in one command.

## Using Generated Types

```typescript
import { Property, ShortTermProperty } from '@/lib/API';

const property: Property = {
  propertyId: '123',
  title: 'Beautiful Apartment',
  // ... TypeScript will autocomplete and validate!
};
```

## Need Help?

See [SCHEMA_GENERATION.md](./SCHEMA_GENERATION.md) for detailed documentation.

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm run schema:download` | Download schema from AppSync |
| `pnpm run schema:clean` | Clean placeholder fields |
| `pnpm run codegen` | Generate types from schema |
| `pnpm run schema:generate` | Clean + generate (recommended) |
| `pnpm run schema:update` | Download + generate (full workflow) |

## Troubleshooting

**AWS CLI not configured?**
```bash
aws configure
```

**Permission denied on scripts?**
```bash
chmod +x scripts/*.js
```

**Need to reinstall?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Codegen not found?**
```bash
pnpm install @graphql-codegen/cli @graphql-codegen/typescript
```
