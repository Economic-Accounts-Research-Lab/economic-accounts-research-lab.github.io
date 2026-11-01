# Statistical Release Archive

Release ID: NC-2026Q2-v1.0
Reference period: 2026Q2
Release status: Published
Package mode: Publication

This directory is the frozen artifact layout for one National + Corporate
Statistical Release.

## Presentation artifacts

- release.html is the self-contained standalone HTML render.
- release.pdf is the browser-rendered PDF companion.

Both presentation artifacts originate from the same authoritative release QMD.

## Data

data/release-metadata.csv is the release-owned metadata record.

data/release-facts.csv preserves the deterministic headline facts together
with their canonical series, comparison periods, numeric values, provenance,
release source commit, and exact rendered text.

data/revisions.csv preserves the release-to-release revision record.

data/stage4/ is copied byte-for-byte from the canonical Stage 4 public
package. No Stage 4 observation or metadata file is filtered or reconstructed.

data/supporting/nber-recessions.csv is the exact external recession context
used by the National growth visual.

## Integrity and evidence

SHA256SUMS.txt hashes every file in this archive except the manifest itself.

The corresponding publication-control evidence is stored under the matching
validation release directory and includes source-QA output, render evidence,
publication-QA status, and its own SHA-256 manifest.

Release source commit: 07a47ffe3a45f9402b54ab6dedc5b749ccb9d33a

This archive must not be edited in place after publication.
