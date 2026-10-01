var cleanMonth;
var cleanYear;
var cleanManagerName;
var appStore = { activeKey: null, charts: {} };

const defaultDateInfo = getDefaultMonthYear();

function buildSceneZero() {
  const chartKeys = Object.keys(appStore.charts || {});
  let savedSection = '';
  if (chartKeys.length > 0) {
    const buttonsHtml = chartKeys
      .map((key) => {
        const c = appStore.charts[key];
        const count = Array.isArray(c.members) ? c.members.length : 0;
        return `<button type="button" class="saved-chart-btn" onclick="openSavedChart('${key}')">${c.month} ${c.year} · ${c.managerName || 'Manager'} (${count} জন)</button>`;
      })
      .join('');
    savedSection = `
      <div class="saved-charts-bar">
        <div class="saved-charts-label">সেভ করা মাসের চার্ট ওপেন করুন (Saved Charts):</div>
        <div class="saved-charts-list">${buttonsHtml}</div>
      </div>
    `;
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const optionsHtml = months
    .map(
      (m) =>
        `<option value="${m}" ${m === defaultDateInfo.month ? 'selected' : ''}>${m}</option>`
    )
    .join('');

  return `
    <div>
      <img src="./assets/undraw_online_calendar_re_wk3t.svg" alt="Calendar illustration">
      <h1>মাস এবং বছর নির্বাচন করুন (Select Month & Year)</h1>
      <p class="walkthrough-subtitle">নতুন মাসের মিল চার্ট তৈরি করুন অথবা সেভ করা চার্ট দেখুন</p>

      <div class="valider-a">
        <div>
          <label for="month">Month (মাস) :</label>
          <select name="month" id="month">
            <option value="">-- Select Month --</option>
            ${optionsHtml}
          </select>
        </div>
        <div>
          <label for="year">Year (বছর) :</label>
          <input type="number" min="1900" max="2099" step="1" value="${defaultDateInfo.year}" onChange="yearVal()" id="year" name="year"/>
        </div>
      </div>

      <div class="valA">
        <button class="valider-a-butt" onclick="validateDate()">
          পরবর্তী ধাপ (Next)
        </button>
        <button class="valider-a-butt skip" onclick="window.location.href = 'chart.html'">
          সরাসরি চার্ট দেখুন (Open Chart)
        </button>
      </div>
      ${savedSection}
    </div>
  `;
}

var walkScene = [
  {
    get scene() {
      return buildSceneZero();
    }
  },
  {
    scene: `
      <div>
        <img src="./assets/undraw_fashion_blogging_re_fhi5.svg" alt="Manager illustration">
        <h1>ম্যানেজারের নাম কী? (Manager's Name)</h1>
        <p class="walkthrough-subtitle">এই মাসের মিল ম্যানেজারের নাম লিখুন</p>

        <div class="valider-a">
          <div class="inputter">
            <label for="managerInp">Manager Name :</label>
            <input type="text" name="managerInp" id="managerInp" placeholder="যেমন: Shafayat Ahmed">
          </div>
        </div>

        <button class="valider-a-butt" onclick="validateB()">
          পরবর্তী ধাপ (Next)
        </button>
      </div>
    `
  }
];

var walkBody = document.getElementById('walkthrough-body');
var walkPos = parseInt(document.getElementById('metabody').getAttribute('data-walkposition') || '0', 10);
var wtlength = 1;

function setScene() {
  walkBody.innerHTML = walkScene[walkPos].scene;
  const wts = document.getElementsByClassName('wt');
  if (wts[0]) {
    wts[0].classList.add('active');
  }
  if (walkPos === 1) {
    const inp = document.getElementById('managerInp');
    if (inp) inp.focus();
  }
}

function changeScene() {
  if (parseInt(walkPos, 10) < walkScene.length - 1) {
    walkPos = parseInt(walkPos, 10) + 1;
    document.getElementById('metabody').setAttribute('data-walkposition', walkPos);
    setScene();
  } else {
    walkBody.style.display = 'none';
    document.getElementById('Tutorial').style.display = 'block';
  }

  const wts = document.getElementsByClassName('wt');
  const wtlines = document.getElementsByClassName('wtline');
  if (wts[wtlength]) wts[wtlength].classList.add('active');
  if (wtlines[wtlength - 1]) wtlines[wtlength - 1].classList.add('active');
  wtlength = wtlength + 1;
}

function validateDate() {
  const monthEl = document.getElementById('month');
  const yearEl = document.getElementById('year');

  if (!monthEl.value) {
    const currBor = monthEl.style.border;
    monthEl.style.border = 'solid 2px #dc2626';
    setTimeout(() => {
      monthEl.style.border = currBor;
    }, 400);
    return;
  }

  if (!yearEl.value) {
    yearEl.value = new Date().getFullYear();
  }

  cleanMonth = monthEl.value;
  cleanYear = String(yearEl.value);
  changeScene();
}

function yearVal() {
  const yearEl = document.getElementById('year');
  if (!yearEl) return;
  if (yearEl.value < 1900) {
    yearEl.value = 1900;
  } else if (yearEl.value > 2099) {
    yearEl.value = 2099;
  }
}

function validateB() {
  const mgNm = document.getElementById('managerInp');
  if (!mgNm.value || !mgNm.value.trim()) {
    const currBor = mgNm.style.border;
    mgNm.style.border = 'solid 2px #dc2626';
    setTimeout(() => {
      mgNm.style.border = currBor;
    }, 400);
  } else {
    cleanManagerName = mgNm.value.trim();
    changeScene();
  }
}

async function openSavedChart(key) {
  appStore.activeKey = key;
  const chart = appStore.charts[key];
  if (chart) {
    localStorage.setItem(
      'evilID',
      JSON.stringify({
        managerName: chart.managerName,
        month: chart.month,
        year: chart.year,
        newData: true
      })
    );
  }
  await pushStoreToServer(appStore);
  window.location.href = 'chart.html';
}

async function chartCreate() {
  const key = getChartKey(cleanMonth, cleanYear);
  const existing = appStore.charts[key];

  appStore.charts[key] = {
    id: key,
    month: cleanMonth,
    year: String(cleanYear),
    managerName: cleanManagerName,
    totalExpense: existing ? existing.totalExpense : 0,
    members: existing ? existing.members : [],
    updatedAt: new Date().toISOString()
  };
  appStore.activeKey = key;

  localStorage.setItem(
    'evilID',
    JSON.stringify({
      managerName: cleanManagerName,
      month: cleanMonth,
      year: cleanYear,
      newData: true
    })
  );

  await pushStoreToServer(appStore);
  window.location.href = 'chart.html';
}

window.addEventListener('load', async () => {
  appStore = await syncStoreWithServer();
  setScene();
});
