import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon, IconName } from '../../components/ui/Icon';
import styles from './PwaBanner.module.css';

export type PwaBannerPosition = 'top' | 'bottom';

export interface PwaBannerProps {
  /** Иконка */
  icon: IconName;
  /** Заголовок */
  title: string;
  /** Описание */
  description: string;
  /** Текст основной кнопки */
  primaryText: string;
  /** Текст кнопки отклонения (пустая строка = не показывать) */
  dismissText?: string;
  /** Обработчик основного действия */
  onPrimary: () => void;
  /** Обработчик отклонения */
  onDismiss: () => void;
  /** Позиция на экране */
  position?: PwaBannerPosition;
  /** Полная ширина (для мобильных) */
  fullWidth?: boolean;
  /** Загрузка */
  isLoading?: boolean;
}

/**
 * Универсальный баннер для PWA-уведомлений
 *
 * Layout: иконка слева, текст справа, снизу две кнопки по 50% ширины
 */
export const PwaBanner: React.FC<PwaBannerProps> = ({
  icon,
  title,
  description,
  primaryText,
  dismissText = '',
  onPrimary,
  onDismiss,
  position = 'bottom',
  fullWidth = false,
  isLoading = false,
}) => {
  const displayTitle = isLoading ? 'Обновление...' : title;
  const displayDescription = isLoading ? 'Применяем обновление' : description;
  const displayPrimaryText = isLoading ? 'Обновление' : primaryText;

  return (
    <div
      className={styles.container}
      data-position={position}
      data-full-width={fullWidth}
    >
      <Card variant="elevated" className={styles.card}>
        <div className={styles.main}>
          <div className={styles.iconWrapper}>
            {isLoading ? (
              <div className={styles.spinner} />
            ) : (
              <Icon name={icon} className={styles.icon} />
            )}
          </div>

          <div className={styles.text}>
            <h3 className={styles.title}>{displayTitle}</h3>
            <p className={styles.description}>{displayDescription}</p>
          </div>
        </div>

        <div className={styles.actions}>
          {dismissText && !isLoading && (
            <Button
              variant="ghost"
              size="small"
              onClick={onDismiss}
              className={styles.dismissButton}
            >
              {dismissText}
            </Button>
          )}
          <Button
            variant="primary"
            size="small"
            onClick={onPrimary}
            disabled={isLoading}
            className={styles.primaryButton}
          >
            {displayPrimaryText}
          </Button>
        </div>
      </Card>
    </div>
  );
};
