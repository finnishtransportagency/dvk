import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

beforeAll(() => {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      controller: jest.fn().mockImplementation(() => Promise.resolve()),
      addEventListener: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  });
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => new Promise(() => {}), on: () => {} } }),
}));

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

test('if sidePane elements are present and working', () => {
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

    // searchInput
    const searchInput = screen.getByTestId('searchInput');
    expect(searchInput).toBeInTheDocument();
    expect((searchInput as HTMLIonInputElement).value).toBe('');
    fireEvent.click(searchInput);
    fireEvent.focus(searchInput);
    fireEvent.ionChange(searchInput, 'naantali');
    //fireEvent.change(searchInput, { target: { value: 'naantali' } });
    //expect((searchInput as HTMLIonInputElement).value).toBe('naantali');
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    fireEvent.keyDown(searchInput, { key: 'Tab' });

    // clearInput
    const clearInput = screen.getByTestId('clearInput');
    expect(clearInput).toBeInTheDocument();
    fireEvent.click(clearInput);
    expect((searchInput as HTMLIonInputElement).value).toBe('');

    // togglePane
    const togglePane = screen.getByTestId('togglePane');
    expect(togglePane).toBeInTheDocument();
    const listPane = screen.getByTestId('listPane');
    expect(listPane).toBeInTheDocument();
    fireEvent.click(togglePane);
    //expect(listPane.className).toBe('wide');
  });
});
