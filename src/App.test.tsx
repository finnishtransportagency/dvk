import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { mockFairwayCard, mockFairwayList, mockMarineWarningList, mockSafetyEquipmentFaultList } from '../__tests__/mockData';

class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }

  disconnect() {
    // do nothing
  }
}
global.ResizeObserver = ResizeObserver;

beforeAll(() => {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      controller: jest.fn().mockImplementation(() => Promise.resolve()),
      addEventListener: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  });
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(true);
  jest.spyOn(window, 'print').mockImplementation(() => {});
});

beforeEach(() => {
  jest.resetAllMocks();
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => new Promise(() => {}), on: () => {} } }),
}));

jest.mock('./components/FeatureLoader', () => ({
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
  useSpecialAreaLayer: () => {
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
  useMarineWarningLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useNameLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useSoundingPointLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBoardLine12Layer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 123123123, isPaused: true, isError: true };
  },
  useMareographLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useObservationLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBuoyLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBackgroundFinlandLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBackgroundBalticseaLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBackgroundMmlmeriLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBackgroundMmljarviLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
  },
  useBackgroundMmllaituritLayer: () => {
    return { data: null, dataUpdatedAt: 1672728154989, errorUpdatedAt: 0, isPaused: true, isError: false };
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
}));

jest.mock('./graphql/generated', () => {
  const originalModule = jest.requireActual('./graphql/generated');
  return {
    __esModule: true,
    ...originalModule,
    useFindAllFairwayCardsQuery: () => {
      return {
        data: mockFairwayList,
        isLoading: false,
      };
    },
    useFindFairwayCardByIdQuery: () => {
      return {
        data: mockFairwayCard,
        isLoading: false,
      };
    },
    useFindAllMarineWarningsQuery: () => {
      return {
        data: mockMarineWarningList,
        isLoading: false,
      };
    },
    useFindAllSafetyEquipmentFaultsQuery: () => {
      return {
        data: mockSafetyEquipmentFaultList,
        isLoading: false,
      };
    },
  };
});

jest.useFakeTimers();

it('renders home page without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    const homeMap = screen.getByTestId('homeMap');
    expect(homeMap).toBeInTheDocument();
  });
});

it('should render fairway list without crashing', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/kortit/' } = {}) => {
    window.history.pushState({}, 'Väyläkortit', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    const fairwayList = screen.getByTestId('fairwayList');
    expect(fairwayList).toBeInTheDocument();
  });
});

it('should render fairway card for "vuosaari" without crashing', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/kortit/vuosaari/' } = {}) => {
    window.history.pushState({}, 'Vuosaaren väylä', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    const fairwayCard = screen.getByTestId('fairwayCard');
    expect(fairwayCard).toBeInTheDocument();
  });
});

test('if sidePane header elements are present and working', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/kortit/' } = {}) => {
    window.history.pushState({}, 'Väyläkortit', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    // searchInput
    const searchInput = screen.getByTestId('searchInput');
    expect(searchInput).toBeInTheDocument();
    expect((searchInput as HTMLIonInputElement).value).toBe('');
    fireEvent.click(searchInput);
    fireEvent.focus(searchInput);
    fireEvent.ionChange(searchInput, 'naantali');
    fireEvent.change(searchInput, { target: { value: 'naantali' } });
    fireEvent.ionInput(searchInput, 'naantali');
    expect((searchInput as HTMLIonInputElement).value).toBe('naantali');
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    fireEvent.ionBlur(searchInput);
    jest.advanceTimersByTime(250);

    // clearInput
    const clearInput = screen.getByTestId('clearInput');
    expect(clearInput).toBeInTheDocument();
    fireEvent.click(clearInput);
    //expect((searchInput as HTMLIonInputElement).value).toBe('');

    // toggleWide
    const toggleWide = screen.getByTestId('toggleWide');
    expect(toggleWide).toBeInTheDocument();
    fireEvent.click(toggleWide);
    const listPane = screen.getByTestId('listPane');
    expect(listPane).toBeInTheDocument();
    jest.advanceTimersByTime(1200);
    //expect(listPane.className).toBe('wide');

    // togglePane
    const togglePane = screen.getByTestId('togglePane');
    expect(togglePane).toBeInTheDocument();
    fireEvent.click(togglePane);
  });
});

