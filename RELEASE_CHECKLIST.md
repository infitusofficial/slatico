# Slatico — Public Release Readiness & Distribution Checklist (`v0.1.0`)

This document outlines the verified pre-release audit, required manual registry account steps, and exact release sequence for publishing **Slatico by Infitus Creative Studio** (`27` icon families, `189` style variants across `7` styles, `8` platform SDKs).

> **Safety Rule:** No credentials, API tokens, PGP private keys, or signing keystores are stored in this repository. All publishing actions require explicit manual authentication or GitHub Actions Encrypted Secrets.

---

## 1. Recommended Public Release Order

Because the JavaScript/TypeScript packages depend on `@slatico/core`, packages must be published in topological dependency order:

1. **`@slatico/core`** (npm — foundational catalog, types, and style specifications; zero dependencies)
2. **`@slatico/svg`** (npm — depends on `@slatico/core`)
3. **`@slatico/font`** (npm — depends on `@slatico/core`)
4. **`@slatico/react`** (npm — depends on `@slatico/core`)
5. **`@slatico/vue`** (npm — depends on `@slatico/core`)
6. **`@slatico/web`** (npm — depends on `@slatico/core`)
7. **`@slatico/react-native`** (npm — depends on `@slatico/core`)
8. **`slatico_icons`** (pub.dev — standalone Flutter package with bundled TTF fonts and SVG assets)
9. **`com.infitus.slatico:slatico-android`** (Maven Central — standalone Android AAR with 189 `VectorDrawable` resources and Jetpack Compose APIs)
10. **`SlaticoIcons`** (GitHub Release Tag / Swift Package Index — standalone Swift Package with 189 `CGPath` vector specs and 189 bundled SVG resources)

---

## 2. Pre-Release Verification Gate (Run Before Any Publish)

Run the full clean build and verification pipeline from the monorepo root:

```bash
pnpm verify:clean
```

This single command executes:
1. `pnpm clean` — removes stale build artifacts
2. `pnpm icons:validate` — validates all 189 master SVG files on the `24×24` optical grid
3. `pnpm icons:generate` — regenerates all 8 platform SDKs deterministically
4. `pnpm build:packages` — compiles ESM, CJS, `.d.ts`, `.d.cts`, SVG sprites, and WOFF2/WOFF/TTF fonts
5. `pnpm lint` — runs ESLint across all packages and website sources
6. `pnpm typecheck` — runs TypeScript `--noEmit` across the workspace
7. `pnpm test` — runs Vitest unit and integration test suites
8. `pnpm build:website` — builds the static Next.js production website (`apps/website/out`)

---

## 3. npm Registry Checklist (`@slatico/*`)

### Completed Registry Setup
- **Organization Scope:** The **`@slatico`** organization scope has already been created on `npmjs.com`.
- **Package Configuration:** All 7 packages (`@slatico/core`, `@slatico/svg`, `@slatico/font`, `@slatico/react`, `@slatico/vue`, `@slatico/web`, `@slatico/react-native`) are configured with `"publishConfig": { "access": "public" }`, complete `exports` maps, `files` whitelists, and `"private": true` safety guards.

### Pending Manual Steps at Publish Time
1. Authenticate locally via `npm login` (with 2FA enabled) or configure an `NPM_TOKEN` automation secret if publishing via CI.
2. All 7 npm packages currently keep `"private": true` in `package.json` as an intentional safety guard against accidental publishing during monorepo development. When ready to publish `v0.1.0`:
   - Remove `"private": true` (or set `"private": false`) in:
     - `packages/core/package.json`
     - `packages/svg/package.json`
     - `packages/font/package.json`
     - `packages/react/package.json`
     - `packages/vue/package.json`
     - `packages/web/package.json`
     - `packages/react-native/package.json`
3. Use `pnpm publish` (which automatically rewrites `"@slatico/core": "workspace:*"` to `"@slatico/core": "0.1.0"` in the published tarball):

