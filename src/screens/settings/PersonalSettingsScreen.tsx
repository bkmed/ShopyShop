import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { Theme } from '../../theme';
import { selectSelectedCurrencyCode } from '../../store/slices/currenciesSlice';

export const PersonalSettingsScreen = ({ navigation }: any) => {
  const { theme, themeMode, setThemeMode } = useTheme() as any;
  const { setActiveTab } = React.useContext(WebNavigationContext) as any;
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const selectedCurrency = useSelector(selectSelectedCurrencyCode);

  const themes = [
    { id: 'light', label: t('settings.light') || 'Light' },
    { id: 'dark', label: t('settings.dark') || 'Dark' },
    { id: 'premium', label: t('settings.themePremium') || 'Premium' },
    { id: 'custom', label: t('settings.themeCustom') || 'Custom' },
  ];

  const handleNavigate = (screen: string) => {
    if (Platform.OS === 'web' && setActiveTab) {
      setActiveTab(screen);
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.theme') || 'Theme'}
        </Text>
        <View style={styles.card}>
          {themes.map((th, index) => (
            <TouchableOpacity
              key={th.id}
              style={[
                styles.row,
                (index !== themes.length - 1 || themeMode === 'custom') &&
                  styles.borderBottom,
                themeMode === th.id && styles.selectedRow,
              ]}
              onPress={() => setThemeMode(th.id as any)}
            >
              <Text style={styles.rowText}>{th.label}</Text>
              {themeMode === th.id && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          ))}
          {themeMode === 'custom' && (
            <TouchableOpacity
              style={[styles.row, styles.customThemeButton]}
              onPress={() => handleNavigate('CustomThemeColors')}
            >
              <Text style={styles.customThemeButtonText}>
                🎨 {t('settings.customizeColors') || 'Configure Colors'}
              </Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Regional Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.regional') || 'Regional'}
        </Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleNavigate('Currency')}
          >
            <View>
              <Text style={styles.rowText}>
                {t('settings.currency') || 'Currency'}
              </Text>
              <Text style={[styles.subText, { color: theme.colors.primary }]}>
                {selectedCurrency}
              </Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    sectionTitle: {
      ...theme.textVariants.body,
      fontWeight: 'bold',
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
      marginLeft: theme.spacing.xs,
      textTransform: 'uppercase',
      fontSize: 12,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      overflow: 'hidden',
      ...theme.shadows.small,
      marginBottom: theme.spacing.m,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.l,
    },
    rowText: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      fontSize: 16,
    },
    subText: {
      fontSize: 14,
      marginTop: 4,
      fontWeight: '600',
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedRow: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    checkIcon: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 18,
    },
    customThemeButton: {
      backgroundColor: `${theme.colors.primary}10`,
      marginTop: 0,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    customThemeButtonText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    menuItemArrow: {
      fontSize: 20,
      color: theme.colors.subText,
    },
  });
