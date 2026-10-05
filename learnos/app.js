const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const KEY="learnos_v1";
const seed={
 subjects:[
  {id:"la",name:"Linear Algebra",icon:"LA",color:"violet",progress:68,topics:[
   ["Matrix Basics",100,"master"],["Matrix Operations",100,"master"],["Determinants",100,"master"],["Rank",100,"master"],["Vector Spaces",72,"practice"],["Eigenvalues",42,"weak"],["Eigenvectors",0,"locked"],["Diagonalization",0,"locked"],["SVD",0,"locked"]]},
  {id:"dsa",name:"DSA",icon:"DS",color:"cyan",progress:56,topics:[["Arrays",100,"master"],["Linked Lists",85,"strong"],["Stacks & Queues",74,"practice"],["Trees",58,"practice"],["Graphs",42,"weak"],["Dynamic Programming",25,"learning"]]},
  {id:"de",name:"Data Engineering",icon:"DE",color:"green",progress:68,topics:[["SQL",88,"strong"],["ETL",76,"practice"],["Data Modeling",72,"practice"],["Pipelines",60,"practice"],["Spark",45,"weak"]]},
  {id:"web",name:"Web Technology",icon:"WEB",color:"cyan",progress:91,topics:[["HTML",100,"master"],["CSS",96,"master"],["JavaScript",92,"master"],["APIs",84,"strong"],["Performance",82,"strong"]]},
  {id:"ml",name:"Machine Learning",icon:"ML",color:"violet",progress:35,topics:[["Regression",70,"practice"],["Classification",55,"practice"],["Statistics",52,"weak"],["Neural Networks",30,"learning"],["Model Evaluation",22,"weak"]]}
 ],
 goals:[{id:"g1",title:"Master Linear Algebra",subject:"Linear Algebra",target:"2026-10-30",progress:76,remaining:8,daily:45}],
 hours:[2.1,1.5,2.7,1.2,1.8,3.2,1.6],
 streak:12,longest:21,
 quizzes:[72,81,68,91],
 notifications:[
  {t:"You haven't practiced DSA in 4 days.",time:"Just now"},
  {t:"You're 2 topics away from completing Python.",time:"2h ago"},
  {t:"Your 12-day streak is active.",time:"Today"},
  {t:"Eigenvalues mastery is below your target.",time:"Yesterday"}],
 achievements:[
  ["🏆","First Subject Completed","Complete your first subject",true],
  ["🔥","7-Day Streak","Study for 7 consecutive days",true],
  ["📚","10 Topics Mastered","Master ten topics",true],
  ["⚡","5 Hours in One Week","Log 5+ learning hours",true],
  ["🎯","Perfect Quiz","Score 100% on a quiz",false],
  ["🧠","Concept Master","Reach mastery in a difficult topic",true],
  ["🚀","Fast Learner","Complete 3 topics in one day",false],
  ["🌌","Galaxy Explorer","Explore your knowledge map",false]
 ],
 profile:{name:"Rushandra",level:"Intermediate"}
};
let state=load(); let currentView="dashboard";

