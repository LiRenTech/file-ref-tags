# File Ref Tags - VSCode Code Reference Management Extension

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

---

# File Ref Tags - VSCode 代码引用管理插件

## 功能介绍

File Ref Tags 是一个 VSCode 扩展插件，用于管理和快速访问代码引用。它允许用户将文件、代码片段和注释添加到引用面板中，并通过点击快速跳转到对应的位置，提高大型项目的开发效率。

## 核心功能

- **添加当前文件**：将当前打开的文件添加到引用面板
- **添加文件+片段**：将当前文件和选中的代码片段添加到引用面板
- **添加全局片段**：将当前选中的全局唯一片段添加到引用面板
- **添加用户注释**：添加自定义注释到引用面板
- **复制 vscode:// 链接**：将 vscode:// 协议链接复制到剪贴板，支持多种路径格式
  - 仅代码片段
  - 仅文件名
  - 文件名+代码片段（支持快捷键）
  - 父级文件夹+文件名+代码片段
  - 项目级路径+代码片段
- **快捷键支持**：快速复制链接，快捷键为 `Cmd+Shift+Option+C` (Mac) / `Ctrl+Shift+Alt+C` (Windows/Linux)
- **类型颜色区分**：不同类型的引用项显示不同颜色
  - 文件：深蓝色
  - 文件+片段：深粉色
  - 全局片段：深紫色
  - 注释：深绿色
- **拖拽排序**：支持拖拽调整引用项顺序
- **快速跳转**：点击引用项快速跳转到对应位置
- **编辑标题**：鼠标悬浮显示编辑按钮，点击弹窗修改标题
- **删除引用**：鼠标悬浮显示删除按钮，点击删除引用项
- **查看存储位置**：显示引用数据的存储位置
- **外部 URL 支持**：支持 vscode:// 协议 URL 从外部软件触发跳转

## 安装方法

1. 打开 VSCode
2. 点击左侧活动栏的扩展图标（或按 `Ctrl+Shift+X`）
3. 在搜索框中输入 "File Ref Tags"
4. 点击 "安装" 按钮
5. 安装完成后，点击 "启用" 按钮

## 使用说明

### 1. 打开引用面板

在 VSCode 左侧活动栏中找到 "File Ref Tags" 图标，点击即可打开引用面板。

### 2. 添加引用项

#### 2.1 添加当前文件

- 打开需要添加的文件
- 右键点击编辑器，选择 "FileRefTags" → "添加当前文件到面板"
- 或使用命令面板 (`Ctrl+Shift+P`) 输入 "FileRefTags: 添加当前文件到面板"

#### 2.2 添加当前文件+选中的片段

- 打开文件，选中需要添加的代码片段
- 右键点击编辑器，选择 "FileRefTags" → "添加当前文件+选中的片段到面板"
- 或使用命令面板输入 "FileRefTags: 添加当前文件+选中的片段到面板"

#### 2.3 添加当前选中的全局唯一片段

- 打开文件，选中需要添加的代码片段
- 右键点击编辑器，选择 "FileRefTags" → "添加当前选中的全局唯一片段到面板"
- 或使用命令面板输入 "FileRefTags: 添加当前选中的全局唯一片段到面板"
- 插件会自动搜索工作区，确保片段是唯一的

#### 2.4 添加用户注释

- 右键点击编辑器，选择 "FileRefTags" → "添加用户注释到面板"
- 或使用命令面板输入 "FileRefTags: 添加用户注释到面板"
- 在弹出的输入框中输入注释内容，点击确定

#### 2.5 复制链接（vscode:// 协议）

插件提供了 5 个命令用于将 vscode:// 协议链接复制到剪贴板：

- **复制链接（仅代码片段）**：复制仅包含选中代码片段的链接
  - 右键点击编辑器，选择 "FileRefTags" → "复制链接（仅代码片段）"
  - 格式：`vscode://lirentech.file-ref-tags?snippet=<代码片段>`

- **复制链接（仅文件名）**：复制仅包含文件名的链接
  - 右键点击编辑器，选择 "FileRefTags" → "复制链接（仅文件名）"
  - 格式：`vscode://lirentech.file-ref-tags?filePath=<文件名>`

- **复制链接（文件名+代码片段）**：复制包含文件名和代码片段的链接
  - 右键点击编辑器，选择 "FileRefTags" → "复制链接（文件名+代码片段）"
  - 或使用快捷键：`Cmd+Shift+Option+C` (Mac) / `Ctrl+Shift+Alt+C` (Windows/Linux)
  - 格式：`vscode://lirentech.file-ref-tags?filePath=<文件名>&snippet=<代码片段>`

