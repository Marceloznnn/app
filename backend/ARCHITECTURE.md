# 🏗️ Arquitetura - Visão Geral

> ⚠️ **Nota**: Para documentação completa sobre a arquitetura modular, veja [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md)

---

## 📚 Visão Geral

Este projeto segue uma **arquitetura modular por domínio**, onde cada módulo é auto-contido e encapsula sua lógica completa.

---

## 🧩 Estrutura Geral

```
src/
├── modules/                    # 🧩 Módulos por domínio (auth, user, health)
├── shared/                     # 🔧 Código compartilhado (config, db, utils, middleware)
├── routes/main.ts              # Orquestração de rotas
└── server.ts                   # Bootstrap
```

**Para documentação detalhada, veja [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md)**

---

## 📦 Módulos Atuais

### 🔐 **auth/** — Autenticação & Login

- **Responsabilidade**: Autenticação, geração de tokens, validação
- **Arquivos**:
  - `auth.controller.ts` — HTTP handlers (register, login, logout, me)
  - `auth.service.ts` — Lógica de autenticação
  - `auth.middleware.ts` — Middleware para proteger rotas
  - `auth.routes.ts` — Definição de rotas
  - `auth.types.ts` — DTOs (LoginRequestDto, RegisterRequestDto)

- **Endpoints**:
  - `POST /auth/register` — Registrar novo usuário
  - `POST /auth/login` — Fazer login e obter token
  - `POST /auth/refresh` — Renovar token
  - `POST /auth/logout` — Logout
  - `GET /auth/me` — Dados do usuário (requer autenticação)

---

### 👤 **user/** — Gestão de Usuários

- **Responsabilidade**: Operações CRUD de usuários, acesso ao BD
- **Arquivos**:
  - `user.repository.ts` — Queries SQL para usuários
  - `user.types.ts` — Interfaces e DTOs

- **Funções**:
  - `getUserByEmail()` — Buscar por email
  - `getUserById()` — Buscar por ID
  - `createUser()` — Criar novo usuário
  - `emailExists()` — Verificar se email existe

---

### ❤️ **health/** — Health Check

- **Responsabilidade**: Status da aplicação e conexão com BD
- **Arquivos**:
  - `health.controller.ts` — HTTP handlers
  - `health.routes.ts` — Definição de rotas

- **Endpoints**:
  - `GET /` — Info da API
  - `GET /health` — Status do banco de dados

---

## 🔧 Código Compartilhado (`shared/`)

### **config/** — Configuração

Centraliza variáveis de ambiente e configurações globais.

```typescript
export const config = {
  app: { port, env },
  database: { host, port, user, password, database },
};
```

### **db/** — Conexão com Banco

Gerencia pool PostgreSQL e função `query()`.

```typescript
export async function query(text: string, params?: any[]);
```

### **middleware/** — Middleware Global

- `errorHandler.middleware.ts` — Tratamento centralizado de erros
- `rateLimiter.middleware.ts` — Rate limiting (login, register, refresh)

### **utils/** — Utilitários

- `hash.util.ts` — Criptografia de senha (bcrypt)
- `jwt.util.ts` — Geração e validação de tokens JWT
- `logger.util.ts` — Sistema de logs com emojis

### **types/** — Types Compartilhados

- `common.types.ts` — Interfaces usadas em múltiplos módulos
  - `ApiResponse<T>`
  - `User` (com password)
  - `UserPublic` (sem password)
  - `UserRole` — "user" | "admin"

---

## 🚀 Como Criar um Novo Módulo

Veja passo a passo em: [MODULAR_ARCHITECTURE.md#-como-criar-um-novo-módulo](MODULAR_ARCHITECTURE.md#-como-criar-um-novo-módulo)

**Resumo rápido:**

1. Criar pasta `src/modules/{modulo}/`
2. Criar: types.ts, repository.ts, service.ts, controller.ts, routes.ts, index.ts
3. Importar router em `src/routes/main.ts`

---

## 🔄 Fluxo de Requisição

```
Request
  ↓
Route (middleware: auth, rate limit, etc)
  ↓
Controller (validação básica de input)
  ↓
Service (lógica de negócio)
  ↓
Repository (queries ao BD)
  ↓
Database
  ↓
Response
```

---

## 🎯 Benefícios

✅ **Modularidade** — Cada módulo é independente
✅ **Escalabilidade** — Fácil adicionar novos módulos
✅ **Testabilidade** — Componentes isolados e testáveis
✅ **Manutenibilidade** — Código organizado e previsível
✅ **Colaboração** — Múltiplos devs podem trabalhar em módulos diferentes

---

## 📚 Documentação Completa

Para entender em detalhes cada componente, veja [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md).
