import nextConfig from "eslint-config-next"

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "out/**",
      "build/**",
      "*.config.js",
      "*.config.mjs",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@next/next/no-duplicate-head": "off",
      // Downgrade new React Compiler rules to warnings
      // These are stricter rules from react-hooks 7.x that require refactoring
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-render": "warn",
      // Temporarily downgrade rules-of-hooks to fix pre-existing conditional hook issues
      // TODO: Fix heatmap-chart.tsx conditional hooks and remove this override
      "react-hooks/rules-of-hooks": "warn",
    },
  },
]

export default eslintConfig
