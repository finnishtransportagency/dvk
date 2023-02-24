import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.resetAllMocks();
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => new Promise(() => {}), on: () => {} } }),
}));

jest.mock('./graphql/api', () => ({
  useCurrentUserQueryData: () => {
    return { data: { currentUser: { name: 'James' } }, dataUpdatedAt: Date.now(), errorUpdatedAt: 0, isPaused: true, isError: false };
  },
}));

test('renders Hello James', () => {
  render(<App />);
  const linkElement = screen.getByText(/James/i);
  expect(linkElement).toBeInTheDocument();
});
