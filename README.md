# Controle Financeiro — Skeleton do Projeto

App web de controle de gastos com dashboard, orçamentos e categorização
automática via IA (Claude/Gemini). Pensado para nascer pronto para virar
SaaS multiusuário no futuro.

## Stack

- **Backend:** Node.js + Express + PostgreSQL (`pg`)
- **Frontend:** React (Vite) + Tailwind + Recharts
- **Auth:** JWT + bcrypt
- **Deploy:** Render (web service + banco gerenciado)

## Estrutura

```
expense-tracker/
├── backend/
│   ├── db/schema.sql          # schema do banco (PostgreSQL)
│   ├── src/
│   │   ├── config/db.js       # pool de conexão
│   │   ├── middleware/auth.js # verificação de JWT
│   │   ├── controllers/       # lógica das rotas
│   │   ├── routes/            # definição dos endpoints
│   │   └── server.js          # entrypoint
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/client.js      # wrapper fetch com token
    │   ├── components/Layout.jsx
    │   ├── pages/Login.jsx
    │   ├── pages/Dashboard.jsx
    │   ├── pages/Transactions.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Como rodar

### 1. Banco de dados

```bash
createdb expense_tracker
psql expense_tracker < backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # edite com sua DATABASE_URL e JWT_SECRET
npm install
npm run dev             # sobe em http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # sobe em http://localhost:5173
```

## Endpoints implementados

| Método | Rota                       | Descrição                          |
|--------|-----------------------------|-------------------------------------|
| POST   | /api/auth/register           | Cria usuário                        |
| POST   | /api/auth/login               | Login, retorna JWT                  |
| GET    | /api/accounts                 | Lista contas do usuário             |
| POST   | /api/accounts                 | Cria conta (carteira, cartão, etc.) |
| GET    | /api/categories                | Lista categorias                    |
| POST   | /api/categories                | Cria categoria                      |
| GET    | /api/transactions               | Lista transações (filtros: mês, categoria, conta) |
| POST   | /api/transactions               | Cria transação                      |
| PUT    | /api/transactions/:id           | Edita transação                     |
| DELETE | /api/transactions/:id           | Remove transação                    |
| GET    | /api/budgets                    | Lista orçamentos por categoria      |
| POST   | /api/budgets                    | Define orçamento                    |

Todas as rotas exceto `/auth/*` exigem header `Authorization: Bearer <token>`.

## Próximos passos sugeridos

1. Rodar o schema e testar os endpoints com Postman/Insomnia.
2. Construir as telas de Dashboard (gráficos com Recharts) e Transações.
3. Adicionar endpoint `/api/ai/categorize` que manda a descrição do
   lançamento pra API da Claude e recebe a categoria sugerida.
4. Adicionar campo `tenant_id`/plano em `users` quando for abrir para outros usuários.
