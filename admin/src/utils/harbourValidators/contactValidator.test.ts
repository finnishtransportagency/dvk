import { ErrorMessageKeys, ValidationType } from '../constants';
import { harbourReducer } from '../harbourReducer';
import { getTestState } from '../harbourReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if latitude validates correctly', () => {
  const errors: ValidationType[] = [];
  harbourReducer(
    getTestState(),
    '',
    'lat',
    {
      validationErrors: [{ id: 'lat', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('lat');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if longitude validates correctly', () => {
  const errors: ValidationType[] = [];
  harbourReducer(
    getTestState(),
    '',
    'lon',
    {
      validationErrors: [{ id: 'lon', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('lon');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if company name validates correctly', () => {
  const testState = getTestState();
  testState.company = { en: '', fi: 'fi', sv: 'sv' };
  const errors: ValidationType[] = [];
  harbourReducer(
    testState,
    '',
    'companyName',
    {
      validationErrors: [{ id: 'companyName', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('companyName');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});
