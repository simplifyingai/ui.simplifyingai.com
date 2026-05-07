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

const EXTERNALS = ["react", "react-dom", "react/jsx-runtime"]

interface BuildTarget {
  /** Registry kind, e.g. `"line-chart"` — used for the URL slug. */
  kind: string
  /** Absolute path to the entry .tsx file. */
  entry: string
}

/**
 * Phase 1: ship one chart end-to-end so the pipeline is provably
 * working before we expand to all kinds. `line-chart` is a good
 * choice: non-trivial (uses d3-scale + d3-shape), depends on internal
 * helpers (ChartAxis, ChartContainer, …), so a successful bundle
 * exercises both externals and inlining.
 */
const PHASE_1_TARGETS: BuildTarget[] = [
  {
    kind: "line-chart",
    entry: path.join(REGISTRY_DIR, "basic/line-chart.tsx"),
  },
]

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

  console.log(
    `  built ${target.kind} -> ${finalJsName} (${formatBytes(sidecar.bytes)})`
  )

  return { ...sidecar, metafile: result.metafile }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

async function main() {
  console.log(`Building ${PHASE_1_TARGETS.length} chart bundle(s)...`)
  const results = []
  for (const target of PHASE_1_TARGETS) {
    results.push(await buildOne(target))
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

  console.log(`\nDone. Wrote ${results.length} bundle(s) to ${path.relative(ROOT, OUT_DIR)}/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
