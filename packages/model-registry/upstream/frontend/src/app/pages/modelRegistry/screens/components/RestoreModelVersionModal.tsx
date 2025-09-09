import * as React from 'react';
import { DashboardModalFooter } from 'mod-arch-shared';
import { ModalBody, ModalFooter, ModalHeader, Modal } from '@patternfly/react-core';
import { useNotification } from '~/app/hooks/useNotification';
import { TrackingOutcome } from '@odh-dashboard/internal/concepts/analyticsTracking/trackingProperties.js';
import { useResolvedExtensions } from '@odh-dashboard/plugin-core';
import { isModelRegistryFormTrackingExtension } from '~/odh/extension-points';

interface RestoreModelVersionModalProps {
  onCancel: () => void;
  onSubmit: () => void;
  modelVersionName: string;
}

const eventName = 'Archived Model Version Restored';
export const RestoreModelVersionModal: React.FC<RestoreModelVersionModalProps> = ({
  onCancel,
  onSubmit,
  modelVersionName,
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
      extensions.map((extension) => extension.properties.fireFormTrackingEvent(eventName, {
        outcome: TrackingOutcome.submit,
        success: true,
      }));
      onClose();
      notification.success(`${modelVersionName} restored.`);
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
  }, [onSubmit, onClose, notification, modelVersionName]);

  return (
    <Modal isOpen variant="small" onClose={onCancelClose} data-testid="restore-model-version-modal">
      <ModalHeader title="Restore model version?" titleIconVariant="warning" />
      <ModalBody>
        <b>{modelVersionName}</b> will be restored and returned to the versions list.
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
