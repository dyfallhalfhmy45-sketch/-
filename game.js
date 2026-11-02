'use strict';
/* حرب الحارة — تطوير ضيف الله الفهمي */
const W=1200,H=800,R=Math.random,$=id=>document.getElementById(id),pick=a=>a[R()*a.length|0],ar=n=>n.toLocaleString('ar-EG'),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cv=$('cv'),cx=cv.getContext('2d');cv.width=W;cv.height=H;cx.direction='rtl';
const TMP=document.createElement('canvas');TMP.width=TMP.height=700;const tc=TMP.getContext('2d');
const FONT='Lalezar,Cairo,Tahoma,sans-serif';

// ===== المقاتلين: sq = فريمات الضربة العادية والخاصة (تجهيز، ضربة، رجوع) · sec = الضربة السرية =====
const C=[
 {fr:'merchant',n:'أبو كيس',t:'التاجر اللي كل شي عنده بالدين',hp:105,spd:290,dmg:8,reach:150,sp:'proj',pj:'crate',sec:'rain',sq:[[0,1,2],[3,4,3]],q:'الفلوس تتكلم… وأنا أصرخ!',win:'الحساب علي… بس الضرب كاش!'},
 {fr:'delivery',n:'أبو الطلبات',t:'مندوب التوصيل الصاروخي',hp:90,spd:420,dmg:7,reach:135,sp:'proj',pj:'box',sec:'rush',sq:[[1,2,3],[3,4,3]],q:'طلبك وصل… بالقوة!',win:'قيّمني خمس نجوم لو سمحت!'},
 {fr:'sheikh',n:'الشيخ أبو عصا',t:'اللي ما يعجبه شي',hp:95,spd:300,dmg:9,reach:190,sp:'melee',sec:'roar',sq:[[1,2,0],[3,4,4]],q:'في زماننا ما كان في كذا!',win:'قلت لكم… جيل ما يستحمل!'},
 {fr:'grandma',n:'الجدة أم الشنطة',t:'شنطتها فيها كل شي… حتى الحديد',hp:85,spd:340,dmg:9,reach:200,sp:'melee',sec:'bag',sq:[[1,0,4],[1,3,4]],q:'تضرب مرة ياللي ما تستحي!',win:'قعد عاد يا حبيبي… خلاص!'},
 {fr:'big',n:'أبو ضرغام',t:'الجبل اللي ما ينزاح',hp:130,spd:230,dmg:12,reach:150,sp:'quake',sec:'quake2',sq:[[0,1,2],[3,4,4]],q:'اللي يبغى يتحداني يتفضل!',win:'قلت لكم… الجبل ما ينهزّ!'},
 {fr:'mech',n:'الأسطى أبو مفتاح',t:'يصلّح كل شي… حتى خشمك',hp:110,spd:280,dmg:10,reach:175,sp:'melee',sec:'boomer',sq:[[0,2,4],[1,3,4]],q:'اللي ما ينفع معه الضرب… ينفع معه المفتاح!',win:'تم الإصلاح… بدون ضمان!'},
 {fr:'tea',n:'أبو الشاي',t:'الكرم قبل الضرب… ويمكن بعده',hp:88,spd:330,dmg:7,reach:140,sp:'proj',pj:'glass',sec:'puddle',sq:[[0,1,4],[1,2,4]],q:'اشرب شاي وبعدين نتفاهم!',win:'الشاي بارد… مثل حظك!'},
 {fr:'sheikh_b',n:'أبو نيلة',t:'الشيخ الأزرق… عصاه تطير',hp:100,spd:320,dmg:8,reach:185,sp:'proj',pj:'cane',sec:'barrage',sq:[[1,2,0],[3,4,4]],q:'العصا تروح وترجع… غالباً!',win:'رجّعوا لي عصاي!'},
 {fr:'grandma_b',n:'الجدة بنفسجة',t:'سلاحها السري: الشبشب الطائر',hp:88,spd:350,dmg:8,reach:195,sp:'proj',pj:'shoe',sec:'fan',sq:[[1,0,4],[1,3,4]],q:'الشبشب ما يخيس!',win:'الشبشب دايماً يوصل!'},
 {fr:'delivery_b',n:'أبو الموية',t:'يوصّل الماي… ويسقيك ضرب',hp:92,spd:410,dmg:7,reach:135,sp:'proj',pj:'bottle',sec:'wave',sq:[[1,2,3],[3,4,3]],q:'ماي بارد وضرب ساخن!',win:'مو مشكلة… الشحن مجاني!'},
 {fr:'tray',n:'أبو الكبسة',t:'عشاك اليوم إجباري!',hp:100,spd:300,dmg:9,reach:150,sp:'proj',pj:'meat',sec:'rain',rk:'meat',sn:'وليمة المفطّح!',sq:[[0,2,0],[0,1,0]],q:'والله لتاكل! عشاك اليوم إجباري!',win:'عطيتك المقسوم، مفطّح بالهواء الطلق!'},
 {fr:'pen',n:'الخطّاط أبو قلم',t:'خطك سيء ومستقبلك أسوأ',hp:90,spd:310,dmg:9,reach:190,sp:'melee',sec:'wave',wc:'#15151f',sn:'بحر الحبر!',sq:[[0,3,5],[0,4,6]],q:'خطك سيء، ومستقبلك أسوأ!',win:'نقطة آخر السطر.. انتهى النقاش!'},
 {fr:'fan',n:'المشجع أبو بوق',t:'الحكم ظالم… والبوق جاهز',hp:95,spd:360,dmg:8,reach:150,sp:'proj',pj:'blast',wc:'#3fdc4a',sec:'roar',sn:'بووووق!',sq:[[0,1,0],[2,3,4]],q:'الحكم ظالم بس أنا بكسر راسك!',win:'بلنتي لي، وكفّ لك، وانتهت المباراة!'},
 {fr:'vac',n:'الخالة أم المكنسة',t:'نظفت الحوش… ونظفتك',hp:90,spd:320,dmg:8,reach:140,sp:'proj',pj:'dust',sec:'suck',sn:'شفط!',sq:[[0,1,2],[0,1,2]],q:'وخّر عن الفرشة توني كانسة!',win:'نظفت الحوش ونظفت الشاشة منك!'},
 {fr:'mega',n:'الحراجي أبو مكبّر',t:'مين يزود؟ مين يشتري؟',hp:95,spd:330,dmg:8,reach:150,sp:'proj',pj:'blast',wc:'#4aa8ff',sec:'barrage',bk:'blast',sn:'مزاد علني!',sq:[[3,1,4],[0,2,4]],q:'مين يزود؟ مين يشتري هالرلابة؟',win:'تم البيع! سكراب ما ينفع بريال؟'},
 {fr:'hunch',n:'الجد الزاحف',t:'يزحف… ويوصلك',hp:92,spd:380,dmg:9,reach:150,lunge:750,sp:'melee',sec:'rush',sn:'الزحف الأخير!',sq:[[0,3,2],[1,4,5]],q:'ظهري يوجعني… بس أنت أوجع!',win:'كل هذا وما زحفت زحفة!'},
 {fr:'wheel',n:'أبو الدركسون',t:'الدركسون سلاحه',hp:100,spd:340,dmg:8,reach:150,sp:'proj',pj:'wheel',sec:'rush',sn:'تفحيط!',sq:[[0,1,5],[1,5,0]],q:'ما عندي سيارة… بس عندي دركسون!',win:'رخصتك مسحوبة!'},
 {fr:'kid',n:'الشقي أبو فتيل',t:'ليلة العيد كل ليلة',hp:80,spd:430,dmg:6,reach:130,sp:'proj',pj:'cracker',sec:'fan',fk:'cracker',sn:'ليلة العيد!',sq:[[0,2,3],[0,1,3]],q:'ما أخاف… بس أخاف أمي!',win:'عيدكم مبارك… بالفرقعة!'},
 {fr:'teach',n:'المعلّمة الصارمة',t:'الواجب؟ الله يعينك',hp:95,spd:290,dmg:9,reach:180,sp:'melee',sec:'roar',sn:'اسكتوا! أخرجوا الكتب!',sq:[[0,1,3],[2,1,3]],q:'وين الواجب؟',win:'خذ صفر… وطلع برا!'},
 {fr:'chef',n:'أبو الشاورما',t:'الشواية ما تبرد',hp:105,spd:300,dmg:9,reach:150,sp:'proj',pj:'blast',wc:'#ff7a1a',sec:'wave',sn:'سيخ الجحيم!',sq:[[0,1,0],[0,2,3]],q:'تبي شاورمة؟',win:'تبي شاورمة؟'},
 {fr:'lizard',n:'أبو ضبّ',t:'ذيله أطول من لسانه',hp:115,spd:290,dmg:10,reach:175,sp:'melee',sec:'quake2',sn:'دحرجة الضب!',sq:[[1,3,1],[2,4,2]],q:'الضب ما يتنازل عن جحره!',win:'ذنبي ولا ذنبك… بس أنت الخسران!'},
 {fr:'sling',n:'الكابتن مقلاع',t:'يلعب بالكورة… ويضرب بالمقلاع',hp:82,spd:400,dmg:7,reach:130,sp:'proj',pj:'ball',wc:'#4fe3ff',sec:'fan',fk:'ball',sn:'هاتريك!',sq:[[0,1,0],[1,2,3]],q:'هدف… في وجهك!',win:'هاتريك… وإنت الكورة!'},
 {fr:'graf',n:'فنان الجرافيتي',t:'يرسم على وجهك',hp:88,spd:380,dmg:7,reach:150,sp:'proj',pj:'blast',wc:'#b84dff',sec:'wave',sn:'جدارية الغضب!',sq:[[0,1,0],[1,3,5]],q:'بارسم على وجهك!',win:'لوحة فنية.. بس للأسف جرافيتي ما ينمحي!'},
 {fr:'sage',n:'عمدة الحارة',t:'أمر بكسر خشمك',hp:100,spd:280,dmg:9,reach:185,sp:'proj',pj:'paper',sec:'roar',sn:'قرار عمدة!',sq:[[2,0,1],[2,4,5]],q:'بصفتي عمدة الحارة.. أمرت بكسر خشمك!',win:'سجل يا تاريخ.. هالكائن ما يفهم بالطيب!'},
 {fr:'dates',n:'أبو التمر',t:'الحلاوة زايدة',hp:98,spd:300,dmg:8,reach:160,sp:'proj',pj:'date',sec:'rain',rk:'date',sn:'مطر الرطب!',sq:[[0,2,4],[0,3,4]],q:'الحلاوة زايدة.. بس طعم الهزيمة مر!',win:'سكري خلاص.. وخلاص على مستقبلك!'},
 {fr:'bedu',n:'راعي الإبل',t:'أهل الإبل أهل عزم',hp:100,spd:330,dmg:9,reach:185,sp:'melee',sec:'rush',sn:'ركضة الناقة!',sq:[[3,4,3],[0,2,1]],q:'ناقتي يا ناقتي.. الحين تبتلش فيك!',win:'أهل الإبل أهل عزم.. وأنت هشت مع الريح!'}
];
const SECN={rain:'مطر الفلوس!',rush:'توصيل سريع!',roar:'اسكت يا ولد!',bag:'الشنطة الساقطة!',quake2:'زلزال أبو ضرغام!',boomer:'المفتاح الراجع!',puddle:'بركة الشاي!',barrage:'تعليم الأدب!',fan:'وابل الشباشب!',wave:'موجة الماي!'};
const ST=[{id:'diriyah',n:'ليالي الدرعية',gy:640},{id:'abha',n:'ضباب أبها',gy:625},{id:'jeddah',n:'كورنيش جدة',gy:630},{id:'balad',n:'البلد القديمة',gy:640},{id:'riyadh',n:'رياض النيون',gy:625},{id:'hall',n:'قاعة الوليمة',gy:655},{id:'school',n:'ملعب المدرسة',gy:640},{id:'farm',n:'حظيرة الغنم',gy:635},{id:'alley',n:'زقاق الفوانيس',gy:665},{id:'sunset',n:'كورنيش الغروب',gy:670}];
const HT=['طاخ!','بوم!','آخ!','يا ويلي!','هاه؟!','ضربة معلّم!','وجع!','ما تستحي؟!','يا شيخ!'];
const TAGS=['الجدة تضرب… والباقي يبكي!','ممنوع الضحك أثناء القتال!','كل مقاتل عنده ضربة سرية… اكتشفها!','الشبشب سلاح رسمي','العب مع خويّك برقم غرفة!','اللي يتأخر طلبه… يتأخر وجهه','لا تستهين بصاحب العصا'];
const IM={},G={st:'menu',mode:'demo',lv:2,pause:0,f:[],pj:[],pd:[],fx:[],pa:[],rg:[],ev:[],sh:0,hs:0,slow:0,zoom:1,tm:60,round:0,sT:0,stg:0,sel:[],pm:'1p',win:null,endTxt:'',ban:null,role:null,net:0,opp:null,go:0,pz:0,lead:0,ex:[],pull:null,arc:null,en:[]};
const GY=()=>ST[G.stg].gy;
function foes(f){return G.arc=='waves'?(f.i==0?G.en:[G.f[0]]):[G.f[1-f.i]]}
let ldn=0,ldt=1;
const prog=()=>{ldn++;const e=$('ld');if(e)e.textContent='جاري تجهيز الحارة… '+Math.min(100,Math.round(ldn/ldt*100))+'%'};
const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>{prog();r(i)};i.onerror=()=>{prog();r(i)};i.src=s});

