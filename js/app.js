/**
 * app.js - Controller chính quản lý tương tác giao diện, biểu đồ, tính toán và xuất PDF
 */

import { PROVINCES_DATA, TARIFF_RATES, ROOF_TYPES, PANEL_CATALOG, INVERTER_CATALOG } from './data.js';
import { SolarCalculator } from './calculator.js';

let monthlyChart = null;
let cashflowChart = null;
let currentCalculationResult = null;
let currentCalculationParams = null;
const SAVED_PROJECTS_KEY = "CAS_ENERGY_SAVED_PROJECTS_V1";

// Roof sections state
let roofSections = [
  { id: 1, direction: "Nam", area: "" }
];

document.addEventListener("DOMContentLoaded", () => {
  initUIComponents();
  setupEventListeners();
  initSavedProjects();
  clearAllInputs();
});

/**
 * Khởi tạo dữ liệu các dropdown và component
 */
function initUIComponents() {
  // 1. Khởi tạo dropdown Tỉnh / Thành phố
  const selectProvince = document.getElementById("select-province");
  selectProvince.innerHTML = `<option value="" disabled selected>-- Chọn Tỉnh / Thành phố --</option>` +
    PROVINCES_DATA.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  const selectWard = document.getElementById("select-ward");
  selectWard.innerHTML = `<option value="" disabled selected>-- Chọn Xã / Phường --</option>`;

  // 2. Render danh sách mặt mái
  roofSections = [{ id: 1, direction: "Nam", area: "" }];
  renderRoofSections();

  // 3. Khởi tạo ngày báo cáo hiện tại
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const pdfDateElem = document.getElementById("pdf-date");
  if (pdfDateElem) pdfDateElem.textContent = dateStr;
}

/**
 * Cập nhật danh sách Xã / Phường theo Tỉnh được chọn (Hỗ trợ đầy đủ 63 tỉnh thành)
 */
function updateWardsDropdown(provinceId, defaultWardName = null) {
  const selectWard = document.getElementById("select-ward");
  const province = PROVINCES_DATA.find(p => p.id === provinceId);
  if (!province) {
    selectWard.innerHTML = `<option value="" disabled selected>-- Chọn Xã / Phường --</option>`;
    updateRadiationDisplay();
    return;
  }

  if (province.wards && province.wards.length > 0) {
    selectWard.innerHTML = (defaultWardName ? '' : `<option value="" disabled selected>-- Chọn Xã / Phường --</option>`) +
      province.wards.map((w, idx) => {
        const isSelected = defaultWardName ? (w.name === defaultWardName) : false;
        return `<option value="${w.name}" data-rad="${w.radiation}" ${isSelected ? 'selected' : ''}>${w.name}</option>`;
      }).join('');
  } else {
    selectWard.innerHTML = `<option value="${province.name}" data-rad="${province.defaultRadiation}" selected>${province.name}</option>`;
  }

  updateRadiationDisplay();
}

/**
 * Hiển thị số bức xạ thực tế của xã/phường
 */
function updateRadiationDisplay() {
  const selectWard = document.getElementById("select-ward");
  const selectedOption = selectWard.options[selectWard.selectedIndex];
  const rad = selectedOption && selectedOption.value ? selectedOption.getAttribute('data-rad') : null;
  
  const displayRad = document.getElementById("display-radiation-val");
  const radTag = document.getElementById("radiation-source-tag");
  if (displayRad) {
    if (rad) {
      displayRad.textContent = `${rad} kWh/m²/ngày`;
      if (radTag) radTag.textContent = "(số riêng cho xã bạn)";
    } else {
      displayRad.textContent = `-- kWh/m²/ngày`;
      if (radTag) radTag.textContent = "(chưa chọn địa phương)";
    }
  }
}

/**
 * Render danh sách các mặt mái (hỗ trợ nhiều mặt mái)
 */
