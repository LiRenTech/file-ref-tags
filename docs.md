# File Ref Tags 开发文档

## 项目概述

File Ref Tags 是一个 VSCode 扩展插件，用于管理和快速访问代码引用。本文档将介绍如何启动开发环境、运行测试以及打包发布插件。

## 系统要求

- Node.js 版本：推荐 v20 或更高
- pnpm 版本：推荐 v8 或更高
- VSCode 版本：^1.107.0

## 开发环境设置

### 1. 克隆仓库

```bash
git clone <仓库地址>
cd vscode-file-ref-tags
```

### 2. 安装依赖

使用 pnpm 安装项目依赖：

```bash
pnpm install
```

## 开发命令

### 1. 开发构建

编译 TypeScript 代码：

```bash
pnpm run compile
```

### 2. 监听模式

启动监听模式，当文件变化时自动重新编译：

```bash
pnpm run watch
```

### 3. 类型检查

运行 TypeScript 类型检查：

```bash
pnpm run check-types
```

### 4. 代码检查

运行 ESLint 代码检查：

```bash
pnpm run lint
```

### 5. 运行测试

运行扩展测试：

```bash
pnpm run test
```

## 启动开发环境

### 1. 启动 VSCode 调试

1. 打开 VSCode
2. 打开项目文件夹
3. 点击左侧活动栏的调试图标（或按 `Ctrl+Shift+D`）
4. 在调试配置下拉菜单中选择 "Run Extension"
5. 点击绿色的 "开始调试" 按钮（或按 `F5`）
6. 这将启动一个新的 VSCode 实例，加载当前开发的扩展

### 2. 在调试实例中测试

在新启动的 VSCode 实例中：

1. 点击左侧活动栏的 "File Ref Tags" 图标打开引用面板
2. 测试插件的各项功能
3. 可以在原 VSCode 实例中修改代码，修改会自动同步到调试实例

## 打包发布

### 1. 生产构建

构建生产版本的扩展 JavaScript 文件：

```bash
pnpm run package
```

这会将 TypeScript 代码编译成 JavaScript 并输出到 `dist` 目录，但不会生成 `.vsix` 文件。

### 2. 生成 VSIX 文件

要生成用于发布的 `.vsix` 文件，需要使用 VSCE 工具：

```bash
vsce package
```

构建成功后，会在项目根目录生成 `.vsix` 文件，用于发布到 VSCode 扩展市场。

### 3. 一键构建和打包

可以将构建和打包命令结合起来：

```bash
pnpm run package && vsce package
```

### 3. 发布到 VSCode 扩展市场

需要使用 VSCE（VSCode Extension Manager）工具发布扩展：

1. 安装 VSCE：
   ```bash
   npm install -g @vscode/vsce
   ```

2. 登录到 Azure DevOps：
   ```bash
   vsce login <publisher-name>
   ```

3. 发布扩展：
   ```bash
   vsce publish
   ```

   或者直接发布 `.vsix` 文件：
   ```bash
   vsce publish --packagePath <vsix-file-path>
   ```

## 项目结构

```
.
├── .vscode/            # VSCode 配置文件
├── resources/          # 资源文件
├── src/                # 源代码
│   ├── test/           # 测试代码
│   └── extension.ts    # 扩展入口文件
├── .gitignore          # Git 忽略文件
├── CHANGELOG.md        # 更新日志
├── LICENSE            # 许可证文件
├── README.md          # 项目说明文档
├── docs.md            # 开发文档
├── esbuild.js         # ESBuild 配置
├── eslint.config.mjs  # ESLint 配置
├── package.json       # 项目配置
├── pnpm-lock.yaml     # pnpm 依赖锁文件
├── tsconfig.json      # TypeScript 配置
└── vsc-extension-quickstart.md  # VSCode 扩展快速启动指南
```

## 技术栈

- **开发语言**：TypeScript
- **构建工具**：ESBuild
- **代码检查**：ESLint
- **测试框架**：Mocha + VSCode 扩展测试工具
- **依赖管理**：pnpm

## 调试技巧

1. **查看日志**：在调试实例中，按 `Ctrl+Shift+I` 打开开发者工具，在控制台查看日志
2. **断点调试**：在原 VSCode 实例中设置断点，调试实例运行到断点时会暂停
3. **热重载**：使用 `pnpm run watch` 启动监听模式，修改代码后会自动重新加载

## 常见问题

### 1. 构建失败

- 检查 Node.js 和 pnpm 版本是否符合要求
- 确保所有依赖已正确安装
- 运行 `pnpm run check-types` 检查类型错误
- 运行 `pnpm run lint` 检查代码错误

### 2. 扩展无法加载

- 检查 VSCode 版本是否符合要求（^1.107.0）
- 确保扩展已正确构建
- 检查扩展的 activationEvents 配置

### 3. 测试失败

- 确保测试环境已正确设置
- 检查测试用例是否符合预期
- 查看测试日志获取详细错误信息

## 贡献指南

1. 提交代码前请运行 `pnpm run check-types` 和 `pnpm run lint`
2. 确保所有测试通过
3. 提交 PR 时请提供详细的说明
4. 遵循项目的代码风格和命名规范

## 联系方式

如有问题或建议，欢迎在 GitHub 仓库提交 Issue 或 Pull Request。