- **复制链接（父级文件夹+文件名+代码片段）**：复制包含父级文件夹、文件名和代码片段的链接
  - 右键点击编辑器，选择 "FileRefTags" → "复制链接（父级文件夹+文件名+代码片段）"
  - 格式：`vscode://lirentech.file-ref-tags?filePath=<父级文件夹>/<文件名>&snippet=<代码片段>`

- **复制链接（项目级路径+代码片段）**：复制包含项目相对路径和代码片段的链接
  - 右键点击编辑器，选择 "FileRefTags" → "复制链接（项目级路径+代码片段）"
  - 格式：`vscode://lirentech.file-ref-tags?filePath=<项目相对路径>&snippet=<代码片段>`

### 3. 管理引用项

#### 3.1 编辑引用项标题

- 将鼠标悬浮在引用项上，右侧会显示编辑按钮
- 点击编辑按钮，在弹出的窗口中修改标题
- 点击 "保存" 按钮或按 `Enter` 键保存
- 点击 "取消" 按钮或按 `Escape` 键取消

#### 3.2 删除引用项

- 将鼠标悬浮在引用项上，右侧会显示删除按钮
- 点击删除按钮，引用项将被删除

#### 3.3 拖拽排序

- 点击并拖拽引用项到目标位置
- 释放鼠标，引用项将被移动到新位置

#### 3.4 跳转到引用位置

- 点击引用项，插件会自动跳转到对应的文件或代码片段
- 对于文件+片段和全局片段，会自动选中对应的代码片段

#### 3.5 查看存储位置

- 点击引用面板底部的 "Show Storage Location" 按钮
- 插件会在文件资源管理器中显示存储引用数据的 JSON 文件

### 4. 外部 URL 支持

File Ref Tags 支持使用 vscode:// 协议 URL 从外部软件触发跳转。这允许您在外部文档、电子邮件或其他应用程序中创建链接，直接在 VSCode 中打开特定文件或代码片段。

#### 4.1 URL 格式

```
vscode://lirentech.file-ref-tags?filePath=<文件路径>&snippet=<代码片段>
```

#### 4.2 参数说明

| 参数名 | 是否必填 | 描述 |
|--------|----------|------|
| filePath | 否 | 文件路径（支持绝对路径、相对路径或仅文件名） |
| snippet | 否 | 要搜索的代码片段 |

**注意**：至少必须提供一个参数。

#### 4.3 跳转模式

根据参数的组合，扩展支持三种跳转模式：

| 模式 | 参数组合 | 行为 |
|------|----------|------|
| 文件 | 只有 filePath | 直接打开指定文件 |
| 文件+片段 | 同时有 filePath 和 snippet | 打开文件并选中匹配的代码片段 |
| 全局片段 | 只有 snippet | 全局搜索片段并打开匹配文件，选中该片段 |

#### 4.4 支持相对路径和文件名

- **绝对路径**：直接打开指定路径的文件
- **相对路径**：在当前工作区中搜索文件
- **仅文件名**：在工作区中搜索所有匹配名称的文件并打开第一个匹配项

#### 4.5 代码片段筛选

当多个文件匹配 filePath 参数时，扩展会通过在每个文件中搜索代码片段来筛选文件。只有包含指定代码片段的文件才会被打开。

#### 4.6 使用示例

1. **使用绝对路径打开文件**：
   ```
vscode://lirentech.file-ref-tags?filePath=/home/user/project/src/extension.ts
```

2. **仅使用文件名打开文件**：
   ```
vscode://lirentech.file-ref-tags?filePath=extension.ts
```

3. **打开文件并选中特定片段**：
   ```
vscode://lirentech.file-ref-tags?filePath=extension.ts&snippet=// 保存引用数据
```

4. **全局搜索片段**：
   ```
vscode://lirentech.file-ref-tags?snippet=const%20handleUri%20=%20async%20(uri:%20vscode.Uri)%20=>
```

5. **使用相对路径打开文件**：
   ```
vscode://lirentech.file-ref-tags?filePath=src/extension.ts&snippet=// 注册处理URI的逻辑
```

## 数据存储

引用数据存储在 VSCode 扩展的全局存储目录下的 `references.json` 文件中，路径可以通过 "Show Storage Location" 按钮查看。

## 技术特点

- **轻量高效**：占用资源少，响应速度快
- **易于使用**：操作简单，上手容易
- **视觉清晰**：不同类型引用项颜色区分，一目了然
- **空间高效**：紧凑的布局设计，最大化显示空间
- **功能全面**：支持多种引用类型和操作方式

## 系统要求

- VSCode 版本：^1.107.0
- 操作系统：支持 Windows、macOS 和 Linux

## 反馈与建议

如果您在使用过程中遇到问题或有任何建议，欢迎在 GitHub 仓库提交 Issue 或 Pull Request。

## 许可证

本项目采用 [MIT License](LICENSE) 许可证，版权归 LiRenTech 所有。

---

**Enjoy coding with File Ref Tags!**