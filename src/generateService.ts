import { strings } from "@angular-devkit/core";
import type { Field, Model, Schema } from "@mrleebo/prisma-ast";
import { getRelation, getRelationMap } from "./utils/getRelation";
import { mkFile } from "./utils/mkFile";
import { isFunc } from "./utils/propertyMap";

const serviceTemplate = `
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from "@prisma/client";
import type { {_@modelNameCapitalize@_}IdExistDto, {_@modelNameCapitalize@_}CreateDto, {_@modelNameCapitalize@_}UpdateDto, Pagination{_@modelNameCapitalize@_}Dto } from './{_@modelName@_}.dtos';
{__@importResultDataVo@__}

@Injectable()
export class {_@modelNameCapitalize@_}Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<unknown> {
    const res = await this.prisma.{_@modelName@_}.findMany();
    {__@returnResultDataVo@__}
  }

  async findOne(dto: {_@modelNameCapitalize@_}IdExistDto): Promise<unknown> {
    const res = await this.prisma.{_@modelName@_}.findUnique({ where: { id: dto.id } });
    {__@returnResultDataVo@__}
  }

  async create(dto: {_@modelNameCapitalize@_}CreateDto): Promise<unknown> {
    const { {_@CreateDtoIdFields@_} ...rest} = dto;
    const data: Prisma.{_@modelNameCapitalize@_}CreateArgs["data"] = {
      ...rest,
{_@CreateDtoFields@_}
    };
    const res = await this.prisma.{_@modelName@_}.create({ data });
    {__@returnResultDataVo@__}
  }

  async update(dto: {_@modelNameCapitalize@_}UpdateDto): Promise<unknown> {
    const { id, {_@CreateDtoIdFields@_} ...rest } = dto;
		const data: Prisma.{_@modelNameCapitalize@_}UpdateArgs["data"] = {
			...rest,
{_@UpdateDtoFields@_}
		};
    const res = await this.prisma.{_@modelName@_}.update({ where: { id }, data });
    {__@returnResultDataVo@__}
  }


  async delete(dto: {_@modelNameCapitalize@_}IdExistDto): Promise<unknown> {
    await this.prisma.{_@modelName@_}.delete({ where: { id: dto.id } });
		const res = "success";
    {__@returnResultDataVo@__}
  }

  async list(dto: Pagination{_@modelNameCapitalize@_}Dto): Promise<unknown> {
	const { page, pageSize, ...rest } = dto;
    const res = await this.prisma.{_@modelName@_}.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
			where: {
{_@PaginationWhere@_}
			}
    });
		const total = await this.prisma.{_@modelName@_}.count();
    {__@returnResultDataVoList@__}
  }
}
`;

export function generateService(model: Schema, useResultDataVo: boolean) {
	const list = model.list
		.filter((v) => v.type === "model")
		.map((v) => {
			const modelNameCamelize = strings.camelize(v.name);
			const modelNameCapitalize = strings.capitalize(modelNameCamelize);
			const createDtoFields = generateCreateDtoFields(v);
			const createDtoIdFields = generateCreateDtoIdFields(v);
			const updateDtoFields = generateUpdateDtoFields(v);
			const paginationWhere = generatePaginationWhere(v);
			return {
				name: `${modelNameCamelize}`,
				content: serviceTemplate
					.replace(/{_@modelName@_}/g, modelNameCamelize)
					.replace(/{_@modelNameCapitalize@_}/g, modelNameCapitalize)
					.replace(/{_@CreateDtoFields@_}/g, createDtoFields)
					.replace(/{_@CreateDtoIdFields@_}/g, createDtoIdFields)
					.replace(/{_@UpdateDtoFields@_}/g, updateDtoFields)
					.replace(/{_@PaginationWhere@_}/g, paginationWhere)
					.replace(
						/{__@importResultDataVo@__}/g,
						useResultDataVo
							? "import { ResultDataVo } from '@entity/resultDataVo';"
							: "",
					)
					.replace(
						/{__@returnResultDataVo@__}/g,
						useResultDataVo
							? "return ResultDataVo.ok({data: res});"
							: "return res;",
					)
					.replace(
						/{__@returnResultDataVoList@__}/g,
						useResultDataVo
							? "return ResultDataVo.ok({data: { list:res, total, page, pageSize }});"
							: "return res;",
					),
			};
		});
	return list;
}

