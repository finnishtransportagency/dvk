import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if squat calculation place validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'squatCalculationPlace',
    {
      validationErrors: [{ id: 'squatCalculationPlace-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatCalculationPlace-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if squat calculation validates correctly', () => {
  const testState = getTestState();
  testState.trafficService?.tugs?.push({
    name: { fi: 'squatplace2fi', sv: 'squatplace2sv', en: 'squatplace2en' },
  });
  testState.trafficService?.tugs?.push({
    name: { fi: 'squatplace3fi', sv: 'squatplace3sv', en: 'squatplace3en' },
  });
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'squatCalculations',
    {
      validationErrors: [
        { id: 'squatCalculations-0', msg: 'dummy' },
        { id: 'squatCalculations-1', msg: 'dummy' },
        { id: 'squatCalculations-2', msg: 'dummy' },
      ],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    1,
    0
  );
  expect(errors).toHaveLength(2);
  expect(errors[0].id).toEqual('squatCalculations-0');
  expect(errors[1].id).toEqual('squatCalculations-1');
});

test('if squat fairway id list validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    [],
    'squatTargetFairwayIds',
    {
      validationErrors: [{ id: 'squatTargetFairwayIds-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatTargetFairwayIds-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if squat suitable area id list validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    [],
    'squatSuitableFairwayAreaIds',
    {
      validationErrors: [{ id: 'squatSuitableFairwayAreaIds-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatSuitableFairwayAreaIds-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if squat estimated water depth validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'squatCalculationEstimatedWaterDepth',
    {
      validationErrors: [{ id: 'squatCalculationEstimatedWaterDepth-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatCalculationEstimatedWaterDepth-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if squat fairway form validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'squatCalculationFairwayForm',
    {
      validationErrors: [{ id: 'squatCalculationFairwayForm-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatCalculationFairwayForm-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if squat fairway width validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'squatCalculationFairwayWidth',
    {
      validationErrors: [{ id: 'squatCalculationFairwayWidth-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatCalculationFairwayWidth-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if squat slope scale validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'squatCalculationSlopeScale',
    {
      validationErrors: [{ id: 'squatCalculationSlopeScale-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatCalculationSlopeScale-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if squat slope height validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'squatCalculationSlopeHeight',
    {
      validationErrors: [{ id: 'squatCalculationSlopeHeight-0', msg: 'dummy' }],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  expect(errors).toHaveLength(1);
  expect(errors[0].id).toEqual('squatCalculationSlopeHeight-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});
