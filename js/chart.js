var managerNamePlace = document.getElementById('managerName');
var mealRatePlace = document.getElementById('mealRate');
var manageDatePlace = document.getElementById('manageDate');
var dynamicHeader = document.getElementById('dynamicHeader');

var serialTaker = document.getElementById('serialTaker');
var nameTaker = document.getElementById('nameTaker');
var depositTaker = document.getElementById('depositTaker');
var mealTaker = document.getElementById('mealTaker');
var expenseTaker = document.getElementById('expenseTaker');
var personTotalPlace = document.getElementById('personTotal');

var mealTableBody = document.getElementById('mealTableBody');
var mealTableFoot = document.getElementById('mealTableFoot');
var validationMsg = document.getElementById('validationMsg');
var saveStatusEl = document.getElementById('saveStatus');
var chartSwitcher = document.getElementById('chartSwitcher');

var appStore = { activeKey: null, charts: {} };
var editingIndex = null;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getActiveChart() {
  if (!appStore.activeKey || !appStore.charts[appStore.activeKey]) {
    const def = getDefaultMonthYear();
    const key = getChartKey(def.month, def.year);
    appStore.activeKey = key;
    if (!appStore.charts[key]) {
      appStore.charts[key] = {
        id: key,
        month: def.month,
        year: def.year,
        managerName: 'Manager',
        totalExpense: 0,
        members: [],
        updatedAt: new Date().toISOString()
      };
    }
  }
  return appStore.charts[appStore.activeKey];
}

async function persistChanges() {
  const chart = getActiveChart();
  chart.updatedAt = new Date().toISOString();
  if (saveStatusEl) {
    saveStatusEl.textContent = 'Saving...';
  }
  await pushStoreToServer(appStore);
  if (saveStatusEl) {
    saveStatusEl.textContent = 'Auto-saved ✓';
  }
}

function renderChartSwitcher() {
  if (!chartSwitcher) return;
  const keys = Object.keys(appStore.charts || {});
  chartSwitcher.innerHTML = keys
    .map((key) => {
      const c = appStore.charts[key];
      const selected = key === appStore.activeKey ? 'selected' : '';
      return `<option value="${escapeHtml(key)}" ${selected}>${escapeHtml(c.month)} ${escapeHtml(c.year)} (${escapeHtml(c.managerName || 'Manager')})</option>`;
    })
    .join('');
}

async function switchChart(key) {
  if (!key || !appStore.charts[key]) return;
  cancelEdit();
  appStore.activeKey = key;
  const chart = appStore.charts[key];
  localStorage.setItem(
    'evilID',
    JSON.stringify({
      managerName: chart.managerName,
      month: chart.month,
      year: chart.year,
      newData: true
    })
  );
  await persistChanges();
  renderAll();
}

