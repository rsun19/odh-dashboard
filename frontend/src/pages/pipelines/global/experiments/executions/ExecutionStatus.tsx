import React from 'react';

import { Label, LabelProps, Popover } from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  OutlinedQuestionCircleIcon,
  OutlinedWindowRestoreIcon,
} from '@patternfly/react-icons';

import { Execution } from '#~/third_party/mlmd';

type ExecutionStatusProps = {
  status: Execution.State;
  isCompact?: boolean;
};

export const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ status, isCompact }) => {
  let color: LabelProps['color'];
  let statusProp: LabelProps['status'];
  let icon: React.ReactNode;
  let label: string;
  let description: string;

  switch (status) {
    case Execution.State.COMPLETE:
      statusProp = 'success';
      icon = <CheckCircleIcon />;
      label = 'Complete';
      description =
        'The pipeline run or task has finished its execution successfully without any errors.';
      break;
    case Execution.State.CACHED:
      statusProp = 'success';
      icon = <OutlinedWindowRestoreIcon />;
      label = 'Cached';
      description =
        'This is a special "success" status. The pipeline step was skipped because an identical step (with the exact same inputs, parameters, and component code) was successfully run in the past. The system reused the results from the previous run to save time and compute resources.';
      break;
    case Execution.State.CANCELED:
      color = 'grey';
      icon = <BanIcon />;
      label = 'Canceled';
      description = 'The pipeline run was manually stopped by a user before it could finish.';
      break;
    case Execution.State.FAILED:
      statusProp = 'danger';
      icon = <ExclamationCircleIcon />;
      label = 'Failed';
      description =
        "The pipeline run or task has terminated due to an error. This could be a crash in the component's code, a configuration issue, or a system-level failure.";
      break;
    case Execution.State.RUNNING:
      color = 'blue';
      icon = <InProgressIcon />;
      label = 'Running';
      description =
        'The pipeline run (or a specific task within it) is actively executing on the cluster.';
      break;
    case Execution.State.NEW:
      color = 'purple';
      label = 'New';
      description =
        'The pipeline run has been created in the system but has not yet been processed by the scheduler. This is the initial state before it is officially queued.';
      break;
    default:
      color = 'grey';
      icon = <OutlinedQuestionCircleIcon />;
      label = 'Unknown';
      description =
        "The system cannot determine the current state of the pipeline run. This typically happens if the component monitoring the run loses communication with the pipeline's pods or the underlying cluster.";
  }

  return (
    <Popover headerContent={label} bodyContent={description}>
      <Label
        color={color}
        status={statusProp}
        icon={icon}
        isCompact={isCompact}
        onClick={() => undefined}
        style={{ cursor: 'pointer' }}
      >
        {label}
      </Label>
    </Popover>
  );
};