```bash
pnpm --filter @slatico/core publish --access public --no-git-checks
pnpm --filter @slatico/svg publish --access public --no-git-checks
pnpm --filter @slatico/font publish --access public --no-git-checks
pnpm --filter @slatico/react publish --access public --no-git-checks
pnpm --filter @slatico/vue publish --access public --no-git-checks
pnpm --filter @slatico/web publish --access public --no-git-checks
pnpm --filter @slatico/react-native publish --access public --no-git-checks
```

---

## 4. Flutter (`pub.dev`) Checklist (`slatico_icons`)

### Manual Account Setup Required
1. Authenticate with `dart pub login` using the verified Google account associated with the publisher domain (`slatico.dev`).

### Pre-Publish Dry-Run & Publish Commands
```bash
cd packages/flutter
flutter analyze
flutter test
dart pub publish --dry-run
# When ready to publish publicly:
# dart pub publish
```

---

## 5. Android Maven Central Checklist (`com.infitus.slatico:slatico-android`)

### Manual Account Setup Required
1. Register the **`com.infitus`** (or **`com.infitus.slatico`**) namespace on the **Sonatype Maven Central Portal** (`https://central.sonatype.com`) and verify DNS TXT ownership.
2. Generate a Sonatype Central Portal User Token (`SONATYPE_USERNAME` / `SONATYPE_PASSWORD`).
3. Generate and publish an ASCII-armored **PGP signing key** (`SIGNING_KEY_ID`, `SIGNING_PASSWORD`, `SIGNING_SECRET_KEY_RING_FILE` or in-memory key) to `keys.openpgp.org` / `keyserver.ubuntu.com`.

### Configured Gradle Artifact Metadata (`packages/android/library/build.gradle.kts`)
- **Group ID:** `com.infitus.slatico`
- **Artifact ID:** `slatico-android`
- **Version:** `0.1.0`
- **Artifacts Included:** Release `.aar`, `-sources.jar` (`withSourcesJar()`), `-javadoc.jar` (`withJavadocJar()`), and complete Maven Central POM (`name`, `description`, `url`, `licenses`, `developers`, `scm`).

### Local Verification Commands
```bash
cd packages/android
./gradlew :library:testDebugUnitTest :library:generatePomFileForReleasePublication :library:assembleRelease
```

---

## 6. Apple Swift Package Manager Checklist (`SlaticoIcons`)

### Architectural Distribution Options for SwiftPM
Swift Package Manager resolves Git repositories by looking for `Package.swift` at the **root** of the Git repository. Because `packages/swift/Package.swift` lives inside a subdirectory of the Slatico monorepo, choose one of the two supported release distribution strategies before tagging `0.1.0`:

1. **Option A — Dedicated Swift Mirror Repository (`Recommended for Xcode & Swift Package Index`):**
   Push the `packages/swift` subtree to `https://github.com/infitusofficial/slatico-swift.git` and tag `0.1.0`:
   ```bash
   git subtree push --prefix=packages/swift https://github.com/infitusofficial/slatico-swift.git main
   ```
   Developers then add `https://github.com/infitusofficial/slatico-swift.git` directly in Xcode (`File → Add Package Dependencies…`) or `Package.swift`.
2. **Option B — Local Monorepo Path Dependency:**
   Developers working with a local clone of `slatico` use `.package(path: "../slatico/packages/swift")`.

### Verification Commands (macOS / Linux with Swift 5.9+)
```bash
cd packages/swift
swift build
swift test
```

---

## 7. Cloudflare Pages Production Deployment (`https://slatico.dev`)

### Monorepo Build Settings
Connect the `infitusofficial/slatico` GitHub repository in **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git** with the following exact settings:

| Setting | Value |
| :--- | :--- |
| **Project name** | `slatico` |
| **Production branch** | `main` |
| **Framework preset** | `None` (Static Next.js Export in Monorepo) |
| **Root directory** | `/` (Repository root) |
| **Build command** | `pnpm install --frozen-lockfile && pnpm build:website` |
| **Build output directory** | `apps/website/out` |

