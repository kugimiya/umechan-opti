import { useForm } from 'react-hook-form';
import { Box } from '../Box';

type FormStruct = {
  nickname: string;
  subject: string;
  text: string;
};

const Form = Box.withComponent('form');
let isSendState = false;

const createPost = (data: unknown) => {
  return fetch('/api/message', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(r => r.json());
}

export const CreatePostForm = ({ mode, parentPostId, parentBoardId }: { mode: 'thread' | 'post', parentPostId?: string, parentBoardId?: string }) => {
  const form = useForm<FormStruct>();
  const handler = async (data: FormStruct) => {
    if (isSendState) {
      return;
    }

    isSendState = true;

    if (mode === 'post') {
      await createPost({
        poster: data.nickname,
        subject: data.subject,
        message: data.text,
        tag: parentBoardId,
        parent_id: parentPostId,
      });
    } else {
      await createPost({
        poster: data.nickname,
        subject: data.subject,
        message: data.text,
        tag: parentBoardId,
      });
    }

    location.reload();
  }

  return (
    <Form 
      flexDirection="column" 
      gap="16px" 
      width="460px" 
      padding="8px" 
      style={{ border: '1px solid black' }}
      onSubmit={form.handleSubmit(handler, () => alert('Чот ты не то заполнил в форме, братка; наверн текст забыл'))}
    >
      <Box gap="16px">
        <Box width="50px" minWidth="50px">Ник</Box>
        <input {...form.register('nickname', { required: false })} />
      </Box>

      <Box gap="16px">
        <Box width="50px" minWidth="50px">Тема</Box>
        <input {...form.register('subject', { required: false })} />
      </Box>

      <Box gap="16px">
        <Box width="50px" minWidth="50px">Текст</Box>
        <textarea style={{ minWidth: 'calc(100% - 66px)', width: '100%', height: '128px' }} {...form.register('text', { required: true })} />
      </Box>

      <Box>
        <button type="submit">{mode === 'thread' ? 'Создать тред' : 'Ответить'}</button>
      </Box>
    </Form>
  );
}
