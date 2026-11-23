#!/usr/bin/env node
// main.ts — Monday 23 November 2026 broadsheet entry.
//
// Validates the embedded JPEG (1024x1024, whole file, at most 1 MiB) and
// copies it byte for byte to <output>/entry.png. Node 22, standard library
// only, no network: the output directory is an optional argv path, else the
// MAKEFUN_OUTPUT_DIR environment path (a path, never code), else /output
// when that directory exists, else ./output.
//
// Run locally:  mkdir -p out && node main.ts out
// The grader runs it with no arguments and MAKEFUN_OUTPUT_DIR set.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "entry.jpg");
const MAX_BYTES = 1048576;
const WANT_W = 1024;
const WANT_H = 1024;

function fail(message) {
  console.error("main.ts: " + message);
  process.exit(1);
}

function resolveOutputDir() {
  const arg = process.argv[2];
  if (arg !== undefined && arg !== "") {
    return arg;
  }
  const envDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (envDir !== undefined && envDir !== "") {
    return envDir;
  }
  if (existsSync("/output") && statSync("/output").isDirectory()) {
    return "/output";
  }
  return join(process.cwd(), "output");
}

// Parse JPEG markers; returns { width, height } from the first SOF0/SOF2.
// Throws on: short file, missing SOI, early EOI, truncated SOF, second SOI.
function jpegDimensions(buf) {
  if (buf.length < 4) {
    throw new Error("file too short to be a JPEG (" + buf.length + " bytes)");
  }
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error("missing JPEG SOI marker (expected FF D8)");
  }
  if (buf[buf.length - 2] !== 0xff || buf[buf.length - 1] !== 0xd9) {
    throw new Error("missing JPEG EOI marker at end of file");
  }
  let pos = 2;
  while (pos + 1 < buf.length) {
    if (buf[pos] !== 0xff) {
      throw new Error("bad marker prefix at offset " + pos);
    }
    // JPEG allows 0xFF fill bytes before a marker code; skip them.
    while (pos + 1 < buf.length && buf[pos + 1] === 0xff) {
      pos++;
    }
    const marker = buf[pos + 1];
    if (marker === 0xd8) {
      throw new Error("second SOI marker at offset " + pos);
    }
    if (marker === 0xd9) {
      throw new Error("EOI reached before any SOF marker");
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2; // standalone markers carry no length field
      continue;
    }
    if (pos + 4 > buf.length) {
      throw new Error("truncated segment header at offset " + pos);
    }
    const segLen = (buf[pos + 2] << 8) | buf[pos + 3];
    if (segLen < 2) {
      throw new Error("bad segment length " + segLen + " at offset " + pos);
    }
    if (pos + 2 + segLen > buf.length) {
      throw new Error("segment overruns file at offset " + pos);
    }
    if (marker === 0xc0 || marker === 0xc2) {
      // SOF: 2 (length) + 1 (precision) + 2 (height) + 2 (width)
      //      + 1 (components) = 8 bytes minimum.
      if (segLen < 8) {
        throw new Error("truncated SOF segment at offset " + pos);
      }
      const height = (buf[pos + 5] << 8) | buf[pos + 6];
      const width = (buf[pos + 7] << 8) | buf[pos + 8];
      return { width, height };
    }
    pos += 2 + segLen;
  }
  throw new Error("no SOF marker found before end of file");
}

function main() {
  const outDir = resolveOutputDir();
  const buf = readFileSync(SOURCE);
  if (buf.length > MAX_BYTES) {
    fail("entry.jpg is " + buf.length + " bytes, over the 1 MiB cap");
  }
  let dims;
  try {
    dims = jpegDimensions(buf);
  } catch (err) {
    fail("invalid JPEG: " + err.message);
  }
  if (dims.width !== WANT_W || dims.height !== WANT_H) {
    fail(
      "expected " + WANT_W + "x" + WANT_H + ", got " + dims.width + "x" + dims.height
    );
  }
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.png");
  writeFileSync(outPath, buf);
  const sha = createHash("sha256").update(buf).digest("hex");
  console.log("wrote " + outPath + " (" + buf.length + " bytes, sha256 " + sha + ")");
}

main();
