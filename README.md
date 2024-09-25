# NestJS Prisma Generator

[中文文档](README_CN.md)

## Project Overview

NestJS Prisma Generator is a command-line tool for generating NestJS and Prisma code.

## Features

- Generate Entity code
- Generate Enum code
- Generate Module code
- Support generating all types of code

## Installation

```bash
npm install
```

## Usage

### Generating Code

You can use the following command to generate code:

```bash
npx @gylove1994/npg
```

Follow the prompts to select the type of code you want to generate, the path to your Prisma schema file, and the output directory.

### Command Line Options

wip

## Project Structure

- `src/index.ts` - Main entry file, defines the behavior of the command-line tool.
- `src/generateEntity.ts` - Logic for generating entity code.
- `src/generateEnum.ts` - Logic for generating enum code.
- `src/utils` - Utility functions, including file operations, type mapping, etc.

## Development

### Local Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Code Linting

```bash
npm run lint
```

## License

[MIT](LICENSE)

## Author

gylove1994
