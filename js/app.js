"use strict";
(() => {
  const D = window.StudioData,
    $ = (s) => document.querySelector(s),
    $$ = (s) => Array.from(document.querySelectorAll(s));
  const STORAGE = "seedance-director-studio:v1",
    STATUSES = ["Draft", "Generating", "Upscaled", "Edited"];
  const numeric = (v, min, max) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  const initial = () => ({
    schema: 1,
    theme: "system",
    prompt: { ...D.defaults },
    shots: [],
    checks: [],
    runtime: { target: 360, clip: 5, takes: 3, rate: null },
  });
  let state = initial(),
    saveTimer,
    toastTimer,
    installEvent,
    registration,
    confirmation,
    reloadOnControllerChange = false;
  function text(tag, value, cls) {
    const e = document.createElement(tag);
    e.textContent = value;
    if (cls) e.className = cls;
    return e;
  }
  function button(label, callback, cls = "button small") {
    const e = text("button", label, cls);
    e.type = "button";
    e.addEventListener("click", callback);
    return e;
  }
  function validate(value) {
    if (
      !value ||
      value.schema !== 1 ||
      !["system", "dark", "light"].includes(value.theme)
    )
      throw Error("Unsupported project version or theme.");
    const p = value.prompt;
    if (!p || typeof p !== "object")
      throw Error("Prompt settings are missing.");
    for (const [key, list] of Object.entries(D.options))
      if (!list.includes(p[key])) throw Error("Invalid " + key + " selection.");
    for (const key of ["subject", "action", "environment", "tone", "avoid"])
      if (typeof p[key] !== "string" || p[key].length > 1500)
        throw Error("Invalid prompt text.");
    if (
      !Number.isInteger(p.motion) ||
      !numeric(p.motion, 1, 10) ||
      ![5, 10].includes(p.duration) ||
      ![24, 30, 60].includes(p.fps) ||
      !Number.isInteger(p.seed) ||
      !numeric(p.seed, 0, 4294967295) ||
      typeof p.seedLocked !== "boolean"
    )
      throw Error("Invalid technical settings.");
    if (!Array.isArray(value.shots) || value.shots.length > 500)
      throw Error("Project supports up to 500 shots.");
    const ids = new Set();
    for (const s of value.shots) {
      if (
        !s ||
        typeof s.id !== "string" ||
        s.id.length > 100 ||
        ids.has(s.id) ||
        typeof s.title !== "string" ||
        !s.title.trim() ||
        s.title.length > 160 ||
        typeof s.prompt !== "string" ||
        s.prompt.length > 12000 ||
        !numeric(s.seconds, 0.1, 3600) ||
        !D.options.camera.includes(s.camera) ||
        !STATUSES.includes(s.status)
      )
        throw Error("Invalid or duplicate shot data.");
      ids.add(s.id);
    }
    if (
      !Array.isArray(value.checks) ||
      value.checks.some((v) => !D.checklist.some((c) => c.id === v))
    )
      throw Error("Invalid checklist data.");
    const r = value.runtime;
    if (
      !r ||
      !Number.isInteger(r.target) ||
      !numeric(r.target, 1, 86400) ||
      ![5, 10].includes(r.clip) ||
      ![3, 4].includes(r.takes) ||
      (r.rate !== null && !numeric(r.rate, 0, 1000000))
    )
      throw Error("Invalid runtime settings.");
    return {
      schema: 1,
      theme: value.theme,
      prompt: Object.fromEntries(Object.keys(D.defaults).map((k) => [k, p[k]])),
      shots: value.shots.map((s) => ({
        id: s.id,
        title: s.title,
        prompt: s.prompt,
        seconds: s.seconds,
        camera: s.camera,
        status: s.status,
      })),
      checks: [...new Set(value.checks)],
      runtime: { target: r.target, clip: r.clip, takes: r.takes, rate: r.rate },
    };
  }
  function notify(message) {
    clearTimeout(toastTimer);
    $("#toast").hidden = false;
    $("#toast").textContent = message;
    toastTimer = setTimeout(() => {
      $("#toast").hidden = true;
    }, 4000);
  }
  function save() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
      $("#storage-warning").hidden = true;
    } catch {
      $("#storage-warning").hidden = false;
    }
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 250);
  }
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) state = validate(JSON.parse(raw));
  } catch {
    notify(
      "Stored data could not be loaded. A fresh session is open; export it before closing.",
    );
    $("#storage-warning").hidden = false;
  }
  function askConfirm(message, callback) {
    if (confirmation) return;
    $("#confirm-message").textContent = message;
    confirmation = callback;
    $("#confirm-dialog").showModal();
  }
  $("#confirm-yes").addEventListener("click", () => {
    const action = confirmation;
    confirmation = null;
    $("#confirm-dialog").close();
    if (action) action();
  });
  $("#confirm-no").addEventListener("click", () =>
    $("#confirm-dialog").close(),
  );
  $("#confirm-dialog").addEventListener("close", () => {
    confirmation = null;
  });
  $$(".close-dialog").forEach((b) =>
    b.addEventListener("click", () => b.closest("dialog").close()),
  );
  const darkPreference = matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const t =
      state.theme === "system"
        ? darkPreference.matches
          ? "dark"
          : "light"
        : state.theme;
    document.documentElement.dataset.theme = t;
    document.querySelector('meta[name="theme-color"]').content =
      t === "dark" ? "#080A0F" : "#F2F4F8";
    $("#theme-toggle").setAttribute(
      "aria-label",
      "Switch to " + (t === "dark" ? "light" : "dark") + " theme",
    );
    $("#theme-preference").value = state.theme;
  }
  applyTheme();
  darkPreference.addEventListener("change", () => {
    if (state.theme === "system") applyTheme();
  });
  $("#theme-toggle").addEventListener("click", () => {
    state.theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme();
    save();
  });
  $("#theme-preference").addEventListener("change", (e) => {
    state.theme = e.target.value;
    applyTheme();
    save();
  });
  function route(focus = false) {
    const key = location.hash.slice(1) || "hub",
      valid = ["hub", "studio", "toolkit", "glossary", "readiness"],
      view = valid.includes(key) ? key : "hub";
    $$(".view").forEach((e) => {
      e.hidden = e.id !== "view-" + view;
    });
    $$(".main-nav a").forEach((a) => {
      if (a.dataset.view === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    document.title =
      (view === "hub"
        ? "Independent AI Film Companion"
        : {
            studio: "Prompt Studio",
            toolkit: "Production Toolkit",
            glossary: "Cinema Glossary",
            readiness: "Submission Readiness",
          }[view]) + " — Seedance Director Studio";
    if (focus) {
      $("#main").focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  window.addEventListener("hashchange", () => route(true));
  route();
  function populateSelect(id, list) {
    const select = $("#" + id);
    for (const item of list) {
      const opt = text("option", item);
      opt.value = item;
      select.append(opt);
    }
  }
  for (const [name, values] of Object.entries(D.options))
    populateSelect(name, values);
  populateSelect("shot-camera", D.options.camera);
  populateSelect("glossary-category", D.categories);
  function hydratePrompt() {
    for (const key of Object.keys(D.defaults)) {
      const e = $('#prompt-form [name="' + key + '"]');
      if (e) e.value = state.prompt[key];
    }
    updateSeedUI();
    renderPrompt();
  }
  function updateSeedUI() {
    const locked = state.prompt.seedLocked;
    $("#lock-seed").setAttribute("aria-pressed", String(locked));
    $("#lock-seed").textContent = locked ? "Locked" : "Lock";
    $("#random-seed").disabled = locked;
    $("#seed").readOnly = locked;
  }
  function compile(p) {
    const strength =
      p.motion <= 3 ? "restrained" : p.motion <= 6 ? "measured" : "energetic";
    return [
      p.subject.trim() || "Define the subject.",
      p.action.trim() || "Define one clear action.",
      "Environment: " +
        (p.environment.trim() || "Define a specific location.") +
        ".",
      "Emotional tone: " + (p.tone.trim() || "Intentional and cinematic") + ".",
      p.shot + "; " + p.lens + " lens intent; " + p.lighting + " lighting.",
      "Camera: " +
        p.camera +
        ". " +
        strength.charAt(0).toUpperCase() +
        strength.slice(1) +
        " movement (" +
        p.motion +
        "/10 creative intensity).",
      "Maintain coherent anatomy, scene geometry and character identity.",
      p.avoid.trim() ? "Review / avoidance notes: " + p.avoid.trim() : "",
      "",
      "STUDIO PLANNING METADATA — NOT API FLAGS",
      "--plan-mode " +
        {
          "Text-to-Video (T2V)": "t2v",
          "Image-to-Video (I2V)": "i2v",
          "First / Last Frame Interpolation": "first-last",
        }[p.mode] +
        " --plan-ratio " +
        p.ratio +
        " --plan-duration " +
        p.duration +
        "s",
      "--plan-delivery-fps " +
        p.fps +
        " --plan-seed " +
        p.seed +
        " --plan-motion " +
        p.motion,
      p.mode === D.options.mode[1]
        ? "Reference required: provide an authorized starting frame in your generation tool."
        : p.mode === D.options.mode[2]
          ? "References required: provide compatible authorized first and last frames in a supporting model."
          : "",
    ]
      .filter((s, i, a) => s !== "" || i === a.indexOf(""))
      .join("\n");
  }
  function renderPrompt() {
    $("#prompt-output").textContent = compile(state.prompt);
    $("#motion-value").textContent = state.prompt.motion + " / 10";
  }
  $("#prompt-form").addEventListener("input", (e) => {
    const name = e.target.name;
    if (!Object.hasOwn(D.defaults, name)) return;
    const v = ["motion", "duration", "fps", "seed"].includes(name)
      ? Number(e.target.value)
      : e.target.value;
    if (name === "seed" && (!Number.isInteger(v) || v < 0 || v > 4294967295))
      return;
    state.prompt[name] = v;
    renderPrompt();
    scheduleSave();
  });
  $("#prompt-form").addEventListener("submit", (e) => e.preventDefault());
  $("#lock-seed").addEventListener("click", () => {
    state.prompt.seedLocked = !state.prompt.seedLocked;
    updateSeedUI();
    save();
  });
  $("#random-seed").addEventListener("click", () => {
    if (state.prompt.seedLocked) return;
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    state.prompt.seed = arr[0];
    $("#seed").value = arr[0];
    renderPrompt();
    save();
  });
  async function copy(value, trigger) {
    try {
      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(value);
          copied = true;
        } catch {}
      }
      if (!copied) {
        const active = document.activeElement,
          area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("aria-label", "Clipboard fallback");
        area.style.cssText =
          "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";
        (document.querySelector("dialog[open]") || document.body).append(area);
        area.focus();
        area.select();
        copied = document.execCommand("copy");
        area.remove();
        if (active && active.focus) active.focus({ preventScroll: true });
        if (!copied) throw Error("Clipboard is blocked.");
      }
      notify("Copied to Clipboard!");
      if (navigator.vibrate) navigator.vibrate(15);
      if (trigger) {
        if (trigger.dataset.copyTimer)
          clearTimeout(Number(trigger.dataset.copyTimer));
        if (!trigger.dataset.originalLabel)
          trigger.dataset.originalLabel = trigger.textContent;
        trigger.textContent = "Copied! ✓";
        trigger.classList.add("is-copied");
        trigger.dataset.copyTimer = String(
          setTimeout(() => {
            trigger.textContent = trigger.dataset.originalLabel;
            trigger.classList.remove("is-copied");
            delete trigger.dataset.copyTimer;
          }, 1800),
        );
      }
    } catch {
      notify(
        "Clipboard blocked. Select the text and use your device’s Copy command.",
      );
    }
  }
  $("#copy-prompt").addEventListener("click", (e) =>
    copy(compile(state.prompt), e.currentTarget),
  );
  function renderPresets() {
    const frag = document.createDocumentFragment();
    for (const p of D.presets) {
      const card = text("article", "", "card preset-card");
      card.append(
        text("span", p.genre, "eyebrow cyan"),
        text("h3", p.title),
        text("p", p.description),
      );
      const row = text("div", "", "button-row");
      row.append(
        button("Copy prompt", (e) => copy(compile(p.values), e.currentTarget)),
        button("Load into studio", () => {
          const priorSeed = state.prompt.seed,
            locked = state.prompt.seedLocked;
          state.prompt = {
            ...p.values,
            seed: locked ? priorSeed : p.values.seed,
            seedLocked: locked,
          };
          hydratePrompt();
          save();
          $("#subject").focus();
          $("#prompt-form").scrollIntoView({
            block: "start",
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
          });
          notify("Preset loaded. Make it your own.");
        }),
      );
      card.append(row);
      frag.append(card);
    }
    $("#presets").replaceChildren(frag);
  }
  function durationLabel(v) {
    const rounded = Math.round(v * 10) / 10;
    return (
      Math.floor(rounded / 60) +
      ":" +
      String(Math.floor(rounded % 60)).padStart(2, "0") +
      (rounded % 1 ? "." + Math.round((rounded % 1) * 10) : "")
    );
  }
  function renderShots(focusId) {
    const root = $("#shot-list");
    root.replaceChildren();
    $("#shot-count").textContent = state.shots.length;
    $("#shot-runtime").textContent = durationLabel(
      state.shots.reduce((a, s) => a + s.seconds, 0),
    );
    $("#shot-edited").textContent = state.shots.filter(
      (s) => s.status === "Edited",
    ).length;
    if (!state.shots.length) {
      const empty = text("div", "", "empty-state");
      empty.append(
        text("strong", "A blank timeline. Infinite possibilities."),
        text(
          "p",
          "Add your first shot, or send a direction brief here from Prompt Studio.",
        ),
      );
      empty.append(button("Create first shot", () => openShot()));
      root.append(empty);
      return;
    }
    state.shots.forEach((s, i) => {
      const article = text("article", "", "shot-card");
      article.dataset.id = s.id;
      article.append(
        text("span", String(i + 1).padStart(2, "0"), "shot-order"),
      );
      const body = document.createElement("div");
      body.append(text("h3", s.title));
      const meta = text("div", "", "shot-details");
      meta.append(
        text("span", s.seconds + " seconds"),
        text("span", s.camera),
        text("span", s.status),
      );
      body.append(meta, text("p", s.prompt, "shot-excerpt"));
      const actions = text("div", "", "shot-actions");
      actions.append(
        button("Edit", () => openShot(s)),
        button("Copy", (e) => copy(s.prompt, e.currentTarget)),
      );
      for (const [label, delta] of [
        ["↑ Move up", -1],
        ["↓ Move down", 1],
      ]) {
        const b = button(label, () => {
          const j = state.shots.findIndex((v) => v.id === s.id),
            k = j + delta;
          if (k < 0 || k >= state.shots.length) return;
          [state.shots[j], state.shots[k]] = [state.shots[k], state.shots[j]];
          save();
          renderShots(s.id);
          notify("Shot moved to position " + (k + 1) + ".");
        });
        b.setAttribute("aria-label", label + " — " + s.title);
        b.disabled = i + delta < 0 || i + delta >= state.shots.length;
        actions.append(b);
      }
      actions.append(
        button(
          "Delete",
          () =>
            askConfirm(
              "Delete “" + s.title + "”? This cannot be undone.",
              () => {
                state.shots = state.shots.filter((v) => v.id !== s.id);
                save();
                renderShots();
                $("#new-shot").focus();
                notify("Shot deleted.");
              },
            ),
          "button small danger",
        ),
      );
      body.append(actions);
      article.append(body);
      root.append(article);
    });
    if (focusId) {
      const el = Array.from(root.children).find(
        (e) => e.dataset.id === focusId,
      );
      if (el) el.querySelector("button").focus({ preventScroll: true });
    }
  }
  function openShot(shot, fromPrompt = false) {
    if (!shot && state.shots.length >= 500) {
      notify(
        "500-shot project limit reached. Export and start another project.",
      );
      return;
    }
    $("#shot-id").value = shot?.id || "";
    $("#shot-title").value = shot?.title || "";
    $("#shot-prompt").value =
      shot?.prompt || (fromPrompt ? compile(state.prompt) : "");
    $("#shot-seconds").value =
      shot?.seconds || (fromPrompt ? state.prompt.duration : 5);
    $("#shot-camera").value = shot?.camera || state.prompt.camera;
    $("#shot-status").value = shot?.status || "Draft";
    $("#shot-dialog-title").textContent = shot ? "Edit shot" : "Add shot";
    $("#shot-dialog").showModal();
    $("#shot-title").focus();
  }
  $("#new-shot").addEventListener("click", () => openShot());
  $("#prompt-to-shot").addEventListener("click", () => openShot(null, true));
  $("#shot-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#shot-id").value || crypto.randomUUID(),
      item = {
        id,
        title: $("#shot-title").value.trim(),
        prompt: $("#shot-prompt").value.trim(),
        seconds: Number($("#shot-seconds").value),
        camera: $("#shot-camera").value,
        status: $("#shot-status").value,
      };
    if (!item.title || !item.prompt) {
      notify("Enter a shot title and direction brief.");
      return;
    }
    const i = state.shots.findIndex((s) => s.id === id);
    if (i < 0) state.shots.push(item);
    else state.shots[i] = item;
    save();
    renderShots();
    $("#shot-dialog").close();
    notify("Shot saved to your production plan.");
  });
  function markdown() {
    const clean = (s) => s.replace(/^#{1,6}\s/gm, "").replace(/\r/g, "");
    return (
      "# Seedance Director Studio — Shot List\n\n" +
      state.shots
        .map(
          (s, i) =>
            "## " +
            (i + 1) +
            ". " +
            clean(s.title).replace(/\n/g, " ") +
            "\n\n- Duration: " +
            s.seconds +
            "s\n- Camera: " +
            s.camera +
            "\n- Status: " +
            s.status +
            "\n\n" +
            clean(s.prompt),
        )
        .join("\n\n---\n\n") +
      "\n\nTotal planned runtime: " +
      durationLabel(state.shots.reduce((a, s) => a + s.seconds, 0))
    );
  }
  function csv() {
    const cell = (v) =>
      '"' +
      String(v)
        .replace(/^[\s]*[=+@\-]/, "'$&")
        .replace(/"/g, '""') +
      '"';
    return (
      "\ufeff" +
      [
        ["Shot", "Title", "Duration seconds", "Camera", "Status", "Prompt"],
        ...state.shots.map((s, i) => [
          i + 1,
          s.title,
          s.seconds,
          s.camera,
          s.status,
          s.prompt,
        ]),
      ]
        .map((r) => r.map(cell).join(","))
        .join("\r\n")
    );
  }
  function requireShots(fn) {
    if (!state.shots.length) {
      notify("Add a shot before exporting the list.");
      return;
    }
    fn();
  }
  $("#copy-markdown").addEventListener("click", (e) =>
    requireShots(() => copy(markdown(), e.currentTarget)),
  );
  $("#copy-csv").addEventListener("click", (e) =>
    requireShots(() => copy(csv(), e.currentTarget)),
  );
  function download(name, content, type) {
    const blob =
        content instanceof Blob ? content : new Blob([content], { type }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  $("#export-csv").addEventListener("click", () =>
    requireShots(() =>
      download("seedance-shot-list.csv", csv(), "text/csv;charset=utf-8"),
    ),
  );
  function renderRuntime() {
    const r = state.runtime;
    $("#target-runtime").value = r.target;
    $("#clip-duration").value = r.clip;
    $("#takes").value = r.takes;
    $("#credit-rate").value = r.rate ?? "";
    calculate();
  }
  function calculate() {
    const r = state.runtime,
      shots = Math.ceil(r.target / r.clip),
      renders = shots * r.takes,
      values = [
        [shots, "minimum usable shots"],
        [renders, "estimated renders at " + r.takes + "× takes"],
        [(shots / (r.target / 60)).toFixed(1), "planned shots per minute"],
        [
          (Math.max(0, shots - 1) / (r.target / 60)).toFixed(1),
          "internal cuts per minute",
        ],
        [Math.max(0, shots - 1), "internal cut points"],
      ];
    if (r.rate !== null)
      values.push([
        (renders * r.rate).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }),
        "estimated credits at your entered rate",
      ]);
    else
      values.push(["Not priced", "enter a provider rate to estimate credits"]);
    const root = $("#runtime-result");
    root.replaceChildren();
    for (const [v, label] of values) {
      const e = document.createElement("div");
      e.append(text("strong", String(v)), text("span", label));
      root.append(e);
    }
    root.append(
      text(
        "p",
        "Estimate = ceil(target seconds ÷ usable seconds per shot) × takes. This omits transitions, handles and unused footage. The final shot can be trimmed. The award page currently specifies 300–420 seconds.",
        "field-help",
      ),
    );
  }
  $("#runtime-form").addEventListener("submit", (e) => e.preventDefault());
  $("#runtime-form").addEventListener("input", () => {
    if (!$("#runtime-form").checkValidity()) return;
    state.runtime = {
      target: Number($("#target-runtime").value),
      clip: Number($("#clip-duration").value),
      takes: Number($("#takes").value),
      rate:
        $("#credit-rate").value === "" ? null : Number($("#credit-rate").value),
    };
    calculate();
    scheduleSave();
  });
  function renderGlossary() {
    const query = $("#glossary-search").value.toLocaleLowerCase().trim(),
      cat = $("#glossary-category").value,
      terms = D.glossary.filter(
        (t) =>
          (cat === "all" || t.category === cat) &&
          [t.term, t.definition, t.snippet]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query),
      ),
      frag = document.createDocumentFragment();
    for (const t of terms) {
      const card = text("article", "", "card glossary-card");
      card.append(
        text("span", t.category, "eyebrow cyan"),
        text("h2", t.term),
        text("p", t.definition),
        text("blockquote", t.snippet),
      );
      const actions = text("div", "", "button-row");
      actions.append(
        button("Copy definition", (e) =>
          copy(t.term + "\n\n" + t.definition, e.currentTarget),
        ),
        button("Copy modifier", (e) => copy(t.snippet, e.currentTarget)),
      );
      card.append(actions);
      frag.append(card);
    }
    if (!terms.length) {
      const e = text("div", "", "empty-state");
      e.append(
        text("strong", "No matching terms."),
        text("p", "Try a broader phrase or choose All categories."),
      );
      frag.append(e);
    }
    $("#glossary-list").replaceChildren(frag);
    $("#glossary-count").textContent =
      terms.length + " / " + D.glossary.length + " TERMS";
  }
  $("#glossary-search").addEventListener("input", renderGlossary);
  $("#glossary-category").addEventListener("change", renderGlossary);
  function checklistProgress() {
    const n = state.checks.length,
      total = D.checklist.length,
      percent = Math.round((n / total) * 100);
    $("#checklist-label").textContent = n + " of " + total + " completed";
    $("#checklist-percent").textContent = percent + "%";
    $("#checklist-progress").value = percent;
  }
  function renderChecklist() {
    const root = $("#checklist");
    root.replaceChildren();
    let group = "";
    for (const c of D.checklist) {
      if (c.group !== group) {
        group = c.group;
        root.append(text("h3", group, "check-group"));
      }
      const label = text("label", "", "check-row"),
        input = document.createElement("input");
      input.type = "checkbox";
      input.checked = state.checks.includes(c.id);
      input.dataset.check = c.id;
      const detail = document.createElement("span");
      detail.append(text("strong", c.title), text("small", c.detail));
      label.append(input, detail);
      root.append(label);
      input.addEventListener("change", () => {
        state.checks = input.checked
          ? [...new Set([...state.checks, c.id])]
          : state.checks.filter((id) => id !== c.id);
        save();
        checklistProgress();
      });
    }
    checklistProgress();
  }
  $("#settings-button").addEventListener("click", () =>
    $("#settings-dialog").showModal(),
  );
  $("#export-project").addEventListener("click", () => {
    save();
    download(
      "seedance-project-" + new Date().toISOString().slice(0, 10) + ".json",
      JSON.stringify(state, null, 2),
      "application/json",
    );
    notify("Project backup exported. Keep it somewhere safe.");
  });
  $("#import-project").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8000000) {
      notify("Import rejected: maximum file size is 8 MB.");
      return;
    }
    try {
      const candidate = validate(JSON.parse(await file.text()));
      askConfirm(
        "Replace this device’s current workspace with “" +
          file.name +
          "”? Export your current project first if needed.",
        () => {
          state = candidate;
          save();
          hydrateAll();
          notify("Project imported successfully.");
        },
      );
    } catch (err) {
      notify("Import rejected: " + err.message);
    }
  });
  $("#reset-workspace").addEventListener("click", () =>
    askConfirm(
      "Permanently clear the current prompt, shots and checklist? Export a backup first. This cannot be undone.",
      () => {
        state = initial();
        save();
        hydrateAll();
        notify("Workspace reset.");
      },
    ),
  );
  function hydrateAll() {
    applyTheme();
    hydratePrompt();
    renderShots();
    renderRuntime();
    renderChecklist();
  }
  hydrateAll();
  renderPresets();
  renderGlossary();
  function connection() {
    const online = navigator.onLine;
    $("#connection").textContent = online
      ? "Online"
      : "Offline Mode — All Tools Active";
    $("#connection").classList.toggle("offline", !online);
    $("#connection").title =
      "Connection hint only; cached tools need no network.";
  }
  window.addEventListener("online", connection);
  window.addEventListener("offline", connection);
  connection();
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvent = e;
    $("#install-button").hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    installEvent = null;
    $("#install-button").hidden = true;
    notify("Studio installed. Your next film starts here.");
  });
  if (matchMedia("(display-mode: standalone)").matches || navigator.standalone)
    $("#install-button").hidden = true;
  $("#install-button").addEventListener("click", async () => {
    if (installEvent) {
      const ev = installEvent;
      installEvent = null;
      try {
        await ev.prompt();
        const choice = await ev.userChoice;
        notify(
          choice.outcome === "accepted"
            ? "Installation requested."
            : "You can install later from your browser menu.",
        );
      } catch {
        $("#install-dialog").showModal();
      }
    } else $("#install-dialog").showModal();
  });
  $("#export-assets").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    b.classList.add("loading");
    const original = b.textContent;
    b.textContent = "Building icon pack…";
    try {
      await new Promise((r) => setTimeout(r, 30));
      const blob = await window.StudioAssets.browserPack();
      download("seedance-pwa-assets.zip", blob);
      notify("Complete icon, OG, favicon and screenshot pack exported.");
    } catch {
      notify("Asset export failed. Use the included Node generator instead.");
    } finally {
      b.disabled = false;
      b.classList.remove("loading");
      b.textContent = original;
    }
  });
  function watchWorker(reg) {
    registration = reg;
    const ready = () => {
      $("#cache-status").textContent =
        "Offline ready · all five tools cached on this device.";
    };
    if (reg.active) ready();
    if (reg.waiting) $("#update-banner").hidden = false;
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") {
          if (navigator.serviceWorker.controller)
            $("#update-banner").hidden = false;
          else ready();
        }
      });
    });
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(watchWorker).catch(() => {});
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading || !reloadOnControllerChange) return;
      reloading = true;
      location.reload();
    });
  }
  $("#update-button").addEventListener("click", () => {
    save();
    if (registration?.waiting) {
      reloadOnControllerChange = true;
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else notify("Update is not available yet.");
  });
  $("#check-update").addEventListener("click", async () => {
    if (!registration) {
      notify("Offline caching needs HTTPS or localhost and browser storage.");
      return;
    }
    try {
      await registration.update();
      notify(
        registration.waiting
          ? "Update ready. Close Settings and use Update now."
          : "Update check complete. No waiting update.",
      );
      if (registration.waiting) $("#update-banner").hidden = false;
    } catch {
      notify(
        "Could not reach the update server. Your cached tools still work.",
      );
    }
  });
  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) save();
  });
})();
