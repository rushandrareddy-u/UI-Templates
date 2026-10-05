const $ = (s) => document.querySelector(s);
const mirrorCard = $('#mirrorCard');
const viewer = $('#viewer');
const sourceImage = $('#sourceImage');
const canvas = $('#overlayCanvas');
const ctx = canvas.getContext('2d');
const fileInput = $('#fileInput');
const chooseBtn = $('#chooseBtn');
const dropZone = $('#dropZone');
const modelStatus = $('#modelStatus');
const statusPill = document.querySelector('.status-pill');
const downloadBtn = $('#downloadBtn');
const resetBtn = $('#resetBtn');
const scanline = $('#scanline');

let model = null;
let predictions = [];
let currentFile = null;
let imageObjectUrl = null;

async function initModel() {
  try {
    modelStatus.textContent = 'Loading vision model';
    model = await cocoSsd.load({base: 'lite_mobilenet_v2'});
    modelStatus.textContent = 'Vision model ready';
    statusPill.classList.add('ready');
  } catch (err) {
    console.error(err);
    modelStatus.textContent = 'Model failed to load';
  }
}
initModel();

chooseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

['dragenter','dragover'].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault(); dropZone.classList.add('over');
}));
['dragleave','drop'].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault(); dropZone.classList.remove('over');
}));
dropZone.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

async function handleFile(file) {
  if (!file.type.startsWith('image/')) return;
  if (file.size > 15 * 1024 * 1024) return alert('Please use an image under 15 MB.');
  currentFile = file;
  if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
  imageObjectUrl = URL.createObjectURL(file);
  sourceImage.onload = async () => {
    mirrorCard.classList.add('has-image','scanning');
    $('#imageMeta').textContent = `${sourceImage.naturalWidth} × ${sourceImage.naturalHeight}px`;
    downloadBtn.disabled = true;
    predictions = [];
    clearUI();
    resizeCanvas();
    if (!model) {
      modelStatus.textContent = 'Waiting for vision model';
      await waitForModel();
    }
    await runInference();
  };
  sourceImage.src = imageObjectUrl;
}

function waitForModel() {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (model) { clearInterval(timer); resolve(); }
    }, 150);
    setTimeout(() => { clearInterval(timer); resolve(); }, 20000);
  });
}

async function runInference() {
  if (!model) return;
  const t0 = performance.now();
  try {
    predictions = await model.detect(sourceImage, 20, 0.35);
    $('#inferenceTime').textContent = `${Math.round(performance.now() - t0)} ms`;
    predictions.sort((a,b) => b.score - a.score);
    updateUI();
    resizeCanvas();
    drawPredictions();
    downloadBtn.disabled = false;
  } catch (err) {
    console.error(err);
    $('#predictionName').textContent = 'Inference error';
  } finally {
    setTimeout(() => mirrorCard.classList.remove('scanning'), 700);
  }
}

function clearUI() {
  $('#predictionName').textContent = 'Analyzing…';
  $('#predictionScore').textContent = '—';
  $('#confidenceText').textContent = '—';
  $('#confidenceBar').style.width = '0%';
  ['attention','similarity','region'].forEach(x => {
    $(`#${x}Value`).textContent = '—';
    $(`#${x}Bar`).style.width = '0%';
  });
  $('#regionCount').textContent = '0';
  $('#regionList').innerHTML = '<div class="empty-list">Scanning visual regions…</div>';
}

function updateUI() {
  const p = predictions[0];
  if (!p) {
    $('#predictionName').textContent = 'No object detected';
    $('#predictionScore').textContent = '—';
    $('#confidenceText').textContent = 'Below threshold';
    $('#regionCount').textContent = '0';
    $('#regionList').innerHTML = '<div class="empty-list">Try a clearer image or a different subject.</div>';
    return;
  }
  const conf = Math.round(p.score * 100);
  $('#predictionName').textContent = titleCase(p.class);
  $('#predictionScore').textContent = `${conf}%`;
  $('#confidenceText').textContent = `${conf}%`;
  $('#confidenceBar').style.width = `${conf}%`;

  const avg = predictions.reduce((s,x) => s + x.score, 0) / predictions.length;
  const attention = Math.min(99, Math.round((p.score * .65 + Math.min(1, predictions.length / 8) * .35) * 100));
  const similarity = Math.min(99, Math.round((avg * .75 + p.score * .25) * 100));
  const regionFocus = Math.min(99, Math.round(Math.min(1, (p.bbox[2]*p.bbox[3])/(sourceImage.naturalWidth*sourceImage.naturalHeight)*6) * 100));
  setMetric('attention', attention);
  setMetric('similarity', similarity);
  setMetric('region', regionFocus);

  $('#regionCount').textContent = predictions.length;
  $('#regionList').innerHTML = predictions.slice(0,8).map((x,i) => {
    const s = Math.round(x.score*100);
    const [bx,by,bw,bh] = x.bbox.map(Math.round);
    return `<div class="region-row"><strong>${titleCase(x.class)}</strong><span>${s}%</span><small>region ${i+1} · ${bw}×${bh}px @ ${bx},${by}</small></div>`;
  }).join('');
}

