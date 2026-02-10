import axios from "axios";

const filestoreRequest = axios.create({
  baseURL: String(process.env.NEXT_PUBLIC_PISSYKAKA_API).replace('/api', ''),
})

const pissykakaRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PISSYKAKA_API,
});

export type PissykakaCreatePostPayload = {
  poster?: string;
  subject?: string;
  message: string;
  sage?: string;
  parentId?: number;
  tag?: string;
};

export type PissykakaCreatePostResponse = {
  payload: {
    post_id: number;
    password: string;
  };
};

export const pissykakaApi = {
  uploadImage: async (image: File) => {
    const form = new FormData();
    form.append('image', image);

    const postResponse = await filestoreRequest
      .post<{ original_file: string; thumbnail_file: string }>('/filestore', form)
      .then((result) => {
        const originalUrl = result.data.original_file;
        const thumbUrl = result.data.thumbnail_file;
        const markedImage = `[![](${thumbUrl})](${originalUrl})`;

        return markedImage;
      });

    return postResponse;
  },
  sendPost: async (post: PissykakaCreatePostPayload) => {
    const method = post.parentId !== undefined ? pissykakaRequest.put : pissykakaRequest.post;
    const url = post.parentId !== undefined ? `/v2/post/${post.parentId}` : '/v2/post';
    const body = {
      message: post.message,
      poster: post.poster,
      subject: post.subject,
      sage: post.sage,
      parent_id: post.parentId,
      tag: post.tag,
    };
    const postResponse = await method<PissykakaCreatePostResponse>(
      url,
      body,
      { validateStatus: status => status >= 200 && status < 300 }
    );
    return postResponse.data as PissykakaCreatePostResponse;
  }
};
