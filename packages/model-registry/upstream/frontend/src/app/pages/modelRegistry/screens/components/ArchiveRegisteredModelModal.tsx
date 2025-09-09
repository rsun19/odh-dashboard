import * as React from 'react';
import {
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { DashboardModalFooter } from 'mod-arch-shared';
import { useNotification } from '~/app/hooks/useNotification';
import { useResolvedExtensions } from '@odh-dashboard/plugin-core';
import { TrackingOutcome } from '@odh-dashboard/internal/concepts/analyticsTracking/trackingProperties';
import { isModelRegistryFormTrackingExtension } from '~/odh/extension-points';

interface ArchiveRegisteredModelModalProps {
  onCancel: () => void;
  onSubmit: () => void;
  registeredModelName: string;
}

const eventName = 'Registered Model Archived';
export const ArchiveRegisteredModelModal: React.FC<ArchiveRegisteredModelModalProps> = ({
  onCancel,
  onSubmit,
  registeredModelName,
}) => {
  const notification = useNotification();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<Error>();
  const [confirmInputValue, setConfirmInputValue] = React.useState('');
  const isDisabled = confirmInputValue.trim() !== registeredModelName || isSubmitting;
  const [extensions] = useResolvedExtensions(isModelRegistryFormTrackingExtension);

  const onClose = React.useCallback(() => {
    setConfirmInputValue('');
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
      notification.success(`${registeredModelName} and all its versions archived.`);
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
    <Modal isOpen variant="small" onClose={onCancelClose} data-testid="archive-registered-model-modal">
      <ModalHeader title="Archive model?" titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <b>{registeredModelName}</b> and all of its versions will be archived and unavailable
            for use unless it is restored.
          </StackItem>
          <StackItem>
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                Type <strong>{registeredModelName}</strong> to confirm archiving:
              </FlexItem>
              <TextInput
                id="confirm-archive-input"
                data-testid="confirm-archive-input"
                aria-label="confirm archive input"
                value={confirmInputValue}
                onChange={(_e, newValue) => setConfirmInputValue(newValue)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !isDisabled) {
                    onConfirm();
                  }
                }}
              />
            </Flex>
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <DashboardModalFooter
          onCancel={onCancelClose}
          onSubmit={onConfirm}
          submitLabel="Archive"
          isSubmitLoading={isSubmitting}
          isSubmitDisabled={isDisabled}
          error={error}
          alertTitle="Error"
        />
      </ModalFooter>
    </Modal>
  );
};
