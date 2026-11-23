const storageKey = "hooplab-training-routines-v1";
const form = document.querySelector("#plan-form");
const steps = [...document.querySelectorAll(".flow-step")];
const progressItems = [...document.querySelectorAll(".progress-item")];
const titleInput = document.querySelector("#routine-title");
const titleError = document.querySelector("#title-error");
const titleField = document.querySelector("#title-field");
const titleHelp = document.querySelector("#title-help");
const titleCount = document.querySelector("#title-count");
const noteInput = document.querySelector("#focus-note");
const noteCount = document.querySelector("#note-count");
const goalOption = document.querySelector("#goal-option");
const goalOptions = document.querySelector("#goal-options");
const goalInputs = document.querySelectorAll('input[name="goal-target"]');
const planList = document.querySelector("#plan-list");
const emptyState = document.querySelector("#empty-state");
const planCount = document.querySelector("#plan-count");
const archiveStatus = document.querySelector("#archive-status");
const planDialog = document.querySelector("#plan-dialog");

const navLinks = document.querySelectorAll(".main-nav a");
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

const filterButtons = document.querySelectorAll(".filter-button");
let currentFilter = "all";

const saveButton = document.querySelector("#save-plan");
const submitStatus = document.querySelector("#submit-status");
const completeMessage = document.querySelector("#complete-message");
let isSubmitting = false;

const categoryLabels = {
  dribble: "드리블",
  shooting: "슈팅",
  physical: "피지컬"
};

function readPlans() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((plan) => plan && typeof plan.id === "string" && typeof plan.title === "string")
      .map((plan) => ({
        id: plan.id,
        title: plan.title.slice(0, 60),
        category: ["dribble", "shooting", "physical"].includes(plan.category) ? plan.category : "dribble",
        focusNote: typeof plan.focusNote === "string" ? plan.focusNote.slice(0, 20) : "",
        duration: ["15", "30", "60"].includes(plan.duration) ? plan.duration : "30",
        hasGoal: plan.hasGoal === true,
        goalTarget: typeof plan.goalTarget === "string" ? plan.goalTarget : "100회 성공",
        completed: plan.completed === true,
        createdAt: typeof plan.createdAt === "string" ? plan.createdAt : ""
      }));
  } catch {
    return [];
  }
}

let plans = readPlans();
let currentStep = 1;

function savePlans() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

