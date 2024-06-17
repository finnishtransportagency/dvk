import { OperationError, TextInput } from '../graphql/generated';
import {
  mapText,
  mapMandatoryText,
  mapNumber,
  mapString,
  mapStringArray,
  mapGeometry,
  mapId,
  mapEmail,
  mapPhoneNumber,
  mapEmails,
  mapPhoneNumbers,
  mapInternetAddress,
  mapQuayDepth,
  mapPilotJourney,
  mapQuayLength,
  mapVhfChannel,
  mapVersion,
} from '../lib/lambda/db/modelMapper';

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
  expect(mapGeometry({ lat: '60.124', lon: '31.221' })).toMatchObject({ type: 'Point', coordinates: [31.221, 60.124] });
  expect(mapGeometry({ lat: '60,124', lon: '31,221' })).toMatchObject({ type: 'Point', coordinates: [31.221, 60.124] });
  expect(mapGeometry({ lat: '60,12345', lon: '31,221' })).toMatchObject({ type: 'Point', coordinates: [31.221, 60.12345] });
  expect(mapGeometry({ lat: '60,12345', lon: '31,12345' })).toMatchObject({ type: 'Point', coordinates: [31.12345, 60.12345] });
  expect(mapGeometry({ lat: '60.124', lon: '31.221' })).toMatchObject({ type: 'Point', coordinates: [31.221, 60.124] });
  expect(mapGeometry({ lat: '58', lon: '17' })).toMatchObject({ type: 'Point', coordinates: [17, 58] });
  expect(mapGeometry({ lat: '69.99999', lon: '31.99999' })).toMatchObject({ type: 'Point', coordinates: [31.99999, 69.99999] });
  expect(() => mapGeometry({ lat: ' ', lon: ' ' })).toThrow(OperationError.InvalidInput);
  expect(() => mapGeometry({ lat: '57.99999', lon: '31' })).toThrow(OperationError.InvalidInput);
  expect(() => mapGeometry({ lat: '58.99999', lon: '32' })).toThrow(OperationError.InvalidInput);
  expect(() => mapGeometry({ lat: '70', lon: '31' })).toThrow(OperationError.InvalidInput);
  expect(() => mapGeometry({ lat: '58.99999', lon: '16.9999' })).toThrow(OperationError.InvalidInput);
  expect(() => mapGeometry({ lat: '60,12345', lon: '31,12345' }, 4)).toThrow(OperationError.InvalidInput);
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
  expect(mapId('a1b233a')).toBe('a1b233a');
  expect(() => mapId('abc ')).toThrow(OperationError.InvalidInput);
  expect(() => mapId('1abc')).toThrow(OperationError.InvalidInput);
  expect(mapId('abc')).toBe('abc');
});

test('test mapEmail', () => {
  expect(mapEmail(undefined)).toBe(null);
  expect(mapEmail(null)).toBe(null);
  expect(mapEmail('')).toBe(null);
  expect(mapEmail('test@vayla.fi')).toBe('test@vayla.fi');
  expect(mapEmail('Testi.Teppo@vayla.fi')).toBe('Testi.Teppo@vayla.fi');
  expect(mapEmail('test123@vayla.info')).toBe('test123@vayla.info');
  expect(mapEmail('test123@vayla123.org')).toBe('test123@vayla123.org');
  expect(mapEmail('123x@x.com')).toBe('123x@x.com');
  expect(mapEmail('x@x.f123')).toBe('x@x.f123');
  expect(mapEmail('Testi..Teppo@vayla.fi')).toBe('Testi..Teppo@vayla.fi');
  expect(mapEmail('x@x.f1234')).toBe('x@x.f1234');
  expect(mapEmail('x@x')).toBe('x@x');
  expect(mapEmail('x@x.f')).toBe('x@x.f');
  expect(mapEmail('Testi.Teppo@vayla')).toBe('Testi.Teppo@vayla');
  expect(mapEmail('x..x@x.f.x')).toBe('x..x@x.f.x');
  expect(() => mapEmail('x..x@x.f.')).toThrow(OperationError.InvalidInput);
  expect(() => mapEmail('Testi.Teppo@vayla.')).toThrow(OperationError.InvalidInput);
  expect(() => mapEmail('Testi.Teppo@vayla..fi')).toThrow(OperationError.InvalidInput);
  expect(() => mapEmail(' ')).toThrow(OperationError.InvalidInput);
  expect(() => mapEmail('x')).toThrow(OperationError.InvalidInput);
  let text = 'x@';
  for (let i = 0; i < 63; i++) {
    text += 'x';
  }
  expect(mapEmail(text)).toBe(text);
  expect(() => mapEmail(text + 'x')).toThrow(OperationError.InvalidInput);
});

