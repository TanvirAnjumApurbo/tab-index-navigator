// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import { t, tp } from './i18n';

// Interface for tab history
interface TabHistoryItem {
	uri: vscode.Uri | undefined;
	label: string;
	timestamp: number;
	groupId: number;
}

// Interface for telemetry data
interface TelemetryData {
	tabSwitches: number;
	shortcutUsage: { [key: string]: number };
	quickPickUsage: number;
	historyUsage: number;
}

// Global variables for overlay functionality
let statusBarItem: vscode.StatusBarItem;
let isOverlayEnabled = true;
let tabChangeListener: vscode.Disposable;
let tabHistory: TabHistoryItem[] = [];
let telemetryData: TelemetryData = {
	tabSwitches: 0,
	shortcutUsage: {},
	quickPickUsage: 0,
	historyUsage: 0
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Track extension start time for telemetry
	(global as any).extensionStartTime = Date.now();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(t('extension.activated'));

	// Initialize immediately for basic functionality
	initializeStatusBarItem();
	
	// Use a small delay to ensure VS Code is fully loaded before setting up listeners and history
	// This helps when the extension auto-starts with VS Code
	setTimeout(() => {
		// Set up tab change listener for real-time updates
		setupTabChangeListener();

		// Also listen to active editor changes for better mouse click detection
		const activeEditorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
			console.log('Active editor changed:', editor?.document?.fileName);
			updateStatusBarItem();
			
			// Find the corresponding tab for this editor
			if (editor) {
				const tabGroups = vscode.window.tabGroups.all;
				let correspondingTab: vscode.Tab | undefined;
				
				for (const group of tabGroups) {
					correspondingTab = group.tabs.find(tab => 
						tab.input instanceof vscode.TabInputText && 
						tab.input.uri.toString() === editor.document.uri.toString()
					);
					if (correspondingTab) {
						break;
					}
				}
				
				if (correspondingTab) {
					const shouldAddToHistory = tabHistory.length === 0 || 
						!tabHistory[0].uri || 
						tabHistory[0].uri.toString() !== editor.document.uri.toString();
					
					if (shouldAddToHistory) {
						console.log('Adding to history from editor change:', correspondingTab.label);
						addToTabHistory(correspondingTab);
					}
				}
			}
		});
		
		context.subscriptions.push(activeEditorChangeListener);

		// Initialize tab history with current active tab
		initializeTabHistory();
		
		// Update status bar after everything is set up
		updateStatusBarItem();
	}, 100); // Small delay to ensure VS Code is ready

	// Register toggle overlay command
	const toggleOverlayDisposable = vscode.commands.registerCommand('tabIndexNavigator.toggleTabIndexOverlay', () => {
		toggleTabIndexOverlay();
	});
	context.subscriptions.push(toggleOverlayDisposable);

	// Register show tab list command
	const showTabListDisposable = vscode.commands.registerCommand('tabIndexNavigator.showTabList', () => {
		showTabListQuickPick();
	});
	context.subscriptions.push(showTabListDisposable);

	// Register show pinned tabs command
	const showPinnedTabsDisposable = vscode.commands.registerCommand('tabIndexNavigator.showPinnedTabs', () => {
		showPinnedTabsQuickPick();
	});
	context.subscriptions.push(showPinnedTabsDisposable);

	// Register show tab history command
	const showTabHistoryDisposable = vscode.commands.registerCommand('tabIndexNavigator.showTabHistory', () => {
		showTabHistoryQuickPick();
	});
	context.subscriptions.push(showTabHistoryDisposable);

	// Register go back command
	const goBackDisposable = vscode.commands.registerCommand('tabIndexNavigator.goBack', () => {
		goBackInHistory();
	});
	context.subscriptions.push(goBackDisposable);

	// Register commands for tabs 1-10
	for (let i = 0; i < 10; i++) {
		const commandId = `tabIndexNavigator.gotoTab${i + 1}`;
		let disposable = vscode.commands.registerCommand(commandId, async () => {
			await navigateToTabByIndex(i);
			recordTelemetry('shortcut', commandId);
		});

		context.subscriptions.push(disposable);
	}
}

