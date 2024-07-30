import React from 'react';
import { PageSection } from '@patternfly/react-core';
import ConnectionTypesCoreApplicationPage from '~/pages/connectionTypes/ConnectionTypesCoreApplicationPage';
import ConnectionTypesList from '~/pages/connectionTypes/ConnectionTypesList';

const ConnectionTypes: React.FC = () => (
  <ConnectionTypesCoreApplicationPage>
    <PageSection isFilled variant="light">
      <ConnectionTypesList />
    </PageSection>
  </ConnectionTypesCoreApplicationPage>
);

export default ConnectionTypes;
