import { FairwayCardByIdQuery, Status, Operation, HarbourByIdQuery, FairwayCardInput, HarborInput } from '../graphql/generated';
import { sortPictures } from './common';
import { POSITION } from './constants';

const stringValueOrDefault = (value: string | null | undefined): string => {
  return value ?? '';
};

function mapPictures(sourceCard: string | undefined, data: FairwayCardByIdQuery | undefined, copyPictures: boolean | undefined) {
  // If card is based on another card, copying pictures is optional
  return sourceCard && !copyPictures
    ? []
    : sortPictures(
        data?.fairwayCard?.pictures?.map((picture) => {
          return {
            id: picture.id,
            text: picture.text,
            lang: picture.lang,
            orientation: picture.orientation,
            rotation: picture.rotation,
            modificationTimestamp: copyPictures ? 0 : picture.modificationTimestamp,
            sequenceNumber: picture.sequenceNumber,
            scaleLabel: picture.scaleLabel,
            scaleWidth: picture.scaleWidth,
            groupId: picture.groupId,
            legendPosition: picture.legendPosition ?? POSITION.bottomLeft,
          };
        }) ?? []
      );
}

export function mapToFairwayCardInput(sourceCard: string | undefined, data: FairwayCardByIdQuery | undefined, copyPictures?: boolean) {
  return {
    id: sourceCard ? '' : stringValueOrDefault(data?.fairwayCard?.id),
    // v1 is just for now, since proper version control not in use
    version: data?.fairwayCard?.version ?? 'v1',
    group: stringValueOrDefault(data?.fairwayCard?.group),
    name: {
      fi: stringValueOrDefault(data?.fairwayCard?.name?.fi),
      sv: stringValueOrDefault(data?.fairwayCard?.name?.sv),
      en: stringValueOrDefault(data?.fairwayCard?.name?.en),
    },
    n2000HeightSystem: data?.fairwayCard?.n2000HeightSystem ?? false,
    status: sourceCard ? Status.Draft : (data?.fairwayCard?.status ?? Status.Draft),
    fairwayIds: data?.fairwayCard?.fairways.flatMap((fairway) => fairway.id).sort() ?? [],
    harbors: data?.fairwayCard?.harbors?.flatMap((harbor) => harbor.id) ?? [],
    pilotRoutes: data?.fairwayCard?.pilotRoutes?.map((route) => route.id) ?? [],
    primaryFairwayId:
      data?.fairwayCard?.fairways
        .filter((fairway) => fairway.primary)
        ?.map((fairway) => {
          return {
            id: fairway.id,
            sequenceNumber: fairway.primarySequenceNumber ?? 1,
          };
        })
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? [],
    secondaryFairwayId:
      data?.fairwayCard?.fairways
        .filter((fairway) => fairway.secondary)
        ?.map((fairway) => {
          return {
            id: fairway.id,
            sequenceNumber: fairway.secondarySequenceNumber ?? 1,
          };
        })
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? [],
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
    mareographs: data?.fairwayCard?.mareographs?.map((mareograph) => mareograph.id) ?? [],
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
    operation: sourceCard ? Operation.Create : Operation.Update,
    pictures: mapPictures(sourceCard, data, copyPictures),
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
    publishDetails: stringValueOrDefault(data?.fairwayCard?.publishDetails),
  };
}

