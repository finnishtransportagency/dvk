import { fairwayCardReducer } from '../fairwayCardReducer';
import { emptyValidationParameters, getTestState } from '../fairwayCardReducer.test';
import { Orientation, PictureInput } from '../../graphql/generated';

test('if pic updates correctly', () => {
  const testState = getTestState();
  const newPic = [
    {
      groupId: 2,
      id: 'pix2',
      lang: 'fi',
      legendPosition: 'sw',
      modificationTimestamp: 0,
      orientation: Orientation.Landscape,
      rotation: 45,
      scaleLabel: 'scalelabel',
      scaleWidth: '20',
      sequenceNumber: 1,
      text: 'pixtext',
    },
  ] as PictureInput[];
  const newState = fairwayCardReducer(testState, newPic, 'picture', emptyValidationParameters, 'fi', 0, '');
  expect(newState.pictures ? newState.pictures[0].groupId : 0).toBe(2);
});

test('if pic text updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'modtext', 'pictureDescription', emptyValidationParameters, 'fi', 1, '');
  expect(newState.pictures ? newState.pictures[0].text : '').toBe('modtext');
});
test('if pic legend position updates correctly', () => {
  const testState = getTestState();
  const newState = fairwayCardReducer(testState, 'ne', 'pictureLegendPosition', emptyValidationParameters, 'fi', 1, '');
  expect(newState.pictures ? newState.pictures[0].legendPosition : '').toBe('ne');
});
