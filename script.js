'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuffle(a).slice(0,n);

/* ===== DATA ===== */
const COL=['#ff4d4d','#3d8bff','#ffd93d','#2ecc71','#ff9a3c','#b05cff'];
const OBJ=['🍎','🍌','🍇','🍓','🍊','🍉','🐶','🐱','🐸','🐵','🐰','🐼','🚗','🚌','🚲','✈️','🚂','🚀','⭐','🎈','⚽','🌸'];
const ALL=[...COL,...OBJ];
const tile=v=>v[0]==='#'?`<i class="dot" style="background:${v}"></i>`:v;
const CAT={Buah:['🍎','🍌','🍇','🍓','🍊','🍉'],Haiwan:['🐶','🐱','🐸','🐵','🐰','🐼'],Kenderaan:['🚗','🚌','🚲','✈️','🚂','🚀']};
const CI={Buah:'🧺',Haiwan:'🐾',Kenderaan:'🚦'},CC={Buah:'#ffe0e6',Haiwan:'#d9f2ff',Kenderaan:'#fff3c4'};
const NAMES={mengecam:'🔍 Mengecam',padanan:'🧩 Padankan',jigsaw:'🖼️ Jigsaw',susun:'🔢 Susun',kategori:'🧺 Kategori'};

/* ===== BUNYI ===== */
let snd=true,ac;
function tone(f,d=.15,t=0){if(!snd)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();
  const o=ac.createOscillator(),g=ac.createGain(),s=ac.currentTime+t;o.type='triangle';o.frequency.value=f;
  o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.15,s);g.gain.exponentialRampToValueAtTime(.001,s+d);o.start(s);o.stop(s+d)}catch(e){}}
const good=()=>{tone(660);tone(880,.2,.1)},bad=()=>tone(180,.3);

/* ===== ASAS ===== */
let L=1,A=null,fid=0;
const say=t=>$('#ins').textContent=t;
const show=id=>$$('.screen').forEach(s=>s.classList.toggle('show',s.id===id));
const prog=(d,t)=>$('#pb').style.width=(d/t*100)+'%';
function step(d,t){good();prog(d,t);if(d>=t)setTimeout(win,900)}
const shake=e=>{e.classList.remove('no');void e.offsetWidth;e.classList.add('no')};

function start(a){A=a;$('#ov').classList.remove('show');fid++;show('game');
  $('#gt').textContent=NAMES[a]+' • Aras '+L;$('#board').innerHTML='';prog(0,1);ACT[a](L)}

/* Seret & lepas (sokong tetikus dan sentuhan) */
function drag(e,chk){
  e.onpointerdown=ev=>{ev.preventDefault();e.setPointerCapture(ev.pointerId);const x0=ev.clientX,y0=ev.clientY;e.classList.add('drag');
    e.onpointermove=m=>e.style.transform=`translate(${m.clientX-x0}px,${m.clientY-y0}px) scale(1.15)`;
    e.onpointerup=e.onpointercancel=u=>{e.onpointermove=e.onpointerup=e.onpointercancel=null;e.classList.remove('drag');e.style.transform='';
      e.style.visibility='hidden';const el=document.elementFromPoint(u.clientX,u.clientY);e.style.visibility='';
      const s=el&&el.closest('.slot');if(s&&!chk(s)){bad();shake(e)}}}}

/* ===== AKTIVITI ===== */
const ACT={};

/* 1. MENGECAM – sama (3.2.1) & ganjil (3.2.2) */
ACT.mengecam=L=>{const N=5,n=[3,4,6][L-1];let q=0;
  (function next(){const odd=L===2||(L===3&&q%2===1),a=pick(ALL,1)[0];let items,c,h='';
    if(odd){c=pick(ALL.filter(x=>x!==a),1)[0];items=shuffle([c,...Array(n-1).fill(a)]);say('Cari yang GANJIL! 🤔')}
    else{c=a;items=shuffle([a,...pick(ALL.filter(x=>x!==a),n-1)]);say('Pilih yang SAMA seperti ini! 👀');h=`<div class="t target">${tile(a)}</div>`}
    const B=$('#board');B.innerHTML=h+'<div class="row"></div>';const R=B.lastChild;
    items.forEach((v,i)=>{const b=document.createElement('button');b.className='t';b.style.animationDelay=i*.08+'s';b.innerHTML=tile(v);
      b.onclick=()=>{if(v===c){b.classList.add('ok');R.style.pointerEvents='none';step(++q,N);if(q<N)setTimeout(next,900)}else{bad();shake(b)}};R.append(b)})})()};

