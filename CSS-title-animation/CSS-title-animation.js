document.querySelectorAll('.title').forEach(title => {
    // const results=title.textContent
    title.innerHTML = title.textContent
        .split('')
        .map((c) =>
            `<span class="letter">${c.trim() ? c : '&nbsp;'}</span>`
        )
        .join('')
    // console.log(results);
})

const letters = document.querySelectorAll('.letter');
for (let i = 0; i < letters.length; i++) {
    letters[i].style.setProperty('--delay', `${i * 0.05}s`)

}