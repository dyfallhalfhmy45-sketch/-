'use strict';
/* قسم الأركيد: تفادي القنابل + موجات القتال + التصنيف (لكل لعبة تصنيف خاص) */
const PROF=(()=>{try{return JSON.parse(localStorage.getItem('hw_prof')||'null')}catch(e){return null}})()||{n:'',c:''};
const AG={bomb:{n:'تفادي القنابل',ic:'💣'},waves:{n:'موجات القتال',ic:'⚔️'}};
const ctryOk=c=>CTRY.some(x=>x[0]==c);

function arcInit(){
 const sel=$('pc');
 [...CTRY].sort((a,b)=>a[1].localeCompare(b[1],'ar')).forEach(([c,n])=>{const o=document.createElement('option');o.value=c;o.textContent=flag(c)+' '+n;sel.appendChild(o)});
 if(!ctryOk(PROF.c)){const r=((navigator.language||'').split('-')[1]||'').toUpperCase();PROF.c=ctryOk(r)?r:'SA'}
}

// ===== واجهة الأركيد =====
function arcUI(a,t){
 switch(a){
  case'arcade':case'arc':arcHub();return true;
  case'sback':show(G.pm=='arc'?'arc':'menu');return true;
  case'play':G.arcG=t.dataset.g;openProf();return true;
  case'pgo':saveProf();return true;
  case'lbo':openLB(t.dataset.g);return true;
  case'lbg':G.lbg=t.dataset.g;lbDraw();return true;
  case'lbv':G.lbv=t.dataset.v;lbDraw();return true;
  case'aagain':startArc(G.arcG,G.sel[0],G.stg);show(null);return true;
  case'alb':openLB(G.arcG);return true}
 return false}
function arcHub(){
 G.pm='arc';
 for(const g in AG){const me=LB.local(g).find(o=>o.k==LB.key(PROF.n,PROF.c)),e=$('best_'+g);if(e)e.textContent=me?'أفضل نتيجة لك: '+ar(me.s):'ما لعبت بعد'}
 show('arc')}
function openProf(){
 $('pn').value=PROF.n;$('pc').value=PROF.c;$('pe').textContent='';
 $('pt').textContent=AG[G.arcG].ic+' '+AG[G.arcG].n+' — من أنت؟';show('prof')}
function saveProf(){
 const n=$('pn').value.replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,16),c=$('pc').value;
 if(n.length<2){$('pe').textContent='اكتب اسمك (حرفين على الأقل)';return}
 if(!ctryOk(c)){$('pe').textContent='اختر دولتك';return}
 PROF.n=n;PROF.c=c;try{localStorage.setItem('hw_prof',JSON.stringify(PROF))}catch(e){}
 G.pm='arc';selReset()}
function lrow(a,b,c,d,me){
 const r=document.createElement('div');r.className='lr'+(me?' me':'');
 [a==1?'🥇':a==2?'🥈':a==3?'🥉':ar(a),b,c,ar(d)].forEach(x=>{const s=document.createElement('span');s.textContent=x;r.appendChild(s)});
 return r}
function openLB(g){G.lbg=g||G.lbg||'bomb';G.lbv=G.lbv||'p';show('lbs');lbDraw()}
async function lbDraw(){
 document.querySelectorAll('#lbs [data-a=lbg]').forEach(b=>b.classList.toggle('on',b.dataset.g==G.lbg));
 document.querySelectorAll('#lbs [data-a=lbv]').forEach(b=>b.classList.toggle('on',b.dataset.v==G.lbv));
 const box=$('lbt'),my=lbDraw.n=(lbDraw.n||0)+1;box.textContent='جاري التحميل…';
 const r=await LB.top(G.lbg);if(my!=lbDraw.n)return;
 $('lbst').textContent=r.online?'🌍 التصنيف العالمي':(LB.url?'⚠️ تعذّر الاتصال — نتائج هذا الجهاز':'📱 نتائج هذا الجهاز (التصنيف العالمي غير مفعّل)');
 box.textContent='';const me=LB.key(PROF.n,PROF.c);let rows;
 if(G.lbv=='p')rows=r.list.slice(0,100).map((o,i)=>[i+1,flag(o.c)+' '+cname(o.c),o.n,o.s,(o.k||LB.key(o.n,o.c))==me]);
 else{
  const m={};r.list.forEach(o=>{const x=m[o.c]||(m[o.c]={c:o.c,s:0,n:0,w:''});x.n++;if(o.s>x.s){x.s=o.s;x.w=o.n}});
  rows=Object.values(m).sort((x,y)=>y.s-x.s||y.n-x.n).map((x,i)=>[i+1,flag(x.c)+' '+cname(x.c),x.w+' · '+ar(x.n)+' لاعب',x.s,x.c==PROF.c])}
 if(!rows.length){box.textContent='ما فيه نتائج لسه — كن أول واحد! 🏁';return}
 rows.forEach(x=>box.appendChild(lrow(...x)))}

