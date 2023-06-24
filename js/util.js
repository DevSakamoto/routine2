// URLからパラメータを取得する関数
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function timeToSeconds(timeString) {
    const regex = /(\d+)\s*(時間|分|秒)?/g;
    let match;
    let totalSeconds = 0;
    while ((match = regex.exec(timeString))) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        if (unit === "時間") {
            totalSeconds += value * 3600;
        } else if (unit === "分") {
            totalSeconds += value * 60;
        } else if (unit === "秒" || !unit) {
            totalSeconds += value;
        }
    }
    consoleAdd(totalSeconds);
    return totalSeconds;
}

/**int -> 日本語表記の　時間　分　秒に変換する関数 */
function secondsToTime(seconds) {
    if(isNaN(seconds)){
        return seconds;
    }
    let timeString = "";
    if (seconds >= 3600) {
        timeString += `${Math.floor(seconds / 3600)}時間`;
        seconds %= 3600;
    }
    if (seconds >= 60) {
        timeString += `${Math.floor(seconds / 60)}分`;
        seconds %= 60;
    }
    if (seconds > 0 || timeString === "") {
        timeString += `${seconds}秒`;
    }
    consoleAdd(timeString);
    return timeString;
}

/**秒を 00:00の表記の文字列に変換 */
function formatSeconds(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
}

function consoleAdd(txt,isJSON=false) {
    if(isJSON){
        consoleOutput.value += JSON.stringify(txt) + "\n";
    }else
    {
        consoleOutput.value += txt + "\n";
    }
    
    scrollToBottom(consoleOutput);
    console.log(txt);
}

// テキストビューをアニメーション付きで最下部にスクロール
function scrollToBottom(scroolContent) {
    // アニメーションのパラメータを設定
    var start = scroolContent.scrollTop;
    var end = scroolContent.scrollHeight - scroolContent.clientHeight;
    var duration = 500; // アニメーションの時間（ミリ秒）

    // アニメーションの関数を定義
    var startTime = null;
    function animateScroll(currentTime) {
        if (startTime === null) startTime = currentTime;
        var elapsedTime = currentTime - startTime;
        var position = easeInOut(elapsedTime, start, end - start, duration);
        scroolContent.scrollTop = position;
        if (elapsedTime < duration) {
            requestAnimationFrame(animateScroll);
        } else {
            scroolContent.scrollTop = scroolContent.scrollHeight;
        }
    }
    // アニメーションを開始
    function easeInOut(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    requestAnimationFrame(animateScroll);
}

function speakFunc(txt) {
    // Create a new instance of the SpeechSynthesisUtterance object
    const utterance = new SpeechSynthesisUtterance(txt);
    // Set the voice and rate properties
    utterance.rate = 1;
    utterance.volume = volumeSlider.value / 100;
    // Speak the text
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance);
    consoleAdd("【音声再生】" + txt)
}

function createHeader() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //consoleAdd(this.responseText);
        var newContent = document.createElement("nav");
        newContent.innerHTML = this.responseText;
        document.body.insertBefore(newContent, document.body.firstChild);
      }
    };
    xhttp.open("GET", "navbar.html", true);
    xhttp.send();
}

function tableToObject(table) {
    // テーブルのヘッダー行から、各列のキーを抽出する
    const headers = Array.from(table.rows[0].cells).map(cell => cell.textContent.trim());
  
    // テーブルの2行目以降から、各行をオブジェクトに変換して配列に格納する
    const rows = Array.from(table.rows).slice(1);
    const objects = rows.map(row => {
      const obj = {};
      Array.from(row.cells).forEach((cell, index) => {
        obj[headers[index]] = cell.textContent.trim();
      });
      return obj;
    });
  
    return objects;
  }