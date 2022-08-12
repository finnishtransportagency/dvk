// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { SquatReducer, initialState } from './hooks/squatReducer';

beforeAll(() => {
  window.SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
  });
});

afterAll(() => {
  delete window.SVGElement.prototype.getBBox;
});

test('renders without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});

it('reducer returns new state after update action', () => {
  const state = SquatReducer(initialState, { type: 'reset' });
  expect(state.vessel.stability.GM).toEqual(0);
  const updateAction = { type: 'vessel-stability', payload: { key: 'GM', value: 2 } };
  const updatedState = SquatReducer(initialState, updateAction);
  expect(updatedState.vessel.stability.GM).toEqual(2);
});

it('all reducer actions are working', () => {
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
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  SquatReducer(state, { type: 'unknown', payload: { key: 'unknown', value: true } });
  expect(consoleSpy).toHaveBeenCalledWith('Unknown action type, state not updated.');
});