function showStep(number) {
  currentStep = number;
  steps.forEach((step) => {
    step.hidden = Number(step.dataset.step) !== number;
  });
  progressItems.forEach((item, index) => {
    const isCurrent = index === number - 1;
    item.classList.toggle("is-current", isCurrent);
    item.classList.toggle("is-done", index < number - 1);
    if (isCurrent && number <= 3) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  const heading = steps[number - 1].querySelector("h3");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  document.querySelector("#planner").scrollIntoView({ block: "start", behavior: "smooth" });
}

function updateTitleExperience() {
  const length = titleInput.value.length;
  const valid = titleInput.value.trim().length >= 2;
  const hasError = titleInput.getAttribute("aria-invalid") === "true";

  titleCount.textContent = `${length} / 60자`;
  titleField.classList.toggle("has-error", hasError);
  titleField.classList.toggle("is-valid", valid && !hasError);
  titleHelp.textContent = hasError
    ? "훈련 이름 입력 조건을 다시 확인해 주세요."
    : valid
    ? "입력 조건을 충족했습니다."
    : "2자 이상 60자 이하로 입력해 주세요.";
}

function validateTitle() {
  const title = titleInput.value.trim();
  if (!title) {
    titleError.textContent = "훈련 루틴 이름을 입력해 주세요.";
    titleInput.setAttribute("aria-invalid", "true");
    updateTitleExperience();
    titleInput.focus();
    return false;
  }

  if (title.length < 2) {
    titleError.textContent = "훈련 루틴 이름은 2자 이상 입력해 주세요.";
    titleInput.setAttribute("aria-invalid", "true");
    updateTitleExperience();
    titleInput.focus();
    return false;
  }

  titleError.textContent = "";
  titleInput.removeAttribute("aria-invalid");
  updateTitleExperience();
  return true;
}

function getFormValues() {
  return {
    title: titleInput.value.trim(),
    category: form.querySelector('input[name="category"]:checked').value,
    focusNote: noteInput.value.trim(),
    duration: form.querySelector('input[name="duration"]:checked').value,
    hasGoal: goalOption.checked,
    goalTarget: form.querySelector('input[name="goal-target"]:checked').value
  };
}

function goalText(plan) {
  return plan.hasGoal ? plan.goalTarget : "시간 중심 훈련";
}

function updateSummary() {
  const values = getFormValues();
  document.querySelector("#summary-title").textContent = values.title;
  document.querySelector("#summary-category").textContent = categoryLabels[values.category];
  document.querySelector("#summary-note").textContent = values.focusNote || "입력 안 함";
  document.querySelector("#summary-duration").textContent = `${values.duration}분`;
  document.querySelector("#summary-goal").textContent = goalText(values);
}

function setSubmitState(state, message) {
  isSubmitting = state === "loading";
  form.setAttribute("aria-busy", String(isSubmitting));
  saveButton.disabled = isSubmitting;
  saveButton.textContent = isSubmitting ? "저장하는 중..." : "루틴 저장하기 →";
  submitStatus.textContent = message;
  submitStatus.classList.toggle("is-success", state === "success");
  submitStatus.classList.toggle("has-error", state === "error");
}

titleInput.addEventListener("input", () => {
  if (titleInput.getAttribute("aria-invalid") === "true") {
    validateTitle();
  } else {
    updateTitleExperience();
  }
});
updateTitleExperience();

noteInput.addEventListener("input", () => {
  noteCount.textContent = `${noteInput.value.length} / 20자`;
});

function syncGoalOptions() {
  const open = goalOption.checked;
  goalOption.setAttribute("aria-expanded", String(open));
  goalOptions.hidden = !open;
  goalInputs.forEach((input) => {
    input.disabled = !open;
  });
}

goalOption.addEventListener("change", syncGoalOptions);
syncGoalOptions();

function saveCurrentPlan() {
  const plan = {
    id: typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    ...getFormValues(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  plans.unshift(plan);
  const persisted = savePlans();
  renderPlans();

  archiveStatus.textContent = persisted
    ? `‘${plan.title}’ (${categoryLabels[plan.category]}) 루틴을 저장했습니다.`
    : "루틴을 현재 화면에 저장했습니다. 브라우저 저장 공간을 사용할 수 없어 새로고침하면 사라질 수 있습니다.";
  completeMessage.textContent = `‘${plan.title}’ 루틴을 내 훈련 루틴에서 다시 열어볼 수 있습니다.`;
  return true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (currentStep === 1) {
    if (validateTitle()) showStep(2);
    return;
  }
  if (currentStep !== 3 || isSubmitting) return;

  if (!validateTitle()) {
    showStep(1);
    titleInput.focus();
    return;
  }

  setSubmitState("loading", "입력한 훈련 루틴을 저장하고 있습니다.");
  window.setTimeout(() => {
    saveCurrentPlan();
    setSubmitState("success", "루틴 저장이 완료되었습니다.");
    showStep(4);
  }, 400);
});

document.querySelector("#info-next").addEventListener("click", () => {
  if (validateTitle()) showStep(2);
});
document.querySelector("#option-prev").addEventListener("click", () => showStep(1));
document.querySelector("#option-next").addEventListener("click", () => {
  updateSummary();
  showStep(3);
});
document.querySelector("#edit-info").addEventListener("click", () => showStep(1));
document.querySelector("#edit-options").addEventListener("click", () => showStep(2));

document.querySelector("#restart-button").addEventListener("click", () => {
  form.reset();
  syncGoalOptions();
  noteCount.textContent = "0 / 20자";
  titleError.textContent = "";
  titleInput.removeAttribute("aria-invalid");
  titleField.classList.remove("is-valid", "has-error");
  updateTitleExperience();
  setSubmitState("idle", "");
  showStep(1);
  titleInput.focus();
});

function createText(tag, className, content) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = content;
  return element;
}

// 1. 현재 위치 표시 동기화 (메뉴 클릭, 새로고침, 뒤로 가기 공통)
function updateCurrentNav() {
  const currentHash = window.location.hash;

  navLinks.forEach((link) => {
    const isMatched =
      currentHash && currentHash !== "#top"
        ? link.getAttribute("href") === currentHash
        : link === navLinks[0];

    link.classList.toggle("is-current", isMatched);

    if (isMatched) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const currentLink = document.querySelector('.main-nav a[aria-current="page"]');
  const pageName = currentLink ? currentLink.textContent.trim() : "홈";
  document.title = pageName + " | HoopLab";
}

window.addEventListener("hashchange", updateCurrentNav);
updateCurrentNav();

// 2. 모바일 메뉴 열기/닫기 제어
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.textContent = isOpen ? "메뉴 닫기" : "메뉴 열기";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !mainNav.classList.contains("is-open")) return;

  mainNav.classList.remove("is-open");
  menuToggle.textContent = "메뉴 열기";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.focus();
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.textContent = "메뉴 열기";
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// 3. 목록 필터링 및 결과/빈 상태 안내
function getVisiblePlans() {
  return plans.filter((plan) => {
    if (currentFilter === "all") return true;
    if (currentFilter === "completed") return plan.completed;
    return plan.category === currentFilter;
  });
}

function renderPlans() {
  const visiblePlans = getVisiblePlans();

  planList.replaceChildren();
  emptyState.hidden = visiblePlans.length !== 0;
  planList.hidden = visiblePlans.length === 0;

  const emptyTitle = emptyState.querySelector("h3");
  const emptyDescription = emptyState.querySelector("p");
  const emptyAction = emptyState.querySelector("a");

  // 전체 목록이 없는 경우 vs 선택한 필터 조건에 맞는 결과만 없는 경우 구분
  if (visiblePlans.length === 0) {
    const hasAnyPlans = plans.length > 0;
    emptyTitle.textContent = hasAnyPlans
      ? "선택한 조건에 맞는 훈련 루틴이 없어요."
      : "아직 등록한 훈련 루틴이 없어요.";
    emptyDescription.textContent = hasAnyPlans
      ? "다른 종목이나 ‘전체’ 필터를 선택해 보세요."
      : "첫 농구 스킬 트레이닝 루틴을 만들면 이곳에서 바로 확인할 수 있습니다.";
    emptyAction.hidden = false;
    emptyAction.textContent = hasAnyPlans ? "전체 보기" : "루틴 만들러 가기";
    emptyAction.href = hasAnyPlans ? "#archive" : "#planner";
  }

  planCount.textContent = String(visiblePlans.length);
  planCount.setAttribute(
    "aria-label",
    `현재 표시 중인 훈련 루틴 ${visiblePlans.length}개`
  );

  visiblePlans.forEach((plan) => {
    const card = document.createElement("li");
    card.className = `plan-card${plan.completed ? " is-cancelled" : ""}`;

    const top = document.createElement("div");
    top.className = "plan-card-top";
    const badgeText = plan.completed
      ? `${categoryLabels[plan.category]} · 훈련 완료`
      : `${categoryLabels[plan.category]} · 진행 예정`;
    top.append(createText("span", "plan-state", badgeText));

    const date = new Date(plan.createdAt);
    if (!Number.isNaN(date.getTime())) {
      top.append(
        createText(
          "time",
          "plan-date",
          new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }).format(date)
        )
      );
    }
    card.append(top);
    card.append(createText("h3", "plan-title", plan.title));
    card.append(
      createText("p", "plan-meta", `${plan.duration}분 훈련 · ${goalText(plan)}`)
    );

    const actions = document.createElement("div");
    actions.className = "plan-actions";

    const openButton = createText("button", "button button-secondary", "루틴 상세");
    openButton.type = "button";
    openButton.dataset.action = "open";
    openButton.dataset.id = plan.id;

    const toggleButton = createText(
      "button",
      "button button-text",
      plan.completed ? "진행 예정으로 변경" : "훈련 완료 체크"
    );
    toggleButton.type = "button";
    toggleButton.dataset.action = "toggle";
    toggleButton.dataset.id = plan.id;

    actions.append(openButton, toggleButton);
    card.append(actions);
    planList.append(card);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    renderPlans();

    const count = getVisiblePlans().length;
    const filterName = button.textContent.trim();
    archiveStatus.textContent = count > 0
      ? `${filterName} 훈련 루틴 ${count}개가 표시됩니다.`
      : `${filterName} 훈련 루틴이 없습니다. 다른 조건을 선택해 보세요.`;
  });
});

