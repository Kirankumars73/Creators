import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // next/og (Satori) renders plain <img>; next/image does not exist there.
  {
    files: ['src/lib/pass/image.tsx', 'src/lib/og/**', 'src/app/**/opengraph-image.tsx', 'src/app/**/icon.tsx', 'src/app/**/apple-icon.tsx'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  // Vendored React Bits components (src/components/bits): kept as published so they can be
  // refreshed from upstream; the React Compiler advisories are relaxed for that folder only.
  {
    files: ['src/components/bits/**'],
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".superpowers/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
