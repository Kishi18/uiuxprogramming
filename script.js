const serviceName = "How to improve at basketball";
let isSubscribed = false;
let submitCount = 0;


function makeSubscribeMessage(email, subscribed){
    if(subscribed == true){
        return email + "로 신청이 완료되었습니다.";
    }
    
    return "이메일을 입력한 뒤 신청해 주세요";
}

const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");
const subscribeButton = document.querySelector("#subscribeButton");
const subscribeMessage = document.querySelector("#subscribeMessage");

function handleSubscribe(event){
    event.preventDefault();

    const subscriberEmail = emailInput.value.trim();

    if(subscriberEmail === ""){
        subscribeMessage.textContent = "이메일을 입력한 뒤 신청해주세요.";
        emailInput.focus();
        return;
    }

    isSubscribed = true;
    submitCount += 1;
    
    subscribeMessage.textContent = makeSubscribeMessage(subscriberEmail, isSubscribed);

    subscribeMessage.classList.add("is-success");

    subscribeButton.textContent = "신청 완료";
    subscribeButton.disabled = true;
}

subscribeForm.addEventListener("submit", handleSubscribe);

const themeButton = document.querySelector("#themeButton");
const nicknameInput = document.querySelector("#nickname");
const nicknameCount = document.querySelector("#nicknameCount");
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const startButton = document.querySelector("#startButton");

function handleThemeClick(event){
    const isDark = document.body.classList.toggle("dark");

    themeButton.textContent = isDark ? "라이트 테마로 바꾸기" : "다크 테마로 바꾸기";
}

themeButton.addEventListener("click", handleThemeClick);

function handleNicknameInput(event){
    const maxLength = nicknameInput.maxLength;
    const currentLength = Math.min(nicknameInput.value.length, maxLength);

    nicknameCount.textContent = currentLength + " / " + maxLength;
}

nicknameInput.addEventListener("input", handleNicknameInput);

function handleAgreeChange(){
    const agreed = agreeCheck.checked;

    startButton.disabled = !agreed;
    agreeMessage.textContent = agreed ? "훈련 설정을 시작할 수 있습니다." : "동의 후 훈련 설정을 시작할 수 있습니다.";

    if(agreed){
        agreeMessage.classList.add("is-ready");
    } else {
        agreeMessage.classList.remove("is-ready");
    }
}

agreeCheck.addEventListener("change", handleAgreeChange); 

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function resetTabsAndPanels(){
    tabs.forEach(function(tab){
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false");
    });

    panels.forEach(function(panel){
        panel.classList.remove("is-active");
        panel.hidden = true;
    });
}

function activateTab(clickedTab){
    const targetSelector = clickedTab.dataset.target;
    //const targetPanel= document.querySelector(targetSelector);    // targetSelector로 가져온 dataset에 #이 붙어있지 않음.
    const targetPanel= document.querySelector(targetSelector.startsWith("#") ? targetSelector : `#${targetSelector}`);  // #이 없다면 붙여주는 3항 연산자 추가

    clickedTab.classList.add("is-active");
    clickedTab.setAttribute("aria-selected","true");

    targetPanel.classList.add("is-active");
    targetPanel.hidden = false;
}

function handleTabClick(event){
    resetTabsAndPanels();
    activateTab(event.currentTarget);
}

tabs.forEach(function(tab){
    tab.addEventListener("click", handleTabClick);
});

const trainingFlow = document.querySelector("#training-flow");
const flowSteps = trainingFlow.querySelectorAll(".step");
const progressItems = trainingFlow.querySelectorAll(".progress__item");
const titleInput = document.querySelector("#training-title");
const titleError = document.querySelector("#title-error");
const titleNext = document.querySelector("#title-next");
const durationRange = document.querySelector("#duration-range");
const durationValue = document.querySelector("#duration-value");
const qnaOption = document.querySelector("#qna-option");
const qnaOptions = document.querySelector("#qna-options");
const optionPrev = document.querySelector("#option-prev");
const optionNext = document.querySelector("#option-next");
const summaryPrev = document.querySelector("#summary-prev");
const finishButton = document.querySelector("#finish-button");
const restartButton = document.querySelector("#restart-button");
const summaryTitle = document.querySelector("#summary-title");
const summaryDuration = document.querySelector("#summary-duration");
const summaryQna = document.querySelector("#summary-qna");
const durationValues = ["30","45","60"];

