export const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Ref Tags</title>
    <style>
        /* VS Code会自动在webview中注入CSS变量，我们直接使用它们，并提供默认值作为后备 */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--vscode-editor-background, #1e1e1e);
            color: var(--vscode-editor-foreground, #d4d4d4);
            font-size: 12px;
            font-weight: 400;
            height: 100vh;
            overflow: hidden;
        }
        .container {
            padding: 6px 2px;
            display: flex;
            flex-direction: column;
            height: calc(100vh - 12px);
            overflow-y: auto;
        }
        h1 {
            font-size: 13px;
            margin: 0 0 8px 0;
            font-weight: 500;
            color: var(--vscode-foreground, #cccccc);
            padding: 0 6px;
            border-bottom: 1px solid var(--vscode-panel-border, #3e3e42);
            padding-bottom: 4px;
        }
        .empty-state {
            text-align: center;
            padding: 24px 0;
            color: var(--vscode-descriptionForeground, #858585);
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .references-list {
            list-style-type: none;
            padding: 0;
            margin: 0;
            flex: 1;
            overflow-y: auto;
        }
        .reference-group {
            margin: 6px 2px;
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 4px;
            overflow: hidden;
            background-color: rgba(60, 60, 65, 0.4);
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .group-header {
            padding: 6px 8px;
            background-color: rgba(65, 65, 70, 0.5);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            border-bottom: 1px solid var(--vscode-panel-border, #3e3e42);
        }
        .group-title {
            font-weight: 500;
            color: var(--vscode-sideBarTitle-foreground, #e0e0e0);
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
        }
        .group-actions {
            display: flex;
            gap: 3px;
        }
        .group-content {
            padding: 4px 0;
        }
        .group-items {
            padding-left: 6px;
        }
        .reference-item {
            outline: 1px solid var(--vscode-panel-border, #3e3e42);
            padding: 4px 8px;
            margin: 0 4px 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            line-height: 16px;
            background-color: var(--vscode-editor-background, #1e1e1e);
            border-radius: 3px;
            min-height: 26px;
        }
        .reference-item[data-type="file"] {
            background-color: rgba(14, 99, 156, 0.1);
            border-left: 2px solid rgba(14, 99, 156, 0.7);
        }
        .reference-item[data-type="file-snippet"] {
            background-color: rgba(180, 40, 80, 0.1);
            border-left: 2px solid rgba(180, 40, 80, 0.7);
        }
        .reference-item[data-type="global-snippet"] {
            background-color: rgba(74, 22, 140, 0.1);
            border-left: 2px solid rgba(74, 22, 140, 0.7);
        }
        .reference-item[data-type="comment"] {
            background-color: rgba(0, 125, 74, 0.1);
            border-left: 2px solid rgba(0, 125, 74, 0.7);
        }
        .reference-item:hover {
            background-color: var(--vscode-list-hoverBackground, #2a2d2e) !important;
            outline-color: var(--vscode-input-focusBorder, #0e639c);
            transform: translateX(2px);
        }
        .reference-item.dragging {
            opacity: 0.7;
            outline: 1px dashed var(--vscode-input-focusBorder, #0e639c);
        }
        .reference-item.drag-over {
            border-top: 1px solid var(--vscode-input-focusBorder, #0e639c);
        }
        .reference-title {
            font-size: 12px;
            font-weight: 400;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            color: var(--vscode-editor-foreground, #d4d4d4);
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .reference-item:hover .reference-title {
            color: var(--vscode-list-hoverForeground, #cccccc);
        }
        .reference-type {
            font-size: 9px;
            padding: 1px 3px;
            border-radius: 2px;
            margin-left: 6px;
            text-transform: uppercase;
            align-self: flex-start;
        }
        .reference-type[data-type="file"] {
            background-color: rgba(14, 99, 156, 0.4);
            color: #99ddff;
        }
        .reference-type[data-type="file-snippet"] {
            background-color: rgba(180, 40, 80, 0.4);
            color: #f6b6c7;
        }
        .reference-type[data-type="global-snippet"] {
            background-color: rgba(74, 22, 140, 0.4);
            color: #cfa1f0;
        }
        .reference-type[data-type="comment"] {
            background-color: rgba(0, 125, 74, 0.4);
            color: #77e0b0;
        }
        .reference-actions {
            position: absolute;
            right: 6px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
            background: var(--vscode-editor-background, #1e1e1e);
            padding: 1px;
            border-radius: 2px;
        }
        .reference-item:hover .reference-actions {
            pointer-events: auto;
            opacity: 1;
        }
        .edit-btn, .ungroup-btn {
            background: none;
            border: none;
            color: var(--vscode-descriptionForeground, #858585);
            cursor: pointer;
            font-size: 11px;
            padding: 2px 5px;
            border-radius: 2px;
            min-width: 34px;
        }
        .edit-btn:hover, .ungroup-btn:hover {
            color: var(--vscode-textLink-foreground, #3794ff);
            background-color: var(--vscode-toolbar-hoverBackground, #2a2d2e);
        }
        .delete-btn {
            background: none;
            border: none;
            color: var(--vscode-descriptionForeground, #858585);
            cursor: pointer;
            font-size: 13px;
            padding: 2px 5px;
            border-radius: 2px;
        }
        .delete-btn:hover {
            color: var(--vscode-errorForeground, #f48771);
            background-color: var(--vscode-toolbar-hoverBackground, #2a2d2e);
        }
        /* 弹窗样式 */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
        }
        .modal-content {
            background-color: var(--vscode-editor-background, #1e1e1e);
            margin: 25% auto;
            padding: 12px;
            border: 1px solid var(--vscode-panel-border, #3e3e42);
            border-radius: 4px;
            width: 220px;
            max-width: 90%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .modal-title {
            font-size: 13px;
            font-weight: 500;
            margin: 0;
            color: var(--vscode-editor-foreground, #d4d4d4);
        }
        .close-btn {
            background: none;
            border: none;
            color: var(--vscode-descriptionForeground, #858585);
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 2px;
        }
        .close-btn:hover {
            background-color: var(--vscode-toolbar-hoverBackground, #2a2d2e);
            color: var(--vscode-editor-foreground, #d4d4d4);
        }
        .form-group {
            margin-bottom: 10px;
        }
        .form-label {
            display: block;
            font-size: 11px;
            margin-bottom: 4px;
            color: var(--vscode-descriptionForeground, #858585);
        }
        .form-input, .form-select {
            width: 100%;
            padding: 5px 8px;
            border: 1px solid var(--vscode-input-border, #3e3e42);
            border-radius: 3px;
            background-color: var(--vscode-input-background, #3c3c3c);
            color: var(--vscode-input-foreground, #cccccc);
            font-size: 12px;
            box-sizing: border-box;
        }
        .form-input:focus, .form-select:focus {
            outline: none;
            border-color: var(--vscode-input-focusBorder, #0e639c);
            box-shadow: 0 0 0 1px rgba(14, 99, 156, 0.3);
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 6px;
            margin-top: 6px;
        }
        .btn {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
            min-width: 50px;
        }
        .btn-primary {
            background-color: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #ffffff);
        }
        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground, #1177bb);
        }
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground, #3e3e42);
            color: var(--vscode-button-secondaryForeground, #cccccc);
        }
        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground, #454545);
        }
        .actions-bar {
            margin-top: 8px;
            display: flex;
            gap: 4px;
            padding: 0 2px;
        }
        .action-btn {
            background-color: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #ffffff);
            border: none;
            padding: 6px 8px;
            font-size: 12px;
            cursor: pointer;
            width: 100%;
            border-radius: 3px;
            transition: background-color 0.2s;
        }
        .action-btn:hover {
            background-color: var(--vscode-button-hoverBackground, #1177bb);
        }
        .add-group-btn {
            background-color: var(--vscode-button-secondaryBackground, #3e3e42);
            color: var(--vscode-button-secondaryForeground, #cccccc);
            border: none;
            padding: 6px 8px;
            font-size: 12px;
            cursor: pointer;
            width: 100%;
            border-radius: 3px;
            transition: background-color 0.2s;
        }
        .add-group-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground, #454545);
        }
        
        /* 隐藏内容的样式 */
        .hidden {
            display: none;
        }
        
        /* 旋转箭头指示器 */
        .expand-indicator {
            transition: transform 0.2s ease;
            font-size: 11px;
        }
        .expanded .expand-indicator {
            transform: rotate(90deg);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>File References</h1>
        <div id="empty-state" class="empty-state">
            <p>No references yet. Add your first reference!</p>
        </div>
        <ul id="references-list" class="references-list"></ul>
        <div class="actions-bar">
            <button id="show-storage-btn" class="action-btn">Show Storage Location</button>
        </div>
    </div>

    <!-- 编辑标题弹窗 -->
    <div id="edit-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">编辑标题</h3>
                <button class="close-btn" id="close-modal">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label" for="title-input">标题</label>
                <input type="text" class="form-input" id="title-input" placeholder="输入标题...">
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-btn">取消</button>
                <button class="btn btn-primary" id="save-btn">保存</button>
            </div>
        </div>
    </div>

    <!-- 分组弹窗 -->
    <div id="group-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">移动到分组</h3>
                <button class="close-btn" id="close-group-modal">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label" for="group-select">选择分组</label>
                <select class="form-select" id="group-select">
                    <option value="">无分组</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-group-btn">取消</button>
                <button class="btn btn-primary" id="move-group-btn">移动</button>
            </div>
        </div>
    </div>

    <!-- 添加分组弹窗 -->
    <div id="add-group-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">添加分组</h3>
                <button class="close-btn" id="close-add-group-modal">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label" for="group-name-input">分组名称</label>
                <input type="text" class="form-input" id="group-name-input" placeholder="输入分组名称...">
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-add-group-btn">取消</button>
                <button class="btn btn-primary" id="create-group-btn">创建</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let references = [];
        let groups = [];
        let draggedItem = null;
        let currentEditingId = null;
        let currentGroupId = null; // 当前正在移动的引用项ID
        let expandedGroups = {}; // 记录展开/折叠状态

        // 初始化
        vscode.postMessage({ command: 'getReferences' });

        // 添加显示存储位置按钮事件
        const showStorageBtn = document.getElementById('show-storage-btn');
        if (showStorageBtn) {
            showStorageBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'showStorageLocation' });
            });
        }


        // 初始化弹窗事件
        const editModal = document.getElementById('edit-modal');
        const closeModal = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        const saveBtn = document.getElementById('save-btn');
        const titleInput = document.getElementById('title-input');

        // 分组弹窗相关元素
        const groupModal = document.getElementById('group-modal');
        const closeGroupModal = document.getElementById('close-group-modal');
        const cancelGroupBtn = document.getElementById('cancel-group-btn');
        const moveGroupBtn = document.getElementById('move-group-btn');
        const groupSelect = document.getElementById('group-select');

        // 添加分组弹窗相关元素
        const addGroupModal = document.getElementById('add-group-modal');
        const closeAddGroupModal = document.getElementById('close-add-group-modal');
        const cancelAddGroupBtn = document.getElementById('cancel-add-group-btn');
        const createGroupBtn = document.getElementById('create-group-btn');
        const groupNameInput = document.getElementById('group-name-input');

        // 关闭编辑弹窗
        function hideEditModal() {
            editModal.style.display = 'none';
            currentEditingId = null;
            titleInput.value = '';
        }

        // 显示编辑弹窗
        function showEditModal(id, currentTitle) {
            currentEditingId = id;
            titleInput.value = currentTitle;
            editModal.style.display = 'block';
            titleInput.focus();
            titleInput.select();
        }

        // 关闭分组弹窗
        function hideGroupModal() {
            groupModal.style.display = 'none';
            currentGroupId = null;
        }

        // 显示分组弹窗
        function showGroupModal(id) {
            currentGroupId = id;
            
            // 更新分组选项
            updateGroupOptions();
            
            groupModal.style.display = 'block';
        }

        // 更新分组选项
        function updateGroupOptions() {
            // 清空现有选项（保留"无分组"选项）
            groupSelect.innerHTML = '<option value="">无分组</option>';
            
            // 添加所有分组选项
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name;
                groupSelect.appendChild(option);
            });
        }

        // 关闭添加分组弹窗
        function hideAddGroupModal() {
            addGroupModal.style.display = 'none';
            groupNameInput.value = '';
        }

        // 显示添加分组弹窗
        function showAddGroupModal() {
            groupNameInput.value = '';
            addGroupModal.style.display = 'block';
            groupNameInput.focus();
        }

        // 弹窗事件监听
        closeModal.addEventListener('click', hideEditModal);
        cancelBtn.addEventListener('click', hideEditModal);
        saveBtn.addEventListener('click', () => {
            if (currentEditingId) {
                const newTitle = titleInput.value.trim();
                if (newTitle) {
                    vscode.postMessage({ 
                        command: 'updateReferenceTitle', 
                        id: currentEditingId, 
                        title: newTitle 
                    });
                    hideEditModal();
                }
            }
        });

        // 分组弹窗事件监听
        closeGroupModal.addEventListener('click', hideGroupModal);
        cancelGroupBtn.addEventListener('click', hideGroupModal);
        moveGroupBtn.addEventListener('click', () => {
            if (currentGroupId) {
                const selectedGroupId = groupSelect.value;
                vscode.postMessage({ 
                    command: 'updateReferenceGroup', 
                    id: currentGroupId, 
                    groupId: selectedGroupId || null
                });
                hideGroupModal();
            }
        });

        // 添加分组弹窗事件监听
        closeAddGroupModal.addEventListener('click', hideAddGroupModal);
        cancelAddGroupBtn.addEventListener('click', hideAddGroupModal);
        createGroupBtn.addEventListener('click', () => {
            const groupName = groupNameInput.value.trim();
            if (groupName) {
                vscode.postMessage({ 
                    command: 'addGroup', 
                    name: groupName 
                });
                hideAddGroupModal();
            }
        });

        // 点击弹窗外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === editModal) {
                hideEditModal();
            }
            if (e.target === groupModal) {
                hideGroupModal();
            }
            if (e.target === addGroupModal) {
                hideAddGroupModal();
            }
        });

        // 按下Enter键保存，按下Escape键取消
        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            } else if (e.key === 'Escape') {
                hideEditModal();
            }
        });

        groupNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                createGroupBtn.click();
            } else if (e.key === 'Escape') {
                hideAddGroupModal();
            }
        });

        // 处理消息
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateReferences':
                    references = message.references || [];
                    groups = message.groups || [];
                    renderReferences();
                    break;
            }
        });

        // 渲染引用列表
        function renderReferences() {
            const list = document.getElementById('references-list');
            const emptyState = document.getElementById('empty-state');

            if (references.length === 0 && groups.length === 0) {
                list.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            list.style.display = 'block';
            emptyState.style.display = 'none';

            list.innerHTML = '';

            // 首先渲染有分组的引用项
            const groupedReferences = {};
            const ungroupedReferences = [];

            references.forEach(ref => {
                if (ref.groupId) {
                    if (!groupedReferences[ref.groupId]) {
                        groupedReferences[ref.groupId] = [];
                    }
                    groupedReferences[ref.groupId].push(ref);
                } else {
                    ungroupedReferences.push(ref);
                }
            });

            // 渲染分组
            groups.forEach(group => {
                // 不管分组是否为空，都渲染出来
                const groupLi = document.createElement('li');
                groupLi.className = 'reference-group';
                groupLi.dataset.id = group.id;

                const groupHeader = document.createElement('div');
                groupHeader.className = 'group-header expanded'; // 默认展开
                groupHeader.onclick = toggleGroup.bind(null, group.id);

                const groupTitle = document.createElement('div');
                groupTitle.className = 'group-title';
                
                // 添加展开/折叠箭头
                const expandIndicator = document.createElement('span');
                expandIndicator.className = 'expand-indicator';
                expandIndicator.textContent = '▶';
                
                const groupNameSpan = document.createElement('span');
                groupNameSpan.textContent = group.name;

                groupTitle.appendChild(expandIndicator);
                groupTitle.appendChild(groupNameSpan);

                const groupActions = document.createElement('div');
                groupActions.className = 'group-actions';

                const deleteGroupBtn = document.createElement('button');
                deleteGroupBtn.className = 'delete-btn';
                deleteGroupBtn.textContent = '×';
                deleteGroupBtn.onclick = function(e) {
                    e.stopPropagation();
                    if (confirm('确定要删除这个分组吗？分组内的引用项将变为未分组状态。')) {
                        vscode.postMessage({ command: 'deleteGroup', id: group.id });
                    }
                };

                groupActions.appendChild(deleteGroupBtn);
                groupHeader.appendChild(groupTitle);
                groupHeader.appendChild(groupActions);
                groupLi.appendChild(groupHeader);

                const groupContent = document.createElement('div');
                groupContent.className = 'group-content';

                const groupItemsUl = document.createElement('ul');
                groupItemsUl.className = 'group-items';

                // 如果分组有引用项，则渲染出来
                if (groupedReferences[group.id] && groupedReferences[group.id].length > 0) {
                    groupedReferences[group.id].forEach(reference => {
                        groupItemsUl.appendChild(createReferenceElement(reference));
                    });
                } else {
                    // 如果分组为空，显示提示信息
                    const emptyItem = document.createElement('li');
                    emptyItem.className = 'empty-group-item';
                    emptyItem.style.padding = '8px';
                    emptyItem.style.textAlign = 'center';
                    emptyItem.style.color = 'var(--vscode-descriptionForeground, #858585)';
                    emptyItem.style.fontSize = '11px';
                    emptyItem.textContent = '此分组为空，拖拽引用项至此';
                    groupItemsUl.appendChild(emptyItem);
                }

                groupContent.appendChild(groupItemsUl);
                groupLi.appendChild(groupContent);
                list.appendChild(groupLi);
                
                // 设置初始显示状态
                if (!expandedGroups[group.id]) {
                    groupContent.style.display = 'none';
                    groupHeader.classList.remove('expanded');
                } else {
                    groupContent.style.display = 'block';
                    groupHeader.classList.add('expanded');
                }
            });

            // 渲染未分组的引用项
            if (ungroupedReferences.length > 0) {
                ungroupedReferences.forEach(reference => {
                    list.appendChild(createReferenceElement(reference));
                });
            }
        }

        // 切换分组展开/折叠状态
        function toggleGroup(groupId) {
            const groupElement = document.querySelector('.reference-group[data-id="' + groupId + '"]');
            if (!groupElement) return;

            const groupContent = groupElement.querySelector('.group-content');
            const groupHeader = groupElement.querySelector('.group-header');
            const expandIndicator = groupElement.querySelector('.expand-indicator');

            if (groupContent.style.display === 'none') {
                groupContent.style.display = 'block';
                groupHeader.classList.add('expanded');
                expandedGroups[groupId] = true;
            } else {
                groupContent.style.display = 'none';
                groupHeader.classList.remove('expanded');
                expandedGroups[groupId] = false;
            }
        }

        // 创建引用项元素
        function createReferenceElement(reference) {
            const li = document.createElement('li');
            li.className = 'reference-item';
            li.draggable = true;
            li.dataset.id = reference.id;
            li.dataset.type = reference.type;

            // 设置拖拽事件
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('dragenter', handleDragEnter);
            li.addEventListener('dragleave', handleDragLeave);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragend', handleDragEnd);

            // 点击跳转
            li.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn') && 
                    !e.target.classList.contains('edit-btn') && 
                    !e.target.classList.contains('ungroup-btn')) {
                    vscode.postMessage({ command: 'jumpToReference', id: reference.id });
                }
            });

            // 右键菜单
            li.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showGroupModal(reference.id);
            });

            // 创建标题元素
            const titleH3 = document.createElement('h3');
            titleH3.className = 'reference-title';
            
            // 添加类型标识
            const typeSpan = document.createElement('span');
            typeSpan.className = 'reference-type';
            typeSpan.dataset.type = reference.type;
            
            // 根据类型设置显示文本
            switch(reference.type) {
                case 'file':
                    typeSpan.textContent = '文件';
                    break;
                case 'file-snippet':
                    typeSpan.textContent = '片段';
                    break;
                case 'global-snippet':
                    typeSpan.textContent = '全局';
                    break;
                case 'comment':
                    typeSpan.textContent = '注释';
                    break;
            }
            
            titleH3.textContent = reference.title;
            titleH3.appendChild(typeSpan);

            // 创建操作栏
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'reference-actions';

            // 分组按钮
            const groupBtn = document.createElement('button');
            groupBtn.className = 'edit-btn';
            groupBtn.textContent = '分组';
            groupBtn.onclick = function(e) {
                e.stopPropagation();
                showGroupModal(reference.id);
            };

            // 编辑按钮
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = '编辑';
            editBtn.onclick = function(e) {
                e.stopPropagation();
                showEditModal(reference.id, reference.title);
            };

            // 如果引用项有分组，添加取消分组按钮
            if (reference.groupId) {
                const ungroupBtn = document.createElement('button');
                ungroupBtn.className = 'ungroup-btn';
                ungroupBtn.textContent = '取消分组';
                ungroupBtn.onclick = function(e) {
                    e.stopPropagation();
                    vscode.postMessage({ 
                        command: 'updateReferenceGroup', 
                        id: reference.id, 
                        groupId: null 
                    });
                };
                
                actionsDiv.appendChild(ungroupBtn);
            }

            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.onclick = function(e) {
                e.stopPropagation();
                vscode.postMessage({ command: 'deleteReference', id: reference.id });
            };

            // 组装元素
            actionsDiv.appendChild(groupBtn);
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            
            li.appendChild(titleH3);
            li.appendChild(actionsDiv);

            return li;
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
                // 如果拖拽到组标题上，高亮整个组
                const groupHeader = this.closest('.group-header');
                if (groupHeader) {
                    const groupContainer = groupHeader.parentElement;
                    groupContainer.classList.add('drag-over');
                } else {
                    this.classList.add('drag-over');
                }
            }
        }

        function handleDragLeave(e) {
            // 如果是从组标题上离开，移除组的高亮
            const groupHeader = this.closest('.group-header');
            if (groupHeader) {
                const groupContainer = groupHeader.parentElement;
                groupContainer.classList.remove('drag-over');
            } else {
                this.classList.remove('drag-over');
            }
        }

        function handleDrop(e) {
            e.stopPropagation();
            
            // 移除所有高亮
            const dragOvers = document.querySelectorAll('.drag-over');
            dragOvers.forEach(item => item.classList.remove('drag-over'));
            
            if (draggedItem !== this) {
                // 检查是否拖拽到了组标题上
                const groupHeader = this.closest('.group-header');
                if (groupHeader) {
                    // 拖拽到组标题，将引用项添加到该组
                    const groupId = groupHeader.parentElement.dataset.id;
                    const referenceId = draggedItem.dataset.id;
                    vscode.postMessage({ 
                        command: 'updateReferenceGroup', 
                        id: referenceId, 
                        groupId: groupId 
                    });
                } else if (this.classList.contains('reference-group')) {
                    // 拖拽到组容器上，将引用项添加到该组
                    const groupId = this.dataset.id;
                    const referenceId = draggedItem.dataset.id;
                    vscode.postMessage({ 
                        command: 'updateReferenceGroup', 
                        id: referenceId, 
                        groupId: groupId 
                    });
                } else if (this.classList.contains('reference-item')) {
                    // 拖拽到未分组的引用项上，保持未分组状态，只调整顺序
                    const list = document.getElementById('references-list');
                    const ungroupedItems = Array.from(list.querySelectorAll('.reference-item'))
                        .filter(item => !item.closest('.reference-group')); // 排除属于分组的元素
                    const newOrder = ungroupedItems.map(item => item.dataset.id);
                    
                    vscode.postMessage({ command: 'updateOrder', order: newOrder });
                } else {
                    // 拖拽到空白区域，取消引用项的分组
                    const referenceId = draggedItem.dataset.id;
                    vscode.postMessage({ 
                        command: 'updateReferenceGroup', 
                        id: referenceId, 
                        groupId: null 
                    });
                }
            }

            return false;
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            draggedItem = null;
            // 移除所有drag-over类
            const list = document.getElementById('references-list');
            Array.from(list.children).forEach(item => {
                if (item.classList.contains('drag-over')) {
                    item.classList.remove('drag-over');
                }
            });
        }
    </script>
</body>
</html>`;