# GraphQL Schema Generation for Mobile App

This document explains how to generate TypeScript types from the GraphQL schema for the ndotoni mobile app.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Access to the AppSync API (API ID: `tpxpbec6e5crxhu277uknqxoqi`)

## Installation

Install the required dependencies:

```bash
pnpm install
```

## Available Scripts

### `pnpm run schema:download`
Downloads the latest GraphQL schema from AWS AppSync.

```bash
pnpm run schema:download
```

This will fetch the schema and save it to `schema.graphql`.

### `pnpm run schema:clean`
Cleans up placeholder fields from the schema.

```bash
pnpm run schema:clean
```

This removes `_: Boolean` placeholder fields from Query, Mutation, and Subscription types.

### `pnpm run codegen`
Generates TypeScript types from the schema using GraphQL Code Generator.

```bash
pnpm run codegen
```

This creates `lib/API.ts` with all TypeScript interfaces for your GraphQL types.

### `pnpm run schema:generate`
Complete generation workflow: cleans and generates types.

```bash
pnpm run schema:generate
```

This runs:
1. `schema:clean` - Cleans the schema
2. `codegen` - Generates TypeScript types

### `pnpm run schema:update`
Complete workflow: downloads schema and generates types.

```bash
pnpm run schema:update
```

This is the recommended command to run when you need to sync with the latest backend schema.

## Generated Files

After running schema generation, you'll have:

- `schema.graphql` - The GraphQL schema from AppSync
- `lib/API.ts` - Generated TypeScript interfaces for all GraphQL types

## Configuration Files

### `codegen.yml`
Configures GraphQL Code Generator:
- Schema source (`schema.graphql`)
- Output file path (`lib/API.ts`)
- Plugins (typescript)
- Scalar type mappings (AWSDateTime, AWSDate, etc.)
- Naming conventions (PascalCase for types, UPPER_CASE for enums)

## Usage in Code

Import generated types in your API calls:

```typescript
import { Property, ShortTermProperty, SearchShortTermPropertiesInput } from '@/lib/API';

// Use types in your API functions
async function searchProperties(input: SearchShortTermPropertiesInput): Promise<ShortTermProperty[]> {
  // Your API logic here
}
```

## Workflow

1. **After backend schema changes:**
   ```bash
   pnpm run schema:update
   ```

2. **To regenerate without downloading:**
   ```bash
   pnpm run schema:generate
   ```

3. **To just clean the schema:**
   ```bash
   pnpm run schema:clean
   ```

## Troubleshooting

### Schema download fails
- Ensure AWS CLI is configured: `aws configure`
- Check you have access to the AppSync API
- Verify the API ID in package.json is correct

### Codegen fails
- Ensure all dependencies are installed: `pnpm install`
- Check that `schema.graphql` exists
- Run `pnpm run schema:clean` first

### Types not updating
- Delete `lib/API.ts` and regenerate
- Clear node_modules and reinstall: `pnpm install`
- Check for syntax errors in schema.graphql

## Notes

- The schema is shared with the web app (same AppSync API)
- Generated files should be committed to version control
- Run schema generation after pulling backend changes
- The API ID and region are configured in package.json scripts
- We use GraphQL Code Generator instead of Amplify CLI for simplicity
