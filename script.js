/* -------------------------------
   NAVIGATION + CART + SEARCH
   (kept from your original)
--------------------------------*/
let navigation = document.querySelector('.navigation');
let cartItem = document.querySelector('.cart-items-container');
let searchForm = document.querySelector('.search-form');

document.querySelector('#menu-btn')?.addEventListener("click", () => {
    navigation?.classList.toggle('active');
    cartItem?.classList.remove('active');
    searchForm?.classList.remove('active');
});

document.querySelector('#cart-btn')?.addEventListener("click", () => {
    cartItem?.classList.toggle('active');
    navigation?.classList.remove('active');
    searchForm?.classList.remove('active');
});

document.querySelector('#search-btn')?.addEventListener("click", () => {
    searchForm?.classList.toggle('active');
    navigation?.classList.remove('active');
    cartItem?.classList.remove('active');
});

window.addEventListener("scroll", () => {
    navigation?.classList.remove('active');
    cartItem?.classList.remove('active');
    searchForm?.classList.remove('active');
});


/* -------------------------------
   Add to cart functions (kept)
--------------------------------*/
function addToCart(imageSrc, itemName, price) {
    // ... same as your existing implementation ...
}

/* -------------------------------
   Polished GSAP Horizontal Scroll
--------------------------------*/
gsap.registerPlugin(ScrollTrigger);

(function setupHorizontalScroll() {
    const containerSelector = ".cards-container";
    const wrapperSelector = ".horizontal-section";

    // safe guards
    const cardsContainer = document.querySelector(containerSelector);
    const wrapper = document.querySelector(wrapperSelector);
    if (!cardsContainer || !wrapper) {
        // Nothing to do
        return;
    }

    // Wait for all images inside the cards to load
    const imgs = Array.from(cardsContainer.querySelectorAll("img"));
    const waitImages = imgs.length
        ? Promise.all(imgs.map(img => {
            if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
            return new Promise(resolve => {
                img.addEventListener("load", resolve);
                img.addEventListener("error", resolve);
            });
        }))
        : Promise.resolve();

    // Initialize and create ScrollTrigger after images loaded
    waitImages.then(init);

    // Re-initialize on resize/orientation change
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            killScrollTrigger();
            init();
            ScrollTrigger.refresh();
        }, 120);
    });

    // Helper to kill previous ScrollTriggers created by this init
    function killScrollTrigger() {
        ScrollTrigger.getAll().forEach(st => {
            const trig = st.trigger;
            // kill triggers that reference the wrapper element or match the wrapper selector
            if (trig === wrapper || (trig && trig.matches && trig.matches(wrapperSelector))) {
                try { st.kill(true); } catch (e) {}
            }
        });
        // remove any previously-registered refresh handlers and ticker callbacks
        try { ScrollTrigger.removeEventListener && ScrollTrigger.removeEventListener("refreshInit", updateSpotlight); } catch (e) {}
        try { gsap.ticker.remove && gsap.ticker.remove(updateSpotlight); } catch (e) {}
        // also kill any tweens applied to container
        try { gsap.killTweensOf(cardsContainer); } catch (e) {}
    }

    function init() {
        // ensure we have fresh references
        const cards = Array.from(cardsContainer.querySelectorAll(".sample-card"));
        if (!cards.length) return;

        // Measure and compute exact translateX values to center first and last cards
        const firstCard = cards[0];
        const lastCard = cards[cards.length - 1];
        const viewportW = window.innerWidth;
        const centerX = viewportW / 2;

        // bounding rect used to calculate transforms relative to viewport
        const containerRect = cardsContainer.getBoundingClientRect();

        // compute translateX (t) so that a given card's center aligns with viewport center
        const computeTForCard = (card) => {
            const cardOffsetLeft = card.offsetLeft;
            const cardCenterOffset = cardOffsetLeft + (card.offsetWidth / 2);
            // t such that containerRect.left + t + cardCenterOffset === centerX
            return centerX - containerRect.left - cardCenterOffset;
        };

        const tInitial = computeTForCard(firstCard);
        const tFinal = computeTForCard(lastCard);
        const moveDistance = Math.abs(tFinal - tInitial);

        // Set initial position so the first card is centered
        gsap.set(cardsContainer, { x: tInitial });

        // Create the pinned horizontal scroll animation
        const animation = gsap.to(cardsContainer, {
            x: tFinal,
            ease: "none",
            // duration is irrelevant with scrub, but it's required by gsap internals
            duration: 1,
            scrollTrigger: {
                trigger: wrapper,
                start: `top top`,
                end: () => `+=${Math.max(moveDistance, 0)}`, // scroll distance equals exact translate distance
                scrub: 0.6,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefresh: () => {
                    // re-center if needed
                    // recompute positions on refresh to avoid visual jumps
                    const newContainerRect = cardsContainer.getBoundingClientRect();
                    const recompute = (card) => centerX - newContainerRect.left - (card.offsetLeft + card.offsetWidth / 2);
                    const newTInit = recompute(firstCard);
                    gsap.set(cardsContainer, { x: newTInit });
                },
            }
        });

        // Add snapping to nearest card based on progress
        // Add snapping to nearest card based on exact card centers.
        // Compute normalized snap points [0..1] for each card center relative to tInitial..tFinal
        let snapPoints = [0];
        if (Math.abs(tFinal - tInitial) > 1) {
            snapPoints = cards.map(card => {
                const t = computeTForCard(card);
                return (t - tInitial) / (tFinal - tInitial);
            });
        }

        ScrollTrigger.create({
            trigger: wrapper,
            start: "top top",
            end: () => `+=${Math.max(moveDistance, 0)}`,
            scrub: 0.6,
            snap: {
                snapTo: snapPoints,
                duration: 0.4,
                ease: "power2.out"
            }
        });

        // Spotlight effect: scale the centered card slightly
        // We'll update scaling on each ScrollTrigger tick. The updateSpotlight function
        // is defined outside so we can remove it on re-initialization to avoid duplicates.
        const scaleRange = { min: 0.9, max: 1.06 };

        // Ensure we've removed any previously-registered callbacks before adding new ones
        try { ScrollTrigger.removeEventListener && ScrollTrigger.removeEventListener("refreshInit", updateSpotlight); } catch (e) {}
        try { gsap.ticker.remove && gsap.ticker.remove(updateSpotlight); } catch (e) {}

        // Define updateSpotlight to compute current cards each tick (robust after resize)
        updateSpotlight = () => {
            const cardsNow = Array.from(cardsContainer.querySelectorAll('.sample-card'));
            const centerX = window.innerWidth / 2;
            cardsNow.forEach(card => {
                const r = card.getBoundingClientRect();
                const d = Math.abs((r.left + r.width / 2) - centerX);
                const norm = Math.min(d / (window.innerWidth / 2), 1);
                const scale = scaleRange.max - (norm * (scaleRange.max - scaleRange.min));
                card.style.transform = `scale(${scale})`;
                card.style.zIndex = (scale > 1.0) ? "3" : "1";
                card.style.filter = `saturate(${1 + (1 - norm) * 0.15})`;
            });
        };

        // update on requestAnimationFrame
        ScrollTrigger.addEventListener("refreshInit", updateSpotlight);
        gsap.ticker.add(updateSpotlight);
        updateSpotlight();

        // Refresh to ensure ScrollTrigger uses up-to-date measurements
        ScrollTrigger.refresh();
    }
})();
