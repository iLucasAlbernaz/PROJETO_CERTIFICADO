# Projeto Certificado

Aplicação full-stack para validação e gestão de certificados acadêmicos. O repositório está organizado em dois projetos independentes (`backend/` e `frontend/`), permitindo deploy desacoplado.

## Stack

- **Backend:** Node.js + Express + Prisma + PostgreSQL (Linode) + JWT + Swagger UI
- **Frontend:** React (Vite + TypeScript) + React Router + React Hook Form + Axios + Bootstrap

## Pré-requisitos

- Node.js 20.19+ (sugerido usar `nvm use 25.2.1`)
- PostgreSQL acessível (o projeto usa `fagsu` como database padrão)
- npm 10+

## Estrutura

```
backend/   # API REST, Prisma, scripts de importação
frontend/  # SPA React (consulta pública + painel admin)
docs/      # OpenAPI/Swagger
```

## Configuração do Backend

1. Copie `backend/.env.example` para `backend/.env` e ajuste as credenciais/URLs.
2. Instale dependências:
   ```bash
   cd backend
   npm install
   ```
3. Gere o client Prisma:
   ```bash
   npx prisma generate
   ```
4. Crie/baseline do banco `fagsu` e aplique o schema (ver documentação do Prisma Migrate). Depois, rode o seed:
   ```bash
   npm run prisma:seed
   ```
5. (Opcional) Importe os certificados mockados extraídos do HTML legado:
   ```bash
   npm run import:mock
   ```
6. Suba a API:
   ```bash
   npm run dev
   ```
   A documentação estará disponível em `http://localhost:4000/docs`.

## Configuração do Frontend

1. Copie `frontend/.env.example` para `frontend/.env` e ajuste `VITE_API_BASE_URL` (padrão `http://localhost:4000/api`).
2. Instale dependências:
   ```bash
   cd frontend
   npm install
   ```
3. Execute em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:5173/` para a página pública ou `http://localhost:5173/admin/login` para o painel admin.
4. Build de produção:
   ```bash
   npm run build
   npm run preview   # opcional para testar o build
   ```

## Scripts úteis

| Local     | Script                   | Descrição                                        |
|-----------|--------------------------|--------------------------------------------------|
| backend   | `npm run dev`            | Inicia a API com ts-node-dev                     |
| backend   | `npm run build && start` | Transpila e sobe a API em JavaScript             |
| backend   | `npm run prisma:seed`    | Cria/atualiza o admin padrão                     |
| backend   | `npm run import:mock`    | Lê `legacy-mock.html` e popula a tabela `Certificate` |
| frontend  | `npm run dev`            | Dev server Vite                                  |
| frontend  | `npm run build`          | Build de produção                                |

## Fluxos principais

- **Consulta pública:** `/api/certificates/lookup/:cpf` (sem autenticação) exibida na home do frontend.
- **Painel admin:** login (`/api/auth/login`), listagem cadastral, criação e remoção de certificados. Rotas protegidas usam JWT bearer.

## Deploy

- Backend pode ser hospedado em qualquer serviço Node (PM2, Docker, etc.) com acesso ao banco Postgres.
- Frontend pode ser publicado em Vercel, Netlify ou bucket estático apontando para a API.
- Ajuste `FRONTEND_URL` no backend e `VITE_API_BASE_URL` no frontend conforme o ambiente de produção.

## Importante

- Não commitar arquivos `.env` — já estão ignorados no `.gitignore`.
- Atualize seu `JWT_SECRET` e senhas antes de publicar.
- Caso o banco já esteja com dados (ambiente produtivo), use `prisma migrate resolve --applied <migration>` para marcar migrations existentes, ou gere diffs usando `prisma migrate diff`.

Pronto! Basta inicializar um repositório (`git init`), adicionar os arquivos e fazer o push para o GitHub.

Atualização de configuração
