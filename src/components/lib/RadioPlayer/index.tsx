import { useState } from 'react';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { useRadioData } from 'src/services';

export const RadioPlayer = ({ url, mount }: { url: string; mount: string }) => {
  const radioData = useRadioData();
  const [isPlaying, setIsPlaying] = useState(false);

  const content = radioData.data?.streaming ? (
    <>
      <Box gap='8px' width='100%'>
        <Box borderRadius='4px' overflow='hidden'>
          <img
            src={`/back-api/radio/thumb/${radioData.data.currentFile}`}
            alt={radioData.data?.fileData?.id3Artist}
            style={{ width: '100%', maxWidth: '64px', height: 'auto' }}
          />
        </Box>

        <Box flexDirection='column'>
          <Text variant={TextVariant.textInput}>
            mount: <Text variant={TextVariant.textButton}>{mount}</Text>
          </Text>

          <Text variant={TextVariant.textInput}>
            playlist:{' '}
            <Text variant={TextVariant.textButton}>{radioData.data?.playlistData?.name}</Text>
          </Text>

          <Text variant={TextVariant.textInput}>
            artist:{' '}
            <Text variant={TextVariant.textButton}>{radioData.data?.fileData?.id3Artist}</Text>
          </Text>

          <Text variant={TextVariant.textInput}>
            title:{' '}
            <Text variant={TextVariant.textButton}>{radioData.data?.fileData?.id3Title}</Text>
          </Text>
        </Box>
      </Box>

      <audio src={url} id={`radio_${mount}`} />

      <Box gap='8px'>
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
          {isPlaying ? '⏸' : '▶️'}
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
    </>
  ) : (
    <>
      <Text>Радио сейчас оффлайн</Text>
    </>
  );

  return (
    <Box
      flexDirection='column'
      alignItems='flex-start'
      justifyContent='flex-start'
      padding='8px'
      gap='8px'
      width='100%'
    >
      {content}
    </Box>
  );
};
