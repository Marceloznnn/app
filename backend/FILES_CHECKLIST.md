# 📋 Lista de Arquivos - Arquitetura Modular

> **Nota**: Esta documentação reflete a estrutura refatorada em **arquitetura modular por domínio**.

---

## 📦 Módulos

### 🔐 **Módulo: AUTH** (`modules/auth/`)

Sistema de autenticação completo com registro, login, tokens JWT e proteção de rotas.

| Arquivo              | Responsabilidade                                                       |
| -------------------- | ---------------------------------------------------------------------- |
| `auth.controller.ts` | HTTP handlers: register(), login(), refresh(), logout(), me()          |
| `auth.service.ts`    | Lógica: registerUser(), loginUser(), refreshAccessToken()              |
| `auth.middleware.ts` | authMiddleware para proteger rotas                                     |
| `auth.routes.ts`     | Definição de rotas `/register`, `/login`, `/refresh`, `/logout`, `/me` |
| `auth.types.ts`      | DTOs: LoginRequestDto, RegisterRequestDto, AuthResponseDto             |
| `index.ts`           | Exports públicos: authRouter, authMiddleware                           |

**Endpoints:**

- `POST /auth/register` — Registrar novo usuário
- `POST /auth/login` — Login com email e senha
- `POST /auth/refresh` — Renovar token
- `POST /auth/logout` — Logout
- `GET /auth/me` — Dados do usuário autenticado (protegido)

---

### 👤 **Módulo: USER** (`modules/user/`)

Gestão de usuários e acesso ao banco de dados.

| Arquivo              | Responsabilidade                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `user.repository.ts` | Queries SQL: getUserByEmail(), getUserById(), createUser(), emailExists(), updateLastLogin() |
| `user.types.ts`      | Interfaces: User, UserPublic, UserCreateDto, UserResponseDto                                 |
| `index.ts`           | Exports públicos                                                                             |

---

### ❤️ **Módulo: HEALTH** (`modules/health/`)

Health check e info da API.

| Arquivo                | Responsabilidade                |
| ---------------------- | ------------------------------- |
| `health.controller.ts` | HTTP handlers: health(), info() |
| `health.routes.ts`     | Rotas GET `/` e GET `/health`   |
| `index.ts`             | Exports públicos                |

**Endpoints:**

- `GET /` — Info da API (versão, status)
- `GET /health` — Status do banco de dados

---

## 🔧 Código Compartilhado (`shared/`)

### **Config** (`shared/config/`)

| Arquivo    | Responsabilidade                                          |
| ---------- | --------------------------------------------------------- |
| `index.ts` | Configuração centralizada: app.port, app.env, database.\* |

---

### **Database** (`shared/db/`)

| Arquivo         | Responsabilidade                 |
| --------------- | -------------------------------- |
| `connection.ts` | Pool PostgreSQL e função query() |

---

### **Middleware Global** (`shared/middleware/`)

| Arquivo                      | Responsabilidade                                                  |
| ---------------------------- | ----------------------------------------------------------------- |
| `errorHandler.middleware.ts` | Tratamento centralizado de erros                                  |
| `rateLimiter.middleware.ts`  | Rate limiting: loginLimiter, registerLimiter, refreshTokenLimiter |
| `index.ts`                   | Exports públicos                                                  |

---

### **Utilitários** (`shared/utils/`)

| Arquivo          | Responsabilidade                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `hash.util.ts`   | Criptografia: hashPassword(), comparePassword(), validatePasswordStrength()                          |
| `jwt.util.ts`    | Tokens JWT: generateAccessToken(), verifyAccessToken(), generateRefreshToken(), verifyRefreshToken() |
| `logger.util.ts` | Logging com emojis: logger.info(), logger.success(), logger.error(), logger.warn()                   |
| `index.ts`       | Exports centralizados                                                                                |

---

### **Types Compartilhados** (`shared/types/`)

| Arquivo           | Responsabilidade                                               |
| ----------------- | -------------------------------------------------------------- |
| `common.types.ts` | Interfaces globais: ApiResponse<T>, User, UserPublic, UserRole |
| `index.ts`        | Exports públicos                                               |