const formData = {
    title:"", duration:"30", qna:false, qnaCount: "2"
};

function showStep(index){
    flowSteps.forEach((step,i) => {step.hidden = i !== index; });
    progressItems.forEach((item,i) => {
        item.classList.toggle("is-active", i === index);
    });
}

const recordingDialog = document.querySelector("#recording-dialog");
const recordingCancel = document.querySelector("#recording-cancel");
const recordingConfirm = document.querySelector("#recording-confirm");

function revokeRecordingAgreement(){
    agreeCheck.checked = false;
    trainingFlow.hidden = true;
    handleAgreeChange();
    agreeCheck.focus();
}

startButton.addEventListener("click", ()=> {
    if(!agreeCheck.checked) return;
    recordingDialog.showModal();    
});
recordingCancel.addEventListener("click", ()=>{
    recordingDialog.close();
    revokeRecordingAgreement();
});
recordingDialog.addEventListener("cancel", revokeRecordingAgreement);
recordingConfirm.addEventListener("click",()=>{
    if(!agreeCheck.checked) return;
    recordingDialog.close();
    trainingFlow.hidden = false;
    showStep(0);
    trainingFlow.scrollIntoView({behavior:"smooth"});
    titleInput.focus();
});

function validateTitle(){
    const value = titleInput.value.trim();
    if(!value){
        titleError.textContent="발표 제목을 입력해 주세요.";
        titleInput.classList.add("has-error");
        titleInput.focus();
        return false;
    }
    titleError.textContent="";
    titleInput.classList.remove("has-error");
    formData.title = value;
    return true;
}

titleNext.addEventListener("click", ()=>{
    if(!validateTitle()) return;
    showStep(1);
});

durationRange.addEventListener("input",()=>{
    durationValue.value = durationValues[durationRange.value] + "분";
});
qnaOption.addEventListener("change", () =>{
    qnaOptions.hidden = !qnaOption.checked; 
});

optionPrev.addEventListener("click",()=> showStep(0));
optionNext.addEventListener("click",()=>{
    if(qnaOption.checked){  // 질의 응답을 체크한 경우
        formData.qna = qnaOption.checked;
        const count = document.querySelector('input[name="qna-count"]:checked');
        formData.qnaCount = count.value;
    } else {    // 질의 응답을 체크하지 않은 경우
        formData.qnaCount = "0";
    }
    formData.duration = durationValues[durationRange.value];    
    summaryTitle.textContent = formData.title;
    summaryDuration.textContent = formData.duration + "분";
    summaryQna.textContent = formData.qna ? formData.qnaCount + "개 포함" : "미포함";
    showStep(2);
    
});

summaryPrev.addEventListener("click", ()=> showStep(1));
finishButton.addEventListener("click", () => showStep(3));
restartButton.addEventListener("click", ()=> {
    formData.title = "";
    formData.duration = "30";
    formData.qna = false;
    formData.qnaCount="";

    titleInput.value= "";
    titleError.textContent="";
    titleInput.classList.remove("has-error");
    
    durationRange.value = "1";
    durationValue.value = "30분";
    
    qnaOption.checked = false;
    qnaOptions.hidden = true;    
    document.querySelector('input[name="qna-count"][value="2"]').checked = true;
    
    summaryTitle.textContent="";
    summaryDuration.textContent="";
    summaryQna.textContent="";
    showStep(0);
});

// 중간고사 추가 
const startSessionBtn = document.querySelector("#start-session-button");
const sessionActiveTitle = document.querySelector("#session-active-title");
const sessionStatusTag = document.querySelector("#session-status-tag");
const sessionTargetTime = document.querySelector("#session-target-time");
const toggleSessionBtn = document.querySelector("#toggle-session-btn");

const drillChecks = document.querySelectorAll(".drill-check");
const drillProgress = document.querySelector("#drill-progress");

const sessionMemo = document.querySelector("#session-memo");
const memoError = document.querySelector("#memo-error");
const saveLogBtn = document.querySelector("#save-log-btn");