export function generateServiceFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
	useResultDataVo: boolean,
) {
	const list = generateService(prisma, useResultDataVo);
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

export function generateUpdateDtoFields(model: Model) {
	const list = model.properties
		.filter((v) => v.type === "field")
		.map((v) => {
			const relationMap = getRelationMap(model, true);
			const relation = relationMap.get(v.fieldType as string);
			let res = null;
			if (relation && v.array === true) {
				res = `${relation}: {set: ${relation}Ids?.map((id) => ({ id }))}`;
				res = `...(${relation}Ids !== null && ${relation}Ids !== undefined) ? {${res}} : {},`;
			} else if (relation) {
				res = `${relation}: {connect: {id: ${relation}Id}}`;
				res = `...(${relation}Id !== null && ${relation}Id !== undefined) ? {${res}} : {},`;
			}
			return res;
		});
	return list
		.filter((v) => v !== null)
		.map((v) => `\t\t\t${v}`)
		.join("\n");
}

export function generatePaginationWhere(model: Model) {
	const relationMap = getRelationMap(model, true);
	const isNow = (field: Field) =>
		field.attributes?.find(
			(v) =>
				v.name === "default" &&
				v.type === "attribute" &&
				v.args?.[0].type === "attributeArgument" &&
				isFunc(v.args?.[0].value) &&
				v.args?.[0].value.name === "now",
		);
	const isUpdatedAt = (field: Field) =>
		!!field.attributes?.find(
			(v) => v.type === "attribute" && v.name === "updatedAt",
		);
	const manyRelation = model.properties
		.filter((v) => v.type === "field")
		.filter((v) => v.array === true && relationMap.get(v.fieldType as string))
		.map((v) => {
			return `...(rest.${relationMap.get(v.fieldType as string)}Ids !== null && rest.${relationMap.get(v.fieldType as string)}Ids !== undefined ? {${relationMap.get(v.fieldType as string)}: { every: { id: { in: rest.${relationMap.get(v.fieldType as string)}Ids.filter((id) => id !== '') } } } } : {}),`;
		});
	const oneRelation = model.properties
		.filter((v) => v.type === "field")
		.filter((v) => !v.array === true && relationMap.get(v.fieldType as string))
		.map((v) => {
			return `...(rest.${relationMap.get(v.fieldType as string)}Id !== null && rest.${relationMap.get(v.fieldType as string)}Id !== undefined && rest.${relationMap.get(v.fieldType as string)}Id !== '' ? {${relationMap.get(v.fieldType as string)}: { id: rest.${relationMap.get(v.fieldType as string)}Id } } : {}),`;
		});
	const now = model.properties
		.filter((v) => v.type === "field")
		.filter((v) => isNow(v))
		.map(
			(v) =>
				`...(rest.${v.name} !== null && rest.${v.name} !== undefined ? {${v.name}: { gte: rest.${v.name}[0], lte: rest.${v.name}[1] } } : {}),`,
		);
	const updatedAt = model.properties
		.filter((v) => v.type === "field")
		.filter((v) => isUpdatedAt(v))
		.map(
			(v) =>
				`...(rest.${v.name} !== null && rest.${v.name} !== undefined ? {${v.name}: { gte: rest.${v.name}[0], lte: rest.${v.name}[1] } } : {}),`,
		);
	const string = model.properties
		.filter((v) => v.type === "field")
		.filter((v) => v.fieldType === "String")
		.filter((v) => v.name !== "id")
		.map(
			(v) =>
				`...(rest.${v.name} !== null && rest.${v.name} !== undefined && rest.${v.name} !== '' ? {${v.name}: { contains: rest.${v.name} } } : {}),`,
		);
	return [
		"\t\t\t\t",
		...manyRelation,
		...oneRelation,
		...now,
		...updatedAt,
		...string,
	].join("\n\t\t\t\t");
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
