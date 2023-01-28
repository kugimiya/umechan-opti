import { useState } from 'react';

import { useSettingsContext } from '../../../hooks/useSettingsContext';
import { Box } from '../../common/Box';
import { Text, TextVariant } from '../../common/Text';

export const Settings = () => {
  const { settings, change } = useSettingsContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (name: string, value: boolean) => change(name, value);

  return (
    <Box flexDirection='column' gap='12px'>
      <Text
        variant={TextVariant.textButton}
        onClick={() => {
          setIsExpanded((_) => !_);
        }}
        style={{ cursor: 'pointer' }}
      >
        {isExpanded ? 'Скрыть' : 'Показать'} настройки
      </Text>

      {isExpanded && (
        <Box flexDirection='column'>
          <SettingItem
            title='Показывать баннеры'
            id='show_banners'
            enabled={settings.show_banners}
            onChange={(next) => handleChange('show_banners', next)}
          />

          <SettingItem
            title='Показывать ссылочки'
            id='show_links'
            enabled={settings.show_links}
            onChange={(next) => handleChange('show_links', next)}
          />

          <SettingItem
            title='Показывать вакцинацию'
            id='show_login'
            enabled={settings.show_login}
            onChange={(next) => handleChange('show_login', next)}
          />
        </Box>
      )}
    </Box>
  );
};

const Label = Box.withComponent('label');

export const SettingItem = ({
  enabled,
  title,
  id,
  onChange,
}: {
  enabled: boolean;
  title: string;
  id: string;
  onChange: (next: boolean) => void;
}) => {
  return (
    <Label htmlFor={id}>
      <input
        type='checkbox'
        id={id}
        checked={enabled}
        onChange={(ev) => onChange(ev.target.checked)}
      />

      <Text>{title}</Text>
    </Label>
  );
};