// ===== مؤثرات (المضيف يرسلها للضيف كأحداث) =====
const q=a=>{if(G.role=='h')G.ev.push(a)};
const snd=n=>{if(G.mode!='demo')SFX.play(n);q(['n',n])};
const pop=(x,y,t,col='#fff',sz=56)=>{G.fx.push({x,y,t,col,sz,a:0});q(['p',x,y,t,col,sz])};
const spark=(x,y,n=10,col)=>{for(let i=0;i<n;i++){const a=R()*6.28,s=150+R()*400;G.pa.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,gr:900,z:10,a:0,l:.35+R()*.25,c:col||pick(['#ffd23f','#fff','#ff5d6c'])})}q(['s',x,y,n,col])};
const dust=(x,y,n=6)=>{for(let i=0;i<n;i++)G.pa.push({x:x+(R()-.5)*50,y:y-4,vx:(R()-.5)*260,vy:-R()*90,gr:-40,z:16,a:0,l:.45+R()*.2,c:'#cdb894'});q(['d',x,y,n])};
const ring=(x,y,c='#fff')=>{G.rg.push({x,y,a:0,c});q(['r',x,y,c])};
const shake=v=>{G.sh=Math.max(G.sh,v);q(['h',v])};
const banner=t=>{G.ban={t,a:0};q(['b',t])};
function evt(a){const[k,...v]=a;({n:n=>SFX.play(n),p:pop,s:spark,d:dust,r:ring,h:shake,b:banner,e:(x,y,fr)=>G.ex.push({x,y,a:0,fr})})[k](...v)}
const PJT={glass:[620,-420,1800],blast:[900,0,0],ball:[950,0,0],dust:[470,0,0],wheel:[1100,0,0],cracker:[700,-260,1100],meat:[760,-200,1000],paper:[720,-180,900],date:[740,-200,1000]};
const mkp=(f,kind,x,y,vx,vy,g,d,ex)=>Object.assign({x,y,vx,vy,g,dir:Math.sign(vx)||f.dir,own:f,kind,t:0,d,rot:0,dl:0,bn:0,hz:0,hc:0,ty:0,ub:0},ex);

