# Change Log

All notable changes to the "Tab Index Navigator" extension will be documented in this file.

## [1.0.0] - 2025-07-03

### ✨ Added
- **Pinned Tabs Support**: Visual indicators (📌) for pinned tabs in quick pick
- **Filter Pinned Tabs**: New command `Ctrl+Shift+P` to show only pinned tabs
- **Tab Group Awareness**: Display editor group information (Group 1, Group 2, etc.)
- **Multi-Group Status**: Status bar shows current group when multiple groups are open
- **Workspace Awareness**: Show folder names for multi-root workspaces
- **Smart Path Display**: Format file paths as `folder/file.ts` for better organization
- **Tab History**: Track the last 5 tabs visited with timestamps
- **Go Back Navigation**: New command `Ctrl+Alt+Left` to return to previous tab
- **History Quick Pick**: New command `Ctrl+Shift+H` to browse tab history
- **Enhanced Status Bar**: Rich tooltips with detailed tab information
- **Smart Status Display**: Different information modes based on context
- **Internationalization**: Support for English, Spanish, and French
- **Language Auto-Detection**: Uses VS Code's language setting automatically
- **Optional Telemetry**: Anonymous usage analytics (opt-in only)
- **Privacy Controls**: All telemetry can be disabled in settings

### 🎨 Enhanced
- **Status Bar Information**: Shows pinned count, group info, and enhanced tooltips
- **Quick Pick Display**: Improved with pinned indicators, group info, and workspace context
- **Accessibility**: Better keyboard navigation and screen reader support
- **Error Handling**: Improved error messages and recovery

### ⚙️ Configuration
- `tabIndexNavigator.showTabGroups`: Show tab group information (default: true)
- `tabIndexNavigator.showWorkspaceFolders`: Show workspace folder names (default: true)
- `tabIndexNavigator.enableTabHistory`: Enable tab history tracking (default: true)
- `tabIndexNavigator.tabHistorySize`: History size limit (default: 5, range: 1-20)
- `tabIndexNavigator.enableTelemetry`: Enable anonymous telemetry (default: false)
- `tabIndexNavigator.language`: Interface language (default: "en")

### 🔧 Technical
- Added comprehensive internationalization system
- Improved tab type detection and handling
- Enhanced workspace folder detection
- Better performance with large tab sets
- Reduced memory footprint

## [0.0.1] - 2024-12-XX

### ✨ Initial Release
- **Tab Navigation**: Keyboard shortcuts `Ctrl+1` through `Ctrl+9`
- **Status Bar Display**: Current tab index overlay (e.g., "3/7")
- **Quick Pick List**: Interactive tab list with `Ctrl+Shift+T`
- **Toggle Overlay**: Command to enable/disable status bar overlay
- **Multi-Platform**: Support for Windows, macOS, and Linux
- **Tab Type Support**: Text files, notebooks, diffs, custom editors, webviews, terminals
- **Configurable**: Status bar position and overlay settings

### ⚙️ Configuration
- `tabIndexNavigator.showStatusBarItem`: Show/hide status bar item (default: true)
- `tabIndexNavigator.statusBarPosition`: Status bar position (default: "right")
- `tabIndexNavigator.enableQuickPick`: Enable quick pick feature (default: true)

---

## Upcoming Features

### 🔮 Planned for v1.1.0
- **Tab Bookmarks**: Save and restore tab layouts
- **Tab Groups Management**: Create and manage custom tab groups
- **More Languages**: German, Japanese, and Chinese translations
- **Custom Shortcuts**: User-configurable keyboard shortcuts
- **Tab Search**: Search tabs by name or content
- **Recent Files Integration**: Integration with VS Code's recent files

### 🔮 Future Considerations
- **Tab Thumbnails**: Visual previews in quick pick
- **Workspace Sessions**: Save and restore entire workspace tab states
- **Team Sync**: Share tab layouts with team members
- **AI-Powered Suggestions**: Smart tab recommendations based on usage patterns

---

## Migration Guide

### From v0.0.1 to v1.0.0

All existing settings and functionality remain unchanged. New features are opt-in by default:

1. **New Keyboard Shortcuts**: The extension adds new shortcuts but doesn't modify existing ones
2. **Status Bar Changes**: Enhanced information display, but core functionality remains the same
3. **Settings**: New settings have sensible defaults and don't require configuration
4. **Performance**: Improved performance with no breaking changes

### Settings Migration
No manual migration required. All new settings have appropriate defaults.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/tab-index-navigator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/tab-index-navigator/discussions)
- **Documentation**: [README.md](README.md)