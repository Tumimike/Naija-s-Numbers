// ============================================================
//  NAIJA'S NUMBERS: GAME + GO-SLOW BACKGROUND
//  Questions live in questions.js. Wording you might change is in COPY just below.
// ============================================================
(()=>{
// =====================================================================
//  WORDING: every on-screen line you might want to change
// =====================================================================
const COPY={
  start:"Take today's journey",
  lockIn:"Lock in",
  pressOn:"Press on →",
  questionOf:(n,total)=>`QUESTION ${n} OF ${total}`,
  hint:unit=>`Hint: in ${unit}. Type 75k, 2.5m or the full number.`,
  unreadable:"Couldn't read that. Try 75000, 75k or 75,000.",
  noGuess:"No guess",
  timedOut:"Time ran out with no guess",
  sourceLabel:"Source",
  summaryTitle:"TODAY'S JOURNEY",
  summaryTap:"Tap a round to see the answer and where the number came from.",
  reached:(place,area)=>`You got as far as <span>${place}</span>, ${area}.`,
  share:"Share score",
  copied:"Copied! Paste it in the group chat.",
  nextIn:"Next journey in",
  continueBtn:"Continue today's journey",
  statsLine:(played,streak,best)=>`Played ${played} · Streak ${streak} · Best ${best}`,
};
// ===================== GAME SETTINGS (scoring and timer rules: do not change without asking) =====================
const SECONDS=18;
const TIME_TIERS=[{s:10,p:30},{s:8,p:25},{s:5,p:20}];
const BANDS=[
  {id:'d',emoji:'💎',within:.01,pts:350,label:'Within 1%',col:'#9fe8ff',mult:1.1,test:.006},
  {id:'g',emoji:'🎯',within:.025,pts:250,label:'Within 2.5%',col:'#ff5a5f',mult:1.1,test:.02},
  {id:'c',emoji:'🟩',within:.05,pts:150,label:'Within 5%',col:'#3ccf6e',mult:1.1,test:.04},
  {id:'t',emoji:'🟨',within:.10,pts:100,label:'Within 10%',col:'#f2d23c',mult:1.2,test:.08},
  {id:'q',emoji:'🟧',within:.25,pts:75,label:'Within 25%',col:'#f08a2c',mult:1.2,test:.2},
  {id:'f',emoji:'🟫',within:.40,pts:50,label:'Within 40%',col:'#9a6538',mult:1.2,test:.35},
];
const DOUBLE={id:'h',emoji:'🟥',pts:20,label:'Half to double',col:'#d93636',mult:1.2,test:.75};
const MISS={id:'m',emoji:'⬛',pts:0,label:'Miss',col:'#3a3d4a',mult:0,test:4};
const ALL=[...BANDS,DOUBLE,MISS];
// Which vehicle you land on. Within 10% is always a rare ride.
// Top tier (within 10% to 1%): rare rides, with a Porsche 911 in every pool; McLaren, Tesla and Ducati in the lower top bands.
// Mid tier (within 25%): everyday cars. Low tier (within 40%, half to double): kekes and danfos. Miss: okada.
const ODDS={d:{chiron:.6,porsche:.4},g:{gwagon:.35,mclaren:.35,porsche:.3},c:{cruiser:.35,tesla:.25,ducati:.2,porsche:.2},t:{prado:.4,tesla:.2,ducati:.2,porsche:.2},
  q:{suzuki:.25,prius:.2,sedan:.2,rav4:.15,hilux:.2},f:{danfo:.5,keke:.5},h:{keke:.6,danfo:.4},m:{okada:1}};
const PX_PER_POINT=3.3;      // camera travel per point, before the band multiplier
const UNIT={hundreds:100,thousands:1e3,millions:1e6,billions:1e9};
const SUF={h:100,hundred:100,hundreds:100,k:1e3,thousand:1e3,thousands:1e3,m:1e6,mil:1e6,mill:1e6,million:1e6,millions:1e6,b:1e9,bn:1e9,billion:1e9,billions:1e9};
function parseGuess(raw,unit){const s=raw.toLowerCase().replace(/[₦,\s]/g,'');const m=s.match(/^(\d+(?:\.\d+)?|\.\d+)([a-z]*)$/);if(!m)return null;
  const n=parseFloat(m[1]);if(m[2]){if(!(m[2]in SUF))return null;return Math.round(n*SUF[m[2]])}const z=UNIT[unit]||1;return Math.round(n<z?n*z:n)}
function scoreGuess(g,a){if(!g||g<=0)return MISS;const off=Math.abs(g-a)/a;for(const b of BANDS)if(off<=b.within)return b;return Math.max(g,a)/Math.min(g,a)<=2?DOUBLE:MISS}

// ===================== PIXEL HELPERS =====================
const $=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
function pick(o){let tot=0;for(const k in o)tot+=o[k];let r=Math.random()*tot,k;for(k in o){r-=o[k];if(r<=0)return k}return k}
const cc={};const hx=h=>cc[h]||(cc[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
function mix(cols,ws){let r=0,g=0,b=0;cols.forEach((c,i)=>{const v=hx(c);r+=v[0]*ws[i];g+=v[1]*ws[i];b+=v[2]*ws[i]});return`rgb(${r|0},${g|0},${b|0})`}
function lc(a,b,t){return mix([a,b],[1-t,t])}
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}

// 3x5 pixel font for signs
const FONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
  0:'111101101101111',1:'010110010010111',2:'110001010100111',3:'110001010001110',4:'101101111001001',5:'111100110001110',6:'011100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001110','-':'000000111000000','.':'000000000000010',"'":'010010000000000'};
const textW=s=>s.length*4-1;
function text(R,x,y,s,c){for(const ch of s){const g=FONT[ch];if(g)for(let i=0;i<15;i++)if(g[i]==='1')R(x+i%3,y+(i/3|0),1,1,c);x+=4}}

// Sprite buffer used for vehicles (allows outlines and shading passes)
function Spr(w,h,ty=0){const a=new Array(w*h).fill(null);const s={w,h,a,ty,
  set(x,y,c){x=Math.floor(x);y=Math.floor(y+s.ty);if(x>=0&&y>=0&&x<w&&y<h)a[y*w+x]=c},
  get(x,y){x=Math.floor(x);y=Math.floor(y+s.ty);return(x>=0&&y>=0&&x<w&&y<h)?a[y*w+x]:null},
  rect(x,y,ww,hh,c){for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)s.set(x+i,y+j,c)},
  poly(pts,c){let y0=1e9,y1=-1e9;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
    for(let y=Math.floor(y0);y<Math.ceil(y1);y++){const yc=y+.5,xs=[];
      for(let i=0;i<pts.length;i++){const[p,q]=pts[i],[r,t]=pts[(i+1)%pts.length];if((q<=yc&&t>yc)||(t<=yc&&q>yc))xs.push(p+(yc-q)*(r-p)/(t-q))}
      xs.sort((m,n)=>m-n);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<Math.round(xs[k+1]);x++){const col=typeof c==='function'?c(x,y):c;if(col)s.set(x,y,col)}}},
  circ(cx,cy,r,c){for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if((x+.5-cx)**2+(y+.5-cy)**2<=r*r){const col=typeof c==='function'?c(x,y):c;if(col)s.set(x,y,col)}},
  line(x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2+1;for(let i=0;i<=n;i++)s.set(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c)},
  top(map){for(let x=0;x<w;x++)for(let y=0;y<h;y++){const v=a[y*w+x];if(v){if(map[v])a[y*w+x]=map[v];break}}},
};return s}
function bake(s,outline='#0a0b12'){const W=s.w+2,H=s.h+2,c=canvas(W,H),g=c.getContext('2d');const at=(x,y)=>(x>=0&&y>=0&&x<s.w&&y<s.h)?s.a[y*s.w+x]:null;
  for(let y=-1;y<=s.h;y++)for(let x=-1;x<=s.w;x++){const v=at(x,y);if(v){g.fillStyle=v;g.fillRect(x+1,y+1,1,1)}else if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){g.fillStyle=outline;g.fillRect(x+1,y+1,1,1)}}
  return c}
