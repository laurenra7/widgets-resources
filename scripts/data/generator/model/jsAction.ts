import { basename, dirname, extname, join, relative } from "path";
import { z } from "zod";
import { JSActionSchema } from "../../schema";

export class JSAction {
    constructor(
        private properties: {
            id: string;
            name: string;
            group: string;
        }
    ) {}

    export(): z.infer<typeof JSActionSchema> {
        return {
            ...this.properties
        };
    }

    static async load(packagePath: string, jsActionPath: string): Promise<JSAction> {
        const path = join(packagePath, jsActionPath);
        const packageName = basename(packagePath);
        const name = basename(jsActionPath, extname(jsActionPath));
        const group = dirname(relative(join(packagePath, "src"), path));

        return new JSAction({ id: `${packageName}/${group}/${name}`, name, group });
    }
}
