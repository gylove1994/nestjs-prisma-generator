# NestJS Prisma Generator

![NPM Version](https://img.shields.io/npm/v/%40gylove1994%2Fnpg?style=flat)

## 项目简介

NestJS Prisma Generator 是一个用于生成 NestJS 和 Prisma 代码的命令行工具。

## 功能

- 自动生成实体(Entity)代码,与 Prisma 模型保持同步
- 生成枚举(Enum)代码,确保类型安全
- 创建完整的模块(Module)结构,包括控制器、服务和 DTO
- 支持生成所有类型的代码,满足不同开发需求
- 生成符合 NestJS 最佳实践的代码结构
- 支持自定义模板,灵活适应项目需求 (TBD)

## 安装

```bash
npm install @gylove1994/npg -g
```

## 使用方法

### 生成代码

你可以使用以下命令来生成代码：

```bash
npg
```

根据提示选择你要生成的代码类型、Prisma schema 文件路径和输出目录。

### 命令行选项

wip

## 项目结构

- `src/index.ts` - 主入口文件,定义命令行工具的核心逻辑
- `src/generateEntity.ts` - 负责生成实体代码的模块
- `src/generateEnum.ts` - 处理枚举代码生成的逻辑
- `src/generateNestModule.ts` - 生成 NestJS 模块结构的核心代码
- `src/generateNestController.ts` - 创建控制器代码的模块
- `src/generateNestDto.ts` - 生成数据传输对象(DTO)的逻辑
- `src/utils/` - 包含各种辅助函数,如文件操作、类型映射等

## 开发

### 本地开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 许可证

[MIT](LICENSE)

## 作者

gylove1994

## 贡献指南

我们欢迎并感谢任何形式的贡献!如果您想为项目做出贡献,请遵循以下步骤:

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request
