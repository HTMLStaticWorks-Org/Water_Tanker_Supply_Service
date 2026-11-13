/**
 * AquaVanguard - Customer Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardStorage();
  initSidebarTabs();
  initDashboardBookingForm();
  renderBookingsTable();
  renderInvoicesTable();
  initTrackerSimulation();
  initProfileForm();
  initSupportForm();
  checkForPendingHeroBooking();

  // Handle URL hash tab switching (e.g., #book, #track)
  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);
});

// Initial mock data
const DEFAULT_BOOKINGS = [
  {
    id: "AV-8842",
    capacity: "10,000L Stainless Steel Tanker",
    waterType: "Potable / Drinking RO Water",
    address: "Skyline Heights, Tower 4, West Bay",
    date: "Today, 02:30 PM",
    status: "Out for Delivery",
    amount: "$175.00",
    driver: "Marcus Vance",
    tankerNo: "TK-4029-SS",
    eta: "22 mins"
  },
  {
    id: "AV-8819",
    capacity: "5,000L Standard Tanker",
    waterType: "Domestic & Utility Water",
    address: "Villa 12, Palm Crest Enclave",
    date: "Yesterday, 10:15 AM",
    status: "Delivered",
    amount: "$95.00",
    driver: "Devon Reed",
    tankerNo: "TK-1182-BL",
    eta: "Delivered"
  },
  {
    id: "AV-8790",
    capacity: "12,000L Heavy Industrial",
    waterType: "Construction Water",
    address: "Apex Commercial Hub, Sector 9",
    date: "10 Nov 2026",
    status: "Delivered",
    amount: "$210.00",
    driver: "Carlos Ortiz",
    tankerNo: "TK-9021-HD",
    eta: "Delivered"
  },
  {
    id: "AV-8640",
    capacity: "3,000L Compact Tanker",
    waterType: "Purified Domestic Water",
    address: "Greenwood Residency, Flat 3B",
    date: "04 Nov 2026",
    status: "Delivered",
    amount: "$75.00",
    driver: "Marcus Vance",
    tankerNo: "TK-4029-SS",
    eta: "Delivered"
  }
];

function initDashboardStorage() {
  if (!localStorage.getItem('aquavanguard_bookings')) {
    localStorage.setItem('aquavanguard_bookings', JSON.stringify(DEFAULT_BOOKINGS));
  }
}

function getStoredBookings() {
  try {
    return JSON.parse(localStorage.getItem('aquavanguard_bookings')) || DEFAULT_BOOKINGS;
  } catch (e) {
    return DEFAULT_BOOKINGS;
  }
}

/* -------------------------------------------------------------------------
 * Sidebar Tabs Navigation
 * ------------------------------------------------------------------------- */
function initSidebarTabs() {
  const tabLinks = document.querySelectorAll('.dashboard-tab-link');
  const tabContents = document.querySelectorAll('.dashboard-tab-content');
  const sidebar = document.getElementById('dashboard-sidebar');
  const sidebarToggle = document.getElementById('dashboard-sidebar-toggle');
  const sidebarClose = document.getElementById('dashboard-sidebar-close');

  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-tab');
      activateTab(targetId);

      // Close mobile drawer if open
      if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        closeMobileSidebar();
      }
    });
  });

  // Mobile sidebar controls
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full', 'translate-x-full');
    });
  }

  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', closeMobileSidebar);
  }

  function closeMobileSidebar() {
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    sidebar.classList.add(isRtl ? 'translate-x-full' : '-translate-x-full');
  }
}

function activateTab(tabId) {
  const tabLinks = document.querySelectorAll('.dashboard-tab-link');
  const tabContents = document.querySelectorAll('.dashboard-tab-content');
  const tabTitle = document.getElementById('dashboard-current-title');

  tabLinks.forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('bg-sky-500/10', 'text-sky-600', 'dark:text-sky-400', 'font-semibold');
      link.classList.remove('text-slate-600', 'dark:text-slate-400');
    } else {
      link.classList.remove('bg-sky-500/10', 'text-sky-600', 'dark:text-sky-400', 'font-semibold');
      link.classList.add('text-slate-600', 'dark:text-slate-400');
    }
  });

  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  if (tabTitle) {
    const titles = {
      'overview': 'Dashboard Overview',
      'book': 'Book a Water Tanker',
      'bookings': 'My Bookings History',
      'track': 'Live Delivery Tracking',
      'billing': 'Billing & Payments',
      'profile': 'My Customer Profile',
      'support': 'Dispatch Help & Support'
    };
    tabTitle.textContent = titles[tabId] || 'Dashboard';
  }

  // Refresh lucide icons for newly revealed tab
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (['overview', 'book', 'bookings', 'track', 'billing', 'profile', 'support'].includes(hash)) {
    activateTab(hash);
  }
}

