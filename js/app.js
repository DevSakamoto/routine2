const input = document.getElementById("input");
const speakBtn = document.getElementById("speakBtn");
const pauseBtn = document.getElementById("pauseBtn");
const startBtn = document.getElementById("startBtn");
const addRowButton = document.getElementById("addRowButton");
const dataTable = document.getElementById("dataTable");
const volumeSlider = document.getElementById("volumeSlider");
const consoleOutput = document.getElementById("consoleOutput");
const currentWorkLabel = document.getElementById("currentWorkLabel");
const currentWorkDetailLabel = document.getElementById("currentWorkDetailLabel");
const currentProgressBar = document.getElementById("currentProgressBar");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const callOptionDropDown = document.getElementById("callOptionDropDown");
const routineIdDropDown = document.getElementById("routineIdDropDown");

var loadData;
var timer = 0;
var currentWorkTime = -1;
var _date = new Date();
var _workArr = [];
var timerId = 0;
var _recordChildList = [];
var workIndex = 0;
var routineId;
var routineIdList = [];

window.onload = function () {
    $(document).ready(init);
    createHeader();
}

function init() {
    consoleAdd("v0.0.3");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://script.google.com/macros/s/AKfycbx7_N9Et7WblpE4q-HHeVPN-UFgZGp5VJtPficQI_TbQNxHocSHbG4Yt7ycuyxcnqni/exec', true);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            routineId = getParameterByName("routine_id");
            if(routineId == null){
                routineId = "def"
            }
            consoleAdd(routineId);
            loadData = JSON.parse(this.responseText);
            loadData["work"].forEach(element => {
                if(routineIdList.indexOf(element["routine_id"]) == -1 && element["routine_id"] != "def"){
                    routineIdList.push(element["routine_id"]);
                    const newRow = document.createElement("li");
                    newRow.innerHTML = '<button class="dropdown-item" id ="routineId" value='+element["routine_id"]+'>'+element["routine_id"]+'</button>';
                    routineIdDropDown.appendChild(newRow);
                }
            });
            setFunc();
            reload();
        }
    };
    xhr.send();
}

backBtn.addEventListener("click", function () {
    indexControll(true);
});
forwardBtn.addEventListener("click", function () {
    indexControll(false);
});
function indexControll(isBack) {
    _recordChildList[workIndex].className = "";
    workIndex += isBack ? -1 : 1;
    workIndex = Math.max(0, workIndex);
    setWork();
}

function reload() {

    consoleAdd("init")
    //consoleAdd(JSON.stringify(loadData));

    timer = 0;
    currentWorkTime = -1;
    _date = new Date();
    _workArr = [];
    if (timerId != 0) {
        clearInterval(timerId);
        timerId = 0;
        pauseBtn.innerText = "pausing";
        speakFunc("pauseしました");
    } 
    timerId = 0;
    

    //consoleAdd(_recordChildList.length);
    loadData["work"].forEach(element => {
        if(element["routine_id"] == routineId){
            setUnit(element);
        }
        //consoleAdd(JSON.stringify(element));
        
    });
}

speakBtn.addEventListener("click", function () {
    startWork();
    speakBtn.disabled = true;
    speakBtn.innerText = "実行中";
    pauseBtn.disabled = false;
});

if (pauseBtn != null) {
    pauseBtn.addEventListener("click", function () {
        if (currentWorkTime == -1) {
            return;
        }
        if (timerId != 0) {
            clearInterval(timerId);
            timerId = 0;
            pauseBtn.innerText = "pausing";
            speakFunc("pauseしました");
        } else {
            pauseBtn.innerText = "pauseBtn";
            timerId = setInterval(logEverySecond, 1000);
            speakFunc("再開しました");
        }
    });
}


if (startBtn != null) {
    startBtn.addEventListener("click", function () {
        const seconds = 3;//parseInt(timerInput.value);
        if (isNaN(seconds)) {
            alert("Please enter a valid number of seconds");
        } else {
            // Calculate the timeout in milliseconds
            const timeout = seconds * 1000;
            // Set a timer to display an alert after the specified time has elapsed
            setTimeout(function () {
                speakFunc(seconds + "秒 経過");
            }, timeout);
        }
    });
}

if (addRowButton != null) {
    addRowButton.addEventListener("click", function () {
        setUnit({ no: 1, name: 1, time: 1 });
    });
}


