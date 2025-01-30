import { ErrorMessageKeys, ValidationType } from '../constants';
import { fairwayCardReducer } from '../fairwayCardReducer';
import { getTestState } from '../fairwayCardReducer.test';

vi.mock('i18next', () => ({
  useTranslation: (s: string) => s,
  Trans: (s: string) => s,
  t: (s: string) => s,
}));

test('if vhf name validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'vhfName',
    {
      validationErrors: [{ id: 'vhfName-0-0', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('vhfName-0-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if vhf channel validates correctly', () => {
  const testState = getTestState();
  const errors: ValidationType[] = [];
  fairwayCardReducer(
    testState,
    '',
    'vhfChannel',
    {
      validationErrors: [{ id: 'vhfChannel-0-0', msg: 'dummy' }],
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
  expect(errors[0].id).toEqual('vhfChannel-0-0');
  expect(errors[0].msg).toEqual(ErrorMessageKeys.required);
});

test('if vhf validates correctly', () => {
  const testState = getTestState();

  if (testState.trafficService?.vts && testState.trafficService?.vts.length > 0 && testState.trafficService?.vts[0]) {
    testState.trafficService.vts[0].vhf?.push({
      name: { fi: 'vhfname2fi', sv: 'vhfname2sv', en: 'vhfname2en' },
      channel: 'vhfchannel2',
    });
    testState.trafficService.vts[0].vhf?.push({
      name: { fi: 'vhfname3fi', sv: 'vhfname3sv', en: 'vhfname3en' },
      channel: 'vhfchannel3',
    });
    const errors: ValidationType[] = [];
    fairwayCardReducer(
      testState,
      '',
      'vhf',
      {
        validationErrors: [
          { id: 'vhfName-0-0', msg: 'dummy' },
          { id: 'vhfName-0-1', msg: 'dummy' },
          { id: 'vhfName-0-2', msg: 'dummy' },
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
    expect(errors[0].id).toEqual('vhfName-0-0');
    expect(errors[1].id).toEqual('vhfName-0-1');
  }
});
