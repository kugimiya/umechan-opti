import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  clearFromLocalStorage,
  Passport,
  usePassportContext,
  writeToLocalStorage,
} from '../../../hooks/usePassportContext';
import { BoardService } from '../../../services';
import { Box } from '../../common/Box';
import { Text, TextVariant } from '../../common/Text';

export const PassportView = () => {
  const credentialsForm = useForm<Passport>();
  const [viewMode, setViewMode] = useState<'none' | 'input' | 'register'>('none');
  const { passport, isAuthorized } = usePassportContext();

  const handleRegister = (form: Passport) => {
    BoardService.registerPassport(form)
      .then(() => {
        writeToLocalStorage(form);
        credentialsForm.reset();
      })
      .catch(console.error);
  };

  const handleLogin = (form: Passport) => {
    writeToLocalStorage(form);
    credentialsForm.reset();
  };

  let content;

  if (!isAuthorized) {
    if (viewMode === 'none') {
      content = (
        <>
          <Text>Вакцинирован?</Text>

          <Text
            $variant={TextVariant.textButton}
            $color='colorTextLink'
            onClick={() => setViewMode('input')}
            style={{ cursor: 'pointer' }}
          >
            Ввести QR-код
          </Text>

          <Text
            $variant={TextVariant.textButton}
            $color='colorTextLink'
            onClick={() => setViewMode('register')}
            style={{ cursor: 'pointer' }}
          >
            Зарегать QR-код
          </Text>
        </>
      );
    }

    if (viewMode === 'input') {
      content = (
        <>
          <Text>Welcome back</Text>

          <Box
            as='form'
            $flexDirection={'column'}
            $gap={'4px'}
            onSubmit={credentialsForm.handleSubmit(handleLogin, (errors) =>
              alert(JSON.stringify([errors.name?.message, errors.key?.message])),
            )}
          >
            <input
              placeholder='Имя'
              {...credentialsForm.register('name', { required: 'name required' })}
            />

            <input
              placeholder='Ключ'
              {...credentialsForm.register('key', { required: 'key required' })}
            />

            <button type='submit'>на, держи</button>
          </Box>

          <Text
            $variant={TextVariant.textButton}
            $color='colorTextLink'
            onClick={() => setViewMode('none')}
            style={{ cursor: 'pointer' }}
          >
            отмена
          </Text>
        </>
      );
    }

    if (viewMode === 'register') {
      content = (
        <>
          <Text>Представьтесь</Text>

          <Box
            as='form'
            $flexDirection={'column'}
            $gap={'4px'}
            onSubmit={credentialsForm.handleSubmit(handleRegister, (errors) =>
              alert(JSON.stringify([errors.name?.message, errors.key?.message])),
            )}
          >
            <input
              placeholder='Имя'
              {...credentialsForm.register('name', { required: 'name required' })}
            />

            <input
              placeholder='Ключ'
              {...credentialsForm.register('key', { required: 'key required' })}
            />

            <button type='submit'>хоба-на</button>
          </Box>

          <Text
            $variant={TextVariant.textButton}
            $color='colorTextLink'
            onClick={() => setViewMode('none')}
            style={{ cursor: 'pointer' }}
          >
            отмена
          </Text>
        </>
      );
    }
  } else {
    content = (
      <>
        <Text $variant={TextVariant.textInput}>Привет, {passport?.name}</Text>

        <Text
          $variant={TextVariant.textButton}
          $color='colorTextLink'
          style={{ cursor: 'pointer' }}
          onClick={() => clearFromLocalStorage()}
        >
          выйти из матрицы
        </Text>
      </>
    );
  }

  return (
    <Box $width='100%' $padding='4px' $gap='4px' $flexDirection='column' $alignItems='flex-start'>
      {content}
    </Box>
  );
};
