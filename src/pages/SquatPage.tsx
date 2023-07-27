import React, { useMemo } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Squat, SquatChart, SquatReducer, initialState, SquatContext } from 'squatlib';
import 'squatlib/dist/style.css';

const SquatPage: React.FC = () => {
  const [state, dispatch] = React.useReducer(SquatReducer, initialState);
  const providerState = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );
  return (
    <IonPage>
      <IonContent className="squat ion-no-padding">
        <SquatContext.Provider value={providerState}>
          <Squat />
          <SquatChart />
        </SquatContext.Provider>
      </IonContent>
    </IonPage>
  );
};

export default SquatPage;
