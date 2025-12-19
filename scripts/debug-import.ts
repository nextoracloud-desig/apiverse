import { normalizeApiData } from "./helpers/normalize"
import { SchemaAdapter } from "./helpers/schema-adapter"
import { logger } from "./helpers/logger"

async function debug() {
    console.log("DEBUG IMPORT TOOLS");

    const adapter = new SchemaAdapter();

    const sample = {
        name: "  Test API  ",
        randomField: "Should go away",
        auth: "ApiKey",
        baseUrl: "https://test.com"
    };

    console.log("Sample Input:", sample);

    const normalized = normalizeApiData(sample);
    console.log("Normalized:", normalized);

    const filtered = adapter.filter(normalized);
    console.log("Filtered (Ready for DB):", filtered);

    if (filtered.randomField) {
        console.error("FAIL: Schema adapter did not strip unknown field");
    } else {
        console.log("PASS: Schema adapter stripped unknown field");
    }

    console.log("Logger Check:");
    logger.log("Debug message", "INFO");
}

debug();
