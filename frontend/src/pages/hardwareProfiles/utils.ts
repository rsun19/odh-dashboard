import { HardwareProfileKind } from '~/k8sTypes';

export type WarningNotification = {
  warning: boolean;
  title: string;
  message: string;
};

export const isHardwareProfileOOTB = (hardwareProfile: HardwareProfileKind): boolean =>
  hardwareProfile.metadata.labels?.['opendatahub.io/ootb'] === 'true';

export const generateWarningMessage = (
  hardwareProfiles: HardwareProfileKind[],
): {
  warning: boolean;
  title: string;
  message: string;
  isEnabled: boolean;
} => {
  const isEnabled = hardwareProfiles.filter((x) => x.spec.enabled === true).length > 0;
  return {
    warning:
      hardwareProfiles.filter((x) => x.spec.warning?.warning === true).length > 0 || !isEnabled,
    title:
      isEnabled === true
        ? 'One or more hardware profiles are invalid'
        : 'All hardware profiles are invalid.',
    message:
      isEnabled === true
        ? 'One or more of your defined hardware profiles are invalid. Take the appropriate actions below to revalidate your profiles'
        : 'You must have at least one hardware profile enabled for users to create workbenches or deploy models. Enable one or more profiles in the table below.',
    isEnabled,
  };
};

export const hardwareProfileWarning = (
  hardwareProfiles: HardwareProfileKind[],
): HardwareProfileKind[] =>
  hardwareProfiles.map((profile) => {
    const { identifiers } = profile.spec;
    if (typeof identifiers !== 'undefined' && identifiers.length > 0) {
      let parentWarningMessage = '';
      identifiers.forEach((identifier) => {
        if (identifier.minCount > identifier.maxCount) {
          parentWarningMessage += `Minimum allowed ${
            identifier.resourceType ?? 'resource label'
          } cannot exceed maximum allowed ${
            identifier.resourceType ?? 'resource label'
          }. Edit the profile to make the profile valid. `;
          return {
            ...identifier,
            warning: true,
          };
        }
        if (Number(identifier.minCount) < 0) {
          parentWarningMessage = `Minimum allowed ${
            identifier.resourceType ?? 'resource label'
          } cannot be negative. Edit the profile to make the profile valid. `;
          return {
            ...identifier,
            warning: true,
          };
        }
        if (Number(identifier.maxCount) < 0) {
          parentWarningMessage = `Maximum allowed ${
            identifier.resourceType ?? 'resource label'
          } cannot be negative. Edit the profile to make the profile valid.`;
          return {
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
          }. Edit the profile to make the profile valid. `;
          return {
            ...identifier,
            warning: true,
          };
        }
        return {
          ...identifier,
          warning: false,
        };
      });
      const warningStatus = identifiers.filter((x) => x.warning === true).length > 0;
      return {
        ...profile,
        warning: {
          warning: warningStatus,
          title: warningStatus === true ? 'Invalid hardware profile' : '',
          message: warningStatus === true ? parentWarningMessage : '',
        },
      };
    }
    return profile;
  });
