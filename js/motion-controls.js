document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-motion-target]').forEach(button => {
    const target = document.getElementById(button.dataset.motionTarget);
    if (!target) return;
    const video = target instanceof HTMLVideoElement;
    const setPaused = paused => {
      if (video) {
        if (paused) target.pause();
        else target.play().catch(() => setPaused(true));
      } else {
        target.classList.toggle('motion-paused', paused);
        target.classList.toggle('motion-allowed', !paused);
      }
      button.textContent = `${paused ? 'Resume' : 'Pause'} ${video ? 'background video' : 'portfolio animation'}`;
      button.dataset.paused = String(paused);
    };
    button.hidden = false;
    setPaused(reducedMotion.matches);
    if (video) {
      target.addEventListener('pause', () => {
        button.textContent = 'Resume background video';
        button.dataset.paused = 'true';
      });
      target.addEventListener('play', () => {
        button.textContent = 'Pause background video';
        button.dataset.paused = 'false';
      });
    }
    button.addEventListener('click', () => setPaused(button.dataset.paused !== 'true'));
    reducedMotion.addEventListener('change', event => { if (event.matches) setPaused(true); });
  });
});
