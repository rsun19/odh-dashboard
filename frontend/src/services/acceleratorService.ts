import axios from '#~/utilities/axios';
import { DetectedAccelerators } from '#~/types';
import { throwErrorFromAxios } from '#~/api/errorUtils';

export const getDetectedAccelerators = (): Promise<DetectedAccelerators> => {
  const url = '/api/accelerators';
  return axios
    .get(url)
    .then((response) => response.data)
    .catch((e: unknown) => {
      throw throwErrorFromAxios(e);
    });
};
