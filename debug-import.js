const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run(){
  try{
    const a1 = JSON.parse(fs.readFileSync(path.join(__dirname,'data/apiverse_providers_1.json'),'utf8')||'[]');
    const a2 = JSON.parse(fs.readFileSync(path.join(__dirname,'data/apiverse_providers_2.json'),'utf8')||'[]');
    const apis = [...(Array.isArray(a1)?a1:[]), ...(Array.isArray(a2)?a2:[])];
    console.log('TOTAL FOUND:', apis.length);
    let ok=0, fail=0;
    for(const api of apis){
      try{
        await p.apiProvider.upsert({
          where:{ id: api.id },
          update: {...api},
          create: {...api}
        });
        ok++;
      }catch(err){
        fail++;
        console.error('FAIL:', api.id, '->', err && err.message ? err.message : err, '\n', err && err.stack ? err.stack.split('\n').slice(0,3).join('\n') : '');
      }
    }
    console.log('Done. ok=',ok,' fail=',fail);
  }finally{
    await p.$disconnect();
  }
}
run().catch(e=>{ console.error(e); process.exit(1); });
