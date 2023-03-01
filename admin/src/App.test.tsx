import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

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
  useFairwayCardsAndHarborsQueryData: () => {
    return {
      data: {
        fairwayCardsAndHarbors: [
          {
            creator: 'James',
            fairwayIds: [1, 2],
            group: '3',
            id: 'kaskinen',
            modificationTimestamp: 1675238700000,
            modifier: 'Potkukelkka',
            n2000HeightSystem: false,
            name: { fi: 'Kaskisten väylä', sv: 'Kasköleden', en: 'Kaskinen channel' },
            status: 'PUBLIC',
            type: 'CARD',
          },
          {
            creator: 'James',
            fairwayIds: [3],
            group: '2',
            id: 'hanko',
            modificationTimestamp: 1675238700000,
            modifier: 'Potkukelkka',
            n2000HeightSystem: true,
            name: { fi: 'Hangon meriväylä', sv: 'Hangö havsfarled', en: 'Hanko channel' },
            status: 'PUBLIC',
            type: 'CARD',
          },
          {
            creator: 'James',
            fairwayIds: null,
            group: null,
            id: 'hamina',
            modificationTimestamp: 1675238700000,
            modifier: null,
            n2000HeightSystem: false,
            name: { fi: 'HaminaKotka Satama Oy', sv: 'Fredrikshamn-Kotka hamn', en: 'Port of HaminaKotka' },
            status: 'PUBLIC',
            type: 'HARBOR',
          },
        ],
      },
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      isPaused: false,
      isError: false,
    };
  },
}));

it('renders main admin page without crashing', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/yllapito/' } = {}) => {
    window.history.pushState({}, 'mainPage', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    const mainPage = screen.getByTestId('mainPageContent');
    expect(mainPage).toBeInTheDocument();
  });
});

it('renders James as current user', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/yllapito/' } = {}) => {
    window.history.pushState({}, 'mainPage', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  renderWithRouter(<App />);

  act(() => {
    const currentUser = screen.getByTestId('currentUser');
    expect(currentUser).toBeInTheDocument();
    expect(currentUser.innerHTML).toEqual('James');
  });
});

it('triggers logout function', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/yllapito/' } = {}) => {
    window.history.pushState({}, 'mainPage', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  renderWithRouter(<App />);

  act(() => {
    // Logout button
    const logoutButton = screen.getByTestId('logoutButton');
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
  });
});
