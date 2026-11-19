#!/usr/bin/env python3
"""
RoadGuard AI - Model Evaluation & Benchmarking Pipeline
Academic Course: CSE471 - Deep Learning for Computer Vision
Calculates Precision, Recall, F1, mAP@50, mAP@50-95, Per-Class metrics, and Latency.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="RoadGuard AI — Model Evaluation Pipeline")
    parser.add_argument("--model", type=str, default="artifacts/models/best.pt", help="Path to best.pt checkpoint")
    parser.add_argument("--data", type=str, default="ml/configs/road_damage.yaml", help="Path to road_damage.yaml")
    parser.add_argument("--split", type=str, default="test", choices=["val", "test"], help="Dataset split to evaluate")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution")
    parser.add_argument("--device", type=str, default="", help="Inference device ('cpu', 'mps', '0')")
    parser.add_argument("--output-json", type=str, default="artifacts/metrics/evaluation_metrics.json", help="Output JSON path")
    return parser.parse_args()


def evaluate():
    args = parse_args()

    model_path = Path(args.model).resolve()
    if not model_path.exists():
        print(f"[!] Evaluation Warning: Model checkpoint not found at {model_path}")
        print("[!] Model evaluation results are pending Colab training execution.")
        print("[!] Generating pending metrics placeholder to preserve application structure.")

        pending_metrics = {
            "status": "pending_training",
            "message": "Model training has not been executed yet. Run notebooks/RoadGuard_AI_YOLOv8_Training.ipynb in Google Colab and place best.pt in artifacts/models/",
            "timestamp": None,
            "metrics": {
                "precision": None,
                "recall": None,
                "f1_score": None,
                "map50": None,
                "map50_95": None,
                "inference_latency_ms": None
            },
            "per_class": {
                "pothole": {"precision": None, "recall": None, "map50": None, "map50_95": None},
                "crack": {"precision": None, "recall": None, "map50": None, "map50_95": None},
                "manhole": {"precision": None, "recall": None, "map50": None, "map50_95": None}
            }
        }
        out_path = Path(args.output_json).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w") as f:
            json.dump(pending_metrics, f, indent=2)
        print(f"[+] Written pending metrics state to: {out_path}")
        return

    try:
        from ultralytics import YOLO
        import torch
    except ImportError:
        print("[!] Ultralytics or PyTorch not installed. Activate virtual environment.")
        sys.exit(1)

    print("=" * 60)
    print("RoadGuard AI — Evaluating YOLOv8-nano Checkpoint")
    print(f"Model: {model_path} | Split: {args.split}")
    print("=" * 60)

    device = args.device
    if not device:
        if torch.cuda.is_available():
            device = "0"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"

    model = YOLO(str(model_path))

    # Measure latency on warm-up and evaluation
    start_time = time.time()
    metrics = model.val(
        data=args.data,
        split=args.split,
        imgsz=args.imgsz,
        device=device,
        plots=True,
        save_json=True
    )
    eval_duration = time.time() - start_time

    # Extract box metrics
    box_metrics = metrics.box
    precision = float(box_metrics.mp)
    recall = float(box_metrics.mr)
    f1 = float(2 * (precision * recall) / (precision + recall + 1e-16))
    map50 = float(box_metrics.map50)
    map50_95 = float(box_metrics.map)

    # Class mappings
    class_names = {0: "pothole", 1: "crack", 2: "manhole"}
    per_class_results = {}

    if hasattr(box_metrics, "p") and len(box_metrics.p) >= 3:
        for idx, cname in class_names.items():
            cp = float(box_metrics.p[idx])
            cr = float(box_metrics.r[idx])
            c_map50 = float(box_metrics.ap50[idx]) if hasattr(box_metrics, "ap50") else 0.0
            c_map = float(box_metrics.ap[idx]) if hasattr(box_metrics, "ap") else 0.0
            per_class_results[cname] = {
                "precision": round(cp, 4),
                "recall": round(cr, 4),
                "map50": round(c_map50, 4),
                "map50_95": round(c_map, 4)
            }

    eval_data = {
        "status": "completed",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model_path": str(model_path),
        "split": args.split,
        "device": device,
        "metrics": {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "map50": round(map50, 4),
            "map50_95": round(map50_95, 4),
            "inference_latency_ms": round(eval_duration * 1000 / max(1, metrics.seen), 2)
        },
        "per_class": per_class_results
    }

    out_path = Path(args.output_json).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(eval_data, f, indent=2)

    print(f"\n[+] Evaluation Summary:")
    print(f"    - Precision: {precision:.4f}")
    print(f"    - Recall:    {recall:.4f}")
    print(f"    - F1 Score:  {f1:.4f}")
    print(f"    - mAP@50:    {map50:.4f}")
    print(f"    - mAP@50-95: {map50_95:.4f}")
    print(f"[+] Detailed metrics exported to: {out_path}")


if __name__ == "__main__":
    evaluate()

