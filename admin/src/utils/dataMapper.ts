import { FairwayCardByIdQuery, Status, Operation, HarbourByIdQuery } from '../graphql/generated';
import { sortPictures } from './common';
import { POSITION } from './constants';

const stringValueOrDefault = (value: string | null | undefined): string => {
  return value ?? '';
};

export function mapToFairwayCardInput(origin: boolean | undefined, data: FairwayCardByIdQuery | undefined) {
  return {
    id: origin ? '' : stringValueOrDefault(data?.fairwayCard?.id),
    group: stringValueOrDefault(data?.fairwayCard?.group),
    name: {
      fi: stringValueOrDefault(data?.fairwayCard?.name?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.name?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.name?.en),
    },
    n2000HeightSystem: data?.fairwayCard?.n2000HeightSystem ?? false,
    status: origin ? Status.Draft : data?.fairwayCard?.status ?? Status.Draft,
    fairwayIds: data?.fairwayCard?.fairways.flatMap((fairway) => fairway.id) ?? [],
    harbors: data?.fairwayCard?.harbors?.flatMap((harbor) => harbor.id) ?? [],
    pilotRoutes: data?.fairwayCard?.pilotRoutes?.map((route) => route.id) ?? [],
    primaryFairwayId: data?.fairwayCard?.fairways.find((fairway) => fairway.primary)?.id ?? 0,
    secondaryFairwayId: data?.fairwayCard?.fairways.find((fairway) => fairway.secondary)?.id ?? 0,
    additionalInfo: {
      fi: stringValueOrDefault(data?.fairwayCard?.additionalInfo?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.additionalInfo?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.additionalInfo?.en),
    },
    lineText: {
      fi: stringValueOrDefault(data?.fairwayCard?.lineText?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.lineText?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.lineText?.en),
    },
    designSpeed: {
      fi: stringValueOrDefault(data?.fairwayCard?.designSpeed?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.designSpeed?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.designSpeed?.en),
    },
    speedLimit: {
      fi: stringValueOrDefault(data?.fairwayCard?.speedLimit?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.speedLimit?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.speedLimit?.en),
    },
    anchorage: {
      fi: stringValueOrDefault(data?.fairwayCard?.anchorage?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.anchorage?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.anchorage?.en),
    },
    navigationCondition: {
      fi: stringValueOrDefault(data?.fairwayCard?.navigationCondition?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.navigationCondition?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.navigationCondition?.en),
    },
    iceCondition: {
      fi: stringValueOrDefault(data?.fairwayCard?.iceCondition?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.iceCondition?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.iceCondition?.en),
    },
    windRecommendation: {
      fi: stringValueOrDefault(data?.fairwayCard?.windRecommendation?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.windRecommendation?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.windRecommendation?.en),
    },
    vesselRecommendation: {
      fi: stringValueOrDefault(data?.fairwayCard?.vesselRecommendation?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.vesselRecommendation?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.vesselRecommendation?.en),
    },
    visibility: {
      fi: stringValueOrDefault(data?.fairwayCard?.visibility?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.visibility?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.visibility?.en),
    },
    windGauge: {
      fi: stringValueOrDefault(data?.fairwayCard?.windGauge?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.windGauge?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.windGauge?.en),
    },
    mareographs: data?.fairwayCard?.mareographs?.map((mareographId) => mareographId) ?? [],
    trafficService: {
      pilot: {
        email: stringValueOrDefault(data?.fairwayCard?.trafficService?.pilot?.email),
        phoneNumber: stringValueOrDefault(data?.fairwayCard?.trafficService?.pilot?.phoneNumber),
        fax: stringValueOrDefault(data?.fairwayCard?.trafficService?.pilot?.fax),
        extraInfo: {
          fi: stringValueOrDefault(data?.fairwayCard?.trafficService?.pilot?.extraInfo?.fi),
          sv: stringValueOrDefault(data?.fairwayCard?.trafficService?.pilot?.extraInfo?.sv),
          en: stringValueOrDefault(data?.fairwayCard?.trafficService?.pilot?.extraInfo?.en),
        },
        places: data?.fairwayCard?.trafficService?.pilot?.places?.map((pilotPlace) => {
          return {
            ...pilotPlace,
            pilotJourney: stringValueOrDefault(pilotPlace.pilotJourney?.toString()),
          };
        }),
      },
      vts: data?.fairwayCard?.trafficService?.vts?.map((vts) => {
        return {
          email: vts?.email,
          name: { fi: stringValueOrDefault(vts?.name?.fi), sv: stringValueOrDefault(vts?.name?.sv), en: stringValueOrDefault(vts?.name?.en) },
          phoneNumber: vts?.phoneNumber,
          vhf: vts?.vhf?.map((vhf) => {
            return {
              channel: stringValueOrDefault(vhf?.channel?.toString()),
              name: { fi: stringValueOrDefault(vhf?.name?.fi), sv: stringValueOrDefault(vhf?.name?.sv), en: stringValueOrDefault(vhf?.name?.en) },
            };
          }),
        };
      }),
      tugs: data?.fairwayCard?.trafficService?.tugs?.map((tug) => {
        return {
          email: tug?.email,
          name: { fi: stringValueOrDefault(tug?.name?.fi), sv: stringValueOrDefault(tug?.name?.sv), en: stringValueOrDefault(tug?.name?.en) },
          phoneNumber: tug?.phoneNumber?.map((phone) => stringValueOrDefault(phone)),
          fax: tug?.fax,
        };
      }),
    },
    operation: origin ? Operation.Create : Operation.Update,
    pictures: origin
      ? []
      : sortPictures(
          data?.fairwayCard?.pictures?.map((picture) => {
            return {
              id: picture.id,
              text: picture.text,
              lang: picture.lang,
              orientation: picture.orientation,
              rotation: picture.rotation,
              modificationTimestamp: picture.modificationTimestamp,
              sequenceNumber: picture.sequenceNumber,
              scaleLabel: picture.scaleLabel,
              scaleWidth: picture.scaleWidth,
              groupId: picture.groupId,
              legendPosition: picture.legendPosition ?? POSITION.bottomLeft,
            };
          }) ?? []
        ),
    temporaryNotifications: data?.fairwayCard?.temporaryNotifications?.map((notification) => {
      return {
        content: {
          fi: stringValueOrDefault(notification.content?.fi),
          sv: stringValueOrDefault(notification.content?.sv),
          en: stringValueOrDefault(notification.content?.en),
        },
        startDate: stringValueOrDefault(notification.startDate),
        endDate: stringValueOrDefault(notification.endDate),
      };
    }),
  };
}

