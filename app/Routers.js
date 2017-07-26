import InitGame from './pages/initGame/InitGame';
import ChooseView from './components/ChooseView';
import ChooseCircleView from './components/ChooseCircleView';
import Main from './pages/game/Main';

const Routes = {
  InitGame: { screen: InitGame },
  ChooseView: { screen: ChooseView },
  ChooseCircleView: { screen: ChooseCircleView },
  Main: { screen: Main },
};

export default Routes;