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
    '54189',
    '54440',
    '54493',
  ],
};
export const CUSTOM_NEWS = [
  {
    text: '23.08.23 было перезапущено, плюс небольшие багофиксы',
  },
];

export type Mount = {
  type: 'nesorter' | 'icestats' | 'tui';
  name: string;
  link: string;
  apiBasePath: string;
  statusUrl: string;
};

export const RADIOS_LINKS: Mount[] = [
  {
    type: 'tui',
    name: 'neformat',
    link: 'https://chan.kugi.club/radio-listen',
    apiBasePath: 'https://neformat.kugi.club',
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
export const HIDDEN_POSTS = [
  // b
  '55630',
  '56809',
  '56647',
  '56425',
  '2319',
  '2288',
  '5844',
  '12291',
  '14424',
  '17682',
  '19049',
  '22889',
  '3750',
  '5277',
  '27976',
  '6359',
  '32360',
  '31064',
  '32496',
  '32841',
  '33097',
  '28270',
  '33823',
  '34651',
  '35043',
  '35365',
  '50840',
  '51262',
  '52010',
  '54184',
  '54497',
  '55951',
];

export const ADMIN_EMAIL = 'admin@kugi.club';
