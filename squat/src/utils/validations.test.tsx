// @ts-nocheck
import React from 'react';
import {
  isTugUseRecommended,
  isThrusterUnableToLiftBow,
  isReliabilityAnIssue,
  isUKCUnderMinimum,
  isSafetyMarginInsufficient,
  isExternalForceRequired,
  isUKCShipMotionsUnderRequired,
  isUKCStraightUnderRequired,
  isUKCDuringTurnUnderRequired,
} from './validations';

test('checks if tug use is recommended', () => {
  expect(isTugUseRecommended(20, 30)).toBeTruthy();
});

test('checks if thruster is unable to lift bow', () => {
  expect(isThrusterUnableToLiftBow(200, 500, 30, 15, 15)).toBeTruthy();
});

test('checks if reliability is an issue', () => {
  expect(isReliabilityAnIssue(0.75, 20, 18, 0)).toBeTruthy();
  expect(isReliabilityAnIssue(0.55, 10, 18, 0)).toBeTruthy();
  expect(isReliabilityAnIssue(0.85, 10, 18, 0)).toBeTruthy();
});

test('checks if UKC is under minimum', () => {
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [0.8, 0.8],
      [0.8, 0.8],
      [
        [0.8, 0.8],
        [0.8, 0.8],
      ],
      false
    )
  ).toBeTruthy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [0.8, 0.8],
      [0.8, 0.8],
      [
        [0.8, 0.8],
        [0.8, 0.8],
      ],
      true
    )
  ).toBeTruthy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [1, 1],
      [1, 1],
      [
        [1, 1],
        [1, 1],
      ],
      false
    )
  ).toBeFalsy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [1, 1],
      [1, 1],
      [
        [1, 1],
        [1, 1],
      ],
      true
    )
  ).toBeFalsy();
});

test('checks if safety margin is insufficient', () => {
  expect(isSafetyMarginInsufficient(500, 3)).toBeTruthy();
});

test('checks if external force is required', () => {
  expect(isExternalForceRequired(10)).toBeTruthy();
});

test('checks if UKC ship motions are under required', () => {
  expect(
    isUKCShipMotionsUnderRequired(
      1,
      [
        [0.8, 0.8],
        [0.8, 0.8],
      ],
      false
    )
  ).toBeTruthy();
  expect(
    isUKCShipMotionsUnderRequired(
      1,
      [
        [0.8, 0.8],
        [0.8, 0.8],
      ],
      true
    )
  ).toBeTruthy();
});

test('checks if UKC straight course is under required', () => {
  expect(isUKCStraightUnderRequired(1, [0.8, 0.8], false)).toBeTruthy();
  expect(isUKCStraightUnderRequired(1, [0.8, 0.8], true)).toBeTruthy();
});

test('checks if UKC during turn is under required', () => {
  expect(isUKCDuringTurnUnderRequired(1, [0.8, 0.8], false)).toBeTruthy();
  expect(isUKCDuringTurnUnderRequired(1, [0.8, 0.8], true)).toBeTruthy();
});
