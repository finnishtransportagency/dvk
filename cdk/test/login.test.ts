import { parseRoles } from '../lib/lambda/api/login';

describe('parseRoles', () => {
  it('should handle old OAM string format', () => {
    const input = {
      'custom:rooli': 'DVK_yllapito,DVK_admin',
      'custom:sukunimi': 'Testaaja',
      email_verified: 'false',
      'custom:etunimi': 'Teemu',
      'custom:puhelin': '+35840123456',
      'custom:uid': 'K123456',
      email: 'teemu.testaaja@testi.com',
      username: 'testoam_teemu.testaaja@testi.com',
    };
    const expected = ['DVK_yllapito', 'DVK_admin'];
    expect(parseRoles(input['custom:rooli'])).toEqual(expected);
  });

  it('shold handle the new JSON like format for EntraID', () => {
    const input = {
      'custom:rooli': '[\"DVK_yllapito\", \"DVK_kayttaja\"]',
      'custom:sukunimi': 'Testaaja',
      email_verified: 'false',
      'custom:etunimi': 'Teemu',
      'custom:puhelin': '+35840123456',
      'custom:uid': 'K123456',
      email: 'teemu.testaaja@cgi.com',
      username: 'testoam_teemu.testaaja@testi.com',
    };
    const expected = ['DVK_yllapito', 'DVK_kayttaja'];
    expect(parseRoles(input['custom:rooli'])).toEqual(expected);
  });

  it('should return an empty array for falsy input', () => {
    expect(parseRoles('')).toEqual([]);
    expect(parseRoles(undefined as unknown as string)).toEqual([]);
    expect(parseRoles(null as unknown as string)).toEqual([]);
  });

  it('should handle whitespace in role string (old format)', () => {
    const input = ' DVK_yllapito , DVK_kayttaja ';
    const expected = ['DVK_yllapito', 'DVK_kayttaja'];
    expect(parseRoles(input)).toEqual(expected);
  });

  it('should ignore roles without DVK_ prefix (old format)', () => {
    const input = 'DVK_yllapito,DVK-Yllapito,DVKYllapito,testi_rooli1,muu_yllapito';
    const expected = ['DVK_yllapito'];
    expect(parseRoles(input)).toEqual(expected);
  });

  it('should handle whitespace in role string (new format)', () => {
    const input = '[\" DVK_yllapito\", \"DVK_kayttaja \"]';
    const expected = ['DVK_yllapito', 'DVK_kayttaja'];
    expect(parseRoles(input)).toEqual(expected);
  });

  it('should ignore roles without DVK_ prefix (new format)', () => {
    const input = '[\"DVK_yllapito\",\"DVK-Yllapito\",\"DVKYllapito\",\"testi_rooli1\",\"muu_yllapito\"]';
    const expected = ['DVK_yllapito'];
    expect(parseRoles(input)).toEqual(expected);
  });
});
