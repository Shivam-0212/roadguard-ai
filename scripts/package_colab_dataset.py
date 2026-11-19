#!/usr/bin/env python3
"""
RoadGuard AI - Google Colab Dataset Packaging Script
Compresses only the necessary training assets (images, labels-YOLO, and metadata)
into a clean, minimal ZIP archive for uploading to Google Drive or Colab.
"""

import os
import sys
import zipfile
from pathlib import Path


def package_colab_dataset(
    dataset_dir: str,
    output_zip_path: str
):
    print("=" * 60)
    print("RoadGuard AI — Google Colab Dataset Packager")
    print("=" * 60)

    dataset_path = Path(dataset_dir).resolve()
    images_dir = dataset_path / "images"
    labels_yolo_dir = dataset_path / "labels-YOLO"
    readme_path = dataset_path / "README.md"
    zip_out = Path(output_zip_path).resolve()
    zip_out.parent.mkdir(parents=True, exist_ok=True)

    if not images_dir.exists() or not labels_yolo_dir.exists():
        print(f"[!] Error: Source directories not found in {dataset_path}")
        sys.exit(1)

    image_files = sorted([p for p in images_dir.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png"}])
    label_files = sorted(list(labels_yolo_dir.glob("*.txt")))

    print(f"[*] Packaging {len(image_files)} images and {len(label_files)} YOLO labels...")
    print(f"[*] Target archive: {zip_out}")

    with zipfile.ZipFile(zip_out, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add README
        if readme_path.exists():
            zf.write(readme_path, arcname="dataset/README.md")

        # Add images
        for idx, img in enumerate(image_files, 1):
            zf.write(img, arcname=f"dataset/images/{img.name}")
            if idx % 500 == 0 or idx == len(image_files):
                print(f"    - Archived {idx}/{len(image_files)} images...")

        # Add YOLO labels
        for idx, lbl in enumerate(label_files, 1):
            zf.write(lbl, arcname=f"dataset/labels-YOLO/{lbl.name}")

    size_mb = zip_out.stat().st_size / (1024 * 1024)
    print("=" * 60)
    print(f"[+] Archive generated successfully: {zip_out}")
    print(f"[+] Archive size: {size_mb:.2f} MB")
    print("=" * 60)
    print("\nHOW TO USE WITH GOOGLE COLAB:")
    print("1. Upload 'road_damage_colab.zip' to your Google Drive root or a folder named 'RoadGuard_AI'.")
    print("2. Open 'notebooks/RoadGuard_AI_YOLOv8_Training.ipynb' in Google Colab.")
    print("3. Execute the Mount Google Drive cell.")
    print("4. The notebook will automatically locate and unzip the dataset archive to run GPU training.")
    print("=" * 60)


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    ds_dir = base_dir / "input_data" / "dataset"
    out_archive = base_dir / "artifacts" / "road_damage_colab.zip"

    package_colab_dataset(str(ds_dir), str(out_archive))

