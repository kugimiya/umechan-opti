import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Box } from 'src/components/common/Box';
import { Text } from 'src/components/common/Text';
import { LINKS } from 'src/constants';
import { Board } from 'src/services';
import { isServer } from 'src/utils/isServer';
import { randomInteger } from 'src/utils/randomInteger';

import { useSettingsContext } from '../../../hooks/useSettingsContext';
import { PassportView } from '../PassportView';
import { Settings } from '../Settings';
import { Tab } from '../Tab';

const bannersHrefs = [
  '/images/1.gif',
  '/images/1.png',
  '/images/2.png',
  '/images/3.png',
  '/images/4.png',
  '/images/5.png',
  '/images/6.jpg',
  '/images/7.jpg',
  '/images/8.jpg',
  '/images/9.jpg',
  '/images/10.jpg',
  '/images/11.jpg',
  '/images/12.jpg',
  '/images/13.jpg',
  '/images/14.jpg',
  '/images/15.jpg',
  '/images/16.jpg',
  '/images/17.jpg',
  '/images/18.jpg',
  '/images/19.jpg',
  '/images/20.jpg',
  '/images/21.png',
  '/images/22.jpg',
];

type NavbarProps = {
  boards: Board[];
};

export const Navbar = function NavbarMemoized({ boards }: NavbarProps): JSX.Element {
  const { settings } = useSettingsContext();
  const [bannerSrc, setBannerSrc] = useState(bannersHrefs[0]);

  useEffect(() => {
    if (isServer()) {
      return;
    }

    const timer = setInterval(() => {
      setBannerSrc(bannersHrefs[randomInteger(0, bannersHrefs.length)] || bannersHrefs[0]);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box $width='100%' $flexDirection='column' $gap='10px' $minWidth='300px' as='aside'>
      <Box
        $width='100%'
        $flexDirection='column'
        $justifyContent='flex-start'
        $border='colorBgSecondary'
        $borderRadius='4px'
        $overflow='hidden'
      >
        <Tab title='Досочки' as='nav'>
          <Link key={'Глагне'} href='/'>
            <Text>Глагне</Text>
          </Link>

          <Link key={'Последнее'} href='/all'>
            <Text>Последнее</Text>
          </Link>

          <>
            {boards.map((item) => (
              <Link key={item.tag} href={`/board/${item.tag}`}>
                <Text>{`${item.name} [${item.tag}]`}</Text>
              </Link>
            ))}
          </>
        </Tab>

        {settings.show_links && (
          <Tab title='Ссылочки' as='nav'>
            {LINKS.map((item) => (
              <Text as='a' key={item.text} href={item.href} target='_blank'>
                {item.text}
              </Text>
            ))}
          </Tab>
        )}
      </Box>

      <Settings />

      {settings.show_login && (
        <Box
          $justifyContent='center'
          $width='100%'
          $border='colorBgSecondary'
          $borderRadius='4px'
          $overflow='hidden'
        >
          <PassportView />
        </Box>
      )}

      {settings.show_banners && (
        <Box
          $justifyContent='center'
          $width='100%'
          $border='colorBgSecondary'
          $borderRadius='4px'
          $overflow='hidden'
        >
          <Image alt='Banner' height={100} src={bannerSrc} width={300} />
        </Box>
      )}
    </Box>
  );
};
