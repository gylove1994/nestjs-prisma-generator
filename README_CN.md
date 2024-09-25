# NestJS Prisma Generator

## 项目简介

NestJS Prisma Generator 是一个用于生成 NestJS 和 Prisma 代码的命令行工具。

## 功能

- 生成实体（Entity）代码
- 生成枚举（Enum）代码
- 生成模块（Module）代码
- 支持生成所有类型的代码

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

- `src/index.ts` - 主入口文件，定义了命令行工具的行为。
- `src/generateEntity.ts` - 生成实体代码的逻辑。
- `src/generateEnum.ts` - 生成枚举代码的逻辑。
- `src/utils` - 工具函数，包括文件操作、类型映射等。

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
