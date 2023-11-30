// 假設的迷宮數組
let mazeData = [


];
// 初始化Q錶
let QTable = new Map();

function createMaze(width, height) {
    const maze = Array.from({ length: height }, () => Array(width).fill(1));

    let stack = [[0, 0]];

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];

        const directions = getShuffledDirections();
        let carved = false;

        for (let [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 1) {
                if (canCarve(maze, nx, ny, width, height)) {
                    maze[y + dy][x + dx] = 0;
                    maze[ny][nx] = 0;
                    stack.push([nx, ny]);
                    carved = true;
                    break;
                }
            }
        }

        if (!carved) {
            stack.pop();
        }
    }

    // 确保右下角是空地，作为终点
    maze[height - 1][width - 1] = 0;

    return maze;
}

function canCarve(maze, x, y, width, height) {
    let count = 0;
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 0) {
            count++;
        }
    }
    return count <= 1; // 确保不会创建额外的路径
}

function getShuffledDirections() {
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    return directions;
}

// 新函數處理Q錶的初始化
function initializeQTable(maze) {
    let QTable = new Map();
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 0) {
                let key = `${i},${j}`;
                QTable.set(key, { 'up': 0, 'down': 0, 'left': 0, 'right': 0 });
            }
        }
    }
    return QTable;
}
// 使用按鈕來調用迷宮生成函數
document.getElementById('resizeMaze').addEventListener('click', function () {
    // 定義迷宮大小
    const width = Math.floor(Math.random() * 5) * 2 + 5; // 確保是奇數
    // const width = 5; // 確保是奇數
    const height = Math.floor(Math.random() * 5) * 2 + 5; // 確保是奇數
    // const height = 5 // 確保是奇數

    // 清空現有迷宮
    const mazeElement = document.getElementById('maze');
    mazeElement.innerHTML = '';
    // 生成新的迷宮
    const newMaze = createMaze(width, height);
    //把新的迷宮復值給外麵的data
    mazeData = newMaze;
    // 繪製新的迷宮
    drawMaze(newMaze);
});



// // 狀態是根據迷宮中的位置定義的，每個位置都有上、下、左、右四個可能的動作
// for (let i = 0; i < maze.length; i++) {
//     for (let j = 0; j < maze[0].length; j++) {
//         if (maze[i][j] === 0) { // 隻為空地初始化Q值
//             QTable[`${i},${j}`] = { 'up': 0, 'down': 0, 'left': 0, 'right': 0 };
//         }
//     }
// }

// 這個函數執行Q學習算法
function qLearning(maze, QTable, episodes, alpha = 0.1, gamma = 0.9, epsilon = 0.1, goalReward = 10) {
    let width = maze[0].length;
    let height = maze.length;
    let optimalPath = [];

    for (let episode = 0; episode < episodes; episode++) {
        // 起始狀態
        let state = '0,0'; // 左上角
        let episodePath = [state]; // 用於存儲當前episode的路徑

        while (state !== `${height - 1},${width - 1}`) {
            if (!QTable.has(state)) {
                console.error("State not found in QTable:", state);
                break;
            }
            let possibleActions = Object.keys(QTable.get(state));
            let action;

            if (Math.random() < epsilon) {
                // 探索：隨機選擇動作
                action = possibleActions[Math.floor(Math.random() * possibleActions.length)];
            } else {
                // 利用：選擇最佳動作
                action = possibleActions.reduce((a, b) => QTable.get(state)[a] > QTable.get(state)[b] ? a : b);

            }

            // 根據當前動作取得新狀態和獎勵
            let { newState, reward } = takeAction(state, action, maze);

            // Q錶的更新
            if (QTable.has(newState)) {
                let maxQ = Math.max(...Object.values(QTable.get(newState)));
                let stateQValues = QTable.get(state);
                stateQValues[action] += alpha * (reward + gamma * maxQ - stateQValues[action]);
                QTable.set(state, stateQValues); // 更新QTable
            } else {
                console.error("New state not found in QTable:", newState);
            }

            state = newState;// 移動到新狀態
            episodePath.push(state); // 將新狀態添加到路徑中

            // 更新完毕后
            updateQLearningLog(`Episode ${episode} completed. Optimal path: ${optimalPath.join(" -> ")}`);
            // 訓練記錄
            // 如果這是最後一個episode，將這個路徑視為最優路徑
            if (episode === episodes - 1) {
                logTraining(`Episode ${episode}: ${JSON.stringify(QTable)}`);
                optimalPath = episodePath;
            }
        }
    }
    return optimalPath;
}

