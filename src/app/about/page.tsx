import styles from './style.module.css';

export default function Page() {
  return (
    <main className={styles.about}>
      <h1>How this came to be</h1>
      <p>
        Some time ago during work on some iteration of the Clockwork website, there was some time left over.
        Instead of having me do nothing, my team lead instead challenged me to make something fun for the 404 page.
      </p>
      <img src="/404.png" alt="Image of the 404 page snake game" />
      <p>
        A few hours later I had a very rough prototype of the snake game. But, I suppose I had more than a few hours...
        One thing led to another and things like highscores, highscore-replays, AI players and now also a map-editor are available.
      </p>
      <p>
        Well, technically right now the AI player isn't implemented in the new system, but it should be mostly compatible
        and only need some minor retooling. But whenever I get around to doing that I'll also integrate them a little better.
      </p>
    </main>
  );
}