function tinted(src,tint,after){const c=canvas(src.width,src.height),g=c.getContext('2d');g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=tint;g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';if(after)after(g);return c}

// ===================== VEHICLES =====================
const TYRE='#141418',SKIN='#5a3a26',SKIN2='#7a4e32';
function wheel(s,cx,cy,r,rim='#b9c2cc',style='five'){s.circ(cx,cy,r,TYRE);
  if(style==='black'){s.circ(cx,cy,r-1.5,'#1f1f24');s.circ(cx,cy,1.1,'#2b2b31');return}
  if(style==='spoke'){s.circ(cx,cy,r-1.2,'#2a2e36');for(let a=0;a<8;a++){const an=a*Math.PI/4;s.line(cx-.5,cy-.5,cx-.5+Math.cos(an)*(r-1.6),cy-.5+Math.sin(an)*(r-1.6),'#8d939c')}s.circ(cx,cy,1,'#c0c4ca');return}
  s.circ(cx,cy,r-1.3,rim);const dark='#3a404a';
  if(style==='x'){s.line(cx-.5-(r-2),cy-.5-(r-2),cx-.5+(r-2),cy-.5+(r-2),dark);s.line(cx-.5-(r-2),cy-.5+(r-2),cx-.5+(r-2),cy-.5-(r-2),dark);s.circ(cx,cy,r-1.3,(x,y)=>((x+.5-cx)**2+(y+.5-cy)**2>(r-2)**2)?'#8fa6c0':null)}
  else if(style==='five'){for(let a=0;a<5;a++){const an=a*Math.PI*2/5-1.26;s.set(cx-.5+Math.cos(an)*(r-2.4),cy-.5+Math.sin(an)*(r-2.4),dark)}}
  s.circ(cx,cy,1.05,'#4a515c')}
function people(s,list){for(const p of list){s.rect(p.x,p.y,3,3,p.skin||SKIN);s.rect(p.x,p.y,3,1,p.hair||'#151010');if(p.shirt)s.rect(p.x-1,p.y+3,5,p.h||4,p.shirt)}}

const VDEF={
chiron:{name:'Bugatti Chiron',tier:'Legendary',variants:1,make(){
  // traced from the user's reference (mirrored to face right): the silver C-curve wraps the door and runs
  // forward along the sill; door and front are light blue, the rear and the band under the door dark blue
  const s=Spr(62,15);
  const C=[[1,19],[5,17.3],[9,18.1],[10.8,19.8],[11.4,21.4]];
  const cl=y=>{if(y<=C[0][0])return C[0][1];for(let i=1;i<C.length;i++)if(y<=C[i][0]){const[a,b]=C[i-1],[c,d]=C[i];return b+(d-b)*(y-a)/(c-a)}return C[C.length-1][1]};
  const SILL=11.6;
  const body=(x,y)=>{const X=x+.5,Y=y+.5,c=cl(Math.min(Y,11.3));
    if(Y<11.3&&Math.abs(X-c)<.8)return'#c9dcf2';if(Y>=11.1&&Y<12.1&&X>c-.5&&X<46)return'#c9dcf2';
    const light=X>c&&(Y<SILL||X>=47);if(!light)return Y>=11?'#0a2a55':Y<=2.5?'#2f63a8':'#0f3b78';
    if(Y<=3)return'#5fb0f2';return Y>=8.5?'#2a7ed4':'#3592e6'};
  s.poly([[1.4,13.2],[1.8,5.5],[4.2,4.8],[9.5,3.4],[18,1.2],[22.2,.2],[35.5,.4],[41.9,3.2],[50,4.8],[59.8,6.6],[61.5,8.4],[61.5,12.4],[59,13.2]],body);
  s.top({'#3592e6':'#7cc2f6','#0f3b78':'#3a70b4','#5fb0f2':'#8fcaf8'});
  s.poly([[41.6,6.9],[35.7,1.1],[20.4,.6],[18.6,6.9]],'#132544');
  s.poly([[40.2,6.2],[35.2,1.8],[27.6,1.5],[26.4,6.2]],'#d3d8de');s.rect(28,1.6,6,.8,'#a6b2c0');
  s.poly([[25.6,6.2],[26.8,1.5],[21.2,1.4],[19.8,6.2]],'#1a4682');
  s.line(40.6,7,42.2,11,'#1f66b8');s.rect(35,8,2.4,.7,'#cfe0f2');
  s.rect(59.8,7.6,1.6,.9,'#eef6ff');s.rect(58.6,8.6,2.6,.7,'#16345e');s.rect(58.8,11.2,2.6,1.4,'#0b1a30');s.rect(1.8,5.4,1,1.4,'#ff3344');s.rect(1.4,11.6,5,1.6,'#0b1a30');
  for(const wx of[11.3,51.2]){s.circ(wx,10.9,4.9,'#071022');s.circ(wx,10.9,4.1,TYRE);s.circ(wx,10.9,3.2,'#c8d8e8');s.circ(wx,10.9,2.6,'#9db4cc');
    s.line(wx-.5-2.1,10.4-2.1,wx-.5+2.1,10.4+2.1,'#1e2a38');s.line(wx-.5-2.1,10.4+2.1,wx-.5+2.1,10.4-2.1,'#1e2a38');s.set(wx-.5,10.4,'#4a5a6e')}
  return{s,head:[60.6,8],tail:[1.8,6]}}},
gwagon:{name:'G-Wagon',tier:'Epic',variants:1,make(){
  const s=Spr(48,24),B='#17181c',H='#33353c',D='#0b0b0e',G='#5f7384';
  s.poly([[1,10],[2,3.6],[4,2.2],[30.5,2.2],[32.6,3],[35.4,8.8],[45.4,9.6],[46.6,11],[46.6,17.2],[45,19],[2,19],[1,17]],B);
  s.top({[B]:H});s.rect(6,1,23,1,'#1a1a1f');
  s.rect(5,4,9,4.6,G);s.rect(16,4,8,4.6,G);s.poly([[25.6,4],[31,4],[33.4,8.6],[25.6,8.6]],G);s.rect(5,4,4,1,'#a9bccb');s.rect(16,4,3,1,'#a9bccb');s.rect(26,4,3,1,'#a9bccb');
  s.rect(15,9,1,9,D);s.rect(24.6,9,1,9,D);s.rect(34,9.5,1,8.5,D);
  s.rect(2,13,44,1.6,'#160d13');s.rect(17,10.4,2,1,'#c0c0c8');s.rect(27,10.4,2,1,'#c0c0c8');
  s.rect(40.5,8.8,3,1,'#ff8a1a');s.rect(45.4,10.4,1.4,2,'#f2f2ea');s.rect(1,10,1.6,3,'#c4202c');s.rect(0,6,2,9,'#0e0e10');s.rect(0,8,2,5,'#2a2b30');s.rect(33.6,6.8,2,1.6,D);
  s.circ(10,19.4,5.7,'#0a0a0c');s.circ(38,19.4,5.7,'#0a0a0c');s.rect(15,19,18,1.4,'#26262b');
  wheel(s,10,19.4,4.6,'#9aa2ad');wheel(s,38,19.4,4.6,'#9aa2ad');
  return{s,head:[46.5,10.8],tail:[1,10.8]}}},
prado:{name:'Prado',tier:'Rare',variants:1,make(){
  const s=Spr(50,22),B='#23272e',H='#454c57',G='#3b4f60';
  s.poly([[1,15.4],[1.6,9],[3,4.2],[6,2.2],[30,2],[34,3.4],[38.4,8],[47,9.2],[48.6,11],[48.6,15.4],[47,17.4],[2,17.4]],B);
  s.top({[B]:H});s.poly([[5,3.6],[29.6,3.4],[33.2,8],[5,8]],G);s.rect(13,3.4,1.6,4.8,B);s.rect(22,3.4,1.6,4.8,B);s.rect(6,3.6,5,1,'#6f8aa0');
  s.rect(1,14.4,48,3,'#121418');s.rect(2,11,46,1,H);s.rect(47.4,10.4,1.4,1.6,'#e8eef4');s.rect(1,9.4,1.6,2,'#b81c28');s.rect(0,7,2,7,'#16181c');
  s.circ(10,17.4,5.7,'#0e1013');s.circ(39,17.4,5.7,'#0e1013');wheel(s,10,17.4,4.6,'#c4cbd3');wheel(s,39,17.4,4.6,'#c4cbd3');
  return{s,head:[48.4,10.8],tail:[1,10]}}},
cruiser:{name:'Land Cruiser',tier:'Rare',variants:1,make(){
  const s=Spr(52,23),W='#eeece6',Wd='#c9c6bc',G='#2c3640';
  s.poly([[1,16],[1,9],[2,3.6],[4.6,2],[32,1.8],[35.6,3],[39.6,8.6],[49.6,9.6],[51,11.2],[51,16],[49.6,18],[2,18]],W);
  s.top({[W]:'#ffffff'});s.rect(6,1,24,1,'#9aa0a6');
  s.rect(4,3.6,9,4.8,G);s.rect(14.6,3.6,9,4.8,G);s.poly([[25,3.6],[33,3.4],[36.8,8.4],[25,8.4]],G);s.rect(5,3.6,4,1,'#5d6d7a');s.rect(26,3.6,4,1,'#5d6d7a');
  s.rect(1,12,50,1,'#c7cdd4');s.rect(1,15.6,50,2.4,'#5a5e64');s.rect(14,9,1,7,Wd);s.rect(24.5,9,1,7,Wd);s.rect(1,9,50,.9,Wd);
  s.rect(49.6,10.4,1.6,2,'#f4f8ff');s.rect(1,10,1.6,2.4,'#c4202c');
  s.circ(11,18.2,5.8,'#3a3d42');s.circ(41,18.2,5.8,'#3a3d42');wheel(s,11,18.2,4.8,'#c9cfd6');wheel(s,41,18.2,4.8,'#c9cfd6');
  return{s,head:[51,11],tail:[1,11]}}},
hilux:{name:'Hilux',tier:'Uncommon',variants:8,make(v){
  // v: 0-2 white (empty, sacks, jerrycans) · 3-5 black (empty, sacks, jerrycans) · 6-7 police
  const police=v>=6,white=!police&&v<3,load=police?'police':['empty','sacks','cans'][v%3];
  const B=white?'#eef1f4':'#202328',Sh=white?'#c4cad1':'#141619',Hl=white?'#ffffff':'#3e444c',G='#33465a';
  const s=Spr(56,25,4);
  s.poly([[1,16.5],[1,9],[22,9],[22,3],[24,1.6],[36,1.6],[40,7.6],[52,8.4],[54.6,10],[54.6,14.6],[53,16.5]],B);
  s.top({[B]:Hl});s.rect(1,9,21,1,Hl);s.rect(1,9,1.2,7.5,Sh);s.rect(21,9,1,7,Sh);
  s.rect(24,3,6.4,4.6,G);s.poly([[31.6,3],[35.6,3],[38.8,7.6],[31.6,7.6]],G);s.rect(24,3,3,1,'#5d7488');
  s.rect(30.8,8.6,1,7,Sh);s.rect(39.8,8.6,1,7,Sh);s.rect(2,13.6,52,1,Sh);
  s.rect(53,13,2,2,'#a5acb4');s.rect(53.6,10,1.2,1.6,'#f4f6f8');s.rect(1,10,1.2,2,'#c4202c');
  if(load==='sacks'){for(const[x,y,w]of[[2,4.6,7],[9,4,7],[15.4,5,6],[5,1,7],[12,1.4,6]]){s.rect(x,y,w,4.4,'#d2bd8c');s.rect(x,y+2,w,1,'#a8925f');s.rect(x+w-1,y,1,4.4,'#b8a271')}}
  if(load==='cans'){for(let i=0;i<4;i++){s.rect(2.4+i*4.8,3.6,4,5.4,i%2?'#e8c31c':'#3d7fd1');s.rect(3.4+i*4.8,2.6,2,1,'#222')}s.rect(4,0,10,3.6,'#2f6fb0');s.rect(4,0,10,1,'#4a8ad0')}
  if(load==='police'){s.rect(26,0,4,1.6,'#e02a2a');s.rect(30,0,4,1.6,'#2a5ae0');
    text((x,y,w,h,c)=>s.rect(x,y,w,h,c),16.5,9.4,'POLICE','#f4f4f4');s.rect(16,15.2,22,.9,'#2a5ae0');
}
  s.circ(10,16.6,5.3,'#101114');s.circ(45,16.6,5.3,'#101114');wheel(s,10,16.6,4.4);wheel(s,45,16.6,4.4);
  return{s,head:[54.5,10.6+4],tail:[1,10.6+4],bar:police?[[28,5,'#ff3030'],[32,5,'#3a6aff']]:null}}},
danfo:{name:'Danfo',tier:'Common',variants:3,make(v){
  // v: 0 closed · 1 conductor hanging out · 2 roof rack with luggage
  const s=Spr(46,26,3),Y='#f4b400',Yd='#c98a00',Ys='#ffd04a',G='#2d3f4f',r=rng(40+v);
  s.poly([[.6,17],[1,3],[2.6,1.2],[40.4,1.2],[42.4,2],[45,8],[45.6,9.2],[45.6,17],[44,18.6],[1.6,18.6]],Y);
  s.top({[Y]:Ys});
  s.poly([[40,2.6],[42,2.6],[44.2,8],[40,8]],G);s.rect(33,2.6,6,5.4,G);s.rect(20,2.6,11.4,5.4,G);s.rect(7,2.6,11.4,5.4,G);s.rect(2,2.6,3.6,5.4,G);
  for(const x of[33,20,7])s.rect(x,2.6,4,1,'#5f7f96');
  for(const x of[8.4,12.4,16,21.4,25.4,29])if(r()<.75)s.rect(x,5,2.2,3,r()<.5?'#2a1a12':'#3b2416');
  s.rect(.6,11,45,1.4,'#141414');s.rect(.6,13.8,45,1.4,'#141414');
  s.rect(19,9,.9,9.6,Yd);s.rect(32.2,9,.9,9.6,Yd);
  for(let i=0;i<5;i++)s.rect(2+r()*40,9+r()*8,1,1,Yd);
  if(v===1){s.rect(20,2.6,12,16,'#2a1f10');people(s,[{x:25,y:4,shirt:'#c43c3c',h:6}]);s.rect(28,8,3,1,SKIN);s.rect(24.6,13,1.4,5.6,'#2b3f6b');s.rect(26.4,13,1.4,5.6,'#2b3f6b');s.rect(20,12,12,.6,'#888')}
  if(v===2){s.rect(5,0,32,.8,'#555');for(const x of[6,20,35])s.rect(x,0,1,1.4,'#555');s.rect(7,-2.4,9,2.6,'#7b3fa0');s.rect(17,-3,7,3.2,'#c8b07a');s.rect(25,-2,9,2.2,'#2f8a5a');s.rect(7,-1.4,9,.6,'#5a2a78')}
  s.rect(43.6,15.6,2.4,2.4,'#151515');s.rect(0,15.6,2.4,2.4,'#151515');s.rect(44.8,10,1,2,'#f5f1d8');s.rect(.6,10,1,2.6,'#b01818');
  s.circ(9,18.7,5,'#3a2c00');s.circ(37,18.7,5,'#3a2c00');wheel(s,9,18.7,4.3,'#1f1f24','black');wheel(s,37,18.7,4.3,'#1f1f24','black');
  return{s,head:[45.2,11+3],tail:[1,11+3]}}},
keke:{name:'Keke',tier:'Common',variants:2,make(v){
  const s=Spr(30,22),Y='#f2c200',Yd='#c79a00',G='#1f8a4c',K='#1c1c1f';
  s.poly([[2,2.6],[3,1],[24,.8],[26.6,1.8],[28.6,5],[27,5.2],[25,2.6]],K);s.rect(3,1,20,.8,'#3a3a40');
  s.rect(1,2.6,3,9,K);s.rect(1,6,3,2,Y);s.rect(23.4,2.6,1,8.6,K);
  s.poly([[25,2.6],[26.8,2.6],[28.8,9],[27,9]],'#6f8fa4');
  people(s,[{x:20,y:3.6,shirt:v?'#2f6fb0':'#e2683a',h:4.4},{x:7,y:5,shirt:'#c43c3c',h:4},{x:12,y:4.6,shirt:'#e8e8e8',h:4.4,hair:'#7b3fa0'}]);
  s.rect(23,7.6,3,1,SKIN);
  s.poly([[1,11],[22,11],[24,13],[24,17],[1,17]],Y);s.poly([[24.6,9],[29,9],[29.6,13],[28.4,17],[24,17],[23.2,12]],Y);
  s.rect(1,13,28.6,1.4,G);s.rect(1,11,22,.8,'#ffd84a');s.rect(29,10,1,1.6,'#f4f4f0');s.rect(1,12,1,1.4,'#b01818');s.rect(1,16,23,1,Yd);
  wheel(s,7,18.2,3.8,'#a8adb3','plain');wheel(s,26,18.5,3.5,'#a8adb3','plain');
  return{s,head:[29.4,10.6],tail:[1,12.4]}}},
okada:{name:'Okada',tier:'Common',variants:2,make(v){
  const s=Spr(27,23),R1=v?'#2a5ab8':'#c22a22',R2=v?'#3d76d6':'#d93a2a';
  wheel(s,5,18.5,4.5,'#9aa0a8','spoke');wheel(s,22,18.5,4.5,'#9aa0a8','spoke');
  s.rect(3,15.4,9,1.2,'#a8adb3');s.rect(11,15,6,3,'#4a4d55');
  s.poly([[8,13],[19,12],[21,14],[17,16],[9,16]],R1);s.poly([[13,11],[18,10.6],[19.6,12.6],[13,13]],R2);
  s.poly([[3,12.2],[14,11.6],[14,13],[4,13.6]],'#1e1e22');s.line(19.4,9,22,18,'#8a8f96');s.rect(17,8.6,3,1,'#222');s.rect(20.6,9.6,1.6,1.6,'#f4f4f0');
  s.poly([[1.6,13],[4,12.4],[6,14],[2,14.6]],R1);
  s.rect(14,.6,3.6,3.4,SKIN);s.rect(13.6,.2,4.4,1.6,v?'#d8d8d8':'#141414');
  s.poly([[12.6,4],[17,4],[17.6,10.2],[12,10.6]],v?'#16a34a':'#ff7a1a');s.rect(13,6,4.4,1,'#f4f080');
  s.line(16,5,19.2,8.6,SKIN);s.rect(13,10,5,2,'#2b3f6b');s.rect(17,12,1.4,4,'#2b3f6b');s.rect(17,15.6,2,1,'#111');
  s.rect(7,1.6,3.6,3.4,SKIN2);s.rect(6.4,.6,4.8,1.8,'#7b3fa0');s.poly([[6,5],[10.6,5],[11,11],[5.6,11.4]],v?'#e8c31c':'#3a7d44');
  s.rect(5.6,11.2,4,2,'#3a7d44');s.rect(8.6,13,1.4,3.4,SKIN2);
  return{s,head:[22,10.4],tail:[1.6,13.2]}}},
};
// ---- everyday traffic (never handed out as a reward) ----
const PAINT=[['#b8bec6','#dde2e8','#8f969e'],['#1e2026','#3d4048','#121318'],['#eceff2','#ffffff','#c2c7cd'],['#b8262a','#d9474a','#861a1d'],['#2a4f9a','#4b74c0','#1d3870'],['#2f7a4f','#4c9a6c','#215838'],['#c9b48a','#e2d0a8','#a08c64']];
function paint(v){return PAINT[v%PAINT.length]}
Object.assign(VDEF,{
sedan:{name:'Corolla',tier:'Uncommon',variants:8,make(v){
  const taxi=v===7,[B,H,D]=taxi?['#f2c200','#ffd84a','#c79a00']:paint(v),G='#3a4b5c',s=Spr(46,17);
  s.poly([[1,13],[1,8.6],[4,7.6],[12,7],[16,3.2],[19,2],[30,2],[34,3.6],[38,7],[44,8],[45.4,9.6],[45.4,13],[44,14.4],[2,14.4]],B);s.top({[B]:H});
  s.poly([[17,3.6],[19.6,3],[24.6,3],[24.6,6.8],[14.8,6.8]],G);s.poly([[26,3],[29.6,3],[33.6,6.8],[26,6.8]],G);s.rect(19,3,3,1,'#6f8396');
  s.rect(1,12.4,45,2,D);s.rect(25.2,7.4,.8,5,D);s.rect(28,8.6,2,.8,'#d0d4d8');s.rect(19,8.6,2,.8,'#d0d4d8');s.rect(44.4,9,1.2,1.4,'#f4f6f8');s.rect(1,9,1.2,1.6,'#c4202c');
  if(taxi){s.rect(1,10.2,44,1.2,'#141414');s.rect(21,0,6,2,'#f4f4f4');s.rect(22,.6,4,.8,'#141414')}
  s.circ(9.5,13.1,4.6,'#0e0f12');s.circ(37.5,13.1,4.6,'#0e0f12');wheel(s,9.5,13.1,3.9,'#b9c0c8');wheel(s,37.5,13.1,3.9,'#b9c0c8');
  return{s,head:[45,9.6],tail:[1,9.6]}}},
hatch:{name:'Hatchback',tier:'Common',variants:5,make(v){
  const[B,H,D]=paint(v+2),G='#3a4b5c',s=Spr(38,17);
  s.poly([[1,13],[1,7],[3,3.2],[6,2],[22,2],[26,4],[30,7.4],[36,8.4],[37.4,10],[37.4,13],[36,14.4],[2,14.4]],B);s.top({[B]:H});
  s.poly([[4,3.4],[14,3.2],[14,7],[3,7]],G);s.poly([[15.4,3.2],[21.6,3.2],[25,4.8],[28,7],[15.4,7]],G);s.rect(15,3.2,1,4,B);
  s.rect(1,12.4,37,2,D);s.rect(36.6,9,1,1.4,'#f4f6f8');s.rect(1,8,1,2,'#c4202c');
  s.circ(8,13.2,4.4,'#0e0f12');s.circ(30,13.2,4.4,'#0e0f12');wheel(s,8,13.2,3.8,'#b9c0c8');wheel(s,30,13.2,3.8,'#b9c0c8');
  return{s,head:[37,9.6],tail:[1,8.8]}}},
rav4:{name:'RAV4',tier:'Uncommon',variants:5,make(v){
  const[B,H,D]=paint([0,1,2,4,6][v]),G='#33465a',s=Spr(46,20);
  s.poly([[1,15],[1,9],[2.4,4],[5,2.4],[28,2.2],[32,3.6],[36,8],[44,9],[45.4,10.6],[45.4,15],[44,16.6],[2,16.6]],B);s.top({[B]:H});
  s.poly([[4.6,3.8],[27.6,3.6],[31,8],[4.6,8]],G);s.rect(12,3.6,1.4,4.6,B);s.rect(20.6,3.6,1.4,4.6,B);s.rect(5,3.8,5,1,'#6f8aa0');
  s.rect(1,13.6,45,3,'#1a1c20');s.rect(44.6,10.4,1.2,1.6,'#f4f6f8');s.rect(1,9.6,1.2,2,'#c4202c');s.rect(6,1.4,20,.8,'#2a2a2e');
  s.circ(9.5,15.8,5,'#0e0f12');s.circ(37,15.8,5,'#0e0f12');wheel(s,9.5,15.8,4.2,'#c0c6cd');wheel(s,37,15.8,4.2,'#c0c6cd');
  return{s,head:[45,10.8],tail:[1,10.4]}}},
kombi:{name:'Kombi bus',tier:'Common',variants:4,make(v){
  const low=['#2f7a4f','#2a5ab8','#b8262a','#e07a1f'][v],W='#eeeae0',G='#3d5a70',s=Spr(42,23);
  s.poly([[1,18],[1,4],[2.6,2],[38,1.6],[40.4,3],[41.6,9],[41.8,17],[40.4,18.8],[2,18.8]],(x,y)=>y<10?W:low);s.top({[W]:'#ffffff'});
  s.rect(37.6,3,3,5,G);for(const x of[4,12,20])s.rect(x,3,6.4,5,G);s.rect(28,3,7,5,G);for(const x of[4,12,20,28])s.rect(x,3,3,1,'#6a8aa2');
  s.rect(1,10,41,.8,'#c9ccd0');s.rect(27,10.8,.8,7.6,'rgba(0,0,0,.25)');s.rect(40.8,12,1,2,'#f4f6f8');s.rect(1,12,1,2,'#c4202c');s.rect(0,16,2,2,'#c9ccd0');s.rect(40.6,16,2,2,'#c9ccd0');
  s.circ(8,19,4.7,'#121214');s.circ(33,19,4.7,'#121214');wheel(s,8,19,4,'#e6e6e6','plain');wheel(s,33,19,4,'#e6e6e6','plain');
  return{s,head:[41.4,12.8],tail:[1,12.8]}}},
});
// ---- mid-tier and top-tier additions ----
Object.assign(VDEF,{
suzuki:{name:'Suzuki Swift',tier:'Uncommon',variants:5,make(v){
  const[B,H,D]=[PAINT[3],PAINT[4],PAINT[0],PAINT[2],['#f2c200','#ffd84a','#c79a00']][v],G='#33465a',K='#151515',s=Spr(38,17);
  s.poly([[1,13],[1,6.6],[2.4,3],[5,1.6],[20,1.4],[24,3.2],[28,6.6],[35,7.6],[37,9.4],[37,13],[35.6,14.4],[2,14.4]],B);s.top({[B]:H});
  s.poly([[3.4,3.2],[8.6,3],[8.6,6.6],[2.6,6.6]],G);s.rect(10,3,7.6,3.6,G);s.poly([[19,3],[22.4,3],[26,6.6],[19,6.6]],G);s.rect(8.6,3,1.4,3.6,K);s.rect(17.6,3,1.4,3.6,K);
  s.rect(1,12.4,37,2,D);s.rect(18.4,7.2,.8,5,D);s.rect(36.6,8.8,1,1.6,'#f4f6f8');s.rect(1,7.4,1,2.4,'#c4202c');
  s.circ(8,13.3,4.4,'#0e0f12');s.circ(30,13.3,4.4,'#0e0f12');wheel(s,8,13.3,3.7,'#c0c6cd');wheel(s,30,13.3,3.7,'#c0c6cd');
  return{s,head:[37,9.6],tail:[1,8.6]}}},
prius:{name:'Prius',tier:'Uncommon',variants:4,make(v){
  const[B,H,D]=[PAINT[0],PAINT[2],PAINT[4],PAINT[1]][v],G='#2e3f50',s=Spr(46,16);
  s.poly([[1,12.6],[1,7.4],[3,5.6],[10,4.2],[17,1.6],[24,1.2],[29,3],[36,6.4],[44,7.6],[45.4,9.4],[45.4,12.6],[44,14],[2,14]],B);s.top({[B]:H});
  s.poly([[11,4.6],[17.4,2],[22,1.8],[22,6.2],[9.6,6.2]],G);s.poly([[23.4,1.8],[27.4,2.4],[32.4,6.2],[23.4,6.2]],G);s.rect(1.4,7.6,2,2.2,G);s.rect(17,2.2,4,.8,'#5f7488');
  s.rect(1,11.8,45,2.2,D);s.rect(22.6,6.8,.8,5,D);s.rect(44.6,8.8,1,1.4,'#e8f4ff');s.rect(1,10,1.4,1.4,'#c4202c');
  s.circ(9.5,12.2,4.5,'#0e0f12');s.circ(37.5,12.2,4.5,'#0e0f12');wheel(s,9.5,12.2,3.8,'#cfd4da','plain');wheel(s,37.5,12.2,3.8,'#cfd4da','plain');
  return{s,head:[45,9.4],tail:[1,10.6]}}},
porsche:{name:'Porsche 911',tier:'Epic',variants:5,make(v){
  const[B,H,D]=[['#c4161c','#e23a3f','#8e0f14'],PAINT[0],PAINT[1],PAINT[2],['#f2c200','#ffd84a','#c79a00']][v],G='#2a3646',s=Spr(44,15);
  s.poly([[1,12],[1,8],[3,6],[8,4.6],[13,2.4],[18,1],[24,1],[28,2.4],[31,5],[36,6.2],[41,7.2],[43.4,8.8],[43.4,12],[42,13.2],[2,13.2]],B);s.top({[B]:H});
  s.poly([[14,3.6],[18.6,2],[23,2],[23,6],[12.6,6]],G);s.poly([[24.4,2],[27.4,2.8],[30,5.6],[24.4,6]],G);s.rect(18.4,2.4,3,.8,'#56708a');
  for(let i=0;i<4;i++)s.rect(4+i*1.4,6,1,1,D);s.rect(1,8.2,1.2,2.6,'#c4202c');s.rect(1,9,6,.8,'#8e0f14');
  s.rect(40,7,2.2,1.6,'#e8f0f8');s.rect(39.6,8.6,3,.6,D);s.rect(1,11.4,43,1.8,'#141418');s.rect(23.6,6.6,.8,5,D);
  s.circ(9,11.2,4.5,'#0e0f12');s.circ(35.5,11.2,4.5,'#0e0f12');wheel(s,9,11.2,3.8,'#c9cfd6');wheel(s,35.5,11.2,3.8,'#c9cfd6');
  return{s,head:[42.4,7.8],tail:[1,9]}}},
});
// ---- more top-tier rides ----
Object.assign(VDEF,{
mclaren:{name:'McLaren',tier:'Epic',variants:4,make(v){
  const[B,H,D]=[['#ff7a1a','#ffa04a','#c45a0e'],PAINT[2],PAINT[1],['#9acd32','#bde65a','#6f9a1e']][v],s=Spr(56,14);
  s.poly([[1,11.6],[1,7],[3,5.6],[10,4.2],[18,1.6],[26,.6],[31,1],[35,3.4],[42,5.6],[52,7.2],[55,8.6],[55.4,11],[54,12.2],[2,12.2]],B);s.top({[B]:H});
  s.poly([[20,2.2],[26,1.2],[30.6,1.6],[34.4,4.6],[22,5.2]],'#1c2430');s.rect(24,1.6,4,.8,'#4a5a6e');
  s.poly([[13,6],[21,5.6],[20,9.6],[15,9]],'#121214');s.line(34.6,5,37,11,D);s.rect(1,10.6,54,1.6,'#111216');
  s.rect(52.6,7.6,2.4,.8,'#f4f8ff');s.rect(1,7,1,1.4,'#ff2a3a');s.rect(1,8.6,3,1,'#2a2a2e');
  s.circ(10,10,4.7,'#08090b');s.circ(44.5,10,4.7,'#08090b');wheel(s,10,10,4,'#9aa2ad');wheel(s,44.5,10,4,'#9aa2ad');
  return{s,head:[54.6,8],tail:[1,7.6]}}},
tesla:{name:'Cybertruck',tier:'Rare',variants:5,make(v){
  const[B,H,D]=[PAINT[2],['#b8262a','#d9474a','#861a1d'],PAINT[1],PAINT[4],PAINT[0]][v],s=Spr(50,16);
  s.poly([[1,12.6],[1,8],[3,6.6],[10,5.2],[16,2.2],[22,1.2],[30,1.4],[35,4],[41,6.4],[47.6,7.6],[49.4,9.4],[49.4,12.6],[48,14],[2,14]],B);s.top({[B]:H});
  s.poly([[16.6,2.8],[22.4,1.8],[29.6,2],[34,5.8],[12,6.2]],'#1c2632');s.rect(23.4,1.8,1.4,4.4,B);s.rect(17,2.8,4,.8,'#46586c');
  s.rect(1,12.2,49,1.8,D);s.rect(24.2,6.8,.8,5,D);s.rect(18,8,2.4,.6,D);s.rect(30,8,2.4,.6,D);s.rect(48.4,8.6,1.2,1.2,'#e8f4ff');s.rect(1,8.6,1.4,1,'#c4202c');
  s.circ(10,12.2,4.5,'#0e0f12');s.circ(39,12.2,4.5,'#0e0f12');wheel(s,10,12.2,3.8,'#6a7078','plain');wheel(s,39,12.2,3.8,'#6a7078','plain');
  return{s,head:[49,9.2],tail:[1,9]}}},
ducati:{name:'Ducati',tier:'Epic',variants:2,make(v){
  // superbike with the rider tucked in; leathers contrast with the fairing so the rider reads clearly
  const R1=v?'#f2f2f2':'#d01c1c',R2=v?'#c9c9c9':'#a51414',LE=v?'#b01818':'#1c1c22',LE2='#f2f2f2',HM=v?'#141416':'#f4f4f4',s=Spr(34,19);
  wheel(s,6.5,14.6,4.3,'#26262b','five');wheel(s,27.5,14.6,4.3,'#26262b','five');
  s.line(6.5,14.6,14,13,'#8a9098');s.rect(12,11.4,7,3.2,'#3a3d44');s.rect(13,14.4,6,1,'#9aa0a6');
  s.poly([[2,8.4],[10,8],[12,9.4],[4,10.4]],R1);s.rect(9,7.4,4,.9,'#141416');
  s.poly([[13,7.2],[19,6.6],[20.6,8.4],[13.4,9.4]],R1);s.rect(14,7,4,.7,R2);
  s.poly([[18.6,8],[25,6.4],[29,8],[30.4,10.6],[26,12.2],[19,12]],R1);s.line(20,10.4,27,9,R2);
  s.poly([[24,6.2],[27,5],[28,6.4],[25.4,7]],'#4a5a6a');s.line(27.5,14.6,25.6,8,'#c9a24a');
  s.rect(29.6,8.6,1,1,'#f4f6f8');s.rect(2,8.6,1,1,'#c4202c');
  s.poly([[10,7.8],[15,3.6],[19.4,3.6],[20.6,6.2],[14,8.8]],LE);s.line(11.4,7.2,17,4,LE2);
  s.rect(18.4,.8,4.4,3.6,HM);s.rect(18.4,2,4.4,.8,'#d01c1c');s.rect(21.6,1.8,1.4,1.2,'#2a3a4a');
  s.line(19.6,5.4,24,7.4,LE);s.line(19.6,6.2,24,8,LE);s.rect(23.6,7.2,1.4,1,'#111');
  s.line(12,9,17,10.4,LE);s.line(12,9.8,17,11.2,LE);s.line(17,10.6,15.6,13,LE);s.rect(15,12.8,2.4,1,'#111');
  return{s,head:[30.4,9],tail:[2,8.8]}}},
});
// Pixel art by the owner's friend (used with permission): Bugatti Chiron, Porsche 911 GT3 RS x4, Cybertruck, McLaren Senna (from a Minecraft build), all brought to game resolution
const FRIEND_ART={"tesla":[{"w":53,"h":19,"pal":["#f8f8fa","#e7e8f0","#e4e5ed","#e2e4eb","#dbdae0","#bbb9d5","#bab9cf","#b1b4cd","#afb2cc","#aeafca","#acadc7","#a8a7c2","#a5a3bf","#a2a1be","#a19fbb","#9f9db9","#9696b4","#9295b3","#8b8ca9","#74748f","#44445b","#272830","#23242b","#202128","#1e1f25","#1c1d23","#1b1b24","#1a1b21","#191a20","#18181d","#17181d","#15161b","#111218","#0f0f15","#0e0f15","#0e0f13","#0d0f14","#0e0e14","#0a0b12"],"rows":["........................CCCCCCC......................",".................CCCCCCC0007i40CCCC..................","..........CCCCCCC00006iikmmlllmii00CCC...............","...CCCCCCC0001111ikttommllrmlllmmqki00CCC............",".CC1001111333333arnmmmllllnsllllllmptki11CCC.........","C631333333333322jttttttonnrtnnnnnnnmtnnptj71CCC......","C5555543333322224222222ajjjjjjjjjjjjjttttttuj11CCCC..","Ceeeeeeeffffffffg5555555554142222222243333333222222C.","Cddddddddeeeeedeieeffefffefeieeeddde7755555554422000C","Cccbcbcb666669achbbcccbcbcbchcccccdddgb754446a88fgghC","Caa9a99kzyyyyk99ddaaa99999a9hb9bbabb9f9kyyyzzj88bggC.",".Cqjj8kyumllpyh89g9999989888g87877787ejBpllmvBe7bggC.","..Cyxqywonppmnlgdiddddddddb7g77777777hlroopnmvk7666C.","...CCywnrvwvsnrkhjhhhhhhhhhgjhggggggglprtwvwomAkkzC..",".....CvrvvmkwomvqsqqqqqqqqqquqqqqqqqqyvrvrkvvmrzzC...",".....CtuormmvpnyyAAyByyByBxyyyyyyyyzByttnoltvmrCC....","......CwpmuprrnCCCCCCCCCCCCCCCCCCCCCCCvvoorrrpC......","......CwwpsosrrC......................CwvropppC......",".......CCCCCCCC........................CCCCCCC......."],"head":[50,8],"tail":[2,6],"full":1}],"mclaren":[{"w":48,"h":14,"pal":["#c84d08","#b04a00","#ac4d00","#ab4a00","#d14700","#d34000","#b34700","#b74000","#a94900","#a03d00","#8c3d00","#723600","#782b01","#6a2c00","#622f00","#642a00","#434b4f","#3c4146","#363a41","#313a37","#33363b","#2c3634","#2b3235","#5c2800","#4f1d00","#431c00","#341700","#262a30","#29272d","#23252b","#26160f","#1d1f26","#171a1c","#13141c","#141415","#121215","#101114","#0e0f10","#0a0b12"],"rows":["..CCCCCC.........CCCCCCCCCC.....................",".CwtmxxvC.......CrvtrtrmrrtCC...................",".Cya836qxC...CCCvwyAyvtrrvwtkCCC................","..C32113u9CCCztzzzzzxvtttiiivkggCC..............","...C19pff954454544cccnkiittiiwzvhgCCCCCCC.......","..Cbb770612222264a9404779eeeecec000645058CCC....",".Cnb8afneea2222222966adddeeefoo82bneea744450CC..",".CebauAkigmo2222237466ovvvriksn9ovkhkvpd48cc50C.","CkBpqAkllhkka3883324444ovtmmisbbuglhmgBAn4pggn8C",".CvzAwhhhhvme888888004076enovbbekiihivkAz96oqn8C",".CBBAwmmjhihp8888aofdfddcadnbbaokvmihkkBBf16d9rC","..CBBBimhmlkByyyyqqpooonfoppnoqqzhrhmhAAAzyzxxzC","...CCCwjhmjCCCCCCCCCCCCCCCCCCCCCymlhkrslCCCCCCC.","......CCCCC.....................CCCCCCCC........"],"head":[45,7],"tail":[5,4],"full":1}],"porsche":[{"w":51,"h":17,"pal":["#eaece8","#e7e8e4","#e3e4e2","#d7d9d6","#cacbca","#c0c2c2","#bbbebf","#b8bebe","#b7b8b7","#afb1b0","#a9abaa","#a5a6a5","#9c9fa0","#959797","#8c8c8b","#808180","#787878","#707171","#6a6a6a","#646564","#5e5e5e","#565656","#4f4f4e","#454545","#3e3e3e","#373737","#323232","#2c2c2c","#282727","#232423","#202020","#1c1c1b","#181918","#161516","#131414","#0f0f0f","#0a0b12","#0b0b0b","#050605","#000000"],"rows":[".AAAAAA...........AAAAAAAAA........................","AuwvsolA.......AAApyzDpDDCqAAA.....................",".AvttuxyA...AAAzorgdelfff83ephA....................","..AzzzpttAAAvqheifrzwllllswgjklAA..................","...AAAztwstf88mvrjnuukdcccdmvogilAAAAA.............","..ADlkBpe8011krqmmptwlbbccdcp4agelwCCmAAAAAA.......","..Alff4121111110100999999ghhllsn8jd5agqBoiynAA.....","..Arvied343af928xc241101121126e2141013vxxf0emlAA...",".Acdeee30aqrotqafn2855534333200003109gjywja1fikfA..","Atiaaabdhuilvkkzblc6b7576666899b9bbgyBmlkswc29f5fA.",".Atud7bpwnqdjftms55695676777776679erxnoihtpBfa2107A","Aevxi7hoznmeiejoz95acbccce9aabc67amqzhgedgixwg88jpA",".Atpu5nrBqqcjdroBdpnighkhbilnfeinjprzjlefkixwp66tuA",".AyvtyvsCnmogmlnDc524224445485554fsqBkkkghhzyr47rtA","..AAqCBopxohpkmBDwvwvwwwwwxvwwxwwwruBykimitCutyxyoA","....AAAAAAsyyxsAAAAAAAAAAAAAAAAAAAAAAAvzyrAAAAAAAA.","..........AAAAA.......................AAAA........."],"head":[45,10],"tail":[3,8],"full":1},{"w":52,"h":19,"pal":["#d1cdb6","#ddae2f","#d8a218","#ad9b6c","#c2931b","#b6881a","#987e3f","#a36f0c","#937021","#9a6a0f","#895e0d","#756847","#725f31","#725823","#775211","#5e4f2d","#604616","#543e15","#444545","#3e3d3b","#41341f","#31302e","#302b20","#282829","#2a2116","#212322","#1e1e1f","#1a1b1a","#1f1610","#171715","#141415","#180c0a","#111010","#0d0d0d","#0a0c12","#0a0b12","#0a0a0a","#070708","#040504","#000000"],"rows":[".zzzzzz.............zzzzzzz.........................","zjnjAqbz........zzzzjBBBCCpzz.......................","zrnllnplz....zzzwnrmhhbb66cmpzz.....................",".zqppnqnz.zzznjoh55doxrttrschiizz...................","..zzzznlizijmk6ddsjirj30000bqkibbzz.................","..zzzztunmkd44kl3003rtb000000ikbbi3zzzz.............",".z3kootma12124dkkbbbxwi33b300mlhmlliBBnzzzzz........","..zh41621122221111111411116dcgsdd8cdgbsvfhkozz......",".zisssvse4545542aA6272222222279a225525spsd11nizz....",".z8dcfga248ottvg4hs499aa544522222244addddd425b3mz...","zs7a9797egwrliqto5kg79977777aaeea9aadhvrrrve75bcbzz.","zbwso77hqunpunnrue797a777777777777doxtniynnwh555463z","z0tosa9sntnqAlrlpv7999eeeeaeae9ee7knBipBiAnwxs544efz","zjnmpgatuxltjnpnrBgphhgocokcgdeddaopuxibj3pixph7dpxz",".zunrshnrwnxiiqwrAagd88dg6ddd886cbppyrCibuAiApk9hllz",".zrqwwuuuulrDCDlrAggeeeeegggggggggppBxjjwjiwBnsesquz","..zzzzyABbqnptlpAuwtuuuutuututututrwCrpnulqqBwrwwuwz","......zzzzzjuwnbzzzzzzzzzzzzzzzzzzzzzzlwwn3zzzzzzzz.","...........zzzzz......................zzzzz........."],"head":[45,10],"tail":[3,8],"full":1},{"w":53,"h":18,"pal":["#8c888a","#656e70","#635855","#464241","#753030","#3b3435","#2c2c2c","#272625","#d02125","#8e1e20","#481d1d","#282120","#1f2020","#1d1d1c","#1c1b1a","#181a19","#d31115","#d70d12","#c31215","#b00e10","#941013","#7b1114","#651316","#6d0e10","#511112","#371111","#261111","#181515","#151616","#151314","#10100f","#b10a0e","#a80a0b","#93090b","#600508","#4a080a","#1a0708","#0a0b12","#090b0b"],"rows":[".BBBBBB..............BBBBB...........................","B5533f1B........BBBBB60550BBBB.......................","Be777dd0B...BBBB53Aam4zzpz4522BB.....................",".B77fcdfBBBB02249lnAqb5336qmm200B....................","..BBBBdf51349jlzq33ds5111113qm210BB..................","..BBB0dqo9ihgzd3111fdc1111111bo4211BBBBBB............",".B59moki8888889nlmmmapppp333bzppm33qb6320BBBBB.......",".Baxxlighhhhhhh89ghgigggg8g88xyn8i8888oqa42450B......","B0pappawvjyzznwiqlhiijjihhhhhiighgiivlmozlhh900BB....","Blwkkxwikzrefeqy9qwijwxwiiivvvwwvijgjlpAqpyig903aBB..","B5zlxxnpAdsCuusulljixwwwwwwwwwwxxxyzAqssusdplvkljm2B.","B3bqlxzcssuu6uufAvvwxwwwwwwwwwwwwwzbCct655duqmgh8882B","B6bqnlbtsu7du5eeqkmmlmmmomlnmnnmllpcfCbs7dssCblwwzzaB","B7c7pobtssttse6frnaalnooommmmmmoaobssu2c6c66t7owke76B",".Brefr7ustt3c3tdCnll9999lyyyyyyyyo7surqe677tu7pil7cB.","..BB3u2uucesstdr7CCACuuAAAAAACAAAAft5dbs67cc67bpqse6B","....BBBBBffffd7BBBBBBBBBBBBBBBBBBBBBBBssee6BBBBBBBBB.",".........BBBBBB.......................BBBBB.........."],"head":[45,10],"tail":[3,8],"full":1},{"w":53,"h":18,"pal":["#bbc1c4","#ad876c","#f77823","#d3783a","#f5731e","#ec6d20","#d46728","#6f6e6b","#de5616","#d0591d","#d75115","#bd5725","#af4d1c","#914f2b","#605048","#9a3f17","#834220","#753f22","#763013","#643e2d","#5b3726","#61311b","#5e270d","#433832","#412a1f","#35251f","#3f2011","#211f1d","#38190d","#27150c","#221712","#1f0f07","#181817","#161412","#180d09","#110d0a","#0a0b12","#0a090a","#060905"],"rows":[".AAAAAA...........AAAAAAAAAAA........................","AwrrrppA.......AAAnyuoklkll1eAA......................","AxwrrrwrA...AAAenthdlqgdggd3durAA....................",".AAwwwxrAAAArrndbhquz711117eqkeeeA...................","...AAAnrwxpsg6cqe107xr0000001nje7nAA.................","...AAAnxsg644byn7717rx1000000dgqj71rAAAAAAA..........","..Aoghh622222223dfghhldgjn777miloh7nkh1e7npAAA.......","..Ajgbb224424244hl24544442222bfi555565gurl3djnAA.....",".Ajqoosi66bimmg5dxf455554444445444558chlmm249k7nAA...","As66bbb52fvxuuxsclsaaaca8888899a99626gqyyytc46j7deA..",".Amf99cmsyokpojuv6g5aa888888a888aacmvyokskqvc59fcbeA.",".Arrq8brxuktsoqqvi888aaaa8aaaa8888frxuqpjosoytb4422kA","A7wut9irBttjhjptuqcgfdimimiffgffg9lrxotjlhqsyri8aiqqA",".AwrrmkrCtvjmhjsuvislmlqqqlqmmilqsorwoqlsmkqxrla9urxA","..AwxzxrCukojlujxvbb6666cccccbbbbcsrBotkojskBrp5crrBA","...AnBxnpzoosvjpzzyvvyvyvyyvyyvyvvxwrxjstojuwrruvrrrA","....AAAAAABtnuuxAAAAAAAAAAAAAAAAAAAAAAznjnzAA771AAAA.","..........AAAAAA......................AAAAA..AAA....."],"head":[45,10],"tail":[3,8],"full":1}],"chiron":[{"w":64,"h":19,"pal":["#cdd3da","#8cb1cd","#899cb1","#419de6","#3595e1","#2e88d0","#327eb9","#267dc3","#2574b1","#21669c","#505050","#4d4e50","#21659b","#09518d","#0b4b82","#2f4658","#0a3c67","#094578","#313640","#0b3455","#083a63","#092f50","#072943","#201f25","#151515","#061b2a","#04141d","#0a0b12","#000000"],"rows":["......................rrrrrrrrrrrr..............................","..................rrrrmmggggggggmmrrr...........................","..............rrrrmmggdd666aaaaa66ppprrr........................","..........rrrrmmggdd666ammm00000aaaacmpprr......................","......rrrrmmggdddd9appmmjf2000000002aaafmprr....................","...rrrgdggdddddddd6pppppmgf0000000000a266fmprrrrrrr.............","..rjghedddddhhhhhc6ddddgdc9999999999999cc6gcc833333rrrrr........",".rmmlkggggggggged6555558855555555555555585d5555555544433rr......",".rbmmmlgmmmmmhhgmm155555d575555555555555555d55554555554544rr....",".rnmmmmpsooosqkmmpa55555d555555555555555555d5554cpooopc45554r...",".rpppmpsnaaansqpppp25555d555555555555555555d554csnaaansc45315r..",".rppppsnabic6nsppppm25555d55555555555555555d55csnabibansc53274r.",".rpppqoaaa2a66oqmmmmm2555d55555555555555555d57po6aa2aaaos75554r.",".rppmqnaaa6ac3nqmmmmmm235d55555555555555555d57sn36a6aaans755553r","rmmmmsnaaa6aaansmmmmmmmf2264455555555555555d57sn36a6aaans666596r","rmmmmsoaaa2aaaosmmmmmmmmmmpcc21134444444444c57so6aa2aaaos6666scr",".rpmmssnabibanssmmmmmmmmmmppppppfaaaaaaaaaafccssnabibansscccaacr","..rpmrrrnaaanrrsmkeeeeeeeeeeeeeeeejpppppppmmmmssonaaanossmmlljhr","...rr...rrrrr..rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr."],"head":[59,11],"tail":[2,8],"full":1}]};
const SPR={};
for(const k in VDEF){const d=VDEF[k];SPR[k]=[];for(let v=0;v<d.variants;v++){const m=d.make(v),day=bake(m.s),hd=[m.head[0]+1,m.head[1]+1],tl=[m.tail[0]+1,m.tail[1]+1];
  const lights=g=>{g.fillStyle='#fff6cf';g.fillRect(hd[0]|0,hd[1]|0,1,1);g.fillStyle='#ff2d3c';g.fillRect(tl[0]|0,tl[1]|0,1,1);if(m.bar)for(const[x,y,c]of m.bar){g.fillStyle=c;g.fillRect(x,y,4,1)}};
  SPR[k].push({day,w:day.width,h:day.height,head:hd,tail:tl,bar:m.bar,
    night:tinted(day,'rgba(10,14,42,.5)',lights),dimDay:tinted(day,'rgba(80,92,120,.22)'),dimNight:tinted(day,'rgba(6,8,26,.64)',lights)})}}
// friend's art for the Porsches, Cybertruck and McLaren: full detail, drawn at half size in traffic
function artCanvas(A){const CH='.0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+,-/:;<=>?@[]^_{|}~',c=canvas(A.w,A.h),g=c.getContext('2d');
  A.rows.forEach((row,y)=>{for(let x=0;x<row.length;x++){const ch=row[x];if(ch!=='.'){g.fillStyle=A.pal[CH.indexOf(ch)-1];g.fillRect(x,y,1,1)}}});return c}
function artSprite(A){const c=artCanvas(A),hd=A.head,tl=A.tail,k=A.full?1:.5,lights=g2=>{g2.fillStyle='#fff6cf';g2.fillRect(hd[0],hd[1],A.full?1:2,1);g2.fillStyle='#ff2d3c';g2.fillRect(tl[0],tl[1],1,A.full?1:2)},half=x=>{if(!A.full)x.half=true;return x};
  return{day:half(c),w:A.w*k,h:A.h*k,head:[hd[0]*k,hd[1]*k],tail:[tl[0]*k,tl[1]*k],night:half(tinted(c,'rgba(10,14,42,.5)',lights)),dimDay:half(tinted(c,'rgba(80,92,120,.22)')),dimNight:half(tinted(c,'rgba(6,8,26,.64)',lights))}}
for(const k in FRIEND_ART)SPR[k]=FRIEND_ART[k].map(artSprite);
const COMMON={porsche:.06,tesla:.04,mclaren:.035,chiron:.02,ducati:.01,danfo:.19,sedan:.17,keke:.12,okada:.11,hilux:.1,suzuki:.06,rav4:.06,hatch:.05,prius:.04,kombi:.04,prado:.025,cruiser:.02,gwagon:.012};
let hiluxTurn=0;
function variant(type){if(type!=='hilux')return Math.random()*SPR[type].length|0;
  const r=Math.random();if(r<.05)return 6+(Math.random()*2|0);hiluxTurn^=1;return hiluxTurn*3+(r<.55?0:r<.8?1:2)}

// ===================== WEATHER =====================
// Live weather per city (Open-Meteo, free, no key). Works once the game is on GitHub Pages.
// Inside a Claude preview the request is blocked, so the sample weather below is used.
const WX={
  clear:{label:'Clear',sun:1,few:.9,grey:0,dark:0,rain:0,dust:0,bolt:0,
    sky:{d:['#2f86d8','#4a98de','#66aae3','#86bde8','#aed2ea','#dbe7e2'],n:['#05071a','#080c26','#0d1333','#141a40','#1d234d','#2c2c58']},haze:{d:'rgba(190,215,235,.3)',n:'rgba(18,24,58,.35)'}},
  cloudy:{label:'Cloudy',sun:.4,few:.5,grey:1,dark:0,rain:0,dust:0,bolt:0,
    sky:{d:['#5f86a8','#6e93b3','#80a1bd','#94b0c7','#abc1d1','#c7d3da'],n:['#0a0d18','#0f1322','#141a2c','#1b2236','#232b40','#2e3549']},haze:{d:'rgba(170,185,200,.38)',n:'rgba(20,24,40,.4)'}},
  haze:{label:'Harmattan haze',sun:.55,few:0,grey:0,dark:0,rain:0,dust:1,bolt:0,
    sky:{d:['#b5a68a','#c0af90','#cab895','#d3c09a','#dbc79f','#e2cca2'],n:['#0d0a12','#16111a','#211922','#2c2128','#3a2b2c','#4a3830']},haze:{d:'rgba(224,202,160,.55)',n:'rgba(60,44,40,.5)'}},
  rain:{label:'Rain',sun:0,few:0,grey:.4,dark:1,rain:1,dust:0,bolt:.15,
    sky:{d:['#4d5866','#57626e','#626c77','#6d7680','#79818a','#858b92'],n:['#06080c','#0b0f15','#11161d','#171d25','#1e252e','#262d36']},haze:{d:'rgba(118,126,136,.45)',n:'rgba(22,28,36,.5)'}},
  storm:{label:'Thunderstorm',sun:0,few:0,grey:.2,dark:1.2,rain:1.7,dust:0,bolt:1,
    sky:{d:['#30363f','#383f48','#414851','#4a525b','#545c65','#5f666e'],n:['#040507','#080a0e','#0d1015','#12161c','#181d24','#1f252c']},haze:{d:'rgba(80,88,98,.55)',n:'rgba(12,16,22,.6)'}},
};
const CITY={lagos:'Lagos',mainland:'Lagos',abuja:'Abuja',ph:'Port Harcourt'};
const CITIES=['Lagos','Abuja','Port Harcourt'];
// Sample weather: typical early-November conditions, used when live weather can't load
const cityWx={Lagos:{type:'cloudy',temp:30},Abuja:{type:'haze',temp:32},'Port Harcourt':{type:'rain',temp:27}};
let wxSource='sample';
const wxOf=k=>WX[cityWx[CITY[k]].type];
function codeToWx(code,vis){if(code>=95)return'storm';if((code>=51&&code<=67)||(code>=80&&code<=82))return'rain';if(code===45||code===48)return'haze';if(vis!=null&&vis<5000)return'haze';if(code>=2)return'cloudy';return'clear'}
async function loadWeather(){try{const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),6000);
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=6.45,9.06,4.82&longitude=3.39,7.49,7.03&current=temperature_2m,weather_code,visibility&timezone=Africa%2FLagos',{signal:ctl.signal});clearTimeout(to);
    const j=await r.json(),arr=Array.isArray(j)?j:[j];CITIES.forEach((c,i)=>{const cur=arr[i].current;cityWx[c]={type:codeToWx(cur.weather_code,cur.visibility),temp:Math.round(cur.temperature_2m)}});
    wxSource='live';buildWorld()}catch(e){wxSource='sample'}}

