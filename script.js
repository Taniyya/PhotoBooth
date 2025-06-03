const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const retakeBtn = document.getElementById('retake');
const download = document.getElementById('download');
const countdown = document.getElementById('countdown');
const modeSelector = document.getElementById('mode');
const filterSelect = document.getElementById('filter');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Camera access denied: " + err);
  });

filterSelect.addEventListener('change', () => {
  video.style.filter = filterSelect.value;
});

function showCountdown(callback) {
  let count = 3;
  countdown.innerText = count;
  countdown.style.display = 'block';

  const interval = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(interval);
      countdown.style.display = 'none';
      callback();
    } else {
      countdown.innerText = count;
    }
  }, 1000);
}

function drawPolaroid(x, y, source) {
  const border = 20;
  const bottom = 60;
  const width = 600;
  const height = 480;

  context.fillStyle = "white";
  context.fillRect(x, y, width + border * 2, height + border + bottom);

  context.save();
  context.translate(x + border + width, y + border);
  context.scale(-1, 1); 
  context.filter = filterSelect.value;
  context.drawImage(source, 0, 0, width, height);
  context.restore();

  context.filter = "none";
  context.fillStyle = "#333";
  context.font = "20px sans-serif";
  context.fillText("📸 Retro Booth", x + border + 10, y + border + height + 30);
}


startBtn.addEventListener('click', () => {
  const mode = modeSelector.value;

  if (mode === "single") {
    canvas.height = 600;
    showCountdown(() => {
      canvas.hidden = false;
      video.hidden = true;

      drawPolaroid(0, 0, video);

      const dataURL = canvas.toDataURL();
      download.href = dataURL;
      download.hidden = false;
      retakeBtn.hidden = false;
      startBtn.hidden = true;
      showPreview(dataURL);
    });
  }

  if (mode === "strip") {
    canvas.height = 3 * 600;
    canvas.hidden = false;
    video.hidden = true;

    let shot = 0;
    const takeStripPhoto = () => {
      showCountdown(() => {
        drawPolaroid(0, shot * 600, video);
        shot++;
        if (shot < 3) {
          setTimeout(takeStripPhoto, 500);
        } else {
          const dataURL = canvas.toDataURL();
          download.href = dataURL;
          download.hidden = false;
          retakeBtn.hidden = false;
          startBtn.hidden = true;
          showPreview(dataURL);
        }
      });
    };

    takeStripPhoto();
  }
});

retakeBtn.addEventListener('click', () => {
  canvas.hidden = true;
  video.hidden = false;
  download.hidden = true;
  retakeBtn.hidden = true;
  startBtn.hidden = false;
  const existingPreview = document.getElementById('preview-img');
  if (existingPreview) existingPreview.remove();
});

function showPreview(dataURL) {
  const existingPreview = document.getElementById('preview-img');
  if (existingPreview) existingPreview.remove();

  const img = document.createElement('img');
  img.id = 'preview-img';
  img.src = dataURL;
  document.querySelector('.container').appendChild(img);
}
