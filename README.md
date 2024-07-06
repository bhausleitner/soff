<img src="https://github.com/bhausleitner/soff/raw/master/assets/58265021/5af74c6c-bbbb-4a70-9762-bb9b46076f8a.png" alt="Alt Text" width="300" height="200" />

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