// pedestrians on the sidewalk: head loads, traditional dress, sunglasses, children
const PED_KINDS=[
  {outfit:'iro',top:'#2f8a5a',bot:'#e8c31c',load:'tray'},
  {outfit:'ankara',top:'#d9541e',pat:'#1f3b8a',load:'basin'},
  {outfit:'casual',top:'#c43c3c',bot:'#2e4a8a',load:'wood'},
  {outfit:'iro',top:'#7b3fa0',bot:'#2f6fb0',load:'bucket',skin:SKIN2},
  {outfit:'casual',top:'#e8e8e8',bot:'#3a3a3a',load:'sack'},
  {outfit:'agbada',top:'#3a5fb8',pat:'#c9d8ff',head:'fila',hc:'#3a5fb8'},
  {outfit:'iro',top:'#e0459a',bot:'#9a1f62',head:'gele',hc:'#ff7ac0'},
  {outfit:'kaftan',top:'#f2efe6',head:'hula'},
  {outfit:'kaftan',top:'#7fb2d9',head:'turban'},
  {outfit:'isiagu',top:'#c41e1e',pat:'#f2d23c',head:'redcap',bot:'#141414'},
  {outfit:'casual',top:'#2f8a5a',bot:'#1e2a4a',glasses:1,head:'cap',hc:'#111'},
  {outfit:'ankara',top:'#e8c31c',pat:'#c41e1e',glasses:1,skin:SKIN2},
  {outfit:'suit',top:'#2a2d36',bot:'#2a2d36',glasses:1},
  {outfit:'suit',top:'#1f2a44',bot:'#1f2a44',brief:1,tie:'#2f6fb0'},
  {outfit:'suit',top:'#5a5f68',bot:'#4a4f58',tie:'#7b3fa0',skin:SKIN2},
  {outfit:'skirtsuit',top:'#1f2a44',bot:'#1f2a44',brief:1,head:'gele',hc:'#2f6fb0'},
  {outfit:'skirtsuit',top:'#8a1f2a',bot:'#2b2b33',glasses:1,skin:SKIN2},
  {outfit:'school',top:'#f4f4f4',bot:'#2b4a8a',child:1},
  {outfit:'dress',top:'#e0459a',child:1,skin:SKIN2},
  {outfit:'casual',top:'#e8c31c',bot:'#3a3a3a',child:1,head:'cap',hc:'#c43c3c'},
];
function person(o,f){const ch=!!o.child,H=ch?16:25,s=Spr(11,H),sk=o.skin||SKIN;
  const hy=ch?4:5,tt=hy+3,th=ch?4:7,lt=tt+th,lh=H-lt-1;
  const pat=(x,y,w,h,c,p)=>{s.rect(x,y,w,h,c);if(p)for(let j=0;j<h;j+=2)for(let i=(j/2)%2;i<w;i+=2)s.set(x+i,y+j,p)};
  // legs
  const legs=c=>{if(f){s.rect(3,lt,2,lh,c);s.rect(6,lt,2,lh-1,c);s.rect(2,H-1,3,1,'#111');s.rect(6,H-2,3,1,'#111')}else{s.rect(4,lt,2,lh-1,c);s.rect(5,lt,2,lh,c);s.rect(4,H-1,3,1,'#111')}};
  const feet=()=>{if(f){s.rect(3,H-1,2,1,sk);s.rect(6,H-1,2,1,sk)}else s.rect(4,H-1,3,1,sk)};
  const o2=o.outfit;
  if(o2==='kaftan'){pat(3,tt,5,H-tt-1,o.top);s.rect(5,tt,1,4,'#d8d2c0');feet()}
  else if(o2==='iro'){pat(3,tt,5,th-1,o.top);pat(3,lt-1,5,H-lt,o.bot,o.top);feet()}
  else if(o2==='ankara'){pat(3,tt,5,H-tt-3,o.top,o.pat);legs(sk)}
  else if(o2==='agbada'){pat(1,tt,9,th+3,o.top,o.pat);legs(o.top)}
  else if(o2==='isiagu'){pat(3,tt,5,th,o.top,o.pat);legs(o.bot)}
  else if(o2==='suit'){s.rect(3,tt,5,th,o.top);s.rect(5,tt,1,3,'#f4f4f4');s.rect(5,tt+1,1,3,o.tie||'#c41e1e');legs(o.bot)}
  else if(o2==='skirtsuit'){legs(sk);s.rect(3,tt,5,th,o.top);s.rect(5,tt,1,2,'#f4f4f4');s.rect(3,lt,5,Math.round(lh*.5),o.bot)}
  else if(o2==='dress'){pat(3,tt,5,th+3,o.top,'#ffffff');legs(sk)}
  else{s.rect(3,tt,5,th,o.top);legs(o.bot)}
  // arms (one raised to steady a head load)
  const armC=o2==='agbada'?o.top:sk;if(o.load){s.rect(8,hy-1,1,tt-hy+3,sk);s.rect(2,tt+1,1,th-2,armC)}else if(o2!=='agbada'){s.rect(2,tt+1,1,th-2,armC);s.rect(8,tt+1,1,th-2,armC)}
  if(o.brief)s.rect(1,tt+th-1,3,3,'#5a3a1a');
  // head
  s.rect(4,hy,3,3,sk);if(o.glasses)s.rect(4,hy+1,3,1,'#0c0c0c');
  const hc=o.hc;switch(o.head){case'fila':s.rect(4,hy-1,3,1,hc);s.rect(6,hy-2,2,1,hc);break;case'gele':s.rect(3,hy-2,5,2,hc);s.rect(2,hy-1,7,1,o.top);break;
    case'hula':s.rect(4,hy-1,3,1,'#f4f4f4');s.set(5,hy-1,'#2f6fb0');break;case'turban':s.rect(3,hy-2,5,2,'#ece6d6');break;case'redcap':s.rect(4,hy-1,3,1,'#c41e1e');break;
    case'cap':s.rect(4,hy-1,3,1,hc);s.rect(7,hy,1,1,hc);break;default:s.rect(4,hy,3,1,'#151010')}
  switch(o.load){case'tray':s.rect(0,hy-2,11,1,'#8a6a3a');s.rect(1,hy-3,9,1,'#e8c31c');s.rect(2,hy-4,2,1,'#d93636');s.rect(6,hy-4,3,1,'#2f8a5a');break;
    case'basin':s.rect(1,hy-3,9,2,'#e8e8e8');s.rect(1,hy-3,9,1,'#2f6fb0');s.rect(2,hy-4,7,1,'#ff9a1a');s.rect(4,hy-5,3,1,'#ff9a1a');break;
    case'wood':s.rect(0,hy-2,11,2,'#7a5a3a');for(let i=0;i<11;i+=3)s.rect(i,hy-2,1,2,'#5a3d22');s.rect(1,hy-3,9,1,'#8a6a44');break;
    case'bucket':s.rect(3,hy-4,5,3,'#e8c31c');s.rect(3,hy-4,5,1,'#c79a00');s.rect(4,hy-5,3,1,'#7fc4e0');break;
    case'sack':s.rect(2,hy-4,7,3,'#d2bd8c');s.rect(2,hy-3,7,1,'#a8925f');break}
  return bake(s)}