// Initialize the status bar item
function initializeStatusBarItem() {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const showStatusBar = config.get<boolean>('showStatusBarItem', true);
	const position = config.get<string>('statusBarPosition', 'right');
	
	if (showStatusBar) {
		const alignment = position === 'left' ? vscode.StatusBarAlignment.Left : vscode.StatusBarAlignment.Right;
		statusBarItem = vscode.window.createStatusBarItem(alignment, 100);
		statusBarItem.command = 'tabIndexNavigator.showTabList';
		statusBarItem.tooltip = 'Click to open tab list (Ctrl+Shift+T) • Current tab index display';
		updateStatusBarItem();
		statusBarItem.show();
	}
}

// Set up listener for tab changes
function setupTabChangeListener() {
	// Listen to both tab changes and group changes
	const tabChangeDisposable = vscode.window.tabGroups.onDidChangeTabs((event) => {
		console.log('Tab change event:', { opened: event.opened?.length, closed: event.closed?.length, changed: event.changed?.length });
		updateStatusBarItem();
		
		// Track history for any tab activation change
		const activeTab = vscode.window.tabGroups.all.find(group => group.isActive)?.activeTab;
		if (activeTab) {
			// Check if this is a different tab from the last one in history
			const shouldAddToHistory = tabHistory.length === 0 || 
				!tabHistory[0].uri || 
				(activeTab.input instanceof vscode.TabInputText && 
				 activeTab.input.uri.toString() !== tabHistory[0].uri?.toString()) ||
				(activeTab.input instanceof vscode.TabInputNotebook && 
				 activeTab.input.uri.toString() !== tabHistory[0].uri?.toString()) ||
				(!activeTab.input || tabHistory[0].label !== activeTab.label);
			
			if (shouldAddToHistory) {
				console.log('Adding to history:', activeTab.label);
				addToTabHistory(activeTab);
			}
		}
	});

	// Also listen to active group changes
	const groupChangeDisposable = vscode.window.tabGroups.onDidChangeTabGroups((event) => {
		console.log('Group change event:', { opened: event.opened?.length, closed: event.closed?.length, changed: event.changed?.length });
		updateStatusBarItem();
		
		// Track active tab when group changes
		const activeTab = vscode.window.tabGroups.all.find(group => group.isActive)?.activeTab;
		if (activeTab) {
			const shouldAddToHistory = tabHistory.length === 0 || 
				!tabHistory[0].uri || 
				(activeTab.input instanceof vscode.TabInputText && 
				 activeTab.input.uri.toString() !== tabHistory[0].uri?.toString()) ||
				(activeTab.input instanceof vscode.TabInputNotebook && 
				 activeTab.input.uri.toString() !== tabHistory[0].uri?.toString()) ||
				(!activeTab.input || tabHistory[0].label !== activeTab.label);
			
			if (shouldAddToHistory) {
				console.log('Adding to history from group change:', activeTab.label);
				addToTabHistory(activeTab);
			}
		}
	});

	// Combine both disposables
	tabChangeListener = vscode.Disposable.from(tabChangeDisposable, groupChangeDisposable);
}

