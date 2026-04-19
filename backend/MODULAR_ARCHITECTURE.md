# 🏗️ Arquitetura Modular - Guia Completo

## 📚 Visão Geral

A aplicação segue uma **arquitetura modular por domínio**, onde cada módulo (auth, user, health, etc.) é auto-contido e encapsula sua lógica completa.

Esse padrão oferece:

✅ **Separação clara de responsabilidades**
✅ **Escalabilidade**: fácil adicionar novos módulos
✅ **Isolamento**: mudanças em um módulo não afetam outros
✅ **Testabilidade**: cada módulo pode ser testado isoladamente
✅ **Manutenibilidade**: código organizado e previsível

---

## 📂 Estrutura de Pastas

```
src/
├── modules/                    # 🧩 Módulos por domínio
│   ├── auth/                   # 🔐 Autenticação & Login
│   ├── user/                   # 👤 Usuários
│   ├── health/                 # ❤️ Health Check
│   └── [novo-modulo]/          # Exemplo de novo módulo
│
├── shared/                     # 🔧 Código Compartilhado
│   ├── config/                 # Configuração da app
│   ├── db/                     # Conexão com BD
│   ├── middleware/             # Middleware global
│   ├── types/                  # Types compartilhados
│   └── utils/                  # Utilitários
│
├── routes/
│   └── main.ts                 # Orquestração de rotas
│
└── server.ts                   # Bootstrap da aplicação
```

---

## 🧩 Anatomia de um Módulo

Cada módulo segue o padrão abaixo:

```
modules/{modulo}/
├── {modulo}.controller.ts      # HTTP Handlers
├── {modulo}.service.ts         # Lógica de Negócio
├── {modulo}.routes.ts          # Definição de Rotas
├── {modulo}.middleware.ts      # Middleware local (opcional)
├── {modulo}.repository.ts      # Data Access Layer (opcional)
├── {modulo}.types.ts           # DTOs e Types locais
├── {modulo}.validators.ts      # Validação de inputs (opcional)
└── index.ts                    # Exports públicos
```

### **Exemplo Real: Módulo AUTH**

```
modules/auth/
├── auth.controller.ts          # Handlers: register(), login(), me()
├── auth.service.ts            # registerUser(), loginUser(), refreshAccessToken()
├── auth.middleware.ts         # authMiddleware para proteger rotas
├── auth.routes.ts             # router.post("/register"), router.post("/login")
├── auth.types.ts              # LoginRequestDto, RegisterRequestDto, etc
└── index.ts                   # export { authRouter, authMiddleware }
```

---

## 🎯 Responsabilidade de Cada Arquivo

### **{modulo}.controller.ts** — HTTP Handlers

Responsável por:

- Receber `Request` e enviar `Response`
- Validação básica de inputs
- Chamar service (lógica de negócio)
- Tratar erros HTTP

```typescript
// auth/auth.controller.ts
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha obrigatórios" });
      return;
    }

    const user = await authService.registerUser(email, password);
    res.status(201).json({ success: true, data: { user } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

### **{modulo}.service.ts** — Lógica de Negócio

Responsável por:

- Orquestrar operações complexas
- Validações de regras de negócio
- Chamar repository (acesso a dados)
- Chamar utils (helper functions)

```typescript
// auth/auth.service.ts
export async function registerUser(
  email: string,
  password: string,
): Promise<UserPublic> {
  // Validação
  if (!email.includes("@")) throw new Error("Email inválido");

  // Verificar se existe
  const exists = await userRepository.emailExists(email);
  if (exists) throw new Error("Email já cadastrado");

  // Hash de password
  const hash = await hashPassword(password);

  // Criar user
  const user = await userRepository.createUser(email, hash);

  return user;
}
```

### **{modulo}.routes.ts** — Definição de Rotas

Responsável por:

- Mapear rotas (GET, POST, etc)
- Aplicar middleware
- Aplicar rate limiting
- Chamar controller

```typescript
// auth/auth.routes.ts
import { Router } from "express";
import { register, login } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";
import { registerLimiter, loginLimiter } from "../../shared/middleware";

const router = Router();

router.post("/register", registerLimiter, async (req, res) => {
  await register(req, res);
});

router.post("/login", loginLimiter, async (req, res) => {
  await login(req, res);
});

router.get("/me", authMiddleware, async (req, res) => {
  await me(req, res);
});