export function mapToHarborInput(origin: boolean | undefined, data: HarbourByIdQuery | undefined) {
  const coordinates = data?.harbor?.geometry?.coordinates ?? ['', ''];
  return {
    id: origin ? '' : stringValueOrDefault(data?.harbor?.id),
    name: {
      fi: stringValueOrDefault(data?.harbor?.name?.fi),
      sv: stringValueOrDefault(data?.harbor?.name?.sv),
      en: stringValueOrDefault(data?.harbor?.name?.en),
    },
    extraInfo: {
      fi: stringValueOrDefault(data?.harbor?.extraInfo?.fi),
      sv: stringValueOrDefault(data?.harbor?.extraInfo?.sv),
      en: stringValueOrDefault(data?.harbor?.extraInfo?.en),
    },
    cargo: {
      fi: stringValueOrDefault(data?.harbor?.cargo?.fi),
      sv: stringValueOrDefault(data?.harbor?.cargo?.sv),
      en: stringValueOrDefault(data?.harbor?.cargo?.en),
    },
    harborBasin: {
      fi: stringValueOrDefault(data?.harbor?.harborBasin?.fi),
      sv: stringValueOrDefault(data?.harbor?.harborBasin?.sv),
      en: stringValueOrDefault(data?.harbor?.harborBasin?.en),
    },
    n2000HeightSystem: data?.harbor?.n2000HeightSystem ?? false,
    geometry: { lat: stringValueOrDefault(coordinates[1]?.toString()), lon: stringValueOrDefault(coordinates[0]?.toString()) },
    company: {
      fi: stringValueOrDefault(data?.harbor?.company?.fi),
      sv: stringValueOrDefault(data?.harbor?.company?.sv),
      en: stringValueOrDefault(data?.harbor?.company?.en),
    },
    email: stringValueOrDefault(data?.harbor?.email),
    fax: stringValueOrDefault(data?.harbor?.fax),
    internet: stringValueOrDefault(data?.harbor?.internet),
    phoneNumber: data?.harbor?.phoneNumber ?? [],
    quays: data?.harbor?.quays?.map((quay) => {
      const quayCoords = quay?.geometry?.coordinates ?? ['', ''];
      return {
        extraInfo: {
          fi: stringValueOrDefault(quay?.extraInfo?.fi),
          sv: stringValueOrDefault(quay?.extraInfo?.sv),
          en: stringValueOrDefault(quay?.extraInfo?.en),
        },
        geometry: { lat: stringValueOrDefault(quayCoords[1]?.toString()), lon: stringValueOrDefault(quayCoords[0]?.toString()) },
        length: stringValueOrDefault(quay?.length?.toString()),
        name: { fi: stringValueOrDefault(quay?.name?.fi), sv: stringValueOrDefault(quay?.name?.sv), en: stringValueOrDefault(quay?.name?.en) },
        sections: quay?.sections?.map((section) => {
          const sectionCoords = section?.geometry?.coordinates ?? ['', ''];
          return {
            depth: stringValueOrDefault(section?.depth?.toString()),
            geometry: { lat: stringValueOrDefault(sectionCoords[1]?.toString()), lon: stringValueOrDefault(sectionCoords[0]?.toString()) },
            name: section?.name,
          };
        }),
      };
    }),
    status: origin ? Status.Draft : data?.harbor?.status ?? Status.Draft,
    operation: origin ? Operation.Create : Operation.Update,
  };
}
