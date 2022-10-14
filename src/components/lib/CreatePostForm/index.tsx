import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box } from 'src/components/common/Box';
import { Text } from 'src/components/common/Text';
import { theme } from 'src/theme';
import styled from 'styled-components';

interface FormStruct {
  nickname: string;
  subject: string;
  text: string;
  file: FileList;
}

const Container = styled(Box)`
  position: fixed;
  top: 70px;
  right: 50px;

  z-index: 10;

  @media ${theme.mobileBreakpoint} {
    right: 0;
    left: 0;
    bottom: 0;
    top: unset;
  }
`;

const Form = Box.withComponent('form');
let isSendState = false;

const createPost = async (data: {
  tag?: string;
  parent_id?: string;
  subject?: string;
  poster?: string;
  message?: string;
  file?: FileList;
}) => {
  const formData = new FormData();

  [...(data.file || [])].forEach((element, index) => {
    formData.append(`file[${index}]`, element);
  });

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'file') {
      return;
    }

    formData.append(key, value as string);
  });

  return await fetch('/api/message', {
    method: 'POST',
    body: formData,
  });
};

export function CreatePostForm({
  mode,
  parentPostId,
  parentBoardId,
  onCreate,
  changeVisibility,
}: {
  mode: 'post' | 'thread';
  parentPostId?: string;
  parentBoardId?: string;
  onCreate: () => void;
  changeVisibility: (flag: boolean) => void;
}) {
  const [sending, setSending] = useState(false);
  const form = useForm<FormStruct>();
  const handler = async (data: FormStruct) => {
    if (isSendState) {
      return;
    }

    if (!Boolean(data.text) && !Boolean(data.file?.length)) {
      alert('Чот ты не то заполнил в форме, братка; наверн текст забыл или файлик');
      return;
    }

    setSending(true);
    isSendState = true;

    await (mode === 'post'
      ? createPost({
          poster: data.nickname,
          subject: data.subject,
          message: data.text,
          tag: parentBoardId,
          parent_id: parentPostId,
          file: data.file,
        })
      : createPost({
          poster: data.nickname,
          subject: data.subject,
          message: data.text,
          tag: parentBoardId,
          file: data.file,
        }));

    form.reset();
    onCreate();
    isSendState = false;
    setSending(false);
  };

  useEffect(() => {
    const evHandler = ({ postId }: { postId: number }) => {
      console.log(postId);
      form.setValue(
        'text',
        `${form.getValues('text')}${form.getValues('text').length ? '\n\n' : ''}>>${postId}\n`,
      );
    };

    // @ts-ignore
    window.addEventListener('reply_at_post', evHandler);
    // @ts-ignore
    return () => window.removeEventListener('reply_at_post', evHandler);
  }, []);

  return (
    <Container>
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
            {...form.register('text', { required: false })}
          />
        </Box>

        <Box gap='16px'>
          <Box minWidth='50px' width='50px'>
            <Text>Пикчи</Text>
          </Box>

          <input type='file' accept='image/*' multiple {...form.register('file')} />
        </Box>

        <Box justifyContent='flex-end' gap='10px'>
          <button type='button' onClick={() => changeVisibility(false)} disabled={sending}>
            Скрыть
          </button>

          <button type='submit' disabled={sending}>
            {sending ? 'Отправка...' : mode === 'thread' ? 'Создать тред' : 'Ответить'}
          </button>
        </Box>
      </Form>
    </Container>
  );
}
