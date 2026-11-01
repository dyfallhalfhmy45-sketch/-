'use strict';
/* لعب أونلاين برقم غرفة — اتصال مباشر بين اللاعبين (WebRTC عبر PeerJS)، بدون سيرفر خاص */
const NET={
 p:null,c:null,role:null,code:'',inp:{},pend:{},
 open(){return !!(this.c&&this.c.open)},
 send(m){if(this.open())try{this.c.send(m)}catch(e){}},
 close(){try{this.c&&this.c.close();this.p&&this.p.destroy()}catch(e){}this.p=this.c=this.role=null;this.inp={};this.pend={}},
 // المضيف: ينشئ رقم غرفة من ٤ أرقام
 host(cb){
  if(typeof Peer=='undefined')return cb('err','اللعب أونلاين يحتاج اتصال بالإنترنت');
  this.close();
  const code=String(1000+(Math.random()*9000|0)),p=this.p=new Peer('harawar-'+code);this.role='h';
  p.on('open',()=>{this.code=code;cb('code',code)});
  p.on('error',e=>{if(e.type=='unavailable-id')this.host(cb);else cb('err','تعذّر إنشاء الغرفة ('+e.type+')')});
  p.on('connection',c=>{if(this.c&&this.c.open){c.close();return}this.c=c;this.wire(c,cb)})},
 // الضيف: يدخل برقم الغرفة
 join(code,cb){
  if(typeof Peer=='undefined')return cb('err','اللعب أونلاين يحتاج اتصال بالإنترنت');
  this.close();
  const p=this.p=new Peer();this.role='g';
  p.on('open',()=>{this.c=p.connect('harawar-'+code,{reliable:true});this.wire(this.c,cb)});
  p.on('error',e=>cb('err',e.type=='peer-unavailable'?'ما لقينا غرفة بهالرقم':'تعذّر الاتصال ('+e.type+')'))},
 wire(c,cb){
  c.on('open',()=>cb('open'));
  c.on('data',d=>{if(d&&d.t=='i'){this.inp=d.k;for(const k in d.k)if(k[0]=='p'&&d.k[k])this.pend[k]=1}else cb('data',d)});
  c.on('close',()=>cb('close'));c.on('error',()=>cb('close'))},
 // إدخال الضيف (يستهلكه المضيف كل فريم)
 take(){const o=Object.assign({},this.inp);for(const k in o)if(k[0]=='p')o[k]=!!this.pend[k];this.pend={};return o}
};
