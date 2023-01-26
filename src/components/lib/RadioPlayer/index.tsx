import { useId, useState } from 'react';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { useRadioData } from 'src/services';
import styled from 'styled-components';

const RotatingBox = styled(Box)`
  animation: rotation 20s infinite linear;
  transition: 0.1s all;
  border-radius: 100%;

  &:hover {
    animation: none;
    border-radius: 4px;
  }

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`;

const HoveredBox = styled(Box)`
  border-radius: 4px;
  transition: 0.1s all;

  &:hover {
    animation: none;
    border-radius: 4px;
  }
`;

const Img = styled('img')`
  max-width: 128px;
  height: 128px;
  transition: 0.1s all;
  object-fit: cover;

  &:hover {
    max-width: 256px;
    height: 256px;
  }
`;

const ts = Date.now();

export const RadioPlayer = ({
  url,
  mount,
  apiBasePath,
  statusUrl,
}: {
  url: string;
  mount: string;
  apiBasePath: string;
  statusUrl: string;
}) => {
  const id = useId();
  const radioData = useRadioData(url, mount, apiBasePath, statusUrl);
  const [isPlaying, setIsPlaying] = useState(false);

  const Comp = isPlaying ? RotatingBox : HoveredBox;

  const content = radioData.data?.streaming ? (
    <>
      <Box flexDirection='column' alignItems='center' width='100%' gap='4px'>
        <Text variant={TextVariant.textBodyBold1}>{`${mount} `}</Text>

        <Text
          variant={TextVariant.textBody1}
          style={{
            whiteSpace: 'pre',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {radioData.data?.playlistData?.name}
        </Text>
      </Box>

      <Box gap='8px' width='100%' justifyContent='center'>
        <Comp borderRadius='100%' overflow='hidden'>
          <Img
            src={`${apiBasePath}api/scanner/image/${radioData.data.currentFile}`}
            alt={radioData.data?.fileData?.id3Artist}
            style={{ width: '100%' }}
          />
        </Comp>
      </Box>

      <Box alignItems='center'>
        <Text
          variant={TextVariant.textBodyBold1}
          style={{ textAlign: 'center' }}
        >{`${radioData.data?.fileData?.id3Artist} - ${radioData.data?.fileData?.id3Title}`}</Text>
      </Box>

      {isPlaying && (
        <audio
          src={`${url}?ts=${encodeURI(`${id}-${ts}`)}`}
          id={`radio_${mount}`}
          autoPlay={false}
        />
      )}

      <Box gap='8px'>
        <button
          type='button'
          onClick={() => {
            setIsPlaying((flag) => {
              const next = !flag;

              setTimeout(() => {
                if (next) {
                  (document.getElementById(`radio_${mount}`) as HTMLAudioElement)
                    ?.play()
                    ?.catch(console.error);
                } else {
                  (document.getElementById(`radio_${mount}`) as HTMLAudioElement)?.pause();
                }
              }, 250);

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
            try {
              const value = ev.target.valueAsNumber;
              const tag = document.getElementById(`radio_${mount}`) as HTMLAudioElement;
              tag.volume = value / 100;
            } catch {}
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
      alignItems='center'
      justifyContent='flex-start'
      padding='8px'
      gap='8px'
      width='100%'
    >
      {content}
    </Box>
  );
};
