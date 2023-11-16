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


    axios
        .post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                Authorization: `Bearer ${getApiKey()}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            const srtResult = response.data; // 假設API回傳了SRT格式的數據

            const formattedText = formatSrtToDisplay(srtResult);
            transcriptionResult.textContent = formattedText; // 這裡可能需要根據SRT格式來進行不同的處理
        })
        .catch((error) => {

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
            const summary = md.render(response.data.choices[0].message.content)

            summaryResult.innerHTML = summary
        })
        .catch((error) => {

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