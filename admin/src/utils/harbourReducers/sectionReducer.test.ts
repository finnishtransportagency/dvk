import { ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { testState } from '../harbourReducer.test';

test('if section name updates correctly', () => {
  let newState = harbourReducer(testState, 'modsection1', 'sectionName', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (!newState.quays) {
    fail();
  } else if (!newState.quays[0]?.sections) {
    fail();
  } else {
    expect(newState.quays[0].sections[0]?.name).toBe('modsection1');
  }
});

test('if section depth updates correctly', () => {
  let newState = harbourReducer(testState, '101', 'sectionDepth', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (!newState.quays) {
    fail();
  } else if (!newState.quays[0]?.sections) {
    fail();
  } else {
    expect(newState.quays[0].sections[0]?.depth).toBe('101');
  }
});

test('if section latitude updates correctly', () => {
  let newState = harbourReducer(testState, '21.2', 'sectionLat', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (!newState.quays) {
    fail();
  } else if (!newState.quays[0]?.sections) {
    fail();
  } else {
    expect(newState.quays[0].sections[0]?.geometry?.lat).toBe('21.2');
    expect(newState.quays[0].sections[0]?.geometry?.lon).toBe('60.2');
  }
});

test('if section longitude updates correctly', () => {
  let newState = harbourReducer(testState, '59.2', 'sectionLon', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (!newState.quays) {
    fail();
  } else if (!newState.quays[0]?.sections) {
    fail();
  } else {
    expect(newState.quays[0].sections[0]?.geometry?.lat).toBe('20.2');
    expect(newState.quays[0].sections[0]?.geometry?.lon).toBe('59.2');
  }
});

test('if section list updates correctly', () => {
  let newState = harbourReducer(testState, 'y', 'section', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (newState.quays) {
    expect(newState.quays[0]?.sections?.length).toBe(2);
  } else {
    fail();
  }

  newState = harbourReducer(testState, '', 'section', [], (validationErrors: ValidationType[]) => {}, 'fi', 0, 0, []);
  if (newState.quays) {
    expect(newState.quays[0]?.sections?.length).toBe(0);
  } else {
    fail();
  }
});
