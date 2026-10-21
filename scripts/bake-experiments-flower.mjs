import {writeFile} from 'node:fs/promises';
const count=60000,buffer=Buffer.alloc(4+count*9);buffer.writeUInt32LE(count);
let seed=2917;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
for(let i=0;i<count;i++){
  let x,y,z,r,g,b;
  if(i<count*.9){
    const petal=Math.floor(random()*5),u=random(),v=(random()-.5)*2;
    const angle=petal*Math.PI*2/5+v*Math.sin(u*Math.PI)*.58;
    const radius=.13+u*1.16;
    x=Math.sin(angle)*radius;y=Math.cos(angle)*radius;
    z=.16*Math.sin(u*Math.PI)-.18*u*u+.12*v*v;
    r=245;g=110+u*85+random()*15;b=140+u*65+random()*15;
  }else{
    const angle=random()*Math.PI*2,radius=Math.sqrt(random())*.23;
    x=Math.sin(angle)*radius;y=Math.cos(angle)*radius;z=.16+random()*.09;
    r=255;g=180+random()*65;b=80+random()*80;
  }
  for(const [axis,value] of [x,y,z].entries())buffer.writeInt16LE(Math.round(value*8192),4+i*6+axis*2);
  buffer[4+count*6+i*3]=r;buffer[5+count*6+i*3]=g;buffer[6+count*6+i*3]=b;
}
await writeFile(new URL('../client/public/assets/flower-experiments-v1.bin',import.meta.url),buffer);
