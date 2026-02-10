'use client';

import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Box } from "@/components/layout/Box/Box";

import { modalPostFormContext, modalPostFormContextDefaultValue } from "@/utils/contexts/modalPostForm";

import styles from './PostForm.module.css';
import { pissykakaApi, PissykakaCreatePostPayload } from "@/api/pissykaka";
import { epdsApi } from "@/api/epds";

export const PostForm = () => {
  const router = useRouter();
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [sendLogs, setSendLogs] = useState([] as string[]);
  const modalState = useContext(modalPostFormContext);

  useEffect(() => {
    return () => {
      setSendLogs([]);
    };
  }, []);

  const pushToLog = (msg: string) => {
    setSendLogs(p => [...p, msg]);
  };

  const handleSend = async () => {
    const sender = async (message: string, mdImagesJoined: string) => {
      const data: PissykakaCreatePostPayload = {
        message: `${message}\n${mdImagesJoined}`,
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
        data.parentId = Number(modalState.targetId);
      } else {
        data.tag = String(modalState.targetTag);
      }

      return await pissykakaApi.sendPost(data);
    }

    setSendLogs([]);
    setIsFormLocked(true);
    pushToLog('lock form...');

    const mdImages: string[] = [];
    if (modalState.files?.length) {
      pushToLog('found files, send them to filestore...');

      try {
        for (let i = 0; i < modalState.files.length; i++) {
          const file = modalState.files[i];
          try {
            const mdUri = await pissykakaApi.uploadImage(file);
            mdImages.push(mdUri);
          } catch (error) {
            pushToLog(`error while uploading file: ${file.name} ${(error as Error).message}`);
          }
        }
      } catch (err) {
        pushToLog('image upload failed!');
      } finally {
        pushToLog('uploading done');
      }
    }

    try {
      if (!modalState.separatePictures) {
        pushToLog('creating post without picture separating');
        await sender(modalState.message ?? ' \n ', mdImages.join('\n'));
      } else {
        pushToLog('creating post with picture separating');
        for (const mdImage of mdImages) {
          pushToLog('send message...');
          try {
            await sender(modalState.message ?? ' \n ', mdImage);
          } catch (error) {
            pushToLog(`error while sending post: ${(error as Error).message}`);
          }
        }
      }
    } catch (error) {
      pushToLog(`error while sending post: ${(error as Error).message}`);
    } finally {
      pushToLog('posting done... awaiting changes!');
      try {
        await epdsApi.forceSync(Number(modalState.targetId));
      } catch (error) {
        pushToLog(`error while fetching changes: ${(error as Error).message}`);
      }

      pushToLog('triggering page reload...');
      router.refresh();
    }

    setIsFormLocked(false);
  };

  return (
    <Box flexDirection='column' gap='var(--page-blocks-gap)' className={styles.formRoot}>
      <Box className={styles.formControl} style={{ display: modalState.target === 'board' ? 'none' : 'flex' }}>
        <div className={styles.fieldName}>не поднимать</div>
        <div className={styles.fieldControl}>
          <input disabled={isFormLocked} type='checkbox' name='sage' checked={modalState.sage ?? false} onChange={(ev) => modalState.set({ ...modalState, sage: ev.target.checked })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>никнейм</div>
        <div className={styles.fieldControl}>
          <input disabled={isFormLocked} type='text' name='passport' className={styles.elmInput} value={modalState.nickname ?? ''} onChange={(ev) => modalState.set({ ...modalState, nickname: ev.target.value })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>тема</div>
        <div className={styles.fieldControl}>
          <input disabled={isFormLocked} type='text' name='subject' className={styles.elmInput} value={modalState.subject ?? ''} onChange={(ev) => modalState.set({ ...modalState, subject: ev.target.value })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>сообщение</div>
        <div className={styles.fieldControl}>
          <textarea disabled={isFormLocked} name='message' className={styles.elmTextarea} value={modalState.message ?? ''} onChange={(ev) => modalState.set({ ...modalState, message: ev.target.value })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}>картинка</div>
        <div className={styles.fieldControl}>
          <input disabled={isFormLocked} type='file' name='files' multiple onChange={(ev) => modalState.set({ ...modalState, files: ev.target.files })} />
        </div>
      </Box>

      <Box className={styles.formControl} style={{ display: modalState.target === 'board' ? 'none' : 'flex' }}>
        <div className={styles.fieldName}>separate pics</div>
        <div className={styles.fieldControl}>
          <input disabled={isFormLocked} type="checkbox" name='separatePictures' checked={modalState.separatePictures ?? false} onChange={(ev) => modalState.set({ ...modalState, separatePictures: ev.target.checked })} />
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}></div>
        <div className={clsx(styles.fieldControl, styles.formButtons)}>
          <button disabled={isFormLocked} onClick={() => modalState.set({ ...modalPostFormContextDefaultValue, isOpen: false })}>Закрыть форму</button>
          <button disabled={isFormLocked} onClick={() => handleSend()}>{isFormLocked ? 'Отправка в процессе' : 'Отправить'}</button>
        </div>
      </Box>

      <Box className={styles.formControl}>
        <div className={styles.fieldName}></div>
        <div className={clsx(styles.fieldControl, styles.formLogs)}>
          {sendLogs.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Box>
    </Box>
  );
};
