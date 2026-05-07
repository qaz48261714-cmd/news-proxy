const { createCanvas } = require('canvas');
const fs = require('fs');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 512;

  // 背景
  ctx.fillStyle = '#090e14';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 80 * s);
  ctx.fill();

  // 外框
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3 * s;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.roundRect(18*s, 18*s, 476*s, 476*s, 68*s);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 角落裝飾
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3 * s;
  ctx.globalAlpha = 0.8;
  [[50,50,80,50,50,80],[462,50,432,50,462,80],[50,462,80,462,50,432],[462,462,432,462,462,432]].forEach(([x1,y1,x2,y2,x3,y3])=>{
    ctx.beginPath();ctx.moveTo(x1*s,y1*s);ctx.lineTo(x2*s,y2*s);ctx.moveTo(x1*s,y1*s);ctx.lineTo(x3*s,y3*s);ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // 折線圖
  const pts = [[70,390],[120,345],[175,362],[230,275],[285,295],[340,210],[395,232],[445,168]];
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 4 * s;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 12 * s;
  ctx.beginPath();
  pts.forEach(([x,y],i) => i===0 ? ctx.moveTo(x*s,y*s) : ctx.lineTo(x*s,y*s));
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 主文字 ₣
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 20 * s;
  ctx.font = `bold ${120*s}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('₣', size/2, 310*s);
  ctx.shadowBlur = 0;

  // TERMINAL
  ctx.font = `bold ${26*s}px monospace`;
  ctx.letterSpacing = `${6*s}px`;
  ctx.fillText('TERMINAL', size/2, 410*s);

  // 財經終端機
  ctx.globalAlpha = 0.5;
  ctx.font = `${16*s}px monospace`;
  ctx.fillText('財經終端機', size/2, 445*s);
  ctx.globalAlpha = 1;

  return canvas.toBuffer('image/png');
}

fs.writeFileSync('public/icon-192.png', drawIcon(192));
fs.writeFileSync('public/icon-512.png', drawIcon(512));
console.log('✅ icon-192.png 和 icon-512.png 已生成！');