// ===== بدء اللعبة =====
function startArc(kind,ci,s){
 G.mode='arc';G.arc=kind;G.stg=s;G.role=null;G.net=0;G.round=0;
 G.fx=[];G.pa=[];G.rg=[];G.ev=[];G.pj=[];G.pd=[];G.ex=[];G.en=[];G.slow=0;G.pull=null;G.ban=null;G.snap=null;
 const p=new F(C[ci],0,0),dm=new F(C[ci],1,0);dm.ko=1;dm.x=-999;p.x=600;p.dir=1;
 G.f=[p,dm];G.st='fight';G.sT=0;G.go=1;
 G.AR={k:kind,pts:0,score:0,t:0,sT:0,done:0,dt:0,fin:0,lives:3,inv:0,coins:0,mult:1,mt:0,maxm:1,bombs:[],cl:[],cf:[],bl:[],sb:1.5,sc:2.2,near:0,dodge:0,swat:0,wave:0,kills:0,ws:'intro',wt:0};
 if(kind=='waves')nextWave()}

function arcTick(dt){
 const A=G.AR,p=G.f[0];
 if(G.hs>0){G.hs-=dt;dt*=.04}
 if(A.fin){visUpdate(dt);return}
 A.sT+=dt;
 if(A.k=='bomb')bombTick(dt,A,p);else wavesTick(dt,A,p);
 updPj(dt);updPd(dt);pullStep(dt);visUpdate(dt);
 A.score=Math.floor(A.pts+(A.k=='bomb'?A.t*3:0))}

// ===== لعبة ١: تفادي القنابل =====
function spawnBomb(A,p){
 const t=A.t,r=R(),gy=GY(),vmax=Math.min(900,520+t*5);
 const mk=(x,o)=>A.bombs.push(Object.assign({x,y:-60,vx:0,vy:160,vmax,k:'fall',r:t>55&&R()<.15?165:112,age:0,rot:0,sw:0,fz:0},o));
 if(t>22&&r<.2){const side=R()<.5;A.bombs.push({x:side?-50:W+50,y:gy-32,vx:(side?1:-1)*(320+Math.min(300,t*3)),vy:0,vmax,k:'roll',r:105,age:0,rot:0,sw:0,fz:0})}
 else if(t>38&&r<.4){const x0=clamp(p.x+(R()-.5)*300,140,W-140);for(let i=-1;i<=1;i++)mk(clamp(x0+i*125,60,W-60),{y:-60-Math.abs(i)*40})}
 else mk(R()<.6?clamp(p.x+(R()-.5)*420,60,W-60):60+R()*(W-120),{})}
function swat(A,p){
 const gy=GY(),d=p.dir;
 A.bombs.forEach(b=>{if(b.sw)return;const dx=(b.x-p.x)*d,dy=b.y-(gy+p.y-100);
  if(dx>-30&&dx<210&&Math.abs(dy)<170){b.sw=1;b.fz=.5;b.vx=d*900;b.vy=-380;b.k='fall';A.pts+=3;A.swat++;pop(b.x,b.y-40,'ضربة! +3','#ff9a3c',40);snd('hit');spark(b.x,b.y,8)}})}
