// =============================================================
// AirOps Quiz – Webflow Embed (updated 2026-02-12)
// =============================================================
//
// WEBFLOW DESIGNER FIXES REQUIRED (cannot be fixed in code):
//
// 1. ROLE RADIO VALUES ARE SWAPPED — go to Step 1 and fix:
//    - "I set the strategy and own the budget (VP, CMO)"
//       → change value from "ic" to "executive"
//    - "I'm in the game every day doing the work (Writer, Ops…)"
//       → change value from "executive" to "ic"
//
// 2. COMPANY FIELD TYPE IS WRONG — go to Step 8 and change:
//    - Company input: change type from "email" to "text"
//
// =============================================================

const quizContent = {
  ic: [
    ["It\u2019s game day and your content isn\u2019t quite publish-ready. You:", [
      "Ship it now. Real-world feedback beats perfect planning.",
      "Hold it until it\u2019s ready. I don\u2019t publish anything below my standards.",
      "Rally the team to make one last pass. We\u2019re in this together.",
      "Stay up late to get it over the finish line. I do whatever it takes.",
      "Spin up a new AI workflow to refine and finalize.",
    ]],
    ["What\u2019s your approach to new AI tools and workflows?", [
      "AI handles 80% of the work, I finish up. Speed is the most important.",
      "I\u2019m constantly running new tools and playbooks. Experimentation is my edge.",
      "I\u2019m learning something new every week, but not an expert. This stuff is exciting.",
      "I focus on AI that enhances creativity and quality, not just speed.",
      "I think about how AI fits our content strategy before diving in.",
    ]],
    ["A major trend breaks in your space. Your move:", [
      "I start dreaming up what our unique and creative take is.",
      "I brainstorm a hot take to stir reactions in the market.",
      "I start thinking about Product, Sales, and CX could react.",
      "I have systems ready to respond quickly when trends hit.",
      "I move fast. First to market with a post or ad usually wins.",
    ]],
    ["How do you approach your work?", [
      "Quality-focused. Every piece should represent the best I can do.",
      "Strategic. I think about how my work connects to bigger goals.",
      "Adaptable. I figure out what each situation needs.",
      "Experimental. I\u2019m always testing new approaches or tools.",
      "Growth-oriented. I\u2019m early in my career but improving rapidly.",
    ]],
    ["How do you stay sharp and improve?", [
      "I love to learn. I ask questions and try new things constantly.",
      "I test every new tool hands-on and keep what works for me.",
      "I adapt my learning based on what projects are coming up.",
      "I\u2019ve built learning routines that keep me consistent.",
      "I learn by doing. I pick up skills as I ship work.",
    ]],
    ["When working with other teams or stakeholders, you:", [
      "Focus on delivering quickly and efficiently.",
      "Make sure the quality meets standards before sharing anything.",
      "Ask lots of questions to understand what would be most helpful.",
      "Build it, plan an enablement session, and follow-up to make sure it\u2019s used.",
      "Share insights about how this connects to bigger company goals.",
    ]],
  ],
  manager: [
    ["Your team\u2019s output quality is falling. What do you do?", [
      "We ship and learn from feedback. Perfect is the enemy of done.",
      "I run through the process myself to see where things are breaking.",
      "I build better quality checkpoints into our workflow.",
      "I set up coaching sessions to make sure they have the support they need.",
      "We experiment with new AI tools for quality control.",
    ]],
    ["How are you rolling out AI across your team?", [
      "Fast adoption. AI drafts, humans finish. We\u2019re shipping more than ever.",
      "I work with each team member to develop a personalized plan.",
      "Everyone is encouraged to suggest ideas and experiments.",
      "I think hard about AI helps us achieve our strategic goals.",
      "Carefully and slowly. I need to maintain our quality standards as we scale.",
    ]],
    ["AI search is changing how audiences find content. Your approach:", [
      "I rolled out a new AEO tool last year and we\u2019re experimenting fast.",
      "I\u2019ve assigned ownership and we\u2019re developing our systematic approach.",
      "I talking to a ton of colleagues and peers to come up with the best approach.",
      "I\u2019m practicing patience. It\u2019s an intense time with no perfect answers. We\u2019re learning.",
      "We\u2019re rethinking our stack and processes to set us up for this new era.",
    ]],
    ["Major industry trend breaks. How does your team handle it?", [
      "Run it through an LLM to create content and ship our response before the competition.",
      "I adapt our response based on team strengths and the specific trend.",
      "I designed our content calendar to be reactive, so we move things around to engage.",
      "I plan a working session for my team to chat this through together.",
      "We make sure we have something worth saying before committing resources.",
    ]],
    ["Your management style:", [
      "Adaptive. I meet each team member and situation where they are.",
      "Strategic. I help the team see how their work drives business results.",
      "Systems-focused. I build the infrastructure for team success.",
      "Experimental. We\u2019re always testing new approaches together.",
      "Results-driven. We focus on shipping and hitting our goals.",
    ]],
    ["How do you help your team grow?", [
      "I\u2019m hands-on, working alongside them and coaching as we go.",
      "I help them understand how their work connects to company strategy.",
      "I encourage them to experiment and try new approaches.",
      "I create clear processes and training so they can excel consistently.",
      "I push them to maintain high standards in everything they do.",
    ]],
  ],
  executive: [
    ["Your marketing org needs to 2x output next quarter. Your move:", [
      "Rally the team. We have untapped energy to unlock.",
      "Invest in a new AI tool. That\u2019s our force multiplier.",
      "Restructure priorities to align with the strategic shift.",
      "Think about how to maintain quality as we scale. No compromising brand.",
      "Have an honest conversation with the team that we\u2019ll need to push, together.",
    ]],
    ["Your approach to AI across the marketing organization:", [
      "It\u2019s central to our strategy. We\u2019re building an AI-native operation.",
      "We\u2019re implementing structured workflows that enable the whole team.",
      "Thoughtful investment. I need clear proof we won\u2019t product slop as we adopt.",
      "I need to understand exactly how it supports our strategy before investing.",
      "I\u2019m personally invested in the implications and opportunities for my team.",
    ]],
    ["AI search is reshaping buyer discovery. Your response:", [
      "We\u2019re repositioning proactively, org-wide. It\u2019s a board-level strategic priority.",
      "We\u2019re testing approaches across segments and use cases.",
      "Making sure we are still building for humans, not just bots.",
      "We\u2019re moving early and aggressively. We can\u2019t miss the competitive advantage.",
      "I\u2019m talking to my team to figure out where we need to upskill and invest.",
    ]],
    ["In times of uncertainty, how do you tell the story of marketing\u2019s impact:", [
      "Business growth. Business outcomes is always #1, the rest is fluff.",
      "Brand and quality. Long-term value can help us survive short-term disruption.",
      "Team learning and development. Our team is always getting closer to the win.",
      "Innovation. An experimental attitude wins, despite missteps along the way.",
      "Adaptability. We\u2019ll win if we are able to constantly assess and adapt.",
    ]],
    ["Your leadership approach:", [
      "Visionary. I set direction and align the organization around it.",
      "Quality-focused. I maintain standards and the organization rises to meet them.",
      "Innovation-driven. We stay ahead by moving early on opportunities.",
      "Growth-minded. I\u2019m personally invested in building organizational capability.",
      "Adaptive. I read situations and adjust our approach accordingly.",
    ]],
    ["When facing major organizational challenges, you:", [
      "Step back and develop a strategic plan that addresses root causes.",
      "Build new systems and processes to prevent similar issues.",
      "Talk to the team to understand and solve problems hands-on.",
      "Talk to other leaders to figure out what\u2019s worked for others.",
      "Focus on the foundations. You know what works. Just execute well.",
    ]],
  ],
};

