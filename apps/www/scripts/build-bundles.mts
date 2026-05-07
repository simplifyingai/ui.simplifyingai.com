/**
 * Compile chart components into versioned ESM bundles for runtime
 * consumption (Power-BI / Grafana / Looker style "load-the-renderer-
 * by-URL"). The shadcn-CLI `files[].content` pathway is left untouched;
 * this only adds a parallel artifact at `public/dist/charts/`.
 *
 * Output: `apps/www/public/dist/charts/<name>-<version>.mjs` (+ `.map`,
 * + `<name>-<version>.json` sidecar with `version` + SRI `integrity`).
 *
 * Externals: react, react-dom, react/jsx-runtime — peers, host
 * supplies them. d3 and project-internal helpers are inlined per
 * bundle in v1; if total size becomes a concern, split d3 into a
 * shared chunk later.
 *
 * Versioning: content-hash. Same source -> same URL -> immutable. New
 * source -> new URL. Old URLs keep working forever (consumers pin the
 * version in the manifest they cached).
 */
import * as esbuild from "esbuild"
import { createHash } from "node:crypto"
import { existsSync, promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")

const REGISTRY_DIR = path.join(ROOT, "registry/simplifying-ai/ui/charts")
const OUT_DIR = path.join(ROOT, "public/dist/charts")
/**
 * Per-item shadcn manifest directory. The shadcn CLI generates
 * `<kind>.json` files here from `registry.json` via
 * `scripts/build-registry.mts`. We augment those files in-place with
 * a `runtime` block (additive; shadcn CLI ignores unknown fields).
 */
const SHADCN_MANIFEST_DIR = path.join(ROOT, "public/r")

/**
 * Peer dependencies the host (e.g. chat-plot-db-frontend) is
 * expected to provide. Anything listed here stays as an `import` in
 * the bundle and is resolved at runtime against the host's module
 * graph.
 *
 * Why recharts is here: several chart kinds (area-chart, bar-chart,
 * …) wrap recharts. Inlining it adds ~300 KB per bundle, and any
 * realistic consumer already has recharts in its tree, so treating
 * it like React is the right call. Host must pin a compatible
 * version (currently aligned at recharts ^2.15).
 *
 * d3 modules (d3-scale, d3-shape, …) are intentionally NOT
 * externalised. They tree-shake well, are small per-bundle, and
 * forcing every consumer to pin the same d3 versions would create
 * unnecessary coupling.
 */
const EXTERNALS = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "recharts",
]

interface BuildTarget {
  /** Registry kind, e.g. `"line-chart"` — used for the URL slug. */
  kind: string
  /** Absolute path to the entry .tsx file. */
  entry: string
}

/**
 * Discover every chart-kind .tsx under
 * `registry/simplifying-ai/ui/charts/<category>/`. Files at the
 * `ui/charts/` root (chart-axis, chart-container, chart-grid, …) are
 * shared helpers, not standalone charts, so they're excluded by the
 * directory-depth rule.
 *
 * The kind name is the file's basename without the `.tsx` suffix —
 * matches the canonical name used in `registry/registry-ui.ts` and
 * the public `/r/<kind>.json` manifest filename.
 */
async function discoverTargets(): Promise<BuildTarget[]> {
  const entries = await fs.readdir(REGISTRY_DIR, { withFileTypes: true })
  const categories = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  const targets: BuildTarget[] = []
  for (const category of categories) {
    const categoryDir = path.join(REGISTRY_DIR, category)
    const files = await fs.readdir(categoryDir)
    for (const file of files) {
      if (!file.endsWith(".tsx")) continue
      if (file === "index.tsx") continue
      const kind = file.replace(/\.tsx$/, "")
      targets.push({ kind, entry: path.join(categoryDir, file) })
    }
  }
  // Stable, alphabetical order so build logs and `index.json` are
  // diffable across runs regardless of `readdir` order on the host
  // filesystem.
  targets.sort((a, b) => a.kind.localeCompare(b.kind))
  return targets
}

function sha384Base64(buf: Buffer): string {
  return `sha384-${createHash("sha384").update(buf).digest("base64")}`
}

function shortContentHash(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").slice(0, 10)
}