emptyState.querySelector("a").addEventListener("click", (event) => {
  if (currentFilter === "all") return;
  event.preventDefault();
  const allButton = document.querySelector('[data-filter="all"]');
  allButton.click();
  allButton.focus();
});

planList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const plan = plans.find((item) => item.id === button.dataset.id);
  if (!plan) return;

  if (button.dataset.action === "open") {
    document.querySelector("#dialog-title").textContent = plan.title;
    document.querySelector("#dialog-status").textContent = plan.completed
      ? "훈련을 완료한 루틴입니다."
      : "진행 예정인 훈련 루틴입니다.";
    document.querySelector("#dialog-category").textContent = categoryLabels[plan.category];
    document.querySelector("#dialog-note").textContent = plan.focusNote || "입력 안 함";
    document.querySelector("#dialog-duration").textContent = `${plan.duration}분`;
    document.querySelector("#dialog-goal").textContent = goalText(plan);
    planDialog.showModal();
    return;
  }

  const wasCompleted = plan.completed;
  plan.completed = !wasCompleted;
  const persisted = savePlans();
  renderPlans();
  archiveStatus.textContent = persisted
    ? `‘${plan.title}’ 루틴을 ${wasCompleted ? "진행 예정 상태로 되돌렸습니다" : "훈련 완료 처리했습니다"}.`
    : "상태를 현재 화면에서 바꿨지만, 브라우저 저장 공간을 사용할 수 없어 새로고침하면 사라질 수 있습니다.";
  const nextButton = [...planList.querySelectorAll('button[data-action="toggle"]')].find(
    (item) => item.dataset.id === plan.id
  );
  const selectedFilter = document.querySelector(
    '.filter-button[aria-pressed="true"]'
  );
  (nextButton || selectedFilter)?.focus();
});

document.querySelector("#dialog-close").addEventListener("click", () => planDialog.close());
document.querySelector("#dialog-done").addEventListener("click", () => planDialog.close());

const themeButton = document.querySelector("#theme-button");
themeButton.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  themeButton.textContent = dark ? "라이트 모드" : "다크 모드";
  themeButton.setAttribute("aria-pressed", String(dark));
});

renderPlans();