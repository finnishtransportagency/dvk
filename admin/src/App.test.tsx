import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => new Promise(() => {}), on: () => {} } }),
}));

vi.mock('./components/map/FeatureLoader', () => ({
  useLine12Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useLine3456Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useArea12Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useArea3456Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useDepth12Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  usePilotLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useSpeedLimitLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useHarborLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useSafetyEquipmentLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBoardLine12Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 123123123, isPaused: true, isError: true };
  },
  useVtsLineLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useVtsPointLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useCircleLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useSpecialArea2Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useSpecialArea15Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useInitStaticDataLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useStaticDataLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
}));

vi.mock('./graphql/api', () => ({
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
            version: 'v1',
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
            version: 'v1',
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
            version: 'v1',
          },
        ],
      },
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      isPaused: false,
      isError: false,
    };
  },
  useFairwayCardsAndHarborsVersionsQueryData: () => {
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
            version: 'v1',
          },
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
            version: 'v2',
          },
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
            version: 'v3',
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
            version: 'v1',
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
            version: 'v2',
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
