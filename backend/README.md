# 🚀 Backend - App E-commerce

Servidor Node.js com TypeScript e PostgreSQL, com **arquitetura modular por domínio**.

## 📚 Documentação

- **[MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md)** - Guia completo da arquitetura modular
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Estrutura geral do projeto

## 📂 Estrutura (Modular)

```
src/
├── modules/                    # Módulos por domínio
│   ├── auth/                   # 🔐 Autenticação
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.middleware.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.types.ts
│   │   └── index.ts
│   ├── user/                   # 👤 Usuários
│   │   ├── user.repository.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   └── health/                 # ❤️ Health Check
│       ├── health.controller.ts
│       ├── health.routes.ts
│       └── index.ts
│
├── shared/                     # 🔧 Código Compartilhado
│   ├── config/
│   │   └── index.ts
│   ├── db/
│   │   └── connection.ts
│   ├── middleware/
│   │   ├── errorHandler.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── common.types.ts
│   │   └── index.ts
│   └── utils/
│       ├── hash.util.ts
│       ├── jwt.util.ts
│       ├── logger.util.ts
│       └── index.ts
│
├── routes/
│   └── main.ts                 # Orquestração de rotas
│
└── server.ts                   # Bootstrap
```

## 🚀 Setup

```bash
npm install
```

## 🔧 Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📦 Produção

```bash
npm run build
npm start
```

## 🔌 Endpoints

### Health & Info

- `GET /` - Info da API
- `GET /health` - Status do banco de dados

### Autenticação (módulo auth)

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário autenticado (requer token)

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=app_db

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=seu-secret-super-seguro-mudar-em-producao
```

## 📖 Guia Rápido

Para adicionar um novo módulo, veja [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md#-como-criar-um-novo-módulo).
