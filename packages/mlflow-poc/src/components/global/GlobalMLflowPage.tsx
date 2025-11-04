import React from 'react';
import ApplicationsPage from '@odh-dashboard/internal/pages/ApplicationsPage';

const GlobalMLflowPage: React.FC = () => {
  return (
    <ApplicationsPage loaded empty={false} title="MLflow Experiments">
      <iframe
        title="MLflow Experiments"
        src="http://localhost:5000/#/experiments"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </ApplicationsPage>
  );
};

export default GlobalMLflowPage;
