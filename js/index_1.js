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
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
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
                                if (isFrontCamera) {                    // 切換後的狀態
                videoElement.style.transform = 'scaleX(1)';
                videoElement.style.transformOrigin = 'center';
            } else {
                videoElement.style.transform = 'scaleX(-1)';   // 後置鏡頭恢復正常
            }
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
            if (/iPad|iPhone|iPod/.test(userAgent)) {
            DeviceOrientationEvent.requestPermission?.().then(response => {
                if (response === "granted") {
                    console.log("iOS orientation granted");
                }
            });
        }
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
        document.querySelectorAll('.capture-preview-container').forEach(el => el.remove());

        fetch(dataURL)
        .then(res => res.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);

            const container = document.createElement('div');
            container.className = 'capture-preview-container';

            const frame = document.createElement('div');
            frame.className = 'capture-frame';

            const img = document.createElement('img');
            img.src = blobUrl;
            img.alt = 'Captured MLS AR Image';
            img.className = 'capture-img';

            const message = document.createElement('div');
            message.innerText  = '請長按圖片儲存\nPlease long press to save the image';
            message.className = 'capture-message';

            const closeBtn = document.createElement('div');
            closeBtn.innerHTML = '&times;';
            closeBtn.className = 'capture-close-btn';

            frame.appendChild(img);
            container.appendChild(frame);
            container.appendChild(message);
            container.appendChild(closeBtn);
            document.body.appendChild(container);

            // Close handlers
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cleanup();
            });

            container.addEventListener('click', (e) => {
                if (e.target === container || e.target === message) {
                    cleanup();
                }
            });

            // Cleanup function to revoke blob URL
            function cleanup() {
                container.remove();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            }

            // Auto close
            setTimeout(() => {
                if (container.parentNode) cleanup();
            }, 30000);

        })
        .catch(err => {
            console.error("Blob conversion failed:", err);
            alert("無法顯示預覽，請重試");
        });
    };
});