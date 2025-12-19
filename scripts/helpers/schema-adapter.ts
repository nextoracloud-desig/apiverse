import fs from 'fs';
import path from 'path';

export class SchemaAdapter {
    private allowedFields: Set<string> = new Set();
    private modelName: string;

    constructor(modelName: string = 'ApiProvider') {
        this.modelName = modelName;
        this.init();
    }

    private init() {
        try {
            const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
            const schema = fs.readFileSync(schemaPath, 'utf8');

            // Find model block
            // Regex explanation: model ModelName { ... } (capture content inside braces)
            const regex = new RegExp(`model\\s+${this.modelName}\\s*\\{([\\s\\S]*?)\\}`, 'm');
            const match = schema.match(regex);

            if (!match) {
                throw new Error(`Model ${this.modelName} not found in schema`);
            }

            const body = match[1];
            const lines = body.split('\n');

            lines.forEach(line => {
                const trimmed = line.trim();
                // Skip comments, empty lines, block attributes (@@)
                if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) return;

                // Field definition: name Type ...
                const parts = trimmed.split(/\s+/);
                const fieldName = parts[0];

                // Basic validation that it looks like a field name
                if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldName)) {
                    this.allowedFields.add(fieldName);
                }
            });

            console.log(`SchemaAdapter: Identified ${this.allowedFields.size} fields for ${this.modelName}`);
        } catch (e) {
            console.error("SchemaAdapter Error:", e);
            // Fallback to essential fields if parsing fails
            this.allowedFields = new Set(['id', 'name', 'baseUrl', 'category', 'description', 'authType', 'docsUrl']);
        }
    }

    filter(input: any): any {
        const output: any = {};
        const keys = Object.keys(input);

        for (const key of keys) {
            if (this.allowedFields.has(key)) {
                output[key] = input[key];
            }
        }

        return output;
    }

    hasField(field: string): boolean {
        return this.allowedFields.has(field);
    }
}