function renderRoofSections() {
  const container = document.getElementById("roof-items-container");
  if (!container) return;

  const directions = ["Nam", "Bắc", "Đông", "Tây", "Đông Nam", "Tây Nam", "Đông Bắc", "Tây Bắc"];

  container.innerHTML = roofSections.map((roof, index) => `
    <div class="roof-row" data-id="${roof.id}">
      <div>
        <label style="font-size: 11.5px; color: #9ca3af; margin-bottom: 3px; display: block;">Mặt ${index + 1} — quay về hướng</label>
        <select class="form-select roof-direction" data-id="${roof.id}">
          ${directions.map(dir => `<option value="${dir}" ${dir === roof.direction ? 'selected' : ''}>${dir}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size: 11.5px; color: #9ca3af; margin-bottom: 3px; display: block;">Diện tích (m²) — không bắt buộc</label>
        <input type="number" class="form-control roof-area" data-id="${roof.id}" placeholder="ví dụ 30" value="${roof.area || ''}">
      </div>
      <div style="padding-top: 18px;">
        ${roofSections.length > 1 ? `
          <button type="button" class="btn-remove-roof" data-id="${roof.id}" title="Xoá mặt mái này">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ` : `<div style="width: 38px;"></div>`}
      </div>
    </div>
  `).join('');

  // Gán sự kiện cho các input trong roof
  container.querySelectorAll('.roof-direction').forEach(elem => {
    elem.addEventListener('change', (e) => {
      const id = Number(e.target.dataset.id);
      const target = roofSections.find(r => r.id === id);
      if (target) target.direction = e.target.value;
    });
  });

  container.querySelectorAll('.roof-area').forEach(elem => {
    elem.addEventListener('input', (e) => {
      const id = Number(e.target.dataset.id);
      const target = roofSections.find(r => r.id === id);
      if (target) target.area = Number(e.target.value) || 0;
    });
  });

  container.querySelectorAll('.btn-remove-roof').forEach(elem => {
    elem.addEventListener('click', (e) => {
      const id = Number(elem.dataset.id);
      if (roofSections.length > 1) {
        roofSections = roofSections.filter(r => r.id !== id);
        renderRoofSections();
      }
    });
  });
}

/**
 * Thiết lập các sự kiện lắng nghe tương tác
 */
function setupEventListeners() {
  // Thay đổi Tỉnh/Thành
  document.getElementById("select-province").addEventListener("change", (e) => {
    updateWardsDropdown(e.target.value);
  });

  // Thay đổi Xã/Phường
  document.getElementById("select-ward").addEventListener("change", () => {
    updateRadiationDisplay();
  });

  // Chuyển đổi Pill nguồn điện (1 pha vs 3 pha)
  setupPillGroup("phase-group", "input-phase");

  // Chuyển đổi Pill biểu giá điện
  setupPillGroup("tariff-group", "input-tariff", (val) => {
    const indicator = document.getElementById("tariff-indicator");
    if (val === 'residential') {
      indicator.textContent = "Hộ gia đình dùng điện sinh hoạt theo 6 bậc thang lũy tiến";
    } else if (val === 'commercial') {
      indicator.textContent = "Cửa hàng, showroom, văn phòng, khách sạn kinh doanh dịch vụ";
    } else if (val === 'industrial') {
      indicator.textContent = "Cơ sở sản xuất, nhà máy, xưởng chế biến dùng điện theo biểu giờ";
    } else {
      indicator.textContent = "Biểu giá điện cơ sở một giá cố định";
    }
  });

  // Chuyển đổi Pill loại hệ (Hoà lưới vs Hybrid)
  setupPillGroup("system-type-group", "input-system-type", (val) => {
    const hybridBox = document.getElementById("hybrid-battery-config");
    if (hybridBox) {
      hybridBox.style.display = (val === 'hybrid') ? 'block' : 'none';
    }
  });

  // Chuyển đổi cấp điện áp pin lưu trữ (LV vs HV)
  setupPillGroup("battery-voltage-group", "input-battery-voltage");

  // Quy đổi giữa Tiền điện và Số điện (kWh) - Hỗ trợ realtime gõ phím
  const inputBill = document.getElementById("input-bill");
  const inputKwh = document.getElementById("input-kwh");

  inputBill.addEventListener("input", (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal) {
      e.target.value = formatNumber(rawVal);
      const tariff = document.getElementById("input-tariff").value;
      const kwh = SolarCalculator.estimateKwhFromBill(Number(rawVal), tariff);
      inputKwh.value = kwh > 0 ? kwh : '';
    } else {
      inputKwh.value = '';
    }
  });

  inputKwh.addEventListener("input", (e) => {
    const kwh = Number(e.target.value);
    if (kwh > 0) {
      const tariff = document.getElementById("input-tariff").value;
      const bill = SolarCalculator.estimateBillFromKwh(kwh, tariff);
      inputBill.value = formatNumber(bill);
    } else if (!e.target.value) {
      inputBill.value = '';
    }
  });

  // Cập nhật tỷ lệ dùng ban ngày
  const inputDaytime = document.getElementById("input-daytime-ratio");
  const badgeDaytime = document.getElementById("daytime-pct-badge");
  inputDaytime.addEventListener("input", (e) => {
    badgeDaytime.textContent = `${e.target.value}%`;
  });

  // Thêm mặt mái
  document.getElementById("btn-add-roof").addEventListener("click", () => {
    const newId = roofSections.length > 0 ? Math.max(...roofSections.map(r => r.id)) + 1 : 1;
    roofSections.push({ id: newId, direction: "Nam", area: 25 });
    renderRoofSections();
  });

  // Thêm sự kiện bỏ chọn preset khi người dùng thay đổi dữ liệu
  const deactivatePresets = () => {
    document.querySelectorAll(".header-actions .preset-badge").forEach(b => b.classList.remove("active"));
  };
  document.getElementById("input-bill")?.addEventListener("input", deactivatePresets);
  document.getElementById("input-kwh")?.addEventListener("input", deactivatePresets);
  document.getElementById("select-province")?.addEventListener("change", deactivatePresets);
  document.getElementById("select-roof-type")?.addEventListener("change", deactivatePresets);

  // Nút tính toán
  document.getElementById("btn-calculate").addEventListener("click", () => {
    performCalculation(false);
  });

  // Bấm vào logo CAS Energy để tạo báo cáo mới cho dự án mới
  document.getElementById("btn-brand-home")?.addEventListener("click", startNewProjectReport);
  document.getElementById("btn-brand-home")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startNewProjectReport();
    }
  });

  // Nút xóa trống dữ liệu để nhập lại từ đầu
  document.getElementById("btn-reset-form")?.addEventListener("click", () => {
    clearAllInputs();
    showToast("Đã xóa trống dữ liệu để bạn test lại từ đầu!");
  });

  // Chuyển tab giao diện
  document.querySelectorAll(".view-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;
      document.querySelectorAll(".view-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(`tab-${targetTab}`).classList.add("active");

      if (targetTab === 'dashboard' && monthlyChart) {
        monthlyChart.resize();
        cashflowChart.resize();
      }
    });
  });

  // Nút xem trong tab PDF từ dashboard
  document.getElementById("btn-view-pdf-tab")?.addEventListener("click", () => {
    const pdfTabBtn = document.querySelector('.view-tab[data-tab="pdf-preview"]');
    if (pdfTabBtn) pdfTabBtn.click();
  });

  // Nút in báo cáo
  document.getElementById("btn-print-report")?.addEventListener("click", () => {
    window.print();
  });
  document.getElementById("btn-print-preview")?.addEventListener("click", () => {
    window.print();
  });

  // Nút xuất PDF
  document.getElementById("btn-export-pdf")?.addEventListener("click", exportToPdf);
  document.getElementById("btn-download-pdf-preview")?.addEventListener("click", exportToPdf);

  // Nút xuất Excel (.CSV)
  document.getElementById("btn-export-excel")?.addEventListener("click", exportToExcel);
  document.getElementById("btn-export-excel-preview")?.addEventListener("click", exportToExcel);

  // Nút sao chép tóm tắt báo giá gửi Zalo
  document.getElementById("btn-copy-quote")?.addEventListener("click", copyQuoteToClipboard);

  // Quản lý lưu trữ dự án
  document.getElementById("btn-save-project-header")?.addEventListener("click", saveCurrentProjectModal);
  document.getElementById("btn-save-project-dash")?.addEventListener("click", saveCurrentProjectModal);
  document.getElementById("btn-save-from-list")?.addEventListener("click", saveCurrentProjectModal);

  document.getElementById("btn-goto-saved-dash")?.addEventListener("click", () => {
    const tabBtn = document.getElementById("tab-btn-saved");
    if (tabBtn) tabBtn.click();
  });

  document.getElementById("btn-close-save-modal")?.addEventListener("click", closeSaveModal);
  document.getElementById("btn-cancel-save")?.addEventListener("click", closeSaveModal);
  document.getElementById("btn-confirm-save")?.addEventListener("click", confirmSaveProject);

  document.getElementById("saved-search-input")?.addEventListener("input", (e) => {
    renderSavedProjectsList(e.target.value);
  });

  document.getElementById("btn-export-backup")?.addEventListener("click", exportSavedProjectsJson);
  document.getElementById("btn-import-backup-trigger")?.addEventListener("click", () => {
    document.getElementById("input-backup-file")?.click();
  });
  document.getElementById("input-backup-file")?.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      importSavedProjectsJson(e.target.files[0]);
      e.target.value = "";
    }
  });

  document.getElementById("modal-save-project")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-save-project") {
      closeSaveModal();
    }
  });

  // Tùy chỉnh bức xạ mặt trời
  setupCustomRadiationControls();

  // Điều khiển Zoom PDF Preview
  setupZoomControls();
}

/**
 * Cấu hình hành vi nhóm nút Pill
 */
function setupPillGroup(groupId, hiddenInputId, onSelectCallback = null) {
  const container = document.getElementById(groupId);
  if (!container) return;

  const hiddenInput = document.getElementById(hiddenInputId);
  const options = container.querySelectorAll(".pill-option");

  options.forEach(opt => {
    opt.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      const val = opt.dataset.value;
      if (hiddenInput) hiddenInput.value = val;
      if (onSelectCallback) onSelectCallback(val);
    });
  });
}

/**
 * Nạp Mẫu: Hoà lưới (Xã Nam Phước · Đà Nẵng, 5.08 kWp, 3 pha sản xuất)
 */
function loadPresetGridTieSample() {
  document.querySelectorAll(".header-actions .preset-badge").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-load-sample-1")?.classList.add("active");

  const selectProv = document.getElementById("select-province");
  selectProv.value = "danang";
  updateWardsDropdown("danang", "Xã Nam Phước");

  setPillActive("phase-group", "input-phase", "3");
  setPillActive("tariff-group", "input-tariff", "industrial");
  document.getElementById("tariff-indicator").textContent = "Cơ sở sản xuất, nhà máy dùng điện 3 pha theo biểu giờ";

  document.getElementById("input-bill").value = "5.000.000";
  document.getElementById("input-kwh").value = "2150";
  document.getElementById("input-daytime-ratio").value = "35";
  document.getElementById("daytime-pct-badge").textContent = "35%";

  setPillActive("system-type-group", "input-system-type", "grid_tie");
  const hybridBox = document.getElementById("hybrid-battery-config");
  if (hybridBox) hybridBox.style.display = "none";

  document.getElementById("select-roof-type").value = "metal";
  roofSections = [{ id: 1, direction: "Bắc", area: 30 }];
  renderRoofSections();

  document.getElementById("select-panel-brand").value = "Canadian";
  document.getElementById("select-panel-power").value = "635";
  document.getElementById("select-inverter-brand").value = "HUAWEI";

  performCalculation(true, 'grid_tie_sample');
}

/**
 * Nạp Mẫu: Hybrid (Phường Ngũ Hành Sơn · Đà Nẵng, 6.99 kWp, 1 pha sinh hoạt)
 */
function loadPresetHybridSample() {
  document.querySelectorAll(".header-actions .preset-badge").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-load-sample-2")?.classList.add("active");

  const selectProv = document.getElementById("select-province");
  selectProv.value = "danang";
  updateWardsDropdown("danang", "Phường Ngũ Hành Sơn");

  setPillActive("phase-group", "input-phase", "1");
  setPillActive("tariff-group", "input-tariff", "residential");
  document.getElementById("tariff-indicator").textContent = "Hộ gia đình dùng điện sinh hoạt theo 6 bậc thang lũy tiến";

  document.getElementById("input-bill").value = "4.500.000";
  document.getElementById("input-kwh").value = "1350";
  document.getElementById("input-daytime-ratio").value = "35";
  document.getElementById("daytime-pct-badge").textContent = "35%";

  setPillActive("system-type-group", "input-system-type", "hybrid");
  const hybridBox = document.getElementById("hybrid-battery-config");
  if (hybridBox) hybridBox.style.display = "block";

  document.getElementById("input-battery-kwh").value = "16";
  setPillActive("battery-voltage-group", "input-battery-voltage", "LV");

  document.getElementById("select-roof-type").value = "concrete_steel";
  roofSections = [{ id: 1, direction: "Nam", area: 30 }];
  renderRoofSections();

  document.getElementById("select-panel-brand").value = "Canadian";
  document.getElementById("select-panel-power").value = "635";
  document.getElementById("select-inverter-brand").value = "SOLIS";

  performCalculation(true, 'hybrid_sample');
}

function setPillActive(groupId, hiddenInputId, val) {
  const container = document.getElementById(groupId);
  if (!container) return;
  const options = container.querySelectorAll(".pill-option");
  options.forEach(opt => {
    if (opt.dataset.value === val) {
      opt.classList.add("active");
    } else {
      opt.classList.remove("active");
    }
  });
  const hidden = document.getElementById(hiddenInputId);
  if (hidden) hidden.value = val;
}

/**
 * Mở trang báo cáo mới khi người dùng bấm vào Logo CAS Energy
 */
function startNewProjectReport() {
  clearAllInputs();
  resetMetricsDisplay();

  // Chuyển về tab dashboard
  const dashTabBtn = document.querySelector('.view-tab[data-tab="dashboard"]');
  if (dashTabBtn) dashTabBtn.click();

  // Cuộn mượt lên đầu trang
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Focus vào trường Tỉnh / Thành phố để bắt đầu điền dự án mới
  setTimeout(() => {
    const provSelect = document.getElementById("select-province");
    if (provSelect) provSelect.focus();
  }, 150);

  showToast("🌱 Đã mở trang báo cáo mới! Hãy nhập thông tin dự án mới.");
}

/**
 * Xóa toàn bộ dữ liệu trên form và đưa về trạng thái trống để test
 */
function clearAllInputs() {
  // Bỏ active nút mẫu
  document.querySelectorAll(".header-actions .preset-badge").forEach(b => b.classList.remove("active"));

  // Đặt lại Tỉnh / Xã
  const selectProvince = document.getElementById("select-province");
  if (selectProvince) selectProvince.value = "";
  const selectWard = document.getElementById("select-ward");
  if (selectWard) selectWard.innerHTML = `<option value="" disabled selected>-- Chọn Xã / Phường --</option>`;
  updateRadiationDisplay();

  // Bỏ chọn các nhóm Pill
  clearPillGroup("phase-group", "input-phase");
  clearPillGroup("tariff-group", "input-tariff");
  const tariffIndicator = document.getElementById("tariff-indicator");
  if (tariffIndicator) tariffIndicator.textContent = "Chọn biểu giá điện bạn đang sử dụng";

  clearPillGroup("system-type-group", "input-system-type");
  const hybridBox = document.getElementById("hybrid-battery-config");
  if (hybridBox) hybridBox.style.display = "none";

  clearPillGroup("battery-voltage-group", "input-battery-voltage");

  // Xóa các ô input số và text
  const inputBill = document.getElementById("input-bill");
  if (inputBill) inputBill.value = "";
  const inputKwh = document.getElementById("input-kwh");
  if (inputKwh) inputKwh.value = "";
  const inputDaytime = document.getElementById("input-daytime-ratio");
  if (inputDaytime) inputDaytime.value = "";
  const badgeDaytime = document.getElementById("daytime-pct-badge");
  if (badgeDaytime) badgeDaytime.textContent = "--%";

  const inputBatteryKwh = document.getElementById("input-battery-kwh");
  if (inputBatteryKwh) inputBatteryKwh.value = "";

  const customRadInput = document.getElementById("input-custom-radiation");
  if (customRadInput) customRadInput.value = "";
  const customPanelCountInput = document.getElementById("input-custom-panel-count");
  if (customPanelCountInput) customPanelCountInput.value = "";

  const selectRoofType = document.getElementById("select-roof-type");
  if (selectRoofType) selectRoofType.value = "";

  // Reset mái
  roofSections = [{ id: 1, direction: "Nam", area: "" }];
  renderRoofSections();

  currentCalculationResult = null;
  resetMetricsDisplay();
}

function clearPillGroup(groupId, hiddenInputId) {
  const container = document.getElementById(groupId);
  if (container) {
    container.querySelectorAll(".pill-option").forEach(o => o.classList.remove("active"));
  }
  const hidden = document.getElementById(hiddenInputId);
  if (hidden) hidden.value = "";
}

function resetMetricsDisplay() {
  document.getElementById("val-power").innerHTML = `-- <span class="metric-unit">kWp</span>`;
  document.getElementById("val-panel-count").innerHTML = `-- <span class="metric-unit">tấm</span>`;
  document.getElementById("val-panel-desc").textContent = `Vui lòng nhập thông tin để tính`;
  document.getElementById("val-inverter").innerHTML = `-- <span class="metric-unit">kW AC</span>`;
  document.getElementById("val-phase-desc").textContent = `Chưa tính toán`;
  document.getElementById("val-monthly-yield").innerHTML = `-- <span class="metric-unit">kWh/tháng</span>`;
  document.getElementById("val-annual-yield").textContent = `-- kWh/năm`;
  document.getElementById("val-total-cost").innerHTML = `-- <span class="metric-unit">đ</span>`;
  document.getElementById("val-year1-savings").innerHTML = `-- <span class="metric-unit">đ</span>`;
  document.getElementById("val-payback").innerHTML = `-- <span class="metric-unit">năm</span>`;
  document.getElementById("chart-payback-label").textContent = `-- năm`;
  document.getElementById("val-net-profit").innerHTML = `-- <span class="metric-unit">đ</span>`;
  document.getElementById("val-cum-25").textContent = `Lũy kế 25 năm: -- đ`;

  const tableBody = document.querySelector("#dashboard-cashflow-table tbody");
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">Vui lòng nhập thông tin bên trái và bấm <strong>"Tính toán & Cập nhật Báo cáo"</strong></td></tr>`;
  }

  const quickSummary = document.getElementById("results-quick-summary");
  if (quickSummary) quickSummary.textContent = "Chưa thực hiện tính toán";
  const statusDot = document.querySelector(".status-indicator-dot");
  if (statusDot) statusDot.classList.remove("active");
  currentCalculationParams = null;

  if (monthlyChart) {
    monthlyChart.destroy();
    monthlyChart = null;
  }
  if (cashflowChart) {
    cashflowChart.destroy();
    cashflowChart = null;
  }

  resetPdfView();
}