function bombBlow(b){
 const A=G.AR,p=G.f[0],gy=GY(),y=Math.min(b.y,gy-30);
 A.bl.push({x:b.x,y,a:0,r:b.r});ring(b.x,y,'#ffb703');ring(b.x,y,'#ff5d6c');spark(b.x,y,22,'#ffb703');dust(b.x,gy,8);shake(b.r>120?28:18);snd('boom');
 if(A.done||A.inv>0)return;
 const d=Math.hypot(p.x-b.x,(gy+p.y-100)-y);
 if(d<b.r){
  if(p.dsh>.08){A.pts+=5;A.dodge++;pop(p.x,gy+p.y-260,'تفادي! +5','#7df',46)}
  else{
   A.lives--;A.inv=1.7;A.mult=1;A.mt=0;
   p.hit({dir:Math.sign(p.x-b.x)||1,cb:0,cbt:0,en:0,vx:0},.001,560,1,1);p.hp=p.c.hp;pop(p.x,gy+p.y-260,'آخ! 💔','#ff5d6c',54);
   if(A.lives<=0){A.done=1;A.dt=0;p.ko=1;p.lau=0;p.vy=-720;p.vx=(Math.sign(p.x-b.x)||1)*500;p.lt=0;G.slow=1.2;snd('ko')}}}
 else if(d<b.r+110&&!b.sw){A.pts+=5;A.near++;pop(p.x,gy+p.y-260,'قريبة! +5','#ffd23f',44)}}
function bombTick(dt,A,p){
 const gy=GY();
 const I=A.done?{}:Object.assign({},ctl(0),{ps:0,s:0});
 p.up(dt,{x:p.x+(Math.abs(p.vx)>40?Math.sign(p.vx):p.dir)*100,y:0},I);
 p.hp=p.c.hp;p.en=0;
 A.inv=Math.max(0,A.inv-dt);p.al=A.inv>0&&!A.done?(Math.sin(A.sT*40)>0?.35:1):1;
 if(p.atk&&p.atk.h&&!p.atk.sw){p.atk.sw=1;swat(A,p)}
 if(A.mt>0&&(A.mt-=dt)<=0)A.mult=1;
 if(A.sT>1.2&&!A.done){
  A.t+=dt;A.sb-=dt;A.sc-=dt;
  if(A.sb<=0){A.sb=Math.max(.28,1.15-A.t*.014)*(.75+R()*.5);spawnBomb(A,p)}
  if(A.sc<=0){A.sc=1.6+R()*1.8;A.cl.push({x:60+R()*(W-120),y:-40,vy:0,vx:(R()-.5)*120,k:R()<.14?'pile':'coin',bn:0,age:0})}}
 A.bombs=A.bombs.filter(b=>{
  b.age+=dt;b.rot+=dt*(b.k=='roll'&&!b.sw?-6*Math.sign(b.vx||1):2);
  if(b.k=='roll'&&!b.sw)b.x+=b.vx*dt;else{b.vy=Math.min(b.vy+(b.sw?900:700)*dt,b.vmax);b.y+=b.vy*dt;b.x+=b.vx*dt}
  if(R()<.35)G.pa.push({x:b.x+28,y:b.y-26,vx:(R()-.5)*60,vy:-40-R()*50,gr:0,z:6,a:0,l:.3,c:R()<.5?'#ffb703':'#fff'});
  if(b.sw){b.fz-=dt;if(b.fz<=0||b.y>=gy-30){bombBlow(b);return false}}
  else if(b.k=='fall'&&b.y>=gy-30){b.y=gy-30;bombBlow(b);return false}
  else if(!A.done&&Math.abs(b.x-p.x)<50&&b.y>gy+p.y-190&&b.y<gy+p.y+10){bombBlow(b);return false}
  return b.x>-120&&b.x<W+120});
 A.cl=A.cl.filter(c=>{
  c.age+=dt;c.vy+=900*dt;c.y+=c.vy*dt;c.x+=c.vx*dt;c.vx*=1-.8*dt;
  if(c.y>gy-24){c.y=gy-24;c.vy*=-.45;c.vx*=.6;if(++c.bn>3)c.vy=0}
  if(!A.done&&Math.abs(c.x-p.x)<58&&Math.abs(c.y-(gy+p.y-95))<115){
   const v=(c.k=='pile'?50:10)*A.mult;A.pts+=v;A.coins++;A.mult=Math.min(5,A.mult+1);A.maxm=Math.max(A.maxm,A.mult);A.mt=3.5;
   snd('coin');A.cf.push({x:c.x,y:c.y,a:0});pop(c.x,c.y-50,'+'+v,'#ffd23f',44);return false}
  return c.age<9});
 A.cf=A.cf.filter(e=>(e.a+=dt)<.36);A.bl=A.bl.filter(e=>(e.a+=dt)<.45);
 if(A.done&&(A.dt+=dt)>1.7)arcFinish()}

