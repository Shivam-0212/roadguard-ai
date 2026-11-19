#!/usr/bin/env python3
"""
RoadGuard AI - Local Inference Verification Script
Demonstrates that the Ultralytics YOLOv8 inference pipeline executes smoothly
on sample road images from the dataset using the local CPU / Apple Silicon MPS.
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path
base_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(base_dir))

from ml.inference.detector import RoadDefectDetector

def main():
    base_dir = Path(__file__).resolve().parent.parent
    sample_images = list((base_dir / "input_data" / "dataset" / "images").glob("*.jpg"))[:2]
    
    if not sample_images:
        print("[!] No sample images found.")
        return

    print("=" * 60)
    print("RoadGuard AI — Local Inference Pipeline Verification")
    print("=" * 60)
    
    # Check if best.pt exists, otherwise test with yolov8n.pt base model
    model_path = base_dir / "artifacts" / "models" / "best.pt"
    if not model_path.exists():
        print("[*] Fine-tuned best.pt not yet placed in artifacts/models/")
        print("[*] Downloading / initializing standard yolov8n.pt to verify local inference execution...")
        model_path = base_dir / "artifacts" / "models" / "yolov8n.pt"
        from ultralytics import YOLO
        yolo_base = YOLO("yolov8n.pt")
        yolo_base.save(str(model_path))
    
    detector = RoadDefectDetector(str(model_path))
    print(f"[+] Detector initialized on device: {detector.device}")

    out_dir = base_dir / "outputs" / "images"
    out_dir.mkdir(parents=True, exist_ok=True)

    for idx, img_p in enumerate(sample_images, 1):
        print(f"\n[*] Testing inference on sample image: {img_p.name}")
        res = detector.predict_image(img_p, conf_threshold=0.15)
        print(f"    - Dimensions: {res['image_dimensions']['width']}x{res['image_dimensions']['height']}")
        print(f"    - Latency:    {res['inference_time_ms']} ms")
        print(f"    - Detections: {res['detection_count']} objects")
        
        annotated_path = out_dir / f"test_annotated_{idx}.jpg"
        detector.render_annotations(img_p, res["detections"], str(annotated_path))
        print(f"    - Annotated image saved: {annotated_path}")

    print("\n" + "=" * 60)
    print("[+] Local inference engine verified and fully operational!")
    print("=" * 60)

if __name__ == "__main__":
    main()
