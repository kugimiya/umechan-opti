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
  // pic
  '55478',
  '57446',
  '55524',
  '54138',
  '4533',
  '55302',
  '55477',
  '52195',
  '5388',
  '28821',
  '34126',
  '28945',
  '15960',
  '3695',
  '55876',
  '57851',
  '57713',
  // vid
  '57865',
  '57721',
  '57677',
  '56952',
  '56898',
  '54821',
  '55370',
  '54828',
  '54032',
  '54012',
  '52433',
  '51714',
  '51243',
  '39882',
  '35202',
  '35166',
  '34588',
  '33937',
  '33873',
  '33933',
  '33876',
  '33238',
  '28333',
  '32571',
  '30992',
  '5719',
  '17920',
  '27317',
  '9630',
  '5914',
  '5742',
  '5384',
  '3340',
  '2227',
  // b
  '57757',
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
  // lib
  '57216',
  '57196',
  '57211',
  '57215',
  '56606',
];

export const ADMIN_EMAIL = 'admin@kugi.club';
