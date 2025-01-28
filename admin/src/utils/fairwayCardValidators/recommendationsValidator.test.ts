import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if wind recommendation validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'windRecommendation',
    {
      validationErrors: [{ id: 'windRecommendation', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('windRecommendation');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if vessel recommendation validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'vesselRecommendation',
    {
      validationErrors: [{ id: 'vesselRecommendation', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('vesselRecommendation');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if visibility validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'visibility',
    {
      validationErrors: [{ id: 'visibility', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('visibility');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});
