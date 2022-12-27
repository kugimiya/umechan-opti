import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { BoardService, ThreadData } from 'src/services';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cursors = req.query || {};
  let threads = [] as ThreadData[];
  const response = {} as Record<string, { title: string; currentCursor: string; tag: string }>;

  axios.defaults.baseURL = 'http://scheoble.xyz/api';

  await Promise.all(
    Object.entries(cursors).map(async (cursor) => {
      const [threadId] = cursor;
      const thread = (
        await BoardService.getThread(threadId.replaceAll('cursors[', '').replaceAll(']', ''))
      ).payload.thread_data;
      threads.push(thread);
    }),
  );

  threads = threads.sort((a, b) => Number(a.id) - Number(b.id));

  for (const thread of threads) {
    response[thread.id?.toString() || ''] = {
      title:
        thread.subject ||
        `${
          thread.truncated_message?.slice(0, 20).replaceAll('\n', '') ||
          `тред #${Number(thread.id)}`
        }`,
      currentCursor: thread.replies?.at(-1)?.id?.toString() || '',
      tag: thread.board_id?.toString() || '',
    };
  }

  res.status(200).json(response);
}
