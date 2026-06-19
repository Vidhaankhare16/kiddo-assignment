import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { layout, radius, spacing, type } from '@/theme/tokens';

/**
 * Shared row header for grids and collections. The little accent bar on the left
 * samples the active theme/collection accent, tying section headers to the OTA
 * skin without any per-section color logic leaking into the blocks.
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
}

function SectionHeaderBase({
  title,
  subtitle,
  accent,
}: SectionHeaderProps): React.ReactElement {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: accent ?? theme.primary }]} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.gutter,
    marginBottom: spacing.md,
  },
  bar: { width: 5, height: 24, borderRadius: radius.pill },
  textCol: { flex: 1 },
  title: { ...type.sectionTitle },
  subtitle: { ...type.caption, marginTop: 2 },
});

export const SectionHeader = React.memo(SectionHeaderBase);
