// ================================================
// Fixed & Final index.js
// - Fixed "scene is not defined" error
// - Improved capture after camera switch
// - Switch button uses switch.png
// ================================================

let arSystem = null;
let currentStream = null;
let isFrontCamera = false;   // false = Back Camera

document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('#game-title');
    const marker = document.querySelector('#marker');
    const cameraEl = document.querySelector("#myCam");
    const captureBtn = document.getElementById('captureBtn');
    const startBtn = document.getElementById('myButton');
    const switchBtn = document.getElementById('switchCameraBtn');
    const sceneEl = document.querySelector('#arScene');     // Main scene
    const scene = document.querySelector('a-scene');        // ← Fixed: This was missing
    const loader = document.getElementById('loader');
    const model = document.getElementById('model');

    let isTrigger = false;
    let isPlaying = false;
    let isStartGame = false;

    sceneEl.addEventListener('loaded', () => {
        arSystem = sceneEl.systems['mindar-image-system'];
        console.log('MindAR Image System loaded');
    });

    sceneEl.addEventListener("arReady", () => {
        console.log("MindAR ready - Starting with Back Camera");
        if (loader) loader.style.display = "none";
        // if (switchBtn) switchBtn.style.display = 'none';
    });

    // ==================== TOGGLE CAMERA (Back ↔ Front) ====================
    async function toggleCamera() {
        if (!arSystem || !model) {
            alert("AR system not ready yet.");
            return;
        }

        try {
            switchBtn.style.opacity = '0.5';

            const targetCamera = isFrontCamera ? 'BACK' : 'FRONT';
            console.log(`Toggling to ${targetCamera} camera...`);

            arSystem.pause(true);

            if (currentStream) currentStream.getTracks().forEach(track => track.stop());
            document.querySelectorAll('video').forEach(video => {
                if (video.srcObject) {
                    video.srcObject.getTracks().forEach(track => track.stop());
                    video.srcObject = null;
                }
            });

            const facingMode = isFrontCamera ? 'environment' : 'user';
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            currentStream = newStream;

            let videoElement = null;
            document.querySelectorAll('video').forEach(v => videoElement = v);

            if (videoElement) {
                videoElement.srcObject = newStream;
                await videoElement.play();
            }

            isFrontCamera = !isFrontCamera;

            console.log(`Switched to ${isFrontCamera ? 'FRONT' : 'BACK'} camera`);

            setTimeout(() => {
                model.setAttribute('visible', true);
                if (cameraEl) cameraEl.setAttribute("look-controls", "enabled: true");
                if (captureBtn) captureBtn.style.display = "block";
                if (title) title.style.opacity = '0';

                if (arSystem) {
                    try { arSystem.unpause(); } catch(e) {}
                }
            }, 900);

        } catch (err) {
            console.error("Camera toggle failed:", err);
            alert(`Failed to switch to ${isFrontCamera ? 'Back' : 'Front'} camera.`);
            setTimeout(() => window.location.reload(), 1000);
        } finally {
            switchBtn.style.opacity = '1';
        }
    }

    if (switchBtn) {
        switchBtn.addEventListener('click', toggleCamera);
    }

    // Start Button
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const centerContainer = document.getElementById('center-container');
            if (centerContainer) centerContainer.style.display = "none";
            isStartGame = true;
            if (title) title.style.opacity = '1';
        });
    }

    // Marker Found
    if (marker) {
        marker.addEventListener("targetFound", () => {
            if (!isTrigger && !isPlaying && isStartGame) {
                console.log("✅ Marker found");

                if (title) title.style.opacity = '0';

                isTrigger = true;
                isPlaying = true;
                model.setAttribute('visible', true);

                const arSys = sceneEl?.systems["mindar-image-system"];
                if (arSys) arSys.pause(true);

                if (switchBtn) switchBtn.style.display = 'flex';

                setTimeout(() => {
                    if (cameraEl) cameraEl.setAttribute("look-controls", "enabled: true");
                    if (captureBtn) captureBtn.style.display = "block";
                }, 100);
            }
        });
    }

    // ===================== FIXED CAPTURE LOGIC =====================
    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const captureCanvas = document.getElementById('captureCanvas');
            if (!captureCanvas) return;

            const ctx = captureCanvas.getContext('2d', { alpha: false });

            setTimeout(() => {   // Small delay for stability
                let webcamVideo = null;
                document.querySelectorAll('video').forEach(v => {
                    if (v.srcObject instanceof MediaStream && v.videoWidth > 100) {
                        webcamVideo = v;
                    }
                });

                if (!webcamVideo) {
                    alert("Cannot access camera feed. Please try again.");
                    return;
                }

                // White flash effect
                const whiteFlash = document.querySelector('#whiteScreen');
                if (whiteFlash) {
                    whiteFlash.style.opacity = 0.9;
                    whiteFlash.style.display = 'block';
                    setTimeout(() => {
                        whiteFlash.style.opacity = 0;
                        setTimeout(() => whiteFlash.style.display = 'none', 400);
                    }, 80);
                }

                setTimeout(() => {
                    let baseWidth = scene.clientWidth || window.innerWidth;   // ← Now 'scene' is defined
                    let baseHeight = scene.clientHeight || window.innerHeight;

                    const dpr = window.devicePixelRatio || 2;
                    let scaleFactor = 1.5;

                    let outputWidth = Math.floor(baseWidth * dpr * scaleFactor);
                    let outputHeight = Math.floor(baseHeight * dpr * scaleFactor);

                    const MAX_DIM = 1600;
                    if (outputWidth > MAX_DIM || outputHeight > MAX_DIM) {
                        const ratio = MAX_DIM / Math.max(outputWidth, outputHeight);
                        outputWidth = Math.floor(outputWidth * ratio);
                        outputHeight = Math.floor(outputHeight * ratio);
                    }

                    captureCanvas.width = outputWidth;
                    captureCanvas.height = outputHeight;

                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, outputWidth, outputHeight);

                    // Draw camera video
                    if (webcamVideo && webcamVideo.videoWidth > 100) {
                        const vidAspect = webcamVideo.videoWidth / webcamVideo.videoHeight;
                        const outAspect = outputWidth / outputHeight;

                        let drawW = outputWidth, drawH = outputHeight, offsetX = 0, offsetY = 0;

                        if (vidAspect > outAspect) {
                            drawW = outputHeight * vidAspect;
                            offsetX = (outputWidth - drawW) / 2;
                        } else {
                            drawH = outputWidth / vidAspect;
                            offsetY = (outputHeight - drawH) / 2;
                        }
                        ctx.drawImage(webcamVideo, offsetX, offsetY, drawW, drawH);
                    }

                    // Draw AR content
                    try {
                        const glCanvas = scene.components.screenshot?.getCanvas('perspective');
                        if (glCanvas && glCanvas.width > 50) {
                            ctx.drawImage(glCanvas, 0, 0, outputWidth, outputHeight);
                        }
                    } catch (e) {
                        console.warn("AR screenshot failed:", e);
                    }

                    const dataURL = captureCanvas.toDataURL('image/png', 0.82);
                    showCapturePreview(dataURL);

                }, 250);

            }, 100);
        });
    }

    // Capture Preview
