// グローバル変数
let quiz = [];
let currentIdx = 0;
let correctCnt = 0;
let incorrectCnt = 0;

// イベントリスナーの設定
document.getElementById('topicSelect').addEventListener('change', change);
document.getElementById('darkModeButton').addEventListener('click', toggleDark);
document.getElementById('quizListButton').addEventListener('click', questionList);
document.getElementById('clearMemoButton').addEventListener('click', clearMemo);

// メモをクリアする関数
function clearMemo() {
    document.getElementById('memoPad').value = '';
}

// 初期化関数
function init() {
    quiz = [];
    currentIdx = 0;
    correctCnt = 0;
    incorrectCnt = 0;
    document.getElementById('question').textContent = '';
    document.getElementById('answer').textContent = '';
    updateCnt();
    document.getElementById('accuracy').textContent = '0';
    document.getElementById('message').textContent = '';
    toggleBtn(false);
    document.getElementById('memoPad').style.display = 'none';
    document.getElementById('clearMemoButton').style.display = 'none';
    document.querySelector('.stats').style.display = 'none';
}

// 論点変更時の処理
function change() {
    const selected = this.value;
    if (selected === "") {
        init();
        return;
    }
    resetCnt();
    fetchQuestions(selected);
    document.querySelector('.stats').style.display = 'block';
    document.getElementById('memoPad').style.display = 'block';
    document.getElementById('clearMemoButton').style.display = 'inline';
}


// カウンターリセット
function resetCnt() {
    correctCnt = 0;
    incorrectCnt = 0;
    updateCnt();
    document.getElementById('accuracy').textContent = '0';
    document.getElementById('message').textContent = '';
}

// カウンター表示更新
function updateCnt() {
    document.getElementById('correctCnt').textContent = correctCnt;
    document.getElementById('incorrectCnt').textContent = incorrectCnt;
}

