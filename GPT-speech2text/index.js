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


    axios
        .post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                Authorization: `Bearer ${getApiKey()}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            transcriptionText = response.data.text

            transcriptionResult.textContent = transcriptionText
        })
        .catch((error) => {

            errorMessages.textContent = '轉錄錯誤: ' + error
        })
}

const summarizeText = () => {
    const summaryResult = document.getElementById('markdown')
    const transcriptionResult = document.getElementById('translation')

    if (!transcriptionResult) {
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
    8. 請對以下內容進行。並用繁體中文回覆。
    9. 並透過後設提問提供思維的收束，嘗試在回覆中找到多個論點，並統整這些論點。
    10. 使用marldown表格，來說明你的論點
    `
                },
                {
                    role: 'user',
                    content: transcriptionResult ? transcriptionResult.value : ''
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