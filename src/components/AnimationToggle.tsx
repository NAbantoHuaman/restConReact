import { useEffect, useRef, useState } from 'react';

// Botón flotante para alternar "modo prototipo" (desactivar animaciones)
// Sin modificar lógica de la app: inyecta un <style> y sobreescribe APIs de animación temporalmente.
export default function AnimationToggle() {
  const STYLE_ID = '__disable_animations_style__';
  const [active, setActive] = useState(false);
  const originalsRef = useRef<{ raf: typeof window.requestAnimationFrame; animate?: typeof Element.prototype.animate } | null>(null);

  useEffect(() => {
    // Cachea los originales al montar (una sola vez)
    originalsRef.current = {
      raf: window.requestAnimationFrame,
      animate: Element.prototype.animate,
    };
    // Limpieza defensiva si el componente se desmonta con animaciones desactivadas
    return () => {
      if (document.getElementById(STYLE_ID)) {
        try { (document.getElementById(STYLE_ID) as HTMLStyleElement).remove(); } catch {}
      }
      if (originalsRef.current) {
        window.requestAnimationFrame = originalsRef.current.raf;
        try { Element.prototype.animate = originalsRef.current.animate!; } catch {}
      }
    };
  }, []);

  function enable() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `*{animation:none!important;transition:none!important;scroll-behavior:auto!important}
*,*:before,*:after{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:0s!important;transition-delay:0s!important}
html,body{scroll-snap-type:none!important}`;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.setAttribute('data-origin', 'AnimationToggle');
    style.textContent = css;
    document.head.appendChild(style);

    // JS animations: requestAnimationFrame y Web Animations API
    const originals = originalsRef.current;
    if (originals) {
      window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0) as unknown as number;
      try {
        Element.prototype.animate = function () {
          return {
            playState: 'paused',
            play() {},
            pause() {},
            cancel() {},
            finished: Promise.resolve(),
          } as any;
        } as any;
      } catch {}
    }
    setActive(true);
  }

  function disable() {
    const style = document.getElementById(STYLE_ID);
    if (style) {
      try { style.remove(); } catch {}
    }
    const originals = originalsRef.current;
    if (originals) {
      window.requestAnimationFrame = originals.raf;
      try { Element.prototype.animate = originals.animate!; } catch {}
    }
    setActive(false);
  }

  function toggle() {
    active ? disable() : enable();
  }

  // UI: botón flotante discreto con estado accesible
  return (
    <div className="fixed bottom-4 right-4 z-[2147483647]">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        title={active ? 'Modo prototipo activado: animaciones deshabilitadas' : 'Modo prototipo desactivado: animaciones normales'}
        className={`px-3 py-2 rounded-md shadow-md text-sm font-medium transition-colors ${
          active ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
        }`}
        style={{ opacity: 0.85 }}
      >
        {active ? 'Animaciones: OFF' : 'Animaciones: ON'}
      </button>
    </div>
  );
}