export function mapNewFairwayCardVersion(card: FairwayCardInput | undefined, copyPictures?: boolean) {
  return {
    id: stringValueOrDefault(card?.id),
    version: card?.version ?? 'v1',
    group: stringValueOrDefault(card?.group),
    name: {
      fi: stringValueOrDefault(card?.name?.fi),
      sv: stringValueOrDefault(card?.name?.sv),
      en: stringValueOrDefault(card?.name?.en),
    },
    n2000HeightSystem: card?.n2000HeightSystem ?? false,
    status: Status.Draft,
    fairwayIds: card?.fairwayIds ?? [],
    harbors: card?.harbors,
    pilotRoutes: card?.pilotRoutes,
    primaryFairwayId: card?.primaryFairwayId,
    secondaryFairwayId: card?.secondaryFairwayId,
    additionalInfo: {
      fi: stringValueOrDefault(card?.additionalInfo?.fi),
      sv: stringValueOrDefault(card?.additionalInfo?.sv),
      en: stringValueOrDefault(card?.additionalInfo?.en),
    },
    lineText: {
      fi: stringValueOrDefault(card?.lineText?.fi),
      sv: stringValueOrDefault(card?.lineText?.sv),
      en: stringValueOrDefault(card?.lineText?.en),
    },
    designSpeed: {
      fi: stringValueOrDefault(card?.designSpeed?.fi),
      sv: stringValueOrDefault(card?.designSpeed?.sv),
      en: stringValueOrDefault(card?.designSpeed?.en),
    },
    speedLimit: {
      fi: stringValueOrDefault(card?.speedLimit?.fi),
      sv: stringValueOrDefault(card?.speedLimit?.sv),
      en: stringValueOrDefault(card?.speedLimit?.en),
    },
    anchorage: {
      fi: stringValueOrDefault(card?.anchorage?.fi),
      sv: stringValueOrDefault(card?.anchorage?.sv),
      en: stringValueOrDefault(card?.anchorage?.en),
    },
    navigationCondition: {
      fi: stringValueOrDefault(card?.navigationCondition?.fi),
      sv: stringValueOrDefault(card?.navigationCondition?.sv),
      en: stringValueOrDefault(card?.navigationCondition?.en),
    },
    iceCondition: {
      fi: stringValueOrDefault(card?.iceCondition?.fi),
      sv: stringValueOrDefault(card?.iceCondition?.sv),
      en: stringValueOrDefault(card?.iceCondition?.en),
    },
    windRecommendation: {
      fi: stringValueOrDefault(card?.windRecommendation?.fi),
      sv: stringValueOrDefault(card?.windRecommendation?.sv),
      en: stringValueOrDefault(card?.windRecommendation?.en),
    },
    vesselRecommendation: {
      fi: stringValueOrDefault(card?.vesselRecommendation?.fi),
      sv: stringValueOrDefault(card?.vesselRecommendation?.sv),
      en: stringValueOrDefault(card?.vesselRecommendation?.en),
    },
    visibility: {
      fi: stringValueOrDefault(card?.visibility?.fi),
      sv: stringValueOrDefault(card?.visibility?.sv),
      en: stringValueOrDefault(card?.visibility?.en),
    },
    mareographs: card?.mareographs,
    trafficService: {
      pilot: {
        email: stringValueOrDefault(card?.trafficService?.pilot?.email),
        phoneNumber: stringValueOrDefault(card?.trafficService?.pilot?.phoneNumber),
        fax: stringValueOrDefault(card?.trafficService?.pilot?.fax),
        extraInfo: {
          fi: stringValueOrDefault(card?.trafficService?.pilot?.extraInfo?.fi),
          sv: stringValueOrDefault(card?.trafficService?.pilot?.extraInfo?.sv),
          en: stringValueOrDefault(card?.trafficService?.pilot?.extraInfo?.en),
        },
        places: card?.trafficService?.pilot?.places,
      },
      vts: card?.trafficService?.vts,
      tugs: card?.trafficService?.tugs,
    },
    // this function is for now only used for creating new version
    operation: Operation.Createversion,
    pictures: copyPictures ? card?.pictures : [],
    temporaryNotifications: card?.temporaryNotifications,
  };
}

export function mapToHarborInput(origin: boolean | undefined, data: HarbourByIdQuery | undefined) {
  const coordinates = data?.harbor?.geometry?.coordinates ?? ['', ''];
  return {
    id: origin ? '' : stringValueOrDefault(data?.harbor?.id),
    // v1 is just for now, since proper version control not in use
    version: data?.harbor?.version ?? 'v1',
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
    status: origin ? Status.Draft : (data?.harbor?.status ?? Status.Draft),
    operation: origin ? Operation.Create : Operation.Update,
  };
}

export function mapNewHarbourVersion(harbour: HarborInput) {
  return {
    id: stringValueOrDefault(harbour?.id),
    // v1 is just for now, since proper version control not in use
    version: harbour.version,
    name: {
      fi: stringValueOrDefault(harbour.name.fi),
      sv: stringValueOrDefault(harbour.name.sv),
      en: stringValueOrDefault(harbour.name.en),
    },
    extraInfo: {
      fi: stringValueOrDefault(harbour.extraInfo?.fi),
      sv: stringValueOrDefault(harbour.extraInfo?.sv),
      en: stringValueOrDefault(harbour.extraInfo?.en),
    },
    cargo: {
      fi: stringValueOrDefault(harbour.cargo?.fi),
      sv: stringValueOrDefault(harbour.cargo?.sv),
      en: stringValueOrDefault(harbour.cargo?.en),
    },
    harborBasin: {
      fi: stringValueOrDefault(harbour.harborBasin?.fi),
      sv: stringValueOrDefault(harbour.harborBasin?.sv),
      en: stringValueOrDefault(harbour.harborBasin?.en),
    },
    n2000HeightSystem: harbour.n2000HeightSystem ?? false,
    geometry: { lat: stringValueOrDefault(harbour.geometry.lat), lon: stringValueOrDefault(harbour.geometry.lon) },
    company: {
      fi: stringValueOrDefault(harbour.company?.fi),
      sv: stringValueOrDefault(harbour.company?.sv),
      en: stringValueOrDefault(harbour.company?.en),
    },
    email: stringValueOrDefault(harbour.email),
    fax: stringValueOrDefault(harbour.fax),
    internet: stringValueOrDefault(harbour.internet),
    phoneNumber: harbour.phoneNumber ?? [],
    quays: harbour.quays,
    // this mapper is only used for new version, so status is always 'Draft' and operation 'Createversion'
    status: Status.Draft,
    operation: Operation.Createversion,
  };
}
