(() => {
  const biographies = new Map();

  document.querySelectorAll("[data-person-bio-open]").forEach((opener) => {
    const dialog = document.getElementById(opener.dataset.personBioOpen);
    if (!(dialog instanceof HTMLDialogElement)) return;

    if (!biographies.has(dialog)) {
      const state = { opener: null, scrollX: 0, scrollY: 0, backdropPress: false };
      biographies.set(dialog, state);

      const isBackdrop = (event) => {
        if (event.target !== dialog) return false;
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right
          || event.clientY < bounds.top || event.clientY > bounds.bottom;
      };

      dialog.addEventListener("pointerdown", (event) => {
        state.backdropPress = event.isPrimary && event.button === 0 && isBackdrop(event);
      });
      dialog.addEventListener("pointercancel", () => {
        state.backdropPress = false;
      });
      dialog.addEventListener("click", (event) => {
        const closeFromBackdrop = state.backdropPress && isBackdrop(event);
        state.backdropPress = false;
        if (closeFromBackdrop) dialog.close();
      });

      dialog.querySelectorAll("[data-person-bio-close]").forEach((button) => {
        button.addEventListener("click", () => dialog.close());
      });

      // Native Escape handling also fires close, so every exit restores the page.
      dialog.addEventListener("close", () => {
        state.backdropPress = false;
        const anotherBioIsOpen = [...biographies.keys()].some((bio) => bio.open);
        document.body.classList.toggle("person-bio-open", anotherBioIsOpen);
        if (state.opener?.isConnected) state.opener.focus({ preventScroll: true });
        window.scrollTo({ left: state.scrollX, top: state.scrollY, behavior: "instant" });
      });
    }

    opener.addEventListener("click", () => {
      if (dialog.open) return;
      const state = biographies.get(dialog);
      state.opener = opener;
      state.scrollX = window.scrollX;
      state.scrollY = window.scrollY;
      document.body.classList.add("person-bio-open");
      dialog.showModal();
      dialog.querySelector(".person-bio-layout")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  });
})();
