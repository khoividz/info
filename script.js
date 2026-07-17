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

    // =========== Dich Thuat (Translation) ===========
    const trFrom  = document.getElementById('trFrom');
    const trTo    = document.getElementById('trTo');
    const trSwap  = document.getElementById('trSwap');
    const trInput = document.getElementById('trInput');
    const trOutput= document.getElementById('trOutput');
    const trBtn   = document.getElementById('trBtn');
    const trCopy  = document.getElementById('trCopy');
    const trStatus= document.getElementById('trStatus');

    if (trBtn) {
      trSwap.addEventListener('click', () => {
        const tmp = trFrom.value;
        trFrom.value = trTo.value;
        trTo.value = tmp;
      });

      trBtn.addEventListener('click', async () => {
        const text = trInput.value.trim();
        if (!text) { trStatus.textContent = 'Vui long nhap van ban'; return; }
        trStatus.textContent = 'Dang dich...';
        trBtn.disabled = true;
        try {
          const sl = trFrom.value;
          const tl = trTo.value;
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.responseStatus === 200 && data.responseData) {
            trOutput.value = data.responseData.translatedText;
            trStatus.textContent = 'Dich thanh cong!';
          } else {
            trOutput.value = '';
            trStatus.textContent = 'Loi: ' + (data.responseDetails || 'Khong the dich');
          }
        } catch(e) {
          trStatus.textContent = 'Loi mang: ' + e.message;
        } finally {
          trBtn.disabled = false;
        }
      });

      trCopy.addEventListener('click', () => {
        if (trOutput.value) {
          navigator.clipboard.writeText(trOutput.value).then(() => {
            trCopy.innerHTML = '<i class="bi bi-check"></i> Da copy!';
            setTimeout(() => { trCopy.innerHTML = '<i class="bi bi-clipboard"></i> Copy'; }, 2000);
          });
        }
      });
    }

    // =========== Dong Ho (Real-time Clock) ===========
    const clockBig      = document.getElementById('clockBig');
    const clockDate     = document.getElementById('clockDate');
    const clockDay      = document.getElementById('clockDay');
    const clockTimezone = document.getElementById('clockTimezone');
    const clockDays = ['Chu Nhat', 'Thu Hai', 'Thu Ba', 'Thu Tu', 'Thu Sau', 'Thu Sau', 'Thu Bay'];

    function updateClock() {
      if (!clockBig) return;
      const tz = clockTimezone.value;
      const now = new Date();
      const opts = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      const dateOpts = { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' };
      const timeStr = now.toLocaleTimeString('en-GB', opts);
      const dateStr = now.toLocaleDateString('vi-VN', dateOpts);
      const dayIdx = now.getDay();
      clockBig.textContent = timeStr;
      clockDate.textContent = dateStr;
      clockDay.textContent = clockDays[dayIdx];
    }

    if (clockBig) {
      updateClock();
      setInterval(updateClock, 1000);
    }

    // =========== Thoi Tiet (Weather - OpenWeatherMap) ===========
    const weatherBtn    = document.getElementById('weatherBtn');
    const weatherCity   = document.getElementById('weatherCity');
    const weatherLoading= document.getElementById('weatherLoading');
    const weatherError  = document.getElementById('weatherError');
    const weatherResult = document.getElementById('weatherResult');
    const wIcon   = document.getElementById('wIcon');
    const wTemp   = document.getElementById('wTemp');
    const wDesc   = document.getElementById('wDesc');
    const wCity   = document.getElementById('wCity');
    const wFeel   = document.getElementById('wFeel');
    const wHumidity= document.getElementById('wHumidity');
    const wWind   = document.getElementById('wWind');
    const wVisibility= document.getElementById('wVisibility');
    const wSunrise= document.getElementById('wSunrise');
    const wSunset = document.getElementById('wSunset');
    const wForecast= document.getElementById('wForecast');
    const WEATHER_KEY = 'e470e5902bd876d038c4fc730b0a48e7';

    function formatUnixTime(ts, tz) {
      const d = new Date(ts * 1000);
      return d.toLocaleTimeString('en-GB', { timeZone: tz || 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
    }

    function forecastDay(dateStr) {
      const d = new Date(dateStr);
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[d.getDay()];
    }

    async function loadWeather(city) {
      if (!city) return;
      weatherLoading.style.display = 'block';
      weatherError.style.display = 'none';
      weatherResult.style.display = 'none';
      weatherBtn.disabled = true;

      try {
        const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_KEY}&units=metric&lang=vi`);
        if (!curRes.ok) { throw new Error('Khong tim thay thanh pho: ' + city); }
        const cur = await curRes.json();

        wIcon.src = `https://openweathermap.org/img/wn/${cur.weather[0].icon}@2x.png`;
        wTemp.textContent = Math.round(cur.main.temp) + '°C';
        wDesc.textContent = cur.weather[0].description;
        wCity.textContent = cur.name + ', ' + cur.sys.country;
        wFeel.textContent = Math.round(cur.main.feels_like) + '°C';
        wHumidity.textContent = cur.main.humidity + '%';
        wWind.textContent = cur.wind.speed + ' m/s';
        wVisibility.textContent = ((cur.visibility || 0) / 1000).toFixed(1) + ' km';
        wSunrise.textContent = formatUnixTime(cur.sys.sunrise);
        wSunset.textContent = formatUnixTime(cur.sys.sunset);

        const fcRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_KEY}&units=metric&lang=vi`);
        const fc = await fcRes.json();

        const dailyMap = {};
        fc.list.forEach(item => {
          const dt = new Date(item.dt * 1000);
          const key = dt.toISOString().split('T')[0];
          if (!dailyMap[key]) {
            dailyMap[key] = { temps: [], descs: [], icons: [], date: item.dt_txt.split(' ')[0] };
          }
          dailyMap[key].temps.push(item.main.temp);
          dailyMap[key].descs.push(item.weather[0].description);
          dailyMap[key].icons.push(item.weather[0].icon);
        });

        wForecast.innerHTML = '';
        const keys = Object.keys(dailyMap).slice(1, 6);
        keys.forEach(k => {
          const d = dailyMap[k];
          const avg = d.temps.reduce((a,b)=>a+b,0) / d.temps.length;
          const midIcon = d.icons[Math.floor(d.icons.length / 2)];
          const midDesc = d.descs[Math.floor(d.descs.length / 2)];
          wForecast.innerHTML += `
            <div class="col">
              <div class="forecast-card">
                <div class="fc-day">${forecastDay(d.date)}</div>
                <img class="fc-icon" src="https://openweathermap.org/img/wn/${midIcon}@2x.png" alt="">
                <div class="fc-temp">${Math.round(avg)}°C</div>
                <div class="fc-desc">${midDesc}</div>
              </div>
            </div>`;
        });

        weatherLoading.style.display = 'none';
        weatherResult.style.display = 'block';
      } catch(e) {
        weatherLoading.style.display = 'none';
        weatherError.style.display = 'block';
        weatherError.querySelector('p').textContent = e.message;
      } finally {
        weatherBtn.disabled = false;
      }
    }

    if (weatherBtn) {
      weatherBtn.addEventListener('click', () => loadWeather(weatherCity.value.trim()));
      weatherCity.addEventListener('keydown', e => { if (e.key === 'Enter') loadWeather(weatherCity.value.trim()); });
    }

    // --- Text to Speech (ElevenLabs API) ---
    var ttsInput = document.getElementById('ttsInput');
    var ttsPlay = document.getElementById('ttsPlay');
    var ttsStop = document.getElementById('ttsStop');
    var ttsRate = document.getElementById('ttsRate');
    var ttsRateValue = document.getElementById('ttsRateValue');
    var ttsStatus = document.getElementById('ttsStatus');
    var ttsAudio = document.getElementById('ttsAudio');
    var ttsAudioWrap = document.getElementById('ttsAudioWrap');
    var ttsApiKey = 'sk_cb8297958677e6bd0717769d710d8a2a246ab6c120fd2973';
    var ttsVoiceId = 'ZsjEJaLQy3sgvwxicmDx';

    ttsRate.addEventListener('input', function() { ttsRateValue.textContent = parseFloat(this.value).toFixed(1); });

    ttsPlay.addEventListener('click', async function() {
        var text = ttsInput.value.trim();
        if (!text) {
            ttsStatus.textContent = 'Nhap text truoc!';
            ttsStatus.className = 'tool-status text-danger';
            return;
        }

        ttsPlay.disabled = true;
        ttsStatus.textContent = 'Dang tai am thanh...';
        ttsStatus.className = 'tool-status text-warning';

        try {
            var response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + ttsVoiceId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ttsApiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        speed: parseFloat(ttsRate.value)
                    }
                })
            });

            if (!response.ok) {
                var errData = await response.json().catch(function() { return {}; });
                throw new Error(errData.detail ? errData.detail.message : 'Loi API: ' + response.status);
            }

            var blob = await response.blob();
            var url = URL.createObjectURL(blob);
            ttsAudio.src = url;
            ttsAudioWrap.style.display = 'block';
            ttsAudio.play();
            ttsStatus.textContent = 'Dang phat...';
            ttsStatus.className = 'tool-status text-success';

            ttsAudio.onended = function() {
                ttsStatus.textContent = 'Hoan tat!';
                ttsStatus.className = 'tool-status';
                ttsPlay.disabled = false;
            };
        } catch (err) {
            ttsStatus.textContent = 'Loi: ' + err.message;
            ttsStatus.className = 'tool-status text-danger';
            ttsPlay.disabled = false;
        }
    });

    ttsStop.addEventListener('click', function() {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
        ttsStatus.textContent = '';
        ttsPlay.disabled = false;
    });
});
