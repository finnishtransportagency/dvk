import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import React from 'react';
import { Fairway, SquatCalculation } from '../../../graphql/generated';
import { useTranslation } from 'react-i18next';
import { Lang } from '../../../utils/constants';
import { FairwayForm, getFairwayFormText } from '../../../utils/common';
import { Link, useLocation } from 'react-router-dom';
import { setSelectedFairwayAreas, zoomToFairwayAreas } from '../../layers';

export type SquatCalculationProps = {
  squatCalculation?: SquatCalculation | null;
  fairways?: Fairway[] | null;
};

const SquatCalculationTemplate: React.FC<SquatCalculationProps> = ({ squatCalculation, fairways }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'squattemplates' });
  const lang = i18n.resolvedLanguage as Lang;
  useLocation();

  const groupedAreas = squatCalculation?.suitableFairwayAreas?.reduce<Record<string, number[]>>(
    (acc, item) => {
      if (!item) {
        return acc;
      }
      const match = fairways?.find((f) => f.areas?.find((a) => a.id === item));
      if (match?.name && match.id && match.name[lang]) {
        const ftext = match.name[lang] + ' ' + match.id;
        if (!acc[ftext]) {
          acc[ftext] = [];
        }
        acc[ftext].push(item);
      }
      return acc;
    },
    {} as Record<string, number[]>
  );

  const zoomTo = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (squatCalculation?.suitableFairwayAreas) {
      zoomToFairwayAreas(squatCalculation?.suitableFairwayAreas as number[]);
    }
  };

  //For dev env use a different port, otherwise link opens inside DVK app
  const port = window.location.hostname === 'localhost' ? '' + (parseInt(window.location.port) + 1) : window.location.port;
  //Note that fairwayForm maps 1,2,3 -> 0,1,2
  const squatLink =
    window.location.protocol +
    '//' +
    window.location.hostname +
    (port && port.length > 0 ? ':' + port : '') +
    '/squat' +
    '?sweptDepth=' +
    squatCalculation?.depth +
    '&waterDepth=' +
    squatCalculation?.estimatedWaterDepth +
    '&fairwayForm=' +
    ((squatCalculation?.fairwayForm ?? 1) - 1) +
    '&channelWidth=' +
    (squatCalculation?.fairwayWidth ?? 0) +
    '&slopeScale=' +
    (squatCalculation?.slopeScale ?? 0) +
    '&slopeHeight=' +
    (squatCalculation?.slopeHeight ?? 0);

  const highlightAreas = (ids: (string | number)[]) => {
    setSelectedFairwayAreas(ids ?? []);
  };

  return (
    <>
      <IonGrid className="template ion-no-padding">
        <div className="template underline">
          <IonGrid className="template ion-no-padding no-margin-bottom">
            <IonRow>
              <IonCol>
                <IonText className="template no-margin-top" data-testid="squatCalculationPlace">
                  <h4>
                    <strong>{squatCalculation?.place?.[lang]}</strong>
                  </h4>
                </IonText>
              </IonCol>
              <IonCol size="auto" className="ion-align-items-end">
                <IonText className="template zoomlink no-margin-top" data-testid="squatCalculationZoomToAreas">
                  <Link to="/" onClick={zoomTo}>
                    <p>{t('squat-calculation-zoom-to-areas')}</p>
                  </Link>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        <IonText data-testid="depth">
          <h5>{t('squat-calculation-depth') + ':'}</h5>
          <p>{squatCalculation?.depth} m</p>
        </IonText>

        <IonText className="no-margin-top" data-testid="squatCalculationAreas">
          <h5>{t('squat-calculation-areas') + ':'}</h5>
        </IonText>
        {groupedAreas &&
          Object.keys(groupedAreas ?? [])
            .sort((a, b) => a.localeCompare(b))
            .map((fairway) => (
              <IonText
                data-testid="squatfairway"
                key={fairway}
                onMouseEnter={() => highlightAreas(groupedAreas[fairway])}
                onFocus={() => highlightAreas(groupedAreas[fairway])}
                onMouseLeave={() => highlightAreas([0])}
                onBlur={() => highlightAreas([0])}
              >
                <div className="inlineHoverText">
                  {fairway}:<br />
                  <ol>
                    {groupedAreas[fairway]
                      .toSorted((a, b) => a - b)
                      .map((area) => (
                        <IonText key={area}>
                          <li className="group">{t('areaType1')}</li>
                        </IonText>
                      ))}
                  </ol>
                </div>
              </IonText>
            ))}

        <br />
        <IonText className="no-margin-top" data-testid="squatCalculationEstimatedWaterDepth">
          <h5>{t('squat-calculation-estimated-water-depth') + ':'}</h5>
          <p>{squatCalculation?.estimatedWaterDepth} m</p>
        </IonText>

        <IonText className="no-margin-top" data-testid="fairwayForm">
          <h5>{t('squat-calculation-fairway-form') + ':'}</h5>
          <p>{getFairwayFormText(squatCalculation?.fairwayForm as number, t)}</p>
        </IonText>

        {(squatCalculation?.fairwayForm ?? 0) > FairwayForm.OpenWater && (
          <IonText className="no-margin-top" data-testid="fairwayWidth">
            <h5>{t('squat-calculation-fairway-width') + ':'}</h5>
            <p>{squatCalculation?.fairwayWidth} m</p>
          </IonText>
        )}

        {(squatCalculation?.fairwayForm ?? 0) > FairwayForm.Channel && (
          <>
            <IonText className="no-margin-top" data-testid="slopeScale">
              <h5>{t('squat-calculation-slope-scale') + ':'}</h5>
              <p>{squatCalculation?.slopeScale}</p>
            </IonText>
            <IonText className="no-margin-top" data-testid="slopeHeight">
              <h5>{t('squat-calculation-slope-height') + ':'}</h5>
              <p>{squatCalculation?.slopeHeight} m</p>
            </IonText>
          </>
        )}

        <IonText className="no-margin-top" data-testid="squatCalculationAdditionalInformation">
          <p>
            <strong>{t('squat-calculation-additional-information') + ': '}</strong>
            {squatCalculation?.additionalInformation?.[lang]}
          </p>
        </IonText>

        <a href={squatLink} target="_blank" rel="noreferrer" className="ion-no-padding external">
          {t('squat-calculation-open-link')}
          <span className="screen-reader-only">{t('common.opens-in-a-new-tab')}</span>
        </a>
      </IonGrid>
      <br />
    </>
  );
};

export default SquatCalculationTemplate;
