import { useQuery } from '@tanstack/react-query';
import styles from './styles.module.css';
import { getLevels } from '@/actions/actions';

interface Props {
  onSetLevelName: (name: string) => void;
}

export function LevelPicker({ onSetLevelName }: Props) {
  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: getLevels,
  });

  return (
    <div className={styles.backdrop}>
      <div className={styles.menu}>
        <h2>Pick a level</h2>
        <div className={styles.menuItems}>
          {levels?.map((level) => (
            <button type="button" key={level} onClick={() => onSetLevelName(level)}>
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
