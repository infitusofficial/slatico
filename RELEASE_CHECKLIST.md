# Slatico — Public Release Readiness & Distribution Checklist (`v0.1.0`)

This document outlines the verified pre-release audit, required manual registry account steps, and exact release sequence for publishing **Slatico by Infitus Creative Studio** (`27` icon families, `189` style variants across `7` styles, `8` platform SDKs).

> **Release Status (2026-11-02):** `0.1.0` is published for all 10 packages — npm (`@slatico/core`, `svg`, `font`, `react`, `vue`, `web`, `react-native`), pub.dev (`slatico_icons`, verified publisher `slatico.dev`), Maven Central (`dev.slatico:slatico-android`), and Swift Package Manager (`https://github.com/infitusofficial/slatico-swift`, tag `0.1.0`). Published versions are immutable; any fix ships as `0.1.1` or later. The steps below remain as the procedure for future releases.

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
9. **`dev.slatico:slatico-android`** (Maven Central — standalone Android AAR with 189 `VectorDrawable` resources and Jetpack Compose APIs)
10. **`SlaticoIcons`** (Git tag on `slatico-swift` + GitHub Release — standalone Swift Package with 189 `CGPath` vector specs and 189 bundled SVG resources)

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

### Completed Registry & Manifest Setup
- **Organization Scope:** The **`@slatico`** organization scope has already been created on `npmjs.com`.
- **Package Configuration:** All 7 publishable packages (`@slatico/core`, `@slatico/svg`, `@slatico/font`, `@slatico/react`, `@slatico/vue`, `@slatico/web`, `@slatico/react-native`) are configured with `"version": "0.1.0"`, `"homepage": "https://slatico.dev"`, `"publishConfig": { "access": "public" }`, complete `exports` maps, and strict `files` whitelists (`"private"` removed for public release).
- **Private Workspace Safeguards:** The monorepo root (`package.json`), website (`apps/website/package.json`), and example project (`examples/react-native/package.json`) retain `"private": true`.

### Step-by-Step First Public Release (`v0.1.0`)
1. Authenticate interactively on your local machine with an npm account that has publish access to the `@slatico` organization and 2FA enabled:
   ```bash
   npm login
   npm whoami
   npm org ls slatico
   ```
2. Publish **Wave 1 (`@slatico/core`)** first using `pnpm publish` (which rewrites `"@slatico/core": "workspace:*"` to `"0.1.0"` in dependent tarballs):
   ```bash
   pnpm --filter @slatico/core publish --access public --no-git-checks
   ```
3. Verify `@slatico/core@0.1.0` is live on `registry.npmjs.org` before publishing dependent packages:
   ```bash
   npm view @slatico/core@0.1.0 version dist.tarball
   ```
4. Publish **Wave 2** (all 6 packages that depend only on `@slatico/core@0.1.0`):
   ```bash
   pnpm --filter @slatico/svg publish --access public --no-git-checks
   pnpm --filter @slatico/font publish --access public --no-git-checks
   pnpm --filter @slatico/react publish --access public --no-git-checks
   pnpm --filter @slatico/vue publish --access public --no-git-checks
   pnpm --filter @slatico/web publish --access public --no-git-checks
   pnpm --filter @slatico/react-native publish --access public --no-git-checks
   ```
5. Verify each published package on the registry:
   ```bash
   npm view @slatico/svg@0.1.0 version
   npm view @slatico/font@0.1.0 version
   npm view @slatico/react@0.1.0 version
   npm view @slatico/vue@0.1.0 version
   npm view @slatico/web@0.1.0 version
   npm view @slatico/react-native@0.1.0 version
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

## 5. Android Maven Central Checklist (`dev.slatico:slatico-android`)

### Verified Namespace & Central Portal Setup
- **Verified Maven Central Namespace:** **`dev.slatico`** (already verified on the Sonatype Central Publisher Portal at `https://central.sonatype.com`).
- **Maven Coordinates:** `dev.slatico:slatico-android:0.1.0`
- **Kotlin Package Namespace:** `com.infitus.slatico` (preserved for source compatibility).
- **Configured Gradle Artifact Metadata (`packages/android/library/build.gradle.kts`):**
  - **Group ID:** `dev.slatico`
  - **Artifact ID:** `slatico-android`
  - **Version:** `0.1.0`
  - **Artifacts Included:** Release `.aar`, `-sources.jar` (`withSourcesJar()`), `-javadoc.jar` (`withJavadocJar()`), `.pom`, `.module`, `.md5` / `.sha1` / `.sha256` / `.sha512` checksums, and `.asc` PGP signatures.

### Local Credential & PGP Setup (`~/.gradle/gradle.properties` — Never Commit)
1. Generate a **Sonatype Central Portal User Token** at `https://central.sonatype.com/account` → **Generate User Token**.
2. Generate and publish an ASCII-armored **PGP signing key** to a public keyserver (`keys.openpgp.org` or `keyserver.ubuntu.com`).
3. Add credentials to your user-level `~/.gradle/gradle.properties` (outside the repository) or export as environment variables:
   ```properties
   mavenCentralUsername=<YOUR_CENTRAL_PORTAL_TOKEN_USERNAME>
   mavenCentralPassword=<YOUR_CENTRAL_PORTAL_TOKEN_PASSWORD>
   signingKeyId=<8_CHAR_PGP_KEY_ID>
   signingPassword=<PGP_KEY_PASSPHRASE>
   signingKey=<ASCII_ARMORED_PRIVATE_KEY>
   ```

### Local Build, Bundle & Validation Upload Commands (`USER_MANAGED`)
```bash
cd packages/android
# 1. Run unit tests, generate POM, and package the Central Portal staging bundle (.zip):
./gradlew :library:testDebugUnitTest :library:packageCentralPortalBundle

# 2. Submit signed bundle to Sonatype Central Portal for validation (USER_MANAGED — does not auto-publish):
./gradlew :library:uploadCentralPortalBundle
```

---

## 6. Apple Swift Package Manager Checklist (`SlaticoIcons`)

### Distribution via the Dedicated `slatico-swift` Repository
SwiftPM requires `Package.swift` at the repository root, so `packages/swift` is mirrored to `https://github.com/infitusofficial/slatico-swift` (which carries its own CI in `packages/swift/.github/`). `packages/swift` in this monorepo remains the only source of truth:

```bash
# From an up-to-date monorepo main:
git subtree split --prefix=packages/swift -b slatico-swift-split
# Must be a fast-forward of slatico-swift main — never force-push:
git push https://github.com/infitusofficial/slatico-swift.git slatico-swift-split:refs/heads/main
# After slatico-swift CI passes, tag in a fresh clone of slatico-swift (not in the monorepo):
git tag -a <version> -m "SlaticoIcons <version>" && git push origin refs/tags/<version>
```

Pushing the tag runs the repository's remote consumer verification. Consumers depend on it with:

```swift
.package(url: "https://github.com/infitusofficial/slatico-swift.git", from: "0.1.0")
// SwiftPM package identity comes from the URL:
.product(name: "SlaticoIcons", package: "slatico-swift")
```

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
