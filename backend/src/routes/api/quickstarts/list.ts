import { QuickStart } from '../../../types';
import { getQuickStarts } from '../../../utils/resourceUtils';
import { checkJupyterEnabled } from '../../../utils/componentUtils';

export const listQuickStarts = (): Promise<QuickStart[]> =>
  Promise.resolve(
    getQuickStarts().filter((qs) => checkJupyterEnabled() || qs.spec.appName !== 'jupyter'),
  );
