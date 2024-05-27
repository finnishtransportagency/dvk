import React from 'react';
import { Area, Fairway } from '../../../graphql/generated';
import uniqueId from 'lodash/uniqueId';
import { AreaInfoListItem } from './AreaInfoListItem';

type SpecialAreaInfoProps = {
  data: Fairway[] | null;
};

export const SpecialAreaInfo: React.FC<SpecialAreaInfoProps> = ({ data }) => {
  const fairways = data || [];

  function getFairwayAreas(fairway: Fairway): Area[] {
    return fairway.areas ?? [];
  }

  return (
    <>
      {fairways.map((fairway) => {
        const fairwayAreas = getFairwayAreas(fairway).filter((area) => {
          return area.typeCode && (area.typeCode == 2 || area.typeCode == 15);
        }); // special areas only

        return (
          <div key={uniqueId()}>
            <ol>
              {fairwayAreas.map((area) => {
                return <AreaInfoListItem key={area.id} area={area} isDraftAvailable={false} isN2000HeightSystem={undefined} sizingSpeeds={[]} />;
              })}
            </ol>
          </div>
        );
      })}
    </>
  );
};
