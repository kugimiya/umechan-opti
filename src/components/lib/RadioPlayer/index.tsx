import { useState } from 'react';
import { Box } from 'src/components/common/Box';
import { Text } from 'src/components/common/Text';

export const RadioPlayer = ({ url, mount }: { url: string; mount: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Box flexDirection='column'>
      <Text>mount: {mount}</Text>
      <audio src={url} id={`radio_${mount}`} />
      <button
        type='button'
        onClick={() => {
          setIsPlaying((flag) => {
            const next = !flag;

            if (next) {
              (document.getElementById(`radio_${mount}`) as HTMLAudioElement)?.play();
            } else {
              (document.getElementById(`radio_${mount}`) as HTMLAudioElement)?.pause();
            }

            return next;
          });
        }}
      >
        {isPlaying ? 'не лабать' : 'лабать'}
      </button>
      <input
        type='range'
        name='volume'
        min='0'
        max='100'
        onChange={(ev) => {
          const value = ev.target.valueAsNumber;
          const tag = document.getElementById(`radio_${mount}`) as HTMLAudioElement;
          tag.volume = value / 100;
        }}
      />
    </Box>
  );
};
