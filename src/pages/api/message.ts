import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { BoardService } from 'src/services';

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 500_000_000_0,
  maxFieldsSize: 500_000_000_0,
  maxFields: 15,
  allowEmptyFiles: true,
  multiples: true,
};

function formidablePromise(
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0],
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((accept, reject) => {
    const form = formidable({ ...opts, uploadDir: __dirname });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return accept({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fields, files } = await formidablePromise(req, formidableConfig);

  let imagesString = '';
  let postResponse: unknown;
  const filesAsArray = Object.values(files || {});
  if (filesAsArray.length) {
    for (const savedFile of filesAsArray) {
      const form = new FormData();
      form.append(
        'image',
        fs.createReadStream((savedFile as formidable.File).filepath),
        (savedFile as formidable.File).newFilename,
      );

      postResponse = await axios
        .post<{ original_file: string; thumbnail_file: string }>('/', form, {
          baseURL: 'http://filestore.scheoble.xyz/',
          headers: form.getHeaders(),
        })
        .then((result) => {
          fs.rm((savedFile as formidable.File).filepath, () => null);

          const orig = result.data.original_file;
          const thmb = result.data.thumbnail_file;
          const markedImage = `[![](${thmb})](${orig})`;

          if (fields.multiplyPost === 'true') {
            return BoardService.createPost({
              ...fields,
              message: `${fields.message as unknown as string}\n\n${markedImage}`,
            });
          }

          imagesString = `${imagesString} \n ${markedImage}`;
        });
    }
  }

  if (fields.multiplyPost === 'true' && !filesAsArray.length) {
    res.status(500).send('Нельзя мультплаить пост без файликов');
    return;
  } else if (fields.multiplyPost === 'true') {
    res.status(200).send(postResponse);
  }

  if (fields.multiplyPost === 'false') {
    await BoardService.createPost({
      ...fields,
      message: `${fields.message as unknown as string}\n\n${imagesString}`,
    })
      .then((p) => {
        res.status(200).send(p);
      })
      .catch((error: unknown) => {
        res.status(500).send([(error as AxiosError).response?.data, error]);
      });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
