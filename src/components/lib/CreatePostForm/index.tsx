import { useForm } from 'react-hook-form';
import { Box } from 'src/components/common/Box';
import { Text } from 'src/components/common/Text';
import { theme } from 'src/theme';

interface FormStruct {
  nickname: string;
  subject: string;
  text: string;
}

const Form = Box.withComponent('form');
let isSendState = false;

const createPost = async (data: unknown) =>
  await fetch('/api/message', {
    method: 'POST',
    body: JSON.stringify(data),

    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async (r) => await r.json());

export function CreatePostForm({
  mode,
  parentPostId,
  parentBoardId,
  onCreate,
}: {
  mode: 'post' | 'thread';
  parentPostId?: string;
  parentBoardId?: string;
  onCreate: () => void;
}) {
  const form = useForm<FormStruct>();
  const handler = async (data: FormStruct) => {
    if (isSendState) {
      return;
    }

    isSendState = true;

    await (mode === 'post'
      ? createPost({
          poster: data.nickname,
          subject: data.subject,
          message: data.text,
          tag: parentBoardId,
          parent_id: parentPostId,
        })
      : createPost({
          poster: data.nickname,
          subject: data.subject,
          message: data.text,
          tag: parentBoardId,
        }));

    form.reset();
    onCreate();
    isSendState = false;
  };

  return (
    <Form
      flexDirection='column'
      gap='16px'
      onSubmit={form.handleSubmit(handler, () => {
        alert('Чот ты не то заполнил в форме, братка; наверн текст забыл');
      })}
      padding='8px'
      border='colorBgSecondary'
      backgroundColor='colorBgPrimary'
      borderRadius='4px'
      style={{ position: 'fixed', top: '70px', right: '50px' }}
      width='460px'
    >
      <Box gap='16px'>
        <Box minWidth='50px' width='50px'>
          <Text>Ник</Text>
        </Box>
        <input {...form.register('nickname', { required: false })} />
      </Box>

      <Box gap='16px'>
        <Box minWidth='50px' width='50px'>
          <Text>Тема</Text>
        </Box>
        <input {...form.register('subject', { required: false })} />
      </Box>

      <Box gap='16px'>
        <Box minWidth='50px' width='50px'>
          <Text>Текст</Text>
        </Box>
        <textarea
          style={{
            minWidth: 'calc(100% - 66px)',
            width: '100%',
            height: '128px',
          }}
          {...form.register('text', { required: true })}
        />
      </Box>

      <Box>
        <button type='submit'>{mode === 'thread' ? 'Создать тред' : 'Ответить'}</button>
      </Box>
    </Form>
  );
}
