// ==========================================================================
// Gym WP Clone - Main Application Logic & Controller
// Complete integration of authentic Gym WP GIFs, Images, Sounds &
// Equipment Modality Filters (Home vs Machine vs Free Weights)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Helper to generate guaranteed UNIQUE student login username (sin redundancia):
  // First initial + last name (e.g. 'Tayron salinas' -> 'tsalinas').
  // If 'tsalinas' already exists in the database, automatically generates 'tsalinas1', 'tsalinas2', etc.
  function generateStudentUsername(fullName, existingUsers = null, excludeUserId = null) {
    if (!fullName) return '';
    const clean = fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
    
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    
    let base = '';
    if (words.length === 1) {
      base = words[0].replace(/[^a-z0-9]/g, '');
    } else {
      const initial = words[0][0];
      const lastName = words[words.length - 1];
      base = (initial + lastName).replace(/[^a-z0-9]/g, '');
    }

    if (!base) base = 'alumno';

    const usersList = existingUsers || (typeof appState !== 'undefined' && appState.data && appState.data.users) || (window.GymData && window.GymData.users) || [];
    const taken = new Set(
      usersList
        .filter(u => !excludeUserId || u.id !== excludeUserId)
        .map(u => (u.username || '').toLowerCase().trim())
    );

    // If the base username is not taken, use it
    if (!taken.has(base)) {
      return base;
    }

    // If taken, append incremental number to avoid redundancy: base1, base2, base3...
    let seq = 1;
    let candidate = `${base}${seq}`;
    while (taken.has(candidate)) {
      seq++;
      candidate = `${base}${seq}`;
    }
    return candidate;
  }
  window.generateStudentUsername = generateStudentUsername;

  // ==========================================================================
  // THEME MANAGER (MODO CLARO & MODO OSCURO CON DETECCIÓN DEL SISTEMA)
  // ==========================================================================
  const ThemeManager = {
    getSystemPreference() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    },

    getCurrentTheme() {
      const saved = localStorage.getItem('topgym_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return this.getSystemPreference();
    },

    applyStatusBarAndTheme(theme) {
      const isLight = theme === 'light';
      const headerColor = isLight ? '#ffffff' : '#0c0d11';
      const bodyBgColor = isLight ? '#f5f7fb' : '#0c0d11';
      const statusBarStyle = isLight ? 'default' : 'black-translucent';

      // 1. Inmediata actualización de canvas raíz para WebKit, Safari e iOS
      try {
        document.documentElement.style.backgroundColor = headerColor;
        document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
        if (document.body) {
          document.body.style.backgroundColor = bodyBgColor;
          document.body.style.colorScheme = isLight ? 'light' : 'dark';
        }
      } catch (e) {}

      // 2. Meta color-scheme
      try {
        let schemeMeta = document.getElementById('metaColorScheme') || document.querySelector('meta[name="color-scheme"]');
        if (schemeMeta) schemeMeta.setAttribute('content', isLight ? 'light' : 'dark');
      } catch (e) {}

      // 3. Apple status bar style meta (default = light con texto negro; black-translucent = dark con texto blanco)
      try {
        let statusMeta = document.getElementById('metaStatusBar') || document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (statusMeta) statusMeta.setAttribute('content', statusBarStyle);
      } catch (e) {}

      // 4. Meta theme-color para navegadores móviles (Android Chrome, iOS Safari 15+, PWA Standalone)
      try {
        const metaTheme = document.getElementById('metaThemeColor');
        const metaLight = document.getElementById('metaThemeColorLight');
        const metaDark = document.getElementById('metaThemeColorDark');

        if (metaTheme) metaTheme.setAttribute('content', headerColor);
        if (metaLight) metaLight.setAttribute('content', headerColor);
        if (metaDark) metaDark.setAttribute('content', headerColor);
        const metaMs = document.getElementById('metaMsNavColor');
        if (metaMs) metaMs.setAttribute('content', headerColor);

        // Disparar repintado forzado en Safari/WebKit re-insertando los elementos meta
        const allMetas = document.querySelectorAll('meta[name="theme-color"]');
        allMetas.forEach(meta => {
          meta.setAttribute('content', headerColor);
          const parent = meta.parentNode;
          if (parent) {
            const next = meta.nextSibling;
            parent.removeChild(meta);
            if (next) parent.insertBefore(meta, next);
            else parent.appendChild(meta);
          }
        });
      } catch (e) {
        console.warn('[ThemeManager] Error al sincronizar theme-color en móvil:', e);
      }
    },

    setTheme(newTheme, isUserAction = true) {
      document.documentElement.classList.add('theme-transitioning');
      document.documentElement.setAttribute('data-theme', newTheme);
      this.applyStatusBarAndTheme(newTheme);
      if (isUserAction) {
        localStorage.setItem('topgym_theme', newTheme);
      }
      this.updateUI(newTheme);
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 380);
    },

    toggle() {
      const current = this.getCurrentTheme();
      const nextTheme = current === 'light' ? 'dark' : 'light';
      this.setTheme(nextTheme, true);
      SoundEffects.tap();
      showToast(`Modo ${nextTheme === 'light' ? 'Claro ☀️' : 'Oscuro 🌙'} activado`, 'coach');
    },

    updateUI(theme) {
      const isLight = theme === 'light';
      const label = document.getElementById('themeToggleLabel');
      if (label) {
        label.textContent = isLight ? 'Claro' : 'Oscuro';
      }

      const sub1 = document.getElementById('dropdownThemeStatusSubtitle');
      if (sub1) {
        sub1.textContent = `Actualmente: Modo ${isLight ? 'Claro ☀️' : 'Oscuro 🌙'}`;
      }

      const sub2 = document.getElementById('dropdownCoachThemeStatusSubtitle');
      if (sub2) {
        sub2.textContent = `Actualmente: Modo ${isLight ? 'Claro ☀️' : 'Oscuro 🌙'}`;
      }

      document.querySelectorAll('.dropdown-theme-mini-switch').forEach(sw => {
        if (isLight) sw.classList.add('active');
        else sw.classList.remove('active');
      });
    },

    init() {
      const currentTheme = this.getCurrentTheme();
      this.setTheme(currentTheme, false);

      // Listen for system phone preference changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
          if (!localStorage.getItem('topgym_theme')) {
            this.setTheme(e.matches ? 'light' : 'dark', false);
          }
        });
      }

      // Bind header button (if exists)
      const toggleBtn = document.getElementById('themeToggleBtn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggle());
      }

      // Bind dropdown buttons
      const ddBtn1 = document.getElementById('dropdownThemeToggleBtn');
      if (ddBtn1) {
        ddBtn1.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle();
        });
      }

      const ddBtn2 = document.getElementById('dropdownCoachThemeToggleBtn');
      if (ddBtn2) {
        ddBtn2.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle();
        });
      }
    }
  };

  ThemeManager.init();
  window.ThemeManager = ThemeManager;

  // ==========================================================================
  // NOTIFICATION MANAGER (PWA & STANDARD WEB NOTIFICATIONS - WHATSAPP PARITY)
  // ==========================================================================
  const NotificationManager = {
    swRegistration: null,
    permission: 'default',

    async init() {
      if ('Notification' in window) {
        this.permission = Notification.permission;
      }
      const hasPriorGrant = localStorage.getItem('topgym_notif_granted') === 'true';
      if (this.permission === 'granted' || hasPriorGrant) {
        localStorage.setItem('topgym_notif_granted', 'true');
        if (this.permission !== 'granted') {
          this.permission = 'in-app-active';
        }
      }

      // 1. Service Worker registration for Mobile (Android & iOS PWA) and Web
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('./sw.js?v=130', { scope: './' });
          if (reg && reg.update) reg.update().catch(() => {});
          this.swRegistration = reg;
          console.log('[NotificationManager] ServiceWorker registered with scope:', reg.scope);

          // Handle notification click messages relayed from Service Worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            const data = event.data;
            if (data && data.type === 'NOTIFICATION_CLICK') {
              this.handleNotificationAction(data.payload || data.data);
            }
          });
        } catch (err) {
          console.warn('[NotificationManager] ServiceWorker register error:', err);
        }
      }

      // 2. Check query params if page was opened/focused by notification click
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('notifAction') === 'open_task') {
          const taskId = urlParams.get('taskId');
          const studentId = urlParams.get('studentId');
          if (taskId) {
            setTimeout(() => {
              if (typeof openCoachNotificationDetail === 'function') {
                openCoachNotificationDetail(taskId, studentId);
              }
            }, 800);
          }
        }
      } catch (e) {}

      // 3. Update banner visibility and indicators
      this.updatePermissionUI();

      // 4. Real-time Multi-Tab and Multi-Device Bus (instant notifications to Coach)
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('topgym_notif_bus');
          bc.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TASK_COMPLETED_EVENT') {
              if (typeof StorageManager !== 'undefined') {
                appState.data = StorageManager.load();
              }
              const { notification, task, student } = event.data;
              // SOLO el Coach debe recibir la alerta sonora, banner y notificación de entrega de un alumno
              if (appState.currentRole === 'coach') {
                this.send({
                  title: `TOP-GYM • Alumno ${student?.name || notification?.studentName || 'Alumno'} 💬`,
                  body: `¡Nueva sesión entregada: "${task?.workoutTitle || notification?.workoutTitle}"! Mensaje: "${notification?.feedback || 'Sesión finalizada con éxito.'}"`,
                  icon: student?.avatar || notification?.studentAvatar || './GYMTOP/resources/res/drawable/im_comentario_4.jpg',
                  data: { action: 'open_task', taskId: notification?.taskId || task?.id, studentId: notification?.studentId || student?.id }
                });
                if (typeof updateCoachBadges === 'function') updateCoachBadges();
                if (typeof updateCoachProfileDropdown === 'function') updateCoachProfileDropdown();
                if (typeof renderCoachScreen === 'function') renderCoachScreen();
              }
            } else if (event.data && event.data.type === 'TASK_ASSIGNED_EVENT') {
              if (typeof StorageManager !== 'undefined') {
                appState.data = StorageManager.load();
              }
              const { notification, task, student } = event.data;
              const targetStudentId = student?.id || notification?.studentId || task?.studentId;
              // SOLO el Alumno específico asignado debe recibir la alerta de nueva rutina
              if (appState.currentRole === 'student' && appState.currentUser && appState.currentUser.id === targetStudentId) {
                this.send({
                  title: 'TOP-GYM • Coach Humberto Salinas 🏋️‍♂️',
                  body: `¡Nueva rutina asignada para ti! "${task?.workoutTitle || notification?.workoutTitle}" (${task?.scheduledDate || 'Hoy'}). ${task?.coachNotes ? `"${task.coachNotes}"` : ''}`,
                  icon: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg',
                  data: { action: 'open_schedule', taskId: notification?.taskId || task?.id }
                });
                if (typeof updateStudentBadges === 'function') updateStudentBadges();
                if (typeof updateStudentProfileDropdown === 'function') updateStudentProfileDropdown();
                if (typeof renderScheduleScreen === 'function') renderScheduleScreen();
              }
            } else if (event.data && (event.data.type === 'PROFILE_UPDATED_EVENT' || event.data.type === 'DATA_SYNC_EVENT' || event.data.type === 'DATA_MUTATED_EVENT')) {
              if (typeof StorageManager !== 'undefined') {
                appState.data = StorageManager.load();
              }
              if (appState.currentUser) {
                const fresh = appState.data.users.find(u => u.id === appState.currentUser.id);
                if (fresh) {
                  appState.currentUser = fresh;
                  if (typeof setupRoleAndUser === 'function') setupRoleAndUser();
                }
              }
              if (appState.currentRole === 'coach') {
                if (typeof updateCoachBadges === 'function') updateCoachBadges();
                if (typeof updateCoachProfileDropdown === 'function') updateCoachProfileDropdown();
                if (typeof renderCoachScreen === 'function') renderCoachScreen();
              } else if (appState.currentRole === 'student') {
                if (typeof updateStudentBadges === 'function') updateStudentBadges();
                if (typeof updateStudentProfileDropdown === 'function') updateStudentProfileDropdown();
                if (typeof renderScheduleScreen === 'function') renderScheduleScreen();
                if (typeof renderProgressScreen === 'function') renderProgressScreen();
              }
              if (typeof renderStudentAccountCards === 'function') renderStudentAccountCards();
            }
          });
        }

        window.addEventListener('storage', (event) => {
          if (event.key === StorageManager.KEY || (StorageManager.BACKUP_KEY && event.key === StorageManager.BACKUP_KEY)) {
            appState.data = StorageManager.load();
            if (appState.currentUser) {
              const fresh = appState.data.users.find(u => u.id === appState.currentUser.id);
              if (fresh) {
                appState.currentUser = fresh;
                if (typeof setupRoleAndUser === 'function') setupRoleAndUser();
              }
            }
            if (appState.currentRole === 'coach') {
              if (typeof updateCoachBadges === 'function') updateCoachBadges();
              if (typeof updateCoachProfileDropdown === 'function') updateCoachProfileDropdown();
              if (typeof renderCoachScreen === 'function') renderCoachScreen();
            } else if (appState.currentRole === 'student') {
              if (typeof updateStudentBadges === 'function') updateStudentBadges();
              if (typeof updateStudentProfileDropdown === 'function') updateStudentProfileDropdown();
              if (typeof renderScheduleScreen === 'function') renderScheduleScreen();
              if (typeof renderProgressScreen === 'function') renderProgressScreen();
            }
            if (typeof renderStudentAccountCards === 'function') renderStudentAccountCards();
          }
        });
      } catch (e) {}
    },

    async requestPermission() {
      let isGranted = false;

      // 1. Intentar solicitar permiso nativo al navegador si está soportado
      if ('Notification' in window) {
        try {
          let result;
          // Soporte dual Promise / Callback para compatibilidad móvil y escritorio
          const p = Notification.requestPermission((status) => {
            if (status) result = status;
          });
          if (p && typeof p.then === 'function') {
            result = await p;
          }
          if (!result && 'permission' in Notification) {
            result = Notification.permission;
          }
          this.permission = result;
          if (result === 'granted') {
            isGranted = true;
          }
        } catch (err) {
          console.warn('[NotificationManager] Native permission warning:', err);
        }
      }

      // 2. ACTIVAR SIEMPRE: Marcar alertas activadas para la aplicación
      localStorage.setItem('topgym_notif_granted', 'true');
      localStorage.setItem('topgym_notif_banner_dismissed', 'true');
      sessionStorage.setItem('topgym_notif_banner_dismissed', 'true');
      this.permission = isGranted ? 'granted' : 'in-app-active';

      // 3. Ocultar inmediatamente el banner
      const banner = document.getElementById('notifPermissionBanner');
      if (banner) {
        banner.classList.add('banner-hidden');
        banner.style.setProperty('display', 'none', 'important');
      }

      // 4. Reproducir timbre sonoro
      this.playNotificationSound();

      // 5. Confirmación SOLO visual (in-app). No se dispara notificación nativa de bienvenida:
      // en móviles una notificación nativa fuera de mensajes Coach↔Alumno genera avisos
      // del navegador tipo "Pulsa para copiar la URL de esta aplicación". Solo se notificará
      // de forma nativa cuando exista un mensaje real entre Coach y Alumno.
      this.showInAppBanner({
        title: 'TOP-GYM • Alertas Activadas 🔔',
        body: 'Alertas sonoras y visuales activadas. Recibirás avisos solo cuando tu Coach o tu Alumno te envíen un mensaje.',
        icon: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg'
      });

      if (typeof showNotification === 'function') {
        showNotification('¡Alertas activadas con éxito en TOP-GYM!', 'success');
      }

      return true;
    },

    updatePermissionUI() {
      const banner = document.getElementById('notifPermissionBanner');
      if (!banner) return;

      const isGranted = (this.permission === 'granted') || (this.permission === 'in-app-active') || (localStorage.getItem('topgym_notif_granted') === 'true');
      const isDismissed = (localStorage.getItem('topgym_notif_banner_dismissed') === 'true') || (sessionStorage.getItem('topgym_notif_banner_dismissed') === 'true');

      if (isGranted || isDismissed) {
        banner.classList.add('banner-hidden');
        banner.style.setProperty('display', 'none', 'important');
      } else {
        banner.classList.remove('banner-hidden');
        banner.style.removeProperty('display');
      }
    },

    // WhatsApp-like dual-tone synth chime
    playNotificationSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;
        // High soft chime tone 1 (587 Hz - D5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // High bright chime tone 2 (880 Hz - A5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.12);
        gain2.gain.setValueAtTime(0.22, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.5);
      } catch (e) {}
    },

    // Main send function: Native OS + In-App floating banner + vibration + sound
    async send({ title, body, icon, badge, data = {}, tag = 'topgym-notif', vibrate = [200, 100, 200] }) {
      const defaultIcon = './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png';
      const notificationIcon = icon || defaultIcon;
      const notificationBadge = badge || defaultIcon;

      // 1. Play sound chime
      this.playNotificationSound();

      // 2. Mobile vibration (works on mobile browsers/Android)
      if (navigator.vibrate) {
        try {
          navigator.vibrate(vibrate);
        } catch (e) {}
      }

      // 3. System Native Notification (PC OS / Mobile PWA notification)
      if ('Notification' in window && Notification.permission === 'granted') {
        const options = {
          body: body,
          icon: notificationIcon,
          badge: notificationBadge,
          tag: tag,
          renotify: true,
          vibrate: vibrate,
          data: data
        };

        if (this.swRegistration && this.swRegistration.showNotification) {
          try {
            await this.swRegistration.showNotification(title, options);
          } catch (err) {
            try {
              const n = new Notification(title, options);
              n.onclick = (e) => {
                e.preventDefault();
                window.focus();
                this.handleNotificationAction(data);
                n.close();
              };
            } catch (e2) {}
          }
        } else {
          try {
            const n = new Notification(title, options);
            n.onclick = (e) => {
              e.preventDefault();
              window.focus();
              this.handleNotificationAction(data);
              n.close();
            };
          } catch (e) {}
        }
      }

      // 4. In-App WhatsApp-style Floating Toast Banner (Top Heads-Up banner)
      this.showInAppBanner({
        title,
        body,
        avatar: notificationIcon,
        data
      });
    },

    showInAppBanner({ title, body, avatar, data }) {
      let container = document.getElementById('waToastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'waToastContainer';
        container.className = 'wa-toast-container';
        document.body.appendChild(container);
      }
      container.innerHTML = '';

      const toast = document.createElement('div');
      toast.className = 'wa-notification-toast';
      toast.setAttribute('role', 'alert');

      toast.innerHTML = `
        <div class="wa-notif-avatar-box">
          <img src="${avatar || './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png'}" alt="Avatar" class="wa-notif-avatar">
          <span class="wa-notif-online-dot"></span>
        </div>
        <div class="wa-notif-content">
          <div class="wa-notif-header">
            <span class="wa-notif-title">${title || 'TOP-GYM'}</span>
            <span class="wa-notif-time">ahora</span>
          </div>
          <div class="wa-notif-message">${body || ''}</div>
        </div>
        <button class="wa-notif-close-btn" title="Cerrar" aria-label="Cerrar">&times;</button>
      `;

      // Tap to open notification action
      toast.addEventListener('click', (e) => {
        if (e.target.closest('.wa-notif-close-btn')) {
          e.stopPropagation();
          toast.classList.add('wa-toast-hiding');
          setTimeout(() => toast.remove(), 250);
          return;
        }
        toast.classList.add('wa-toast-hiding');
        setTimeout(() => toast.remove(), 200);
        this.handleNotificationAction(data);
      });

      container.appendChild(toast);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        if (toast.isConnected) {
          toast.classList.add('wa-toast-hiding');
          setTimeout(() => toast.remove(), 300);
        }
      }, 6000);
    },

    handleNotificationAction(data) {
      if (!data) return;
      if (data.action === 'open_task' || data.taskId) {
        if (typeof openCoachNotificationDetail === 'function') {
          openCoachNotificationDetail(data.taskId, data.studentId);
        } else if (typeof switchScreen === 'function') {
          switchScreen('scheduleScreen');
        }
      }
    },

    notifyTaskAssigned(task, student, scheduledDate = null, coachNotes = null) {
      if (!task) return;
      const targetStudentId = student ? student.id : task.studentId;
      const studentName = student ? student.name : 'Alumno';
      const sDate = scheduledDate || task.scheduledDate || 'Hoy';
      const cNotes = coachNotes || task.coachNotes || 'Nueva rutina asignada por tu Coach Humberto Salinas.';
      const coachAvatar = './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg';

      // 1. Guardar notificación persistente para el alumno
      if (!appState.data) appState.data = (typeof StorageManager !== 'undefined' ? StorageManager.load() : null) || {};
      if (!appState.data.studentNotifications) {
        appState.data.studentNotifications = [];
      }

      const notifItem = {
        id: 'st_notif_' + Date.now(),
        taskId: task.id,
        studentId: targetStudentId,
        studentName: studentName,
        workoutTitle: task.workoutTitle,
        coachNotes: cNotes,
        scheduledDate: sDate,
        assignedAt: new Date().toLocaleString(),
        isRead: false
      };

      appState.data.studentNotifications.unshift(notifItem);
      if (typeof StorageManager !== 'undefined') {
        StorageManager.save(appState.data);
      }

      // 2. Emitir evento por canal de difusión en tiempo real (otras pestañas y dispositivos)
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('topgym_notif_bus');
          bc.postMessage({
            type: 'TASK_ASSIGNED_EVENT',
            notification: notifItem,
            task: task,
            student: student
          });
        }
      } catch (e) {}

      // 3. REGLA ESTRICTA DE PRIVACIDAD:
      // La notificación sonora, el banner flotante y el push de "Nueva rutina asignada"
      // SOLO deben llegarle al ALUMNO destinatario. NUNCA al Coach que la está asignando.
      const isTargetStudentActive = (appState.currentRole === 'student' && appState.currentUser && appState.currentUser.id === targetStudentId);

      if (isTargetStudentActive) {
        if (typeof updateStudentBadges === 'function') updateStudentBadges();
        if (typeof updateStudentProfileDropdown === 'function') updateStudentProfileDropdown();

        this.send({
          title: 'TOP-GYM • Coach Humberto Salinas 🏋️‍♂️',
          body: `¡Nueva rutina para ti! "${task.workoutTitle}" (${sDate}). ${cNotes ? `"${cNotes}"` : ''}`,
          icon: coachAvatar,
          badge: './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
          tag: `task-assigned-${task.id}`,
          data: {
            action: 'open_schedule',
            taskId: task.id,
            studentId: targetStudentId
          }
        });
      }
    },

    notifyTaskCompleted(task, student, rpe = 8, feedback = '') {
      if (!task) return;
      const studentName = student ? student.name : 'Alumno';
      const msg = feedback || task.studentFeedback || 'Sesión finalizada con éxito.';
      const rpeVal = rpe || task.ratingRPE || 8;
      const studentAvatar = student ? (student.avatar || './GYMTOP/resources/res/drawable/im_comentario_4.jpg') : './GYMTOP/resources/res/drawable/im_comentario_4.jpg';

      // 1. Guardar notificación persistente en el centro de mensajes del Coach
      if (!appState.data) appState.data = (typeof StorageManager !== 'undefined' ? StorageManager.load() : null) || {};
      if (!appState.data.coachNotifications) {
        appState.data.coachNotifications = [];
      }

      const notifItem = {
        id: 'notif_' + Date.now(),
        taskId: task.id,
        studentId: student ? student.id : task.studentId,
        studentName: studentName,
        studentAvatar: studentAvatar,
        workoutTitle: task.workoutTitle,
        feedback: msg,
        rpe: rpeVal,
        completedAt: task.completedAt || new Date().toLocaleString(),
        isRead: false
      };

      appState.data.coachNotifications.unshift(notifItem);
      if (typeof StorageManager !== 'undefined') {
        StorageManager.save(appState.data);
      }

      // 2. Emitir evento por canal de difusión en tiempo real (otras pestañas y dispositivos)
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('topgym_notif_bus');
          bc.postMessage({
            type: 'TASK_COMPLETED_EVENT',
            notification: notifItem,
            task: task,
            student: student
          });
        }
      } catch (e) {}

      // 3. REGLA ESTRICTA DE PRIVACIDAD:
      // La notificación sonora, el banner flotante y el push de "Sesión entregada"
      // SOLO deben llegarle al COACH. NUNCA al Alumno que acaba de completar su sesión.
      const isCoachActive = (appState.currentRole === 'coach');

      if (isCoachActive) {
        if (typeof updateCoachBadges === 'function') updateCoachBadges();
        if (typeof updateCoachProfileDropdown === 'function') updateCoachProfileDropdown();

        this.send({
          title: `TOP-GYM • Alumno ${studentName} 💬`,
          body: `¡Sesión entregada: "${task.workoutTitle}"! Mensaje: "${msg}" (RPE: ${rpeVal}/10)`,
          icon: studentAvatar,
          badge: './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
          tag: `task-completed-${task.id}`,
          data: {
            action: 'open_task',
            taskId: task.id,
            studentId: task.studentId
          }
        });
      }
    },

    testSampleNotification() {
      if (appState.currentRole === 'coach') {
        const demoTask = {
          id: 'task_demo_' + Date.now(),
          studentId: 'usr_mateo',
          workoutTitle: 'Pierna & Glúteos (Potencia)',
          scheduledDate: new Date().toISOString().split('T')[0],
          focus: 'Hipertrofia Muscular'
        };
        const demoStudent = {
          id: 'usr_mateo',
          name: 'Mateo Gómez',
          avatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg'
        };
        this.notifyTaskCompleted(demoTask, demoStudent, 9, '¡Completé las 4 series con peso extra!');
      } else {
        const currentStudent = (appState.currentRole === 'student' && appState.currentUser)
          ? appState.currentUser
          : {
              id: 'usr_mateo',
              name: 'Mateo Gómez',
              avatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg'
            };
        const demoTask = {
          id: 'task_demo_' + Date.now(),
          studentId: currentStudent.id,
          workoutTitle: 'Espalda & Bíceps (Tracción)',
          scheduledDate: new Date().toISOString().split('T')[0],
          coachNotes: 'Enfócate en la contracción de dorsales en cada repetición.'
        };
        this.notifyTaskAssigned(demoTask, currentStudent);
      }
    }
  };
  window.NotificationManager = NotificationManager;

  // 1. Initial State
  let appState = {
    data: StorageManager.load(),
    currentUser: null,
    currentRole: 'student', // 'student' | 'coach'
    activeScreen: 'scheduleScreen',
    selectedDate: new Date().toISOString().split('T')[0],
    
    // Active filters for Home vs Machine workouts
    scheduleFilterModality: 'all', // 'all' | 'home' | 'machine' | 'freeweight'
    catalogFilterModality: 'all',  // 'all' | 'home' | 'machine' | 'freeweight'
    catalogFilterMuscle: 'all',    // 'all' | 'chest' | 'back' | ...
    catalogSearchQuery: '',
    plansFilterModality: 'all',    // 'all' | 'home' | 'machine' | 'freeweight'
    coachTasksFilterModality: 'all', // 'all' | 'home' | 'machine'
    coachActiveTab: 'inbox', // 'inbox' | 'students' | 'tasks'
    coachInboxFilter: 'all', // 'all' | 'with_message' | 'pending'

    // Live Workout Assistant State
    liveWorkout: {
      active: false,
      task: null,
      workoutPlan: null,
      startTime: null,
      elapsedInterval: null,
      elapsedSeconds: 0,
      totalVolumeKg: 0,
      completedSetsCount: 0,
      currentExerciseIndex: 0,
      exercises: []
    },

    // Rest Timer State
    restTimer: {
      interval: null,
      totalSeconds: 90,
      remainingSeconds: 90,
      running: false
    }
  };

  // Dynamic authenticated user (null until loaded from session or user logs in)
  appState.currentUser = null;
  appState.currentRole = null;

  // DOM Elements
  const headerAvatar = document.getElementById('headerAvatar');
  const headerUserName = document.getElementById('headerUserName');
  const coachTabBtn = document.getElementById('coachTabBtn');
  const mobileCoachBtn = document.getElementById('mobileCoachBtn');
  const coachActiveBar = document.getElementById('coachActiveBar');
  const logoutCoachBtn = document.getElementById('logoutCoachBtn');
  const studentHeaderBox = document.getElementById('studentHeaderBox');
  const logoutStudentBtn = document.getElementById('logoutStudentBtn');
  const openCoachAuthModalBtn = document.getElementById('openCoachAuthModalBtn');
  const toastContainer = document.getElementById('toastContainer');

  // Fullscreen Unified Login Screen DOM
  const loginScreen = document.getElementById('loginScreen');
  const unifiedLoginForm = document.getElementById('unifiedLoginForm');
  const loginUsernameInput = document.getElementById('loginUsernameInput');
  const loginPasswordInput = document.getElementById('loginPasswordInput');
  const toggleLoginPasswordBtn = document.getElementById('toggleLoginPasswordBtn');
  const loginErrorMessage = document.getElementById('loginErrorMessage');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const openForgotPasswordBtn = document.getElementById('openForgotPasswordBtn');

  // Forgot Password Validation Modal DOM
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const closeForgotPasswordModalBtn = document.getElementById('closeForgotPasswordModalBtn');
  const cancelForgotPasswordBtn = document.getElementById('cancelForgotPasswordBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotUsePinBtn = document.getElementById('forgotUsePinBtn');
  const securityAuthModal = document.getElementById('securityAuthModal');
  const closeSecurityAuthModalBtn = document.getElementById('closeSecurityAuthModalBtn');

  // My Profile Confidential Modal DOM
  const myProfileModal = document.getElementById('myProfileModal');
  const closeMyProfileModalBtn = document.getElementById('closeMyProfileModalBtn');
  const logoutFromProfileModalBtn = document.getElementById('logoutFromProfileModalBtn');
  const profilePickerBtn = document.getElementById('profilePickerBtn');

  // Live Assistant DOM
  const liveAssistantOverlay = document.getElementById('liveAssistantOverlay');
  const liveWorkoutTitle = document.getElementById('liveWorkoutTitle');
  const liveElapsedTimer = document.getElementById('liveElapsedTimer');
  const liveCurrentExerciseGif = document.getElementById('liveCurrentExerciseGif');
  const liveStageExerciseName = document.getElementById('liveStageExerciseName');
  const liveStageExerciseDetails = document.getElementById('liveStageExerciseDetails');
  const liveSeriesTableContainer = document.getElementById('liveSeriesTableContainer');
  const prevExerciseBtn = document.getElementById('prevExerciseBtn');
  const nextExerciseBtn = document.getElementById('nextExerciseBtn');
  const exitLiveWorkoutBtn = document.getElementById('exitLiveWorkoutBtn');
  const finishLiveWorkoutBtn = document.getElementById('finishLiveWorkoutBtn');

  // Rest Timer DOM
  const restTimerBox = document.getElementById('restTimerBox');
  const restSecondsDisplay = document.getElementById('restSecondsDisplay');
  const timerProgressCircle = document.getElementById('timerProgressCircle');
  const stopRestTimerBtn = document.getElementById('stopRestTimerBtn');

  // Modals
  const assignTaskModal = document.getElementById('assignTaskModal');
  const openAssignTaskModalBtn = document.getElementById('openAssignTaskModalBtn');
  const closeAssignTaskModalBtn = document.getElementById('closeAssignTaskModalBtn');
  const cancelAssignTaskBtn = document.getElementById('cancelAssignTaskBtn');
  const assignTaskForm = document.getElementById('assignTaskForm');
  const taskStudentSelect = document.getElementById('taskStudentSelect');
  const taskModalityFilterSelect = document.getElementById('taskModalityFilterSelect');
  const taskPlanSelect = document.getElementById('taskPlanSelect');
  const taskDateInput = document.getElementById('taskDateInput');
  const finishWorkoutModal = document.getElementById('finishWorkoutModal');
  const closeFinishModalBtn = document.getElementById('closeFinishModalBtn');
  const submitWorkoutReportForm = document.getElementById('submitWorkoutReportForm');
  const workoutRpeInput = document.getElementById('workoutRpeInput');
  const rpeValueDisplay = document.getElementById('rpeValueDisplay');

  // Student Registration Modal DOM
  const registerStudentModal = document.getElementById('registerStudentModal');
  const openRegisterStudentModalBtn = document.getElementById('openRegisterStudentModalBtn');
  const closeRegisterStudentModalBtn = document.getElementById('closeRegisterStudentModalBtn');
  const cancelRegisterStudentBtn = document.getElementById('cancelRegisterStudentBtn');
  const registerStudentForm = document.getElementById('registerStudentForm');
  const regAvatarPickerContainer = document.getElementById('regAvatarPickerContainer');
  const regSelectedAvatar = document.getElementById('regSelectedAvatar');

  // Exercise Detail Modal DOM
  const exerciseDetailModal = document.getElementById('exerciseDetailModal');
  const closeExerciseDetailModalBtn = document.getElementById('closeExerciseDetailModalBtn');
  const closeExerciseDetailModalBtn2 = document.getElementById('closeExerciseDetailModalBtn2');
  const startSingleExerciseLiveBtn = document.getElementById('startSingleExerciseLiveBtn');
  let currentDetailExercise = null;

  // Initialize Application
  initApp();

  function initSplashScreen() {
    const splash = document.getElementById('appSplashScreen');
    if (!splash) return;

    // Si la app ya se abrió previamente o el usuario ya tiene sesión activa,
    // ocultar el splash inmediatamente para que al volver nunca se reinicie ni parpadee
    const hasActiveSession = !!(localStorage.getItem('topgym_session_auth') || localStorage.getItem('topgym_current_user_id') || localStorage.getItem('topgym_active_user'));
    const hasLoaded = sessionStorage.getItem('topgym_app_loaded') === 'true' || localStorage.getItem('topgym_app_loaded') === 'true';

    if (hasActiveSession || hasLoaded) {
      splash.style.display = 'none';
      splash.classList.add('splash-hidden');
      sessionStorage.setItem('topgym_app_loaded', 'true');
      localStorage.setItem('topgym_app_loaded', 'true');
      return;
    }

    sessionStorage.setItem('topgym_app_loaded', 'true');
    localStorage.setItem('topgym_app_loaded', 'true');
    setTimeout(() => {
      splash.classList.add('splash-hidden');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 350);
    }, 600);
  }

  function persistLiveWorkoutState() {
    if (!appState || !appState.liveWorkout || !appState.liveWorkout.active) return;
    try {
      const workoutSessionData = JSON.stringify({
        task: appState.liveWorkout.task,
        startTime: appState.liveWorkout.startTime,
        exercises: appState.liveWorkout.exercises,
        currentExerciseIndex: appState.liveWorkout.currentExerciseIndex,
        active: true,
        timestamp: Date.now()
      });
      sessionStorage.setItem('topgym_live_workout_session', workoutSessionData);
      localStorage.setItem('topgym_live_workout_session', workoutSessionData);
    } catch (_) {}
  }

  function clearLiveWorkoutState() {
    sessionStorage.removeItem('topgym_live_workout_session');
    localStorage.removeItem('topgym_live_workout_session');
    if (appState) appState.liveWorkout = null;
  }

  function resumeLiveWorkout(saved) {
    if (!saved || !saved.task) return;
    const liveOverlay = document.getElementById('liveAssistantOverlay');
    if (!liveOverlay) return;

    appState.liveWorkout = {
      active: true,
      task: saved.task,
      startTime: saved.startTime || Date.now(),
      elapsedSeconds: Math.max(0, Math.floor((Date.now() - (saved.startTime || Date.now())) / 1000)),
      totalVolumeKg: 0,
      completedSetsCount: 0,
      currentExerciseIndex: saved.currentExerciseIndex || 0,
      exercises: saved.exercises || JSON.parse(JSON.stringify(saved.task.exercises)),
      elapsedInterval: null
    };

    const titleEl = document.getElementById('liveWorkoutTitle');
    if (titleEl) titleEl.textContent = saved.task.workoutTitle;

    liveOverlay.classList.add('active');
    liveOverlay.style.display = 'block';

    clearInterval(appState.liveWorkout.elapsedInterval);
    appState.liveWorkout.elapsedInterval = setInterval(updateElapsedTimer, 1000);
    updateElapsedTimer();
    updateCurrentStageExercise();
  }

  function initApp() {
    initSplashScreen();
    if (typeof StorageManager !== 'undefined' && StorageManager.initPersistence) {
      StorageManager.initPersistence();
    }

    // Soporte PWA LaunchQueue (Android / Chrome WebAPK focus-existing)
    if ('launchQueue' in window && 'setConsumer' in window.launchQueue) {
      window.launchQueue.setConsumer((launchParams) => {
        const splash = document.getElementById('appSplashScreen');
        if (splash) {
          splash.style.display = 'none';
          splash.classList.add('splash-hidden');
        }
        const savedScreen = sessionStorage.getItem('topgym_active_screen') || localStorage.getItem('topgym_last_active_screen');
        if (savedScreen && document.getElementById(savedScreen)) {
          switchScreen(savedScreen);
        }
      });
    }

    // Salvaguarda 24/7 y Gestión de Multitarea en Móvil
    window.addEventListener('beforeunload', () => {
      if (appState && appState.data && typeof StorageManager !== 'undefined') {
        StorageManager.save(appState.data, true, true);
      }
      persistLiveWorkoutState();
    });

    window.addEventListener('pagehide', () => {
      if (appState && appState.data && typeof StorageManager !== 'undefined') {
        StorageManager.save(appState.data, true, true);
      }
      persistLiveWorkoutState();
    });

    // Control de Multitarea cuando el usuario minimiza y regresa a la app
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Al minimizar: guardar estado completo y despachar de inmediato a la nube
        if (appState && appState.data && typeof StorageManager !== 'undefined') {
          StorageManager.save(appState.data, true, true);
        }
        if (appState && appState.activeScreen) {
          sessionStorage.setItem('topgym_active_screen', appState.activeScreen);
          localStorage.setItem('topgym_last_active_screen', appState.activeScreen);
        }
        localStorage.setItem('topgym_last_active_ts', Date.now().toString());
        persistLiveWorkoutState();
        if (typeof StorageManager !== 'undefined' && StorageManager.pushToCloud) {
          StorageManager.pushToCloud(true).catch(() => {});
        }
      } else if (document.visibilityState === 'visible') {
        // Al reabrir / regresar de multitarea: asegurar que no haya parpadeo de splash y sincronizar
        const splash = document.getElementById('appSplashScreen');
        if (splash) {
          splash.style.display = 'none';
          splash.classList.add('splash-hidden');
        }

        // Sincronizar automáticamente con la nube por si otro equipo hizo modificaciones
        if (typeof StorageManager !== 'undefined' && StorageManager.syncWithCloud) {
          StorageManager.syncWithCloud().catch(() => {});
        }

        // Si hay un entrenamiento activo, recalcular el cronómetro exacto
        if (appState && appState.liveWorkout && appState.liveWorkout.active && appState.liveWorkout.startTime) {
          const now = Date.now();
          appState.liveWorkout.elapsedSeconds = Math.max(0, Math.floor((now - appState.liveWorkout.startTime) / 1000));
          if (typeof updateElapsedTimer === 'function') updateElapsedTimer();
        }

        // Si el temporizador de descanso estaba corriendo, recalcular con tiempo absoluto
        if (appState && appState.restTimer && appState.restTimer.running && appState.restTimer.endTime) {
          const now = Date.now();
          appState.restTimer.remainingSeconds = Math.max(0, Math.ceil((appState.restTimer.endTime - now) / 1000));
          if (appState.restTimer.remainingSeconds <= 0) {
            clearInterval(appState.restTimer.interval);
            appState.restTimer.running = false;
            if (typeof restTimerBox !== 'undefined' && restTimerBox) restTimerBox.classList.remove('timer-running');
            const statusEl = document.getElementById('restTimerStatus');
            if (statusEl) statusEl.textContent = '¡Descanso terminado! Siguiente serie.';
            if (typeof SoundEffects !== 'undefined' && SoundEffects.restComplete) SoundEffects.restComplete();
            if (typeof NotificationManager !== 'undefined') {
              NotificationManager.send({
                title: 'TOP-GYM • ¡Descanso Terminado!',
                body: 'Tu tiempo de recuperación ha finalizado. ¡A por la siguiente serie!',
                tag: 'topgym-rest-timer'
              });
            }
          }
          if (typeof updateTimerVisuals === 'function') updateTimerVisuals();
        }
      }
    });

    // Soporte para BFCache (Back-Forward Cache) en iOS Safari y Android Chrome
    window.addEventListener('pageshow', (event) => {
      const splash = document.getElementById('appSplashScreen');
      if (splash) {
        splash.style.display = 'none';
        splash.classList.add('splash-hidden');
      }
    });

    // Respaldo y sincronización automática cuando el equipo recupera conexión a internet
    window.addEventListener('online', () => {
      if (typeof StorageManager !== 'undefined' && StorageManager.syncWithCloud) {
        StorageManager.syncWithCloud().catch(() => {});
      }
    });

    // Sincronización casi en tiempo real (6s) para que las notificaciones lleguen a todos los equipos
    setInterval(() => {
      if (document.visibilityState === 'visible' && typeof StorageManager !== 'undefined' && StorageManager.syncWithCloud) {
        StorageManager.syncWithCloud().catch(() => {});
      }
    }, 6000);

    // Sincronización inmediata al volver a la app (cambio de pestaña o reapertura en móvil)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && typeof StorageManager !== 'undefined' && StorageManager.syncWithCloud) {
        StorageManager.syncWithCloud().catch(() => {});
      }
    });

    SoundEffects.init();
    NotificationManager.init();
    const hasActiveSession = setupRoleAndUser();
    try {
      setupNavigation();
      setupScheduleWeekBar();
      renderWorkoutPlansScreen();
      renderExerciseCatalog();
    } catch (setupErr) {
      console.warn('[initApp] Error al preparar navegación/pantallas iniciales (los botones seguirán funcionando):', setupErr);
    }

    if (hasActiveSession) {
      try {
        renderScheduleScreen();
        renderProgressScreen();
        if (appState.currentRole === 'coach') renderCoachScreen();
      } catch (renderErr) {
        console.warn('[initApp] Error al renderizar pantallas iniciales (los botones seguirán funcionando):', renderErr);
      }

      try {
        // Restaurar pantalla activa previa de la sesión móvil (multitarea)
        const savedScreen = sessionStorage.getItem('topgym_active_screen') || localStorage.getItem('topgym_last_active_screen');
        if (savedScreen && document.getElementById(savedScreen)) {
          switchScreen(savedScreen);
        } else if (appState.currentRole === 'coach') {
          switchScreen('coachScreen');
        } else {
          switchScreen('scheduleScreen');
        }

        // Restaurar entrenamiento en curso si la app fue suspendida en segundo plano
        const savedWorkout = sessionStorage.getItem('topgym_live_workout_session') || localStorage.getItem('topgym_live_workout_session');
        if (savedWorkout) {
          const parsed = JSON.parse(savedWorkout);
          if (parsed && parsed.task && parsed.active && (Date.now() - (parsed.startTime || parsed.timestamp || 0) < 43200000)) {
            resumeLiveWorkout(parsed);
          } else {
            clearLiveWorkoutState();
          }
        }
      } catch (_) {}
    }

    initAvatarPicker();
    setupEventListeners();
  }

  // Toast Notification (Desactivado por solicitud del usuario: "esos banners no deben salir")
  function showToast(message, type = 'success') {
    // Silenciado: solo las notificaciones de WhatsApp superiores se muestran cuando llega un evento real
    return;
  }

  // ==========================================================================
  // USER & ROLE MANAGEMENT (RESTRICTED COACH ACCESS & CONFIDENTIAL PROFILES)
  // ==========================================================================
  function setupRoleAndUser() {
    const session = StorageManager.getSession();
    if (session && session.userId) {
      const foundUser = appState.data.users.find(u => u.id === session.userId);
      if (foundUser) {
        appState.currentUser = foundUser;
        appState.currentRole = session.role || foundUser.role;
      } else {
        StorageManager.clearSession();
        appState.currentUser = null;
        appState.currentRole = null;
      }
    }

    if (!appState.currentUser) {
      // NO ACTIVE SESSION: Show authentication modal; hide coach navigation elements from students
      if (coachActiveBar) coachActiveBar.style.display = 'none';
      if (studentHeaderBox) studentHeaderBox.style.display = 'none';
      if (coachTabBtn) coachTabBtn.style.display = 'none';
      if (mobileCoachBtn) mobileCoachBtn.style.display = 'none';
      if (openCoachAuthModalBtn) openCoachAuthModalBtn.style.display = 'none';
      showLoginScreen();
      return false;
    }

    if (appState.currentRole === 'coach') {
      // Coach Humberto Salinas authenticated session
      if (coachActiveBar) coachActiveBar.style.display = 'flex';
      if (studentHeaderBox) studentHeaderBox.style.display = 'none';
      if (coachTabBtn) coachTabBtn.style.display = 'flex';
      if (mobileCoachBtn) mobileCoachBtn.style.display = 'flex';
      if (openCoachAuthModalBtn) openCoachAuthModalBtn.style.display = 'none';

      const headerCoachAvatar = document.getElementById('headerCoachAvatar');
      const headerCoachUserName = document.getElementById('headerCoachUserName');
      if (headerCoachAvatar && appState.currentUser) headerCoachAvatar.src = appState.currentUser.avatar;
      if (headerCoachUserName && appState.currentUser) headerCoachUserName.textContent = appState.currentUser.nick || appState.currentUser.name;

      if (typeof updateCoachBadges === 'function') updateCoachBadges();
      updateCoachProfileDropdown();

      // Alerta sonora y banner en tiempo real al Coach Humberto de mensajes no leídos de sus alumnos
      const unreadNotifs = (appState.data?.coachNotifications || []).filter(n => !n.isRead);
      if (unreadNotifs.length > 0 && !sessionStorage.getItem('topgym_coach_banner_shown')) {
        sessionStorage.setItem('topgym_coach_banner_shown', 'true');
        setTimeout(() => {
          if (typeof NotificationManager !== 'undefined' && NotificationManager.showInAppBanner) {
            const first = unreadNotifs[0];
            NotificationManager.playNotificationSound();
            NotificationManager.showInAppBanner({
              title: `TOP-GYM • Mensajes de Alumnos (${unreadNotifs.length} nuevo${unreadNotifs.length > 1 ? 's' : ''}) 💬`,
              body: unreadNotifs.length === 1 
                ? `El alumno ${first.studentName} te envió su reporte: "${first.feedback || first.workoutTitle}"`
                : `Tienes ${unreadNotifs.length} entregas de tus alumnos pendientes de revisar.`,
              avatar: first.studentAvatar || './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
              data: { action: 'open_task', taskId: first.taskId, studentId: first.studentId }
            });
          }
        }, 800);
      }
    } else {
      // Student mode: Strictly NO coach controls in mobile bar, desktop tabs or header
      if (coachActiveBar) coachActiveBar.style.display = 'none';
      if (coachTabBtn) coachTabBtn.style.display = 'none';
      if (mobileCoachBtn) mobileCoachBtn.style.display = 'none';
      if (openCoachAuthModalBtn) openCoachAuthModalBtn.style.display = 'none';
      if (studentHeaderBox) studentHeaderBox.style.display = 'flex';

      const coachReturnBtn = document.getElementById('coachReturnBtn');
      if (coachReturnBtn) {
        coachReturnBtn.style.display = appState.simulatedByCoach ? 'inline-flex' : 'none';
      }

      // Automatically align filters to the student's chosen modality
      if (appState.currentUser && appState.currentUser.preferredModality) {
        appState.catalogFilterModality = appState.currentUser.preferredModality;
        appState.plansFilterModality = appState.currentUser.preferredModality;
        appState.scheduleFilterModality = appState.currentUser.preferredModality;
      }

      if (typeof updateStudentBadges === 'function') updateStudentBadges();
      updateStudentProfileDropdown();

      // Alerta sonora y banner en tiempo real al Alumno si tiene asignaciones del Coach no leídas
      const unreadStudentNotifs = (appState.data?.studentNotifications || []).filter(n => n.studentId === appState.currentUser?.id && !n.isRead);
      if (unreadStudentNotifs.length > 0 && !sessionStorage.getItem('topgym_student_banner_shown')) {
        sessionStorage.setItem('topgym_student_banner_shown', 'true');
        setTimeout(() => {
          if (typeof NotificationManager !== 'undefined' && NotificationManager.showInAppBanner) {
            const first = unreadStudentNotifs[0];
            NotificationManager.playNotificationSound();
            NotificationManager.showInAppBanner({
              title: 'TOP-GYM • Coach Humberto Salinas 🏋️‍♂️',
              body: unreadStudentNotifs.length === 1 
                ? `¡Te asignó una nueva rutina: "${first.workoutTitle}"! ${first.coachNotes ? `"${first.coachNotes}"` : ''}`
                : `Tienes ${unreadStudentNotifs.length} nuevas rutinas asignadas por tu Coach en tu cronograma.`,
              avatar: './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg',
              data: { action: 'open_schedule', taskId: first.taskId }
            });
          }
        }, 800);
      }
    }

    if (headerAvatar) headerAvatar.src = appState.currentUser.avatar;
    if (headerUserName) headerUserName.textContent = appState.currentUser.nick || appState.currentUser.name;

    const progressHeroAvatar = document.getElementById('progressHeroAvatar');
    if (progressHeroAvatar) progressHeroAvatar.src = appState.currentUser.avatar;

    return true;
  }

  function renderStudentAccountCards() {
    const grid = document.getElementById('studentAccountsGrid');
    const select = document.getElementById('studentSelectLogin');
    if (!grid) return;

    grid.innerHTML = '';
    if (select) select.innerHTML = '';

    const students = appState.data.users.filter(u => u.role === 'student');
    if (students.length === 0) return;

    // Pick active selected student
    let selectedId = (select && select.value) || (appState.currentUser && appState.currentUser.id) || students[0].id;
    if (!students.some(s => s.id === selectedId)) {
      selectedId = students[0].id;
    }

    students.forEach(st => {
      if (select) {
        const opt = document.createElement('option');
        opt.value = st.id;
        opt.textContent = st.name;
        if (st.id === selectedId) opt.selected = true;
        select.appendChild(opt);
      }

      const card = document.createElement('div');
      const isSelected = st.id === selectedId;
      card.className = `student-account-card ${isSelected ? 'selected' : ''}`;
      card.dataset.studentId = st.id;

      const modLabel = st.preferredModality === 'home' ? 'En Casa' : 'Con Máquinas';

      card.innerHTML = `
        <img src="${st.avatar}" alt="${st.name}" class="card-avatar">
        <span class="card-name">${st.name}</span>
        <span class="card-tag">${modLabel}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.student-account-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (select) select.value = st.id;

        const studentLoginPin = document.getElementById('studentLoginPin');
        if (studentLoginPin) {
          studentLoginPin.value = '';
          studentLoginPin.focus();
        }
        const studentLoginErrorMsg = document.getElementById('studentLoginErrorMsg');
        if (studentLoginErrorMsg) studentLoginErrorMsg.style.display = 'none';
      });

      grid.appendChild(card);
    });

    const studentLoginPin = document.getElementById('studentLoginPin');
    if (studentLoginPin) {
      studentLoginPin.value = '';
    }
  }

  function showLoginScreen() {
    const screen = document.getElementById('loginScreen');
    if (!screen) return;
    screen.style.display = 'flex';
    document.body.classList.add('modal-open');

    const errBox = document.getElementById('loginErrorMessage');
    if (errBox) errBox.style.display = 'none';

    const uInput = document.getElementById('loginUsernameInput');
    const pInput = document.getElementById('loginPasswordInput');
    if (uInput) {
      uInput.value = '';
      setTimeout(() => uInput.focus(), 150);
    }
    if (pInput) {
      pInput.value = '';
      pInput.type = 'password';
    }
    const eyeOpen = document.getElementById('eyeIconOpenSvg');
    const eyeClosed = document.getElementById('eyeIconClosedSvg');
    if (eyeOpen) eyeOpen.style.display = 'block';
    if (eyeClosed) eyeClosed.style.display = 'none';
  }

  function hideLoginScreen() {
    const screen = document.getElementById('loginScreen');
    if (screen) {
      screen.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
  }

  function openSecurityAuthModal(defaultTab = 'student', isForced = false) {
    showLoginScreen();
  }

  function closeSecurityAuthModal() {
    hideLoginScreen();
  }

  function loginAsStudent(student) {
    if (!student) return;
    try {
      appState.currentUser = student;
      appState.currentRole = 'student';
      appState.simulatedByCoach = false;
      StorageManager.saveSession(student.id, 'student');
      hideLoginScreen();
      setupRoleAndUser();
      showToast(`¡Bienvenido, ${student.name}! Rutinas y datos cargados.`, 'success');
      setupScheduleWeekBar();
      renderScheduleScreen();
      renderWorkoutPlansScreen();
      renderExerciseCatalog();
      renderProgressScreen();
      switchScreen('scheduleScreen');
    } catch (err) {
      console.error('Error logging in as student:', err);
      hideLoginScreen();
      switchScreen('scheduleScreen');
    }
  }

  function loginAsCoach(coachUser) {
    if (!coachUser) return;
    try {
      appState.currentUser = coachUser;
      appState.currentRole = 'coach';
      appState.simulatedByCoach = false;
      StorageManager.saveSession(coachUser.id, 'coach');
      hideLoginScreen();
      setupRoleAndUser();
      showToast('¡Identidad confirmada! Bienvenido, Coach Humberto Salinas.', 'coach');
      setupScheduleWeekBar();
      renderScheduleScreen();
      renderWorkoutPlansScreen();
      renderExerciseCatalog();
      renderCoachScreen();
      switchScreen('coachScreen');
    } catch (err) {
      console.error('Error logging in as coach:', err);
      hideLoginScreen();
      switchScreen('coachScreen');
    }
  }

  function attemptUnifiedLogin() {
    const uInput = document.getElementById('loginUsernameInput');
    const pInput = document.getElementById('loginPasswordInput');
    const errBox = document.getElementById('loginErrorMessage');
    const errText = document.getElementById('loginErrorText');

    function showError(msg) {
      if (errBox) errBox.style.display = 'flex';
      if (errText) errText.textContent = msg;
    }

    if (errBox) errBox.style.display = 'none';

    const enteredUser = (uInput ? uInput.value : '').trim();
    const enteredPass = (pInput ? pInput.value : '').trim();

    if (!enteredUser) {
      showError('Por favor ingresa tu nombre de usuario, alumno o correo.');
      if (uInput) uInput.focus();
      return;
    }

    if (!enteredPass) {
      showError('Por favor ingresa tu contraseña.');
      if (pInput) pInput.focus();
      return;
    }

    const normEntered = enteredUser.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const allUsers = appState.data.users || [];

    // 1. Exact match on username, generated username, name, nick, or email
    let matchedUser = allUsers.find(u => {
      const uName = (u.username || '').toLowerCase().trim();
      const genUser = generateStudentUsername(u.name || '');
      const nameNorm = (u.name || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      const nickNorm = (u.nick || u.nickname || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      const emailNorm = (u.email || '').toLowerCase().trim();
      return uName === normEntered || 
             genUser === normEntered || 
             nameNorm === normEntered || 
             nickNorm === normEntered || 
             emailNorm === normEntered;
    });

    // 2. Substring match
    if (!matchedUser) {
      matchedUser = allUsers.find(u => {
        const uName = (u.username || '').toLowerCase().trim();
        const genUser = generateStudentUsername(u.name || '');
        const nameNorm = (u.name || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const nickNorm = (u.nick || u.nickname || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const emailNorm = (u.email || '').toLowerCase().trim();
        return uName.includes(normEntered) || genUser.includes(normEntered) ||
               nameNorm.includes(normEntered) || normEntered.includes(nameNorm) ||
               nickNorm.includes(normEntered) || (normEntered.length >= 3 && emailNorm.includes(normEntered));
      });
    }

    // 3. Fallback for tsalinas / tayron
    if (!matchedUser && (normEntered === 'tsalinas' || normEntered.includes('tayron') || normEntered.includes('tsalina'))) {
      matchedUser = allUsers.find(u => u.username === 'tsalinas' || u.id === 'usr_student_3');
      if (!matchedUser) {
        matchedUser = {
          id: 'usr_student_3',
          name: 'Tayron Salinas',
          username: 'tsalinas',
          nick: 'Tayron',
          email: 'tayron.salinas@topgym.com',
          phone: '+57 310 987 1991',
          role: 'student',
          pin: '1991',
          age: 26,
          district: 'San Isidro',
          goal: 'Acondicionamiento y Fuerza Funcional',
          preferredModality: 'machine',
          weight: 78.0,
          height: 178,
          assignedCoachId: 'usr_coach_1',
          avatar: './GYMTOP/resources/res/drawable/im_comentario_1.jpg',
          stats: { completedWorkouts: 12, currentStreak: 4, totalVolumeKg: 26400 }
        };
        allUsers.push(matchedUser);
        if (typeof StorageManager !== 'undefined' && appState.data) {
          StorageManager.save(appState.data);
        }
      }
    }

    // 4. Fallback for coach keywords
    if (!matchedUser && (normEntered.includes('coach') || normEntered.includes('humberto'))) {
      matchedUser = allUsers.find(u => u.role === 'coach') || allUsers[0];
    }

    if (!matchedUser) {
      showError('Usuario o correo no encontrado. Verifica tus datos o usa "¿Olvidaste tu contraseña?".');
      if (uInput) uInput.focus();
      return;
    }

    // Validate Password (Strict: ONLY the active registered PIN/Password is valid; previous passwords are fully revoked)
    const registeredPin = String(matchedUser.pin || '').trim();
    const isPasswordValid = Boolean(registeredPin && enteredPass === registeredPin);

    if (!isPasswordValid) {
      showError('Contraseña incorrecta. Por favor verifica tus credenciales.');
      if (pInput) {
        pInput.value = '';
        pInput.focus();
      }
      return;
    }

    // Authentication passed! Route by role
    if (matchedUser.role === 'coach') {
      loginAsCoach(matchedUser);
    } else {
      loginAsStudent(matchedUser);
    }
  }

  // ==========================================================================
  // PASSWORD RECOVERY VIA REGISTERED EMAIL & UNIQUE RESET LINK
  // ==========================================================================
  let pendingResetUser = null;

  function openForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (!modal) return;

    // Reset steps
    const step1 = document.getElementById('forgotStepRequestEmail');
    const step2 = document.getElementById('forgotStepInboxEmail');
    const step3 = document.getElementById('forgotStepNewPassword');
    const form = document.getElementById('forgotPasswordForm');
    const err1 = document.getElementById('forgotErrorMsg');
    const err3 = document.getElementById('newPassErrorMsg');
    const emailInput = document.getElementById('forgotEmailInput');

    if (form) form.reset();
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (step3) step3.style.display = 'none';
    if (err1) err1.style.display = 'none';
    if (err3) err3.style.display = 'none';

    pendingResetUser = null;

    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    if (emailInput) setTimeout(() => emailInput.focus(), 150);
  }

  function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
    pendingResetUser = null;

    const loginScr = document.getElementById('loginScreen');
    if (!loginScr || loginScr.style.display === 'none') {
      document.body.classList.remove('modal-open');
    }
  }

  function handleSendResetLink(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById('forgotEmailInput');
    const errMsg = document.getElementById('forgotErrorMsg');
    if (errMsg) errMsg.style.display = 'none';

    const enteredEmail = (emailInput ? emailInput.value : '').trim().toLowerCase();
    if (!enteredEmail) {
      if (errMsg) {
        errMsg.style.display = 'block';
        errMsg.textContent = 'Por favor ingresa un correo electrónico registrado.';
      }
      return;
    }

    const allUsers = appState.data.users || [];
    const foundUser = allUsers.find(u => {
      const email = (u.email || '').toLowerCase().trim();
      const name = (u.name || '').toLowerCase().trim();
      const nick = (u.nick || '').toLowerCase().trim();
      return email === enteredEmail || name === enteredEmail || nick === enteredEmail;
    });

    if (!foundUser) {
      if (errMsg) {
        errMsg.style.display = 'block';
        errMsg.textContent = 'No se encontró ninguna cuenta registrada con este correo electrónico. Por favor verifica tus datos.';
      }
      return;
    }

    pendingResetUser = foundUser;

    // Generate unique token and personalized reset URL
    const uniqueToken = 'tg_sec_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const uniqueLinkUrl = `https://topgym.app/auth/reset-password?token=${uniqueToken}&uid=${foundUser.id}`;

    // Populate Step 2 (Simulated Inbox)
    const inboxRecipientEmail = document.getElementById('inboxRecipientEmail');
    const inboxRecipientName = document.getElementById('inboxRecipientName');
    const inboxGreetingName = document.getElementById('inboxGreetingName');
    const inboxUniqueLinkText = document.getElementById('inboxUniqueLinkText');

    if (inboxRecipientEmail) inboxRecipientEmail.textContent = foundUser.email;
    if (inboxRecipientName) inboxRecipientName.textContent = foundUser.name;
    if (inboxGreetingName) inboxGreetingName.textContent = foundUser.name;
    if (inboxUniqueLinkText) inboxUniqueLinkText.textContent = uniqueLinkUrl;

    // Switch view to Step 2
    const step1 = document.getElementById('forgotStepRequestEmail');
    const step2 = document.getElementById('forgotStepInboxEmail');
    if (step1) step1.style.display = 'none';
    if (step2) {
      step2.style.display = 'block';
      step2.scrollIntoView({ behavior: 'smooth' });
    }

    SoundEffects.chime();
    showToast(`Enlace único de recuperación enviado a ${foundUser.email}`, 'coach');
  }

  function handleOpenResetPasswordForm() {
    if (!pendingResetUser) return;
    const step2 = document.getElementById('forgotStepInboxEmail');
    const step3 = document.getElementById('forgotStepNewPassword');
    const newPassName = document.getElementById('newPassAccountName');
    const newPassEmail = document.getElementById('newPassAccountEmail');
    const p1 = document.getElementById('newPasswordInput');
    const p2 = document.getElementById('confirmPasswordInput');
    const err3 = document.getElementById('newPassErrorMsg');

    if (newPassName) newPassName.textContent = pendingResetUser.name;
    if (newPassEmail) newPassEmail.textContent = pendingResetUser.email;
    if (p1) p1.value = '';
    if (p2) p2.value = '';
    if (err3) err3.style.display = 'none';

    if (step2) step2.style.display = 'none';
    if (step3) {
      step3.style.display = 'block';
      if (p1) setTimeout(() => p1.focus(), 150);
    }
  }

  function handleSaveNewPassword(e) {
    if (e) e.preventDefault();
    if (!pendingResetUser) return;

    const p1 = document.getElementById('newPasswordInput');
    const p2 = document.getElementById('confirmPasswordInput');
    const errMsg = document.getElementById('newPassErrorMsg');
    if (errMsg) errMsg.style.display = 'none';

    const val1 = (p1 ? p1.value : '').trim();
    const val2 = (p2 ? p2.value : '').trim();

    if (!val1 || !val2) {
      if (errMsg) {
        errMsg.style.display = 'block';
        errMsg.textContent = 'Por favor completa ambos campos de contraseña.';
      }
      return;
    }

    if (val1.length < 4) {
      if (errMsg) {
        errMsg.style.display = 'block';
        errMsg.textContent = 'La nueva contraseña debe tener un mínimo de 4 caracteres.';
      }
      return;
    }

    if (val1 !== val2) {
      if (errMsg) {
        errMsg.style.display = 'block';
        errMsg.textContent = 'Las contraseñas no coinciden. Por favor verifica que sean iguales.';
      }
      return;
    }

    // Update in data.users
    const userInDb = (appState.data.users || []).find(u => u.id === pendingResetUser.id);
    if (userInDb) {
      userInDb.pin = val1;
      userInDb.updatedAt = Date.now();
    }
    pendingResetUser.pin = val1;
    pendingResetUser.updatedAt = Date.now();
    if (appState.currentUser && appState.currentUser.id === pendingResetUser.id) {
      appState.currentUser.pin = val1;
      appState.currentUser.updatedAt = Date.now();
    }
    StorageManager.save(appState.data, true, true);

    // Real-time broadcast across all tabs
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('topgym_notif_bus');
        bc.postMessage({ type: 'PROFILE_UPDATED_EVENT', userId: pendingResetUser.id, user: userInDb });
      } catch(e) {}
    }

    if (typeof renderCoachScreen === 'function') renderCoachScreen();

    SoundEffects.chime();
    showToast(`¡Contraseña de ${pendingResetUser.name} actualizada con éxito! La contraseña anterior fue eliminada.`, 'success');

    // Pre-fill login form with account and new password
    const loginUser = document.getElementById('loginUsernameInput');
    const loginPass = document.getElementById('loginPasswordInput');
    if (loginUser) loginUser.value = pendingResetUser.email || pendingResetUser.username;
    if (loginPass) loginPass.value = val1;

    closeForgotPasswordModal();
  }

  function openMyProfileModal() {
    if (!myProfileModal) return;
    const cur = appState.currentUser;
    if (!cur) return;

    const av = document.getElementById('myProfileModalAvatar');
    const name = document.getElementById('myProfileModalName');
    const role = document.getElementById('myProfileModalRole');
    const goal = document.getElementById('myProfileModalGoal');
    const modality = document.getElementById('myProfileModalModality');
    const phone = document.getElementById('myProfileModalPhone');
    const email = document.getElementById('myProfileModalEmail');
    const weightHeight = document.getElementById('myProfileModalWeightHeight');
    const coachEl = document.getElementById('myProfileModalCoach');
    const pin = document.getElementById('myProfileModalPin');

    if (av) av.src = cur.avatar || './GYMTOP/resources/res/drawable/im_comentario_4.jpg';
    if (name) name.textContent = cur.name;
    if (role) role.textContent = cur.role === 'coach' ? 'Entrenador TOP-GYM' : 'Alumno TOP-GYM';
    if (goal) goal.textContent = cur.goal || 'Entrenamiento Pro';
    if (modality) modality.textContent = cur.role === 'coach' ? 'Entrenador Personal TOP-GYM' : (cur.preferredModality === 'home' ? 'En Casa (Sin Máquinas)' : 'Con Máquinas & Poleas');
    if (phone) phone.textContent = cur.phone || 'Sin número registrado';
    if (email) email.textContent = cur.email || 'Sin correo registrado';
    if (weightHeight) weightHeight.textContent = `${cur.weight || 70} kg • ${cur.height || 175} cm`;
    const uNameEl = document.getElementById('myProfileModalUsername');
    if (uNameEl) uNameEl.textContent = cur.username || generateStudentUsername(cur.name);
    if (coachEl) coachEl.textContent = cur.role === 'coach' ? 'Entrenador Titular TOP-GYM' : 'Coach Humberto Salinas';
    if (pin) pin.textContent = '•••• (Protegido)';

    myProfileModal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeMyProfileModal() {
    if (!myProfileModal) return;
    myProfileModal.classList.remove('active');
    if (!document.querySelector('.modal-overlay.active')) {
      document.body.classList.remove('modal-open');
    }
  }

  function openEditProfileModal(targetUserId = null) {
    const editProfileModal = document.getElementById('editProfileModal');
    if (!editProfileModal) return;
    const target = targetUserId 
      ? appState.data.users.find(u => u.id === targetUserId) 
      : appState.currentUser;
    if (!target) return;

    const idInput = document.getElementById('editProfileTargetUserId');
    const titleEl = document.getElementById('editProfileModalTitle');
    const avatarPreview = document.getElementById('editProfileAvatarPreview');
    const nameInput = document.getElementById('editProfileName');
    const nickInput = document.getElementById('editProfileNick');
    const phoneInput = document.getElementById('editProfilePhone');
    const emailInput = document.getElementById('editProfileEmail');
    const weightInput = document.getElementById('editProfileWeight');
    const heightInput = document.getElementById('editProfileHeight');
    const modalitySelect = document.getElementById('editProfileModality');
    const goalInput = document.getElementById('editProfileGoal');
    const pinInput = document.getElementById('editProfilePin');

    if (idInput) idInput.value = target.id;
    if (titleEl) {
      titleEl.textContent = (target.id === appState.currentUser?.id)
        ? 'Editar Mi Perfil'
        : `Editar Perfil de ${target.name}`;
    }
    if (avatarPreview) avatarPreview.src = target.avatar || './GYMTOP/resources/res/drawable/im_comentario_4.jpg';
    if (nameInput) nameInput.value = target.name || '';
    if (nickInput) nickInput.value = target.nick || target.nickname || target.name.split(' ')[0] || '';
    if (phoneInput) phoneInput.value = target.phone || '';
    if (emailInput) emailInput.value = target.email || '';
    if (weightInput) weightInput.value = target.weight || 70;
    if (heightInput) heightInput.value = target.height || 175;
    const ageInput = document.getElementById('editProfileAge');
    if (ageInput) ageInput.value = target.age || 24;
    const districtSelect = document.getElementById('editProfileDistrict');
    if (districtSelect) districtSelect.value = target.district || 'Miraflores';
    if (modalitySelect) modalitySelect.value = target.preferredModality || 'machine';
    if (goalInput) goalInput.value = target.goal || '';
    if (pinInput) {
      pinInput.value = target.pin || '';
      pinInput.type = 'password';
    }

    editProfileModal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeEditProfileModal() {
    const editProfileModal = document.getElementById('editProfileModal');
    if (!editProfileModal) return;
    editProfileModal.classList.remove('active');
    if (!document.querySelector('.modal-overlay.active')) {
      document.body.classList.remove('modal-open');
    }
  }

  function updateStudentBadges() {
    if (!appState.currentUser || appState.currentRole !== 'student') return;

    const notifs = (appState.data?.studentNotifications || []).filter(n => n.studentId === appState.currentUser.id && !n.isRead);
    const pendingTasks = (appState.data?.tasks || []).filter(t => t.studentId === appState.currentUser.id && t.status === 'pending');
    const unreadCount = notifs.length;

    const headerBadge = document.getElementById('studentHeaderNotifBadge');
    if (headerBadge) {
      if (unreadCount > 0) {
        headerBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        headerBadge.style.display = 'inline-flex';
      } else {
        headerBadge.style.display = 'none';
      }
    }

    const scheduleNavBadge = document.getElementById('studentScheduleNavBadge');
    if (scheduleNavBadge) {
      const count = unreadCount > 0 ? unreadCount : pendingTasks.length;
      if (count > 0) {
        scheduleNavBadge.textContent = count > 99 ? '99+' : count;
        scheduleNavBadge.style.display = 'inline-flex';
      } else {
        scheduleNavBadge.style.display = 'none';
      }
    }

    const dropdownCounter = document.getElementById('dropdownNotifCounter');
    if (dropdownCounter) {
      const count = unreadCount > 0 ? unreadCount : pendingTasks.length;
      if (count > 0) {
        dropdownCounter.textContent = `${count} ${count === 1 ? 'rutina' : 'rutinas'}`;
        dropdownCounter.style.background = unreadCount > 0 ? '#ff6d00' : 'var(--accent-orange)';
        dropdownCounter.style.display = 'inline-flex';
      } else {
        dropdownCounter.textContent = 'Al día';
        dropdownCounter.style.background = '#10b981';
        dropdownCounter.style.display = 'inline-flex';
      }
    }
  }
  window.updateStudentBadges = updateStudentBadges;

  function markStudentNotificationAsRead(taskId) {
    if (!appState.data || !appState.data.studentNotifications || !appState.currentUser) return;
    let changed = false;
    appState.data.studentNotifications.forEach(n => {
      if (n.studentId === appState.currentUser.id) {
        if (!taskId || n.taskId === taskId || n.id === taskId) {
          if (!n.isRead) {
            n.isRead = true;
            changed = true;
          }
        }
      }
    });
    if (changed) {
      StorageManager.save(appState.data);
      updateStudentBadges();
      updateStudentProfileDropdown();
    }
  }
  window.markStudentNotificationAsRead = markStudentNotificationAsRead;

  function updateStudentProfileDropdown() {
    const dropdown = document.getElementById('studentProfileDropdown');
    if (!dropdown || !appState.currentUser) return;

    const av = document.getElementById('dropdownUserAvatar');
    const name = document.getElementById('dropdownUserName');
    const mod = document.getElementById('dropdownUserModality');
    const content = document.getElementById('dropdownNotifContent');

    if (av) av.src = appState.currentUser.avatar || './GYMTOP/resources/res/drawable/im_comentario_4.jpg';
    if (name) name.textContent = appState.currentUser.name;
    if (mod) mod.textContent = appState.currentUser.preferredModality === 'home' ? 'En Casa' : 'Con Máquinas';

    updateStudentBadges();

    const notifs = (appState.data?.studentNotifications || []).filter(n => n.studentId === appState.currentUser.id);
    const unreadNotifs = notifs.filter(n => !n.isRead);
    const studentTasks = (appState.data?.tasks || []).filter(t => t.studentId === appState.currentUser.id && t.status === 'pending');

    if (!content) return;
    content.innerHTML = '';

    if (notifs.length === 0 && studentTasks.length === 0) {
      content.innerHTML = `
        <div style="padding: 0.8rem; text-align: center; color: var(--text-secondary); font-size: 0.76rem;">
          <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: #10b981; margin: 0 auto 4px auto; display: block;"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
          <span>¡Estás al día! No tienes nuevas tareas asignadas por tu Coach Humberto.</span>
        </div>
      `;
      return;
    }

    const items = [];

    // Priorizar notificaciones asignadas con badge ¡NUEVA RUTINA!
    if (notifs.length > 0) {
      notifs.slice(0, 5).forEach(n => {
        const isUnread = !n.isRead;
        const borderStyle = isUnread 
          ? 'border-left: 3px solid #ff9100; background: rgba(255, 145, 0, 0.08);' 
          : 'border-left: 3px solid #00b0ff;';
        const unreadBadge = isUnread 
          ? '<span style="background: #ff9100; color: #fff; font-size: 0.62rem; font-weight: 800; padding: 1px 6px; border-radius: 6px; letter-spacing: 0.3px;">¡NUEVA RUTINA!</span>' 
          : '';

        items.push(`
          <div class="dropdown-coach-msg-card selectable-student-notif-item ${isUnread ? 'is-unread-item' : ''}" data-task-id="${n.taskId}" style="${borderStyle}; cursor: pointer; margin-bottom: 6px;" role="button" tabindex="0" title="Toca para ir a la rutina en tu Cronograma">
            <img src="./GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg" alt="Coach Humberto Salinas" class="dropdown-coach-avatar">
            <div class="dropdown-coach-text" style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                <span class="dropdown-coach-title-label" style="font-size: 0.72rem; font-weight: 700; color: #ff9100;">Coach Humberto Salinas</span>
                ${unreadBadge}
              </div>
              <p style="font-size: 0.76rem; color: var(--text-primary); margin: 2px 0 0 0; line-height: 1.35; font-weight: 700;">
                "${n.workoutTitle}"
              </p>
              ${n.coachNotes ? `
                <div style="font-size: 0.72rem; color: var(--text-secondary); font-style: italic; margin-top: 2px; line-height: 1.3;">
                  "${n.coachNotes}"
                </div>
              ` : ''}
              <div style="font-size: 0.67rem; color: var(--text-muted); margin-top: 3px;">
                Fecha: ${n.scheduledDate || 'Hoy'} • Asignada: ${n.assignedAt || ''}
              </div>
            </div>
            <svg viewBox="0 0 24 24" class="activity-card-chevron"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </div>
        `);
      });
    } else {
      // Fallback para tareas pendientes existentes
      studentTasks.slice(0, 3).forEach(t => {
        items.push(`
          <div class="dropdown-coach-msg-card selectable-student-notif-item" data-task-id="${t.id}" style="border-left: 3px solid #ff9100; cursor: pointer; margin-bottom: 6px;" role="button" tabindex="0">
            <img src="./GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg" alt="Coach Humberto Salinas" class="dropdown-coach-avatar">
            <div class="dropdown-coach-text" style="flex: 1;">
              <div class="dropdown-coach-title-label" style="font-size: 0.72rem; font-weight: 700; color: #ff9100;">Coach Humberto Salinas</div>
              <p style="font-size: 0.76rem; color: var(--text-primary); margin: 2px 0 0 0; font-weight: 700;">
                "${t.workoutTitle}"
              </p>
              <div style="font-size: 0.67rem; color: var(--text-muted); margin-top: 2px;">Programada para: ${t.scheduledDate || 'Hoy'}</div>
            </div>
            <svg viewBox="0 0 24 24" class="activity-card-chevron"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </div>
        `);
      });
    }

    items.push(`
      <button type="button" id="dropdownGoToTasksBtn" class="dropdown-task-link-btn" style="width: 100%; margin-top: 4px; display: flex;">
        <span>Ir a mi Cronograma y entrenar</span>
        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
      </button>
    `);

    content.innerHTML = items.join('');

    content.onclick = (e) => {
      const card = e.target.closest('.selectable-student-notif-item');
      if (card) {
        e.preventDefault();
        e.stopPropagation();
        const taskId = card.getAttribute('data-task-id');
        markStudentNotificationAsRead(taskId);
        closeStudentProfileDropdown();
        switchScreen('scheduleScreen');
        if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') SoundEffects.tap();
        setTimeout(() => {
          const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
          if (taskCard) taskCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return;
      }

      if (e.target.closest('#dropdownGoToTasksBtn')) {
        e.preventDefault();
        e.stopPropagation();
        closeStudentProfileDropdown();
        switchScreen('scheduleScreen');
        if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') SoundEffects.tap();
      }
    };
  }

  function toggleStudentProfileDropdown() {
    const dropdown = document.getElementById('studentProfileDropdown');
    if (!dropdown) return;
    const isVisible = dropdown.style.display === 'block';
    if (isVisible) {
      closeStudentProfileDropdown();
    } else {
      openStudentProfileDropdown();
    }
  }

  function openStudentProfileDropdown() {
    const dropdown = document.getElementById('studentProfileDropdown');
    const picker = document.getElementById('profilePickerBtn');
    if (!dropdown) return;
    updateStudentProfileDropdown();
    dropdown.style.display = 'block';
    if (picker) picker.classList.add('open');
  }

  function closeStudentProfileDropdown() {
    const dropdown = document.getElementById('studentProfileDropdown');
    const picker = document.getElementById('profilePickerBtn');
    if (dropdown) dropdown.style.display = 'none';
    if (picker) picker.classList.remove('open');
  }

  function updateCoachBadges() {
    const notifs = appState.data?.coachNotifications || [];
    const unreadCount = notifs.filter(n => !n.isRead).length;

    const headerBadge = document.getElementById('coachHeaderNotifBadge');
    if (headerBadge) {
      if (unreadCount > 0) {
        headerBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        headerBadge.style.display = 'inline-flex';
      } else {
        headerBadge.style.display = 'none';
      }
    }

    const bottomNavBadge = document.getElementById('coachBottomNavBadge');
    if (bottomNavBadge) {
      if (unreadCount > 0) {
        bottomNavBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        bottomNavBadge.style.display = 'inline-flex';
      } else {
        bottomNavBadge.style.display = 'none';
      }
    }

    const counter = document.getElementById('dropdownCoachNotifCounter');
    if (counter) {
      const allTasks = appState.data?.tasks || [];
      const completedTasks = allTasks.filter(t => t.status === 'completed');
      if (unreadCount > 0) {
        counter.textContent = `${unreadCount} NUEVA${unreadCount > 1 ? 'S' : ''}`;
        counter.style.background = '#ef4444';
        counter.style.display = 'inline-block';
      } else {
        counter.textContent = notifs.length || completedTasks.length;
        counter.style.background = '#00b0ff';
        counter.style.display = (notifs.length || completedTasks.length) > 0 ? 'inline-block' : 'none';
      }
    }
  }
  window.updateCoachBadges = updateCoachBadges;

  function markCoachNotificationAsRead(taskId) {
    if (!appState.data || !appState.data.coachNotifications) return;
    let changed = false;
    appState.data.coachNotifications.forEach(n => {
      if (!taskId || n.taskId === taskId || n.id === taskId) {
        if (!n.isRead) {
          n.isRead = true;
          changed = true;
        }
      }
    });
    if (changed) {
      StorageManager.save(appState.data);
      updateCoachBadges();
      updateCoachProfileDropdown();
    }
  }
  window.markCoachNotificationAsRead = markCoachNotificationAsRead;

  function updateCoachProfileDropdown() {
    const dropdown = document.getElementById('coachProfileDropdown');
    if (!dropdown || !appState.currentUser) return;

    const av = document.getElementById('dropdownCoachUserAvatar');
    const name = document.getElementById('dropdownCoachUserName');
    const counter = document.getElementById('dropdownCoachNotifCounter');
    const content = document.getElementById('dropdownCoachNotifContent');

    if (av) av.src = appState.currentUser.avatar || './GYMTOP/resources/res/drawable/img_bg_inspiration_phrase_screen_default_1.jpg';
    if (name) name.textContent = appState.currentUser.name;

    const allTasks = appState.data?.tasks || [];
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const pendingTasks = allTasks.filter(t => t.status === 'pending');
    const students = (appState.data?.users || []).filter(u => u.role === 'student');

    const notifCount = completedTasks.length + pendingTasks.length;
    if (counter) {
      counter.textContent = notifCount;
      counter.style.display = notifCount > 0 ? 'inline-block' : 'none';
    }

    if (!content) return;
    content.innerHTML = '';

    if (notifCount === 0) {
      content.innerHTML = `
        <div style="padding: 0.6rem; text-align: center; color: var(--text-secondary); font-size: 0.76rem;">
          <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: #10b981; margin: 0 auto 4px auto; display: block;"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
          <span>Todos tus ${students.length} alumnos están al día. Sin entregas pendientes.</span>
        </div>
      `;
    } else {
      const items = [];

      const notifs = appState.data?.coachNotifications || [];
      if (notifs.length > 0) {
        notifs.slice(0, 7).forEach(n => {
          const isUnread = !n.isRead;
          const borderStyle = isUnread 
            ? 'border-left: 3px solid #ef4444; background: rgba(239, 68, 68, 0.08);' 
            : 'border-left: 3px solid #10b981;';
          const unreadBadge = isUnread 
            ? '<span style="background: #ef4444; color: #fff; font-size: 0.62rem; font-weight: 800; padding: 1px 6px; border-radius: 6px; letter-spacing: 0.3px;">¡NUEVO MENSAJE!</span>' 
            : '';
          const msgSnippet = n.feedback ? `
            <div class="dropdown-coach-feedback-snippet" style="font-size: 0.74rem; margin-top: 4px; font-style: italic; border-left: 2px solid #00b0ff; padding: 2px 7px; border-radius: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35; background: var(--bg-card); color: var(--text-primary);">
              "${n.feedback}"
            </div>
          ` : '';

          items.push(`
            <div class="dropdown-coach-msg-card selectable-activity-item ${isUnread ? 'is-unread-msg' : ''}" data-task-id="${n.taskId}" data-student-id="${n.studentId}" onclick="if(window.openCoachNotificationDetail) window.openCoachNotificationDetail('${n.taskId}', '${n.studentId}')" style="${borderStyle}" role="button" tabindex="0" title="Toca para ver el mensaje completo de ${n.studentName}">
              <img src="${n.studentAvatar}" alt="${n.studentName}" class="dropdown-coach-avatar">
              <div class="dropdown-coach-text" style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                  <span style="font-size: 0.74rem; color: ${isUnread ? '#ef4444' : '#10b981'}; font-weight: 800;">${n.studentName}</span>
                  ${unreadBadge}
                </div>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 2px 0 0 0; line-height: 1.3;">
                  Completó: <strong>"${n.workoutTitle}"</strong> • <span style="color: var(--accent-orange); font-weight: 700;">RPE ${n.rpe}/10</span>
                </p>
                ${msgSnippet}
                <div style="font-size: 0.67rem; color: var(--text-muted); margin-top: 2px;">${n.completedAt || ''}</div>
              </div>
              <svg viewBox="0 0 24 24" class="activity-card-chevron"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
          `);
        });
      }

      // Completed tasks (delivered by students)
      completedTasks.slice(0, 5).forEach(t => {
        const student = students.find(s => s.id === t.studentId) || { id: t.studentId, name: 'Alumno', avatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg' };
        const dateText = t.completedAt ? `(${t.completedAt})` : (t.scheduledDate ? `(${t.scheduledDate})` : '');
        const messageSnippet = t.studentFeedback ? `
          <div class="dropdown-coach-feedback-snippet" style="font-size: 0.72rem; margin-top: 3px; font-style: italic; border-left: 2px solid #00b0ff; padding: 2px 6px; border-radius: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">
            "${t.studentFeedback}"
          </div>
        ` : '';
        items.push(`
          <div class="dropdown-coach-msg-card selectable-activity-item" data-task-id="${t.id}" data-student-id="${student.id}" onclick="if(window.openCoachNotificationDetail) window.openCoachNotificationDetail('${t.id}', '${student.id}')" style="border-left: 3px solid #10b981;" role="button" tabindex="0" title="Toca para abrir y ver el mensaje completo de ${student.name}">
            <img src="${student.avatar}" alt="${student.name}" class="dropdown-coach-avatar">
            <div class="dropdown-coach-text">
              <div style="font-size: 0.72rem; color: #10b981; font-weight: 700;">${student.name} • ¡Tarea Entregada!</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 2px 0 0 0; line-height: 1.3;">
                Completó: "${t.workoutTitle}" ${dateText}
              </p>
              ${messageSnippet}
            </div>
            <svg viewBox="0 0 24 24" class="activity-card-chevron"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </div>
        `);
      });

      // Pending tasks
      pendingTasks.slice(0, 5).forEach(t => {
        const student = students.find(s => s.id === t.studentId) || { id: t.studentId, name: 'Alumno', avatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg' };
        items.push(`
          <div class="dropdown-coach-msg-card selectable-activity-item" data-task-id="${t.id}" data-student-id="${student.id}" onclick="if(window.openCoachNotificationDetail) window.openCoachNotificationDetail('${t.id}', '${student.id}')" style="border-left: 3px solid #ff9100;" role="button" tabindex="0" title="Toca para ver los detalles de supervisión de ${student.name}">
            <img src="${student.avatar}" alt="${student.name}" class="dropdown-coach-avatar">
            <div class="dropdown-coach-text">
              <div style="font-size: 0.72rem; color: #ff9100; font-weight: 700;">${student.name} • En Entrenamiento</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 2px 0 0 0; line-height: 1.3;">
                Tarea asignada: "${t.workoutTitle}"
              </p>
            </div>
            <svg viewBox="0 0 24 24" class="activity-card-chevron"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </div>
        `);
      });

      content.innerHTML = items.join('');

      // Delegated click handler on container for guaranteed event capture
      content.onclick = (e) => {
        const card = e.target.closest('.selectable-activity-item');
        if (card) {
          e.preventDefault();
          e.stopPropagation();
          const taskId = card.getAttribute('data-task-id');
          const studentId = card.getAttribute('data-student-id');
          openCoachNotificationDetail(taskId, studentId);
        }
      };

      // Direct listeners on all activity cards
      content.querySelectorAll('.selectable-activity-item').forEach(card => {
        card.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            const taskId = card.getAttribute('data-task-id');
            const studentId = card.getAttribute('data-student-id');
            openCoachNotificationDetail(taskId, studentId);
          }
        });
      });
    }

    const coachGoToInboxBtn = document.getElementById('dropdownCoachGoToInboxBtn');
    if (coachGoToInboxBtn && !coachGoToInboxBtn.dataset.bound) {
      coachGoToInboxBtn.dataset.bound = 'true';
      coachGoToInboxBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeCoachProfileDropdown();
        if (appState.simulatedByCoach) {
          appState.simulatedByCoach = false;
          const coachUser = (appState.data?.users || []).find(u => u.role === 'coach') || (window.GymData?.users || []).find(u => u.role === 'coach');
          if (coachUser) {
            appState.currentUser = coachUser;
            appState.currentRole = 'coach';
            StorageManager.saveSession(coachUser.id, 'coach');
            setupRoleAndUser();
          }
        }
        appState.coachInboxFilter = 'all';
        switchScreen('coachScreen');
        switchCoachTab('inbox');
        renderCoachScreen();
        if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') {
          SoundEffects.tap();
        }
        setTimeout(() => {
          const inboxSec = document.getElementById('coachDeliveriesInboxSection');
          if (inboxSec) inboxSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      });
    }

    const notifHeader = document.getElementById('dropdownCoachNotifHeader');
    if (notifHeader && !notifHeader.dataset.bound) {
      notifHeader.dataset.bound = 'true';
      notifHeader.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeCoachProfileDropdown();
        if (appState.simulatedByCoach) {
          appState.simulatedByCoach = false;
          const coachUser = (appState.data?.users || []).find(u => u.role === 'coach') || (window.GymData?.users || []).find(u => u.role === 'coach');
          if (coachUser) {
            appState.currentUser = coachUser;
            appState.currentRole = 'coach';
            StorageManager.saveSession(coachUser.id, 'coach');
            setupRoleAndUser();
          }
        }
        appState.coachInboxFilter = 'all';
        switchScreen('coachScreen');
        switchCoachTab('inbox');
        renderCoachScreen();
        if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') {
          SoundEffects.tap();
        }
        setTimeout(() => {
          const inboxSec = document.getElementById('coachDeliveriesInboxSection');
          if (inboxSec) inboxSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      });
    }
  }

  function openCoachNotificationDetail(taskId, studentId) {
    if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') {
      SoundEffects.tap();
    }
    closeCoachProfileDropdown();
    if (typeof markCoachNotificationAsRead === 'function') {
      markCoachNotificationAsRead(taskId);
    }

    if (appState.simulatedByCoach) {
      appState.simulatedByCoach = false;
      const coachUser = (appState.data?.users || []).find(u => u.role === 'coach') || (window.GymData?.users || []).find(u => u.role === 'coach');
      if (coachUser) {
        appState.currentUser = coachUser;
        appState.currentRole = 'coach';
        StorageManager.saveSession(coachUser.id, 'coach');
        setupRoleAndUser();
      }
    }

    // 1. Direct navigation to Coach Screen and switch to Inbox Tab with all active
    appState.coachInboxFilter = 'all';
    switchScreen('coachScreen');
    switchCoachTab('inbox');
    renderCoachScreen();

    // 2. Direct navigation to student card and open the complete message modal!
    navigateToInboxTask(taskId);
    openCoachTaskDetailModal(taskId, studentId);
  }
  window.openCoachNotificationDetail = openCoachNotificationDetail;

  function openCoachTaskDetailModal(taskId, studentId) {
    const modal = document.getElementById('coachTaskDetailModal');
    if (!modal) return;
    if (typeof markCoachNotificationAsRead === 'function') {
      markCoachNotificationAsRead(taskId);
    }

    let task = (appState.data?.tasks || []).find(t => t.id === taskId);
    let student = (appState.data?.users || []).find(u => u.id === (task ? task.studentId : studentId));
    if (!student && studentId) {
      student = (appState.data?.users || []).find(u => u.id === studentId);
    }
    if (!task && student) {
      task = (appState.data?.tasks || []).find(t => t.studentId === student.id);
    }
    if (!student) {
      student = { id: 'usr_student_1', name: 'Alumno TOP-GYM', avatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg', district: 'Miraflores', phone: '' };
    }

    const isCompleted = task && task.status === 'completed';

    // 1. Student Avatar & Profile Header
    const avatarEl = document.getElementById('coachModalStudentAvatar');
    const nameEl = document.getElementById('coachModalStudentName');
    const badgeEl = document.getElementById('coachModalTaskStatusBadge');
    const metaEl = document.getElementById('coachModalStudentMeta');

    if (avatarEl) {
      avatarEl.src = student.avatar || './GYMTOP/resources/res/drawable/im_comentario_4.jpg';
      avatarEl.alt = student.name;
    }
    if (nameEl) nameEl.textContent = student.name;

    if (badgeEl) {
      if (isCompleted) {
        badgeEl.textContent = '¡Tarea Entregada!';
        badgeEl.className = 'task-badge badge-completed';
        badgeEl.style.background = 'rgba(16, 185, 129, 0.2)';
        badgeEl.style.color = '#10b981';
      } else {
        badgeEl.textContent = 'En Entrenamiento';
        badgeEl.className = 'task-badge badge-pending';
        badgeEl.style.background = 'rgba(255, 145, 0, 0.2)';
        badgeEl.style.color = '#ff9100';
      }
    }

    if (metaEl) {
      const prefMod = (task && task.modality === 'home') || student.preferredModality === 'home' ? '🏠 En Casa' : '⚙️ Con Máquinas';
      const dist = student.district ? `📍 ${student.district}` : '📍 Lima';
      const ageText = student.age ? `${student.age} años` : '';
      metaEl.textContent = [prefMod, dist, ageText].filter(Boolean).join(' • ');
    }

    // 2. Workout Title & Scheduled Details
    const workoutTitleEl = document.getElementById('coachModalWorkoutTitle');
    const scheduledDateEl = document.getElementById('coachModalScheduledDate');
    const coachNotesEl = document.getElementById('coachModalCoachNotes');

    if (workoutTitleEl) workoutTitleEl.textContent = task ? task.workoutTitle : 'Entrenamiento Asignado';
    if (scheduledDateEl) scheduledDateEl.textContent = task ? (task.scheduledDate || 'Fecha programada') : '';
    if (coachNotesEl) {
      coachNotesEl.textContent = task && task.coachNotes ? `"${task.coachNotes}"` : 'Sin notas específicas del coach.';
    }

    // 3. Completed Section vs Pending Section
    const subSection = document.getElementById('coachModalSubmissionSection');
    const pendSection = document.getElementById('coachModalPendingSection');
    const compAtEl = document.getElementById('coachModalCompletedAt');
    const rpeEl = document.getElementById('coachModalRpePill');
    const feedbackEl = document.getElementById('coachModalStudentFeedback');

    if (isCompleted) {
      if (subSection) subSection.style.display = 'block';
      if (pendSection) pendSection.style.display = 'none';
      if (compAtEl) compAtEl.textContent = task.completedAt || 'Entregado';
      if (rpeEl) rpeEl.textContent = `RPE ${task.ratingRPE || 8}/10`;
      if (feedbackEl) feedbackEl.textContent = task.studentFeedback ? `"${task.studentFeedback}"` : 'Completado con éxito sin observaciones.';
    } else {
      if (subSection) subSection.style.display = 'none';
      if (pendSection) pendSection.style.display = 'block';
    }

    // 4. Exercises List
    const exCountEl = document.getElementById('coachModalExerciseCount');
    const exListEl = document.getElementById('coachModalExercisesList');
    const exercises = (task && task.exercises) ? task.exercises : [];

    if (exCountEl) exCountEl.textContent = exercises.length;

    if (exListEl) {
      exListEl.innerHTML = '';
      if (exercises.length === 0) {
        exListEl.innerHTML = '<div style="padding: 0.8rem; text-align: center; color: var(--text-muted); font-size: 0.78rem;">No hay ejercicios específicos registrados en este plan.</div>';
      } else {
        exercises.forEach((exItem, idx) => {
          const exInfo = (appState.data?.exercises || []).find(e => e.id === exItem.exerciseId) || {
            name: exItem.exerciseId || 'Ejercicio TOP-GYM',
            gifUrl: './GYMTOP/resources/res/drawable/im_halter_logo.png',
            modalityLabel: 'TOP-GYM'
          };
          const seriesCount = Array.isArray(exItem.series) ? exItem.series.length : (typeof exItem.series === 'number' ? exItem.series : 3);
          const restTime = exItem.restTime || exInfo.defaultRest || 60;
          const noteText = exItem.note ? `• ${exItem.note}` : '';

          const row = document.createElement('div');
          row.className = 'specific-exercise-item';
          row.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 7px 10px; background: var(--bg-card); border-radius: var(--radius-sm); margin-bottom: 6px; border: 1px solid var(--border-subtle);';
          row.innerHTML = `
            <img src="${exInfo.gifUrl || './GYMTOP/resources/res/drawable/im_halter_logo.png'}" alt="${exInfo.name}" style="width: 40px; height: 40px; min-width: 40px; border-radius: 6px; object-fit: cover; background: #000;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 700; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">${idx + 1}. ${exInfo.name}</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary); display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span style="color: var(--accent-orange); font-weight: 700;">${seriesCount} series</span>
                <span>•</span>
                <span>${restTime}s descanso</span>
                ${noteText ? `<span>•</span><span style="font-style: italic;">${noteText}</span>` : ''}
              </div>
            </div>
          `;
          exListEl.appendChild(row);
        });
      }
    }

    // 5. WhatsApp Direct Action Button
    const waBtn = document.getElementById('coachModalWhatsAppBtn');
    const waBtnText = document.getElementById('coachModalWhatsAppBtnText');
    const cleanPhone = (student.phone || '').replace(/\D/g, '');

    let waMessage = '';
    if (isCompleted) {
      waMessage = `Hola ${student.name}! He revisado la entrega de tu sesión "${task ? task.workoutTitle : 'TOP-GYM'}". Excelente trabajo completándola (RPE ${task ? task.ratingRPE || 8 : 8}/10). ¡A seguir con todo el enfoque! 💪🔥`;
      if (waBtnText) waBtnText.textContent = `Enviar Feedback a ${student.name} por WhatsApp`;
    } else {
      const title = task ? `"${task.workoutTitle}"` : 'tu entrenamiento';
      waMessage = `Hola ${student.name}! Te saluda el Coach Humberto de TOP-GYM. Recuerda que tienes programada tu sesión ${title}. ¿A qué hora entrenas hoy? ¡Cualquier duda me avisas! 🏋️`;
      if (waBtnText) waBtnText.textContent = `Recordar a ${student.name} por WhatsApp`;
    }

    if (waBtn) {
      if (cleanPhone) {
        waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
        waBtn.onclick = null;
      } else {
        waBtn.href = '#';
        waBtn.onclick = (e) => {
          e.preventDefault();
          showToast(`El alumno ${student.name} no tiene número de teléfono registrado en el sistema.`, 'warning');
        };
      }
    }

    // 6. View in Student Schedule Button
    const viewSchedBtn = document.getElementById('coachModalViewStudentScheduleBtn');
    const viewSchedBtnText = document.getElementById('coachModalViewStudentBtnText');
    if (viewSchedBtnText) viewSchedBtnText.textContent = `Ver en Cronograma de ${student.name}`;

    if (viewSchedBtn) {
      viewSchedBtn.onclick = (e) => {
        e.preventDefault();
        closeCoachTaskDetailModal();
        switchToStudentView(student.id);
      };
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    SoundEffects.tap();
  }

  function closeCoachTaskDetailModal() {
    const modal = document.getElementById('coachTaskDetailModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    setTimeout(() => {
      if (!document.querySelector('.modal-overlay.active')) {
        const loginScr = document.getElementById('loginScreen');
        if (!loginScr || loginScr.style.display === 'none') {
          document.body.classList.remove('modal-open');
        }
      }
    }, 30);
  }

  function toggleCoachProfileDropdown() {
    const dropdown = document.getElementById('coachProfileDropdown');
    if (!dropdown) return;
    const isVisible = dropdown.style.display === 'block';
    if (isVisible) {
      closeCoachProfileDropdown();
    } else {
      openCoachProfileDropdown();
    }
  }

  function openCoachProfileDropdown() {
    const dropdown = document.getElementById('coachProfileDropdown');
    const picker = document.getElementById('coachProfilePickerBtn');
    if (!dropdown) return;
    updateCoachProfileDropdown();
    dropdown.style.display = 'block';
    if (picker) picker.classList.add('open');
  }

  function closeCoachProfileDropdown() {
    const dropdown = document.getElementById('coachProfileDropdown');
    const picker = document.getElementById('coachProfilePickerBtn');
    if (dropdown) dropdown.style.display = 'none';
    if (picker) picker.classList.remove('open');
  }

  function logoutUser(roleName = 'Usuario') {
    StorageManager.clearSession();
    appState.currentUser = null;
    appState.currentRole = null;

    closeStudentProfileDropdown();
    closeCoachProfileDropdown();
    closeMyProfileModal();
    closeEditProfileModal();

    if (studentHeaderBox) studentHeaderBox.style.display = 'none';
    if (coachActiveBar) coachActiveBar.style.display = 'none';
    if (coachTabBtn) coachTabBtn.style.display = 'none';
    if (mobileCoachBtn) mobileCoachBtn.style.display = 'none';
    if (openCoachAuthModalBtn) openCoachAuthModalBtn.style.display = 'none';

    showToast(`Sesión de ${roleName} cerrada. Ingresa con tus credenciales.`, 'success');
    showLoginScreen();
  }

  // Navigation Tabs with Security Guard
  function setupNavigation() {
    const allNavButtons = document.querySelectorAll('[data-screen]');
    allNavButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetScreen = btn.getAttribute('data-screen');
        switchScreen(targetScreen);
      });
    });

    // Botón de Inicio Oficial (Logo y Marca TOP-GYM)
    const brandBtn = document.getElementById('brandBtn');
    if (brandBtn) {
      brandBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToHomeScreen();
      });
      brandBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToHomeScreen();
        }
      });
    }
  }

  function goToHomeScreen() {
    if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') {
      SoundEffects.tap();
    }

    if (typeof closeStudentProfileDropdown === 'function') closeStudentProfileDropdown();
    if (typeof closeCoachProfileDropdown === 'function') closeCoachProfileDropdown();

    // Cerrar cualquier modal activo excepto la pantalla de inicio de sesión
    const activeModals = document.querySelectorAll('.modal-overlay.active:not(#loginScreen)');
    activeModals.forEach(m => {
      m.classList.remove('active');
      m.style.display = 'none';
    });
    if (!document.getElementById('loginScreen') || document.getElementById('loginScreen').style.display === 'none') {
      document.body.classList.remove('modal-open');
    }

    if (appState.currentRole === 'coach') {
      switchScreen('coachScreen');
      if (typeof switchCoachTab === 'function') switchCoachTab('inbox');
      if (typeof renderCoachScreen === 'function') renderCoachScreen();
    } else {
      switchScreen('scheduleScreen');
      if (typeof renderScheduleScreen === 'function') renderScheduleScreen();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Inicio • TOP-GYM', 'info');
  }
  window.goToHomeScreen = goToHomeScreen;

  function switchScreen(screenId) {
    if (screenId === 'coachScreen' && appState.currentRole !== 'coach') {
      showToast('Acceso exclusivo para el Coach Humberto Salinas.', 'coach');
      switchScreen('scheduleScreen');
      return;
    }

    appState.activeScreen = screenId;
    sessionStorage.setItem('topgym_active_screen', screenId);
    localStorage.setItem('topgym_last_active_screen', screenId);

    document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
    
    const targetElement = document.getElementById(screenId);
    if (targetElement) {
      targetElement.classList.add('active');
    }

    if (screenId === 'coachScreen' && appState.currentRole === 'coach') {
      renderCoachScreen();
    }

    document.querySelectorAll('.tab-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-screen') === screenId);
    });

    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-screen') === screenId);
    });
  }

  // ==========================================================================
  // 1. SCHEDULE & TASKS
  // ==========================================================================
  function setupScheduleWeekBar() {
    const weekContainer = document.getElementById('weekBarContainer');
    weekContainer.innerHTML = '';

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      const dayNum = d.getDate();
      const isToday = i === 0;
      const isSelected = isoDate === appState.selectedDate;

      const hasTask = appState.currentUser ? appState.data.tasks.some(t => 
        t.studentId === appState.currentUser.id && t.scheduledDate === isoDate
      ) : false;

      const pill = document.createElement('div');
      pill.className = `schedule-day-pill ${isToday ? 'today' : ''} ${isSelected ? 'active' : ''}`;
      pill.innerHTML = `
        <div class="day-pill-name">${dayName}</div>
        <div class="day-pill-num">${dayNum}</div>
        <div class="day-pill-dot ${hasTask ? 'has-task' : ''}"></div>
      `;

      pill.addEventListener('click', () => {
        appState.selectedDate = isoDate;
        setupScheduleWeekBar();
        renderScheduleScreen();
      });

      weekContainer.appendChild(pill);
    }
  }

  function renderScheduleScreen() {
    if (!appState.currentUser) return;
    const tasksContainer = document.getElementById('tasksListContainer');
    const taskCounter = document.getElementById('taskStatusCounter');
    const pendingTasksBadge = document.getElementById('pendingTasksBadge');
    const coachWelcomeMsg = document.getElementById('coachWelcomeMsg');

    const allStudentTasks = appState.data.tasks.filter(t => t.studentId === appState.currentUser.id);
    const pendingTasks = allStudentTasks.filter(t => t.status === 'pending');
    
    if (pendingTasksBadge) {
      pendingTasksBadge.textContent = pendingTasks.length;
      pendingTasksBadge.style.display = pendingTasks.length > 0 ? 'inline-block' : 'none';
    }

    if (taskCounter) {
      if (pendingTasks.length > 0) {
        taskCounter.className = 'task-badge badge-pending';
        taskCounter.innerHTML = `<svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:currentColor;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg><span>${pendingTasks.length} Pendiente${pendingTasks.length !== 1 ? 's' : ''}</span>`;
      } else {
        taskCounter.className = 'task-badge badge-completed';
        taskCounter.innerHTML = `<svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:currentColor;"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg><span>¡Al Día!</span>`;
      }
    }

    if (pendingTasks.length > 0) {
      coachWelcomeMsg.textContent = `"Tienes ${pendingTasks.length} rutina(s) asignadas por tu entrenador. ¡Revisa la técnica antes de comenzar!"`;
    } else {
      coachWelcomeMsg.textContent = `"¡Excelente trabajo! Has completado tus tareas de entrenamiento asignadas."`;
    }

    // Update active state on schedule filter buttons
    document.querySelectorAll('.schedule-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-filter') === appState.scheduleFilterModality);
    });

    // Filter tasks by selected modality (Home vs Machine vs All)
    let displayTasks = allStudentTasks;
    if (appState.scheduleFilterModality !== 'all') {
      displayTasks = allStudentTasks.filter(t => t.modality === appState.scheduleFilterModality);
    }

    tasksContainer.innerHTML = '';

    if (displayTasks.length === 0) {
      const modalityName = appState.scheduleFilterModality === 'home' 
        ? 'en Casa (Sin Máquinas)' 
        : (appState.scheduleFilterModality === 'machine' ? 'con Máquinas o Poleas' : 'en esta categoría');
      tasksContainer.innerHTML = `
        <div class="schedule-empty-card">
          <img src="./GYMTOP/resources/res/drawable-xxhdpi/im_halter_logo.png" alt="Pesas" class="empty-state-icon">
          <h4>No tienes entrenamientos ${modalityName}</h4>
          <p>Prueba seleccionando "Todas las Sesiones" o pide una rutina específica a tu Coach Humberto Salinas.</p>
        </div>
      `;
      return;
    }

    displayTasks.forEach(task => {
      const isCompleted = task.status === 'completed';
      const card = document.createElement('div');
      card.className = `task-card ${isCompleted ? 'task-completed' : ''}`;

      const modalityIcon = task.modality === 'home'
        ? `<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
        : (task.modality === 'machine'
            ? `<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.45.17-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`
            : `<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><path d="M5 9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2H5zm14-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1V8zm-9 3h4v2h-4v-2z"/></svg>`);

      const modalityBadgeText = task.modality === 'home' 
        ? 'En Casa' 
        : (task.modality === 'machine' ? 'Con Máquinas' : 'Pesas Libres');

      let exercisesHtml = '';
      task.exercises.forEach(te => {
        const exMeta = appState.data.exercises.find(e => e.id === te.exerciseId);
        const exName = exMeta ? exMeta.name : 'Ejercicio';
        const exGif = exMeta ? exMeta.gifUrl : './GYMTOP/resources/res/drawable/im_ex0.gif';
        const setsCount = te.series.length;

        exercisesHtml += `
          <div class="task-exercise-row-with-gif" data-exercise-id="${te.exerciseId}" title="Toca para ver la técnica animada en grande">
            <img src="${exGif}" alt="${exName}" class="exercise-mini-gif">
            <div class="task-exercise-info">
              <strong>${exName}</strong>
              <span>${setsCount} series • ${te.restTime}s descanso</span>
            </div>
            <div class="task-exercise-expand-btn">
              <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div>
          <div class="task-header">
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <span class="task-badge ${isCompleted ? 'badge-completed' : 'badge-pending'}" style="display: inline-flex; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:currentColor;"><path d="${isCompleted ? 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' : 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'}"/></svg>
                <span>${isCompleted ? 'Completada' : 'Pendiente'}</span>
              </span>
              <span class="task-badge task-modality-badge">
                ${modalityIcon}
                <span>${modalityBadgeText}</span>
              </span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
              <span>${task.scheduledDate}</span>
            </span>
          </div>

          <h3 class="task-title">${task.workoutTitle}</h3>

          ${task.coachNotes ? `
            <div class="task-coach-note">
              <strong>Coach Humberto:</strong> "${task.coachNotes}"
            </div>
          ` : ''}

          <div style="margin: 0.8rem 0;">
            ${exercisesHtml}
          </div>

          ${isCompleted && task.studentFeedback ? `
            <div class="task-student-feedback-box" style="border-radius: var(--radius-sm); padding: 0.65rem; font-size: 0.8rem; margin-bottom: 0.85rem;">
              <strong>Reporte entregado (RPE ${task.ratingRPE}/10):</strong> "${task.studentFeedback}"
            </div>
          ` : ''}
        </div>

        <div style="margin-top: 0.75rem;">
          ${!isCompleted ? `
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn-primary start-task-btn" data-task-id="${task.id}" style="flex: 1; min-width: 130px; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;">
                <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; fill: currentColor;"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                <span>Iniciar en Vivo</span>
              </button>
              <button class="btn-secondary quick-complete-task-btn" data-task-id="${task.id}" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.6rem 0.85rem;" title="Marcar tarea como culminada y notificar al Coach Humberto Salinas">
                <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: #10b981;"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                <span>Culminar Tarea</span>
              </button>
            </div>
          ` : `
            <button class="btn-secondary repeat-task-btn" data-task-id="${task.id}" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
              <span>Repetir Sesión</span>
            </button>
          `}
        </div>
      `;

      tasksContainer.appendChild(card);
    });

    document.querySelectorAll('.start-task-btn, .repeat-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.getAttribute('data-task-id');
        const task = appState.data.tasks.find(t => t.id === taskId);
        if (task) {
          startLiveWorkoutSession(task);
        }
      });
    });

    // Quick complete button on schedule card: allows student to finish task and notify Coach
    document.querySelectorAll('.quick-complete-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = e.currentTarget.getAttribute('data-task-id');
        const task = appState.data.tasks.find(t => t.id === taskId);
        if (!task) return;

        const student = (appState.data.users || []).find(u => u.id === task.studentId) || appState.currentUser;
        const feedback = prompt(`¡Culminar "${task.workoutTitle}"!\nEscribe un comentario o mensaje para tu Coach Humberto Salinas (opcional):`, 'Completé el entrenamiento programado con éxito.');
        if (feedback === null) return;

        task.status = 'completed';
        task.completedAt = new Date().toLocaleString();
        task.studentFeedback = feedback.trim() || 'Sesión culminada con éxito.';
        task.ratingRPE = 8;
        task.updatedAt = Date.now();

        if (student && student.stats) {
          student.stats.completedWorkouts = (student.stats.completedWorkouts || 0) + 1;
          student.stats.currentStreak = (student.stats.currentStreak || 0) + 1;
          student.updatedAt = Date.now();
        }

        StorageManager.save(appState.data, true, true);

        // Disparar notificación al Coach y al sistema
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.notifyTaskCompleted(task, student, 8, task.studentFeedback);
        }

        SoundEffects.workoutFinished();
        renderScheduleScreen();
        renderProgressScreen();
        renderCoachScreen();
      });
    });

    document.querySelectorAll('.task-exercise-row-with-gif').forEach(row => {
      row.addEventListener('click', (e) => {
        const exId = e.currentTarget.getAttribute('data-exercise-id');
        if (exId) {
          SoundEffects.click();
          openExerciseDetail(exId);
        }
      });
    });
  }

  // ==========================================================================
  // 2. LIVE WORKOUT ASSISTANT
  // ==========================================================================
  function startLiveWorkoutSession(task) {
    SoundEffects.init();
    // Re-init after any previous clearLiveWorkoutState() set it to null
    appState.liveWorkout = {
      active: true,
      task: null,
      workoutPlan: null,
      startTime: null,
      elapsedInterval: null,
      elapsedSeconds: 0,
      totalVolumeKg: 0,
      completedSetsCount: 0,
      currentExerciseIndex: 0,
      exercises: []
    };
    appState.liveWorkout.task = task;
    appState.liveWorkout.startTime = Date.now();
    appState.liveWorkout.elapsedSeconds = 0;
    appState.liveWorkout.totalVolumeKg = 0;
    appState.liveWorkout.completedSetsCount = 0;
    appState.liveWorkout.currentExerciseIndex = 0;

    appState.liveWorkout.exercises = JSON.parse(JSON.stringify(task.exercises));

    liveWorkoutTitle.textContent = task.workoutTitle;
    liveAssistantOverlay.classList.add('active');

    clearInterval(appState.liveWorkout.elapsedInterval);
    appState.liveWorkout.elapsedInterval = setInterval(updateElapsedTimer, 1000);

    persistLiveWorkoutState();
    updateCurrentStageExercise();
    showToast('¡Sesión TOP-GYM iniciada! Sigue la técnica exacta en pantalla.', 'success');
  }

  function updateElapsedTimer() {
    if (!appState.liveWorkout) return;
    if (appState.liveWorkout.startTime) {
      const now = Date.now();
      appState.liveWorkout.elapsedSeconds = Math.max(0, Math.floor((now - appState.liveWorkout.startTime) / 1000));
    } else {
      appState.liveWorkout.elapsedSeconds++;
    }
    const hrs = Math.floor(appState.liveWorkout.elapsedSeconds / 3600);
    const mins = Math.floor((appState.liveWorkout.elapsedSeconds % 3600) / 60);
    const secs = appState.liveWorkout.elapsedSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (liveElapsedTimer) {
      liveElapsedTimer.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
  }

  function updateCurrentStageExercise() {
    const curIdx = appState.liveWorkout.currentExerciseIndex;
    const exItem = appState.liveWorkout.exercises[curIdx];
    if (!exItem) return;

    const exMeta = appState.data.exercises.find(e => e.id === exItem.exerciseId) || {
      name: 'Ejercicio', details: '', equipment: '', gifUrl: './GYMTOP/resources/res/drawable/im_ex0.gif', modalityLabel: 'Equipo'
    };

    liveCurrentExerciseGif.src = exMeta.gifUrl;
    liveStageExerciseName.textContent = exMeta.name;
    liveStageExerciseDetails.textContent = `${exMeta.equipment} • ${exMeta.modalityLabel} • ${exItem.restTime}s descanso`;

    // Authentic Anatomy Muscle Graphic Update
    const anat = getExerciseAnatomy(exMeta);
    const liveBase = document.getElementById('liveAnatomyBaseImg');
    const liveOverlay = document.getElementById('liveAnatomyOverlayImg');
    const livePrim = document.getElementById('liveAnatomyPrimaryMuscle');
    const liveSec = document.getElementById('liveAnatomySecondaryMuscle');
    const liveTag = document.getElementById('liveAnatomyViewTag');

    if (liveBase) liveBase.src = anat.baseImg;
    if (liveOverlay) liveOverlay.src = anat.overlayImg;
    if (livePrim) livePrim.textContent = anat.primaryMuscle;
    if (liveSec) liveSec.textContent = 'Secundarios: ' + anat.secondaryMuscle;
    if (liveTag) liveTag.textContent = anat.view === 'frente' ? 'Vista Frontal' : 'Vista Posterior';

    renderStageSeriesTable(curIdx);
  }

  function renderStageSeriesTable(curIdx) {
    const exItem = appState.liveWorkout.exercises[curIdx];
    const exMeta = appState.data.exercises.find(e => e.id === exItem.exerciseId) || {};
    const isHome = exMeta.modality === 'home' || (appState.liveWorkout.task && appState.liveWorkout.task.modality === 'home');
    let rowsHtml = '';

    exItem.series.forEach((s, sIdx) => {
      const isDone = s.completed === true;
      const weightDisplay = isHome ? 0 : s.weight;
      rowsHtml += `
        <tr>
          <td class="col-serie" style="font-weight: 800; color: var(--accent-orange); font-size: 0.95rem;">
            Serie #${sIdx + 1}
          </td>
          <td class="col-reps">
            <input type="number" class="input-series-val set-reps-input" 
              data-ex-idx="${curIdx}" data-set-idx="${sIdx}" value="${s.reps}" min="1" max="100">
          </td>
          <td class="col-weight">
            <input type="number" class="input-series-val set-weight-input" 
              data-ex-idx="${curIdx}" data-set-idx="${sIdx}" value="${weightDisplay}" min="0" max="500"
              ${isHome ? 'readonly style="opacity: 0.7; cursor: not-allowed;" title="Ejercicio en casa con peso corporal (sin máquinas)"' : ''}>
          </td>
          <td class="col-check">
            <button class="btn-check-serie ${isDone ? 'completed' : ''}" 
              data-ex-idx="${curIdx}" data-set-idx="${sIdx}" title="Marcar completada">
              ✓
            </button>
          </td>
        </tr>
      `;
    });

    liveSeriesTableContainer.innerHTML = `
      <div style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.78rem; font-weight: 800; color: ${isHome ? '#4ade80' : 'var(--accent-orange)'};">
          ${isHome ? 'Modalidad En Casa • Peso Corporal (100% Sin Máquinas)' : 'Modalidad de Gimnasio • Con Máquinas / Cargas'}
        </span>
      </div>
      <table class="series-table">
        <thead>
          <tr>
            <th class="col-serie">Serie</th>
            <th class="col-reps">Reps</th>
            <th class="col-weight">${isHome ? 'Carga (Sin Máquina)' : 'Peso (kg)'}</th>
            <th class="col-check">Completada</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    document.querySelectorAll('.btn-check-serie').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const eIdx = parseInt(e.currentTarget.getAttribute('data-ex-idx'));
        const sIdx = parseInt(e.currentTarget.getAttribute('data-set-idx'));
        toggleSetCompleted(eIdx, sIdx);
      });
    });

    document.querySelectorAll('.set-reps-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const eIdx = parseInt(e.target.getAttribute('data-ex-idx'));
        const sIdx = parseInt(e.target.getAttribute('data-set-idx'));
        appState.liveWorkout.exercises[eIdx].series[sIdx].reps = parseInt(e.target.value) || 0;
        persistLiveWorkoutState();
      });
    });

    document.querySelectorAll('.set-weight-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const eIdx = parseInt(e.target.getAttribute('data-ex-idx'));
        const sIdx = parseInt(e.target.getAttribute('data-set-idx'));
        appState.liveWorkout.exercises[eIdx].series[sIdx].weight = parseFloat(e.target.value) || 0;
        persistLiveWorkoutState();
      });
    });
  }

  function toggleSetCompleted(exIdx, sIdx) {
    const currentStatus = appState.liveWorkout.exercises[exIdx].series[sIdx].completed;
    const newStatus = !currentStatus;
    appState.liveWorkout.exercises[exIdx].series[sIdx].completed = newStatus;
    persistLiveWorkoutState();

    if (newStatus) {
      SoundEffects.setComplete();
      const targetRest = appState.liveWorkout.exercises[exIdx].restTime || 90;
      startRestCountdown(targetRest);
    }

    renderStageSeriesTable(exIdx);
  }

  prevExerciseBtn.addEventListener('click', () => {
    if (appState.liveWorkout.currentExerciseIndex > 0) {
      appState.liveWorkout.currentExerciseIndex--;
      persistLiveWorkoutState();
      updateCurrentStageExercise();
    } else {
      showToast('Estás en el primer ejercicio de la rutina', 'success');
    }
  });

  nextExerciseBtn.addEventListener('click', () => {
    if (appState.liveWorkout.currentExerciseIndex < appState.liveWorkout.exercises.length - 1) {
      appState.liveWorkout.currentExerciseIndex++;
      persistLiveWorkoutState();
      updateCurrentStageExercise();
    } else {
      showToast('¡Has llegado al último ejercicio! Puedes finalizar el entrenamiento.', 'success');
    }
  });

  function startRestCountdown(seconds) {
    clearInterval(appState.restTimer.interval);
    appState.restTimer.totalSeconds = seconds;
    appState.restTimer.remainingSeconds = seconds;
    appState.restTimer.endTime = Date.now() + (seconds * 1000);
    appState.restTimer.running = true;

    restTimerBox.classList.add('timer-running');
    document.getElementById('restTimerStatus').textContent = `Descanso activo: ${seconds}s`;
    updateTimerVisuals();

    appState.restTimer.interval = setInterval(() => {
      const now = Date.now();
      appState.restTimer.remainingSeconds = Math.max(0, Math.ceil((appState.restTimer.endTime - now) / 1000));

      if (appState.restTimer.remainingSeconds === 3 || 
          appState.restTimer.remainingSeconds === 2 || 
          appState.restTimer.remainingSeconds === 1) {
        SoundEffects.beep(false);
      }

      if (appState.restTimer.remainingSeconds <= 0) {
        clearInterval(appState.restTimer.interval);
        appState.restTimer.running = false;
        restTimerBox.classList.remove('timer-running');
        document.getElementById('restTimerStatus').textContent = '¡Descanso terminado! Siguiente serie.';
        SoundEffects.restComplete();
        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.send({
            title: 'TOP-GYM • ¡Descanso Terminado!',
            body: 'Tu tiempo de recuperación ha finalizado. ¡A por la siguiente serie!',
            tag: 'topgym-rest-timer'
          });
        }
      }

      updateTimerVisuals();
    }, 1000);
  }

  function updateTimerVisuals() {
    restSecondsDisplay.textContent = `${appState.restTimer.remainingSeconds}s`;
    const circumference = 2 * Math.PI * 42;
    const fraction = appState.restTimer.totalSeconds > 0 
      ? (appState.restTimer.remainingSeconds / appState.restTimer.totalSeconds) 
      : 0;
    const offset = circumference * (1 - fraction);
    timerProgressCircle.style.strokeDashoffset = offset;
  }

  function stopRestTimer() {
    clearInterval(appState.restTimer.interval);
    appState.restTimer.running = false;
    restTimerBox.classList.remove('timer-running');
    document.getElementById('restTimerStatus').textContent = 'Temporizador detenido';
    appState.restTimer.remainingSeconds = 0;
    updateTimerVisuals();
  }

  exitLiveWorkoutBtn.addEventListener('click', () => {
    if (confirm('¿Deseas salir del entrenamiento? Tu progreso actual en esta sesión no se guardará.')) {
      if (appState.liveWorkout) {
        clearInterval(appState.liveWorkout.elapsedInterval);
      }
      stopRestTimer();
      clearLiveWorkoutState();
      liveAssistantOverlay.classList.remove('active');
      liveAssistantOverlay.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  });

  finishLiveWorkoutBtn.addEventListener('click', () => {
    let totalVolume = 0;
    let completedSets = 0;

    appState.liveWorkout.exercises.forEach(ex => {
      ex.series.forEach(s => {
        if (s.completed) {
          totalVolume += (s.reps * s.weight);
          completedSets++;
        }
      });
    });

    appState.liveWorkout.totalVolumeKg = totalVolume;
    appState.liveWorkout.completedSetsCount = completedSets;

    const mins = Math.floor(appState.liveWorkout.elapsedSeconds / 60);
    const secs = appState.liveWorkout.elapsedSeconds % 60;
    const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    document.getElementById('finishTimeSummary').textContent = durationStr;
    document.getElementById('finishVolumeSummary').textContent = `${totalVolume.toLocaleString()} kg`;
    document.getElementById('finishSetsSummary').textContent = completedSets;
    document.getElementById('finishModalTitle').textContent = `¡${appState.liveWorkout.task.workoutTitle} Finalizada!`;

    finishWorkoutModal.classList.add('active');
    SoundEffects.workoutFinished();
  });

  submitWorkoutReportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rpe = parseInt(workoutRpeInput.value);
    const feedback = document.getElementById('workoutFeedbackInput').value;

    const currentTask = appState.liveWorkout.task;
    if (currentTask) {
      currentTask.status = 'completed';
      currentTask.completedAt = new Date().toLocaleString();
      currentTask.studentFeedback = feedback || 'Sesión finalizada con éxito.';
      currentTask.ratingRPE = rpe;
      currentTask.exercises = appState.liveWorkout.exercises;
      currentTask.updatedAt = Date.now();

      const student = appState.data.users.find(u => u.id === currentTask.studentId);
      if (student && student.stats) {
        student.stats.completedWorkouts += 1;
        student.stats.totalVolumeKg += appState.liveWorkout.totalVolumeKg;
        student.stats.currentStreak += 1;
        student.updatedAt = Date.now();
      }

      StorageManager.save(appState.data, true, true);

      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.notifyTaskCompleted(currentTask, student, rpe, feedback);
      }
    }

    if (appState.liveWorkout) {
      clearInterval(appState.liveWorkout.elapsedInterval);
    }
    stopRestTimer();
    clearLiveWorkoutState();
    finishWorkoutModal.classList.remove('active');
    finishWorkoutModal.style.display = 'none';
    liveAssistantOverlay.classList.remove('active');
    liveAssistantOverlay.style.display = 'none';
    document.body.classList.remove('modal-open');

    renderScheduleScreen();
    renderProgressScreen();
    renderCoachScreen();
  });

  closeFinishModalBtn.addEventListener('click', () => {
    finishWorkoutModal.classList.remove('active');
    finishWorkoutModal.style.display = 'none';
    if (!document.querySelector('.modal-overlay.active')) {
      const loginScr = document.getElementById('loginScreen');
      if (!loginScr || loginScr.style.display === 'none') {
        document.body.classList.remove('modal-open');
      }
    }
  });

  workoutRpeInput.addEventListener('input', (e) => {
    const v = e.target.value;
    let label = 'Moderado';
    if (v <= 4) label = 'Fácil';
    else if (v <= 7) label = 'Exigente';
    else if (v <= 9) label = 'Muy Difícil';
    else label = 'Fallo Total';
    rpeValueDisplay.textContent = `${v} (${label})`;
  });

  // Botón directo para despachar reporte al WhatsApp del Coach Humberto Salinas (+57 300 555 0199)
  const finishWorkoutNotifyWaBtn = document.getElementById('finishWorkoutNotifyWaBtn');
  if (finishWorkoutNotifyWaBtn) {
    finishWorkoutNotifyWaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTask = appState.liveWorkout ? appState.liveWorkout.task : null;
      const student = appState.currentUser || (currentTask ? (appState.data?.users || []).find(u => u.id === currentTask.studentId) : null);
      const rpe = workoutRpeInput ? parseInt(workoutRpeInput.value) : 8;
      const feedbackInput = document.getElementById('workoutFeedbackInput');
      const feedback = feedbackInput ? feedbackInput.value.trim() : '';
      const studentName = student ? (student.nick || student.name) : 'Alumno';
      const workoutTitle = currentTask ? currentTask.workoutTitle : 'Sesión de Entrenamiento';
      const coachPhone = '573005550199'; // Coach Humberto Salinas (+57 300 555 0199)

      // Guardar y notificar en sistema
      if (currentTask) {
        currentTask.status = 'completed';
        currentTask.completedAt = new Date().toLocaleString();
        currentTask.studentFeedback = feedback || 'Sesión finalizada con éxito.';
        currentTask.ratingRPE = rpe;
        if (appState.liveWorkout && appState.liveWorkout.exercises) {
          currentTask.exercises = appState.liveWorkout.exercises;
        }

        if (student && student.stats) {
          student.stats.completedWorkouts = (student.stats.completedWorkouts || 0) + 1;
          if (appState.liveWorkout && appState.liveWorkout.totalVolumeKg) {
            student.stats.totalVolumeKg = (student.stats.totalVolumeKg || 0) + appState.liveWorkout.totalVolumeKg;
          }
          student.stats.currentStreak = (student.stats.currentStreak || 0) + 1;
          student.updatedAt = Date.now();
        }

        currentTask.updatedAt = Date.now();
        StorageManager.save(appState.data, true, true);

        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.notifyTaskCompleted(currentTask, student, rpe, feedback);
        }
      }

      if (appState.liveWorkout) {
        clearInterval(appState.liveWorkout.elapsedInterval);
      }
      stopRestTimer();
      clearLiveWorkoutState();
      finishWorkoutModal.classList.remove('active');
      finishWorkoutModal.style.display = 'none';
      liveAssistantOverlay.classList.remove('active');
      liveAssistantOverlay.style.display = 'none';
      document.body.classList.remove('modal-open');

      renderScheduleScreen();
      renderProgressScreen();
      renderCoachScreen();

      // Abrir WhatsApp con el reporte detallado para Coach Humberto
      const waText = [
        '🏋️ *TOP-GYM • REPORTE DE SESIÓN*',
        `Hola Coach Humberto! Soy *${studentName}*.`,
        `Acabo de terminar mi rutina: *${workoutTitle}*.`,
        `🔥 Esfuerzo (RPE): *${rpe}/10*`,
        feedback ? `💬 *Mis comentarios:* "${feedback}"` : '💬 *Comentario:* Sesión completada al 100%.',
        '¡Quedo atento a tus observaciones! 💪'
      ].join('\n');

      const waUrl = `https://wa.me/${coachPhone}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
      showToast('¡Reporte registrado y abriendo WhatsApp del Coach Humberto!', 'success');
    });
  }

  // ==========================================================================
  // 3. WORKOUT PLANS WITH FILTER (HOME VS MACHINE VS ALL)
  // ==========================================================================
  function renderWorkoutPlansScreen() {
    const plansContainer = document.getElementById('workoutPlansContainer');
    plansContainer.innerHTML = '';

    // Synchronize active state on plan filter buttons
    document.querySelectorAll('.plan-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-filter') === appState.plansFilterModality);
    });

    // Filter by selected modality
    const filteredPlans = appState.plansFilterModality === 'all'
      ? appState.data.workoutPlans
      : appState.data.workoutPlans.filter(p => p.modality === appState.plansFilterModality);

    if (filteredPlans.length === 0) {
      plansContainer.innerHTML = `
        <div class="schedule-empty-card">
          <img src="./GYMTOP/resources/res/drawable-xxhdpi/im_halter_logo.png" alt="Pesas" class="empty-state-icon">
          <h4>No hay planes en esta categoría</h4>
          <p>Prueba seleccionando 'Todos los Planes'</p>
        </div>
      `;
      return;
    }

    filteredPlans.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'task-card';

      const planModIcon = plan.modality === 'home'
        ? `<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
        : (plan.modality === 'machine'
            ? `<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.45.17-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`
            : `<svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><path d="M5 9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2H5zm14-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1V8zm-9 3h4v2h-4v-2z"/></svg>`);

      let daysHtml = '';
      plan.days.forEach(day => {
        daysHtml += `
          <div style="background: var(--bg-input); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 0.9rem;">${day.name}</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${day.daysOfWeek.join(', ')}</div>
            </div>
            <span style="color: var(--accent-orange); font-weight: 700; font-size: 0.85rem;">${day.exercises.length} Ejercicios</span>
          </div>
        `;
      });

      card.innerHTML = `
          <div style="height: 160px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1rem; position: relative; background: #14161f; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
            <img src="${plan.coverImage}" alt="${plan.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%; transition: transform 0.4s ease;">
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(12,13,17,0.38) 100%); pointer-events: none;"></div>
            <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.74rem; color: #fff; font-weight: 800; border: 1px solid var(--accent-orange); display: inline-flex; align-items: center; gap: 5px;">
              ${planModIcon}
              <span>${plan.modalityLabel}</span>
            </div>
          </div>
          <h3 class="task-title">${plan.name}</h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">${plan.details}</p>
          <div>
            ${daysHtml}
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <button class="btn-primary use-plan-btn" data-plan-id="${plan.id}" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; fill: currentColor;"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
            <span>Iniciar este Plan</span>
          </button>
        </div>
      `;

      plansContainer.appendChild(card);
    });

    document.querySelectorAll('.use-plan-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planId = e.currentTarget.getAttribute('data-plan-id');
        const plan = appState.data.workoutPlans.find(p => p.id === planId);
        if (plan && plan.days.length > 0) {
          const firstDay = plan.days[0];
          const tempTask = {
            id: 'temp_' + Date.now(),
            workoutTitle: `${plan.name} - ${firstDay.name}`,
            modality: plan.modality,
            scheduledDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            coachNotes: 'Entrenamiento libre de TOP-GYM.',
            exercises: firstDay.exercises
          };
          startLiveWorkoutSession(tempTask);
        }
      });
    });
  }

  // Setup Plan filter buttons
  document.querySelectorAll('.plan-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.plan-filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      appState.plansFilterModality = e.currentTarget.getAttribute('data-filter');
      renderWorkoutPlansScreen();
    });
  });

  // ==========================================================================
  // 4. EXERCISE CATALOG WITH HOME VS MACHINE FILTERING
  // ==========================================================================
  function renderExerciseCatalog() {
    const coversContainer = document.getElementById('categoryCoversContainer');
    const catalogContainer = document.getElementById('exerciseCatalogContainer');
    const titleDisplay = document.getElementById('catalogTitleDisplay');
    const countDisplay = document.getElementById('catalogCountDisplay');

    // 1. Render Category Cover Cards (Including official En Casa cover)
    coversContainer.innerHTML = '';
    appState.data.muscleGroups.forEach(mg => {
      const card = document.createElement('div');
      const isCardActive = (mg.id === 'casa' && appState.catalogFilterModality === 'home' && appState.catalogFilterMuscle === 'all') ||
                           (appState.catalogFilterMuscle === mg.id && appState.catalogFilterModality !== 'home');
      card.className = `category-cover-card ${isCardActive ? 'active' : ''}`;
      card.innerHTML = `
        <img src="${mg.image}" alt="${mg.name}" class="category-cover-img">
        <div class="category-cover-gradient">
          <span class="category-cover-badge">${mg.id === 'casa' ? 'MODALIDAD' : 'Grupo Muscular'}</span>
          <h4 class="category-cover-title">${mg.name}</h4>
        </div>
      `;

      card.addEventListener('click', () => {
        if (mg.id === 'casa') {
          appState.catalogFilterModality = 'home';
          appState.catalogFilterMuscle = 'all';
          document.querySelectorAll('.catalog-modality-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-modality') === 'home');
          });
        } else {
          appState.catalogFilterMuscle = mg.id;
        }
        renderExerciseCatalog();
        catalogContainer.scrollIntoView({ behavior: 'smooth' });
      });

      coversContainer.appendChild(card);
    });

    // 2. Strict Filter by Modality:
    let filtered = appState.data.exercises;

    if (appState.catalogFilterModality === 'home') {
      // ESTRICTO: 100% SIN MÁQUINA (peso corporal, suelo, calistenia)
      filtered = filtered.filter(e => e.modality === 'home');
    } else if (appState.catalogFilterModality === 'machine') {
      // ESTRICTO: 100% CON MÁQUINA (aparatos guiados y poleas)
      filtered = filtered.filter(e => e.modality === 'machine');
    } else if (appState.catalogFilterModality === 'freeweight') {
      filtered = filtered.filter(e => e.modality === 'freeweight');
    }

    if (appState.catalogFilterMuscle !== 'all' && appState.catalogFilterMuscle !== 'casa') {
      filtered = filtered.filter(e => e.muscle === appState.catalogFilterMuscle);
    }

    if (appState.catalogSearchQuery && appState.catalogSearchQuery.trim() !== '') {
      const q = appState.catalogSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(q) || 
        (e.equipment && e.equipment.toLowerCase().includes(q)) ||
        (e.details && e.details.toLowerCase().includes(q)) ||
        (e.modalityLabel && e.modalityLabel.toLowerCase().includes(q))
      );
    }

    // Update Header labels
    let modalityText = appState.catalogFilterModality === 'home' 
      ? 'En Casa (Sin Máquinas)' 
      : (appState.catalogFilterModality === 'machine' ? 'Con Máquinas & Poleas' : (appState.catalogFilterModality === 'freeweight' ? 'Pesas Libres' : 'Todos los Equipamientos'));
    
    let muscleText = appState.catalogFilterMuscle === 'all' || appState.catalogFilterMuscle === 'casa'
      ? 'Todos los Músculos' 
      : appState.data.muscleGroups.find(m => m.id === appState.catalogFilterMuscle)?.name || '';

    titleDisplay.textContent = `${modalityText} • ${muscleText}`;
    countDisplay.textContent = `${filtered.length} Ejercicios`;

    // Sync button active classes
    document.querySelectorAll('.catalog-modality-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-modality') === appState.catalogFilterModality);
    });

    catalogContainer.innerHTML = '';

    if (filtered.length === 0) {
      catalogContainer.innerHTML = `
        <div class="schedule-empty-card">
          <img src="./GYMTOP/resources/res/drawable-xxhdpi/im_halter_logo.png" alt="Pesas" class="empty-state-icon">
          <h4>No se encontraron ejercicios con este filtro</h4>
          <p>Prueba cambiando de grupo muscular o seleccionando 'Todos' en equipamiento.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(ex => {
      const card = document.createElement('div');
      card.className = 'exercise-catalog-card';
      const isHome = ex.modality === 'home';
      const badgeStyle = isHome 
        ? 'background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e;' 
        : (ex.modality === 'machine' ? 'background: rgba(255, 109, 0, 0.2); color: var(--accent-orange); border: 1px solid var(--accent-orange);' : 'background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6;');

      card.innerHTML = `
        <div class="exercise-catalog-gif-wrap view-detail-trigger" data-ex-id="${ex.id}" style="cursor: pointer;" title="Toca para ver animación fluida y músculos trabajados">
          <img src="${ex.gifUrl}" alt="${ex.name}" class="exercise-catalog-gif" loading="lazy">
          <span style="position: absolute; top: 8px; right: 8px; padding: 3px 10px; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 800; ${badgeStyle}">
            ${ex.modalityLabel}
          </span>
          <span style="position: absolute; bottom: 8px; left: 8px; padding: 3px 8px; border-radius: var(--radius-full); font-size: 0.68rem; font-weight: 700; background: rgba(0,0,0,0.72); color: #fff; backdrop-filter: blur(4px); display: inline-flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            <span>Ver Músculos</span>
          </span>
        </div>
        <div class="exercise-catalog-body">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--accent-orange); font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem;">
              <span>${ex.muscle.toUpperCase()}</span>
              <span style="color: var(--text-muted);">${ex.equipment}</span>
            </div>
            <h4 class="exercise-catalog-name view-detail-trigger" data-ex-id="${ex.id}" style="cursor: pointer;" title="Toca para ver técnica y músculos">${ex.name}</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.75rem;">${ex.details}</p>
          </div>
          <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.6rem; font-size: 0.78rem; gap: 0.5rem;">
            <button class="btn-primary preview-exercise-btn" data-ex-id="${ex.id}" style="padding: 0.35rem 0.75rem; font-size: 0.74rem; display: inline-flex; align-items: center; gap: 4px; width: 100%; justify-content: center;">
              <svg viewBox="0 0 24 24" style="width: 11px; height: 11px; fill: currentColor;"><path d="M8 5v14l11-7z"/></svg>
              <span>Entrenar</span>
            </button>
          </div>
        </div>
      `;

      catalogContainer.appendChild(card);
    });

    // Clicks on detail triggers (image, title)
    document.querySelectorAll('.view-detail-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exId = e.currentTarget.getAttribute('data-ex-id');
        openExerciseDetail(exId);
      });
    });

    document.querySelectorAll('.preview-exercise-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exId = e.currentTarget.getAttribute('data-ex-id');
        const ex = appState.data.exercises.find(item => item.id === exId);
        if (ex) {
          const singleTask = {
            id: 'single_' + Date.now(),
            workoutTitle: ex.name,
            modality: ex.modality,
            scheduledDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            coachNotes: 'Entrenamiento guiado de técnica oficial en TOP-GYM.',
            exercises: [
              { exerciseId: ex.id, series: [{ reps: 10, weight: ex.modality === 'home' ? 0 : 20 }, { reps: 10, weight: ex.modality === 'home' ? 0 : 20 }, { reps: 10, weight: ex.modality === 'home' ? 0 : 20 }], restTime: ex.defaultRest }
            ]
          };
          startLiveWorkoutSession(singleTask);
        }
      });
    });
  }

  // Modality filter buttons in Catalog
  document.querySelectorAll('.catalog-modality-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.catalog-modality-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      appState.catalogFilterModality = e.currentTarget.getAttribute('data-modality');
      if (appState.catalogFilterModality === 'home') {
        appState.catalogFilterMuscle = 'all';
      }
      renderExerciseCatalog();
    });
  });

  // ==========================================================================
  // 5. PROGRESS & BODY ANATOMY MAP
  // ==========================================================================
  function renderProgressScreen() {
    const historyTable = document.getElementById('measurementsHistoryTable');
    const student = appState.currentUser;
    if (!student) return;

    if (student && student.stats) {
      const weightEl = document.getElementById('currentWeightDisplay');
      const volumeEl = document.getElementById('totalVolumeDisplay');
      const streakEl = document.getElementById('streakDisplay');
      if (weightEl) weightEl.innerHTML = `${student.weight || 0} <span style="font-size: 1rem; color: var(--text-secondary);">kg</span>`;
      if (volumeEl) volumeEl.innerHTML = `${(student.stats.totalVolumeKg || 0).toLocaleString()} <span style="font-size: 1rem; color: var(--text-secondary);">kg</span>`;
      if (streakEl) streakEl.innerHTML = `${student.stats.currentStreak || 0} <span style="font-size: 1rem; color: var(--text-secondary);">Días seguidos</span>`;
    }

    // Sync Student Hero Profile Card with live custom avatar and credentials
    const progressHeroAvatar = document.getElementById('progressHeroAvatar');
    const progressHeroName = document.getElementById('progressHeroName');
    const progressHeroGoal = document.getElementById('progressHeroGoal');
    const progressHeroModality = document.getElementById('progressHeroModality');
    const progressHeroPhone = document.getElementById('progressHeroPhone');
    const progressHeroWeight = document.getElementById('progressHeroWeight');

    if (student) {
      if (progressHeroAvatar) progressHeroAvatar.src = student.avatar;
      if (progressHeroName) progressHeroName.textContent = student.name;
      if (progressHeroGoal) progressHeroGoal.textContent = student.goal || 'Entrenamiento TOP-GYM';
      if (progressHeroModality) {
        progressHeroModality.textContent = student.preferredModality === 'home' ? 'En Casa (Sin Máquinas)' : 'Con Máquinas';
        progressHeroModality.style.color = student.preferredModality === 'home' ? '#4ade80' : 'var(--accent-orange)';
      }
      if (progressHeroPhone) progressHeroPhone.textContent = student.phone || 'Sin WhatsApp';
      if (progressHeroWeight) {
        progressHeroWeight.textContent = student.weight ? `${student.weight} kg` : '80 kg';
      }
      const progressHeroDistrict = document.getElementById('progressHeroDistrict');
      const progressHeroAge = document.getElementById('progressHeroAge');
      if (progressHeroDistrict) progressHeroDistrict.textContent = student.district || 'Miraflores';
      if (progressHeroAge) progressHeroAge.textContent = `${student.age || 24} años`;
    }

    if (historyTable) historyTable.innerHTML = '';
    // CONFIDENTIALITY ISOLATION: ONLY display this student's measurements
    const studentMeasurements = (appState.data.bodyMeasurements || []).filter(m => m.studentId === student.id);

    // Sync interactive mannequin measurement pins
    const latestM = studentMeasurements[0] || {};
    const pinChest = document.getElementById('pinValChest');
    const pinArm = document.getElementById('pinValArm');
    const pinWaist = document.getElementById('pinValWaist');
    const pinThigh = document.getElementById('pinValThigh');
    if (pinChest) pinChest.textContent = `${latestM.chest || 104} cm`;
    if (pinArm) pinArm.textContent = `${latestM.arm || 38} cm`;
    if (pinWaist) pinWaist.textContent = `${latestM.waist || 81.5} cm`;
    if (pinThigh) pinThigh.textContent = `${latestM.thigh || 58} cm`;

    if (!historyTable) return;

    if (studentMeasurements.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
          No hay registros de pesajes para este alumno aún. Registra tu peso inicial con el botón 'Registrar Medidas'.
        </td>
      `;
      historyTable.appendChild(emptyRow);
    } else {
      studentMeasurements.forEach(m => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="color: var(--text-secondary); text-align: center;">${m.date}</td>
          <td style="font-weight: 800; color: var(--accent-orange); text-align: center;">${m.weight} kg</td>
          <td style="text-align: center;">${m.chest} cm</td>
          <td style="text-align: center;">${m.arm} cm</td>
          <td style="text-align: center;">${m.waist} cm</td>
        `;
        historyTable.appendChild(row);
      });
    }
  }

  // ==========================================================================
  // 6. COACH SCREEN (INBOX, STUDENT MANAGEMENT & TASK MONITORING)
  // ==========================================================================
  function switchCoachTab(tabName) {
    appState.coachActiveTab = tabName || 'inbox';
    const tabs = ['inbox', 'students', 'tasks'];
    tabs.forEach(t => {
      const btn = document.getElementById(t === 'inbox' ? 'coachTabInboxBtn' : (t === 'students' ? 'coachTabStudentsBtn' : 'coachTabTasksBtn'));
      const section = document.getElementById(t === 'inbox' ? 'coachDeliveriesInboxSection' : (t === 'students' ? 'coachStudentsSection' : 'coachTasksMonitorSection'));
      if (btn) btn.classList.toggle('active', t === appState.coachActiveTab);
      if (section) section.classList.toggle('active', t === appState.coachActiveTab);
    });

    // Ensure student or task list is populated if empty
    const studentsContainer = document.getElementById('coachStudentsContainer');
    const tasksMonitorContainer = document.getElementById('coachTasksMonitorContainer');
    if (appState.coachActiveTab === 'students' && studentsContainer && (!studentsContainer.children.length || studentsContainer.children.length === 0)) {
      renderCoachScreen();
    } else if (appState.coachActiveTab === 'tasks' && tasksMonitorContainer && (!tasksMonitorContainer.children.length || tasksMonitorContainer.children.length === 0)) {
      renderCoachScreen();
    }
  }
  window.switchCoachTab = switchCoachTab;

  function renderCoachInboxSection() {
    const inboxContainer = document.getElementById('coachDeliveriesInboxContainer');
    if (!inboxContainer) return;
    inboxContainer.innerHTML = '';

    const allTasks = appState.data?.tasks || [];
    const students = (appState.data?.users || []).filter(u => u.role === 'student');

    // Counters
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const withMessageTasks = completedTasks.filter(t => t.studentFeedback && t.studentFeedback.trim().length > 0);
    const pendingTasks = allTasks.filter(t => t.status === 'pending');

    const inboxTabBadge = document.getElementById('coachInboxTabBadge');
    if (inboxTabBadge) inboxTabBadge.textContent = completedTasks.length;

    const studentsTabBadge = document.getElementById('coachStudentsTabBadge');
    if (studentsTabBadge) studentsTabBadge.textContent = students.length;

    const tasksTabBadge = document.getElementById('coachTasksTabBadge');
    if (tasksTabBadge) tasksTabBadge.textContent = allTasks.length;

    const countPill = document.getElementById('coachInboxCompletedCountPill');
    if (countPill) {
      countPill.textContent = `${completedTasks.length} rutina(s) entregada(s)`;
    }

    // Active filter on inbox buttons
    document.querySelectorAll('.coach-inbox-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-inbox-filter') === (appState.coachInboxFilter || 'all'));
    });

    // Filter tasks
    let filteredTasks = [];
    const currentFilter = appState.coachInboxFilter || 'all';
    if (currentFilter === 'all') {
      filteredTasks = [...completedTasks, ...pendingTasks];
    } else if (currentFilter === 'with_message') {
      filteredTasks = withMessageTasks;
    } else if (currentFilter === 'pending') {
      filteredTasks = pendingTasks;
    }

    if (filteredTasks.length === 0) {
      inboxContainer.innerHTML = `
        <div class="schedule-empty-card" style="grid-column: 1 / -1; padding: 2.5rem 1.5rem;">
          <img src="./GYMTOP/resources/res/drawable-xxhdpi/im_halter_logo.png" alt="Pesas" class="empty-state-icon" style="opacity: 0.8;">
          <h4 style="font-size: 1.1rem; margin-top: 0.5rem;">No hay entregas en esta sección</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            ${currentFilter === 'with_message' ? 'Ningún alumno ha enviado retroalimentación escrita aún.' : 'Cuando tus alumnos completen sus rutinas asignadas, sus mensajes y reporte aparecerán aquí automáticamente.'}
          </p>
        </div>
      `;
      return;
    }

    filteredTasks.forEach(task => {
      const student = students.find(s => s.id === task.studentId) || {
        id: task.studentId,
        name: 'Alumno',
        avatar: './GYMTOP/resources/res/drawable/im_comentario_4.jpg',
        district: 'Lima',
        preferredModality: task.modality || 'machine',
        phone: '+51 900 000 000'
      };

      const isCompleted = task.status === 'completed';
      const cleanPhone = (student.phone || '').replace(/\D/g, '');
      const waReplyText = encodeURIComponent(`Hola ${student.name}! Te saluda el Coach Humberto Salinas. Vi tu entrega de la rutina "${task.workoutTitle}" ${isCompleted && task.ratingRPE ? `(RPE ${task.ratingRPE}/10)` : ''}. ¡Excelente trabajo y dedicación! Sigue así.`);
      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waReplyText}` : '#';

      const modText = task.modality === 'home' ? 'En Casa (Sin Máquinas)' : 'Con Máquinas';
      const rpeNum = task.ratingRPE ? Number(task.ratingRPE) : null;
      let rpeClass = 'rpe-med';
      let rpeLabel = 'Moderado';
      if (rpeNum !== null) {
        if (rpeNum <= 4) { rpeClass = 'rpe-low'; rpeLabel = 'Ligero'; }
        else if (rpeNum <= 7) { rpeClass = 'rpe-med'; rpeLabel = 'Moderado'; }
        else { rpeClass = 'rpe-high'; rpeLabel = 'Intenso'; }
      }

      const exTotal = (task.exercises || []).length;
      const exDone = (task.exercises || []).filter(e => (e.series || []).every(s => s.completed)).length;

      const card = document.createElement('div');
      card.className = `inbox-delivery-card ${isCompleted ? 'status-completed' : 'status-pending'}`;
      card.id = `coachInboxCard_${task.id}`;
      card.dataset.taskId = task.id;
      card.dataset.studentId = student.id;

      card.innerHTML = `
        <div class="inbox-delivery-header">
          <div class="inbox-student-profile-info">
            <img src="${student.avatar}" alt="${student.name}" class="inbox-student-avatar">
            <div class="inbox-student-meta">
              <strong>${student.name}</strong>
              <div class="inbox-student-sub">
                <span style="color: var(--accent-orange); font-weight: 700;">${modText}</span>
                <span>•</span>
                <span style="color: var(--text-muted);">${student.district || 'Lima'}</span>
                <span>•</span>
                <span style="color: ${isCompleted ? '#34d399' : '#fbbf24'}; font-weight: 700;">
                  ${isCompleted ? (task.completedAt ? `Entregada: ${task.completedAt}` : 'Completada') : `Asignada para: ${task.scheduledDate || 'Hoy'}`}
                </span>
              </div>
            </div>
          </div>
          <span class="inbox-status-pill ${isCompleted ? 'completed' : 'pending'}">
            <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="${isCompleted ? 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' : 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'}"/></svg>
            <span>${isCompleted ? '¡Rutina Completada!' : 'En Entrenamiento'}</span>
          </span>
        </div>

        <div class="inbox-workout-strip">
          <div class="inbox-workout-title">
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: var(--accent-orange);"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43 1.43 1.43 2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43 1.71-1.57z"/></svg>
            <span>${task.workoutTitle}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            ${isCompleted && rpeNum ? `
              <span class="inbox-rpe-badge ${rpeClass}">
                <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <span>RPE ${rpeNum}/10 • ${rpeLabel}</span>
              </span>
            ` : ''}
            <span style="font-size: 0.76rem; color: var(--text-secondary);">
              ${exTotal > 0 ? `${isCompleted ? exTotal : exDone} de ${exTotal} ejercicios` : ''}
            </span>
          </div>
        </div>

        ${isCompleted ? `
          <div class="inbox-message-bubble">
            <div class="inbox-message-bubble-header">
              <span style="display: flex; align-items: center; gap: 5px;">
                <svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: currentColor;"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                <span>Mensaje / Observaciones del Alumno</span>
              </span>
              <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal; text-transform: none;">${task.completedAt || ''}</span>
            </div>
            <p class="inbox-message-bubble-text">
              "${task.studentFeedback || 'Completado con éxito por el estudiante sin comentarios adicionales.'}"
            </p>
          </div>
        ` : `
          <div class="inbox-pending-box">
            <div class="inbox-pending-box-header">
              <span style="display: flex; align-items: center; gap: 5px;">
                <svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: currentColor;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                <span>Estado de Sesión Asignada</span>
              </span>
              <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal; text-transform: none;">Pendiente</span>
            </div>
            <p class="inbox-pending-text">
              ${task.coachNotes ? `Instrucción dada: "${task.coachNotes}"` : 'Esperando que el alumno inicie su entrenamiento.'}
            </p>
          </div>
        `}

        <div class="inbox-delivery-actions">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp inbox-action-btn" title="Chat de WhatsApp con ${student.name}">
            <svg viewBox="0 0 24 24" class="whatsapp-icon" style="width: 12px; height: 12px; flex-shrink: 0;"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-5.522 0-10 4.478-10 10 0 1.772.463 3.437 1.272 4.887l-1.311 4.793 4.93-1.293c1.401.764 3.007 1.196 4.709 1.196 5.522 0 10-4.478 10-10s-4.478-10-10-10z"/></svg>
            <span class="btn-text">WhatsApp</span>
          </a>
          <button type="button" class="btn-secondary inbox-action-btn inbox-view-detail-btn" data-task-id="${task.id}" data-student-id="${student.id}" title="Ver todos los detalles, ejercicios y reporte de ${student.name}">
            <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor; flex-shrink: 0;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            <span class="btn-text">Detalles</span>
          </button>
          <button type="button" class="btn-secondary inbox-action-btn switch-to-student-btn" data-student-id="${student.id}" title="Ver la aplicación como ${student.name}">
            <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor; flex-shrink: 0;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span class="btn-text">Alumno</span>
          </button>
        </div>
      `;

      // Allow clicking entire card to view full submission details
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('title', 'Toca para abrir detalles completos de la entrega');
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        SoundEffects.tap();
        openCoachTaskDetailModal(task.id, student.id);
      });

      // Specific "Ver Detalles" button click handler
      const detailBtn = card.querySelector('.inbox-view-detail-btn');
      if (detailBtn) {
        detailBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          SoundEffects.tap();
          openCoachTaskDetailModal(task.id, student.id);
        });
      }

      // Switch to student view button
      card.querySelectorAll('.switch-to-student-btn').forEach(b => {
        b.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          SoundEffects.tap();
          switchToStudentView(student.id);
        });
      });

      // WhatsApp link stop propagation so it doesn't trigger card modal
      const waLink = card.querySelector('a.btn-whatsapp');
      if (waLink) {
        waLink.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }

      inboxContainer.appendChild(card);
    });

    // Initialize iPod Cover Flow Swipe Carousel
    setupInboxCarousel();
  }

  function setupInboxCarousel() {
    const container = document.getElementById('coachDeliveriesInboxContainer');
    const navBar = document.getElementById('coachInboxCarouselNav');
    const dotsContainer = document.getElementById('coachInboxCarouselDots');
    const prevBtn = document.getElementById('coachInboxPrevBtn');
    const nextBtn = document.getElementById('coachInboxNextBtn');
    const counterBadge = document.getElementById('coachInboxCarouselCounter');

    if (!container || !navBar) return;

    const cards = Array.from(container.querySelectorAll('.inbox-delivery-card'));
    if (cards.length <= 1) {
      navBar.style.display = 'none';
      cards.forEach(c => c.classList.add('carousel-active-card'));
      container.scrollLeft = 0;
      return;
    }

    navBar.style.display = 'flex';
    if (dotsContainer) dotsContainer.innerHTML = '';

    let currentIndex = 0;

    function updateActiveState(index) {
      currentIndex = Math.max(0, Math.min(cards.length - 1, index));
      cards.forEach((c, i) => {
        c.classList.toggle('carousel-active-card', i === currentIndex);
      });
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === currentIndex);
        });
      }
      if (counterBadge) {
        counterBadge.textContent = `${currentIndex + 1} / ${cards.length}`;
      }
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === cards.length - 1;
    }

    function scrollToCardIndex(index) {
      if (index < 0 || index >= cards.length) return;
      const targetCard = cards[index];
      if (targetCard) {
        const offsetLeft = targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;
        container.scrollTo({ left: Math.max(0, offsetLeft), behavior: 'smooth' });
        updateActiveState(index);
      }
    }

    if (dotsContainer) {
      cards.forEach((card, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('data-index', idx);
        dot.setAttribute('aria-label', `Ir a entrega ${idx + 1}`);
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          SoundEffects.tick();
          scrollToCardIndex(idx);
        });
        dotsContainer.appendChild(dot);
      });
    }

    // Scroll listener on container with rAF debouncing
    let scrollTimeout = null;
    container.onscroll = () => {
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
      scrollTimeout = requestAnimationFrame(() => {
        const containerCenter = container.scrollLeft + container.clientWidth / 2;
        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.clientWidth / 2;
          const dist = Math.abs(containerCenter - cardCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        });

        if (closestIndex !== currentIndex) {
          updateActiveState(closestIndex);
        }
      });
    };

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        SoundEffects.tap();
        scrollToCardIndex(currentIndex - 1);
      };
    }

    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        SoundEffects.tap();
        scrollToCardIndex(currentIndex + 1);
      };
    }

    // Initial state
    updateActiveState(0);
    container.scrollLeft = 0;

    // Mouse drag scrolling support (smooth Cover Flow experience on desktop too)
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    container.onmousedown = (e) => {
      if (e.target.closest('a, button')) return;
      isDown = true;
      hasMoved = false;
      container.style.scrollBehavior = 'auto';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    container.onmouseleave = () => {
      if (isDown) {
        isDown = false;
        container.style.scrollBehavior = 'smooth';
        scrollToCardIndex(currentIndex);
      }
    };

    container.onmouseup = () => {
      if (isDown) {
        isDown = false;
        container.style.scrollBehavior = 'smooth';
        if (hasMoved) {
          scrollToCardIndex(currentIndex);
        }
      }
    };

    container.onmousemove = (e) => {
      if (!isDown) return;
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) hasMoved = true;
      container.scrollLeft = scrollLeft - walk;
    };
  }

  function navigateToInboxTask(taskId) {
    if (!taskId) return;
    const container = document.getElementById('coachDeliveriesInboxContainer');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.inbox-delivery-card'));
    const targetIndex = cards.findIndex(c => c.getAttribute('data-task-id') === taskId || c.id === `coachInboxCard_${taskId}`);

    if (targetIndex !== -1) {
      const targetCard = cards[targetIndex];

      // 1. Horizontal carousel smooth scroll to target card
      const offsetLeft = targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2;
      container.scrollTo({ left: Math.max(0, offsetLeft), behavior: 'smooth' });

      // 2. Set active card class & carousel indicators
      cards.forEach((c, i) => {
        c.classList.toggle('carousel-active-card', i === targetIndex);
      });
      const dots = document.querySelectorAll('#coachInboxCarouselDots .carousel-dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === targetIndex);
      });
      const counterBadge = document.getElementById('coachInboxCarouselCounter');
      if (counterBadge) {
        counterBadge.textContent = `${targetIndex + 1} / ${cards.length}`;
      }

      // 3. Scroll page vertically so target card is clearly centered in viewport
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 4. Highlight the delivery card with animation
      targetCard.classList.remove('task-card-highlighted');
      void targetCard.offsetWidth; // force reflow
      targetCard.classList.add('task-card-highlighted');

      // 5. Highlight student message bubble or pending box inside the card
      const bubble = targetCard.querySelector('.inbox-message-bubble, .inbox-pending-box');
      if (bubble) {
        bubble.classList.remove('message-bubble-highlighted');
        void bubble.offsetWidth;
        bubble.classList.add('message-bubble-highlighted');
        setTimeout(() => bubble.classList.remove('message-bubble-highlighted'), 4000);
      }

      setTimeout(() => targetCard.classList.remove('task-card-highlighted'), 4000);
    } else {
      // Fallback: If found in tasks monitor tab
      const targetTaskCard = document.getElementById(`coachTaskCard_${taskId}`);
      if (targetTaskCard) {
        switchCoachTab('tasks');
        targetTaskCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetTaskCard.classList.add('task-card-highlighted');
        setTimeout(() => targetTaskCard.classList.remove('task-card-highlighted'), 4000);
      }
    }
  }

  function renderCoachScreen() {
    renderCoachInboxSection();
    switchCoachTab(appState.coachActiveTab || 'inbox');
    const studentsContainer = document.getElementById('coachStudentsContainer');
    const tasksMonitorContainer = document.getElementById('coachTasksMonitorContainer');

    studentsContainer.innerHTML = '';
    tasksMonitorContainer.innerHTML = '';

    const searchInput = document.getElementById('searchStudentsDbInput');
    const searchQuery = (searchInput ? searchInput.value : '').trim().toLowerCase();

    const allStudents = appState.data.users.filter(u => u.role === 'student');
    const students = allStudents.filter(st => {
      if (!searchQuery) return true;
      const name = (st.name || '').toLowerCase();
      const nick = (st.nick || st.nickname || '').toLowerCase();
      const phone = (st.phone || '').toLowerCase();
      const email = (st.email || '').toLowerCase();
      const goal = (st.goal || '').toLowerCase();
      const mod = st.preferredModality === 'home' ? 'en casa' : 'con maquinas';
      return name.includes(searchQuery) || nick.includes(searchQuery) || phone.includes(searchQuery) || email.includes(searchQuery) || goal.includes(searchQuery) || mod.includes(searchQuery);
    });

    const dbCounter = document.getElementById('coachDbStudentCounter');
    if (dbCounter) {
      dbCounter.textContent = `${students.length} de ${allStudents.length} perfil(es) en la base de datos`;
    }

    if (students.length === 0) {
      studentsContainer.innerHTML = `
        <div class="schedule-empty-card">
          <img src="./GYMTOP/resources/res/drawable-xxhdpi/im_halter_logo.png" alt="Pesas" class="empty-state-icon">
          <h4>No se encontraron alumnos</h4>
          <p>No hay perfiles que coincidan con "${searchQuery}".</p>
        </div>
      `;
    } else {
      students.forEach(st => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `coachStudentCard_${st.id}`;
        card.dataset.studentId = st.id;
        const prefText = st.preferredModality === 'home' ? 'En Casa (Sin Máquinas)' : 'Con Máquinas';
        const cleanPhone = (st.phone || '').replace(/\D/g, '');
        const waMsg = encodeURIComponent(`Hola ${st.name}! Te saluda tu entrenador Humberto Salinas de TOP-GYM. He preparado tu rutina para esta semana. ¿Cómo te sientes para comenzar?`);
        const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMsg}` : '#';

        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.9rem; margin-bottom: 0.75rem;">
            <img src="${st.avatar}" alt="${st.name}" style="width: 54px; height: 54px; border-radius: 50%; border: 2px solid var(--accent-orange); object-fit: cover;">
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h4 style="font-size: 1.05rem; font-weight: 800;">${st.name}</h4>
                <span style="font-size: 0.72rem; color: #4ade80; font-weight: 700;">Activo</span>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 3px;">${st.goal || 'Objetivo TOP-GYM'}</p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; font-size: 0.72rem; align-items: center;">
                <span style="color: var(--accent-orange); font-weight: 700;">${prefText}</span>
                <span style="color: var(--text-muted);">•</span>
                <span style="color: #4ade80; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                  <svg viewBox="0 0 24 24" style="width: 11px; height: 11px; fill: currentColor;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  ${st.district || 'Miraflores'}
                </span>
                <span style="color: var(--text-muted);">•</span>
                <span style="color: var(--text-secondary);">${st.age ? st.age + ' años' : '24 años'}</span>
                <span style="color: var(--text-muted);">•</span>
                <span style="color: var(--text-secondary); display: inline-flex; align-items: center; gap: 3px;">
                  <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  ${st.phone || 'Sin número'}
                </span>
                <span style="color: var(--text-muted);">•</span>
                <span style="color: var(--text-secondary);">
                  ${st.weight || 70} kg • ${st.height || 175} cm
                </span>
              </div>
            </div>
          </div>

          <!-- Student Confidential Credentials Pill for Coach Reference -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 109, 0, 0.08); border: 1px solid rgba(255, 109, 0, 0.25); border-radius: var(--radius-sm); padding: 0.45rem 0.75rem; margin: 0.5rem 0; font-size: 0.75rem;">
            <span style="color: var(--text-secondary); display: inline-flex; align-items: center; gap: 5px;">
              <svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: var(--accent-orange);"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>Usuario:</span>
              <strong style="color: #4ade80; font-family: monospace;">${st.username || generateStudentUsername(st.name)}</strong>
            </span>
            <span style="display: inline-flex; align-items: center; gap: 5px;">
              <span style="color: var(--text-muted); font-size: 0.7rem;">Clave:</span>
              <span style="background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 4px; color: #ffd180; font-weight: 800; font-family: monospace; letter-spacing: 2px;">${st.pin || '1991'}</span>
            </span>
          </div>

          <div style="display: flex; justify-content: space-around; background: var(--bg-input); border-radius: var(--radius-sm); padding: 0.6rem; margin: 0.6rem 0; text-align: center;">
            <div>
              <h5 style="font-size: 1.1rem; font-weight: 800; color: var(--accent-orange);">${st.stats ? st.stats.completedWorkouts : 0}</h5>
              <span style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Sesiones</span>
            </div>
            <div>
              <h5 style="font-size: 1.1rem; font-weight: 800; color: var(--accent-blue);">${st.stats ? (st.stats.totalVolumeKg / 1000).toFixed(1) : 0}k</h5>
              <span style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Volumen (t)</span>
            </div>
            <div>
              <h5 style="font-size: 1.1rem; font-weight: 800; color: var(--accent-green);">${st.stats ? st.stats.currentStreak : 0} d</h5>
              <span style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Racha</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="flex: 1; min-width: 85px; text-align: center; padding: 0.48rem 0.5rem; font-size: 0.78rem;" title="Abrir chat de WhatsApp directo con ${st.name}">
              <svg viewBox="0 0 24 24" class="whatsapp-icon"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-5.522 0-10 4.478-10 10 0 1.772.463 3.437 1.272 4.887l-1.311 4.793 4.93-1.293c1.401.764 3.007 1.196 4.709 1.196 5.522 0 10-4.478 10-10s-4.478-10-10-10z"/></svg>
              <span>WhatsApp</span>
            </a>
            <button class="btn-secondary edit-student-profile-btn" data-student-id="${st.id}" style="flex: 1; min-width: 90px; font-size: 0.78rem; padding: 0.48rem 0.5rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;" title="Editar datos y contraseña de ${st.name}">
              <svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: currentColor;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              <span>Editar</span>
            </button>
            <button class="btn-secondary switch-to-student-btn" data-student-id="${st.id}" style="flex: 1; min-width: 100px; font-size: 0.78rem; padding: 0.48rem 0.5rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;" title="Ver la aplicación como ${st.name}">
              <svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: currentColor;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              <span>Ver Alumno</span>
            </button>
            <button class="btn-primary btn-coach assign-single-btn" data-student-id="${st.id}" style="flex: 1.1; min-width: 105px; font-size: 0.78rem; padding: 0.48rem 0.5rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;">
              <svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: currentColor;"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
              <span>Asignar</span>
            </button>
          </div>
        `;

        studentsContainer.appendChild(card);
      });
    }

    // Bind edit profile buttons for students in coach screen
    document.querySelectorAll('.edit-student-profile-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.getAttribute('data-student-id');
        openEditProfileModal(studentId);
      });
    });

    // Bind real-time search input for student database
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', () => {
        renderCoachScreen();
      });
    }

    // Update active class on coach filter buttons
    document.querySelectorAll('.coach-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === appState.coachTasksFilterModality);
    });

    let monitoredTasks = appState.data.tasks;
    if (appState.coachTasksFilterModality !== 'all') {
      monitoredTasks = monitoredTasks.filter(t => t.modality === appState.coachTasksFilterModality);
    }

    const coachTaskCountBadge = document.getElementById('coachTaskCountBadge');
    if (coachTaskCountBadge) {
      coachTaskCountBadge.textContent = `${monitoredTasks.length} sesión(es) registradas`;
    }

    if (monitoredTasks.length === 0) {
      tasksMonitorContainer.innerHTML = `
        <div class="schedule-empty-card">
          <img src="./GYMTOP/resources/res/drawable-xxhdpi/im_halter_logo.png" alt="Pesas" class="empty-state-icon">
          <h4>No hay tareas asignadas en esta categoría</h4>
          <p>Puedes asignar una nueva tarea usando el botón superior.</p>
        </div>
      `;
    } else {
      monitoredTasks.forEach(task => {
        const student = appState.data.users.find(u => u.id === task.studentId) || { name: 'Alumno' };
        const isCompleted = task.status === 'completed';
        const modBadge = task.modality === 'home' ? 'Casa' : (task.modality === 'machine' ? 'Máquina' : 'Pesas');

        const card = document.createElement('div');
        card.className = `task-card ${isCompleted ? 'task-completed' : ''}`;
        card.id = `coachTaskCard_${task.id}`;
        card.dataset.taskId = task.id;
        card.dataset.studentId = task.studentId;
        card.style.cursor = 'pointer';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('title', 'Toca para abrir detalle, ejercicios y retroalimentación');
        card.innerHTML = `
          <div>
            <div class="task-header">
              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <span class="task-badge ${isCompleted ? 'badge-completed' : 'badge-pending'}" style="display: inline-flex; align-items: center; gap: 4px;">
                  <svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:currentColor;"><path d="${isCompleted ? 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' : 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'}"/></svg>
                  <span>${isCompleted ? 'Completada' : 'Pendiente'}</span>
                </span>
                <span class="task-badge" style="background: rgba(255,255,255,0.08); color: var(--text-secondary);">
                  ${modBadge}
                </span>
              </div>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">
                Alumno: <strong>${student.name}</strong>
              </span>
            </div>

            <h3 class="task-title">${task.workoutTitle}</h3>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">Fecha asignada: ${task.scheduledDate}</p>

            <div class="task-coach-note">
              <strong>Instrucciones dadas:</strong> "${task.coachNotes || 'Sin notas'}"
            </div>

            ${isCompleted ? `
              <div class="task-coach-feedback-box" style="border-left: 2px solid #3b82f6; padding: 0.6rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 0.8rem; margin-top: 0.6rem;">
                <strong>Retroalimentación del Alumno (RPE: ${task.ratingRPE}/10):</strong><br>
                "${task.studentFeedback || 'Completado sin comentarios'}"
                <div class="task-feedback-completed-date" style="font-size: 0.7rem; margin-top: 4px;">Completado: ${task.completedAt}</div>
              </div>
            ` : `
              <div style="font-size: 0.8rem; color: var(--accent-orange); margin-top: 0.4rem;">
                • Esperando ejecución por parte del estudiante en su cronograma
              </div>
            `}
          </div>
        `;

        card.addEventListener('click', (e) => {
          if (e.target.closest('a, button')) return;
          SoundEffects.tap();
          openCoachTaskDetailModal(task.id, task.studentId);
        });

        card.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            SoundEffects.tap();
            openCoachTaskDetailModal(task.id, task.studentId);
          }
        });

        tasksMonitorContainer.appendChild(card);
      });
    }

    document.querySelectorAll('.assign-single-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.getAttribute('data-student-id');
        openAssignModal(studentId);
      });
    });

    document.querySelectorAll('.switch-to-student-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.getAttribute('data-student-id');
        switchToStudentView(studentId);
      });
    });
  }

  function switchToStudentView(studentId) {
    const student = appState.data.users.find(u => u.id === studentId);
    if (!student) return;
    appState.currentUser = student;
    appState.currentRole = 'student';
    appState.simulatedByCoach = true;
    StorageManager.saveSession(student.id, 'student');
    setupRoleAndUser();
    setupScheduleWeekBar();
    renderScheduleScreen();
    renderWorkoutPlansScreen();
    renderExerciseCatalog();
    renderProgressScreen();
    switchScreen('scheduleScreen');
    SoundEffects.chime();
    showToast(`Visualizando como ${student.name}. Toca "Volver a Coach" en la cabecera para regresar.`, 'coach');
  }

  // ==========================================================================
  // 7. TASK ASSIGNMENT MODAL WITH VISUAL ROUTINE SELECTOR & SPECIFIC BREAKDOWN
  // ==========================================================================
  let currentAssignModalityFilter = 'all';

  function updateStudentPreviewBadge(studentId) {
    const badge = document.getElementById('taskStudentSelectedBadge');
    if (!badge) return;
    const student = (appState.data.users || []).find(u => u.id === studentId);
    if (!student) {
      badge.innerHTML = '';
      return;
    }
    const modText = student.preferredModality === 'home' ? '🏠 Entrena en Casa' : '⚙️ Gimnasio Máquinas';
    const modColor = student.preferredModality === 'home' ? '#10b981' : '#ff9100';
    badge.innerHTML = `
      <img src="${student.avatar}" alt="${student.name}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${modColor};">
      <span style="color: ${modColor}; font-weight: 700;">${modText}</span>
    `;
  }

  function renderSpecificExercisesPreview(plan, day) {
    const box = document.getElementById('routineExercisesSpecificBox');
    const title = document.getElementById('specificBoxTitle');
    const countBadge = document.getElementById('specificExerciseCountBadge');
    const scrollList = document.getElementById('specificExercisesScrollList');
    const toggleBtn = document.getElementById('toggleAllExercisesBtn');
    if (!box || !scrollList) return;

    if (!plan || !day || !day.exercises || day.exercises.length === 0) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';
    if (title) title.textContent = `${plan.name} - ${day.name}`;

    const updateBadgeCount = () => {
      const checkedCount = scrollList.querySelectorAll('.specific-ex-check:checked').length;
      if (countBadge) countBadge.textContent = `${checkedCount} de ${day.exercises.length} seleccionados`;
      if (toggleBtn) {
        toggleBtn.textContent = checkedCount === day.exercises.length ? 'Deseleccionar todos' : 'Seleccionar todos';
      }
    };

    scrollList.innerHTML = '';
    const allExercises = appState.data.exercises || [];

    day.exercises.forEach((exObj, idx) => {
      const exData = allExercises.find(e => e.id === exObj.exerciseId || e.tag == exObj.exerciseId) || {
        name: exObj.note || `Ejercicio #${idx + 1}`,
        muscle: 'general',
        equipment: plan.modalityLabel,
        gifUrl: './GYMTOP/resources/res/drawable/frente_base.png'
      };

      const setsCount = exObj.series ? exObj.series.length : 3;
      const repsCount = exObj.series && exObj.series[0] ? exObj.series[0].reps : 12;
      const restSec = exObj.restTime || 60;

      const item = document.createElement('div');
      item.className = 'specific-exercise-item checked';
      item.innerHTML = `
        <label class="specific-ex-check-label" title="Marcar o desmarcar ejercicio para esta tarea">
          <input type="checkbox" class="specific-ex-check" checked data-index="${idx}" data-exercise-id="${exObj.exerciseId}">
          <span class="custom-check-box">
            <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
          </span>
        </label>
        <div class="specific-ex-thumb-wrap" title="Ver animación de ${exData.name}">
          <img src="${exData.gifUrl}" alt="${exData.name}" loading="lazy">
        </div>
        <div class="specific-ex-details">
          <span class="specific-ex-name" title="${exData.name}">
            ${idx + 1}. ${exData.name}
          </span>
          <div class="specific-ex-meta">
            <span class="specific-ex-badge">${exData.equipment || plan.modalityLabel}</span>
            <span style="color: var(--text-muted);">•</span>
            <span style="color: #80d8ff;">Descanso: ${restSec}s</span>
          </div>
        </div>
        <div class="specific-ex-series-info">
          <span class="specific-ex-series-pill">${setsCount} × ${repsCount} reps</span>
        </div>
      `;

      const checkbox = item.querySelector('.specific-ex-check');
      const handleToggle = () => {
        item.classList.toggle('checked', checkbox.checked);
        item.classList.toggle('unchecked', !checkbox.checked);
        updateBadgeCount();
      };

      checkbox.addEventListener('change', handleToggle);

      // Clicking anywhere on the item (except the GIF thumbnail or the checkbox itself) toggles the check
      item.addEventListener('click', (ev) => {
        if (ev.target.closest('.specific-ex-thumb-wrap') || ev.target.closest('.specific-ex-check-label')) return;
        checkbox.checked = !checkbox.checked;
        handleToggle();
      });

      // Allow clicking thumbnail to open full exercise detail modal
      const thumb = item.querySelector('.specific-ex-thumb-wrap');
      if (thumb && exData.id) {
        thumb.style.cursor = 'pointer';
        thumb.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openExerciseDetailModal(exData);
        });
      }

      scrollList.appendChild(item);
    });

    updateBadgeCount();

    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.preventDefault();
        const allChecks = scrollList.querySelectorAll('.specific-ex-check');
        const currentlyChecked = scrollList.querySelectorAll('.specific-ex-check:checked');
        const makeChecked = currentlyChecked.length < allChecks.length;
        allChecks.forEach(cb => {
          cb.checked = makeChecked;
          const parentItem = cb.closest('.specific-exercise-item');
          if (parentItem) {
            parentItem.classList.toggle('checked', makeChecked);
            parentItem.classList.toggle('unchecked', !makeChecked);
          }
        });
        updateBadgeCount();
      };
    }
  }

  function renderVisualRoutineSelector(selectedModality = 'all', preselectedCombo = null) {
    const container = document.getElementById('visualRoutineCardsContainer');
    const hiddenInput = document.getElementById('taskPlanSelectedValue');
    if (!container) return;

    currentAssignModalityFilter = selectedModality;

    // Update active state on filter chips
    document.querySelectorAll('.routine-filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.modality === selectedModality);
    });

    const plans = selectedModality === 'all'
      ? appState.data.workoutPlans
      : appState.data.workoutPlans.filter(p => p.modality === selectedModality);

    container.innerHTML = '';

    // Regla de distribución: cuando es 2 o más, van de a dos (uno a cada lado). Si es 1, centrado.
    if (plans.length === 1) {
      container.classList.add('single-card-layout');
      container.classList.remove('multi-card-layout');
    } else {
      container.classList.remove('single-card-layout');
      container.classList.add('multi-card-layout');
    }

    if (plans.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: var(--text-secondary); font-size: 0.8rem;">
          No hay rutinas registradas en esta categoría.
        </div>
      `;
      if (hiddenInput) hiddenInput.value = '';
      renderSpecificExercisesPreview(null, null);
      return;
    }

    let defaultSelectedPlan = null;
    let defaultSelectedDay = null;

    plans.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'visual-routine-card';
      card.dataset.planId = plan.id;

      const modBadgeClass = plan.modality === 'home'
        ? 'badge-tag-home'
        : (plan.modality === 'machine' ? 'badge-tag-machine' : 'badge-tag-freeweight');

      const modBadgeIcon = plan.modality === 'home' ? '🏠' : (plan.modality === 'machine' ? '⚙️' : '🏋️');

      let daysChipsHtml = '';
      plan.days.forEach(day => {
        daysChipsHtml += `
          <button type="button" class="visual-routine-day-chip" data-plan-id="${plan.id}" data-day-id="${day.id}">
            ${day.name.replace(/^(Sesión|Día)\s+/i, '')} (${day.exercises.length} ej)
          </button>
        `;
      });

      card.innerHTML = `
        <div class="visual-routine-card-cover">
          <img src="${plan.coverImage}" alt="${plan.name}" loading="lazy">
          <div class="visual-routine-card-cover-overlay"></div>
          <span class="visual-routine-badge-tag ${modBadgeClass}">
            <span>${modBadgeIcon}</span>
            <span>${plan.modalityLabel}</span>
          </span>
          <span class="visual-routine-check-indicator">✓</span>
        </div>
        <div class="visual-routine-card-info">
          <h4 class="visual-routine-title">${plan.name}</h4>
          <span class="visual-routine-subtitle">${plan.details.slice(0, 72)}...</span>
          <div class="visual-routine-days-chips">
            ${daysChipsHtml}
          </div>
        </div>
      `;

      // Select handler
      const selectThisCardDay = (chosenDayId) => {
        const chosenDay = plan.days.find(d => d.id === chosenDayId) || plan.days[0];
        document.querySelectorAll('.visual-routine-card').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.visual-routine-day-chip').forEach(c => c.classList.remove('active'));

        card.classList.add('active');
        const activeChip = card.querySelector(`.visual-routine-day-chip[data-day-id="${chosenDay.id}"]`);
        if (activeChip) activeChip.classList.add('active');

        const comboValue = `${plan.id}__${chosenDay.id}`;
        if (hiddenInput) hiddenInput.value = comboValue;
        if (taskPlanSelect) {
          taskPlanSelect.innerHTML = `<option value="${comboValue}" selected>${plan.name} - ${chosenDay.name}</option>`;
        }

        renderSpecificExercisesPreview(plan, chosenDay);
      };

      card.addEventListener('click', (ev) => {
        const clickedChip = ev.target.closest('.visual-routine-day-chip');
        if (clickedChip) {
          selectThisCardDay(clickedChip.dataset.dayId);
        } else {
          selectThisCardDay(plan.days[0].id);
        }
      });

      container.appendChild(card);

      // Check if this should be selected
      if (preselectedCombo && preselectedCombo.startsWith(plan.id)) {
        defaultSelectedPlan = plan;
        const matchDay = plan.days.find(d => `${plan.id}__${d.id}` === preselectedCombo);
        defaultSelectedDay = matchDay || plan.days[0];
      } else if (!defaultSelectedPlan) {
        defaultSelectedPlan = plan;
        defaultSelectedDay = plan.days[0];
      }
    });

    // Apply initial selection
    if (defaultSelectedPlan && defaultSelectedDay) {
      const targetCard = container.querySelector(`.visual-routine-card[data-plan-id="${defaultSelectedPlan.id}"]`);
      if (targetCard) {
        targetCard.classList.add('active');
        const chip = targetCard.querySelector(`.visual-routine-day-chip[data-day-id="${defaultSelectedDay.id}"]`);
        if (chip) chip.classList.add('active');
      }
      const combo = `${defaultSelectedPlan.id}__${defaultSelectedDay.id}`;
      if (hiddenInput) hiddenInput.value = combo;
      if (taskPlanSelect) {
        taskPlanSelect.innerHTML = `<option value="${combo}" selected>${defaultSelectedPlan.name} - ${defaultSelectedDay.name}</option>`;
      }
      renderSpecificExercisesPreview(defaultSelectedPlan, defaultSelectedDay);
    }
  }

  function openAssignModal(preselectStudentId = null) {
    taskStudentSelect.innerHTML = '';
    const students = appState.data.users.filter(u => u.role === 'student');
    let preselectedStudent = null;

    students.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `${st.name} (${st.preferredModality === 'home' ? 'Entrena en Casa' : 'Gimnasio con Máquinas'})`;
      if (preselectStudentId && st.id === preselectStudentId) {
        opt.selected = true;
        preselectedStudent = st;
      }
      taskStudentSelect.appendChild(opt);
    });

    if (!preselectedStudent && students.length > 0) {
      preselectedStudent = students[0];
    }

    if (preselectedStudent) {
      updateStudentPreviewBadge(preselectedStudent.id);
    }

    // Auto-select modality filter based on student preference
    const modalityToUse = preselectedStudent && preselectedStudent.preferredModality ? preselectedStudent.preferredModality : 'all';
    renderVisualRoutineSelector(modalityToUse);

    taskDateInput.value = new Date().toISOString().split('T')[0];
    assignTaskModal.classList.add('active');
  }

  // Filter chips click handling
  document.querySelectorAll('.routine-filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const mod = chip.dataset.modality;
      renderVisualRoutineSelector(mod);
    });
  });

  // Coaching notes presets
  document.querySelectorAll('.btn-preset-note').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const noteInput = document.getElementById('taskNotesInput');
      if (noteInput) {
        const text = btn.dataset.note;
        if (noteInput.value.trim()) {
          noteInput.value += ' ' + text;
        } else {
          noteInput.value = text;
        }
        noteInput.focus();
      }
    });
  });

  taskStudentSelect.addEventListener('change', (e) => {
    const student = appState.data.users.find(u => u.id === e.target.value);
    if (student) {
      updateStudentPreviewBadge(student.id);
      if (student.preferredModality) {
        renderVisualRoutineSelector(student.preferredModality);
      }
    }
  });

  openAssignTaskModalBtn.addEventListener('click', () => openAssignModal());
  closeAssignTaskModalBtn.addEventListener('click', () => {
    assignTaskModal.classList.remove('active');
    assignTaskModal.style.display = 'none';
    if (!document.querySelector('.modal-overlay.active')) {
      const loginScr = document.getElementById('loginScreen');
      if (!loginScr || loginScr.style.display === 'none') {
        document.body.classList.remove('modal-open');
      }
    }
  });
  if (cancelAssignTaskBtn) {
    cancelAssignTaskBtn.addEventListener('click', () => {
      assignTaskModal.classList.remove('active');
      assignTaskModal.style.display = 'none';
      if (!document.querySelector('.modal-overlay.active')) {
        const loginScr = document.getElementById('loginScreen');
        if (!loginScr || loginScr.style.display === 'none') {
          document.body.classList.remove('modal-open');
        }
      }
    });
  }

  assignTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = taskStudentSelect.value;
    const hiddenValue = document.getElementById('taskPlanSelectedValue') ? document.getElementById('taskPlanSelectedValue').value : '';
    const comboValue = hiddenValue || (taskPlanSelect ? taskPlanSelect.value : '');

    if (!comboValue) {
      showToast('Por favor selecciona una rutina del selector visual.', 'coach');
      return;
    }

    const planDayCombined = comboValue.split('__');
    const planId = planDayCombined[0];
    const dayId = planDayCombined[1];
    const scheduledDate = taskDateInput.value;
    const notes = document.getElementById('taskNotesInput').value;
    const focusSelect = document.getElementById('taskFocusSelect');
    const restSelect = document.getElementById('taskRestSelect');

    const sessionFocus = focusSelect ? focusSelect.value : 'Hipertrofia Muscular';
    const restTimeSec = restSelect ? parseInt(restSelect.value, 10) : 90;

    const plan = appState.data.workoutPlans.find(p => p.id === planId);
    const day = plan ? plan.days.find(d => d.id === dayId) : null;

    if (!day) return;

    // Filter only exercises with active check
    const checkedBoxes = Array.from(document.querySelectorAll('.specific-ex-check:checked'));
    if (checkedBoxes.length === 0) {
      showToast('Por favor selecciona al menos un ejercicio con el check para enviar la tarea.', 'coach');
      return;
    }

    const selectedIndices = new Set(checkedBoxes.map(cb => parseInt(cb.dataset.index, 10)));
    const filteredExercises = day.exercises.filter((_, idx) => selectedIndices.has(idx));

    const newTask = {
      id: 'task_' + Date.now(),
      coachId: 'usr_coach_1',
      studentId: studentId,
      workoutTitle: `${plan.name} - ${day.name}`,
      focus: sessionFocus,
      modality: plan.modality,
      scheduledDate: scheduledDate,
      scheduledDayName: 'Programada',
      status: 'pending',
      coachNotes: notes || `Enfoque: ${sessionFocus}. Sesión de ${plan.modalityLabel} asignada por tu Coach Humberto Salinas.`,
      targetRestTime: restTimeSec,
      exercises: JSON.parse(JSON.stringify(filteredExercises)),
      completedAt: null,
      studentFeedback: null,
      ratingRPE: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    appState.data.tasks.unshift(newTask);
    StorageManager.save(appState.data, true, true);

    if (typeof NotificationManager !== 'undefined') {
      const targetStudent = appState.data.users.find(u => u.id === studentId);
      NotificationManager.notifyTaskAssigned(newTask, targetStudent);
    }

    assignTaskModal.classList.remove('active');
    SoundEffects.taskSent();
    const targetStudentObj = appState.data.users.find(u => u.id === studentId);
    showToast(`Sesión asignada a ${targetStudentObj ? targetStudentObj.name : 'alumno'} con éxito.`, 'success');

    renderScheduleScreen();
    renderCoachScreen();
    setupScheduleWeekBar();
  });

  // Botón directo para asignar y despachar por WhatsApp al alumno
  const assignTaskNotifyWaBtn = document.getElementById('assignTaskNotifyWaBtn');
  if (assignTaskNotifyWaBtn) {
    assignTaskNotifyWaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const studentId = taskStudentSelect.value;
      const hiddenValue = document.getElementById('taskPlanSelectedValue') ? document.getElementById('taskPlanSelectedValue').value : '';
      const comboValue = hiddenValue || (taskPlanSelect ? taskPlanSelect.value : '');

      if (!comboValue) {
        showToast('Por favor selecciona una rutina del selector visual.', 'coach');
        return;
      }

      const planDayCombined = comboValue.split('__');
      const planId = planDayCombined[0];
      const dayId = planDayCombined[1];
      const scheduledDate = taskDateInput.value;
      const notes = document.getElementById('taskNotesInput').value;
      const focusSelect = document.getElementById('taskFocusSelect');
      const restSelect = document.getElementById('taskRestSelect');

      const sessionFocus = focusSelect ? focusSelect.value : 'Hipertrofia Muscular';
      const restTimeSec = restSelect ? parseInt(restSelect.value, 10) : 90;

      const plan = appState.data.workoutPlans.find(p => p.id === planId);
      const day = plan ? plan.days.find(d => d.id === dayId) : null;
      if (!day) return;

      const checkedBoxes = Array.from(document.querySelectorAll('.specific-ex-check:checked'));
      if (checkedBoxes.length === 0) {
        showToast('Por favor selecciona al menos un ejercicio con el check para enviar la tarea.', 'coach');
        return;
      }

      const selectedIndices = new Set(checkedBoxes.map(cb => parseInt(cb.dataset.index, 10)));
      const filteredExercises = day.exercises.filter((_, idx) => selectedIndices.has(idx));
      const targetStudent = appState.data.users.find(u => u.id === studentId);

      const newTask = {
        id: 'task_' + Date.now(),
        coachId: 'usr_coach_1',
        studentId: studentId,
        workoutTitle: `${plan.name} - ${day.name}`,
        focus: sessionFocus,
        modality: plan.modality,
        scheduledDate: scheduledDate,
        scheduledDayName: 'Programada',
        status: 'pending',
        coachNotes: notes || `Enfoque: ${sessionFocus}. Sesión de ${plan.modalityLabel} asignada por tu Coach Humberto Salinas.`,
        targetRestTime: restTimeSec,
        exercises: JSON.parse(JSON.stringify(filteredExercises)),
        completedAt: null,
        studentFeedback: null,
        ratingRPE: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      appState.data.tasks.unshift(newTask);
      StorageManager.save(appState.data, true, true);

      if (typeof NotificationManager !== 'undefined') {
        NotificationManager.notifyTaskAssigned(newTask, targetStudent);
      }

      assignTaskModal.classList.remove('active');
      SoundEffects.taskSent();

      renderScheduleScreen();
      renderCoachScreen();
      setupScheduleWeekBar();

      // Despachar por WhatsApp al alumno
      const studentName = targetStudent ? targetStudent.name : 'Alumno';
      const cleanPhone = targetStudent && targetStudent.phone ? targetStudent.phone.replace(/\D/g, '') : '';
      const waMsgLines = [
        '🏋️ *TOP-GYM • NUEVA RUTINA ASIGNADA*',
        `Hola *${studentName}*! Te saluda tu Coach Humberto Salinas de TOP-GYM.`,
        `Acabo de asignarte la sesión: *${newTask.workoutTitle}* para el *${scheduledDate || 'día de hoy'}*.`,
        `🎯 Enfoque: *${sessionFocus}* (${plan.modalityLabel})`,
        notes ? `💬 *Instrucciones especiales:* "${notes}"` : '💬 *Instrucción:* Sigue las series y descansos estrictamente en tu app.',
        '¡Revisa los ejercicios detallados y animaciones en tu app TOP-GYM! A entrenar con todo el enfoque! 💪🔥'
      ];

      if (cleanPhone) {
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsgLines.join('\n'))}`;
        window.open(waUrl, '_blank');
        showToast(`¡Tarea asignada y abriendo WhatsApp de ${studentName}!`, 'success');
      } else {
        showToast(`Tarea asignada y notificada a ${studentName} en la app.`, 'success');
      }
    });
  }

  // ==========================================================================
  // STUDENT REGISTRATION & EXERCISE ANATOMY HELPERS
  // ==========================================================================

  // Process & optimize uploaded images via Canvas (Max 360x360, WebP/JPEG ~25KB)
  // Prevents localStorage quota limits while preserving crystal clear portraits
  function processUploadedImage(file, callback) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'coach');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 360;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(compressedDataUrl);
      };
      img.onerror = () => {
        showToast('Error al leer el archivo de imagen.', 'coach');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function initAvatarPicker() {
    if (!regAvatarPickerContainer) return;
    regAvatarPickerContainer.innerHTML = '';
    const avatars = (appState.data && appState.data.availableAvatars) || (window.GymData && window.GymData.availableAvatars) || [];
    avatars.forEach((av, idx) => {
      const item = document.createElement('div');
      item.className = `avatar-pick-item ${idx === 0 ? 'selected' : ''}`;
      item.setAttribute('data-url', av.url);
      item.title = av.label;
      item.innerHTML = `<img src="${av.url}" alt="${av.label}">`;
      item.addEventListener('click', () => {
        document.querySelectorAll('#regAvatarPickerContainer .avatar-pick-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        if (regSelectedAvatar) regSelectedAvatar.value = av.url;
        const customPreview = document.getElementById('regCustomAvatarPreview');
        if (customPreview) customPreview.src = av.url;
      });
      regAvatarPickerContainer.appendChild(item);
    });

    if (avatars.length > 0 && regSelectedAvatar) {
      regSelectedAvatar.value = avatars[0].url;
      const customPreview = document.getElementById('regCustomAvatarPreview');
      if (customPreview) customPreview.src = avatars[0].url;
    }

    // Connect custom photo file uploader in Registration Modal
    const regUploadCustomPhotoBtn = document.getElementById('regUploadCustomPhotoBtn');
    const regStudentCustomPhotoInput = document.getElementById('regStudentCustomPhotoInput');
    const regCustomAvatarPreview = document.getElementById('regCustomAvatarPreview');

    if (regUploadCustomPhotoBtn && regStudentCustomPhotoInput && !regUploadCustomPhotoBtn.dataset.bound) {
      regUploadCustomPhotoBtn.dataset.bound = 'true';
      regUploadCustomPhotoBtn.addEventListener('click', () => {
        regStudentCustomPhotoInput.click();
      });

      regStudentCustomPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          processUploadedImage(file, (dataUrl) => {
            if (regCustomAvatarPreview) regCustomAvatarPreview.src = dataUrl;
            if (regSelectedAvatar) regSelectedAvatar.value = dataUrl;
            document.querySelectorAll('#regAvatarPickerContainer .avatar-pick-item').forEach(el => el.classList.remove('selected'));
            SoundEffects.beep(true);
            showToast('Foto personalizada del alumno cargada exitosamente.', 'success');
          });
        }
      });
    }
  }

  function openExerciseDetail(exId) {
    const ex = appState.data.exercises.find(item => item.id === exId);
    if (!ex || !exerciseDetailModal) return;
    currentDetailExercise = ex;

    const anat = typeof getExerciseAnatomy === 'function' ? getExerciseAnatomy(ex) : (window.getExerciseAnatomy ? window.getExerciseAnatomy(ex) : null);

    const nameEl = document.getElementById('modalExDetailName');
    if (nameEl) nameEl.textContent = ex.name;

    const badgeEl = document.getElementById('modalExDetailModalityBadge');
    if (badgeEl) {
      badgeEl.textContent = ex.modalityLabel || (ex.modality === 'home' ? 'En Casa (Sin Máquinas)' : 'Con Máquina / Polea');
      badgeEl.style.background = ex.modality === 'home' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 109, 0, 0.2)';
      badgeEl.style.color = ex.modality === 'home' ? '#4ade80' : 'var(--accent-orange)';
      badgeEl.style.border = ex.modality === 'home' ? '1px solid #22c55e' : '1px solid var(--accent-orange)';
    }

    const gifEl = document.getElementById('modalExDetailGif');
    if (gifEl) gifEl.src = ex.gifUrl;

    if (anat) {
      const baseEl = document.getElementById('modalExDetailAnatomyBase');
      const overlayEl = document.getElementById('modalExDetailAnatomyOverlay');
      const primEl = document.getElementById('modalExDetailPrimaryMuscle');
      const secEl = document.getElementById('modalExDetailSecondaryMuscle');
      if (baseEl) baseEl.src = anat.baseImg;
      if (overlayEl) overlayEl.src = anat.overlayImg;
      if (primEl) primEl.textContent = anat.primaryMuscle;
      if (secEl) secEl.textContent = 'Secundarios: ' + anat.secondaryMuscle;
    }

    const instEl = document.getElementById('modalExDetailInstructions');
    if (instEl) instEl.textContent = ex.details || 'Controla la fase excéntrica y concéntrica. Mantén la postura alineada y respira fluidamente durante cada repetición.';

    const equipEl = document.getElementById('modalExDetailEquipment');
    if (equipEl) equipEl.textContent = ex.equipment || (ex.modality === 'home' ? 'Sin Máquina / Peso Corporal' : 'Máquina Guiada');

    const restEl = document.getElementById('modalExDetailRest');
    if (restEl) restEl.textContent = `${ex.defaultRest || 60}s`;

    exerciseDetailModal.classList.add('active');
  }

  function closeExerciseDetail() {
    if (exerciseDetailModal) exerciseDetailModal.classList.remove('active');
    currentDetailExercise = null;
  }

  // ==========================================================================
  // SHORTCUTS & EVENT LISTENERS
  // ==========================================================================
  function setupEventListeners() {
    // Confidential Security & Authentication Modal Listeners
    if (closeSecurityAuthModalBtn) closeSecurityAuthModalBtn.addEventListener('click', closeSecurityAuthModal);

    if (openCoachAuthModalBtn) {
      openCoachAuthModalBtn.addEventListener('click', () => openSecurityAuthModal('coach'));
    }

    if (coachTabBtn) {
      coachTabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (appState.currentRole === 'coach') {
          switchScreen('coachScreen');
        } else {
          openSecurityAuthModal('coach');
        }
      });
    }

    if (mobileCoachBtn) {
      mobileCoachBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (appState.currentRole === 'coach') {
          switchScreen('coachScreen');
        } else {
          openSecurityAuthModal('coach');
        }
      });
    }

    if (logoutCoachBtn) {
      logoutCoachBtn.addEventListener('click', () => logoutUser('Coach'));
    }

    const switchRoleFromCoachBtn = document.getElementById('switchRoleFromCoachBtn');
    if (switchRoleFromCoachBtn) {
      switchRoleFromCoachBtn.addEventListener('click', () => {
        openSecurityAuthModal('student');
      });
    }

    const coachReturnBtn = document.getElementById('coachReturnBtn');
    if (coachReturnBtn) {
      coachReturnBtn.addEventListener('click', () => {
        const coach = appState.data.users.find(u => u.role === 'coach');
        if (coach) {
          appState.currentUser = coach;
          appState.currentRole = 'coach';
          appState.simulatedByCoach = false;
          StorageManager.saveSession(coach.id, 'coach');
          setupRoleAndUser();
          renderCoachScreen();
          switchScreen('coachScreen');
          SoundEffects.chime();
          showToast('De vuelta en el Panel de Coach Humberto Salinas', 'coach');
        }
      });
    }

    // Coach Profile Dropdown Trigger (Unified Capsule Button)
    const coachProfilePickerBtn = document.getElementById('coachProfilePickerBtn');
    if (coachProfilePickerBtn) {
      coachProfilePickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeStudentProfileDropdown();
        toggleCoachProfileDropdown();
      });
    }

    const dropdownCoachEditProfileBtn = document.getElementById('dropdownCoachEditProfileBtn');
    if (dropdownCoachEditProfileBtn) {
      dropdownCoachEditProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCoachProfileDropdown();
        openEditProfileModal(appState.currentUser?.id);
      });
    }

    const dropdownCoachSwitchRoleBtn = document.getElementById('dropdownCoachSwitchRoleBtn');
    if (dropdownCoachSwitchRoleBtn) {
      dropdownCoachSwitchRoleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCoachProfileDropdown();
        openSecurityAuthModal('student');
      });
    }

    const dropdownCoachLogoutBtn = document.getElementById('dropdownCoachLogoutBtn');
    if (dropdownCoachLogoutBtn) {
      dropdownCoachLogoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCoachProfileDropdown();
        logoutUser('Coach');
      });
    }

    // Student Profile Dropdown Trigger (Unified Capsule Button)
    if (profilePickerBtn) {
      profilePickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCoachProfileDropdown();
        toggleStudentProfileDropdown();
      });
    }

    const dropdownEditProfileBtn = document.getElementById('dropdownEditProfileBtn');
    if (dropdownEditProfileBtn) {
      dropdownEditProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeStudentProfileDropdown();
        openEditProfileModal(appState.currentUser?.id);
      });
    }

    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    if (dropdownLogoutBtn) {
      dropdownLogoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeStudentProfileDropdown();
        logoutUser('Alumno');
      });
    }

    const dropdownGoToTasksBtn = document.getElementById('dropdownGoToTasksBtn');
    if (dropdownGoToTasksBtn) {
      dropdownGoToTasksBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeStudentProfileDropdown();
        switchScreen('scheduleScreen');
      });
    }

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
      const studentDropdown = document.getElementById('studentProfileDropdown');
      const studentPicker = document.getElementById('profilePickerBtn');
      if (studentDropdown && studentDropdown.style.display !== 'none') {
        if (!studentDropdown.contains(e.target) && !studentPicker?.contains(e.target)) {
          closeStudentProfileDropdown();
        }
      }

      const coachDropdown = document.getElementById('coachProfileDropdown');
      const coachPicker = document.getElementById('coachProfilePickerBtn');
      if (coachDropdown && coachDropdown.style.display !== 'none') {
        if (!coachDropdown.contains(e.target) && !coachPicker?.contains(e.target)) {
          closeCoachProfileDropdown();
        }
      }
    });

    if (closeMyProfileModalBtn) {
      closeMyProfileModalBtn.addEventListener('click', closeMyProfileModal);
    }

    const openEditMyProfileBtn = document.getElementById('openEditMyProfileBtn');
    if (openEditMyProfileBtn) {
      openEditMyProfileBtn.addEventListener('click', () => {
        openEditProfileModal();
      });
    }

    const closeEditProfileModalBtn = document.getElementById('closeEditProfileModalBtn');
    if (closeEditProfileModalBtn) {
      closeEditProfileModalBtn.addEventListener('click', closeEditProfileModal);
    }

    const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
    if (cancelEditProfileBtn) {
      cancelEditProfileBtn.addEventListener('click', closeEditProfileModal);
    }

    const editProfileChangeAvatarBtn = document.getElementById('editProfileChangeAvatarBtn');
    if (editProfileChangeAvatarBtn) {
      editProfileChangeAvatarBtn.addEventListener('click', () => {
        openChangeAvatarModal();
      });
    }

    // Toggle password visibility helpers

    const toggleEditProfilePinVisibility = document.getElementById('toggleEditProfilePinVisibility');
    const editProfilePin = document.getElementById('editProfilePin');
    if (toggleEditProfilePinVisibility && editProfilePin) {
      toggleEditProfilePinVisibility.addEventListener('click', () => {
        editProfilePin.type = editProfilePin.type === 'password' ? 'text' : 'password';
      });
    }

    // Edit Profile Form Submit Handler
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
      editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = document.getElementById('editProfileTargetUserId');
        const targetId = idInput?.value || appState.currentUser?.id;
        const target = appState.data.users.find(u => u.id === targetId);

        if (!target) {
          showToast('Usuario no encontrado.', 'coach');
          return;
        }

        const fullName = (document.getElementById('editProfileName')?.value || '').trim();
        const nick = (document.getElementById('editProfileNick')?.value || '').trim() || fullName.split(' ')[0];
        const phone = (document.getElementById('editProfilePhone')?.value || '').trim();
        const email = (document.getElementById('editProfileEmail')?.value || '').trim();
        const weight = parseFloat(document.getElementById('editProfileWeight')?.value) || target.weight || 70;
        const height = parseFloat(document.getElementById('editProfileHeight')?.value) || target.height || 175;
        const age = parseInt(document.getElementById('editProfileAge')?.value) || target.age || 24;
        const district = document.getElementById('editProfileDistrict')?.value || target.district || 'Miraflores';
        const modality = document.getElementById('editProfileModality')?.value || target.preferredModality || 'machine';
        const goal = (document.getElementById('editProfileGoal')?.value || '').trim();
        const pin = (document.getElementById('editProfilePin')?.value || '').trim();
        const avatarPreview = document.getElementById('editProfileAvatarPreview');

        target.name = fullName;
        target.nick = nick;
        target.nickname = nick;
        target.phone = phone;
        target.email = email;
        target.weight = weight;
        target.height = height;
        target.age = age;
        target.district = district;
        target.preferredModality = modality;
        target.goal = goal;
        if (pin) target.pin = pin;
        if (avatarPreview && avatarPreview.src) target.avatar = avatarPreview.src;
        target.updatedAt = Date.now();

        // If weight changed and user is student, record confidential measurement
        if (target.role === 'student') {
          appState.data.bodyMeasurements.unshift({
            studentId: target.id,
            date: new Date().toISOString().split('T')[0],
            weight: weight,
            chest: 98,
            arm: 34,
            waist: 79
          });
        }

        StorageManager.save(appState.data, true, true);

        // If target is current active user, update active session, header and dropdowns
        if (appState.currentUser && appState.currentUser.id === target.id) {
          appState.currentUser = target;
          StorageManager.saveSession(target.id, appState.currentRole);
          setupRoleAndUser();
        }

        closeEditProfileModal();
        if (myProfileModal && myProfileModal.classList.contains('active')) {
          openMyProfileModal();
        }

        renderScheduleScreen();
        renderWorkoutPlansScreen();
        renderExerciseCatalog();
        renderProgressScreen();
        renderCoachScreen();
        renderStudentAccountCards();

        // Broadcast profile change in real-time across tabs and windows
        if ('BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('topgym_notif_bus');
            bc.postMessage({ type: 'PROFILE_UPDATED_EVENT', userId: target.id, user: target });
          } catch(e) {}
        }

        SoundEffects.chime();
        showToast(`¡Perfil y contraseña de ${target.name} actualizados exitosamente!`, 'success');
      });
    }

    const switchAccountFromProfileBtn = document.getElementById('switchAccountFromProfileBtn');
    if (switchAccountFromProfileBtn) {
      switchAccountFromProfileBtn.addEventListener('click', () => {
        closeMyProfileModal();
        openSecurityAuthModal('student');
      });
    }

    const switchToCoachFromProfileBtn = document.getElementById('switchToCoachFromProfileBtn');
    if (switchToCoachFromProfileBtn) {
      switchToCoachFromProfileBtn.addEventListener('click', () => {
        closeMyProfileModal();
        openSecurityAuthModal('coach');
      });
    }

    if (logoutFromProfileModalBtn) {
      logoutFromProfileModalBtn.addEventListener('click', () => logoutUser('Alumno'));
    }

    // =========================================================================
    // 24/7 DURABLE PERSISTENCE & DATA BACKUP / RESTORE LISTENERS
    // =========================================================================
    const exportBackupBtn = document.getElementById('exportBackupBtn');
    if (exportBackupBtn) {
      exportBackupBtn.addEventListener('click', () => {
        if (typeof StorageManager !== 'undefined') {
          StorageManager.exportBackup();
          showNotification('Copia de seguridad generada y descargada exitosamente.', 'success');
        }
      });
    }

    const importBackupTriggerBtn = document.getElementById('importBackupTriggerBtn');
    const importBackupFileInput = document.getElementById('importBackupFileInput');
    if (importBackupTriggerBtn && importBackupFileInput) {
      importBackupTriggerBtn.addEventListener('click', () => {
        importBackupFileInput.click();
      });
      importBackupFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target.result;
            const res = StorageManager.importBackup(content);
            if (res.success) {
              appState.data = res.data;
              if (appState.currentUser) {
                const fresh = appState.data.users.find(u => u.id === appState.currentUser.id);
                if (fresh) appState.currentUser = fresh;
              }
              setupRoleAndUser();
              renderScheduleScreen();
              renderProgressScreen();
              renderCoachScreen();
              renderWorkoutPlansScreen();
              renderExerciseCatalog();
              renderStudentAccountCards();
              showNotification('¡Datos restaurados con éxito! Todas las tareas y perfiles han sido actualizados.', 'success');
              closeMyProfileModal();
            } else {
              showNotification('Error al restaurar: ' + res.error, 'error');
            }
          } catch (err) {
            showNotification('Error al leer el archivo de copia de seguridad.', 'error');
          }
          importBackupFileInput.value = '';
        };
        reader.readAsText(file);
      });
    }

    // =========================================================================
    // UNIFIED FULLSCREEN LOGIN SCREEN EVENT LISTENERS
    // =========================================================================
    if (unifiedLoginForm) {
      unifiedLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        attemptUnifiedLogin();
      });
    }

    if (loginSubmitBtn) {
      loginSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        attemptUnifiedLogin();
      });
    }

    // Toggle Password Visibility (Ojito de ver contraseña)
    if (toggleLoginPasswordBtn) {
      toggleLoginPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const passInput = document.getElementById('loginPasswordInput');
        const eyeOpen = document.getElementById('eyeIconOpenSvg');
        const eyeClosed = document.getElementById('eyeIconClosedSvg');
        if (!passInput) return;
        if (passInput.type === 'password') {
          passInput.type = 'text';
          if (eyeOpen) eyeOpen.style.display = 'none';
          if (eyeClosed) eyeClosed.style.display = 'block';
        } else {
          passInput.type = 'password';
          if (eyeOpen) eyeOpen.style.display = 'block';
          if (eyeClosed) eyeClosed.style.display = 'none';
        }
      });
    }

    // Clear error message on input change
    if (loginUsernameInput) {
      loginUsernameInput.addEventListener('input', () => {
        const errBox = document.getElementById('loginErrorMessage');
        if (errBox) errBox.style.display = 'none';
      });
    }
    if (loginPasswordInput) {
      loginPasswordInput.addEventListener('input', () => {
        const errBox = document.getElementById('loginErrorMessage');
        if (errBox) errBox.style.display = 'none';
      });
      loginPasswordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          attemptUnifiedLogin();
        }
      });
    }

    // =========================================================================
    // FORGOT PASSWORD VALIDATION MODAL LISTENERS
    // =========================================================================
    if (openForgotPasswordBtn) {
      openForgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openForgotPasswordModal();
      });
    }

    if (closeForgotPasswordModalBtn) {
      closeForgotPasswordModalBtn.addEventListener('click', closeForgotPasswordModal);
    }

    if (cancelForgotPasswordBtn) {
      cancelForgotPasswordBtn.addEventListener('click', closeForgotPasswordModal);
    }

    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSendResetLink(e);
      });
    }

    const sendResetLinkBtn = document.getElementById('sendResetLinkBtn');
    if (sendResetLinkBtn) {
      sendResetLinkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSendResetLink(e);
      });
    }

    const copyResetLinkBtn = document.getElementById('copyResetLinkBtn');
    if (copyResetLinkBtn) {
      copyResetLinkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const urlText = document.getElementById('inboxUniqueLinkText')?.textContent || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(urlText).then(() => {
            showToast('¡Enlace único copiado al portapapeles!', 'success');
          }).catch(() => {
            showToast('Enlace listo para usar en pantalla', 'success');
          });
        } else {
          showToast('Enlace listo para usar en pantalla', 'success');
        }
      });
    }

    const openResetPasswordFormBtn = document.getElementById('openResetPasswordFormBtn');
    if (openResetPasswordFormBtn) {
      openResetPasswordFormBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleOpenResetPasswordForm();
      });
    }

    const backToRequestEmailBtn = document.getElementById('backToRequestEmailBtn');
    if (backToRequestEmailBtn) {
      backToRequestEmailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const step1 = document.getElementById('forgotStepRequestEmail');
        const step2 = document.getElementById('forgotStepInboxEmail');
        if (step2) step2.style.display = 'none';
        if (step1) step1.style.display = 'block';
      });
    }

    const setNewPasswordForm = document.getElementById('setNewPasswordForm');
    if (setNewPasswordForm) {
      setNewPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveNewPassword(e);
      });
    }

    const saveNewPasswordBtn = document.getElementById('saveNewPasswordBtn');
    if (saveNewPasswordBtn) {
      saveNewPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSaveNewPassword(e);
      });
    }

    const cancelSetNewPassBtn = document.getElementById('cancelSetNewPassBtn');
    if (cancelSetNewPassBtn) {
      cancelSetNewPassBtn.addEventListener('click', closeForgotPasswordModal);
    }

    // Toggle Eye Buttons for New Password Form
    const toggleNewPassEyeBtn = document.getElementById('toggleNewPassEyeBtn');
    if (toggleNewPassEyeBtn) {
      toggleNewPassEyeBtn.addEventListener('click', () => {
        const inp = document.getElementById('newPasswordInput');
        if (inp) inp.type = (inp.type === 'password' ? 'text' : 'password');
      });
    }

    const toggleConfirmPassEyeBtn = document.getElementById('toggleConfirmPassEyeBtn');
    if (toggleConfirmPassEyeBtn) {
      toggleConfirmPassEyeBtn.addEventListener('click', () => {
        const inp = document.getElementById('confirmPasswordInput');
        if (inp) inp.type = (inp.type === 'password' ? 'text' : 'password');
      });
    }

    // STRICT MODAL POLICY: Windows CANNOT be closed by clicking outside (backdrop).
    // The ONLY way to close a window is by clicking the 'X' close button (.btn-close-modal).
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          // Explicitly prevent closing. Give tactile micro-feedback on the card.
          e.preventDefault();
          e.stopPropagation();
          const card = overlay.querySelector('.modal-card, .login-card-box');
          if (card) {
            card.classList.remove('modal-card-attention');
            void card.offsetWidth;
            card.classList.add('modal-card-attention');
          }
        }
      });
    });

    // STRICT KEYBOARD POLICY: Escape key DOES NOT close windows.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active, .modal-overlay[style*="display: flex"]');
        if (activeModal) {
          e.preventDefault();
          const card = activeModal.querySelector('.modal-card, .login-card-box');
          if (card) {
            card.classList.remove('modal-card-attention');
            void card.offsetWidth;
            card.classList.add('modal-card-attention');
          }
        }
      }
    });

    // Universal 'X' Close Button Handler for all modals and screens
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const overlay = btn.closest('.modal-overlay') || btn.closest('.login-screen-wrapper');
        if (overlay) {
          if (overlay.id === 'forgotPasswordModal' && typeof closeForgotPasswordModal === 'function') {
            closeForgotPasswordModal();
          } else if (overlay.id === 'myProfileModal' && typeof closeMyProfileModal === 'function') {
            closeMyProfileModal();
          } else if (overlay.id === 'editProfileModal' && typeof closeEditProfileModal === 'function') {
            closeEditProfileModal();
          } else if (overlay.id === 'exerciseDetailModal' && typeof closeExerciseDetail === 'function') {
            closeExerciseDetail();
          } else if (overlay.id === 'changeAvatarModal' && typeof closeChangeAvatarModal === 'function') {
            closeChangeAvatarModal();
          } else if (overlay.id === 'coachTaskDetailModal' && typeof closeCoachTaskDetailModal === 'function') {
            closeCoachTaskDetailModal();
          } else if (overlay.id === 'loginScreen') {
            if (appState.currentUser) {
              hideLoginScreen();
            } else {
              showToast('Debes iniciar sesión para ingresar a TOP-GYM.', 'info');
            }
          } else {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
          }

          setTimeout(() => {
            if (!document.querySelector('.modal-overlay.active')) {
              const loginScr = document.getElementById('loginScreen');
              if (!loginScr || loginScr.style.display === 'none') {
                document.body.classList.remove('modal-open');
              }
            }
          }, 30);
        }
      });
    });

    const startTodayBtn = document.getElementById('startTodayTaskBtn');
    if (startTodayBtn) {
      startTodayBtn.addEventListener('click', () => {
        if (!appState.currentUser) return;
        const todayStr = new Date().toISOString().split('T')[0];
        let todayTask = appState.data.tasks.find(t => 
          t.studentId === appState.currentUser.id && 
          t.status === 'pending' && 
          (t.scheduledDate === todayStr)
        );
        if (!todayTask) {
          todayTask = appState.data.tasks.find(t => 
            t.studentId === appState.currentUser.id && 
            t.status === 'pending'
          );
        }
        if (todayTask) {
          startLiveWorkoutSession(todayTask);
        } else {
          showToast('No tienes tareas pendientes para hoy. Puedes iniciar una rutina desde el catálogo.', 'success');
          switchScreen('plansScreen');
        }
      });
    }

    const refreshSchedBtn = document.getElementById('refreshScheduleBtn');
    if (refreshSchedBtn) {
      refreshSchedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        SoundEffects.tap();

        const icon = refreshSchedBtn.querySelector('.refresh-icon') || refreshSchedBtn.querySelector('svg');
        if (icon) {
          icon.classList.remove('is-spinning');
          void icon.offsetWidth; // Force DOM reflow to replay animation if clicked again
          icon.classList.add('is-spinning');
          setTimeout(() => {
            icon.classList.remove('is-spinning');
          }, 750);
        }

        refreshSchedBtn.classList.add('btn-syncing');
        setTimeout(() => {
          refreshSchedBtn.classList.remove('btn-syncing');
        }, 750);

        appState.data = StorageManager.load();
        renderScheduleScreen();
      });
    }

    document.querySelectorAll('.timer-btn-preset[data-seconds]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const secs = parseInt(e.currentTarget.getAttribute('data-seconds'));
        startRestCountdown(secs);
      });
    });

    if (stopRestTimerBtn) {
      stopRestTimerBtn.addEventListener('click', stopRestTimer);
    }

    // Schedule modality filter buttons (En Casa vs Con Máquina vs All)
    document.querySelectorAll('.schedule-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.schedule-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        appState.scheduleFilterModality = e.currentTarget.getAttribute('data-filter');
        renderScheduleScreen();
      });
    });

    // Coach Section Tabs Switcher
    document.querySelectorAll('.coach-tab-nav-btn').forEach(btn => {
      let touchStartX = 0, touchStartY = 0, touchMoved = false;
      btn.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchMoved = false;
      }, { passive: true });
      btn.addEventListener('touchmove', (e) => {
        const t = e.changedTouches[0];
        const dx = Math.abs(t.clientX - touchStartX);
        const dy = Math.abs(t.clientY - touchStartY);
        if (dx > dy && dx > 10) {
          touchMoved = true;
        }
      }, { passive: true });
      btn.addEventListener('touchend', (e) => {
        if (touchMoved) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        const targetBtn = e.target.closest('.coach-tab-nav-btn') || e.currentTarget;
        const tab = targetBtn ? targetBtn.getAttribute('data-coach-tab') : null;
        if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') {
          SoundEffects.tap();
        }
        if (tab) {
          switchCoachTab(tab);
        }
      }, { passive: false });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetBtn = e.target.closest('.coach-tab-nav-btn') || e.currentTarget;
        const tab = targetBtn ? targetBtn.getAttribute('data-coach-tab') : null;
        if (typeof SoundEffects !== 'undefined' && typeof SoundEffects.tap === 'function') {
          SoundEffects.tap();
        }
        if (tab) {
          switchCoachTab(tab);
        }
      });
    });

    // Coach Inbox Filters (Todas, Con Mensaje, Pendientes)
    document.querySelectorAll('.coach-inbox-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.coach-inbox-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        appState.coachInboxFilter = e.currentTarget.getAttribute('data-inbox-filter');
        SoundEffects.tap();
        renderCoachInboxSection();
      });
    });

    // Coach tasks monitor filter buttons (En Casa vs Con Máquinas)
    document.querySelectorAll('.coach-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.coach-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        appState.coachTasksFilterModality = e.currentTarget.getAttribute('data-filter');
        renderCoachScreen();
      });
    });

    // Exercise search input in catalog
    const exerciseSearchInput = document.getElementById('exerciseSearchInput');
    if (exerciseSearchInput) {
      exerciseSearchInput.addEventListener('input', (e) => {
        appState.catalogSearchQuery = e.target.value;
        renderExerciseCatalog();
      });
    }

    const openNewPlanBtn = document.getElementById('openNewPlanModalBtn');
    if (openNewPlanBtn) {
      openNewPlanBtn.addEventListener('click', () => {
        showToast('Explora el catálogo para agregar ejercicios a tu plan.', 'success');
        switchScreen('catalogScreen');
      });
    }

    const openAddMeasureBtn = document.getElementById('openAddMeasureModalBtn');
    if (openAddMeasureBtn) {
      openAddMeasureBtn.addEventListener('click', () => {
        const curW = appState.currentUser.weight || 75.0;
        const newWeight = prompt(`Ingresa tu peso actual en kg para ${appState.currentUser.name} (ej: 76.2):`, `${curW}`);
        if (newWeight && !isNaN(newWeight)) {
          const w = parseFloat(newWeight);
          appState.currentUser.weight = w;
          const targetUser = appState.data.users.find(u => u.id === appState.currentUser.id);
          if (targetUser) targetUser.weight = w;

          // Save measurement strictly tagged to this student
          appState.data.bodyMeasurements.unshift({
            studentId: appState.currentUser.id,
            date: new Date().toISOString().split('T')[0],
            weight: w,
            chest: 104,
            arm: 38,
            waist: 81.5
          });
          StorageManager.save(appState.data);
          renderProgressScreen();
          showToast(`Peso actualizado a ${w} kg en tu historial privado.`, 'success');
        }
      });
    }

    // ==========================================================================
    // INTERACTIVE ANATOMICAL MANNEQUIN HUB (UTILIDAD PRÁCTICA DEL MUÑECO)
    // ==========================================================================
    const anatomyHub = document.getElementById('interactiveAnatomyHub');
    const tabModeMuscles = document.getElementById('tabModeMuscles');
    const tabModeMeasures = document.getElementById('tabModeMeasures');
    const trainSelectedMuscleBtn = document.getElementById('trainSelectedMuscleBtn');

    const muscleDataMap = {
      chest: {
        name: 'Pectoral Mayor',
        subtitle: 'Recuperado (95% - Óptimo para entrenar)',
        fillPercent: '95%',
        series: '14 series',
        lastDate: 'Ayer',
        layerIds: ['muscleLayerChest'],
        catalogMuscle: 'chest'
      },
      abs: {
        name: 'Core & Abdomen',
        subtitle: 'Recuperación Completa (100%)',
        fillPercent: '100%',
        series: '8 series',
        lastDate: 'Hace 2 días',
        layerIds: ['muscleLayerAbs'],
        catalogMuscle: 'abs'
      },
      arms: {
        name: 'Brazos (Bíceps & Antebrazos)',
        subtitle: 'En Recuperación (70% - Descanso recomendado)',
        fillPercent: '70%',
        series: '18 series',
        lastDate: 'Hoy',
        layerIds: ['muscleLayerArms', 'muscleLayerForearms'],
        catalogMuscle: 'arms'
      },
      shoulders: {
        name: 'Deltoides & Hombros',
        subtitle: 'Recuperado (90% - Listo para trabajar)',
        fillPercent: '90%',
        series: '12 series',
        lastDate: 'Hace 3 días',
        layerIds: ['muscleLayerShoulders'],
        catalogMuscle: 'shoulders'
      },
      legs: {
        name: 'Cuádriceps & Piernas',
        subtitle: 'Recuperado (85% - Día ideal de pierna)',
        fillPercent: '85%',
        series: '16 series',
        lastDate: 'Hace 2 días',
        layerIds: ['muscleLayerLegs'],
        catalogMuscle: 'legs'
      }
    };

    let activeMuscleKey = 'chest';

    function selectAnatomyMuscle(muscleKey) {
      const data = muscleDataMap[muscleKey];
      if (!data) return;
      activeMuscleKey = muscleKey;

      // Update chip active classes
      document.querySelectorAll('#anatomyMuscleChipsBar .anatomy-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-muscle') === muscleKey);
      });

      // Update muscle layers
      const activeLayers = data.layerIds || (data.layerId ? [data.layerId] : []);
      document.querySelectorAll('.anatomy-muscle-layer').forEach(layer => {
        layer.classList.toggle('active', activeLayers.includes(layer.id));
      });

      // Update Status Card info
      const nameEl = document.getElementById('anatomySelectedMuscleName');
      const subtitleEl = document.getElementById('anatomySelectedMuscleSubtitle');
      const fillEl = document.getElementById('anatomyRecoveryFill');
      const seriesEl = document.getElementById('anatomyMuscleSeries');
      const lastDateEl = document.getElementById('anatomyMuscleLastDate');

      if (nameEl) nameEl.textContent = data.name;
      if (subtitleEl) subtitleEl.textContent = data.subtitle;
      if (fillEl) fillEl.style.width = data.fillPercent;
      if (seriesEl) seriesEl.textContent = data.series;
      if (lastDateEl) lastDateEl.textContent = data.lastDate;
    }

    // Mode switching: Muscles vs Measurements
    if (tabModeMuscles && tabModeMeasures && anatomyHub) {
      tabModeMuscles.addEventListener('click', () => {
        tabModeMuscles.classList.add('active');
        tabModeMeasures.classList.remove('active');
        anatomyHub.classList.remove('mode-measures');
        SoundEffects.tap();
      });

      tabModeMeasures.addEventListener('click', () => {
        tabModeMeasures.classList.add('active');
        tabModeMuscles.classList.remove('active');
        anatomyHub.classList.add('mode-measures');
        SoundEffects.tap();
      });
    }

    // Muscle Chips clicks
    document.querySelectorAll('#anatomyMuscleChipsBar .anatomy-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const mKey = chip.getAttribute('data-muscle');
        selectAnatomyMuscle(mKey);
        SoundEffects.tap();
      });
    });

    // Mannequin interactive Hotspots clicks (anatomy hub)
    document.querySelectorAll('.anatomy-hotspot:not(.catalog-hotspot)').forEach(spot => {
      spot.addEventListener('click', () => {
        const mKey = spot.getAttribute('data-muscle');
        if (typeof selectAnatomyMuscle === 'function') selectAnatomyMuscle(mKey);
        SoundEffects.beep();
      });
    });

    // Catalog mannequin: tap a body zone to filter exercises by muscle
    const catalogZoneMap = { chest: 'chest', abs: 'abs', arms: 'arms', forearms: 'arms', shoulders: 'shoulders', legs: 'legs', back: 'back', glutes: 'glutes' };
    const catalogLayerByZone = { chest: 'catLayerChest', abs: 'catLayerAbs', arms: 'catLayerArms', forearms: 'catLayerForearms', shoulders: 'catLayerShoulders', legs: 'catLayerLegs' };
    const catalogBackGroupByZone = { shoulders: 'shoulders', back: 'back', glutes: 'glutes', legs: 'legs' };
    let catalogView = 'front';
    function activateCatalogMuscleLayer(zone) {
      if (catalogView === 'front') {
        const layerId = catalogLayerByZone[zone];
        document.querySelectorAll('#catalogFrontView .anatomy-muscle-layer').forEach(l => {
          l.classList.toggle('active', l.id === layerId);
        });
      } else {
        const group = catalogBackGroupByZone[zone];
        document.querySelectorAll('#catalogBackView .anatomy-muscle-layer').forEach(l => {
          l.classList.toggle('active', !!group && l.classList.contains('back-layer') && l.classList.contains(group));
        });
      }
    }

    function setCatalogMannequinView(view) {
      catalogView = view === 'back' ? 'back' : 'front';
      const frontView = document.getElementById('catalogFrontView');
      const backView = document.getElementById('catalogBackView');
      if (frontView) frontView.style.display = catalogView === 'front' ? '' : 'none';
      if (backView) backView.style.display = catalogView === 'back' ? '' : 'none';
      document.querySelectorAll('.mannequin-view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === catalogView);
      });
      const defaultZone = catalogView === 'front' ? 'chest' : 'back';
      activeCatalogZone = defaultZone;
      activateCatalogMuscleLayer(defaultZone);
    }
    document.querySelectorAll('.mannequin-view-btn').forEach(btn => {
      btn.addEventListener('click', () => setCatalogMannequinView(btn.getAttribute('data-view')));
    });
    let activeCatalogZone = 'chest';
    document.querySelectorAll('.catalog-hotspot').forEach(zoneEl => {
      // Efecto de contorno iluminado al pasar el cursor por una zona
      zoneEl.addEventListener('mouseenter', () => {
        const zone = zoneEl.getAttribute('data-catalog-zone');
        if (zone) activateCatalogMuscleLayer(zone);
      });
      zoneEl.addEventListener('mouseleave', () => {
        activateCatalogMuscleLayer(activeCatalogZone);
      });
      // Click: filtrado preciso solo para la zona elegida
      zoneEl.addEventListener('click', () => {
        const zone = zoneEl.getAttribute('data-catalog-zone');
        const key = catalogZoneMap[zone];
        if (!key) return;
        if (typeof appState !== 'undefined') appState.catalogFilterMuscle = key;
        activateCatalogMuscleLayer(zone);
        activeCatalogZone = zone;
        if (typeof renderExerciseCatalog === 'function') renderExerciseCatalog();
        const catalogContainer = document.getElementById('exerciseCatalogContainer');
        if (catalogContainer) catalogContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        SoundEffects.tap && SoundEffects.tap();
      });
    });

    // Train muscle quick-action
    if (trainSelectedMuscleBtn) {
      trainSelectedMuscleBtn.addEventListener('click', () => {
        const currentData = muscleDataMap[activeMuscleKey];
        if (!currentData) return;
        appState.catalogFilterMuscle = currentData.catalogMuscle;
        document.querySelectorAll('.muscle-chip').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-muscle') === currentData.catalogMuscle);
        });
        renderExerciseCatalog();
        switchScreen('catalogScreen');
        SoundEffects.chime();
      });
    }

    // Anthropometric measurement pins click handlers
    const pinPartNames = {
      chest: 'Pecho',
      arm: 'Brazo',
      waist: 'Cintura',
      thigh: 'Pierna / Muslo'
    };

    document.querySelectorAll('.body-measure-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const part = pin.getAttribute('data-measure');
        const partLabel = pinPartNames[part] || part;
        const currentText = pin.querySelector('strong')?.textContent?.replace(/[^\d.]/g, '') || '90';
        const newValStr = prompt(`Actualizar medida de ${partLabel} (en cm):`, currentText);

        if (newValStr !== null && newValStr.trim() !== '' && !isNaN(newValStr)) {
          const valNum = parseFloat(newValStr);
          if (valNum > 0) {
            const studentId = appState.currentUser?.id;
            const today = new Date().toISOString().split('T')[0];
            let latest = (appState.data.bodyMeasurements || []).find(m => m.studentId === studentId);

            if (!latest || latest.date !== today) {
              const prevWeight = appState.currentUser?.weight || 75;
              const newEntry = {
                studentId: studentId,
                date: today,
                weight: prevWeight,
                chest: latest?.chest || 104,
                arm: latest?.arm || 38,
                waist: latest?.waist || 81.5,
                thigh: latest?.thigh || 58
              };
              newEntry[part] = valNum;
              appState.data.bodyMeasurements.unshift(newEntry);
            } else {
              latest[part] = valNum;
            }

            StorageManager.save(appState.data);
            renderProgressScreen();
            SoundEffects.chime();
            showToast(`Medida de ${partLabel} actualizada a ${valNum} cm.`, 'success');
          }
        }
      });
    });

    // ==========================================================================
    // STUDENT REGISTRATION MODAL LISTENERS
    // ==========================================================================
    if (openRegisterStudentModalBtn) {
      openRegisterStudentModalBtn.addEventListener('click', () => {
        initAvatarPicker();
        const pinInp = document.getElementById('regStudentPin');
        if (pinInp) pinInp.value = '1991';
        const defaultUn = generateStudentUsername('Tayron Salinas', appState.data?.users) || 'tsalinas';
        const previewEl = document.getElementById('regStudentUsernamePreview');
        if (previewEl) previewEl.textContent = defaultUn;
        const emailInput = document.getElementById('regStudentEmail');
        if (emailInput) emailInput.value = '';
        const ageInp = document.getElementById('regStudentAge');
        if (ageInp) ageInp.value = '24';
        const distInp = document.getElementById('regStudentDistrict');
        if (distInp) distInp.value = 'Miraflores';
        if (registerStudentModal) registerStudentModal.classList.add('active');
      });
    }

    // Dynamic username preview and auto-suggestions on student name input
    const regStudentName = document.getElementById('regStudentName');
    if (regStudentName) {
      regStudentName.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const generatedUName = generateStudentUsername(val, appState.data?.users) || 'tsalinas';
        const previewEl = document.getElementById('regStudentUsernamePreview');
        if (previewEl) previewEl.textContent = generatedUName;

        // El correo NO se autocompleta: el coach/alumno debe ingresarlo manualmente
        const nickInput = document.getElementById('regStudentNick');
        if (nickInput && (!nickInput.dataset.touched || nickInput.dataset.touched === 'false')) {
          nickInput.value = val.split(' ')[0] || '';
        }
      });
    }

    const regStudentEmail = document.getElementById('regStudentEmail');
    if (regStudentEmail) {
      regStudentEmail.addEventListener('input', () => {
        regStudentEmail.dataset.touched = 'true';
      });
    }

    const regStudentNick = document.getElementById('regStudentNick');
    if (regStudentNick) {
      regStudentNick.addEventListener('input', () => {
        regStudentNick.dataset.touched = 'true';
      });
    }

    if (closeRegisterStudentModalBtn) {
      closeRegisterStudentModalBtn.addEventListener('click', () => {
        if (registerStudentModal) {
          registerStudentModal.classList.remove('active');
          registerStudentModal.style.display = 'none';
        }
        if (!document.querySelector('.modal-overlay.active')) {
          const loginScr = document.getElementById('loginScreen');
          if (!loginScr || loginScr.style.display === 'none') {
            document.body.classList.remove('modal-open');
          }
        }
      });
    }

    if (cancelRegisterStudentBtn) {
      cancelRegisterStudentBtn.addEventListener('click', () => {
        if (registerStudentModal) {
          registerStudentModal.classList.remove('active');
          registerStudentModal.style.display = 'none';
        }
        if (!document.querySelector('.modal-overlay.active')) {
          const loginScr = document.getElementById('loginScreen');
          if (!loginScr || loginScr.style.display === 'none') {
            document.body.classList.remove('modal-open');
          }
        }
      });
    }

    if (registerStudentForm) {
      registerStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('regStudentName').value.trim();
        const nick = document.getElementById('regStudentNick').value.trim() || fullName.split(' ')[0];
        const phone = document.getElementById('regStudentPhone').value.trim();
        const email = document.getElementById('regStudentEmail').value.trim();

        if (!email) {
          showToast('Por favor ingresa manualmente el correo del alumno.', 'coach');
          document.getElementById('regStudentEmail')?.focus();
          return;
        }

        // Validación estricta para evitar redundancia de correo
        const emailLower = email.toLowerCase();
        const duplicateEmailUser = appState.data.users.find(u => (u.email || '').toLowerCase() === emailLower);
        if (duplicateEmailUser) {
          showToast(`El correo "${email}" ya pertenece a otro alumno (${duplicateEmailUser.name}). No puede haber redundancia.`, 'coach');
          document.getElementById('regStudentEmail')?.focus();
          return;
        }

        const modality = document.getElementById('regStudentModality').value;
        const goal = document.getElementById('regStudentGoal').value.trim();
        const weight = parseFloat(document.getElementById('regStudentWeight').value) || 72.0;
        const height = parseFloat(document.getElementById('regStudentHeight').value) || 175;
        const age = parseInt(document.getElementById('regStudentAge')?.value) || 24;
        const district = document.getElementById('regStudentDistrict')?.value || 'Miraflores';
        const pin = (document.getElementById('regStudentPin')?.value || '1991').trim() || '1991';
        const notes = document.getElementById('regCoachNotes').value.trim();
        const avatar = regSelectedAvatar ? regSelectedAvatar.value : './GYMTOP/resources/res/drawable/im_comentario_4.jpg';

        // Generar nombre de usuario garantizando 0% redundancia (ej: tsalinas, tsalinas1, tsalinas2)
        const generatedUsername = generateStudentUsername(fullName, appState.data.users) || 'tsalinas';

        const newStudent = {
          id: 'u_' + Date.now(),
          name: fullName,
          nickname: nick,
          username: generatedUsername,
          role: 'student',
          pin: pin,
          avatar: avatar,
          phone: phone,
          email: email,
          age: age,
          district: district,
          goal: goal,
          preferredModality: modality,
          weight: weight,
          height: height,
          notes: notes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stats: {
            completedWorkouts: 0,
            totalVolumeKg: 0,
            currentStreak: 1
          }
        };

        appState.data.users.push(newStudent);

        // Initial confidential body measurement record for new student
        appState.data.bodyMeasurements.unshift({
          studentId: newStudent.id,
          date: new Date().toISOString().split('T')[0],
          weight: weight,
          chest: 98,
          arm: 34,
          waist: 79
        });

        // Auto-assign welcome workout according to student's modality
        const welcomeExercises = modality === 'home'
          ? [
              { exerciseId: 'ex_pushup_std', series: [{ reps: 12, weight: 0 }, { reps: 12, weight: 0 }, { reps: 10, weight: 0 }], restTime: 45 },
              { exerciseId: 'ex_squat_air', series: [{ reps: 15, weight: 0 }, { reps: 15, weight: 0 }, { reps: 15, weight: 0 }], restTime: 45 },
              { exerciseId: 'ex_crunch_std', series: [{ reps: 20, weight: 0 }, { reps: 20, weight: 0 }], restTime: 30 }
            ]
          : [
              { exerciseId: 'ex_chest_press_mach', series: [{ reps: 12, weight: 35 }, { reps: 10, weight: 40 }, { reps: 10, weight: 45 }], restTime: 60 },
              { exerciseId: 'ex_lat_pulldown_mach', series: [{ reps: 12, weight: 40 }, { reps: 10, weight: 45 }, { reps: 10, weight: 50 }], restTime: 60 },
              { exerciseId: 'ex_leg_ext_mach', series: [{ reps: 15, weight: 30 }, { reps: 12, weight: 35 }], restTime: 60 }
            ];

        const welcomeTask = {
          id: 'task_' + Date.now(),
          studentId: newStudent.id,
          coachId: 'coach_1',
          workoutTitle: modality === 'home' ? 'Rutina Inicial: En Casa (Calistenia)' : 'Rutina Inicial: Gimnasio & Máquinas',
          modality: modality,
          scheduledDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          coachNotes: notes || `¡Bienvenido a TOP-GYM ${nick}! Tu plan personalizado ha sido programado.`,
          exercises: welcomeExercises,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        appState.data.tasks.push(welcomeTask);
        StorageManager.save(appState.data, true, true);

        if (typeof NotificationManager !== 'undefined') {
          NotificationManager.notifyTaskAssigned(welcomeTask, newStudent);
        }
        renderCoachScreen();
        if (registerStudentModal) {
          registerStudentModal.classList.remove('active');
          registerStudentModal.style.display = 'none';
        }
        registerStudentForm.reset();
        const pinInp = document.getElementById('regStudentPin');
        if (pinInp) pinInp.value = '1991';
        const defaultUn = generateStudentUsername('Tayron Salinas', appState.data?.users) || 'tsalinas';
        const previewEl = document.getElementById('regStudentUsernamePreview');
        if (previewEl) previewEl.textContent = defaultUn;
        const ageInp = document.getElementById('regStudentAge');
        if (ageInp) ageInp.value = '24';
        const distInp = document.getElementById('regStudentDistrict');
        if (distInp) distInp.value = 'Miraflores';
        initAvatarPicker();

        SoundEffects.chime();
        showToast(`¡Alumno ${fullName} registrado! Usuario: ${generatedUsername} | Contraseña: ${pin}`, 'success');
      });
    }

    // ==========================================================================
    // EXERCISE DETAIL MODAL LISTENERS
    // ==========================================================================
    if (closeExerciseDetailModalBtn) closeExerciseDetailModalBtn.addEventListener('click', closeExerciseDetail);
    if (closeExerciseDetailModalBtn2) closeExerciseDetailModalBtn2.addEventListener('click', closeExerciseDetail);

    if (startSingleExerciseLiveBtn) {
      startSingleExerciseLiveBtn.addEventListener('click', () => {
        if (!currentDetailExercise) return;
        closeExerciseDetail();
        const ex = currentDetailExercise;
        const singleTask = {
          id: 'single_' + Date.now(),
          workoutTitle: ex.name,
          modality: ex.modality,
          scheduledDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          coachNotes: 'Entrenamiento guiado con demostración anatómica en vivo.',
          exercises: [
            { exerciseId: ex.id, series: [{ reps: 10, weight: ex.modality === 'home' ? 0 : 25 }, { reps: 10, weight: ex.modality === 'home' ? 0 : 25 }, { reps: 10, weight: ex.modality === 'home' ? 0 : 25 }], restTime: ex.defaultRest || 60 }
          ]
        };
        startLiveWorkoutSession(singleTask);
      });
    }

    // ==========================================================================
    // STUDENT CHANGE AVATAR MODAL (SELF-SERVICE PROFILE CUSTOMIZATION)
    // ==========================================================================
    const changeAvatarModal = document.getElementById('changeAvatarModal');
    const closeChangeAvatarModalBtn = document.getElementById('closeChangeAvatarModalBtn');
    const cancelChangeAvatarModalBtn = document.getElementById('cancelChangeAvatarModalBtn');
    const changeAvatarPreviewImg = document.getElementById('changeAvatarPreviewImg');
    const triggerStudentCustomAvatarUploadBtn = document.getElementById('triggerStudentCustomAvatarUploadBtn');
    const studentCustomAvatarFileInput = document.getElementById('studentCustomAvatarFileInput');
    const studentAvatarPresetsGrid = document.getElementById('studentAvatarPresetsGrid');
    const studentAvatarSelectedValue = document.getElementById('studentAvatarSelectedValue');
    const saveChangeAvatarModalBtn = document.getElementById('saveChangeAvatarModalBtn');

    function openChangeAvatarModal() {
      if (!changeAvatarModal) return;
      const targetId = document.getElementById('editProfileTargetUserId')?.value || appState.currentUser?.id;
      const targetUser = (appState.data?.users || []).find(u => u.id === targetId) || appState.currentUser;
      const currentAvatar = targetUser?.avatar || './GYMTOP/resources/res/drawable/im_comentario_4.jpg';

      if (changeAvatarPreviewImg) changeAvatarPreviewImg.src = currentAvatar;
      if (studentAvatarSelectedValue) studentAvatarSelectedValue.value = currentAvatar;

      if (studentAvatarPresetsGrid) {
        studentAvatarPresetsGrid.innerHTML = '';
        const avatars = (appState.data && appState.data.availableAvatars) || (window.GymData && window.GymData.availableAvatars) || [];
        avatars.forEach(av => {
          const item = document.createElement('div');
          const isSelected = av.url === currentAvatar;
          item.className = `avatar-pick-item ${isSelected ? 'selected' : ''}`;
          item.title = av.label;
          item.innerHTML = `<img src="${av.url}" alt="${av.label}">`;
          item.addEventListener('click', () => {
            document.querySelectorAll('#studentAvatarPresetsGrid .avatar-pick-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            if (changeAvatarPreviewImg) changeAvatarPreviewImg.src = av.url;
            if (studentAvatarSelectedValue) studentAvatarSelectedValue.value = av.url;
          });
          studentAvatarPresetsGrid.appendChild(item);
        });
      }

      changeAvatarModal.classList.add('active');
    }

    function closeChangeAvatarModal() {
      if (changeAvatarModal) changeAvatarModal.classList.remove('active');
      if (studentCustomAvatarFileInput) studentCustomAvatarFileInput.value = '';
    }

    if (closeChangeAvatarModalBtn) closeChangeAvatarModalBtn.addEventListener('click', closeChangeAvatarModal);
    if (cancelChangeAvatarModalBtn) cancelChangeAvatarModalBtn.addEventListener('click', closeChangeAvatarModal);

    if (triggerStudentCustomAvatarUploadBtn && studentCustomAvatarFileInput) {
      triggerStudentCustomAvatarUploadBtn.addEventListener('click', () => {
        studentCustomAvatarFileInput.click();
      });

      studentCustomAvatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          processUploadedImage(file, (dataUrl) => {
            if (changeAvatarPreviewImg) changeAvatarPreviewImg.src = dataUrl;
            if (studentAvatarSelectedValue) studentAvatarSelectedValue.value = dataUrl;
            document.querySelectorAll('#studentAvatarPresetsGrid .avatar-pick-item').forEach(el => el.classList.remove('selected'));
            SoundEffects.beep(true);
            showToast('Foto cargada. Presiona "Guardar Foto de Perfil" para aplicar el cambio.', 'success');
          });
        }
      });
    }

    if (saveChangeAvatarModalBtn) {
      saveChangeAvatarModalBtn.addEventListener('click', () => {
        const newAvatar = studentAvatarSelectedValue ? studentAvatarSelectedValue.value : null;
        if (!newAvatar) {
          showToast('Selecciona o sube una foto antes de guardar.', 'coach');
          return;
        }

        const targetId = document.getElementById('editProfileTargetUserId')?.value || appState.currentUser?.id;
        const targetUser = (appState.data?.users || []).find(u => u.id === targetId) || appState.currentUser;
        if (targetUser) {
          targetUser.avatar = newAvatar;
          targetUser.updatedAt = Date.now();
        }
        if (appState.currentUser && appState.currentUser.id === targetId) {
          appState.currentUser.avatar = newAvatar;
          appState.currentUser.updatedAt = Date.now();
        }
        StorageManager.save(appState.data, true, true);

        // Update preview in editProfileModal
        const editProfileAvatarPreview = document.getElementById('editProfileAvatarPreview');
        if (editProfileAvatarPreview) editProfileAvatarPreview.src = newAvatar;

        // If target is current active user, update active session and all header/dropdown elements
        if (appState.currentUser && appState.currentUser.id === targetId) {
          if (headerAvatar) headerAvatar.src = newAvatar;
          const heroAvatar = document.getElementById('progressHeroAvatar');
          if (heroAvatar) heroAvatar.src = newAvatar;
          const myProfileModalAvatar = document.getElementById('myProfileModalAvatar');
          if (myProfileModalAvatar) myProfileModalAvatar.src = newAvatar;
          const headerCoachAvatar = document.getElementById('headerCoachAvatar');
          if (headerCoachAvatar) headerCoachAvatar.src = newAvatar;
          const dropdownUserAvatar = document.getElementById('dropdownUserAvatar');
          if (dropdownUserAvatar) dropdownUserAvatar.src = newAvatar;
          const dropdownCoachUserAvatar = document.getElementById('dropdownCoachUserAvatar');
          if (dropdownCoachUserAvatar) dropdownCoachUserAvatar.src = newAvatar;
          updateStudentProfileDropdown();
          updateCoachProfileDropdown();
        }

        // Real-time broadcast to other tabs
        if ('BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('topgym_notif_bus');
            bc.postMessage({ type: 'PROFILE_UPDATED_EVENT', userId: targetId, user: targetUser });
          } catch (e) {}
        }

        closeChangeAvatarModal();
        SoundEffects.chime();
        showToast('¡Foto de perfil actualizada exitosamente!', 'success');
        renderProgressScreen();
        renderCoachScreen();
        renderStudentAccountCards();
      });
    }

    // Connect trigger buttons for profile editing from hero card
    const editHeroAvatarBtn = document.getElementById('editHeroAvatarBtn');
    if (editHeroAvatarBtn) {
      editHeroAvatarBtn.addEventListener('click', () => {
        openEditProfileModal(appState.currentUser?.id);
      });
    }

    const progressHeroAvatar = document.getElementById('progressHeroAvatar');
    if (progressHeroAvatar) {
      progressHeroAvatar.style.cursor = 'pointer';
      progressHeroAvatar.addEventListener('click', () => {
        openEditProfileModal(appState.currentUser?.id);
      });
    }

    const openChangeMyAvatarFromModalBtn = document.getElementById('openChangeMyAvatarFromModalBtn');
    if (openChangeMyAvatarFromModalBtn) {
      openChangeMyAvatarFromModalBtn.addEventListener('click', () => {
        closeMyProfileModal();
        openChangeAvatarModal();
      });
    }

    const closeCoachTaskModalBtn = document.getElementById('closeCoachTaskDetailModalBtn');
    if (closeCoachTaskModalBtn) {
      closeCoachTaskModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        SoundEffects.tap();
        closeCoachTaskDetailModal();
      });
    }

    const coachTaskModal = document.getElementById('coachTaskDetailModal');
    if (coachTaskModal && !coachTaskModal.dataset.backdropBound) {
      coachTaskModal.dataset.backdropBound = 'true';
      coachTaskModal.addEventListener('click', (e) => {
        if (e.target === coachTaskModal) {
          e.preventDefault();
          SoundEffects.tap();
          closeCoachTaskDetailModal();
        }
      });
    }

    window.openCoachTaskDetailModal = openCoachTaskDetailModal;
    window.closeCoachTaskDetailModal = closeCoachTaskDetailModal;

    // ==========================================================================
    // THEMED STEPPER BUTTONS (DARK INTERFACE NUMBER CONTROLS)
    // ==========================================================================
    document.querySelectorAll('.input-stepper-wrap').forEach(wrap => {
      const input = wrap.querySelector('input[type="number"]');
      const upBtn = wrap.querySelector('.stepper-up');
      const downBtn = wrap.querySelector('.stepper-down');

      if (!input) return;

      const step = parseFloat(input.step) || 1;
      const min = input.min !== '' ? parseFloat(input.min) : -Infinity;
      const max = input.max !== '' ? parseFloat(input.max) : Infinity;

      if (upBtn) {
        upBtn.addEventListener('click', (e) => {
          e.preventDefault();
          let val = parseFloat(input.value) || 0;
          val = Math.min(max, val + step);
          input.value = step < 1 ? val.toFixed(1) : Math.round(val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }

      if (downBtn) {
        downBtn.addEventListener('click', (e) => {
          e.preventDefault();
          let val = parseFloat(input.value) || 0;
          val = Math.max(min, val - step);
          input.value = step < 1 ? val.toFixed(1) : Math.round(val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
    });

    // ==========================================================================
    // NOTIFICATION PERMISSION EVENT LISTENERS
    // ==========================================================================
    const enableNotifBtn = document.getElementById('enableNotificationsBtn');
    if (enableNotifBtn) {
      enableNotifBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await NotificationManager.requestPermission();
      });
    }

    const dismissNotifBannerBtn = document.getElementById('dismissNotifBannerBtn');
    if (dismissNotifBannerBtn) {
      dismissNotifBannerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const banner = document.getElementById('notifPermissionBanner');
        if (banner) {
          banner.classList.add('banner-hidden');
          banner.style.setProperty('display', 'none', 'important');
        }
        localStorage.setItem('topgym_notif_banner_dismissed', 'true');
        sessionStorage.setItem('topgym_notif_banner_dismissed', 'true');
      });
    }

    // Exponer NotificationManager globalmente para interoperabilidad en vistas
    window.NotificationManager = NotificationManager;
  }
});
