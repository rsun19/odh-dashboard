import * as React from 'react';
import { Label, LabelProps, Popover } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  OffIcon,
} from '@patternfly/react-icons';
import { EventStatus, NotebookStatus } from '#~/types';
import { getKueueStatusInfo } from '#~/concepts/kueue';
import {
  KUEUE_STATUSES_OVERRIDE_WORKBENCH,
  type KueueWorkloadStatusWithMessage,
} from '#~/concepts/kueue/types';

type NotebookStateStatusProps = {
  isStarting: boolean;
  isStopping: boolean;
  isRunning: boolean;
  notebookStatus?: NotebookStatus | null;
  kueueStatus?: KueueWorkloadStatusWithMessage | null;
  isCompact?: boolean;
  onClick?: LabelProps['onClick'];
};

type StatusLabelSettings = {
  label: string;
  color?: LabelProps['color'];
  status?: LabelProps['status'];
  icon: React.ReactNode;
  description?: string;
};

const NotebookStatusLabel: React.FC<NotebookStateStatusProps> = ({
  isStarting,
  isStopping,
  isRunning,
  notebookStatus,
  kueueStatus = null,
  isCompact,
  onClick,
}) => {
  const isError = notebookStatus?.currentStatus === EventStatus.ERROR;

  const labelSettings = React.useMemo<StatusLabelSettings>(() => {
    if (isError) {
      return {
        label: 'Failed',
        status: 'danger',
        icon: <ExclamationCircleIcon />,
        description:
          'The system was unable to create or start your workbench. This could be due to issues like insufficient cluster resources, problems pulling the container image, or configuration errors. You may need to check the event logs for more details.',
      };
    }

    if (isStopping) {
      return {
        label: 'Stopping',
        color: 'grey',
        icon: <InProgressIcon className="odh-u-spin" />,
        description:
          'The system is in the process of shutting down your workbench and releasing its compute resources.',
      };
    }
    if (kueueStatus?.status && KUEUE_STATUSES_OVERRIDE_WORKBENCH.includes(kueueStatus.status)) {
      const info = getKueueStatusInfo(kueueStatus.status);
      return {
        label: info.label,
        color: info.color,
        status: info.status,
        icon: <info.IconComponent className={info.iconClassName} />,
      };
    }
    if (isStarting) {
      return {
        label: 'Starting',
        color: 'blue',
        icon: <InProgressIcon className="odh-u-spin" />,
        description:
          'The system is actively provisioning the resources for your workbench, such as pulling the container image and allocating storage and compute (like CPUs/GPUs).',
      };
    }
    if (isRunning) {
      return {
        label: 'Ready',
        status: 'success',
        icon: <CheckCircleIcon />,
        description:
          'The workbench is fully provisioned, running, and available for you to connect to and use.',
      };
    }
    return {
      label: 'Stopped',
      color: 'grey',
      icon: <OffIcon />,
      description:
        'The workbench is not running and is not consuming compute resources (like CPUs/GPUs). Your data in any attached persistent storage is safe and will be re-attached when you start the workbench again.',
    };
  }, [kueueStatus, isError, isRunning, isStarting, isStopping]);

  const label = (
    <Label
      isCompact={isCompact}
      color={labelSettings.color}
      status={labelSettings.status}
      icon={labelSettings.icon}
      data-testid="notebook-status-text"
      style={{ width: 'fit-content' }}
      onClick={onClick}
    >
      {labelSettings.label}
    </Label>
  );

  if (labelSettings.description) {
    return (
      <Popover headerContent={labelSettings.label} bodyContent={labelSettings.description}>
        {label}
      </Popover>
    );
  }

  return label;
};

export default NotebookStatusLabel;
