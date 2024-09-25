import { getSchema } from "@mrleebo/prisma-ast";
import { Argument, Command } from "commander";
import dotenv from "dotenv";
import fs from "fs-extra";
import inquirer from "inquirer";
import { generateEntity, generateEntityFile } from "./generateEntity";
import { generateEnum, generateEnumFile } from "./generateEnum";
import { mkFile } from "./utils/mkFile";

dotenv.configDotenv({ path: ".env" });

const program = new Command();

interface Answers {
	type: string;
	prismaPath: string;
	outputPath: string;
}

program
	.name("npg")
	.description("A command line tool for nestjs-prisma code generation")
	.version("1.0.0")
	.action(async () => {
		const answers = await inquirer.prompt<Answers>([
			{
				type: "list",
				name: "type",
				message: "What type of code do you want to generate?",
				choices: ["entity", "enum", "all"],
				default: process.env.NPG_LIST_DEFAULT || "all",
			},
			{
				type: "input",
				name: "prismaPath",
				message: "What is the path to the prisma schema file?",
				default: process.env.NPG_PRISMA_PATH_DEFAULT || "./schema.prisma",
			},
			{
				type: "input",
				name: "outputPath",
				message: "What is the path to the output directory?",
				default: process.env.NPG_OUTPUT_PATH_DEFAULT || "./src/__generated",
			},
		]);
		const schemaFile = await fs.readFile(answers.prismaPath, "utf-8");
		const prisma = getSchema(schemaFile);
		if (answers.type === "entity") {
		} else if (answers.type === "enum") {
			generateEnumFile(prisma, answers.outputPath);
		} else if (answers.type === "all") {
			generateEnumFile(prisma, answers.outputPath);
			generateEntityFile(prisma, answers.outputPath);
		}
	});

// program
// 	.command("generate")
// 	.alias("g")
// 	.description("generate code")
// 	.addArgument(new Argument("type", "The type of the code to generate"));

program.parse(process.argv);
