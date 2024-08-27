import axios from "axios";

const filestore_request = axios.create({
  baseURL: String(process.env.NEXT_PUBLIC_PISSYKAKA_API).replace('/api', ''),
})

const pissykaka_request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PISSYKAKA_API,
});

export type PissykakaCreatePostPayload = {
  poster?: string;
  subject?: string;
  message: string;
  sage?: string;
  // post in thread
  parent_id?: number;
  // post in board
  tag?: string;
};

export type PissykakaCreatePostResponse = {
  payload: {
    post_id: number;
    password: string;
  };
};

export const pissykaka_api = {
  upload_image: async (image: File) => {
    const form = new FormData();
    form.append('image', image);

    const post_response = await filestore_request
      .post<{ original_file: string; thumbnail_file: string }>('/filestore', form)
      .then((result) => {
        const original_url = result.data.original_file;
        const thumb_url = result.data.thumbnail_file;
        const markedImage = `[![](${thumb_url})](${original_url})`;

        return markedImage;
      });

    return post_response;
  },
  send_post: async (post: PissykakaCreatePostPayload) => {
    const method = post.parent_id !== undefined ? pissykaka_request.put : pissykaka_request.post;
    const url = post.parent_id !== undefined ? `/v2/post/${post.parent_id}` : '/v2/post';
    const post_response = await method<PissykakaCreatePostResponse>(
      url,
      post,
      { validateStatus: status => status >= 200 && status < 300 }
    );
    return post_response.data as PissykakaCreatePostResponse;
  }
};