const API_BASE = "https://campaign-quiz.vercel.app";

let currentStep = 1;
const totalSteps = 8;
let headshotBase64 = null;

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => parent.querySelectorAll(sel);

document.addEventListener("DOMContentLoaded", () => {
  showStep(1);
  setupNavigation();
  if (!$("#pulse-keyframes")) {
    const s = document.createElement("style");
    s.id = "pulse-keyframes";
    s.textContent = `@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:0.8}}`;
    document.head.appendChild(s);
  }
});

function fadeElement(el, fadeIn, duration = 300, cb) {
  if (!el) return;
  el.style.transition = `opacity ${duration / 1000}s ease-${fadeIn ? "in" : "out"}`;
  el.style.opacity = fadeIn ? "0" : "1";
  setTimeout(() => {
    el.style.opacity = fadeIn ? "1" : "0";
    if (!fadeIn) setTimeout(() => {
      el.style.display = "none";
      cb?.();
    }, duration);
    else {
      el.style.display = "block";
      cb?.();
    }
  }, fadeIn ? 50 : 0);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function updateStepContent(role) {
  const content = quizContent[role];
  if (!content) return;
  content.forEach(([title, options], i) => {
    const stepEl = $(`[data-step="${i + 2}"]`);
    if (!stepEl) return;
    const titleEl = $(".win-quiz_step-title", stepEl);
    if (titleEl) titleEl.textContent = title;
    $$(".w-form-label", stepEl).forEach((label, j) => {
      if (options[j]) label.textContent = options[j];
    });
  });
}

function showStep(step) {
  $$(".win-quiz_step").forEach((s) => s.classList.remove("is-active"));
  const el = $(`[data-step="${step}"]`);
  if (el) el.classList.add("is-active");
  $$(".win-quiz_progress-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i + 1 === step);
  });
  const backBtn = $("#back-btn");
  const nextBtn = $("#next-btn");
  const btnText = $(".button-text", nextBtn);
  backBtn.style.display = step === 1 ? "none" : "";
  nextBtn.classList.add("disabled");
  btnText.textContent = step === totalSteps ? "See my results" : "Continue";
  if (isStepValid(step)) nextBtn.classList.remove("disabled");
  if (step === 8) toggleConditionalFields();
  currentStep = step;
}

