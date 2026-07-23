const API_URL =
  "https://script.google.com/macros/s/AKfycbydrBidRu8BNrPGd2JKC6KSIT7pTXrNVleWJf70giDrtrFs7G1iwh7cvn9gn6bNdPRw8g/exec";

const HQ_API_URL =
  "https://script.google.com/macros/s/AKfycby1RoQvXt51KjoasIG-_MmD7SiMau10eRWAYiq4Vk1k2s9yRVsuEBrBVEFvmW7aX765/exec";

const STORE_NAME = "효종갱 파주점";
const BRAND_NAME = "효종갱";

document.addEventListener("DOMContentLoaded", function() {
  setDefaultDates();
  loadDashboard();
  loadRecentLogs();
});

function showTab(id, button) {
  document.querySelectorAll(".panel").forEach(function(panel) {
    panel.classList.remove("active");
  });

  document.querySelectorAll(".tab").forEach(function(tab) {
    tab.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
  button.classList.add("active");

  if (id === "history") {
    loadRecentLogs();
  }
}

function checkApi() {
  if (!API_URL || API_URL.includes("입력")) {
    alert("효종갱 파주점 일일보고 API 주소를 확인하세요.");
    return false;
  }

  return true;
}

async function api(params) {
  if (!checkApi()) {
    throw new Error("API URL 미설정");
  }

  const query = new URLSearchParams(params);
  const response = await fetch(API_URL + "?" + query.toString());
  return await response.json();
}

function val(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function setDefaultDates() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateText = year + "-" + month + "-" + day;

  [
    "dailyDate",
    "employeeDate",
    "customerDate",
    "facilityDate",
    "hygieneDate",
    "complaintDate"
  ].forEach(function(id) {
    const element = document.getElementById(id);

    if (element && !element.value) {
      element.value = dateText;
    }
  });
}

async function saveLog(payload) {
  try {
    const data = await api({
      action: "saveStoreDailyLog",
      ...payload
    });

    if (!data || data.success === false) {
      alert(data && data.message ? data.message : "저장에 실패했습니다.");
      return;
    }

    try {
      if (HQ_API_URL && !HQ_API_URL.includes("입력")) {
        await fetch(HQ_API_URL, {
          method: "POST",
          body: JSON.stringify({
            storeName: STORE_NAME,
            brand: BRAND_NAME,
            writer: payload.writer || "",
            category: payload.type || payload.category || "",
            priority: payload.urgency || "일반",
            content:
              "[점포] " + STORE_NAME + "\n" +
              "[구분] " + (payload.category || "") + "\n" +
              "[제목] " + (payload.title || "") + "\n" +
              "[내용] " + (payload.content || "") + "\n" +
              "[요청/전달] " + (payload.request || "") + "\n" +
              "[추가사항] " + (payload.extra || ""),
            photo: ""
          })
        });
      }
    } catch (error) {
      console.log("본사 통합원장 저장 실패", error);
    }

    alert(data.message || "저장되었습니다.");
    loadDashboard();
    loadRecentLogs();
  } catch (error) {
    console.error(error);
    alert("저장 중 오류가 발생했습니다.");
  }
}

function saveDailyReport() {
  saveLog({
    type: "일일보고",
    store: STORE_NAME,
    date: val("dailyDate"),
    writer: val("dailyWriter"),
    urgency: val("dailyUrgency"),
    title: "일일 운영보고",
    category: "일일보고",
    content: val("dailyIssue"),
    request: val("dailyRequest"),
    extra: val("dailyTomorrow"),
    status: "본사미확인"
  });
}

function saveEmployeeLog() {
  saveLog({
    type: "직원관리",
    store: STORE_NAME,
    date: val("employeeDate"),
    writer: val("employeeName"),
    urgency: val("employeeUrgency"),
    title: val("employeeType"),
    category: val("employeeType"),
    content: val("employeeMemo"),
    request: "",
    extra: "",
    status: val("employeeStatus")
  });
}

function saveCustomerLog() {
  saveLog({
    type: "고객관리",
    store: STORE_NAME,
    date: val("customerDate"),
    writer: val("customerName"),
    urgency: val("customerUrgency"),
    title: val("customerType"),
    category: val("customerType"),
    content: val("customerMemo"),
    request: val("customerTime"),
    extra: "",
    status: "본사미확인"
  });
}

function saveFacilityLog() {
  saveLog({
    type: "설비관리",
    store: STORE_NAME,
    date: val("facilityDate"),
    writer: val("facilityCompany"),
    urgency: val("facilityUrgency"),
    title: val("facilityType"),
    category: val("facilityStatus"),
    content: val("facilityMemo"),
    request: "",
    extra: "",
    status: "본사미확인"
  });
}

function saveHygieneLog() {
  saveLog({
    type: "위생점검",
    store: STORE_NAME,
    date: val("hygieneDate"),
    writer: val("hygieneChecker"),
    urgency: val("hygieneUrgency"),
    title: val("hygieneType"),
    category: val("hygieneResult"),
    content: val("hygieneMemo"),
    request: "",
    extra: "",
    status: "본사미확인"
  });
}

function saveComplaintLog() {
  saveLog({
    type: "컴플레인",
    store: STORE_NAME,
    date: val("complaintDate"),
    writer: val("complaintCustomer"),
    urgency: val("complaintUrgency"),
    title: val("complaintType"),
    category: val("complaintStatus"),
    content: val("complaintMemo"),
    request: "",
    extra: "",
    status: val("complaintStatus")
  });
}

async function loadDashboard() {
  try {
    const data = await api({
      action: "getStoreManagerDashboard",
      store: STORE_NAME
    });

    document.getElementById("todayCount").textContent = data.todayCount || 0;
    document.getElementById("urgentCount").textContent = data.urgentCount || 0;
    document.getElementById("pendingCount").textContent = data.pendingCount || 0;
  } catch (error) {
    console.log(error);
  }
}

async function loadRecentLogs() {
  try {
    const data = await api({
      action: "getStoreManagerLogs",
      store: STORE_NAME,
      type: val("historyType")
    });

    const logs = data.logs || [];
    const box = document.getElementById("recentList");

    if (!logs.length) {
      box.innerHTML = "<div class='log-card'>등록된 내역이 없습니다.</div>";
      return;
    }

    box.innerHTML = logs.map(function(log) {
      const badgeClass =
        log.urgency === "긴급"
          ? "urgent"
          : log.urgency === "중요"
            ? "important"
            : "normal";

      return `
        <div class="log-card">
          <div class="log-title">
            ${escapeHtml(log.date || "")} /
            ${escapeHtml(log.store || "")} /
            ${escapeHtml(log.type || "")}
          </div>

          <div class="log-meta">
            구분 : ${escapeHtml(log.category || "-")}<br>
            제목 : ${escapeHtml(log.title || "-")}<br>
            작성/대상 : ${escapeHtml(log.writer || "-")}<br>
            내용 : ${escapeHtml(log.content || "-")}<br>
            상태 : ${escapeHtml(log.status || "-")}
          </div>

          <span class="badge ${badgeClass}">
            ${escapeHtml(log.urgency || "일반")}
          </span>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.log(error);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
