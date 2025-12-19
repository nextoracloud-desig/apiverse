// import-from-local-fixed.js
// Usage: node import-from-local-fixed.js
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function getModelFields() {
    const schema = fs.readFileSync(path.join(__dirname, 'prisma/schema.prisma'), 'utf8');
    // find model ApiProvider { ... } (case-insensitive)
    const m = schema.match(/model\s+([A-Za-z0-9_]+)\s*\{([^}]*)\}/mi);
    if (!m) throw new Error('Cannot parse prisma/schema.prisma — check model block');
    const body = m[2];
    // take field names at line start
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
    const fields = lines.map(l => {
        const parts = l.split(/\s+/);
        return parts[0];
    }).filter(f => /^[A-Za-z_][A-Za-z0-9_]*$/.test(f));
    return new Set(fields);
}

function filterObject(obj, allowedSet) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = {};
    for (const k of Object.keys(obj)) {
        if (allowedSet.has(k)) out[k] = obj[k];
        // If nested objects like `authConfig` etc and they exist in schema, keep them.
    }
    return out;
}

async function upsertSafe(api, allowed) {
    const clean = filterObject(api, allowed);
    try {
        await p.apiProvider.upsert({
            where: { id: api.id },
            update: clean,
            create: clean,
        });
        return { ok: true };
    } catch (e) {
        return { ok: false, err: e.message };
    }
}

async function run() {
    const allowed = getModelFields();
    console.log('Allowed model fields:', Array.from(allowed).join(', '));
    const f1 = path.join(__dirname, 'data/apiverse_providers_1.json');
    const f2 = path.join(__dirname, 'data/apiverse_providers_2.json');
    const a1 = JSON.parse(fs.readFileSync(f1, 'utf8') || '[]');
    const a2 = JSON.parse(fs.readFileSync(f2, 'utf8') || '[]');
    const apis = [...(Array.isArray(a1) ? a1 : []), ...(Array.isArray(a2) ? a2 : [])];
    console.log('TOTAL:', apis.length);

    let ok = 0, fail = 0;
    for (const api of apis) {
        if (!api || !api.id) { console.error('skip no-id', api && api.name); fail++; continue; }
        const res = await upsertSafe(api, allowed);
        if (res.ok) ok++; else { fail++; console.error('ERR:', api.id, '->', res.err.split('\n')[0]); }
    }
    console.log('Done. ok=', ok, ' fail=', fail);
    await p.$disconnect();
}

run().catch(err => { console.error(err); p.$disconnect().finally(() => process.exit(1)); });