---

## 📂 Rotas (`routes/`)

| Arquivo   | Responsabilidade                             |
| --------- | -------------------------------------------- |
| `main.ts` | Orquestração: monta healthRouter, authRouter |

---

## 🚀 Raiz

| Arquivo     | Responsabilidade                                              |
| ----------- | ------------------------------------------------------------- |
| `server.ts` | Bootstrap: inicializa Express, aplica middleware, monta rotas |

---

## 📊 Resumo da Estrutura

```
src/
├── modules/
│   ├── auth/          (6 arquivos)
│   ├── user/          (3 arquivos)
│   └── health/        (3 arquivos)
├── shared/
│   ├── config/        (1 arquivo)
│   ├── db/            (1 arquivo)
│   ├── middleware/    (3 arquivos)
│   ├── types/         (2 arquivos)
│   └── utils/         (4 arquivos)
├── routes/            (1 arquivo)
└── server.ts

Total: 27 arquivos
```

---

## 🔄 Fluxo de Imports (Dependências)

```
server.ts
  ├─→ routes/main.ts
  │    ├─→ modules/auth/index.ts
  │    ├─→ modules/health/index.ts
  │    └─→ shared/middleware/index.ts
  │
  ├─→ shared/config/index.ts
  ├─→ shared/utils/logger.util.ts
  └─→ shared/middleware/errorHandler.middleware.ts


modules/auth/
  ├─→ auth.controller.ts
  │    ├─→ auth.service.ts
  │    │    ├─→ modules/user/user.repository.ts
  │    │    ├─→ shared/utils/hash.util.ts
  │    │    ├─→ shared/utils/jwt.util.ts
  │    │    └─→ shared/utils/logger.util.ts
  │    └─→ shared/utils/logger.util.ts
  │
  ├─→ auth.middleware.ts
  │    ├─→ shared/utils/jwt.util.ts
  │    └─→ shared/utils/logger.util.ts
  │
  └─→ auth.routes.ts
       ├─→ auth.controller.ts
       ├─→ shared/middleware/rateLimiter.middleware.ts
       └─→ auth.middleware.ts


modules/user/
  └─→ user.repository.ts
       ├─→ shared/db/connection.ts
       └─→ user.types.ts


modules/health/
  └─→ health.controller.ts
       └─→ shared/db/connection.ts


shared/
  ├─→ db/connection.ts
  │    ├─→ shared/utils/logger.util.ts
  │    └─→ shared/config/index.ts
  │
  └─→ utils/
       ├─→ jwt.util.ts
       │    └─→ logger.util.ts
       │
       ├─→ hash.util.ts
       │    └─→ logger.util.ts
       │
       └─→ logger.util.ts (sem dependências)
```

---

## ✨ Características Implementadas

✅ **Autenticação completa**

- Register com validação
- Login com JWT
- Refresh token
- Logout
- GET /me (protegido)

✅ **Segurança**

- Hash bcrypt (salt 10)
- JWT com tipo explícito
- Refresh token em HTTP-only cookie
- Rate limiting por endpoint

✅ **Modularidade**

- Cada módulo auto-contido
- Shared para código comum
- Exports claros (index.ts)
- Fácil adicionar novos módulos

✅ **Organização**

- Controllers (HTTP handlers)
- Services (lógica de negócio)
- Repository (acesso a dados)
- Middleware (proteção)
- Types (DTOs)

✅ **Qualidade**

- TypeScript types completos
- Error handling centralizado
- Logging estruturado
- Padrão de nomenclatura consistente

---

## 🎯 Para Adicionar Novo Módulo

**Exemplo: Adicionar módulo PRODUCTS**

1. Criar `modules/products/` com:
   - `products.controller.ts`
   - `products.service.ts`
   - `products.repository.ts`
   - `products.routes.ts`
   - `products.types.ts`
   - `index.ts`

