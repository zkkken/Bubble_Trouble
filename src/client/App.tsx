// 使用封装的界面组件，组合多个 UI 子组件
import { GameInterface } from './components/GameInterface';
import { TutorialDemo } from './TutorialDemo';

export const App = () => {
  // 暂时使用TutorialDemo来展示教程功能
  // 如果要使用完整游戏界面，请将下面这行改为 return <GameInterface />;
  return <TutorialDemo />;
};