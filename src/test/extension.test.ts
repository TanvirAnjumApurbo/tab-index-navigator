import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Tab Index Navigator Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('tanvir-apurbo.tab-index-navigator'));
	});

	test('Commands should be registered', async () => {
		// Test that our commands are registered
		const commands = await vscode.commands.getCommands(true);
		
		// Test tab navigation commands
		for (let i = 1; i <= 10; i++) {
			const commandId = `tabIndexNavigator.gotoTab${i}`;
			assert.ok(commands.includes(commandId), `Command ${commandId} should be registered`);
		}
		
		// Test other commands
		const otherCommands = [
			'tabIndexNavigator.toggleTabIndexOverlay',
			'tabIndexNavigator.showTabList',
			'tabIndexNavigator.showPinnedTabs',
			'tabIndexNavigator.showTabHistory',
			'tabIndexNavigator.goBack'
		];
		
		for (const cmd of otherCommands) {
			assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
		}
	});

	test('Commands should execute without error when no tabs exist', async () => {
		// This test ensures commands don't crash when there are no tabs
		try {
			await vscode.commands.executeCommand('tabIndexNavigator.gotoTab1');
			// If we get here, the command executed without throwing an error
			assert.ok(true);
		} catch (error) {
			assert.fail(`Command should not throw error: ${error}`);
		}
	});

	test('Extension should handle configuration changes', () => {
		const config = vscode.workspace.getConfiguration('tabIndexNavigator');
		
		// Test that configuration properties exist
		assert.notStrictEqual(config.get('showStatusBarItem'), undefined);
		assert.notStrictEqual(config.get('statusBarPosition'), undefined);
		assert.notStrictEqual(config.get('enableQuickPick'), undefined);
		assert.notStrictEqual(config.get('enableTabHistory'), undefined);
	});

	test('Extension should handle telemetry configuration', () => {
		const config = vscode.workspace.getConfiguration('tabIndexNavigator');
		const telemetryEnabled = config.get<boolean>('enableTelemetry');
		
		// Telemetry should be disabled by default
		assert.strictEqual(telemetryEnabled, false);
	});
});
