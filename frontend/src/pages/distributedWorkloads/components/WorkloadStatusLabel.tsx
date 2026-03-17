import * as React from 'react';
import { Label, Popover } from '@patternfly/react-core';
import { WorkloadKind } from '#~/k8sTypes';
import { getStatusInfo } from '#~/concepts/distributedWorkloads/utils';

export const WorkloadStatusLabel: React.FC<{ workload: WorkloadKind }> = ({ workload }) => {
  const statusInfo = getStatusInfo(workload);
  return (
    <Popover headerContent={statusInfo.status} bodyContent={statusInfo.description}>
      <Label
        color={statusInfo.color}
        status={statusInfo.labelStatus}
        icon={<statusInfo.icon />}
        onClick={() => undefined}
        style={{ cursor: 'pointer' }}
      >
        {statusInfo.status}
      </Label>
    </Popover>
  );
};
