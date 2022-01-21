import React, { useRef, useEffect } from 'react';

import { DosFactory } from 'js-dos';
require('js-dos');
const Dos = window.Dos;

const JsDos = ({ game }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref !== null) {
      const ciPromise = Dos(ref.current, {
        wdosboxUrl: 'https://js-dos.com/6.22/current/wdosbox.js',
        cycles: 1000,
      }).then(runtime => {
        switch(game) {
          case 'doom':
            return runtime.fs.extract('/doomer.zip').then(() => {
              return runtime.main(['-c', 'DOOM.BAT']);
            });
          case 'pacman':
            return runtime.fs.extract('/pacman.zip').then(() => {
              return runtime.main(['./pacman.bat']);
            });
        }
      });

      return () => {
        ciPromise.then(ci => ci.exit());
      };
    }
  }, [ref]);

  return <canvas ref={ref} />;
};

export default JsDos;