// 問題取得
function fetchQuestions(topic) {
    if (topic === "all") {
        const allTopics = [];
        for (let i = 1; i <= 24; i++) {
            allTopics.push(`que${i}`);
        }

        const fetches = allTopics.map(t => fetch(`sources/${t}.json`).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }));

        Promise.all(fetches)
            .then(results => {
                quiz = shuffle(results.flat());
                currentIdx = 0;
                nextQuestion();
            })
            .catch(error => {
                console.error("Error fetching the quizzes:", error);
                displayError();
            });
    } else {
        fetch(`sources/${topic}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                quiz = shuffle(data);
                currentIdx = 0;
                nextQuestion();
            })
            .catch(error => {
                console.error(`Error fetching the quiz for ${topic}:`, error);
                displayError();
            });
    }
}


// エラーメッセージ表示
function displayError() {
    document.getElementById('question').textContent = '問題の取得に失敗しました';
    document.getElementById('answer').textContent = '';
}

// 次の問題表示
function nextQuestion() {
    if (currentIdx < quiz.length) {
        displayQuestion(quiz[currentIdx]);
        toggleBtn(true);
    } else {
        displayResult();
    }
}

// 問題表示
function displayQuestion(question) {
    const currentNumber = currentIdx + 1;
    const remaining = quiz.length - currentNumber;
    const questionHeader = `問題 ${currentNumber}/${quiz.length}\n`;
    const formatted = ' ' + question.question.replace(/\n\s*/g, '\n ');
    document.getElementById('question').innerHTML = `<strong>${questionHeader}</strong>${formatted}`;
    document.getElementById('answer').classList.add('hidden');
}

// 解答ボタン表示/非表示切り替え
function toggleBtn(show) {
    const action = show ? 'remove' : 'add';
    const answerButton = document.getElementById('answerButton');
    answerButton.textContent = show ? '解答を表示' : '解答を非表示';
    document.getElementById('answerButton').classList[action]('hidden');
    document.getElementById('correctButton').classList[action]('hidden');
    document.getElementById('incorrectButton').classList[action]('hidden');
}

// 正解/不正解のカウント更新
function countAnswer(isCorrect) {
    if (isCorrect) {
        correctCnt++;
    } else {
        incorrectCnt++;
    }
    updateCnt();
    currentIdx++;
    if (currentIdx < quiz.length) {
        nextQuestion();
    } else {
        displayResult();
    }
    updateAccuracy();
}

// 正答率更新
function updateAccuracy() {
    const total = correctCnt + incorrectCnt;
    if (total > 0) {
        const accuracy = ((correctCnt / total) * 100).toFixed(2);
        document.getElementById('accuracy').textContent = accuracy;
    }
}

// 解答表示
function displayAnswer() {
    const answer = document.getElementById('answer');
    const answerButton = document.getElementById('answerButton');
    const currentQuestion = quiz[currentIdx];
    if (answer.classList.contains('hidden')) {
        let tableHTML = '<table>';
        tableHTML += '<tr><th>借方科目</th><th></th><th>貸方科目</th></tr>';
        for (let i = 1; i <= 4; i++) {
            const drFld = `debit${i}`;
            const crFld = `credit${i}`;
            const drAmtFld = `debitAmount${i}`;
            const crAmtFld = `creditAmount${i}`;
            const drTxt = currentQuestion[drFld] || '';
            const drAmtTxt = currentQuestion[drAmtFld] || '';
            const crTxt = currentQuestion[crFld] || '';
            const crAmtTxt = currentQuestion[crAmtFld] || '';
            tableHTML += `<tr><td>${drTxt}</td><td>${drAmtTxt}</td><td>${crTxt}</td><td>${crAmtTxt}</td></tr>`;
        }
        tableHTML += '</table>';
        answer.innerHTML = tableHTML;
        answer.classList.remove('hidden');
        answerButton.textContent = '解答を非表示';
    } else {
        answer.textContent = '';
        answer.classList.add('hidden');
        answerButton.textContent = '解答を表示';
    }
}

// 結果メッセージ取得
function fetchResultMsg(per) {
    if (per == 100) return ['Outstanding', 'outstanding'];
    if (per >= 95) return ['Awesome', 'awesome'];
    if (per >= 90) return ['Excellent', 'excellent'];
    if (per >= 70) return ['Very Good', 'very-good'];
    if (per >= 50) return ['Good', 'good'];
    if (per >= 30) return ['Average', 'average'];
    return ['Poor', 'poor'];
}

// 結果メッセージ表示
function displayResultMsg(message, messageClass) {
    const msg = document.getElementById('message');
    msg.textContent = message;
    msg.className = `message ${messageClass}`;
}

// 結果表示
function displayResult() {
    const per = (correctCnt / quiz.length) * 100;
    const [message, messageClass] = fetchResultMsg(per);
    displayResultMsg(message, messageClass);
    toggleBtn(false);
    document.getElementById('question').textContent = '';
    document.getElementById('answer').textContent = '';
    document.getElementById('answer').classList.add('hidden');
}

// 配列シャッフル
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ダークモードを切り替える関数
function toggleDark() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode-container');
    const darkModeButton = document.getElementById('darkModeButton');
    const memoPad = document.getElementById('memoPad');
    const topicSelect = document.getElementById('topicSelect');
    const quizListButton = document.getElementById('quizListButton');

    if (body.classList.contains('dark-mode')) {
        darkModeButton.textContent = 'ホワイトモード';
        memoPad.classList.add('dark-mode');
        topicSelect.classList.add('dark-mode');
        quizListButton.classList.add('dark-mode');
    } else {
        darkModeButton.textContent = 'ダークモード';
        memoPad.classList.remove('dark-mode');
        topicSelect.classList.remove('dark-mode');
        quizListButton.classList.remove('dark-mode');
    }
}

// 問題一覧を表示する関数
function questionList() {
    // ダークモードの状態を取得
    const isDarkMode = document.body.classList.contains('dark-mode');
    // 新しいウィンドウを開き、ダークモードの状態を引き継ぐ
    const newWindow = window.open('queList.html', '_blank');
    if (isDarkMode) {
        // ダークモードの場合、新しいウィンドウにダークモードのクラスを適用する
        newWindow.onload = function() {
            newWindow.document.body.classList.add('dark-mode');
        };
    }
}


// ページ読み込み時に初期状態設定
init();