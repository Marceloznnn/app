# 🔐 Sistema de Autenticação - Guia Completo

## 📋 Resumo

Implementamos um **sistema de autenticação completo e modular** seguindo as melhores práticas:

✅ **Registro e Login** com JWT
✅ **Refresh Token** para renovação de sessão
✅ **Hash seguro** com bcrypt (salt 10)
✅ **Tipagem forte** em TypeScript
✅ **Separação de responsabilidades** (controller → service → repository)
✅ **Rate limiting** contra brute-force
✅ **Arquitetura modular** em `modules/auth/`

---

## 🗄️ Banco de Dados

### Tabela de Usuários

Abra seu PostgreSQL e execute:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

Ou use:

```bash
psql -U seu_usuario -d app_db -f src/db/schema.sql
```

---

## 📁 Estrutura do Módulo AUTH

```
modules/auth/
├── auth.controller.ts          # HTTP handlers
├── auth.service.ts             # Lógica de autenticação
├── auth.middleware.ts          # Proteção de rotas
├── auth.routes.ts              # Definição de rotas
├── auth.types.ts               # DTOs e types
└── index.ts                    # Exports
```

### **auth.controller.ts** — HTTP Handlers

Recebe requisições HTTP e formata respostas.

```typescript
export async function register(req: Request, res: Response);
export async function login(req: Request, res: Response);
export async function refresh(req: Request, res: Response);
export async function logout(req: Request, res: Response);
export async function me(req: Request, res: Response);
```

### **auth.service.ts** — Lógica de Negócio

Orquestra operações complexas:

```typescript
export async function registerUser(email: string, password: string);
export async function loginUser(email: string, password: string);
export async function refreshAccessToken(refreshToken: string);
```

### **auth.middleware.ts** — Proteção de Rotas

Valida tokens e protege endpoints:

```typescript
export const authMiddleware = async(req, res, next);
```

### **auth.routes.ts** — Definição de Rotas

Mapeia endpoints com middleware:

```typescript
router.post("/register", registerLimiter, handler);
router.post("/login", loginLimiter, handler);
router.post("/refresh", refreshTokenLimiter, handler);
router.post("/logout", authMiddleware, handler);
router.get("/me", authMiddleware, handler);
```

---

## 🔐 Endpoints

### 📝 **POST /auth/register**

Registra novo usuário.

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123456"
  }'
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "created_at": "2026-04-18T..."
    },
    "message": "Usuário registrado com sucesso"
  }
}
```

**Validações:**

- Email deve conter `@`
- Senha: 6-128 caracteres
- Email não pode estar duplicado

---

### 🔑 **POST /auth/login**

Faz login e retorna tokens.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123456"
  }'
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "created_at": "2026-04-18T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Cookies:**

- `refreshToken` (HTTP-only, secure, 7 dias)

---

### 🔄 **POST /auth/refresh**

Renova o access token.

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGci..."}'
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 🚪 **POST /auth/logout**

Faz logout (requer autenticação).

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer {accessToken}"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logout bem-sucedido"
}
```

---

### 👤 **GET /auth/me**

Retorna dados do usuário autenticado (requer token).

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer {accessToken}"
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "created_at": "2026-04-18T..."
    }
  }
}
```

---

## 🔒 Decisões de Segurança

### **1. Hash Bcrypt com Salt 10**

```typescript
const SALT_ROUNDS = 10; // Mínimo recomendado
// ~100ms por hash = seguro + rápido
```

### **2. Nunca Retornar Password**

```typescript
// ❌ ERRADO
return user; // Contém password

// ✅ CERTO
const userPublic: UserPublic = {
  id: user.id,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
};
return userPublic;
```

### **3. Erros Genéricos no Login**

```typescript
// ❌ ERRADO
if (!user) throw new Error("Email não existe");