const PEDS=PED_KINDS.map(o=>[0,1].map(f=>{const d=person(o,f);return{day:d,night:tinted(d,'rgba(10,14,42,.6)')}}));
// ---- famous mosques and churches ----
function minaret(R,L,x,b,h,cap){R(x,b-h,4,h,'#f4f1ea');R(x+3,b-h,1,h,'rgba(0,0,0,.1)');R(x-1,b-h+10,6,2,'#d9d4c6');R(x-1,b-h*.55|0,6,2,'#d9d4c6');R(x,b-h-4,4,4,cap);R(x+1,b-h-8,2,4,cap);R(x+1,b-h-10,2,1,'#e8c31c');L(x,b-h+10,4,1,'#9fffb0');L(x+1,b-h-10,2,1,'#ffe28a')}
// Lagos Central Mosque, Lagos Island: four minarets, gold main dome, green side domes
function lagosCentralMosque(R,L,cx,b){R(cx-38,b-26,76,26,'#f4f1ea');R(cx-38,b-26,76,2,'#ffffff');for(let c=cx-34;c<cx+34;c+=7){R(c,b-20,4,9,'#2f7a4f');R(c+1,b-21,2,1,'#2f7a4f');L(c,b-20,4,9,'#ffd58a')}
  R(cx-14,b-34,28,8,'#efe9dc');halfDome(R,cx,b-34,14,'#d9a62b');disc(R,cx-5,b-41,3,'#f3cd5c');R(cx,b-52,1,4,'#d9a62b');
  for(const dx of[-26,26]){halfDome(R,cx+dx,b-26,6,'#2f8a5a');R(cx+dx,b-35,1,3,'#d9a62b')}
  for(const mx of[cx-46,cx+42])minaret(R,L,mx,b,78,'#2f8a5a');for(const mx of[cx-36,cx+32])minaret(R,L,mx,b,64,'#d9a62b');
  L(cx-12,b-38,24,2,'rgba(160,255,190,.55)')}
// Cathedral Church of Christ, Marina: Gothic nave, square tower with pinnacles
function marinaCathedral(R,L,cx,b){const st='#d8cdb8',sh='#b9ad96';R(cx-40,b-28,62,28,st);for(let k=0;k<10;k++)R(cx-41+k,b-38+k,64-2*k,1,k%2?'#7a6a5a':'#8a7a68');
  for(let c=cx-36;c<cx+18;c+=8){R(c,b-22,4,12,'#4a5a6a');R(c+1,b-24,2,2,'#4a5a6a');L(c,b-22,4,12,'#ffcf7a')}
  R(cx+22,b-72,18,72,st);R(cx+37,b-72,3,72,sh);for(const px of[cx+21,cx+27,cx+33,cx+38])R(px,b-80,2,8,st);R(cx+21,b-73,20,2,sh);
  R(cx+27,b-60,7,14,'#4a5a6a');R(cx+29,b-62,3,2,'#4a5a6a');disc(R,cx+31,b-38,3,'#4a5a6a');R(cx+27,b-14,8,14,'#5a3a24');L(cx+27,b-60,7,14,'#ffcf7a');L(cx+29,b-41,4,6,'rgba(255,207,122,.8)')}
// Corpus Christi Cathedral, Port Harcourt: tall gabled front, bell tower with cross
function corpusChristi(R,L,cx,b){R(cx-34,b-26,60,26,'#f2efe8');for(let i=0;i<22;i++)R(cx-34+i,b-26-i,60-2*i,1,i%3?'#e6e1d6':'#d4cec0');
  R(cx-10,b-40,12,16,'#7fa6c9');for(let c=cx-9;c<cx+2;c+=3)R(c,b-40,1,16,'#f2efe8');L(cx-10,b-40,12,16,'rgba(150,200,255,.7)');R(cx-8,b-12,8,12,'#5a3a24');
  R(cx+30,b-66,12,66,'#f4f1ea');R(cx+39,b-66,3,66,'rgba(0,0,0,.1)');R(cx+33,b-58,6,8,'#4a5a6a');L(cx+33,b-58,6,8,'#ffe2a0');R(cx+35,b-80,2,14,'#d9a62b');R(cx+32,b-76,8,2,'#d9a62b');L(cx+35,b-80,2,14,'#ffe28a')}
// Port Harcourt Central Mosque, Victoria Street: green dome, single minaret
function phCentralMosque(R,L,cx,b){R(cx-24,b-22,48,22,'#f2efe6');for(let c=cx-20;c<cx+20;c+=6){R(c,b-16,3,8,'#2f7a4f');L(c,b-16,3,8,'#ffd58a')}R(cx-9,b-27,18,5,'#f2efe6');halfDome(R,cx,b-27,10,'#2f8a5a');R(cx,b-41,1,4,'#d9a62b');minaret(R,L,cx+30,b,60,'#2f8a5a')}
// neighbourhood mosque and church (scenery only, not labelled)
function smallMosque(R,L,x,b){R(x,b-20,34,20,'#e9efe6');R(x+10,b-24,14,4,'#e9efe6');halfDome(R,x+17,b-24,8,'#2f8a5a');R(x+17,b-35,1,3,'#d9a62b');for(let c=x+4;c<x+30;c+=6){R(c,b-14,3,6,'#2f7a4f');L(c,b-14,3,6,'#ffd58a')}R(x+36,b-44,3,44,'#f4f1ea');R(x+35,b-47,5,3,'#2f8a5a');L(x+36,b-48,3,1,'#9fffb0')}
function smallChurch(R,L,x,b){R(x,b-22,40,22,'#f1ece2');for(let i=0;i<10;i++)R(x-1+i*2,b-32+i,42-4*i,1,'#8a4a32');R(x+16,b-40,8,18,'#f1ece2');R(x+19,b-48,2,8,'#c9a24a');R(x+17,b-46,6,2,'#c9a24a');
  for(let c=x+4;c<x+36;c+=8){R(c,b-16,4,8,'#5a6f8a');R(c+1,b-17,2,1,'#5a6f8a');L(c,b-16,4,8,'#ffd58a')}L(x+19,b-48,2,8,'#ffe28a')}

// ---- go-slow hawkers selling to the cars ----
const SELL=[{top:'#2f6fb0',bot:'#1e2a4a',goods:'water'},{top:'#e2683a',bot:'#2b2b33',goods:'snacks'},{top:'#2f8a5a',bot:'#3a2a1a',goods:'drinks'},{top:'#e0459a',bot:'#7b3fa0',goods:'snacks',wrap:1}];
function seller(o,f){const s=Spr(13,26),hy=6,tt=9;
  if(o.wrap){s.rect(4,tt,5,6,o.top);s.rect(4,15,5,10,o.bot);s.rect(4,25,2,1,SKIN);s.rect(7,25,2,1,SKIN)}
  else{s.rect(4,tt,5,7,o.top);s.rect(4,16,5,2,o.bot);if(f){s.rect(4,18,2,7,o.bot);s.rect(7,18,2,6,o.bot)}else{s.rect(5,18,3,7,o.bot)}s.rect(4,25,3,1,'#111')}
  s.rect(5,hy,3,3,SKIN);s.rect(5,hy,3,1,'#151010');s.rect(3,tt+1,1,5,SKIN);
  // raised arm holding goods up to the car window
  const ay=f?tt-2:tt-4;s.rect(9,ay,1,tt+2-ay,SKIN);
  if(o.goods==='water'){for(let i=0;i<3;i++){s.rect(9+i*1.4,ay-6,1.2,5,'#bfe6ff');s.rect(9+i*1.4,ay-7,1.2,1,'#2f6fb0')}s.rect(1,hy-3,11,2,'#e8e8e8');for(let i=2;i<11;i+=2)s.rect(i,hy-5,1,2,'#bfe6ff')}
  if(o.goods==='snacks'){s.rect(8,ay-5,5,4,'#e8c31c');s.rect(8,ay-3,5,1,'#c41e1e');s.rect(9,ay-8,4,3,'#2f8a5a');s.rect(1,hy-3,11,3,'#c9a24a');s.rect(2,hy-4,3,1,'#e8c31c');s.rect(6,hy-4,3,1,'#d93636')}
  if(o.goods==='drinks'){s.rect(9,ay-6,2,5,'#6a1a10');s.rect(9,ay-7,2,1,'#c41e1e');s.rect(11,ay-5,1.4,4,'#2f8a3a');s.rect(1,hy-3,11,2,'#d93636');for(let i=2;i<11;i+=2)s.rect(i,hy-6,1,3,'#6a1a10')}
  return bake(s)}
const SELLERS=SELL.map(o=>[0,1].map(f=>{const d=seller(o,f);return{day:d,night:tinted(d,'rgba(10,14,42,.55)')}}));
function floors(R,L,x0,x1,top,b){for(let y=top+3;y<b-9;y+=5){R(x0+1,y,x1-x0-2,2,'#5d6976');for(let c=x0+2;c<x1-2;c+=4)R(c,y,1,2,'#f4f1ea');R(x0,y+2,x1-x0,1,'#d9d4c8');for(let c=x0+1;c<x1-3;c+=4)if(Math.random()<.45)L(c+1,y,3,2,'#ffd58a')}}
// face-me-I-face-you compound: long bungalow, many doors, rusty zinc roof
function faceMe(R,L,x,b,w,col,r){const h=16;R(x,b-h,w,h,col);for(let i=0;i<w/5;i++)R(x+r()*w,b-6-r()*8,2+r()*3,1+r()*2,'rgba(90,70,50,.16)');R(x,b-3,w,3,'rgba(60,40,20,.18)');
  for(let c=x+3;c<x+w-8;c+=12){R(c,b-11,5,11,'#6b4a2e');R(c+1,b-10,3,10,'#7d5a38');R(c+7,b-12,3,4,'#3a3a40');R(c+7,b-12,3,1,'#999');if(r()<.5)L(c+7,b-12,3,4,'#ffcf7a');if(r()<.3)L(c+1,b-10,3,10,'rgba(255,200,120,.5)')}
  for(let k=0;k<6;k++)R(x-3+k,b-h-6+k,w+6-2*k,1,k%2?'#8a5236':'#a5623e');for(let c=x-2;c<x+w+2;c+=3)R(c,b-h-5,1,5,'rgba(0,0,0,.14)');for(let i=0;i<w/14;i++)R(x+r()*w,b-h-5+r()*4,4,1,'#6a3a24');
  if(r()<.75){const ly=b-14;R(x+2,ly,w-4,1,'#4a4a4a');for(let c=x+5;c<x+w-6;c+=5+(r()*4|0))R(c,ly+1,3,3+(r()*3|0),['#d93636','#2f6fb0','#e8c31c','#f4f4f4','#2f8a5a','#7b3fa0'][r()*6|0])}
  if(r()<.6){R(x+w-11,b-6,4,5,'#2f6fb0');R(x+w-5,b-5,3,1,'#c43c3c');R(x+w-5,b-4,1,3,'#c43c3c');R(x+w-3,b-4,1,3,'#c43c3c')}
  if(r()<.5){R(x+6,b-9,3,3,SKIN);R(x+5,b-6,5,3,'#2f8a5a')}}
// regular Lagos building: 2-3 floors, burglar-proof windows, shop at the bottom, black water tank on the roof
const SIGNC=[['#d93636','#ffffff'],['#1f4f8a','#ffffff'],['#0a6a2a','#ffffff'],['#e8c31c','#3a1a0a']];
function shopBlock(R,L,x,b,w,h,col,sign,r){R(x,b-h,w,h,col);R(x+w-4,b-h,4,h,'rgba(0,0,0,.12)');
  for(let y=b-h+3;y<b-18;y+=10){for(let c=x+3;c<x+w-6;c+=9){R(c,y,6,5,'#4f5f6c');for(let k=c;k<c+6;k+=2)R(k,y,1,5,'#9aa0a6');if(r()<.45)L(c,y,6,5,'#ffd27a')}R(x+2,y+6,w-4,1,'#8a8f94');R(x+2,y+7,w-4,1,'rgba(0,0,0,.2)')}
  R(x+2,b-10,w-4,10,'#6a6f74');for(let c=x+3;c<x+w-3;c+=3)R(c,b-10,1,10,'#555a5f');L(x+2,b-10,w-4,10,'rgba(255,214,140,.55)');
  const txt=sign.slice(0,Math.floor((w-8)/4)),sw=textW(txt)+4,sx=x+Math.max(1,(w-sw)>>1),[bg,fg]=SIGNC[r()*4|0];
  R(sx,b-17,sw,7,bg);text(R,sx+2,b-16,txt,fg);L(sx,b-17,sw,7,bg);text(L,sx+2,b-16,txt,fg);
  R(x+4,b-h-6,6,6,'#151515');R(x+5,b-h-7,4,1,'#151515');if(r()<.5){R(x+w-12,b-h-4,5,3,'#d8d8d8');R(x+w-10,b-h-1,1,1,'#888')}}

// ===================== SCENERY =====================
const RW=1800;                   // road distance covered by each region
const P_NEAR=.8,P_FAR=.45,P_HAZE=.2;
const NH=120,FH=190,HH=130;      // layer heights
const LANDMARKS=[];              // {n,city,wx}
let FLARES=[];                   // flame positions in the far layer

function block(R,L,x,b,w,h,col,o={}){const r=rng(o.seed||(x*13+h));R(x,b-h,w,h,col);if(o.shade!==false)R(x+w-Math.max(2,w*.12|0),b-h,Math.max(2,w*.12|0),h,'rgba(0,0,0,.14)');
  const wc=o.win||'#5d6f7c',fw=o.fw||2,fh=o.fh||2,gx=o.gx||4,gy=o.gy||4;
  if(o.glass){for(let y=b-h+2;y<b-2;y+=gy)R(x,y,w,1,'rgba(255,255,255,.16)');R(x+2,b-h,1,h,'rgba(255,255,255,.22)');
    for(let y=b-h+2;y<b-3;y+=gy)for(let c=x+1;c<x+w-1;c+=3)if(r()<.38)L(c,y+1,2,1,'#cfe6ff')}
  else for(let y=b-h+3;y<b-3;y+=gy)for(let c=x+2;c<x+w-2;c+=gx){R(c,y,fw,fh,wc);if(r()<.42)L(c,y,fw,fh,'#ffd27a')}
  if(o.tank){R(x+2,b-h-3,4,3,'#1d1d1f');R(x+3,b-h-4,2,1,'#1d1d1f')}
  if(o.mast&&h>70){R(x+(w>>1),b-h-8,1,8,'#888');L(x+(w>>1),b-h-9,1,1,'#ff3030')}}
