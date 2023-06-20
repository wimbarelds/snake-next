import { usePathname } from 'next/navigation';
import styles from './styles.module.css';
import Link from 'next/link';

interface Props {
  onSetLevelName: (name: string) => void;
}

export function LevelPicker({levels}: {levels: string[]}) {
  const pathname = usePathname();
  // TODO: Dont want this to be client component
  return (
    <div className={styles.backdrop}>
      <div className={styles.menu}>
        <h2>Pick a level</h2>
        <ul className={styles.menuItems}>
          {levels?.map((level) => {
            const url = `/play/${level}`;
            if (url === pathname) {
              return (
                <li key={level}><span className={styles.currentLevel}>{level}</span></li>
              )
            } else {
              return (
                <li key={level}>
                  <Link href={`/play/${level}`}>
                    {level}
                  </Link>
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
}
