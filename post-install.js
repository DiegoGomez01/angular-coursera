import { writeFile } from 'fs';
const targetPath = './src/environments/environment.ts';
const colors = require('colors');
require('dotenv').load();
const envConfigFile = `export const environment = {
    keyGoogle: '${process.env.keyGoogle}',
    KeyMapboxComponent: '${process.env.KeyMapboxComponent}',
    KeyMapboxService: '${process.env.KeyMapboxService}',
};
`;
writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    }
});