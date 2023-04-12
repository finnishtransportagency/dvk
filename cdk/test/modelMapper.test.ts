import { OperationError, TextInput } from '../graphql/generated';
import { mapText, mapMandatoryText, mapNumber, mapString, mapStringArray, mapGeometry, mapId } from '../lib/lambda/db/modelMapper';

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
  expect(mapNumber(undefined as unknown as string)).toBe(null);
  expect(mapNumber(null as unknown as string)).toBe(null);
  expect(mapNumber('')).toBe(null);
  expect(mapNumber('0')).toBe(0);
  expect(mapNumber('1')).toBe(1);
  expect(mapNumber('-1')).toBe(-1);
  expect(mapNumber('1.1')).toBe(1.1);
  expect(mapNumber('1,1')).toBe(1.1);
  expect(mapNumber('0.123')).toBe(0.123);
  expect(mapNumber('0,123')).toBe(0.123);
  expect(mapNumber('1234567890')).toBe(1234567890);
  expect(() => mapNumber('12345678901')).toThrow(OperationError.InvalidInput);
  expect(mapNumber('123', 3)).toBe(123);
  expect(() => mapNumber('1234', 3)).toThrow(OperationError.InvalidInput);
  expect(() => mapNumber('--1')).toThrow(OperationError.InvalidInput);
  expect(() => mapNumber('1.,1')).toThrow(OperationError.InvalidInput);
  expect(mapNumber(' ')).toBe(null);
  expect(mapNumber(' 1 ')).toBe(1);
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

test('test too long texts', () => {
  expect(mapString('12', 2)).toBe('12');
  expect(() => mapString('123', 2)).toThrow(OperationError.InvalidInput);
  expect(mapStringArray(['12'], 2)).toMatchObject(['12']);
  expect(() => mapStringArray(['123'], 2)).toThrow(OperationError.InvalidInput);
  expect(() => mapStringArray(['12', '123'], 2)).toThrow(OperationError.InvalidInput);
  const text = { fi: 'xy', sv: 'yx', en: 'zx' };
  expect(mapText(text, 2)).not.toBe(text);
  expect(() => mapText({ fi: 'xyz', sv: 'xyz', en: 'xyz' }, 2)).toThrow(OperationError.InvalidInput);
  expect(mapMandatoryText(text, 2)).not.toBe(text);
  expect(() => mapMandatoryText({ fi: 'xyz', sv: 'xyz', en: 'xyz' }, 2)).toThrow(OperationError.InvalidInput);
  let str = '';
  for (let i = 0; i < 2000; i++) {
    str += 'x';
  }
  expect(mapString(str)).toBe(str);
  str += 'x';
  expect(() => mapString(str)).toThrow(OperationError.InvalidInput);
});

test('test mapGeometry', () => {
  expect(mapGeometry(null)).toBe(null);
  expect(mapGeometry()).toBe(null);
  expect(mapGeometry({ lat: '', lon: '' })).toBe(null);
  expect(mapGeometry({ lat: '0', lon: '0' })).toMatchObject({ type: 'Point', coordinates: [0, 0] });
  expect(mapGeometry({ lat: '0', lon: '1' })).toMatchObject({ type: 'Point', coordinates: [1, 0] });
  expect(mapGeometry({ lat: '1', lon: '0' })).toMatchObject({ type: 'Point', coordinates: [0, 1] });
  expect(mapGeometry({ lat: '60.124', lon: '51.221' })).toMatchObject({ type: 'Point', coordinates: [51.221, 60.124] });
  expect(mapGeometry({ lat: '60,124', lon: '51,221' })).toMatchObject({ type: 'Point', coordinates: [51.221, 60.124] });
  expect(mapGeometry({ lat: '60,12345', lon: '51,221' })).toMatchObject({ type: 'Point', coordinates: [51.221, 60.12345] });
  expect(mapGeometry({ lat: '60,12345', lon: '51,12345' })).toMatchObject({ type: 'Point', coordinates: [51.12345, 60.12345] });
  expect(mapGeometry({ lat: '60.124', lon: '51.221' }, 6)).toMatchObject({ type: 'Point', coordinates: [51.221, 60.124] });
  expect(() => mapGeometry({ lat: '60,12345', lon: '51,12345' }, 4)).toThrow(OperationError.InvalidInput);
  expect(() => mapGeometry({ lat: '60,123456', lon: '51,221' })).toThrow(OperationError.InvalidInput);
  expect(() => mapGeometry({ lat: '60,123456', lon: '51,221666' })).toThrow(OperationError.InvalidInput);
});

test('test mapId', () => {
  expect(() => mapId(null)).toThrow(OperationError.InvalidInput);
  expect(() => mapId()).toThrow(OperationError.InvalidInput);
  expect(() => mapId('')).toThrow(OperationError.InvalidInput);
  expect(() => mapId(' ')).toThrow(OperationError.InvalidInput);
  expect(() => mapId('1')).toThrow(OperationError.InvalidInput);
  expect(mapId('a1')).toBe('a1');
  expect(() => mapId('abc ')).toThrow(OperationError.InvalidInput);
  expect(mapId('abc')).toBe('abc');
});
