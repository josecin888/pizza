// Validación simple: mostrar mensaje y bloquear envío si faltan campos
(function(){
    const form = document.getElementById('registroForm');
    if (!form) return;

    function createErrorEl(input, msg) {
        clearError(input);
        const el = document.createElement('span');
        el.className = 'error-message';
        el.setAttribute('role','alert');
        el.setAttribute('aria-live','assertive');
        el.style.color = '#c62828';
        el.style.fontSize = '0. nine rem';
        el.style.marginTop = '.25rem';
        el.textContent = msg;
        input.setAttribute('aria-invalid','true');
        input.insertAdjacentElement('afterend', el);
    }
    function clearError(input) {
        input.removeAttribute('aria-invalid');
        const next = input.nextElementSibling;
        if (next && next.classList.contains('error-message')) next.remove();
    }

    function validateField(input) {
        // only validate visible form controls
        if (input.disabled || input.type === 'hidden') { clearError(input); return true; }
        const val = (input.value || '').trim();

        if (input.required) {
            if (!val) {
                createErrorEl(input, 'El campo está incompleto');
                return false;
            }
        }
        if (input.type === 'email' && val) {
            if (!input.checkValidity()) {
                createErrorEl(input, 'Correo electrónico inválido');
                return false;
            }
        }
        // teléfono: opcional, pero si se escribe valida pattern/html validity
        if (input.type === 'tel' && val) {
            if (!input.checkValidity()) {
                createErrorEl(input, 'Teléfono inválido');
                return false;
            }
        }

        clearError(input);
        return true;
    }

    // limpiar mensajes al escribir
    form.addEventListener('input', (e) => {
        const t = /** @type {HTMLElement} */ (e.target);
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) {
            clearError(t);
        }
    });

    // validar antes del submit (capturing para ejecutar antes del handler existente)
    form.addEventListener('submit', (e) => {
        const controls = Array.from(form.elements).filter(el => {
            return el.tagName && ['INPUT','TEXTAREA','SELECT'].includes(el.tagName);
        });
        let firstInvalid = null;
        for (const c of controls) {
            if (!validateField(c)) {
                if (!firstInvalid) firstInvalid = c;
            }
        }
        if (firstInvalid) {
            e.preventDefault();
            firstInvalid.focus();
        }
    }, true);
})();
(() => {
    const openBtn = document.getElementById('openRegistro');
    const modal = document.getElementById('registroModal');
    const closeBtn = document.getElementById('closeRegistro');
    const cancelBtn = document.getElementById('cancelRegistro');
    const form = document.getElementById('registroForm');
    let lastFocus = null;

    function show() {
        lastFocus = document.activeElement;
        modal.removeAttribute('aria-hidden');
        // focus primer control
        const first = form.querySelector('input, select, textarea, button');
        if (first) first.focus();
        document.addEventListener('keydown', onKey);
    }
    function hide() {
        modal.setAttribute('aria-hidden', 'true');
        if (lastFocus) lastFocus.focus();
        document.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
        if (e.key === 'Escape') hide();
        // simple focus trap: keep focus inside modal with Tab
        if (e.key === 'Tab' && !modal.hasAttribute('aria-hidden')) {
            const focusable = Array.from(modal.querySelectorAll('input,select,textarea,button,a[href]')).filter(el=>!el.disabled);
            if (focusable.length === 0) return;
            const idx = focusable.indexOf(document.activeElement);
            if (e.shiftKey && idx === 0) { e.preventDefault(); focusable[focusable.length-1].focus(); }
            else if (!e.shiftKey && idx === focusable.length-1) { e.preventDefault(); focusable[0].focus(); }
        }
    }

    openBtn.addEventListener('click', show);
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hide(); // click backdrop
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        // ejemplo: guardar en localStorage (puedes reemplazar por envío real)
        try {
            const users = JSON.parse(localStorage.getItem('registroUsers')||'[]');
            users.push({ ...data, created: new Date().toISOString() });
            localStorage.setItem('registroUsers', JSON.stringify(users));
        } catch(err) { console.error(err); }
        hide();
        // notificación simple
        window.alert('Registro completado. Gracias, ' + (data.nombre || ''));
        form.reset();
    });
})();