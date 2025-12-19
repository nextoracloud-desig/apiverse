const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.apiProvider.count()
  .then(c => { console.log('API providers count:', c); })
  .catch(err => { console.error('ERR:', err.message||err); process.exitCode = 1; })
  .finally(() => p.$disconnect());
