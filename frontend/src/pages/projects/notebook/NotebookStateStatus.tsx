import * as React from 'react';
import { Button, Label, LabelProps, Popover, Tooltip } from '@patternfly/react-core';
import {
  BanIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  RunningIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import { EventStatus } from '~/types';
import { useDeepCompareMemoize } from '~/utilities/useDeepCompareMemoize';
import { NotebookState } from './types';
import { getEventFullMessage, useNotebookStatus } from './utils';
import StartNotebookModal from './StartNotebookModal';

type NotebookStateStatusProps = {
  notebookState: NotebookState;
  stopNotebook: () => void;
};

const NotebookStateStatus: React.FC<NotebookStateStatusProps> = ({
  notebookState,
  stopNotebook,
}) => {
  const { notebook, runningPodUid, isStarting, isStopping, isRunning } = notebookState;
  const [unstableNotebookStatus, events] = useNotebookStatus(notebook, runningPodUid, isStarting);
  const notebookStatus = useDeepCompareMemoize(unstableNotebookStatus);
  const isError = notebookStatus?.currentStatus === EventStatus.ERROR;
  const [isPopoverVisible, setPopoverVisible] = React.useState(false);
  const [isStartModalOpen, setStartModalOpen] = React.useState(false);

  const statusLabelSettings = React.useMemo((): {
    label: string;
    color: LabelProps['color'];
    icon: React.ReactNode;
  } => {
    if (isError) {
      return { label: 'Failed', color: 'red', icon: <ExclamationCircleIcon /> };
    }
    if (isStarting) {
      return {
        label: 'Starting',
        color: 'blue',
        icon: <InProgressIcon className="odh-u-spin" />,
      };
    }
    if (isStopping) {
      return {
        label: 'Stopping',
        color: 'grey',
        icon: <SyncAltIcon className="odh-u-spin" />,
      };
    }
    if (isRunning) {
      return { label: 'Running', color: 'green', icon: <RunningIcon /> };
    }
    return { label: 'Stopped', color: 'grey', icon: <BanIcon /> };
  }, [isError, isRunning, isStarting, isStopping]);

  const StatusLabel = (
    <Label
      isCompact
      color={statusLabelSettings.color}
      icon={statusLabelSettings.icon}
      data-testid="notebook-status-text"
      onClick={isStarting ? () => setPopoverVisible((visible) => !visible) : undefined}
      style={{ width: 'fit-content' }}
    >
      {statusLabelSettings.label}
    </Label>
  );

  if (isStarting) {
    return (
      <>
        <Popover
          data-testid="notebook-status-popover"
          shouldClose={() => setPopoverVisible(false)}
          isVisible={isPopoverVisible}
          headerContent="Notebook status"
          bodyContent={
            events[events.length - 1]
              ? getEventFullMessage(events[events.length - 1])
              : 'Waiting for notebook to start...'
          }
          footerContent={
            <Button
              variant="link"
              isInline
              onClick={() => {
                setPopoverVisible(false);
                setStartModalOpen(true);
              }}
            >
              Event log
            </Button>
          }
        >
          {StatusLabel}
        </Popover>
        {isStartModalOpen ? (
          <StartNotebookModal
            isOpen
            notebookState={notebookState}
            notebookStatus={notebookStatus}
            events={events}
            onClose={(stopped) => {
              if (stopped) {
                stopNotebook();
              }
              setStartModalOpen(false);
            }}
          />
        ) : null}
      </>
    );
  }

  return notebookStatus?.currentStatus === EventStatus.ERROR ? (
    <Tooltip content={notebookStatus.currentEvent}>{StatusLabel}</Tooltip>
  ) : (
    StatusLabel
  );
};

export default NotebookStateStatus;