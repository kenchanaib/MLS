let arSystem = null;
let currentStream = null;
let isFrontCamera = false;

document.addEventListener('DOMContentLoaded', () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const title = document.querySelector('#game-title');
    const marker = document.querySelector('#marker');
    const cameraEl = document.querySelector("#myCam");
    const captureBtn = document.getElementById('captureBtn');
    const startBtn = document.getElementById('myButton');
    const frameHints = document.getElementById('frameHints');
    const switchBtn = document.getElementById('switchCameraBtn');
    const sceneEl = document.querySelector('#arScene');
    const scene = document.querySelector('a-scene');
    const loader = document.getElementById('loader');
    const model = document.getElementById('model');
    const video = document.querySelector('#fullscreen-video');

    let isTrigger = false;
    let isPlaying = false;
    let isStartGame = false;
    let wasArPausedByVisibility = false; // Flag to track if we turned it off due to tab-switching

    sceneEl.addEventListener('loaded', () => {
        arSystem = sceneEl.systems['mindar-image-system'];
        console.log('MindAR Image System loaded');
    });

    sceneEl.addEventListener("arReady", () => {
        console.log("MindAR ready - Starting with Back Camera");
        if (loader) loader.style.display = "none";
    });

    window.addEventListener('DOMContentLoaded', () => {
        if (typeof AFRAME !== 'undefined') {
            const isMobileOrTablet = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isTablet();

            if (!isMobileOrTablet) {
                document.getElementById('notice-container').style.display = 'block';
            }
        }
    });

    let arIndex = window.location.pathname.split('/').pop().split('.')[0];

    async function toggleCamera() {
        if (!arSystem || !model) {
            alert("AR system not ready yet.");
            return;
        }

        try {
            switchBtn.style.opacity = '0.5';

            const targetCamera = isFrontCamera ? 'BACK' : 'FRONT';

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
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
                }
            });

            currentStream = newStream;

            let videoElement = null;
            document.querySelectorAll('video').forEach(v => videoElement = v);

            if (videoElement) {
                videoElement.srcObject = newStream;
                await videoElement.play();

                if (isFrontCamera) {
                    videoElement.style.transform = 'scaleX(1)';
                    videoElement.style.transformOrigin = 'center';
                } else {
                    videoElement.style.transform = 'scaleX(-1)';
                }
            }

            isFrontCamera = !isFrontCamera;

            setTimeout(() => {
                model.setAttribute('visible', true);
                if (cameraEl) cameraEl.setAttribute("look-controls", "enabled: true");
                if (captureBtn) captureBtn.style.display = "block";
                if (title) title.style.opacity = '0';

                if (arSystem) {
                    try {
                        arSystem.unpause();
                    } catch (e) {}
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

    function handleVisibilityChange() {
        if (document.hidden) {
            console.log("User left page. Disabling webcam streams...");
            
            if (arSystem) {
                try {
                    arSystem.pause(true);
                    wasArPausedByVisibility = true;
                } catch(e) { console.warn(e); }
            }

            // if (video && !video.paused) {
            //     video.pause();
            // }

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
                
                if (isStartGame && arSystem) {
                    window.location.reload(); 
                } else if (arSystem) {
                    try {
                        arSystem.unpause();
                    } catch(e) {
                        window.location.reload();
                    }
                }
            }
        }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // --------------------------------------------------------

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const centerContainer = document.getElementById('center-container');
            if (centerContainer) centerContainer.style.display = "none";
            isStartGame = true;
            video.play();
            // video.currentTime = 0;
            if (title) title.style.opacity = '1';
            if (/iPad|iPhone|iPod/.test(userAgent)) {
                DeviceOrientationEvent.requestPermission ?.().then(response => {
                    if (response === "granted") {
                        console.log("iOS orientation granted");
                    }
                });
            }
        });
        
    }

    let images = ['images/text1.png', 'images/text2.png', 'images/text3.png'];
    if (arIndex == 0) {
        images = ['images/TXT_Ferry_1.png', 'images/TXT_Ferry_2.png', 'images/TXT_Ferry_3.png'];
    }
    if (arIndex == 1) {
        images = ['images/TXT_EcoBio_1.png', 'images/TXT_EcoBio_2.png', 'images/TXT_EcoBio_3.png'];
    }
    if (arIndex == 2) {
        images = ['images/TXT_bricks_1.png', 'images/TXT_bricks_2.png', 'images/TXT_bricks_3.png'];
    }
    if (arIndex == 3) {
        images = ['images/TXT_3Tong_1.png', 'images/TXT_3Tong_2.png', 'images/TXT_3Tong_3.png'];
    }

    let currentIndex = 0;
    let cycleCount = 0;
    const slideElement = document.getElementById('textbox');

    video.addEventListener('ended', () => {
        if (arIndex == 4)
            video.style.display = 'none';
    });

    if (marker) {
        marker.addEventListener("targetFound", () => {
            const myInterval = setInterval(()=>{
                if (!isTrigger && !isPlaying && isStartGame) {
                    clearInterval(myInterval); 
                    if (title) title.style.opacity = '0';
                    if (frameHints) frameHints.style.opacity = '0';
                    slideElement.style.opacity = '1';

                    video.currentTime = 0;
                    video.play();
                    setTimeout(()=>{
                        video.style.display = 'block';
                    },100)
                    slideElement.src = images[0];
                    const timer = setInterval(() => {
                        currentIndex++;

                        if (currentIndex >= images.length) {
                            currentIndex = 0;
                            cycleCount++;
                        }

                        if (cycleCount === 1) {
                            clearInterval(timer);
                            slideElement.style.opacity = '0';
                            if (switchBtn) switchBtn.style.display = 'flex';
                            if (captureBtn) captureBtn.style.display = "block";
                            return;
                        }

                        slideElement.src = images[currentIndex];

                    }, 3333);

                    isTrigger = true;
                    isPlaying = true;
                    model.setAttribute('visible', true);

                    const arSys = sceneEl ?.systems["mindar-image-system"];
                    if (arSys) arSys.pause(true);

                    setTimeout(() => {
                        if (cameraEl) cameraEl.setAttribute("look-controls", "enabled: true");
                    }, 100);
                }
            },100);
            
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const captureCanvas = document.getElementById('captureCanvas');
            if (!captureCanvas) return;

            const ctx = captureCanvas.getContext('2d', {
                alpha: false
            });

            setTimeout(() => {
                let webcamVideo = null;
                document.querySelectorAll('video').forEach(v => {
                    if (v.srcObject instanceof MediaStream && v.videoWidth > 100 && v.id !== 'fullscreen-video') {
                        webcamVideo = v;
                    }
                });

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
                    let baseWidth = scene.clientWidth || window.innerWidth;
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

                    // 1. Draw background camera video
                    if (webcamVideo && webcamVideo.videoWidth > 100) {
                        const vidAspect = webcamVideo.videoWidth / webcamVideo.videoHeight;
                        const outAspect = outputWidth / outputHeight;

                        let drawW = outputWidth,
                            drawH = outputHeight,
                            offsetX = 0,
                            offsetY = 0;

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

                    // 2. Draw A-Frame AR content components
                    try {
                        const glCanvas = scene.components.screenshot ?.getCanvas('perspective');
                        if (glCanvas && glCanvas.width > 50) {
                            ctx.drawImage(glCanvas, 0, 0, outputWidth, outputHeight);
                        }
                    } catch (e) {
                        console.warn("AR screenshot failed:", e);
                    }

                    // 3. Draw Fullscreen Video Layer
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
                        } catch (videoError) {
                            console.warn("Failed overlaying full screen cover video layer:", videoError);
                        }
                    }

                    // 4. Add Watermark
                    const logo = new Image();
                    logo.src = 'images/icon.png';

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

                        const x = padding;
                        const y = padding;

                        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                        ctx.shadowBlur = 15;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 2;

                        ctx.drawImage(logo, x, y, logoWidth, logoHeight);

                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetY = 0;

                        const dataURL = captureCanvas.toDataURL('image/png', 0.85);
                        showCapturePreview(dataURL);
                    };

                    logo.onerror = () => {
                        console.warn("Watermark logo.png failed to load.");
                        const dataURL = captureCanvas.toDataURL('image/png', 0.85);
                        showCapturePreview(dataURL);
                    };

                }, 250);

            }, 100);
        });
    }

    // Capture Preview
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), 
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
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
            img.alt = 'Captured MLS AR Image';
            img.className = 'capture-img';

            const message = document.createElement('div');
            message.innerText = '請長按圖片儲存';
            message.className = 'capture-message';

            const closeBtn = document.createElement('div');
            closeBtn.innerHTML = '&times;';
            closeBtn.className = 'capture-close-btn';

            frame.appendChild(img);
            container.appendChild(frame);
            container.appendChild(message);
            container.appendChild(closeBtn);
            document.body.appendChild(container);

            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cleanup();
            });

            container.addEventListener('click', (e) => {
                if (e.target === container || e.target === message) {
                    cleanup();
                }
            });

            function cleanup() {
                container.remove();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            }

            setTimeout(() => {
                if (container.parentNode) cleanup();
            }, 30000);

        } catch (err) {
            console.error("Blob conversion failed:", err);
            alert("無法顯示預覽，請重試");
        }
    };
});