export default router;
```

### **{modulo}.middleware.ts** — Middleware Local (Opcional)

Responsável por:

- Middleware específico do módulo
- Autenticação/Autorização
- Transformação de dados

```typescript
// auth/auth.middleware.ts
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};
```

### **{modulo}.repository.ts** — Data Access Layer (Opcional)

Responsável por:

- Queries SQL puras
- Acesso ao banco de dados
- Retornar dados brutos (sem lógica)

```typescript
// user/user.repository.ts
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  return result.rows[0] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<UserPublic> {
  const result = await query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role, created_at",
    [email, passwordHash],
  );
  return result.rows[0];
}
```

### **{modulo}.types.ts** — DTOs e Types

Responsável por:

- Interfaces e tipos locais do módulo
- DTOs (Data Transfer Objects)
- Enums específicos

```typescript
// auth/auth.types.ts
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
  accessToken: string;
}
```

### **{modulo}.validators.ts** — Validação (Opcional)

Responsável por:

- Schema de validação (zod, joi, etc)
- Regras de validação específicas

```typescript
// auth/auth.validators.ts (futuro)
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});
```

### **index.ts** — Exports Públicos

Responsável por:

- Controlar o que é exportado do módulo
- Criar interface clara do módulo

```typescript
// auth/index.ts
export { authMiddleware } from "./auth.middleware";
export { default as authRouter } from "./auth.routes";
export * from "./auth.types";
```

---

## 🔧 Código Compartilhado (`shared/`)

### **shared/config/** — Configuração

Centraliza todas as variáveis de ambiente e configurações:

```typescript
// shared/config/index.ts
export const config = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
```

### **shared/db/** — Conexão com BD

Gerencia a conexão com o banco:

```typescript
// shared/db/connection.ts
import { Pool } from "pg";
import { config } from "../config";

const pool = new Pool(config.database);

export async function query(text: string, params?: any[]) {
  return await pool.query(text, params);
}
```

### **shared/utils/** — Utilitários

Funções reutilizáveis:

- `hash.util.ts` — Criptografia (bcrypt)
- `jwt.util.ts` — Tokens JWT
- `logger.util.ts` — Logging
- `validators.util.ts` — Validação global (futuro)

### **shared/middleware/** — Middleware Global

Middleware compartilhado:

- `errorHandler.middleware.ts` — Tratamento de erros
- `rateLimiter.middleware.ts` — Rate limiting

### **shared/types/** — Types Compartilhados

Tipos usados em múltiplos módulos:

```typescript
// shared/types/common.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
}

export interface UserPublic {
  id: number;
  email: string;
  role: UserRole;
  created_at: Date;
}
```

---

## 🚀 Como Criar um Novo Módulo

Exemplo: Adicionar módulo **PRODUCTS**

### **Passo 1: Criar estrutura de pastas**

```bash
mkdir src/modules/product
touch src/modules/product/{
  product.controller.ts,
  product.service.ts,
  product.repository.ts,
  product.routes.ts,
  product.types.ts,
  index.ts
}
```

### **Passo 2: Definir Types**

```typescript
// modules/product/product.types.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: Date;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
}
```

### **Passo 3: Criar Repository**

```typescript
// modules/product/product.repository.ts
import { query } from "../../shared/db/connection";
import { Product, CreateProductDto } from "./product.types";

export async function getAllProducts(): Promise<Product[]> {
  const result = await query("SELECT * FROM products");
  return result.rows;
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  const result = await query(
    "INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *",
    [dto.name, dto.description, dto.price],
  );
  return result.rows[0];
}
```

### **Passo 4: Criar Service**

```typescript
// modules/product/product.service.ts
import * as productRepository from "./product.repository";
import { logger } from "../../shared/utils/logger.util";
import { Product, CreateProductDto } from "./product.types";

export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await productRepository.getAllProducts();
    logger.info(`✓ Fetched ${products.length} products`);
    return products;
  } catch (error: any) {
    logger.error(`Erro ao buscar produtos: ${error.message}`);
    throw error;
  }
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  if (dto.price <= 0) throw new Error("Preço deve ser positivo");

  const product = await productRepository.createProduct(dto);
  logger.success(`✓ Produto criado: ${product.name}`);
  return product;
}
```

### **Passo 5: Criar Controller**

```typescript
// modules/product/product.controller.ts
import { Request, Response } from "express";
import * as productService from "./product.service";
import { logger } from "../../shared/utils/logger.util";

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const products = await productService.getAllProducts();
    res.json({ success: true, data: { products } });
  } catch (error: any) {
    logger.error(`GET /products - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      res.status(400).json({ error: "Campos obrigatórios faltando" });
      return;
    }

    const product = await productService.createProduct({
      name,
      description,
      price,
    });
    res.status(201).json({ success: true, data: { product } });
  } catch (error: any) {
    logger.error(`POST /products - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}
```

### **Passo 6: Criar Routes**

```typescript
// modules/product/product.routes.ts
import { Router, Request, Response } from "express";
import { getAll, create } from "./product.controller";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  await getAll(req, res);
});