function setMetric(name, value) {
  $(`#${name}Value`).textContent = `${value}%`;
  $(`#${name}Bar`).style.width = `${value}%`;
}

function titleCase(s) { return s.replace(/\b\w/g, c => c.toUpperCase()); }

function resizeCanvas() {
  const r = viewer.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(r.width*dpr);
  canvas.height = Math.round(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawPredictions();
}

function getImagePlacement() {
  const vr = viewer.getBoundingClientRect();
  const iw = sourceImage.naturalWidth, ih = sourceImage.naturalHeight;
  if (!iw || !ih) return null;
  const maxW = vr.width * .92, maxH = vr.height * .88;
  const scale = Math.min(maxW/iw, maxH/ih);
  const w = iw*scale, h = ih*scale;
  return {x:(vr.width-w)/2, y:(vr.height-h)/2, w,h,scale};
}

function drawPredictions() {
  const vr = viewer.getBoundingClientRect();
  ctx.clearRect(0,0,vr.width,vr.height);
  const place = getImagePlacement();
  if (!place) return;
  predictions.forEach((p,i) => {
    const [x,y,w,h] = p.bbox;
    const sx = place.x+x*place.scale, sy=place.y+y*place.scale;
    const sw=w*place.scale, sh=h*place.scale;
    const alpha = Math.max(.28, p.score);
    ctx.save();
    ctx.strokeStyle = i===0 ? `rgba(101,230,255,${alpha})` : `rgba(168,132,255,${alpha*.85})`;
    ctx.lineWidth = i===0 ? 2 : 1.2;
    ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 13;
    ctx.strokeRect(sx,sy,sw,sh);
    ctx.shadowBlur=0;
    const label = `${titleCase(p.class)}  ${Math.round(p.score*100)}%`;
    ctx.font='10px "DM Mono"';
    const tw=ctx.measureText(label).width+14;
    ctx.fillStyle='rgba(5,10,17,.82)';
    ctx.fillRect(sx,Math.max(0,sy-22),tw,20);
    ctx.fillStyle=i===0?'#baf4ff':'#d5c8ff';
    ctx.fillText(label,sx+7,Math.max(13,sy-8));
    ctx.restore();
  });
  const top = predictions[0];
  if (top) {
    const [x,y,w,h]=top.bbox;
    const cx=place.x+(x+w/2)*place.scale, cy=place.y+(y+h/2)*place.scale;
    const ring=$('#focusRing');
    ring.style.left=`${cx}px`; ring.style.top=`${cy}px`;
    ring.style.width=`${Math.max(74,Math.min(150,w*place.scale*.48))}px`;
    ring.style.height=ring.style.width;
  }
}

window.addEventListener('resize', resizeCanvas);

viewer.addEventListener('mousemove', e => {
  const r = mirrorCard.getBoundingClientRect();
  const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
  mirrorCard.style.transform=`rotateY(${x*3.5}deg) rotateX(${-y*3.5}deg)`;
});
viewer.addEventListener('mouseleave', () => mirrorCard.style.transform='');

downloadBtn.addEventListener('click', () => {
  if (!sourceImage.naturalWidth) return;
  const out=document.createElement('canvas');
  out.width=sourceImage.naturalWidth; out.height=sourceImage.naturalHeight;
  const c=out.getContext('2d');
  c.drawImage(sourceImage,0,0);
  predictions.forEach((p,i)=>{
    const [x,y,w,h]=p.bbox;
    c.save();
    c.strokeStyle=i===0?'#65e6ff':'#a884ff'; c.lineWidth=Math.max(3,sourceImage.naturalWidth/600);
    c.shadowColor=c.strokeStyle; c.shadowBlur=16; c.strokeRect(x,y,w,h); c.shadowBlur=0;
    const label=`${titleCase(p.class)}  ${Math.round(p.score*100)}%`;
    c.font=`${Math.max(18,sourceImage.naturalWidth/55)}px monospace`;
    const pad=10, tw=c.measureText(label).width+pad*2, th=Math.max(32,sourceImage.naturalWidth/30);
    c.fillStyle='rgba(4,8,14,.88)'; c.fillRect(x,Math.max(0,y-th),tw,th);
    c.fillStyle=i===0?'#baf4ff':'#d5c8ff'; c.fillText(label,x+pad,Math.max(th-9,y-10));
    c.restore();
  });
  const a=document.createElement('a');
  a.download='ai-mirror-annotated.png'; a.href=out.toDataURL('image/png'); a.click();
});

resetBtn.addEventListener('click', () => {
  if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
  imageObjectUrl=null; currentFile=null; predictions=[];
  sourceImage.removeAttribute('src');
  mirrorCard.classList.remove('has-image','scanning');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  $('#imageMeta').textContent='No image loaded';
  $('#inferenceTime').textContent='— ms';
  clearUI();
  $('#predictionName').textContent='Waiting for an image';
  $('#regionList').innerHTML='<div class="empty-list">No detections yet.</div>';
  downloadBtn.disabled=true;
  fileInput.value='';
});
