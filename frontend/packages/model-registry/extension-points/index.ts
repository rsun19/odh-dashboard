import type { Extension } from '@openshift/dynamic-plugin-sdk';
import type { ComponentCodeRef } from '../../plugin-core/src/extension-points/types';

export type ModelRegistryDeployButtonExtension = Extension<
  'model-registry.deploy-button',
  {
    component: ComponentCodeRef;
  }
>;

export const isModelRegistryDeployButtonExtension = (
  extension: Extension,
): extension is ModelRegistryDeployButtonExtension =>
  extension.type === 'model-registry.deploy-button';
