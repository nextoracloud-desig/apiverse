import {PrismaClient} from '@prisma/client';
const p=new PrismaClient();
(async()=>{console.log('API providers count:', await p.apiProvider.count()); await p.();})();
