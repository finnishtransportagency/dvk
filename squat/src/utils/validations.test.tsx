/* eslint-disable @typescript-eslint/ban-ts-comment */
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
      [1, 1],
      [1, 1],
      [
        [1, 1],
        [0.8, 1],
      ],
      false,
      false
    )
  ).toBeTruthy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [1, 1],
      [1, 1],
      [
        [0.8, 1],
        [1, 1],
      ],
      true,
      false
    )
  ).toBeTruthy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [1, 1],
      [1, 1],
      [
        [1, 0.8],
        [1, 1],
      ],
      true,
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
        [1, 0.8],
      ],
      false,
      true
    )
  ).toBeTruthy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [1, 0.9],
      [1, 1],
      [
        [1, 1],
        [1, 1],
      ],
      false,
      false
    )
  ).toBeTruthy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [1, 1],
      [0.9, 1],
      [
        [1, 1],
        [1, 1],
      ],
      true,
      false
    )
  ).toBeTruthy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [0.8, 1],
      [0.8, 1],
      [
        [1, 1],
        [1, 1],
      ],
      false,
      false
    )
  ).toBeFalsy();
  expect(
    isUKCUnderMinimum(
      18,
      1,
      [1, 0.8],
      [1, 0.8],
      [
        [1, 1],
        [1, 1],
      ],
      true,
      false
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
        [1, 1],
        [0.8, 1],
      ],
      false,
      false
    )
  ).toBeTruthy();
  expect(
    isUKCShipMotionsUnderRequired(
      1,
      [
        [1, 0.9],
        [1.1, 1.2],
      ],
      true,
      true
    )
  ).toBeTruthy();
  expect(
    isUKCShipMotionsUnderRequired(
      1,
      [
        [0.75, 1.1],
        [1.1, 1.1],
      ],
      true,
      false
    )
  ).toBeTruthy();
  expect(
    isUKCShipMotionsUnderRequired(
      1,
      [
        [1.5, 1.5],
        [1, 0.99],
      ],
      false,
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