// Update the status bar item with current tab information
function updateStatusBarItem() {
	if (!statusBarItem) {
		return;
	}
	
	try {
		const tabGroups = vscode.window.tabGroups.all;
		const allTabs = tabGroups.flatMap(group => group.tabs);
		const activeTab = tabGroups.find(group => group.isActive)?.activeTab;
		
		if (activeTab && allTabs.length > 0) {
			const currentIndex = allTabs.indexOf(activeTab) + 1;
			const totalTabs = allTabs.length;
			const pinnedCount = allTabs.filter(tab => tab.isPinned).length;
			const groupCount = tabGroups.length;
			
			if (isOverlayEnabled) {
				let text = `$(tab) ${currentIndex}/${totalTabs}`;
				if (activeTab.isPinned) {
					text = `📌 ${text}`;
				}
				if (groupCount > 1) {
					const activeGroupIndex = tabGroups.indexOf(activeTab.group) + 1;
					text += ` G${activeGroupIndex}`;
				}
				statusBarItem.text = text;
			} else {
				let text = `$(tab) ${totalTabs}`;
				if (pinnedCount > 0) {
					text += ` (${pinnedCount} 📌)`;
				}
				statusBarItem.text = text;
			}
			
			// Update tooltip with more information
			let tooltip = `Click to open tab list (Ctrl+Shift+T)\n`;
			tooltip += `Current: ${activeTab.label}\n`;
			tooltip += `Tab ${currentIndex} of ${totalTabs}`;
			if (pinnedCount > 0) {
				tooltip += ` • ${pinnedCount} pinned`;
			}
			if (groupCount > 1) {
				tooltip += ` • ${groupCount} groups`;
			}
			statusBarItem.tooltip = tooltip;
		} else {
			statusBarItem.text = `$(tab) 0/0`;
			statusBarItem.tooltip = 'No tabs open';
		}
	} catch (error) {
		console.error('Error updating status bar item:', error);
		// Fallback display
		statusBarItem.text = `$(tab) Error`;
		statusBarItem.tooltip = 'Error retrieving tab information';
	}
}

// Toggle the tab index overlay
function toggleTabIndexOverlay() {
	isOverlayEnabled = !isOverlayEnabled;
	updateStatusBarItem();
	
	const status = isOverlayEnabled ? t('overlay.enabled') : t('overlay.disabled');
	vscode.window.showInformationMessage(status);
}

// Show quick pick list with all tabs and their indices
async function showTabListQuickPick() {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const enableQuickPick = config.get<boolean>('enableQuickPick', true);
	
	if (!enableQuickPick) {
		vscode.window.showInformationMessage(t('quickPick.disabled'));
		return;
	}
	
	const tabGroups = vscode.window.tabGroups.all;
	const allTabs = tabGroups.flatMap(group => group.tabs);
	
	if (allTabs.length === 0) {
		vscode.window.showInformationMessage(t('quickPick.noTabs'));
		return;
	}
	
	const quickPickItems = createQuickPickItems(allTabs);
	
	const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
		placeHolder: t('quickPick.selectTab'),
		matchOnDescription: true,
		matchOnDetail: true,
		title: t('quickPick.title.allTabs')
	});
	
	if (selectedItem) {
		await handleQuickPickSelection(selectedItem);
		recordTelemetry('quickPick', 'showTabList');
	}
}

// Show quick pick list with only pinned tabs
async function showPinnedTabsQuickPick() {
	const tabGroups = vscode.window.tabGroups.all;
	const allTabs = tabGroups.flatMap(group => group.tabs);
	const pinnedTabs = allTabs.filter(tab => tab.isPinned);
	
	if (pinnedTabs.length === 0) {
		vscode.window.showInformationMessage(t('quickPick.noPinnedTabs'));
		return;
	}
	
	const quickPickItems = createQuickPickItems(pinnedTabs);
	
	const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
		placeHolder: t('quickPick.selectPinnedTab'),
		matchOnDescription: true,
		matchOnDetail: true,
		title: t('quickPick.title.pinnedTabs')
	});
	
	if (selectedItem) {
		await handleQuickPickSelection(selectedItem);
		recordTelemetry('quickPick', 'showPinnedTabs');
	}
}

