export const TEMPLATE = `<!DOCTYPE html>
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
            font-size: 11px;
            font-weight: 400;
        }
        .container {
            padding: 4px 2px;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        h1 {
            font-size: 12px;
            margin: 0 0 8px 0;
            font-weight: 400;
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
            outline: 1px solid #3e3e42;
            padding: 0 4px;
            margin: 0;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            line-height: 22px;
        }
        .reference-item[data-type="file"] {
            background-color: rgba(14, 99, 156, 0.15);
        }
        .reference-item[data-type="file-snippet"] {
            background-color: rgba(180, 40, 80, 0.15);
        }
        .reference-item[data-type="global-snippet"] {
            background-color: rgba(74, 22, 140, 0.15);
        }
        .reference-item[data-type="comment"] {
            background-color: rgba(0, 125, 74, 0.15);
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
        .reference-title {
            font-size: 11px;
            font-weight: 400;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }
        .reference-item:hover .reference-title {
            margin-right: 50px;
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
        }
        .reference-item:hover .reference-actions {
            pointer-events: auto;
        }
        .reference-item:hover .reference-actions {
            opacity: 1;
        }
        .edit-btn {
            background: none;
            border: none;
            color: #858585;
            cursor: pointer;
            font-size: 12px;
            padding: 1px 5px;
            border-radius: 2px;
        }
        .edit-btn:hover {
            color: #0e639c;
            background-color: rgba(14, 99, 156, 0.1);
        }
        .delete-btn {
            background: none;
            border: none;
            color: #858585;
            cursor: pointer;
            font-size: 14px;
            padding: 1px 5px;
            border-radius: 2px;
        }
        .delete-btn:hover {
            color: #ff6b6b;
            background-color: rgba(255, 107, 107, 0.1);
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
            background-color: rgba(0, 0, 0, 0.5);
        }
        .modal-content {
            background-color: #252526;
            margin: 15% auto;
            padding: 12px;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            width: 220px;
            max-width: 90%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .modal-title {
            font-size: 14px;
            font-weight: 500;
            margin: 0;
        }
        .close-btn {
            background: none;
            border: none;
            color: #858585;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
        }
        .close-btn:hover {
            color: #d4d4d4;
        }
        .form-group {
            margin-bottom: 12px;
        }
        .form-label {
            display: block;
            font-size: 12px;
            margin-bottom: 4px;
            color: #858585;
        }
        .form-input {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #3e3e42;
            border-radius: 3px;
            background-color: #1e1e1e;
            color: #d4d4d4;
            font-size: 12px;
            box-sizing: border-box;
        }
        .form-input:focus {
            outline: none;
            border-color: #0e639c;
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
        }
        .btn {
            padding: 6px 12px;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
        }
        .btn-primary {
            background-color: #0e639c;
            color: white;
        }
        .btn-primary:hover {
            background-color: #1177bb;
        }
        .btn-secondary {
            background-color: #3e3e42;
            color: #d4d4d4;
        }
        .btn-secondary:hover {
            background-color: #4e4e53;
        }
        .actions-bar {
            margin-top: 8px;
            display: flex;
            gap: 4px;
        }
        .action-btn {
            background-color: #0e639c;
            color: white;
            border: none;
            padding: 4px 8px;
            font-size: 10px;
            cursor: pointer;
            width: 100%;
        }
        .action-btn:hover {
            background-color: #1177bb;
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

    <script>
        const vscode = acquireVsCodeApi();
        let references = [];
        let draggedItem = null;
        let currentEditingId = null;

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
        const modal = document.getElementById('edit-modal');
        const closeModal = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        const saveBtn = document.getElementById('save-btn');
        const titleInput = document.getElementById('title-input');

        // 关闭弹窗
        function hideModal() {
            modal.style.display = 'none';
            currentEditingId = null;
            titleInput.value = '';
        }

        // 显示弹窗
        function showModal(id, currentTitle) {
            currentEditingId = id;
            titleInput.value = currentTitle;
            modal.style.display = 'block';
            titleInput.focus();
            titleInput.select();
        }

        // 弹窗事件监听
        closeModal.addEventListener('click', hideModal);
        cancelBtn.addEventListener('click', hideModal);
        saveBtn.addEventListener('click', () => {
            if (currentEditingId) {
                const newTitle = titleInput.value.trim();
                if (newTitle) {
                    vscode.postMessage({ 
                        command: 'updateReferenceTitle', 
                        id: currentEditingId, 
                        title: newTitle 
                    });
                    hideModal();
                }
            }
        });

        // 点击弹窗外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });

        // 按下Enter键保存，按下Escape键取消
        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            } else if (e.key === 'Escape') {
                hideModal();
            }
        });

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
                    if (!e.target.classList.contains('delete-btn') && !e.target.classList.contains('edit-btn')) {
                        vscode.postMessage({ command: 'jumpToReference', id: reference.id });
                    }
                });

                // 使用DOM API创建元素，避免模板字面量语法错误
                const titleH3 = document.createElement('h3');
                titleH3.className = 'reference-title';
                titleH3.textContent = reference.title;

                // 创建操作栏
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'reference-actions';

                // 编辑按钮
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.textContent = '编辑';
                editBtn.onclick = function() {
                    showModal(reference.id, reference.title);
                };

                // 删除按钮
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = function() {
                    vscode.postMessage({ command: 'deleteReference', id: reference.id });
                };

                // 组装元素
                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(deleteBtn);
                
                li.appendChild(titleH3);
                li.appendChild(actionsDiv);

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
