let transcriptionText = '';
let errorMessages = document.getElementById('error');
const md = window.markdownit();

document.getElementById('checkbox').addEventListener('change', function (event) {
    if (event.target.checked) {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.setAttribute('data-theme', 'light');
    }
});

const getApiKey = () => {
    const apiKey = document.getElementById('api-key').value;
    localStorage.setItem('apiKey', apiKey);
    return apiKey;
};

const transcribeAudio = () => {
    const audioInput = document.getElementById('audioInput');
    const transcriptionResult = document.getElementById('translation');

    if (!audioInput.files.length) {
        alert('請先選擇一個音訊檔案。');
        return;
    }

    const formData = new FormData();
    formData.append('file', audioInput.files[0]);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'srt');

    const parentElement = document.getElementById('translationLabel');
    const loadingAnimation = showLoadingAnimation(parentElement);
    axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
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
            errorMessages.textContent = '轉錄錯誤: ' + error.message; // 只顯示錯誤訊息
        });
};

const summarizeText = () => {
    const summaryResult = document.getElementById('markdown');
    const transcriptionResult = document.getElementById('translation').value;
    const textWithoutTimestamps = transcriptionResult.replace(/\[\d{2}:\d{2}:\d{2} - \d{2}:\d{2}:\d{2}\]/g, '');

    if (!textWithoutTimestamps) {
        alert('沒有轉錄文字可總結。');
        return;
    }

    const parentElement = document.getElementById('markdown');
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
                    content: textWithoutTimestamps
                }
            ]
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getApiKey()}`
            }
        }
    )
        .then((response) => {
            hideLoadingAnimation(loadingAnimation);
            const summary = md.render(response.data.choices[0].message.content);
            summaryResult.innerHTML = summary;
        })
        .catch((error) => {
            hideLoadingAnimation(loadingAnimation);
            errorMessages.textContent = '總結錯誤: ' + error.message;
        });
};

document.getElementById('translate-btn').addEventListener('click', transcribeAudio);
document.getElementById('convert-md-btn').addEventListener('click', summarizeText);

function formatSrtToDisplay(srtText) {
    const blocks = srtText.trim().split(/\n\n+/);

    return blocks.map(block => {
        const lines = block.split('\n');
        const times = lines[1];
        const text = lines.slice(2).join(' ');

        const [start, end] = times.split(' --> ').map(time => time.substr(0, 8));

        return `[${start} - ${end}]: ${text}`;
    }).join('\n');
}

document.addEventListener('DOMContentLoaded', function () {
    const exportButton = document.getElementById('exportButton');
    const transcriptionDiv = document.getElementById('translation');
    const downloadLink = document.getElementById('downloadLink');

    exportButton.addEventListener('click', function () {
        const transcriptionText = transcriptionDiv ? transcriptionDiv.textContent : '';

        if (!transcriptionText.trim()) {
            alert('沒有轉錄文字可以下載！');
            return;
        }

        const blob = new Blob([transcriptionText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.style.display = 'block';

        downloadLink.click();

        URL.revokeObjectURL(url);
    });
});

function showLoadingAnimation(parentElement) {
    const loadingAnimation = createLoadingAnimation(parentElement);
    return loadingAnimation;
}

function hideLoadingAnimation(loadingAnimation) {
    if (loadingAnimation && loadingAnimation.parentNode) {
        loadingAnimation.parentNode.removeChild(loadingAnimation);
    }
}

function createLoadingAnimation(parentElement) {
    const loadingAnimation = document.createElement('div');
    loadingAnimation.className = 'loader';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'loader-dot';
        loadingAnimation.appendChild(dot);
    }
    parentElement.appendChild(loadingAnimation);

    return loadingAnimation;
}

const parentElements = document.getElementsByClassName('testloading');

for (let i = 0; i < parentElements.length; i++) {
    const parentElement = parentElements[i];
    createLoadingAnimation(parentElement);
}

const copyButton = document.getElementById('copy-button');
const translationTextArea = document.getElementById('translation');

copyButton.addEventListener('click', function () {
    const textToCopy = translationTextArea.value.trim();

    if (textToCopy === '') {
        alert('沒有要複製的內容！');
        return;
    }

    translationTextArea.select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    copyButton.innerHTML = '&#10004; 已複製';
    copyButton.disabled = true;

    setTimeout(function () {
        copyButton.innerHTML = '複製錄音內容';
        copyButton.disabled = false;
    }, 2000);
});

let originalSrtText = '';
let timestampsRemoved = false;

document.addEventListener('DOMContentLoaded', function () {
    originalSrtText = document.getElementById('translation').value;
});

function removeBracketsFromText(srtText) {
    return srtText.replace(/\[\d{2}:\d{2}:\d{2} - \d{2}:\d{2}:\d{2}\]:/g, '');
}

document.getElementById('toggle-timestamps').addEventListener('click', function () {
    if (!timestampsRemoved) {
        const formattedText = removeBracketsFromText(originalSrtText);
        document.getElementById('translation').value = formattedText;
        timestampsRemoved = true;
    } else {
        document.getElementById('translation').value = originalSrtText;
        timestampsRemoved = false;
    }
});
