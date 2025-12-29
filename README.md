# File Ref Tags - VSCode Code Reference Management Extension

[中文文档](README_zh.md)

## Overview

File Ref Tags is a VSCode extension for managing and quickly accessing code references. It allows users to add files, code snippets, and comments to a reference panel, enabling fast navigation to corresponding locations and improving development efficiency for large projects.

## Features

### Core Features
- **Add Current File**: Add the current open file to the reference panel
- **Add File + Snippet**: Add the current file and selected code snippet to the reference panel
- **Add Global Snippet**: Add the selected globally unique snippet to the reference panel
- **Add User Comment**: Add custom comments to the reference panel
- **Copy vscode:// Links**: Copy vscode:// protocol links to clipboard with various path formats
  - Snippet only
  - File name only
  - File name + snippet (with keyboard shortcut)
  - Parent directory + file name + snippet
  - Workspace path + snippet
- **Keyboard Shortcut**: Quick copy link with `Cmd+Shift+Option+C` (Mac) / `Ctrl+Shift+Alt+C` (Windows/Linux)
- **Type Color Differentiation**: Different colors for different types of reference items
  - File: Deep blue
  - File + Snippet: Deep pink
  - Global Snippet: Deep purple
  - Comment: Deep green
- **Drag and Drop Sorting**: Support dragging to reorder reference items
- **Quick Jump**: Click reference items to quickly jump to corresponding locations
- **Edit Title**: Hover to show edit button, click to modify title in popup
- **Delete Reference**: Hover to show delete button, click to delete reference items
- **View Storage Location**: Show the storage location of reference data
- **External URL Support**: Support vscode:// protocol URL to trigger jump from external software

## Installation

1. Open VSCode
2. Click the Extensions icon in the left activity bar (or press `Ctrl+Shift+X`)
3. Enter "File Ref Tags" in the search box
4. Click the "Install" button
5. After installation, click the "Enable" button

## Usage

### 1. Open Reference Panel

Find the "File Ref Tags" icon in the left activity bar of VSCode and click to open the reference panel.

### 2. Add Reference Items

#### 2.1 Add Current File

- Open the file you want to add
- Right-click in the editor, select "FileRefTags" → "Add Current File to Panel"
- Or use the command palette (`Ctrl+Shift+P`) and enter "FileRefTags: Add Current File to Panel"

#### 2.2 Add Current File + Selected Snippet

- Open a file and select the code snippet you want to add
- Right-click in the editor, select "FileRefTags" → "Add Current File + Selected Snippet to Panel"
- Or use the command palette and enter "FileRefTags: Add Current File + Selected Snippet to Panel"

#### 2.3 Add Selected Globally Unique Snippet

- Open a file and select the code snippet you want to add
- Right-click in the editor, select "FileRefTags" → "Add Current Selected Globally Unique Snippet to Panel"
- Or use the command palette and enter "FileRefTags: Add Current Selected Globally Unique Snippet to Panel"
- The extension will automatically search the workspace to ensure the snippet is unique

#### 2.4 Add User Comment

- Right-click in the editor, select "FileRefTags" → "Add User Comment to Panel"
- Or use the command palette and enter "FileRefTags: Add User Comment to Panel"
- Enter the comment content in the popup input box and click OK

#### 2.5 Copy Link (vscode:// Protocol)

The extension provides 5 commands to copy vscode:// protocol links to the clipboard:

- **Copy Link (Snippet Only)**: Copy a link with only the selected code snippet
  - Right-click in the editor, select "FileRefTags" → "Copy Link (Snippet Only)"
  - Format: `vscode://lirentech.file-ref-tags?snippet=<code_snippet>`

- **Copy Link (File Name Only)**: Copy a link with only the file name
  - Right-click in the editor, select "FileRefTags" → "Copy Link (File Name Only)"
  - Format: `vscode://lirentech.file-ref-tags?filePath=<file_name>`

- **Copy Link (File Name + Snippet)**: Copy a link with file name and code snippet
  - Right-click in the editor, select "FileRefTags" → "Copy Link (File Name + Snippet)"
  - Or use keyboard shortcut: `Cmd+Shift+Option+C` (Mac) / `Ctrl+Shift+Alt+C` (Windows/Linux)
  - Format: `vscode://lirentech.file-ref-tags?filePath=<file_name>&snippet=<code_snippet>`

