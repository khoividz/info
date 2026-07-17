// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,     // Thời gian animation (ms)
        once: true,         // Chỉ chạy animation một lần khi cuộn qua
        mirror: false       // Không lặp lại animation khi cuộn lên/xuống
    });

    // Hiệu ứng typewriter cho tiêu đề hero
    if (document.querySelector('.typewriter')) {
        var typed = new Typed('.typewriter', {
            strings: document.querySelector('.typewriter').dataset.typedItems.split(', '),
            typeSpeed: 70,      // Tốc độ gõ chữ (ms)
            backSpeed: 30,      // Tốc độ xóa chữ (ms)
            loop: true,         // Lặp lại hiệu ứng
            showCursor: true,   // Hiển thị con trỏ
            cursorChar: '_',    // Ký tự con trỏ (dấu gạch dưới cho chất code)
        });
    }

    // Cập nhật năm hiện tại cho footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // ========== AUDIO PLAYER LOGIC ==========
    const localAudio = document.getElementById('localAudio');
    const soundcloudIframe = document.getElementById('soundcloudWidget');
    const audioStatus = document.getElementById('audioStatus');
    const audioProgressFill = document.getElementById('audioProgressFill');
    const audioToggle = document.getElementById('audioToggle');
    const audioToggleIcon = document.getElementById('audioToggleIcon');
    const audioPlayer = document.getElementById('audioPlayer');
    const welcomeOverlay = document.getElementById('welcomeOverlay');

    let scWidget = null;
    let scReady = false;
    let isPlaying = true;
    let audioStarted = false;

    // Khởi tạo SoundCloud Widget API và chờ nó sẵn sàng
    function initSoundCloud() {
        if (window.SC && window.SC.Widget) {
            scWidget = SC.Widget(soundcloudIframe);
            scWidget.bind(window.SC.Widget.Events.READY, function() {
                scReady = true;
                scWidget.setVolume(80);
            });
        }
    }

    // Đợi iframe load xong rồi khởi tạo widget
    if (soundcloudIframe) {
        if (soundcloudIframe.contentWindow && window.SC && window.SC.Widget) {
            initSoundCloud();
        } else {
            soundcloudIframe.addEventListener('load', function() {
                initSoundCloud();
            });
        }
        // Fallback: nếu load event không fire, thử sau 2s
        setTimeout(function() {
            if (!scReady && window.SC && window.SC.Widget) {
                initSoundCloud();
            }
        }, 2000);
    }

    // Bắt đầu phát âm thanh khi user click overlay
    function startAudio() {
        if (audioStarted) return;
        audioStarted = true;

        // Ẩn overlay
        welcomeOverlay.classList.add('overlay-hide');
        setTimeout(function() {
            welcomeOverlay.style.display = 'none';
        }, 600);

        // Hiển thị audio player
        audioPlayer.classList.remove('hidden-player');

        // Phát lời chào
        localAudio.play().catch(function() {});
    }

    welcomeOverlay.addEventListener('click', startAudio);

    // Cập nhật progress bar cho lời chào
    localAudio.addEventListener('timeupdate', function() {
        if (localAudio.duration) {
            const pct = (localAudio.duration > 0) ? (localAudio.currentTime / localAudio.duration) * 100 : 0;
            audioProgressFill.style.width = pct + '%';
        }
    });

    // Khi lời chào phát xong -> chuyển sang SoundCloud
    localAudio.addEventListener('ended', function() {
        audioStatus.textContent = 'Dang phat: Loanh quanh pho...';
        audioProgressFill.style.width = '0%';
        audioToggleIcon.className = 'bi bi-pause-fill';
        isPlaying = true;

        function playSoundCloud() {
            if (scWidget && scReady) {
                scWidget.play();
            } else {
                // Chờ widget sẵn sàng rồi play
                var checkReady = setInterval(function() {
                    if (scWidget && scReady) {
                        clearInterval(checkReady);
                        scWidget.play();
                    }
                }, 200);
                // Timeout sau 5s nếu widget không load được
                setTimeout(function() { clearInterval(checkReady); }, 5000);
            }
        }

        playSoundCloud();
    });

    // Nút play/pause toggle
    audioToggle.addEventListener('click', function() {
        if (isPlaying) {
            if (localAudio.paused === false && !localAudio.ended) {
                localAudio.pause();
            } else if (scWidget && scReady) {
                scWidget.pause();
            }
            audioToggleIcon.className = 'bi bi-play-fill';
            isPlaying = false;
        } else {
            if (!localAudio.ended && localAudio.duration) {
                localAudio.play();
            } else if (scWidget && scReady) {
                scWidget.play();
            }
            audioToggleIcon.className = 'bi bi-pause-fill';
            isPlaying = true;
        }
    });

    // Hiệu ứng navbar đổi màu khi cuộn trang
    const header = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Khi cuộn xuống 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Cuộn mượt khi click vào các mục trên navbar
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Ngăn chặn hành vi mặc định của link
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offset = header.offsetHeight; // Lấy chiều cao của header
                window.scrollTo({
                    top: targetSection.offsetTop - offset, // Trừ đi chiều cao header để section không bị che
                    behavior: 'smooth'
                });

                // Đóng navbar burger menu trên mobile sau khi click
                if (window.innerWidth < 992) { // Kích thước màn hình của breakpoint 'lg'
                    const navbarCollapse = document.getElementById('navbarNav');
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    bsCollapse.hide();
                }
            }
        });
    });

    // Đánh dấu nav link active khi cuộn đến section
    const sections = document.querySelectorAll('section[id]');
    function setActiveNavLink() {
        const scrollY = window.pageYOffset + header.offsetHeight + 10; // Thêm offset để active sớm hơn
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector('.navbar-nav .nav-link[href*=' + sectionId + ']').classList.add('active');
            } else {
                document.querySelector('.navbar-nav .nav-link[href*=' + sectionId + ']').classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveNavLink);
    setActiveNavLink(); // Gọi lần đầu để active đúng khi tải trang

    // Xử lý form liên hệ (dùng Formspree.io hoặc Netlify Forms)
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Ngăn chặn form submit mặc định

            const formData = new FormData(this);
            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formMessage.innerHTML = '<span class="text-success">Tin nhắn của bạn đã được gửi thành công! Cảm ơn bạn.</span>';
                    this.reset(); // Reset form
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        formMessage.innerHTML = '<span class="text-danger">Có lỗi xảy ra: ' + data.errors.map(error => error.message).join(', ') + '</span>';
                    } else {
                        formMessage.innerHTML = '<span class="text-danger">Đã xảy ra lỗi khi gửi tin nhắn của bạn. Vui lòng thử lại.</span>';
                    }
                }
            } catch (error) {
                formMessage.innerHTML = '<span class="text-danger">Đã xảy ra lỗi mạng. Vui lòng kiểm tra kết nối internet và thử lại.</span>';
                console.error('Lỗi khi gửi form:', error);
            }
        });
    }

    // GSAP Animations (có thể tùy chỉnh thêm để "ngầu" hơn)
    gsap.registerPlugin(ScrollTrigger);

    // Fade in hero content
    gsap.from(".hero-section .container > *", {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out"
    });

    // Parallax effect cho hero section
    gsap.to(".hero-section", {
        backgroundPositionY: "bottom",
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Animation cho các card kỹ năng khi cuộn
    gsap.utils.toArray('.skill-card').forEach(card => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: card,
                start: "top 85%", // Khi card hiện lên 85% màn hình
                toggleActions: "play none none reverse" // Play khi vào, reverse khi ra
            }
        });
    });

    // Animation cho các card triết lý
    gsap.from(".philosophy-card", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".philosophy-card",
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    });

    // ========== MINI TOOLS LOGIC ==========

    // Tool Tab Switching
    document.querySelectorAll('.tool-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tool-tab').forEach(function(t) { t.classList.remove('active'); });
            document.querySelectorAll('.tool-panel').forEach(function(p) { p.classList.remove('active'); });
            this.classList.add('active');
            document.getElementById('tool-' + this.dataset.tool).classList.add('active');
        });
    });

    // --- JSON Formatter ---
    document.getElementById('jsonFormat').addEventListener('click', function() {
        var input = document.getElementById('jsonInput').value.trim();
        var output = document.getElementById('jsonOutput');
        var status = document.getElementById('jsonStatus');
        if (!input) { output.value = ''; status.textContent = ''; return; }
        try {
            var parsed = JSON.parse(input);
            output.value = JSON.stringify(parsed, null, 2);
            status.textContent = 'Hop le!';
            status.className = 'tool-status text-success';
        } catch (e) {
            output.value = '';
            status.textContent = 'Loi: ' + e.message;
            status.className = 'tool-status text-danger';
        }
    });

    document.getElementById('jsonMinify').addEventListener('click', function() {
        var input = document.getElementById('jsonInput').value.trim();
        var output = document.getElementById('jsonOutput');
        var status = document.getElementById('jsonStatus');
        if (!input) { output.value = ''; status.textContent = ''; return; }
        try {
            output.value = JSON.stringify(JSON.parse(input));
            status.textContent = 'Minified!';
            status.className = 'tool-status text-success';
        } catch (e) {
            status.textContent = 'Loi: ' + e.message;
            status.className = 'tool-status text-danger';
        }
    });

    document.getElementById('jsonCopy').addEventListener('click', function() {
        var output = document.getElementById('jsonOutput');
        if (output.value) { navigator.clipboard.writeText(output.value); }
    });

    document.getElementById('jsonClear').addEventListener('click', function() {
        document.getElementById('jsonInput').value = '';
        document.getElementById('jsonOutput').value = '';
        document.getElementById('jsonStatus').textContent = '';
    });

    // --- Base64 Encoder/Decoder ---
    document.getElementById('base64Encode').addEventListener('click', function() {
        var input = document.getElementById('base64Input').value;
        var output = document.getElementById('base64Output');
        var status = document.getElementById('base64Status');
        try {
            output.value = btoa(unescape(encodeURIComponent(input)));
            status.textContent = 'Encoded!';
            status.className = 'tool-status text-success';
        } catch (e) {
            status.textContent = 'Loi: ' + e.message;
            status.className = 'tool-status text-danger';
        }
    });

    document.getElementById('base64Decode').addEventListener('click', function() {
        var input = document.getElementById('base64Input').value;
        var output = document.getElementById('base64Output');
        var status = document.getElementById('base64Status');
        try {
            output.value = decodeURIComponent(escape(atob(input)));
            status.textContent = 'Decoded!';
            status.className = 'tool-status text-success';
        } catch (e) {
            status.textContent = 'Loi: Khong the decode Base64';
            status.className = 'tool-status text-danger';
        }
    });

    document.getElementById('base64Copy').addEventListener('click', function() {
        var output = document.getElementById('base64Output');
        if (output.value) { navigator.clipboard.writeText(output.value); }
    });

    document.getElementById('base64Clear').addEventListener('click', function() {
        document.getElementById('base64Input').value = '';
        document.getElementById('base64Output').value = '';
        document.getElementById('base64Status').textContent = '';
    });

    // --- Color Picker ---
    var colorPicker = document.getElementById('colorPicker');
    var colorPreview = document.getElementById('colorPreview');

    function hexToRgb(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return { r: r, g: g, b: b };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function updateColorDisplay(hex) {
        var rgb = hexToRgb(hex);
        var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        document.getElementById('colorHex').value = hex;
        document.getElementById('colorRgb').value = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
        document.getElementById('colorHsl').value = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
        colorPreview.style.background = hex;
    }

    colorPicker.addEventListener('input', function() { updateColorDisplay(this.value); });

    document.querySelectorAll('.copy-color').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var target = document.getElementById(this.dataset.target);
            if (target.value) { navigator.clipboard.writeText(target.value); }
        });
    });

    // --- QR Code ---
    var qrCodeInstance = null;
    var qrCurrentMode = 'text';
    var qrImageDataURL = null;

    // QR Mode Tabs
    document.querySelectorAll('.qr-mode-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.qr-mode-tab').forEach(function(t) { t.classList.remove('active'); });
            document.querySelectorAll('.qr-mode').forEach(function(m) { m.classList.remove('active'); });
            this.classList.add('active');
            qrCurrentMode = this.dataset.mode;
            document.getElementById('qr-mode-' + qrCurrentMode).classList.add('active');
        });
    });

    // QR Image Upload - Drag & Drop
    var qrImageDrop = document.getElementById('qrImageDrop');
    var qrImageInput = document.getElementById('qrImageInput');
    if (qrImageDrop) {
        qrImageDrop.addEventListener('dragover', function(e) { e.preventDefault(); this.style.borderColor = 'var(--primary-color)'; });
        qrImageDrop.addEventListener('dragleave', function() { this.style.borderColor = ''; });
        qrImageDrop.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            if (e.dataTransfer.files.length) handleQRImage(e.dataTransfer.files[0]);
        });
    }
    // Label[for] tự xử lý click, chỉ cần lắng nghe change
    if (qrImageInput) {
        qrImageInput.addEventListener('change', function() {
            if (this.files.length) handleQRImage(this.files[0]);
        });
    }

    function handleQRImage(file) {
        if (!file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            qrImageDataURL = e.target.result;
            document.getElementById('qrPreviewImg').src = qrImageDataURL;
            document.getElementById('qrImagePreview').style.display = 'block';
            document.getElementById('qrImageDrop').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    var qrRemoveImage = document.getElementById('qrRemoveImage');
    if (qrRemoveImage) {
        qrRemoveImage.addEventListener('click', function() {
            qrImageDataURL = null;
            document.getElementById('qrImagePreview').style.display = 'none';
            document.getElementById('qrImageDrop').style.display = 'flex';
            qrImageInput.value = '';
        });
    }

    // QR Generate
    document.getElementById('qrGenerate').addEventListener('click', function() {
        var output = document.getElementById('qrOutput');
        var downloadBtn = document.getElementById('qrDownload');
        var qrStatus = document.getElementById('qrStatus');
        var content = '';

        if (qrCurrentMode === 'text') {
            content = document.getElementById('qrInput').value.trim();
        } else {
            content = qrImageDataURL;
        }

        if (!content) {
            qrStatus.textContent = qrCurrentMode === 'image' ? 'Hay chon anh truoc!' : 'Nhap noi dung truoc!';
            qrStatus.className = 'tool-status text-danger';
            return;
        }

        qrStatus.textContent = '';
        output.innerHTML = '';
        qrCodeInstance = new QRCode(output, {
            text: content,
            width: 200,
            height: 200,
            colorDark: '#00e676',
            colorLight: '#121212',
            correctLevel: QRCode.CorrectLevel.M
        });
        downloadBtn.style.display = 'inline-block';
    });

    document.getElementById('qrDownload').addEventListener('click', function() {
        var canvas = document.querySelector('#qrOutput canvas');
        if (canvas) {
            var link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    });

    // --- Markdown Preview ---
    var mdInput = document.getElementById('mdInput');
    var mdOutput = document.getElementById('mdOutput');
    if (mdInput) {
        mdInput.addEventListener('input', function() {
            var text = this.value.trim();
            if (!text) {
                mdOutput.innerHTML = '<p style="color: rgba(255,255,255,0.3);">Ket qua preview se hien thi o day...</p>';
            } else if (typeof marked !== 'undefined') {
                mdOutput.innerHTML = marked.parse(text);
            } else {
                mdOutput.textContent = text;
            }
        });
    }

    // --- Text to Speech ---
    var ttsInput = document.getElementById('ttsInput');
    var ttsPlay = document.getElementById('ttsPlay');
    var ttsPause = document.getElementById('ttsPause');
    var ttsStop = document.getElementById('ttsStop');
    var ttsRate = document.getElementById('ttsRate');
    var ttsPitch = document.getElementById('ttsPitch');
    var ttsRateValue = document.getElementById('ttsRateValue');
    var ttsPitchValue = document.getElementById('ttsPitchValue');
    var ttsStatus = document.getElementById('ttsStatus');
    var ttsVoiceList = document.getElementById('ttsVoiceList');
    var ttsSelectedVoice = null;
    var synth = window.speechSynthesis;

    // Tải danh sách giọng - load nhanh
    var voicesLoaded = false;
    function loadVoices() {
        if (voicesLoaded) return;
        var voices = synth.getVoices();
        if (voices.length === 0) return;

        var vietnameseVoices = voices.filter(function(v) {
            return v.lang.startsWith('vi');
        });

        voicesLoaded = true;
        ttsVoiceList.innerHTML = '';

        if (vietnameseVoices.length === 0) {
            ttsVoiceList.innerHTML = '<p style="color: rgba(255,255,255,0.4); font-size:0.85rem;">Khong tim thay giong Viet Nam. Se dung giong mac dinh khi phat.</p>';
            return;
        }

        vietnameseVoices.forEach(function(voice, i) {
            var div = document.createElement('div');
            div.className = 'tts-voice-item';
            var isMale = voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('nam') || voice.name.toLowerCase().includes('minh') || voice.name.toLowerCase().includes('ha noi');
            div.innerHTML = '<i class="bi bi-person-fill"></i> ' + voice.name + (isMale ? ' <span class="badge bg-primary" style="font-size:0.6rem;">NAM</span>' : '');
            div.addEventListener('click', function() {
                document.querySelectorAll('.tts-voice-item').forEach(function(v) { v.classList.remove('active'); });
                div.classList.add('active');
                ttsSelectedVoice = voice;
            });
            ttsVoiceList.appendChild(div);
        });

        // Tu chon giong nam
        var maleVoice = vietnameseVoices.find(function(v) {
            return v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('nam') || v.name.toLowerCase().includes('minh');
        });
        if (!maleVoice && vietnameseVoices.length > 0) maleVoice = vietnameseVoices[0];
        if (maleVoice) {
            ttsSelectedVoice = maleVoice;
            var items = ttsVoiceList.querySelectorAll('.tts-voice-item');
            if (items.length > 0) items[0].classList.add('active');
        }
    }

    if (synth) {
        // Load ngay lap tuc
        loadVoices();
        // Poll nhanh: moi 200ms trong 5s dau
        var voiceInterval = setInterval(function() {
            loadVoices();
            if (voicesLoaded) clearInterval(voiceInterval);
        }, 200);
        setTimeout(function() { clearInterval(voiceInterval); }, 5000);
        // Lang nghe event
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = function() { loadVoices(); };
        }
    }

    ttsRate.addEventListener('input', function() { ttsRateValue.textContent = this.value; });
    ttsPitch.addEventListener('input', function() { ttsPitchValue.textContent = this.value; });

    ttsPlay.addEventListener('click', function() {
        var text = ttsInput.value.trim();
        if (!text) {
            ttsStatus.textContent = 'Nhap text truoc!';
            ttsStatus.className = 'tool-status text-danger';
            return;
        }

        synth.cancel();
        var utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'vi-VN';
        utter.rate = parseFloat(ttsRate.value);
        utter.pitch = parseFloat(ttsPitch.value);
        if (ttsSelectedVoice) utter.voice = ttsSelectedVoice;

        utter.onstart = function() {
            ttsStatus.textContent = 'Dang doc...';
            ttsStatus.className = 'tool-status text-success';
            ttsPlay.style.display = 'none';
            ttsPause.style.display = 'inline-block';
        };
        utter.onend = function() {
            ttsStatus.textContent = 'Hoan tat!';
            ttsStatus.className = 'tool-status';
            ttsPlay.style.display = 'inline-block';
            ttsPause.style.display = 'none';
        };

        synth.speak(utter);
    });

    ttsPause.addEventListener('click', function() {
        if (synth.speaking) {
            if (synth.paused) {
                synth.resume();
                ttsStatus.textContent = 'Dang doc...';
                ttsPause.querySelector('i').className = 'bi bi-pause-fill';
            } else {
                synth.pause();
                ttsStatus.textContent = 'Tam dung';
                ttsPause.querySelector('i').className = 'bi bi-play-fill';
            }
        }
    });

    ttsStop.addEventListener('click', function() {
        synth.cancel();
        ttsStatus.textContent = '';
        ttsPlay.style.display = 'inline-block';
        ttsPause.style.display = 'none';
    });
});
