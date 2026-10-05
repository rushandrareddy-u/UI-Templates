const projects={
 "ai-mirror":{num:"01",title:"AI MIRROR",subtitle:"See What the Model Sees",path:"ai-mirror/index.html"},
 "attendx":{num:"02",title:"ATTENDX",subtitle:"Student Attendance Copilot",path:"attendx/index.html"},
 "airwrite":{num:"03",title:"AIRWRITE",subtitle:"Write Without Touching",path:"airwrite/index.html"},
 "learnos":{num:"04",title:"LEARNOS",subtitle:"Learning Progress OS",path:"learnos/index.html"}
};
const $=s=>document.querySelector(s);
const modal=$("#modal"), frame=$("#projectFrame"), loader=$("#loader");
function openProject(key){
 const p=projects[key]; if(!p)return;
 $("#modalNumber").textContent=p.num; $("#modalTitle").textContent=p.title; $("#modalSubtitle").textContent=p.subtitle;
 frame.classList.remove("ready"); loader.style.display="grid"; modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
 frame.src=p.path;
 frame.onload=()=>{loader.style.display="none";frame.classList.add("ready")};
 $("#launchBtn").onclick=()=>window.open(p.path,"_blank");
 document.body.style.overflow="hidden";
}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");setTimeout(()=>frame.src="about:blank",300);document.body.style.overflow=""}
document.querySelectorAll(".project-card").forEach(card=>card.addEventListener("click",()=>openProject(card.dataset.project)));
$("#closeBtn").onclick=closeModal;$("#modalBackdrop").onclick=closeModal;
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();$("#about").classList.remove("open");document.body.style.overflow=""}});

$("#exploreBtn").onclick=()=>$("#collection").scrollIntoView({behavior:"smooth"});
$("#aboutBtn").onclick=()=>{$("#about").classList.add("open");document.body.style.overflow="hidden"};
$("#aboutClose").onclick=()=>{$("#about").classList.remove("open");document.body.style.overflow=""};

const cursor=$("#cursorGlow");
window.addEventListener("pointermove",e=>{cursor.style.left=e.clientX+"px";cursor.style.top=e.clientY+"px"});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
document.querySelectorAll(".reveal").forEach((el,i)=>{el.style.transitionDelay=(i%4)*80+"ms";observer.observe(el)});

const stars=$("#stars");
for(let i=0;i<35;i++){const s=document.createElement("i");s.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;width:${Math.random()*2+1}px;height:${Math.random()*2+1}px;background:#fff;border-radius:50%;opacity:${Math.random()*.5+.15};animation:twinkle ${2+Math.random()*4}s infinite alternate;animation-delay:${Math.random()*-4}s`;stars.appendChild(s)}
const style=document.createElement("style");style.textContent="@keyframes twinkle{to{opacity:.05;transform:scale(.4)}}";document.head.appendChild(style);

document.querySelectorAll(".project-card").forEach(card=>{
 card.addEventListener("pointermove",e=>{
   if(innerWidth<700)return;
   const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   card.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) translateY(-9px) scale(1.008)`;
 });
 card.addEventListener("pointerleave",()=>card.style.transform="");
});
