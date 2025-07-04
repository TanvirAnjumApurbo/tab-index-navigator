# 🗂️ Tab Index Navigator

![Tab Index Navigator](https://raw.githubusercontent.com/TanvirAnjumApurbo/tab-index-navigator/master/media/tab_index_icon.png)

**Tab Index Navigator** is a powerful VS Code extension that boosts your productivity by enabling fast and intuitive tab switching. Whether you're juggling multiple files or diving into deep workflows, this extension keeps your navigation smooth and efficient with features like keyboard shortcuts, interactive quick pick, tab history, and a status bar overlay.

![Demo](https://raw.githubusercontent.com/TanvirAnjumApurbo/tab-index-navigator/master/media/tab_index_gif.gif)

---

## ✨ Features

### 🔢 Instant Tab Navigation
Jump to any of the first 10 open tabs instantly:
- Use `Ctrl+1` through `Ctrl+9` (or `Cmd+1` through `Cmd+9` on macOS)
- Use `Ctrl+0` (`Cmd+0`) for tab 10

📷 ![Quick Navigation](https://raw.githubusercontent.com/TanvirAnjumApurbo/tab-index-navigator/master/media/tab_index_ss1.png)

### 📊 Live Tab Status in Status Bar
- Real-time position display like **"3/7"** (tab 3 of 7)
- Configurable position (left/right side of status bar)
- Click to open quick tab list
- Toggle mode between current tab position or total count

📷 ![Status Bar](https://raw.githubusercontent.com/TanvirAnjumApurbo/tab-index-navigator/master/media/tab_index_ss4.png)

### 🧭 Interactive Tab List (Quick Pick)
- Displays all open tabs with index and tab type (e.g. `text`, `diff`, `notebook`, `webview`)
- Searchable by filename or path
- Shows assigned keyboard shortcuts for clarity
- Click to navigate to any tab instantly

### 📌 Pinned Tab Recognition
- Clearly marks pinned tabs in quick pick list
- Includes dedicated shortcut: `Ctrl+Shift+I`

📷 ![Pinned Tabs](https://raw.githubusercontent.com/TanvirAnjumApurbo/tab-index-navigator/master/media/tab_index_ss3.png)

### 🕘 Tab History Navigation
- Tracks your recently visited tabs
- Return to previous tabs with `Ctrl+Alt+Left`
- Fully configurable history size

📷 ![Tab History](https://raw.githubusercontent.com/TanvirAnjumApurbo/tab-index-navigator/master/media/tab_index_ss2.png)

### 🧩 Split Editor & Group Support
- Displays tab group IDs (Group 1, Group 2, etc.)
- Supports horizontal/vertical split editor tabs

### 🌍 Multi-language Support
- UI strings available in **English**, **Spanish**, and **French**
- Configurable language setting

### 🛡️ Optional Anonymous Telemetry
- Disabled by default
- If enabled, collects anonymized usage data to improve the extension

---

## 🎯 Commands & Keyboard Shortcuts

### Navigation Shortcuts
| Command | Windows/Linux | Mac | Description |
|---------|---------------|-----|-------------|
| Go to Tab 1–9 | `Ctrl+1..9` | `Cmd+1..9` | Jump to tab 1 through 9 |
| Go to Tab 10 | `Ctrl+0` | `Cmd+0` | Jump to the 10th tab |

### Utility Commands
| Command | Shortcut (Win) | Shortcut (Mac) | Description |
|---------|----------------|----------------|-------------|
| Show Tab List | `Ctrl+Shift+T` | `Cmd+Shift+T` | Opens interactive tab list |
| Show Pinned Tabs | `Ctrl+Shift+I` | `Cmd+Shift+I` | Show pinned tabs only |
| Show Tab History | `Ctrl+Shift+H` | `Cmd+Shift+H` | Recently visited tabs |
| Go Back | `Ctrl+Alt+Left` | `Cmd+Alt+Left` | Return to last visited tab |
| Toggle Tab Index Overlay | Command Palette only | Command Palette only | Show/hide tab position in status bar |

### Command Palette Commands
You can access the following commands via `Ctrl+Shift+P` (Command Palette):
- `Tab Index Navigator: Show Tab List`
- `Tab Index Navigator: Show Pinned Tabs`
- `Tab Index Navigator: Show Tab History`
- `Tab Index Navigator: Go Back to Previous Tab`
- `Tab Index Navigator: Toggle Tab Index Overlay`

---

## ⚙️ Configuration Options
Add or modify these in `settings.json`:

```json
{
  "tabIndexNavigator.showStatusBarItem": true,
  "tabIndexNavigator.statusBarPosition": "right",
  "tabIndexNavigator.enableQuickPick": true,
  "tabIndexNavigator.showTabGroups": true,
  "tabIndexNavigator.showWorkspaceFolders": true,
  "tabIndexNavigator.enableTabHistory": true,
  "tabIndexNavigator.tabHistorySize": 5,
  "tabIndexNavigator.enableTelemetry": false,
  "tabIndexNavigator.language": "en"
}
```

---

## 🚀 Installation

1. Open **VS Code**
2. Press `Ctrl+Shift+X` to open Extensions view
3. Search for `Tab Index Navigator`
4. Click **Install**
5. Reload VS Code if prompted

---

## 📖 How to Use

### Basic Navigation
- Open multiple files
- Use keyboard shortcuts `Ctrl+1` to `Ctrl+9`, `Ctrl+0`
- Observe live tab index in status bar

### Advanced Features
- Open **tab list**: `Ctrl+Shift+T`
- Open **pinned tabs**: `Ctrl+Shift+I`
- View **tab history**: `Ctrl+Shift+H`
- Navigate **back**: `Ctrl+Alt+Left`
- Toggle **tab index overlay**: From Command Palette only

---

## 🛠 Troubleshooting

**Keyboard shortcuts not working?**  
Check for conflicts in `File > Preferences > Keyboard Shortcuts`

**Status bar not showing?**  
Ensure `tabIndexNavigator.showStatusBarItem` is set to `true`

**Can't jump to tabs beyond 10?**  
Use the Tab List feature (`Ctrl+Shift+T`)

---

## 🤝 Contributing
We welcome PRs, feature requests, and ideas! Please:
1. Check issues on GitHub
2. Open a new issue with detailed info
3. Submit PRs to the `main` branch

---

## 📄 License
MIT License — see `LICENSE` file for details

---

## 📝 Changelog

### v0.0.2
- 🔧 Fixed image display issues on VS Code Marketplace
- 📷 Updated README with proper GitHub raw URLs
- 🛠️ Enhanced .gitignore with comprehensive exclusions

### v0.0.1
- 🚀 Initial release
- Tab index shortcuts (1–10)
- Status bar position + toggle
- Interactive tab list with quick pick
- Pinned tab detection
- Tab history tracking
- Multi-language support
- Optional telemetry

---

## 💝 Support
If you find this useful:
- ⭐ Star the GitHub repo
- 🛍️ Rate it on the Marketplace
- 🐞 Report issues
- 💬 Share with your dev friends

Happy tabbing with **Tab Index Navigator**! 🚀
