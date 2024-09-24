import React from 'react';
import { Area, Fairway } from '../../../graphql/generated';
import uniqueId from 'lodash/uniqueId';
import { AreaInfoListItem } from './AreaInfoListItem';
import { ProhibitionAreaInfoListItem } from './ProhibitionAreaInfoListItem';

type AreaInfoByTypeProps = {
  data: Fairway[] | null;
  typeCode: number;
};

export const AreaInfoByType: React.FC<AreaInfoByTypeProps> = ({ data, typeCode }) => {
  const fairways = data || [];

  function getFairwayAreas(fairway: Fairway): Area[] {
    return fairway.areas ?? [];
  }

  return (
    <>
      {fairways.map((fairway) => {
        const fairwayAreas = getFairwayAreas(fairway).filter((area) => {
          return area.typeCode && area.typeCode == typeCode;
        }); // special areas only

        return (
          <div key={uniqueId()}>
            <ol>
              {typeCode === 15
                ? fairway.prohibitionAreas?.map((area) => {
                    return <ProhibitionAreaInfoListItem key={area.id} area={area} />;
                  })
                : fairwayAreas.map((area) => {
                    return <AreaInfoListItem key={area.id} area={area} isDraftAvailable={false} isN2000HeightSystem={undefined} sizingSpeeds={[]} />;
                  })}
            </ol>
          </div>
        );
      })}
    </>
  );
};