test('test mapEmails', () => {
  expect(mapEmails(undefined)).toBe(null);
  expect(mapEmails(null)).toBe(null);
  expect(mapEmails([''])).toStrictEqual([]);
  expect(mapEmails(['x@x', 'y@y.fi'])).toStrictEqual(['x@x', 'y@y.fi']);
  expect(() => mapEmails(['x@x', 'y@y.'])).toThrow(OperationError.InvalidInput);
});

test('test mapPhoneNumber', () => {
  expect(mapPhoneNumber(undefined)).toBe(null);
  expect(mapPhoneNumber(null)).toBe(null);
  expect(mapPhoneNumber('')).toBe(null);
  expect(mapPhoneNumber('35812')).toBe('35812');
  expect(mapPhoneNumber('358123')).toBe('358123');
  expect(mapPhoneNumber('+358123')).toBe('+358123');
  expect(mapPhoneNumber('+358 123')).toBe('+358 123');
  expect(mapPhoneNumber('1 2345')).toBe('1 2345');
  expect(mapPhoneNumber('+3581 1')).toBe('+3581 1');
  expect(mapPhoneNumber('12345678901234567890')).toBe('12345678901234567890');
  expect(mapPhoneNumber('+12345678901234567890')).toBe('+12345678901234567890');
  expect(() => mapPhoneNumber('123456789012345678901')).toThrow(OperationError.InvalidInput);
  expect(() => mapPhoneNumber('+3581')).toThrow(OperationError.InvalidInput);
  expect(() => mapPhoneNumber('3581')).toThrow(OperationError.InvalidInput);
  expect(() => mapPhoneNumber(' +3581 2 ')).toThrow(OperationError.InvalidInput);
  expect(() => mapPhoneNumber('1+3581 2 ')).toThrow(OperationError.InvalidInput);
});

test('test mapPhoneNumbers', () => {
  expect(mapPhoneNumbers(undefined)).toBe(null);
  expect(mapPhoneNumbers(null)).toBe(null);
  expect(mapPhoneNumbers([''])).toStrictEqual([]);
  expect(mapPhoneNumbers(['35812'])).toStrictEqual(['35812']);
  expect(mapPhoneNumbers(['12345678901234567890'])).toStrictEqual(['12345678901234567890']);
  expect(mapPhoneNumbers(['358123', '+358123'])).toStrictEqual(['358123', '+358123']);
  expect(() => mapPhoneNumbers(['+358x123'])).toThrow(OperationError.InvalidInput);
  expect(() => mapPhoneNumbers(['123456789012345678901'])).toThrow(OperationError.InvalidInput);
});

test('test mapInternetAddress', () => {
  expect(mapInternetAddress(undefined)).toBe(null);
  expect(mapInternetAddress(null)).toBe(null);
  expect(mapInternetAddress('')).toBe(null);
  expect(mapInternetAddress('www')).toBe('www');
  expect(mapInternetAddress('www.vayla.fi')).toBe('www.vayla.fi');
  expect(mapInternetAddress('https://www.vayla.fi')).toBe('https://www.vayla.fi');
  let text = '';
  for (let i = 0; i < 200; i++) {
    text += 'x';
  }
  expect(mapInternetAddress(text)).toBe(text);
  expect(() => mapInternetAddress(text + 'x')).toThrow(OperationError.InvalidInput);
});

