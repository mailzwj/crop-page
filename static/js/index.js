(() => {
    const area = document.querySelector('#J_CodeArea');
    area.addEventListener('focus', () => {
        area.select();
    }, false);
})();