import { k8sListResource } from '@openshift/dynamic-plugin-sdk-utils';
import { act } from 'react';
import { mockHardwareProfile } from '~/__mocks__/mockHardwareProfile';
import { mockK8sResourceList } from '~/__mocks__/mockK8sResourceList';
import { standardUseFetchState, testHook } from '~/__tests__/unit/testUtils/hooks';
import { HardwareProfileModel } from '~/api';
import { HardwareProfileKind } from '~/k8sTypes';
import useHardwareProfiles from '~/pages/hardwareProfiles/useHardwareProfiles';

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => ({
  k8sListResource: jest.fn(),
}));

const k8sListResourceMock = jest.mocked(k8sListResource<HardwareProfileKind>);

describe('useHardwareProfile', () => {
  const hardwareProfilesMock = mockK8sResourceList([mockHardwareProfile({ uid: 'test-1' })]);
  it('should return hardware profile', async () => {
    k8sListResourceMock.mockResolvedValue(hardwareProfilesMock);
    const options = {
      model: HardwareProfileModel,
      queryOptions: { ns: 'test' },
    };
    const renderResult = testHook(useHardwareProfiles)('test');
    expect(k8sListResourceMock).toHaveBeenCalledTimes(1);
    expect(k8sListResourceMock).toHaveBeenCalledWith(options);
    expect(renderResult).hookToStrictEqual(standardUseFetchState([]));
    expect(renderResult).hookToHaveUpdateCount(1);

    // wait for update
    await renderResult.waitForNextUpdate();
    expect(k8sListResourceMock).toHaveBeenCalledTimes(1);
    expect(renderResult).hookToStrictEqual(standardUseFetchState(hardwareProfilesMock.items, true));
    expect(renderResult).hookToHaveUpdateCount(2);
    expect(renderResult).hookToBeStable([false, false, true, true]);

    // refresh
    k8sListResourceMock.mockResolvedValue(hardwareProfilesMock);
    await act(() => renderResult.result.current[3]());
    expect(k8sListResourceMock).toHaveBeenCalledTimes(2);
    expect(renderResult).hookToHaveUpdateCount(3);
    expect(renderResult).hookToBeStable([false, true, true, true]);
  });

  it('should generate warnings for negative min value', async () => {
    const hardwareProfilesMockNegativeMin = mockK8sResourceList([
      mockHardwareProfile({
        uid: 'test-2',
        identifiers: [
          {
            displayName: 'Memory',
            identifier: 'memory',
            minCount: '2Gi',
            maxCount: '5Gi',
            defaultCount: '2Gi',
          },
          {
            displayName: 'CPU',
            identifier: 'cpu',
            minCount: '-1',
            maxCount: '2',
            defaultCount: '1',
            warning: true,
          },
        ],
        warning: {
          message:
            'Minimum allowed resource label cannot be negative. Edit the profile to make the profile valid.',
          title: 'Invalid hardware profile',
          warningStatus: true,
        },
      }),
    ]);
    k8sListResourceMock.mockResolvedValue(hardwareProfilesMockNegativeMin);
    const renderResult = testHook(useHardwareProfiles)('test');
    await renderResult.waitForNextUpdate();
    expect(renderResult).hookToStrictEqual(
      standardUseFetchState(hardwareProfilesMockNegativeMin.items, true),
    );
  });

  it('should generate warnings for default value outside of min/max range', async () => {
    const hardwareProfilesMockNegativeMin = mockK8sResourceList([
      mockHardwareProfile({
        uid: 'test-2',
        identifiers: [
          {
            displayName: 'Memory',
            identifier: 'memory',
            minCount: '0Gi',
            maxCount: '5Gi',
            defaultCount: '6Gi',
            warning: true,
          },
          {
            displayName: 'CPU',
            identifier: 'cpu',
            minCount: '5',
            maxCount: '10',
            defaultCount: '2',
            warning: true,
          },
        ],
        warning: {
          message:
            'The default count for resource label must be between the minimum allowed resource label and maximum allowed resource label. Edit the profile to make the profile valid.',
          title: 'Invalid hardware profile',
          warningStatus: true,
        },
      }),
    ]);
    k8sListResourceMock.mockResolvedValue(hardwareProfilesMockNegativeMin);
    const renderResult = testHook(useHardwareProfiles)('test');
    await renderResult.waitForNextUpdate();
    expect(renderResult).hookToStrictEqual(
      standardUseFetchState(hardwareProfilesMockNegativeMin.items, true),
    );
  });

  it('should handle errors and rethrow', async () => {
    k8sListResourceMock.mockRejectedValue(new Error('error1'));

    const renderResult = testHook(useHardwareProfiles)('namespace');
    expect(k8sListResourceMock).toHaveBeenCalledTimes(1);
    expect(renderResult).hookToStrictEqual(standardUseFetchState([]));
    expect(renderResult).hookToHaveUpdateCount(1);

    // wait for update
    await renderResult.waitForNextUpdate();
    expect(k8sListResourceMock).toHaveBeenCalledTimes(1);
    expect(renderResult).hookToStrictEqual(standardUseFetchState([], false, new Error('error1')));
    expect(renderResult).hookToHaveUpdateCount(2);
    expect(renderResult).hookToBeStable([true, true, false, true]);

    // refresh
    k8sListResourceMock.mockRejectedValue(new Error('error2'));
    await act(() => renderResult.result.current[3]());
    expect(k8sListResourceMock).toHaveBeenCalledTimes(2);
    expect(renderResult).hookToStrictEqual(standardUseFetchState([], false, new Error('error2')));
    expect(renderResult).hookToHaveUpdateCount(3);
    expect(renderResult).hookToBeStable([true, true, false, true]);
  });
});
