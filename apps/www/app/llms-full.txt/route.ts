import { NextResponse } from "next/server"

import { siteConfig } from "@/lib/config"
import { source } from "@/lib/source"

export const revalidate = false

function generateHeader() {
  return `# ${siteConfig.name} - Full Documentation

> ${siteConfig.description}

This document contains the complete documentation for ${siteConfig.name}, a comprehensive chart library built on shadcn/ui.

Website: ${siteConfig.url}
GitHub: ${siteConfig.links.github}

---

`
}

function generateInstallationSection() {
  return `## Installation

Install any chart component using the shadcn CLI:

\`\`\`bash
npx shadcn@latest add ${siteConfig.url}/r/<component-name>.json
\`\`\`

For example, to install the Line Chart:

\`\`\`bash
npx shadcn@latest add ${siteConfig.url}/r/line-chart.json
\`\`\`

### Prerequisites

- React 18 or higher
- Tailwind CSS
- shadcn/ui configured in your project

---

`
}

export async function GET() {
  const pages = source.getPages()

  let fullContent = generateHeader()
  fullContent += generateInstallationSection()

  // Group pages by category
  const rootPages: typeof pages = []
  const componentPages: typeof pages = []

  for (const page of pages) {
    if (page.slugs[0] === "components") {
      componentPages.push(page)
    } else {
      rootPages.push(page)
    }
  }

  // Add root documentation pages
  if (rootPages.length > 0) {
    fullContent += `## Getting Started\n\n`
    for (const page of rootPages) {
      const title = page.data.title || page.slugs.join(" / ")
      // @ts-expect-error - fumadocs types
      const content = page.data.content || ""
      fullContent += `### ${title}\n\n`
      fullContent += `${content}\n\n`
      fullContent += `---\n\n`
    }
  }

  // Add component documentation
  if (componentPages.length > 0) {
    fullContent += `## Chart Components\n\n`
    fullContent += `${siteConfig.name} provides the following chart components:\n\n`

    for (const page of componentPages) {
      const title = page.data.title || page.slugs[page.slugs.length - 1]
      const description = page.data.description || ""
      // @ts-expect-error - fumadocs types
      const content = page.data.content || ""

      fullContent += `### ${title}\n\n`
      if (description) {
        fullContent += `> ${description}\n\n`
      }
      fullContent += `URL: ${siteConfig.url}/docs/${page.slugs.join("/")}\n\n`
      fullContent += `Installation:\n\`\`\`bash\nnpx shadcn@latest add ${siteConfig.url}/r/${page.slugs[page.slugs.length - 1]}.json\n\`\`\`\n\n`
      fullContent += `${content}\n\n`
      fullContent += `---\n\n`
    }
  }

  // Add footer
  fullContent += `## Links

- Website: ${siteConfig.url}
- GitHub: ${siteConfig.links.github}
- Summary: ${siteConfig.url}/llms.txt

Generated for LLM consumption. For interactive documentation, visit ${siteConfig.url}
`

  return new NextResponse(fullContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
