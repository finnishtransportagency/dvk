import Squat from './components/Squat';
import SquatChart from './components/SquatChart';
import { SquatReducer, initialState } from './hooks/squatReducer';
import SquatContext, { useSquatContext } from './hooks/squatContext';
import { changeLanguage as changeSquatLanguage} from 'i18next';
export { Squat, SquatChart, SquatReducer, useSquatContext, initialState, SquatContext, changeSquatLanguage };