function fillers(R,L,a,e,b,seed,kind){const r=rng(seed);let x=a;
  const pal={lagos:['#c9c2b3','#b7c1c9','#d6cbb6','#a9b6bd','#c4b8a6'],glass:['#5f8fb8','#3e6f9c','#7ba7c9','#4c7f8f','#6a8fa8'],abuja:['#e6dccb','#d9cdb8','#efe6d6','#cdbfa6'],ph:['#b9b9b0','#a8aea8','#c6c0b2','#9aa4a0']};
  while(x<e-8){const w=Math.min(e-x,12+(r()*22|0));const tall=kind==='lagos'&&r()<.5;
    const h=kind==='abuja'?14+(r()*30|0):kind==='ph'?14+(r()*40|0):tall?50+(r()*60|0):18+(r()*40|0);
    const P=tall?pal.glass:pal[kind]||pal.lagos;block(R,L,x,b,w,h,P[r()*P.length|0],{glass:tall,tank:!tall&&r()<.5,mast:true,seed:r()*1e9|0});x+=w+1+(r()*5|0)}}
function disc(R,cx,cy,rad,c){for(let y=-rad;y<=rad;y++){const w=Math.round(Math.sqrt(rad*rad-y*y));R(cx-w,cy+y,w*2,1,c)}}
function lineR(R,x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))+1;for(let i=0;i<=n;i++)R(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),1,1,c)}
function palm(R,x,b,h,r){let cx=x;for(let i=0;i<h;i++){cx=x+Math.round(Math.sin(i/h*1.6)*3);R(cx,b-i,2,1,i%3?'#7a5a3a':'#5e4329')}
  const ty=b-h;for(const[dx,dy]of[[-10,4],[-8,-3],[-3,-6],[4,-6],[9,-2],[11,4],[6,6],[-6,6]]){lineR(R,cx,ty,cx+dx,ty+dy,'#2f7a35');lineR(R,cx+1,ty,cx+dx+1,ty+dy+1,'#1f5a28')}R(cx-1,ty+1,2,2,'#5a3d1d')}
function tree(R,x,b,rad,col,col2){R(x-1,b-rad-4,2,rad+4,'#5e4329');disc(R,x,b-rad-6,rad,col);disc(R,x-rad*.3|0,b-rad-7-rad*.2|0,rad*.55|0,col2)}
function sign(R,L,x,b,str,o={}){const w=textW(str)+6,h=9,top=b-(o.h||14);if(b-top-h>0){R(x+2,top+h,1,b-top-h,'#555');R(x+w-3,top+h,1,b-top-h,'#555')}
  R(x,top,w,h,o.bg||'#f4f1e6');R(x,top+h-1,w,1,'rgba(0,0,0,.2)');text(R,x+3,top+2,str,o.fg||'#1f5a33');
  if(o.lit!==false){L(x,top,w,h,o.litBg||'rgba(255,245,210,.9)');text(L,x+3,top+2,str,o.fg||'#1f5a33')}}
function water(R,L,x,w,top,b){R(x,top,w,b-top,'#3f7ea0');const r=rng(x|0);for(let i=0;i<w*(b-top)/40;i++){const y=top+1+r()*(b-top-1)|0;R(x+r()*w,y,2+r()*5,1,r()<.6?'#6faccc':'#2f6585')}
  for(let i=0;i<w/10;i++)L(x+r()*w,top+1+r()*(b-top-1)|0,3,1,'rgba(255,215,140,.35)')}
function halfDome(R,cx,by,r,c){for(let dy=-r;dy<=0;dy++){const w=Math.round(Math.sqrt(r*r-dy*dy));R(cx-w,by+dy,w*2,1,c)}}
// Mile 2 Station, Amuwo-Odofin (from the user's photo): grey tiled block, rooftop sign, teal-roofed walkway on pillars, danfos parked underneath
function mile2(R,L,x,b){
  R(x,b-64,176,40,'#b9bec4');for(let y=b-62;y<b-24;y+=4)R(x,y,176,1,'#a7adb4');for(let c=x+4;c<x+176;c+=6)R(c,b-64,1,40,'#adb3ba');R(x,b-64,176,2,'#d4d8dc');R(x+170,b-64,6,40,'rgba(0,0,0,.12)');
  for(let c=x+8;c<x+168;c+=14){R(c,b-58,8,18,'#3a3f46');R(c+1,b-57,6,16,'#c9b98a');R(c+1,b-57,6,3,'#e2d6a8');L(c+1,b-57,6,16,'#ffe2a0')}
  // rooftop sign on posts
  const sx=x+60;for(let c=sx+2;c<sx+66;c+=8)R(c,b-70,1,6,'#9aa0a6');disc(R,sx-4,b-74,3,'#1f4fb0');R(sx-5,b-75,2,2,'#f4f4f4');
  text((xx,yy,w,h,c)=>R(xx,yy,w,h,c),sx+2,b-76,'MILE 2 STATION','#1f4fb0');text(L,sx+2,b-76,'MILE 2 STATION','#8fb4ff');L(sx-7,b-77,4,6,'#8fb4ff');
  // walkway: teal canopy, railing, pillars
  for(let k=0;k<4;k++)R(x-14+k,b-28+k,214-2*k,1,k<2?'#3fa5b0':'#2f8590');
  R(x-12,b-24,210,8,'#4a5058');R(x-12,b-17,210,2,'#c9c6bb');for(let c=x-10;c<x+196;c+=3)R(c,b-23,1,6,'#7d8a96');R(x-12,b-23,210,1,'#9aa6b2');
  L(x-12,b-25,210,1,'rgba(180,255,250,.7)');
  for(let c=x-6;c<x+196;c+=24)R(c,b-15,3,11,'#cfccc2');
  // danfos and white buses parked underneath, hedge in front
  R(x-12,b-15,210,10,'rgba(30,34,40,.55)');
  for(let i=0;i<9;i++){const bx=x-10+i*22,y=b-12,c=i%3===2?'#eef0f2':'#f4b400';R(bx,y,18,7,c);R(bx+1,y+1,13,3,'#3d5a70');R(bx+15,y+1,2,3,'#3d5a70');if(c!=='#eef0f2'){R(bx,y+4,18,1,'#141414')}R(bx+3,y+7,3,1,'#141414');R(bx+12,y+7,3,1,'#141414');L(bx+17,y+4,1,1,'#fff6cf')}
  R(x-14,b-6,214,3,'#3f8a3a');for(let c=x-14;c<x+200;c+=4)R(c,b-7,2,1,'#4fa04a');
}
// roadside billboards (invented local ads), lit at night
const BOARDS=[['NAIJA\'S NUMBERS','PLAY EVERY DAY','#0f6a3a','#ffffff','#e8c31c'],['FRESH ZOBO','N500 A BOTTLE','#7a1a3a','#ffd6e6','#ff5ab0'],['JOLLOF WARS','THIS FRIDAY','#d9541e','#fff3c4','#ffe066'],
  ['SUYA SPOT','OPEN TILL 2AM','#2a1a12','#ffcf6b','#d93636'],['ABUJA TECH','WEEK 2026','#1f3b8a','#ffffff','#53d9ea'],['LAGOS-ABUJA','FLY IN 1 HOUR','#f4f4f0','#1f3b8a','#2f6fb0'],
  ['GARDEN CITY','CARNIVAL','#5a1f8a','#ffe066','#ff9a1a'],['PEPPER SOUP','FRESH CATFISH','#8a1f14','#fff3c4','#e8c31c']];
function billboard(R,L,x,b,k){const[a,c,bg,fg,ac]=BOARDS[k%BOARDS.length],w=Math.max(textW(a),textW(c))+16,h=17,top=b-56;
  R(x+6,top+h,2,b-top-h,'#6a6f74');R(x+w-8,top+h,2,b-top-h,'#6a6f74');R(x+4,top+h,w-8,1,'#555a5f');for(let y=top+h+4;y<b-6;y+=5)R(x+6,y,w-12,1,'rgba(90,95,100,.55)');
  R(x-1,top-1,w+2,h+2,'#2a2a2e');R(x,top,w,h,bg);R(x,top,3,h,ac);R(x+w-3,top,3,h,ac);text(R,x+(w-textW(a))/2|0,top+3,a,fg);text(R,x+(w-textW(c))/2|0,top+10,c,ac);
  for(let i=x+4;i<x+w-4;i+=12){R(i,top-4,1,3,'#555');R(i,top-4,3,1,'#555')}
  L(x,top,w,h,bg);L(x,top,3,h,ac);L(x+w-3,top,3,h,ac);text(L,x+(w-textW(a))/2|0,top+3,a,fg);text(L,x+(w-textW(c))/2|0,top+10,c,ac);for(let i=x+4;i<x+w-4;i+=12)L(i+2,top-3,1,1,'#fff6cf')}
function flag(R,x,y,cols,base){R(x,y,1,(base??y+14)-y,'#ddd');cols.forEach((c,i)=>R(x+1+i*2,y,2,5,c))}
function horse(R,x,b,f){const B='#6b3e22';R(x+3,b-11,12,5,B);R(x+13,b-15,3,5,B);R(x+15,b-16,4,3,B);R(x+18,b-15,1,2,'#111');R(x+2,b-11,2,3,'#2a1a10');
  if(f){lineR(R,x+4,b-6,x+1,b-1,B);lineR(R,x+6,b-6,x+7,b,B);lineR(R,x+13,b-6,x+16,b-2,B);lineR(R,x+14,b-6,x+12,b,B)}else{lineR(R,x+4,b-6,x+5,b,B);lineR(R,x+6,b-6,x+3,b-1,B);lineR(R,x+13,b-6,x+14,b,B);lineR(R,x+14,b-6,x+17,b-1,B)}
  R(x+8,b-18,3,3,SKIN);R(x+8,b-19,3,1,'#f4f4f4');R(x+7,b-15,5,5,'#f4f4f4');R(x+8,b-10,2,4,'#e8e0c8');lineR(R,x+11,b-14,x+19,b-3,'#c9a46a');R(x+19,b-3,2,1,'#c9a46a')}
function ground(R,x,w,b,top,c1,c2,seed){R(x,top,w,b-top,c1);const r=rng(seed);for(let i=0;i<w/4;i++)R(x+r()*w,top+r()*(b-top),1+r()*2,1,c2)}

