import { useCallback, useRef, useState } from 'react';

import styles from './styles.module.css';

interface Props {
  numPlayers: number;
  onClose: () => void;
  onPlayBot: (bots: Worker[]) => void;
}

export function BotLoader({ numPlayers, onClose, onPlayBot }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [botUrl, setBotUrl] = useState('');

  const fileName = file?.name ?? 'No file selected';

  const onFileChange = useCallback(() => {
    setFile(null);
    const fileInput = fileInputRef.current;
    if (fileInput?.files?.length) {
      setFile(fileInput.files[0]);
    }
  }, []);

  const onFileSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Must pick file');
    const bots: Worker[] = new Array(numPlayers)
      .fill(null)
      .map(() => new Worker(URL.createObjectURL(file)));
    onPlayBot(bots);
  }, []);

  const onURLSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const url = botUrl || `${location.protocol}//${location.host}/wim-bot.js`;
    const script = await fetch(url).then((res) => res.text());
    const bots: Worker[] = new Array(numPlayers)
      .fill(null)
      .map(() => new Worker(URL.createObjectURL(new Blob([script]))));
    onPlayBot(bots);
  }, []);

  return (
    <div className="overlay__container">
      <div className="overlay__backdrop"></div>
      <div className="overlay__content modal">
        <div className="modal__title">
          <h2>Bot loader</h2>
          <button className="modal__close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal__body">
          <p>
            You can create a bot for this game and run it in a webworker. The bot will receive
            relevant game info and be able to send input to the game.
          </p>
          <p>
            You can either load a bot from a URL (which will need to allow cross-origin requests),
            or upload a file.
          </p>
          <form className={styles.botLoaderOption} onSubmit={onURLSubmit}>
            <h3>Enter Bot-script URL</h3>
            <div className="form">
              <input
                type="url"
                placeholder="http://"
                value={botUrl}
                onInput={(e) => setBotUrl((e.target as HTMLInputElement).value)}
              />
              <button type="submit">Load bot from URL</button>
            </div>
          </form>
          <form className="bot-loader-option" onSubmit={onFileSubmit}>
            <h3>Pick a file</h3>
            <div className="form">
              <label className="upload-file">
                <span className={'filename' + !file ? 'empty' : ''}>{fileName}</span>
                <input type="file" required ref={fileInputRef} onChange={onFileChange} />
              </label>
              <button type="submit">Load bot from File</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