// Show tab history quick pick
async function showTabHistoryQuickPick() {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const enableTabHistory = config.get<boolean>('enableTabHistory', true);
	
	if (!enableTabHistory) {
		vscode.window.showInformationMessage(t('history.disabled'));
		return;
	}
	
	if (tabHistory.length === 0) {
		vscode.window.showInformationMessage(t('history.noHistory'));
		return;
	}
	
	const quickPickItems: vscode.QuickPickItem[] = tabHistory.map((item, index) => ({
		label: `${index + 1}. ${item.label}`,
		description: t('tab.group', item.groupId),
		detail: formatTimestamp(item.timestamp),
		alwaysShow: true
	}));
	
	const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
		placeHolder: t('quickPick.selectFromHistory'),
		matchOnDescription: true,
		matchOnDetail: true,
		title: t('quickPick.title.history')
	});
	
	if (selectedItem) {
		const match = selectedItem.label.match(/^(\d+)\./);
		if (match) {
			const historyIndex = parseInt(match[1]) - 1;
			const historyItem = tabHistory[historyIndex];
			if (historyItem.uri) {
				try {
					// Try to find the tab in the correct group first
					const tabGroups = vscode.window.tabGroups.all;
					let foundTab: vscode.Tab | undefined;
					
					// Look for the tab in the expected group
					if (historyItem.groupId <= tabGroups.length) {
						const targetGroup = tabGroups[historyItem.groupId - 1];
						foundTab = targetGroup.tabs.find(tab => 
							tab.input instanceof vscode.TabInputText && 
							tab.input.uri.toString() === historyItem.uri!.toString()
						);
					}
					
					// If not found in expected group, search all groups
					if (!foundTab) {
						for (const group of tabGroups) {
							foundTab = group.tabs.find(tab => 
								tab.input instanceof vscode.TabInputText && 
								tab.input.uri.toString() === historyItem.uri!.toString()
							);
							if (foundTab) {
								break;
							}
						}
					}
					
					if (foundTab) {
						// Navigate to the found tab with correct view column
						await vscode.window.showTextDocument(historyItem.uri, {
							viewColumn: foundTab.group.viewColumn,
							preserveFocus: false
						});
					} else {
						// Fallback: try to open in any column
						await vscode.window.showTextDocument(historyItem.uri);
					}
					
					recordTelemetry('history', 'showTabHistory');
				} catch (error) {
					console.error('Error opening tab from history:', error);
					vscode.window.showErrorMessage(t('history.failedToOpen', historyItem.label));
				}
			}
		}
	}
}

// Go back to previous tab in history
async function goBackInHistory() {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const enableTabHistory = config.get<boolean>('enableTabHistory', true);
	
	if (!enableTabHistory) {
		vscode.window.showInformationMessage(t('history.disabled'));
		return;
	}
	
	if (tabHistory.length < 2) {
		vscode.window.showInformationMessage(t('history.noPrevious'));
		return;
	}
	
	console.log('Current history:', tabHistory.map(h => `${h.label} (Group ${h.groupId})`));
	
	// Get the second item in history (first is current tab)
	const previousTab = tabHistory[1];
	if (previousTab.uri) {
		try {
			// Try to find the tab in the correct group first
			const tabGroups = vscode.window.tabGroups.all;
			let foundTab: vscode.Tab | undefined;
			
			console.log('Looking for tab:', previousTab.label, 'in group:', previousTab.groupId);
			
			// Look for the tab in the expected group
			if (previousTab.groupId <= tabGroups.length) {
				const targetGroup = tabGroups[previousTab.groupId - 1];
				foundTab = targetGroup.tabs.find(tab => 
					tab.input instanceof vscode.TabInputText && 
					tab.input.uri.toString() === previousTab.uri!.toString()
				);
				console.log('Found in expected group:', !!foundTab);
			}
			
			// If not found in expected group, search all groups
			if (!foundTab) {
				console.log('Searching all groups...');
				for (const group of tabGroups) {
					foundTab = group.tabs.find(tab => 
						tab.input instanceof vscode.TabInputText && 
						tab.input.uri.toString() === previousTab.uri!.toString()
					);
					if (foundTab) {
						console.log('Found in group:', tabGroups.indexOf(group) + 1);
						break;
					}
				}
			}
			
			if (foundTab) {
				console.log('Navigating to tab in group:', foundTab.group.viewColumn);
				
				// Temporarily disable history tracking to avoid recursion
				const currentHistory = [...tabHistory];
				
				// Navigate to the found tab with correct view column
				await vscode.window.showTextDocument(previousTab.uri, {
					viewColumn: foundTab.group.viewColumn,
					preserveFocus: false
				});
				
				// Update history: move the accessed tab to front and remove it from its previous position
				tabHistory = [previousTab, ...currentHistory.filter((_, index) => index !== 1)];
				
				console.log('Updated history after navigation:', tabHistory.map(h => `${h.label} (Group ${h.groupId})`));
			} else {
				console.log('Tab not found, using fallback');
				// Fallback: try to open in any column
				await vscode.window.showTextDocument(previousTab.uri);
			}
			
			recordTelemetry('history', 'goBack');
		} catch (error) {
			console.error('Error going back in history:', error);
			vscode.window.showErrorMessage(t('history.failedToGoBack', previousTab.label));
		}
	} else {
		// Handle tabs without URIs (like terminals)
		vscode.window.showInformationMessage(t('history.noPrevious'));
	}
}

