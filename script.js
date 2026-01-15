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
});
