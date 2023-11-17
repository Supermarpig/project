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
    // 使用正則表達式替換時間戳部分為空字串
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
    // 使用正則表達式分割每個字幕塊
    const blocks = srtText.trim().split(/\n\n+/);

    // 轉換每個字幕塊為新格式
    return blocks.map(block => {
        // 分割每一塊的行
        const lines = block.split('\n');

        // 忽略序號，只處理時間戳和字幕文本
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
        const transcriptionText = transcriptionDiv ? transcriptionDiv.textContent : '';

        // 檢查是否有轉錄文本
        if (!transcriptionText.trim()) {
            alert('沒有轉錄文字可以下載！');
            return;
        }

        // 創建Blob對象
        const blob = new Blob([transcriptionText], { type: 'text/plain' });

        // 創建URL以下載文件
        const url = URL.createObjectURL(blob);

        // 設置下載鏈接的URL和文件名
        downloadLink.href = url;
        downloadLink.style.display = 'block';

        // 单击下載鏈接以觸發下載
        downloadLink.click();

        // 釋放URL對象
        URL.revokeObjectURL(url);
    });
});

// 創建loading動畫
function showLoadingAnimation(parentElement) {
    const loadingAnimation = createLoadingAnimation(parentElement); // 使用你之前创建的函数
    return loadingAnimation;
}

// 移除加载动画
function hideLoadingAnimation(loadingAnimation) {
    if (loadingAnimation && loadingAnimation.parentNode) {
        loadingAnimation.parentNode.removeChild(loadingAnimation);
    }
}

function createLoadingAnimation(parentElement) {
    // 创建加载动画容器
    const loadingAnimation = document.createElement('div');
    loadingAnimation.className = 'loader'; // 根据你的样式类名设置样式

    // 创建四个点
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'loader-dot'; // 根据你的样式类名设置样式
        loadingAnimation.appendChild(dot);
    }
    // 将加载动画容器添加到指定的父元素中
    parentElement.appendChild(loadingAnimation);


    return loadingAnimation; // 返回加载动画容器元素的引用，以便后续移除
}

const parentElements = document.getElementsByClassName('testloading'); // 获取所有匹配类名的元素

// 遍历每个匹配的元素并为其创建加载动画
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

    // 複製選中的文本到剪貼板
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