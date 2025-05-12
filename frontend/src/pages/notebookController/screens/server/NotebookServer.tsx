import * as React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, ActionList, ActionListItem, Stack, StackItem } from '@patternfly/react-core';
import { Notebook } from '~/types';
import ApplicationsPage from '~/pages/ApplicationsPage';
import { NotebookControllerContext } from '~/pages/notebookController/NotebookControllerContext';
import ImpersonateAlert from '~/pages/notebookController/screens/admin/ImpersonateAlert';
import useNotification from '~/utilities/useNotification';
import useStopNotebookModalAvailability from '~/pages/projects/notebook/useStopNotebookModalAvailability';

import '~/pages/notebookController/NotebookController.scss';
import { stopNotebook } from '~/services/notebookService';
import { useUser } from '~/redux/selectors';
import { allSettledPromises } from '~/utilities/allSettledPromises';
import StopServerModal from './StopServerModal';
import NotebookServerDetails from './NotebookServerDetails';

const NotebookServer: React.FC = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const {
    currentUserNotebook: notebook,
    currentUserNotebookIsRunning,
    currentUserNotebookLink,
    requestNotebookRefresh,
  } = React.useContext(NotebookControllerContext);
  const [notebooksToStop, setNotebooksToStop] = React.useState<Notebook[]>([]);
  const [dontShowModalValue, setDontShowModalValue] = useStopNotebookModalAvailability();
  const { isAdmin } = useUser();
  const [isDeleting, setDeleting] = React.useState(false);

  const onNotebooksStop = React.useCallback(
    (didStop: boolean) => {
      if (didStop) {
        // Refresh the context so the spawner page knows the full state
        requestNotebookRefresh();
        navigate(`/notebookController/spawner`);
      } else {
        setNotebooksToStop([]);
      }
    },
    [requestNotebookRefresh, navigate],
  );

  const link = currentUserNotebookLink || '#';

  const handleStopServer = () => {
    setDeleting(true);
    allSettledPromises<Notebook | void>(
      notebooksToStop.map((notebookItem) => {
        const notebookName = notebookItem.metadata.name || '';
        if (!notebookName) {
          return Promise.resolve();
        }

        if (!isAdmin) {
          return stopNotebook();
        }

        const notebookUser = notebookItem.metadata.annotations?.['opendatahub.io/username'];
        if (!notebookUser) {
          return Promise.resolve();
        }

        return stopNotebook(notebookUser);
      }),
    )
      .then(() => {
        setDeleting(false);
        onNotebooksStop(true);
      })
      .catch((e) => {
        setDeleting(false);
        notification.error(
          `Error stopping ${notebooksToStop.length > 1 ? 'workbenches' : 'workbench'}`,
          e.message,
        );
      });
  };

  if (dontShowModalValue && notebooksToStop.length) {
    handleStopServer();
  }

  return (
    <>
      <ImpersonateAlert />
      <ApplicationsPage
        title="Workbench control panel"
        description={null}
        loaded
        provideChildrenPadding
        empty={!currentUserNotebookIsRunning}
        emptyStatePage={<Navigate to="/notebookController/spawner" />}
      >
        {notebook && (
          <Stack hasGutter>
            <StackItem>
              {notebooksToStop.length && !dontShowModalValue ? (
                <StopServerModal
                  notebooksToStop={notebooksToStop}
                  onNotebooksStop={onNotebooksStop}
                  link={link}
                  dontShowModalValue={dontShowModalValue}
                  setDontShowModalValue={setDontShowModalValue}
                />
              ) : null}
              <ActionList>
                <ActionListItem
                  onClick={(e) => {
                    if (link === '#') {
                      e.preventDefault();
                      notification.error(
                        'Error accessing workbench',
                        'Failed to redirect page due to missing workbench URL, please try to refresh the page and try it again.',
                      );
                    }
                  }}
                >
                  <Button component="a" href={link} data-id="return-nb-button">
                    Access workbench
                  </Button>
                </ActionListItem>
                <ActionListItem>
                  <Button
                    data-testid="stop-wb-button"
                    variant="secondary"
                    onClick={() => setNotebooksToStop([notebook])}
                    isDisabled={isDeleting}
                  >
                    Stop workbench
                  </Button>
                </ActionListItem>
              </ActionList>
            </StackItem>
            <StackItem>
              <NotebookServerDetails />
            </StackItem>
          </Stack>
        )}
      </ApplicationsPage>
    </>
  );
};

export default NotebookServer;