/* 2. PADANKAN – seret gambar ke bayang yang sama */
ACT.padanan=L=>{const n=[3,4,6][L-1],it=pick(ALL,n);let d=0;say('Seret gambar ke bayang yang sama! 👆');
  $('#board').innerHTML='<div class="row" id="sl"></div><div class="row" id="dr"></div>';
  shuffle(it).forEach(v=>{const s=document.createElement('div');s.className='slot';s.dataset.v=v;s.innerHTML=`<span class="g">${tile(v)}</span>`;$('#sl').append(s)});
  shuffle(it).forEach(v=>{const e=document.createElement('div');e.className='t dr';e.innerHTML=tile(v);$('#dr').append(e);
    drag(e,s=>{if(s.dataset.v!==v||s.classList.contains('done'))return 0;s.className='slot done';s.innerHTML=tile(v);e.remove();step(++d,n);return 1})})};

/* 3. JIGSAW – cantumkan kepingan gambar */
ACT.jigsaw=L=>{const [r,c]=[[2,2],[2,3],[3,3]][L-1],S=Math.min(100,Math.floor((Math.min(innerWidth,640)-50)/c)),N=r*c,
    pic=pick(['🐶','🐱','🐼','🐸','🍎','🚗','🌸','🦁','🐵','🐰'],1)[0];
  const cv=document.createElement('canvas');cv.width=c*100;cv.height=r*100;const x=cv.getContext('2d'),g=x.createLinearGradient(0,0,cv.width,cv.height);
  g.addColorStop(0,'#bdeaff');g.addColorStop(1,'#ffe3f0');x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);
  x.font=Math.min(cv.width,cv.height)*.8+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(pic,cv.width/2,cv.height/2+8);
  const url=`url(${cv.toDataURL()})`;let d=0;
  const st=(e,i)=>{e.classList.add('jg');Object.assign(e.style,{width:S+'px',height:S+'px',backgroundImage:url,backgroundSize:`${c*S}px ${r*S}px`,backgroundPosition:`-${i%c*S}px -${Math.floor(i/c)*S}px`})};
  say('Cantumkan kepingan jigsaw! 🧩');
  $('#board').innerHTML=`<div id="gb" style="display:grid;grid-template-columns:repeat(${c},${S}px);gap:3px"></div><div class="row" id="dr"></div>`;
  for(let i=0;i<N;i++){const s=document.createElement('div');s.className='slot gh'+(L===3?' h':'');s.dataset.v=i;st(s,i);$('#gb').append(s)}
  shuffle([...Array(N).keys()]).forEach(i=>{const e=document.createElement('div');e.className='t dr';st(e,i);$('#dr').append(e);
    drag(e,s=>{if(+s.dataset.v!==i||s.classList.contains('done'))return 0;s.classList.remove('gh');s.classList.add('done');e.remove();step(++d,N);return 1})})};

