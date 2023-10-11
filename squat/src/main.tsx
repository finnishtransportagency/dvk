import Squat from './components/Squat';
import SquatChart from './components/SquatChart';
import { SquatReducer, initialStateEmbedded } from './hooks/squatReducer';
import SquatContext, { useSquatContext } from './hooks/squatContext';
import { changeLanguage as changeSquatLanguage } from 'i18next';
import Vessel from './components/Vessel';
import Environment from './components/Environment';
import InfoAccordion from './components/InfoAccordion';
import CalculationOptions from './components/CalculationOptions';
import CalculationChecks from './components/CalculationChecks';
import PrintBar from './components/PrintBar';
import { setupIonicReact } from '@ionic/react';

setupIonicReact({
  mode: 'md',
});

export {
  Squat,
  SquatChart,
  SquatReducer,
  useSquatContext,
  initialStateEmbedded,
  SquatContext,
  changeSquatLanguage,
  InfoAccordion,
  Vessel,
  Environment,
  CalculationOptions,
  CalculationChecks,
  PrintBar,
};