function resetPdfView() {
  const locElem = document.getElementById("pdf-location");
  if (locElem) locElem.textContent = "--";
  const radElem = document.getElementById("pdf-radiation");
  if (radElem) radElem.textContent = "--";
  const tariffElem = document.getElementById("pdf-grid-tariff");
  if (tariffElem) tariffElem.textContent = "--";
  const roofElem = document.getElementById("pdf-roof-info");
  if (roofElem) roofElem.textContent = "--";
  const sysElem = document.getElementById("pdf-system-type");
  if (sysElem) sysElem.textContent = "--";

  const metrics = ["pdf-metric-power", "pdf-metric-panels", "pdf-metric-inverter", "pdf-metric-yield", "pdf-metric-cost", "pdf-metric-savings", "pdf-metric-payback", "pdf-metric-netprofit"];
  metrics.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "--";
  });

  const monthlyRow = document.getElementById("pdf-monthly-row");
  if (monthlyRow) monthlyRow.innerHTML = Array(12).fill('<td>--</td>').join('');

  const tbody1 = document.getElementById("pdf-cashflow-body-1");
  if (tbody1) tbody1.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 12px;">Chưa có dữ liệu</td></tr>';

  const bomTbody = document.getElementById("pdf-bom-tbody");
  if (bomTbody) bomTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 12px;">Chưa có dữ liệu dự toán</td></tr>';

  const bomTotal = document.getElementById("pdf-bom-total-price");
  if (bomTotal) bomTotal.textContent = "-- đ";
}

/**
 * Thu thập dữ liệu form và tính toán
 */
