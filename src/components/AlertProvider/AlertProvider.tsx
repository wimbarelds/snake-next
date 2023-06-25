'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useCallback, useContext, useEffect, useId, useState } from 'react';

type State<S> = [S, Dispatch<SetStateAction<S>>];

const AlertContext = createContext<State<JSX.Element[]>>([
  [],
  () => {
    /* noop */
  },
]);

export function AlertProvider({ children }: { children: ReactNode }) {
  const alertsState = useState<JSX.Element[]>([]);
  return <AlertContext.Provider value={alertsState}>{children}</AlertContext.Provider>;
}

export function AlertOutlet(): ReactNode {
  const [alerts] = useContext(AlertContext);
  return alerts;
}

export function useShowAlert() {
  const uid = useId();
  const [, setAlerts] = useContext(AlertContext);
  const [dialogRef, setDialogRef] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (dialogRef && !dialogRef.open) dialogRef.showModal();
  }, [dialogRef]);

  const getJsx = useCallback(
    (message: string, title: string, okText: string, okHandler: () => void) => (
      <dialog className="alert-dialog" key={uid} ref={setDialogRef}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="alert-buttons">
          <button type="button" onClick={okHandler}>
            {okText}
          </button>
        </div>
      </dialog>
    ),
    [uid],
  );

  return useCallback(
    (message: string, title = 'Alert', okText = 'OK') =>
      new Promise<void>((resolve) => {
        const jsx = getJsx(message, title, okText, okHandler);
        setAlerts((prev) => [...prev, jsx]);
        function okHandler() {
          setAlerts((prev) => prev.filter((item) => item !== jsx));
          resolve();
        }
      }),
    [getJsx, setAlerts],
  );
}