function setUnit(obj) {

    const newRow = document.createElement('tr');
    _workArr.push(obj);

    const checkColumn = document.createElement("td");
    checkColumn.innerHTML = '<label style="display:block; margin: 0;"><input id="input" type="checkbox" onchange="saveCheck(this)"></label>';
    checkColumn.style.textAlign = "center"
    checkColumn.style.fontSize= "2vmin";

    // データの取得
    const data = localStorage.getItem(obj["id"]+"-"+obj["no"]);
    if(data != null){
        const inputE = checkColumn.getElementsByTagName("input");
        inputE[0].checked = data == "true"? true:false;
    }
    

    // const noColumn = document.createElement("td");
    // noColumn.innerText = _workArr.length//obj["no"];
    // noColumn.style.textAlign = "center"
    // noColumn.style.fontSize= "2vmin";

    const nameColumn = document.createElement("td");
    nameColumn.innerText = obj["name"];
    nameColumn.style.fontSize= "2vmin";

    const timeColumn = document.createElement("td");
    timeColumn.innerText = secondsToTime(obj["time"]);
    timeColumn.style.textAlign = "center"
    timeColumn.style.fontSize= "2vmin";

    const startDatteColumn = document.createElement("td");
    startDatteColumn.innerText = _date.toLocaleTimeString();
    startDatteColumn.style.fontSize= "2vmin";
    _date.setSeconds(_date.getSeconds() + timeToSeconds(obj["time"]));

    const delColumn = document.createElement("td");
    delColumn.innerHTML = '<button id="delBtn" class="btn btn-dark btn-sm" onclick="deleteRow(this.parentNode)">❌</button>'
    delColumn.style.textAlign = "center"
    timeColumn.style.fontSize= "2vmin";


    newRow.appendChild(checkColumn);
    //newRow.appendChild(noColumn);
    newRow.appendChild(nameColumn);
    newRow.appendChild(timeColumn);
    // newRow.appendChild(startDatteColumn);
    newRow.appendChild(delColumn);

    _recordChildList.push(newRow)
    dataTable.tBodies[0].appendChild(newRow);
}
function saveCheck(event) {

    speakFunc(event.checked);
    var row = event.parentNode.parentNode.parentNode;
    var rowIndex = _recordChildList.indexOf(row);
    consoleAdd(rowIndex);
    // データの保存
    localStorage.setItem(_workArr[rowIndex]["id"]+"-"+_workArr[rowIndex]["no"], event.checked);

}

function deleteRow(button) {
    var row = button.parentNode;
    var rowIndex = _recordChildList.indexOf(row);
    consoleAdd(_recordChildList.indexOf(row));
    consoleAdd(row + " " + workIndex);
    if(rowIndex <= workIndex){
        consoleAdd("実行中 or 完了済みなので消せません");
        return;
    }
    row.parentNode.removeChild(row);
    _recordChildList.splice(rowIndex,1)
    _workArr = tableToObject(dataTable);
}

function setWork() {
    if (_workArr.length <= workIndex) {
        currentWorkDetailLabel.classList.remove("fuwafuwa")
        currentWorkDetailLabel.innerText = "終わりです。おつかれさまでした";
        speakFunc("終わりです。おつかれさまでした")
        clearInterval(timerId)
        return;
    }
    timer = 0;
    currentProgressBar.style.width = "0%";
    var element = _workArr[workIndex]
    _recordChildList[workIndex].className = "table-warning";
    currentWorkTime = timeToSeconds(element["time"]);
    currentWorkLabel.innerText = _workArr[workIndex]["name"]

    currentWorkDetailLabel.innerText = _workArr[workIndex]["name"] + " " + secondsToTime(currentWorkTime - timer);
    speakFunc(element["name"] + "を" + element["time"] + "行う")
}

function startWork() {
    if (timerId != 0) {
        consoleAdd("既にスタートしてます");
        return;
    }
    currentWorkDetailLabel.classList.add("fuwafuwa")
    consoleAdd("startWork");
    setWork();
    timerId = setInterval(logEverySecond, 1000);
}

function logEverySecond() {

    timer += 1;
    currentWorkDetailLabel.innerText = _workArr[workIndex]["name"] + " " + secondsToTime(currentWorkTime - timer);
    currentWorkDetailLabel.innerText += (timer / currentWorkTime * 100).toFixed(1) + "%経過"
    currentProgressBar.style.width = timer / currentWorkTime * 100 + "%";
    if (timer > currentWorkTime) {
        _recordChildList[workIndex].className = "";
        workIndex += 1;
        setWork();
        return;
    }
    
    if ((currentWorkTime - timer) % parseInt(callOptionDropDown.value) == 0) {
        var sec = secondsToTime(currentWorkTime - timer);
        if (sec == "0秒") return;
        speakFunc("残り" + sec);
    }
}

function setFunc() {
    consoleAdd("callOptionDropDown")
      $('.dropdown-menu .dropdown-item').click(function () {
          var visibleItem = $('.dropdown-toggle', $(this).closest('.dropdown'));
          visibleItem.text($(this).text());
          visibleItem.attr('value', $(this).attr('value'));
          if(this.id == "routineId")
          {
            _recordChildList.forEach(element => {
                element.parentNode.removeChild(element);
                
            });
            _recordChildList = [];
            routineId = $(this).attr('value');
            reload();

          }

      });
  };