function performCalculation(isSamplePreset = false, samplePresetId = null) {
  const provinceId = document.getElementById("select-province").value;
  const wardName = document.getElementById("select-ward").value;
  let phase = document.getElementById("input-phase").value;
  let tariffType = document.getElementById("input-tariff").value;
  const monthlyBill = Number(document.getElementById("input-bill").value.replace(/\D/g, '')) || 0;
  const monthlyKwh = Number(document.getElementById("input-kwh").value) || 0;
  let daytimeRatio = Number(document.getElementById("input-daytime-ratio").value);
  let systemType = document.getElementById("input-system-type").value;
  let roofType = document.getElementById("select-roof-type").value;
  const panelBrand = document.getElementById("select-panel-brand").value;
  const panelPowerWp = Number(document.getElementById("select-panel-power").value) || 635;
  const inverterBrand = document.getElementById("select-inverter-brand").value;

  // Kiểm tra tính hợp lệ khi người dùng tự nhập
  if (!isSamplePreset) {
    if (!provinceId) {
      showToast("Vui lòng chọn Tỉnh / Thành phố!");
      document.getElementById("select-province").focus();
      return;
    }
    if (!monthlyBill && !monthlyKwh) {
      showToast("Vui lòng nhập Hoá đơn tiền điện hoặc Số điện (kWh) hàng tháng!");
      document.getElementById("input-bill").focus();
      return;
    }

    // Tự động gán mặc định thông minh nếu người dùng chưa chọn các trường phụ
    if (!phase) {
      phase = "1";
      setPillActive("phase-group", "input-phase", "1");
    }
    if (!tariffType) {
      tariffType = "residential";
      setPillActive("tariff-group", "input-tariff", "residential");
    }
    if (!systemType) {
      systemType = "grid_tie";
      setPillActive("system-type-group", "input-system-type", "grid_tie");
    }
    if (!roofType) {
      roofType = "metal";
      document.getElementById("select-roof-type").value = "metal";
    }
    if (!daytimeRatio) {
      daytimeRatio = 35;
      document.getElementById("input-daytime-ratio").value = "35";
      document.getElementById("daytime-pct-badge").textContent = "35%";
    }
  }

  const batteryKwh = Number(document.getElementById("input-battery-kwh")?.value) || (systemType === 'hybrid' ? 16 : 0);
  const batteryVoltage = document.getElementById("input-battery-voltage")?.value || 'LV';

  // Lấy bức xạ tùy chỉnh (nếu có)
  const customRadInput = document.getElementById("input-custom-radiation");
  const customRadiation = (customRadInput && customRadInput.value) ? Number(customRadInput.value) : null;

  // Lấy số tấm pin chỉ định trực tiếp (nếu có)
  const customPanelCountInput = document.getElementById("input-custom-panel-count");
  const panelCount = (customPanelCountInput && customPanelCountInput.value) ? Number(customPanelCountInput.value) : null;

  const calculationParams = {
    provinceId,
    wardName,
    customRadiation,
    panelCount,
    phase,
    tariffType,
    monthlyBill,
    monthlyKwh,
    daytimeRatio,
    systemType,
    batteryKwh,
    batteryVoltage,
    roofType,
    roofs: JSON.parse(JSON.stringify(roofSections)),
    panelBrand,
    panelPowerWp,
    inverterBrand,
    isSamplePreset,
    samplePresetId
  };

  const result = SolarCalculator.calculate(calculationParams);
  currentCalculationResult = result;
  currentCalculationParams = calculationParams;

  // Cập nhật giao diện Dashboard
  updateDashboardView(result);

  // Cập nhật tài liệu báo cáo PDF (2 Trang)
  updatePdfDocumentView(result);

  // Cập nhật biểu đồ trực quan
  renderCharts(result);
}

/**
 * Cập nhật các chỉ số và bảng tại tab Dashboard
 */
