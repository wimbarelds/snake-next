import { getLevel, getLevels } from '@/actions/actions';
import { Play } from '@/components/Play/Play';

export default async function PlayPage({params: {level: levelName}}: {params: {level: string}}) {
  const [level, levelNames] = await Promise.all([getLevel(levelName), getLevels()]);
  return <Play level={level} levelNames={levelNames} />;
}
