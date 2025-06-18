import axios from '#~/utilities/axios';

import { ODHSegmentKey } from '#~/concepts/analyticsTracking/trackingProperties';
import { throwErrorFromAxios } from '#~/api/errorUtils';

export const fetchSegmentKey = (): Promise<ODHSegmentKey> => {
  const url = '/api/segment-key';
  return axios
    .get(url)
    .then((response) => response.data)
    .catch((e: unknown) => {
      throw throwErrorFromAxios(e);
    });
};
