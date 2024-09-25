import { strings } from "@angular-devkit/core";
import type { Schema } from "@mrleebo/prisma-ast";
import { mkFile } from "./utils/mkFile";

const serviceTemplate = `
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class {_@modelNameCapitalize@_}Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<unknown> {
    return this.prisma.{_@modelName@_}.findMany();
  }

  async findOne(id: string): Promise<unknown> {
    return this.prisma.{_@modelName@_}.findUnique({ where: { id } });
  }

  async create(dto: {_@modelNameCapitalize@_}CreateDto): Promise<unknown> {
    return this.prisma.{_@modelName@_}.create({ data: dto });
  }

  async update(dto: {_@modelNameCapitalize@_}UpdateDto): Promise<unknown> {
    const { id, ...data } = dto;
    return this.prisma.{_@modelName@_}.update({ where: { id }, data });
  }

  async delete(dto: {_@modelNameCapitalize@_}IdExistDto): Promise<unknown> {
    return this.prisma.{_@modelName@_}.delete({ where: { id: dto.id } });
  }

  async list(dto: Pagination{_@modelNameCapitalize@_}Dto): Promise<unknown> {
    return this.prisma.{_@modelName@_}.findMany({
      take: dto.pageSize,
      skip: (dto.page - 1) * dto.pageSize,
    });
  }
}
`;

export function generateService(model: Schema) {
	const list = model.list
		.filter((v) => v.type === "model")
		.map((v) => {
			const modelNameCamelize = strings.camelize(v.name);
			const modelNameCapitalize = strings.capitalize(modelNameCamelize);
			return {
				name: `${modelNameCapitalize}`,
				content: serviceTemplate
					.replace(/{_@modelName@_}/g, v.name)
					.replace(/{_@modelNameCapitalize@_}/g, modelNameCapitalize),
			};
		});
	return list;
}

export function generateServiceFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const list = generateService(prisma);
	for (const model of list) {
		const { name, content } = model;
		mkFile(`${outputPath}/${name}`, `${name}.service.ts`, content, dryRun);
	}
}