test('if sidebarMenu elements are present and working', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/kortit/' } = {}) => {
    window.history.pushState({}, 'Väyläkortit', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    // menuController
    const toggleSidebar = screen.getByTestId('menuController');
    expect(toggleSidebar).toBeInTheDocument();
    fireEvent.click(toggleSidebar);

    // Language changes
    const langFi = screen.getByTestId('langFi');
    expect(langFi).toBeInTheDocument();
    fireEvent.click(langFi);
    const langSv = screen.getByTestId('langSv');
    expect(langSv).toBeInTheDocument();
    fireEvent.click(langSv);
    const langEn = screen.getByTestId('langEn');
    expect(langEn).toBeInTheDocument();
    fireEvent.click(langEn);

    // fairwaysLink
    const fairwaysLink = screen.getByTestId('fairwaysLink');
    expect(fairwaysLink).toBeInTheDocument();
    fireEvent.click(fairwaysLink);
    // squatLink
    const squatLink = screen.getByTestId('squatLink');
    expect(squatLink).toBeInTheDocument();
    fireEvent.click(squatLink);

    // closeMenu
    const closeMenu = screen.getByTestId('closeMenu');
    expect(closeMenu).toBeInTheDocument();
    fireEvent.click(closeMenu);
  });
});

it('should find key elements in fairway card for "vuosaari"', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/kortit/vuosaari/' } = {}) => {
    window.history.pushState({}, 'Vuosaaren väylä', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    // printButton
    const printButton = screen.getByTestId('printButton');
    expect(printButton).toBeInTheDocument();
    fireEvent.click(printButton);

    // cardPane
    const cardPane = screen.getByTestId('cardPane');
    expect(cardPane).toBeInTheDocument();

    // tabChange
    const tabChange = screen.getByTestId('tabChange');
    expect(tabChange).toBeInTheDocument();
    fireEvent.ionChange(tabChange, '2');
  });
});

it('should change to third tab successfully', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/kortit/vuosaari/' } = {}) => {
    window.history.pushState({}, 'Vuosaaren väylä', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    // tabChange
    const tabChange = screen.getByTestId('tabChange');
    expect(tabChange).toBeInTheDocument();
    fireEvent.ionChange(tabChange, '3');
  });
});

it('should trigger map hovers successfully', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/kortit/vuosaari/' } = {}) => {
    window.history.pushState({}, 'Vuosaaren väylä', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    // pilotPlace
    const pilotPlace = screen.getByTestId('pilotPlaceHover');
    expect(pilotPlace).toBeInTheDocument();
    fireEvent.ionFocus(pilotPlace);
    fireEvent.focus(pilotPlace);
    fireEvent.mouseOver(pilotPlace);
    jest.advanceTimersByTime(600);
    fireEvent.ionBlur(pilotPlace);
    fireEvent.blur(pilotPlace);
    fireEvent.mouseOut(pilotPlace);
  });
});

it('should render safety equipment fault page successfully', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/turvalaiteviat/' } = {}) => {
    window.history.pushState({}, 'Turvalaiteviat', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    // Fault list
    const faultList = screen.getByTestId('safetyEquipmentFaultList');
    expect(faultList).toBeInTheDocument();
  });
});

it('should render marine warning page successfully', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortti/merivaroitukset/' } = {}) => {
    window.history.pushState({}, 'Merivaroitukset', route);
    return render(ui, { wrapper: BrowserRouter });
  };
  const { baseElement } = renderWithRouter(<App />);
  expect(baseElement).toBeDefined();

  act(() => {
    // Warning list
    const warningList = screen.getByTestId('marineWarningList');
    expect(warningList).toBeInTheDocument();
  });
});
