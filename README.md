<img src="https://github.com/bhausleitner/soff/assets/58265021/40b428ec-cf52-43df-a64a-51d70e1f5466" alt="Alt Text" height="60" />

# Soff

## Running migrations

Add table in `prisma/schema.prisma` and run `npx prisma migrate -m [migration identifier message]`.

Migrations to `prod` are automatically applied.

## Setup linting and formatting

This project is uses `prettier` and `eslint`

Go to your `settings.json` in VSCODE and extend it with:

```json
{
  "editor.formatOnSave": true
}
```

## File Naming Conventions

| File Type                          | Naming Convention                      | Example             |
|------------------------------------|----------------------------------------|---------------------|
| React Component Files and Types    | PascalCase                             | `SupplierTable.tsx` |
| Utility Files or Helpers           | camelCase                              | `supplierUtils.tsx` |
| json Files                         | kebab-case                             | `package-lock.json` |


## Auth

Using https://clerk.com/ for user authentication. Reach out for clerk user creds if necessary.

## Deployment

Using https://vercel.com/soffs-projects/soff

## Database

Using https://supabase.com/dashboard/projects
