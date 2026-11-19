# RoadGuard AI — Dataset Profile & Attribution

This document specifies the origin, composition, licensing, and preparation instructions for the road damage dataset utilized by RoadGuard AI.

---

## 1. Dataset Origin & Academic Citation

RoadGuard AI is trained on the open-source *Road Damage Dataset: Potholes, Cracks and Manholes* curated by Lorenzo Arcioni, Eugenio Giordani, and collaborators.

- **Zenodo Record:** [DOI: 10.5281/zenodo.17834373](https://doi.org/10.5281/zenodo.17834373)
- **Publication Citation:**
  > Giordani, E., Arcioni, L., Gil-Martín, M. et al. (2026). *Real-world road damage dataset with potholes, cracks, and maintenance holes.* Scientific Reports, 16, 15318. https://doi.org/10.1038/s41598-026-46679-4
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0).

---

## 2. Dataset Composition & Class Inventory

The dataset represents authentic, non-synthetic road surfaces captured under natural daylight in Rome and Sacrofano, Italy:

- **Total Images:** 2,009 images
- **Native Image Resolution:** $640 \times 360$ pixels
- **Total Annotated Instances:** 4,737 ground-truth bounding boxes

### Class Breakdown:
| Class ID | Class Label | Instance Count | Share of Annotations | Description |
| :---: | :--- | :---: | :---: | :--- |
| `0` | **Pothole** | 1,261 | 26.62% | Cavities and structural asphalt depressions |
| `1` | **Crack** | 2,519 | 53.18% | Longitudinal, transverse, and alligator fatigue cracking |
| `2` | **Manhole** | 957 | 20.20% | Subsurface utility access covers (neutral infrastructure) |
| **Total** | — | **4,737** | **100.00%** | Comprehensive pavement defect inventory |

---

## 3. Dataset Splitting Protocol (Authoritative Baseline)

In the original model training pipeline (`notebooks/RoadGuard_AI_YOLOv8_Training.ipynb`), the 2,009 images were split using a reproducible 80/10/10 ratio with fixed random seed 42:

- **Training Set (`train`):** 1,607 images (80%) — Used for transfer learning backpropagation.
- **Validation Set (`val`):** 200 images (10%) — Used for early stopping monitoring (patience = 15).
- **Held-Out Test Set (`test`):** 202 images (10%) — Strictly held out for final unbiased evaluation.

### Authoritative Model Performance (Test Split):
| Metric | Value | Pothole | Crack | Manhole |
| :--- | :---: | :---: | :---: | :---: |
| **mAP@50** | **45.96%** | 40.44% | 31.58% | 65.87% |
| **mAP@50-95** | **20.03%** | 18.21% | 12.45% | 29.43% |
| **Precision ($P$)** | **59.53%** | 65.41% | 52.60% | 60.59% |
| **Recall ($R$)** | **45.76%** | 34.88% | 30.67% | 71.74% |
| **$F_1$-Score** | **51.75%** | 45.49% | 38.75% | 65.70% |

---

## 4. How to Obtain & Prepare the Dataset

In accordance with GitHub storage best practices, the multi-gigabyte raw image dataset is **not** hosted directly in the public Git repository.

To download and prepare the dataset locally:

1. **Download Archive:**
   Download `dataset.zip` from Zenodo:
   [https://doi.org/10.5281/zenodo.17834373](https://doi.org/10.5281/zenodo.17834373)

2. **Extract to `input_data/`:**
   ```bash
   mkdir -p input_data
   unzip dataset.zip -d input_data/
   ```
   Verify that `input_data/dataset/images` and `input_data/dataset/labels-YOLO` exist.

3. **Run Preparation Script:**
   ```bash
   python scripts/prepare_dataset.py
   ```
   This generates the structured `processed_dataset/` directory and creates `ml/configs/road_damage.yaml`.

4. **Package for Colab Training (Optional):**
   ```bash
   python scripts/package_colab_dataset.py
   ```
   This generates `artifacts/road_damage_colab.zip` for uploading to Google Drive if you wish to retrain the model.

