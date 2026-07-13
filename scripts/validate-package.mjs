#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/validate-package.mjs path/to/skill");
  process.exit(2);
}

const root = path.resolve(target);
const repoRoot = path.resolve(root, "..", "..");
const errors = [];
const required = [
  "SKILL.md",
  "LICENSE.txt",
  "agents/openai.yaml",
  "assets/template-zhongguose/index.html",
  "assets/theme-cover-gallery.html",
  "assets/template-zhongguose/assets/motion.min.js",
  "assets/template-zhongguose/assets/lucide.min.js",
  "assets/template-zhongguose/assets/placeholder-profile.svg",
  "assets/template-zhongguose/assets/placeholder-scroll.svg",
  "assets/template-zhongguose/assets/placeholder-wide.svg",
  "assets/template-zhongguose/assets/licenses/MOTION-MIT.txt",
  "assets/template-zhongguose/assets/licenses/LUCIDE-ISC-AND-FEATHER-MIT.txt",
  "assets/template-zhongguose/assets/fonts/zhongguose-cover.woff2",
  "assets/template-zhongguose/assets/fonts/zhongguose-cover.manifest.json",
  "assets/template-zhongguose/assets/fonts/OFL-1.1.txt",
  "assets/template-zhongguose/assets/fonts/FONT-NOTICE.txt",
  "assets/font-sources/qijic-original.ttf.gz",
  "assets/font-sources/OFL-1.1.txt",
  "assets/font-sources/FONT-NOTICE.txt",
  "references/content-architecture.md",
  "references/layout-patterns.md",
  "references/quality-checklist.md",
  "references/visual-system.md",
  "scripts/check-cover-glyphs.py",
  "scripts/extract-deck-outline.mjs",
  "scripts/validate-deck.mjs",
  "scripts/preview-deck.mjs",
  "scripts/browser-qa.mjs",
  "scripts/subset-cover-font.py",
  "requirements.txt"
];

const requiredRepositoryFiles = [
  ".github/workflows/validate.yml",
  ".gitignore",
  "LICENSE",
  "README.md",
  "THIRD_PARTY_NOTICES.md",
  "package.json",
  "package-lock.json"
];

const pinnedAssetHashes = {
  "assets/template-zhongguose/assets/motion.min.js": "45615c1e7639fb9828942d0689c897e745690b0f6df13022223c9409fc01557c",
  "assets/template-zhongguose/assets/lucide.min.js": "2e8b4b1c419d4d41442a497a19b7ab5a727fefb3d25202af3c4f97d3aac14d0d"
};

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) {
    errors.push("Missing required file: " + relative);
  }
}

for (const relative of requiredRepositoryFiles) {
  if (!fs.existsSync(path.join(repoRoot, relative))) {
    errors.push("Missing repository file: " + relative);
  }
}

for (const [relative, expected] of Object.entries(pinnedAssetHashes)) {
  const file = path.join(root, relative);
  if (fs.existsSync(file)) {
    const actual = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    if (actual !== expected) {
      errors.push("Pinned third-party asset hash mismatch: " + relative);
    }
  }
}

const skillFile = path.join(root, "SKILL.md");
if (fs.existsSync(skillFile)) {
  const content = fs.readFileSync(skillFile, "utf8");
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    errors.push("SKILL.md frontmatter is missing.");
  } else {
    const name = frontmatter[1].match(/^name:\s*([a-z0-9-]+)\s*$/m);
    if (!name) {
      errors.push("Frontmatter name is missing or invalid.");
    } else if (name[1] !== path.basename(root)) {
      errors.push("Frontmatter name must match the skill folder.");
    }
    if (!/^description:\s*(?:\|-)?\s*$/m.test(frontmatter[1])) {
      errors.push("Frontmatter description is missing.");
    }
  }
  const lineCount = content.split(/\r?\n/).length;
  if (lineCount > 500) {
    errors.push("SKILL.md exceeds 500 lines: " + lineCount);
  }
}

for (const reference of ["content-architecture.md", "layout-patterns.md", "visual-system.md"]) {
  const file = path.join(root, "references", reference);
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");
    if (content.split(/\r?\n/).length > 100 && !/^## 目录 \/ Contents$/m.test(content)) {
      errors.push("Long reference lacks a table of contents: references/" + reference);
    }
  }
}

const thirdPartyNotices = path.join(repoRoot, "THIRD_PARTY_NOTICES.md");
if (fs.existsSync(thirdPartyNotices)) {
  const notices = fs.readFileSync(thirdPartyNotices, "utf8");
  for (const marker of ["qiji-font", "motion@11.11.17", "lucide@0.525.0"]) {
    if (!notices.includes(marker)) {
      errors.push("THIRD_PARTY_NOTICES.md is missing: " + marker);
    }
  }
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (["__pycache__", "node_modules", ".pytest_cache"].includes(entry.name)) {
        errors.push("Generated cache directory must not ship: " + path.relative(root, full));
      } else {
        walk(full);
      }
    } else if (/\.(?:pyc|pyo|log|tmp|bak)$/i.test(entry.name) || /^\.env(?:\.|$)/i.test(entry.name)) {
      errors.push("Generated or sensitive file must not ship: " + path.relative(root, full));
    } else if (entry.isFile() && fs.statSync(full).size >= 100 * 1024 * 1024) {
      errors.push("File reaches GitHub's 100 MiB hard limit: " + path.relative(root, full));
    }
  }
}

walk(root);

if (errors.length > 0) {
  console.error("Package validation failed:");
  errors.forEach(function (error) { console.error("- " + error); });
  process.exit(1);
}

console.log("Package validation passed: " + root);
