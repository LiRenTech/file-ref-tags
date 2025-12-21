// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// 引用项数据结构
export interface ReferenceItem {
	id: string;
	type: 'file' | 'file-snippet' | 'global-snippet' | 'comment';
	title: string;
	filePath?: string;
	snippet?: string;
	comment?: string;
	createdAt: string;
	updatedAt: string;
}

// 数据管理类
class ReferenceDataManager {
	private references: ReferenceItem[] = [];
	private storagePath: string;

	constructor(context: vscode.ExtensionContext) {
		// 获取存储路径
		this.storagePath = path.join(context.globalStorageUri.fsPath, 'references.json');
		// 确保存储目录存在
		fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
		// 加载数据
		this.loadReferences();
	}

	// 加载引用数据
	private loadReferences(): void {
		try {
			if (fs.existsSync(this.storagePath)) {
				const data = fs.readFileSync(this.storagePath, 'utf8');
				this.references = JSON.parse(data);
			}
		} catch (error) {
			console.error('Failed to load references:', error);
			this.references = [];
		}
	}

	// 保存引用数据
	private saveReferences(): void {
		try {
			fs.writeFileSync(this.storagePath, JSON.stringify(this.references, null, 2), 'utf8');
		} catch (error) {
			console.error('Failed to save references:', error);
		}
	}

	// 添加引用项
	addReference(reference: Omit<ReferenceItem, 'id' | 'createdAt' | 'updatedAt'>): ReferenceItem {
		const now = new Date().toISOString();
		const newReference: ReferenceItem = {
			...reference,
			id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			createdAt: now,
			updatedAt: now
		};
		this.references.push(newReference);
		this.saveReferences();
		return newReference;
	}

	// 获取所有引用项
	getReferences(): ReferenceItem[] {
		return [...this.references];
	}

	// 更新引用项顺序
	updateOrder(newOrder: string[]): void {
		const newReferences: ReferenceItem[] = [];
		newOrder.forEach(id => {
			const ref = this.references.find(r => r.id === id);
			if (ref) {
				newReferences.push(ref);
			}
		});
		// 添加未在新顺序中的引用项
		this.references.forEach(ref => {
			if (!newOrder.includes(ref.id)) {
				newReferences.push(ref);
			}
		});
		this.references = newReferences;
		this.saveReferences();
	}

	// 删除引用项
	deleteReference(id: string): void {
		this.references = this.references.filter(r => r.id !== id);
		this.saveReferences();
	}

	// 获取存储路径
	getStoragePath(): string {
		return this.storagePath;
	}
}

// Webview视图提供器
class FileRefTagsViewProvider implements vscode.WebviewViewProvider {
	private _webviewView?: vscode.WebviewView;
	private _dataManager: ReferenceDataManager;

	constructor(private readonly _extensionUri: vscode.Uri, dataManager: ReferenceDataManager) {
		this._dataManager = dataManager;
	}

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		this._webviewView = webviewView;