// ===== لعبة ٢: موجات القتال =====
function nextWave(){const A=G.AR;A.wave++;A.ws='intro';A.wt=0;G.pj=[];G.pd=[];banner('الجولة '+ar(A.wave))}
function spawnWave(){
 const A=G.AR,n=Math.min(8,A.wave);G.en=[];
 for(let i=0;i<n;i++){
  const c0=pick(C),c=Object.assign({},c0,{hp:Math.round(c0.hp*Math.min(1.25,.75+.04*A.wave))}),e=new F(c,1,Math.min(3,1+(A.wave/3|0)));
  e.x=i%2?W-70-(i>>1)*50:70+(i>>1)*50;e.dir=i%2?-1:1;e.y=-420-i*70;e.dm=Math.min(1,.6+.04*A.wave);e.sp0=.6+i*.3;e.cnt=0;e.rm=null;G.en.push(e)}}
function wavesTick(dt,A,p){
 const alive=G.en.filter(e=>!e.ko),near=alive.reduce((m,e)=>!m||Math.abs(e.x-p.x)<Math.abs(m.x-p.x)?e:m,null);
 p.up(dt,near||{x:p.x+p.dir*100,y:0},p.ko||A.ws=='dead'?{}:ctl(0));
 alive.slice().sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x)).forEach((e,i)=>{e.ai.agg=i<2?1:0});
 G.en.forEach(e=>{
  e.sp0-=dt;
  e.up(dt,p,(e.sp0>0||p.ko||A.ws!='fight'||e.y<-5)?{}:ai(e,p,dt));
  if(e.ko){
   if(!e.cnt){e.cnt=1;A.kills++;const v=10*A.wave;A.pts+=v;pop(e.x,GY()-300,'+'+v,'#ffd23f',50)}
   e.rm=e.rm==null?1.6:e.rm-dt;e.al=clamp(e.rm/.6,0,1)}});
 G.en=G.en.filter(e=>!(e.rm!=null&&e.rm<=0));
 const all=[p,...G.en.filter(e=>!e.ko&&e.y>-60)];
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)collide(all[i],all[j],true);
 if(A.ws=='intro'){if((A.wt+=dt)>1.6){spawnWave();A.ws='fight'}}
 else if(A.ws=='fight'){
  if(p.ko){A.ws='dead';A.wt=0;G.slow=1.2}
  else if(!G.en.some(e=>!e.ko)){
   A.ws='clear';A.wt=0;const b=25*A.wave;A.pts+=b;pop(p.x,GY()-320,'جولة مكتملة! +'+ar(b),'#7df',52);snd('go');
   p.hp=Math.min(p.c.hp,p.hp+p.c.hp*.3);p.en=Math.min(100,p.en+40)}}
 else if(A.ws=='clear'){if((A.wt+=dt)>2.2)nextWave()}
 else if(A.ws=='dead'){if((A.wt+=dt)>2)arcFinish()}}

// ===== النهاية والتصنيف =====
async function arcFinish(){
 const A=G.AR;if(!A||A.fin)return;A.fin=1;
 const sc=Math.floor(A.score),g=A.k;
 $('at').textContent=g=='bomb'?'انفجرت! 💥':'سقطت في الجولة '+ar(A.wave)+' ⚔️';
 $('as').textContent=ar(sc);
 $('ad').textContent=g=='bomb'?`⏱ ${ar(Math.floor(A.t))}ث · 🪙 ${ar(A.coins)} · أعلى مضاعف ×${ar(A.maxm)} · ضربات ${ar(A.swat)}`:`الجولة ${ar(A.wave)} · هزمت ${ar(A.kills)} خصم`;
 $('ar').textContent='جاري تسجيل نتيجتك…';$('al').textContent='';
 show('aover');
 const r=await LB.submit(g,PROF,sc,A.wave);
 let t=r.rank?(r.online?`🌍 ترتيبك #${ar(r.rank)} من ${ar(r.total)}`:`ترتيبك على هذا الجهاز #${ar(r.rank)}`):'خارج أفضل ٢٠٠';
 if(LB.url&&!r.online)t='⚠️ تعذّر الاتصال بالتصنيف العالمي — حُفظت النتيجة على جهازك\n'+t;
 t+=r.imp?'\n🎉 رقم قياسي جديد لك!':'\nأفضل نتيجة لك: '+ar(r.best);
 $('ar').textContent=t;
 const box=$('al');box.textContent='';
 const top=r.list.slice(0,5).map((o,i)=>[o,i+1]);if(r.rank>5)top.push([r.list[r.rank-1],r.rank]);
 top.forEach(([o,i])=>box.appendChild(lrow(i,flag(o.c)+' '+cname(o.c),o.n,o.s,r.k==(o.k||LB.key(o.n,o.c)))))}

