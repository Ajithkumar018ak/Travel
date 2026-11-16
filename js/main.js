
/* =====================================================
   TRAVORA — MAIN JAVASCRIPT
   Pure Vanilla JavaScript
   No LocalStorage / SessionStorage / Backend
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =================================================
       01. CINEMATIC PRELOADER
    ================================================= */

    const preloader = document.getElementById("preloader");
    const percentage = document.getElementById("preloaderPercentage");
    const progressBar = document.querySelector(".preloader-progress-bar");
    const scenes = document.querySelectorAll(".preloader-scene");

    let progress = 0;
    let currentScene = 0;
    let loaderFinished = false;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    function activateScene(index) {

        scenes.forEach((scene, i) => {
            scene.classList.toggle("scene-active", i === index);
        });

    }

    function updateProgress(value) {

        progress = Math.min(value, 100);

        if (percentage) {
            percentage.textContent = Math.floor(progress);
        }

        if (progressBar) {
            progressBar.style.width = progress + "%";
        }

    }

    function finishPreloader() {

        if (loaderFinished) return;

        loaderFinished = true;

        updateProgress(100);

        if (preloader) {

            preloader.classList.add("is-loaded");

            document.body.classList.add("page-loaded");

            setTimeout(() => {
                preloader.style.display = "none";
            }, 1100);

        }

    }

    if (preloader) {

        if (reducedMotion) {

            finishPreloader();

        } else {

            const totalDuration = 7500;
            const startTime = performance.now();

            const sceneDurations = [2500, 2500, 2500];

            function loaderAnimation(timestamp) {

                if (loaderFinished) return;

                const elapsed = timestamp - startTime;

                const calculatedProgress = Math.min(
                    (elapsed / totalDuration) * 100,
                    100
                );

                updateProgress(calculatedProgress);

                let accumulatedTime = 0;

                for (let i = 0; i < sceneDurations.length; i++) {

                    accumulatedTime += sceneDurations[i];

                    if (elapsed < accumulatedTime) {
                        currentScene = i;
                        break;
                    }

                    currentScene = Math.min(i + 1, 2);

                }

                activateScene(currentScene);

                if (elapsed >= totalDuration) {

                    finishPreloader();

                    return;

                }

                requestAnimationFrame(loaderAnimation);

            }

            activateScene(0);

            requestAnimationFrame(loaderAnimation);

            // Prevent the loader from remaining indefinitely
            // if the browser takes too long to load resources.

            window.addEventListener("load", () => {

                setTimeout(() => {
                    finishPreloader();
                }, 9000);

            }, { once: true });

        }

    }


    /* =================================================
       02. HEADER SCROLL EFFECT
    ================================================= */

    const header = document.getElementById("mainHeader");

    function handleHeaderScroll() {

        if (!header) return;

        header.classList.toggle(
            "scrolled",
            window.scrollY > 60
        );

    }

    window.addEventListener("scroll", handleHeaderScroll, {
        passive: true
    });

    handleHeaderScroll();


    /* =================================================
       03. HERO CAROUSEL
    ================================================= */

    const carousel = document.getElementById("heroCarousel");

    const slides = carousel
        ? Array.from(carousel.querySelectorAll(".hero-slide"))
        : [];

    const dots = document.querySelectorAll(".carousel-dot");

    const previousButton = document.getElementById("carouselPrev");
    const nextButton = document.getElementById("carouselNext");

    const heroTitle = document.getElementById("heroTitle");
    const heroHighlight = document.getElementById("heroHighlight");
    const heroDescription = document.getElementById("heroDescription");
    const heroBackground = document.getElementById("heroBackground");

    const counter = document.getElementById("carouselCounter");

    let activeSlide = 0;
    let carouselTimer = null;

    const carouselInterval = 5000;

    function showSlide(index) {

        if (!slides.length) return;

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "active",
                i === activeSlide
            );

        });

        dots.forEach((dot, i) => {

            dot.classList.toggle(
                "active",
                i === activeSlide
            );

            const dotProgress = dot.querySelector("span");

            if (dotProgress) {

                dotProgress.style.transition = "none";
                dotProgress.style.width = "0%";

                if (i === activeSlide) {

                    requestAnimationFrame(() => {

                        requestAnimationFrame(() => {

                            dotProgress.style.transition =
                                `width ${carouselInterval}ms linear`;

                            dotProgress.style.width = "100%";

                        });

                    });

                }

            }

        });

        const currentSlide = slides[activeSlide];

        if (heroTitle) {
            heroTitle.innerHTML = currentSlide.dataset.title;
        }

        if (heroHighlight) {
            heroHighlight.textContent =
                currentSlide.dataset.highlight || "";
        }

        if (heroDescription) {
            heroDescription.textContent =
                currentSlide.dataset.description || "";
        }

        if (heroBackground) {

            const image = currentSlide.dataset.background;

            if (image) {

                heroBackground.style.backgroundImage =
                    `linear-gradient(90deg, rgba(7,23,39,.97), rgba(9,31,49,.60)), url("${image}")`;

                heroBackground.style.backgroundSize = "cover";
                heroBackground.style.backgroundPosition = "center";

            }

        }

        if (counter) {

            counter.textContent =
                `${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;

        }

    }

    function stopCarousel() {

        clearInterval(carouselTimer);

    }

    function startCarousel() {

        stopCarousel();

        if (reducedMotion || slides.length < 2) return;

        carouselTimer = setInterval(() => {

            showSlide(activeSlide + 1);

        }, carouselInterval);

    }

    function changeSlide(index) {

        showSlide(index);

        startCarousel();

    }

    if (slides.length) {

        showSlide(0);

        startCarousel();

    }

    if (nextButton) {

        nextButton.addEventListener("click", () => {

            changeSlide(activeSlide + 1);

        });

    }

    if (previousButton) {

        previousButton.addEventListener("click", () => {

            changeSlide(activeSlide - 1);

        });

    }

    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {

            changeSlide(index);

        });

    });


    // Pause automatic movement while hovering

    if (carousel) {

        carousel.addEventListener("mouseenter", stopCarousel);

        carousel.addEventListener("mouseleave", startCarousel);

    }


    // Touch swipe support

    if (carousel) {

        let touchStartX = 0;

        carousel.addEventListener("touchstart", event => {

            touchStartX = event.changedTouches[0].screenX;

        }, { passive: true });

        carousel.addEventListener("touchend", event => {

            const touchEndX = event.changedTouches[0].screenX;

            const difference = touchStartX - touchEndX;

            if (Math.abs(difference) > 50) {

                changeSlide(
                    activeSlide + (difference > 0 ? 1 : -1)
                );

            }

        }, { passive: true });

    }


    /* =================================================
       04. MOBILE NAVIGATION DRAWER
    ================================================= */

    const menuButton = document.getElementById("mobileMenuButton");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const mobileOverlay = document.getElementById("mobileOverlay");
    const drawerClose = document.getElementById("drawerClose");

    function openDrawer() {

        if (!mobileDrawer || !mobileOverlay) return;

        mobileDrawer.classList.add("active");
        mobileOverlay.classList.add("active");

        document.body.classList.add("menu-open");

        if (menuButton) {
            menuButton.setAttribute("aria-expanded", "true");
        }

        mobileDrawer.setAttribute("aria-hidden", "false");

    }

    function closeDrawer() {

        if (!mobileDrawer || !mobileOverlay) return;

        mobileDrawer.classList.remove("active");
        mobileOverlay.classList.remove("active");

        document.body.classList.remove("menu-open");

        if (menuButton) {
            menuButton.setAttribute("aria-expanded", "false");
        }

        mobileDrawer.setAttribute("aria-hidden", "true");

    }

    if (menuButton) {

        menuButton.addEventListener("click", openDrawer);

    }

    if (drawerClose) {

        drawerClose.addEventListener("click", closeDrawer);

    }

    if (mobileOverlay) {

        mobileOverlay.addEventListener("click", closeDrawer);

    }

    if (mobileDrawer) {

        mobileDrawer.querySelectorAll(".drawer-nav a").forEach(link => {

            link.addEventListener("click", closeDrawer);

        });

    }


    /* =================================================
       05. LOGIN MODAL
    ================================================= */

    const loginModal = document.getElementById("loginModal");

    const loginOpenButton = document.getElementById("loginModalOpen");

    const loginCloseButton = document.getElementById("loginModalClose");

    const loginOverlay = document.getElementById("loginModalOverlay");

    const doorScene = document.getElementById("loginDoorScene");

    function openLogin() {

        if (!loginModal) return;

        closeDrawer();

        loginModal.classList.add("active");

        loginModal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");

        // Replay door animation

        if (doorScene) {

            doorScene.querySelectorAll(
                ".login-door-left, .login-door-right"
            ).forEach(door => {

                door.style.transition = "none";

                door.style.transform = "none";

            });

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    doorScene.querySelectorAll(
                        ".login-door-left, .login-door-right"
                    ).forEach(door => {

                        door.style.transition =
                            "transform 1.5s cubic-bezier(.7,0,.2,1)";

                    });

                    doorScene.classList.add("opened");

                });

            });

        }

        setTimeout(() => {

            const activeForm = document.querySelector(
                ".login-form:not([hidden]) input"
            );

            if (activeForm) activeForm.focus();

        }, 500);

    }

    function closeLogin() {

        if (!loginModal) return;

        loginModal.classList.remove("active");

        loginModal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("modal-open");

        if (doorScene) {

            doorScene.classList.remove("opened");

            doorScene.querySelectorAll(
                ".login-door-left, .login-door-right"
            ).forEach(door => {

                door.style.transform = "";

                door.style.transition = "";

            });

        }

    }

    if (loginOpenButton) {

        loginOpenButton.addEventListener("click", openLogin);

    }

    document.querySelectorAll("[data-open-login]").forEach(button => {

        button.addEventListener("click", openLogin);

    });

    if (loginCloseButton) {

        loginCloseButton.addEventListener("click", closeLogin);

    }

    if (loginOverlay) {

        loginOverlay.addEventListener("click", closeLogin);

    }


    /* =================================================
       06. USER / ADMIN LOGIN TABS
    ================================================= */

    const userTab = document.getElementById("userLoginTab");
    const adminTab = document.getElementById("adminLoginTab");

    const userForm = document.getElementById("userLoginForm");
    const adminForm = document.getElementById("adminLoginForm");

    const userMessage = document.getElementById("userLoginMessage");
    const adminMessage = document.getElementById("adminLoginMessage");

    function switchLoginTab(type) {

        const isUser = type === "user";

        if (userTab) {
            userTab.classList.toggle("active", isUser);
        }

        if (adminTab) {
            adminTab.classList.toggle("active", !isUser);
        }

        if (userForm) {
            userForm.hidden = !isUser;
        }

        if (adminForm) {
            adminForm.hidden = isUser;
        }

        if (userMessage) userMessage.textContent = "";

        if (adminMessage) adminMessage.textContent = "";

    }

    if (userTab) {

        userTab.addEventListener("click", () => {

            switchLoginTab("user");

        });

    }

    if (adminTab) {

        adminTab.addEventListener("click", () => {

            switchLoginTab("admin");

        });

    }


    /* =================================================
       07. PASSWORD VISIBILITY TOGGLE
    ================================================= */

    document.querySelectorAll("[data-toggle-password]").forEach(button => {

        button.addEventListener("click", () => {

            const targetId = button.dataset.togglePassword;

            const passwordInput = document.getElementById(targetId);

            if (!passwordInput) return;

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";

            button.innerHTML = isPassword
                ? '<i class="fa-regular fa-eye-slash"></i>'
                : '<i class="fa-regular fa-eye"></i>';

            button.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );

        });

    });


    /* =================================================
       08. LOGIN FORM DEMO VALIDATION
    ================================================= */

    function handleLoginSubmit(form, messageElement, accountType) {

        if (!form) return;

        form.addEventListener("submit", event => {

            event.preventDefault();

            if (!form.checkValidity()) {

                form.reportValidity();

                return;

            }

            const email = form.querySelector(
                'input[type="email"]'
            );

            const password = form.querySelector(
                'input[type="password"], input[type="text"]'
            );

            if (!email || !password) return;

            if (!email.value.trim() || !password.value.trim()) {

                if (messageElement) {
                    messageElement.textContent =
                        "Please enter your login details.";
                }

                return;

            }

            if (messageElement) {

                messageElement.style.color = "#b17b31";

                messageElement.textContent =
                    `${accountType} login interface is ready. Connect a secure authentication backend to enable sign-in.`;

            }

        });

    }

    handleLoginSubmit(
        userForm,
        userMessage,
        "User"
    );

    handleLoginSubmit(
        adminForm,
        adminMessage,
        "Admin"
    );


    /* =================================================
       09. SCROLL REVEAL ANIMATION
    ================================================= */

    const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right"
    );

    if ("IntersectionObserver" in window && !reducedMotion) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach(element => {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("visible");

        });

    }


    /* =================================================
       10. PACKAGE HEART BUTTONS
    ================================================= */

    document.querySelectorAll(".package-save").forEach(button => {

        button.addEventListener("click", () => {

            const icon = button.querySelector("i");

            if (!icon) return;

            const isSaved = button.classList.toggle("saved");

            icon.classList.toggle("fa-regular", !isSaved);

            icon.classList.toggle("fa-solid", isSaved);

            button.setAttribute(
                "aria-label",
                isSaved ? "Remove from favourites" : "Add to favourites"
            );

            button.style.color = isSaved ? "#c49a5b" : "#102a43";

        });

    });


    /* =================================================
       11. SMOOTH BACK TO TOP
    ================================================= */

    document.querySelectorAll('a[href="#home"]').forEach(link => {

        link.addEventListener("click", event => {

            const home = document.getElementById("home");

            if (home) {

                event.preventDefault();

                home.scrollIntoView({
                    behavior: reducedMotion ? "auto" : "smooth"
                });

            }

        });

    });


    /* =================================================
       12. KEYBOARD CONTROLS
    ================================================= */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            closeDrawer();

            closeLogin();

        }

        if (
            event.key === "ArrowRight" &&
            !loginModal?.classList.contains("active") &&
            !mobileDrawer?.classList.contains("active")
        ) {

            changeSlide(activeSlide + 1);

        }

        if (
            event.key === "ArrowLeft" &&
            !loginModal?.classList.contains("active") &&
            !mobileDrawer?.classList.contains("active")
        ) {

            changeSlide(activeSlide - 1);

        }

    });


    /* =================================================
       13. IMAGE LOADING FALLBACK
    ================================================= */

    document.querySelectorAll("img").forEach(img => {

        img.addEventListener("error", () => {

            img.classList.add("image-error");

        });

    });


    /* =================================================
       14. PAGE INITIALIZATION
    ================================================= */

    switchLoginTab("user");

    handleHeaderScroll();

    console.log(
        "%c TRAVORA ",
        "background:#102a43;color:#c9a66b;font-size:18px;font-weight:bold;padding:8px;"
    );

    console.log(
        "Travel Beyond Ordinary — Website initialized successfully."
    );

});





/* =========================================================
   TRAVORA ABOUT PAGE — JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PRELOADER
    ===================================================== */

    const preloader = document.querySelector("#noxPreloader");

    if (preloader) {

        window.addEventListener("load", () => {

            setTimeout(() => {

                preloader.classList.add("loaded");

                setTimeout(() => {
                    preloader.style.display = "none";
                }, 900);

            }, 500);

        });

        // Fallback
        setTimeout(() => {
            preloader.classList.add("loaded");

            setTimeout(() => {
                preloader.style.display = "none";
            }, 900);

        }, 3500);

    }


    /* =====================================================
       MOBILE DRAWER
    ===================================================== */

    const menuButton = document.querySelector("#mobileMenuButton");
    const mobileDrawer = document.querySelector("#mobileDrawer");
    const mobileOverlay = document.querySelector("#mobileOverlay");
    const drawerClose = document.querySelector("#drawerClose");

    function openDrawer() {

        if (!mobileDrawer || !mobileOverlay) return;

        mobileDrawer.classList.add("active");
        mobileOverlay.classList.add("active");

        document.body.classList.add("drawer-open");

        mobileDrawer.setAttribute("aria-hidden", "false");

    }

    function closeDrawer() {

        if (!mobileDrawer || !mobileOverlay) return;

        mobileDrawer.classList.remove("active");
        mobileOverlay.classList.remove("active");

        document.body.classList.remove("drawer-open");

        mobileDrawer.setAttribute("aria-hidden", "true");

    }

    menuButton?.addEventListener("click", openDrawer);

    drawerClose?.addEventListener("click", closeDrawer);

    mobileOverlay?.addEventListener("click", closeDrawer);

    mobileDrawer?.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", closeDrawer);

    });


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeDrawer();
            closeLogin();
        }

    });


    /* =====================================================
       LOGIN MODAL
    ===================================================== */

    const loginModal = document.querySelector("#loginModal");
    const loginOpen = document.querySelector("#loginModalOpen");
    const loginClose = document.querySelector("#loginModalClose");
    const loginOverlay = document.querySelector("#loginModalOverlay");

    function openLogin() {

        if (!loginModal) return;

        loginModal.classList.add("active");
        loginModal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");

    }

    function closeLogin() {

        if (!loginModal) return;

        loginModal.classList.remove("active");
        loginModal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("modal-open");

    }

    loginOpen?.addEventListener("click", openLogin);

    loginClose?.addEventListener("click", closeLogin);

    loginOverlay?.addEventListener("click", closeLogin);


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    const passwordInput = document.querySelector("#loginPassword");
    const passwordToggle = document.querySelector("#passwordToggle");

    passwordToggle?.addEventListener("click", () => {

        if (!passwordInput) return;

        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";

        passwordToggle.innerHTML = isPassword
            ? '<i class="fa-regular fa-eye-slash"></i>'
            : '<i class="fa-regular fa-eye"></i>';

        passwordToggle.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );

    });


    /* =====================================================
       LOGIN FORM
    ===================================================== */

    const loginForm = document.querySelector("#loginForm");

    loginForm?.addEventListener("submit", event => {

        event.preventDefault();

        const email = document.querySelector("#loginEmail")?.value.trim();
        const password = passwordInput?.value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        alert("Login functionality is not connected yet.");

    });


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealSelectors = [
        ".about-intro-left",
        ".about-intro-right",
        ".about-stats-heading",
        ".purpose-heading",
        ".purpose-card",
        ".philosophy-image",
        ".philosophy-content",
        ".values-heading",
        ".value-card",
        ".team-heading",
        ".team-card",
        ".journey-heading",
        ".journey-item",
        ".why-heading",
        ".why-card",
        ".categories-heading",
        ".category-card",
        ".promise-content",
        ".promise-image",
        ".quote-content",
        ".faq-heading",
        ".faq-item",
        ".about-cta-content"
    ];

    revealSelectors.forEach(selector => {

        document.querySelectorAll(selector).forEach(element => {

            if (
                element.classList.contains("value-card") ||
                element.classList.contains("team-card") ||
                element.classList.contains("why-card") ||
                element.classList.contains("category-card") ||
                element.classList.contains("purpose-card")
            ) {
                element.classList.add("about-reveal");
            } else {
                element.classList.add("about-reveal");
            }

        });

    });


    /* =====================================================
       INTERSECTION OBSERVER
    ===================================================== */

    const revealElements = document.querySelectorAll(".about-reveal");

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("is-visible");

                    observer.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

    }


    /* =====================================================
       STATISTICS COUNTER
    ===================================================== */

    const stats = document.querySelectorAll(".stat-item h3");

    const animateCounter = element => {

        if (element.dataset.animated === "true") return;

        element.dataset.animated = "true";

        const originalText = element.textContent.trim();

        const number = parseFloat(originalText.replace(/[^\d.]/g, ""));

        const suffix = originalText.replace(/[\d.]/g, "");

        if (isNaN(number)) return;

        const duration = 1800;
        const startTime = performance.now();

        function updateCounter(currentTime) {

            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const eased = 1 - Math.pow(1 - progress, 4);

            const current = Math.floor(number * eased);

            element.innerHTML = current.toLocaleString("en-IN") +
                `<span>${suffix}</span>`;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }

        }

        requestAnimationFrame(updateCounter);

    };

    if ("IntersectionObserver" in window) {

        const counterObserver = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    animateCounter(entry.target);

                    observer.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.5
        });

        stats.forEach(stat => {
            counterObserver.observe(stat);
        });

    } else {

        stats.forEach(animateCounter);

    }


    /* =====================================================
       SMOOTH INTERNAL NAVIGATION
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header = document.querySelector("#mainHeader");

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    updateHeader();


    /* =====================================================
       FAQ — ONLY ONE OPEN AT A TIME
    ===================================================== */

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        item.addEventListener("toggle", () => {

            if (!item.open) return;

            faqItems.forEach(otherItem => {

                if (otherItem !== item) {
                    otherItem.open = false;
                }

            });

        });

    });


    /* =====================================================
       IMAGE LOAD FALLBACK
    ===================================================== */

    document.querySelectorAll(".about-hero img, .about-intro img, .about-team img, .about-categories img, .about-promise img, .about-cta img").forEach(img => {

        img.addEventListener("error", () => {

            img.classList.add("image-error");

        });

    });

});









/* =========================================
   TRAVORA PACKAGES PAGE
   CAROUSEL + AUTOPLAY + SCROLL REVEAL
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       PACKAGE HERO CAROUSEL
    ===================================== */

    const carousel = document.querySelector("#packageCarousel");
    const track = document.querySelector("#packageTrack");

    if (carousel && track) {

        const slides = Array.from(
            track.querySelectorAll(".package-slide")
        );

        const prevButton = document.querySelector("#packagePrev");
        const nextButton = document.querySelector("#packageNext");
        const pagination = document.querySelector("#packagePagination");

        let currentIndex = 0;
        let autoplay = null;

        const totalSlides = slides.length;

        const getGap = () => {
            return parseFloat(
                window.getComputedStyle(track).gap
            ) || 0;
        };

        const getSlideWidth = () => {
            return slides[0].getBoundingClientRect().width;
        };

        function createPagination() {

            if (!pagination) return;

            pagination.innerHTML = "";

            slides.forEach((slide, index) => {

                const dot = document.createElement("button");

                dot.className = "carousel-dot";

                dot.type = "button";

                dot.setAttribute(
                    "aria-label",
                    `Go to slide ${index + 1}`
                );

                dot.addEventListener("click", () => {
                    goToSlide(index);
                    restartAutoplay();
                });

                pagination.appendChild(dot);

            });

        }

        function updateCarousel() {

            if (!slides.length) return;

            const slideWidth = getSlideWidth();
            const gap = getGap();

            const carouselWidth = carousel.clientWidth;

            const centerOffset =
                (carouselWidth - slideWidth) / 2;

            const translateX =
                currentIndex * (slideWidth + gap) - centerOffset;

            track.style.transform =
                `translateX(-${translateX}px)`;

            slides.forEach((slide, index) => {

                slide.classList.toggle(
                    "active",
                    index === currentIndex
                );

            });

            if (pagination) {

                const dots = pagination.querySelectorAll(".carousel-dot");

                dots.forEach((dot, index) => {

                    dot.classList.toggle(
                        "active",
                        index === currentIndex
                    );

                });

            }

        }

        function goToSlide(index) {

            currentIndex =
                (index + totalSlides) % totalSlides;

            updateCarousel();

        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function previousSlide() {
            goToSlide(currentIndex - 1);
        }

        function startAutoplay() {

            stopAutoplay();

            if (totalSlides <= 1) return;

            autoplay = setInterval(() => {
                nextSlide();
            }, 4000);

        }

        function stopAutoplay() {

            if (autoplay) {
                clearInterval(autoplay);
                autoplay = null;
            }

        }

        function restartAutoplay() {
            startAutoplay();
        }

        if (nextButton) {

            nextButton.addEventListener("click", () => {

                nextSlide();
                restartAutoplay();

            });

        }

        if (prevButton) {

            prevButton.addEventListener("click", () => {

                previousSlide();
                restartAutoplay();

            });

        }

        /* Pause on hover */

        carousel.addEventListener("mouseenter", stopAutoplay);

        carousel.addEventListener("mouseleave", startAutoplay);

        /* Keyboard navigation */

        carousel.addEventListener("keydown", (event) => {

            if (event.key === "ArrowRight") {
                nextSlide();
                restartAutoplay();
            }

            if (event.key === "ArrowLeft") {
                previousSlide();
                restartAutoplay();
            }

        });

        /* Touch swipe */

        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener("touchstart", (event) => {

            touchStartX = event.changedTouches[0].screenX;

            stopAutoplay();

        }, { passive: true });

        carousel.addEventListener("touchend", (event) => {

            touchEndX = event.changedTouches[0].screenX;

            const difference = touchStartX - touchEndX;

            if (Math.abs(difference) > 50) {

                if (difference > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }

            }

            startAutoplay();

        }, { passive: true });

        /* Resize */

        let resizeTimer;

        window.addEventListener("resize", () => {

            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(() => {
                updateCarousel();
            }, 150);

        });

        /* Initialize */

        createPagination();

        updateCarousel();

        startAutoplay();

    }


    /* =====================================
       SCROLL REVEAL ANIMATION
    ===================================== */

    const revealElements = document.querySelectorAll(
        ".section-heading, " +
        ".destination-card, " +
        ".trending-card, " +
        ".hidden-gem-card, " +
        ".seasonal-card, " +
        ".travel-style-card, " +
        ".featured-package-card, " +
        ".experience-card, " +
        ".world-gallery img, " +
        ".inspiration-card, " +
        ".journey-moments-content"
    );

    revealElements.forEach((element) => {
        element.classList.add("reveal");
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealElements.forEach((element) => {

        revealObserver.observe(element);

    });


    /* =====================================
       STAGGERED CARD ANIMATIONS
    ===================================== */

    const cardGroups = [
        ".destination-grid",
        ".trending-grid",
        ".hidden-gems-grid",
        ".seasonal-grid",
        ".travel-style-grid",
        ".featured-package-grid",
        ".experience-grid",
        ".inspiration-grid"
    ];

    cardGroups.forEach((selector) => {

        document.querySelectorAll(selector).forEach((group) => {

            const cards = group.children;

            Array.from(cards).forEach((card, index) => {

                card.style.transitionDelay =
                    `${(index % 4) * 100}ms`;

            });

        });

    });


    /* =====================================
       IMAGE LOADING EFFECT
    ===================================== */

    const images = document.querySelectorAll(
        ".package-slide img, " +
        ".destination-card img, " +
        ".trending-card img, " +
        ".hidden-gem-card img, " +
        ".seasonal-card img, " +
        ".travel-style-card img, " +
        ".featured-package-card img, " +
        ".experience-card img, " +
        ".world-gallery img, " +
        ".inspiration-card img"
    );

    images.forEach((img) => {

        img.addEventListener("load", () => {
            img.classList.add("image-loaded");
        });

        if (img.complete && img.naturalWidth > 0) {
            img.classList.add("image-loaded");
        }

    });


    /* =====================================
       SMOOTH ANCHOR SCROLL
    ===================================== */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

});













/* =========================================
   TRAVORA — PACKAGES PAGE JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       01. HERO CAROUSEL
    ===================================== */

    const carousel = document.getElementById("packageCarousel");
    const track = document.getElementById("packageTrack");

    if (carousel && track) {

        const slides = Array.from(
            track.querySelectorAll(".package-slide")
        );

        const prevBtn = document.getElementById("packagePrev");
        const nextBtn = document.getElementById("packageNext");
        const pagination = document.getElementById("packagePagination");

        let currentIndex = 0;
        let autoplayTimer = null;
        let resizeTimer = null;

        const totalSlides = slides.length;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        /* CREATE DOTS */

        function createDots() {

            if (!pagination) return;

            pagination.innerHTML = "";

            slides.forEach((slide, index) => {

                const dot = document.createElement("button");

                dot.type = "button";
                dot.className = "carousel-dot";

                dot.setAttribute(
                    "aria-label",
                    `Show destination ${index + 1}`
                );

                dot.addEventListener("click", () => {

                    goToSlide(index);
                    restartAutoplay();

                });

                pagination.appendChild(dot);

            });

        }

        /* UPDATE SLIDER */

        function updateCarousel() {

            if (!slides.length) return;

            const slideWidth =
                slides[0].getBoundingClientRect().width;

            const styles = window.getComputedStyle(track);

            const gap = parseFloat(styles.gap) || 0;

            const carouselWidth = carousel.clientWidth;

            const centerOffset =
                (carouselWidth - slideWidth) / 2;

            const translateValue =
                currentIndex * (slideWidth + gap) - centerOffset;

            track.style.transform =
                `translate3d(${-translateValue}px, 0, 0)`;

            slides.forEach((slide, index) => {

                const isActive = index === currentIndex;

                slide.classList.toggle("active", isActive);

                slide.setAttribute(
                    "aria-hidden",
                    String(!isActive)
                );

            });

            const dots = pagination
                ? pagination.querySelectorAll(".carousel-dot")
                : [];

            dots.forEach((dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentIndex
                );

                dot.setAttribute(
                    "aria-current",
                    index === currentIndex ? "true" : "false"
                );

            });

        }

        /* GO TO SLIDE */

        function goToSlide(index) {

            currentIndex =
                (index + totalSlides) % totalSlides;

            updateCarousel();

        }

        /* NEXT */

        function nextSlide() {

            goToSlide(currentIndex + 1);

        }

        /* PREVIOUS */

        function previousSlide() {

            goToSlide(currentIndex - 1);

        }

        /* AUTOPLAY */

        function startAutoplay() {

            stopAutoplay();

            if (reducedMotion || totalSlides <= 1) return;

            autoplayTimer = setInterval(() => {

                nextSlide();

            }, 4500);

        }

        function stopAutoplay() {

            if (autoplayTimer !== null) {

                clearInterval(autoplayTimer);

                autoplayTimer = null;

            }

        }

        function restartAutoplay() {

            startAutoplay();

        }

        /* BUTTON EVENTS */

        if (nextBtn) {

            nextBtn.addEventListener("click", () => {

                nextSlide();

                restartAutoplay();

            });

        }

        if (prevBtn) {

            prevBtn.addEventListener("click", () => {

                previousSlide();

                restartAutoplay();

            });

        }

        /* PAUSE ON HOVER */

        carousel.addEventListener("mouseenter", stopAutoplay);

        carousel.addEventListener("mouseleave", startAutoplay);

        carousel.addEventListener("focusin", stopAutoplay);

        carousel.addEventListener("focusout", startAutoplay);

        /* TOUCH SWIPE */

        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener("touchstart", (event) => {

            touchStartX = event.changedTouches[0].screenX;

            stopAutoplay();

        }, { passive: true });

        carousel.addEventListener("touchend", (event) => {

            touchEndX = event.changedTouches[0].screenX;

            const difference = touchStartX - touchEndX;

            if (Math.abs(difference) > 45) {

                if (difference > 0) {

                    nextSlide();

                } else {

                    previousSlide();

                }

            }

            startAutoplay();

        }, { passive: true });

        /* KEYBOARD */

        carousel.addEventListener("keydown", (event) => {

            if (event.key === "ArrowRight") {

                nextSlide();
                restartAutoplay();

            }

            if (event.key === "ArrowLeft") {

                previousSlide();
                restartAutoplay();

            }

        });

        /* RESIZE */

        window.addEventListener("resize", () => {

            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(() => {

                updateCarousel();

            }, 150);

        });

        /* INITIALIZE */

        createDots();

        updateCarousel();

        startAutoplay();

    }


    /* =====================================
       02. SCROLL REVEAL
    ===================================== */

    const revealSelectors = [

        ".package-section-heading",
        ".trending-heading",
        ".hidden-gems-heading",
        ".experience-heading",
        ".world-highlights-heading",

        ".destination-card",
        ".travel-style-card",
        ".trending-card",
        ".hidden-gem-card",
        ".seasonal-card",
        ".experience-card",
        ".world-gallery-item",
        ".featured-package-card",
        ".inspiration-card",

        ".journey-moments-content",
        ".packages-cta-content"

    ];

    const revealElements = document.querySelectorAll(
        revealSelectors.join(",")
    );

    revealElements.forEach((element) => {

        element.classList.add("reveal");

    });

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element) => {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach((element) => {

            element.classList.add("visible");

        });

    }


    /* =====================================
       03. STAGGERED CARD ANIMATION
    ===================================== */

    const staggerGroups = [

        ".destination-grid",
        ".travel-style-grid",
        ".trending-grid",
        ".hidden-gems-grid",
        ".seasonal-grid",
        ".experience-grid",
        ".featured-package-grid",
        ".inspiration-grid"

    ];

    staggerGroups.forEach((selector) => {

        document.querySelectorAll(selector).forEach((group) => {

            Array.from(group.children).forEach((card, index) => {

                card.style.setProperty(
                    "--delay",
                    `${(index % 4) * 100}ms`
                );

            });

        });

    });


    /* =====================================
       04. IMAGE LOAD HANDLING
    ===================================== */

    const images = document.querySelectorAll(
        ".packages-hero img, " +
        ".destination-card img, " +
        ".travel-style-card img, " +
        ".trending-card img, " +
        ".hidden-gem-card img, " +
        ".seasonal-card img, " +
        ".experience-card img, " +
        ".world-gallery-item img, " +
        ".featured-package-card img, " +
        ".journey-moments img, " +
        ".inspiration-card img, " +
        ".packages-cta img"
    );

    images.forEach((img) => {

        if (!img.hasAttribute("loading")) {

            img.loading = "lazy";

        }

        img.addEventListener("error", () => {

            img.classList.add("image-error");

            console.warn(
                "TRAVORA image not found:",
                img.getAttribute("src")
            );

        });

    });


    /* =====================================
       05. SMOOTH ANCHOR SCROLL
    ===================================== */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({

                    behavior: reducedMotion ? "auto" : "smooth",

                    block: "start"

                });

            }

        });

    });


    /* =====================================
       06. UPDATE HERO COUNTER
    ===================================== */

    const heroCounter = document.querySelector(
        ".packages-hero-bottom > span:first-child"
    );

    if (heroCounter && track) {

        const slides = track.querySelectorAll(".package-slide");

        const updateCounter = () => {

            const activeIndex = Array.from(slides).findIndex(
                slide => slide.classList.contains("active")
            );

            if (activeIndex !== -1) {

                const current = String(activeIndex + 1).padStart(2, "0");

                const total = String(slides.length).padStart(2, "0");

                heroCounter.textContent = `${current} — ${total}`;

            }

        };

        const counterObserver = new MutationObserver(updateCounter);

        slides.forEach((slide) => {

            counterObserver.observe(slide, {

                attributes: true,
                attributeFilter: ["class"]

            });

        });

        updateCounter();

    }


    console.log("TRAVORA Packages Page Loaded Successfully.");

});




/* =========================================
   TRAVORA EXPERIENCES PAGE JS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* HERO CAROUSEL */

    const imageSlider = document.getElementById("experienceImages");
    const contentSlider = document.getElementById("experienceContent");

    const images = imageSlider
        ? [...imageSlider.querySelectorAll(".experience-image-item")]
        : [];

    const contents = contentSlider
        ? [...contentSlider.querySelectorAll(".experience-content-item")]
        : [];

    const prevBtn = document.getElementById("experiencePrev");
    const nextBtn = document.getElementById("experienceNext");

    const progress = document.getElementById("experienceProgress");
    const currentNumber = document.getElementById("experienceCurrent");
    const caption = document.getElementById("experienceCaption");

    const captions = [
        "Explore The Extraordinary",
        "Find Your Wild Side",
        "Moments Worth Living",
        "Into The Unknown",
        "Travel With Purpose"
    ];

    const totalSlides = Math.min(images.length, contents.length);

    let currentSlide = 0;
    let autoplayTimer = null;

    const autoplayDelay = 5000;

    let touchStartX = 0;
    let touchEndX = 0;


    function showSlide(index) {

        if (!totalSlides) return;

        currentSlide = (index + totalSlides) % totalSlides;

        images.forEach((image, i) => {
            image.classList.toggle("active", i === currentSlide);
        });

        contents.forEach((content, i) => {
            content.classList.toggle("active", i === currentSlide);
        });

        const slideNumber = String(currentSlide + 1).padStart(2, "0");

        if (currentNumber) {
            currentNumber.textContent = slideNumber;
        }

        if (caption) {
            caption.textContent = captions[currentSlide] || "Explore The Extraordinary";
        }

        if (progress) {
            progress.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
        }
    }


    function nextSlide() {
        showSlide(currentSlide + 1);
    }


    function previousSlide() {
        showSlide(currentSlide - 1);
    }


    function startAutoplay() {

        stopAutoplay();

        if (totalSlides <= 1) return;

        autoplayTimer = setInterval(() => {
            if (!document.hidden) {
                nextSlide();
            }
        }, autoplayDelay);
    }


    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }


    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }


    /* BUTTON EVENTS */

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextSlide();
            restartAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            previousSlide();
            restartAutoplay();
        });
    }


    /* PAUSE ON HOVER */

    const hero = document.querySelector(".experience-hero");

    if (hero) {

        hero.addEventListener("mouseenter", stopAutoplay);

        hero.addEventListener("mouseleave", startAutoplay);

        hero.addEventListener("focusin", stopAutoplay);

        hero.addEventListener("focusout", startAutoplay);
    }


    /* MOBILE TOUCH SWIPE */

    if (imageSlider) {

        imageSlider.addEventListener("touchstart", (event) => {

            touchStartX = event.changedTouches[0].screenX;

        }, { passive: true });


        imageSlider.addEventListener("touchend", (event) => {

            touchEndX = event.changedTouches[0].screenX;

            const difference = touchStartX - touchEndX;

            if (Math.abs(difference) > 50) {

                if (difference > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }

                restartAutoplay();
            }

        }, { passive: true });

    }


    /* TAB VISIBILITY */

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }

    });


    /* INITIALIZE */

    if (totalSlides > 0) {
        showSlide(0);
        startAutoplay();
    }


    /* =====================================
       SCROLL REVEAL
    ===================================== */

    const revealElements = document.querySelectorAll(
        ".experience-intro, " +
        ".experience-section-heading, " +
        ".experience-category-card, " +
        ".signature-card, " +
        ".experience-banner-content, " +
        ".more-experience-card, " +
        ".experience-final-content, " +
        ".experience-final-image"
    );

    revealElements.forEach((element, index) => {

        element.classList.add("exp-reveal");

        element.style.transitionDelay = `${(index % 4) * 100}ms`;

    });


    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("exp-visible");

                    observer.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });


        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("exp-visible");
        });

    }


    /* =====================================
       IMAGE LOAD FALLBACK
    ===================================== */

    document.querySelectorAll("main img").forEach(img => {

        img.addEventListener("error", () => {

            console.warn("Image not found:", img.getAttribute("src"));

        });

    });

});








/* =====================================================
   TRAVORA CONTACT PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* =========================================
       CONTACT FORM VALIDATION
    ========================================= */

    const contactForm = document.getElementById("contactForm");

    const contactSuccess = document.getElementById("contactSuccess");

    const consent = document.getElementById("contactConsent");

    const consentError = document.querySelector(".consent-error");


    if (contactForm) {

        const nameInput = document.getElementById("contactName");

        const emailInput = document.getElementById("contactEmail");

        const phoneInput = document.getElementById("contactPhone");

        const messageInput = document.getElementById("contactMessage");

        const dateInput = document.getElementById("travelDate");

        const submitButton = contactForm.querySelector(".contact-submit-btn");


        /* ERROR HELPER */

        function showError(input, message) {

            const group = input.closest(".form-group");

            if (!group) return;

            const error = group.querySelector(".form-error");

            input.classList.add("invalid");

            if (error) {
                error.textContent = message;
            }

        }


        /* CLEAR ERROR */

        function clearError(input) {

            const group = input.closest(".form-group");

            if (!group) return;

            const error = group.querySelector(".form-error");

            input.classList.remove("invalid");

            if (error) {
                error.textContent = "";
            }

        }


        /* VALIDATE NAME */

        function validateName() {

            const value = nameInput.value.trim();

            const namePattern = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;

            if (!value) {

                showError(nameInput, "Please enter your name.");

                return false;

            }

            if (!namePattern.test(value)) {

                showError(nameInput, "Enter a valid name using letters only.");

                return false;

            }

            clearError(nameInput);

            return true;

        }


        /* VALIDATE EMAIL */

        function validateEmail() {

            const value = emailInput.value.trim();

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

            if (!value) {

                showError(emailInput, "Please enter your email address.");

                return false;

            }

            if (!emailPattern.test(value)) {

                showError(emailInput, "Please enter a valid email address.");

                return false;

            }

            clearError(emailInput);

            return true;

        }


        /* VALIDATE PHONE */

        function validatePhone() {

            const value = phoneInput.value.trim();

            const digits = value.replace(/\D/g, "");

            const phonePattern = /^\+?[0-9\s()-]+$/;

            if (!value) {

                showError(phoneInput, "Please enter your phone number.");

                return false;

            }

            if (!phonePattern.test(value) || digits.length < 10 || digits.length > 15) {

                showError(phoneInput, "Enter a valid phone number.");

                return false;

            }

            clearError(phoneInput);

            return true;

        }


        /* VALIDATE MESSAGE */

        function validateMessage() {

            const value = messageInput.value.trim();

            if (!value) {

                showError(messageInput, "Please tell us about your trip.");

                return false;

            }

            if (value.length < 10) {

                showError(messageInput, "Please enter at least 10 characters.");

                return false;

            }

            clearError(messageInput);

            return true;

        }


        /* DATE VALIDATION */

        if (dateInput) {

            const today = new Date();

            const localToday = new Date(
                today.getTime() - today.getTimezoneOffset() * 60000
            ).toISOString().split("T")[0];

            dateInput.min = localToday;

        }


        /* LIVE VALIDATION */

        nameInput.addEventListener("input", validateName);

        emailInput.addEventListener("input", validateEmail);

        phoneInput.addEventListener("input", validatePhone);

        messageInput.addEventListener("input", validateMessage);


        /* CONSENT */

        if (consent) {

            consent.addEventListener("change", function () {

                if (consent.checked) {

                    consentError.textContent = "";

                }

            });

        }


        /* FORM SUBMIT */

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const isNameValid = validateName();

            const isEmailValid = validateEmail();

            const isPhoneValid = validatePhone();

            const isMessageValid = validateMessage();

            const isConsentValid = consent.checked;


            if (!isConsentValid) {

                consentError.textContent =
                    "Please agree before submitting the enquiry.";

            } else {

                consentError.textContent = "";

            }


            const isFormValid =
                isNameValid &&
                isEmailValid &&
                isPhoneValid &&
                isMessageValid &&
                isConsentValid;


            if (!isFormValid) {

                const firstInvalid = contactForm.querySelector(".invalid");

                if (firstInvalid) {
                    firstInvalid.focus();

                    firstInvalid.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }

                return;

            }


            /* FRONTEND SUCCESS ONLY */

            submitButton.disabled = true;

            submitButton.querySelector("span").textContent = "Submitted Successfully";

            if (contactSuccess) {

                contactSuccess.classList.add("show");

                contactSuccess.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            }

            contactForm.reset();

            submitButton.disabled = false;

            submitButton.querySelector("span").textContent = "Send Enquiry";

        });

    }



    /* =========================================
       FAQ ACCORDION
    ========================================= */

    const faqItems = document.querySelectorAll(".faq-item");


    faqItems.forEach(item => {

        const button = item.querySelector(".faq-question");

        if (!button) return;

        button.addEventListener("click", function () {

            const isActive = item.classList.contains("active");


            /* CLOSE ALL */

            faqItems.forEach(faq => {

                faq.classList.remove("active");

                const faqButton = faq.querySelector(".faq-question");

                if (faqButton) {
                    faqButton.setAttribute("aria-expanded", "false");
                }

            });


            /* OPEN SELECTED */

            if (!isActive) {

                item.classList.add("active");

                button.setAttribute("aria-expanded", "true");

            }

        });

    });



    /* =========================================
       SCROLL REVEAL
    ========================================= */

    const revealElements = document.querySelectorAll(

        ".contact-intro-left, " +
        ".contact-intro-right, " +
        ".contact-info-heading, " +
        ".contact-detail-card, " +
        ".contact-social, " +
        ".contact-form-wrapper, " +
        ".contact-highlight-card, " +
        ".contact-assistance-heading, " +
        ".assistance-card, " +
        ".contact-faq-heading, " +
        ".faq-item, " +
        ".contact-final-content"

    );


    revealElements.forEach((element, index) => {

        element.classList.add("contact-reveal");

        element.style.transitionDelay = `${(index % 4) * 90}ms`;

    });


    if ("IntersectionObserver" in window) {

        const contactObserver = new IntersectionObserver(

            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("contact-visible");

                        observer.unobserve(entry.target);

                    }

                });

            },

            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }

        );


        revealElements.forEach(element => {

            contactObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("contact-visible");

        });

    }



    /* =========================================
       IMAGE ERROR CHECK
    ========================================= */

    document.querySelectorAll("main img").forEach(img => {

        img.addEventListener("error", function () {

            console.warn("Image not found:", this.src);

        });

    });


});


/* =====================================================
   3D LOGIN DOOR ANIMATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const doorScene = document.getElementById("loginDoorScene");

    if (!doorScene) return;

    const leftDoor = doorScene.querySelector(".login-door-left");
    const rightDoor = doorScene.querySelector(".login-door-right");

    let doorOpened = false;

    function openLoginDoor() {

        if (doorOpened) return;

        doorOpened = true;

        doorScene.classList.add("door-opening");

        setTimeout(() => {

            doorScene.classList.add("door-opened");

        }, 1200);

        setTimeout(() => {

            doorScene.classList.add("door-hidden");

        }, 2200);

    }


    /* AUTOMATIC DOOR OPEN */

    setTimeout(() => {

        openLoginDoor();

    }, 800);


    /* REPLAY ON CLICK */

    doorScene.addEventListener("click", () => {

        if (doorOpened) return;

        openLoginDoor();

    });

});