const logList = document.querySelector("#log-list");
const logCount = document.querySelector("#log-count");
const logEmptyMsg = document.querySelector("#log-empty-msg");

const backToCompleteBtn = document.querySelector("#back-to-complete-btn");
const finalResetBtn = document.querySelector("#final-reset-button");

// 훈련 실행 데이터
let isSessionRunning = true;
const sessionLogs = [];


if(startSessionBtn) {
    startSessionBtn.addEventListener("click", () => {
        sessionActiveTitle.textContent = `[${formData.title}] 훈련 진행 중`;
        sessionTargetTime.textContent = `${formData.duration}분`;
        isSessionRunning = true;
        updateSessionStatusUI();
        showStep(4);
    });
}

// 2. 훈련 일시정지 / 재개 버튼 상태 토글
function updateSessionStatusUI() {
    if(isSessionRunning) {
        sessionStatusTag.textContent = "진행 중";
        sessionStatusTag.className = "status-badge running";
        toggleSessionBtn.textContent = "훈련 일시정지";
    } else {
        sessionStatusTag.textContent = "일시정지됨";
        sessionStatusTag.className = "status-badge paused";
        toggleSessionBtn.textContent = "훈련 재개";
    }
}

if(toggleSessionBtn) {
    toggleSessionBtn.addEventListener("click", () => {
        isSessionRunning = !isSessionRunning;
        updateSessionStatusUI();
    });
}

// 3. 기본기 드릴 체크박스 선택 시 진척도 갱신
function updateDrillProgress() {
    const total = drillChecks.length;
    let checkedCount = 0;
    drillChecks.forEach(cb => { if(cb.checked) checkedCount++; });

    const percent = Math.round((checkedCount / total) * 100);
    drillProgress.textContent = `${percent}%`;
}

drillChecks.forEach(cb => {
    cb.addEventListener("change", updateDrillProgress);
});

// 4. 훈련 일지 저장 및 피드백/검증
function renderLogs() {
    logList.innerHTML = "";
    logCount.textContent = sessionLogs.length;

    if(sessionLogs.length === 0) {
        logEmptyMsg.hidden = false;
    } else {
        logEmptyMsg.hidden = true;
        sessionLogs.forEach((logText, index) => {
            const li = document.createElement("li");
            li.className = "log-item";
            li.innerHTML = `
                <span>${logText}</span>
                <button type="button" class="delete-btn" data-index="${index}">삭제</button>
            `;
            
            // 일지 삭제 기능 (상태 변경 및 취소)
            li.querySelector(".delete-btn").addEventListener("click", (e) => {
                const targetIdx = parseInt(e.target.dataset.index, 10);
                sessionLogs.splice(targetIdx, 1);
                renderLogs();
            });

            logList.appendChild(li);
        });
    }
}

function validateAndSaveLog() {
    const memoValue = sessionMemo.value.trim();

    // 조건 검증 1: 빈 내용 처리
    if(!memoValue) {
        memoError.textContent = "메모 내용을 입력해 주세요.";
        sessionMemo.classList.add("has-error");
        sessionMemo.focus();
        return;
    }

    memoError.textContent = "";
    sessionMemo.classList.remove("has-error");

    // 정상 저장
    sessionLogs.push(memoValue);
    sessionMemo.value = "";
    renderLogs();
}

if(saveLogBtn) {
    saveLogBtn.addEventListener("click", validateAndSaveLog);
}

// 5. 완료 화면 복귀 (상태 유지) 및 완전 초기화
if(backToCompleteBtn) {
    backToCompleteBtn.addEventListener("click", () => {
        showStep(3); // Step 4로 복귀 (입력값 유지)
    });
}

if(finalResetBtn) {
    finalResetBtn.addEventListener("click", () => {
        // 모든 신규 데이터 초기화
        sessionLogs.length = 0;
        drillChecks.forEach(cb => cb.checked = false);
        updateDrillProgress();
        renderLogs();
        sessionMemo.value = "";
        memoError.textContent = "";
        sessionMemo.classList.remove("has-error");

        resetFormData();
        showStep(0); // Step 1로 이동
    });
}