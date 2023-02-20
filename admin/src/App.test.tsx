import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.resetAllMocks();
});

jest.mock('./graphql/api', () => ({
  useCurrentUserQueryData: () => {
    return { data: { currentUser: { name: 'James' } }, dataUpdatedAt: Date.now(), errorUpdatedAt: 0, isPaused: true, isError: false };
  },
}));

test('renders Hello James', () => {
  render(<App />);
  const linkElement = screen.getByText(/Hello James/i);
  expect(linkElement).toBeInTheDocument();
});
