# Your Project Name

> Replace this description with your project's purpose.

A full-stack web application template built with **Next.js 15**, **Neon (PostgreSQL)**, and **Vercel** — optimized for AI-driven development with Claude Code.

## Tech Stack

| Category        | Technology                     |
| --------------- | ------------------------------ |
| Framework       | Next.js 15 (App Router)        |
| Language        | TypeScript                     |
| Styling         | Tailwind CSS v4                |
| Database        | Neon (PostgreSQL / Serverless) |
| ORM             | Drizzle ORM                    |
| Deploy          | Vercel                         |
| Package Manager | pnpm                           |

## Getting Started

### 1. Use this template

Click **"Use this template"** on GitHub to create a new repository.

### 2. Clone and install

```bash
git clone https://github.com/DaichiHatanaka/next-template
cd next-template
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 4. Set up Neon + Vercel

1. Create a project at [Neon Console](https://console.neon.tech)
2. Connect Neon to Vercel via Neon Console → Integrations → Vercel
3. Pull environment variables:

```bash
vercel env pull .env.local
```

### 5. Run database migrations

```bash
pnpm drizzle-kit migrate
```

### 6. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Available Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm type-check       # TypeScript type check

# Database
pnpm drizzle-kit generate   # Generate migration files
pnpm drizzle-kit migrate    # Run migrations
pnpm drizzle-kit studio     # Open DB GUI in browser

# Deploy
vercel                # Preview deploy
vercel --prod         # Production deploy
```

## Project Structure

```text
src/
├── app/              # App Router pages & layouts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── db/
│   ├── index.ts      # DB connection (getDb)
│   └── schema.ts     # Drizzle schema definitions
└── lib/
    └── utils.ts      # Shared utilities (cn, etc.)
```

## GitHub Actions

This template includes a **Vercel Preview Deployment** workflow that runs on every pull request.

**Required repository secrets:**

| Secret              | Description                  |
| ------------------- | ---------------------------- |
| `VERCEL_TOKEN`      | Vercel personal access token |
| `VERCEL_ORG_ID`     | Vercel organization/team ID  |
| `VERCEL_PROJECT_ID` | Vercel project ID            |

Get these values by running `vercel link` and checking `.vercel/project.json`.

## Claude Code Setup

This template is optimized for [Claude Code](https://claude.ai/code). Install the recommended plugins in a new environment:

```bash
npx claude-plugins install @anthropics/claude-code-plugins/frontend-design
npx claude-plugins install @anthropics/claude-code-plugins/feature-dev
npx claude-plugins install @anthropics/claude-code-plugins/code-review
npx claude-plugins install @anthropics/claude-code-plugins/pr-review-toolkit
npx claude-plugins install @anthropics/claude-code-plugins/commit-commands
npx claude-plugins install @anthropics/claude-code-plugins/security-guidance
npx claude-plugins install @anthropics/claude-code-workflows/backend-development
npx claude-plugins install @anthropics/claude-code-workflows/database-design
npx claude-plugins install @anthropics/claude-code-workflows/context-management
npx claude-plugins install @anthropics/claude-code-workflows/javascript-typescript
npx claude-plugins install @dotclaude/dotclaude-plugins/frontend-excellence
npx claude-plugins install @anthropics/claude-plugins-official/claude-md-management  # project-scoped
```

## License

MIT — see [LICENSE](LICENSE) for details.
