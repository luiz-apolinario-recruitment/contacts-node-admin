# Contacts Management App - Luiz Apolinario

Aplicacao de Gestao de Contactos desenvolvida em Node.js + Express (backend) e Vue 3 + Vite + TailwindCSS (frontend).

## Stack Tecnologica

- **Backend:** Node.js 22, Express, MariaDB, JWT, Multer, Helmet, Rate Limit
- **Frontend:** Vue 3, Vue Router, Pinia, TailwindCSS, Vite
- **DevOps:** Docker, Docker Compose, PM2
- **Database:** MariaDB (remoto via recruitment.alfasoft.pt)
- **Testes:** Jest + Supertest

## Estrutura do Projeto

```
html/
├── ecosystem.config.cjs  # PM2 process manager
├── docker-compose.yml    # Docker services
├── Dockerfile
├── .env.example          # Environment variables
├── src/
│   ├── backend/          # API REST (Express)
│   │   ├── server.js
│   │   ├── migrations/   # SQL schema migrations
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── utils/
│   └── frontend/         # SPA (Vue 3 + Vite)
│       ├── src/
│       └── dist/         # Production build
├── uploads/              # Contact photos
└── logs/                 # PM2 logs
```

## Instalacao

```bash
# Instalar dependencias de todos os pacotes e buildar frontend
npm install

# Ou instalar separadamente
npm run install:backend
npm run install:frontend
npm run build
```

## Database Setup

O servidor cria automaticamente as tabelas necessarias no arranque.

Alternativamente, execute a migration manualmente:
```bash
mysql -h recruitment.alfasoft.pt -u luizapolinario-nodejs -p < src/backend/migrations/001_create_tables.sql
```

Schema:
- **contacts**: id (UUID), name (>5 chars), contact (9 digits, UNIQUE), email (UNIQUE), picture
- **users**: id (UUID), username (UNIQUE), password (bcrypt hash)

## Iniciar

```bash
# Iniciar com PM2 (recomendado para producao)
pm run pm2:start

# Ou diretamente
npm start
```

## Scripts PM2

- `npm run pm2:start`   - Iniciar aplicacao com PM2
- `npm run pm2:restart` - Reiniciar todos os processos
- `npm run pm2:logs`    - Ver logs
- `npm run pm2:status`  - Ver status

## Docker

```bash
docker-compose up --build
```

## Testes

```bash
npm test
```

Resultado esperado: 42 testes passando (Jest + Supertest).

## Autenticacao

- JWT armazenado em cookie HTTP-only (protecao contra XSS)
- `GET /api/contacts` e acesso publico
- Todas as outras operacoes exigem autenticacao
- No frontend, o botao "Ver detalhes" redireciona para login se o utilizador nao estiver autenticado

## MariaDB Remoto

- **Host:** recruitment.alfasoft.pt:3306
- **Database:** luizapolinario_nodejs
- **Frontend:** https://luizapolinario-nodejs.recruitment.alfasoft.pt

## Autor

Luiz Apolinario
