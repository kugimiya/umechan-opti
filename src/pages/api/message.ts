import type { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { createPost } from "src/utils/service";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  createPost(req.body)
    .then((p) => {
      res.status(200).json(p);
    })
    .catch((error: unknown) => {
      res.status(500).json([(error as AxiosError).response?.data, error]);
    });
}
