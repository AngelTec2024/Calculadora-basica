// Lógica de la calculadora
(function () {
    const output = document.getElementById('output');
    const historyEl = document.getElementById('history');
    const keys = document.querySelectorAll('.keys .btn');

    let current = '0';
    let expression = '';
    let justEvaluated = false;

    function render() {
        output.value = current;
        historyEl.textContent = expression;
    }

    function inputDigit(d) {
        if (justEvaluated) { current = d; expression = ''; justEvaluated = false; }
        if (current === '0' && d !== '.') current = d;
        else if (d === '.' && current.includes('.')) return;
        else current = current + d;
        render();
    }

    function inputOperator(op) {
        if (justEvaluated) { expression = current; justEvaluated = false; }
        if (expression === '' && current === '') return;
        if (expression === '' && current !== '') expression = current + ' ' + op + ' ';
        else {
            // si la expresión termina en operador, reemplazar
            if (/[+\-*/]\s$/.test(expression)) expression = expression.slice(0, -3) + op + ' ';
            else expression = expression + current + ' ' + op + ' ';
        }
        current = '';
        render();
    }

    function clearAll() { current = '0'; expression = ''; justEvaluated = false; render(); }

    function backspace() {
        if (justEvaluated) { current = '0'; justEvaluated = false; render(); return; }
        if (current.length <= 1) current = '0'; else current = current.slice(0, -1);
        render();
    }

    function percent() {
        try {
            const val = parseFloat(current || '0');
            current = String(val / 100);
            render();
        } catch (e) { }
    }

    function evaluateExpression() {
        try {
            let expr = expression + (current || '0');
            // reemplazar símbolos visibles por operadores JS
            expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
            // seguridad mínima: permitir solo dígitos, espacios, punto y operadores
            if (!/^[0-9+\-*/.()\s%]+$/.test(expr)) {
                throw new Error('Expresión inválida');
            }
            // evaluar con Function para evitar acceso al scope
            const result = Function('return ' + expr)();
            current = String(Number.isFinite(result) ? +result.toPrecision(12) : 'Error');
            expression = '';
            justEvaluated = true;
            render();
        } catch (e) {
            current = 'Error';
            expression = '';
            justEvaluated = true;
            render();
        }
    }

    keys.forEach(btn => btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (!action) return;
        if (/^[0-9.]$/.test(action)) inputDigit(action);
        else if (action === 'clear') clearAll();
        else if (action === 'back') backspace();
        else if (action === 'percent') percent();
        else if (action === '=') evaluateExpression();
        else if (/^[+\-*/]$/.test(action)) inputOperator(action);
    }));


    // soporte teclado
    window.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); e.preventDefault(); }
        else if (e.key === '.') { inputDigit('.'); e.preventDefault(); }
        else if (e.key === 'Backspace') { backspace(); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === '=') { evaluateExpression(); e.preventDefault(); }
        else if (['+', '-', '*', '/'].includes(e.key)) { inputOperator(e.key); e.preventDefault(); }
        else if (e.key.toLowerCase() === 'c') { clearAll(); }

        // 👉 NUEVO:
        else if (e.key === 'Escape') { clearAll(); e.preventDefault(); } // limpiar con Esc
        else if (e.key === '%') { percent(); e.preventDefault(); }       // porcentaje con %
    });


    // inicializar
    render();

})();