async function buildOne(target: BuildTarget) {
  if (!existsSync(target.entry)) {
    throw new Error(`Entry not found: ${target.entry}`)
  }

  // Stage 1: build to a temp output so we can hash before naming.
  const stagingFile = path.join(OUT_DIR, `${target.kind}.staging.mjs`)
  await fs.mkdir(OUT_DIR, { recursive: true })

  const result = await esbuild.build({
    entryPoints: [target.entry],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    external: EXTERNALS,
    // The chart components import via the `@/...` alias (e.g.
    // `@/lib/utils`). Map the alias to the apps/www root so esbuild
    // resolves `@/lib/utils` → `apps/www/lib/utils.ts`.
    alias: {
      "@": ROOT,
    },
    jsx: "automatic",
    loader: { ".ts": "ts", ".tsx": "tsx" },
    minify: true,
    sourcemap: "linked",
    metafile: true,
    outfile: stagingFile,
    legalComments: "none",
    treeShaking: true,
    logLevel: "warning",
  })

  // Stage 2: read staged artefact, derive version from content hash,
  // rename to versioned filename. Map file gets renamed too so the
  // sourcemap reference resolves.
  const stagedJs = await fs.readFile(stagingFile)
  const version = `1.0.0-${shortContentHash(stagedJs)}`
  const finalJsName = `${target.kind}-${version}.mjs`
  const finalJsPath = path.join(OUT_DIR, finalJsName)
  const finalMapName = `${finalJsName}.map`
  const finalMapPath = path.join(OUT_DIR, finalMapName)

  // Update the `//# sourceMappingURL=` comment to point at the
  // versioned map filename before writing the final js.
  const stagedJsText = stagedJs.toString("utf8")
  const finalJsText = stagedJsText.replace(
    /\/\/# sourceMappingURL=.+$/m,
    `//# sourceMappingURL=${finalMapName}`
  )
  await fs.writeFile(finalJsPath, finalJsText, "utf8")

  // Move the map.
  const stagedMapPath = `${stagingFile}.map`
  if (existsSync(stagedMapPath)) {
    await fs.rename(stagedMapPath, finalMapPath)
  }
  await fs.unlink(stagingFile)

  // Sidecar JSON: what the runtime loader needs to know without
  // having to fetch the full bundle to inspect it.
  const integrity = sha384Base64(Buffer.from(finalJsText, "utf8"))
  const sidecar = {
    kind: target.kind,
    version,
    bundle_url: `/dist/charts/${finalJsName}`,
    integrity,
    bytes: Buffer.byteLength(finalJsText, "utf8"),
    builtAt: new Date().toISOString(),
  }
  const sidecarPath = path.join(OUT_DIR, `${target.kind}-${version}.json`)
  await fs.writeFile(sidecarPath, JSON.stringify(sidecar, null, 2) + "\n")

  // Also write a `<kind>-latest.json` pointer so callers without a
  // version can resolve "what's current". The versioned manifest
  // remains the source of truth for pinned consumers.
  const latestPath = path.join(OUT_DIR, `${target.kind}-latest.json`)
  await fs.writeFile(latestPath, JSON.stringify(sidecar, null, 2) + "\n")

  await augmentShadcnManifest(target.kind, sidecar)

  console.log(
    `  built ${target.kind} -> ${finalJsName} (${formatBytes(sidecar.bytes)})`
  )

  return { ...sidecar, metafile: result.metafile }
}

/**
 * Merge a `runtime` block into the corresponding shadcn manifest
 * (`public/r/<kind>.json`) so a single fetch returns both the
 * shadcn-CLI payload (`files[].content`, `dependencies`, …) and the
 * runtime-ESM pointer (`bundle_url`, `version`, `integrity`).
 *
 * Why a nested `runtime` key instead of top-level fields: shadcn may
 * reserve top-level names in future schema versions. Namespacing
 * under `runtime` keeps us forward-compatible and visually flags the
 * fields as "not part of the shadcn contract."
 *
 * Idempotent: writes the same content for the same input. Re-running
 * `bundles:build` after an unchanged source produces zero diff.
 *
 * Best-effort: if `public/r/<kind>.json` doesn't exist (the shadcn
 * registry build hasn't been run yet, or this kind isn't registered),
 * we skip with a warning rather than fail. The bundle and sidecar
 * are still produced.
 */
async function augmentShadcnManifest(
  kind: string,
  sidecar: {
    version: string
    bundle_url: string
    integrity: string
    bytes: number
    builtAt: string
  }
) {
  const manifestPath = path.join(SHADCN_MANIFEST_DIR, `${kind}.json`)
  if (!existsSync(manifestPath)) {
    console.warn(
      `  ! manifest not found: public/r/${kind}.json — run \`pnpm registry:build\` first to populate it. Skipping augment.`
    )
    return
  }
  const raw = await fs.readFile(manifestPath, "utf-8")
  const manifest = JSON.parse(raw) as Record<string, unknown>
  // Only stable, source-derived fields go into the committed
  // manifest. Volatile metadata (`builtAt`) lives in the sidecar
  // under `public/dist/charts/` (gitignored), not here — committing
  // a fresh timestamp on every build would create constant diff
  // churn for unchanged source.
  manifest.runtime = {
    bundle_url: sidecar.bundle_url,
    version: sidecar.version,
    integrity: sidecar.integrity,
    bytes: sidecar.bytes,
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

async function main() {
  const targets = await discoverTargets()
  console.log(`Building ${targets.length} chart bundle(s)...`)

  // Per-chart fail-soft: a typo in one chart shouldn't lose the
  // build for every other chart. We still exit non-zero at the end
  // if anything failed, so CI catches it.
  const results: Array<Awaited<ReturnType<typeof buildOne>>> = []
  const failures: Array<{ kind: string; error: string }> = []
  for (const target of targets) {
    try {
      results.push(await buildOne(target))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`  ✗ ${target.kind}: ${message}`)
      failures.push({ kind: target.kind, error: message })
    }
  }

  // Aggregate index — useful for the runtime loader's discovery
  // ("what kinds are currently available, at what versions?"). Keep
  // it small: only the per-kind latest pointer.
  const index = results.map((r) => ({
    kind: r.kind,
    version: r.version,
    bundle_url: r.bundle_url,
    integrity: r.integrity,
  }))
  await fs.writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), charts: index }, null, 2) +
      "\n"
  )

  console.log(
    `\nDone. ${results.length} bundle(s) ok, ${failures.length} failed. Wrote to ${path.relative(ROOT, OUT_DIR)}/`
  )
  if (failures.length) {
    console.error(`\nFailures:`)
    failures.forEach((f) => console.error(`  - ${f.kind}: ${f.error}`))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
