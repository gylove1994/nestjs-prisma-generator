import { strings } from "@angular-devkit/core";
import type { Model, Schema } from "@mrleebo/prisma-ast";
import { getRelation, getRelationMap } from "./utils/getRelation";
import { mkFile } from "./utils/mkFile";

const serviceTemplate = `
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import type { {_@modelNameCapitalize@_}IdExistDto, {_@modelNameCapitalize@_}CreateDto, {_@modelNameCapitalize@_}UpdateDto, Pagination{_@modelNameCapitalize@_}Dto } from './{_@modelName@_}.dtos';

@Injectable()
export class {_@modelNameCapitalize@_}Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<unknown> {
    return this.prisma.{_@modelName@_}.findMany();
  }

  async findOne(dto: {_@modelNameCapitalize@_}IdExistDto): Promise<unknown> {
    return this.prisma.{_@modelName@_}.findUnique({ where: { id: dto.id } });
  }

  async create(dto: {_@modelNameCapitalize@_}CreateDto): Promise<unknown> {
    const { {_@CreateDtoIdFields@_} ...rest} = dto;
    const data = {
      ...rest,
{_@CreateDtoFields@_}
    };
    return this.prisma.{_@modelName@_}.create({ data });
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
			const createDtoFields = generateCreateDtoFields(v);
			const createDtoIdFields = generateCreateDtoIdFields(v);
			return {
				name: `${modelNameCamelize}`,
				content: serviceTemplate
					.replace(/{_@modelName@_}/g, modelNameCamelize)
					.replace(/{_@modelNameCapitalize@_}/g, modelNameCapitalize)
					.replace(/{_@CreateDtoFields@_}/g, createDtoFields)
					.replace(/{_@CreateDtoIdFields@_}/g, createDtoIdFields),
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

export function generateCreateDtoFields(model: Model) {
	const list = model.properties
		.filter((v) => v.type === "field")
		.map((v) => {
			const relationMap = getRelationMap(model, true);
			const relation = relationMap.get(v.fieldType as string);
			let res = null;
			if (relation && v.array === true) {
				res = `${relation}: {connect: ${relation}Ids?.map((id) => ({ id }))},`;
				res = `...(${relation}Ids !== null && ${relation}Ids !== undefined) ? {${res.replace(",", "")}} : {},`;
			} else if (relation) {
				res = `${relation}: {connect: {id: ${relation}Id}},`;
				if (v.optional === true) {
					res = `...(${relation}Id !== null && ${relation}Id !== undefined) ? {${res}} : {},`;
				}
			}
			return res;
		});
	return list
		.filter((v) => v !== null)
		.map((v) => `\t\t\t${v}`)
		.join("\n");
}

export function generateCreateDtoIdFields(model: Model) {
	const list = model.properties
		.filter((v) => v.type === "field")
		.map((v) => {
			const relationMap = getRelationMap(model, true);
			const relation = relationMap.get(v.fieldType as string);
			if (relation && v.array === true) {
				return `${v.name}Ids`;
			}
			if (relation) {
				return `${v.name}Id`;
			}
			return null;
		})
		.filter((v) => v !== null && v !== undefined);
	return list.length > 0 ? `${list.join(", ")},` : "";
}