// Create quick pick items with enhanced information
function createQuickPickItems(tabs: vscode.Tab[]): vscode.QuickPickItem[] {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const showTabGroups = config.get<boolean>('showTabGroups', true);
	const showWorkspaceFolders = config.get<boolean>('showWorkspaceFolders', true);
	
	const tabGroups = vscode.window.tabGroups.all;
	const allTabs = tabGroups.flatMap(group => group.tabs);
	
	return tabs.map((tab) => {
		const globalIndex = allTabs.indexOf(tab) + 1;
		const groupIndex = tab.group.tabs.indexOf(tab) + 1;
		
		// Build label with pinned indicator
		let label = `${globalIndex}. ${tab.label}`;
		if (tab.isPinned) {
			label = `📌 ${label}`;
		}
		
		// Build description with group info
		let description = '';
		if (globalIndex <= 9) {
			description = `Ctrl+${globalIndex}`;
		} else if (globalIndex === 10) {
			description = 'Ctrl+0';
		} else {
			description = 'No shortcut';
		}
		if (showTabGroups && tabGroups.length > 1) {
			const groupNumber = tabGroups.indexOf(tab.group) + 1;
			description += ` • Group ${groupNumber}`;
		}
		
		// Build detail with file path and workspace info
		let detail = getTabInputDescription(tab);
		if (showWorkspaceFolders && tab.input instanceof vscode.TabInputText) {
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(tab.input.uri);
			if (workspaceFolder && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
				detail = `${workspaceFolder.name}/${path.relative(workspaceFolder.uri.fsPath, tab.input.uri.fsPath)}`;
			}
		}
		
		return {
			label,
			description,
			detail,
			alwaysShow: true
		};
	});
}

// Handle quick pick selection
async function handleQuickPickSelection(selectedItem: vscode.QuickPickItem) {
	// Extract the index from the label (remove pinned emoji if present)
	const cleanLabel = selectedItem.label.replace('📌 ', '');
	const match = cleanLabel.match(/^(\d+)\./);
	if (match) {
		const tabIndex = parseInt(match[1]) - 1;
		await navigateToTabByIndex(tabIndex);
	}
}