function toggleError(step, message, show = true) {
  const stepEl = $(`[data-step="${step}"]`);
  if (!stepEl) return;
  let err = $(".error-message", stepEl);
  if (show && message) {
    if (!err) {
      err = document.createElement("div");
      err.className = "error-message";
      Object.assign(err.style, {
        color: "#ef4444",
        fontSize: "14px",
        marginTop: "12px",
        fontWeight: "500"
      });
      ($(".win-quiz_form-content", stepEl) || stepEl).appendChild(err);
    }
    err.textContent = message;
    err.style.display = "block";
  } else if (err) {
    err.style.display = "none";
  }
}

function toggleConditionalFields() {
  const linkedin = $('input[name="linkedinUrl"]');
  const wrapper = $(".win-quiz_conditional-fields");
  if (!linkedin || !wrapper) return;
  const has = linkedin.value.trim() !== "";
  wrapper.style.display = has ? "none" : "";
  ["firstName", "lastName"].forEach((name) => {
    const input = $(`input[name="${name}"]`);
    if (input) has ? input.removeAttribute("required") : input.setAttribute("required", "required");
  });
}

function isStepValid(step) {
  const el = $(`[data-step="${step}"]`);
  if (step <= 7) return [...$$('input[type="radio"]', el)].some((r) => r.checked);
  const email = $('input[name="email"]', el);
  if (!email?.value.trim()) return false;
  if ($('input[name="linkedinUrl"]', el)?.value.trim()) return true;
  return $('input[name="firstName"]', el)?.value.trim() && $('input[name="lastName"]', el)?.value.trim();
}

function collectFormData() {
  const role = $('input[name="role"]:checked')?.value;
  const answers = [];
  for (let i = 1; i <= 6; i++) {
    const val = $(`input[name="${i}"]:checked`)?.value;
    if (val) answers.push({ question: i, answer: val });
  }
  const getVal = (name) => $(`input[name="${name}"]`)?.value.trim();
  const payload = {
    role,
    answers,
    email: getVal("email"),
    wantsDemo: !!$('#Book-a-demo')?.checked,
  };
  ["linkedinUrl", "firstName", "lastName", "company"].forEach((f) => {
    const v = getVal(f);
    if (v) payload[f] = v;
  });
  return payload;
}

function animateSubmission(start = true) {
  const formBlock = $(".win-quiz_form-block");
  const tagWrap = $(".win-quiz_tag-wrap");
  const logoWrap = $(".win-quiz_logo-wrap");
  const logo = $(".win-quiz_logo-wrap .win-quiz_logo");
  if (start) {
    fadeElement(formBlock, false, 300);
    fadeElement(tagWrap, false, 300);
    if (logoWrap) {
      logoWrap.style.transition = "height 0.5s ease-out";
      logoWrap.style.height = "48%";
      setTimeout(() => {
        if (logo) logo.style.animation = "pulse 1.5s ease-in-out infinite";
      }, 500);
    }
  } else {
    if (logo) logo.style.animation = "none";
    if (logoWrap) logoWrap.style.height = "";
    fadeElement(tagWrap, true, 50);
    fadeElement(formBlock, true, 50);
  }
}

async function uploadHeadshot(base64Data) {
  try {
    const res = await fetch(API_BASE + "/api/upload-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: base64Data,
        uniqueId: "headshot-" + Date.now(),
      }),
    });
    const data = await res.json();
    return data.url || "";
  } catch (err) {
    console.warn("Headshot upload failed:", err);
    return "";
  }
}