// ===== المقاتل =====
class F{
 constructor(c,i,lv){this.c=c;this.i=i;this.ai=lv?{lv,t:0,m:'idle'}:null;this.w=0;this.reset()}
 reset(){Object.assign(this,{x:this.i?880:320,y:0,vy:0,vx:0,dir:this.i?-1:1,hp:this.c.hp,en:this.en||0,t:0,atk:null,stun:0,cd:0,fl:0,blk:0,ko:0,kt:0,cb:0,cbt:0,vic:0,st:'idle',tl:-9,tr:-9,dc:0,sp:0,ph:0,sk:0,skt:0,tt:0,wsp:0,ff:0,dsh:0,rush:0,rh:0,kd:0,lau:0,lt:0,rot:0,sq:0,aj:0,cut:0,slam:0,bn:0,flip:0})}
 begin(k){this.atk={k,t:0,d:k?(k==2?.13:.11):.075,h:0};this.cd=k?.65:.32;if(k==2){this.en=0;banner(this.c.sn||SECN[this.c.sec]);G.hs=.35;snd('super');shake(10)}else{if(k)this.en-=50;snd(k?'sp':'swing')}}
 strike(o){
  const c=this.c,k=this.atk.k,gy=GY(),d=this.dir,fv=Math.max(0,this.vx*d),bo=1+clamp((fv-300)/900,0,.45);
  this.vx+=d*(k?(c.lunge||420):260);
  if(k==2)return secret(this,o);
  if(k&&c.sp!='melee'){
   const x=this.x+d*70,y=gy+this.y-135;
   if(c.sp=='quake')G.pj.push(mkp(this,'quake',x,gy,d*560,0,0,c.dmg*2.2,{ty:1}));
   else if(c.pj=='glass')G.pj.push(mkp(this,'glass',x,y,d*620,-420,1800,c.dmg*1.7));
   else{const[v,vy,gr]=PJT[c.pj]||[780,-120,900];G.pj.push(mkp(this,c.pj,x,y,d*v,vy,gr,c.dmg*1.7,{cl:c.wc}))}
   return}
  foes(this).forEach(o=>{if((o.x-this.x)*d>-30&&(o.x-this.x)*d<c.reach*(k?1.3:1)*(1+(bo-1)*.5)&&Math.abs(o.y-this.y)<130){if(bo>1.15)pop(this.x+d*80,gy+this.y-300,'ضربة اندفاع!','#ff9a3c',50);o.hit(this,c.dmg*(k?2.2:1)*bo,(k?460:240)+fv*.3,k?1:(bo>1.3?1:0))}})}
 // ty: 0 خفيفة · 1 تطيّر · 2 تطيّر مع دوران  | ub: ما ينصدّ
 hit(a,d,kb,ty=0,ub=0){
  if(this.ko||this.kd>0||G.st!='fight'||(this.dsh>.08&&!ub))return;
  d*=a.dm||1;
  const gy=GY(),b=!ub&&this.blk&&this.dir==-a.dir&&this.y==0;
  if(b){d*=.12;this.vx=a.dir*kb*.3;pop(this.x,gy-260,'صدّ!','#7df',48);spark(this.x+this.dir*30,gy-120,6,'#7df');ring(this.x+this.dir*40,gy-120,'#7df');snd('block');shake(4)}
  else{
   this.atk=null;this.rush=0;this.sp=0;this.fl=.16;G.hs=ty?.1:.06;shake(ty?26:12);a.cb++;a.cbt=1.4;
   a.en=Math.min(100,a.en+(ty?18:12));this.en=Math.min(100,this.en+8);
   pop(this.x,gy+this.y-270,pick(HT),pick(['#ffd23f','#ff5d6c','#fff']));spark(this.x,gy+this.y-130,ty?22:12);ring(this.x,gy+this.y-130,ty?'#ffd23f':'#fff');snd(ty?'heavy':'hit');rumble(this);
   if(ty||this.y<0||this.hp-d<=0){this.lau=1;this.lt=0;this.flip=ty==2?1:0;this.vy=ty==2?-760:-600;this.vx=a.dir*(kb+(ty?150:0))+a.vx*.3;this.stun=0}
   else{this.stun=.3;this.vx=a.dir*kb+a.vx*.3;this.vy=-220}}
  this.hp=Math.max(0,this.hp-d);
  if(this.hp<=0){this.ko=1;this.lau=0;this.lt=0;this.vy=-720;this.vx=a.dir*560;shake(34);G.slow=1.1;snd('ko');spark(this.x,gy+this.y-130,26)}}
 land(v){
  const gy=GY();this.vy=0;this.sq=.2;this.wsp=0;
  if(this.ff&&v>500){shake(22);ring(this.x,gy-20,'#ffd23f');dust(this.x,gy,12);snd('boom');foes(this).forEach(o=>{if(Math.abs(o.x-this.x)<180&&o.y==0){pop(o.x,gy-280,'سحق!','#ff5d6c',54);o.hit(this,9,520,1)}})}
  this.ff=0;
  if(v>500){dust(this.x,gy,6);snd('land')}
  if(this.lau){this.lau=0;this.kd=.7;this.vx*=.5;shake(14);dust(this.x,gy,10);snd('thud')}
  else if(this.ko&&!this.bn){this.bn=1;this.vy=-320;this.vx*=.6;shake(20);dust(this.x,gy,8);snd('thud')}
  if(this.slam){this.slam=0;shake(40);snd('boom');ring(this.x,gy-30,'#ffd23f');dust(this.x,gy,12);
   [1,-1].forEach(d=>G.pj.push(mkp(this,'quake',this.x+d*40,gy,d*560,0,0,14,{ty:1})))}}
 up(dt,o,I){
  const c=this.c,fight=G.st=='fight',g=this.y==0;
  this.t+=dt;this.fl-=dt;this.cd-=dt;this.dc-=dt;this.cbt-=dt;this.sq-=dt;if(this.cbt<=0)this.cb=0;
  if(this.dsh>0)this.dsh-=dt;
  if(fight)this.en=Math.min(100,this.en+3*dt);
  this.blk=0;this.sk=0;this.ff=0;let fr=g?14:2.2;
  if(this.rush>0){this.rush-=dt;this.vx=this.dir*1500;this.dsh=.1;fr=0;
   if(!this.rh&&Math.abs(o.x-this.x)<95&&Math.abs(o.y-this.y)<140){this.rh=1;o.hit(this,16,800,2,1);this.rush=.1}}
  else if(this.ko)this.kt+=dt;
  else if(this.kd>0)this.kd-=dt;
  else if(this.lau){}
  else if(this.stun>0)this.stun-=dt;
  else if(this.atk){const A=this.atk;A.t+=dt;if(A.t>=A.d&&!A.h){A.h=1;this.strike(o)}if(A.t>=A.d*3)this.atk=null;fr=g?9:2}
  else{
   if(g)this.dir=o.x>=this.x?1:-1;
   this.st='idle';
   if(fight){
    const mv=(I.r?1:0)-(I.l?1:0);
    this.blk=I.d&&g?1:0;this.ff=I.d&&!g?1:0;
    if(this.blk)fr=20;
    else{
     const mx=c.spd*(1+.28*this.sp);
     if(mv&&(Math.abs(this.vx)<mx||mv*this.vx<0))this.vx+=mv*(g?(mv*this.vx<0?7000:3600):1700)*dt;
     if(mv){fr=g?3:1.5;if(g)this.st='walk'}
     else if(g&&Math.abs(this.vx)>500)fr=7;
     if(g&&mv&&mv*this.vx>0)this.sp=Math.min(1,this.sp+dt*.9);else this.sp=Math.max(0,this.sp-dt*(g?3:.4));
     this.sk=g&&((mv&&mv*this.vx<-250)||(!mv&&Math.abs(this.vx)>450))?1:0}
    let dd=0;
    if(I.pl){if(this.t-this.tl<.28)dd=-1;this.tl=this.t}
    if(I.pr){if(this.t-this.tr<.28)dd=1;this.tr=this.t}
    if(I.ph)dd=mv||this.dir;
    if(dd&&g&&this.dc<=0){this.vx=dd*880;this.dsh=.2;this.dc=.55;G.pz=1;dust(this.x,GY(),6);snd('dash')}
    if(I.pu&&g&&!this.blk){this.vy=-1000;this.aj=1;this.cut=0;snd('jump');dust(this.x,GY(),4)}
    else if(I.pu&&!g&&this.aj){this.aj=0;this.cut=1;this.vy=-860;snd('jump');dust(this.x,GY()+this.y,5);ring(this.x,GY()+this.y-20)}
    if(!I.u&&this.vy<-380&&!this.cut){this.vy*=.55;this.cut=1}
    if(I.ps&&I.d&&this.en>=100)this.begin(2);
    else if(I.pa&&this.cd<=0)this.begin(0);
    else if(I.ps&&this.en>=50)this.begin(1)}}
  if(g&&this.sk&&(this.skt-=dt)<=0){this.skt=.04;dust(this.x,GY(),2)}
  if(g&&this.st=='walk'&&!this.atk){const p0=this.ph/2|0;this.ph+=Math.abs(this.vx)*.045*dt;if((this.ph/2|0)!=p0&&Math.abs(this.vx)>200)dust(this.x-this.dir*18,GY(),1+(this.sp>.5?2:0))}
  if(g&&this.sp>.5&&(this.tt-=dt)<=0){this.tt=.07;dust(this.x-this.dir*30,GY(),1)}
  // فيزياء: تسارع واحتكاك وجاذبية
  this.x+=this.vx*dt;this.vx-=this.vx*Math.min(1,fr*dt);
  const air=this.y<0,pv=this.vy;
  this.vy+=2800*dt*(this.ff?2.4:1);this.y=Math.min(0,this.y+this.vy*dt);
  if(this.y==0){if(air)this.land(pv);else this.vy=0}
  if((this.x<=70||this.x>=W-70)&&(this.stun>0||this.lau||this.ko)&&Math.abs(this.vx)>220){if(Math.abs(this.vx)>650&&!this.ko&&!this.wsp&&G.st=='fight'){this.wsp=1;this.hp=Math.max(1,this.hp-4);pop(this.x,GY()-300,'ارتطام!','#ffb347',50);shake(24);ring(this.x,GY()-100)}this.vx*=-.5;dust(this.x,GY(),4);shake(8);snd('thud')}
  this.x=clamp(this.x,70,W-70);
  if(this.ko||this.kd>0||this.lau){
   this.lt+=dt;const lay=this.y==0;let r=-1.57*Math.min(1,this.lt*5);
   if(this.flip&&!lay)r-=6.283*Math.min(1,this.lt/.8);
   if(lay&&!this.ko&&this.kd<.25)r=-1.57*this.kd/.25;
   this.rot=r}
  else{const lv=this.vx*this.dir/c.spd,tr=this.stun>0?-.14:this.sk?-.2*Math.sign(lv):clamp(lv*.14,-.12,.24);this.rot+=(tr-this.rot)*Math.min(1,14*dt)}}
 fr(){
  const D=FR[this.c.fr];let a=D.idle,i=this.t*6|0;
  if(this.rush>0){a=D.atk;i=this.c.sq[1][1]}
  else if(this.ko||this.kd>0||this.lau||this.stun>0||this.blk)i=0;
  else if(this.atk){a=D.atk;i=this.c.sq[Math.min(1,this.atk.k)][Math.min(2,this.atk.t/this.atk.d|0)]}
  else if(this.y<0){a=D.walk;i=1}
  else if(this.st=='walk'){a=D.walk;i=this.ph|0;if(this.vx*this.dir<-60)i=a.length-1-i%a.length}
  return [D,a[i%a.length]]}
 draw(gy){
  const [D,f]=this.fr(),s=D.s,w=f[2]*s,h=f[3]*s,im=IM[this.c.fr],gnd=this.y==0&&!this.ko&&this.kd<=0&&!this.lau;
  let sy=1+(gnd?Math.sin(this.t*3)*.012:clamp(-this.vy/7000,-.1,.12));
  if(this.sq>0)sy*=1-.2*this.sq/.2;
  const sx=1/sy*(1+.05*this.sp),bob=this.st=='walk'&&gnd&&!this.atk?-Math.abs(Math.sin(this.ph*1.25))*(5+9*clamp(Math.abs(this.vx)/this.c.spd,0,1.3)):0,vy=this.vic?-Math.abs(Math.sin(this.t*7))*45:0;
  cx.fillStyle='rgba(0,0,0,.35)';cx.beginPath();cx.ellipse(this.x,gy+6,Math.max(20,55+this.y/6),12,0,0,7);cx.fill();
  if(this.en>=100&&!this.ko){cx.fillStyle=`rgba(255,210,63,${.18+.1*Math.sin(this.t*10)})`;cx.beginPath();cx.ellipse(this.x,gy+this.y-h/2,w*.55,h*.6,0,0,7);cx.fill()}
  if(this.dsh>0||this.rush>0||this.sp>.8)for(let k=3;k>0;k--){cx.globalAlpha=.07*(4-k);cx.save();cx.translate(this.x-this.dir*k*38,gy+this.y);cx.scale(this.dir,1);cx.drawImage(im,f[0],f[1],f[2],f[3],-f[4]*s,-h,w,h);cx.restore()}
  cx.globalAlpha=this.al==null?1:this.al;
  cx.save();cx.translate(this.x,gy+this.y+vy+bob-Math.abs(Math.sin(this.rot))*f[4]*s*.7);cx.scale(this.dir*sx,sy);cx.rotate(this.rot);
  if(this.blk){cx.fillStyle='rgba(120,220,255,.35)';cx.strokeStyle='#bef';cx.lineWidth=4;cx.beginPath();cx.ellipse(45,-h/2,30,h/2+12,0,0,7);cx.fill();cx.stroke()}
  if(this.fl>0){tc.clearRect(0,0,700,700);tc.globalCompositeOperation='source-over';tc.drawImage(im,f[0],f[1],f[2],f[3],0,0,w,h);tc.globalCompositeOperation='source-atop';tc.fillStyle='rgba(255,40,50,.6)';tc.fillRect(0,0,w,h);cx.drawImage(TMP,0,0,w,h,-f[4]*s,-h,w,h)}
  else cx.drawImage(im,f[0],f[1],f[2],f[3],-f[4]*s,-h,w,h);
  cx.restore();cx.globalAlpha=1}
}

