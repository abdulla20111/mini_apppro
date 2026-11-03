const tg=window.Telegram&&Telegram.WebApp;if(tg){tg.ready();tg.expand();}
const U=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{first_name:"Mehmon",username:"mehmon"};

let st;try{st=JSON.parse(localStorage.getItem("dars")||"{}")}catch(e){st={}}
st.done=st.done||{};st.hist=st.hist||[];
const save=()=>{try{localStorage.setItem("dars",JSON.stringify(st))}catch(e){}};
let tab="home",cur=null,les=null;
const $=s=>document.querySelector(s);
const key=(c,i)=>c+":"+i;
const total=CATS.reduce((a,c)=>a+c.lessons.length,0);
const doneN=()=>Object.keys(st.done).length;

function nav(){
 const it=[["home","🏠","Bosh sahifa"],["hist","🕘","Tarix"],["set","⚙️","Sozlamalar"]];
 $("#nav").innerHTML=it.map(([k,i,l])=>`<button class="${tab===k?"on":""}" onclick="go('${k}')"><span>${i}</span>${l}</button>`).join("");
}
function go(k){tab=k;cur=null;les=null;render()}
function top(title,fn){return `<div class="top"><button class="back" onclick="${fn}">←</button><div class="pill">${title}</div></div>`}

function render(){
 nav();const a=$("#app");
 if(tg){tg.BackButton.offClick(backFn);(cur||les!==null)?tg.BackButton.show():tg.BackButton.hide();tg.BackButton.onClick(backFn);}
 window.scrollTo(0,0);
 if(les!==null){
  const c=cur,l=c.lessons[les],d=!!st.done[key(c.id,les)];
  a.innerHTML=top(l.t,"back()")+player(l.v)+`<div class="read"><h2>${l.t}</h2><p>${l.x}</p></div>
  <button class="btn" onclick="finish()">${d?"Oʻrganilgan ✓":"Oʻrganildi deb belgilash"}</button>`;
  return;
 }
 if(cur){
  const c=cur,n=c.lessons.filter((_,i)=>st.done[key(c.id,i)]).length;
  a.innerHTML=top(c.t,"back()")+(c.lessons.length?c.lessons.map((l,i)=>`<button class="lesson ${st.done[key(c.id,i)]?"done":""}" onclick="openL(${i})"><div class="n">${st.done[key(c.id,i)]?"✓":i+1}</div><div><b>${l.t}</b><span>${l.d}${l.v?" · video":""}</span></div></button>`).join("")+`<p class="empty">${n} / ${c.lessons.length} dars tugallandi</p>`:`<p class="empty">Darslar tez orada qoʻshiladi</p>`);
  return;
 }
 if(tab==="home"){
  const p=total?Math.round(doneN()/total*100):0;
  a.innerHTML=`<div class="user"><div class="ava">${U.photo_url?`<img src="${U.photo_url}" alt="">`:(U.first_name||"?")[0]}</div><div><b>${U.first_name||""}</b><span>${U.username?"@"+U.username:""}</span></div></div>
  <div class="hero"><small>Oʻqish jarayoni</small><h2>${doneN()} / ${total} dars</h2><div class="bar"><i style="width:${p}%"></i></div></div>
  <div class="sec">Yoʻnalishni tanlang</div>
  ${CATS.map(c=>`<button class="cat" onclick="openC('${c.id}')"><span class="ci">${c.ic}</span><span class="ct">${c.t}<small>${c.lessons.length} ta dars</small></span><span class="ch">›</span></button>`).join("")}`;
 }else if(tab==="hist"){
  a.innerHTML=top("Tarix","go('home')")+(st.hist.length?st.hist.map(h=>`<div class="lesson"><div class="n">▶</div><div><b>${h.t}</b><span>${h.c}</span></div></div>`).join(""):`<p class="empty">Hali dars koʻrilmagan</p>`);
 }else{
  a.innerHTML=top("Sozlamalar","go('home')")+`<div class="read"><b>Hisob</b><p>${U.first_name||""} ${U.username?"(@"+U.username+")":""}</p></div><button class="btn ghost" onclick="reset()">Jarayonni tozalash</button>`;
 }
}
function player(u){
 if(!u)return "";
 let m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
 if(m)return `<div class="video"><iframe src="https://www.youtube.com/embed/${m[1]}?rel=0&playsinline=1" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
 m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
 if(m)return `<div class="video"><iframe src="https://player.vimeo.com/video/${m[1]}" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
 return `<div class="video"><video src="${u}" controls playsinline preload="metadata"></video></div>`;
}
function openC(id){cur=CATS.find(c=>c.id===id);render()}
function openL(i){les=i;const c=cur,l=c.lessons[i];st.hist=[{t:l.t,c:c.t},...st.hist.filter(h=>h.t!==l.t)].slice(0,30);save();render()}
function finish(){st.done[key(cur.id,les)]=1;save();back()}
function back(){if(les!==null)les=null;else cur=null;render()}
const backFn=()=>back();
function reset(){st={done:{},hist:[]};save();render()}
render();
