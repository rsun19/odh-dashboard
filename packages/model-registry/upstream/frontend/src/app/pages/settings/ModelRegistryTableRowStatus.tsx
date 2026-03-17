import React from 'react';
import { Label, Popover, Stack, StackItem } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import { K8sCondition } from 'mod-arch-shared';

enum ModelRegistryStatus {
  Progressing = 'Progressing',
  Degraded = 'Degraded',
  Available = 'Available',
  IstioAvailable = 'IstioAvailable',
  GatewayAvailable = 'GatewayAvailable',
}

enum ModelRegistryStatusLabel {
  Progressing = 'Starting',
  Available = 'Ready',
  Degrading = 'Stopping',
  Unavailable = 'Unavailable',
}

enum ConditionStatus {
  True = 'True',
  False = 'False',
}
interface ModelRegistryTableRowStatusProps {
  conditions: K8sCondition[] | undefined;
}

export const ModelRegistryTableRowStatus: React.FC<ModelRegistryTableRowStatusProps> = ({
  conditions,
}) => {
  const conditionsMap =
    conditions?.reduce((acc: Record<string, K8sCondition | undefined>, condition) => {
      acc[condition.type] = condition;
      return acc;
    }, {}) ?? {};
  let statusLabel: string = ModelRegistryStatusLabel.Progressing;
  let icon = <InProgressIcon />;
  let color: React.ComponentProps<typeof Label>['color'] = 'blue';
  let status: React.ComponentProps<typeof Label>['status'];
  let popoverMessages: string[] = [];
  let popoverTitle = '';

  if (Object.values(conditionsMap).length) {
    const {
      [ModelRegistryStatus.Available]: availableCondition,
      [ModelRegistryStatus.Progressing]: progressCondition,
      [ModelRegistryStatus.Degraded]: degradedCondition,
    } = conditionsMap;

    popoverMessages =
      availableCondition?.status === ConditionStatus.False
        ? Object.values(conditionsMap).reduce((messages: string[], condition) => {
            if (condition?.status === ConditionStatus.False && condition.message) {
              messages.push(condition.message);
            }
            return messages;
          }, [])
        : [];

    // Unavailable
    if (
      availableCondition?.status === ConditionStatus.False &&
      !popoverMessages.some((message) => message.includes('ContainerCreating'))
    ) {
      statusLabel = ModelRegistryStatusLabel.Unavailable;
      icon = <ExclamationTriangleIcon />;
      color = undefined;
      status = 'warning';
    }
    // Degrading
    else if (degradedCondition?.status === ConditionStatus.True) {
      statusLabel = ModelRegistryStatusLabel.Degrading;
      icon = <InProgressIcon className="kubeflow-u-spin" />;
      color = 'grey';
      popoverTitle = 'Service is degrading';
    }
    // Available
    else if (availableCondition?.status === ConditionStatus.True) {
      statusLabel = ModelRegistryStatusLabel.Available;
      icon = <CheckCircleIcon />;
      color = undefined;
      status = 'success';
    }
    // Progressing
    else if (progressCondition?.status === ConditionStatus.True) {
      statusLabel = ModelRegistryStatusLabel.Progressing;
      icon = <InProgressIcon className="kubeflow-u-spin" />;
    }
  }
  // Handle popover logic for Unavailable status
  if (statusLabel === ModelRegistryStatusLabel.Unavailable) {
    const {
      [ModelRegistryStatus.IstioAvailable]: istioAvailableCondition,
      [ModelRegistryStatus.GatewayAvailable]: gatewayAvailableCondition,
    } = conditionsMap;

    if (
      istioAvailableCondition?.status === ConditionStatus.False &&
      gatewayAvailableCondition?.status === ConditionStatus.False
    ) {
      popoverTitle = 'Istio resources and Istio Gateway resources are both unavailable';
    } else if (istioAvailableCondition?.status === ConditionStatus.False) {
      popoverTitle = 'Istio resources are unavailable';
    } else if (gatewayAvailableCondition?.status === ConditionStatus.False) {
      popoverTitle = 'Istio Gateway resources are unavailable';
    } else if (
      istioAvailableCondition?.status === ConditionStatus.True &&
      gatewayAvailableCondition?.status === ConditionStatus.True
    ) {
      popoverTitle = 'Deployment is unavailable';
    } else {
      popoverTitle = 'Service is unavailable';
    }
  }

  const statusDescriptions: Record<string, string> = {
    [ModelRegistryStatusLabel.Available]:
      'The model registry operator is running, its components (like the operator pod) are healthy, and it is successfully connected to its database. It is fully operational and available for use.',
    [ModelRegistryStatusLabel.Progressing]:
      'The system is in the process of provisioning the model registry. This includes creating the necessary pods (like the model-registry-operator) and establishing the connection to its database.',
    [ModelRegistryStatusLabel.Degrading]:
      "The system is in the process of shutting down and terminating the model registry's components.",
    [ModelRegistryStatusLabel.Unavailable]:
      'The RHOAI dashboard cannot communicate with the model registry\'s backend components. This could be due to a network issue, a component being in an unknown state, or a problem with the database connection. Can also be a transient state preceding "Ready", e.g. when pods are still starting and the underlying condition is ContainersNotReady.',
  };

  const hasConditionPopover = popoverTitle && popoverMessages.length;

  const label = (
    <Label
      onClick={() => {
        /* intentional no-op - Click event is handled by the Popover parent,
        this prop enables clickable styles in the PatternFly Label */
      }}
      data-testid="model-registry-label"
      icon={icon}
      color={color}
      status={status}
      isCompact
      style={{ cursor: 'pointer' }}
    >
      {statusLabel}
    </Label>
  );

  if (hasConditionPopover) {
    return (
      <Popover
        headerContent={popoverTitle}
        {...(statusLabel === ModelRegistryStatusLabel.Degrading
          ? {
              alertSeverityVariant: 'warning',
              headerIcon: <ExclamationTriangleIcon />,
            }
          : { alertSeverityVariant: 'danger', headerIcon: <ExclamationCircleIcon /> })}
        bodyContent={
          <Stack hasGutter>
            {popoverMessages.map((message, index) => (
              <StackItem key={`message-${index}`}>{message}</StackItem>
            ))}
          </Stack>
        }
      >
        {label}
      </Popover>
    );
  }

  return (
    <Popover headerContent={statusLabel} bodyContent={statusDescriptions[statusLabel]}>
      {label}
    </Popover>
  );
};
