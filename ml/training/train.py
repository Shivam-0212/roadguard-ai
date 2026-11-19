#!/usr/bin/env python3
"""
RoadGuard AI - YOLOv8-nano Fine-Tuning Pipeline
Academic Course: CSE471 - Deep Learning for Computer Vision
Dataset: Road Damage Dataset (Potholes, Cracks, Manholes)
"""

import os
import sys
import argparse
import shutil
import json
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="RoadGuard AI — Fine-Tune YOLOv8-nano on Road Damage Dataset")
    parser.add_argument("--data", type=str, default="ml/configs/road_damage.yaml", help="Path to road_damage.yaml")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Pretrained model weights (e.g., yolov8n.pt)")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image resolution")
    parser.add_argument("--batch", type=int, default=8, help="Batch size (conservative for 8GB RAM / Colab)")
    parser.add_argument("--patience", type=int, default=15, help="Early stopping patience epochs")
    parser.add_argument("--device", type=str, default="", help="Device: '0' (CUDA), 'mps' (Apple Silicon), or 'cpu'")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--project", type=str, default="runs/road_damage", help="Output project directory")
    parser.add_argument("--name", type=str, default="yolov8n_training", help="Training experiment run name")
    return parser.parse_args()


def train():
    args = parse_args()

    # Verify Ultralytics availability
    try:
        from ultralytics import YOLO
        import torch
    except ImportError:
        print("[!] Ultralytics or PyTorch not installed. Please activate the virtual environment.")
        sys.exit(1)

    print("=" * 60)
    print("RoadGuard AI — YOLOv8-nano Training Pipeline")
    print(f"Course: CSE471 | Model: {args.model} | Epochs: {args.epochs} | Batch: {args.batch}")
    print("=" * 60)

    # Device auto-detection
    device = args.device
    if not device:
        if torch.cuda.is_available():
            device = "0"
            print(f"[*] GPU detected: {torch.cuda.get_device_name(0)} (CUDA)")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            device = "mps"
            print("[*] Apple Silicon GPU detected (MPS acceleration)")
        else:
            device = "cpu"
            print("[*] Fallback: CPU mode (Training is slow on CPU; recommend Google Colab for full runs)")

    data_path = Path(args.data).resolve()
    if not data_path.exists():
        print(f"[!] Dataset config not found at: {data_path}")
        print("[!] Run 'python scripts/prepare_dataset.py' first.")
        sys.exit(1)

    print(f"[*] Initializing model: {args.model}")
    model = YOLO(args.model)

    print("[*] Starting model fine-tuning...")
    results = model.train(
        data=str(data_path),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        patience=args.patience,
        workers=2,
        device=device,
        project=args.project,
        name=args.name,
        plots=True,
        seed=args.seed,
        exist_ok=True,
        verbose=True
    )

    print("=" * 60)
    print("[+] Training completed!")
    print("=" * 60)

    # Organize artifacts
    run_dir = Path(args.project) / args.name
    best_pt = run_dir / "weights" / "best.pt"
    last_pt = run_dir / "weights" / "last.pt"

    dest_models_dir = Path("artifacts/models").resolve()
    dest_metrics_dir = Path("artifacts/metrics").resolve()
    dest_models_dir.mkdir(parents=True, exist_ok=True)
    dest_metrics_dir.mkdir(parents=True, exist_ok=True)

    if best_pt.exists():
        shutil.copy2(best_pt, dest_models_dir / "best.pt")
        print(f"[+] Saved best checkpoint to: {dest_models_dir / 'best.pt'}")
    if last_pt.exists():
        shutil.copy2(last_pt, dest_models_dir / "last.pt")

    # Copy plots & results
    for plot_file in ["results.png", "confusion_matrix.png", "results.csv"]:
        src_file = run_dir / plot_file
        if src_file.exists():
            shutil.copy2(src_file, dest_metrics_dir / plot_file)
            print(f"[+] Exported metric artifact: {dest_metrics_dir / plot_file}")


if __name__ == "__main__":
    train()

