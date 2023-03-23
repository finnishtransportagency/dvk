import { OperationError, TextInput } from '../graphql/generated';
import { mapText, mapMandatoryText, mapNumber, mapString, mapStringArray } from '../lib/lambda/db/modelMapper';

test('test mapText', () => {
  expect(mapText()).toBe(null);
  expect(mapText(null)).toBe(null);
  expect(mapText({} as TextInput)).toBe(null);
  expect(mapText({ fi: '', sv: '', en: '' })).toBe(null);
  expect(() => mapText({ fi: 'x', sv: '', en: '' })).toThrow(OperationError.InvalidInput);
  expect(() => mapText({ fi: '', sv: 'y', en: '' })).toThrow(OperationError.InvalidInput);
  expect(() => mapText({ fi: '', sv: '', en: 'z' })).toThrow(OperationError.InvalidInput);
  expect(() => mapText({ fi: 'x', sv: 'y', en: '' })).toThrow(OperationError.InvalidInput);
  expect(() => mapText({ fi: 'x', sv: '', en: 'z' })).toThrow(OperationError.InvalidInput);
  expect(() => mapText({ fi: '', sv: 'y', en: 'z' })).toThrow(OperationError.InvalidInput);
  expect(mapText({ fi: 'x', sv: 'y', en: 'z' })).not.toBe(null);
  const text = { fi: 'x', sv: 'y', en: 'z' };
  expect(mapText(text)).not.toBe(text);
});

test('test mapMandatoryText', () => {
  expect(() => mapMandatoryText(undefined as unknown as TextInput)).toThrow(OperationError.InvalidInput);
  expect(() => mapMandatoryText(null as unknown as TextInput)).toThrow(OperationError.InvalidInput);
  expect(() => mapMandatoryText({} as TextInput)).toThrow(OperationError.InvalidInput);
  expect(() => mapMandatoryText({ fi: '', sv: '', en: '' })).toThrow(OperationError.InvalidInput);
  const text = { fi: 'x', sv: 'y', en: 'z' };
  expect(mapMandatoryText(text)).not.toBe(text);
});

test('test mapNumber', () => {
  expect(mapNumber(undefined as unknown as number)).toBe(null);
  expect(mapNumber(null as unknown as number)).toBe(null);
  expect(mapNumber(0)).toBe(0);
  expect(mapNumber(1)).toBe(1);
  expect(mapNumber(-1)).toBe(-1);
});

test('test mapString', () => {
  expect(mapString(undefined as unknown as string)).toBe(null);
  expect(mapString(null as unknown as string)).toBe(null);
  expect(mapString('')).toBe(null);
  expect(mapString(' ')).toBe(' ');
  expect(mapString('x')).toBe('x');
});

test('test mapStringArray', () => {
  expect(mapStringArray(undefined as unknown as string[])).toBe(null);
  expect(mapStringArray(null as unknown as string[])).toBe(null);
  let text = [''];
  expect(mapStringArray(text)).toHaveLength(0);
  text = ['x'];
  expect(mapStringArray(text)).toHaveLength(1);
  text = ['x', ''];
  expect(mapStringArray(text)).toHaveLength(1);
  expect(mapStringArray(text)).toMatchObject(['x']);
  let text2 = ['x', null] as unknown;
  expect(mapStringArray(text2 as string[])).toHaveLength(1);
  expect(mapStringArray(text2 as string[])).toMatchObject(['x']);
  text2 = ['x', undefined];
  expect(mapStringArray(text2 as string[])).toHaveLength(1);
  expect(mapStringArray(text2 as string[])).toMatchObject(['x']);
  const text3 = ['x', ' '];
  expect(mapStringArray(text3)).toHaveLength(2);
  expect(mapStringArray(text3)).toMatchObject(['x', ' ']);
});
