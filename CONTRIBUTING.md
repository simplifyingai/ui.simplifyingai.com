# Contributing to Simplify Charts

Thanks for your interest in contributing to Simplify Charts!

Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

If you need any help, feel free to reach out to the Simplifying AI team.

## About this repository

This repository is a monorepo.

- We use [pnpm](https://pnpm.io) and [`workspaces`](https://pnpm.io/workspaces) for development.
- We use [Turborepo](https://turbo.build/repo) as our build system.

## Structure

This repository is structured as follows:

```
apps
└── www
    ├── app
    ├── components
    ├── content
    └── registry
        └── simplifying-ai
            ├── examples      # Chart demos and examples
            └── ui
                └── charts    # Chart components
                    ├── basic
                    ├── statistical
                    ├── financial
                    ├── scientific
                    ├── specialized
                    └── maps
```

| Path                              | Description                              |
| --------------------------------- | ---------------------------------------- |
| `apps/www/app`                    | The Next.js application for the website. |
| `apps/www/components`             | The React components for the website.    |
| `apps/www/content`                | The content for the website.             |
| `apps/www/registry`               | The registry for the components.         |
| `apps/www/registry/.../ui/charts` | Chart components organized by category.  |

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/simplifying-ai/charts.git
```

### Navigate to project directory

```bash
cd charts
```

### Create a new Branch

```bash
git checkout -b my-new-branch
```

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

The site will be available at [http://localhost:4000](http://localhost:4000).

## Documentation

The documentation for this project is located in the `www` workspace. You can run the documentation locally by running the following command:

```bash
pnpm dev
```

Documentation is written using [MDX](https://mdxjs.com). You can find the documentation files in the `apps/www/content/docs` directory.

## Adding New Charts

### Chart Structure

Charts are organized by category:

```
apps/www/registry/simplifying-ai/ui/charts/
├── basic/           # Bar, Line, Area, Pie, Scatter, Donut
├── statistical/     # Histogram, Box Plot, Violin
├── financial/       # Candlestick, Waterfall, Funnel
├── scientific/      # Heatmap, Contour
├── specialized/     # Radar, Sankey, Sunburst, Treemap, Gauge
└── maps/            # Choropleth
```

### Adding a New Chart

1. Create the chart component in the appropriate category folder
2. Create demo examples in `apps/www/registry/simplifying-ai/examples/`
3. Add documentation in `apps/www/content/docs/charts/`
4. Run `pnpm registry:build` to update the registry
5. Test the chart in the development server

### Chart Variants

When adding charts, consider creating multiple variants:

- Default implementation
- Horizontal/vertical orientation
- Interactive with tooltips
- With/without legend
- Different color schemes
- Animated transitions
- Minimal/detailed styles

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`category(scope or module): message` in your commit message while using one of
the following categories:

- `feat / feature`: all changes that introduce completely new code or new features
- `fix`: changes that fix a bug (ideally you will additionally reference an issue if present)
- `refactor`: any code related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation
- `build`: all changes regarding the build of the software, changes to dependencies
- `test`: all changes regarding tests (adding new tests or changing existing ones)
- `ci`: all changes regarding the configuration of continuous integration
- `chore`: all changes to the repository that do not fit into any of the above categories

Examples:
```
feat(charts): add new radar chart variant with filled area
fix(candlestick): correct tooltip positioning on hover
docs(choropleth): add documentation for India map variant
```

If you are interested in the detailed specification you can visit
https://www.conventionalcommits.org/

## Requests for New Charts

If you have a request for a new chart type or variant, please open a discussion on GitHub. We'll be happy to help you out.

### Chart Request Template

When requesting a new chart, please include:

1. **Chart type**: What kind of chart?
2. **Use case**: What problem does it solve?
3. **Reference**: Link to an example or inspiration
4. **Data structure**: What data format should it accept?

## Pull Request Guidelines

1. Ensure all tests pass
2. Update documentation if needed
3. Run `pnpm registry:build` before submitting
4. Include screenshots for visual changes
5. Reference any related issues

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Ensure components are accessible

## Questions?

Feel free to open an issue or discussion if you have any questions!

---

Thank you for contributing to Simplify Charts!