// ===== الضربات السرية (املأ الطاقة كاملة + اصدّ ⬇ + اضغط الحركة الخاصة) =====
function secret(f,o){
 const c=f.c,gy=GY(),d=f.dir;
 switch(c.sec){
  case'rain':for(let i=0;i<9;i++)G.pj.push(mkp(f,c.rk||'coin',o.x+(R()-.5)*420,gy-760-R()*200,0,300,1500,5,{dl:i*.09,dir:d}));break;
  case'rush':f.rush=.45;f.rh=0;break;
  case'roar':ring(f.x,gy-120,'#ffd23f');shake(40);pop(f.x,gy-320,c.sn||'اسكت يا ولد!','#ffd23f',56);if(Math.abs(o.x-f.x)<430)o.hit(f,16,900,1,1);break;
  case'bag':G.pj.push(mkp(f,'bag',o.x,gy-900,0,2400,0,22,{dl:.55,tg:o.x,ty:2,dir:d}));break;
  case'quake2':f.vy=-950;f.slam=1;break;
  case'barrage':for(let i=0;i<6;i++)G.pj.push(mkp(f,c.bk||'cane',f.x+d*60,gy+f.y-80-i*22,d*900,0,0,5,{dl:i*.1,cl:c.wc}));break;
  case'fan':for(let i=0;i<5;i++)G.pj.push(mkp(f,c.fk||'shoe',f.x+d*60,gy+f.y-130,d*(620+i*40),-650+i*170,1500,6,{cl:c.wc}));break;
  case'wave':G.pj.push(mkp(f,'wave',f.x+d*80,gy,d*540,0,0,15,{ty:1,ub:1,cl:c.wc}));break;
  case'suck':G.pull={f,o,t:.5};ring(o.x,gy-100,'#cfe');pop(f.x,gy-320,c.sn,'#cfe',56);break;
  case'boomer':G.pj.push(mkp(f,'wrench',f.x+d*70,gy+f.y-130,d*1100,0,0,14,{ty:1}));break;
  case'puddle':for(let i=0;i<3;i++)G.pj.push(mkp(f,'glass',o.x+(i-1)*170,gy-650,0,200,1800,6,{dl:i*.18,dir:d}));break}}

// ===== المقذوفات والبرك =====
function glassBreak(p,x){snd('glass');snd('splash');spark(x,GY()-40,10,'#a0e0ff');G.pd.push({x,own:p.own,t:0,life:5})}
function explode(p){
 const gy=GY();spark(p.x,p.y,18,'#ff8a3c');ring(p.x,p.y,'#ff8a3c');snd('hit');G.ex.push({x:p.x,y:p.y,a:0,fr:p.own.c.fr});q(['e',p.x,p.y,p.own.c.fr]);
 foes(p.own).forEach(o=>{if(Math.abs(o.x-p.x)<140&&Math.abs(gy+o.y-110-p.y)<170)o.hit(p.own,p.d,360,0,0)})}
function updPj(dt){
 const gy=GY();
 G.pj=G.pj.filter(p=>{
  if(p.dl>0){p.dl-=dt;return true}
  p.t+=dt;p.hc-=dt;const K=p.kind,fs=foes(p.own);if(!fs.length)return false;const hwk=K=='bag'?115:K=='wave'?110:K=='blast'||K=='dust'?75:60,o=fs.find(e=>!e.ko&&e.kd<=0&&Math.abs(p.x-e.x)<hwk)||fs[0];
  if(K=='wrench'||K=='wheel')p.vx+=Math.sign(p.own.x-p.x)*1400*dt;
  p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(!['quake','wave','bag','blast','dust','ball'].includes(K))p.rot+=p.dir*14*dt;
  if(p.g&&p.vy>0&&p.y>gy-18){
   if(K=='glass'){glassBreak(p,p.x);return false}
   if(K=='cracker'){explode(p);return false}
   if(K=='coin'){spark(p.x,gy-20,6,'#ffd23f');snd('coin');return false}
   p.y=gy-18;p.vy*=-.45;p.vx*=.7;if(++p.bn>2)return false;snd('thud')}
  if(K=='bag'&&p.y>gy-70){dust(p.x,gy,12);shake(34);snd('boom');ring(p.x,gy-30,'#ffd23f')}
  const gnd=K=='quake'||K=='wave',hw=K=='bag'?115:K=='wave'?110:K=='blast'||K=='dust'?75:60;
  const yok=K=='wave'?true:gnd?o.y>-40:Math.abs(p.y-(gy+o.y-110))<(K=='bag'?180:110);
  if(!o.ko&&o.kd<=0&&p.hc<=0&&Math.abs(p.x-o.x)<hw&&yok){
   if(K=='glass'){o.hit(p.own,p.d,320,0,0);glassBreak(p,o.x);return false}
   if(K=='cracker'){explode(p);return false}
   o.hit(p.own,p.d,K=='quake'?420:320,p.ty,p.ub);spark(p.x,p.y,8);
   if(K=='wrench'||K=='wheel'){p.hc=.35;return++p.hz<2}
   if(K=='coin')snd('coin');
   if(K!='bag')return false;p.hc=9}
  if(K=='bag')return p.y<gy-70;
  if(K=='wrench'||K=='wheel')return p.t<2.6&&!(p.t>.4&&Math.abs(p.x-p.own.x)<50);
  return p.x>-100&&p.x<W+100&&p.t<2.8})}
function updPd(dt){
 const gy=GY();
 G.pd=G.pd.filter(p=>{
  p.t+=dt;
  if(G.role!='g'){const o=foes(p.own).find(o=>o.y==0&&!o.ko&&o.kd<=0&&!o.lau&&o.dsh<=0&&p.t>.25&&Math.abs(o.x-p.x)<65);if(o){o.hit(p.own,6,520,1,1);pop(o.x,gy-280,'يا زلّة!','#ffb347');return false}}
  return p.t<p.life})}

// ===== الذكاء الاصطناعي =====
function ai(f,o,dt){
 const a=f.ai,L=a.lv,ad=Math.abs(o.x-f.x),r=f.c.reach,I={};
 a.t-=dt;
 if(a.agg===0){if(a.t<=0){a.t=.25+R()*.4;a.m=ad<r*2?'bk':ad>r*3.2?'fw':'idle'}}
 else if(a.t<=0){
  a.t=.12+R()*(.75-L*.17);
  if(f.en>=100&&ad<500&&R()<.6)a.m='sec';
  else if(o.atk&&ad<o.c.reach+50&&R()<.2+L*.22)a.m='blk';
  else if(f.en>=50&&f.c.sp!='melee'&&ad>250&&R()<.45)a.m='sp';
  else if(f.en>=50&&ad<r*1.2&&R()<.35)a.m='sp';
  else if(ad>r*.85)a.m=L>1&&ad>420&&R()<.25?'dash':'fw';
  else a.m=pick(['hit','hit','hit','bk','jp','blk','idle','hit'].slice(0,4+L*2))}
 const tw=o.x>f.x?'r':'l',aw=tw=='r'?'l':'r',m=a.m;
 if(m=='fw')I[tw]=1;else if(m=='bk')I[aw]=1;else if(m=='blk')I.d=1;
 else if(m=='jp'){I.u=I.pu=1;a.m='idle'}else if(m=='hit'){I.pa=1;a.m='idle'}else if(m=='sp'){I.ps=1;a.m='idle'}
 else if(m=='dash'){I.ph=1;I[tw]=1;a.m='fw'}else if(m=='sec'){I.d=I.ps=1;a.m='idle'}
 return I}

