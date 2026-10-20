import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Icon, type IconName } from '@/components/ui/Icon';
import {
  addDays,
  formatRelativeDay,
  formatShortDate,
  parseDateKey,
  toDateKey,
  toTimeString,
  type DateKey,
  type TimeString,
} from '@/lib/date';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, touchTarget } from '@/theme/tokens';

interface DueDateFieldProps {
  date: DateKey | null;
  time: TimeString | null;
  today: DateKey;
  onChange: (date: DateKey | null, time: TimeString | null) => void;
  error?: string;
}

type PickerMode = 'date' | 'time';

function toPickerValue(date: DateKey | null, time: TimeString | null, today: DateKey): Date {
  const value = parseDateKey(date ?? today);
  const [hours, minutes] = (time ?? '09:00').split(':').map(Number);
  value.setHours(hours, minutes);
  return value;
}

export function DueDateField({ date, time, today, onChange, error }: DueDateFieldProps) {
  // iOS : sélecteur intégré à l'écran. Android : boîte de dialogue native (impérative).
  const [iosPicker, setIosPicker] = useState<PickerMode | null>(null);
  const tomorrow = addDays(today, 1);

  const applyPicked = (mode: PickerMode, picked: Date) => {
    if (mode === 'date') onChange(toDateKey(picked), time);
    else onChange(date ?? today, toTimeString(picked));
  };

  const openPicker = (mode: PickerMode) => {
    const value = toPickerValue(date, time, today);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        is24Hour: true,
        onChange: (event: DateTimePickerEvent, picked?: Date) => {
          if (event.type === 'set' && picked) applyPicked(mode, picked);
        },
      });
    } else {
      setIosPicker((current) => (current === mode ? null : mode));
    }
  };

  const dateLabel = date ? formatRelativeDay(date, today) : 'Sans échéance';
  const dateAccessibility = date ? `${dateLabel}, ${formatShortDate(date)}` : dateLabel;

  return (
    <View style={styles.container}>
      <AppText variant="bodyStrong">Échéance · facultative</AppText>
      <View style={styles.chips}>
        <Chip label="Aujourd’hui" selected={date === today} onPress={() => onChange(today, time)} />
        <Chip label="Demain" selected={date === tomorrow} onPress={() => onChange(tomorrow, time)} />
        <Chip label="Sans échéance" selected={date === null} onPress={() => onChange(null, null)} />
      </View>
      <View style={styles.row}>
        <PickerButton
          icon="calendar"
          label={dateLabel}
          placeholder={date === null}
          accessibilityLabel={`Date d’échéance : ${dateAccessibility}. Modifier`}
          onPress={() => openPicker('date')}
          grow
        />
        <PickerButton
          icon="clock"
          label={time ?? 'Heure'}
          placeholder={time === null}
          accessibilityLabel={time ? `Heure : ${time}. Modifier` : 'Ajouter une heure'}
          onPress={() => openPicker('time')}
          onClear={time ? () => onChange(date, null) : undefined}
        />
      </View>
      {iosPicker && (
        <DateTimePicker
          value={toPickerValue(date, time, today)}
          mode={iosPicker}
          display={iosPicker === 'date' ? 'inline' : 'spinner'}
          locale="fr-FR"
          onChange={(_event, picked) => picked && applyPicked(iosPicker, picked)}
        />
      )}
      {error && (
        <AppText variant="meta" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

interface PickerButtonProps {
  icon: IconName;
  label: string;
  placeholder: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  onClear?: () => void;
  grow?: boolean;
}

function PickerButton({
  icon,
  label,
  placeholder,
  accessibilityLabel,
  onPress,
  onClear,
  grow = false,
}: PickerButtonProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.field,
        grow && styles.grow,
        { backgroundColor: colors.surface, borderColor: colors.borderStrong },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        android_ripple={{ color: colors.ripple }}
        style={styles.fieldPressable}>
        <Icon name={icon} size={18} color={placeholder ? 'textSecondary' : 'textPrimary'} />
        <AppText variant="body" tone={placeholder ? 'secondary' : 'primary'} numberOfLines={1}>
          {label}
        </AppText>
      </Pressable>
      {onClear && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retirer l’heure"
          onPress={onClear}
          hitSlop={8}
          style={styles.clear}>
          <Icon name="x" size={16} color="textSecondary" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  grow: {
    flex: 1,
  },
  fieldPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget + 4,
    paddingHorizontal: spacing.lg,
    flexShrink: 1,
  },
  clear: {
    paddingRight: spacing.md,
  },
});
