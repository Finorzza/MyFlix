import { getYouTubeId, getRandomMatchScore, getRandomDuration, getRandomAgeBadge } from '../utils.js';

export function createCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    if (item.progress) {
        card.classList.add('has-progress');
    }

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = `Movie cover`;

    // keep an internal iframe but we will show a floating overlay iframe
    const iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; encrypted-media";
    iframe.style.display = 'none';

    const videoId = getYouTubeId(item.youtube);

    card.appendChild(iframe);
    card.appendChild(img);

    const ageBadge = getRandomAgeBadge();

    const details = document.createElement('div');
    details.className = 'card-details';
    details.innerHTML = `
        <div class="card-title">${item.title || ''}</div>
        <div class="details-buttons">
            <div class="left-buttons">
                <button class="btn-icon btn-play-icon"><i class="fas fa-play" style="margin-left:2px;"></i></button>
                ${item.progress ? '<button class="btn-icon"><i class="fas fa-check"></i></button>' : '<button class="btn-icon"><i class="fas fa-plus"></i></button>'}
                <button class="btn-icon"><i class="fas fa-thumbs-up"></i></button>
            </div>
            <div class="right-buttons">
                <button class="btn-icon"><i class="fas fa-chevron-down"></i></button>
            </div>
        </div>
        <div class="details-info">
            <span class="match-score">${getRandomMatchScore()}% relevante</span>
            <span class="age-badge ${ageBadge.class}">${ageBadge.text}</span>
            <span class="duration">${getRandomDuration(item.progress)}</span>
            <span class="resolution">FHD</span>
        </div>
        <div class="details-tags">
            <span>Ação</span>
            <span>Super-Herói</span>
            <span>Ficção</span>
        </div>
    `;
    card.appendChild(details);


    if (item.progress) {
        const pbContainer = document.createElement('div');
        pbContainer.className = 'progress-bar-container';
        const pbValue = document.createElement('div');
        pbValue.className = 'progress-value';
        pbValue.style.width = `${item.progress}%`;
        pbContainer.appendChild(pbValue);
        card.appendChild(pbContainer);
    }

    /* Floating overlay approach:
       When hovering a card we create an absolutely positioned overlay
       appended to document.body so it is not clipped by the carousel's
       scroll container. The overlay is removed when the pointer leaves
       both the card and the overlay, or on scroll/resize.
    */
    let playTimeout;
    let overlayEl = null;
    let removeTimeout = null;

    const removeOverlay = () => {
        if (overlayEl) {
            try { overlayEl.remove(); } catch (e) {}
            overlayEl = null;
        }
    };

    const scheduleRemoveOverlay = (delay = 100) => {
        clearTimeout(removeTimeout);
        removeTimeout = setTimeout(() => {
            removeOverlay();
        }, delay);
    };

    card.addEventListener('mouseenter', () => {
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        if (rect.left < 100) {
            card.classList.add('origin-left');
        } else if (rect.right > windowWidth - 100) {
            card.classList.add('origin-right');
        }

        playTimeout = setTimeout(() => {
            if (overlayEl) return;

            const scale = 1.45;
            // do NOT autoplay with sound until user interacts — create src but don't set it
            const videoSrcNoMute = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&loop=1&playlist=${videoId}`;

            overlayEl = document.createElement('div');
            overlayEl.className = 'movie-overlay';

            const overlayCard = document.createElement('div');
            overlayCard.className = 'overlay-card';
            overlayCard.style.width = `${rect.width}px`;
            overlayCard.style.transformOrigin = 'top left';
            overlayCard.style.transform = `scale(${scale})`;

            const overlayMedia = document.createElement('div');
            overlayMedia.className = 'overlay-media';

            const ovIframe = document.createElement('iframe');
            ovIframe.frameBorder = '0';
            ovIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            ovIframe.className = 'overlay-iframe';
            // do not set src yet — wait for user click to enable sound
            ovIframe.dataset.src = videoSrcNoMute;
            overlayMedia.appendChild(ovIframe);

            const ovImg = document.createElement('img');
            ovImg.src = item.img;
            ovImg.alt = item.title || '';
            ovImg.className = 'overlay-img';
            overlayMedia.appendChild(ovImg);

            // play button overlay (user interaction will start playback with sound)
            const overlayPlayBtn = document.createElement('button');
            overlayPlayBtn.className = 'overlay-play-btn';
            overlayPlayBtn.setAttribute('aria-label', 'Tocar trailer');
            overlayPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            overlayMedia.appendChild(overlayPlayBtn);

            overlayPlayBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                if (!ovIframe.src) {
                    ovIframe.src = ovIframe.dataset.src;
                    ovImg.style.opacity = '0';
                    overlayPlayBtn.style.display = 'none';
                }
            });

            const overlayDetails = document.createElement('div');
            overlayDetails.className = 'overlay-details';
            overlayDetails.innerHTML = details.innerHTML;

            overlayCard.appendChild(overlayMedia);
            overlayCard.appendChild(overlayDetails);
            overlayEl.appendChild(overlayCard);
            document.body.appendChild(overlayEl);

            // Position overlay centered around the card (account for scale)
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            const scaledW = rect.width * scale;
            const scaledH = rect.height * scale;
            let left = rect.left + scrollX - (scaledW - rect.width) / 2;
            let top = rect.top + scrollY - (scaledH - rect.height) / 2;

            const minLeft = scrollX + 8;
            const maxLeft = scrollX + window.innerWidth - scaledW - 8;
            left = Math.max(minLeft, Math.min(left, maxLeft));

            const minTop = scrollY + 8;
            const maxTop = scrollY + window.innerHeight - scaledH - 8;
            top = Math.max(minTop, Math.min(top, maxTop));

            overlayEl.style.position = 'absolute';
            overlayEl.style.left = `${left}px`;
            overlayEl.style.top = `${top}px`;
            overlayEl.style.zIndex = '20000';

            overlayEl.addEventListener('mouseenter', () => {
                clearTimeout(removeTimeout);
            });
            overlayEl.addEventListener('mouseleave', () => {
                scheduleRemoveOverlay(80);
            });

            // remove overlay on scroll/resize to avoid misposition
            const onWindowChange = () => removeOverlay();
            window.addEventListener('scroll', onWindowChange, { once: true, passive: true });
            window.addEventListener('resize', onWindowChange, { once: true });
        }, 600);
    });

    card.addEventListener('mouseleave', () => {
        clearTimeout(playTimeout);
        // allow short grace period so the pointer can move into the overlay
        scheduleRemoveOverlay(120);
        card.classList.remove('origin-left');
        card.classList.remove('origin-right');
    });

    // hide overlay when clicking outside
    document.addEventListener('click', (e) => {
        if (overlayEl && !overlayEl.contains(e.target) && !card.contains(e.target)) {
            removeOverlay();
        }
    });

    return card;
}