/* -------------------------------------------------------------------------
 * Preload Pending Booking from Landing Page
 * ------------------------------------------------------------------------- */
function checkForPendingHeroBooking() {
  const pending = sessionStorage.getItem('pending_booking');
  if (pending) {
    try {
      const data = JSON.parse(pending);
      const capacitySelect = document.getElementById('dash-capacity');
      const addressInput = document.getElementById('dash-address');
      const dateInput = document.getElementById('dash-date');

      if (capacitySelect && data.quantity) {
        for (let i = 0; i < capacitySelect.options.length; i++) {
          if (capacitySelect.options[i].text.includes(data.quantity)) {
            capacitySelect.selectedIndex = i;
            break;
          }
        }
      }
      if (addressInput && data.location && data.location !== 'Your Area') {
        addressInput.value = data.location;
      }
      sessionStorage.removeItem('pending_booking');
    } catch (e) {
      // Ignore parse error
    }
  }
}

/* -------------------------------------------------------------------------
 * Tanker Booking Form
 * ------------------------------------------------------------------------- */
function initDashboardBookingForm() {
  const form = document.getElementById('dashboard-new-booking-form');
  const capacitySelect = document.getElementById('dash-capacity');
  const typeSelect = document.getElementById('dash-water-type');
  const costEstimateEl = document.getElementById('dash-price-estimate');

  const updateEstimate = () => {
    if (!capacitySelect || !typeSelect || !costEstimateEl) return;
    const baseCost = parseInt(capacitySelect.value) || 95;
    const multiplier = parseFloat(typeSelect.value) || 1.0;
    const total = Math.round(baseCost * multiplier);
    costEstimateEl.textContent = `$${total}.00`;
  };

  if (capacitySelect) capacitySelect.addEventListener('change', updateEstimate);
  if (typeSelect) typeSelect.addEventListener('change', updateEstimate);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const capacityText = capacitySelect.options[capacitySelect.selectedIndex].text;
      const typeText = typeSelect.options[typeSelect.selectedIndex].text;
      const address = document.getElementById('dash-address').value;
      const dateVal = document.getElementById('dash-date').value || 'Today, Express Dispatch';
      const instructions = document.getElementById('dash-instructions').value;
      const cost = costEstimateEl.textContent;

      const newBooking = {
        id: `AV-${Math.floor(1000 + Math.random() * 9000)}`,
        capacity: capacityText,
        waterType: typeText,
        address: address,
        date: dateVal,
        status: "Out for Delivery",
        amount: cost,
        driver: "Marcus Vance",
        tankerNo: "TK-4029-SS",
        eta: "35 mins"
      };

      const bookings = getStoredBookings();
      bookings.unshift(newBooking);
      localStorage.setItem('aquavanguard_bookings', JSON.stringify(bookings));

      renderBookingsTable();
      updateActiveDeliveryDisplay(newBooking);

      if (typeof showToast === 'function') {
        showToast(`Tanker ${newBooking.id} Dispatched! Driver Marcus assigned.`, 'success');
      }

      form.reset();
      updateEstimate();

      // Switch to live tracking tab
      setTimeout(() => {
        activateTab('track');
      }, 600);
    });
  }
}

/* -------------------------------------------------------------------------
 * Render Bookings Table
 * ------------------------------------------------------------------------- */
function renderBookingsTable() {
  const container = document.getElementById('dashboard-bookings-tbody');
  const overviewContainer = document.getElementById('overview-recent-bookings');
  const bookings = getStoredBookings();

  // Update Overview Counters
  const totalCountEl = document.getElementById('stat-total-bookings');
  const activeCountEl = document.getElementById('stat-active-deliveries');
  const completedCountEl = document.getElementById('stat-completed-deliveries');

  const activeCount = bookings.filter(b => b.status === 'Out for Delivery' || b.status === 'Tanker Assigned').length;
  const completedCount = bookings.filter(b => b.status === 'Delivered').length;

  if (totalCountEl) totalCountEl.textContent = bookings.length;
  if (activeCountEl) activeCountEl.textContent = activeCount;
  if (completedCountEl) completedCountEl.textContent = completedCount;

  const renderRow = (b) => {
    let badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    if (b.status === "Delivered") badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (b.status === "Cancelled") badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

    return `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
        <td class="py-4 px-4 font-mono font-bold text-sky-600 dark:text-sky-400 text-sm whitespace-nowrap">${b.id}</td>
        <td class="py-4 px-4 whitespace-nowrap">
          <p class="font-semibold text-slate-800 dark:text-slate-100 text-sm">${b.capacity}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${b.waterType}</p>
        </td>
        <td class="py-4 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate whitespace-nowrap">${b.address}</td>
        <td class="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">${b.date}</td>
        <td class="py-4 px-4 font-bold text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">${b.amount}</td>
        <td class="py-4 px-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}">
            ${b.status}
          </span>
        </td>
        <td class="py-4 px-4 text-right whitespace-nowrap">
          <button onclick="viewBookingDetails('${b.id}')" class="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
            Details
          </button>
        </td>
      </tr>
    `;
  };

  if (container) {
    container.innerHTML = bookings.map(renderRow).join('');
  }

  if (overviewContainer) {
    overviewContainer.innerHTML = bookings.slice(0, 3).map(renderRow).join('');
  }
}

