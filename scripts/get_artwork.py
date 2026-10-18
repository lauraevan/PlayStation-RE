#!/usr/bin/env python3
"""Download official promotional media for PlayStation-RE's private visual preview.

Usage:
  python3 scripts/get_artwork.py
  python3 scripts/get_artwork.py --screenshots
  python3 scripts/get_artwork.py --screenshots --clips
External image packs are not required for the browser UI to work.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import shutil
import tempfile
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
MANIFEST = ASSETS / "artwork.json"
LOCAL = ASSETS / "local-art.js"
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
MAX_MEMBER = 45 * 1024 * 1024
MAX_TOTAL = 180 * 1024 * 1024
MAX_FILES = 48

def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9._-]+", "-", name.lower()).strip("-.")[:80] or "image"

def download(url: str, destination: Path) -> None:
    request = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 PlayStation-RE asset downloader"}
    )
    print("Downloading official pack:", url)
    with urllib.request.urlopen(request, timeout=90) as response, destination.open("wb") as output:
        shutil.copyfileobj(response, output, length=1024 * 1024)

def unpack(media_zip: Path, category: str, include_videos: bool=False) -> list[Path]:
    output = ASSETS / "imported" / category
    output.mkdir(parents=True, exist_ok=True)
    saved = []
    total = 0
    valid_exts = EXTENSIONS | ({".mp4", ".webm", ".mov"} if include_videos else set())
    with zipfile.ZipFile(media_zip) as bundle:
        for info in bundle.infolist():
            if len(saved) >= MAX_FILES:
                print("Reached recommended asset count limit")
                break
            if info.is_dir():
                continue
            raw = Path(info.filename)
            if raw.suffix.lower() not in valid_exts or info.file_size > MAX_MEMBER:
                continue
            total += info.file_size
            if total > MAX_TOTAL:
                print("Reached extract size limit; skipping remaining files")
                break
            digest = hashlib.sha1(info.filename.encode("utf-8")).hexdigest()[:7]
            filename = slug(raw.stem) + "-" + digest + raw.suffix.lower()
            target = output / filename
            if target.exists() and target.stat().st_size == info.file_size:
                saved.append(target)
                continue
            # Extraction never uses the archive's path; traversal names are discarded.
            with bundle.open(info) as source, target.open("wb") as dest:
                shutil.copyfileobj(source, dest, length=1024 * 1024)
            saved.append(target)
    print(category + ":", len(saved), "media files")
    return saved

def main() -> int:
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--screenshots", action="store_true", help="Also get official screenshot pack")
    cli.add_argument("--clips", action="store_true", help="Also get official video clips (can be large)")
    args = cli.parse_args()
    config = json.loads(MANIFEST.read_text(encoding="utf-8"))
    packs = config["primarySources"]
    wanted = [packs[0]]
    if args.screenshots:
        wanted.append(packs[1])
    if args.clips:
        wanted.append(packs[2])
    downloaded = {}
    for source in wanted:
        category = "artwork" if "wallpaper" in source["name"].lower() else (
            "screenshots" if "screenshots" in source["name"].lower() else "clips"
        )
        try:
            with tempfile.TemporaryDirectory() as temporary:
                archive = Path(temporary) / "official.zip"
                download(source["download"], archive)
                downloaded[category] = unpack(archive, category, include_videos=category=="clips")
        except (OSError, zipfile.BadZipFile, ValueError) as error:
            print("Could not import", category, ":", error)
            continue
    artwork = downloaded.get("artwork", [])
    if artwork:
        # Prefer the official cover, then a panoramic Jason/Lucia image.
        hero = next((p for p in artwork if "cover" in p.name), None)
        hero = hero or next((p for p in artwork if "jason" in p.name and "lucia" in p.name), None) or artwork[0]
        rel = "./" + hero.relative_to(ROOT).as_posix()
        LOCAL.write_text(
            "window.PSRE_ASSETS = {gta6: " + json.dumps(rel) + "};\n",
            encoding="utf-8",
        )
        print("Active local GTA VI hero:", rel)
    else:
        print("No local artwork imported; the browser will keep remote media and SVG fallback.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