		// Set the webview options
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		// Set the webview HTML content
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// Handle messages from the webview
		webviewView.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'getReferences':
						this._sendReferences();
						return;
					case 'updateOrder':
						this._dataManager.updateOrder(message.order);
						this._sendReferences();
						return;
					case 'deleteReference':
						this._dataManager.deleteReference(message.id);
						this._sendReferences();
						return;
					case 'jumpToReference':
						this._jumpToReference(message.id);
						return;
					case 'showStorageLocation':
						this._showStorageLocation();
						return;
				}
			},
			undefined,
			// No need for a disposal token here since webviewView is already tracked
		);

		// Handle view state changes
		webviewView.onDidChangeVisibility(() => {
			if (webviewView.visible) {
				// Update the view when it becomes visible
				this._sendReferences();
			}
		});
	}

	// 发送引用数据到webview
	private _sendReferences(): void {
		if (this._webviewView) {
			this._webviewView.webview.postMessage({
				command: 'updateReferences',
				references: this._dataManager.getReferences()
			});
		}
	}

	// 跳转到引用位置
	private async _jumpToReference(id: string): Promise<void> {
		const references = this._dataManager.getReferences();
		const reference = references.find(r => r.id === id);
		if (!reference) {
			return;
		}

		try {
			switch (reference.type) {
				case 'file':
					// 直接跳转到文件
					if (reference.filePath) {
						const uri = vscode.Uri.file(reference.filePath);
						await vscode.window.showTextDocument(uri);
					}
					break;
				case 'file-snippet':
					// 跳转到文件并搜索代码片段
					if (reference.filePath && reference.snippet) {
						const uri = vscode.Uri.file(reference.filePath);
						const textEditor = await vscode.window.showTextDocument(uri);
						const doc = textEditor.document;
						// 搜索代码片段
						const text = doc.getText();
						const index = text.indexOf(reference.snippet);
						if (index !== -1) {
							const position = doc.positionAt(index);
							await vscode.window.showTextDocument(uri, { selection: new vscode.Range(position, position) });
						} else {
							vscode.window.showWarningMessage('代码片段已不存在于文件中');
						}
					}
					break;
				case 'global-snippet':
					// 全局搜索代码片段
					if (reference.snippet) {
						// 使用与添加引用时相同的搜索方式
						try {
							console.log('开始搜索代码片段:', reference.snippet);
							// 先获取当前工作区的所有文件
							const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 10000);
							console.log('搜索文件数量:', files.length);
							
							let matchCount = 0;
							let matchFile: vscode.Uri | undefined;
							let matchPosition: vscode.Position | undefined;
							
							// 遍历文件，查找包含代码片段的文件
							for (const file of files) {
								try {
									const doc = await vscode.workspace.openTextDocument(file);
									const text = doc.getText();
									const index = text.indexOf(reference.snippet);
									if (index !== -1) {
										matchCount++;
										matchFile = file;
										matchPosition = doc.positionAt(index);
										// 如果超过1个匹配，就可以提前结束
										if (matchCount > 1) {
											break;
										}
									}
								} catch (error) {
									// 忽略无法打开的文件
									console.error('无法打开文件:', file.fsPath, error);
									continue;
								}
							}
							
							console.log('匹配数量:', matchCount);
							
							if (matchCount === 1 && matchFile && matchPosition) {
								await vscode.window.showTextDocument(matchFile, { selection: new vscode.Range(matchPosition, matchPosition) });
							} else {
								vscode.window.showWarningMessage('代码片段已不是全局唯一');
							}
						} catch (error) {
							console.error('Global search failed:', error);
							vscode.window.showErrorMessage('全局搜索失败');
						}
					}
					break;
				case 'comment':
					// 注释项，无跳转功能
					break;
			}
		} catch (error) {
			console.error('Failed to jump to reference:', error);
			vscode.window.showErrorMessage('跳转到引用失败');
		}
	}

	// 通知webview更新引用数据
	notifyUpdate(): void {
		this._sendReferences();
	}

	// 显示存储位置
	private async _showStorageLocation(): Promise<void> {
		try {
			// 假设dataManager有一个getStoragePath方法来获取存储路径
			// 我们需要修改ReferenceDataManager类，添加getStoragePath方法
			if ('getStoragePath' in this._dataManager) {
				const storagePath = (this._dataManager as any).getStoragePath();
				const uri = vscode.Uri.file(storagePath);
				
				// 显示文件在资源管理器中
				await vscode.commands.executeCommand('revealFileInOS', uri);
				// 同时在编辑器中打开文件
				await vscode.window.showTextDocument(uri);
			} else {
				vscode.window.showErrorMessage('无法获取存储路径');
			}
		} catch (error) {
			console.error('显示存储位置失败:', error);
			vscode.window.showErrorMessage('显示存储位置失败');
		}
	}

	// 生成webview HTML
	private _getHtmlForWebview(webview: vscode.Webview): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Ref Tags</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #1e1e1e;
            color: #d4d4d4;
        }
        .container {
            padding: 16px;
        }
        h1 {
            font-size: 18px;
            margin-bottom: 16px;
        }
        .empty-state {
            text-align: center;
            padding: 32px 0;
            color: #858585;
        }
        .references-list {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        .reference-item {
            background-color: #252526;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }
        .reference-item:hover {
            background-color: #2a2d2e;
            border-color: #0e639c;
        }
        .reference-item.dragging {
            opacity: 0.5;
            border: 2px dashed #0e639c;
        }
        .reference-item.drag-over {
            border-top: 2px solid #0e639c;
        }
        .reference-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .reference-title {
            font-size: 14px;
            font-weight: 500;
            margin: 0;
        }
        .reference-type {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 10px;
            background-color: #0e639c;
            color: white;
        }
        .reference-type.file {
            background-color: #0e639c;
        }
        .reference-type.file-snippet {
            background-color: #68217a;
        }
        .reference-type.global-snippet {
            background-color: #007d4a;
        }
        .reference-type.comment {
            background-color: #5a5a5a;
        }
        .reference-content {
            font-size: 12px;
            color: #858585;
            margin: 0;
            word-break: break-all;
        }
        .delete-btn {
            background: none;
            border: none;
            color: #858585;
            cursor: pointer;
            font-size: 14px;
            padding: 4px;
            border-radius: 2px;
        }
        .delete-btn:hover {
            color: #ff6b6b;
            background-color: rgba(255, 107, 107, 0.1);
        }
        .actions-bar {
            margin-bottom: 16px;
            display: flex;
            gap: 8px;
        }
        .action-btn {
            background-color: #0e639c;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .action-btn:hover {
            background-color: #1177bb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>File References</h1>
        <div class="actions-bar">
            <button id="show-storage-btn" class="action-btn">Show Storage Location</button>
        </div>
        <div id="empty-state" class="empty-state">
            <p>No references yet. Add your first reference!</p>
        </div>
        <ul id="references-list" class="references-list"></ul>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let references = [];
        let draggedItem = null;

        // 初始化
        vscode.postMessage({ command: 'getReferences' });

        // 添加显示存储位置按钮事件
        const showStorageBtn = document.getElementById('show-storage-btn');
        if (showStorageBtn) {
            showStorageBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'showStorageLocation' });
            });
        }

        // 处理消息
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateReferences':
                    references = message.references;
                    renderReferences();
                    break;
            }
        });

        // 渲染引用列表
        function renderReferences() {
            const list = document.getElementById('references-list');
            const emptyState = document.getElementById('empty-state');

            if (references.length === 0) {
                list.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            list.style.display = 'block';
            emptyState.style.display = 'none';

            list.innerHTML = '';

            references.forEach(reference => {
                const li = document.createElement('li');
                li.className = 'reference-item';
                li.draggable = true;
                li.dataset.id = reference.id;

                // 设置拖拽事件
                li.addEventListener('dragstart', handleDragStart);
                li.addEventListener('dragover', handleDragOver);
                li.addEventListener('dragenter', handleDragEnter);
                li.addEventListener('dragleave', handleDragLeave);
                li.addEventListener('drop', handleDrop);
                li.addEventListener('dragend', handleDragEnd);

                // 点击跳转
                li.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('delete-btn')) {
                        vscode.postMessage({ command: 'jumpToReference', id: reference.id });
                    }
                });

                // 类型显示
                let typeLabel = '文件';
                if (reference.type === 'file-snippet') {
                    typeLabel = '文件+片段';
                } else if (reference.type === 'global-snippet') {
                    typeLabel = '全局片段';
                } else if (reference.type === 'comment') {
                    typeLabel = '注释';
                }

                // 内容显示
                let content = '';
                if (reference.filePath) {
                    content = reference.filePath;
                } else if (reference.snippet) {
                    content = reference.snippet.substring(0, 100) + (reference.snippet.length > 100 ? '...' : '');
                }

                // 使用DOM API创建元素，避免模板字面量语法错误
                const headerDiv = document.createElement('div');
                headerDiv.className = 'reference-header';

                const titleH3 = document.createElement('h3');
                titleH3.className = 'reference-title';
                titleH3.textContent = reference.title;

                const typeDiv = document.createElement('div');
                typeDiv.className = 'reference-type ' + reference.type;
                typeDiv.textContent = typeLabel;

                const contentP = document.createElement('p');
                contentP.className = 'reference-content';
                contentP.textContent = content;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = function() {
                    vscode.postMessage({ command: 'deleteReference', id: reference.id });
                };

                headerDiv.appendChild(titleH3);
                headerDiv.appendChild(typeDiv);
                li.appendChild(headerDiv);
                li.appendChild(contentP);
                li.appendChild(deleteBtn);

                list.appendChild(li);
            });
        }

        // 删除引用
        function deleteReference(id) {
            vscode.postMessage({ command: 'deleteReference', id });
        }

        // 拖拽事件处理
        function handleDragStart(e) {
            draggedItem = this;
            this.classList.add('dragging');
        }

        function handleDragOver(e) {
            e.preventDefault();
            return false;
        }

        function handleDragEnter(e) {
            if (this !== draggedItem) {
                this.classList.add('drag-over');
            }
        }

        function handleDragLeave(e) {
            this.classList.remove('drag-over');
        }

        function handleDrop(e) {
            e.stopPropagation();
            this.classList.remove('drag-over');

            if (draggedItem !== this) {
                const list = this.parentNode;
                const draggedIndex = Array.from(list.children).indexOf(draggedItem);
                const dropIndex = Array.from(list.children).indexOf(this);

                if (draggedIndex < dropIndex) {
                    list.insertBefore(draggedItem, this.nextSibling);
                } else {
                    list.insertBefore(draggedItem, this);
                }

                // 更新顺序
                const newOrder = Array.from(list.children).map(item => item.dataset.id);
                vscode.postMessage({ command: 'updateOrder', order: newOrder });
            }

            return false;
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            draggedItem = null;
            // 移除所有drag-over类
            Array.from(this.parentNode.children).forEach(item => {
                item.classList.remove('drag-over');
            });
        }
    </script>
