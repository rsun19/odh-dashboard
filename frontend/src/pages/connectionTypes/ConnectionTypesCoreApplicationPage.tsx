import * as React from 'react';
import ApplicationsPage from '~/pages/ApplicationsPage';

export type ConnectionTypesCoreApplicationPageProps = {
  children: React.ReactNode;
};

const ConnectionTypesCoreApplicationPage: React.FC<ConnectionTypesCoreApplicationPageProps> = ({
  children,
  ...pageProps
}) => (
  <ApplicationsPage loaded empty={false} {...pageProps}>
    {children}
  </ApplicationsPage>
);

export default ConnectionTypesCoreApplicationPage;