const REGIONS={
lagos:{city:'Lagos',
  sky:{d:['#2f86d8','#4a98de','#66aae3','#86bde8','#aed2ea','#dbe7e2'],n:['#05071a','#080c26','#0d1333','#141a40','#1d234d','#2c2c58']},
  haze:{d:'rgba(190,215,235,.3)',n:'rgba(18,24,58,.35)'},under:['#9a948a','#7f7a72'],
  hazeL(R,L,x,b){const r=rng(5);let i=x;while(i<x+360){const w=6+(r()*14|0),h=10+(r()*60|0);R(i,b-h,w,h,'#a7bccd');i+=w}},
  far(R,L,x,b){ground(R,x,810,b,b-8,'#7f8f86','#6b7d74',1);
    fillers(R,L,x,x+18,b,11,'lagos');fillers(R,L,x+158,x+188,b,12,'lagos');fillers(R,L,x+252,x+278,b,13,'lagos');fillers(R,L,x+308,x+330,b,14,'lagos');
    // Federal Palace Hotel: long white block, taller centre tower with the logo, porch and flag
    {const cx=x+22;R(cx,b-38,30,38,'#e9e5dc');R(cx+30,b-44,48,44,'#efece4');R(cx+98,b-42,32,42,'#efece4');R(cx+78,b-58,20,58,'#e6e1d6');R(cx+95,b-58,3,58,'rgba(0,0,0,.08)');
      floors(R,L,cx,cx+30,b-38,b);floors(R,L,cx+30,cx+78,b-44,b);floors(R,L,cx+98,cx+130,b-42,b);
      R(cx+82,b-54,12,24,'#d8d2c4');lineR(R,cx+85,b-51,cx+85,b-37,'#3a3a3a');lineR(R,cx+88,b-53,cx+88,b-34,'#3a3a3a');lineR(R,cx+91,b-50,cx+90,b-38,'#3a3a3a');R(cx+81,b-29,14,3,'#3a3a3a');L(cx+81,b-29,14,3,'#fff2c0');
      R(cx,b-9,130,9,'#3f4a54');L(cx+2,b-8,126,5,'rgba(255,220,160,.7)');R(cx+40,b-13,36,2,'#1f3b33');R(cx+42,b-11,1,11,'#ddd');R(cx+73,b-11,1,11,'#ddd');
      flag(R,cx+66,b-28,['#0a8a3a','#f4f4f4','#0a8a3a'],b-13);palm(R,cx+12,b-2,40);LANDMARKS.push(['Federal Palace Hotel','Victoria Island',cx+65,P_FAR])}
    // Civic Centre Towers: green glass tower on a grey podium, stepped lattice spire
    {const cx=x+192;R(cx,b-16,56,16,'#a9acae');R(cx,b-16,56,2,'#c9ccce');R(cx+2,b-13,52,2,'#4a4f54');R(cx+22,b-10,12,8,'#2a5a4e');L(cx+2,b-13,52,2,'#fff2c0');
      const tx=cx+9,tw=38,th=58,tt=b-16-th;for(let c=0;c<tw;c++)R(tx+c,tt,1,th,c<4?'#174a42':c<14?'#1d5a50':c<20?'#2d7a6a':c<30?'#1f6155':'#164a42');
      for(let y=tt+2;y<b-16;y+=3)R(tx,y,tw,1,'rgba(0,0,0,.12)');R(tx,tt,tw,1,'#cfd3d0');
      for(let y=tt+3;y<b-18;y+=3)for(let c=tx+1;c<tx+tw-1;c+=3)if(Math.random()<.3)L(c,y,2,1,'#9ff0dc');
      R(tx+12,tt-8,14,8,'#d9dcd8');R(tx+12,tt-5,14,2,'#2d7a6a');
      for(let i=0;i<38;i++){const w=Math.max(1,Math.round(11-i*.28));R(tx+19-Math.floor(w/2),tt-9-i,w,1,i%3===0?'#7a817e':'#d2d6d3');if(i%6===0)L(tx+19-Math.floor(w/2),tt-9-i,w,1,'#fff2c0')}
      L(tx+19,tt-48,1,2,'#ff3030');LANDMARKS.push(['Civic Centre Towers','Victoria Island',tx+19,P_FAR])}
    // NECOM House
    {const cx=x+282;R(cx,b-102,24,102,'#cdc6b6');for(let y=b-100;y<b-4;y+=4){R(cx+1,y,22,2,'#5d717e');for(let c=cx+1;c<cx+23;c+=3)if(Math.random()<.45)L(c,y,2,1,'#ffd88a')}R(cx+20,b-102,4,102,'#b2ab9b');
      R(cx+5,b-110,14,8,'#bdbdbd');R(cx+11,b-136,2,26,'#dadada');R(cx+8,b-126,8,1,'#c8c8c8');disc(R,cx+5,b-116,2,'#f0f0f0');disc(R,cx+19,b-121,2,'#f0f0f0');L(cx+11,b-137,2,2,'#ff3030');LANDMARKS.push(['NECOM House','Marina',cx+12,P_FAR])}
    // Microsoft building, Alfred Rewane Rd
    {const cx=x+334,w=56,h=58;R(cx-2,b-h-2,w+4,3,'#eef2f5');R(cx,b-h+1,w,h-1,'#22364a');for(let y=b-h+8;y<b-10;y+=8){R(cx,y,w,1,'#c9d2da');for(let f=cx;f<cx+w-4;f+=6)if(Math.random()<.6)L(f+1,y+1,5,6,'rgba(190,226,255,.6)')}
      for(let f=cx;f<cx+w;f+=6)R(f,b-h+1,1,h-1,'#e3e9ee');R(cx+8,b-10,40,10,'#7aa7c7');L(cx+8,b-10,40,10,'rgba(255,230,180,.75)');LANDMARKS.push(['Microsoft building','Alfred Rewane Rd, Ikoyi',cx+28,P_FAR])}
    // Lekki-Ikoyi Link Bridge: crossed A-frame pylon, fanned cables, curved deck
    {const x0=x+410,w=395,px=x0+170,top=b-132,deck=i=>Math.round(b-22-6*Math.sin(Math.PI*i/w));
      R(x0-4,b-12,w+8,12,'#4f86a6');R(x0-10,b-12,7,12,'#c9b98a');R(x0+w+3,b-12,7,12,'#c9b98a');const r=rng(77);for(let i=0;i<120;i++)R(x0+r()*w,b-11+r()*10,2+r()*4,1,r()<.6?'#7fb5d0':'#3f7090');
      for(let i=24;i<w;i+=40)R(x0+i,deck(i)+3,4,b-12-deck(i)-1,'#c9c6bb');
      const legX=(s,y)=>{const f=(b-10-y)/(b-10-top);return px+s*15-s*17*f};
      for(let k=0;k<8;k++){const ay=top+8+k*4;for(const s of[-1,1]){const di=170+s*(18+k*19);const ax=legX(-s,ay);lineR(R,ax,ay,x0+di,deck(di),'#d8dde2');lineR(L,ax,ay,x0+di,deck(di),k%2?'#5fd4ff':'#b77bff')}}
      for(let i=0;i<w;i++){const y=deck(i);R(x0+i,y,1,3,'#e7e7e2');R(x0+i,y+3,1,1,'#9b9b96');if(i%4===0)L(x0+i,y,1,1,'#fff0b0')}
      for(let y=top;y<b-10;y++)for(const s of[-1,1]){const lx=Math.round(legX(s,y));R(lx-2,y,5,1,'#dcd8cc');R(lx+1,y,2,1,'#b9b5a9');L(lx,y,1,1,s<0?'#d58bff':'#5fd4ff')}
      R(px-9,b-62,19,4,'#d0ccc0');R(px-9,b-61,19,1,'#b9b5a9');R(px-19,b-12,39,4,'#c9c6bb');LANDMARKS.push(['Lekki–Ikoyi Link Bridge','Ikoyi to Lekki',px,P_FAR])}
  },
  near(R,L,x,b){ground(R,x,1440,b,b-6,'#5e8f4a','#4a7a3a',2);
    // Ikoyi Club 1938
    {const cx=x+70;R(cx+120,b-26,60,20,'#6fae5a');R(cx+168,b-40,1,16,'#eee');R(cx+169,b-40,5,3,'#e02a2a');
      R(cx,b-28,140,22,'#efe6d2');for(let c=cx+4;c<cx+136;c+=10){R(c,b-22,5,9,'#2f5d3a');R(c+1,b-23,3,1,'#2f5d3a');L(c+1,b-21,3,7,'#ffd27a')}
      R(cx,b-14,140,8,'#e4d9bf');for(let c=cx;c<cx+141;c+=7)R(c,b-14,2,8,'#ffffff');
      for(let i=0;i<10;i++)R(cx-4+i,b-38+i,148-2*i,1,i<2?'#7f3a24':'#a5482f');R(cx+56,b-46,28,8,'#a5482f');R(cx+60,b-48,20,2,'#7f3a24');
      sign(R,L,cx-58,b,'IKOYI CLUB 1938',{bg:'#1f5a33',fg:'#f4e9c8',litBg:'rgba(40,110,70,.95)'});
      palm(R,cx-6,b-4,30,null);palm(R,cx+150,b-4,34,null);LANDMARKS.push(['Ikoyi Club 1938','Ikoyi',cx+70,P_NEAR])}
    // Lagos Polo Club
    {const cx=x+420;R(cx,b-16,280,10,'#73b35c');horse(R,cx+60,b-8,0);horse(R,cx+118,b-9,1);
      R(cx+180,b-34,76,26,'#f2f0ea');for(let c=cx+180;c<cx+256;c+=8)R(c,b-36,4,4,'#1f7a43');R(cx+180,b-36,76,1,'#145a30');for(let c=cx+184;c<cx+252;c+=6)R(c,b-28,3,12,'#c9c4b6');L(cx+182,b-30,72,2,'rgba(255,230,170,.8)');
      for(let c=cx;c<cx+280;c+=6)R(c,b-14,1,8,'#ffffff');R(cx,b-12,280,1,'#ffffff');R(cx,b-9,280,1,'#ffffff');
      flag(R,cx+262,b-40,['#0a8a3a','#f4f4f4','#0a8a3a'],b-7);sign(R,L,cx-70,b,'LAGOS POLO CLUB',{bg:'#f4f1e6',fg:'#1f3b6b'});LANDMARKS.push(['Lagos Polo Club','Ikoyi',cx+140,P_NEAR])}
    // villas and a kiosk
    {const r=rng(31);for(let i=0;i<5;i++){const cx=x+780+i*72,h=26+(r()*16|0);R(cx,b-h,52,h,['#efe0c8','#f1f1ee','#e8d4c0'][i%3]);for(let c=cx+5;c<cx+48;c+=9){R(c,b-h+5,5,5,'#5d6f7c');L(c,b-h+5,5,5,'#ffd27a')}
      for(let k=0;k<6;k++)R(cx-2+k,b-h-6+k,56-2*k,1,'#7a3a2a');R(cx-6,b-14,64,8,'#e9e4dc');for(let k=0;k<12;k++)R(cx-6+r()*62,b-15+r()*3,2,2,'#e0459a');palm(R,cx+60,b-6,24+(r()*10|0))}
      R(x+1180,b-16,22,10,'#e8c31c');R(x+1176,b-22,30,3,'#d93636');R(x+1189,b-20,1,4,'#888');text(R,x+1182,b-14,'GSM','#1a1a1a');L(x+1180,b-16,22,10,'rgba(255,220,120,.6)')}
    for(const px of[x+1250,x+1300,x+1370,x+1420])palm(R,px,b-4,26+(px%7)*2);
    billboard(R,L,x+252,b,0);billboard(R,L,x+1300,b,1);
  }},
mainland:{city:'Lagos Mainland',under:['#8f887c','#77716a'],
  hazeL(R,L,x,b){const r=rng(9);let i=x;while(i<x+360){const w=6+(r()*12|0),h=8+(r()*34|0);R(i,b-h,w,h,'#a9bccb');i+=w}},
  far(R,L,x,b){ground(R,x,810,b,b-8,'#8a8f80','#767b6c',7);
    fillers(R,L,x,x+52,b,81,'lagos');fillers(R,L,x+212,x+292,b,82,'lagos');fillers(R,L,x+462,x+478,b,83,'lagos');fillers(R,L,x+730,x+810,b,84,'lagos');
    // National Theatre, Iganmu: low podium, flared drum with fins, sloped "cap" rim
    {const cx=x+60;R(cx,b-12,140,12,'#d6cfbe');R(cx,b-12,140,1,'#eee8da');R(cx+2,b-8,136,3,'#4a4640');for(let c=cx+4;c<cx+136;c+=5)L(c,b-8,3,3,'#ffcf6b');
      R(cx+12,b-19,116,7,'#e2dccd');R(cx+14,b-16,112,2,'#5a5650');for(let c=cx+16;c<cx+124;c+=4)L(c,b-16,2,2,'#ffe2a0');
      const bx0=cx+32,bx1=cx+108,x0=bx0-18,x1=bx1+18,rimY=xx=>Math.round(b-46-(xx-x0)/(x1-x0)*7);
      for(let xx=x0;xx<=x1;xx++){const ry=rimY(xx);for(let y=ry+3;y<b-19;y++){const ext=(b-19-y)*.62;if(xx>=bx0-ext&&xx<=bx1+ext)R(xx,y,1,1,'#625d55')}}
      for(let k=0;k<=12;k++){const f=k/12,xb=bx0+(bx1-bx0)*f,xt=x0+2+(x1-x0-4)*f,yt=rimY(xt)+3;lineR(R,xb,b-20,xt,yt,'#f2eee4');lineR(R,xb+1,b-20,xt+1,yt,'#cfc9bc')}
      for(let xx=bx0-8;xx<=bx1+8;xx++)R(xx,b-32,1,2,'#ebe6da');
      for(let xx=x0;xx<=x1;xx++){const y=rimY(xx);R(xx,y,1,3,'#f4f0e6');R(xx,y+3,1,1,'#bdb7aa');L(xx,y+1,1,1,'rgba(255,236,190,.8)')}
      L(bx0-6,b-31,bx1-bx0+12,1,'rgba(255,220,150,.6)');LANDMARKS.push(['National Theatre','Iganmu',cx+70,P_FAR])}
    // National Stadium, Surulere: concrete bowl with four floodlight masts
    {const cx=x+300,w=156;for(let i=0;i<w;i++){const f=i/w,h=Math.round(14+12*Math.sin(Math.PI*f));R(cx+i,b-h,1,h,'#bdb8ac');if(i%4===0)R(cx+i,b-h+2,1,h-6,'#a6a194')}
      R(cx,b-7,w,7,'#9a958a');for(let c=cx+4;c<cx+w-4;c+=6)R(c,b-6,3,5,'#3a3a3a');
      for(const mx of[cx+8,cx+58,cx+96,cx+146]){R(mx,b-76,2,76,'#8a8f94');R(mx-4,b-82,10,6,'#6a6f74');for(let k=0;k<4;k++)R(mx-3+k*2,b-81,1,4,'#f4f4e8');L(mx-4,b-82,10,6,'rgba(255,255,230,.85)')}
      LANDMARKS.push(['National Stadium','Surulere',cx+78,P_FAR])}
    lagosCentralMosque(R,L,x+532,b);LANDMARKS.push(['Lagos Central Mosque','Lagos Island',x+532,P_FAR]);marinaCathedral(R,L,x+680,b);LANDMARKS.push(['Cathedral Church of Christ','Marina',x+690,P_FAR]);
  },
  near(R,L,x,b){ground(R,x,1440,b,b-6,'#8a7a60','#76684f',8);const r=rng(91);
    const signs=['PROVISIONS','BUKA','PHONE REPAIR','SALON','PHARMACY','CHEMIST','TAILOR','VULCANIZER'];let cx=x+10,si=0,kind=0;
    let m2=0;while(cx<x+1400){if(!m2&&cx>x+520){mile2(R,L,cx+16,b-4);LANDMARKS.push(['Mile 2 Station','Amuwo-Odofin',cx+104,P_NEAR]);cx+=236;m2=1;continue}if(kind%5===3){((kind/5|0)%2?smallChurch:smallMosque)(R,L,cx,b-4);cx+=54;kind++;continue}if(kind%3!==1){const w=80+(r()*40|0);faceMe(R,L,cx,b-4,w,['#e8dcc0','#cfe0e6','#efd2bc','#d8e4c8'][r()*4|0],r);cx+=w+6+(r()*6|0)}
      else{const w=48+(r()*22|0),h=32+(r()*16|0);shopBlock(R,L,cx,b-4,w,h,['#efe6d2','#f2d9a8','#cfe3d4','#e6d0d8'][r()*4|0],signs[si++%signs.length],r);cx+=w+6}kind++}
    const poles=[];for(let px=x+40;px<x+1440;px+=130)poles.push(px);
    for(let i=0;i+1<poles.length;i++){const a=poles[i],c=poles[i+1];for(const dy of[-48,-45])for(let s2=0;s2<=c-a;s2++)R(a+s2,b+dy+Math.round(Math.sin(Math.PI*s2/(c-a))*6),1,1,'#2a2a2a')}
    for(const px of poles){R(px,b-50,2,46,'#5e4329');R(px-5,b-48,12,1,'#5e4329')}
    billboard(R,L,x+96,b,2);billboard(R,L,x+1120,b,3);
  }},
abuja:{city:'Abuja',
  sky:{d:['#b5a68a','#c0af90','#cab895','#d3c09a','#dbc79f','#e2cca2'],n:['#0d0a12','#16111a','#211922','#2c2128','#3a2b2c','#4a3830']},
  haze:{d:'rgba(224,202,160,.55)',n:'rgba(60,44,40,.5)'},under:['#b08a5e','#946f48'],
  hazeL(R,L,x,b){for(let i=0;i<360;i++){const h=18+Math.sin(i/30)*10+Math.sin(i/11)*4;R(x+i,b-h,1,h,'#bfae90')}},
  far(R,L,x,b){ground(R,x,810,b,b-10,'#b49a6a','#9c8458',3);
    // Zuma Rock
    {const cx=x+110;for(let i=-80;i<=80;i++){const h=Math.round(108*Math.pow(1-Math.pow(Math.abs(i)/80,2.4),.55));R(cx+i,b-h,1,h,i<-30?'#8a7a66':'#776654');if(i%7===0&&h>10)R(cx+i,b-h+6,1,h-10,'#5e5044')}
      for(let i=-60;i<40;i+=13)R(cx+i,b-80,2,30,'#4f4338');R(cx+10,b-70,6,3,'#4f4338');R(cx+12,b-60,3,8,'#4f4338');LANDMARKS.push(['Zuma Rock','near Abuja',cx,P_FAR])}
    // Aso Rock
    {const cx=x+320;for(let i=-90;i<=90;i++){const h=Math.round(64*Math.pow(1-Math.pow(Math.abs(i)/90,2),.7)+Math.sin(i/9)*3);R(cx+i,b-h,1,h,'#8c7c62')}LANDMARKS.push(['Aso Rock','Asokoro',cx,P_FAR])}
    // National Mosque
    {const cx=x+500;R(cx-36,b-24,72,24,'#f2efe6');for(let c=cx-32;c<cx+32;c+=6){R(c,b-18,3,8,'#7a8f7a');L(c,b-18,3,8,'#ffd58a')}R(cx-16,b-32,32,8,'#efe9dc');halfDome(R,cx,b-32,16,'#d9a62b');disc(R,cx-6,b-40,3,'#f3cd5c');R(cx,b-54,1,6,'#d9a62b');
      for(const mx of[cx-50,cx+46])R(mx,b-92,4,92,'#f4f1ea'),R(mx-1,b-94,6,2,'#d9a62b'),R(mx+1,b-100,2,6,'#d9a62b'),R(mx-1,b-60,6,2,'#d9d4c6'),L(mx+1,b-102,2,2,'#ffe28a');
      for(const mx of[cx-40,cx+36])R(mx,b-84,3,84,'#ddd8cc');LANDMARKS.push(['National Mosque','Central Area',cx,P_FAR])}
    // National Christian Centre
    {const cx=x+640;R(cx-30,b-26,60,26,'#f4f2ee');for(let i=0;i<70;i++)R(cx-14+Math.floor(i/5),b-26-i,28-2*Math.floor(i/5),1,i%10<1?'#c9c4b6':'#efede6');R(cx,b-104,1,10,'#c9c4b6');R(cx-3,b-100,7,1,'#c9c4b6');
      for(let c=cx-26;c<cx+26;c+=6){R(c,b-18,3,10,'#6f8ca3');L(c,b-18,3,10,'#ffd58a')}L(cx-1,b-60,3,30,'rgba(255,240,200,.6)');LANDMARKS.push(['National Christian Centre','Central Area',cx,P_FAR])}
    // Millennium Tower
    {const cx=x+748;R(cx-2,b-150,5,150,'#e9e9ee');R(cx-1,b-176,3,26,'#d0d0d8');R(cx-14,b-132,29,3,'#d6dbe6');R(cx-10,b-129,21,2,'#b9c2d4');L(cx-14,b-131,29,1,'#9fd8ff');L(cx,b-177,1,2,'#ff3030');LANDMARKS.push(['Millennium Tower','Central Area',cx,P_FAR])}
  },
  near(R,L,x,b){ground(R,x,1440,b,b-7,'#b8955f','#c9a874',4);const r=rng(51);for(let i=0;i<120;i++)R(x+r()*1440,b-7-r()*3,1,2+r()*3,'#9a8a4a');
    // Abuja City Gate
    {const cx=x+90;R(cx,b-66,16,60,'#e9e1cf');R(cx+92,b-66,16,60,'#e9e1cf');R(cx-4,b-76,116,12,'#e2d8c0');R(cx-4,b-76,116,2,'#ffffff');R(cx+14,b-64,2,58,'rgba(0,0,0,.15)');R(cx+106,b-64,2,58,'rgba(0,0,0,.15)');
      R(cx+16,b-63,76,3,'#0a8a3a');R(cx+46,b-72,16,8,'#0a8a3a');disc(R,cx+54,b-68,3,'#f4f4f4');
      sign(R,L,cx+20,b-58,'WELCOME TO ABUJA',{h:6,bg:'#f4f4f0',fg:'#0a6a2a',litBg:'rgba(255,248,220,.95)'});
      for(const px of[cx+2,cx+94]){for(let y=b-60;y<b-8;y+=8)R(px,y,12,1,'#d4c9b0');L(px,b-62,12,2,'rgba(255,230,170,.7)')}LANDMARKS.push(['Abuja City Gate','Airport Road',cx+54,P_NEAR])}
    // National Assembly
    {const cx=x+400;R(cx,b-30,170,23,'#f2efe8');for(let c=cx+4;c<cx+168;c+=8)R(c,b-26,3,19,'#ffffff'),R(c+3,b-26,1,19,'rgba(0,0,0,.12)');R(cx-2,b-32,174,3,'#d8d2c4');
      R(cx+60,b-42,50,10,'#ece7dc');halfDome(R,cx+85,b-42,22,'#3f8a5a');disc(R,cx+77,b-54,5,'#5fae7a');R(cx+85,b-68,1,4,'#ddd');
      for(let c=cx+8;c<cx+164;c+=8)L(c,b-24,2,14,'#ffd58a');L(cx+66,b-46,38,2,'rgba(160,255,200,.6)');flag(R,cx+180,b-46,['#0a8a3a','#f4f4f4','#0a8a3a'],b-6);LANDMARKS.push(['National Assembly','Three Arms Zone',cx+85,P_NEAR])}
    // Unity Fountain
    {const cx=x+760;R(cx,b-12,90,5,'#d9d2c2');R(cx+4,b-14,82,2,'#7fc4e0');for(let k=0;k<6;k++){const fx=cx+12+k*13;lineR(R,fx,b-14,fx,b-30-(k%2)*6,'#cfeeff');L(fx,b-30-(k%2)*6,1,16,'rgba(160,220,255,.8)')}
      for(let k=0;k<8;k++)flag(R,cx-30+k*20+(k>3?100:0),b-30,k%2?['#0a8a3a','#f4f4f4','#0a8a3a']:['#d93636','#e8c31c','#1f4f8a'],b-7);LANDMARKS.push(['Unity Fountain','Maitama',cx+45,P_NEAR])}
    for(const[tx,rad]of[[x+40,9],[x+260,11],[x+330,8],[x+640,10],[x+1100,12],[x+1180,9],[x+1300,11],[x+1390,8]])tree(R,tx,b-6,rad,'#4f7a3a','#6a9a4a');
    billboard(R,L,x+250,b,4);billboard(R,L,x+1130,b,5);
  }},
ph:{city:'Port Harcourt',
  sky:{d:['#4d5866','#57626e','#626c77','#6d7680','#79818a','#858b92'],n:['#06080c','#0b0f15','#11161d','#171d25','#1e252e','#262d36']},
  haze:{d:'rgba(118,126,136,.45)',n:'rgba(22,28,36,.5)'},under:['#55585c','#3e4145'],
  hazeL(R,L,x,b){const r=rng(8);for(let i=0;i<360;i+=3){const h=8+(r()*8|0);R(x+i,b-h,3,h,'#6f7a72')}},
  far(R,L,x,b){ground(R,x,810,b,b-10,'#2f4a35','#3d5c42',5);
    // Eleme refinery
    {const cx=x+30;for(const[tx,tw,th]of[[0,30,20],[34,22,16],[60,34,22],[170,28,18],[210,36,24]]){R(cx+tx,b-th,tw,th,'#d7d7d2');R(cx+tx,b-th,tw,2,'#ecece8');R(cx+tx+tw-4,b-th,4,th,'rgba(0,0,0,.12)');for(let k=0;k<tw;k+=6)R(cx+tx+k,b-th,1,th,'rgba(0,0,0,.06)')}
      for(const[tx,th]of[[110,70],[124,84],[140,60]]){R(cx+tx,b-th,6,th,'#b9bcbf');for(let y=b-th+6;y<b;y+=10)R(cx+tx-3,y,12,1,'#7d8186'),L(cx+tx-3,y,1,1,'#ffcf6b'),L(cx+tx+8,y,1,1,'#ffcf6b')}
      R(cx+96,b-30,70,2,'#8a8f94');R(cx+96,b-20,70,2,'#8a8f94');
      for(const[tx,th]of[[260,110],[280,96]]){for(let y=0;y<th;y+=8)R(cx+tx,b-th+y,3,4,y%16?'#d93636':'#f4f4f4'),R(cx+tx,b-th+y+4,3,4,'#f4f4f4');FLARES.push([cx+tx+1,b-th])}
      LANDMARKS.push(['Eleme Refinery','Rivers State',cx+150,P_FAR])}
    fillers(R,L,x+360,x+462,b,61,'ph');
    // Port Harcourt tower (from the user's photo): dark grid facade, slanted lattice crown, glass podium
    {const cx=x+478,tw=40,th=96,tt=b-20-th;R(cx-12,b-22,64,22,'#2a2f38');for(let y=b-20;y<b-2;y+=6){R(cx-12,y,64,3,'#6f8aa0');L(cx-12,y,64,3,'rgba(255,230,180,.55)')}
      R(cx,tt,tw,th,'#3a3f4a');R(cx+tw-5,tt,5,th,'#30343e');const r=rng(93);for(let y=tt+4;y<b-22;y+=5){R(cx,y+3,tw,1,'#2c3038');for(let c=cx+1;c<cx+tw-2;c+=3){R(c,y,2,2,'#5d7690');if(r()<.12)R(c,y,2,2,'#e8ecf0');if(r()<.35)L(c,y,2,2,'#ffe2a0')}}
      for(let c=0;c<=tw;c++){const h=Math.round(18-c*.25);R(cx+c,tt-h,1,h,c%2?'#2a2e36':'#3d424c');if(c%3===0)L(cx+c,tt-h,1,1,'#ff3030')}}
    corpusChristi(R,L,x+620,b);LANDMARKS.push(['Corpus Christi Cathedral','Port Harcourt',x+620,P_FAR]);phCentralMosque(R,L,x+722,b);LANDMARKS.push(['Port Harcourt Central Mosque','Victoria Street',x+730,P_FAR]);
  },
  near(R,L,x,b){ground(R,x,1440,b,b-6,'#3d6a3d','#2f5a32',6);const r=rng(71);
    // Pleasure Park
    {const cx=x+60,wx=cx+120,wy=b-48,rad=36;R(wx-20,b-6,40,0,'#000');lineR(R,wx,wy,wx-22,b-6,'#c9c9c9');lineR(R,wx,wy,wx+22,b-6,'#c9c9c9');lineR(R,wx+1,wy,wx-21,b-6,'#a8a8a8');
      for(let a=0;a<360;a+=3){const an=a*Math.PI/180;R(Math.round(wx+Math.cos(an)*rad),Math.round(wy+Math.sin(an)*rad),1,1,'#e8e8e8');L(Math.round(wx+Math.cos(an)*rad),Math.round(wy+Math.sin(an)*rad),1,1,a%12?'#ff5ad0':'#5fd4ff')}
      for(let k=0;k<12;k++){const an=k*Math.PI/6;lineR(R,wx,wy,wx+Math.cos(an)*rad,wy+Math.sin(an)*rad,'#bdbdbd');const gx=Math.round(wx+Math.cos(an)*rad),gy=Math.round(wy+Math.sin(an)*rad);R(gx-2,gy+1,5,4,['#d93636','#e8c31c','#2f8a5a','#2f6fb0'][k%4]);L(gx-1,gy+2,3,2,'#ffe9a0')}
      disc(R,wx,wy,3,'#888');R(cx,b-20,40,14,'#f4f1e6');R(cx-4,b-24,48,4,'#d93636');R(cx+8,b-12,24,6,'#3a2a1a');sign(R,L,cx-12,b-24,'PLEASURE PARK',{h:10,bg:'#e8c31c',fg:'#7a1a1a',litBg:'rgba(255,215,90,.95)'});
      for(let c=cx+44;c<cx+250;c+=5)R(c,b-12,1,6,'#2a2a2a');R(cx+44,b-11,206,1,'#2a2a2a');LANDMARKS.push(['Pleasure Park','Port Harcourt',wx,P_NEAR])}
    // Isaac Boro Park
    {const cx=x+400,m=cx+40;
      // tiled obelisk
      for(let y=b-70;y<b-14;y++){const f=(y-(b-70))/56,w=Math.round(4+f*20),x0=m-(w>>1);for(let xx=0;xx<w;xx++){const tile=((Math.floor((y-b)/4)+Math.floor((x0+xx)/4))&1);R(x0+xx,y,1,1,(y-b)%4===0||(x0+xx)%4===0?'#b89a82':tile?'#dcc7ab':'#cfae94')}}
      R(m-14,b-24,28,3,'#3a3a36');R(m-14,b-21,28,7,'#cdb79c');
      // plinth with coat of arms, soldier raising his rifle
      R(m-5,b-30,10,16,'#cfc7b4');R(m-5,b-30,10,1,'#e6dfcf');disc(R,m,b-23,2,'#f4f4f0');R(m,b-23,1,1,'#2f6a4a');
      const g='#3d6a4a',g2='#2c5238';R(m-2,b-43,4,9,g);R(m-2,b-34,1,4,g2);R(m+1,b-34,1,4,g2);R(m-1,b-46,3,3,g);R(m-2,b-47,5,1,g2);R(m-3,b-45,1,6,g);lineR(R,m+2,b-42,m+5,b-50,g);lineR(R,m+5,b-56,m+5,b-47,'#2a2a2a');
      // dark granite bases: jet on the left, tank in front, gunboat on the right
      R(cx,b-14,24,10,'#1f2a28');R(cx,b-14,24,1,'#2f6a4a');R(cx+56,b-14,24,10,'#1f2a28');R(cx+56,b-14,24,1,'#2f6a4a');R(m-8,b-12,16,8,'#1f2a28');R(m-4,b-10,8,4,'#f4f4f0');R(m-1,b-9,2,2,'#c41e1e');
      R(cx+3,b-18,16,2,'#8a9a8a');R(cx+8,b-20,5,1,'#8a9a8a');R(cx+15,b-21,2,3,'#8a9a8a');R(cx+3,b-17,4,1,'#6a7a6a');
      R(m-6,b-16,12,3,'#3d6a4a');R(m-3,b-18,6,2,'#3d6a4a');R(m+3,b-18,5,1,'#2c5238');R(m-6,b-13,12,1,'#1a2a1e');
      R(cx+58,b-17,20,3,'#7a8a96');R(cx+57,b-16,1,2,'#7a8a96');R(cx+64,b-21,8,4,'#d8dde2');R(cx+67,b-24,2,3,'#d8dde2');
      for(let k=0;k<9;k++){const dx=cx+4+k*9;R(dx,b-4,6,3,'#2f6a4a');R(dx+2,b-4,2,3,'#f4f4f4')}
      L(m-14,b-21,28,2,'rgba(255,230,170,.6)');L(m-2,b-46,4,12,'rgba(160,255,190,.35)');
      palm(R,cx+92,b-4,34);tree(R,cx-14,b-6,10,'#2f6a35','#4a8a45');LANDMARKS.push(['Isaac Boro Park','Mile 1, Port Harcourt',m,P_NEAR])}
    // Government House
    {const cx=x+600;R(cx,b-34,130,28,'#f4f2ec');for(let c=cx+6;c<cx+126;c+=10){R(c,b-30,5,6,'#6f8ca3');R(c,b-18,5,6,'#6f8ca3');L(c,b-30,5,6,'#ffd58a');L(c,b-18,5,6,'#ffd58a')}
      R(cx+46,b-42,38,36,'#ffffff');for(let k=0;k<8;k++)R(cx+44+k,b-50+k,42-2*k,1,'#e8e4da');for(let c=cx+48;c<cx+84;c+=6)R(c,b-34,2,28,'#e0dccf');R(cx-4,b-36,138,2,'#c9c4b6');flag(R,cx+64,b-66,['#0a8a3a','#f4f4f4','#0a8a3a'],b-50);
      R(cx-20,b-12,170,6,'#e9e4dc');LANDMARKS.push(['Government House','Port Harcourt',cx+65,P_NEAR])}
    // Mangrove creek
    {const cx=x+880;water(R,L,cx,380,b-18,b-4);for(let k=0;k<9;k++){const tx=cx+10+k*42+(r()*10|0);for(let j=-6;j<=6;j+=3)lineR(R,tx,b-26,tx+j,b-8,'#3b2a1a');disc(R,tx,b-34,10,'#2a5a30');disc(R,tx-3,b-37,6,'#3d7a40')}
      R(cx+150,b-10,22,2,'#4a3020');R(cx+158,b-17,2,3,SKIN);R(cx+157,b-14,4,4,'#2f6fb0');}
    for(const px of[x+280,x+340,x+780,x+820,x+1300,x+1360,x+1420])palm(R,px,b-4,28+(px%5)*2);
    billboard(R,L,x+770,b,6);billboard(R,L,x+1290,b,7);
  }},
};
const ORDER=['lagos','mainland','abuja','ph'];

