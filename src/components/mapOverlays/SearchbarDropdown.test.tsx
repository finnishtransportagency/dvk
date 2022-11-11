import React from 'react';
import { act, render, screen } from '@testing-library/react';
import SearchbarDropdown from './SearchbarDropdown';

const fairwayList = {
  fairwayCards: [
    { id: 'hanko', name: { fi: 'Hangon meriväylä', sv: 'Hangö havsfarled', en: 'Hanko channel' }, modificationTimestamp: 1667808284, group: '1' },
    {
      id: 'uusikaupunki',
      name: { fi: 'Uudenkaupungin väylä', sv: '[sv] Uudenkaupungin väylä', en: 'Uusikaupunki channel' },
      modificationTimestamp: 1667808285,
      group: '1',
    },
    { id: 'saimaa', name: { fi: 'Saimaan väylä', sv: 'Saimaan väylä', en: 'Saimaan väylä' }, modificationTimestamp: 1667808285, group: null },
    {
      id: 'helsinki',
      name: { fi: 'Helsingin väylä', sv: 'Helsingforsleden', en: 'Helsinki channel' },
      modificationTimestamp: 1667808284,
      group: '2',
    },
    {
      id: 'utohanko',
      name: { fi: 'Utö-Hanko väylä', sv: 'Farleden Utö-Hangö', en: 'Utö-Hanko channel' },
      modificationTimestamp: 1667808284,
      group: '1',
    },
    { id: 'kemi', name: { fi: 'Kemin väylä', sv: '[sv] Kemin väylä', en: 'Kemi Ajos fairway' }, modificationTimestamp: 1667808284, group: '3' },
    {
      id: 'naantali',
      name: { fi: 'Naantalin väylä', sv: 'Farleden Nådendal', en: 'Naantali channel' },
      modificationTimestamp: 1667808285,
      group: '1',
    },
    { id: 'vuosaari', name: { fi: 'Vuosaaren väylä', sv: 'Nordsjöleden', en: 'Vuosaari channel' }, modificationTimestamp: 1667808285, group: '2' },
  ],
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: () => new Promise(() => {}), on: () => {} } }),
}));

test('dropdown should contain all options', () => {
  const { baseElement } = render(<SearchbarDropdown isOpen={true} searchQuery="väylä" fairwayCards={fairwayList.fairwayCards || []} selected={1} />);
  expect(baseElement).toBeDefined();

  act(() => {
    const cardOptions = screen.queryAllByTestId('cardOption');
    expect(cardOptions.length).toEqual(fairwayList.fairwayCards.length);
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
