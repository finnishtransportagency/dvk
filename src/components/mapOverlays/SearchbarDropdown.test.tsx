import React from 'react';
import { act, render, screen } from '@testing-library/react';
import SearchbarDropdown from './SearchbarDropdown';
import { mockFairwayList } from '../../utils/common.test';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => new Promise(() => {}), on: () => {} } }),
}));

test('dropdown should contain all options', () => {
  const { baseElement } = render(
    <SearchbarDropdown isOpen={true} searchQuery="väylä" fairwayCards={mockFairwayList.fairwayCards || []} selected={1} />
  );
  expect(baseElement).toBeDefined();

  act(() => {
    const cardOptions = screen.queryAllByTestId('cardOption');
    expect(cardOptions.length).toEqual(mockFairwayList.fairwayCards.length);
  });
});

test('dropdown should contain no options', () => {
  const { baseElement } = render(<SearchbarDropdown isOpen={true} searchQuery="testi" fairwayCards={[]} />);
  expect(baseElement).toBeDefined();

  act(() => {
    const cardOptions = screen.queryAllByTestId('cardOption');
    expect(cardOptions.length).toEqual(0);
  });
});
