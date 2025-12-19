const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function stripField(obj, field){
  if(Array.isArray(obj)) return obj.map(o=>stripField(o,field));
  if(obj && typeof obj === 'object' && field in obj){
    delete obj[field];
  }
  return obj;
}

async function tryUpsert(api){
  try{
    await p.apiProvider.upsert({
      where:{ id: api.id },
      update: {...api},
      create: {...api}
    });
    return { ok:true };
  }catch(e){
    const msg = (e && e.message) ? e.message : '';
    const m = msg.match(/Unknown argument `([a-zA-Z0-9_]+)`/);
    if(m && m[1]){
      const bad = m[1];
      stripField(api, bad);
      // retry once
      try{
        await p.apiProvider.upsert({
          where:{ id: api.id },
          update: {...api},
          create: {...api}
        });
        return { ok:true, removed: bad };
      }catch(e2){
        return { ok:false, err: e2.message };
      }
    }
    return { ok:false, err: msg || String(e) };
  }
}

async function run(){
  try{
    const a1 = JSON.parse(fs.readFileSync(path.join(__dirname,'data/apiverse_providers_1.json'),'utf8')||'[]');
    const a2 = JSON.parse(fs.readFileSync(path.join(__dirname,'data/apiverse_providers_2.json'),'utf8')||'[]');
    const apis = [...(Array.isArray(a1)?a1:[]), ...(Array.isArray(a2)?a2:[])];
    console.log('TOTAL FOUND:', apis.length);
    let ok=0, fail=0;
    for(const api of apis){
      const res = await tryUpsert({...api});
      if(res.ok) ok++;
      else {
        fail++;
        console.error('FAIL:', api.id, '->', res.err || 'unknown', res.removed ? `(removed ${res.removed})` : '');
      }
    }
    console.log('Done. ok=',ok,' fail=',fail);
  }finally{
    await p.$disconnect();
  }
}
run().catch(e=>{ console.error(e); process.exit(1); });