### Environment Variables (Production & Preview)
Configure the following build environment variables in **Cloudflare Pages → Settings → Environment variables**:

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://slatico.dev` | Canonical origin for metadata, Open Graph, JSON-LD, `sitemap.xml`, and `robots.txt` |
| `NODE_VERSION` | `24` | Matches repository `.node-version` and GitHub Actions CI (`Node 24`) |
| `ENABLE_COREPACK` | `true` | Enables Corepack to resolve the repository `packageManager` (`pnpm@12.16.1` / `pnpm@10.16.1+`) from root `package.json` |

> **Note:** `pnpm build:website` automatically invokes `scripts/ensure-website-deps.ts` before running Next.js static export (`output: "export"`), ensuring `@slatico/core`, `@slatico/font`, `@slatico/svg`, `@slatico/react`, and `@slatico/web` are built even on a fresh Cloudflare Pages clone where `packages/*/dist` is not checked into git.

### Custom Domain, DNS & Redirect Rules (`slatico.dev`)
1. In **Cloudflare Pages → Custom domains → Set up a custom domain**:
   - Add **`slatico.dev`** (Cloudflare automatically creates a proxied `CNAME` record for `@` pointing to `<project>.pages.dev` and provisions an Universal SSL/TLS certificate).
   - Add **`www.slatico.dev`** (Cloudflare creates a proxied `CNAME` record for `www` pointing to `<project>.pages.dev`).
2. In **Cloudflare Zone (`slatico.dev`) → SSL/TLS**:
   - Set **SSL/TLS encryption mode** to **Full (strict)**.
   - Enable **Always Use HTTPS** under **SSL/TLS → Edge Certificates**.
3. Redirect `www.slatico.dev` to apex `https://slatico.dev` (with path & query preservation):
   - **Important:** Cloudflare Pages `_redirects` only evaluates relative URL paths (`source` starting with `/`) across all bound custom domains and must **not** be used for hostname (`www` → apex) redirects.
   - Configure a **Cloudflare Zone-Level Redirect Rule** in **Cloudflare Dashboard → Zone (`slatico.dev`) → Rules → Redirect Rules → Create rule**:
     - **Rule name:** `Redirect www.slatico.dev to apex https://slatico.dev`
     - **When incoming requests match (Custom filter expression):**
       ```text
       (http.host eq "www.slatico.dev")
       ```
     - **Then — Type:** `Dynamic`
     - **Expression:**
       ```text
       concat("https://slatico.dev", http.request.uri.path)
       ```
     - **Status code:** `301` (Permanent Redirect)
     - **Preserve query string:** `Enabled` (`true`)

---

## 8. Search Engine Indexing Preparation (`slatico.dev`)

Once `https://slatico.dev` is live on Cloudflare Pages:

### Google Search Console
1. Open [Google Search Console](https://search.google.com/search-console) and click **Add property**.
2. Select **Domain** property type and enter `slatico.dev`.
3. Copy the provided DNS `TXT` verification token (`google-site-verification=...`) and add it as a `TXT` record on `@` (`slatico.dev`) in **Cloudflare DNS**.
4. After ownership verification succeeds, navigate to **Sitemaps** and submit:
   ```text
   https://slatico.dev/sitemap.xml
   ```
5. Use **URL Inspection** to request indexing for `https://slatico.dev/`, `https://slatico.dev/icons`, and `https://slatico.dev/docs`.

### Bing Webmaster Tools
1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Choose **Import from Google Search Console** (fastest automatic verification) or add `https://slatico.dev` manually via Cloudflare DNS `TXT` / `CNAME` verification.
3. Navigate to **Sitemaps → Submit sitemap** and submit:
   ```text
   https://slatico.dev/sitemap.xml
   ```