function renderAll() {
  const chart = getActiveChart();
  renderChartSwitcher();

  // 1. Dynamic Header & Manager Info
  const monthLabel = chart.month || 'December';
  const yearLabel = chart.year || new Date().getFullYear();
  if (dynamicHeader) {
    dynamicHeader.textContent = `Meal Management of ${monthLabel} ${yearLabel}`;
  }
  document.title = `MealMate — ${monthLabel} ${yearLabel}`;
  if (managerNamePlace) {
    managerNamePlace.textContent = chart.managerName || 'Manager';
  }
  if (manageDatePlace) {
    manageDatePlace.textContent = `${monthLabel} of ${yearLabel}`;
  }

  const members = Array.isArray(chart.members) ? chart.members : [];
  const totalExpenseVal = Number(chart.totalExpense) || 0;

  if (expenseTaker && document.activeElement !== expenseTaker) {
    expenseTaker.value = totalExpenseVal > 0 ? totalExpenseVal : '';
  }

  if (serialTaker && editingIndex === null) {
    serialTaker.value = members.length + 1;
  }

  // 2. Calculations
  let totalDepositAmt = 0;
  let totalMealAmt = 0;

  for (let i = 0; i < members.length; i++) {
    totalDepositAmt += Number(members[i].deposit) || 0;
    totalMealAmt += Number(members[i].totalMeal) || 0;
  }

  const mealRateFloat = totalMealAmt > 0 ? totalExpenseVal / totalMealAmt : 0;
  if (mealRatePlace) {
    mealRatePlace.textContent = `${mealRateFloat.toFixed(2)}/-`;
  }

  const cashInHand = totalDepositAmt - totalExpenseVal;

  // 3. Summary Cards
  const sumMembersEl = document.getElementById('sumMembers');
  const sumDepositEl = document.getElementById('sumDeposit');
  const sumMealsEl = document.getElementById('sumMeals');
  const sumExpenseEl = document.getElementById('sumExpense');
  const sumCashInHandEl = document.getElementById('sumCashInHand');
  const cashStatusTextEl = document.getElementById('cashStatusText');
  const cashCardEl = document.getElementById('cashCard');

  if (sumMembersEl) sumMembersEl.textContent = `${members.length} জন`;
  if (sumDepositEl) sumDepositEl.textContent = `${totalDepositAmt.toLocaleString()}/-`;
  if (sumMealsEl) sumMealsEl.textContent = `${totalMealAmt}`;
  if (sumExpenseEl) sumExpenseEl.textContent = `${totalExpenseVal.toLocaleString()}/-`;

  if (sumCashInHandEl && cashCardEl && cashStatusTextEl) {
    cashCardEl.classList.remove('cash-positive', 'cash-negative');
    if (cashInHand >= 0) {
      cashCardEl.classList.add('cash-positive');
      sumCashInHandEl.textContent = `+${cashInHand.toLocaleString()}/-`;
      cashStatusTextEl.textContent = 'ম্যানেজারের হাতে উদ্বৃত্ত ক্যাশ আছে';
    } else {
      cashCardEl.classList.add('cash-negative');
      sumCashInHandEl.textContent = `${cashInHand.toLocaleString()}/-`;
      cashStatusTextEl.textContent = 'জমার চেয়ে বাজার খরচ বেশি (ঘাটতি)';
    }
  }

  // 4. Render Table Body & Footer
  let rowsHtml = '';
  let sumPersonCostRounded = 0;
  let sumPersonCostExact = 0;
  let sumManagerRec = 0;
  let sumManagerGive = 0;

  if (members.length === 0) {
    rowsHtml = `
      <tr>
        <td colspan="8" class="empty-state-cell">
          এখনো কোনো মেম্বার যোগ করা হয়নি। উপরের ফর্ম থেকে মেম্বারের নাম, জমা টাকা ও মিল সংখ্যা যোগ করুন।
        </td>
      </tr>
    `;
  } else {
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const dep = Number(m.deposit) || 0;
      const ml = Number(m.totalMeal) || 0;
      const exactCost = ml * mealRateFloat;
      const roundedCost = Math.round(exactCost);

      sumPersonCostExact += exactCost;
      sumPersonCostRounded += roundedCost;

      const diff = roundedCost - dep;
      const mRec = diff > 0 ? diff : 0;
      const mGive = diff < 0 ? Math.abs(diff) : 0;

      sumManagerRec += mRec;
      sumManagerGive += mGive;

      const isEditingThisRow = editingIndex === i;

      rowsHtml += `
        <tr class="${isEditingThisRow ? 'editing-row' : ''}">
          <td class="col-sl">${i + 1}</td>
          <td class="col-name">${escapeHtml(m.name)}</td>
          <td class="col-num">${dep.toLocaleString()}/-</td>
          <td class="col-num">${ml}</td>
          <td class="col-num">${roundedCost.toLocaleString()}/-</td>
          <td class="col-num ${mRec > 0 ? 'val-receive' : 'val-settled'}">
            ${mRec > 0 ? `${mRec.toLocaleString()}/-` : '0/-'}
          </td>
          <td class="col-num ${mGive > 0 ? 'val-give' : 'val-settled'}">
            ${mGive > 0 ? `${mGive.toLocaleString()}/-` : '0/-'}
          </td>
          <td class="col-actions no-print">
            <div class="row-actions">
              <button type="button" class="btn-row-edit" onclick="editMember(${i})">এডিট</button>
              <button type="button" class="btn-row-delete" onclick="deleteMember(${i})">ডিলিট</button>
            </div>
          </td>
        </tr>
      `;
    }
  }

  if (mealTableBody) {
    mealTableBody.innerHTML = rowsHtml;
  }

  if (mealTableFoot) {
    if (members.length > 0) {
      mealTableFoot.innerHTML = `
        <tr>
          <td class="col-sl">#</td>
          <td>মোট হিসাব (Total Summary)</td>
          <td class="col-num">${totalDepositAmt.toLocaleString()}/-</td>
          <td class="col-num">${totalMealAmt}</td>
          <td class="col-num">${sumPersonCostRounded.toLocaleString()}/-</td>
          <td class="col-num val-receive">${sumManagerRec.toLocaleString()}/-</td>
          <td class="col-num val-give">${sumManagerGive.toLocaleString()}/-</td>
          <td class="col-actions no-print"></td>
        </tr>
      `;
    } else {
      mealTableFoot.innerHTML = '';
    }
  }

  if (personTotalPlace) {
    personTotalPlace.value = `${Math.round(sumPersonCostExact).toLocaleString()}/-`;
  }
}

