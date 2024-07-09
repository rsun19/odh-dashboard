import { K8sStatus, KubeFastifyInstance, OauthFastifyRequest } from '../../../types';
import { FastifyRequest } from 'fastify';
import { getUserName } from '../../../utils/userUtils';
import {
  getAdminUserList,
  getAllowedUserList,
  isUserAdmin,
  KUBE_SAFE_PREFIX,
} from '../../../utils/adminUtils';
import { getNotebooks } from '../../../utils/notebookUtils';
import { V1ResourceAttributes, V1SelfSubjectAccessReview, V1SubjectAccessReview } from '@kubernetes/client-node';
import { passThroughResource } from '../k8s/pass-through';
import { getDashboardConfig } from 'utils/resourceUtils';

type AllowedUser = {
  username: string;
  privilege: 'Admin' | 'User';
  lastActivity: string;
};
type AllowedUserMap = { [username: string]: AllowedUser };
type UserActivityMap = { [username: string]: string };

const convertUserListToMap = (
  userList: string[],
  privilege: 'Admin' | 'User',
  activityMap: UserActivityMap,
): AllowedUserMap => {
  return userList.reduce<AllowedUserMap>((acc, rawUsername) => {
    let username = rawUsername;
    if (username.startsWith(KUBE_SAFE_PREFIX)) {
      // Users who start with this designation are non-k8s names
      username = username.slice(KUBE_SAFE_PREFIX.length);
    }

    return {
      ...acc,
      [username]: { username, privilege, lastActivity: activityMap[username] ?? null },
    };
  }, {});
};

const getUserActivityFromNotebook = async (
  fastify: KubeFastifyInstance,
  namespace: string,
): Promise<UserActivityMap> => {
  const notebooks = await getNotebooks(fastify, namespace);

  return notebooks.items
    .map<[string | undefined, string | undefined]>((notebook) => [
      notebook.metadata?.annotations?.['opendatahub.io/username'],
      notebook.metadata?.annotations?.['notebooks.kubeflow.org/last-activity'] ||
        notebook.metadata?.annotations?.['kubeflow-resource-stopped'],
    ])
    .filter(([username, lastActivity]) => username && lastActivity)
    .reduce<UserActivityMap>(
      (acc, [username, lastActivity]) => ({
        ...acc,
        [username]: lastActivity,
      }),
      {},
    );
};

export const getAllowedUsers = async (
  fastify: KubeFastifyInstance,
  request: FastifyRequest<{ Params: { namespace: string } }>,
): Promise<AllowedUser[]> => {
  const { namespace } = request.params;
  const currentUser = await getUserName(fastify, request);
  const isAdmin = await isUserAdmin(fastify, currentUser, namespace);
  if (!isAdmin) {
    // Privileged call -- return nothing
    fastify.log.warn(
      `A request for all allowed users & their status was made as a non Admin (by ${currentUser})`,
    );
    return [];
  }

  const adminUsers = await getAdminUserList(fastify);
  const allowedUsers = await getAllowedUserList(fastify);
  const activityMap = await getUserActivityFromNotebook(fastify, namespace);

  const usersWithNotebooksMap: AllowedUserMap = convertUserListToMap(
    Object.keys(activityMap),
    'User',
    activityMap,
  );
  const allowedUsersMap: AllowedUserMap = convertUserListToMap(allowedUsers, 'User', activityMap);
  const adminUsersMap: AllowedUserMap = convertUserListToMap(adminUsers, 'Admin', activityMap);

  const returnUsers: AllowedUserMap = {
    ...usersWithNotebooksMap,
    ...allowedUsersMap,
    ...adminUsersMap,
  };
  return Object.values(returnUsers);
};

const createSelfSubjectAccessReview = (
  fastify: KubeFastifyInstance,
  request: OauthFastifyRequest,
  resourceAttributes: V1ResourceAttributes,
): Promise<V1SubjectAccessReview | K8sStatus> => {
  const kc = fastify.kube.config;
  const cluster = kc.getCurrentCluster();
  const selfSubjectAccessReviewObject: V1SubjectAccessReview = {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectAccessReview',
    spec: { resourceAttributes },
  };
  return fastify.kube.authorization.createSubjectAccessReview(selfSubjectAccessReviewObject);
};

const checkAdminPermission = (
  fastify: KubeFastifyInstance,
  request: OauthFastifyRequest,
  username: string,
): Promise<V1SubjectAccessReview | K8sStatus> => {
  const config = getDashboardConfig();
  return createSelfSubjectAccessReview(fastify, request, {
    group: config.apiVersion.split('/')[0],
    resource: 'OdhDashboardConfigs',
    subresource: '',
    verb: 'update',
    name: config.metadata.name,
    namespace: config.metadata.namespace,
    
  });
};
