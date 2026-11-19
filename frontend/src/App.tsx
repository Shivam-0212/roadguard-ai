import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ImageDetection } from './pages/ImageDetection';
import { VideoDetection } from './pages/VideoDetection';
import { DetectionHistory } from './pages/DetectionHistory';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { Methodology } from './pages/Methodology';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="detect-image" element={<ImageDetection />} />
          <Route path="detect-video" element={<VideoDetection />} />
          <Route path="history" element={<DetectionHistory />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