// 定義了如何根據動作取得新狀態和獎勵的函數
function takeAction(state, action, maze) {
    let [y, x] = state.split(',').map(Number);
    let newY = y, newX = x;
    const rewardForHittingWall = -1; // 撞牆的負獎勵
    const rewardForEmptySpace = 0; // 移動到空格的獎勵
    const rewardForReachingGoal = 10; // 到達終點的正獎勵
    let rewardForAction;

    // 根據動作計算新位置
    switch (action) {
        case 'up':
            newY = y - 1;
            break;
        case 'down':
            newY = y + 1;
            break;
        case 'left':
            newX = x - 1;
            break;
        case 'right':
            newX = x + 1;
            break;
    }

    // 檢查新位置是否超出迷宮邊界
    if (newX < 0 || newY < 0 || newX >= maze[0].length || newY >= maze.length) {
        rewardForAction = rewardForHittingWall; // 超出邊界視為撞牆
    } else if (maze[newY][newX] === 1) {
        rewardForAction = rewardForHittingWall; // 新位置是牆壁
    } else if (newY === maze.length - 1 && newX === maze[0].length - 1) {
        rewardForAction = rewardForReachingGoal; // 新位置是終點
    } else {
        rewardForAction = rewardForEmptySpace; // 新位置是可通行空間
    }

    // 如果撞牆或超出邊界，則保持原地不動
    if (rewardForAction === rewardForHittingWall) {
        newY = y;
        newX = x;
    }

    return { newState: `${newY},${newX}`, reward: rewardForAction };
}


// 這個函數記錄每個episode的Q錶狀態
function logTraining(info) {
    // 這裡可以將信息記錄到控製臺，或者添加到頁麵上的某個元素中
    console.log(info);
}

function drawMaze(maze) {
    const mazeElement = document.getElementById('maze');
    mazeElement.style.gridTemplateColumns = `repeat(${maze[0].length}, 20px)`;
    let mazeHTML = '';

    maze.forEach((row, i) => {
        row.forEach((cell, j) => {
            let classes = 'cell';
            if (i === 0 && j === 0) classes += ' start';
            else if (i === maze.length - 1 && j === maze[0].length - 1) classes += ' end';
            else if (cell === 1) classes += ' wall';
            mazeHTML += `<div class="${classes}"></div>`;
        });
    });

    mazeElement.innerHTML = mazeHTML;
}
function showPath(path, start = '0,0', end = `${mazeData.length - 1},${mazeData[0].length - 1}`) {
    const mazeElement = document.getElementById('maze');
    let pathIndex = 0;
    let lastCellElement = null;

    const intervalId = setInterval(() => {
        if (pathIndex < path.length) {
            const [y, x] = path[pathIndex].split(',').map(Number);
            const cellIndex = y * mazeData[0].length + x;
            const cellElement = mazeElement.children[cellIndex];

            // 移除智能體的當前位置
            if (lastCellElement) {
                lastCellElement.classList.remove('agent');
            }

            // 將新位置設為智能體的位置
            cellElement.classList.add('agent');

            // 檢查當前位置是否不是起點或終點，然後添加 'visited' 類
            if (path[pathIndex] !== start && path[pathIndex] !== end) {
                cellElement.classList.add('visited');
            }

            lastCellElement = cellElement; // 更新智能體當前位置
            pathIndex++;
        } else {
            clearInterval(intervalId);
        }
    }, 100);
}

function updateQLearningLog(message) {
    const logElement = document.getElementById("qLearningLog");
    if (logElement) {
        logElement.innerHTML = message;
    }
}
document.getElementById('Q-Learning').addEventListener('click', function () {
    if (mazeData.length > 0) {
        let QTable = initializeQTable(mazeData); // 正确初始化QTable
        let optimalPathData = qLearning(mazeData, QTable, 10); // 确保这里传递的是正确的QTable
        let realPath = [...new Set(optimalPathData)];
        showPath(realPath);
    } else {
        console.log('迷宮尚未初始化。');
    }
});