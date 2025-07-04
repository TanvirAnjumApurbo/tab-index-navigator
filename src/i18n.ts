// Internationalization support for Tab Index Navigator
import * as vscode from 'vscode';

interface LocalizedStrings {
	[key: string]: string;
}

const translations: { [locale: string]: LocalizedStrings } = {
	'en': {
		'extension.activated': 'Tab Index Navigator extension is now active!',
		'overlay.enabled': 'Tab index overlay enabled',
		'overlay.disabled': 'Tab index overlay disabled',
		'quickPick.disabled': 'Quick pick is disabled in settings',
		'quickPick.noTabs': 'No tabs are currently open',
		'quickPick.noPinnedTabs': 'No pinned tabs are currently open',
		'quickPick.selectTab': 'Select a tab to navigate to',
		'quickPick.selectPinnedTab': 'Select a pinned tab to navigate to',
		'quickPick.selectFromHistory': 'Select a tab from history',
		'quickPick.title.allTabs': 'Tab Navigator - All Tabs',
		'quickPick.title.pinnedTabs': 'Tab Navigator - Pinned Tabs Only',
		'quickPick.title.history': 'Tab Navigator - History',
		'history.disabled': 'Tab history is disabled in settings',
		'history.noHistory': 'No tab history available',
		'history.noPrevious': 'No previous tab in history',
		'navigation.failed': 'Failed to navigate to tab {0}: {1}',
		'navigation.noTab': 'No tab at index {0}. Only {1} tabs are open.',
		'navigation.navigated': 'Navigated to tab {0}: {1}',
		'history.failedToOpen': 'Failed to open tab from history: {0}',
		'history.failedToGoBack': 'Failed to go back to previous tab: {0}',
		'statusBar.noTabs': 'No tabs open',
		'statusBar.tooltip.base': 'Click to open tab list (Ctrl+Shift+T)',
		'statusBar.tooltip.current': 'Current: {0}',
		'statusBar.tooltip.tabCount': 'Tab {0} of {1}',
		'statusBar.tooltip.pinned': '{0} pinned',
		'statusBar.tooltip.groups': '{0} groups',
		'time.justNow': 'Just now',
		'time.minutesAgo': '{0} minute{1} ago',
		'time.hoursAgo': '{0} hour{1} ago',
		'time.daysAgo': '{0} day{1} ago',
		'shortcut.noShortcut': 'No shortcut',
		'tab.group': 'Group {0}',
		'tab.pinned': 'Pinned',
		'tab.type.text': 'Text: {0}',
		'tab.type.diff': 'Diff: {0} ↔ {1}',
		'tab.type.notebook': 'Notebook: {0}',
		'tab.type.custom': 'Custom: {0}',
		'tab.type.webview': 'Webview: {0}',
		'tab.type.terminal': 'Terminal',
		'tab.type.unknown': 'Unknown tab type'
	},
	'es': {
		'extension.activated': '¡La extensión Tab Index Navigator está activa!',
		'overlay.enabled': 'Superposición de índice de pestañas habilitada',
		'overlay.disabled': 'Superposición de índice de pestañas deshabilitada',
		'quickPick.disabled': 'La selección rápida está deshabilitada en la configuración',
		'quickPick.noTabs': 'No hay pestañas abiertas actualmente',
		'quickPick.noPinnedTabs': 'No hay pestañas fijadas abiertas actualmente',
		'quickPick.selectTab': 'Selecciona una pestaña para navegar',
		'quickPick.selectPinnedTab': 'Selecciona una pestaña fijada para navegar',
		'quickPick.selectFromHistory': 'Selecciona una pestaña del historial',
		'quickPick.title.allTabs': 'Navegador de Pestañas - Todas las Pestañas',
		'quickPick.title.pinnedTabs': 'Navegador de Pestañas - Solo Pestañas Fijadas',
		'quickPick.title.history': 'Navegador de Pestañas - Historial',
		'history.disabled': 'El historial de pestañas está deshabilitado en la configuración',
		'history.noHistory': 'No hay historial de pestañas disponible',
		'history.noPrevious': 'No hay pestaña anterior en el historial',
		'shortcut.noShortcut': 'Sin atajo',
		'tab.group': 'Grupo {0}',
		'tab.pinned': 'Fijada',
		'statusBar.noTabs': 'No hay pestañas abiertas',
		'time.justNow': 'Ahora mismo',
		'time.minutesAgo': 'hace {0} minuto{1}',
		'time.hoursAgo': 'hace {0} hora{1}',
		'time.daysAgo': 'hace {0} día{1}'
	},
	'fr': {
		'extension.activated': 'L\'extension Tab Index Navigator est maintenant active!',
		'overlay.enabled': 'Superposition d\'index d\'onglet activée',
		'overlay.disabled': 'Superposition d\'index d\'onglet désactivée',
		'quickPick.disabled': 'La sélection rapide est désactivée dans les paramètres',
		'quickPick.noTabs': 'Aucun onglet n\'est actuellement ouvert',
		'quickPick.noPinnedTabs': 'Aucun onglet épinglé n\'est actuellement ouvert',
		'quickPick.selectTab': 'Sélectionnez un onglet pour naviguer',
		'quickPick.selectPinnedTab': 'Sélectionnez un onglet épinglé pour naviguer',
		'quickPick.selectFromHistory': 'Sélectionnez un onglet de l\'historique',
		'quickPick.title.allTabs': 'Navigateur d\'Onglets - Tous les Onglets',
		'quickPick.title.pinnedTabs': 'Navigateur d\'Onglets - Onglets Épinglés Seulement',
		'quickPick.title.history': 'Navigateur d\'Onglets - Historique',
		'history.disabled': 'L\'historique des onglets est désactivé dans les paramètres',
		'history.noHistory': 'Aucun historique d\'onglets disponible',
		'history.noPrevious': 'Aucun onglet précédent dans l\'historique',
		'shortcut.noShortcut': 'Aucun raccourci',
		'tab.group': 'Groupe {0}',
		'tab.pinned': 'Épinglé',
		'statusBar.noTabs': 'Aucun onglet ouvert',
		'time.justNow': 'À l\'instant',
		'time.minutesAgo': 'il y a {0} minute{1}',
		'time.hoursAgo': 'il y a {0} heure{1}',
		'time.daysAgo': 'il y a {0} jour{1}'
	}
};

// Get the current locale from VS Code
function getCurrentLocale(): string {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const userLocale = config.get<string>('language');
	
	if (userLocale && translations[userLocale]) {
		return userLocale;
	}
	
	// Use VS Code's locale or fallback to English
	const vscodeLocale = vscode.env.language;
	const primaryLocale = vscodeLocale.split('-')[0]; // e.g., 'en-US' -> 'en'
	
	return translations[primaryLocale] ? primaryLocale : 'en';
}

// Get localized string
export function t(key: string, ...args: any[]): string {
	const locale = getCurrentLocale();
	const localizedString = translations[locale]?.[key] || translations['en'][key] || key;
	
	// Simple string interpolation
	if (args.length > 0) {
		return localizedString.replace(/\{(\d+)\}/g, (match, index) => {
			const argIndex = parseInt(index);
			return args[argIndex] !== undefined ? String(args[argIndex]) : match;
		});
	}
	
	return localizedString;
}

// Get plural form for time strings
export function tp(key: string, count: number): string {
	const locale = getCurrentLocale();
	const pluralSuffix = count > 1 ? 's' : '';
	return t(key, count, pluralSuffix);
}

// Export available locales
export function getAvailableLocales(): string[] {
	return Object.keys(translations);
}
