export const logout = (): Promise<unknown> =>
  /* eslint-disable-next-line no-console */
  fetch('/oauth/sign_out').catch((err: unknown) => console.error('Error logging out', err));
