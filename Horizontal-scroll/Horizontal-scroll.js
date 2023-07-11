


function handleScroll() {
    const scroll = document.getElementById('scroll');
    const scrollBox = document.getElementById('scrollBox');
    let vw = document.body.clientWidth; // 不包含滾動條的寬度
    let vh = window.innerHeight;

    // 這裡的高度設置為 length-1 個橫向塊 + 螢幕高度
    // 因為最後一塊，滾動的距離並不是寬度，而是高度
    const sHeight = vw * (scrollBox.children.length - 1) + vh;
    scroll.style.height = sHeight + 'px';

    // 獲取 scroll 的位置信息
    const { top } = scroll.getBoundingClientRect();

    // console.log("top:",top)
    // console.log("vw:",vw)
    console.log("top <= 0 && top > -vw * 2)" ,top <= 0 && top > -vw * 2)
    console.log(top)
    console.log(top < -vw * 2)

    // top <= 0 時，代表容器元素到可視螢幕頂部。
    if (top <= 0 && top > -vw * 2) {
        scrollBox.style.transform = `translateX(${top}px)`;
    } else if (top > 0) {
        scrollBox.style.transform = 'translateX(0)';
    } else if (top < -vw * 2) {
        scrollBox.style.transform = `translateX(${-sHeight + vh}px)`;
    }
}

window.addEventListener('scroll', handleScroll);


//監聽視窗尺寸
let resizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        handleScroll();
    }, 100); // 在最後一次改變後延遲 100 毫秒執行
});

// 一進入畫面時執行一次
handleScroll();