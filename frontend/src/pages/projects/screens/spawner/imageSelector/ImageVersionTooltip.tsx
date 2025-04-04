import * as React from 'react';
import { DescriptionListTerm, Tooltip } from '@patternfly/react-core';
import { ImageVersionDependencyType } from '~/pages/projects/screens/spawner/types';
import NotebookImagePackageDetails from '~/pages/projects/notebook/NotebookImagePackageDetails';

type ImageVersionTooltipProps = {
  dependencies: ImageVersionDependencyType[];
  children: React.ReactNode;
};

const ImageVersionTooltip: React.FC<ImageVersionTooltipProps> = ({ children, dependencies }) => {
  if (dependencies.length === 0) {
    return null;
  }

  return (
    <Tooltip
      content={
        <NotebookImagePackageDetails
          title={<DescriptionListTerm>Packages included</DescriptionListTerm>}
          dependencies={dependencies}
        />
      }
      position="right"
    >
      <div>{children}</div>
    </Tooltip>
  );
};

export default ImageVersionTooltip;
