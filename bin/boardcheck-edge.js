#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { scanListings } from "../dist/engine/scanner.js";

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Boardcheck Edge CLI — AI Agent Marketplace Honesty Oracle

Usage:
  boardcheck-edge <path-to-listings.json>
  boardcheck-edge --version
  boardcheck-edge --help

Options:
  --json       Output raw JSON report
  --exit-code  Exit with code 1 if high_risk detected (default: true)
`);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log("boardcheck-edge v1.0.0 (Standard AMS-001..AMS-005)");
  process.exit(0);
}

const filePath = path.resolve(process.cwd(), args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found at ${filePath}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(content);
  const listings = Array.isArray(data) ? data : data.listings || [];

  const report = scanListings(listings);

  console.log(JSON.stringify(report, null, 2));

  if (report.verdict === "high_risk") {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (err) {
  console.error(`Execution error: ${err.message}`);
  process.exit(1);
}
