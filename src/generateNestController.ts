import { strings } from "@angular-devkit/core";
import type { Model, Schema } from "@mrleebo/prisma-ast";
import { mkFile } from "./utils/mkFile";

const controllerTemplate = `
import { Controller } from '@nestjs/common';
import { {_@modelNameCapitalize@_}Service } from './{_@modelName@_}.service';
import { {_@modelNameCapitalize@_}IdExistDto, {_@modelNameCapitalize@_}CreateDto, {_@modelNameCapitalize@_}UpdateDto, Pagination{_@modelNameCapitalize@_}Dto } from './{_@modelName@_}.dtos';
import { ApiResponse, ApiTags, ApiOperation, ApiExtraModels } from '@nestjs/swagger';
import { HttpCode, Query, Body, Post, Get } from '@nestjs/common';
import { {_@modelNameCapitalize@_}FindAllResponse, {_@modelNameCapitalize@_}FindOneResponse, {_@modelNameCapitalize@_}CreateResponse, {_@modelNameCapitalize@_}UpdateResponse, {_@modelNameCapitalize@_}DeleteResponse, {_@modelNameCapitalize@_}ListResponse } from './{_@modelName@_}.types';
import { {_@modelNameCapitalize@_} } from '@entity/{_@modelName@_}Entity';
{__@useResultDataVo@__}

@ApiTags('{_@modelNameCapitalize@_}')
@Controller('{_@modelName@_}')
@ApiExtraModels({_@modelNameCapitalize@_}, {_@modelNameCapitalize@_}FindAllResponse, {_@modelNameCapitalize@_}FindOneResponse, {_@modelNameCapitalize@_}CreateResponse, {_@modelNameCapitalize@_}UpdateResponse, {_@modelNameCapitalize@_}DeleteResponse, {_@modelNameCapitalize@_}ListResponse)
export class {_@modelNameCapitalize@_}Controller {
  constructor(private readonly {_@modelName@_}Service: {_@modelNameCapitalize@_}Service) {}

  @Get('all')
  @HttpCode(200)
  @ApiOperation({ summary: '获取所有{_@modelName@_}' })
  {__@useResultDataVoFindAllRes@__}
  findAll() {
    return this.{_@modelName@_}Service.findAll();
  }

  @Get('detail')
  @HttpCode(200)
  @ApiOperation({ summary: '获取{_@modelName@_}详情' })
  {__@useResultDataVoFindOneRes@__}
  findOne(@Query() dto: {_@modelNameCapitalize@_}IdExistDto) {
    return this.{_@modelName@_}Service.findOne(dto);
  }

  @Post('create')
  @HttpCode(200)
  @ApiOperation({ summary: '创建{_@modelName@_}' })
  {__@useResultDataVoCreateRes@__}
  create(@Body() dto: {_@modelNameCapitalize@_}CreateDto) {
    return this.{_@modelName@_}Service.create(dto);
  }

  @Post('update')
  @HttpCode(200)
  @ApiOperation({ summary: '更新{_@modelName@_}' })
  {__@useResultDataVoUpdateRes@__}
  update(@Body() dto: {_@modelNameCapitalize@_}UpdateDto) {
    return this.{_@modelName@_}Service.update(dto);
  }

  @Post('delete')
  @HttpCode(200)
  @ApiOperation({ summary: '删除{_@modelName@_}' })
  {__@useResultDataVoDeleteRes@__}
  delete(@Body() dto: {_@modelNameCapitalize@_}IdExistDto) {
    return this.{_@modelName@_}Service.delete(dto);
  }

  @Get('list')
  @ApiOperation({ summary: '分页获取{_@modelName@_}列表' })
  {__@useResultDataVoListRes@__}
  @HttpCode(200)
  async list(@Query() dto: Pagination{_@modelNameCapitalize@_}Dto) {
    return await this.{_@modelName@_}Service.list(dto)
  }

  // for CORS
  
  // @Options('create')
  // createOp() {}

  // @Options('update')
  // updateOp() {}

  // @Options('delete')
  // deleteOp() {}
}
`;

export function generateNestController(
	prisma: Schema,
	useResultDataVo: boolean,
) {
	const entityList = prisma.list
		.filter((item) => item.type === "model")
		.map((item) => {
			const entity = item as Model;
			const modelNameCamelize = strings.camelize(entity.name);
			const modelNameCapitalize = strings.capitalize(modelNameCamelize);
			let template = controllerTemplate;

			template = template
				.replace(
					/{__@useResultDataVo@__}/g,
					useResultDataVo
						? "import { ApiResult } from '@entity/resultDataVo';"
						: "",
				)
				.replace(
					/{__@useResultDataVoFindAllRes@__}/g,
					useResultDataVo
						? "@ApiResult({_@modelNameCapitalize@_}FindAllResponse)"
						: "@ApiResponse({\n\t\tstatus: 200,\n\t\ttype: {_@modelNameCapitalize@_}FindAllResponse,\n\t})",
				)
				.replace(
					/{__@useResultDataVoFindOneRes@__}/g,
					useResultDataVo
						? "@ApiResult({_@modelNameCapitalize@_}FindOneResponse)"
						: "@ApiResponse({\n\t\tstatus: 200,\n\t\ttype: {_@modelNameCapitalize@_}FindOneResponse,\n\t})",
				)
				.replace(
					/{__@useResultDataVoCreateRes@__}/g,
					useResultDataVo
						? "@ApiResult({_@modelNameCapitalize@_}CreateResponse)"
						: "@ApiResponse({\n\t\tstatus: 200,\n\t\ttype: {_@modelNameCapitalize@_}CreateResponse,\n\t})",
				)
				.replace(
					/{__@useResultDataVoUpdateRes@__}/g,
					useResultDataVo
						? "@ApiResult({_@modelNameCapitalize@_}UpdateResponse)"
						: "@ApiResponse({\n\t\tstatus: 200,\n\t\ttype: {_@modelNameCapitalize@_}UpdateResponse,\n\t})",
				)
				.replace(
					/{__@useResultDataVoDeleteRes@__}/g,
					useResultDataVo
						? "@ApiResult({_@modelNameCapitalize@_}DeleteResponse)"
						: "@ApiResponse({\n\t\tstatus: 200,\n\t\ttype: {_@modelNameCapitalize@_}DeleteResponse,\n\t})",
				)
				.replace(
					/{__@useResultDataVoListRes@__}/g,
					useResultDataVo
						? "@ApiResult({_@modelNameCapitalize@_}ListResponse)"
						: "@ApiResponse({\n\t\tstatus: 200,\n\t\ttype: {_@modelNameCapitalize@_}ListResponse,\n\t})",
				)
				.replaceAll(/{_@modelName@_}/g, modelNameCamelize)
				.replaceAll(/{_@modelNameCapitalize@_}/g, modelNameCapitalize);

			return {
				name: modelNameCamelize,
				content: template,
			};
		});
	return entityList;
}

export function generateNestControllerFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
	useResultDataVo: boolean,
) {
	const entityList = generateNestController(prisma, useResultDataVo);
	for (const entity of entityList) {
		mkFile(
			`${outputPath}/${entity.name}`,
			`${entity.name}.controller.ts`,
			entity.content,
			dryRun,
		);
	}
}
