import {
  k8sGetResource,
  k8sListResource,
  k8sPatchResource,
} from '@openshift/dynamic-plugin-sdk-utils';
import { mockK8sResourceList } from '~/__mocks__/mockK8sResourceList';
import { StorageClassKind } from '~/k8sTypes';
import { StorageClassModel } from '~/api/models';
import { mockStorageClasses } from '~/__mocks__';
import {
  getStorageClass,
  getStorageClasses,
  updateStorageClassConfig,
} from '~/api/k8s/storageClasses';

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => ({
  k8sListResource: jest.fn(),
  k8sGetResource: jest.fn(),
  k8sPatchResource: jest.fn(),
}));

const mockListResource = jest.mocked(k8sListResource<StorageClassKind>);
const mockGetResource = jest.mocked(k8sGetResource<StorageClassKind>);
const mockPatchResource = jest.mocked(k8sPatchResource<StorageClassKind>);

describe('getStorageClasses', () => {
  it('should fetch and return a list of storage classes', async () => {
    mockListResource.mockResolvedValue(mockK8sResourceList(mockStorageClasses));

    const result = await getStorageClasses();
    expect(mockListResource).toHaveBeenCalledWith({
      model: StorageClassModel,
      queryOptions: {},
    });
    expect(mockListResource).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(mockStorageClasses);
  });

  it('should handle errors when fetching a list of storage classes', async () => {
    mockListResource.mockRejectedValue(new Error('error1'));

    await expect(getStorageClasses()).rejects.toThrow('error1');
    expect(mockListResource).toHaveBeenCalledTimes(1);
    expect(mockListResource).toHaveBeenCalledWith({
      model: StorageClassModel,
      queryOptions: {},
    });
  });
});

describe('getStorageClass', () => {
  it('should fetch and return a specific storage class', async () => {
    mockGetResource.mockResolvedValue(mockStorageClasses[0]);
    const result = await getStorageClass('openshift-default-sc');
    expect(mockGetResource).toHaveBeenCalledWith({
      model: StorageClassModel,
      queryOptions: { name: 'openshift-default-sc' },
    });
    expect(result).toStrictEqual(mockStorageClasses[0]);
  });

  it('should handle errors when fetching a specific storage class', async () => {
    mockGetResource.mockRejectedValue(new Error('error1'));

    await expect(getStorageClass('openshift-default-sc')).rejects.toThrow('error1');
    expect(mockGetResource).toHaveBeenCalledTimes(1);
    expect(mockGetResource).toHaveBeenCalledWith({
      model: StorageClassModel,
      queryOptions: { name: 'openshift-default-sc' },
    });
  });
});

describe('updateStorageClassConfig', () => {
  it('should patch a storage class config', async () => {
    const lastModifiedDate = new Date().toISOString();
    const config = { isEnabled: false };
    const fullConfig = {
      ...(mockStorageClasses[0].metadata.annotations?.['opendatahub.io/sc-config'] &&
        JSON.parse(mockStorageClasses[0].metadata.annotations['opendatahub.io/sc-config'])),
      ...config,
      lastModified: lastModifiedDate,
    };
    const returnedValue = {
      ...mockStorageClasses[0],
      metadata: {
        ...mockStorageClasses[0].metadata,
        annotations: {
          ...mockStorageClasses[0].metadata.annotations,
          'opendatahub.io/sc-config': JSON.stringify(fullConfig),
        },
      },
    };
    mockGetResource.mockResolvedValue(mockStorageClasses[0]);
    mockPatchResource.mockResolvedValue(returnedValue);
    const result = await updateStorageClassConfig('openshift-default-sc', config);
    expect(mockGetResource).toHaveBeenCalledWith({
      model: StorageClassModel,
      queryOptions: {
        name: 'openshift-default-sc',
      },
    });
    expect(mockPatchResource).toHaveBeenCalledWith({
      fetchOptions: {
        requestInit: {},
      },
      model: StorageClassModel,
      queryOptions: {
        name: 'openshift-default-sc',
        queryParams: {},
      },
      patches: [
        {
          op: 'replace',
          path: '/metadata/annotations/opendatahub.io~1sc-config',
          value: expect.anything(),
        },
      ],
    });
    expect(mockGetResource).toBeCalledTimes(1);
    expect(mockPatchResource).toBeCalledTimes(1);
    expect(result).toStrictEqual(fullConfig);
  });

  it('should handle errors when patching a storage class config', async () => {
    mockPatchResource.mockRejectedValue(new Error('error1'));
    const config = { isEnabled: false };
    await expect(updateStorageClassConfig('openshift-default-sc', config)).rejects.toThrow(
      'error1',
    );
    expect(mockPatchResource).toHaveBeenCalledWith({
      fetchOptions: {
        requestInit: {},
      },
      model: StorageClassModel,
      queryOptions: {
        name: 'openshift-default-sc',
        queryParams: {},
      },
      patches: [
        {
          op: 'replace',
          path: '/metadata/annotations/opendatahub.io~1sc-config',
          value: expect.anything(),
        },
      ],
    });
    expect(mockGetResource).toBeCalledTimes(1);
    expect(mockPatchResource).toHaveBeenCalledTimes(1);
  });
});
