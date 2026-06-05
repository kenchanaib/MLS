const IMAGE_DATA = {
    TC: {
        0: ['images/TXT_Ferry_1.png', 'images/TXT_Ferry_2.png', 'images/TXT_Ferry_3.png'],
        1: ['images/TXT_EcoBio_1.png', 'images/TXT_EcoBio_2.png', 'images/TXT_EcoBio_3.png'],
        2: ['images/TXT_bricks_1.png', 'images/TXT_bricks_2.png', 'images/TXT_bricks_3.png'],
        3: ['images/TXT_3Tong_1.png', 'images/TXT_3Tong_2.png', 'images/TXT_3Tong_3.png'],
        4: ['images/text1.png', 'images/text2.png', 'images/text3.png']
    },
    SC: {
        0: ['images/SC/TXT_Ferry_1_SC.png', 'images/SC/TXT_Ferry_2_SC.png', 'images/SC/TXT_Ferry_3_SC.png'],
        1: ['images/SC/TXT_EcoBio_1_SC.png', 'images/SC/TXT_EcoBio_2_SC.png', 'images/SC/TXT_EcoBio_3_SC.png'],
        2: ['images/SC/TXT_bricks_1_SC.png', 'images/SC/TXT_bricks_2_SC.png', 'images/SC/TXT_bricks_3_SC.png'],
        3: ['images/SC/TXT_3Tong_1_SC.png', 'images/SC/TXT_3Tong_2_SC.png', 'images/SC/TXT_3Tong_3_SC.png'],
        4: ['images/SC/TXT_FLowers_1_SC.png', 'images/SC/TXT_FLowers_2_SC.png', 'images/SC/TXT_FLowers_3_SC.png']
    },
    EN: {
        0: ['images/EN/TXT_Ferry_1_EN.png', 'images/EN/TXT_Ferry_2_EN.png', 'images/EN/TXT_Ferry_3_EN.png'],
        1: ['images/EN/TXT_EcoBio_1_EN.png', 'images/EN/TXT_EcoBio_2_EN.png', 'images/EN/TXT_EcoBio_3_EN.png'],
        2: ['images/EN/TXT_bricks_1_EN.png', 'images/EN/TXT_bricks_2_EN.png', 'images/EN/TXT_bricks_3_EN.png'],
        3: ['images/EN/TXT_3Tong_1_EN.png', 'images/EN/TXT_3Tong_2_EN.png', 'images/EN/TXT_3Tong_3_EN.png'],
        4: ['images/EN/TXT_FLowers_1_EN.png', 'images/EN/TXT_FLowers_2_EN.png', 'images/EN/TXT_FLowers_3_EN.png']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let arSystem = null;
    let currentStream = null;
    let isFrontCamera = false;
    let isTrigger = false;
    let isPlaying = false;
    let isStartGame = false;
    let isMarkerFound = false;
    let wasArPausedByVisibility = false; 
    let lang = "TC";
    let downloadTxt = '請長按圖片下載';
    let images = ['images/text1.png', 'images/text2.png', 'images/text3.png'];
    let currentIndex = 0;
    let cycleCount = 0;

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const title = document.querySelector('#game-title');
    const marker = document.querySelector('#marker');
    const cameraEl = document.querySelector("#myCam");
    const captureBtn = document.getElementById('captureBtn');
    const startBtn = document.getElementById('myButton');
    const startBtnEN = document.getElementById('myButtonEN');
    const startBtnSC = document.getElementById('myButtonSC');
    const frameHints = document.getElementById('frameHints');
    const switchBtn = document.getElementById('switchCameraBtn');
    const sceneEl = document.querySelector('#arScene');
    const scene = document.querySelector('a-scene');
    const loader = document.getElementById('loader');
    const model = document.getElementById('model');
    const video = document.querySelector('#fullscreen-video');
    const slideElement = document.getElementById('textbox');
    const centerContainer = document.getElementById('center-container');
    const noticeContainer = document.getElementById('notice-container');

    const pageFilename = window.location.pathname.split('/').pop().split('.')[0];
    const arIndex = parseInt(pageFilename, 10) || 0;

    if (typeof AFRAME !== 'undefined') {
        const isMobileOrTablet = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isTablet();
        if (!isMobileOrTablet && noticeContainer) {
            noticeContainer.style.display = 'block';
        }
    }

    sceneEl?.addEventListener('loaded', () => {
        arSystem = sceneEl.systems['mindar-image-system'];
        console.log('MindAR Image System loaded');
    });

    sceneEl?.addEventListener("arReady", () => {
        console.log("MindAR ready - Starting with Back Camera");
        if (loader) loader.style.display = "none";
    });

    // --- Camera Handler Functions ---
    async function toggleCamera() {
        if (!arSystem || !model) {
            alert("AR system not ready yet.");
            return;
        }

        try {
            switchBtn.style.opacity = '0.5';
            arSystem.pause(true);

            // Clean up old active stream tracks
            if (currentStream) currentStream.getTracks().forEach(track => track.stop());
            document.querySelectorAll('video').forEach(v => {
                if (v.srcObject) {
                    v.srcObject.getTracks().forEach(track => track.stop());
                    v.srcObject = null;
                }
            });

            const facingMode = isFrontCamera ? 'environment' : 'user';
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            currentStream = newStream;
            const videoElement = document.querySelector('video:not(#fullscreen-video)');

            if (videoElement) {
                videoElement.srcObject = newStream;
                await videoElement.play();
                videoElement.style.transform = isFrontCamera ? 'scaleX(1)' : 'scaleX(-1)';
                if (isFrontCamera) videoElement.style.transformOrigin = 'center';
            }

            isFrontCamera = !isFrontCamera;

            setTimeout(() => {
                model.setAttribute('visible', true);
                if (cameraEl) cameraEl.setAttribute("look-controls", "enabled: true");
                if (captureBtn) captureBtn.style.display = "block";
                if (title) title.style.opacity = '0';
                try { arSystem.unpause(); } catch (e) { console.warn(e); }
            }, 900);

        } catch (err) {
            console.error("Camera toggle failed:", err);
            alert(`Failed to switch to ${isFrontCamera ? 'Back' : 'Front'} camera.`);
            setTimeout(() => window.location.reload(), 1000);
        } finally {
            if (switchBtn) switchBtn.style.opacity = '1';
        }
    }

    if (switchBtn) switchBtn.addEventListener('click', toggleCamera);

    function handleVisibilityChange() {
        if (document.hidden) {
            console.log("User left page. Disabling webcam streams...");
            if (arSystem) {
                try {
                    arSystem.pause(true);
                    wasArPausedByVisibility = true;
                } catch (e) { console.warn(e); }
            }
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }
            document.querySelectorAll('video').forEach(v => {
                if (v.srcObject && v.id !== 'fullscreen-video') {
                    v.srcObject.getTracks().forEach(track => track.stop());
                    v.srcObject = null;
                }
            });
        } else {
            console.log("User returned to page. Resuming webcam features...");
            if (wasArPausedByVisibility) {
                wasArPausedByVisibility = false;
                if (isStartGame || !arSystem) {
                    window.location.reload();
                } else {
                    try { arSystem.unpause(); } catch (e) { window.location.reload(); }
                }
            }
        }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function handleLanguageSelection(selectedLang, titlePath, fallbackText) {
        lang = selectedLang;
        if (title) title.src = titlePath;
        downloadTxt = fallbackText;

        if (centerContainer) centerContainer.style.display = "none";
        isStartGame = true;

        if (video) {
            video.play().catch(e => console.warn("Video playback initialized post-user gesture:", e));
            video.loop = true;
        }

        setTimeout(() => { if (title) title.style.opacity = '1'; }, 150);

        if (/iPad|iPhone|iPod/.test(userAgent) && arIndex === 4) {
            DeviceOrientationEvent.requestPermission?.().then(response => {
                if (response === "granted") console.log("iOS orientation granted");
            });
        }

        images = IMAGE_DATA[lang]?.[arIndex] || IMAGE_DATA.TC[4];

        triggerArSequence();
    }

    startBtn?.addEventListener('click', () => handleLanguageSelection("TC", 'images/title.png', '請長按圖片下載'));
    startBtnSC?.addEventListener('click', () => handleLanguageSelection("SC", 'images/SC/title.png', '请长按图片下载'));
    startBtnEN?.addEventListener('click', () => handleLanguageSelection("EN", 'images/EN/title.png', 'Long press to download image'));

    function triggerArSequence() {
        if (!isMarkerFound || !isStartGame || isTrigger || isPlaying) return;

        if (title) title.style.opacity = '0';
        if (frameHints) frameHints.style.opacity = '0';
        if (slideElement) {
            slideElement.style.opacity = '1';
            slideElement.src = images[0];
        }

        if (video) {
            video.loop = false;
            video.currentTime = 0;
            setTimeout(() => { video.style.display = 'block'; }, 100);
        }

        const timer = setInterval(() => {
            currentIndex++;
            if (currentIndex >= images.length) {
                currentIndex = 0;
                cycleCount++;
            }

            if (cycleCount === 1) {
                clearInterval(timer);
                if (slideElement) slideElement.style.opacity = '0';
                if (switchBtn) switchBtn.style.display = 'flex';
                if (captureBtn) captureBtn.style.display = "block";
                return;
            }

            if (slideElement) slideElement.src = images[currentIndex];
        }, 3333);

        isTrigger = true;
        isPlaying = true;
        if (model) model.setAttribute('visible', true);
        if (arSystem) arSystem.pause(true);

        setTimeout(() => {
            if (cameraEl) cameraEl.setAttribute("look-controls", "enabled: true");
        }, 100);
    }

    video?.addEventListener('ended', () => {
        if (arIndex === 4) video.style.display = 'none';
    });

    if (marker) {
        marker.addEventListener("targetFound", () => {
            isMarkerFound = true;
            triggerArSequence();
        });
        marker.addEventListener("targetLost", () => {
            isMarkerFound = false;
        });
    }

    captureBtn?.addEventListener('click', () => {
        const captureCanvas = document.getElementById('captureCanvas');
        if (!captureCanvas) return;

        const ctx = captureCanvas.getContext('2d', { alpha: false });

        setTimeout(() => {
            const webcamVideo = Array.from(document.querySelectorAll('video')).find(v => 
                v.srcObject instanceof MediaStream && v.videoWidth > 100 && v.id !== 'fullscreen-video'
            );

            if (!webcamVideo) {
                alert("Cannot access camera feed. Please try again.");
                return;
            }

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
                const baseWidth = scene?.clientWidth || window.innerWidth;
                const baseHeight = scene?.clientHeight || window.innerHeight;
                const dpr = window.devicePixelRatio || 2;
                const scaleFactor = 1.5;

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

                // 1. Render Cam Feed Background Frame Mirror Mapping
                if (webcamVideo?.videoWidth > 100) {
                    const vidAspect = webcamVideo.videoWidth / webcamVideo.videoHeight;
                    const outAspect = outputWidth / outputHeight;

                    let drawW = outputWidth;
                    let drawH = outputHeight;
                    let offsetX = 0;
                    let offsetY = 0;

                    if (vidAspect > outAspect) {
                        drawW = outputHeight * vidAspect;
                        offsetX = (outputWidth - drawW) / 2;
                    } else {
                        drawH = outputWidth / vidAspect;
                        offsetY = (outputHeight - drawH) / 2;
                    }

                    ctx.save();
                    if (isFrontCamera) {
                        ctx.translate(outputWidth, 0);
                        ctx.scale(-1, 1);
                        ctx.drawImage(webcamVideo, (outputWidth - drawW) - offsetX, offsetY, drawW, drawH);
                    } else {
                        ctx.drawImage(webcamVideo, offsetX, offsetY, drawW, drawH);
                    }
                    ctx.restore();
                }

                // 2. Map & Composite A-Frame Perspective Screen Overlay Content
                try {
                    const glCanvas = scene?.components.screenshot?.getCanvas('perspective');
                    if (glCanvas && glCanvas.width > 50) {
                        ctx.drawImage(glCanvas, 0, 0, outputWidth, outputHeight);
                    }
                } catch (e) { console.warn("AR screenshot compilation error fallback applied:", e); }

                // 3. Render and Apply Fullscreen Interstitial Covers
                if (video && video.style.display !== 'none') {
                    try {
                        const vWidth = video.videoWidth || 884;
                        const vHeight = video.videoHeight || 1920;
                        const videoAspect = vWidth / vHeight;
                        const canvasAspect = outputWidth / outputHeight;

                        let drawW, drawH, xOffset, yOffset;
                        if (videoAspect > canvasAspect) {
                            drawH = outputHeight;
                            drawW = outputHeight * videoAspect;
                            xOffset = (outputWidth - drawW) / 2;
                            yOffset = 0;
                        } else {
                            drawW = outputWidth;
                            drawH = outputWidth / videoAspect;
                            xOffset = 0;
                            yOffset = (outputHeight - drawH) / 2;
                        }
                        ctx.drawImage(video, xOffset, yOffset, drawW, drawH);
                    } catch (err) { console.warn("Fullscreen layer composite fallback:", err); }
                }

                // 4. Draw Branding Layer Watermark Asset Overlay
                const logo = new Image();
                logo.src = 'images/icon.png';

                const compileFinalPreview = () => {
                    const dataURL = captureCanvas.toDataURL('image/png', 0.85);
                    showCapturePreview(dataURL);
                };

                logo.onload = () => {
                    const padding = 40;
                    const maxLogoWidth = outputWidth * 0.5;
                    const logoAspect = logo.width / logo.height;

                    let logoHeight = Math.min(120, outputHeight * 0.08);
                    let logoWidth = logoHeight * logoAspect;

                    if (logoWidth > maxLogoWidth) {
                        logoWidth = maxLogoWidth;
                        logoHeight = logoWidth / logoAspect;
                    }

                    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                    ctx.shadowBlur = 15;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;

                    ctx.drawImage(logo, padding, padding, logoWidth, logoHeight);
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;

                    compileFinalPreview();
                };

                logo.onerror = () => {
                    console.warn("Watermark asset failed to map. Generating snapshot fallback.");
                    compileFinalPreview();
                };

            }, 250);
        }, 100);
    });

    // --- Image Preview Framework Utilities ---
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new Blob([u8arr], { type: mime });
    }

    window.showCapturePreview = function (dataURL) {
        document.querySelectorAll('.capture-preview-container').forEach(el => el.remove());

        try {
            const blob = dataURLtoBlob(dataURL);
            const blobUrl = URL.createObjectURL(blob);

            const container = document.createElement('div');
            container.className = 'capture-preview-container';

            const frame = document.createElement('div');
            frame.className = 'capture-frame';

            const img = document.createElement('img');
            img.src = blobUrl;
            img.alt = 'Captured MLS AR';
            img.className = 'capture-img';

            const message = document.createElement('div');
            message.innerText = downloadTxt;
            message.className = 'capture-message';

            const closeBtn = document.createElement('div');
            closeBtn.innerHTML = '&times;';
            closeBtn.className = 'capture-close-btn';

            frame.appendChild(img);
            container.appendChild(frame);
            container.appendChild(message);
            container.appendChild(closeBtn);
            document.body.appendChild(container);

            const cleanup = () => {
                container.remove();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            };

            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cleanup();
            });

            container.addEventListener('click', (e) => {
                if (e.target === container || e.target === message) cleanup();
            });

            setTimeout(() => { if (container.parentNode) cleanup(); }, 30000);

        } catch (err) {
            console.error("Blob capture window load exception:", err);
            alert("無法顯示預覽，請重試");
        }
    };
});