// ✅ CERTO
throw new Error("Email ou senha inválidos");
```

Evita que atacantes descubram quais emails existem.

### **4. Email Único no Banco**

```sql
email VARCHAR(255) NOT NULL UNIQUE
```

Previne duplicatas em nível de BD.

### **5. Rate Limiting**

```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  keyGenerator: (req) => `${ip}:${email}`,
});
```

Protege contra brute-force.

### **6. Refresh Token em HTTP-only Cookie**

```typescript
res.cookie("refreshToken", token, {
  httpOnly: true, // Não acesso via JS
  secure: isProd, // HTTPS apenas em prod
  sameSite: "strict", // Proteção CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

---

## 🎯 Fluxo de Autenticação

```
1. Usuário registra
   → email + password
   → validate email
   → hash password
   → salva no BD
   ↓
2. Usuário faz login
   → email + password
   → valida password com comparePassword()
   → gera accessToken (24h)
   → gera refreshToken (7d)
   → retorna tokens
   ↓
3. Cliente envia request autenticado
   → Authorization: Bearer {accessToken}
   → authMiddleware valida
   → executa rota protegida
   ↓
4. Token expira
   → cliente usa refreshToken
   → POST /auth/refresh
   → retorna novo accessToken
   ↓
5. Logout
   → limpa refreshToken do cookie
   → cliente remove accessToken
```

---

## 🧪 Estrutura de Codigo

### **auth.types.ts** — DTOs

```typescript
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserPublic;
  accessToken?: string;
}
```

### **auth.service.ts** — Lógica

```typescript
export async function registerUser(email: string, password: string) {
  // Validar email
  // Validar força de senha
  // Verificar email duplicado
  // Hash password
  // Criar user
  // Retornar userPublic
}

export async function loginUser(email: string, password: string) {
  // Buscar user por email
  // Comparar password
  // Gerar accessToken
  // Gerar refreshToken
  // Retornar tokens
}
```

### **auth.middleware.ts** — Proteção

```typescript
export const authMiddleware = async (req, res, next) => {
  // Extrair token do header
  // Verificar se existe
  // Validar token JWT
  // Injetar user em req.user
  // Chamar next()
};
```

---

## 🔜 Próximos Passos

### **1. Email Verification**

Enviar email para confirmar conta antes de ativar.

```typescript
// Em authService.ts
const emailToken = generateEmailToken(user.id);
await sendEmail(email, `Confirme: ${emailToken}`);
```

### **2. Reset Password**

Permitir resetar senha via email.

```typescript
// POST /auth/forgot-password
// POST /auth/reset-password/:token
```

### **3. 2FA (Two-Factor Authentication)**

Adicionar segundo fator de autenticação.

```typescript
// Gerar código 2FA
// Validar código antes de gerar tokens
```

### **4. OAuth**

Integrar login social (Google, GitHub).

```typescript
// npm install passport-google-oauth20
// POST /auth/google
```

### **5. Roles & Permissions**

Expandir sistema de roles (admin, moderator, user).

```typescript
// Middleware de autorização por role
// Atribuição de roles em admin panel
```

---

## 📚 Referências Rápidas

**Token Access:**

- Expira: 24 horas
- Local: Header `Authorization: Bearer`
- Contém: userId, email, role

**Token Refresh:**

- Expira: 7 dias
- Local: HTTP-only cookie
- Contém: userId

**Endpoints Protegidos:**

- GET /auth/me
- POST /auth/logout
- (Adicionar mais conforme necessário)

---

## ✨ Boas Práticas Implementadas

✅ **Modularidade** — Tudo em `modules/auth/`
✅ **Tipagem** — TypeScript types em `auth.types.ts`
✅ **Separação** — Controller → Service → Repository
✅ **Segurança** — Bcrypt, JWT, Rate Limiting
✅ **Logging** — Rastreamento de operações
✅ **Reutilização** — Shared utils (hash, jwt, logger)
✅ **Testabilidade** — Services isoladas e testáveis

---

**Sistema de autenticação completo, seguro e escalável! 🚀**
