# Meridian B2B — Ecommerce B2B

Plataforma de ecommerce B2B (catálogo, filtros en tiempo real, modo oscuro) con un panel
de administración oculto en `/admin`. Construido con Next.js 15 (App Router), React 19,
TypeScript, Tailwind CSS, shadcn/ui, Prisma + PostgreSQL, NextAuth (Auth.js v5),
Framer Motion, React Hook Form + Zod y TanStack Query.

> **Nota:** este proyecto fue generado en un entorno sin acceso a internet, por lo que
> `npm install` **no se ejecutó todavía**. Seguí los pasos de abajo en tu computadora,
> donde sí vas a tener conexión.

## 1. Requisitos previos

- Node.js 20 o superior
- PostgreSQL 14+ (local, o con Docker — ver más abajo)
- npm

## 2. Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
cp .env.example .env
```

Abrí `.env` y completá, como mínimo:

- `DATABASE_URL`: cadena de conexión a tu base PostgreSQL.
- `NEXTAUTH_SECRET`: generalo con `openssl rand -base64 32`.
- `ADMIN_PASSWORD`: la contraseña que quieras para el usuario administrador inicial
  (usuario `Fito` por defecto, configurable con `ADMIN_USERNAME`). **Se hashea con
  bcrypt al correr el seed — nunca queda en texto plano ni en el código.**

## 3. Levantar PostgreSQL

**Opción A — Docker (recomendado):**

```bash
docker compose up -d db
```

Esto levanta Postgres en `localhost:5432` con las credenciales que ya vienen
configuradas en `.env.example` (usuario/clave `postgres`, base `b2b_ecommerce`).

**Opción B — Postgres instalado localmente:** creá manualmente una base
`b2b_ecommerce` y ajustá `DATABASE_URL` en `.env` con tus propias credenciales.

## 4. Migraciones y datos de ejemplo

```bash
# Crea las tablas
npx prisma migrate dev --name init

# Carga ~40 productos de ejemplo, categorías y el usuario administrador
npm run db:seed
```

Si `ADMIN_PASSWORD` no está definido en `.env`, el seed falla a propósito con un
mensaje explicando qué falta — así nunca se crea un admin sin contraseña.

## 5. Correr el proyecto

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para ver el catálogo público.

### Acceso al panel de administración

El panel **no tiene ningún botón, enlace ni mención visible** en el sitio (ni en el
header, ni en el footer, ni en el menú). La única forma de entrar es escribiendo
manualmente la URL:

```
http://localhost:3000/admin
```

Iniciá sesión con el usuario (`Fito` por defecto) y la contraseña que definiste en
`ADMIN_PASSWORD`.

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Corre ESLint |
| `npm run typecheck` | Corre el chequeo de tipos de TypeScript sin emitir archivos |
| `npm run prisma:studio` | Abre Prisma Studio (explorador visual de la base de datos) |
| `npm run prisma:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run db:seed` | Carga categorías, productos de ejemplo y el usuario administrador |

## Estructura del proyecto

```
src/
  app/                  Rutas (App Router)
    admin/
      login/            Login del panel (única página de /admin sin protección)
      (protected)/       Dashboard, productos y categorías — protegidos por middleware
    api/                Route Handlers (productos, categorías, upload, NextAuth, stats)
    servicios/, nosotros/  Páginas públicas de contenido
    page.tsx            Home / catálogo
    sitemap.ts, robots.ts  SEO
  components/
    layout/             Header, Sidebar de filtros, Footer, diálogo de filtros móvil
    products/            Card, grilla, buscador, contexto de filtros
    admin/               Formularios, tabla de productos, stats, login
    theme/, providers/   Dark mode y providers de React Query
    ui/                  Primitivas shadcn/ui (button, input, dialog, etc.)
  actions/              Server Actions (mutaciones del panel admin)
  hooks/                 Hooks de TanStack Query y utilidades
  lib/                   Prisma client, auth (NextAuth), validaciones Zod, rate limit
  types/                 Tipos compartidos
prisma/
  schema.prisma          Modelos: Product, Category, AdminUser, SiteConfig
  seed.ts, seed-data.mjs  Datos de ejemplo (~40 productos) y lógica de seed
scripts/
  generate-placeholders.mjs  Genera las imágenes placeholder de /public/placeholders
```

## Seguridad implementada

- **Contraseñas:** hasheadas con bcrypt (12 rounds); nunca se guarda ni se loguea
  texto plano.
- **Sesión de administrador:** JWT en cookie `HttpOnly`, `SameSite=Lax`, `Secure`
  en producción (NextAuth v5 / Auth.js).
- **Middleware (`src/middleware.ts`):** bloquea cualquier request a `/admin/*` y a
  las API de administración si no hay sesión válida — es la única puerta de entrada.
- **Rate limiting de login:** máximo 5 intentos por minuto por IP + usuario
  (`src/lib/rate-limit.ts`). Para un despliegue con múltiples instancias, reemplazar
  por un store compartido (ej. Upstash Redis).
- **CSRF:** las Server Actions de Next.js verifican el origen de la request
  (`experimental.serverActions.allowedOrigins` en `next.config.ts`); NextAuth agrega
  su propio token CSRF en el flujo de login.
- **Validación:** todos los inputs (formularios y API) pasan por esquemas Zod antes
  de tocar la base de datos.
- **SQL Injection:** se usa exclusivamente Prisma Client con consultas tipadas; no
  hay SQL crudo en ningún punto del proyecto.
- **XSS:** React escapa el contenido por defecto (no se usa `dangerouslySetInnerHTML`
  en ningún lado); además se define una Content-Security-Policy en `next.config.ts`.
- **Subida de imágenes:** solo accesible autenticado; se valida tipo MIME y tamaño,
  y el archivo se re-codifica con `sharp` (esto también elimina metadata potencialmente
  maliciosa) con un nombre generado en el servidor (nunca el nombre original).
- **Headers de seguridad:** `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` y CSP, aplicados
  globalmente en `next.config.ts`.
- **`robots.txt`:** desaloja `/admin` y `/api` de los buscadores (capa adicional, no
  la protección real, que es el middleware).

## Notas de diseño

El layout (header de 75px, sidebar de filtros fija, grilla de tarjetas, etc.) está
inspirado únicamente en la distribución visual de una captura de referencia
proporcionada — ningún código ni recurso gráfico fue copiado de esa referencia.

## Despliegue en producción

- Las imágenes subidas desde el panel se guardan en `public/uploads` del propio
  servidor. Esto funciona bien en un servidor tradicional o en un contenedor
  Docker con volumen persistente, pero **no en plataformas serverless** (Vercel,
  AWS Lambda, etc.), donde el sistema de archivos es efímero o de solo lectura.
  Para ese caso, reemplazá `src/app/api/upload/route.ts` por una subida a un
  storage externo (S3, Cloudflare R2, Vercel Blob, etc.).
- El rate limiting de login (`src/lib/rate-limit.ts`) guarda los contadores en
  memoria del proceso. Sirve para una sola instancia; si se escala a múltiples
  instancias/contenedores, reemplazarlo por un store compartido (Upstash Redis,
  por ejemplo) para que todas las instancias compartan el mismo conteo.
