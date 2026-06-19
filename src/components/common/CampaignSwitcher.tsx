import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CAMPAIGNS } from '@/data/campaigns';
import { useCampaignStore } from '@/state/campaignStore';
import { useTheme } from '@/theme/ThemeContext';
import { fonts, layout, radius, spacing, type } from '@/theme/tokens';

/**
 * Debug / demo control that stands in for the remote overlay-context service.
 * Tapping a chip swaps the active campaign id, which instantly repaints the
 * whole feed (OTA theme) and swaps the full-screen overlay — no rebuild. This is
 * what you record for each of the three campaign demo videos.
 *
 * Greeting + chips live in the scrollable list header so the chrome stays clean.
 */
function CampaignSwitcherBase(): React.ReactElement {
  const theme = useTheme();
  const activeId = useCampaignStore((s) => s.activeId);
  const setActive = useCampaignStore((s) => s.setActive);

  const select = useCallback(
    (id: string | null) => setActive(id),
    [setActive],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.eyebrowRow}>
        <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
        <Text style={[styles.eyebrow, { color: theme.textMuted }]}>
          LIVE CAMPAIGN — tap to preview an OTA skin
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip
          label="Default"
          selected={activeId === null}
          onPress={() => select(null)}
        />
        {CAMPAIGNS.map((c) => (
          <Chip
            key={c.id}
            label={c.name.replace(/'/g, '')}
            selected={activeId === c.id}
            onPress={() => select(c.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function Chip({ label, selected, onPress }: ChipProps): React.ReactElement {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: theme.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? theme.onPrimary : theme.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: layout.gutter,
    marginBottom: spacing.sm,
  },
  liveDot: { width: 7, height: 7, borderRadius: radius.pill },
  eyebrow: { ...type.caption, fontSize: 11, letterSpacing: 1.2 },
  chips: { paddingHorizontal: layout.gutter, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13 },
});

export const CampaignSwitcher = React.memo(CampaignSwitcherBase);
