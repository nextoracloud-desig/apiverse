export function normalizeApiData(raw: any): any {
    // 1. Sanitize Strings
    const sanitize = (str: any) => typeof str === 'string' ? str.trim().substring(0, 5000) : str; // generic max limit

    const clean: any = {};

    // ID is critical
    clean.id = raw.id ? String(raw.id).toLowerCase().replace(/[^a-z0-9-]/g, '') : null;
    if (!clean.id && raw.name) {
        clean.id = raw.name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    clean.name = sanitize(raw.name) || "Unknown API";
    clean.description = sanitize(raw.description) || "";
    clean.baseUrl = sanitize(raw.baseUrl || raw.exampleRequest?.split(' ')[1] || "https://example.com");
    clean.category = sanitize(raw.category) || "Other";

    // Enums / Fixed sets
    clean.authType = "none";
    if (raw.auth) {
        const auth = String(raw.auth).toLowerCase();
        if (auth.includes("key")) clean.authType = "header"; // simplified mapping
        else if (auth.includes("oauth")) clean.authType = "oauth";
        else if (auth.includes("bearer")) clean.authType = "bearer";
    }

    clean.docsUrl = sanitize(raw.docsUrl);
    clean.source = raw.source || "auto-import";

    // Coerce specific fields if they exist
    if (raw.approved !== undefined) clean.approved = Boolean(raw.approved);
    else clean.approved = true; // Default approved for this dataset

    return clean;
}
