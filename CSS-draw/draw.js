document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const zoomCanvas = document.createElement('canvas');
    const zoomCtx = zoomCanvas.getContext('2d');
    const gridSize = 10; // 每個格子的大小
    const zoomSize = 2; // 放大倍數
    const borderSize = 100; // 放大框的大小

    let isDashedBorderFixed = false; // 跟踪虛線框是否固定
    let fixedBorderPosition = { x: 0, y: 0 }; // 固定的虛線框位置
    

    zoomCanvas.width = 200;
    zoomCanvas.height = 200;
    document.getElementById('zoomContainer').appendChild(zoomCanvas);
    
    drawGrid();
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);
    zoomCanvas.addEventListener('mousemove', handleZoomCanvasMouseMove);
    zoomCanvas.addEventListener('click', paintCanvas);
    

    function handleZoomCanvasMouseMove(event) {
        const { x, y } = getCanvasCoordinates(event, zoomCanvas);
        const zoomedPixelX = Math.floor(x / zoomSize);
        const zoomedPixelY = Math.floor(y / zoomSize);

        updateZoomCanvasHover(zoomedPixelX, zoomedPixelY);
    }

    function updateZoomCanvasHover(x, y) {
        zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
        zoomCtx.drawImage(canvas, fixedBorderPosition.x - 50, fixedBorderPosition.y - 50, borderSize, borderSize, 0, 0, zoomCanvas.width, zoomCanvas.height);

        // 畫上hover效果
        zoomCtx.strokeStyle = 'red';
        zoomCtx.strokeRect(x * zoomSize, y * zoomSize, zoomSize, zoomSize);
    }


    function handleMouseMove(event) {
        if (!isDashedBorderFixed) {
            updateZoomCanvas(event);
        }
    }

    function handleCanvasClick(event) {
        const { x, y } = getCanvasCoordinates(event, canvas);

        if (isDashedBorderFixed) {
            isDashedBorderFixed = false;
            resetCanvas();
        } else {
            isDashedBorderFixed = true;
            fixedBorderPosition = { x: Math.floor(x / gridSize) * gridSize, y: Math.floor(y / gridSize) * gridSize };
            resetCanvas();
            drawDashedBorderOnCanvas(fixedBorderPosition.x, fixedBorderPosition.y);
        }
    }

    function updateZoomCanvas(event) {
        const { x, y } = getCanvasCoordinates(event, canvas);
        zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
        zoomCtx.drawImage(canvas, Math.floor(x / gridSize) * gridSize - 50, Math.floor(y / gridSize) * gridSize - 50, 100, 100, 0, 0, zoomCanvas.width, zoomCanvas.height);

        if (!isDashedBorderFixed) {
            resetCanvas();
            drawDashedBorderOnCanvas(Math.floor(x / gridSize) * gridSize, Math.floor(y / gridSize) * gridSize);
        }
    }

    function resetCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
    }

    function drawDashedBorderOnCanvas(x, y) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - borderSize / 2, y - borderSize / 2, borderSize, borderSize);
        ctx.setLineDash([]);
    }

    function paintCanvas(event) {
        // 如果虛線框沒有固定，則不進行任何操作
        if (!isDashedBorderFixed) return;

        // 獲取點擊在zoomCanvas上的坐標
        const { x, y } = getCanvasCoordinates(event, zoomCanvas);

        // 計算在zoomCanvas上的格子位置
        const zoomedPixelX = Math.floor(x / zoomSize);
        const zoomedPixelY = Math.floor(y / zoomSize);

        // 檢查點擊是否在zoomCanvas的格子內
        if (zoomedPixelX >= 0 && zoomedPixelX < zoomColumns && zoomedPixelY >= 0 && zoomedPixelY < zoomRows) {
            // 更新zoomCanvas上的顏色
            drawZoomedPixel(zoomedPixelX, zoomedPixelY, colorPicker.value);

            // 計算在主canvas上的對應格子
            const canvasX = fixedBorderPosition.x + zoomedPixelX * gridSize;
            const canvasY = fixedBorderPosition.y + zoomedPixelY * gridSize;

            // 檢查該位置是否在主canvas的範圍內
            if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
                // 更新主canvas上的顏色
                drawPixel(canvasX, canvasY, colorPicker.value);
            }
        }
    }


    function drawZoomedPixel(x, y, color) {
        zoomCtx.fillStyle = color;
        zoomCtx.fillRect(x * zoomSize, y * zoomSize, zoomSize, zoomSize);
    }

    function drawPixel(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, gridSize, gridSize);
    }

    function drawGrid() {
        ctx.strokeStyle = '#ddd';
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function getCanvasCoordinates(event, targetCanvas) {
        const rect = targetCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }
});