router.post("/", async (req: Request, res: Response) => {
  await create(req, res);
});

export default router;
```

### **Passo 7: Criar index.ts**

```typescript
// modules/product/index.ts
export { default as productRouter } from "./product.routes";
export * from "./product.types";
```

### **Passo 8: Registrar no main.ts**

```typescript
// routes/main.ts
import { Router } from "express";
import { authRouter } from "../modules/auth";
import { healthRouter } from "../modules/health";
import { productRouter } from "../modules/product"; // ← Adicionar

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/products", productRouter); // ← Adicionar

export default router;
```

### **Pronto! 🎉**

Seu novo módulo está integrado e funcionando.

---

## 📊 Fluxo de Requisição

```
1. Request chega na rota
   ↓
2. Route aplica middleware (rate limit, auth)
   ↓
3. Route chama controller handler
   ↓
4. Controller valida input básico
   ↓
5. Controller chama service
   ↓
6. Service implementa lógica de negócio
   ↓
7. Service chama repository (se necessário)
   ↓
8. Repository executa query no BD
   ↓
9. Repository retorna dados para service
   ↓
10. Service retorna para controller
    ↓
11. Controller formata response
    ↓
12. Response volta ao cliente
```

---

## 🛡️ Padrões e Boas Práticas

### **Naming Conventions**

```typescript
// Controllers: verbo simples
export async function register() {}
export async function login() {}
export async function getAll() {}

// Services: verbo + substantivo
export async function registerUser() {}
export async function loginUser() {}
export async function getAllProducts() {}

// Repository: verbo + substantivo
export async function getUserByEmail() {}
export async function createProduct() {}
export async function updateProduct() {}

// Types: PascalCase + sufixo
interface User {}
interface UserPublic {}
interface CreateUserDto {}
interface UserResponseDto {}
```

### **Error Handling**

```typescript
// ❌ Evitar
throw new Error("Something went wrong");

// ✅ Preferir mensagens descritivas
throw new Error("Email já cadastrado");
throw new Error("Usuário não encontrado");
throw new Error("Senha incorreta");
```

### **Logging**

```typescript
logger.info("Informação geral");
logger.success("Operação bem-sucedida");
logger.warn("Aviso importante");
logger.error("Erro crítico");
```

### **Imports Circulares**

❌ Evitar:

```typescript
// moduleA importa de moduleB
// moduleB importa de moduleA
```

✅ Preferir:

```typescript
// Se A e B compartilham tipos, colocar em shared/types
// Cada módulo importa de shared, nunca de outro módulo diretamente
```

---

## 🧪 Testabilidade

Cada componente é facilmente testável:

```typescript
// Testar service isoladamente
import * as authService from "./auth.service";
import * as userRepository from "../user/user.repository";

jest.mock("../user/user.repository");

describe("authService.registerUser", () => {
  it("deve registrar um novo usuário", async () => {
    userRepository.emailExists = jest.fn().mockResolvedValue(false);
    userRepository.createUser = jest.fn().mockResolvedValue({
      id: 1,
      email: "test@example.com",
    });

    const user = await authService.registerUser(
      "test@example.com",
      "senha123456",
    );
    expect(user.email).toBe("test@example.com");
  });
});
```

---

## 📚 Referências Rápidas

**Estrutura de um módulo completo:**

```
modules/auth/
├── index.ts                    # Exports
├── auth.types.ts               # DTOs
├── auth.controller.ts          # HTTP handlers
├── auth.service.ts             # Lógica
├── auth.middleware.ts          # Middleware local
└── auth.routes.ts              # Rotas
```

**Adição ao main.ts:**

```typescript
import { authRouter } from "../modules/auth";
router.use("/auth", authRouter);
```

**Modular = Escalável, Testável, Mantível! 🚀**
