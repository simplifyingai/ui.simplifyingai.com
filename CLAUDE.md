# Simplify Charts - Claude Code Instructions

## Project Overview
Simplify Charts is a comprehensive data visualization library built on top of shadcn/ui patterns. It provides 40+ chart components for React applications.

## Important Rules

### Git Commits - NO CLAUDE ATTRIBUTION
**CRITICAL**: When creating git commits, NEVER include:
- `Co-Authored-By: Claude` or any Claude email
- `Generated with Claude Code` or similar footers
- Any mention of AI assistance in commit messages

Commit messages should be clean and professional:
```bash
git commit -m "feat: add new chart component"
```

### Project Structure
```
apps/www/                    # Main documentation site
├── app/                     # Next.js app router
├── components/              # UI components
├── content/docs/            # MDX documentation
├── registry/simplifying-ai/ # Chart component registry
│   ├── ui/charts/          # Chart components
│   └── examples/           # Demo examples
└── public/                  # Static assets

infra/                       # AWS CDK infrastructure
```

### Common Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build the project
- `pnpm typecheck` - Run TypeScript checks
- `pnpm registry:build` - Build component registry

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- D3.js for charts
- Plotly.js for advanced visualizations
- shadcn/ui patterns

### Adding New Charts
1. Create component in `apps/www/registry/simplifying-ai/ui/charts/`
2. Create demo in `apps/www/registry/simplifying-ai/examples/`
3. Add documentation in `apps/www/content/docs/components/`
4. Update registry exports

### GitHub
- Repository: simplifyingai/ui.simplifyingai.com
- Main branch: main
- CI/CD: GitHub Actions with AWS ECS deployment