- **Copy Link (Parent Directory + File Name + Snippet)**: Copy a link with parent directory, file name, and code snippet
  - Right-click in the editor, select "FileRefTags" → "Copy Link (Parent Directory + File Name + Snippet)"
  - Format: `vscode://lirentech.file-ref-tags?filePath=<parent_dir>/<file_name>&snippet=<code_snippet>`

- **Copy Link (Workspace Path + Snippet)**: Copy a link with workspace-relative path and code snippet
  - Right-click in the editor, select "FileRefTags" → "Copy Link (Workspace Path + Snippet)"
  - Format: `vscode://lirentech.file-ref-tags?filePath=<workspace_relative_path>&snippet=<code_snippet>`

### 3. Manage Reference Items

#### 3.1 Edit Reference Item Title

- Hover over the reference item, an edit button will appear on the right
- Click the edit button, modify the title in the popup window
- Click the "Save" button or press `Enter` to save
- Click the "Cancel" button or press `Escape` to cancel

#### 3.2 Delete Reference Item

- Hover over the reference item, a delete button will appear on the right
- Click the delete button, the reference item will be deleted

#### 3.3 Drag and Drop Sorting

- Click and drag the reference item to the target position
- Release the mouse, the reference item will be moved to the new position

#### 3.4 Jump to Reference Location

- Click the reference item, the extension will automatically jump to the corresponding file or code snippet
- For file + snippet and global snippet types, the corresponding code snippet will be automatically selected

#### 3.5 View Storage Location

- Click the "Show Storage Location" button at the bottom of the reference panel
- The extension will show the JSON file that stores the reference data in the file explorer

### 4. External URL Support

File Ref Tags supports using vscode:// protocol URLs to trigger jumps from external software. This allows you to create links in external documents, emails, or other applications that can directly open specific files or code snippets in VSCode.

#### 4.1 URL Format

```
vscode://lirentech.file-ref-tags?filePath=<file_path>&snippet=<code_snippet>
```

#### 4.2 Parameter Description

| Parameter | Required | Description |
|-----------|----------|-------------|
| filePath  | No       | File path (supports absolute path, relative path, or just file name) |
| snippet   | No       | Code snippet to search for |

**Note**: At least one parameter must be provided.

#### 4.3 Jump Modes

The extension supports three jump modes based on the combination of parameters:

| Mode | Parameters | Behavior |
|------|------------|----------|
| File | Only filePath | Open the specified file directly |
| File + Snippet | Both filePath and snippet | Open the file and select the matching code snippet |
| Global Snippet | Only snippet | Search for the snippet globally and open the matching file with the snippet selected |

#### 4.4 Support for Relative Paths and File Names

- **Absolute Path**: Directly open the file at the specified path
- **Relative Path**: Search for the file in the current workspace
- **Only File Name**: Search for all files with the matching name in the workspace and open the first match

#### 4.5 Code Snippet Filtering

When multiple files match the filePath parameter, the extension will filter the files by searching for the code snippet in each file. Only the file containing the specified code snippet will be opened.

#### 4.6 Usage Examples

1. **Open a file using absolute path**:
```
vscode://lirentech.file-ref-tags?filePath=/home/user/project/src/extension.ts
```

2. **Open a file using just file name**:
```
vscode://lirentech.file-ref-tags?filePath=extension.ts
```

3. **Open a file and select a specific snippet**:
```
vscode://lirentech.file-ref-tags?filePath=extension.ts&snippet=// 保存引用数据
```

4. **Search for a snippet globally**:
```
vscode://lirentech.file-ref-tags?snippet=const%20handleUri%20=%20async%20(uri:%20vscode.Uri)%20=>
```

5. **Open a file using relative path**:
```
vscode://lirentech.file-ref-tags?filePath=src/extension.ts&snippet=// 注册处理URI的逻辑
```

## Data Storage

Reference data is stored in the `references.json` file under VSCode extension's global storage directory, which can be viewed through the "Show Storage Location" button.

## Technical Features

- **Lightweight and Efficient**: Low resource usage, fast response speed
- **Easy to Use**: Simple operation, easy to get started
- **Clear Visuals**: Color differentiation for different types of reference items, clear at a glance
- **Space Efficient**: Compact layout design, maximizing display space
- **Comprehensive Functions**: Support multiple reference types and operation methods

## System Requirements

- VSCode Version: ^1.107.0
- Operating System: Supports Windows, macOS, and Linux

## Feedback and Suggestions

If you encounter any issues or have any suggestions during use, welcome to submit Issues or Pull Requests in the GitHub repository.

## License

This project uses the [MIT License](LICENSE), copyright belongs to LiRenTech.

---

**Enjoy coding with File Ref Tags!**