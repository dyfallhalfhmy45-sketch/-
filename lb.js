'use strict';
/* التصنيف: محلي دائماً + عالمي عند ضبط HW_LB_URL (Firebase Realtime Database عبر REST).
   كل لعبة لها تصنيف منفصل: /lb/bomb و /lb/waves — ولكل لاعب أفضل نتيجة فقط. */
const LB={
 url:(typeof HW_LB_URL!=='undefined'&&HW_LB_URL)?String(HW_LB_URL).replace(/\/+$/,''):'',
 key(n,c){return (c+'_'+n).toLowerCase().replace(/[\s.$#\[\]\/\\]+/g,'_').slice(0,40)},
 local(g){try{return JSON.parse(localStorage.getItem('hw_lb_'+g)||'[]')}catch(e){return[]}},
 save(g,a){try{localStorage.setItem('hw_lb_'+g,JSON.stringify(a))}catch(e){}},
 ok(o){return !!o&&typeof o.n=='string'&&o.n.length>0&&typeof o.c=='string'&&o.c.length==2&&!BAN.includes(o.c)&&typeof o.s=='number'&&isFinite(o.s)&&o.s>=0},
 sort(a){return a.sort((x,y)=>y.s-x.s||(x.t||0)-(y.t||0))},
 async req(path,opt){
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),7000);
  try{const r=await fetch(this.url+path,Object.assign({signal:ac.signal},opt));if(!r.ok)throw new Error('http '+r.status);return await r.json()}
  finally{clearTimeout(tm)}},
 async remote(g){
  const o=await this.req(`/lb/${g}.json?orderBy=%22s%22&limitToLast=200`);
  return this.sort(Object.entries(o||{}).map(([k,v])=>Object.assign({},v,{k})).filter(v=>this.ok(v)))},
 async top(g){
  if(this.url){try{return{list:await this.remote(g),online:true}}catch(e){}}
  return{list:this.sort(this.local(g).filter(v=>this.ok(v))),online:false,err:!!this.url}},
 async submit(g,pr,s,w){
  s=Math.max(0,Math.floor(s));
  const k=this.key(pr.n,pr.c),e={n:pr.n,c:pr.c,s,t:Date.now(),w:w||0};
  let L=this.local(g),i=L.findIndex(o=>o.k==k),imp=false;
  if(i<0){L.push(Object.assign({k},e));imp=true}else if(s>L[i].s){L[i]=Object.assign({k},e);imp=true}
  this.save(g,this.sort(L).slice(0,300));
  let list=this.sort(L.filter(v=>this.ok(v))),online=false,err=false;
  if(this.url){
   try{
    const p='/lb/'+g+'/'+encodeURIComponent(k)+'.json',ex=await this.req(p);
    if(!ex||s>ex.s){await this.req(p,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(e)});imp=true}else imp=false;
    list=await this.remote(g);online=true}
   catch(x){err=true}}
  const me=list.findIndex(o=>(o.k||this.key(o.n,o.c))==k);
  return{rank:me<0?0:me+1,total:list.length,online,err,list,imp,best:me<0?s:list[me].s,k}}
};