// ===== الرسم =====
function arcHud(){
 const A=G.AR,p=G.f[0];
 tx(flag(PROF.c)+' '+PROF.n,1170,24,30,'#fff4d6','right');
 if(A.k=='bomb'){
  for(let i=0;i<3;i++)tx(i<A.lives?'❤️':'🖤',58+i*56,50,46);
  tx(ar(A.score),600,58,76,'#ffd23f');
  tx('⏱ '+ar(Math.floor(A.t))+'ث   🪙 '+ar(A.coins),600,116,34,'#fff4d6');
  if(A.mult>1)tx('×'+ar(A.mult),1100,96,64,'#ffb703');
  if(A.sT<1.2)tx('تفادى القنابل!',600,330,100,'#ffd23f','center','#e63946')}
 else{
  const pc=p.hp/p.c.hp;
  bar(40,450,28,34,pc,0,pc<.3?'#ff3b4a':'#ffd23f');bar(40,450,76,12,p.en/100,0,p.en>=100?'#ffd23f':p.en>=50?'#2ef2d0':'#1a9e8f');
  tx(p.c.n,40,124,40,'#fff4d6','left');
  tx(ar(A.score),1160,72,70,'#ffd23f','right');
  tx('الجولة '+ar(A.wave),600,52,56,'#fff4d6');
  tx('الأعداء: '+ar(G.en.filter(e=>!e.ko).length),600,104,34,'#ff9a9a');
  if(A.ws=='clear')tx('أحسنت! الجولة التالية…',600,330,80,'#7df');
  if(A.ws=='dead')tx('سقطت!',600,330,120,'#ff5d6c')}}
function drawArc(gy){
 const A=G.AR;if(!A||A.k!='bomb')return;
 A.bombs.forEach(b=>{
  if(b.k=='fall'&&!b.sw){
   const pr=clamp(1-(gy-b.y)/(gy+80),0,1);cx.save();
   cx.globalAlpha=.25+.5*pr;cx.fillStyle='#000';cx.beginPath();cx.ellipse(b.x,gy+2,30+pr*30,8+pr*6,0,0,7);cx.fill();
   cx.globalAlpha=1;cx.strokeStyle=`rgba(255,70,70,${.25+.6*pr*(.6+.4*Math.sin(A.sT*20))})`;cx.lineWidth=4;cx.beginPath();cx.ellipse(b.x,gy,b.r,b.r*.3,0,0,7);cx.stroke();cx.restore()}
  const D=FR.bomb,s=(b.r>120?1.25:1)*84/D.w;
  cx.save();cx.translate(b.x,b.y);cx.rotate(b.rot*.3);cx.drawImage(IM.bomb,-D.w*s/2,-D.h*s/2,D.w*s,D.h*s);cx.restore()});
 A.cl.forEach(c=>{
  const D=FR.coin,fr=c.k=='pile'?D.pile[0]:D.spin[(A.sT*12|0)%D.spin.length],s=D.s;
  cx.drawImage(IM.coin,fr[0],fr[1],fr[2],fr[3],c.x-fr[2]*s/2,c.y-fr[3]*s/2,fr[2]*s,fr[3]*s)});
 A.cf.forEach(e=>{
  const D=FR.coin,fr=D.burst[Math.min(2,e.a/.12|0)],s=D.s*.9;
  cx.globalAlpha=1-e.a/.36;cx.drawImage(IM.coin,fr[0],fr[1],fr[2],fr[3],e.x-fr[2]*s/2,e.y-fr[3]*s/2-20,fr[2]*s,fr[3]*s);cx.globalAlpha=1});
 A.bl.forEach(e=>{
  const k=e.a/.45,r=e.r*(.5+.9*k),gr=cx.createRadialGradient(e.x,e.y,0,e.x,e.y,r);
  cx.globalAlpha=1-k;gr.addColorStop(0,'#fff6c9');gr.addColorStop(.4,'#ffb703');gr.addColorStop(1,'rgba(214,40,40,0)');
  cx.fillStyle=gr;cx.beginPath();cx.arc(e.x,e.y,r,0,7);cx.fill();cx.globalAlpha=1})}