function buildLayer(route,p,H,which){const W=Math.ceil(4*RW*p),day=canvas(W,H),g=day.getContext('2d');const lights=[];
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.floor(x),Math.floor(y),Math.round(w),Math.round(h))};
  const L=(x,y,w,h,c)=>lights.push([Math.floor(x),Math.floor(y),Math.round(w),Math.round(h),c]);
  route.forEach((k,i)=>REGIONS[k][which](R,L,i*RW*p,H));
  // haze baked per region with soft seams
  const haze=t=>{const gr=g.createLinearGradient(0,0,W,0);route.forEach((k,i)=>{const a=(i*RW*p)/W,b=((i+1)*RW*p)/W,c=wxOf(k).haze[t];gr.addColorStop(Math.min(1,a+.006),c);gr.addColorStop(Math.max(0,b-.006),c)});return gr};
  const night=canvas(W,H),n=night.getContext('2d');
  const amt=which==='near'?.45:which==='hazeL'?1.6:1;
  g.globalCompositeOperation='source-atop';g.globalAlpha=Math.min(1,amt);g.fillStyle=haze('d');g.fillRect(0,0,W,H);if(amt>1){g.globalAlpha=amt-1;g.fillRect(0,0,W,H)}g.globalAlpha=1;g.globalCompositeOperation='source-over';
  n.drawImage(day,0,0);n.globalCompositeOperation='source-atop';n.fillStyle='rgba(9,12,38,.74)';n.fillRect(0,0,W,H);n.fillStyle=haze('n');n.fillRect(0,0,W,H);n.globalCompositeOperation='source-over';
  if(which!=='hazeL')for(const[x,y,w,h,c]of lights){n.fillStyle=c;n.fillRect(x,y,w,h)}
  return{day,night,W}}

let route=[...ORDER],LAYERS=null;
function buildWorld(){LANDMARKS.length=0;FLARES=[];
  const near=buildLayer(route,P_NEAR,NH,'near'),far=buildLayer(route,P_FAR,FH,'far'),hz=buildLayer(route,P_HAZE,HH,'hazeL');
  LAYERS={near,far,hz};
  for(const l of LANDMARKS){l.wx=l[2]/l[3]}  // road distance where the landmark lines up with the player
}

// ===================== STATE =====================
const cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage'),panel=$('panel');
let S=4,artW=300,artH=180,groundY=130,A=100;
const SLOT=66,SLOT2=62;
let front=[],back=[],pi=3,laneX=0,laneX2=0,camX=0,anim=null,night=0,nightTarget=0,autoNight=true,nightAfter=3;
let round=0,score=0,shown=0,results=[],t=0,lastT=0,streaks=[],puffs=[],puffT=0,drops=[],dust=[],flash=0,qStart=0,phase='start',timerOn=false;
let peds=[],sellers=[];const ADULTS=PED_KINDS.filter(o=>!o.child).length;
function genPeds(){peds=[];for(let i=0;i<80;i++){const v=(Math.random()<.5?-1:1)*(2.4+Math.random()*1.4),x=i*90+Math.random()*60;peds.push({x,v,k:Math.random()*ADULTS|0});if(Math.random()<.3)peds.push({x:x-Math.sign(v)*11,v,k:ADULTS+(Math.random()*(PED_KINDS.length-ADULTS)|0)})}
  sellers=Array.from({length:40},(_,i)=>({x:i*180+Math.random()*100,k:Math.random()*SELL.length|0,ph:Math.random()*6}))}

function genTraffic(){const mkCar=()=>{const type=pick(COMMON);return{type,v:variant(type),j:(Math.random()*6-3)|0}};
  front=Array.from({length:260},mkCar);back=Array.from({length:280},mkCar);
  // around Mile 2 Station the jam is mostly yellow danfos and kekes
  const m2=LANDMARKS.find(l=>l[0]==='Mile 2 Station'),L4=4*RW,near=wx=>m2&&Math.abs((((wx-m2.wx)%L4)+L4*1.5)%L4-L4/2)<650;
  const M2MIX={danfo:.55,keke:.3,okada:.07,sedan:.05,hilux:.03},bias=(c,wx)=>{if(near(wx)){c.type=pick(M2MIX);c.v=variant(c.type)}};
  front.forEach((c,i)=>bias(c,i*SLOT));back.forEach((c,i)=>bias(c,i*SLOT2+20));front[pi=3]={type:'okada',v:0,j:0}}
const spr=c=>SPR[c.type][c.v];
const carX=i=>{const c=front[i],s=spr(c);return i*SLOT+(SLOT-s.w)/2+c.j+laneX};
const backX=i=>{const c=back[i],s=spr(c);return i*SLOT2+20+(SLOT2-s.w)/2+c.j+laneX2};
const camFor=i=>carX(i)+spr(front[i]).w/2-A;

let reserve=0;
function resize(){const r=stage.getBoundingClientRect(),cssW=r.width,cssH=r.height;if(!panel.hidden)reserve=Math.max(reserve,panel.offsetHeight);const pt=reserve;
  const dpr=window.devicePixelRatio||1;cv.width=Math.round(cssW*dpr);cv.height=Math.round(cssH*dpr);
  const sceneDev=(cssH-pt)*dpr;S=Math.max(2,Math.round(sceneDev/330));artW=cv.width/S;artH=cv.height/S;
  groundY=Math.floor(sceneDev/S)-54;A=Math.round(artW*.42);ctx.imageSmoothingEnabled=false;
}