2. Importar em `routes/main.ts`:

   ```typescript
   import { productsRouter } from "../modules/products";
   router.use("/products", productsRouter);
   ```

3. Pronto! 🎉

---

## 📚 Documentação Completa

- **[MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md)** — Guia detalhado da arquitetura
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Visão geral
- **[README.md](README.md)** — Setup e endpoints

---

**Estrutura modular, escalável e pronta para crescer! 🚀**

**Instale com:**

```bash
npm install bcrypt @types/bcrypt
```

---

## 📊 Arquitetura

```
HTTP Request
    ↓
routes/auth.ts (Validação básica)
    ↓
services/authService.ts (Lógica de negócio)
    ↓
db/users.ts (Queries SQL)
    ↓
PostgreSQL (Banco de dados)
    ↓
HTTP Response
```

---

## 🔐 Endpoints

| Método | Rota                   | Função                |
| ------ | ---------------------- | --------------------- |
| POST   | `/auth/register`       | Registra novo usuário |
| POST   | `/auth/login`          | Faz login             |
| POST   | `/auth/validate-token` | Valida token          |

---

## 🗄️ SQL Executar

```bash
psql -U marcelo -d app_db -f src/db/schema.sql
```

Ou manualmente:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## 🚀 Próximos Passos

### **1. Setup Banco (IMEDIATO)**

```bash
psql -U marcelo -d app_db -f src/db/schema.sql
```

### **2. Testar (IMEDIATO)**

```bash
npm run dev
```

Endpoints:

```bash
# Registrar
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@example.com", "password": "senha123456"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@example.com", "password": "senha123456"}'
```

### **3. Implementar JWT (PRÓXIMO)**

- Instalar `jsonwebtoken`
- Criar `utils/jwt.ts`
- Usar em `authService.ts`
- Implementar `authMiddleware` completo

### **4. Rate Limiting (SEGURANÇA)**

- Instalar `express-rate-limit`
- Aplicar em `/auth/login`

---

## ✅ Checklist de Verificação

- [x] Bcrypt instalado
- [x] Types criados
- [x] Hash utils criado
- [x] DB queries criadas
- [x] Auth service criado
- [x] Middleware preparado
- [x] Routes criadas
- [x] Main.ts atualizado
- [x] TypeScript compila sem erros
- [x] Documentação criada
- [ ] Tabela users criada no PostgreSQL
- [ ] Testes em Postman
- [ ] JWT implementado (futuro)

---

## 🎓 Estrutura para Novas Features

Usar **exatamente este padrão** para Produtos, Pedidos, etc:

```
1. src/types/index.ts     → Criar Interface
2. src/db/[feature].ts    → Criar Queries
3. src/services/[feature]Service.ts → Criar Service
4. src/routes/[feature].ts → Criar Endpoints
5. src/routes/main.ts     → Integrar rota
```

---

## 📖 Referência Rápida

**Registrar usuário:**

```javascript
const user = await authService.registerUser("email@example.com", "senha123456");
```

**Fazer login:**

```javascript
const { user, accessToken } = await authService.loginUser(
  "email@example.com",
  "senha123456",
);
```

**Hash de senha:**

```javascript
const hash = await hashPassword("minha_senha");
const matches = await comparePassword("minha_senha", hash);
```

---

## 🆘 Troubleshooting

**Erro ao compilar:**

```bash
npm run build
# Verificar mensagem de erro
```

**Erro ao conectar banco:**

```bash
# Verificar .env
# Verificar se PostgreSQL está rodando
psql -U marcelo -d app_db -c "SELECT 1"
```

**Erro no registro/login:**

```bash
# Verificar se tabela existe
psql -U marcelo -d app_db -c "SELECT * FROM users"
```

---

## 💡 Dicas

1. **Sempre** testar em Postman/curl antes de usar no frontend
2. **Nunca** commitar `.env` (senhas)
3. **Usar** roles (user/admin) desde o início
4. **Implementar** JWT logo após esse teste
5. **Adicionar** rate limiting em produção
6. **Usar** HTTPS em produção

---

**✨ Sistema pronto para evoluir!**
