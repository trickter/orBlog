# orBlog - Personal Blog Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-SQLite-purple?style=flat&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License">
</p>

A modern, full-stack personal blog platform built with Next.js 16, featuring Markdown support, category management, ZIP import for posts, and a clean responsive design.

## ✨ Features

- **Markdown Blog Posts** - Write posts using familiar Markdown syntax
- **ZIP Import** - Import posts from ZIP files containing Markdown and images
- **Category Management** - Organize posts with categories
- **Search** - Full-text search across posts
- **Dark/Light Theme** - Toggle between dark and light modes
- **Admin Panel** - Protected admin area for post and category management
- **Responsive Design** - Works beautifully on all devices
- **SEO Friendly** - Server-side rendering for optimal SEO

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS v4
- **Markdown**: react-markdown + remark-gfm
- **Testing**: Jest + React Testing Library + Playwright

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd brainstorm

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Initialize database
npx prisma db push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Admin Access

1. Navigate to `/admin/login`
2. Enter your `ADMIN_SECRET` from `.env` file
3. Manage posts, categories, and profile

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public pages
│   │   ├── page.tsx       # Homepage
│   │   ├── about/         # About page
│   │   ├── search/        # Search page
│   │   └── posts/[slug]/  # Blog post pages
│   ├── admin/             # Admin pages (protected)
│   │   ├── login/         # Admin login
│   │   └── (protected)/   # Protected admin routes
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions & server actions
│   ├── actions-posts.ts   # Post CRUD operations
│   ├── actions-categories.ts
│   ├── actions-profile.ts
│   ├── auth.ts           # Authentication
│   └── prisma.ts         # Database client
└── styles/                # Global styles
```

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

| Variable       | Description          | Required | Default         |
| -------------- | -------------------- | -------- | --------------- |
| `DATABASE_URL` | SQLite database path | Yes      | `file:./dev.db` |
| `ADMIN_SECRET` | Admin password       | Yes      | -               |

Generate a secure admin secret:

```bash
openssl rand -base64 32
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

## 🏗 Deployment

### GitHub Actions -> Self-Hosted Server

This repository can deploy automatically to the existing server directory
`/app/ai-code/brainstorm` whenever code is pushed to `main`.

Required GitHub Actions secrets:

- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_PORT`
- `SERVER_SSH_KEY`

The workflow in `.github/workflows/deploy.yml` runs:

```bash
npm ci
npx prisma migrate deploy
npm run lint
npm test
npm run build
```

If those checks pass, GitHub builds a Next.js standalone release bundle,
smoke-tests it, uploads it over SSH, and runs `scripts/deploy-remote.sh` on
the server.

The remote deployment script now:

```bash
tar -xzf /tmp/orblog-release.tgz
ln -s shared/.env current/.env
ln -s shared/prisma/dev.db current/prisma/dev.db
ln -s releases/<git-sha> current
systemctl restart brainstorm.service
systemctl is-active brainstorm.service
```

Expected server layout:

```text
/app/ai-code/brainstorm/
  current -> releases/<git-sha>
  releases/
    <git-sha>/
      server.js
      .next/
      public/
      prisma/
  shared/
    .env
    prisma/
      dev.db
```

Important deployment notes:

- The deployment target path is fixed to `/app/ai-code/brainstorm`
- The systemd service name is fixed to `brainstorm.service`
- The server-side `.env` file lives at `shared/.env` and is never uploaded from GitHub
- The server-side SQLite database lives at `shared/prisma/dev.db`
- Each deployment creates an immutable release directory under `releases/`
- Standard deployments do not modify the database schema
- The server must already have Node.js and `systemctl` available

Recommended `shared/.env` value for SQLite:

```bash
DATABASE_URL="file:./dev.db"
ADMIN_SECRET="<your-admin-secret>"
```

The deployment script links `shared/prisma/dev.db` into `current/prisma/dev.db`,
so `file:./dev.db` continues to work without storing the database in the
release archive.

Example `systemd` service:

```ini
[Unit]
Description=orBlog standalone service
After=network.target

[Service]
Type=simple
WorkingDirectory=/app/ai-code/brainstorm/current
Environment=NODE_ENV=production
Environment=HOSTNAME=0.0.0.0
Environment=PORT=3000
EnvironmentFile=/app/ai-code/brainstorm/shared/.env
ExecStart=/usr/bin/node /app/ai-code/brainstorm/current/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Schema Migrations

Prisma schema changes are handled separately from standard releases.

Use the manual workflow in `.github/workflows/migrate.yml` when the repository
contains new Prisma migrations that need to be applied to the shared SQLite
database. That workflow uploads a small migration archive and runs
`scripts/migrate-remote.sh` on the server.

Normal content or UI deployments should continue to use `deploy.yml`.

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">Built with ❤️ using Next.js</p>
