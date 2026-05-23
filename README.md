# API SaaS Sistema Cardápio

Backend em Node.js, Express e Prisma usando PostgreSQL no Supabase.

## Setup

1. Crie um projeto no Supabase.
2. Copie a connection string para `DATABASE_URL` e `DIRECT_URL`.
3. Defina `TEST_DATABASE_URL` para um banco de teste separado.
4. Rode:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## Variáveis

- `DATABASE_URL`: conexão usada pela aplicação
- `DIRECT_URL`: conexão direta usada pelo Prisma
- `TEST_DATABASE_URL`: banco isolado para testes

## Testes

```bash
npm test
```

## Observação

Este repositório foi rebaseado para PostgreSQL. A antiga base SQLite e suas migrations foram removidas.