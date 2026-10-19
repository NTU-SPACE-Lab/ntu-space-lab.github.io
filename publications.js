(() => {
  const filters = document.querySelector(".publication-filters");
  const count = document.querySelector(".publication-count");
  const papers = [...document.querySelectorAll(".publication-item[data-domains]")];
  if (!filters || !count || !papers.length) return;

  const buttons = [...filters.querySelectorAll("[data-publication-filter]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const topic = button.dataset.publicationFilter;
      let visible = 0;

      papers.forEach((paper) => {
        const matches = topic === "all" || paper.dataset.domains.split(" ").includes(topic);
        paper.hidden = !matches;
        if (matches) visible += 1;
      });

      buttons.forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      count.textContent = `${visible} ${visible === 1 ? "publication" : "publications"}`;
    });
  });

  filters.hidden = false;
})();
