# RotaLead — distribuição inteligente de leads

Plataforma para distribuir leads entre vendedores automaticamente. Cada
campanha ganha um link de redirecionamento; quem clica é enviado para o próximo
vendedor da fila (round-robin) e o lead fica registrado no painel.

**Sistema no ar:** https://web-mu-six-37.vercel.app

## Funcionalidades

- Links de redirecionamento com rodízio de vendedores (round-robin)
- Cadastro de organizações, vendedores e links
- Painel de leads com histórico por vendedor
- Sincronização com Google Sheets e envio por webhook
- Autenticação com JWT e limite de requisições

## Stack

- Monorepo com npm workspaces
- **API:** Node.js + Express, Prisma (Postgres), JWT, Google Sheets API
- **Web:** Next.js (App Router) + React + TypeScript
- Deploy dos dois apps na Vercel

## Estrutura

| Caminho | O que é |
|---|---|
| `apps/api/src/routes` | Rotas: auth, orgs, sellers, links, leads, redirect |
| `apps/api/src/services` | Round-robin, sincronização com Sheets, webhook |
| `apps/api/prisma` | Esquema e migrações do banco |
| `apps/web/app/dashboard` | Painel: leads, links, vendedores |

## Rodar localmente

```bash
cp apps/api/.env.example apps/api/.env   # preencher
cp apps/web/.env.example apps/web/.env   # preencher
npm install
npm run dev
```
