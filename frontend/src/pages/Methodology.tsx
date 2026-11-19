import React from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Info,
  Award,
  AlertTriangle
} from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Methodology & Course Alignment</h1>
        <p className="text-sm text-slate-400">
          Academic syllabus mapping for CSE471: Deep Learning for Computer Vision
        </p>
      </div>

      {/* 1. Problem Statement & Motivation */}
      <section className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>1. Problem Statement & Motivation</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Traditional municipal road maintenance relies on manual visual surveys, which are labor-intensive, hazardous to inspectors, infrequent, and prone to subjective severity ratings. Delayed intervention turns minor surface cracks into critical structural potholes, escalating vehicle maintenance hazards and municipal resurfacing costs.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>RoadGuard AI</strong> provides an automated, edge-capable computer vision solution using a fine-tuned single-stage object detector (<strong className="text-amber-400">YOLOv8-nano</strong>) to localize defects, approximate surface area percentage, compute spatial coordinates, and grade visual severity without requiring expensive cloud GPUs or proprietary APIs.
        </p>
      </section>

      {/* 2. Dataset Profile & Attribution */}
      <section className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span>2. Dataset Characteristics & Audit Findings</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          The system uses the <em>Road Damage Dataset: Potholes, Cracks and Manholes</em> (Lorenzo Arcioni et al., 2026, DOI: 10.5281/zenodo.17834373).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-sans block">Total Images</span>
            <span className="text-lg font-bold text-white">2,009</span>
            <span className="text-slate-500 font-sans block mt-1">640 × 360 px resolution</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-sans block">Annotated Instances</span>
            <span className="text-lg font-bold text-white">4,737</span>
            <span className="text-slate-500 font-sans block mt-1">Normalized bounding boxes</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-sans block">Train / Val / Test Split</span>
            <span className="text-lg font-bold text-amber-400">80% / 10% / 10%</span>
            <span className="text-slate-500 font-sans block mt-1">Reproducible (Seed: 42)</span>
          </div>
        </div>
      </section>

      {/* 3. YOLOv8 Architecture & Transfer Learning */}
      <section className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <span>3. Deep Learning Architecture: YOLOv8-nano</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          YOLOv8-nano was selected as the optimal architecture for edge deployment on municipal inspection vehicles due to its lightweight parameter footprint (<strong>3.2M parameters</strong>), fast inference on CPU / Apple Silicon MPS, and superior mAP compared to earlier two-stage Faster R-CNN pipelines.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#161F33] border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">Backbone: Modified CSPDarknet</h4>
            <p className="text-slate-400 leading-relaxed">
              Extracts multi-scale feature hierarchies using Cross-Stage Partial bottleneck blocks with C2f (Cross-Stage Partial with 2 Convolutions) modules, enhancing gradient flow while minimizing computational cost.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161F33] border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">Neck: PAN-FPN Feature Fusion</h4>
            <p className="text-slate-400 leading-relaxed">
              Path Aggregation Network with Feature Pyramid Network fuses low-level fine-grained spatial features (crucial for hairline cracks) with high-level semantic context.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161F33] border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">Head: Decoupled Anchor-Free</h4>
            <p className="text-slate-400 leading-relaxed">
              Separate branches predict object classification probabilities and regression coordinates independently, utilizing Task-Aligned Assigner and Distribution Focal Loss (DFL).
            </p>
          </div>
        </div>
      </section>

      {/* 4. Spatial Math & Severity Heuristics */}
      <section className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <span>4. Coordinate Mapping & Visual Severity Heuristics</span>
        </h2>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            For each detected bounding box $[x_1, y_1, x_2, y_2]$, normalized coordinates and relative image percentages are calculated:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-400 space-y-1">
            <p>Width = x2 - x1, Height = y2 - y1</p>
            <p>BBox_Area = Width × Height</p>
            <p>Area_Percentage = (BBox_Area / (Image_Width × Image_Height)) × 100</p>
            <p>Center_X = ((x1 + x2) / 2) / Image_Width, Center_Y = ((y1 + y2) / 2) / Image_Height</p>
          </div>

          <h4 className="font-bold text-white pt-2">Explainable Visual Severity Heuristics:</h4>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-300">
            <li>
              <strong>Pothole (Class 0):</strong> Evaluated as a critical cavity. Area &gt; 2.5% or proximity factor (<code className="text-amber-400">Center_Y &gt; 0.6</code>, placing the pothole directly in front of approaching vehicle tires) immediately escalates rating to <strong>HIGH</strong> severity.
            </li>
            <li>
              <strong>Crack (Class 1):</strong> Evaluated based on area percentage and bounding box aspect ratio (<code className="text-amber-400">max(w,h) / min(w,h) &gt; 3.0</code>), which flags elongated structural longitudinal fractures as <strong>MODERATE</strong> or <strong>HIGH</strong>.
            </li>
            <li>
              <strong>Manhole (Class 2):</strong> Explicitly categorized as <strong>INFRASTRUCTURE</strong> with 0 damage score, preventing false pavement alarms.
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Explicit CSE471 Syllabus Mapping */}
      <section className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>5. CSE471 Course Syllabus Alignment & Outcomes Mapping</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Course Unit / Outcome</th>
                <th className="px-4 py-3">Theoretical Concept</th>
                <th className="px-4 py-3">Demonstrated Implementation in RoadGuard AI</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-400 font-mono">Unit I / CO1</td>
                <td className="px-4 py-3">Pixels, Color Spaces, Normalization, Resizing</td>
                <td className="px-4 py-3">OpenCV ingestion, 640x360 downscaling, BGR-to-RGB, tensor normalization in range [0, 1].</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">Implemented</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-400 font-mono">Unit II / CO2</td>
                <td className="px-4 py-3">CNNs, Receptive Fields, Augmentation, Early Stopping</td>
                <td className="px-4 py-3">Training pipeline with mosaic augmentation, scale/translation jitter, patience=15 early stopping.</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">Implemented</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-400 font-mono">Unit III / CO3</td>
                <td className="px-4 py-3">Transfer Learning & Domain Adaptation</td>
                <td className="px-4 py-3">Fine-tuning pretrained MS COCO yolov8n.pt weights on municipal road damage dataset.</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">Implemented</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-400 font-mono">Unit IV / CO4</td>
                <td className="px-4 py-3">Object Detection, Bounding Boxes, IoU, NMS, mAP</td>
                <td className="px-4 py-3">Single-stage YOLOv8 detection, IoU thresholding, NMS postprocessing, mAP@50 and mAP@50-95 metrics.</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">Implemented</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-400 font-mono">Unit V / CO5</td>
                <td className="px-4 py-3">Image Segmentation & Vision Transformers</td>
                <td className="px-4 py-3">Quadrilateral polygon annotations analyzed in dataset; Mask R-CNN / SegNet semantic segmentation.</td>
                <td className="px-4 py-3 text-slate-400 italic">Future Scope</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-400 font-mono">Unit VI / CO6</td>
                <td className="px-4 py-3">Interpretability & Generative Vision</td>
                <td className="px-4 py-3">Grad-CAM visual saliency heatmaps for defect activation verification.</td>
                <td className="px-4 py-3 text-slate-400 italic">Future Scope</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Engineering Limitations */}
      <section className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>6. Honest Engineering Limitations</span>
        </h2>
        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <li>
            <strong>Visual Severity is Heuristic:</strong> The estimated severity represents an empirical visual proxy based on pixel area and position, not a geotechnical engineering core-drill assessment.
          </li>
          <li>
            <strong>RGB 2D Representation:</strong> Single monocular camera images lack real depth measurements ($Z$-axis cavity depth in millimeters).
          </li>
          <li>
            <strong>Geographic Domain Bias:</strong> The underlying dataset was gathered in Rome/Sacrofano, Italy. Adaptation to Indian road environments requires domain transfer fine-tuning.
          </li>
        </ul>
      </section>
    </div>
  );
};

