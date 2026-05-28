// ==========================================
// COUNTRY DAIRY WEBSITE JAVASCRIPT
// ==========================================



// ==========================================
// MOBILE MENU TOGGLE
// ==========================================

const mobileMenuButton = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");

if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        mobileMenuButton.classList.toggle("open");
    });
}



// ==========================================
// STICKY HEADER SCROLL EFFECT
// ==========================================

const header = document.querySelector(".main-header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});



// ==========================================
// SMOOTH SCROLLING
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});



// ==========================================
// SCROLL REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll(
    ".journey-card, .experience-card, .timeline-item, .tour-card, .flavor-card"
);

const revealOnScroll = () => {

    const windowHeight = window.innerHeight;

    revealElements.forEach(element => {

        const elementTop = element.getBoundingClientRect().top;

        if (elementTop < windowHeight - 100) {
            element.classList.add("visible");
        }

    });

};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);



// ==========================================
// TIMELINE POPUP INTERACTIONS
// ==========================================

const timelineItems = document.querySelectorAll(".timeline-item");

timelineItems.forEach(item => {

    item.addEventListener("mouseenter", () => {

        item.classList.add("timeline-active");

    });

    item.addEventListener("mouseleave", () => {

        item.classList.remove("timeline-active");

    });

});



// ==========================================
// HERO IMAGE PARALLAX EFFECT
// ==========================================

const heroSection = document.querySelector(".hero-section");

window.addEventListener("scroll", () => {

    const offset = window.pageYOffset;

    if (heroSection) {
        heroSection.style.backgroundPositionY = offset * 0.5 + "px";
    }

});



// ==========================================
// ICE CREAM FLAVOR RANDOMIZER
// ==========================================

const flavors = [
    "Michigan Cherry",
    "Cookie Dough",
    "Butter Pecan",
    "Mint Chocolate Chip",
    "Blueberry Cheesecake",
    "Salted Caramel",
    "Mackinac Island Fudge",
    "Vanilla Bean",
    "Strawberry Shortcake"
];

const flavorButton = document.querySelector(".flavor-generator-btn");
const flavorResult = document.querySelector(".flavor-result");

if (flavorButton) {

    flavorButton.addEventListener("click", () => {

        const randomFlavor =
            flavors[Math.floor(Math.random() * flavors.length)];

        flavorResult.textContent = randomFlavor;

        flavorResult.classList.add("spin-animation");

        setTimeout(() => {
            flavorResult.classList.remove("spin-animation");
        }, 600);

    });

}



// ==========================================
// EVENT COUNTDOWN TIMER
// ==========================================

const countdownElement = document.querySelector(".countdown");

if (countdownElement) {

    // EXAMPLE DATE
    const eventDate = new Date("July 15, 2026 10:00:00").getTime();

    const updateCountdown = () => {

        const now = new Date().getTime();

        const distance = eventDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));

        const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        );

        const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) /
            (1000 * 60)
        );

        if (distance > 0) {

            countdownElement.innerHTML = `
                <div class="countdown-box">
                    <span>${days}</span>
                    <small>Days</small>
                </div>

                <div class="countdown-box">
                    <span>${hours}</span>
                    <small>Hours</small>
                </div>

                <div class="countdown-box">
                    <span>${minutes}</span>
                    <small>Minutes</small>
                </div>
            `;

        } else {

            countdownElement.innerHTML = `
                <h3>The Event Has Started!</h3>
            `;

        }

    };

    updateCountdown();

    setInterval(updateCountdown, 60000);

}



// ==========================================
// IMAGE HOVER ZOOM EFFECT
// ==========================================

const experienceImages = document.querySelectorAll(".experience-card img");

experienceImages.forEach(image => {

    image.addEventListener("mousemove", (e) => {

        const bounds = image.getBoundingClientRect();

        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        image.style.transformOrigin = `${x}px ${y}px`;

    });

});



// ==========================================
// FLOATING BUTTON APPEARANCE
// ==========================================

const floatingButton = document.querySelector(".floating-cta");

window.addEventListener("scroll", () => {

    if (!floatingButton) return;

    if (window.scrollY > 500) {
        floatingButton.classList.add("show-floating-btn");
    } else {
        floatingButton.classList.remove("show-floating-btn");
    }

});



// ==========================================
// FAQ ACCORDION
// ==========================================

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        item.classList.toggle("faq-open");

    });

});



// ==========================================
// NAVIGATION ACTIVE LINK ON SCROLL
// ==========================================

const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop;

        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute("id");
        }

    });

    navItems.forEach(link => {

        link.classList.remove("active-link");

        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active-link");
        }

    });

});



// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================

const buttons = document.querySelectorAll(
    ".btn-primary, .btn-secondary, .btn-outline"
);

buttons.forEach(button => {

    button.addEventListener("click", function (e) {

        const ripple = document.createElement("span");

        ripple.classList.add("ripple");

        this.appendChild(ripple);

        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        setTimeout(() => {
            ripple.remove();
        }, 600);

    });

});



// ==========================================
// AUTO-ROTATING SEASONAL HIGHLIGHTS
// ==========================================

const seasonalSlides = document.querySelectorAll(".season-slide");

let currentSlide = 0;

const rotateSlides = () => {

    seasonalSlides.forEach(slide => {
        slide.classList.remove("active-slide");
    });

    currentSlide++;

    if (currentSlide >= seasonalSlides.length) {
        currentSlide = 0;
    }

    if (seasonalSlides[currentSlide]) {
        seasonalSlides[currentSlide].classList.add("active-slide");
    }

};

if (seasonalSlides.length > 0) {

    seasonalSlides[0].classList.add("active-slide");

    setInterval(rotateSlides, 5000);

}



// ==========================================
// NEWSLETTER FORM
// ==========================================

const newsletterForm = document.querySelector(".newsletter-form");

if (newsletterForm) {

    newsletterForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const emailInput = newsletterForm.querySelector("input");

        if (emailInput.value.trim() === "") {

            alert("Please enter your email address.");

            return;

        }

        alert("Thanks for joining the Country Dairy newsletter!");

        newsletterForm.reset();

    });

}



// ==========================================
// LOADING SCREEN FADE OUT
// ==========================================

window.addEventListener("load", () => {

    const loader = document.querySelector(".loading-screen");

    if (loader) {

        loader.classList.add("loader-hidden");

        setTimeout(() => {
            loader.remove();
        }, 1000);

    }

});



// ==========================================
// SIMPLE FARM FACT ROTATOR
// ==========================================

const farmFacts = [
    "Country Dairy has welcomed generations of Michigan families.",
    "Fresh dairy products are made right on the farm.",
    "Farm tours help kids learn where their food comes from.",
    "The farm store serves homemade meals and desserts.",
    "West Michigan gravel roads make Country Dairy a cycling destination."
];

const factText = document.querySelector(".farm-fact-text");

let factIndex = 0;

if (factText) {

    setInterval(() => {

        factIndex++;

        if (factIndex >= farmFacts.length) {
            factIndex = 0;
        }

        factText.style.opacity = 0;

        setTimeout(() => {

            factText.textContent = farmFacts[factIndex];
            factText.style.opacity = 1;

        }, 400);

    }, 5000);

}