let transcriptionText = ''
let errorMessages = document.getElementById('error')
const md = window.markdownit()

document
    .getElementById('checkbox')
    .addEventListener('change', function (event) {

        if (event.target.checked) {
            document.body.setAttribute('data-theme', 'dark')
        } else {
            document.body.setAttribute('data-theme', 'light')
        }
    })

const getApiKey = () => {

    const apiKey = document.getElementById('api-key').value
    localStorage.setItem('apiKey', apiKey)
    return apiKey
}

const transcribeAudio = () => {
    const audioInput = document.getElementById('audioInput')
    const transcriptionResult = document.getElementById('translation')


    if (!audioInput.files.length) {
        alert('請先選擇一個音訊檔案。')
        return
    }

    const formData = new FormData()

    formData.append('file', audioInput.files[0])
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'srt')

    const parentElement = document.getElementById('translationLabel')
    const loadingAnimation = showLoadingAnimation(parentElement);
    axios
        .post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                Authorization: `Bearer ${getApiKey()}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            hideLoadingAnimation(loadingAnimation);
            const srtResult = response.data; // 假設API回傳了SRT格式的數據

            const formattedText = formatSrtToDisplay(srtResult);
            transcriptionResult.textContent = formattedText; // 這裡可能需要根據SRT格式來進行不同的處理
        })
        .catch((error) => {
            hideLoadingAnimation(loadingAnimation);
            errorMessages.textContent = '轉錄錯誤: ' + error
        })
}

const summarizeText = () => {
    const summaryResult = document.getElementById('markdown')
    // 假設transcriptionResult.value包含時間戳和文本
    const transcriptionResult = document.getElementById('translation').value;
    // 使用正則錶達式替換時間戳部分為空字串
    const textWithoutTimestamps = transcriptionResult.replace(/\[\d{2}:\d{2}:\d{2} - \d{2}:\d{2}:\d{2}\]/g, '');
    if (!textWithoutTimestamps) {
        alert('沒有轉錄文字可總結。')
        return
    }

    const parentElement = document.getElementById('markdown')
    const loadingAnimation = showLoadingAnimation(parentElement);
    axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            temperature: 0,
            model: 'gpt-3.5-turbo-1106',
            messages: [
                {
                    role: 'system',
                    content: `
    1. First, You must please think step by step and reason, deeply analyze the fundamental problem that users actually want to solve. Because the user's question is vague, and the information contained in the question is also limited.
    2. I hope you can think further and help users solve their real problems.
    3. remain neutral and objective.
    4. Please insert emoji expressions in appropriate places to help users understand the intended content and also to create a relaxing atmosphere.The insertion method allows for the insertion of emoji expressions before and after words, sentences, and paragraphs.
    5. Proficient in using markdown tables to collect information and help users better understand the target information.
    6. If the user does not specify any language, then default to using Chinese for the reply.
    7. Please do not worry about your response being interrupted, try to output your reasoning process as much as possible.
    8. 請對以下內容進行分析，分析以下內容重點。並用繁體中文回覆。
    9. 並透過後設提問提供思維的收束，嘗試在回覆中找到多個論點，並統整這些論點，整理成一份markdown回覆。
    `
                },
                {
                    role: 'user',
                    content: textWithoutTimestamps ? textWithoutTimestamps : ''
                }
            ]
        },
        {
            headers: {
                'Content-Type': ' application/json',
                Authorization: `Bearer ${getApiKey()}`
            }
        }
    )
        .then((response) => {
            hideLoadingAnimation(loadingAnimation);
            const summary = md.render(response.data.choices[0].message.content)

            summaryResult.innerHTML = summary
        })
        .catch((error) => {
            hideLoadingAnimation(loadingAnimation);
            errorMessages.textContent = '總結錯誤: ' + error
        })
}

document.getElementById('translate-btn').addEventListener('click', transcribeAudio)
document.getElementById('convert-md-btn').addEventListener('click', summarizeText)


function formatSrtToDisplay(srtText) {
    // 使用正則錶達式分割每個字幕塊
    const blocks = srtText.trim().split(/\n\n+/);

    // 轉換每個字幕塊為新格式
    return blocks.map(block => {
        // 分割每一塊的行
        const lines = block.split('\n');

        // 忽略序號，隻處理時間戳和字幕文本
        const times = lines[1];
        const text = lines.slice(2).join(' '); // 如果字幕文本跨多行則合併

        // 提取開始和結束時間，並去除毫秒
        const [start, end] = times.split(' --> ').map(time => time.substr(0, 8));

        // 構建新格式的字串
        return `[${start} - ${end}]:${text}`;
    }).join('\n');
}

//下載txt檔案
document.addEventListener('DOMContentLoaded', function () {
    const exportButton = document.getElementById('exportButton');
    const transcriptionDiv = document.getElementById('translation');
    const downloadLink = document.getElementById('downloadLink');

    exportButton.addEventListener('click', function () {
        // 獲取轉錄文本
        const transcriptionText = transcriptionDiv ? transcriptionDiv.value : '';

        // 檢查是否有轉錄文本
        if (!transcriptionText.trim()) {
            alert('沒有轉錄文字可以下載！');
            return;
        }

        // 創建Blob對象
        const blob = new Blob([transcriptionText], { type: 'text/plain' });

        // 創建URL以下載文件
        const url = URL.createObjectURL(blob);

        // 生成文件名：格式為 "Transcription_YYYY-MM-DD_HHMMSS.txt"
        const date = new Date();
        const fileName = `Transcription_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}.txt`;

        // 設置下載鏈接的URL和文件名
        downloadLink.href = url;
        downloadLink.download = fileName; // 設定下載文件的文件名
        downloadLink.style.display = 'block';

        // 單擊下載鏈接以觸發下載
        downloadLink.click();

        // 釋放URL對象
        URL.revokeObjectURL(url);
    });
});

// 創建loading動畫
function showLoadingAnimation(parentElement) {
    const loadingAnimation = createLoadingAnimation(parentElement); // 使用你之前創建的函數
    return loadingAnimation;
}

// 移除加載動畫
function hideLoadingAnimation(loadingAnimation) {
    if (loadingAnimation && loadingAnimation.parentNode) {
        loadingAnimation.parentNode.removeChild(loadingAnimation);
    }
}

function createLoadingAnimation(parentElement) {
    // 創建加載動畫容器
    const loadingAnimation = document.createElement('div');
    loadingAnimation.className = 'loader'; // 根據你的樣式類名設定樣式

    // 創建四個點
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'loader-dot'; // 根據你的樣式類名設定樣式
        loadingAnimation.appendChild(dot);
    }
    // 將加載動畫容器添加到指定的父元素中
    parentElement.appendChild(loadingAnimation);


    return loadingAnimation; // 返回加載動畫容器元素的引用，以便後續移除
}

const parentElements = document.getElementsByClassName('testloading'); // 獲取所有匹配類名的元素

// 遍曆每個匹配的元素並為其創建加載動畫
for (let i = 0; i < parentElements.length; i++) {
    const parentElement = parentElements[i];
    const loadingAnimation = createLoadingAnimation(parentElement);
}

//複製text功能
const copyButton = document.getElementById('copy-button');
const translationTextArea = document.getElementById('translation');

copyButton.addEventListener('click', function () {
    const textToCopy = translationTextArea.value.trim(); // 取得<textarea>中的文本並去除首尾空白

    if (textToCopy === '') {
        // 如果<textarea>中沒有內容，顯示警告訊息
        alert('沒有要複製的內容！');
        return;
    }

    // 選擇<textarea>中的文本
    translationTextArea.select();

    // 複製選中的文本到剪貼闆
    document.execCommand('copy');

    // 取消文本選擇狀態
    window.getSelection().removeAllRanges();

    // 改變按鈕內容為勾勾icon和"已複製"
    copyButton.innerHTML = '&#10004; 已複製';

    // 禁用按鈕，防止多次點擊
    copyButton.disabled = true;

    // 過一段時間後恢復按鈕狀態
    setTimeout(function () {
        copyButton.innerHTML = '複製錄音內容';
        copyButton.disabled = false;
    }, 2000); // 2秒後恢復按鈕狀態
});

let originalSrtText = ''; // 用於保存原始數據
let timestampsRemoved = false; // 跟蹤時間戳是否被移除

document.addEventListener('DOMContentLoaded', function () {
    originalSrtText = document.getElementById('translation').value;
});




//切換時間格式
document.addEventListener('DOMContentLoaded', function () {
    const removeTimestampsButton = document.getElementById('remove-timestamps');
    const translationTextArea = document.getElementById('translation');
    let timestampsVisible = true;
    // 保存原始轉錄文本的副本
    let originalText = translationTextArea.value; // 在頁麵加載時就獲取和保存原始文本

    removeTimestampsButton.addEventListener('click', function () {
        if (timestampsVisible) {
            // 隱藏時間戳記
            let textWithoutTimestamps = originalText.replace(/\[\d{2}:\d{2}:\d{2} - \d{2}:\d{2}:\d{2}\]:/g, '');
            translationTextArea.value = textWithoutTimestamps;
            removeTimestampsButton.innerText = '顯示時間格式';
        } else {
            // 恢復時間戳記，即使用保存的原始文本
            translationTextArea.value = originalText; // 使用保存的原始文本恢復
            removeTimestampsButton.innerText = '隱藏時間格式';
        }

        timestampsVisible = !timestampsVisible;
    });
});

// 處理音樂上傳聲波功能

let globalBuffer;
document.addEventListener('DOMContentLoaded', function () {
    const audioInput = document.getElementById('audioInput');
    const canvas = document.getElementById('waveform');
    const ctx = canvas.getContext('2d');
    const audioPlayer = document.getElementById('audioPlayer');
    const currentTimeDisplay = document.getElementById('currentTime');
    let audioDuration = 0; // 音頻總時長

    const togglePlayButton = document.getElementById('togglePlayButton');

    togglePlayButton.addEventListener('click', function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
            togglePlayButton.textContent = '播放';
        } else {
            audioPlayer.pause();
            togglePlayButton.textContent = '暫停';
        }
    });

    audioInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const audioUrl = URL.createObjectURL(file);
        audioPlayer.src = audioUrl;
        audioPlayer.load();

        const reader = new FileReader();
        reader.onload = function (e) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(e.target.result, function (buffer) {
                audioDuration = buffer.duration;
                drawWaveform(buffer);
            });
        };
        reader.readAsArrayBuffer(file);
    });

    audioPlayer.addEventListener('timeupdate', function () {
        const currentTime = audioPlayer.currentTime;
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        currentTimeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        // 重新繪製波形並添加進度指示
        drawProgressIndicator(currentTime / audioDuration);
    });
    // canvas.addEventListener('click', function () {
    //     if (audioPlayer.paused) {
    //         audioPlayer.play();
    //     } else {
    //         audioPlayer.pause();
    //     }
    // });

    let isDragging = false;

    canvas.addEventListener('mousedown', function (e) {
        isDragging = true;
        // 可選：在用戶開始拖拽時暫停音頻播放
        audioPlayer.pause();
    });

    canvas.addEventListener('mousemove', function (e) {
        if (isDragging) {
            // 實時更新播放進度的視覺反饋（可選）
            const progress = e.offsetX / canvas.offsetWidth;
            drawProgressIndicator(progress);
        }
    });

    canvas.addEventListener('mouseup', function (e) {
        if (isDragging) {
            const progress = e.offsetX / canvas.offsetWidth;
            const newTime = progress * audioPlayer.duration;
            audioPlayer.currentTime = newTime; // 更新音頻播放時間
            audioPlayer.play(); // 拖拽結束後立即開始播放
            isDragging = false;
        }
    });

    canvas.addEventListener('mouseleave', function (e) {
        // 當滑鼠離開canvas時停止拖拽
        isDragging = false;
    });

    function drawWaveform(buffer) {
        globalBuffer = buffer; // 存儲音頻緩沖區以便稍後重新繪製進度
        const data = buffer.getChannelData(0);
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < canvas.width; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            // 預設顔色
            ctx.fillStyle = "#BBB";
            ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
    }
    function drawProgressIndicator(progressRatio) {
        const data = globalBuffer.getChannelData(0);
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < canvas.width; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            // 根據進度設定顔色
            ctx.fillStyle = i < canvas.width * progressRatio ? "rgba(0, 150, 0, 0.5)" : "#BBB";
            ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
    }
    // 監聽播放進度更新，重新繪製波形
    audioPlayer.addEventListener('timeupdate', function () {
        const currentTime = audioPlayer.currentTime;
        drawProgressIndicator(currentTime / audioDuration);
        // 更新播放時間的代碼...
    });
});
