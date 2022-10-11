import axios, { AxiosError } from 'axios';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { BoardService } from 'src/services';
const fs = require('fs');
const FormData = require('form-data');

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 100_000_000,
  maxFieldsSize: 100_000_000,
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
  const filesAsArray = Object.values(files || {});
  if (filesAsArray.length) {
    for (let savedFile of filesAsArray) {
      const form = new FormData();
      form.append(
        'image',
        fs.createReadStream((savedFile as formidable.File).filepath),
        (savedFile as formidable.File).newFilename,
      );

      await axios
        .post('/', form, {
          baseURL: 'http://filestore.scheoble.xyz/',
          headers: form.getHeaders(),
        })
        .then((result) => {
          fs.rm((savedFile as formidable.File).filepath, () => {});
          const orig = result.data.original_file;
          const thmb = result.data.thumbnail_file;
          const markedImage = `[![](${thmb})](${orig})`;

          imagesString = `${imagesString} \n ${markedImage}`;
        });
    }
  }

  await BoardService.createPost({ ...fields, message: `${fields.message}\n\n${imagesString}` })
    .then((p) => {
      res.status(200).send(p);
    })
    .catch((error: unknown) => {
      res.status(500).send([(error as AxiosError).response?.data, error]);
    });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