// ===== الإدخال: كيبورد + لمس + يد تحكم =====
const K=new Set(),PR=new Set(),PD=[],PP=[];
const M1={l:'KeyA',r:'KeyD',u:'KeyW',d:'KeyS',a:'KeyF',s:'KeyG',h:'ShiftLeft'},M2={l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown',a:'KeyK',s:'KeyL',h:'Semicolon'};
function readPads(){
 const L=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(p=>p&&p.connected);
 PD.length=0;
 L.forEach((p,n)=>{
  const b=i=>!!(p.buttons[i]&&p.buttons[i].pressed),x=p.axes[0]||0,y=p.axes[1]||0;
  const raw={l:b(14)||x<-.45,r:b(15)||x>.45,u:b(12)||y<-.6||b(0),d:b(13)||y>.6||b(4)||b(6),a:b(2),s:b(3)||b(1),h:b(5)||b(7),
   mu:b(12)||y<-.6,md:b(13)||y>.6,ml:b(14)||x<-.45,mr:b(15)||x>.45,ok:b(0),bk:b(1),st:b(9)};
  const pr=PP[n]||{},s={};
  for(const k in raw){s[k]=raw[k];s['p'+k]=raw[k]&&!pr[k]}
  PP[n]=raw;PD[n]=s})}
function inp(i){
 const o={},two=G.mode=='2p',pd=two?PD[i]:(i?null:PD[0]);
 for(const k in M1){
  const ks=i?[M2[k]]:two?[M1[k],'t'+k]:[M1[k],M2[k],'t'+k];
  o[k]=ks.some(c=>K.has(c))||!!(pd&&pd[k]);o['p'+k]=ks.some(c=>PR.has(c))||!!(pd&&pd['p'+k])}
 return o}
const ctl=i=>G.role=='h'&&i==1?NET.take():inp(i);
function rumble(f){
 if(G.mode=='demo'||f.ai||(G.role&&f.i==1))return;
 try{const L=[...navigator.getGamepads()].filter(p=>p&&p.connected),p=L[G.mode=='2p'?f.i:0];
  p&&p.vibrationActuator&&p.vibrationActuator.playEffect('dual-rumble',{duration:120,strongMagnitude:.9,weakMagnitude:.5})}catch(e){}}
function navPad(){
 const s=PD[0];if(!s)return;
 const scr=document.querySelector('.scr.on');
 if(s.pst)pauseT();
 if(!scr||(document.body.classList.contains('play')&&!G.pause))return;
 const its=[...scr.querySelectorAll('button,.cd')].filter(e=>e.offsetParent);if(!its.length)return;
 let cur=its.findIndex(e=>e.classList.contains('pf'));
 const dir=s.pmu?[0,-1]:s.pmd?[0,1]:s.pml?[-1,0]:s.pmr?[1,0]:null;
 const set=e=>{its.forEach(x=>x.classList.remove('pf'));e.classList.add('pf');e.scrollIntoView({block:'nearest'});snd('ui')};
 if(dir){
  if(cur<0)return set(its[0]);
  const c0=its[cur].getBoundingClientRect(),cx0=c0.left+c0.width/2,cy0=c0.top+c0.height/2;let best=null,bs=1e9;
  its.forEach((e,i)=>{if(i==cur)return;const r=e.getBoundingClientRect(),dx=r.left+r.width/2-cx0,dy=r.top+r.height/2-cy0;
   const pr=dir[0]?dx*dir[0]:dy*dir[1],cr=Math.abs(dir[0]?dy:dx);if(pr>8&&pr+cr*2<bs){bs=pr+cr*2;best=e}});
  if(best)set(best)}
 else if(s.pok){cur<0?set(its[0]):its[cur].click()}
 else if(s.pbk){const b=scr.querySelector('[data-a=back],[data-a=rback],[data-a=rsel],[data-a=resume]');b&&b.click()}}
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),2200)};

addEventListener('keydown',e=>{
 if(/Arrow|Space/.test(e.code)&&e.target.tagName!='INPUT')e.preventDefault();
 if(e.repeat)return;K.add(e.code);PR.add(e.code);
 if(e.code=='Escape'||e.code=='KeyP')pauseT();
 if(e.code=='KeyM'&&e.target.tagName!='INPUT')toggleSnd()});
addEventListener('keyup',e=>K.delete(e.code));addEventListener('blur',()=>K.clear());
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('gamepadconnected',()=>toast('🎮 تم توصيل يد التحكم'));
['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>SFX.init()));
if(matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0)document.body.classList.add('touch');
document.querySelectorAll('#tc b').forEach(b=>{
 const k='t'+b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();K.add(k);PR.add(k);b.classList.add('dn')});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>{K.delete(k);b.classList.remove('dn')}))});
$('pb').addEventListener('pointerdown',e=>{e.preventDefault();pauseT()});

// ===== المنطق =====
function newRound(){G.f.forEach(f=>f.reset());G.pj=[];G.pd=[];G.ban=null;G.pull=null;G.tm=60;G.sT=G.mode=='demo'?1.6:0;G.st='intro';G.go=0;G.round++;G.win=null}
function start(mode,a,b,s){
 G.arc=null;G.en=[];G.mode=mode;G.stg=s;G.round=0;G.fx=[];G.pa=[];G.rg=[];G.ev=[];G.role=mode=='ol'?NET.role:null;G.slow=0;
 G.f=[new F(C[a],0,mode=='demo'?2:0),new F(C[b],1,mode=='2p'||mode=='ol'?0:mode=='demo'?2:G.lv)];newRound()}
function demo(){const a=R()*C.length|0;let b;do{b=R()*C.length|0}while(b==a);start('demo',a,b,R()*ST.length|0)}
function endRound(){
 const [a,b]=G.f,w=a.hp>b.hp?a:b.hp>a.hp?b:null;
 G.st='end';G.sT=0;G.win=w;if(w){w.w++;w.vic=1}
 G.endTxt=!w?'تعادل!':(a.ko||b.ko)?'ضربة قاضية!':'انتهى الوقت!'}
function afterRound(){
 if(G.mode=='demo')return demo();
 const [a,b]=G.f,m=a.w>=2?a:b.w>=2?b:null;
 if(m)over(m);else newRound()}
function over(w){
 const me=G.role=='g'?1:0;
 $('ot').textContent=G.mode=='1p'?(w.i?'الكمبيوتر غلبك! 😂':'فزت! ما شاء الله عليك 🏆'):G.net?(w.i==me?'فزت على خويّك! 🏆':'خويّك غلبك 😂'):(w.i?'اللاعب الثاني':'اللاعب الأول')+' فاز 🏆';
 $('oq').innerHTML=`<b>${w.c.n}</b>: «${w.c.win}»`;$('shw').hidden=w.c.fr!='chef';
 $('over').classList.toggle('g',G.role=='g');$('over').classList.toggle('ol',!!G.net);
 G.st='over';show('over');if(G.role=='h')NET.send({t:'over',w:w.i})}
function visUpdate(dt){
 G.fx=G.fx.filter(e=>(e.a+=dt)<1);
 G.pa=G.pa.filter(p=>{p.a+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gr*dt;return p.a<p.l});
 G.rg=G.rg.filter(r=>(r.a+=dt)<.4);G.ex=G.ex.filter(e=>(e.a+=dt)<.36);
 if(G.ban&&(G.ban.a+=dt)>1.1)G.ban=null}
function collide(a,b,f){
 if(!a.ko&&!b.ko&&a.kd<=0&&b.kd<=0&&Math.abs(a.x-b.x)<70&&Math.abs(a.y-b.y)<60){
  const d=a.x<=b.x?1:-1,m=(70-Math.abs(a.x-b.x))/2,rv=(a.vx-b.vx)*d;
  a.x=clamp(a.x-m*d,70,W-70);b.x=clamp(b.x+m*d,70,W-70);
  if(rv>0){const ma=a.c.hp,mb=b.c.hp,j=1.35*rv/(1/ma+1/mb);a.vx-=j/ma*d;b.vx+=j/mb*d;
   if(rv>520&&f){const mx=(a.x+b.x)/2;dust(mx,GY(),8);shake(8);snd('thud');ring(mx,GY()-100);if(!a.atk&&!b.atk)pop(mx,GY()-260,'اصطدام!','#fff',44);a.sp=b.sp=0}}}}
