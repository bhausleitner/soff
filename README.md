<img src="https://github.com/bhausleitner/soff/assets/58265021/40b428ec-cf52-43df-a64a-51d70e1f5466" alt="Alt Text" width="300" height="200" />

# Soff

## Running migrations

Add table in `prisma/schema.prisma` and run `npx prisma migrate -m [migration identifier message]`.

## Setup linting and formatting

This project is uses `prettier` and `eslint`

Go to your `settings.json` in VSCODE and extend it with:

```json
{
  "editor.formatOnSave": true
}
```

## Auth

Using https://clerk.com/ for user authentication. Reach out for clerk user creds if necessary.

## Deployment

Using https://vercel.com/soffs-projects/soff

## Database

Using https://supabase.com/dashboard/projects
