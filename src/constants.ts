export const API_URI = '/back-api';
export const PAGE_SIZE = 20;
export const NEWS_THREAD = {
  board: 'mod',
  threadId: '28549',
  whitelist: [
    '28550',
    '28551',
    '28555',
    '28603',
    '28883',
    '29109',
    '29355',
    '29438',
    '30281',
    '30621',
    '32335',
    '32917',
    '33025',
    '53720',
    '53779',
  ],
};
export const CUSTOM_NEWS = [
  {
    text: '23.08.23 было перезапущено, плюс небольшие багофиксы',
  },
];

export type Mount = {
  type: 'nesorter' | 'icestats';
  name: string;
  link: string;
  apiBasePath: string;
  statusUrl: string;
};

export const RADIOS_LINKS: Mount[] = [
  {
    type: 'nesorter',
    name: 'neformat',
    link: 'https://chan.kugi.club/stream.mp3',
    apiBasePath: 'https://neformat.kugi.club/',
    statusUrl: 'https://chan.kugi.club/radio-status',
  },
  {
    type: 'icestats',
    name: 'chernarus',
    link: 'https://scheoble.xyz:8080/stream',
    apiBasePath: 'https://scheoble.xyz:8080/',
    statusUrl: 'https://scheoble.xyz:8080/status-json.xsl',
  },
];

export const LINKS = [
  { text: 'Pissychan', href: 'http://pissychan.oxore.net/' },
  { text: 'Оно живое', href: 'http://u05917ya.bget.ru/index.php' },
  { text: 'Discord', href: 'https://discord.gg/DhhjsVgXBG' },
  { text: 'Исходники', href: 'https://github.com/U-Me-Chan' },
];

export const HIDDEN_BOARDS_TAGS = ['fap', 'und'];

export const ADMIN_EMAIL = 'admin@kugi.club';
