#!/usr/bin/env node
/**
 * This script generates the .source/source.config.mjs file
 * which is required by fumadocs-mdx but not auto-generated in version 11.x
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, '..', '.source');
const configPath = join(sourceDir, 'source.config.mjs');

// Ensure .source directory exists
if (!existsSync(sourceDir)) {
  mkdirSync(sourceDir, { recursive: true });
}

const configContent = `import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import rehypePrettyCode from "rehype-pretty-code";
import { z } from "zod";

// Inlined transformers from lib/highlight-code.ts
const transformers = [
  {
    code(node) {
      if (node.tagName === "code") {
        const raw = this.source;
        node.properties["__raw__"] = raw;

        if (raw.startsWith("npm install")) {
          node.properties["__npm__"] = raw;
          node.properties["__yarn__"] = raw.replace("npm install", "yarn add");
          node.properties["__pnpm__"] = raw.replace("npm install", "pnpm add");
          node.properties["__bun__"] = raw.replace("npm install", "bun add");
        }

        if (raw.startsWith("npx create-")) {
          node.properties["__npm__"] = raw;
          node.properties["__yarn__"] = raw.replace("npx create-", "yarn create ");
          node.properties["__pnpm__"] = raw.replace("npx create-", "pnpm create ");
          node.properties["__bun__"] = raw.replace("npx", "bunx --bun");
        }

        if (raw.startsWith("npm create")) {
          node.properties["__npm__"] = raw;
          node.properties["__yarn__"] = raw.replace("npm create", "yarn create");
          node.properties["__pnpm__"] = raw.replace("npm create", "pnpm create");
          node.properties["__bun__"] = raw.replace("npm create", "bun create");
        }

        if (raw.startsWith("npx")) {
          node.properties["__npm__"] = raw;
          node.properties["__yarn__"] = raw.replace("npx", "yarn");
          node.properties["__pnpm__"] = raw.replace("npx", "pnpm dlx");
          node.properties["__bun__"] = raw.replace("npx", "bunx --bun");
        }

        if (raw.startsWith("npm run")) {
          node.properties["__npm__"] = raw;
          node.properties["__yarn__"] = raw.replace("npm run", "yarn");
          node.properties["__pnpm__"] = raw.replace("npm run", "pnpm");
          node.properties["__bun__"] = raw.replace("npm run", "bun");
        }
      }
    },
  },
];

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push([
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light-default",
          },
          transformers,
        },
      ]);

      return plugins;
    },
  },
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      links: z
        .object({
          doc: z.string().optional(),
          api: z.string().optional(),
        })
        .optional(),
    }),
  },
});
`;

writeFileSync(configPath, configContent);
console.log('[source-config] Generated .source/source.config.mjs');