async function submitQuiz() {
  const nextBtn = $("#next-btn");
  const btnText = $(".button-text", nextBtn);
  const originalText = btnText.textContent;

  try {
    btnText.textContent = "Submitting...";
    nextBtn.classList.add("disabled");
    nextBtn.style.pointerEvents = "none";
    animateSubmission(true);

    const payload = collectFormData();

    // Validate answers before sending
    if (payload.answers.length !== 6) {
      throw new Error("Some quiz answers are missing. Please go back and answer all questions.");
    }

    // Upload headshot to blob storage first (avoids payload size limit)
    if (headshotBase64) {
      const headshotUrl = await uploadHeadshot(headshotBase64);
      if (headshotUrl) {
        payload.headshotUrl = headshotUrl;
      }
    }

    console.log("Submitting quiz data:", payload);

    const res = await fetch(API_BASE + "/api/submit-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMsg = "Server error (" + res.status + ")";
      try {
        const body = await res.json();
        if (body.error) errorMsg = body.error;
      } catch (_) {
        // response wasn't JSON
      }
      console.error("API error response:", res.status, errorMsg);
      throw new Error(errorMsg);
    }

    const result = await res.json();
    console.log("Quiz submitted successfully:", result);

    const logo = $(".win-quiz_logo-wrap .win-quiz_logo");
    if (logo) logo.style.animation = "none";

    const wrap = $(".win-quiz_result-btn-wrap");
    const btn = $("#results-btn");
    if (wrap && btn && result.userId) {
      btn.href = "/results?userId=" + result.userId;
      fadeElement(wrap, true, 500);
    } else {
      alert("Quiz submitted successfully!");
    }
  } catch (err) {
    console.error("Error submitting quiz:", err);
    toggleError(8, err.message || "Failed to submit quiz. Please try again.");
    btnText.textContent = originalText;
    nextBtn.classList.remove("disabled");
    nextBtn.style.pointerEvents = "";
    animateSubmission(false);
  }
}

function getStepNum(el) {
  return parseInt(el.closest(".win-quiz_step").getAttribute("data-step"));
}

function setupNavigation() {
  const nextBtn = $("#next-btn");
  $("#back-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (currentStep > 1) showStep(currentStep - 1);
  });
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isStepValid(currentStep)) {
      const hasLinkedIn = $('input[name="linkedinUrl"]')?.value.trim();
      toggleError(currentStep, currentStep <= 7
        ? "Please select an option to continue"
        : hasLinkedIn
          ? "Please fill in your Email to continue"
          : "Please fill in Email, First Name, and Last Name to continue"
      );
      return;
    }
    toggleError(currentStep, null, false);
    if (currentStep === 1) {
      const role = $('input[name="role"]:checked')?.value;
      if (role) updateStepContent(role);
    }
    currentStep < totalSteps ? showStep(currentStep + 1) : submitQuiz();
  });
  $$('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      toggleError(getStepNum(this), null, false);
      nextBtn.classList.remove("disabled");
    });
  });
  const linkedin = $('input[name="linkedinUrl"]');
  if (linkedin) {
    linkedin.addEventListener("input", function () {
      toggleConditionalFields();
      const s = getStepNum(this);
      if (isStepValid(s)) {
        toggleError(s, null, false);
        nextBtn.classList.remove("disabled");
      }
    });
  }
  const fileInput = $('input[type="file"]');
  if (fileInput) {
    fileInput.addEventListener("change", async function () {
      const file = this.files[0];
      if (!file) {
        headshotBase64 = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toggleError(8, "Image must be under 5MB.");
        this.value = "";
        headshotBase64 = null;
        return;
      }
      try {
        headshotBase64 = await fileToBase64(file);
        toggleError(8, null, false);
        if (isStepValid(8)) nextBtn.classList.remove("disabled");
      } catch {
        toggleError(8, "Failed to process image. Please try again.");
        headshotBase64 = null;
      }
    });
  }
  $$('input[name="email"], input[name="firstName"], input[name="lastName"], input[name="Book-a-demo"]').forEach((input) => {
    input.addEventListener(input.type === "checkbox" ? "change" : "input", function () {
      const s = getStepNum(this);
      if (isStepValid(s)) {
        toggleError(s, null, false);
        nextBtn.classList.remove("disabled");
      }
    });
  });
}