function updateDashboardView(data) {
  const res = data.results;
  const eq = data.equipment;

  document.getElementById("val-power").innerHTML = `${res.systemKwp} <span class="metric-unit">kWp</span>`;
  document.getElementById("val-panel-count").innerHTML = `${res.panelCount} <span class="metric-unit">tấm</span>`;
  document.getElementById("val-panel-desc").textContent = `${eq.panelBrand} ${eq.panelWp} Wp`;
  document.getElementById("val-inverter").innerHTML = `${res.inverterKwAc} <span class="metric-unit">kW AC</span>`;
  document.getElementById("val-phase-desc").textContent = `${data.powerSystem.phase} pha · ${data.powerSystem.systemType}`;
  document.getElementById("val-monthly-yield").innerHTML = `${formatNumber(res.avgMonthlyYield)} <span class="metric-unit">kWh/tháng</span>`;
  document.getElementById("val-annual-yield").textContent = `~ ${formatNumber(res.avgMonthlyYield * 12)} kWh/năm`;
  document.getElementById("val-total-cost").innerHTML = `${formatNumber(res.totalCostVnd)} <span class="metric-unit">đ</span>`;
  document.getElementById("val-year1-savings").innerHTML = `${formatNumber(res.year1SavingsVnd)} <span class="metric-unit">đ</span>`;
  document.getElementById("val-payback").innerHTML = `${res.paybackYears} <span class="metric-unit">năm</span>`;
  document.getElementById("chart-payback-label").textContent = `${res.paybackYears} năm`;
  document.getElementById("val-net-profit").innerHTML = `${formatNumber(res.netProfit25YearsVnd)} <span class="metric-unit">đ</span>`;
  document.getElementById("val-cum-25").textContent = `Lũy kế 25 năm: ${formatNumber(res.cumulativeYear25Vnd)} đ`;

  // Render bảng dòng tiền trong Dashboard
  const tableBody = document.querySelector("#dashboard-cashflow-table tbody");
  if (tableBody) {
    tableBody.innerHTML = res.cashflow25Years.map(item => {
      const isNegative = item.cumulative < 0;
      const isPaybackYear = !isNegative && (item.year === Math.ceil(parseFloat(res.paybackYears.replace(',', '.'))));
      return `
        <tr class="${isPaybackYear ? 'payback-row' : ''}">
          <td><strong>Năm ${item.year}</strong></td>
          <td style="text-align: right; color: #10b981; font-weight: 600;">${formatNumber(item.saving)} đ</td>
          <td style="text-align: right; font-weight: 700; color: ${isNegative ? '#ef4444' : '#f59e0b'};">
            ${isNegative ? '-' : '+'}${formatNumber(Math.abs(item.cumulative))} đ
          </td>
          <td>
            ${isNegative 
              ? `<span style="font-size: 11px; padding: 2px 6px; background: rgba(239,68,68,0.15); color: #fca5a5; border-radius: 4px;">Đang thu hồi vốn</span>` 
              : `<span style="font-size: 11px; padding: 2px 6px; background: rgba(16,185,129,0.15); color: #6ee7b7; border-radius: 4px;">Đã sinh lời</span>`}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Cập nhật thanh tóm tắt nhanh và chỉ báo
  const quickSummary = document.getElementById("results-quick-summary");
  if (quickSummary) {
    quickSummary.innerHTML = `<strong>${data.location.wardName || 'Khu vực'}, ${data.location.provinceName || ''}</strong> · <span style="color: #38bdf8; font-weight: 700;">${res.systemKwp} kWp</span> · ${data.powerSystem.systemType} · Hoàn vốn ~${res.paybackYears} năm`;
  }
  const statusDot = document.querySelector(".status-indicator-dot");
  if (statusDot) statusDot.classList.add("active");
}

/**
 * Cập nhật dữ liệu vào trang Báo cáo PDF 2 Trang
 */
function updatePdfDocumentView(data) {
  const res = data.results;
  const loc = data.location;
  const pwr = data.powerSystem;
  const roof = data.roof;

  // 1. Thông tin công trình (Trang 1)
  document.getElementById("pdf-location").textContent = `${loc.wardName} · ${loc.provinceName}`;
  document.getElementById("pdf-radiation").textContent = loc.dailyRadiation;
  document.getElementById("pdf-grid-tariff").textContent = `${pwr.phase} pha · ${pwr.tariffName}`;
  
  const roofDirText = roof.roofs.map(r => r.direction).join(', ');
  document.getElementById("pdf-roof-info").textContent = `${roof.typeName} · hướng ${roofDirText} · dốc ${roof.tilt}°`;
  document.getElementById("pdf-system-type").textContent = pwr.systemType;

  // 2. Kết quả đề xuất (8 ô Trang 1)
  document.getElementById("pdf-metric-power").textContent = `${res.systemKwp} kWp`;
  document.getElementById("pdf-metric-panels").textContent = `${res.panelCount} tấm`;
  document.getElementById("pdf-metric-inverter").textContent = `${res.inverterKwAc} kW AC`;
  document.getElementById("pdf-metric-yield").textContent = `${formatNumber(res.avgMonthlyYield)} kWh/tháng`;
  document.getElementById("pdf-metric-cost").textContent = `${formatNumber(res.totalCostVnd)} đ`;
  document.getElementById("pdf-metric-savings").textContent = `${formatNumber(res.year1SavingsVnd)} đ`;
  document.getElementById("pdf-metric-payback").textContent = `${res.paybackYears} năm`;
  document.getElementById("pdf-metric-netprofit").textContent = `${formatNumber(res.netProfit25YearsVnd)} đ`;

  // 3. Sản lượng từng tháng (kWh) T1 -> T12
  const monthlyRow = document.getElementById("pdf-monthly-row");
  monthlyRow.innerHTML = res.monthlyYields.map(val => `<td>${formatNumber(val)}</td>`).join('');

  // 4. Bảng Dòng tiền 25 năm (Trang 1: Toàn bộ Năm 1 -> 25 liền mạch)
  const tbodyPage1 = document.getElementById("pdf-cashflow-body-1");
  if (tbodyPage1) {
    tbodyPage1.innerHTML = res.cashflow25Years.map(item => `
      <tr>
        <td>${item.year}</td>
        <td>${formatNumber(item.saving)}</td>
        <td class="${item.cumulative < 0 ? 'negative' : 'positive'}">
          ${item.cumulative < 0 ? `-${formatNumber(Math.abs(item.cumulative))}` : formatNumber(item.cumulative)}
        </td>
      </tr>
    `).join('');
  }

  // 5. Dự toán vật tư & thi công (BOM Trang 2)
  const bomTbody = document.getElementById("pdf-bom-tbody");
  let bomHtml = '';

  data.bom.forEach(cat => {
    bomHtml += `
      <tr class="pdf-bom-category-row">
        <td colspan="3">${cat.category}</td>
      </tr>
    `;
    cat.items.forEach(item => {
      bomHtml += `
        <tr class="pdf-bom-item-row">
          <td class="pdf-bom-item-name">${item.name}</td>
          <td class="pdf-bom-item-spec">${item.spec}</td>
          <td class="pdf-bom-item-qty">${item.quantity}</td>
        </tr>
      `;
    });
  });

  bomTbody.innerHTML = bomHtml;

  // Tổng trọn gói
  document.getElementById("pdf-bom-total-price").textContent = `${formatNumber(res.totalCostVnd)} đ`;
}

/**
 * Khởi tạo và vẽ 2 biểu đồ phân tích bằng Chart.js
 */
function renderCharts(data) {
  const res = data.results;

  // 1. Biểu đồ sản lượng 12 tháng (Bar Chart)
  const ctxMonthly = document.getElementById("chart-monthly");
  if (ctxMonthly && window.Chart) {
    if (monthlyChart) monthlyChart.destroy();

    const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    monthlyChart = new Chart(ctxMonthly, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sản lượng (kWh)',
          data: res.monthlyYields,
          backgroundColor: res.monthlyYields.map(v => v === Math.max(...res.monthlyYields) ? '#38bdf8' : 'rgba(14, 165, 233, 0.65)'),
          borderColor: '#0284c7',
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${formatNumber(ctx.parsed.y)} kWh`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // 2. Biểu đồ dòng tiền lũy kế 25 năm (Line Chart)
  const ctxCashflow = document.getElementById("chart-cashflow");
  if (ctxCashflow && window.Chart) {
    if (cashflowChart) cashflowChart.destroy();

    const years = res.cashflow25Years.map(item => `N${item.year}`);
    const cumData = res.cashflow25Years.map(item => Math.round(item.cumulative / 1000000)); // Triệu đồng

    cashflowChart = new Chart(ctxCashflow, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Lũy kế thu hồi vốn (Triệu VNĐ)',
          data: cumData,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${formatNumber(ctx.parsed.y)} Triệu VNĐ`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }
}

/**
 * Xuất Báo Cáo PDF Chuẩn 2 Trang bằng html2pdf.js
 */
async function exportToPdf() {
  const page1 = document.getElementById("pdf-page-1");
  const page2 = document.getElementById("pdf-page-2");

  if (!page1 || !page2) {
    window.print();
    return;
  }

  if (!currentCalculationResult) {
    showToast("Vui lòng nhập thông tin và bấm Tính toán trước khi xuất PDF!");
    return;
  }

  showToast("Đang kết xuất file PDF 2 trang chuẩn xác...");

  try {
    // 1. Phương pháp ưu tiên cao nhất: Dùng trực tiếp jsPDF + html2canvas để khóa chặt 2 trang độc lập
    const jsPDFConstructor = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    const html2canvasFunc = window.html2canvas;

    if (jsPDFConstructor && html2canvasFunc) {
      const pdf = new jsPDFConstructor({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const canvasConfig = {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: page1.offsetWidth,
        height: page1.offsetHeight,
        windowWidth: 1200
      };

      // Chụp và chèn Trang 1
      const canvas1 = await html2canvasFunc(page1, canvasConfig);
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Thêm Trang 2
      pdf.addPage('a4', 'portrait');
      const canvas2 = await html2canvasFunc(page2, canvasConfig);
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const fileName = `CAS_Energy_BaoCao_${currentCalculationResult?.location.wardName || 'UocTinh'}.pdf`;
      pdf.save(fileName);
      showToast("Đã tải xuống file PDF 2 trang thành công!");
      return;
    }

    // 2. Phương pháp dự phòng qua html2pdf
    if (window.html2pdf) {
      const opt = {
        margin: [0, 0, 0, 0],
        filename: `CAS_Energy_BaoCao_${currentCalculationResult?.location.wardName || 'UocTinh'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      await html2pdf().set(opt).from(document.getElementById("pdf-export-container")).save();
      showToast("Đã tải xuống file PDF thành công!");
    } else {
      window.print();
    }
  } catch (err) {
    console.error("Lỗi kết xuất PDF:", err);
    window.print();
  }
}

/**
 * Hiển thị thông báo Toast
 */
function showToast(message) {
  const toast = document.getElementById("toast-notice");
  const msgElem = document.getElementById("toast-msg");
  if (!toast || !msgElem) return;

  msgElem.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/**
 * Hàm định dạng số theo chuẩn tiếng Việt (14.012.715)
 */
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Điều khiển tùy chỉnh bức xạ mặt trời
 */
function setupCustomRadiationControls() {
  const btnToggle = document.getElementById("btn-toggle-custom-rad");
  const panel = document.getElementById("custom-radiation-panel");
  const inputRad = document.getElementById("input-custom-radiation");
  const btnReset = document.getElementById("btn-reset-radiation");
  const tag = document.getElementById("radiation-source-tag");

  btnToggle?.addEventListener("click", () => {
    const isHidden = (panel.style.display === "none" || !panel.style.display);
    panel.style.display = isHidden ? "block" : "none";
    if (isHidden && !inputRad.value) {
      const selectWard = document.getElementById("select-ward");
      const opt = selectWard.options[selectWard.selectedIndex];
      inputRad.value = opt ? opt.getAttribute('data-rad') : '4.12';
    }
  });

  inputRad?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      document.getElementById("display-radiation-val").textContent = `${val.toFixed(2)} kWh/m²/ngày`;
      if (tag) tag.textContent = "(số tùy chỉnh của bạn)";
    }
  });

  btnReset?.addEventListener("click", () => {
    inputRad.value = "";
    panel.style.display = "none";
    updateRadiationDisplay();
    if (tag) tag.textContent = "(số riêng cho xã bạn)";
    performCalculation(false);
    showToast("Đã khôi phục mức bức xạ chuẩn của xã!");
  });
}

/**
 * Điều khiển Zoom trang PDF Preview
 */
let currentPdfZoom = 1.0;
function setupZoomControls() {
  const container = document.getElementById("pdf-export-container");
  const zoomText = document.getElementById("zoom-level-text");
  const btnIn = document.getElementById("btn-zoom-in");
  const btnOut = document.getElementById("btn-zoom-out");
  const btnReset = document.getElementById("btn-zoom-reset");

  function updateZoom(newZoom) {
    currentPdfZoom = Math.min(1.4, Math.max(0.6, Math.round(newZoom * 10) / 10));
    if (container) {
      container.style.transform = `scale(${currentPdfZoom})`;
      container.style.transformOrigin = 'top center';
    }
    if (zoomText) {
      zoomText.textContent = `${Math.round(currentPdfZoom * 100)}%`;
    }
  }

  btnIn?.addEventListener("click", () => updateZoom(currentPdfZoom + 0.1));
  btnOut?.addEventListener("click", () => updateZoom(currentPdfZoom - 0.1));
  btnReset?.addEventListener("click", () => updateZoom(1.0));
}

/**
 * Xuất dữ liệu ra file Excel (.CSV UTF-8 có BOM)
 */
function exportToExcel() {
  if (!currentCalculationResult) {
    showToast("Vui lòng tính toán trước khi xuất file!");
    return;
  }

  const res = currentCalculationResult.results;
  const loc = currentCalculationResult.location;
  const pwr = currentCalculationResult.powerSystem;
  const eq = currentCalculationResult.equipment;
  const bom = currentCalculationResult.bom;

  let csv = "\uFEFF"; // Ký tự UTF-8 BOM chuẩn để Excel hiển thị tiếng Việt không bị lỗi font
  csv += "BÁO CÁO DỰ TOÁN & PHÂN TÍCH TÀI CHÍNH ĐIỆN MẶT TRỜI CAS_ENERGY\n";
  csv += `Ngày lập,${document.getElementById("pdf-date")?.textContent || ''}\n`;
  csv += `Địa điểm,"${loc.wardName}, ${loc.provinceName}"\n`;
  csv += `Bức xạ tính toán,${loc.dailyRadiation} kWh/m2/ngày\n`;
  csv += `Loại hệ,"${pwr.systemType} (${pwr.phase} pha)"\n`;
  csv += `Biểu giá điện,"${pwr.tariffName}"\n`;
  csv += `Công suất hệ thống,"${res.systemKwp} kWp (${res.panelCount} tấm pin ${eq.panelBrand} ${eq.panelWp}Wp)"\n`;
  csv += `Inverter,"${res.inverterKwAc} kW AC (${eq.inverterBrand})"\n`;
  csv += `Sản lượng trung bình,"${res.avgMonthlyYield} kWh/tháng (~ ${res.avgMonthlyYield * 12} kWh/năm)"\n`;
  csv += `Tổng chi phí trọn gói,"${formatNumber(res.totalCostVnd)} đ"\n`;
  csv += `Tiết kiệm năm đầu,"${formatNumber(res.year1SavingsVnd)} đ"\n`;
  csv += `Thời gian hoàn vốn,"${res.paybackYears} năm"\n`;
  csv += `Lãi ròng 25 năm,"${formatNumber(res.netProfit25YearsVnd)} đ"\n\n`;

  // Bảng sản lượng 12 tháng
  csv += "SẢN LƯỢNG ĐIỆN 12 THÁNG (kWh)\n";
  csv += "T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12\n";
  csv += res.monthlyYields.join(",") + "\n\n";

  // Bảng BOM
  csv += "DỰ TOÁN VẬT TƯ & THI CÔNG (BOM)\n";
  csv += "Hạng mục,Quy cách kỹ thuật,Số lượng\n";
  bom.forEach(cat => {
    csv += `"${cat.category}","",""\n`;
    cat.items.forEach(it => {
      csv += `"${it.name.replace(/"/g, '""')}","${it.spec.replace(/"/g, '""')}","${it.quantity}"\n`;
    });
  });
  csv += `"TỔNG TRỌN GÓI (Vật tư + Nhân công + EVN)","","${formatNumber(res.totalCostVnd)} đ"\n\n`;

  // Bảng dòng tiền 25 năm
  csv += "BẢNG DÒNG TIỀN HOÀN VỐN 25 NĂM (VNĐ)\n";
  csv += "Năm,Tiền điện tiết kiệm (đ),Lũy kế đã trừ chi phí đầu tư (đ)\n";
  res.cashflow25Years.forEach(c => {
    csv += `${c.year},${c.saving},${c.cumulative}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const safeName = loc.wardName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
  link.setAttribute("download", `CAS_Energy_DuToan_${safeName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Đã tải xuống file Excel (.CSV) thành công!");
}

/**
 * Sao chép tóm tắt báo giá gửi khách hàng qua Zalo / Email
 */
function copyQuoteToClipboard() {
  if (!currentCalculationResult) {
    showToast("Vui lòng tính toán trước khi sao chép!");
    return;
  }
  const res = currentCalculationResult.results;
  const loc = currentCalculationResult.location;
  const pwr = currentCalculationResult.powerSystem;
  const eq = currentCalculationResult.equipment;

  const quoteText = `⚡ BÁO GIÁ ƯỚC TÍNH ĐIỆN MẶT TRỜI CAS_ENERGY
📍 Địa điểm: ${loc.wardName}, ${loc.provinceName}
☀️ Bức xạ: ${loc.dailyRadiation} kWh/m²/ngày
🔋 Loại hệ: ${pwr.systemType} (${pwr.phase} pha)
📦 Quy mô: ${res.systemKwp} kWp (${res.panelCount} tấm pin ${eq.panelBrand} ${eq.panelWp}Wp)
🔌 Inverter: ${res.inverterKwAc} kW AC (${eq.inverterBrand})
📈 Sản lượng ước tính: ${formatNumber(res.avgMonthlyYield)} kWh/tháng (~ ${formatNumber(res.avgMonthlyYield * 12)} kWh/năm)
💰 Tổng chi phí trọn gói: ${formatNumber(res.totalCostVnd)} VNĐ
💵 Tiết kiệm năm đầu: ${formatNumber(res.year1SavingsVnd)} VNĐ/năm
⏱️ Thời gian hoàn vốn: ${res.paybackYears} năm
💎 Lãi ròng 25 năm: ${formatNumber(res.netProfit25YearsVnd)} VNĐ
📞 Hotline CAS Energy: +84 (236) 3675 666 · info@cas-energy.vn`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(quoteText).then(() => {
      showToast("Đã sao chép tóm tắt báo giá vào Clipboard!");
    }).catch(() => {
      fallbackCopy(quoteText);
    });
  } else {
    fallbackCopy(quoteText);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast("Đã sao chép tóm tắt báo giá vào Clipboard!");
  } catch (e) {
    showToast("Không thể sao chép tự động.");
  }
  document.body.removeChild(ta);
}

/* ==========================================================
   HỆ THỐNG QUẢN LÝ DỰ ÁN ĐÃ TÍNH TOÁN & LƯU TRỮ (LOCALSTORAGE)
   ========================================================== */

/**
 * Khởi tạo hệ thống lưu trữ dự án khi load trang
 */
function initSavedProjects() {
  if (localStorage.getItem(SAVED_PROJECTS_KEY) === null) {
    // Khởi tạo 2 dự án mẫu thực tế để người dùng trải nghiệm ngay lập tức
    try {
      const sample1Params = {
        provinceId: "danang",
        wardName: "Phường Hòa Cường Bắc",
        customRadiation: null,
        panelCount: null,
        phase: "1",
        tariffType: "residential",
        monthlyBill: 2500000,
        monthlyKwh: 0,
        daytimeRatio: 35,
        systemType: "hybrid",
        batteryKwh: 16,
        batteryVoltage: "LV",
        roofType: "metal",
        roofs: [{ id: 1, direction: "Nam", area: 30 }],
        panelBrand: "Canadian",
        panelPowerWp: 635,
        inverterBrand: "Solis",
        isSamplePreset: false,
        samplePresetId: null
      };
      const res1 = SolarCalculator.calculate(sample1Params);

      const sample2Params = {
        provinceId: "danang",
        wardName: "Xã Nam Phước",
        customRadiation: null,
        panelCount: null,
        phase: "3",
        tariffType: "industrial",
        monthlyBill: 5000000,
        monthlyKwh: 2150,
        daytimeRatio: 35,
        systemType: "grid_tie",
        batteryKwh: 0,
        batteryVoltage: "LV",
        roofType: "metal",
        roofs: [{ id: 1, direction: "Đông Nam", area: 50 }],
        panelBrand: "Canadian",
        panelPowerWp: 635,
        inverterBrand: "Solis",
        isSamplePreset: false,
        samplePresetId: null
      };
      const res2 = SolarCalculator.calculate(sample2Params);

      const initialProjects = [
        {
          id: "cas_proj_sample_hybrid",
          name: "Biệt thự Chị Lan - P. Hòa Cường Bắc",
          note: "Hệ Hybrid lưu trữ 16 kWh, mái tôn hướng Nam. Đã tư vấn gói biến tần Solis.",
          createdAt: "10:30 · 03/11/2026",
          timestamp: Date.now() - 3600000,
          params: sample1Params,
          resultsSummary: {
            systemKwp: res1.results.systemKwp,
            panelCount: res1.results.panelCount,
            panelBrand: res1.equipment.panelBrand,
            panelWp: res1.equipment.panelWp,
            inverterKwAc: res1.results.inverterKwAc,
            inverterBrand: res1.equipment.inverterBrand,
            avgMonthlyYield: res1.results.avgMonthlyYield,
            totalCostVnd: res1.results.totalCostVnd,
            year1SavingsVnd: res1.results.year1SavingsVnd,
            paybackYears: res1.results.paybackYears,
            netProfit25YearsVnd: res1.results.netProfit25YearsVnd,
            systemType: res1.powerSystem.systemType,
            phase: res1.powerSystem.phase,
            wardName: res1.location.wardName,
            provinceName: res1.location.provinceName,
            dailyRadiation: res1.location.dailyRadiation,
            batteryKwh: res1.equipment.batteryKwh
          }
        },
        {
          id: "cas_proj_sample_grid",
          name: "Xưởng cơ khí Anh Tuấn - Xã Nam Phước",
          note: "Xưởng cơ khí dùng điện 3 pha sản xuất. Mái tôn hướng Đông Nam 50 m².",
          createdAt: "09:15 · 02/11/2026",
          timestamp: Date.now() - 86400000,
          params: sample2Params,
          resultsSummary: {
            systemKwp: res2.results.systemKwp,
            panelCount: res2.results.panelCount,
            panelBrand: res2.equipment.panelBrand,
            panelWp: res2.equipment.panelWp,
            inverterKwAc: res2.results.inverterKwAc,
            inverterBrand: res2.equipment.inverterBrand,
            avgMonthlyYield: res2.results.avgMonthlyYield,
            totalCostVnd: res2.results.totalCostVnd,
            year1SavingsVnd: res2.results.year1SavingsVnd,
            paybackYears: res2.results.paybackYears,
            netProfit25YearsVnd: res2.results.netProfit25YearsVnd,
            systemType: res2.powerSystem.systemType,
            phase: res2.powerSystem.phase,
            wardName: res2.location.wardName,
            provinceName: res2.location.provinceName,
            dailyRadiation: res2.location.dailyRadiation,
            batteryKwh: res2.equipment.batteryKwh
          }
        }
      ];
      localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(initialProjects));
    } catch (e) {
      console.warn("Không thể tạo dự án mẫu:", e);
    }
  }

  updateSavedProjectsCountBadges();
  renderSavedProjectsList();
}

/**
 * Lấy danh sách dự án từ LocalStorage
 */
function getSavedProjects() {
  try {
    const raw = localStorage.getItem(SAVED_PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Lỗi đọc danh sách dự án:", e);
    return [];
  }
}

/**
 * Lưu danh sách dự án vào LocalStorage và cập nhật UI
 */
function setSavedProjects(projects) {
  try {
    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(projects));
    updateSavedProjectsCountBadges();
    renderSavedProjectsList();
  } catch (e) {
    console.error("Lỗi ghi LocalStorage:", e);
    showToast("Bộ nhớ trình duyệt đầy, không thể lưu thêm!");
  }
}

/**
 * Cập nhật số lượng dự án hiển thị ở các badge
 */
function updateSavedProjectsCountBadges() {
  const count = getSavedProjects().length;
  const badgeTab = document.getElementById("saved-projects-tab-count");
  if (badgeTab) badgeTab.textContent = count;
  document.querySelectorAll(".saved-count-sync").forEach(el => el.textContent = count);
}

/**
 * Mở modal Lưu dự án hiện tại
 */
function saveCurrentProjectModal() {
  if (!currentCalculationResult || !currentCalculationParams) {
    showToast("Vui lòng nhập thông tin và bấm 'Tính toán' trước khi lưu dự án!");
    return;
  }

  const res = currentCalculationResult.results;
  const loc = currentCalculationResult.location;
  const pwr = currentCalculationResult.powerSystem;

  const defaultName = `Dự án ${loc.wardName || 'Mặt trời'} - ${res.systemKwp} kWp (${pwr.systemType === 'hybrid' ? 'Hybrid' : 'Hòa lưới'})`;
  const nameInput = document.getElementById("save-project-name");
  if (nameInput) nameInput.value = defaultName;

  const noteInput = document.getElementById("save-project-note");
  if (noteInput) noteInput.value = "";

  const summaryBox = document.getElementById("save-project-summary");
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div>📍 <strong>Địa điểm:</strong> ${loc.wardName}, ${loc.provinceName} (Bức xạ: ${loc.dailyRadiation} kWh/m²/ngày)</div>
      <div>⚡ <strong>Quy mô:</strong> ${res.systemKwp} kWp · ${res.panelCount} tấm pin · Biến tần ${res.inverterKwAc} kW AC (${pwr.phase} pha)</div>
      <div>💰 <strong>Chi phí đầu tư:</strong> ${formatNumber(res.totalCostVnd)} đ · <strong>Hoàn vốn:</strong> ${res.paybackYears} năm · <strong>Lãi ròng:</strong> ${formatNumber(res.netProfit25YearsVnd)} đ</div>
    `;
  }

  const modal = document.getElementById("modal-save-project");
  if (modal) {
    modal.style.display = "flex";
    if (nameInput) {
      setTimeout(() => {
        nameInput.focus();
        nameInput.select();
      }, 60);
    }
  }
}

/**
 * Đóng modal Lưu dự án
 */
function closeSaveModal() {
  const modal = document.getElementById("modal-save-project");
  if (modal) modal.style.display = "none";
}

/**
 * Xác nhận lưu dự án vào danh sách
 */
function confirmSaveProject() {
  if (!currentCalculationResult || !currentCalculationParams) {
    showToast("Chưa có kết quả tính toán để lưu!");
    closeSaveModal();
    return;
  }

  const nameInput = document.getElementById("save-project-name");
  const noteInput = document.getElementById("save-project-note");

  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) {
    showToast("Vui lòng nhập tên cho dự án!");
    if (nameInput) nameInput.focus();
    return;
  }

  const note = noteInput ? noteInput.value.trim() : "";
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const projectRecord = {
    id: "cas_proj_" + Date.now(),
    name: name,
    note: note,
    createdAt: timeStr,
    timestamp: Date.now(),
    params: JSON.parse(JSON.stringify(currentCalculationParams)),
    resultsSummary: {
      systemKwp: currentCalculationResult.results.systemKwp,
      panelCount: currentCalculationResult.results.panelCount,
      panelBrand: currentCalculationResult.equipment.panelBrand,
      panelWp: currentCalculationResult.equipment.panelWp,
      inverterKwAc: currentCalculationResult.results.inverterKwAc,
      inverterBrand: currentCalculationResult.equipment.inverterBrand,
      avgMonthlyYield: currentCalculationResult.results.avgMonthlyYield,
      totalCostVnd: currentCalculationResult.results.totalCostVnd,
      year1SavingsVnd: currentCalculationResult.results.year1SavingsVnd,
      paybackYears: currentCalculationResult.results.paybackYears,
      netProfit25YearsVnd: currentCalculationResult.results.netProfit25YearsVnd,
      systemType: currentCalculationResult.powerSystem.systemType,
      phase: currentCalculationResult.powerSystem.phase,
      wardName: currentCalculationResult.location.wardName,
      provinceName: currentCalculationResult.location.provinceName,
      dailyRadiation: currentCalculationResult.location.dailyRadiation,
      batteryKwh: currentCalculationResult.equipment.batteryKwh
    }
  };

  const list = getSavedProjects();
  list.unshift(projectRecord);
  setSavedProjects(list);

  closeSaveModal();
  showToast(`Đã lưu dự án "${name}" vào danh sách!`);
}

/**
 * Nạp lại dự án đã lưu vào form và tự động tính toán lại
 */
function loadProjectToForm(projectId, switchDirectToPdf = false) {
  const list = getSavedProjects();
  const proj = list.find(p => p.id === projectId);
  if (!proj || !proj.params) {
    showToast("Không tìm thấy thông tin dự án đã lưu!");
    return;
  }

  const params = proj.params;

  // 1. Tỉnh và Xã
  const selectProv = document.getElementById("select-province");
  if (selectProv) {
    selectProv.value = params.provinceId;
    updateWardsDropdown(params.provinceId, params.wardName);
  }

  // 2. Nguồn điện & biểu giá
  if (params.phase) {
    setPillActive("phase-group", "input-phase", params.phase);
  }
  if (params.tariffType) {
    setPillActive("tariff-group", "input-tariff", params.tariffType);
    const tariffIndicator = document.getElementById("tariff-indicator");
    if (tariffIndicator) {
      if (params.tariffType === 'residential') tariffIndicator.textContent = "Hộ gia đình dùng điện sinh hoạt theo 6 bậc thang lũy tiến";
      else if (params.tariffType === 'commercial') tariffIndicator.textContent = "Cơ sở kinh doanh dịch vụ dùng điện theo biểu giá giờ BT - CĐ - TĐ";
      else tariffIndicator.textContent = "Cơ sở sản xuất, nhà máy dùng điện 3 pha theo biểu giá";
    }
  }

  // 3. Tiền điện & kWh
  const inputBill = document.getElementById("input-bill");
  if (inputBill) inputBill.value = params.monthlyBill ? formatNumber(params.monthlyBill) : "";

  const inputKwh = document.getElementById("input-kwh");
  if (inputKwh) inputKwh.value = params.monthlyKwh ? params.monthlyKwh : "";

  // 4. Tỉ lệ ban ngày
  const inputRatio = document.getElementById("input-daytime-ratio");
  if (inputRatio) {
    inputRatio.value = params.daytimeRatio || 35;
    const badge = document.getElementById("daytime-pct-badge");
    if (badge) badge.textContent = `${params.daytimeRatio || 35}%`;
  }

  // 5. Loại hệ
  if (params.systemType) {
    setPillActive("system-type-group", "input-system-type", params.systemType);
  }

  // 6. Pin lưu trữ nếu có
  const batteryInput = document.getElementById("input-battery-kwh");
  if (batteryInput && params.batteryKwh) batteryInput.value = params.batteryKwh;

  const batteryVoltage = document.getElementById("input-battery-voltage");
  if (batteryVoltage && params.batteryVoltage) batteryVoltage.value = params.batteryVoltage;

  // 7. Mái
  const selectRoofType = document.getElementById("select-roof-type");
  if (selectRoofType && params.roofType) selectRoofType.value = params.roofType;

  if (params.roofs && params.roofs.length > 0) {
    roofSections = JSON.parse(JSON.stringify(params.roofs));
  } else {
    roofSections = [{ id: 1, direction: "Nam", area: "" }];
  }
  renderRoofSections();

  // 8. Thiết bị
  const selectPanelBrand = document.getElementById("select-panel-brand");
  if (selectPanelBrand && params.panelBrand) selectPanelBrand.value = params.panelBrand;

  const selectPanelPower = document.getElementById("select-panel-power");
  if (selectPanelPower && params.panelPowerWp) selectPanelPower.value = params.panelPowerWp;

  const selectInverterBrand = document.getElementById("select-inverter-brand");
  if (selectInverterBrand && params.inverterBrand) selectInverterBrand.value = params.inverterBrand;

  // 9. Bức xạ hoặc tấm pin chỉ định nếu có
  const customRad = document.getElementById("input-custom-radiation");
  if (customRad) customRad.value = params.customRadiation || "";

  const customPanel = document.getElementById("input-custom-panel-count");
  if (customPanel) customPanel.value = params.panelCount || "";

  // 10. Chạy tính toán
  performCalculation(false);

  // 11. Chuyển tab hiển thị
  if (switchDirectToPdf) {
    const pdfTabBtn = document.querySelector('.view-tab[data-tab="pdf-preview"]');
    if (pdfTabBtn) pdfTabBtn.click();
    showToast(`Đã mở Báo cáo PDF cho dự án "${proj.name}"!`);
  } else {
    const dashTabBtn = document.querySelector('.view-tab[data-tab="dashboard"]');
    if (dashTabBtn) dashTabBtn.click();
    showToast(`Đã nạp thành công dự án "${proj.name}" vào bảng tính!`);
  }
}

/**
 * Xóa một dự án khỏi danh sách lưu trữ
 */
function deleteSavedProject(projectId) {
  const list = getSavedProjects();
  const proj = list.find(p => p.id === projectId);
  const name = proj ? proj.name : "dự án";
  if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi danh mục dự án đã lưu?`)) {
    return;
  }
  const nextList = list.filter(p => p.id !== projectId);
  setSavedProjects(nextList);
  showToast(`Đã xóa "${name}" thành công!`);
}

/**
 * Render danh sách dự án ra giao diện
 */
function renderSavedProjectsList(filterText = '') {
  const grid = document.getElementById("saved-projects-grid");
  if (!grid) return;

  const list = getSavedProjects();
  const query = filterText.toLowerCase().trim();

  const filtered = query ? list.filter(p => {
    const text = `${p.name} ${p.note || ''} ${p.resultsSummary?.wardName || ''} ${p.resultsSummary?.provinceName || ''} ${p.resultsSummary?.systemType || ''}`.toLowerCase();
    return text.includes(query);
  }) : list;

  if (filtered.length === 0) {
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-saved-projects">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </div>
          <div class="empty-title">Chưa có dự án nào được lưu trữ</div>
          <div class="empty-desc">
            Sau khi tính toán ở tab Bảng tính, bạn hãy bấm nút <strong>"Lưu dự án"</strong> để lưu lại phương án vào danh sách này.
          </div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button type="button" class="btn btn-primary btn-sm" id="btn-empty-sample-hybrid">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              Tính & Lưu mẫu Hybrid
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-empty-goto-dashboard">
              Vào Bảng tính nhập mới
            </button>
          </div>
        </div>
      `;

      document.getElementById("btn-empty-sample-hybrid")?.addEventListener("click", () => {
        loadPresetHybridSample();
        setTimeout(() => {
          saveCurrentProjectModal();
        }, 150);
      });

      document.getElementById("btn-empty-goto-dashboard")?.addEventListener("click", () => {
        const dashTab = document.querySelector('.view-tab[data-tab="dashboard"]');
        if (dashTab) dashTab.click();
      });
      return;
    } else {
      grid.innerHTML = `
        <div class="empty-saved-projects">
          <div class="empty-title">Không tìm thấy dự án phù hợp với từ khóa "${escapeHtml(filterText)}"</div>
          <div class="empty-desc">Vui lòng thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để xem lại toàn bộ.</div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-search">Hiển thị tất cả dự án</button>
        </div>
      `;
      document.getElementById("btn-clear-search")?.addEventListener("click", () => {
        const input = document.getElementById("saved-search-input");
        if (input) input.value = "";
        renderSavedProjectsList('');
      });
      return;
    }
  }

  grid.innerHTML = filtered.map(p => {
    const s = p.resultsSummary || {};
    return `
      <div class="saved-project-card" data-id="${p.id}">
        <div class="saved-card-header">
          <div>
            <h3 class="saved-card-title">${escapeHtml(p.name)}</h3>
            <div class="saved-card-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${p.createdAt || ''}
            </div>
          </div>
        </div>

        ${p.note ? `<div class="saved-card-note">${escapeHtml(p.note)}</div>` : ''}

        <div class="saved-chips-list">
          <span class="saved-chip location">
            📍 ${s.wardName ? `${s.wardName}, ${s.provinceName}` : 'Chưa rõ địa điểm'}
          </span>
          <span class="saved-chip">
            ⚡ ${s.systemKwp || 0} kWp
          </span>
          <span class="saved-chip">
            🔌 ${s.systemType === 'hybrid' ? 'Hybrid' : 'Hòa lưới'} (${s.phase || 1} pha)
          </span>
          <span class="saved-chip">
            🔲 ${s.panelCount || 0} tấm ${s.panelBrand || ''}
          </span>
        </div>

        <div class="saved-specs-grid">
          <div class="saved-spec-box">
            <span class="saved-spec-lbl">Tổng đầu tư</span>
            <span class="saved-spec-val highlight">${formatNumber(s.totalCostVnd || 0)} đ</span>
          </div>
          <div class="saved-spec-box">
            <span class="saved-spec-lbl">Sản lượng tháng</span>
            <span class="saved-spec-val">${formatNumber(s.avgMonthlyYield || 0)} kWh</span>
          </div>
          <div class="saved-spec-box">
            <span class="saved-spec-lbl">Hoàn vốn</span>
            <span class="saved-spec-val green">${s.paybackYears || '--'} năm</span>
          </div>
          <div class="saved-spec-box">
            <span class="saved-spec-lbl">Lãi ròng 25 năm</span>
            <span class="saved-spec-val green">${formatNumber(s.netProfit25YearsVnd || 0)} đ</span>
          </div>
        </div>

        <div class="saved-card-actions">
          <button type="button" class="btn btn-primary btn-sm btn-load-proj" data-id="${p.id}" title="Nạp dữ liệu vào bảng tính để xem hoặc sửa">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Mở lại
          </button>
          <button type="button" class="btn btn-secondary btn-sm btn-pdf-proj" data-id="${p.id}" title="Xem trước tài liệu PDF chuẩn 2 trang">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Xem PDF
          </button>
          <button type="button" class="btn btn-secondary btn-sm btn-copy-proj" data-id="${p.id}" title="Sao chép báo giá nhanh gửi Zalo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Zalo
          </button>
          <button type="button" class="btn btn-secondary btn-sm btn-del-proj" data-id="${p.id}" title="Xóa dự án khỏi danh sách" style="margin-left: auto; color: #f87171; border-color: rgba(239, 68, 68, 0.3);">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Gán sự kiện click cho các nút trong card
  grid.querySelectorAll('.btn-load-proj').forEach(b => {
    b.addEventListener('click', () => loadProjectToForm(b.dataset.id, false));
  });

  grid.querySelectorAll('.btn-pdf-proj').forEach(b => {
    b.addEventListener('click', () => loadProjectToForm(b.dataset.id, true));
  });

  grid.querySelectorAll('.btn-copy-proj').forEach(b => {
    b.addEventListener('click', () => {
      loadProjectToForm(b.dataset.id, false);
      copyQuoteToClipboard();
    });
  });

  grid.querySelectorAll('.btn-del-proj').forEach(b => {
    b.addEventListener('click', () => deleteSavedProject(b.dataset.id));
  });
}

/**
 * Xuất toàn bộ danh sách dự án ra file JSON sao lưu
 */
function exportSavedProjectsJson() {
  const list = getSavedProjects();
  if (list.length === 0) {
    showToast("Không có dự án nào để xuất sao lưu!");
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(list, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  downloadAnchor.setAttribute("download", `CAS_Energy_DuAn_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Đã tải xuống file sao lưu JSON thành công!");
}

/**
 * Nhập danh sách dự án từ file JSON sao lưu
 */
function importSavedProjectsJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        showToast("File không đúng cấu trúc danh sách dự án CAS Energy!");
        return;
      }
      const currentList = getSavedProjects();
      const existingIds = new Set(currentList.map(p => p.id));
      let addedCount = 0;
      imported.forEach(item => {
        if (item && item.params) {
          if (!existingIds.has(item.id)) {
            currentList.push(item);
            addedCount++;
          }
        }
      });
      setSavedProjects(currentList);
      showToast(`Đã nhập thành công ${addedCount} dự án mới vào danh sách!`);
    } catch (err) {
      console.error(err);
      showToast("Lỗi đọc file JSON. Vui lòng kiểm tra lại định dạng file!");
    }
  };
  reader.readAsText(file);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
