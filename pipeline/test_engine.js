const fs=require('fs');global.window=undefined;
const D=JSON.parse(fs.readFileSync('pipeline/dataset3.json'));const E=require('./engine.js');
const out=[];
for(const [sel,re,fee,sp] of [[[{k:'VOO',w:.5},{k:'458730',w:.5}],true,0,0],[[{k:'VOO',w:.5},{k:'458730',w:.5}],false,0.015,0.1],[[{k:'QQQM',w:1}],true,0,0],[[{k:'SCHD',w:.4},{k:'379800',w:.3},{k:'BND',w:.3}],true,0.02,0.05],[[{k:'JEPQ',w:.5},{k:'441640',w:.5}],false,0,0]]){
 const r=E.run(D,sel,{monthly:1000000,lump:0,start:'2023-06-20',end:'2026-11-06',reinvest:re,fee,spread:sp});
 out.push({sel,re,fee,sp,value:r.summary.value,principal:r.summary.principal,xirr:r.summary.xirr});
}
console.log(JSON.stringify(out));
