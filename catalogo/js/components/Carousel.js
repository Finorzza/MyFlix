import { createCard } from "./Card.js";

export function createCarousel(category) {
  const section = document.createElement("div");
  section.className = "slider-section";

  // Header for Title and Indicators
  const header = document.createElement("div");
  header.className = "slider-header";

  const title = document.createElement("h2");
  title.className = "slider-title";
  title.innerText = category.title;

  const indicators = document.createElement("div");
  indicators.className = "slider-indicators";

  header.appendChild(title);
  header.appendChild(indicators);
  section.appendChild(header);

  const row = document.createElement("div");
  row.className = "movie-row";

  // create the original set of cards
  category.items.forEach((item) => {
    row.appendChild(createCard(item));
  });

  // For infinite scroll: prepend one copy and append one copy of the whole set
  const items = category.items || [];
  // prepend (in reverse so order is correct)
  for (let i = items.length - 1; i >= 0; i--) {
    row.insertBefore(createCard(items[i]), row.firstChild);
  }
  // append
  items.forEach((item) => row.appendChild(createCard(item)));

  section.appendChild(row);

  // Infinite scroll setup: position the scroll to the middle set and
  // when the user scrolls near the edges jump back to the middle seamlessly.
  let singleSetWidth = 0;

  const calcWidths = () => {
    // After layout, the total scrollWidth contains three sets, so divide by 3
    singleSetWidth = row.scrollWidth / 3 || 0;
  };

  const instantScrollTo = (x) => {
    const prev = row.style.scrollBehavior;
    row.style.scrollBehavior = "auto";
    row.scrollLeft = x;
    row.style.scrollBehavior = prev || "";
  };

  // initialize after layout
  requestAnimationFrame(() => {
    calcWidths();
    if (singleSetWidth) instantScrollTo(singleSetWidth);
  });

  let ticking = false;
  row.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (!singleSetWidth) calcWidths();
      if (singleSetWidth) {
        if (row.scrollLeft <= 1) {
          instantScrollTo(row.scrollLeft + singleSetWidth);
        } else if (row.scrollLeft >= singleSetWidth * 2 - 1) {
          instantScrollTo(row.scrollLeft - singleSetWidth);
        }
      }
      ticking = false;
    });
  });

  // map vertical wheel to horizontal scroll for nicer UX
  row.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        row.scrollLeft += e.deltaY;
      }
    },
    { passive: false },
  );

  // recalc measurements on resize and keep position centered
  window.addEventListener("resize", () => {
    requestAnimationFrame(() => {
      calcWidths();
      if (singleSetWidth) {
        const mod = row.scrollLeft % singleSetWidth;
        instantScrollTo(singleSetWidth + mod);
      }
    });
  });

  return section;
}
