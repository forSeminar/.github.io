// JSONから問題を読み込み表示する関数
function displayQuestions(jsonPath) {
    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            // 問題を表示するコンテナ
            const questionContainer = document.getElementById("questionContainer");
            // 各問題を表示
            data.forEach((question, index) => {
                // 問題の表示形式
                const questionHTML = `
                    <div class="question-box">
                        <strong>${index + 1}.</strong> ${question.question}
                        <button class="answer-btn" onclick="showAnswer(this, ${index})">解答</button>
                        <div class="answer" id="answer-${index}" style="display:none"></div>
                    </div>`;
                // 問題を追加
                questionContainer.innerHTML += questionHTML;
            });
        })
        .catch(error => console.error("Error fetching questions:", error));
}

// 解答を表示する関数
function showAnswer(button, index) {
    const answerDiv = document.getElementById(`answer-${index}`);
    const jsonPath = getJsonPath();
    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            const question = data[index];
            // 借方と貸方のデータを作成
            const debits = [];
            const credits = [];
            for (let i = 1; i <= 4; i++) {
                if (question[`debit${i}`] && question[`debitAmount${i}`]) {
                    debits.push({ account: question[`debit${i}`], amount: question[`debitAmount${i}`] });
                }
                if (question[`credit${i}`] && question[`creditAmount${i}`]) {
                    credits.push({ account: question[`credit${i}`], amount: question[`creditAmount${i}`] });
                }
            }
            // 借方・貸方のテーブルHTMLを作成
            const tableHTML = `
                <table>
                    <tr>
                        <th>借方</th>
                        <th>金額</th>
                        <th>貸方</th>
                        <th>金額</th>
                    </tr>
                    ${debits.map((debit, i) => `
                        <tr>
                            <td>${debit.account}</td>
                            <td>${debit.amount}</td>
                            <td>${credits[i]?.account || ""}</td>
                            <td>${credits[i]?.amount || ""}</td>
                        </tr>`).join('')}
                </table>`;
            // 解答を表示
            answerDiv.innerHTML = tableHTML;
            answerDiv.style.display = "block";
            // 解答を表示した後、5秒後に非表示にする
            setTimeout(() => {
                answerDiv.style.display = "none";
            }, 5000);
        })
        .catch(error => console.error("Error fetching answers:", error));
}

// 現在のHTMLファイル名に基づいてJSONファイルのパスを取得する関数
function getJsonPath() {
    const path = window.location.pathname;
    const page = path.split("/").pop().replace(".html", "");
    return `../sources/${page}.json`; // JSONファイルのパス
}

// ページ読み込み時に問題を表示
document.addEventListener("DOMContentLoaded", () => {
    const jsonPath = getJsonPath();
    displayQuestions(jsonPath);
});

document.getElementById('quizListButton').addEventListener('click', questionList);
// 問題一覧を表示する関数
function questionList() {
    // ダークモードの状態を取得
    const isDarkMode = document.body.classList.contains('dark-mode');
    // 新しいウィンドウを開き、ダークモードの状態を引き継ぐ
    const newWindow = window.open('../queList.html', '_blank');
    if (isDarkMode) {
        // ダークモードの場合、新しいウィンドウにダークモードのクラスを適用する
        newWindow.onload = function() {
            newWindow.document.body.classList.add('dark-mode');
        };
    }
}