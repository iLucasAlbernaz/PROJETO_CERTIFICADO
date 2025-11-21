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

### Docker Compose (local ou host único)

1. Copie `backend/.env.docker.example` para `backend/.env.docker` e ajuste as variáveis (especialmente `DATABASE_URL`, `FRONTEND_URL` e credenciais).
2. Se quiser usar o Postgres embarcado do `docker-compose`, deixe o `DATABASE_URL` igual ao exemplo (`postgres://postgres:postgres@postgres...`).
3. Suba os containers:
   ```bash
   docker compose up --build
   ```
4. Serviços publicados:
   - Backend: http://localhost:4000/api
   - Swagger: http://localhost:4000/docs
   - Frontend: http://localhost:5173

### Imagens Docker

- `backend/Dockerfile`: multi-stage (build de TypeScript + runtime). Usa `docker-entrypoint.sh` para aplicar `prisma migrate deploy` antes de iniciar.
- `frontend/Dockerfile`: build Vite e serve com Nginx (`frontend/nginx.conf`).
- Ambos os diretórios possuem `.dockerignore` para builds mais leves.

Para gerar as imagens:
```bash
# backend
docker build -t guerra/certificados-backend ./backend
# frontend
docker build -t guerra/certificados-frontend ./frontend
```

### Kubernetes (cluster)

Arquivos em `k8s/`:

- `backend-deployment.yaml` / `frontend-deployment.yaml` — Deployments + Services.
- `backend-secret.example.yaml` — modelo de Secret para as variáveis da API (copie, renomeie e aplique via `kubectl apply -f` após substituir os valores).

Passos gerais:
1. Publique as imagens em um registry (`docker push ...`).
2. Atualize `<BACKEND_IMAGE_TAG>` e `<FRONTEND_IMAGE_TAG>` nos manifests.
3. Aplique o Secret com suas variáveis reais.
4. `kubectl apply -f k8s/backend-deployment.yaml` e `kubectl apply -f k8s/frontend-deployment.yaml`.
5. Exponha os serviços via ingress/LoadBalancer conforme seu cluster.

### Considerações

- Ajuste `FRONTEND_URL` no backend e `VITE_API_BASE_URL` no frontend conforme o host final (domínios, HTTPS).
- Para ambientes produtivos, automatize `prisma migrate deploy` (já presente no entrypoint do container).

## Importante

- Não commitar arquivos `.env` — já estão ignorados no `.gitignore`.
- Atualize seu `JWT_SECRET` e senhas antes de publicar.
- Caso o banco já esteja com dados (ambiente produtivo), use `prisma migrate resolve --applied <migration>` para marcar migrations existentes, ou gere diffs usando `prisma migrate diff`.

Pronto! Basta inicializar um repositório (`git init`), adicionar os arquivos e fazer o push para o GitHub.