function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch(e){return structuredClone(seed)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(msg,type=""){const el=document.createElement("div");el.className="toast "+type;el.textContent=msg;$("#toast-container").appendChild(el);setTimeout(()=>el.remove(),2800)}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function avgProgress(){return Math.round(state.subjects.reduce((a,s)=>a+s.progress,0)/state.subjects.length)}
function topicsCompleted(){return state.subjects.reduce((a,s)=>a+s.topics.filter(t=>t[1]>=80).length,0)}
function totalHours(){return state.hours.reduce((a,b)=>a+b,0)}
function allTopics(){return state.subjects.flatMap(s=>s.topics.map(t=>({...t,subject:s.name,subjectId:s.id})))}
function statusLabel(n){return n>=90?"Mastered":n>=75?"Strong":n>=50?"Practicing":n>0?"Learning":"Locked"}
function colorClass(n){return n>=90?"mastered":n>=75?"learning":n>=50?"weak":"locked"}

function render(){
 renderStats();renderGalaxy();renderRecommendation();renderContinue();renderWeak();renderStreak();renderHours();renderAchievements();
 renderSubjects();renderJourneySelect();renderJourney();renderKnowledge();renderAnalytics();renderGoals();renderAchievementPage();renderProfile();renderNotifications();
}
function renderStats(){
 const stats=[["Overall Progress",avgProgress()+"%","↑ 6.4% this month"],["Topics Completed",topicsCompleted(),"↑ 5 this month"],["Learning Time",`${Math.floor(totalHours())}h ${Math.round((totalHours()%1)*60)}m`,"↑ 18% this week"],["Current Streak",`🔥 ${state.streak} days`,"Keep it going"]];
 $("#stats-grid").innerHTML=stats.map(x=>`<div class="stat"><div class="stat-label">${x[0]}</div><div class="stat-value">${x[1]}</div><div class="stat-sub">${x[2]}</div></div>`).join("");
}
function renderGalaxy(){
 const nodes=[["Matrices",18,73,100],["Vector Spaces",38,51,72],["Eigenvalues",58,42,42],["Eigenvectors",74,27,0],["Diagonalization",83,65,0],["SVD",64,83,0]];
 let lines="";
 for(let i=0;i<nodes.length-1;i++){let a=nodes[i],b=nodes[i+1];let dx=(b[1]-a[1]),dy=(b[2]-a[2]);let len=Math.sqrt(dx*dx+dy*dy)*2.8,ang=Math.atan2(dy,dx)*180/Math.PI;lines+=`<i class="galaxy-line" style="left:${a[1]}%;top:${a[2]}%;width:${len}%;transform:rotate(${ang}deg)"></i>`}
 $("#galaxy").innerHTML=lines+nodes.map(n=>`<button class="galaxy-node ${colorClass(n[3])}" style="left:${n[1]}%;top:${n[2]}%" data-topic="${n[0]}"><span>${n[0]}</span></button>`).join("");
 $$("#galaxy-node");
 $$(".galaxy-node").forEach(b=>b.onclick=()=>showTopic(b.dataset.topic));
}
function getRecommendation(){
 const weak=allTopics().filter(t=>t[1]>0&&t[1]<75).sort((a,b)=>a[1]-b[1])[0];
 if(weak)return {name:weak[0],subject:weak.subject,reason:`Your mastery is ${weak[1]}%. Strengthening this now creates the best path to the next unlocked concept.`,time:"2h 30m"};
 const locked=allTopics().find(t=>t[1]===0);return {name:locked?.[0]||"Review & Practice",subject:locked?.subject||"Your strongest subject",reason:"You've built enough foundation to take on a new challenge.",time:"1h 45m"};
}
function renderRecommendation(){let r=getRecommendation();$("#recommendation-card").innerHTML=`<div class="recommend-topic">${esc(r.name)}</div><div class="reason">${esc(r.reason)}</div><div class="check">✓ Fits your current learning path</div><div class="check">✓ Targets a high-impact skill</div><div class="estimate"><span>Estimated time</span><b>${r.time}</b></div><button class="primary" onclick="startRecommendation('${esc(r.name)}')">START LEARNING →</button>`}
function startRecommendation(name){toast(`Learning session started: ${name}`);logActivity(0.5)}
function renderContinue(){
 const s=state.subjects.slice().sort((a,b)=>b.progress-a.progress)[0];
 $("#continue-card").innerHTML=`<div class="continue"><div class="subject-icon">${esc(s.icon)}</div><div class="continue-info"><strong>${esc(s.name)}</strong><small>${esc(s.topics.find(t=>t[1]<100)?.[0]||"Review")}</small><div class="progress"><i style="width:${s.progress}%"></i></div></div><button class="ghost" onclick="openSubject('${s.id}')">→</button></div>`
}
function renderWeak(){
 const w=allTopics().filter(t=>t[1]>0&&t[1]<60).sort((a,b)=>a[1]-b[1]).slice(0,4);
 $("#weak-list").innerHTML=w.length?w.map(t=>`<div class="weak-item"><div><strong>${esc(t[0])}</strong><small>${esc(t.subject)}</small></div><div class="pct">${t[1]}%</div></div>`).join(""):`<div class="empty">No weak areas — excellent work.</div>`;
}
function renderStreak(){
 $("#streak-big").innerHTML=`${state.streak} <small>DAYS</small>`;
 $("#longest-streak").textContent=`Longest streak: ${state.longest} days`;
 const days=["M","T","W","T","F","S","S"];$("#week").innerHTML=days.map((d,i)=>`<div><b>${d}</b><i class="${i<Math.min(state.streak,7)?"on":""}"></i></div>`).join("");
}
function renderHours(){
 const max=Math.max(...state.hours,1),days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
 $("#hours-chart").innerHTML=state.hours.map((h,i)=>`<div class="bar"><em>${h}h</em><i style="height:${h/max*78}%"></i><span>${days[i]}</span></div>`).join("");
}
function renderAchievements(){
 $("#recent-achievements").innerHTML=state.achievements.filter(a=>a[3]).slice(0,4).map(a=>`<div class="achievement-mini"><div class="badge">${a[0]}</div><div><strong>${a[1]}</strong><small>${a[2]}</small></div></div>`).join("");
}
function renderSubjects(){
 $("#subject-grid").innerHTML=state.subjects.map(s=>`<article class="subject-card"><div class="subject-top"><div class="subject-icon">${esc(s.icon)}</div><div class="subject-percent">${s.progress}%</div></div><h2>${esc(s.name)}</h2><p>${s.topics.length} topics · ${s.topics.filter(t=>t[1]>=80).length} mastered</p><div class="progress"><i style="width:${s.progress}%"></i></div><div style="margin-top:14px">${s.topics.slice(0,4).map(t=>`<div class="topic-row"><span>${esc(t[0])}</span><span class="status-pill" style="${t[1]<60?'color:var(--yellow);background:rgba(245,196,81,.1)':''}">${t[1]}% · ${statusLabel(t[1])}</span></div>`).join("")}</div><div style="display:flex;gap:7px;margin-top:13px"><button class="primary" style="font-size:10px" onclick="openSubject('${s.id}')">Open map</button><button class="ghost" onclick="editSubject('${s.id}')">Edit</button></div></article>`).join("");
}
function renderJourneySelect(){let sel=$("#journey-subject"),old=sel.value;sel.innerHTML=state.subjects.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("");sel.value=state.subjects.some(s=>s.id===old)?old:state.subjects[0]?.id||""}
function renderJourney(){
 const s=state.subjects.find(x=>x.id===$("#journey-subject").value)||state.subjects[0]; if(!s)return;
 $("#journey-map").innerHTML=`<div class="journey-road">${s.topics.map((t,i)=>`<div class="road-node ${t[1]>=90?"master":t[1]===0?"locked":t[1]<60?"weak":""}"><span class="road-dot"></span><div class="road-card"><strong>${esc(t[0])}</strong><small>${statusLabel(t[1])} · ${t[1]}%</small><div class="progress"><i style="width:${t[1]}%"></i></div>${t[1]>0&&t[1]<100?`<button class="ghost" style="margin-top:8px;font-size:9px" onclick="advanceTopic('${s.id}',${i})">Update progress</button>`:""}</div></div>`).join("")}</div>`;
}
function renderKnowledge(){
 const c=$("#knowledge-canvas"), positions={Matrices:[18,20],Determinants:[42,12],Rank:[42,36],"Vector Spaces":[65,25],Eigenvalues:[84,15],Eigenvectors:[84,42],Diagonalization:[67,55],SVD:[45,78]};
 const edges=[["Matrices","Determinants"],["Matrices","Rank"],["Determinants","Vector Spaces"],["Rank","Vector Spaces"],["Vector Spaces","Eigenvalues"],["Vector Spaces","Eigenvectors"],["Eigenvalues","Diagonalization"],["Eigenvectors","Diagonalization"],["Diagonalization","SVD"]];
 let html="";for(const [a,b] of edges){let p=positions[a],q=positions[b],dx=q[0]-p[0],dy=q[1]-p[1],len=Math.sqrt(dx*dx+dy*dy),ang=Math.atan2(dy,dx)*180/Math.PI;html+=`<i class="knowledge-edge learning" style="left:${p[0]}%;top:${p[1]}%;width:${len}%;transform:rotate(${ang}deg)"></i>`}
 const map=new Map(allTopics().map(t=>[t[0],t[1]]));
 for(const [n,p] of Object.entries(positions)){let val=map.get(n)??(n==="Matrices"?100:0);html+=`<button class="knowledge-node ${colorClass(val)}" style="left:${p[0]}%;top:${p[1]}%" data-node="${n}">${n}<small style="margin-left:5px;opacity:.6">${val}%</small></button>`}
 c.innerHTML=html;$$("#knowledge-canvas .knowledge-node").forEach(n=>n.onclick=()=>{let name=n.dataset.node,val=allTopics().find(t=>t[0]===name);$("#node-details").classList.add("show");$("#node-details").innerHTML=`<h3>${name}</h3><p>${val?`Current mastery: <b>${val[1]}%</b>.<br><br>Click the journey view to practice this concept and unlock the next connected skill.`:"Core prerequisite in your learning graph."}</p>`});
}
function renderAnalytics(){drawRadar();drawLine();renderWeakDetail();renderQuiz()}
function setupCanvas(canvas){const dpr=devicePixelRatio||1,w=canvas.clientWidth||canvas.width,h=canvas.clientHeight||canvas.height;canvas.width=w*dpr;canvas.height=h*dpr;let c=canvas.getContext("2d");c.scale(dpr,dpr);return [c,w,h]}
function drawRadar(){
 const [c,w,h]=setupCanvas($("#radar")),cx=w/2,cy=h/2+5,r=Math.min(w,h)*.31,vals=[90,70,82,52,45,61],labels=["Python","DSA","SQL","Statistics","ML","Maths"];c.clearRect(0,0,w,h);
 c.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--line");c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--muted");c.font="10px Inter";
 for(let ring=1;ring<=4;ring++){c.beginPath();for(let i=0;i<6;i++){let a=-Math.PI/2+i*Math.PI*2/6,x=cx+Math.cos(a)*r*ring/4,y=cy+Math.sin(a)*r*ring/4;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.stroke()}
 c.beginPath();vals.forEach((v,i)=>{let a=-Math.PI/2+i*Math.PI*2/6,x=cx+Math.cos(a)*r*v/100,y=cy+Math.sin(a)*r*v/100;i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath();c.fillStyle="rgba(139,92,246,.18)";c.fill();c.strokeStyle="#8b5cf6";c.stroke();
 labels.forEach((l,i)=>{let a=-Math.PI/2+i*Math.PI*2/6;c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--muted");c.fillText(l,cx+Math.cos(a)*(r+25)-18,cy+Math.sin(a)*(r+25))})
}
function drawLine(){
 const [c,w,h]=setupCanvas($("#progress-line")),pad=35,vals=[28,35,42,47,58,61,68,72,77,82],max=100,min=0;c.clearRect(0,0,w,h);c.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--line");
 for(let i=0;i<5;i++){let y=pad+(h-pad*2)*i/4;c.beginPath();c.moveTo(pad,y);c.lineTo(w-pad,y);c.stroke();c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--muted");c.font="9px Inter";c.fillText(`${100-i*25}%`,4,y+3)}
 c.beginPath();vals.forEach((v,i)=>{let x=pad+(w-pad*2)*i/(vals.length-1),y=h-pad-(h-pad*2)*v/100;i?c.lineTo(x,y):c.moveTo(x,y)});c.strokeStyle="#35d9ff";c.lineWidth=2;c.stroke();c.lineWidth=1;
}
function renderWeakDetail(){const w=allTopics().filter(t=>t[1]>0&&t[1]<60).sort((a,b)=>a[1]-b[1]).slice(0,4);$("#weak-detail").innerHTML=w.map(t=>`<div class="weak-detail-card"><h3>${esc(t[0])} <span style="float:right;color:var(--yellow)">${t[1]}%</span></h3><div class="weak-metrics"><div><b>${Math.max(20,t[1]+19)}%</b><span>CONCEPT</span></div><div><b>${Math.max(15,t[1]-8)}%</b><span>PRACTICE</span></div><div><b>${Math.max(18,t[1]-1)}%</b><span>QUIZ</span></div></div><small style="display:block;color:var(--muted);margin-top:10px">→ Review concepts · Solve 10 basics · Take mini quiz</small></div>`).join("")}
function renderQuiz(){$("#quiz-performance").innerHTML=state.quizzes.map((q,i)=>`<div class="quiz-row"><span>Quiz 0${i+1}</span><div class="progress"><i style="width:${q}%"></i></div><b>${q}%</b></div>`).join("")+`<div style="margin-top:18px;padding:12px;background:var(--panel2);border-radius:10px;font-size:11px">📈 Your quiz performance improved by <b>14%</b> this month.</div>`}
function renderGoals(){$("#goal-grid").innerHTML=state.goals.length?state.goals.map(g=>`<article class="goal-card"><div class="goal-head"><div><span class="eyebrow">ACTIVE GOAL</span><h2>${esc(g.title)}</h2></div><div class="goal-percent">${g.progress}%</div></div><div class="goal-meta"><span>🎯 ${esc(g.target)}</span><span>◷ ${g.daily} min/day</span><span>${g.remaining} topics left</span></div><div class="progress"><i style="width:${g.progress}%"></i></div><div style="display:flex;justify-content:flex-end;gap:7px;margin-top:14px"><button class="ghost" onclick="advanceGoal('${g.id}')">Update</button><button class="ghost" onclick="deleteGoal('${g.id}')">Delete</button></div></article>`).join(""):`<div class="empty">No goals yet. Create one to give your learning a direction.</div>`}
function renderAchievementPage(){$("#achievement-grid").innerHTML=state.achievements.map(a=>`<article class="achievement-card ${a[3]?"":"locked"}"><div class="badge">${a[0]}</div><h3>${a[1]}</h3><p>${a[2]}</p><small>${a[3]?"UNLOCKED":"LOCKED"}</small></article>`).join("")}
function renderProfile(){let data=[["Topics Mastered",topicsCompleted()],["Learning Hours",`${Math.floor(totalHours())}h ${Math.round((totalHours()%1)*60)}m`],["Current Streak",`${state.streak} days 🔥`],["Strongest Skill","Python"],["Focus Area","Mathematics"],["Average Quiz",`${Math.round(state.quizzes.reduce((a,b)=>a+b,0)/state.quizzes.length)}%`]];$("#profile-stats").innerHTML=data.map(x=>`<div class="profile-stat"><span class="eyebrow">${x[0]}</span><b>${x[1]}</b></div>`).join("")}
function renderNotifications(){$("#notification-list").innerHTML=state.notifications.length?state.notifications.map(n=>`<div class="notification">🔔 ${esc(n.t)}<span>${n.time}</span></div>`).join(""):`<div class="empty">You're all caught up.</div>`}
function showTopic(name){let t=allTopics().find(x=>x[0]===name);toast(t?`${name}: ${t[1]}% mastery`:`${name} is a core concept`)}
function openSubject(id){navigate("journey");setTimeout(()=>{$("#journey-subject").value=id;renderJourney()},0)}
function advanceTopic(id,i){let s=state.subjects.find(x=>x.id===id),t=s.topics[i];t[1]=Math.min(100,t[1]+10);t[2]=t[1]>=90?"master":t[1]<60?"weak":"practice";s.progress=Math.round(s.topics.reduce((a,x)=>a+x[1],0)/s.topics.length);save();render();toast(`${t[0]} updated to ${t[1]}%`)}
function logActivity(hours=.5){let i=new Date().getDay();i=i===0?6:i-1;state.hours[i]=Math.round((state.hours[i]+hours)*10)/10;state.streak=Math.min(state.streak+1,99);state.longest=Math.max(state.longest,state.streak);save();render();toast(`Logged ${hours} hour of learning`, "success")}
function editSubject(id){let s=state.subjects.find(x=>x.id===id);openModal(`<h2>Edit subject</h2><div class="form-grid"><div class="field"><label>Subject name</label><input id="f-name" value="${esc(s.name)}"></div><div class="field"><label>Progress (0-100)</label><input id="f-progress" type="number" min="0" max="100" value="${s.progress}"></div></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Cancel</button><button class="primary" id="save-subject">Save changes</button></div>`);$("#save-subject").onclick=()=>{s.name=$("#f-name").value.trim()||s.name;s.progress=Math.max(0,Math.min(100,+$("#f-progress").value||0));save();closeModal();render();toast("Subject updated","success")}}
function addSubject(){openModal(`<h2>Create a subject</h2><div class="form-grid"><div class="field"><label>Subject name</label><input id="f-name" placeholder="e.g. Cloud Computing"></div><div class="field"><label>Topics (comma separated)</label><input id="f-topics" placeholder="Basics, Core Concepts, Practice, Advanced"></div><div class="field"><label>Target progress</label><input id="f-progress" type="number" min="0" max="100" value="0"></div></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Cancel</button><button class="primary" id="save-subject">Create subject</button></div>`);$("#save-subject").onclick=()=>{let name=$("#f-name").value.trim();if(!name)return toast("Enter a subject name");let topics=($("#f-topics").value||"Basics, Core Concepts, Practice").split(",").map(x=>[x.trim(),0,"locked"]);state.subjects.push({id:"s"+Date.now(),name,icon:name.slice(0,2).toUpperCase(),color:"violet",progress:+$("#f-progress").value||0,topics});save();closeModal();render();toast(`${name} created`,"success")}}
function addGoal(){openModal(`<h2>Create a goal</h2><div class="form-grid"><div class="field"><label>Goal</label><input id="g-title" placeholder="Master React"></div><div class="field"><label>Subject</label><select id="g-sub">${state.subjects.map(s=>`<option>${esc(s.name)}</option>`).join("")}</select></div><div class="field"><label>Target date</label><input id="g-date" type="date" value="2026-11-30"></div><div class="field"><label>Daily target (minutes)</label><input id="g-min" type="number" value="45"></div></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Cancel</button><button class="primary" id="save-goal">Create goal</button></div>`);$("#save-goal").onclick=()=>{let title=$("#g-title").value.trim();if(!title)return toast("Enter a goal");state.goals.push({id:"g"+Date.now(),title,subject:$("#g-sub").value,target:$("#g-date").value,progress:0,remaining:5,daily:+$("#g-min").value||45});save();closeModal();render();toast("Goal created","success")}}
function advanceGoal(id){let g=state.goals.find(x=>x.id===id);g.progress=Math.min(100,g.progress+8);g.remaining=Math.max(0,g.remaining-1);save();render();toast("Goal progress updated","success")}
function deleteGoal(id){if(confirm("Delete this goal?")){state.goals=state.goals.filter(x=>x.id!==id);save();render()}}
function editProfile(){openModal(`<h2>Edit profile</h2><div class="form-grid"><div class="field"><label>Name</label><input id="p-name" value="${esc(state.profile.name)}"></div><div class="field"><label>Learning level</label><select id="p-level"><option>Beginner</option><option ${state.profile.level==="Intermediate"?"selected":""}>Intermediate</option><option>Advanced</option></select></div></div><div class="modal-actions"><button class="ghost" onclick="closeModal()">Cancel</button><button class="primary" id="save-profile">Save</button></div>`);$("#save-profile").onclick=()=>{state.profile.name=$("#p-name").value||"Rushandra";state.profile.level=$("#p-level").value;save();closeModal();render();toast("Profile updated","success")}}
function openModal(content){$("#modal").innerHTML=content;$("#modal-backdrop").classList.add("show")}
function closeModal(){$("#modal-backdrop").classList.remove("show")}
function navigate(view){currentView=view;$$(".view").forEach(v=>v.classList.remove("active"));$("#view-"+view).classList.add("active");$$(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$("#view-label").textContent={dashboard:"Overview",subjects:"My Subjects",journey:"Learning Journey",knowledge:"Knowledge Map",analytics:"Analytics",goals:"Goals",achievements:"Achievements",profile:"Profile"}[view];window.scrollTo({top:0,behavior:"smooth"});if(innerWidth<761)$("#sidebar")?.classList.remove("open")}
function openSearch(){const o=$("#search-overlay");o.classList.add("show");$("#global-search").focus();search("")}
function search(q){let term=q.toLowerCase(),items=[];state.subjects.forEach(s=>{if(s.name.toLowerCase().includes(term))items.push({name:s.name,sub:"Subject",action:()=>openSubject(s.id)});s.topics.forEach(t=>{if(t[0].toLowerCase().includes(term))items.push({name:t[0],sub:`${s.name} · ${t[1]}% mastery`,action:()=>showTopic(t[0])})})});items=items.slice(0,8);$("#search-results").innerHTML=items.length?items.map((x,i)=>`<div class="search-result" data-i="${i}"><span>${esc(x.name)}</span><small>${esc(x.sub)}</small></div>`).join(""):`<div class="empty" style="margin:14px">No learning results found.</div>`;$$(".search-result").forEach((e,i)=>e.onclick=()=>{items[i].action();$("#search-overlay").classList.remove("show")})}
$("#main-nav").addEventListener("click",e=>{let b=e.target.closest("[data-view]");if(b)navigate(b.dataset.view)});
$$("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
$("#journey-subject").onchange=renderJourney;
$("#add-subject").onclick=addSubject;$("#add-goal").onclick=addGoal;$("#edit-profile").onclick=editProfile;$("#log-time-hero").onclick=()=>logActivity(.5);
$("#modal-backdrop").onclick=e=>{if(e.target.id==="modal-backdrop")closeModal()};
$("#search-open").onclick=openSearch;$("#search-overlay").onclick=e=>{if(e.target.id==="search-overlay")e.currentTarget.classList.remove("show")};$("#global-search").oninput=e=>search(e.target.value);
$("#notifications-open").onclick=()=>$("#notifications-pop").classList.toggle("show");$("#clear-notifications").onclick=()=>{state.notifications=[];save();renderNotifications();toast("Notifications cleared")};
$("#theme-toggle").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("learnos_theme",document.body.classList.contains("light")?"light":"dark");setTimeout(renderAnalytics,50)};
$("#mobile-menu").onclick=()=>$(".sidebar").classList.toggle("open");
$("#reset-map").onclick=()=>{$("#node-details").classList.remove("show");toast("Knowledge map reset")};
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch()}if(e.key==="Escape"){closeModal();$("#search-overlay").classList.remove("show");$("#notifications-pop").classList.remove("show")}});
if(localStorage.getItem("learnos_theme")==="light")document.body.classList.add("light");
render();
