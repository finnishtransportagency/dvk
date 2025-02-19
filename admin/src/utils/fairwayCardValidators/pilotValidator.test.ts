import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if pilot extra info validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'pilotExtraInfo',
    {
      validationErrors: [{ id: 'pilotExtraInfo', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('pilotExtraInfo');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});