function showValidationError(inputEl, message) {
  if (validationMsg) {
    validationMsg.textContent = message;
  }
  if (inputEl) {
    const prevBorder = inputEl.style.borderColor;
    inputEl.style.borderColor = '#dc2626';
    inputEl.focus();
    setTimeout(() => {
      inputEl.style.borderColor = prevBorder;
    }, 800);
  }
}

function clearValidationError() {
  if (validationMsg) {
    validationMsg.textContent = '';
  }
}

function validateInputs() {
  clearValidationError();

  if (!nameTaker.value || !nameTaker.value.trim()) {
    showValidationError(nameTaker, 'অনুগ্রহ করে মেম্বারের নাম লিখুন (Please enter member name)');
    return false;
  }

  if (depositTaker.value === '' || isNaN(Number(depositTaker.value))) {
    showValidationError(depositTaker, 'অনুগ্রহ করে জমা টাকার পরিমাণ লিখুন (Please enter deposit amount)');
    return false;
  }

  if (mealTaker.value === '' || isNaN(Number(mealTaker.value))) {
    showValidationError(mealTaker, 'অনুগ্রহ করে মোট মিল সংখ্যা লিখুন (Please enter total meals)');
    return false;
  }

  if (expenseTaker.value === '' || isNaN(Number(expenseTaker.value))) {
    showValidationError(expenseTaker, 'অনুগ্রহ করে মাসের মোট বাজার খরচ লিখুন (Please enter total monthly expense)');
    return false;
  }

  return true;
}

async function handleExpenseChange() {
  const chart = getActiveChart();
  const val = parseFloat(expenseTaker.value);
  chart.totalExpense = !isNaN(val) && val >= 0 ? val : 0;
  renderAll();
  await persistChanges();
}

async function putData() {
  if (!validateInputs()) return;

  const chart = getActiveChart();
  const expenseVal = parseFloat(expenseTaker.value);
  if (!isNaN(expenseVal) && expenseVal >= 0) {
    chart.totalExpense = expenseVal;
  }

  const memberPayload = {
    name: nameTaker.value.trim(),
    deposit: parseFloat(depositTaker.value) || 0,
    totalMeal: parseFloat(mealTaker.value) || 0
  };

  if (editingIndex !== null && chart.members[editingIndex]) {
    chart.members[editingIndex] = memberPayload;
    cancelEdit(false);
  } else {
    chart.members.push(memberPayload);
  }

  nameTaker.value = '';
  depositTaker.value = '';
  mealTaker.value = '';

  renderAll();
  await persistChanges();
  nameTaker.focus();
}

function editMember(index) {
  const chart = getActiveChart();
  const member = chart.members[index];
  if (!member) return;

  editingIndex = index;
  serialTaker.value = index + 1;
  nameTaker.value = member.name;
  depositTaker.value = member.deposit;
  mealTaker.value = member.totalMeal;

  const adderBtn = document.getElementById('adder');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const formTitle = document.getElementById('formModeTitle');
  const creatorSection = document.querySelector('.creator-section');

  if (adderBtn) adderBtn.textContent = '✓ আপডেট সেভ করুন (Update)';
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
  if (formTitle) formTitle.textContent = `মেম্বার এডিট করছেন: ${member.name} (ক্রমিক #${index + 1})`;
  if (creatorSection) creatorSection.classList.add('edit-active');

  clearValidationError();
  renderAll();
  nameTaker.focus();
}

function cancelEdit(shouldRender = true) {
  editingIndex = null;
  nameTaker.value = '';
  depositTaker.value = '';
  mealTaker.value = '';

  const adderBtn = document.getElementById('adder');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const formTitle = document.getElementById('formModeTitle');
  const creatorSection = document.querySelector('.creator-section');

  if (adderBtn) adderBtn.textContent = '+ মেম্বার যোগ করুন (Add)';
  if (cancelBtn) cancelBtn.style.display = 'none';
  if (formTitle) formTitle.textContent = 'নতুন মেম্বার ও বাজার খরচ যোগ করুন (Add / Update Entry)';
  if (creatorSection) creatorSection.classList.remove('edit-active');

  clearValidationError();
  if (shouldRender) {
    renderAll();
  }
}

