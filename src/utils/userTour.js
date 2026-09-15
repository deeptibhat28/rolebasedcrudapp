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

function lockPageScroll() {
  const html = document.documentElement;
  const body = document.body;

  html.dataset.tourOverflow = html.style.overflow;
  body.dataset.tourOverflow = body.style.overflow;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
}

function unlockPageScroll() {
  const html = document.documentElement;
  const body = document.body;

  html.style.overflow = html.dataset.tourOverflow || "";
  body.style.overflow = body.dataset.tourOverflow || "";

  delete html.dataset.tourOverflow;
  delete body.dataset.tourOverflow;
}

// Track active driver instance globally to prevent overlapping/stacked popovers
let activeDriverObj = null;

export function startUserTour(hasSubmissions, username) {
  // If a tour is already running, destroy it first before starting a new one
  if (activeDriverObj) {
    try {
      activeDriverObj.destroy();
    } catch (e) {
      // Ignore cleanup errors if any
    }
    activeDriverObj = null;
  }

  const steps = [
    {
      element: "#dashboard-header",
      popover: {
        title: `Welcome${username ? `, ${username}` : ""}! 👋`,
        description:
          "Let's take a quick tour of your dashboard so you know exactly what you can do here.",
        side: "bottom",
        align: "center",
      },
    },
  ];

  if (targetExists('[data-tour="create-form-btn"]')) {
    steps.push({
      element: '[data-tour="create-form-btn"]',
      popover: {
        title: "Create a New Form",
        description: "Click here anytime to submit a new form entry.",
        side: "bottom",
        align: "start",
      },
    });
  }

  if (targetExists('[data-tour="theme-toggle"]')) {
    steps.push({
      element: '[data-tour="theme-toggle"]',
      popover: {
        title: "Light / Dark Mode",
        description:
          "Switch between light and dark theme based on your preference.",
        side: "bottom",
        align: "end",
      },
    });
  }

  if (targetExists('[data-tour="submissions-section"]')) {
    steps.push({
      element: '[data-tour="submissions-section"]',
      popover: {
        title: "My Submissions",
        description: "All the forms you've submitted show up here.",
        side: "bottom",
        align: "center",
      },
    });
  }

  if (hasSubmissions && targetExists('[data-tour="row-actions"]')) {
    steps.push({
      element: '[data-tour="row-actions"]',
      popover: {
        title: "Manage a Submission",
        description:
          "Use View to see full details, Edit to update it, or Delete to remove it permanently.",
        side: "bottom",
        align: "end",
      },
    });
  }

  if (targetExists('[data-tour="logout-btn"]')) {
    steps.push({
      element: '[data-tour="logout-btn"]',
      popover: {
        title: "Logout",
        description:
          "When you're done, click here to securely log out of your account.",
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
    overlayColor: "black",
    overlayOpacity: 0.65,
    stagePadding: 6,
    stageRadius: 12,
    popoverClass: "app-tour-popover",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Finish",
    scrollIntoViewOptions: false,
    steps,
    onHighlightStarted: (element) => {
      if (element) disableFocusScroll(element);
    },
    onDeselected: (element) => {
      if (element) restoreFocus(element);
    },
    onDestroyed: () => {
      unlockPageScroll();
      activeDriverObj = null;
    },
  });

  activeDriverObj.drive();
}