window.viewBookingDetails = function(bookingId) {
  const bookings = getStoredBookings();
  const b = bookings.find(item => item.id === bookingId);
  if (!b) return;

  alert(`Order ID: ${b.id}\nCapacity: ${b.capacity}\nType: ${b.waterType}\nDelivery Address: ${b.address}\nStatus: ${b.status}\nAssigned Tanker: ${b.tankerNo}\nDriver: ${b.driver}\nTotal: ${b.amount}`);
};

/* -------------------------------------------------------------------------
 * Delivery Tracker View
 * ------------------------------------------------------------------------- */
function initTrackerSimulation() {
  const bookings = getStoredBookings();
  const activeOrder = bookings.find(b => b.status === 'Out for Delivery') || bookings[0];
  if (activeOrder) {
    updateActiveDeliveryDisplay(activeOrder);
  }
}

function updateActiveDeliveryDisplay(order) {
  const trackIdEl = document.getElementById('track-order-id');
  const trackCapacityEl = document.getElementById('track-capacity');
  const trackAddressEl = document.getElementById('track-address');
  const trackEtaEl = document.getElementById('track-eta');
  const trackDriverEl = document.getElementById('track-driver-name');
  const trackTankerEl = document.getElementById('track-tanker-no');

  if (trackIdEl) trackIdEl.textContent = order.id;
  if (trackCapacityEl) trackCapacityEl.textContent = `${order.capacity} • ${order.waterType}`;
  if (trackAddressEl) trackAddressEl.textContent = order.address;
  if (trackEtaEl) trackEtaEl.textContent = order.eta || '25 mins';
  if (trackDriverEl) trackDriverEl.textContent = order.driver || 'Marcus Vance';
  if (trackTankerEl) trackTankerEl.textContent = order.tankerNo || 'TK-4029-SS (Food Grade)';
}

/* -------------------------------------------------------------------------
 * Invoices Table
 * ------------------------------------------------------------------------- */
function renderInvoicesTable() {
  const container = document.getElementById('dashboard-invoices-tbody');
  if (!container) return;

  const invoices = [
    { no: "INV-2026-904", date: "10 Nov 2026", desc: "10,000L Potable RO Supply", amount: "$175.00", status: "Paid" },
    { no: "INV-2026-872", date: "04 Nov 2026", desc: "3,000L Domestic Tanker", amount: "$75.00", status: "Paid" },
    { no: "INV-2026-811", date: "28 Oct 2026", desc: "12,000L Construction Bulk", amount: "$210.00", status: "Paid" },
    { no: "INV-2026-764", date: "15 Oct 2026", desc: "5,000L Community Storage", amount: "$95.00", status: "Paid" }
  ];

  container.innerHTML = invoices.map(inv => `
    <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
      <td class="py-4 px-4 font-mono font-bold text-sky-600 dark:text-sky-400 text-sm whitespace-nowrap">${inv.no}</td>
      <td class="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">${inv.date}</td>
      <td class="py-4 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">${inv.desc}</td>
      <td class="py-4 px-4 font-bold text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">${inv.amount}</td>
      <td class="py-4 px-4 whitespace-nowrap">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          ${inv.status}
        </span>
      </td>
      <td class="py-4 px-4 text-right whitespace-nowrap">
        <button onclick="downloadInvoiceMock('${inv.no}')" class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 text-xs font-semibold rounded-lg transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          PDF
        </button>
      </td>
    </tr>
  `).join('');
}

window.downloadInvoiceMock = function(invNo) {
  if (typeof showToast === 'function') {
    showToast(`Downloading official tax invoice ${invNo}...`, 'success');
  } else {
    alert(`Downloading invoice ${invNo}...`);
  }
};

/* -------------------------------------------------------------------------
 * Customer Profile Form
 * ------------------------------------------------------------------------- */
function initProfileForm() {
  const form = document.getElementById('dashboard-profile-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (typeof showToast === 'function') {
      showToast('Profile and saved delivery locations updated successfully!', 'success');
    }
  });
}

/* -------------------------------------------------------------------------
 * Support Request Form
 * ------------------------------------------------------------------------- */
function initSupportForm() {
  const form = document.getElementById('dashboard-support-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    if (typeof showToast === 'function') {
      showToast('Ticket #TK-5521 submitted. Dispatch operations team will contact you shortly.', 'success');
    }
  });
}

