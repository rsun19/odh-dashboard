import { HardwareProfileKind } from '~/k8sTypes';

export type WarningNotification = {
  warningStatus: boolean;
  title: string;
  message: string;
};

export const isHardwareProfileOOTB = (hardwareProfile: HardwareProfileKind): boolean =>
  hardwareProfile.metadata.labels?.['opendatahub.io/ootb'] === 'true';

export const generateWarningTitle = (
  isEnabled: boolean,
  isAllWarnings: boolean,
  warningCount: number,
): string => {
  if (!isEnabled) {
    return 'All hardware profiles are disabled';
  }
  if (isAllWarnings) {
    return 'All hardware profiles are invalid';
  }
  if (warningCount > 0) {
    return 'One or more hardware profiles are invalid';
  }
  return '';
};

export const generateWarningMessage = (
  isEnabled: boolean,
  isAllWarnings: boolean,
  warningCount: number,
): string => {
  if (!isEnabled) {
    return 'You must have at least one hardware profile enabled for users to create workbenches or deploy models. Enable one or more profiles in the table below.';
  }
  if (isAllWarnings) {
    return 'You must have at least one valid hardware profile enabled for users to create workbenches or deploy models. Take the appropriate actions below to re-validate your profiles.';
  }
  if (warningCount > 0) {
    return 'One or more of your defined hardware profiles are invalid. Take the appropriate actions below to revalidate your profiles.';
  }
  return '';
};

export const generateWarningForHardwareProfiles = (
  hardwareProfiles: HardwareProfileKind[],
): {
  warning: boolean;
  title: string;
  message: string;
  isEnabled: boolean;
} => {
  let isEnabled = false;
  let warningCount = 0;
  for (const profile of hardwareProfiles) {
    if (profile.spec.warning?.warningStatus === true) {
      warningCount += 1;
    }
    if (profile.spec.enabled === true) {
      isEnabled = true;
    }
  }

  return {
    warning: warningCount > 0 || !isEnabled,
    title: generateWarningTitle(isEnabled, warningCount === hardwareProfiles.length, warningCount),
    message: generateWarningMessage(
      isEnabled,
      warningCount === hardwareProfiles.length,
      warningCount,
    ),
    isEnabled,
  };
};

export const hardwareProfileWarning = (
  hardwareProfiles: HardwareProfileKind[],
): HardwareProfileKind[] =>
  hardwareProfiles.map((profile) => {
    let warningStatus = false;
    const { identifiers } = profile.spec;
    let parentWarningMessage = '';
    if (typeof identifiers !== 'undefined' && identifiers.length > 0) {
      for (let identifier of identifiers) {
        if (identifier.minCount > identifier.maxCount) {
          parentWarningMessage += `Minimum allowed ${
            identifier.resourceType ?? 'resource label'
          } cannot exceed maximum allowed ${
            identifier.resourceType ?? 'resource label'
          }. Edit the profile to make the profile valid.`;
          warningStatus = true;
          identifier = {
            ...identifier,
            warning: true,
          };
        }
        if (Number(identifier.minCount) < 0) {
          parentWarningMessage = `Minimum allowed ${
            identifier.resourceType ?? 'resource label'
          } cannot be negative. Edit the profile to make the profile valid.`;
          warningStatus = true;
          identifier = {
            ...identifier,
            warning: true,
          };
        }
        if (Number(identifier.maxCount) < 0) {
          parentWarningMessage = `Maximum allowed ${
            identifier.resourceType ?? 'resource label'
          } cannot be negative. Edit the profile to make the profile valid.`;
          warningStatus = true;
          identifier = {
            ...identifier,
            warning: true,
          };
        }
        if (
          identifier.defaultCount < identifier.minCount ||
          identifier.defaultCount > identifier.maxCount
        ) {
          parentWarningMessage = `The default count for ${
            identifier.resourceType ?? 'resource label'
          } must be between the minimum allowed ${
            identifier.resourceType ?? 'resource label'
          } and maximum allowed ${
            identifier.resourceType ?? 'resource label'
          }. Edit the profile to make the profile valid.`;
          warningStatus = true;
          identifier = {
            ...identifier,
            warning: true,
          };
        }
        identifier = {
          ...identifier,
          warning: false,
        };
      }
    }
    return {
      ...profile,
      spec: {
        ...profile.spec,
        warning: {
          warningStatus,
          title: warningStatus === true ? 'Invalid hardware profile' : '',
          message: warningStatus === true ? parentWarningMessage : '',
        },
      },
    };
  });
