import type {
  HrefNavItemExtension,
  RouteExtension,
} from '@odh-dashboard/plugin-core/extension-points';

const extensions: (HrefNavItemExtension | RouteExtension)[] = [
  {
    type: 'app.navigation/href',
    properties: {
      id: 'mlflow-poc',
      title: 'MLflow POC',
      section: 'ai-hub',
      href: '/ai-hub/mlflow',
      path: '/ai-hub/mlflow/*',
    },
  },
  {
    type: 'app.route',
    properties: {
      path: '/ai-hub/mlflow/*',
      component: () => import('../src/GlobalMLflowRoutes'),
    },
  },
];

export default extensions;
