import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ErrorPage from '../pages/ErrorPage';
import Segmentation from '../pages/Segmentation';
import Introduction from '../pages/Introduction';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Introduction />} />
      <Route path="/select-image" element={<Segmentation />} />
      <Route path="*" element={<Introduction />} />
    </Routes>
  );
};

export default AppRoutes;
