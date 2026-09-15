import { driver } from "driver.js";
import "driver.js/dist/driver.css";

function targetExists(selector) {
  return !!document.querySelector(selector);
}

function disableFocusScroll(el) {
  if (!el || el.__originalFocus) return;
  el.__originalFocus = el.focus.bind(el);
  el.focus = function (options) {
    el.__originalFocus({ preventScroll: true, ...(options || {}) });
  };
}

function restoreFocus(el) {
  if (el && el.__originalFocus) {
    el.focus = el.__originalFocus;
    delete el.__originalFocus;
  }
}

function injectTourStyles() {
  if (document.getElementById("app-tour-styles")) return;
  const style = document.createElement("style");
  style.id = "app-tour-styles";
  style.textContent = `
    .app-tour-scroll-lock {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .app-tour-scroll-lock::-webkit-scrollbar {
      display: none;
    }
    .driver-overlay {
      opacity: 0 !important;
    }
    #app-tour-blur-layer {
      position: fixed;
      inset: 0;
      background: rgba(10, 4, 20, 0.32);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      z-index: 9998;
      pointer-events: none;
    }
    .driver-popover.app-tour-popover {
      max-width: 320px;
      border-radius: 18px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
    }
  `;
  document.head.appendChild(style);
}

function blockScroll(e) {
  e.preventDefault();
}

function lockPageScroll() {
  document.documentElement.classList.add("app-tour-scroll-lock");
  document.body.classList.add("app-tour-scroll-lock");
  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
}

function unlockPageScroll() {
  document.documentElement.classList.remove("app-tour-scroll-lock");
  document.body.classList.remove("app-tour-scroll-lock");
  window.removeEventListener("wheel", blockScroll, { passive: false });
  window.removeEventListener("touchmove", blockScroll, { passive: false });
}

let blurLayer = null;

function createBlurLayer() {
  if (blurLayer) return blurLayer;
  blurLayer = document.createElement("div");
  blurLayer.id = "app-tour-blur-layer";
  document.body.appendChild(blurLayer);
  return blurLayer;
}

function removeBlurLayer() {
  if (blurLayer) {
    blurLayer.remove();
    blurLayer = null;
  }
}

function updateBlurCutout(element) {
  if (!blurLayer) return;
  if (!element) {
    blurLayer.style.clipPath = "";
    return;
  }
  const padding = 6;
  const rect = element.getBoundingClientRect();
  const x1 = Math.max(rect.left - padding, 0);
  const y1 = Math.max(rect.top - padding, 0);
  const x2 = rect.right + padding;
  const y2 = rect.bottom + padding;

  blurLayer.style.clipPath = `polygon(evenodd, 0px 0px, 100vw 0px, 100vw 100vh, 0px 100vh, 0px 0px, ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px, ${x2}px ${y1}px, ${x1}px ${y1}px)`;
}

// Track active driver instance globally to prevent overlapping/stacked popovers
let activeDriverObj = null;

export function startAdminTour(username) {
  // If a tour is already running, destroy it first before starting a new one
  if (activeDriverObj) {
    try {
      activeDriverObj.destroy();
    } catch (e) {
      // Ignore cleanup errors if any
    }
    activeDriverObj = null;
  }

  injectTourStyles();
  createBlurLayer();

  let syncHandler = null;

  const steps = [];

  if (targetExists("#admin-dashboard-header")) {
    steps.push({
      element: "#admin-dashboard-header",
      popover: {
        title: `Welcome, ${username ? username : "Admin"} 👋`,
        description:
          "Here's a quick walkthrough of everything you can do from the Admin Control Panel.",
        side: "bottom",
        align: "center",
      },
    });
  } else {
    steps.push({
      popover: {
        title: `Welcome, ${username ? username : "Admin"} 👋`,
        description:
          "Here's a quick walkthrough of everything you can do from the Admin Control Panel.",
      },
    });
  }

  if (targetExists('[data-tour="theme-toggle-admin"]')) {
    steps.push({
      element: '[data-tour="theme-toggle-admin"]',
      popover: {
        title: "Light / Dark Mode",
        description: "Switch between light and dark theme anytime.",
        side: "bottom",
        align: "center",
      },
    });
  }

  if (targetExists('[data-tour="all-submissions-btn"]')) {
    steps.push({
      element: '[data-tour="all-submissions-btn"]',
      popover: {
        title: "All Submissions",
        description: "View every form submitted by every user in one place.",
        side: "bottom",
        align: "center",
      },
    });
  }

  if (targetExists('[data-tour="activity-logs-btn"]')) {
    steps.push({
      element: '[data-tour="activity-logs-btn"]',
      popover: {
        title: "Activity Logs",
        description:
          "See a full audit trail of user actions — logins, logouts, form creation, edits, and deletions.",
        side: "bottom",
        align: "center",
      },
    });
  }

  if (targetExists('[data-tour="stat-total-users"]')) {
    steps.push({
      element: '[data-tour="stat-total-users"]',
      popover: {
        title: "Total Users",
        description:
          "Shows how many registered users you have. Click this card anytime to see the full user list.",
        side: "bottom",
        align: "start",
      },
    });
  }

  if (targetExists('[data-tour="stat-total-submissions"]')) {
    steps.push({
      element: '[data-tour="stat-total-submissions"]',
      popover: {
        title: "Total Submissions",
        description:
          "The total number of form submissions across all users. Click to jump into the full list.",
        side: "bottom",
        align: "center",
      },
    });
  }

  if (targetExists('[data-tour="stat-submissions-today"]')) {
    steps.push({
      element: '[data-tour="stat-submissions-today"]',
      popover: {
        title: "Submissions Today",
        description: "Quickly see how many forms were submitted today.",
        side: "bottom",
        align: "end",
      },
    });
  }

  if (targetExists('[data-tour="admin-logout-btn"]')) {
    steps.push({
      element: '[data-tour="admin-logout-btn"]',
      popover: {
        title: "Logout",
        description: "Click here to securely log out of the admin panel.",
        side: "bottom",
        align: "end",
      },
    });
  }

  window.scrollTo({ top: 0, left: 0 });
  lockPageScroll();

  activeDriverObj = driver({
    showProgress: true,
    animate: false,
    smoothScroll: false,
    overlayOpacity: 0,
    stagePadding: 6,
    stageRadius: 12,
    popoverClass: "app-tour-popover",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Finish",
    steps,
    onHighlightStarted: (element) => {
      if (!element) {
        updateBlurCutout(null);
        return;
      }
      disableFocusScroll(element);
      element.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
    },
    onHighlighted: (element) => {
      updateBlurCutout(element);
      if (syncHandler) {
        window.removeEventListener("scroll", syncHandler, true);
        window.removeEventListener("resize", syncHandler);
      }
      syncHandler = () => updateBlurCutout(element);
      window.addEventListener("scroll", syncHandler, true);
      window.addEventListener("resize", syncHandler);
    },
    onDeselected: (element) => {
      if (element) restoreFocus(element);
      if (syncHandler) {
        window.removeEventListener("scroll", syncHandler, true);
        window.removeEventListener("resize", syncHandler);
        syncHandler = null;
      }
    },
    onDestroyed: () => {
      unlockPageScroll();
      removeBlurLayer();
      activeDriverObj = null;
      if (syncHandler) {
        window.removeEventListener("scroll", syncHandler, true);
        window.removeEventListener("resize", syncHandler);
        syncHandler = null;
      }
    },
  });

  activeDriverObj.drive();
}