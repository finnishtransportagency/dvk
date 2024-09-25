import { IonGrid, IonRow, IonCol, IonLabel, IonText, IonSkeletonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FairwayCardPartsFragment } from '../../graphql/generated';
import { Link } from 'react-router-dom';
import { Lang } from '../../utils/constants';
import { useFairwayCardListData } from '../../utils/dataLoader';
import GeneralInfoAccordion from './GeneralInfoAccordion';
import Breadcrumb from './Breadcrumb';
import uniqueId from 'lodash/uniqueId';

type FairwayCardGroupProps = {
  data: FairwayCardPartsFragment[];
  title: string;
  loading?: boolean;
  first?: boolean;
};

const FairwayCardGroup: React.FC<FairwayCardGroupProps> = ({ data, title, loading, first }) => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const lang = i18n.resolvedLanguage as Lang;
  const sorted = [...data].sort((a, b) => {
    const nameA = a.name[lang] ?? '';
    const nameB = b.name[lang] ?? '';
    return nameA.localeCompare(nameB);
  });
  return (
    <div className="group">
      <IonText className={first ? 'no-margin-top' : ''}>
        <h4>
          <strong>{title}</strong>
        </h4>
      </IonText>
      <IonGrid className="table">
        <IonRow className="header">
          <IonCol>{t('name')}</IonCol>
          <IonCol>{t('modified')}</IonCol>
        </IonRow>
        {loading && <IonSkeletonText animated={true} style={{ width: '100%', height: '50px' }}></IonSkeletonText>}
        {sorted.map((fairwayCard) => {
          const uuid = uniqueId('row_');
          return (
            <IonRow key={uuid} className="fairwayCards">
              <IonCol>
                <IonLabel>
                  <Link to={'/kortit/' + fairwayCard.id + '/v0_public'}>{fairwayCard.name[lang]}</Link>
                </IonLabel>
              </IonCol>
              <IonCol>
                <IonLabel>{t('modifiedDate', { val: fairwayCard.modificationTimestamp ? fairwayCard.modificationTimestamp : '-' })}</IonLabel>
              </IonCol>
            </IonRow>
          );
        })}
      </IonGrid>
    </div>
  );
};

type FairwayCardsProps = {
  widePane?: boolean;
};

const FairwayCards: React.FC<FairwayCardsProps> = ({ widePane }) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'fairwayCards' });
  const { data, isPending, dataUpdatedAt, isFetching } = useFairwayCardListData();
  const path = [{ title: t('title', { count: 0 }) }];

  return (
    <>
      <Breadcrumb path={path} />

      <IonText className="fairwayTitle" id="mainPageContent">
        <h2 className="no-margin-bottom">
          <strong>{t('title', { count: 0 })}</strong>
        </h2>
        <em className="no-print">
          {t('dataUpdated')} {!isPending && !isFetching && <>{t('datetimeFormat', { val: dataUpdatedAt })}</>}
          {(isPending || isFetching) && (
            <IonSkeletonText
              animated={true}
              style={{ width: '85px', height: '12px', margin: '0 0 0 3px', display: 'inline-block', transform: 'skew(-15deg)' }}
            />
          )}
        </em>
      </IonText>
      <GeneralInfoAccordion
        description={t('description')}
        additionalDesc={t('additionalDescription')}
        notification={t('notification')}
        widePane={widePane}
      />

      <div className={'tabContent active show-print' + (widePane ? ' wide' : '')}>
        <FairwayCardGroup
          title={t('archipelagoSea')}
          loading={isPending}
          data={data?.fairwayCards.filter((card) => card.group === '1') ?? []}
          first
        />
        <FairwayCardGroup title={t('gulfOfFinland')} loading={isPending} data={data?.fairwayCards.filter((card) => card.group === '2') ?? []} />
        <FairwayCardGroup title={t('gulfOfBothnia')} loading={isPending} data={data?.fairwayCards.filter((card) => card.group === '3') ?? []} />
      </div>
    </>
  );
};

export default FairwayCards;