async function deleteMember(index) {
  const chart = getActiveChart();
  if (!chart.members[index]) return;

  if (editingIndex === index) {
    cancelEdit(false);
  } else if (editingIndex !== null && index < editingIndex) {
    editingIndex -= 1;
  }

  chart.members.splice(index, 1);
  renderAll();
  await persistChanges();
}

function toggleManagerEdit() {
  const box = document.getElementById('managerEditBox');
  if (!box) return;
  const chart = getActiveChart();
  if (box.style.display === 'none' || !box.style.display) {
    document.getElementById('editManagerInput').value = chart.managerName || '';
    document.getElementById('editMonthSelect').value = chart.month || 'December';
    document.getElementById('editYearInput').value = chart.year || new Date().getFullYear();
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}

async function saveManagerDetails() {
  const newManager = document.getElementById('editManagerInput').value.trim() || 'Manager';
  const newMonth = document.getElementById('editMonthSelect').value || 'December';
  const newYear = String(document.getElementById('editYearInput').value || new Date().getFullYear());

  const oldKey = appStore.activeKey;
  const chart = getActiveChart();
  const newKey = getChartKey(newMonth, newYear);

  chart.managerName = newManager;
  chart.month = newMonth;
  chart.year = newYear;
  chart.id = newKey;

  if (newKey !== oldKey) {
    appStore.charts[newKey] = chart;
    delete appStore.charts[oldKey];
    appStore.activeKey = newKey;
  }

  localStorage.setItem(
    'evilID',
    JSON.stringify({
      managerName: newManager,
      month: newMonth,
      year: newYear,
      newData: true
    })
  );

  document.getElementById('managerEditBox').style.display = 'none';
  renderAll();
  await persistChanges();
}

async function printPDF() {
  const chart = getActiveChart();
  const element = document.getElementById('printableArea') || document.body;
  const filename = `MealMate_${chart.month}_${chart.year}.pdf`;

  if (typeof hydrateMealMateLogos === 'function') {
    await hydrateMealMateLogos();
  }

  const prevScrollY = window.scrollY;
  window.scrollTo(0, 0);
  document.body.classList.add('pdf-export-mode');

  // Allow layout reflow into the 1080px desktop PDF container
  await new Promise((r) => setTimeout(r, 120));

  const contentWidth = element.offsetWidth || 1040;
  const contentHeight = element.offsetHeight || 600;

  // Calculate single-page dimensions in points (pt) so content NEVER splits across 2 pages
  const pdfWidthPt = 842; // Standard A4 Landscape width in pt
  const marginPt = 16;
  const usableWidthPt = pdfWidthPt - marginPt * 2;
  const requiredHeightPt = Math.ceil((contentHeight / contentWidth) * usableWidthPt) + marginPt * 2 + 24;
  const pdfHeightPt = Math.max(595, requiredHeightPt);

  const options = {
    margin: marginPt,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1080,
      width: contentWidth,
      height: contentHeight
    },
    jsPDF: {
      unit: 'pt',
      format: [pdfWidthPt, pdfHeightPt],
      orientation: pdfWidthPt >= pdfHeightPt ? 'landscape' : 'portrait'
    }
  };

  try {
    await html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        while (pdf.internal.getNumberOfPages() > 1) {
          pdf.deletePage(pdf.internal.getNumberOfPages());
        }
      })
      .save();
  } finally {
    document.body.classList.remove('pdf-export-mode');
    window.scrollTo(0, prevScrollY);
  }
}

window.addEventListener('keydown', function (event) {
  if (
    event.key === 'Enter' &&
    (document.activeElement === nameTaker ||
      document.activeElement === depositTaker ||
      document.activeElement === mealTaker)
  ) {
    event.preventDefault();
    putData();
  }
});

window.addEventListener('load', async () => {
  appStore = await syncStoreWithServer();

  // Check if user just came from walkthrough with evilID
  try {
    const legacyRaw = localStorage.getItem('evilID');
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy && legacy.month && legacy.year) {
        const key = getChartKey(legacy.month, legacy.year);
        if (!appStore.charts[key]) {
          appStore.charts[key] = {
            id: key,
            month: legacy.month,
            year: String(legacy.year),
            managerName: legacy.managerName || 'Manager',
            totalExpense: 0,
            members: [],
            updatedAt: new Date().toISOString()
          };
        } else if (legacy.managerName) {
          appStore.charts[key].managerName = legacy.managerName;
        }
        appStore.activeKey = key;
        await pushStoreToServer(appStore);
      }
    }
  } catch (e) {
    // Ignore parse error
  }

  renderAll();
});