/* 4. SUSUN – susun mengikut contoh */
ACT.susun=L=>{const n=[3,4,5][L-1],R=3;let q=0;
  (function next(){const seq=pick(ALL,n);say('Susun mengikut contoh! 👆');
    $('#board').innerHTML=`<p class="lab">Contoh</p><div class="row">${seq.map(v=>`<div class="t mini">${tile(v)}</div>`).join('')}</div><p class="lab">Jawapan kamu</p><div class="row" id="an"></div><div class="row" id="tr"></div>`;
    const an=$('#an'),tr=$('#tr'),cells=seq.map(()=>{const c=document.createElement('div');c.className='slot';an.append(c);return c});
    const toks=shuffle(seq).map(v=>{const b=document.createElement('button');b.className='t';b.dataset.v=v;b.innerHTML=tile(v);
      b.onclick=()=>{if(b.parentNode===tr){const c=cells.find(c=>!c.firstChild);if(c){c.append(b);check()}}else tr.append(b)};tr.append(b);return b});
    function check(){if(cells.some(c=>!c.firstChild))return;
      if(cells.every((c,i)=>c.firstChild.dataset.v===seq[i])){an.style.pointerEvents='none';cells.forEach(c=>c.classList.add('done'));step(++q,R);if(q<R)setTimeout(next,1100)}
      else{bad();cells.forEach(c=>shake(c.firstChild));setTimeout(()=>toks.forEach(b=>{b.classList.remove('no');tr.append(b)}),700)}}})()};

/* 5. KATEGORI – asingkan ke bakul yang betul */
ACT.kategori=L=>{const k=L===3?3:2,m=L===1?2:3,n=k*m,cs=pick(Object.keys(CAT),k);let d=0;say('Letakkan dalam bakul yang betul! 🧺');
  $('#board').innerHTML='<div class="row" id="sl" style="align-items:stretch;width:100%"></div><div class="row" id="dr"></div>';
  cs.forEach(c=>{const b=document.createElement('div');b.className='slot bk';b.dataset.c=c;b.style.background=CC[c];b.innerHTML=`<b>${CI[c]} ${c}</b><div class="in"></div>`;$('#sl').append(b)});
  shuffle(cs.flatMap(c=>pick(CAT[c],m).map(v=>[v,c]))).forEach(([v,c])=>{const e=document.createElement('div');e.className='t dr';e.textContent=v;$('#dr').append(e);
    drag(e,s=>{if(s.dataset.c!==c)return 0;const t=document.createElement('div');t.className='t mini';t.textContent=v;s.querySelector('.in').append(t);e.remove();step(++d,n);return 1})})};

/* ===== KEJAYAAN: PIALA + BUNGA API ===== */
function win(){$('#ov').classList.add('show');[523,659,784,1047].forEach((f,i)=>tone(f,.3,i*.15));fire()}
function fire(){const c=$('#fx'),x=c.getContext('2d'),id=++fid;c.width=innerWidth;c.height=innerHeight;let P=[],t=0;
  const burst=()=>{const X=Math.random()*c.width,Y=Math.random()*c.height*.55+30,h=rnd(360);
    for(let i=0;i<50;i++){const a=i/50*6.283,s=2+Math.random()*4;P.push({x:X,y:Y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,h})}};
  (function loop(){if(fid!==id)return;
    x.globalCompositeOperation='destination-out';x.fillStyle='rgba(0,0,0,.2)';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='lighter';
    if(t++%25===0){burst();tone(120+rnd(100),.25)}
    P=P.filter(p=>p.l>0);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.05;p.vx*=.99;p.l-=.012;
      x.fillStyle=`hsla(${p.h},100%,60%,${p.l})`;x.beginPath();x.arc(p.x,p.y,3,0,6.3);x.fill()});
    requestAnimationFrame(loop)})()}

/* ===== PERISTIWA ===== */
$$('.lv').forEach(b=>b.onclick=()=>{L=+b.dataset.l;$$('.lv').forEach(x=>x.classList.toggle('on',x===b))});
$$('.card').forEach(b=>b.onclick=()=>start(b.dataset.a));
$('#again').onclick=()=>start(A);
$('#menuBtn').onclick=$('#back').onclick=()=>{$('#ov').classList.remove('show');fid++;show('menu')};
$('#snd').onclick=e=>{snd=!snd;e.currentTarget.textContent=snd?'🔊':'🔇'};
$('#bg').innerHTML=Array.from({length:14},()=>`<span style="left:${rnd(95)}%;animation-duration:${12+rnd(14)}s;animation-delay:-${rnd(20)}s;font-size:${1.5+rnd(20)/10}rem">${['⭐','🎈','☁️','🌈','🦋','🌸'][rnd(6)]}</span>`).join('');