// Add tab to history
function addToTabHistory(tab: vscode.Tab) {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const enableTabHistory = config.get<boolean>('enableTabHistory', true);
	const historySize = Math.max(1, Math.min(20, config.get<number>('tabHistorySize', 5))); // Clamp between 1-20
	
	if (!enableTabHistory) {
		return;
	}
	
	let uri: vscode.Uri | undefined;
	if (tab.input instanceof vscode.TabInputText) {
		uri = tab.input.uri;
	} else if (tab.input instanceof vscode.TabInputNotebook) {
		uri = tab.input.uri;
	}
	
	// Get a more reliable group ID by finding the group's position
	const tabGroups = vscode.window.tabGroups.all;
	let groupId = 1; // Default to group 1
	for (let i = 0; i < tabGroups.length; i++) {
		if (tabGroups[i] === tab.group) {
			groupId = i + 1;
			break;
		}
	}
	
	// Also check if this group is the active one
	const isActiveGroup = tab.group.isActive;
	console.log(`Adding tab to history: ${tab.label}, Group: ${groupId}, IsActive: ${isActiveGroup}, URI: ${uri?.toString()}`);
	
	const historyItem: TabHistoryItem = {
		uri,
		label: tab.label,
		timestamp: Date.now(),
		groupId
	};
	
	// Check if this tab is already at the top of history (avoid adding same tab twice)
	if (tabHistory.length > 0) {
		const topItem = tabHistory[0];
		const isSameTab = (topItem.uri && uri && topItem.uri.toString() === uri.toString()) ||
			(!topItem.uri && !uri && topItem.label === tab.label && topItem.groupId === groupId);
		
		if (isSameTab) {
			console.log('Tab already at top of history, skipping');
			return;
		}
	}
	
	// Remove existing entry for this tab to avoid duplicates
	const oldLength = tabHistory.length;
	tabHistory = tabHistory.filter(item => {
		// For tabs with URIs, compare URIs
		if (item.uri && uri) {
			return item.uri.toString() !== uri.toString();
		}
		// For tabs without URIs (like terminals), compare label and group
		return !(item.label === tab.label && item.groupId === groupId);
	});
	
	if (tabHistory.length < oldLength) {
		console.log('Removed duplicate entry from history');
	}
	
	// Add to front
	tabHistory.unshift(historyItem);
	console.log('History after adding:', tabHistory.map(h => `${h.label} (G${h.groupId})`));
	
	// Limit size with validated historySize
	if (tabHistory.length > historySize) {
		tabHistory = tabHistory.slice(0, historySize);
		console.log('Trimmed history to size:', historySize);
	}
}

// Format timestamp for display
function formatTimestamp(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	
	if (days > 0) {
		return tp('time.daysAgo', days);
	} else if (hours > 0) {
		return tp('time.hoursAgo', hours);
	} else if (minutes > 0) {
		return tp('time.minutesAgo', minutes);
	} else {
		return t('time.justNow');
	}
}

// Record telemetry data
function recordTelemetry(category: string, action: string) {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const enableTelemetry = config.get<boolean>('enableTelemetry', false);
	
	if (!enableTelemetry) {
		return;
	}
	
	switch (category) {
		case 'shortcut':
			telemetryData.shortcutUsage[action] = (telemetryData.shortcutUsage[action] || 0) + 1;
			telemetryData.tabSwitches++;
			break;
		case 'quickPick':
			telemetryData.quickPickUsage++;
			telemetryData.tabSwitches++;
			break;
		case 'history':
			telemetryData.historyUsage++;
			telemetryData.tabSwitches++;
			break;
	}
	
	// Log telemetry data (in real extension, this would be sent to telemetry service)
	console.log('Tab Navigator Telemetry:', {
		category,
		action,
		totalSwitches: telemetryData.tabSwitches,
		timestamp: new Date().toISOString()
	});
}

// Get description for different tab input types
function getTabInputDescription(tab: vscode.Tab): string {
	if (tab.input instanceof vscode.TabInputText) {
		return t('tab.type.text', tab.input.uri.fsPath);
	} else if (tab.input instanceof vscode.TabInputTextDiff) {
		return t('tab.type.diff', tab.input.original.fsPath, tab.input.modified.fsPath);
	} else if (tab.input instanceof vscode.TabInputNotebook) {
		return t('tab.type.notebook', tab.input.uri.fsPath);
	} else if (tab.input instanceof vscode.TabInputCustom) {
		return t('tab.type.custom', tab.input.viewType);
	} else if (tab.input instanceof vscode.TabInputWebview) {
		return t('tab.type.webview', tab.input.viewType);
	} else if (tab.input instanceof vscode.TabInputTerminal) {
		return t('tab.type.terminal');
	} else {
		return t('tab.type.unknown');
	}
}

