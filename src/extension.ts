// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TEMPLATE } from './view/template';
import { ReferenceItem } from './types/referenct';

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

	// 更新引用项标题
	updateReferenceTitle(id: string, title: string): void {
		const reference = this.references.find(r => r.id === id);
		if (reference) {
			reference.title = title;
			reference.updatedAt = new Date().toISOString();
			this.saveReferences();
		}
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
					case 'updateReferenceTitle':
						this._dataManager.updateReferenceTitle(message.id, message.title);
						this._sendReferences();
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
							const startPosition = doc.positionAt(index);
							const endPosition = doc.positionAt(index + reference.snippet.length);
							const range = new vscode.Range(startPosition, endPosition);
							await vscode.window.showTextDocument(uri, { selection: range });
							// 确保选中的内容可见
							await textEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);
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
							let matchStartPosition: vscode.Position | undefined;
							let matchEndPosition: vscode.Position | undefined;

							// 遍历文件，查找包含代码片段的文件
							for (const file of files) {
								try {
									const doc = await vscode.workspace.openTextDocument(file);
									const text = doc.getText();
									const index = text.indexOf(reference.snippet);
									if (index !== -1) {
										matchCount++;
										matchFile = file;
										matchStartPosition = doc.positionAt(index);
										matchEndPosition = doc.positionAt(index + reference.snippet.length);
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

							if (matchCount === 1 && matchFile && matchStartPosition && matchEndPosition) {
								const textEditor = await vscode.window.showTextDocument(matchFile);
								const range = new vscode.Range(matchStartPosition, matchEndPosition);
								await vscode.window.showTextDocument(matchFile, { selection: range });
								// 确保选中的内容可见
								await textEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);
							} else if (matchCount === 0) {
								vscode.window.showWarningMessage('未找到匹配的代码片段');
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
			vscode.window.showErrorMessage('显示存储位置失败，可能需要先有引用数据才行');
		}
	}

	// 生成webview HTML
	private _getHtmlForWebview(webview: vscode.Webview): string {
		return TEMPLATE;
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

	// 注册处理URI的逻辑
	const handleUri = async (uri: vscode.Uri) => {
		try {
			// 解析URL查询参数
			const query = new URLSearchParams(uri.query);
			const filePath = query.get('filePath');
			const snippet = query.get('snippet');

			// 确保至少有一个参数
			if (!filePath && !snippet) {
				vscode.window.showErrorMessage('URL缺少必要参数：filePath或snippet');
				return;
			}

			// 解码参数
			const decodedFilePath = filePath ? decodeURIComponent(filePath) : undefined;
			const decodedSnippet = snippet ? decodeURIComponent(snippet) : undefined;

			// 根据参数组合决定跳转模式
			if (decodedFilePath && decodedSnippet) {
				// 模式1：file-snippet，跳转到文件并搜索代码片段
				await jumpToFileAndSnippet(decodedFilePath, decodedSnippet);
			} else if (decodedFilePath) {
				// 模式2：file，直接跳转到文件
				await jumpToFile(decodedFilePath);
			} else if (decodedSnippet) {
				// 模式3：global-snippet，全局搜索代码片段
				await jumpToGlobalSnippet(decodedSnippet);
			}
		} catch (error) {
			console.error('Failed to handle URI:', error);
			vscode.window.showErrorMessage(`处理URL失败：${error instanceof Error ? error.message : String(error)}`);
		}
	};

	// 跳转到文件
	const jumpToFile = async (filePath: string) => {
		try {
			let fileUri: vscode.Uri;

			// 检查是否为绝对路径
			if (path.isAbsolute(filePath)) {
				fileUri = vscode.Uri.file(filePath);
			} else {
				// 相对路径或仅文件名，在工作区中查找
				const workspaceFolders = vscode.workspace.workspaceFolders;
				if (!workspaceFolders || workspaceFolders.length === 0) {
					vscode.window.showErrorMessage('未打开工作区，无法使用相对路径或仅文件名');
					return;
				}

				// 查找匹配的文件
				const matches: vscode.Uri[] = [];
				for (const folder of workspaceFolders) {
					// 直接匹配文件名
					const files = await vscode.workspace.findFiles(`**/${filePath}`, '**/node_modules/**');
					matches.push(...files);
				}

				if (matches.length === 0) {
					vscode.window.showErrorMessage(`未找到文件：${filePath}`);
					return;
				} else if (matches.length > 1) {
					vscode.window.showWarningMessage(`找到多个匹配文件，将打开第一个：${filePath}`);
				}

				fileUri = matches[0];
			}

			await vscode.window.showTextDocument(fileUri);
		} catch (error) {
			console.error('Failed to jump to file:', error);
			vscode.window.showErrorMessage(`跳转到文件失败：${error instanceof Error ? error.message : String(error)}`);
		}
	};

	// 跳转到文件并搜索代码片段
	const jumpToFileAndSnippet = async (filePath: string, snippet: string) => {
		try {
			let fileUri: vscode.Uri;

			// 检查是否为绝对路径
			if (path.isAbsolute(filePath)) {
				fileUri = vscode.Uri.file(filePath);
			} else {
				// 相对路径或仅文件名，在工作区中查找
				const workspaceFolders = vscode.workspace.workspaceFolders;
				if (!workspaceFolders || workspaceFolders.length === 0) {
					vscode.window.showErrorMessage('未打开工作区，无法使用相对路径或仅文件名');
					return;
				}

				// 查找匹配的文件，并结合代码片段筛选
				const matches: vscode.Uri[] = [];
				for (const folder of workspaceFolders) {
					// 直接匹配文件名
					const files = await vscode.workspace.findFiles(`**/${filePath}`, '**/node_modules/**');
					matches.push(...files);
				}

				if (matches.length === 0) {
					vscode.window.showErrorMessage(`未找到文件：${filePath}`);
					return;
				}

				// 如果有多个匹配文件，结合代码片段筛选
				let targetFileUri: vscode.Uri | undefined;
				if (matches.length === 1) {
					targetFileUri = matches[0];
				} else {
					vscode.window.showInformationMessage(`找到${matches.length}个匹配文件，正在结合代码片段筛选...`);

					// 遍历每个匹配文件，查找包含代码片段的文件
					for (const match of matches) {
						try {
							const doc = await vscode.workspace.openTextDocument(match);
							const text = doc.getText();
							if (text.includes(snippet)) {
								targetFileUri = match;
								break;
							}
						} catch (error) {
							console.error(`无法打开文件：${match.fsPath}`, error);
							continue;
						}
					}

					if (!targetFileUri) {
						vscode.window.showErrorMessage(`找到${matches.length}个匹配文件，但没有包含指定代码片段的文件：${filePath}`);
						return;
					}

					vscode.window.showInformationMessage(`已筛选出包含代码片段的文件：${path.basename(targetFileUri.fsPath)}`);
				}

				fileUri = targetFileUri!;
			}

			const textEditor = await vscode.window.showTextDocument(fileUri);
			const doc = textEditor.document;
			// 搜索代码片段
			const text = doc.getText();
			const index = text.indexOf(snippet);
			if (index !== -1) {
				const startPosition = doc.positionAt(index);
				const endPosition = doc.positionAt(index + snippet.length);
				const range = new vscode.Range(startPosition, endPosition);
				await vscode.window.showTextDocument(fileUri, { selection: range });
				// 确保选中的内容可见
				await textEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);
			} else {
				vscode.window.showWarningMessage(`文件中未找到指定代码片段：${fileUri.fsPath}`);
			}
		} catch (error) {
			console.error('Failed to jump to file and snippet:', error);
			vscode.window.showErrorMessage(`跳转到文件并搜索代码片段失败：${error instanceof Error ? error.message : String(error)}`);
		}
	};

	// 全局搜索并跳转到代码片段
	const jumpToGlobalSnippet = async (snippet: string) => {
		try {
			// 先获取当前工作区的所有文件
			const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 10000);
			console.log('搜索文件数量:', files.length);

			let matchCount = 0;
			let matchFile: vscode.Uri | undefined;
			let matchStartPosition: vscode.Position | undefined;
			let matchEndPosition: vscode.Position | undefined;

			// 遍历文件，查找包含代码片段的文件
			for (const file of files) {
				try {
					const doc = await vscode.workspace.openTextDocument(file);
					const text = doc.getText();
					const index = text.indexOf(snippet);
					if (index !== -1) {
						matchCount++;
						matchFile = file;
						matchStartPosition = doc.positionAt(index);
						matchEndPosition = doc.positionAt(index + snippet.length);
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

			if (matchCount === 1 && matchFile && matchStartPosition && matchEndPosition) {
				const textEditor = await vscode.window.showTextDocument(matchFile);
				const range = new vscode.Range(matchStartPosition, matchEndPosition);
				await vscode.window.showTextDocument(matchFile, { selection: range });
				// 确保选中的内容可见
				await textEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);
			} else if (matchCount === 0) {
				vscode.window.showWarningMessage('未找到匹配的代码片段');
			} else {
				vscode.window.showWarningMessage('代码片段已不是全局唯一');
			}
		} catch (error) {
			console.error('Global search failed:', error);
			vscode.window.showErrorMessage(`全局搜索失败：${error instanceof Error ? error.message : String(error)}`);
		}
	};

	// 监听URI激活事件
	context.subscriptions.push(vscode.window.registerUriHandler({
		handleUri: handleUri
	}));

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

	// 注册添加用户注释到面板的命令
	const addCommentDisposable = vscode.commands.registerCommand('file-ref-tags.addComment', async () => {
		// 显示输入框，让用户输入注释
		const comment = await vscode.window.showInputBox({
			prompt: '请输入注释内容',
			placeHolder: '例如：重要的API函数',
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return '注释内容不能为空';
				}
				return null;
			}
		});

		if (comment) {
			// 创建引用项
			dataManager.addReference({
				type: 'comment',
				title: comment.trim()
			});

			// 通知webview更新
			webviewViewProvider.notifyUpdate();
			vscode.window.showInformationMessage('已添加用户注释到面板');
		}
	});

	context.subscriptions.push(addCommentDisposable);

	// 辅助函数：生成 vscode:// 链接
	const generateVscodeLink = (filePath?: string, snippet?: string): string => {
		const scheme = vscode.env.uriScheme || 'vscode';
		const baseUrl = `${scheme}://lirentech.file-ref-tags`;
		const params = new URLSearchParams();

		if (filePath) {
			params.append('filePath', filePath);
		}
		if (snippet) {
			params.append('snippet', snippet);
		}

		const queryString = params.toString();
		return queryString ? `${baseUrl}?${queryString}` : baseUrl;
	};

	// 辅助函数：获取相对于工作区的路径
	const getWorkspaceRelativePath = (filePath: string): string | undefined => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			return undefined;
		}

		// 查找匹配的工作区文件夹
		for (const folder of workspaceFolders) {
			const folderPath = folder.uri.fsPath;
			if (filePath.startsWith(folderPath)) {
				// 获取相对于工作区的路径
				const relativePath = path.relative(folderPath, filePath);
				return relativePath;
			}
		}

		return undefined;
	};

	// 注册复制链接（仅代码片段）的命令
	const copyLinkSnippetOnlyDisposable = vscode.commands.registerCommand('file-ref-tags.copyLinkSnippetOnly', async () => {
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
		const link = generateVscodeLink(undefined, snippet);

		await vscode.env.clipboard.writeText(link);
		vscode.window.showInformationMessage('链接已复制到剪贴板');
	});

	context.subscriptions.push(copyLinkSnippetOnlyDisposable);

	// 注册复制链接（仅文件名）的命令
	const copyLinkFileNameOnlyDisposable = vscode.commands.registerCommand('file-ref-tags.copyLinkFileNameOnly', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('没有打开的文件');
			return;
		}

		const document = editor.document;
		const filePath = document.uri.fsPath;
		const fileName = path.basename(filePath);
		const link = generateVscodeLink(fileName, undefined);

		await vscode.env.clipboard.writeText(link);
		vscode.window.showInformationMessage('链接已复制到剪贴板');
	});

	context.subscriptions.push(copyLinkFileNameOnlyDisposable);

	// 注册复制链接（文件名+代码片段）的命令
	const copyLinkFileNameAndSnippetDisposable = vscode.commands.registerCommand('file-ref-tags.copyLinkFileNameAndSnippet', async () => {
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
		const fileName = path.basename(filePath);
		const snippet = document.getText(selection);
		const link = generateVscodeLink(fileName, snippet);

		await vscode.env.clipboard.writeText(link);
		vscode.window.showInformationMessage('链接已复制到剪贴板');
	});

	context.subscriptions.push(copyLinkFileNameAndSnippetDisposable);

	// 注册复制链接（父级文件夹+文件名+代码片段）的命令
	const copyLinkParentDirAndSnippetDisposable = vscode.commands.registerCommand('file-ref-tags.copyLinkParentDirAndSnippet', async () => {
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
		const dirName = path.basename(path.dirname(filePath));
		const fileName = path.basename(filePath);
		const parentDirAndFileName = `${dirName}/${fileName}`;
		const snippet = document.getText(selection);
		const link = generateVscodeLink(parentDirAndFileName, snippet);

		await vscode.env.clipboard.writeText(link);
		vscode.window.showInformationMessage('链接已复制到剪贴板');
	});

	context.subscriptions.push(copyLinkParentDirAndSnippetDisposable);

	// 注册复制链接（项目级路径+代码片段）的命令
	const copyLinkWorkspacePathAndSnippetDisposable = vscode.commands.registerCommand('file-ref-tags.copyLinkWorkspacePathAndSnippet', async () => {
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
		const workspaceRelativePath = getWorkspaceRelativePath(filePath);

		if (!workspaceRelativePath) {
			vscode.window.showErrorMessage('无法获取项目级路径，请确保文件在工作区内');
			return;
		}

		const snippet = document.getText(selection);
		// 将路径分隔符统一为正斜杠（URL友好）
		const normalizedPath = workspaceRelativePath.replace(/\\/g, '/');
		const link = generateVscodeLink(normalizedPath, snippet);

		await vscode.env.clipboard.writeText(link);
		vscode.window.showInformationMessage('链接已复制到剪贴板');
	});

	context.subscriptions.push(copyLinkWorkspacePathAndSnippetDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
