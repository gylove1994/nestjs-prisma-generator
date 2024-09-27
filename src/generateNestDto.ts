import { strings } from "@angular-devkit/core";
import type { Model, Schema } from "@mrleebo/prisma-ast";
import { getRelation } from "./utils/getRelation";
import { importFile } from "./utils/import";
import { mkFile } from "./utils/mkFile";
import { dtoPropertyMap } from "./utils/propertyMap";

const dtoTemplate = `
import { ApiProperty, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsBoolean, IsArray, IsObject, IsOptional } from 'class-validator';
{_@imports@_}

export class Pagination{_@modelNameCapitalize@_}Dto {
  @ApiProperty({ description: '分页大小' })
  pageSize: number;

  @ApiProperty({ description: '当前页' })
  page: number;
}

export class {_@modelNameCapitalize@_}IdExistDto {
  @ApiProperty({ description: '{_@modelName@_}ID' })
  @IsNotEmpty({ message: '{_@modelName@_}ID不能为空' })
  // @IsUUID('4', { message: '{_@modelName@_}ID类型错误， 正确类型为uuid' })
  @IsString({ message: '{_@modelName@_}ID类型错误， 正确类型为string' })
  // @IsExistInDataBase({_@modelNameCapitalize@_},'id')
  id: string;
}

export class {_@modelNameCapitalize@_}CreateDto {

{_@CreateDtoFields@_}
}

export class {_@modelNameCapitalize@_}UpdateDto extends IntersectionType({_@modelNameCapitalize@_}IdExistDto, OmitType(PartialType({_@modelNameCapitalize@_}CreateDto), [])) {}

`;

export function generateNestDto(model: Schema) {
	const fields = model.list
		.filter((field) => field.type === "model")
		.map((v) => {
			const field = v as Model;
			const modelNameCamelize = strings.camelize(field.name);
			const modelNameCapitalize = strings.capitalize(modelNameCamelize);
			const imports = getRelation(field)
				.map((v) => importFile(v, true))
				.join("\n");
			const createdDtoField = v.properties
				.filter((v) => v.type === "field")
				.map((v, _i, array) => {
					return dtoPropertyMap(v, array);
				})
				.filter((v) => v !== "")
				.join("\n");
			return {
				name: `${modelNameCamelize}`,
				content: dtoTemplate
					.replaceAll("{_@modelName@_}", modelNameCamelize)
					.replaceAll("{_@modelNameCapitalize@_}", modelNameCapitalize)
					.replaceAll("{_@CreateDtoFields@_}", createdDtoField)
					.replaceAll("{_@imports@_}", imports),
			};
		});
	return fields;
}

export function generateNestDtoFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const entityList = generateNestDto(prisma);
	for (const entity of entityList) {
		mkFile(
			`${outputPath}/${entity.name}`,
			`${entity.name}.dtos.ts`,
			entity.content,
			dryRun,
		);
	}
}
