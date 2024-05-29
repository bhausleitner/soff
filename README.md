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