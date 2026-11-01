'use strict';
/* مؤثرات صوتية مولّدة بالكود (WebAudio) — بدون موسيقى وبدون ملفات صوت */
const SFX=(()=>{
 let ac=null,mg,nb,on=true;
 try{on=localStorage.getItem('hw_snd')!=='0'}catch(e){}
 const init=()=>{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  if(!ac){
   ac=new AC();mg=ac.createGain();mg.gain.value=.55;mg.connect(ac.destination);
   nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
   const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  if(ac.state=='suspended')ac.resume()};
 const tone=(f,d,type='square',v=.3,to=f)=>{
  const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g);g.connect(mg);o.start(t);o.stop(t+d+.02)};
 const nz=(d,v,f1,f2=f1,type='lowpass')=>{
  const t=ac.currentTime,s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=nb;fl.type=type;fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  s.connect(fl);fl.connect(g);g.connect(mg);s.start(t);s.stop(t+d+.02)};
 const later=(f,ms)=>setTimeout(()=>{if(on&&ac)try{f()}catch(e){}},ms);
 const S={
  hit:()=>{nz(.12,.6,2200,300);tone(160,.12,'square',.35,50)},
  heavy:()=>{nz(.28,.8,1200,80);tone(110,.35,'sawtooth',.5,30)},
  block:()=>{tone(1300,.09,'square',.18,700);nz(.06,.3,6000,3000,'highpass')},
  swing:()=>nz(.13,.25,500,2200,'bandpass'),
  jump:()=>tone(240,.13,'sine',.25,560),
  land:()=>nz(.1,.3,500,120),
  dash:()=>nz(.2,.35,3000,500,'bandpass'),
  ko:()=>{tone(320,.7,'sawtooth',.4,35);nz(.6,.7,800,50)},
  ui:()=>tone(700,.06,'square',.13,900),
  go:()=>{tone(520,.12,'square',.2);later(()=>tone(780,.25,'square',.2),110)},
  sp:()=>{tone(200,.25,'sawtooth',.25,900);nz(.2,.2,800,3000,'bandpass')},
  super:()=>{tone(120,.7,'sawtooth',.45,1100);tone(60,.8,'square',.3,200);nz(.6,.4,500,4000,'bandpass')},
  glass:()=>{tone(2600,.09,'triangle',.25,1800);nz(.18,.3,7000,4000,'highpass')},
  coin:()=>{tone(1500,.05,'square',.18);later(()=>tone(2000,.14,'square',.18),50)},
  splash:()=>nz(.3,.35,2000,500,'bandpass'),
  thud:()=>{tone(90,.15,'sine',.4,40);nz(.08,.3,300,100)},
  boom:()=>{tone(70,.6,'sine',.6,25);nz(.5,.7,400,40)}
 };
 return{
  init,
  play(n){if(!on||!ac||!S[n])return;try{if(ac.state=='suspended')ac.resume();S[n]()}catch(e){}},
  get on(){return on},
  toggle(){on=!on;try{localStorage.setItem('hw_snd',on?'1':'0')}catch(e){}return on}}
})();
