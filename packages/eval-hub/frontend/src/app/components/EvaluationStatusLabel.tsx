import * as React from 'react';
import { Icon, Label, LabelProps, Popover } from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import { EvaluationJobState } from '~/app/types';

type StatusConfig = {
  label: string;
  color?: LabelProps['color'];
  status?: LabelProps['status'];
  icon: React.ReactNode;
  description: string;
};

const statusMap: Record<EvaluationJobState, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'purple',
    icon: <PendingIcon />,
    description:
      'The evaluation run has been submitted but is waiting for resources to become available. The system is in the process of provisioning the necessary compute (like pods and GPUs) to start the job.',
  },
  running: {
    label: 'Running',
    color: 'blue',
    icon: <InProgressIcon />,
    description:
      'The evaluation job is actively executing. The system is running the model against the test dataset and calculating the defined metrics.',
  },
  completed: {
    label: 'Complete',
    status: 'success',
    icon: <CheckCircleIcon />,
    description:
      'The evaluation job has finished successfully. All tests were executed, and the resulting metrics (like accuracy, F1-score, etc.) have been generated and saved.',
  },
  failed: {
    label: 'Failed',
    status: 'danger',
    icon: <ExclamationCircleIcon />,
    description:
      'The evaluation job terminated due to an error. This could be a code failure in the evaluation script, an inability to load the model or data, or a system-level issue.',
  },
  cancelled: {
    label: 'Canceled',
    color: 'grey',
    icon: <BanIcon />,
    description:
      'The evaluation job was manually stopped by a user before it could finish its execution.',
  },
  stopping: {
    label: 'Canceling',
    color: 'grey',
    icon: <InProgressIcon />,
    description:
      'A user has requested to stop the evaluation run, and the system is in the process of terminating all active tasks and stopping the run.',
  },
  stopped: {
    label: 'Canceled',
    color: 'grey',
    icon: <BanIcon />,
    description:
      'The evaluation job was manually stopped by a user before it could finish its execution.',
  },
};

type EvaluationStatusLabelProps = {
  state: EvaluationJobState;
};

const EvaluationStatusLabel: React.FC<EvaluationStatusLabelProps> = ({ state }) => {
  const config = statusMap[state];

  return (
    <Popover headerContent={config.label} bodyContent={config.description}>
      <Label
        color={config.color}
        status={config.status}
        icon={<Icon isInline>{config.icon}</Icon>}
        data-testid={`status-label-${state}`}
        onClick={() => undefined}
        style={{ cursor: 'pointer' }}
      >
        {config.label}
      </Label>
    </Popover>
  );
};

export default EvaluationStatusLabel;
