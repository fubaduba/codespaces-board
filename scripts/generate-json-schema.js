const fs = require('fs');
const path = require('path');
const TJS = require('typescript-json-schema');

const TARGET_TYPE = 'IConfig';
const TARGET_TYPE_FILE = path.resolve('./src/interfaces/IConfig.ts');
const OUTPUT_SCHEMA_FOLDER_PATH = path.resolve(`./schemas`);
const OUTPUT_SCHEMA_FILE_PATH = path.join(OUTPUT_SCHEMA_FOLDER_PATH, `./${TARGET_TYPE}.json`);

if (!fs.existsSync(OUTPUT_SCHEMA_FOLDER_PATH)){
    fs.mkdirSync(OUTPUT_SCHEMA_FOLDER_PATH);
}

// schema generator settings
const settings = {
  required: true,
  strictNullChecks: true,
  noExtraProps: true,
};

// ts compiler options
const compilerOptions = {
  strictNullChecks: true,
};

console.log(`Generating JSON schema for the "${TARGET_TYPE}" type..`)

const program = TJS.getProgramFromFiles(
  [TARGET_TYPE_FILE],
  compilerOptions,
);

// We can either get the schema for one file and one type...
const schema = TJS.generateSchema(program, TARGET_TYPE, settings);
if (!schema) {
    throw new Error(`Cannot generate schema for the "${TARGET_TYPE}" type.`);
}

fs.writeFileSync(OUTPUT_SCHEMA_FILE_PATH, JSON.stringify(schema, null, 2));

console.log(`JSON schema has been written to the file: ${OUTPUT_SCHEMA_FILE_PATH}.`);
