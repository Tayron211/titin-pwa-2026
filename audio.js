// Gym WP Sound System - Desactivado / Silenciado completamente
const baseSoundEffects = {
  muted: true,

  init() {
    // Sonidos desactivados
  },

  play(audioElement) {
    // Silenciado: no reproduce ningún audio
    return;
  },

  // 1. Pitidos de cuenta regresiva (3, 2, 1)
  beep(high = false) {},

  // 2. Fin del descanso del cronómetro
  restComplete() {},

  // 3. Serie completada (Check de series)
  setComplete() {},

  // 4. Fanfarria de finalización de entrenamiento
  workoutFinished() {},

  // 5. Tarea asignada o enviada
  taskSent() {},

  // 6. Chime / Éxito / Inicio de sesión
  chime() {},

  // 7. Sonido de clic y tap
  click() {},
  tap() {},
  tick() {}
};

// Safe Proxy so ANY sound call (e.g., SoundEffects.anySound()) never throws TypeError
const SoundEffects = new Proxy(baseSoundEffects, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    // Return a harmless no-op function for any unassigned audio method
    return () => {};
  }
});
window.SoundEffects = SoundEffects;

