import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if tug name validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'tugName',
    {
      validationErrors: [
        { id: 'tugName', msg: 'dummy' },
        { id: 'tugName-0', msg: 'dummy' },
      ],
      setValidationErrors: (validationErrors: ValidationType[]) => {
        validationErrors.forEach((e) => errors.push(e));
      },
      reservedIds: [],
    },
    'fi',
    0,
    0
  );

  //This is clearly a mistake in the reducer but during refactoring will not remove it
  expect(errors.length).toBeGreaterThan(2);
  expect(errors[1].id).toEqual('tugName');
  expect(errors[1].msg).toEqual(ErrorMessageKeys.required);
  expect(errors[3].id).toEqual('tugName-0');
  expect(errors[3].msg).toEqual(ErrorMessageKeys.required);
});

test('if tug validates correctly', () => {
  const testState = getTestState();
  testState.trafficService?.tugs?.push({
    name: { fi: 'vtsname2fi', sv: 'vtsname2sv', en: 'vtsname2en' },
  });
  testState.trafficService?.tugs?.push({
    name: { fi: 'vtsname3fi', sv: 'vtsname3sv', en: 'vtsname3en' },
  });
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'tug',
    {
      validationErrors: [
        { id: 'tugName-0', msg: 'dummy' },
        { id: 'tugName-1', msg: 'dummy' },
        { id: 'tugName-2', msg: 'dummy' },
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
  expect(errors[0].id).toEqual('tugName-0');
  expect(errors[1].id).toEqual('tugName-1');
});