// ===================== DAILY PUZZLE & SAVING =====================
// Everyone gets the same 5 questions each day (from questions.js). Day rolls over at midnight Lagos time.
const ROUNDS=5,LAUNCH_DATE=Date.UTC(2026,10,1),LAGOS_OFFSET_MS=60*60*1000,DAY_MS=24*60*60*1000;
const TODAY=Math.floor((Date.now()+LAGOS_OFFSET_MS)/DAY_MS),PUZZLE_NO=TODAY-Math.floor(LAUNCH_DATE/DAY_MS)+1;
const TODAY_QS=Array.from({length:ROUNDS},(_,i)=>QUESTIONS[(((PUZZLE_NO-1)*ROUNDS)%QUESTIONS.length+i)%QUESTIONS.length]);
const MAX_TOTAL=ROUNDS*BANDS[0].pts+ROUNDS*TIME_TIERS[0].p;
function loadKey(k,f){try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch{return f}}
function saveKey(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
let today=loadKey('nn_today',null);
if(!today||today.day!==TODAY||!Array.isArray(today.slots))today={day:TODAY,guesses:[],scores:[],timeBonus:[],bands:[],cars:[],slots:[],timedOut:[],startedAt:null};
let stats=loadKey('nn_stats',{played:0,streak:0,maxStreak:0,best:0,total:0,lastDay:null});
const dayRand=rng(TODAY*7919);

// ===================== UI =====================
const fmt=n=>Math.round(n).toLocaleString('en-NG');
function buildUI(){$('pips').innerHTML='<span class="pip"></span>'.repeat(ROUNDS);
  $('startBtn').textContent=COPY.start;document.querySelector('#guessForm button').textContent=COPY.lockIn;$('pressOn').textContent=COPY.pressOn;
  $('resTitle').textContent=`${COPY.summaryTitle} · #${PUZZLE_NO}`;$('resTap').textContent=COPY.summaryTap;$('shareBtn').textContent=COPY.share;$('maxTotal').textContent=`OF ${fmt(MAX_TOTAL)}`;
  $('startBtn').onclick=()=>{$('startView').hidden=true;nextQuestion()};
  $('guessForm').onsubmit=e=>{e.preventDefault();submit(false)};
  $('pressOn').onclick=()=>{$('card').hidden=true;if(round>=ROUNDS)return;nextQuestion()};
  $('nightChip').onclick=()=>{autoNight=false;setDayNight(nightTarget?0:1)};
  $('shareBtn').onclick=share;syncPips()}
function syncPips(){[...$('pips').children].forEach((p,i)=>{p.style.background=results[i]?results[i].band.col:'';p.classList.toggle('now',i===round&&round<ROUNDS&&phase!=='start')})}
function nextQuestion(){phase='question';const q=TODAY_QS[round];$('startView').hidden=true;$('revView').hidden=true;$('qView').hidden=false;
  $('qNum').textContent=COPY.questionOf(round+1,ROUNDS);$('qText').textContent=q.q;$('guess').value='';$('guessHint').textContent=COPY.hint(q.unit);
  // keep the clock running across a refresh: only start it if this question hasn't started yet
  if(!today.startedAt){today.startedAt=Date.now();saveKey('nn_today',today)}
  timerOn=true;syncPips();if(matchMedia('(pointer:fine)').matches)$('guess').focus();resize()}
function secsLeft(){return Math.max(0,SECONDS-(Date.now()-today.startedAt)/1000)}
function tickTimer(){if(!timerOn)return;const s=secsLeft();$('clock').textContent=Math.ceil(s);$('clock').classList.toggle('low',s<5);$('guess').classList.toggle('urgent',s<5);$('barFill').style.transform=`scaleX(${s/SECONDS})`;
  $('barFill').style.background=s>=10?'var(--cyan)':s>=5?'var(--gold)':'#ff6b5a';if(s<=0)submit(true)}
function submit(timedOut){if(phase!=='question')return;const box=$('guessForm').getBoundingClientRect();const q=TODAY_QS[round],raw=$('guess').value.trim();const g=raw?parseGuess(raw,q.unit):null;
  if(!timedOut&&(g===null||g<=0)){$('guessHint').textContent=COPY.unreadable;return}
  timerOn=false;phase='moving';$('guess').classList.remove('urgent');const left=secsLeft(),band=scoreGuess(g,q.answer);
  const tb=band.pts>0&&!timedOut?(TIME_TIERS.find(x=>left>=x.s)||{p:0}).p:0;
  $('qView').hidden=true;$('revView').hidden=false;$('pressOn').disabled=true;
  $('revGuess').textContent=g?fmt(g):'—';$('revAnswer').textContent=fmt(q.answer);
  $('revOff').textContent=(g?`${(Math.abs(g-q.answer)/q.answer*100).toFixed(1)}% off · ${band.label}`:timedOut?COPY.timedOut:COPY.noGuess)+(tb?` · locked in with ${Math.floor(left)}s left`:'');
  $('revSrc').innerHTML=`${COPY.sourceLabel}: <span></span>`;$('revSrc').querySelector('span').textContent=q.source||'—';
  const r=fire(band,tb,box);Object.assign(r,{q,guess:g,timedOut});
  today.guesses.push(g&&g>0?g:null);today.scores.push(band.pts);today.timeBonus.push(tb);today.bands.push(band.id);today.cars.push({type:r.car.type,v:r.car.v});today.slots.push(r.slot);today.timedOut.push(!!timedOut);today.startedAt=null;
  saveKey('nn_today',today);if(today.slots.length===ROUNDS)recordFinish()}
function recordFinish(){const total=today.scores.reduce((a,b)=>a+b,0)+today.timeBonus.reduce((a,b)=>a+b,0);
  stats.played+=1;stats.total+=total;stats.best=Math.max(stats.best,total);stats.streak=stats.lastDay===TODAY-1?stats.streak+1:1;stats.maxStreak=Math.max(stats.maxStreak,stats.streak);stats.lastDay=TODAY;saveKey('nn_stats',stats)}
function fly(from,textS,cls,delay,cb){const to=$('score').getBoundingClientRect(),st=stage.getBoundingClientRect();
  const el=document.createElement('div');el.className='fly '+cls;el.textContent=textS;stage.appendChild(el);const w=el.offsetWidth,h=el.offsetHeight;
  const x0=from.left+from.width/2-w/2-st.left+(cls==='time'?w*.6:-w*.6),y0=from.top-st.top+from.height/2-h/2,x1=to.right-w-st.left,y1=to.top-st.top;
  const a=el.animate([{transform:`translate(${x0}px,${y0}px) scale(.7)`,opacity:0},{transform:`translate(${x0}px,${y0-40}px) scale(1.1)`,opacity:1,offset:.2},{transform:`translate(${x0}px,${y0-56}px) scale(1)`,opacity:1,offset:.45},{transform:`translate(${x1}px,${y1}px) scale(.6)`,opacity:.2}],{duration:reduce?300:1100,delay,easing:'ease-in-out',fill:'both'});
  a.onfinish=()=>{el.remove();cb&&cb()}}
function bump(n){score+=n;const s=$('score');s.classList.add('bump');setTimeout(()=>s.classList.remove('bump'),160)}
function carCanvas(el,car,z){const s=spr(car);el.width=s.w*z;el.height=s.h*z;const g=el.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(s.day,0,0,s.w*z,s.h*z);return el}
function showCard(r){$('cardDot').style.background=r.band.col;$('cardBand').textContent=r.band.label;
  $('cardPts').innerHTML=r.total?`<span class="a">+${r.band.pts}</span>${r.tb?` <span class="t">+${r.tb} time</span>`:''}`:'<span style="color:var(--muted)">0 pts</span>';
  const c=$('card');c.hidden=true;void c.offsetWidth;c.hidden=false}

// ===================== FLOW =====================
function fire(band,tb,box){$('card').hidden=true;const total=band.pts+tb;const car={type:pick(ODDS[band.id]),v:0,j:0};car.v=variant(car.type);
  const r={band,tb,total,car,passed:0,slot:pi};results.push(r);round++;syncPips();
  if(band.pts)fly(box,`+${band.pts}`,'acc',0,()=>bump(band.pts));if(tb)fly(box,`+${tb} TIME`,'time',260,()=>bump(tb));
  if(!total){front[pi]=car;for(let i=0;i<10;i++)puffs.push({x:carX(pi)+10,y:groundY+34,vx:(Math.random()-.5)*16,vy:-6-Math.random()*8,life:1,big:1});anim={kind:'nudge',t0:t,r};return r}
  const dist=total*PX_PER_POINT*band.mult;let tgt=Math.max(pi+1,Math.round((carX(pi)+dist-laneX)/SLOT));tgt=Math.min(front.length-1,tgt);front[tgt]=car;r.passed=tgt-pi;r.slot=tgt;
  anim={kind:'pan',t0:t,dur:reduce?.4:1+(tgt-pi)*SLOT/700,from:camX,tgt,r};return r}
function land(r){anim=null;showCard(r);
  if(round===nightAfter&&autoNight){autoNight=false;setDayNight(1)}
  if(round>=ROUNDS)setTimeout(showResult,1400);else{phase='landed';$('pressOn').disabled=false;$('pressOn').focus({preventScroll:true})}}
function setDayNight(v){nightTarget=v;const c=$('nightChip');c.classList.toggle('night',!!v);c.querySelector('span').textContent=v?'NIGHT':'DAY'}
function showResult(){phase='done';$('card').hidden=true;panel.hidden=true;$('resTot').innerHTML=`${fmt(score)}<small> / ${fmt(MAX_TOTAL)}</small>`;
  $('resList').innerHTML=results.map((r,i)=>`<li><button class="row" id="row${i}" aria-expanded="false" aria-controls="det${i}"><span>${i+1}</span><canvas id="rc${i}"></canvas><span><b class="gv">${r.guess?fmt(r.guess):(r.timedOut?'Time up':'No guess')}</b><br><span style="color:var(--muted)">${r.band.label}</span></span><b>+${r.band.pts}${r.tb?` <span class="t">+${r.tb}</span>`:''}</b><i>▸</i></button><div class="detail" id="det${i}" hidden><q></q><span>Your guess: <b class="g"></b> · Answer: <b class="a"></b></span><span>${COPY.sourceLabel}: <span class="src"></span></span></div></li>`).join('');
  results.forEach((r,i)=>{const d=$('det'+i);d.querySelector('q').textContent=r.q.q;d.querySelector('.g').textContent=r.guess?fmt(r.guess):(r.timedOut?COPY.timedOut:COPY.noGuess);d.querySelector('.a').textContent=fmt(r.q.answer);d.querySelector('.src').textContent=r.q.source||'—';
    $('row'+i).onclick=()=>{const open=d.hidden;d.hidden=!open;$('row'+i).setAttribute('aria-expanded',open)};carCanvas($('rc'+i),r.car,2)});
  const L=nearestLandmark();$('resFar').innerHTML=COPY.reached(L[0],L[1]);
  const live=stats.lastDay>=TODAY-1?stats.streak:0;$('resStats').textContent=COPY.statsLine(stats.played,live,stats.best);
  $('result').hidden=false;startCountdown();resize()}
async function share(){const tbSum=today.timeBonus.reduce((a,b)=>a+b,0);
  const text=`Naija's Numbers #${PUZZLE_NO} — ${score}/${MAX_TOTAL}\n`+today.bands.map(id=>ALL.find(b=>b.id===id).emoji).join('')+` ⏱+${tbSum}\n`+location.href.split(/[?#]/)[0];
  try{if(navigator.share){await navigator.share({text});return}await navigator.clipboard.writeText(text);$('copied').textContent=COPY.copied;$('copied').hidden=false}catch{}}
let countdownId=null;
function startCountdown(){if(countdownId)return;const tick=()=>{const ms=Math.max(0,(TODAY+1)*DAY_MS-LAGOS_OFFSET_MS-Date.now());if(ms===0){location.reload();return}
    const p=n=>String(n).padStart(2,'0');$('countdown').textContent=`${COPY.nextIn} ${p(Math.floor(ms/3.6e6))}:${p(Math.floor(ms%3.6e6/6e4))}:${p(Math.floor(ms%6e4/1000))}`};tick();countdownId=setInterval(tick,1000)}
function begin(){round=0;score=0;shown=0;results=[];night=0;autoNight=true;setDayNight(0);laneX=laneX2=0;anim=null;phase='start';timerOn=false;
  nightAfter=1+(dayRand()*4|0);const start=TODAY%4;route=ORDER.slice(start).concat(ORDER.slice(0,start));buildWorld();genTraffic();genPeds();resize();
  // put back anything already played today
  today.slots.forEach((slot,i)=>{const band=ALL.find(b=>b.id===today.bands[i]),car={type:today.cars[i].type,v:Math.min(today.cars[i].v,SPR[today.cars[i].type].length-1),j:0};
    front[slot]=car;pi=slot;round=i+1;const tb=today.timeBonus[i];score+=band.pts+tb;results.push({band,tb,total:band.pts+tb,car,slot,q:TODAY_QS[i],guess:today.guesses[i],timedOut:today.timedOut[i]})});
  shown=score;$('score').textContent=fmt(score);if(round>=nightAfter){autoNight=false;night=1;setDayNight(1)}
  camX=camFor(pi);syncPips();
  if(round>=ROUNDS){$('startView').hidden=true;showResult()}
  else if(today.startedAt){nextQuestion()}
  else if(round>0)$('startBtn').textContent=COPY.continueBtn}

function regionAt(wx){const L=4*RW,u=((wx%L)+L)%L,i=Math.floor(u/RW),f=(u-i*RW)/RW;const w={};ORDER.forEach(k=>w[k]=0);
  const cur=route[i],nxt=route[(i+1)%4],prv=route[(i+3)%4];const edge=.12;
  if(f>1-edge){const k=smooth(1-edge,1+edge,f);w[cur]+=1-k;w[nxt]+=k}else if(f<edge){const k=smooth(-edge,edge,f);w[cur]+=k;w[prv]+=1-k}else w[cur]=1;return{w,cur}}
function nearestLandmark(){const wx=camX+A,Lp=4*RW;let best=LANDMARKS[0],bd=1e9;for(const l of LANDMARKS){let d=Math.abs(((l.wx-wx)%Lp+Lp*1.5)%Lp-Lp/2);if(d<bd){bd=d;best=l}}return best}

// ===================== DRAW =====================
function blit(dayC,nightC,x,y,n){const sx=Math.round(x*S)/S,sy=Math.round(y*S)/S,k=dayC.half?.5:1,w=dayC.width*k,h=dayC.height*k;if(n<1){ctx.globalAlpha=1;ctx.drawImage(dayC,sx,sy,w,h)}if(n>0){ctx.globalAlpha=n;ctx.drawImage(nightC,sx,sy,w,h)}ctx.globalAlpha=1}
function layerDraw(Lr,p,bottom,n){const off=A*(1-p)-camX*p,W=Lr.W;let x0=((off%W)+W)%W-W;const y=bottom-Lr.day.height;
  for(let x=x0;x<artW;x+=W){if(x+W<0)continue;
    // draw only the visible slice for speed
    const sx=Math.max(0,-x),sw=Math.min(W-sx,artW-Math.max(0,x)+2);if(sw<=0)continue;const dx=Math.round(Math.max(0,x)*S)/S;
    if(n<1){ctx.globalAlpha=1;ctx.drawImage(Lr.day,sx,0,sw,Lr.day.height,dx,y,sw,Lr.day.height)}if(n>0){ctx.globalAlpha=n;ctx.drawImage(Lr.night,sx,0,sw,Lr.day.height,dx,y,sw,Lr.day.height)}ctx.globalAlpha=1}}
function dsc(cx,cy,r,col){ctx.fillStyle=col;for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(r*r-dy*dy));ctx.fillRect(Math.round(cx-w),Math.round(cy+dy),w*2,1)}}
const STARS=Array.from({length:110},(_,i)=>{const r=rng(900+i);return{x:r(),y:r(),p:r()*6}});
const CLOUDS=Array.from({length:7},(_,i)=>{const r=rng(50+i),w=22+(r()*26|0);return{w,x:i*170+r()*80,y:10+r()*40,s:.6+r()*.8}});
function cloud(x,y,w,c,c2){ctx.fillStyle=c;ctx.fillRect(x+4,y+3,w-8,5);ctx.fillRect(x+8,y,w-18,4);ctx.fillRect(x,y+5,w,4);ctx.fillStyle=c2;ctx.fillRect(x,y+8,w,1)}

function weatherNow(){const {w,cur}=regionAt(camX+A),ws=ORDER.map(k=>w[k]),wxs=ORDER.map(wxOf);const agg=p=>wxs.reduce((s,x,i)=>s+(x[p]||0)*ws[i],0);
  return{w,cur,ws,wxs,sun:agg('sun'),few:agg('few'),grey:agg('grey'),dark:agg('dark'),rain:agg('rain'),dust:agg('dust'),bolt:agg('bolt')}}
function draw(){const n=night;ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;
  const W=weatherNow(),{ws,wxs}=W,dark=Math.min(1,W.dark);
  // sky
  const skyH=groundY,bh=skyH/6;const cols=[0,1,2,3,4,5].map(i=>{const d=mix(wxs.map(x=>x.sky.d[i]),ws);return n?lerpRGB(d,mix(wxs.map(x=>x.sky.n[i]),ws),n):d});
  for(let i=0;i<6;i++){ctx.fillStyle=cols[i];ctx.fillRect(0,Math.floor(i*bh),artW+1,Math.ceil(bh)+1)}
  for(let i=1;i<6;i++){const y=Math.floor(i*bh)-1;ctx.fillStyle=cols[i];for(let x=0;x<artW;x+=2)ctx.fillRect(x,y,1,1);ctx.fillStyle=cols[i-1];for(let x=1;x<artW;x+=2)ctx.fillRect(x,y+1,1,1)}
  const sa=smooth(.5,.95,n)*(1-dark*.85)*(1-W.dust*.5)*(1-W.grey*.4);if(sa>0){for(const s of STARS){ctx.globalAlpha=sa*(.5+.5*Math.sin(t*2+s.p));ctx.fillStyle='#fff';ctx.fillRect(Math.round(s.x*artW),Math.round(s.y*skyH*.7),1,1)}ctx.globalAlpha=1}
  const sunA=(1-smooth(.3,.6,n))*W.sun;if(sunA>0){const sx=artW*.76,sy=40+n*60,warm=clamp(n*2);ctx.globalAlpha=sunA*.22;dsc(sx,sy,14,lerpRGB('rgb(255,244,184)','rgb(255,154,74)',warm));ctx.globalAlpha=sunA;dsc(sx,sy,9,W.dust>.5?'#f4e2b8':lerpRGB('rgb(255,246,196)','rgb(255,138,61)',warm));ctx.globalAlpha=1}
  const ma=smooth(.6,.9,n)*(1-dark*.7);if(ma>0){const mx=artW*.2;ctx.globalAlpha=ma*.18;dsc(mx,30,12,'#c9d4ff');ctx.globalAlpha=ma;dsc(mx,30,7,W.dust>.5?'#f2dcc0':'#eef1ff');ctx.fillStyle='#c4cbe6';ctx.fillRect(Math.round(mx)-2,28,2,2);ctx.fillRect(Math.round(mx)+3,32,1,1);ctx.globalAlpha=1}
  for(const c of CLOUDS){const cx=((c.x-camX*.06+t*1.5*c.s)%1200+1200)%1200-80;if(cx>artW)continue;const X=Math.round(cx*S)/S;
    if(W.few>0){ctx.globalAlpha=Math.min(1,W.few)*(1-n*.6)*.9;cloud(X,c.y,c.w,n>.5?'#3a4070':'#ffffff',n>.5?'#2a2f58':'#dfe9f2')}
    if(W.grey>0){ctx.globalAlpha=Math.min(1,W.grey)*.9;cloud(X+30,c.y+14,c.w+24,n>.5?'#262b3c':'#c4ccd5',n>.5?'#1e2232':'#a9b3be');cloud(X-40,c.y+26,c.w+10,n>.5?'#2a3042':'#d2d9e0','#b8c1ca')}
    if(dark>0){ctx.globalAlpha=dark*.95;cloud(X-10,c.y-6,c.w+30,n>.5?'#1b2028':'#5d6672',n>.5?'#141820':'#4c5560');cloud(X+20,c.y+6,c.w+10,n>.5?'#20262f':'#6a737e','#58616c')}}
  ctx.globalAlpha=1;
  if(flash>0){ctx.fillStyle=`rgba(230,235,255,${flash*.5})`;ctx.fillRect(0,0,artW+1,groundY)}
  // scenery layers
  const SW=groundY-6;   // sidewalk top
  layerDraw(LAYERS.hz,P_HAZE,SW-10,n);
  layerDraw(LAYERS.far,P_FAR,SW-6,n);
  {const off=A*(1-P_FAR)-camX*P_FAR,Wl=LAYERS.far.W,y0=SW-6-FH;for(const[fx,fy]of FLARES){let x=((fx+off)%Wl+Wl)%Wl;if(x>artW+5)continue;const h=3+Math.round(Math.sin(t*14+fx)*1.5+Math.random());
      ctx.fillStyle='#ffd34d';ctx.fillRect(x,y0+fy-h,3,h);ctx.fillStyle='#ff7a1a';ctx.fillRect(x+1,y0+fy-h-2,1,2);if(n>0){ctx.globalAlpha=n*.35;dsc(x+1,y0+fy-3,6,'#ff9a3a');ctx.globalAlpha=1}}}
  layerDraw(LAYERS.near,P_NEAR,SW+1,n);
  if(W.dust>0){ctx.fillStyle=`rgba(214,180,120,${W.dust*(n?.06:.12)})`;ctx.fillRect(0,0,artW+1,groundY+50)}
  const ox=-camX;
  // sidewalk with pedestrians
  ctx.fillStyle=lerpRGB('rgb(183,176,163)','rgb(44,42,54)',n);ctx.fillRect(0,SW,artW+1,6);
  ctx.fillStyle=lerpRGB('rgb(150,144,132)','rgb(34,32,44)',n);ctx.fillRect(0,SW,artW+1,1);for(let x=Math.floor(camX/10)*10;x<camX+artW+10;x+=10)ctx.fillRect(Math.round((x+ox)*S)/S,SW+1,1,5);
  {const L4=4*RW;for(const p of peds){const sx=((p.x+ox)%L4+L4)%L4-20;if(sx>artW+10)continue;const img=PEDS[p.k][((t*4+p.k)|0)%2];
      if(p.v<0){ctx.save();ctx.translate(Math.round(sx*S)/S+img.day.width,0);ctx.scale(-1,1);blit(img.day,img.night,0,SW+4-img.day.height,n);ctx.restore()}else blit(img.day,img.night,sx,SW+4-img.day.height,n)}}
  const lamps=[];for(let k=Math.floor((camX-60)/150);k*150+60<camX+artW+20;k++){const lx=Math.round((k*150+60+ox)*S)/S;lamps.push(lx);ctx.fillStyle=lerpRGB('rgb(90,93,102)','rgb(42,44,54)',n);ctx.fillRect(lx,groundY-50,1,50);ctx.fillRect(lx,groundY-50,8,1);ctx.fillStyle=lerpRGB('rgb(207,210,214)','rgb(255,231,160)',n);ctx.fillRect(lx+6,groundY-49,4,1)}
  // road
  ctx.fillStyle=lerpRGB('rgb(214,208,194)','rgb(60,58,68)',n);ctx.fillRect(0,groundY-1,artW+1,2);
  ctx.fillStyle=lerpRGB('rgb(74,73,80)','rgb(27,27,37)',n);ctx.fillRect(0,groundY+1,artW+1,45);
  if(W.rain>0){ctx.globalAlpha=Math.min(1,W.rain)*.35;ctx.fillStyle=n>.5?'#3a4a66':'#9aa6b6';for(let x=Math.floor(camX/23)*23;x<camX+artW+23;x+=23)ctx.fillRect(Math.round((x+ox+((x*7)%11))*S)/S,groundY+6+((x*13)%34),10,1);ctx.globalAlpha=1}
  ctx.fillStyle=lerpRGB('rgb(233,227,207)','rgb(119,117,106)',n);for(let x=Math.floor(camX/18)*18;x<camX+artW+18;x+=18)ctx.fillRect(Math.round((x+ox)*S)/S,groundY+23,9,1);
  for(let x=Math.floor(camX/5)*5;x<camX+artW+5;x+=5){ctx.fillStyle=(x/5)%2?lerpRGB('rgb(242,194,0)','rgb(110,93,26)',n):lerpRGB('rgb(27,27,27)','rgb(14,14,18)',n);ctx.fillRect(Math.round((x+ox)*S)/S,groundY+46,5,3)}
  for(let i=Math.floor((camX-RW)/RW);i*RW<camX+artW;i++){const k=route[((i%4)+4)%4],x0=Math.max(0,i*RW+ox),x1=Math.min(artW+1,(i+1)*RW+ox);if(x1<=x0)continue;const u=REGIONS[k].under;
    ctx.fillStyle=lerpRGB(hexRGB(u[0]),'rgb(34,32,42)',n);ctx.fillRect(x0,groundY+49,x1-x0,artH);ctx.fillStyle=lerpRGB(hexRGB(u[1]),'rgb(26,24,32)',n);for(let x=Math.ceil((x0-ox)/14)*14;x+ox<x1;x+=14)ctx.fillRect(Math.round((x+ox)*S)/S,groundY+49,1,5)}
  // traffic
  const backBase=groundY+21,frontBase=groundY+44;
  const b0=Math.max(0,Math.floor((camX-laneX2-80)/SLOT2));const bl=[];
  for(let i=b0;i<back.length&&i*SLOT2+laneX2<camX+artW+10;i++){const s=spr(back[i]),x=backX(i)+ox;blit(s.dimDay,s.dimNight,x,backBase-s.h,n);bl.push([x,s,i,backBase])}
  if(n>0)beams(bl,backBase,i=>i+1<back.length?backX(i+1)+ox:1e9,.55,n);
  {const L4=4*RW;for(const p of sellers){const sx=((p.x+ox)%L4+L4)%L4-20;if(sx>artW+10)continue;const img=SELLERS[p.k][((t*1.5+p.ph)|0)%2];blit(img.day,img.night,sx,groundY+30-img.day.height,n)}}
  const f0=Math.max(0,Math.floor((camX-laneX-80)/SLOT));const fl=[];
  for(let i=f0;i<front.length&&i*SLOT+laneX<camX+artW+10;i++){const s=spr(front[i]),x=carX(i)+ox,bob=i===pi&&!anim&&((t*6|0)%5===0)?-1:0;blit(s.day,s.night,x,frontBase-s.h+bob,n);fl.push([x,s,i,frontBase])}
  if(n>0){beams(fl,frontBase,i=>i+1<front.length?carX(i+1)+ox:1e9,1,n);
    ctx.globalCompositeOperation='lighter';for(const lx of lamps){const g=ctx.createRadialGradient(lx+8,groundY-49,0,lx+8,groundY-49,18);g.addColorStop(0,`rgba(255,214,130,${.5*n})`);g.addColorStop(1,'rgba(255,214,130,0)');ctx.fillStyle=g;ctx.fillRect(lx-12,groundY-68,40,40)}
    for(const[x,s,,base]of fl.concat(bl))if(s.bar){const on=((t*4)|0)%2,b=s.bar[on?0:1];dsc(x+b[0]+2,base-s.h+b[1],5,on?`rgba(255,40,40,${.4*n})`:`rgba(60,100,255,${.4*n})`)}
    ctx.globalCompositeOperation='source-over'}
  if(W.rain>0){ctx.globalAlpha=Math.min(1,W.rain*.7);ctx.fillStyle=n>.5?'#8aa0c0':'#d6e0ea';for(const d of drops){ctx.fillRect(Math.round(d.x),Math.round(d.y),1,3);ctx.fillRect(Math.round(d.x)-1,Math.round(d.y)+3,1,2)}ctx.globalAlpha=1}
  if(W.dust>0){ctx.fillStyle=n>.5?'#7a6450':'#e8d2a6';for(const d of dust){ctx.globalAlpha=W.dust*d.a;ctx.fillRect(Math.round(d.x),Math.round(d.y),1,1)}ctx.globalAlpha=1}
  const ps=spr(front[pi]),px=Math.round((carX(pi)+ox+ps.w/2)*S)/S,py=frontBase-ps.h-7+((t*3|0)%2);
  if(!anim||anim.kind==='nudge'){ctx.fillStyle='#08101c';ctx.fillRect(px-3,py-1,7,4);ctx.fillRect(px-1,py+3,3,1);ctx.fillStyle='#53d9ea';ctx.fillRect(px-2,py,5,1);ctx.fillRect(px-1,py+1,3,1);ctx.fillRect(px,py+2,1,1)}
  for(const p of puffs){ctx.globalAlpha=clamp(p.life);ctx.fillStyle=p.big?'#c8c8c8':'#9a9a9a';ctx.fillRect(Math.round((p.x+ox)*S)/S,Math.round(p.y*S)/S,p.big?2:1,p.big?2:1)}ctx.globalAlpha=1;
  for(const s of streaks){ctx.globalAlpha=clamp(s.life)*.6;ctx.fillStyle='#ffffff';ctx.fillRect(s.x,s.y,s.len,1)}ctx.globalAlpha=1;
}
// headlight beams: each stops at the gap before the next vehicle, so they never overlap
function beams(list,base,nextX,k,n){ctx.globalCompositeOperation='lighter';for(const[x,s,i]of list){const hx=x+s.head[0]+1,hy=base-s.h+s.head[1];const gap=Math.min(26,nextX(i)-hx-1);if(gap<3)continue;
    const g=ctx.createLinearGradient(hx,0,hx+gap,0);g.addColorStop(0,`rgba(255,236,180,${.32*n*k})`);g.addColorStop(1,'rgba(255,236,180,0)');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(hx,hy-.5);ctx.lineTo(hx+gap,hy-3);ctx.lineTo(hx+gap,Math.min(base,hy+5));ctx.lineTo(hx,hy+1.5);ctx.fill();
    ctx.fillStyle=`rgba(255,236,180,${.14*n*k})`;ctx.fillRect(hx,base-2,gap*.7,2)}ctx.globalCompositeOperation='source-over'}
function hexRGB(h){const v=hx(h);return`rgb(${v[0]},${v[1]},${v[2]})`}
function lerpRGB(a,b,t){const pa=a.match(/\d+/g).map(Number),pb=b.match(/\d+/g).map(Number);return`rgb(${pa[0]+(pb[0]-pa[0])*t|0},${pa[1]+(pb[1]-pa[1])*t|0},${pa[2]+(pb[2]-pa[2])*t|0})`}

// ===================== UPDATE =====================
function update(dt){
  laneX+=Math.max(0,Math.sin(t*.7))*2.4*dt;laneX2+=Math.max(0,Math.sin(t*.55+2))*2*dt;
  for(const p of peds)p.x+=p.v*dt;for(const p of sellers)p.x+=Math.sin(t*.5+p.ph)*1.4*dt;
  night+=clamp(nightTarget-night,-dt/2.5,dt/2.5);
  const base=camFor(pi);const prev=camX;
  if(!anim)camX=base;
  else if(anim.kind==='nudge'){const e=t-anim.t0;camX=base+(e<.2?Math.sin(e/.2*Math.PI/2)*14:e<.28?14*(1-(e-.2)/.08):0);if(e>=.4)land(anim.r)}
  else{const e=clamp((t-anim.t0)/anim.dur),k=ease(e),to=camFor(anim.tgt);camX=anim.from+(to-anim.from)*k;if(e>=1){pi=anim.tgt;camX=to;land(anim.r)}}
  const vel=(camX-prev)/Math.max(dt,1e-3);
  if(!reduce&&vel>80&&Math.random()<Math.min(1,vel/300))streaks.push({x:artW+5,y:8+Math.random()*(groundY+30),len:6+Math.random()*16,v:vel*1.4,life:1});
  for(const s of streaks){s.x-=s.v*dt;s.life-=dt*1.6}streaks=streaks.filter(s=>s.life>0&&s.x+s.len>0);
  puffT+=dt;if(!anim&&puffT>.5){puffT=0;const s=spr(front[pi]);puffs.push({x:carX(pi)+s.tail[0]-1,y:groundY+44-s.h+s.tail[1]+1,vx:-4-Math.random()*4,vy:-3-Math.random()*3,life:1})}
  for(const p of puffs){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*(p.big?1.4:.9)}puffs=puffs.filter(p=>p.life>0);
  const W=weatherNow();
  if(W.rain>0){const want=Math.round(160*Math.min(1.7,W.rain));while(drops.length<want)drops.push({x:Math.random()*(artW+40),y:Math.random()*-artH,v:180+Math.random()*80});drops.length=Math.min(drops.length,want);
    for(const d of drops){d.y+=d.v*dt;d.x-=d.v*.25*dt+vel*dt*.3;if(d.y>groundY+50||d.x<-5){d.y=-5;d.x=Math.random()*(artW+40)}}}else drops.length=0;
  if(W.bolt>.1&&flash<=0&&Math.random()<dt*W.bolt/5)flash=1;flash=Math.max(0,flash-dt*5);
  if(W.dust>0){while(dust.length<90)dust.push({x:Math.random()*artW,y:Math.random()*(groundY+40),v:6+Math.random()*10,a:.3+Math.random()*.5});for(const d of dust){d.x+=d.v*dt-vel*dt*.4;d.y+=Math.sin(t+d.v)*dt*2;if(d.x>artW)d.x=0;if(d.x<0)d.x=artW}}else dust.length=0;
  if(shown!==score){shown+=Math.sign(score-shown)*Math.max(1,Math.abs(score-shown)*.15|0);if(Math.abs(score-shown)<2)shown=score;$('score').textContent=fmt(shown)}
}
let hud=0;
function frame(now){t=now/1000;const dt=Math.min(.05,t-(lastT||t));lastT=t;update(dt);draw();tickTimer();
  if(++hud%12===0){const L=nearestLandmark(),{cur}=regionAt(camX+A),c=CITY[cur],cw=cityWx[c];$('where').innerHTML=`${REGIONS[cur].city.toUpperCase()} · <span>${L[0]}</span>`;
    $('wxChip').textContent=`${cw.temp}° ${WX[cw.type].label.replace('Harmattan ','').toUpperCase()} · ${wxSource==='live'?'LIVE':'SAMPLE'}`;
    document.querySelectorAll('#test [data-wx]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.wx===cw.type))}
  requestAnimationFrame(frame)}

buildUI();begin();loadWeather();addEventListener('resize',resize);if(document.fonts)document.fonts.ready.then(resize);requestAnimationFrame(frame);
})();
