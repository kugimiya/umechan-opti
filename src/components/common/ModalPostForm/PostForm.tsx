'use client';

import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Box } from "@/components/layout/Box/Box";

import { modalPostFormContext, modalPostFormContextDefaultValue } from "@/utils/contexts/modal-post-form";

import styles from './PostForm.module.css';
import { pissykaka_api, PissykakaCreatePostPayload } from "@/api/pissykaka";

export const PostForm = () => {
  const router = useRouter();
  const [is_form_locked, set_is_form_locked] = useState(false);
  const [send_logs, set_send_logs] = useState([] as string[]);
  const modalState = useContext(modalPostFormContext);

  // clear logs on unmount for no reason
  useEffect(() => {
    return () => {
      set_send_logs([]);
    };
  }, []);

  const pushToLog = (msg: string) => {
    set_send_logs(p => [...p, msg]);
  };

  const handleSend = async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const sender = async (message: string, md_images_joined: string) => {
      const data: PissykakaCreatePostPayload = {
        message: `${message}\n${md_images_joined}`,
      };

      if (modalState.nickname) {
        data.poster = modalState.nickname;
      }

      if (modalState.subject) {
        data.subject = modalState.subject;
      }

      if (modalState.sage) {
        data.sage = 'не_поднимать_это_говно';
      }

      if (modalState.target === 'thread') {
        data.parent_id = Number(modalState.target_id);
      } else {
        data.tag = String(modalState.target_tag);
      }

      const response = await pissykaka_api.send_post(data);
      console.log({ response: response.payload });
      return response;
    }

    set_send_logs([]);
    set_is_form_locked(true);
    pushToLog('lock form...');

    const md_images: string[] = [];
    if (modalState.files?.length) {
      pushToLog('found files, send them to filestore...');

      try {
        for (let i = 0; i < modalState.files.length; i++) {
          const file = modalState.files[i];
          md_images.push(
            await pissykaka_api.upload_image(file)
          );
        }
      } catch (err) {
        pushToLog('image upload failed!');
      } finally {
        pushToLog('uploading done');
      }
    }

    try {
      if (!modalState.separate_pictures) {
        pushToLog('creating post without picture separating');
        await sender(modalState.message ?? ' \n ', md_images.join('\n'));
      } else {
        pushToLog('creating post with picture separating');
        for (let md_image of md_images) {
          pushToLog('send message...');
          await sender(modalState.message ?? ' \n ', md_image);
        }
      }
    } catch {
      pushToLog('something went wrong!');
    } finally {
      pushToLog('posting done... awaiting changes!');
      await sleep(2000);

      pushToLog('triggering page reload...');
      router.refresh();
    }

    set_is_form_locked(false);
  };

  return (
    <Box flexDirection='column' gap='var(--page-blocks-gap)' className={styles.formRoot}>
      <Box className={styles.formControl}>
        <div className={styles.fieldName}>не поднимать</div>
        <div className={styles.fieldControl}>
          <input disabled={is_form_locked} type='checkbox' name='sage' checked={modalState.sage ?? false} onChange={(ev) => modalState.set({ ...modalState, sage: ev.target.checked })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>никнейм</div>
        <div className={styles.fieldControl}>
          <input disabled={is_form_locked} type='text' name='passport' className={styles.elmInput} value={modalState.nickname ?? ''} onChange={(ev) => modalState.set({ ...modalState, nickname: ev.target.value })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>тема</div>
        <div className={styles.fieldControl}>
          <input disabled={is_form_locked} type='text' name='subject' className={styles.elmInput} value={modalState.subject ?? ''} onChange={(ev) => modalState.set({ ...modalState, subject: ev.target.value })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>сообщение</div>
        <div className={styles.fieldControl}>
          <textarea disabled={is_form_locked} name='message' className={styles.elmTextarea} value={modalState.message ?? ''} onChange={(ev) => modalState.set({ ...modalState, message: ev.target.value })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>картинка</div>
        <div className={styles.fieldControl}>
          <input disabled={is_form_locked} type='file' name='files' multiple onChange={(ev) => modalState.set({ ...modalState, files: ev.target.files })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>separate pics</div>
        <div className={styles.fieldControl}>
          <input disabled={is_form_locked} type="checkbox" name='separate_pictures' checked={modalState.separate_pictures ?? false} onChange={(ev) => modalState.set({ ...modalState, separate_pictures: ev.target.checked })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}></div>
        <div className={clsx(styles.fieldControl, styles.formButtons)}>
          <button disabled={is_form_locked} onClick={() => modalState.set({ ...modalPostFormContextDefaultValue, isOpen: false })}>Закрыть форму</button>
          <button disabled={is_form_locked} onClick={() => handleSend()}>{is_form_locked ? 'Отправка в процессе' : 'Отправить'}</button>
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}></div>
        <div className={clsx(styles.fieldControl, styles.formLogs)}>
          {send_logs.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Box>
    </Box>
  );
};
