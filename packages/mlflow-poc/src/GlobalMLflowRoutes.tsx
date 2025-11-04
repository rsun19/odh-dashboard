import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import ProjectsRoutes from '@odh-dashboard/internal/concepts/projects/ProjectsRoutes';
import GlobalMLflowPage from './components/global/GlobalMLflowPage';

const GlobalMLflowRoutes: React.FC = () => {
  return (
    <ProjectsRoutes>
      <Route index element={<GlobalMLflowPage />} />
      <Route path="*" element={<Navigate to="." />} />
    </ProjectsRoutes>
  );
};

export default GlobalMLflowRoutes;
