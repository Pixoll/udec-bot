import { readFileSync } from 'fs';
import path from 'path';

const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8')) as PackageJson;
export default packageJson;

interface PackageJson {
    readonly name: string;
    readonly version: string;
    readonly author: string;
    readonly license: string;
    readonly description: string;
    readonly repository: {
        readonly url: string;
    };
}
