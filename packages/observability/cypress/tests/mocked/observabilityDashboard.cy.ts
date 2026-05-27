import type { DashboardResource } from '@perses-dev/core';
import { mockDashboardConfig, mockStatus } from '@odh-dashboard/internal/__mocks__';
import { mockSelfSubjectAccessReview } from '@odh-dashboard/internal/__mocks__/mockSelfSubjectAccessReview';
import { SelfSubjectAccessReviewModel } from '@odh-dashboard/internal/api/models';
import { observabilityDashboardPage } from '../../pages/observabilityDashboard';

// Minimal test fixtures following the naming pattern from packages/observability/setup
// Dashboard names: dashboard-{N}-{name} for regular, dashboard-{N}-{name}-admin for admin-only
const createMockPersesDashboard = (name: string, displayName: string): DashboardResource => {
  const dashboard: DashboardResource = {
    kind: 'Dashboard',
    metadata: { name, project: 'opendatahub' },
    spec: {
      display: { name: displayName },
      duration: '1h',
      variables: [],
      panels: {},
      layouts: [],
    },
  };
  return dashboard;
};

const mockAdminDashboard = createMockPersesDashboard('dashboard-0-cluster-admin', 'Cluster');
const mockNonAdminDashboard = createMockPersesDashboard('dashboard-1-model', 'Model');

type InitInterceptsOptions = {
  dashboards?: DashboardResource[];
  hasClusterMetricsAccess?: boolean;
};

const initIntercepts = ({
  dashboards = [],
  hasClusterMetricsAccess = true,
}: InitInterceptsOptions = {}) => {
  cy.interceptOdh('GET /api/config', mockDashboardConfig({ observabilityDashboard: true }));

  cy.interceptOdh('GET /api/status', mockStatus({ isAllowed: true, isAdmin: true }));

  cy.interceptK8s(
    'POST',
    SelfSubjectAccessReviewModel,
    mockSelfSubjectAccessReview({
      verb: 'get',
      group: 'monitoring.coreos.com',
      resource: 'prometheuses',
      namespace: 'openshift-monitoring',
      allowed: hasClusterMetricsAccess,
    }),
  );

  // Mock the global Perses dashboards API endpoint
  cy.intercept('GET', '/perses/api/api/v1/dashboards', {
    statusCode: 200,
    body: dashboards,
  }).as('getPersesDashboards');
};

describe('Observability Dashboard', () => {
  it('should show empty state when no dashboards exist', () => {
    initIntercepts({ dashboards: [], hasClusterMetricsAccess: true });

    observabilityDashboardPage.visit();

    cy.wait('@getPersesDashboards');

    observabilityDashboardPage.shouldHaveEmptyState();
  });

  it('should show both admin and non-admin dashboard tabs when user has cluster metrics access', () => {
    initIntercepts({
      dashboards: [mockAdminDashboard, mockNonAdminDashboard],
      hasClusterMetricsAccess: true,
    });

    observabilityDashboardPage.visit();

    // Users with cluster metrics access should see both dashboards
    observabilityDashboardPage.shouldHaveTab('Cluster');
    observabilityDashboardPage.shouldHaveTab('Model');
    observabilityDashboardPage.shouldHaveTabCount(2);
  });

  it('should show empty state when user lacks cluster metrics access', () => {
    initIntercepts({
      dashboards: [mockAdminDashboard, mockNonAdminDashboard],
      hasClusterMetricsAccess: false,
    });

    observabilityDashboardPage.visit();

    cy.wait('@getPersesDashboards');

    // Both dashboards require cluster metrics access, so user sees empty state
    observabilityDashboardPage.shouldHaveEmptyState();
  });
});
