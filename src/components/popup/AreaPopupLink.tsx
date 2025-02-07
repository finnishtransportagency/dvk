import React from 'react';
import { IonCol, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './popup.css';
import { Lang } from '../../utils/constants';
import { FairwayCardPartsFragment } from '../../graphql/generated';
import { useDvkContext } from '../../hooks/dvkContext';
import { Link } from 'react-router-dom';

type AreaPopupLinkProps = {
  card: FairwayCardPartsFragment;
};

const AreaPopupLink: React.FC<AreaPopupLinkProps> = ({ card }) => {
  const { state } = useDvkContext();
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage as Lang;

  return (
    <IonRow key={'cardlink' + card.id}>
      <IonCol>
        <Link to={`/kortit/${card.id}`} className={state.preview ? 'disableLink' : ''}>
          {card.name[lang]}
        </Link>
      </IonCol>
    </IonRow>
  );
};

export default AreaPopupLink;