function pullStep(dt){if(G.pull){const P=G.pull;P.t-=dt;P.o.vx+=Math.sign(P.f.x-P.o.x)*9000*dt;if(Math.abs(P.o.x-P.f.x)<100||P.t<=0){if(Math.abs(P.o.x-P.f.x)<170)P.o.hit(P.f,18,600,2,1);G.pull=null}}}
function tick(dt){
 if(G.arc)return arcTick(dt);
 if(G.hs>0){G.hs-=dt;dt*=.04}
 const [a,b]=G.f;G.sT+=dt;
 if(G.st=='intro'){if(G.sT>.95&&!G.go){G.go=1;snd('go')}if(G.sT>1.9)G.st='fight'}
 if(G.st=='fight'){G.tm-=dt;if(G.tm<=0||a.ko||b.ko)endRound()}
 const f=G.st=='fight';
 a.up(dt,b,f?(a.ai?ai(a,b,dt):ctl(0)):{});
 b.up(dt,a,f?(b.ai?ai(b,a,dt):ctl(1)):{});
 collide(a,b,f);
 pullStep(dt);
 updPj(dt);updPd(dt);visUpdate(dt);
 if(G.st=='end'&&G.sT>(G.mode=='demo'?1.5:2.8))afterRound()}

// ===== أونلاين: المضيف يشغّل اللعبة ويرسل لقطات، الضيف يرسل أزراره =====
const FK=['x','y','vx','vy','dir','hp','en','t','stun','ko','kt','blk','vic','w','cb','cbt','fl','kd','rot','sq','lau','rush','dsh','sp','ph','sk'];
function snap(){
 const r=v=>Math.round(v*100)/100,m={t:'s',st:G.st,sT:r(G.sT),tm:r(G.tm),rd:G.round,et:G.endTxt,
  f:G.f.map(f=>[...FK.map(k=>r(+f[k]||0)),f.st=='walk'?1:0,f.atk?f.atk.k:-1,f.atk?r(f.atk.t):0,f.atk?f.atk.d:0]),
  p:G.pj.map(p=>[r(p.x),r(p.y),r(p.vx),r(p.vy),p.kind,r(p.t),r(p.rot),p.own.i,p.dl>0?1:0,r(p.tg||0),p.dir]),
  d:G.pd.map(p=>[r(p.x),r(p.t),p.life,p.own.i]),e:G.ev};
 G.ev=[];return m}
function applySnap(s){
 G.st=s.st;G.sT=s.sT;G.tm=s.tm;G.round=s.rd;G.endTxt=s.et;
 G.f.forEach((f,i)=>{
  const a=s.f[i],n=FK.length;
  FK.forEach((k,j)=>{f[k]=k=='x'||k=='y'?f[k]+(a[j]-f[k])*(Math.abs(a[j]-f[k])>160?1:.6):a[j]});
  f.st=a[n]?'walk':'idle';f.atk=a[n+1]>=0?{k:a[n+1],t:a[n+2],d:a[n+3]}:null});
 G.win=G.f.find(f=>f.vic)||null;
 G.pj=s.p.map(p=>({x:p[0],y:p[1],vx:p[2],vy:p[3],kind:p[4],t:p[5],rot:p[6],own:G.f[p[7]],dl:p[8],tg:p[9],dir:p[10]}));
 G.pd=s.d.map(p=>({x:p[0],t:p[1],life:p[2],own:G.f[p[3]]}));
 s.e.forEach(evt)}
function guestStep(dt){
 if(G.snap){applySnap(G.snap);G.snap=null}
 else{G.f.forEach(f=>{f.t+=dt;if(f.st=='walk')f.ph+=Math.abs(f.vx)*.045*dt;if(f.atk)f.atk.t=Math.min(f.atk.t+dt,f.atk.d*3-.001)});G.pj.forEach(p=>{if(!p.dl){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t+=dt;p.rot+=p.dir*14*dt}})}
 visUpdate(dt)}
function netCb(e,d){
 if(e=='code'){$('rc').textContent=d;$('rs').textContent='شارك الرقم أو الرابط مع خويّك… وانتظره ⏳';$('rsh').hidden=false}
 else if(e=='err'){$('rs').textContent=d;$('rc').textContent='';clearTimeout(netCb.h)}
 else if(e=='open'){clearTimeout(netCb.h);G.net=1;G.role=NET.role;G.pm='ol';G.sel=[];G.opp=null;toast('🎉 اتصل خويّك!');selReset()}
 else if(e=='close'){if(G.net){toast('انقطع الاتصال مع خويّك');toMenu()}}
 else if(e=='data'){
  if(d.t=='pick'){G.opp=d.c;if(G.sel.length&&G.role=='h')show('stg')}
  else if(d.t=='start'){G.pm='ol';start('ol',d.a,d.b,d.s);show(null)}
  else if(d.t=='s')G.snap=d;
  else if(d.t=='over')over(G.f[d.w]);
  else if(d.t=='again'){if(G.role=='h'&&G.f.length)go(G.stg)}
  else if(d.t=='resel'){G.pm='ol';selReset()}
  else if(d.t=='stgreq'){if(G.role=='h'){NET.send({t:'wt',m:'المضيف يختار الساحة…'});show('stg')}}
  else if(d.t=='wt')wait(d.m);
  else if(d.t=='bye'){toast('خويّك طلع من الغرفة');toMenu()}}}

// ===== الرسم =====
function tx(t,x,y,sz,col='#fff',al='center',st='#160d2e'){cx.font=`${sz}px ${FONT}`;cx.textAlign=al;cx.textBaseline='middle';cx.lineJoin='round';cx.lineWidth=sz/5;cx.strokeStyle=st;cx.strokeText(t,x,y);cx.fillStyle=col;cx.fillText(t,x,y)}
function rr(x,y,w,h,fill,line='#2a1608',lw=4){cx.fillStyle=fill;cx.strokeStyle=line;cx.lineWidth=lw;cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,8):cx.rect(x,y,w,h);cx.fill();cx.stroke()}
function drawPj(p){
 const k=p.kind,d=p.dir,gy=GY();
 if(k=='bag'){cx.fillStyle='rgba(0,0,0,.3)';cx.beginPath();cx.ellipse(p.tg,gy+6,60+(p.dl>0?0:20),14,0,0,7);cx.fill();if(p.dl>0)return}
 if(p.dl>0)return;
 cx.save();cx.translate(p.x,p.y);
 if(k=='quake'){cx.fillStyle='#c98f4a';cx.strokeStyle='#4a2c10';cx.lineWidth=5;cx.beginPath();cx.moveTo(-45*d,0);cx.lineTo(-12*d,-95);cx.lineTo(14*d,-35);cx.lineTo(40*d,-120);cx.lineTo(62*d,0);cx.closePath();cx.fill();cx.stroke()}
 else if(k=='wave'){cx.fillStyle=p.cl||'rgba(74,168,255,.85)';cx.strokeStyle='#14306b';cx.lineWidth=5;cx.beginPath();cx.moveTo(-60*d,0);cx.quadraticCurveTo(-50*d,-170,20*d,-190);cx.quadraticCurveTo(70*d,-150,50*d,-90);cx.quadraticCurveTo(80*d,-40,70*d,0);cx.closePath();cx.fill();cx.stroke()}
 else if(k=='bag'){cx.fillStyle='#b08a5a';cx.strokeStyle='#3b2610';cx.lineWidth=6;cx.beginPath();cx.ellipse(0,-50,75,70,0,0,7);cx.fill();cx.stroke();cx.fillStyle='#d9a441';cx.fillRect(-18,-125,36,22);cx.strokeRect(-18,-125,36,22);tx('$',0,-48,64,'#ffd23f')}
 else if(k=='blast'){cx.fillStyle=p.cl||'#3fdc4a';cx.strokeStyle='#fff';cx.lineWidth=4;cx.beginPath();for(let i=0;i<14;i++){const a=i*Math.PI/7,r=i%2?32:78;cx.lineTo(Math.cos(a)*r,Math.sin(a)*r*.8)}cx.closePath();cx.fill();cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,22,0,7);cx.fill()}
 else if(k=='ball'){cx.fillStyle=p.cl||'#4fe3ff';cx.strokeStyle='#fff';cx.lineWidth=4;cx.beginPath();cx.arc(0,0,26,0,7);cx.fill();cx.stroke();cx.fillStyle='rgba(255,255,255,.75)';cx.beginPath();cx.arc(-8,-8,8,0,7);cx.fill()}
 else if(k=='dust'){cx.fillStyle='rgba(168,140,104,.85)';[[0,0,40],[30,-18,30],[-28,-14,32],[10,24,28],[-24,22,26]].forEach(([x,y,r])=>{cx.beginPath();cx.arc(x+Math.sin(p.t*12+x)*3,y,r,0,7);cx.fill()})}
 else{cx.rotate(p.rot);
  if(k=='wheel'){cx.strokeStyle='#4b5563';cx.lineWidth=9;cx.beginPath();cx.arc(0,0,30,0,7);cx.stroke();cx.lineWidth=7;for(let i=0;i<3;i++){cx.rotate(2.094);cx.beginPath();cx.moveTo(0,0);cx.lineTo(28,0);cx.stroke()}cx.fillStyle='#9ca3af';cx.beginPath();cx.arc(0,0,9,0,7);cx.fill()}
  else if(k=='cracker'){rr(-8,-22,16,44,'#d62828','#5a0f0f',3);cx.fillStyle='#ffd23f';cx.fillRect(-8,-6,16,10);cx.fillStyle='#ffb703';cx.beginPath();cx.arc(0,-28,7+Math.sin(p.t*40)*2,0,7);cx.fill()}
  else if(k=='meat'){cx.fillStyle='#8b3a1a';cx.strokeStyle='#3a1a0a';cx.lineWidth=4;cx.beginPath();cx.ellipse(0,0,28,20,0,0,7);cx.fill();cx.stroke();cx.fillStyle='#fff4d6';cx.fillRect(14,-4,34,8);cx.beginPath();cx.arc(50,-5,7,0,7);cx.arc(50,5,7,0,7);cx.fill()}
  else if(k=='paper'){rr(-22,-16,44,32,'#fff4d6','#6b5a3a',3);cx.fillStyle='#d62828';cx.beginPath();cx.arc(0,0,7,0,7);cx.fill()}
  else if(k=='date'){cx.fillStyle='#5a1f12';cx.strokeStyle='#2a0d08';cx.lineWidth=3;[[0,0,16],[16,-6,13],[-14,8,13],[8,14,11]].forEach(([x,y,r])=>{cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();cx.stroke()});cx.fillStyle='rgba(255,255,255,.35)';cx.beginPath();cx.arc(-4,-5,4,0,7);cx.fill()}
  else if(k=='crate'){rr(-28,-28,56,56,'#a9743a');cx.beginPath();cx.moveTo(-28,-28);cx.lineTo(28,28);cx.moveTo(28,-28);cx.lineTo(-28,28);cx.stroke()}
  else if(k=='box'){rr(-30,-24,60,48,'#c8975a');cx.fillStyle='#f2d9a6';cx.fillRect(-6,-24,12,48)}
  else if(k=='cane')rr(-48,-5,96,10,'#7b4a22','#2a1608',3);
  else if(k=='shoe'){cx.fillStyle='#3a86ff';cx.strokeStyle='#14306b';cx.lineWidth=4;cx.beginPath();cx.ellipse(0,0,36,17,0,0,7);cx.fill();cx.stroke();cx.fillStyle='#ffd23f';cx.beginPath();cx.moveTo(-8,-6);cx.lineTo(14,0);cx.lineTo(-8,8);cx.fill()}
  else if(k=='coin'){cx.scale(Math.cos(p.t*9),1);cx.fillStyle='#ffd23f';cx.strokeStyle='#8a5a00';cx.lineWidth=4;cx.beginPath();cx.arc(0,0,22,0,7);cx.fill();cx.stroke();tx('$',0,2,24,'#8a5a00','center','#ffd23f')}
  else if(k=='wrench'){cx.fillStyle='#6b7280';cx.strokeStyle='#1f2937';cx.lineWidth=5;cx.fillRect(-55,-9,110,18);cx.strokeRect(-55,-9,110,18);cx.beginPath();cx.arc(-58,0,24,.7,5.6);cx.arc(58,0,24,3.9,2.4);cx.fill();cx.stroke()}
  else if(k=='glass'){rr(-14,-24,28,48,'rgba(200,235,255,.8)','#4a7aa8',3);cx.fillStyle='#b5651d';cx.fillRect(-11,-4,22,25)}
  else{rr(-10,-26,20,52,'#4aa8ff','#14306b',3);rr(-6,-34,12,10,'#fff','#14306b',3)}}
 cx.restore()}
