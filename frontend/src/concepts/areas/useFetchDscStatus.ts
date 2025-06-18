import { isAxiosError } from 'axios';
import axios from '#~/utilities/axios';
import useFetchState, { FetchState } from '#~/utilities/useFetchState';
import { DataScienceClusterKindStatus } from '#~/k8sTypes';
import { throwErrorFromAxios } from '#~/api/errorUtils.ts';

/**
 * Should only return `null` when on v1 Operator.
 */
const fetchDscStatus = (): Promise<DataScienceClusterKindStatus | null> => {
  const url = '/api/dsc/status';
  return axios
    .get(url)
    .then((response) => response.data)
    .catch((e: unknown) => {
      // Handle 404 errors specifically to maintain backward compatibility with tests
      if (isAxiosError(e) && e.response?.status === 404) {
        return null;
      }
      throw throwErrorFromAxios(e);
    });
};

const useFetchDscStatus = (): FetchState<DataScienceClusterKindStatus | null> =>
  useFetchState(fetchDscStatus, null);

export default useFetchDscStatus;
