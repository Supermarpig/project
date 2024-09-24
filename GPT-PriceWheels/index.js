var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var items = [];
var angle = 0;
var isSpinning = false;

// 畫指針
function drawPointer() {
    ctx.fillStyle = '#333';  // 指針顏色
    ctx.beginPath();
    ctx.moveTo(250 - 10, 0); // 左上角的點
    ctx.lineTo(250 + 10, 0); // 右上角的點
    ctx.lineTo(250, 30);      // 指針尖端的點
    ctx.fill();
}

function drawWheel() {
    var total = items.length;
    var arcSize = (2 * Math.PI) / total;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < total; i++) {
        var angleStart = angle + i * arcSize;
        var angleEnd = angle + (i + 1) * arcSize;

        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, angleStart, angleEnd);
        ctx.closePath();
        ctx.fillStyle = (i % 2 === 0) ? '#FFF' : '#AAA';
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(angleStart + arcSize / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = '1em Arial'; // 調整字體大小和類型
        ctx.fillText(items[i], 240, 10);
        ctx.restore();
    }

    drawPointer(); // 在轉盤畫完後畫指針
}

function spin() {
    if (isSpinning) return;
    var spinTime = 500; // 1 seconds
    var spinAngleStart = Math.random() * 10 + 10;
    var startTime = new Date().getTime();

    isSpinning = true;

    function rotateWheel() {
        var spinAngle = spinAngleStart - easeOut(new Date().getTime() - startTime, spinTime);
        angle += (spinAngle * Math.PI / 180);
        drawWheel();

        if (spinAngle <= 0) {
            isSpinning = false;
            announceWinner();
        } else {
            requestAnimationFrame(rotateWheel);
        }
    }

    function announceWinner() {
        var winningSegmentIndex = Math.floor(((angle + Math.PI / 1.07) / (Math.PI * 2)) * items.length) % items.length;
        var winningSegment = items[(items.length - winningSegmentIndex) % items.length];
        document.getElementById('winnerItem').textContent = winningSegment;
        winnerItem.style.display = 'inline-block';
    }

    rotateWheel();
}

function addItems() {
    var inputVal = document.getElementById('inputItem').value;
    items = inputVal.split(',').map(function (item) {
        return item.trim();
    });

    updateItemsList();
    drawWheel();
}

function updateItemsList() {
    var list = document.getElementById('itemsList');
    list.innerHTML = items.map(function (item) {
        return '<div>' + item + '</div>';
    }).join('');
}
document.getElementById('inputItem').addEventListener('input', function () {
    addItems();
});

// 初始化轉盤和項目列表
addItems();

function easeOut(t, b) {
    return 1 - Math.pow(1 - (t / b), 3);
}

drawWheel();

