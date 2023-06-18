import styles from './styles.module.css';

interface Props {
  scores: number[];
}
export function Scores({ scores }: Props) {
  const labelText = scores.length < 2 ? 'Score:' : 'Scores:';
  const valueText = scores.join(' | ');

  return (
    <div className={styles.score} v-if="show">
      <label>{labelText}</label>
      <span className={styles.scoreValue}>{valueText}</span>
    </div>
  );
}
