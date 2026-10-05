const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const video=$('#video'), paint=$('#paint'), marks=$('#landmarks'), pctx=paint.getContext('2d'), mctx=marks.getContext('2d');
let stream=null,hands=null,running=false,mirror=true,drawing=false,history=[],redoStack=[],lastPoint=null,style='neon',points=[],chars=0,startedAt=Date.now(),lastGesture='';
const colors={neon:'#d9ff3f',laser:'#ff6248',ink:'#f5f5f5',galaxy:'#9b7cff'};
function resize(){const r=paint.getBoundingClientRect(),d=devicePixelRatio||1;paint.width=r.width*d;paint.height=r.height*d;marks.width=r.width*d;marks.height=r.height*d;pctx.setTransform(d,0,0,d,0,0);mctx.setTransform(d,0,0,d,0,0);}
window.addEventListener('resize',resize);resize();
function setStatus(text,state=''){ $('#cameraState').textContent=text; $('#headerStatus').textContent=state||text.toUpperCase(); }
function showHint(title,sub,button=true){$('#hintTitle').textContent=title;$('#hintSub').textContent=sub;$('#cameraStartBtn').style.display=button?'inline-flex':'none';$('#stageHint').classList.remove('active');}
function clearCanvas(){pctx.clearRect(0,0,paint.clientWidth,paint.clientHeight);mctx.clearRect(0,0,marks.clientWidth,marks.clientHeight);history=[];redoStack=[];lastPoint=null;points=[];drawing=false;chars=0;$('#recognizedText').innerHTML='Start writing…<span class="caret"></span>';$('#confidence').textContent='—';$('#wpm').textContent='0';}
function snapshot(){history.push(pctx.getImageData(0,0,paint.width,paint.height));if(history.length>40)history.shift();redoStack=[];}
function drawSegment(a,b){const c=pctx;c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);if(style==='neon'){c.strokeStyle=colors.neon;c.shadowColor=colors.neon;c.shadowBlur=22;c.lineWidth=5}else if(style==='laser'){c.strokeStyle=colors.laser;c.shadowColor=colors.laser;c.shadowBlur=28;c.lineWidth=3}else if(style==='ink'){c.strokeStyle=colors.ink;c.shadowBlur=0;c.lineWidth=6}else{c.strokeStyle=`hsl(${(Date.now()/8)%360},100%,72%)`;c.shadowColor='#9b7cff';c.shadowBlur=25;c.lineWidth=5}c.stroke();c.restore();}
function drawDot(x,y){pctx.save();const col=style==='galaxy'?colors.galaxy:colors[style];pctx.fillStyle=col;pctx.shadowColor=col;pctx.shadowBlur=20;pctx.beginPath();pctx.arc(x,y,3,0,Math.PI*2);pctx.fill();pctx.restore();}
function point(l){const r=paint.getBoundingClientRect();return{x:(mirror?1-l.x:l.x)*r.width,y:l.y*r.height};}
function ext(lm,tip,pip){return lm[tip].y<lm[pip].y-0.025;}
function getGesture(lm){const i=ext(lm,8,6),m=ext(lm,12,10),r=ext(lm,16,14),p=ext(lm,20,18);const open=i&&m&&r&&p, fist=!i&&!m&&!r&&!p, two=i&&m&&!r&&!p, thumb=lm[4].y<lm[3].y&&Math.abs(lm[4].x-lm[3].x)>.03&&!i&&!m&&!r&&!p;if(fist)return'fist';if(thumb)return'thumb';if(two)return'two';if(open)return'open';if(i&&!m&&!r&&!p)return'write';return'none';}
function addText(t){let v=$('#recognizedText').textContent;if(v==='Start writing…')v='';$('#recognizedText').textContent=v+t;chars+=t.length;updateStats();}
function updateStats(){const mins=Math.max((Date.now()-startedAt)/60000,.01);$('#wpm').textContent=Math.round((chars/5)/mins);$('#confidence').textContent=points.length?Math.min(99,70+Math.round(Math.min(points.length,100)/4))+'%':'—';}
function setGesture(g){if(g===lastGesture)return;lastGesture=g;if(g==='fist'){clearCanvas();}else if(g==='thumb'){addText(' ')}else if(g==='two'){addText('\n')}else if(g==='open'){drawing=false;lastPoint=null;}}
function handleResults(res){mctx.clearRect(0,0,marks.clientWidth,marks.clientHeight);if(!res.multiHandLandmarks?.length){$('#trackingPill').classList.remove('active');$('#trackingPill').innerHTML='<span></span>HAND NOT DETECTED';return}$('#trackingPill').classList.add('active');$('#trackingPill').innerHTML='<span></span>HAND TRACKED';const lm=res.multiHandLandmarks[0],pt=point(lm[8]);const col=style==='galaxy'?colors.galaxy:colors[style];mctx.fillStyle=col;mctx.shadowColor=col;mctx.shadowBlur=20;mctx.beginPath();mctx.arc(pt.x,pt.y,7,0,Math.PI*2);mctx.fill();const g=getGesture(lm);setGesture(g);if(g==='write'){if(!drawing){drawing=true;snapshot();points=[pt];drawDot(pt.x,pt.y);}else if(lastPoint){drawSegment(lastPoint,pt);points.push(pt);updateStats();}lastPoint=pt;}else{drawing=false;lastPoint=null;}}
async function ensureHands(){if(hands)return true;try{hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.55,minTrackingConfidence:.55});hands.onResults(handleResults);return true;}catch(e){console.error(e);return false;}}
async function startCamera(){
 if(running)return;
 const btn=$('#cameraStartBtn');btn.disabled=true;btn.textContent='Opening camera…';setStatus('Requesting permission','REQUESTING CAMERA');showHint('Allow camera access','Safari will ask for permission. Choose Allow.',false);
 if(!window.isSecureContext && location.hostname!=='localhost' && location.hostname!=='127.0.0.1'){showHint('Secure page required','Run this project at http://localhost:8000 or on HTTPS.',true);btn.disabled=false;btn.textContent='Enable Camera ↗';setStatus('Camera unavailable','CAMERA NEEDS ACCESS');return;}
 if(!navigator.mediaDevices?.getUserMedia){showHint('Camera API unavailable','Use Safari/Chrome from localhost or HTTPS.',true);btn.disabled=false;btn.textContent='Enable Camera ↗';setStatus('Camera unavailable','CAMERA API ERROR');return;}
 try{
   stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
   video.srcObject=stream;video.muted=true;video.setAttribute('playsinline','');video.style.display='block';
   await video.play();
   running=true;setStatus('Camera live','CAMERA LIVE');showHint('Point your index finger','Extend your index finger inside the writing zone.',false);$('#cameraStartBtn').style.display='none';
   const ok=await ensureHands();
   if(ok){setStatus('Tracking ready','TRACKING READY');requestAnimationFrame(loop);}else{setStatus('Camera live • tracking unavailable','CAMERA LIVE');showHint('Camera is working','Hand-tracking library could not load. Check internet and refresh.',true);}
 }catch(e){console.error(e);running=false;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;const n=e?.name||'UnknownError';let sub='Safari blocked camera access. Open Safari → Settings for This Website → Camera → Allow, then press Try Camera Again.';if(n==='NotFoundError')sub='No camera was found. Check that your Mac camera is available.';if(n==='NotReadableError')sub='The camera is busy in another app. Close FaceTime/Zoom/other camera apps and try again.';if(n==='OverconstrainedError')sub='The selected camera settings were rejected. Try again.';showHint(n==='NotAllowedError'?'Camera permission denied':'Camera could not start',sub,true);btn.disabled=false;btn.textContent='Try Camera Again ↗';setStatus('Camera unavailable','CAMERA NEEDS ACCESS');}
}
async function loop(){if(!running||!hands)return;try{await hands.send({image:video});}catch(e){console.error(e);}requestAnimationFrame(loop);}
function stopCamera(){running=false;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;video.style.display='none';mctx.clearRect(0,0,marks.clientWidth,marks.clientHeight);setStatus('Camera idle','SYSTEM READY');showHint('Camera is off','Click Enable Camera to begin.',true);const b=$('#cameraStartBtn');b.disabled=false;b.textContent='Enable Camera ↗';}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
$('#startBtn').onclick=()=>{document.querySelector('#workspace').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(startCamera,350)};
$('#cameraStartBtn').onclick=startCamera;
$('#clearBtn').onclick=clearCanvas;
$('#undoBtn').onclick=()=>{if(history.length){redoStack.push(pctx.getImageData(0,0,paint.width,paint.height));pctx.putImageData(history.pop(),0,0)}};
$('#redoBtn').onclick=()=>{if(redoStack.length){history.push(pctx.getImageData(0,0,paint.width,paint.height));pctx.putImageData(redoStack.pop(),0,0)}};
$$('.style').forEach(b=>b.onclick=()=>{$$('.style').forEach(x=>x.classList.remove('active'));b.classList.add('active');style=b.dataset.style});
$('#mirrorBtn').onclick=()=>{mirror=!mirror;video.style.transform=mirror?'scaleX(-1)':'scaleX(1)'};
$('#fullscreenBtn').onclick=()=>$('#stage').requestFullscreen?.();
$('#copyBtn').onclick=async()=>{await navigator.clipboard?.writeText($('#recognizedText').textContent);$('#copyBtn').textContent='Copied';setTimeout(()=>$('#copyBtn').textContent='Copy',1200)};
$('#txtBtn').onclick=()=>download(new Blob([$('#recognizedText').textContent],{type:'text/plain'}),'airwrite.txt');
$('#pngBtn').onclick=()=>{const a=document.createElement('a');a.href=paint.toDataURL('image/png');a.download='airwrite-canvas.png';a.click()};
$('#speakBtn').onclick=()=>{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance($('#recognizedText').textContent))};
$('#howBtn').onclick=()=>$('#modal').classList.add('show');$('#modalClose').onclick=()=>$('#modal').classList.remove('show');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('show')};
function magic(){stopCamera();clearCanvas();$('#stageHint').style.display='none';let t=0,last=null;const cx=paint.clientWidth/2,cy=paint.clientHeight/2;function f(){if(t>Math.PI*10){setText('AIRWRITE');$('#confidence').textContent='98%';return}const x=cx+Math.sin(t*1.7)*Math.min(cx*.75,300)*(t/31)+Math.cos(t*3)*30,y=cy+Math.cos(t*1.25)*Math.min(cy*.6,190)*(t/31);if(last)drawSegment(last,{x,y});else drawDot(x,y);last={x,y};t+=.08;requestAnimationFrame(f)}f();$('#headerStatus').textContent='MAGIC DEMO';setTimeout(()=>$('#headerStatus').textContent='SYSTEM READY',5000)}
function setText(t){$('#recognizedText').textContent=t}
$('#demoBtn').onclick=magic;$('#magicBtn').onclick=magic;
$$('[data-scroll]').forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}));
$$('[data-demo]').forEach(b=>b.onclick=()=>{magic();setTimeout(()=>setText(b.dataset.demo==='math'?'x² + 2x + 1':b.dataset.demo==='practice'?'A  ·  92%':'△  →  ○  □'),400)});
$('#themeBtn').onclick=()=>document.body.classList.toggle('soft');
window.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z')$('#undoBtn').click();if(e.key==='Escape')$('#modal').classList.remove('show')});

