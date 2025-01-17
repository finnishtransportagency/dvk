/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { SquatReducer, initialState, Action, getFieldValue, fieldParams, getBooleanFieldValue } from './hooks/squatReducer';
import { copyToClipboard, countDecimals, createShareableLink } from './utils/helpers';
import { vi } from 'vitest';

const baseURL = 'http://localhost:8080/';
const fetch = global.fetch;

beforeAll(() => {
  // @ts-ignore
  window.SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
  });

  const location = {
    ...window.location,
    search: '?baseURL=' + baseURL + '&profileSelected=9&GM=0&fairwayForm=-2&channelWidth=10.1&showBarrass=true&showLanguages=true',
  };
  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  });

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    },
  });
  // @ts-ignore
  global.fetch = undefined;
});

afterAll(() => {
  // @ts-ignore
  delete window.SVGElement.prototype.getBBox;
  global.fetch = fetch;
});

vi.useFakeTimers();

it('renders without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});

test('reducer returns new state after update action', () => {
  const state = SquatReducer(initialState, { type: 'reset' });
  expect(state.vessel.stability.GM).toEqual(0.15);
  const updateAction = { type: 'vessel-stability', payload: { key: 'GM', value: 2 } } as Action;
  const updatedState = SquatReducer(initialState, updateAction);
  expect(updatedState.vessel.stability.GM).toEqual(2);
});

test('all reducer actions are working', () => {
  // Use all action types to update state
  let state = SquatReducer(initialState, { type: 'reset' });
  state = SquatReducer(state, {
    type: 'vessel-select',
    payload: { key: 'vesselSelected', value: { id: 2, name: 'My Yacht', lengthBPP: 2, breadth: 2, depth: 2 }, elType: 'ion-select' },
  });
  state = SquatReducer(state, { type: 'vessel-general', payload: { key: 'lengthBPP', value: 200 } });
  state = SquatReducer(state, { type: 'vessel-detailed', payload: { key: 'bowThruster', value: 2000 } });
  state = SquatReducer(state, { type: 'vessel-stability', payload: { key: 'KG', value: 2 } });
  state = SquatReducer(state, { type: 'environment-weather', payload: { key: 'windSpeed', value: 20 } });
  state = SquatReducer(state, { type: 'environment-fairway', payload: { key: 'sweptDepth', value: 20 } });
  state = SquatReducer(state, { type: 'environment-vessel', payload: { key: 'vesselSpeed', value: 20 } });
  state = SquatReducer(state, { type: 'environment-attribute', payload: { key: 'airDensity', value: 1 } });
  state = SquatReducer(state, {
    type: 'calculations',
    payload: {
      key: 'forces',
      value: {
        relativeWindDirection: 0.2,
        relativeWindSpeed: 0.1,
        windForce: 20,
        waveForce: 40,
        bowThrusterForce: 50,
        remainingSafetyMargin: 20,
        externalForceRequired: 0,
        estimatedDriftAngle: 0.01,
        estimatedBreadth: 20.1,
      },
      elType: 'object',
    },
  });
  state = SquatReducer(state, { type: 'status', payload: { key: 'showBarrass', value: true, elType: 'boolean' } });
  state = SquatReducer(state, {
    type: 'validation',
    payload: {
      key: 'lengthBPP',
      value: true,
      elType: 'boolean',
    },
  });

  // Confirm changes made to state
  expect(state.vessel.vesselSelected?.lengthBPP).toEqual(2);
  expect(state.vessel.general.lengthBPP).toEqual(200);
  expect(state.vessel.detailed.bowThruster).toEqual(2000);
  expect(state.vessel.stability.KG).toEqual(2);
  expect(state.environment.weather.windSpeed).toEqual(20);
  expect(state.environment.fairway.sweptDepth).toEqual(20);
  expect(state.environment.vessel.vesselSpeed).toEqual(20);
  expect(state.environment.attribute.airDensity).toEqual(1);
  expect(state.calculations.forces.bowThrusterForce).toEqual(50);
  expect(state.status.showBarrass).toEqual(true);
  expect(state.validations.lengthBPP).toEqual(true);

  // Test also unknown action type
  const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
    return null;
  });
  // @ts-ignore
  SquatReducer(state, { type: 'unknown', payload: { key: 'unknown', value: true } });
  expect(consoleSpy).toHaveBeenCalledWith('Unknown action type, state not updated.');
});

test('fallthrough reducer action', () => {
  const updateAction = { type: 'vessel-stability', payload: { key: 'GM', value: 2, fallThrough: true } } as Action;
  const updatedState = SquatReducer(initialState, updateAction);
  expect(updatedState.vessel.stability.GM).toEqual(0.15);
});

it('creates shareable link correctly', () => {
  const updateAction = { type: 'vessel-stability', payload: { key: 'GM', value: 2 } } as Action;
  const updatedState = SquatReducer(initialState, updateAction);

  const shareableLink = createShareableLink(updatedState, true);
  expect(shareableLink).toBe(baseURL + '?GM=2');
});

test('setting default value under minimum or above maximum is swallowed when forced', () => {
  expect(getFieldValue('profileSelected', true)).toEqual(3);
  expect(getFieldValue('fairwayForm', true)).toEqual(0);
  expect(getFieldValue('GM')).toEqual(0);
  expect(getFieldValue('channelWidth')).toEqual(10.1);
  expect(getBooleanFieldValue('showBarrass', false)).toEqual(true);
});

it('counts decimals correctly for values', () => {
  expect(countDecimals(getFieldValue('channelWidth'))).toEqual(1);
  expect(countDecimals(Number(fieldParams.channelWidth.step))).toEqual(0);
  expect(countDecimals(1.123456789)).toBe(9);
  expect(countDecimals(0.00000000000027)).toBe(13);
  expect(countDecimals(NaN)).toBe(0);
});

it('should call clipboard.writeText', () => {
  vi.spyOn(navigator.clipboard, 'writeText');

  copyToClipboard('copyTextToClipboard');

  expect(navigator.clipboard.writeText).toBeCalledTimes(1);
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copyTextToClipboard');
});