test('test mapQuayDepth', () => {
  expect(mapQuayDepth(undefined)).toBe(null);
  expect(mapQuayDepth(null)).toBe(null);
  expect(mapQuayDepth('999')).toBe(999);
  expect(mapQuayDepth('999.1')).toBe(999.1);
  expect(mapQuayDepth('999.99')).toBe(999.99);
  expect(mapQuayDepth('999,99')).toBe(999.99);
  expect(mapQuayDepth('1')).toBe(1);
  expect(mapQuayDepth('0')).toBe(0);
  expect(() => mapQuayDepth('-1')).toThrow(OperationError.InvalidInput);
  expect(() => mapQuayDepth('x')).toThrow(OperationError.InvalidInput);
  expect(() => mapQuayDepth('999.999')).toThrow(OperationError.InvalidInput);
});

test('test mapPilotJourney', () => {
  expect(mapPilotJourney(undefined)).toBe(null);
  expect(mapPilotJourney(null)).toBe(null);
  expect(mapPilotJourney('999')).toBe(999);
  expect(mapPilotJourney('1')).toBe(1);
  expect(mapPilotJourney('0')).toBe(0);
  expect(mapPilotJourney('999.9')).toBe(999.9);
  expect(mapPilotJourney('999,9')).toBe(999.9);
  expect(() => mapPilotJourney('-1')).toThrow(OperationError.InvalidInput);
  expect(() => mapPilotJourney('x')).toThrow(OperationError.InvalidInput);
  expect(() => mapPilotJourney('999.99')).toThrow(OperationError.InvalidInput);
});

test('test mapQuayLength', () => {
  expect(mapQuayLength(undefined)).toBe(null);
  expect(mapQuayLength(null)).toBe(null);
  expect(mapQuayLength('99')).toBe(99);
  expect(mapQuayLength('999')).toBe(999);
  expect(mapQuayLength('999.1')).toBe(999.1);
  expect(mapQuayLength('9999.9')).toBe(9999.9);
  expect(mapQuayLength('9999,9')).toBe(9999.9);
  expect(mapQuayLength('1')).toBe(1);
  expect(mapQuayLength('0')).toBe(0);
  expect(() => mapQuayLength('-1')).toThrow(OperationError.InvalidInput);
  expect(() => mapQuayLength('x')).toThrow(OperationError.InvalidInput);
  expect(() => mapQuayLength('999.99')).toThrow(OperationError.InvalidInput);
  expect(() => mapQuayLength('9999.99')).toThrow(OperationError.InvalidInput);
});

test('test mapVhfChannel', () => {
  expect(mapVhfChannel(undefined)).toBe(null);
  expect(mapVhfChannel(null)).toBe(null);
  expect(mapVhfChannel('999')).toBe(999);
  expect(mapVhfChannel('1')).toBe(1);
  expect(mapVhfChannel('0')).toBe(0);
  expect(mapVhfChannel('01')).toBe(1);
  expect(() => mapVhfChannel('-1')).toThrow(OperationError.InvalidInput);
  expect(() => mapVhfChannel('x')).toThrow(OperationError.InvalidInput);
  expect(() => mapVhfChannel('0.1')).toThrow(OperationError.InvalidInput);
  expect(() => mapVhfChannel('999.1')).toThrow(OperationError.InvalidInput);
  expect(() => mapVhfChannel('999.99')).toThrow(OperationError.InvalidInput);
});

test('test version', () => {
  expect(mapVersion('v1')).toBe('v1');
  expect(mapVersion('v42')).toBe('v42');
  expect(mapVersion('v1234')).toBe('v1234');
  expect(mapVersion('v0_latest')).toBe('v0_latest');
  expect(mapVersion('v0_public')).toBe('v0_public');
  expect(() => mapVersion(null)).toThrow(OperationError.InvalidInput);
  expect(() => mapVersion(' ')).toThrow(OperationError.InvalidInput);
  expect(() => mapVersion('version1')).toThrow(OperationError.InvalidInput);
  expect(() => mapVersion('v 1')).toThrow(OperationError.InvalidInput);
  expect(() => mapVersion('v-1')).toThrow(OperationError.InvalidInput);
  expect(() => mapVersion('1')).toThrow(OperationError.InvalidInput);
  expect(() => mapVersion('v_0_public')).toThrow(OperationError.InvalidInput);
});