function bar(x,w,y,h,p,rev,col){
 cx.fillStyle='#160d2e';cx.fillRect(x-4,y-4,w+8,h+8);cx.fillStyle='#4a3a2a';cx.fillRect(x,y,w,h);
 const ww=w*clamp(p,0,1);cx.fillStyle=col;cx.fillRect(rev?x+w-ww:x,y,ww,h);cx.strokeStyle='#fff4d6';cx.lineWidth=3;cx.strokeRect(x-4,y-4,w+8,h+8)}
function bub(x,y,t){
 cx.font='800 36px Cairo,Tahoma,sans-serif';const w=cx.measureText(t).width+44,bx=clamp(x,w/2+10,W-w/2-10);
 rr(bx-w/2,y-36,w,72,'#fff','#160d2e',5);cx.fillStyle='#fff';cx.beginPath();cx.moveTo(x-12,y+34);cx.lineTo(x+4,y+62);cx.lineTo(x+16,y+34);cx.fill();
 cx.fillStyle='#160d2e';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(t,bx,y+2)}
function hud(){
 const [a,b]=G.f;
 [[a,40,0],[b,710,1]].forEach(([f,x,r])=>{
  const p=f.hp/f.c.hp,full=f.en>=100;
  bar(x,450,28,34,p,r,p<.3?'#ff3b4a':'#ffd23f');bar(x,450,76,12,f.en/100,r,full?(Math.sin(G.sT*14)>0?'#ffd23f':'#fff'):f.en>=50?'#2ef2d0':'#1a9e8f');
  tx(f.c.n,r?x+450:x,124,40,'#fff4d6',r?'right':'left');
  if(f.en>=50)tx(full?'★':'⚡',r?x-20:x+470,82,34);
  for(let k=0;k<2;k++){cx.beginPath();cx.arc(r?678+k*34:522-k*34,112,12,0,7);cx.fillStyle=f.w>k?'#ffd23f':'rgba(0,0,0,.5)';cx.fill();cx.strokeStyle='#fff4d6';cx.lineWidth=3;cx.stroke()}
  if(f.cb>1&&f.cbt>0)tx('كومبو ×'+ar(f.cb),r?x+450:x,190,48,'#ff5d6c',r?'right':'left')});
 cx.beginPath();cx.arc(600,52,42,0,7);cx.fillStyle='#160d2e';cx.fill();cx.strokeStyle='#ffd23f';cx.lineWidth=5;cx.stroke();
 tx(ar(Math.max(0,Math.ceil(G.tm))),600,54,48,'#fff4d6');
 let m='',age=G.sT;
 if(G.st=='intro'){m=G.sT<.95?'الجولة '+ar(G.round):'قاتلوا!';age=G.sT%.95}else if(G.st=='end')m=G.endTxt;
 if(m)tx(m,600,330,130*(.6+.4*Math.min(1,age*6)),'#ffd23f','center','#e63946');
 if(G.st=='end'&&G.win){
  if(G.win.c.fr=='chef'&&IM.shw&&G.sT>.4){const k=Math.min(1,(G.sT-.4)*4),w=620*(.3+.7*k)*(1+.04*Math.sin(G.sT*8)),h=w*IM.shw.height/IM.shw.width;cx.save();cx.translate(600,215);cx.rotate(Math.sin(G.sT*6)*.03);cx.drawImage(IM.shw,-w/2,-h/2,w,h);cx.restore()}
  else if(G.sT>.7)bub(G.win.x,GY()-400,G.win.c.q)}}
function render(){
 const gy=GY(),a=G.f[0],b=G.arc=='waves'?(G.en.find(e=>!e.ko)||a):G.arc=='bomb'?a:G.f[1],dist=b===a?620:Math.abs(a.x-b.x);
 G.pz=Math.max(0,G.pz-.03);G.lead+=(clamp((a.vx+b.vx)*.05,-60,60)-G.lead)*.08;
 G.zoom+=((1+clamp((620-dist)/620,0,1)*.14+(G.slow>0?.08:0)+.05*G.pz+.03*Math.max(a.sp,b.sp))-G.zoom)*.08;
 const z=G.zoom,ox=clamp(z*((a.x+b.x)/2+G.lead)-W/2,0,W*(z-1)),oy=clamp(z*(gy-170)-H*.6,0,H*(z-1));
 cx.save();
 if(G.sh>0){cx.translate((R()-.5)*G.sh,(R()-.5)*G.sh);G.sh=Math.max(0,G.sh-1.2)}
 cx.translate(-ox,-oy);cx.scale(z,z);
 cx.drawImage(IM['s'+G.stg],0,0,W,H);
 G.pd.forEach(p=>{const D=FR.tea,f=D.spl,s=D.s*.9;cx.globalAlpha=clamp((p.life-p.t)/1,0,1);cx.drawImage(IM.tea,f[0],f[1],f[2],f[3],p.x-f[4]*s,gy+8-f[3]*s,f[2]*s,f[3]*s)});cx.globalAlpha=1;
 (G.arc=='waves'?[G.f[0],...G.en]:G.arc=='bomb'?[G.f[0]]:[...G.f]).sort((a,b)=>a.y-b.y).forEach(f=>f.draw(gy));
 if(G.arc)drawArc(gy);
 G.pj.forEach(drawPj);
 G.rg.forEach(r=>{cx.globalAlpha=1-r.a/.4;cx.strokeStyle=r.c;cx.lineWidth=8*(1-r.a/.4)+2;cx.beginPath();cx.arc(r.x,r.y,20+r.a*420,0,7);cx.stroke()});
 G.ex.forEach(e=>{const D=FR[e.fr],f=D.fx&&D.fx[Math.min(D.fx.length-1,e.a/.12|0)];if(!f)return;const s=D.s*1.5;cx.drawImage(IM[e.fr],f[0],f[1],f[2],f[3],e.x-f[2]*s/2,e.y-f[3]*s/2,f[2]*s,f[3]*s)});
 G.pa.forEach(p=>{cx.globalAlpha=1-p.a/p.l;cx.fillStyle=p.c;cx.fillRect(p.x-p.z/2,p.y-p.z/2,p.z,p.z)});cx.globalAlpha=1;
 G.fx.forEach(e=>tx(e.t,e.x,e.y-e.a*70,e.sz*(1+Math.max(0,.3-e.a)),e.col));
 cx.restore();
 const sl=Math.max(a.sp,b.sp,(a.dsh>0||a.rush>0||b.dsh>0||b.rush>0)?1:0);
 if(sl>.55){const dr=(Math.abs(a.vx)>Math.abs(b.vx)?a.vx:b.vx)>=0?1:-1,t=performance.now()/1000;cx.strokeStyle=`rgba(255,255,255,${.28*sl})`;cx.lineWidth=3;
  for(let i=0;i<12;i++){const y=(i*173+40)%H,L=160+(i*53)%220,x=((i*397+t*2200*dr)%(W+400)+W+400)%(W+400)-200;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-dr*L,y);cx.stroke()}}
 if(G.ban){const k=G.ban.a;cx.fillStyle=`rgba(10,5,30,${.5*Math.min(1,k*8)*(k>.9?(1.1-k)*5:1)})`;cx.fillRect(0,0,W,H);cx.save();cx.translate(600,400);cx.rotate(-.07);tx(G.ban.t,0,0,150*(1+.12*Math.sin(k*20)),'#ffd23f','center','#e63946');cx.restore()}
 if(G.arc)arcHud();else if(G.mode!='demo')hud()}

