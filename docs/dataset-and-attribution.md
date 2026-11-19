
# RoadGuard AI — Dataset Profile & Attribution

This document specifies the origin, composition, licensing, attribution, and preparation instructions for the road damage dataset used by RoadGuard AI.

---

## 1. Dataset Origin & Academic Attribution

RoadGuard AI is trained on the open-source **Road Damage Dataset: Potholes, Cracks and Manholes**, created by Enrico Giordani, Lorenzo Arcioni, Manuel Gil-Martín, and Marco Raoul Marini.

The dataset is publicly distributed through Kaggle and archived on Zenodo. RoadGuard AI obtained the dataset from the Kaggle repository.

- **Kaggle Download Source:** https://www.kaggle.com/datasets/lorenzoarcioni/road-damage-dataset-potholes-cracks-and-manhole
- **Zenodo Archival Record:** https://doi.org/10.5281/zenodo.17834373

**Dataset Citation:**

Giordani, E., Arcioni, L., Gil-Martín, M., & Marini, M. R. (2025). *Road damage dataset: Potholes, cracks and manholes* [Dataset]. Zenodo. https://doi.org/10.5281/zenodo.17834373

**Related Research Publication:**

Giordani, E., Arcioni, L., Gil-Martín, M., Foresti, G. L., & Marini, M. R. (2026). Real-world road damage dataset with potholes, cracks, and maintenance holes. *Scientific Reports, 16*, 15318. https://doi.org/10.1038/s41598-026-46679-4

**Dataset License:** Creative Commons Attribution 4.0 International (CC BY 4.0). Appropriate attribution must be retained when using or redistributing the dataset.

---

## 2. Dataset Composition & Class Inventory

The dataset contains authentic, non-synthetic road surface imagery collected in urban, suburban, and rural areas around Rome and Sacrofano, Italy.

Images were captured using a GoPro HERO7 mounted inside a moving vehicle and a Samsung Galaxy A14 smartphone used for stationary captures. The released images are resized to 640 × 360 pixels and represent varied real-world lighting and weather conditions.

- **Total Images:** 2,009
- **Released Image Resolution:** 640 × 360 pixels
- **Total Annotated Instances:** 4,737 ground-truth bounding boxes

### Class Breakdown

| Class ID | Class Label | Instance Count | Share of Annotations |
| :---: | :--- | :---: | :---: |
| `0` | Pothole | 1,261 | 26.62% |
| `1` | Crack | 2,519 | 53.18% |
| `2` | Manhole | 957 | 20.20% |
| **Total** | — | **4,737** | **100.00%** |

---

## 4. How to Obtain & Prepare the Dataset

The raw image dataset is not hosted in the RoadGuard AI GitHub repository because of its size.

To obtain the dataset:

1. **Download the dataset**

   Download the public dataset from the Kaggle repository:

   https://www.kaggle.com/datasets/lorenzoarcioni/road-damage-dataset-potholes-cracks-and-manholes

   The Zenodo DOI is provided above as the permanent archival reference.

2. **Extract the downloaded archive**

   Create the input directory and extract the downloaded archive:

   ```bash
   mkdir -p input_data
   unzip <downloaded-archive>.zip -d input_data/
   ```

   Verify that the extracted directory contains the image and YOLO annotation folders expected by the preparation script:

   - `input_data/dataset/images`
   - `input_data/dataset/labels-YOLO`

   If the Kaggle archive extracts into a differently named parent folder, organize it to match the expected structure before continuing.

3. **Run the preparation script**

   ```bash
   python scripts/prepare_dataset.py
   ```

   This generates the structured `processed_dataset/` directory and creates `ml/configs/road_damage.yaml`.

4. **Package the dataset for Colab training (optional)**

   ```bash
   python scripts/package_colab_dataset.py
   ```

   This generates `artifacts/road_damage_colab.zip` for uploading to Google Drive if you wish to retrain the model.
