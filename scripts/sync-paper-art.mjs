import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=resolve(root,process.argv[2]||'../../paper flower web/dist');
const destination=resolve(root,'client/public/paper-art-studio');
await accessSource();
async function accessSource(){await readFile(resolve(source,'app.js'));await readFile(resolve(source,'index.html'));}
await mkdir(destination,{recursive:true});
await cp(source,destination,{recursive:true});
const html=await readFile(resolve(destination,'index.html'),'utf8');
await writeFile(resolve(destination,'index.html'),html.replace('href="./"','href="./index.html"'));
const commit=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
await writeFile(resolve(destination,'SOURCE.json'),JSON.stringify({repository:'https://github.com/kweeyo09/paper-art',commit},null,2)+'\n');
console.log(`Copied Paper in Bloom ${commit} into the portfolio. No network fetch is needed at build time.`);