</body>
</html>`;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "file-ref-tags" is now active!');

	// 初始化数据管理器
	const dataManager = new ReferenceDataManager(context);

	// 创建视图提供器
	const webviewViewProvider = new FileRefTagsViewProvider(context.extensionUri, dataManager);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('file-ref-tags.list-view', webviewViewProvider)
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('file-ref-tags.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from file-ref-tags!');
	});

	context.subscriptions.push(disposable);

	// 注册添加当前文件到面板的命令
	const addCurrentFileDisposable = vscode.commands.registerCommand('file-ref-tags.addCurrentFile', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('没有打开的文件');
			return;
		}

		const document = editor.document;
		const filePath = document.uri.fsPath;
		const fileName = path.basename(filePath);

		// 创建引用项
		dataManager.addReference({
			type: 'file',
			title: fileName,
			filePath: filePath
		});

		// 通知webview更新
		webviewViewProvider.notifyUpdate();
		vscode.window.showInformationMessage('已添加当前文件到面板');
	});

	context.subscriptions.push(addCurrentFileDisposable);

	// 注册添加当前文件+选中片段到面板的命令
	const addFileAndSnippetDisposable = vscode.commands.registerCommand('file-ref-tags.addFileAndSnippet', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('没有打开的文件');
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showErrorMessage('请先选中代码片段');
			return;
		}

		const document = editor.document;
		const filePath = document.uri.fsPath;
		const snippet = document.getText(selection);

		// 截取代码片段作为标题（最多50个字符）
		const snippetPreview = snippet.substring(0, 50) + (snippet.length > 50 ? '...' : '');
		const fileName = path.basename(filePath);
		const title = `${fileName}: ${snippetPreview}`;

		// 创建引用项
		dataManager.addReference({
			type: 'file-snippet',
			title: title,
			filePath: filePath,
			snippet: snippet
		});

		// 通知webview更新
		webviewViewProvider.notifyUpdate();
		vscode.window.showInformationMessage('已添加当前文件+选中片段到面板');
	});

	context.subscriptions.push(addFileAndSnippetDisposable);

	// 注册添加当前选中的全局唯一片段到面板的命令
	const addGlobalUniqueSnippetDisposable = vscode.commands.registerCommand('file-ref-tags.addGlobalUniqueSnippet', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('没有打开的文件');
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showErrorMessage('请先选中代码片段');
			return;
		}

		const snippet = editor.document.getText(selection);

		// 全局搜索代码片段
		try {
			console.log('开始搜索代码片段:', snippet);
			// 使用更可靠的方式进行全局搜索
			// 先获取当前工作区的所有文件
			const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 10000);
			console.log('搜索文件数量:', files.length);
			
			let matchCount = 0;
			let matchFile: vscode.Uri | undefined;
			
			// 遍历文件，查找包含代码片段的文件
			for (const file of files) {
				try {
					const doc = await vscode.workspace.openTextDocument(file);
					const text = doc.getText();
					if (text.includes(snippet)) {
						matchCount++;
						matchFile = file;
						// 如果超过1个匹配，就可以提前结束
						if (matchCount > 1) {
							break;
						}
					}
				} catch (error) {
					// 忽略无法打开的文件
					console.error('无法打开文件:', file.fsPath, error);
					continue;
				}
			}
			
			console.log('匹配数量:', matchCount);
			
			if (matchCount !== 1) {
				vscode.window.showErrorMessage('选中的代码片段不是全局唯一的');
				return;
			}

			// 截取代码片段作为标题（最多50个字符）
			const title = snippet.substring(0, 50) + (snippet.length > 50 ? '...' : '');

			// 创建引用项
			dataManager.addReference({
				type: 'global-snippet',
				title: title,
				snippet: snippet
			});

			// 通知webview更新
			webviewViewProvider.notifyUpdate();
			vscode.window.showInformationMessage('已添加当前选中的全局唯一片段到面板');
		} catch (error) {
			console.error('搜索代码片段失败:', error);
			vscode.window.showErrorMessage('搜索代码片段失败');
		}
	});

	context.subscriptions.push(addGlobalUniqueSnippetDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