window.showCapturePreview = function(dataURL) {
    // Remove any existing previews
    document.querySelectorAll('.capture-preview-container').forEach(el => el.remove());

    const container = document.createElement('div');
    container.className = 'capture-preview-container';
    container.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; align-items: center;
        justify-content: center; z-index: 9999; touch-action: none;
    `;

    const frame = document.createElement('div');
    frame.className = 'capture-frame';
    frame.style.cssText = `
        position: relative; max-width: 95%; max-height: 90%;
        box-shadow: 0 0 30px rgba(0,0,0,0.5); border-radius: 12px;
        overflow: hidden; background: #000;
    `;

    const img = document.createElement('img');
    img.src = dataURL;
    img.alt = 'Captured HSK AR Image';
    img.className = 'capture-img';
    img.style.cssText = `
        display: block; width: 100%; height: auto;
        max-height: 85vh; object-fit: contain;
        -webkit-touch-callout: default;   /* Important for mobile */
        -webkit-user-select: auto;
        user-select: auto;
        pointer-events: auto;
    `;

    // Make image directly savable
    img.setAttribute('draggable', 'true');

    const message = document.createElement('div');
    message.textContent = '請長按相片以作儲存 (Long press to save)';
    message.className = 'capture-message';
    message.style.cssText = `
        position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%);
        color: #fff; background: rgba(0,0,0,0.7); padding: 8px 16px;
        border-radius: 20px; font-size: 15px; white-space: nowrap;
        z-index: 10;
    `;

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'capture-close-btn';
    closeBtn.style.cssText = `
        position: absolute; top: -15px; right: -15px; width: 36px; height: 36px;
        background: #fff; color: #000; border-radius: 50%; display: flex;
        align-items: center; justify-content: center; font-size: 24px;
        font-weight: bold; z-index: 11; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;

    frame.appendChild(img);
    container.appendChild(frame);
    container.appendChild(message);
    container.appendChild(closeBtn);
    document.body.appendChild(container);

    // Close handlers
    closeBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        container.remove();
    });

    // Only close if tapping background (outside frame)
    container.addEventListener('click', (e) => {
        if (e.target === container) container.remove();
    });

    // Critical: Allow context menu on the image
    img.addEventListener('contextmenu', (e) => {
        // Do NOT call e.preventDefault() here
        console.log('Context menu (long press) triggered on image');
    }, { passive: true });

    // Auto-remove after some time
    setTimeout(() => {
        if (container.parentNode) container.remove();
    }, 30000);
};
});