// Navigate to tab by index (shared function)
async function navigateToTabByIndex(index: number) {
	const tabGroups = vscode.window.tabGroups.all;
	const allTabs = tabGroups.flatMap(group => group.tabs);

	if (index < allTabs.length) {
		const targetTab = allTabs[index];
		
		try {
			// Add current tab to history before navigating (only if different from target)
			const currentActiveTab = tabGroups.find(group => group.isActive)?.activeTab;
			if (currentActiveTab && currentActiveTab !== targetTab) {
				// Check if current tab is already at the top of history to avoid duplicates
				const shouldAddCurrent = tabHistory.length === 0 || 
					!tabHistory[0].uri || 
					(currentActiveTab.input instanceof vscode.TabInputText && 
					 currentActiveTab.input.uri.toString() !== tabHistory[0].uri?.toString());
				
				if (shouldAddCurrent) {
					addToTabHistory(currentActiveTab);
				}
			}
			
			// Handle different types of tab inputs
			if (targetTab.input instanceof vscode.TabInputText) {
				// Text-based tab
				await vscode.window.showTextDocument(targetTab.input.uri, {
					viewColumn: targetTab.group.viewColumn,
					preserveFocus: false
				});
			} else if (targetTab.input instanceof vscode.TabInputTextDiff) {
				// Diff tab
				await vscode.commands.executeCommand('vscode.diff', 
					targetTab.input.original, 
					targetTab.input.modified, 
					'Diff', 
					{ viewColumn: targetTab.group.viewColumn }
				);
			} else if (targetTab.input instanceof vscode.TabInputNotebook) {
				// Notebook tab
				await vscode.commands.executeCommand('vscode.openWith', 
					targetTab.input.uri, 
					'jupyter-notebook', 
					targetTab.group.viewColumn
				);
			} else if (targetTab.input instanceof vscode.TabInputCustom) {
				// Custom editor tab
				await vscode.commands.executeCommand('vscode.openWith', 
					targetTab.input.uri, 
					targetTab.input.viewType, 
					targetTab.group.viewColumn
				);
			} else {
				// Fallback: try to focus the tab group and show a message
				await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
				vscode.window.showInformationMessage(t('navigation.navigated', index + 1, targetTab.label));
			}
			
			// The tab change listener will handle adding the target tab to history
			// to avoid double entries from programmatic navigation
			
			// Update status bar after navigation
			updateStatusBarItem();
			
			// Record telemetry
			recordTelemetry('navigation', `gotoTab${index + 1}`);
		} catch (error) {
			console.error('Error navigating to tab:', error);
			vscode.window.showErrorMessage(t('navigation.failed', index + 1, targetTab.label));
		}
	} else {
		vscode.window.showInformationMessage(t('navigation.noTab', index + 1, allTabs.length));
	}
}

// Initialize tab history with current active tab
function initializeTabHistory() {
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const enableTabHistory = config.get<boolean>('enableTabHistory', true);
	
	if (!enableTabHistory) {
		return;
	}
	
	// Add the current active tab to history when extension starts
	const activeTab = vscode.window.tabGroups.all.find(group => group.isActive)?.activeTab;
	if (activeTab) {
		addToTabHistory(activeTab);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	// Save telemetry data before deactivation
	const config = vscode.workspace.getConfiguration('tabIndexNavigator');
	const enableTelemetry = config.get<boolean>('enableTelemetry', false);
	
	if (enableTelemetry && telemetryData.tabSwitches > 0) {
		console.log('Tab Navigator Session Summary:', {
			totalTabSwitches: telemetryData.tabSwitches,
			shortcutUsage: telemetryData.shortcutUsage,
			quickPickUsage: telemetryData.quickPickUsage,
			historyUsage: telemetryData.historyUsage,
			sessionDuration: Date.now() - (global as any).extensionStartTime || 0
		});
	}
	
	// Clean up resources
	if (statusBarItem) {
		statusBarItem.dispose();
		statusBarItem = undefined as any;
	}
	if (tabChangeListener) {
		tabChangeListener.dispose();
		tabChangeListener = undefined as any;
	}
	
	// Clear global state to prevent memory leaks
	tabHistory.length = 0;
	telemetryData = {
		tabSwitches: 0,
		shortcutUsage: {},
		quickPickUsage: 0,
		historyUsage: 0
	};
	
	// Clear global extension start time
	delete (global as any).extensionStartTime;
}
