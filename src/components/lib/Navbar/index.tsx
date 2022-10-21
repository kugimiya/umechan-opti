import Image from 'next/image';
import Link from 'next/link';
import { memo, useEffect, useState } from 'react';
import { A } from 'src/components/common/A';
import { Box } from 'src/components/common/Box';
import { LINKS, RADIOS_LINKS } from 'src/constants';
import { Board } from 'src/services';
import { isServer } from 'src/utils/isServer';
import { randomInteger } from 'src/utils/randomInteger';

import { RadioPlayer } from '../RadioPlayer';
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
];

type NavbarProps = {
  boards: Board[];
};

export const Navbar = memo(function NavbarMemoized({ boards }: NavbarProps): JSX.Element {
  const [bannerSrc, setBannerSrc] = useState(
    bannersHrefs[randomInteger(0, bannersHrefs.length)] || bannersHrefs[0],
  );

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
    <Box width='100%' flexDirection='column' gap='10px'>
      <Box
        width='100%'
        flexDirection='column'
        justifyContent='flex-start'
        border='colorBgSecondary'
        borderRadius='4px'
        overflow='hidden'
      >
        <Tab title='Досочки'>
          <Link key={'Глагне'} href='/'>
            <A href='/'>Глагне</A>
          </Link>

          <>
            {boards.map((item) => (
              <Link key={item.tag} href={`/board/${item.tag}`}>
                <A href={`/board/${item.tag}`}>{`${item.name} [${item.tag}]`}</A>
              </Link>
            ))}
          </>
        </Tab>

        <Tab title='Ссылочки'>
          {LINKS.map((item) => (
            <A key={item.text} href={item.href} target='_blank'>
              {item.text}
            </A>
          ))}
        </Tab>
      </Box>

      <Box
        justifyContent='center'
        width='100%'
        border='colorBgSecondary'
        borderRadius='4px'
        overflow='hidden'
      >
        <Image alt='Banner' height={100} src={bannerSrc} width={300} />
      </Box>

      {RADIOS_LINKS.map(({ name, link }) => (
        <Box
          key={`${name}-${link}`}
          justifyContent='center'
          width='100%'
          border='colorBgSecondary'
          borderRadius='4px'
          overflow='hidden'
        >
          <RadioPlayer mount={name} url={link} />
        </Box>
      ))}
    </Box>
  );
});
