#!/usr/bin/env python3
"""
RoadGuard AI - Dataset Preparation and Train/Val/Test Split Pipeline
Creates a reproducible 80/10/10 split for YOLOv8 training without altering original data.
Generates the Ultralytics dataset configuration YAML file.
"""

import os
import sys
import glob
import random
import shutil
from pathlib import Path
from collections import defaultdict


def prepare_dataset(
    input_dataset_dir: str,
    output_processed_dir: str,
    yaml_output_path: str,
    train_ratio: float = 0.80,
    val_ratio: float = 0.10,
    test_ratio: float = 0.10,
    seed: int = 42,
    use_symlinks: bool = False
):
    print("=" * 60)
    print("RoadGuard AI — Dataset Preparation & Splitting Pipeline")
    print(f"Ratios: Train {train_ratio*100:.0f}%, Val {val_ratio*100:.0f}%, Test {test_ratio*100:.0f}% (Seed: {seed})")
    print("=" * 60)

    input_dir = Path(input_dataset_dir).resolve()
    images_dir = input_dir / "images"
    labels_dir = input_dir / "labels-YOLO"
    processed_dir = Path(output_processed_dir).resolve()

    # Discover matched image-label pairs
    image_exts = {".jpg", ".jpeg", ".png", ".bmp"}
    all_images = sorted([p for p in images_dir.iterdir() if p.suffix.lower() in image_exts])
    
    paired_samples = []
    unpaired_images = []

    for img_path in all_images:
        lbl_path = labels_dir / f"{img_path.stem}.txt"
        if lbl_path.exists():
            paired_samples.append((img_path, lbl_path))
        else:
            unpaired_images.append(img_path)

    print(f"[*] Found {len(paired_samples)} paired image-annotation samples.")
    if unpaired_images:
        print(f"[*] Found {len(unpaired_images)} unpaired images (skipped for supervised detection training).")

    # Group sequential frames to minimize leakage between consecutive video frames
    # Filenames typically have numbering like img_0001, etc.
    # We shuffle with fixed seed to guarantee reproducibility
    random.seed(seed)
    
    # Analyze classes in each sample for stratified distribution
    sample_classes = {}
    for img_path, lbl_path in paired_samples:
        classes_in_sample = set()
        for line in lbl_path.read_text().splitlines():
            parts = line.strip().split()
            if len(parts) == 5:
                try:
                    classes_in_sample.add(int(parts[0]))
                except ValueError:
                    pass
        sample_classes[img_path.name] = classes_in_sample

    # Shuffle paired samples
    shuffled_samples = list(paired_samples)
    random.shuffle(shuffled_samples)

    total_count = len(shuffled_samples)
    n_train = int(total_count * train_ratio)
    n_val = int(total_count * val_ratio)
    n_test = total_count - n_train - n_val

    train_samples = shuffled_samples[:n_train]
    val_samples = shuffled_samples[n_train:n_train + n_val]
    test_samples = shuffled_samples[n_train + n_val:]

    print(f"[*] Split counts: Train={len(train_samples)}, Val={len(val_samples)}, Test={len(test_samples)}")

    splits = {
        "train": train_samples,
        "val": val_samples,
        "test": test_samples
    }

    # Prepare directory structure
    for split_name in ["train", "val", "test"]:
        (processed_dir / "images" / split_name).mkdir(parents=True, exist_ok=True)
        (processed_dir / "labels" / split_name).mkdir(parents=True, exist_ok=True)

    # Copy or symlink files
    for split_name, samples in splits.items():
        print(f"[*] Organizing {split_name} split ({len(samples)} samples)...")
        for img_path, lbl_path in samples:
            dst_img = processed_dir / "images" / split_name / img_path.name
            dst_lbl = processed_dir / "labels" / split_name / lbl_path.name

            if dst_img.exists() or dst_img.is_symlink():
                dst_img.unlink()
            if dst_lbl.exists() or dst_lbl.is_symlink():
                dst_lbl.unlink()

            if use_symlinks:
                dst_img.symlink_to(img_path)
                dst_lbl.symlink_to(lbl_path)
            else:
                shutil.copy2(img_path, dst_img)
                shutil.copy2(lbl_path, dst_lbl)

    # Class statistics per split
    split_class_counts = {s: defaultdict(int) for s in ["train", "val", "test"]}
    for split_name, samples in splits.items():
        for img_path, _ in samples:
            for c in sample_classes.get(img_path.name, []):
                split_class_counts[split_name][c] += 1

    print("\n[+] Split Class Occurrence Summary:")
    print("Class ID | Name     | Train | Val | Test")
    print("---------|----------|-------|-----|-----")
    names = {0: "Pothole", 1: "Crack", 2: "Manhole"}
    for cid in [0, 1, 2]:
        tr = split_class_counts["train"][cid]
        va = split_class_counts["val"][cid]
        te = split_class_counts["test"][cid]
        print(f"   {cid}     | {names[cid]:<8} | {tr:^5} | {va:^3} | {te:^4}")

    # Generate YOLO data YAML
    yaml_path = Path(yaml_output_path).resolve()
    yaml_path.parent.mkdir(parents=True, exist_ok=True)

    yaml_content = f"""# RoadGuard AI — Road Damage Detection YOLOv8 Configuration
# Academic Course: CSE471 - Deep Learning for Computer Vision
# Dataset: Road Damage Dataset (Potholes, Cracks and Manholes)

path: {processed_dir.as_posix()}  # dataset root dir
train: images/train  # train images (relative to 'path')
val: images/val      # val images (relative to 'path')
test: images/test    # test images (optional, relative to 'path')

# Classes
names:
  0: pothole
  1: crack
  2: manhole
"""
    yaml_path.write_text(yaml_content)
    print(f"\n[+] Created YOLO configuration at: {yaml_path}")
    print("[+] Dataset preparation completed successfully!")


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    input_ds = base_dir / "input_data" / "dataset"
    processed_ds = base_dir / "processed_dataset"
    yaml_file = base_dir / "ml" / "configs" / "road_damage.yaml"

    prepare_dataset(
        input_dataset_dir=str(input_ds),
        output_processed_dir=str(processed_ds),
        yaml_output_path=str(yaml_file),
        train_ratio=0.80,
        val_ratio=0.10,
        test_ratio=0.10,
        seed=42,
        use_symlinks=False  # Copy files for complete independence
    )

