import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if temporary notification start date validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'temporaryNotificationStartDate',
    {
      validationErrors: [{ id: 'temporaryNotificationStartDate-0', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('temporaryNotificationStartDate-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});
test('if temporary notification end date validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '01011900',
    'temporaryNotificationEndDate',
    {
      validationErrors: [{ id: 'temporaryNotificationEndDate-0', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('temporaryNotificationEndDate-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.invalid);
});
