// Sound effects for Naija's Numbers. game.js calls SFX.play('coin') etc.
// Files live in /sounds. Volumes (0 to 1) were picked by the owner on the sound check page.
// Browsers only allow sound after the player taps or types, so nothing plays before the first tap.
window.SFX=(()=>{
  const FILES={tick:'tick.mp3',coin:'coin.mp3',engine:'engine.mp3',miss:'miss-horn.mp3',traffic:'traffic.mp3',rain:'rain.mp3'};
  const VOL={tick:.6,coin:.8,engine:.7,miss:.7,traffic:.25,rain:.15};
  let muted=false;try{muted=localStorage.getItem('nn_mute')==='1'}catch{}
  let ctx=null,master=null,loading=null;const bufs={},chans={},loops={};const wantLoop={};
  function unlock(){
    if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      ctx=new AC();master=ctx.createGain();master.gain.value=muted?0:1;master.connect(ctx.destination);
      for(const k in VOL){chans[k]=ctx.createGain();chans[k].gain.value=VOL[k];chans[k].connect(master)}
      loading=Promise.all(Object.entries(FILES).map(([k,f])=>fetch('sounds/'+f).then(r=>r.arrayBuffer()).then(a=>new Promise((ok,no)=>ctx.decodeAudioData(a,ok,no))).then(b=>{bufs[k]=b;if(wantLoop[k])startLoop(k)}).catch(()=>{})));}
    if(ctx.state==='suspended'&&!document.hidden)ctx.resume().catch(()=>{});
  }
  // one-off sound; dur/fadeOut cut it short with a fade (used for the engine so it ends with the camera)
  // rate changes the pitch (1 = as recorded, 2 = an octave up); vol scales this one play
  function play(k,{dur=0,fadeIn=0,fadeOut=0,rate=1,vol=1}={}){if(!ctx||!bufs[k]||muted)return;
    const s=ctx.createBufferSource(),g=ctx.createGain(),t=ctx.currentTime;s.buffer=bufs[k];s.playbackRate.value=rate;
    g.gain.setValueAtTime(fadeIn?0:vol,t);if(fadeIn)g.gain.linearRampToValueAtTime(vol,t+fadeIn);
    s.connect(g).connect(chans[k]);s.start(t);
    // start first, then schedule the stop (stopping a sound that hasn't started throws, which silenced the engine)
    if(dur&&dur<bufs[k].duration){g.gain.setValueAtTime(vol,t+Math.max(fadeIn,dur-fadeOut));g.gain.linearRampToValueAtTime(0,t+dur);s.stop(t+dur+.05)}}
  // background loops: overlapping copies crossfaded over 2s so there is no gap
  function startLoop(k){wantLoop[k]=true;if(!ctx||!bufs[k]||loops[k])return;
    const X=2,len=bufs[k].duration,L={on:true,srcs:[],out:ctx.createGain()};loops[k]=L;
    L.out.gain.setValueAtTime(0,ctx.currentTime);L.out.gain.linearRampToValueAtTime(1,ctx.currentTime+1.5);L.out.connect(chans[k]);
    const next=at=>{if(!L.on)return;const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=bufs[k];
      g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(1,at+X);g.gain.setValueAtTime(1,at+len-X);g.gain.linearRampToValueAtTime(0,at+len);
      s.connect(g).connect(L.out);s.start(at);L.srcs.push(s);s.onended=()=>{L.srcs=L.srcs.filter(x=>x!==s)};
      L.timer=setTimeout(()=>next(at+len-X),Math.max(0,(at+len-X-ctx.currentTime-1)*1000))};
    next(ctx.currentTime+.05)}
  function stopLoop(k){wantLoop[k]=false;const L=loops[k];if(!L)return;delete loops[k];L.on=false;clearTimeout(L.timer);
    const t=ctx.currentTime;L.out.gain.cancelScheduledValues(t);L.out.gain.setValueAtTime(L.out.gain.value,t);L.out.gain.linearRampToValueAtTime(0,t+1.2);
    setTimeout(()=>{L.srcs.forEach(s=>{try{s.stop()}catch{}});L.out.disconnect()},1400)}
  function setMuted(v){muted=!!v;try{localStorage.setItem('nn_mute',muted?'1':'0')}catch{}if(master)master.gain.setTargetAtTime(muted?0:1,ctx.currentTime,.05)}
  // first tap or key press anywhere switches sound on; pause everything while the tab is hidden
  ['pointerdown','keydown','touchend'].forEach(e=>addEventListener(e,unlock,{passive:true}));
  document.addEventListener('visibilitychange',()=>{if(!ctx)return;document.hidden?ctx.suspend():ctx.resume().catch(()=>{})});
  return{unlock,play,startLoop,stopLoop,setMuted,get muted(){return muted}};
})();