// --- AIRWRITE OCR: local browser-side handwriting/character recognition ---
let ocrWorker=null, ocrBusy=false, ocrTimer=null, strokeCount=0;
async function initOCR(){
  if(ocrWorker || !window.Tesseract) return;
  try{
    ocrWorker=await Tesseract.createWorker('eng');
    await ocrWorker.setParameters({
      tessedit_pageseg_mode:Tesseract.PSM.SINGLE_BLOCK,
      preserve_interword_spaces:'1'
    });
  }catch(e){console.error('OCR init failed',e);ocrWorker=null;}
}
function makeOCRCanvas(){
  const w=Math.max(1000,paint.clientWidth*2),h=Math.max(600,paint.clientHeight*2);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  x.fillStyle='#ffffff';x.fillRect(0,0,w,h);x.drawImage(paint,0,0,w,h);
  // Convert the colored neon strokes to dark ink for OCR.
  const img=x.getImageData(0,0,w,h),d=img.data;
  for(let i=0;i<d.length;i+=4){
    const lum=(d[i]+d[i+1]+d[i+2])/3;
    if(d[i+3]>10 && lum<245){d[i]=18;d[i+1]=18;d[i+2]=18;d[i+3]=255;}
    else {d[i]=255;d[i+1]=255;d[i+2]=255;d[i+3]=255;}
  }
  x.putImageData(img,0,0);return c;
}
function cleanOCRText(raw){
  let s=(raw||'').replace(/\s+/g,' ').trim();
  s=s.replace(/\bx\b/g,'×').replace(/\*/g,'×');
  s=s.replace(/\bO(?=\d)/g,'0');
  return s;
}
async function recognizeWriting(showMessage=true){
  if(ocrBusy || !paint.width) return;
  ocrBusy=true;
  const box=$('#recognizedText');
  if(showMessage) box.textContent='Recognizing…';
  try{
    await initOCR();
    if(!ocrWorker){box.textContent='OCR library could not load. Check internet and try again.';return;}
    const result=await ocrWorker.recognize(makeOCRCanvas());
    const text=cleanOCRText(result?.data?.text);
    if(text){box.textContent=text;$('#confidence').textContent=Math.round(result.data.confidence||0)+'%';chars=text.replace(/\s/g,'').length;updateStats();}
    else if(showMessage) box.textContent='No clear text detected — write larger, slower letters.';
  }catch(e){console.error(e);if(showMessage)box.textContent='Recognition failed. Try writing larger and clearer.';}
  finally{ocrBusy=false;}
}
function scheduleOCR(){
  clearTimeout(ocrTimer);
  ocrTimer=setTimeout(()=>recognizeWriting(false),1100);
}
const oldHandleResults=handleResults;
handleResults=function(res){
  const before=points.length;
  oldHandleResults(res);
  if(points.length>before && points.length>6){strokeCount++;scheduleOCR();}
};

// After camera permission is granted, remove the instructional overlay completely.
const originalStartCamera=startCamera;
startCamera=async function(){
  await originalStartCamera();
  if(running){
    $('#stageHint').style.display='none';
    $('#cameraState').textContent='Camera live • write in air';
    $('#headerStatus').textContent='AIRWRITE LIVE';
  }
};

// Add a clear, explicit recognition control to the toolbar.
const recognizeButton=document.createElement('button');
recognizeButton.id='recognizeBtn';
recognizeButton.innerHTML='✦ Recognize';
recognizeButton.className='recognize-action';
recognizeButton.title='Recognize letters, words, names and common symbols';
recognizeButton.onclick=()=>recognizeWriting(true);
$('.toolbar').insertBefore(recognizeButton,$('.spacer'));

// Keyboard shortcut: R = recognize.
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&!e.metaKey&&!e.ctrlKey)recognizeWriting(true);});
