import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { mockFairwayCard, mockFairwayList } from '../__tests__/mockData';

beforeAll(() => {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      controller: jest.fn().mockImplementation(() => Promise.resolve()),
      addEventListener: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  });
  jest.spyOn(window, 'print').mockImplementation(() => {});
});

beforeEach(() => {
  jest.resetAllMocks();
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => new Promise(() => {}), on: () => {} } }),
}));

jest.mock('./components/FeatureLoader', () => ({
  InitFeatures: () => {},
}));

jest.mock('./graphql/generated', () => {
  const originalModule = jest.requireActual('./graphql/generated');
  return {
    __esModule: true,
    ...originalModule,
    useFindAllFairwayCardsQuery: () => {
      return {
        data: mockFairwayList,
        loading: false,
      };
    },
    useFindFairwayCardByIdQuery: () => {
      return {
        data: mockFairwayCard,
        loading: false,
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
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortit/' } = {}) => {
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
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortit/vuosaari/' } = {}) => {
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
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortit/' } = {}) => {
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
  });
});

test('if sidebarMenu elements are present and working', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortit/' } = {}) => {
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
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortit/vuosaari/' } = {}) => {
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

    // toggleWide
    const toggleWide = screen.getByTestId('toggleWide');
    expect(toggleWide).toBeInTheDocument();
    const cardPane = screen.getByTestId('cardPane');
    expect(cardPane).toBeInTheDocument();
    fireEvent.click(toggleWide);

    // tabChange
    const tabChange = screen.getByTestId('tabChange');
    expect(tabChange).toBeInTheDocument();
    fireEvent.ionChange(tabChange, '2');

    // togglePane
    const togglePane = screen.getByTestId('togglePane');
    expect(togglePane).toBeInTheDocument();
    fireEvent.click(togglePane);
  });
});

it('should change to third tab successfully', () => {
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortit/vuosaari/' } = {}) => {
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
  const renderWithRouter = (ui: JSX.Element, { route = '/vaylakortit/vuosaari/' } = {}) => {
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
