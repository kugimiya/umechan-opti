// @ts-nocheck

import { Board, BoardService } from 'src/services';

function generateSiteMap(boards: Board[], postsUrls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://chan.kugi.club</loc>
     </url>
     <url>
       <loc>https://chan.kugi.club/all</loc>
     </url>
     ${boards
       .map(({ tag }) => {
         return `
       <url>
           <loc>${`https://chan.kugi.club/board/${tag}`}</loc>
       </url>
     `;
       })
       .join('')}
     ${postsUrls
       .map((url) => {
         return `
        <url>
            <loc>${`https://chan.kugi.club${url}`}</loc>
        </url>
      `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  if (global.__time === undefined) {
    global.__time = Date.now();
  }

  if (global.__cache === undefined) {
    global.__cache = '';
  }

  let sitemap = '';

  if (Date.now() - global.__time > 24 * 60 * 60 * 1000 || !global.__cache) {
    console.log('sitemap requests!', Date.now() - global.__time, 24 * 60 * 60 * 1000);

    const boardResponse = await BoardService.getAllBoards(true);
    const postsUrls: string[] = [];

    for (const board of boardResponse.payload.boards) {
      const postsResponse = await BoardService.getBoard(board.tag, 0, 999999);
      postsResponse.payload.posts?.forEach((post) => {
        postsUrls.push(`/board/${board.tag}/thread/${post.id}`);
      });
    }

    sitemap = generateSiteMap(boardResponse.payload.boards, postsUrls);
    global.__cache = sitemap;
  } else {
    sitemap = global.__cache as string;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  res.setHeader('Content-Type', 'text/xml');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  res.write(sitemap);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
