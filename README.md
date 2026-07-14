# Meridian B2B — Ecommerce B2B

Plataforma de ecommerce B2B (catálogo, filtros en tiempo real, modo oscuro) con un panel
de administración oculto en `/admin`. Construido con Next.js 15 (App Router), React 19,
TypeScript, Tailwind CSS, shadcn/ui, Prisma, NextAuth (Auth.js v5), Framer Motion,
React Hook Form + Zod y TanStack Query.

La base de datos es **PostgreSQL** tanto en desarrollo como en producción (ver la sección
[Producción](#producción-vercel) más abajo para el despliegue en Vercel).

## 1. Requisitos previos

- Node.js 20 o superior
- npm

## 2. Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
cp .env.example .env
```

Abrí `.env` y completá, como mínimo:

- `NEXTAUTH_SECRET`: generalo con `openssl rand -base64 32`.
- `ADMIN_PASSWORD`: la contraseña que quieras para el usuario administrador inicial
  (usuario `Fito` por defecto, configurable con `ADMIN_USERNAME`). **Se hashea con
  bcrypt al correr el seed — nunca queda en texto plano ni en el código.**

- `DATABASE_URL`: connection string de tu base Postgres (local, o la misma instancia
  hosteada — Neon, Supabase, Vercel Postgres — que uses en producción).

## 3. Migraciones y datos de ejemplo

```bash
# Aplica las migraciones ya versionadas en prisma/migrations (crea las tablas)
npx prisma migrate deploy

# Carga ~40 productos de ejemplo, categorías y el usuario administrador
npm run db:seed
```

Si `ADMIN_PASSWORD` no está definido en `.env`, el seed falla a propósito con un
mensaje explicando qué falta — así nunca se crea un admin sin contraseña.

## 4. Correr el proyecto

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
| `npm run format` | Formatea el código con Prettier |
| `npm run prisma:generate` | Genera el Prisma Client a partir del schema |
| `npm run prisma:studio` | Abre Prisma Studio (explorador visual de la base de datos) |
| `npm run prisma:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run prisma:deploy` | Aplica migraciones pendientes en producción |
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

## Producción: Vercel

El repo está listo para importarse directo en Vercel:

1. **Importá el repo** desde el dashboard de Vercel (New Project → seleccioná este
   repositorio de GitHub). El framework preset "Next.js" se detecta solo.

2. **Creá una base Postgres** (Vercel Postgres, Neon, Supabase, etc.) y cargá su
   connection string como variable de entorno `DATABASE_URL` en el proyecto de
   Vercel — Settings → Environment Variables. `prisma/schema.prisma` ya usa
   `provider = "postgresql"` y `prisma/migrations` ya tiene la migración inicial
   generada para ese motor.

3. **Cargá el resto de las variables** de `.env.example` en Vercel (Environment
   Variables): `AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_DOMAIN`,
   `NEXT_PUBLIC_SITE_URL` (tu dominio real de Vercel), `ADMIN_USERNAME` y
   `ADMIN_PASSWORD`. No definas `NEXTAUTH_URL` (ver el comentario en
   `.env.example` sobre por qué).

4. **Corré las migraciones contra la base de producción** una vez que
   `DATABASE_URL` esté configurada (desde tu máquina, apuntando a la misma base):

   ```bash
   npx prisma migrate deploy
   npm run db:seed   # opcional: carga categorías, productos de ejemplo y el admin
   ```

5. **Deploy.** Cada push a la rama principal dispara un build automático en Vercel
   (`npm install` → `postinstall` corre `prisma generate` → `npm run build`).

## Otras notas de despliegue

- Las imágenes subidas desde el panel se guardan en `public/uploads` **en disco**.
  Eso funciona para los archivos que ya están commiteados en el repo (se sirven
  como estáticos en el build), pero Vercel es serverless: el sistema de archivos
  en producción es de solo lectura, así que **las imágenes que se suban desde el
  admin en producción no van a persistir** entre despliegues. Para que las cargas
  nuevas funcionen hay que reemplazar `src/app/api/upload/route.ts` por un storage
  externo (Vercel Blob, S3, Cloudflare R2, etc.).
- El rate limiting de login (`src/lib/rate-limit.ts`) guarda los contadores en
  memoria del proceso. En Vercel cada función serverless puede correr en una
  instancia distinta, así que el conteo no se comparte entre invocaciones; para
  un rate limiting robusto ahí, reemplazarlo por un store compartido (Upstash
  Redis, por ejemplo).
