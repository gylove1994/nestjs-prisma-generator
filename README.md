# NestJS Prisma Generator

![NPM Version](https://img.shields.io/npm/v/%40gylove1994%2Fnpg?style=flat)


[中文文档](README_CN.md)

## Project Overview

NestJS Prisma Generator is a command-line tool for generating NestJS and Prisma code.

## Features

- Automatically generate Entity code, synchronized with Prisma models
- Generate Enum code to ensure type safety
- Create complete Module structures, including controllers, services, and DTOs
- Support generating all types of code to meet different development needs
- Generate code structures that comply with NestJS best practices
- Support custom templates for flexible adaptation to project requirements (TBD)

## Installation

```bash
npm install @gylove1994/npg -g
```

## Usage

### Generating Code

You can use the following command to generate code:

```bash
npg
```

Follow the prompts to select the type of code you want to generate, the path to your Prisma schema file, and the output directory.

### Command Line Options

wip

## Project Structure

- `src/index.ts` - Main entry file, defines the core logic of the command-line tool
- `src/generateEntity.ts` - Module responsible for generating entity code
- `src/generateEnum.ts` - Handles the logic for generating enum code
- `src/generateNestModule.ts` - Core code for generating NestJS module structures
- `src/generateNestController.ts` - Module for creating controller code
- `src/generateNestDto.ts` - Logic for generating Data Transfer Objects (DTOs)
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

## Contribution Guidelines

We welcome and appreciate any form of contribution! If you want to contribute to the project, please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
