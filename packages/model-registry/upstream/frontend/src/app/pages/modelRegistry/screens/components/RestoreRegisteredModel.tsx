import * as React from 'react';
import { DashboardModalFooter } from 'mod-arch-shared';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useNotification } from '~/app/hooks/useNotification';
import { TrackingOutcome } from '@odh-dashboard/internal/concepts/analyticsTracking/trackingProperties';
import { useResolvedExtensions } from '@odh-dashboard/plugin-core';
import { isModelRegistryFormTrackingExtension } from '~/odh/extension-points';

interface RestoreRegisteredModelModalProps {
  onCancel: () => void;
  onSubmit: () => void;
  registeredModelName: string;
}

const eventName = 'Archived Model Restored';
export const RestoreRegisteredModelModal: React.FC<RestoreRegisteredModelModalProps> = ({
  onCancel,
  onSubmit,
  registeredModelName,
}) => {
  const notification = useNotification();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<Error>();
  const [extensions] = useResolvedExtensions(isModelRegistryFormTrackingExtension);
  const onClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onCancelClose = React.useCallback(() => {
    extensions.map((extension) => extension.properties.fireFormTrackingEvent(eventName, {
      outcome: TrackingOutcome.cancel,
    }));
    onClose();
  }, [onClose]);

  const onConfirm = React.useCallback(async () => {
    setIsSubmitting(true);

    try {
      await onSubmit();
      onClose();
      extensions.map((extension) => extension.properties.fireFormTrackingEvent(eventName, {
        outcome: TrackingOutcome.submit,
        success: true,
      }));
      notification.success(`${registeredModelName} and all its versions restored.`);
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      }
      extensions.map((extension) => extension.properties.fireFormTrackingEvent(eventName, {
        outcome: TrackingOutcome.submit,
        success: false,
        error: e instanceof Error ? e.message : 'unknown error',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, onClose, notification, registeredModelName]);

  return (
    <Modal isOpen variant="small" onClose={onCancelClose} data-testid="restore-registered-model-modal">
      <ModalHeader title="Restore model?" titleIconVariant="warning" />
      <ModalBody>
        <b>{registeredModelName}</b> and all of its versions will be restored and returned to the
        registered models list.
      </ModalBody>
      <ModalFooter>
        <DashboardModalFooter
          onCancel={onCancelClose}
          onSubmit={onConfirm}
          submitLabel="Restore"
          isSubmitLoading={isSubmitting}
          error={error}
          alertTitle="Error"
          isSubmitDisabled={isSubmitting}
        />
      </ModalFooter>
    </Modal>
  );
};