// ===== الواجهة =====
function show(id){G.pause=0;document.querySelectorAll('.pf').forEach(e=>e.classList.remove('pf'));document.querySelectorAll('.scr').forEach(s=>s.classList.toggle('on',s.id==id));document.body.classList.toggle('play',!id)}
function pauseT(){if(G.mode=='demo'||G.net||!document.body.classList.contains('play'))return;G.pause=G.pause?0:1;$('pause').classList.toggle('on',!!G.pause)}
function toMenu(){if(G.net||NET.p){NET.send({t:'bye'});NET.close()}G.net=0;G.role=null;G.snap=null;demo();show('menu')}
function go(s){
 if(G.pm=='arc'){startArc(G.arcG,G.sel[0],s);show(null);return}
 if(G.pm=='ol'){const a=G.sel[0],b=G.opp;NET.send({t:'start',a,b,s});start('ol',a,b,s)}
 else start(G.pm,G.sel[0],G.sel[1],s);
 show(null)}
function info(i){$('inf').innerHTML=`<b>${C[i].n}</b> — «${C[i].q}»`}
function selReset(){G.sel=[];if(G.pm=='ol')G.opp=null;$('sh').textContent=G.pm=='2p'?'اللاعب الأول: اختر مقاتلك':'اختر مقاتلك';$('inf').textContent='';show('sel')}
function wait(t){$('wt').textContent=t;show('wait')}
function sndLabel(){document.querySelectorAll('[data-a=snd]').forEach(b=>b.textContent='🔊 الصوت: '+(SFX.on?'شغّال':'مقفل'))}
function toggleSnd(){SFX.toggle();sndLabel();SFX.play('ui')}
function roomLink(){return location.href.split('?')[0].split('#')[0]+'?room='+NET.code}
function joinRoom(code){
 if(!/^\d{4}$/.test(code)){$('rs').textContent='اكتب رقم الغرفة (٤ أرقام)';return}
 $('rs').textContent='جاري الدخول للغرفة…';NET.join(code,netCb);
 clearTimeout(netCb.h);netCb.h=setTimeout(()=>{if(!G.net){NET.close();$('rs').textContent='ما قدرنا نتصل… تأكد من الرقم والإنترنت'}},12000)}
function buildUI(){
 const sb=(e,v)=>`<span>${e}<i style="width:${clamp(v,.15,1)*100}%"></i></span>`;
 C.forEach((c,i)=>{
  const d=document.createElement('div');d.className='cd';d.tabIndex=0;
  d.innerHTML=`<canvas width="160" height="200"></canvas><b>${c.n}</b><small>${c.t}</small><div class="st">${sb('💪',c.dmg/12)}${sb('⚡',c.spd/420)}${sb('❤',c.hp/130)}</div>`;
  const f=FR[c.fr].idle[0],k=Math.min(160/f[2],196/f[3]);
  d.querySelector('canvas').getContext('2d').drawImage(IM[c.fr],f[0],f[1],f[2],f[3],(160-f[2]*k)/2,198-f[3]*k,f[2]*k,f[3]*k);
  const pk=()=>{info(i);if(G.sel.length>1||(G.pm=='ol'&&G.sel.length))return;G.sel.push(i);
   if(G.pm=='ol'){NET.send({t:'pick',c:i});if(G.role=='h')G.opp!=null?show('stg'):wait('بانتظار خويّك يختار مقاتله…');else wait('بانتظار المضيف يختار الساحة…');return}
   if(G.pm=='2p'&&G.sel.length==1){$('sh').textContent='اللاعب الثاني: اختر مقاتلك';return}
   if(G.pm!='2p')G.sel[1]=R()*C.length|0;
   show('stg')};
  d.onclick=pk;d.onpointerenter=()=>info(i);d.onkeydown=e=>{if(e.key=='Enter')pk()};
  $('gr').appendChild(d)});
 $('sg').innerHTML=ST.map((s,i)=>`<button class="sg" data-a="stage" data-i="${i}" style="background-image:url(assets/stages/${s.id}.jpg)"><span>${s.n}</span></button>`).join('')+'<button class="sg" data-a="rnd" style="background:var(--red)"><span style="font-size:34px;background:none">🎲 عشوائي</span></button>';
 $('ui').addEventListener('click',e=>{
  const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a;SFX.init();SFX.play('ui');
  if(arcUI(a,t))return;
  if(a=='1p'||a=='2p'){G.pm=a;selReset()}
  else if(a=='lv'){G.lv=G.lv%3+1;t.textContent='🔥 الصعوبة: '+['','سهل','عادي','صعب'][G.lv]}
  else if(a=='how')show('how');
  else if(a=='back')show('menu');
  else if(a=='rsel'){if(G.net)NET.send({t:'resel'});selReset()}
  else if(a=='stage')go(+t.dataset.i);
  else if(a=='rnd')go(R()*ST.length|0);
  else if(a=='resume')pauseT();
  else if(a=='again'){if(G.role=='g')NET.send({t:'again'});else go(G.stg)}
  else if(a=='stg'){if(G.role=='g'){NET.send({t:'stgreq'});wait('بانتظار المضيف يختار الساحة…')}else{if(G.net)NET.send({t:'wt',m:'المضيف يختار الساحة…'});show('stg')}}
  else if(a=='quit')toMenu();
  else if(a=='snd')toggleSnd();
  else if(a=='room'){$('rs').textContent='أنشئ غرفة أو ادخل برقم غرفة خويّك';$('rc').textContent='';$('rsh').hidden=true;show('room')}
  else if(a=='mk'){$('rc').textContent='…';$('rs').textContent='جاري إنشاء الغرفة…';NET.host(netCb)}
  else if(a=='jn')joinRoom($('rin').value.trim());
  else if(a=='rback'){NET.close();show('menu')}
  else if(a=='cp'&&NET.code)(navigator.clipboard?navigator.clipboard.writeText(roomLink()):Promise.reject()).then(()=>toast('تم نسخ الرابط ✅'),()=>toast('الرابط: '+roomLink()));
  else if(a=='shr'&&NET.code){navigator.share?navigator.share({title:'حرب الحارة',text:'تعال نتقاتل! رقم الغرفة: '+NET.code,url:roomLink()}).catch(()=>0):$('rsh').querySelector('[data-a=cp]').click()}});
 let n=0;const tg=$('tag'),sw=()=>{tg.textContent=TAGS[n++%TAGS.length]};sw();setInterval(sw,3300);sndLabel();arcInit()}

let last=0,fc=0;
function loop(ts){
 const dt=Math.min(.05,(ts-last)/1000||0);last=ts;fc++;
 readPads();navPad();
 if(G.role=='g'){
  if(NET.open()&&G.st!='menu')NET.send({t:'i',k:inp(0)});
  guestStep(dt)}
 else if(!G.pause){let sc=1;if(G.slow>0){sc=.35;G.slow-=dt}tick(dt*sc)}
 if(G.role=='h'&&NET.open()&&fc%2==0)NET.send(snap());
 render();PR.clear();requestAnimationFrame(loop)}
(async()=>{
 const fonts=document.fonts?Promise.race([document.fonts.load('40px Lalezar'),new Promise(r=>setTimeout(r,1500))]).catch(()=>0):0;
 ldt=Object.keys(FR).length+ST.length+1;
 await Promise.all([fonts,ld('assets/shawarma.png').then(i=>{IM.shw=i}),...Object.keys(FR).map(async k=>{IM[k]=await ld(FR[k].img)}),...ST.map(async(s,i)=>{IM['s'+i]=await ld(`assets/stages/${s.id}.jpg`)})]);
 buildUI();demo();show('menu');$('ld').remove();requestAnimationFrame(loop);
 const rp=new URLSearchParams(location.search).get('room');
 if(/^\d{4}$/.test(rp||'')){show('room');$('rin').value=rp;joinRoom(rp)}})();
