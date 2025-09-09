import { FormTrackingEventProperties } from '@odh-dashboard/internal/concepts/analyticsTracking/trackingProperties';
import type { Extension, CodeRef } from '@openshift/dynamic-plugin-sdk';

export type ModelRegistryFormTrackingExtension = Extension<
  'model-registry.form-tracking',
  {
    fireFormTrackingEvent: CodeRef<(eventName: string, properties: FormTrackingEventProperties) => void>;
  }
>;

export const isModelRegistryFormTrackingExtension = (
  extension: Extension,
): extension is ModelRegistryFormTrackingExtension =>
  extension.type === 'model-registry.form-tracking';
