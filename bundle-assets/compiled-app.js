// Precompiled from text/babel sources so index.html can run from file:// and http://.

// ---- 2c293460-8d10-4e71-b9f7-49f324772c5c.jsx ----
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});

// ---- 5b55da03-1acc-44bc-8acd-ad46bde98c8b.js ----
// data.jsx — Project data + shared constants

const PROJECTS = [{
  code: "01",
  titleEn: "Mirror Sky Pink",
  titleCn: "镜空粉",
  cardLabel: "镜空粉",
  cover: "./图片/镜空粉/01.webp",
  category: "Electric Toothbrush",
  categoryCn: "电动牙刷",
  year: "2025",
  role: "Visual Direction",
  client: "Confidential",
  desc: "镜面金属 × 天空粉调。主视觉与十一张成片，组成一组关于「光在镜面上的转身」的视觉节奏。",
  positioning: "为新一代女性消费者塑造的高端口腔护理品类。把每日护齿动作搬到化妆台的语境里 —— 它不是工具，是器物。镜面金属的硬度被天空粉的柔软重新调和，留下一种「冷的科技 + 暖的肌理」的张力。",
  inspiration: "灵感来自清晨第一束光在化妆镜上的折射、Apple 一代镜面充电盒、以及 80 年代银盐胶片的高光质感。让产品周身保持一层薄薄的、化妆品式的环境光。",
  tagline: "光在镜面上停顿，然后转身。",
  software: ["Photoshop", "Illustrator", "Cinema 4D", "Octane Render"],
  chapters: [{
    num: "01",
    title: "镜面的呼吸",
    desc: "九张竖屏海报围绕主形象展开。把镜面金属作为主角，让光在画面里完成一次又一次柔和的折返。",
    assets: {
      type: "portrait-grid",
      count: 9,
      label: "竖屏海报 · 9张"
    }
  }, {
    num: "02",
    title: "上市节拍",
    desc: "两张横屏 KV 用于线上线下投放。从概念场景到人物落地，按发布节奏收束。",
    assets: {
      type: "landscape-single",
      count: 2,
      label: "横屏 KV · 2张"
    }
  }]
}, {
  code: "02",
  cover: "./图片/黑莓/04.webp",
  titleEn: "Blackberry",
  titleCn: "黑莓",
  cardLabel: "黑莓",
  category: "Electric Toothbrush",
  categoryCn: "电动牙刷",
  year: "2025",
  role: "Visual Direction",
  client: "Confidential",
  desc: "深紫与晨雾灰的克制对位。两张竖屏定调系列气质，三张横屏 KV 完成上市节奏。",
  positioning: "面向追求小众气质的成熟用户的暗色系产品。把工具感降到最低，让一件电器具备「暗果实」的成熟、安静与稀有感 —— 不喧哗，但耐看。",
  inspiration: "黎明前那一段紫调的天空、Y2K 漆黑塑料的反光、桑葚剖面的胶质纹理。用低饱和深紫制造心理上的克制，避开常见的「黑色 = 高级」的偷懒解法。",
  tagline: "一种安静的紫，黎明的底色。",
  software: ["Photoshop", "Cinema 4D", "Octane Render"],
  chapters: [{
    num: "01",
    title: "气质定调",
    desc: "这一组开始把人物状态放进画面里，想让产品不只是单独展示。模特和产品之间更像一种情绪关系，而不是纯功能表达。",
    assets: {
      type: "portrait-pair",
      count: 3,
      label: "情绪画面 · 3张"
    }
  }, {
    num: "02",
    title: "节奏铺开",
    desc: "这一组主要是把产品放进更真实的模特场景里，不想让它只是单独漂在画面上。实拍人物和产品合成之后，整体更有生活感，也让黑莓的深紫气质自然落进情绪里。",
    assets: {
      type: "landscape-pair",
      count: 2,
      label: "横屏 KV · 2张"
    }
  }]
}, {
  code: "03",
  cover: "./图片/太空舱/13.webp",
  titleEn: "Space Capsule",
  titleCn: "太空舱",
  cardLabel: "太空舱",
  category: "Electric Toothbrush",
  categoryCn: "电动牙刷",
  year: "2025",
  role: "Art Direction",
  client: "Confidential",
  desc: "舱体语言 × 失重美学。十一张竖屏构建产品宇宙，一支竖屏 GIF 收束节奏，一张横屏 KV 留作主张。",
  positioning: "面向技术党与极客用户的旗舰产品。把口腔护理变成一次微缩的太空任务 —— 舱体、舷窗、悬浮，让产品自带「即将启航」的仪式感。",
  inspiration: "NASA 早期登月舱内饰、Kubrick 科幻电影里的白色舱壁、以及 Dieter Rams 时期 Braun 的工业语言。GIF 用于表达失重悬浮的瞬时呼吸，作为整个系列的节拍器。",
  tagline: "失重的，封装的，仍在呼吸。",
  software: ["Cinema 4D", "Octane Render", "Photoshop", "KeyShot"],
  chapters: [{
    num: "01",
    title: "舱体宇宙",
    desc: "十一张竖屏从舱体特写、剖面、漂浮姿态展开，构成一个产品宇宙的完整切片。",
    assets: {
      type: "portrait-grid",
      count: 11,
      label: "竖屏海报 · 11张"
    }
  }, {
    num: "02",
    title: "悬浮的呼吸",
    desc: "竖屏 GIF 作为系列的节拍器，让产品在静态画面之外有一次完整的呼吸。",
    assets: {
      type: "gif-single",
      count: 1,
      label: "竖屏 GIF · 1支"
    }
  }, {
    num: "03",
    title: "主张落地",
    desc: "一张横屏 KV 把所有意象浓缩成一句视觉主张。",
    assets: {
      type: "landscape-single",
      count: 1,
      label: "横屏 KV · 1张"
    }
  }]
}, {
  code: "04",
  cover: "./图片/x300u外设/01.webp",
  titleEn: "x300u",
  titleCn: "x300u 外设",
  cardLabel: "电竞外设",
  category: "Product Detail",
  categoryCn: "电商详情页",
  year: "2026",
  role: "E-commerce Visual",
  client: "Confidential",
  desc: "一张长详情页的全息叙述。从结构、参数到使用场景，单页承载完整购买决策路径。",
  positioning: "电竞外设的产品力呈现。详情页要在 30 秒内把「我为什么需要它」讲清楚 —— 结构、性能、握感、应用场景按购买决策顺序逐层揭示。",
  inspiration: "工程剖面图、机械维修手册、F1 工程白皮书的信息层级。把电商页当作技术杂志的一个折页来排版，让用户在滚动中产生「读懂了」的快感。",
  tagline: "一次滚动，一份信念。",
  software: ["Cinema 4D", "KeyShot", "Rhino", "Photoshop"],
  chapters: [{
    num: "01",
    title: "长卷叙事",
    desc: "一张长详情页，从产品独白、结构剖析到使用场景按购买决策顺序铺陈。",
    assets: {
      type: "detail-single",
      count: 1,
      label: "产品详情长页 · 1张"
    }
  }]
}, {
  code: "05",
  cover: "./图片/Anker拓展坞/03.webp",
  titleEn: "Anker Hub",
  titleCn: "Anker 拓展坞",
  cardLabel: "拓展坞",
  category: "White BG Render",
  categoryCn: "白底图",
  year: "2025",
  role: "Render Direction",
  client: "Anker",
  desc: "七张白底渲染。在中性背景下放大材质细节、接口表情与体积重量感。",
  positioning: "高端配件品牌的官网与电商主图。需要一种「相机不会撒谎」的诚实感 —— 产品自己站出来说话，不靠场景、不靠光绘。",
  inspiration: "Apple 官网产品图、80 年代日本相机产品摄影、Vitsoe 货架的灰度照明。让接口的金属边、橡胶圈、磨砂面在白底上有不同的发声方式。",
  tagline: "白色，直到形态自己开口。",
  software: ["KeyShot", "Cinema 4D", "Photoshop"],
  chapters: [{
    num: "01",
    title: "诚实的光",
    desc: "七张白底渲染，光位、反光、阴影控制到工程级别，让每一种材质都能被准确读到。",
    assets: {
      type: "square-row",
      count: 7,
      label: "白底渲染 · 7张"
    }
  }]
}, {
  code: "06",
  cover: "./图片/eufy家用安防/03.webp",
  titleEn: "eufy Security",
  titleCn: "eufy 安防",
  cardLabel: "家用安防",
  category: "Brand Visual",
  categoryCn: "品牌视觉",
  year: "2025",
  role: "Brand Visual",
  client: "eufy",
  desc: "围绕「安静的守护」展开的五张视觉。低调蓝灰与微光节点，让安防回到家的语境里。",
  positioning: "家庭安防类目从「监控」向「守护」的语义转译。把摄像头、门铃、感应器这些「冷器材」放回有家具、有光线、有人的生活场景中，传递一种「在场而不打扰」的产品人格。",
  inspiration: "夜间走廊一盏未关的小灯、博物馆夜场的指示光、Naoto Fukasawa 关于「无意识设计」的论述。重点不是产品有多酷，而是它有多融入。",
  tagline: "守望着，却从不喧哗。",
  software: ["Cinema 4D", "Octane Render", "Photoshop", "Illustrator"],
  chapters: [{
    num: "01",
    title: "回到家的语境",
    desc: "五张视觉把安防设备放回有家具、有光线、有人的生活里，让产品自然地「在场」。",
    assets: {
      type: "square-grid",
      count: 5,
      label: "品牌视觉 · 5张"
    }
  }]
}, {
  code: "07",
  cover: "./图片/AIGC风格拓展/04.webp",
  titleEn: "AIGC Extension",
  titleCn: "AIGC 风格拓展",
  cardLabel: "风格拓展",
  category: "AI Visual Lab",
  categoryCn: "AI 视觉实验",
  year: "2026",
  role: "AI Visual Direction",
  client: "Internal R&D",
  desc: "把已成立的品牌语言交给生成模型继续延展。三张竖屏 + 两张横屏 KV，用于探索边界与稳定性。",
  positioning: "在不破坏已有品牌资产的前提下，用 AIGC 把视觉语言延展到更多场景、更高产能与更细分的人群投放。一个面向未来 18 个月的视觉武器库实验。",
  inspiration: "把品牌作为「风格 token」喂给生成模型，观察它在 latent space 里如何漂移；再用人手把漂移拉回品牌中线。中间地带是真正的研究对象。",
  tagline: "让品牌用新的语言继续讲下去。",
  software: ["AIGC · GPT", "AIGC · Banana 2", "AIGC · Claude", "AIGC · Codex", "Photoshop"],
  chapters: [{
    num: "01",
    title: "Token 化的风格",
    desc: "三张竖屏作为风格漂移的样本，记录模型在品牌语义边缘上的表现。",
    assets: {
      type: "portrait-grid",
      count: 3,
      label: "竖屏 · 3张"
    }
  }, {
    num: "02",
    title: "横向拓展",
    desc: "两张横屏 KV 验证这套语言在主流投放尺寸下的稳定性。",
    assets: {
      type: "landscape-pair",
      count: 2,
      label: "横屏 KV · 2张"
    }
  }]
}];
const PALETTES = [["#14110d", "#e8e1d3", "#c89060"],
// warm noir
["#0e0e10", "#f1efea", "#7c7c8a"],
// graphite mist (default)
["#101418", "#e6ecef", "#7aa6b8"],
// cinematic blue
["#0d0d0d", "#fafaf7", "#b8b8b8"] // pure b&w
];
const TOOLS = [{
  code: "A",
  name: "Visual Direction",
  cn: "视觉方向",
  weight: 1.0,
  items: [{
    k: "Photoshop",
    w: "Daily"
  }, {
    k: "Figma",
    w: "Daily"
  }]
}, {
  code: "B",
  name: "3D Language",
  cn: "三维语言",
  weight: 1.4,
  items: [{
    k: "Cinema 4D",
    w: "Daily"
  }, {
    k: "Octane",
    w: "Daily"
  }, {
    k: "KeyShot",
    w: "Often"
  }, {
    k: "Rhino",
    w: "Often"
  }]
}, {
  code: "C",
  name: "AI Workflow",
  cn: "AI 工作流",
  weight: 1.2,
  items: [{
    k: "GPT",
    w: "Daily"
  }, {
    k: "Claude",
    w: "Daily"
  }, {
    k: "Codex",
    w: "Often"
  }, {
    k: "Banana",
    w: "Often"
  }]
}];
const WORKFLOW = [{
  n: "01",
  t: "Brief",
  cn: "理解",
  d: "理解品牌定位、用户人群与产品卖点，明确视觉目标与商业方向。"
}, {
  n: "02",
  t: "Research",
  cn: "调研",
  d: "整理竞品、行业趋势与视觉参考，建立适合项目的视觉语境。"
}, {
  n: "03",
  t: "Direction",
  cn: "定调",
  d: "确定核心关键词、色彩与版式方向，统一整体视觉气质。"
}, {
  n: "04",
  t: "Production",
  cn: "制作",
  d: "完成三维、合成、排版与细节制作，确保画面兼具表达与商业转化。"
}, {
  n: "05",
  t: "Polish",
  cn: "收尾",
  d: "优化字体、节奏、光影与信息层级，让最终输出更加完整耐看。"
}];
const SECTIONS = [{
  code: "00",
  label: "Cover"
}, {
  code: "01",
  label: "Works"
}, {
  code: "02",
  label: "About"
}, {
  code: "03",
  label: "Tools"
}, {
  code: "04",
  label: "Workflow"
}, {
  code: "05",
  label: "Contact"
}];
Object.assign(window, {
  PROJECTS,
  PALETTES,
  TOOLS,
  WORKFLOW,
  SECTIONS
});

// ---- 6b7fc7b3-dd6f-4ad5-a154-532ceab234ee.js ----
// directory.jsx — Section 01: Works directory with expandable cards
// 12px radius, 3:4 expanded ratio, no English vertical title, no 3D wobble.

const {
  useState: _dir_useState
} = React;
function DirectorySection({
  onOpen,
  idx,
  total
}) {
  const [active, setActive] = _dir_useState(0);
  const handleMouseMove = e => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    card.style.setProperty("--x", `${x}%`);
    card.style.setProperty("--y", `${y}%`);
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "screen dir",
    "data-screen-label": "01 Works"
  }, /*#__PURE__*/React.createElement("div", {
    className: "orb",
    style: {
      left: "-15vw",
      top: "-10vh"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "orb lg",
    style: {
      right: "-25vw",
      bottom: "-25vh"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dir-head"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "code"
  }, String(idx).padStart(2, "0"), " / ", String(total).padStart(2, "0")), " \xA0\u2014\xA0 \u4F5C\u54C1\u76EE\u5F55"), /*#__PURE__*/React.createElement("span", null, "2025 \u2014 2026 \xB7 \u4E03\u4E2A\u9879\u76EE")), /*#__PURE__*/React.createElement("div", {
    className: "dir-title-wrap",
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "dir-title"
  }, "\u4E03\u4E2A\u4EA7\u54C1\uFF0C", /*#__PURE__*/React.createElement("span", {
    className: "soft"
  }, "\u4E00\u79CD\u6C14\u5019\u3002")), /*#__PURE__*/React.createElement("p", {
    className: "dir-tagline"
  }, "\u60AC\u505C\u5C55\u5F00\u4EFB\u4E00\u4F5C\u54C1\u5C01\u9762\uFF0C\u70B9\u51FB\u8FDB\u5165\u5B8C\u6574\u9879\u76EE\u9875 \u2014\u2014 \u5B9A\u4F4D\u3001\u7075\u611F\u3001\u5DE5\u5177\u3001\u6210\u7247\u6309\u5236\u4F5C\u987A\u5E8F\u94FA\u9648\u3002"))), /*#__PURE__*/React.createElement("div", {
    className: "cards-wrap"
  }, PROJECTS.map((p, i) => {
    const isActive = i === active;
    const totalDeliv = p.assets ? p.assets.reduce((s, a) => s + a.count, 0) : 0;
    const chapterDeliv = p.chapters ? p.chapters.reduce((s, c) => s + c.assets.count, 0) : totalDeliv;
    return /*#__PURE__*/React.createElement("div", {
      key: p.code,
      className: `card${isActive ? " active" : ""}`,
      onMouseEnter: () => setActive(i),
      onMouseMove: handleMouseMove,
      onClick: e => {
        if (isActive) {
          onOpen(p.code);
        } else {
          setActive(i);
        }
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "card-content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "card-num"
    }, p.code), /*#__PURE__*/React.createElement("div", {
      className: "vertical-title"
    }, p.cardLabel || p.titleCn), /*#__PURE__*/React.createElement("div", {
      className: "card-bottom"
    }, String(chapterDeliv).padStart(2, "0"), " \u4EF6"), /*#__PURE__*/React.createElement("div", {
      className: "expanded"
    }, /*#__PURE__*/React.createElement("div", {
      className: "expanded-top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "expanded-code"
    }, p.code, " \xB7 ", p.categoryCn), /*#__PURE__*/React.createElement("h3", null, p.titleCn)), p.cover && /*#__PURE__*/React.createElement("div", {
      className: "expanded-cover"
    }, /*#__PURE__*/React.createElement("img", {
      src: window.__resources && window.__resources[p.cover] || p.cover,
      alt: `${p.titleCn} 封面`,
      loading: "eager"
    })), /*#__PURE__*/React.createElement("div", {
      className: "expanded-bottom"
    }, /*#__PURE__*/React.createElement("div", {
      className: "meta-line"
    }, p.chapters && p.chapters.map((c, ci) => /*#__PURE__*/React.createElement("span", {
      key: ci
    }, c.assets.label))), /*#__PURE__*/React.createElement("button", {
      className: "open-link",
      onClick: e => {
        e.stopPropagation();
        onOpen(p.code);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "arr"
    }, "\u2197"), "\u67E5\u770B\u9879\u76EE")))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "dir-foot"
  }, /*#__PURE__*/React.createElement("span", null, "\u60AC\u505C\u5C55\u5F00 \xA0/\xA0 \u70B9\u51FB\u8FDB\u5165"), /*#__PURE__*/React.createElement("span", null, String(active + 1).padStart(2, "0"), " \xB7 ", PROJECTS[active].titleCn)));
}
window.DirectorySection = DirectorySection;

// ---- b56f94c2-b7cf-42c7-97a8-c47a97566b89.js ----
// detail.jsx — Product detail full-screen overlay
// Centered 2280px container, tighter rhythm, larger images, poster-style landscape
// rows, sticky longform sidebar for project 04 (x300u).

const {
  useEffect: _de_useEffect,
  useRef: _de_useRef
} = React;
const ASPECT_FOR = {
  "portrait-single": "aspect-portrait",
  "portrait-pair": "aspect-portrait",
  "portrait-grid": "aspect-portrait",
  "landscape-single": "aspect-landscape",
  "landscape-pair": "aspect-landscape",
  "square-grid": "aspect-square",
  "square-row": "aspect-square",
  "detail-single": "aspect-detail",
  "gif-single": "aspect-gif"
};

// Width caps biased toward big "exhibition" presence. Sized for the 2280px frame.
const SIZE_CAP_FOR = {
  "portrait-single": "min(620px, 100%)",
  "portrait-pair": "min(620px, 100%)",
  "portrait-grid": "min(620px, 100%)",
  "landscape-single": "min(1320px, 100%)",
  "landscape-pair": "min(1320px, 100%)",
  "square-grid": "min(720px, 100%)",
  "square-row": "min(720px, 100%)",
  "detail-single": "min(560px, 100%)",
  "gif-single": "min(520px, 100%)"
};

// Placeholder caption pool — 60–150 字 occupier copy.
const PROJECT_MEDIA = {
  "01": {
    hero: "./图片/镜空粉/0.webp",
    chapters: [["./图片/镜空粉/01.webp", "./图片/镜空粉/02.webp", "./图片/镜空粉/03.webp", "./图片/镜空粉/04.webp", "./图片/镜空粉/05.webp", "./图片/镜空粉/06-2.webp", "./图片/镜空粉/07.webp", "./图片/镜空粉/08.webp", "./图片/镜空粉/09.webp"], ["./图片/镜空粉/10.webp", "./图片/镜空粉/11.webp"]]
  },
  "02": {
    chapters: [["./图片/黑莓/05.webp", "./图片/黑莓/01.webp", "./图片/黑莓/02.webp"], ["./图片/黑莓/03.webp", "./图片/黑莓/04.webp"]]
  },
  "03": {
    chapters: [["./图片/太空舱/01.webp", "./图片/太空舱/02.webp", "./图片/太空舱/03.webp", "./图片/太空舱/04.webp", "./图片/太空舱/05.webp", "./图片/太空舱/06.webp", "./图片/太空舱/07.webp", "./图片/太空舱/08.webp", "./图片/太空舱/09.webp", "./图片/太空舱/10.webp", "./图片/太空舱/11.webp"], ["./图片/太空舱/12.webp"], ["./图片/太空舱/13.webp"]]
  },
  "04": {
    chapters: [["图片/x300u外设/外设_X300U(专业影像手柄套装)_商详_2560_0328.webp"]]
  },
  "05": {
    chapters: [["./图片/Anker拓展坞/01.webp", "./图片/Anker拓展坞/02.webp", "./图片/Anker拓展坞/03.webp", "./图片/Anker拓展坞/04.webp", "./图片/Anker拓展坞/05.webp", "./图片/Anker拓展坞/06.webp", "./图片/Anker拓展坞/07.webp"]]
  },
  "06": {
    chapters: [["./图片/eufy家用安防/01.webp", "./图片/eufy家用安防/02.webp", "./图片/eufy家用安防/03.webp", "./图片/eufy家用安防/04.webp", "./图片/eufy家用安防/05.webp"]]
  },
  "07": {
    chapters: [["./图片/AIGC风格拓展/01.webp", "./图片/AIGC风格拓展/02.webp", "./图片/AIGC风格拓展/03.webp"], ["./图片/AIGC风格拓展/04.webp", "./图片/AIGC风格拓展/05.webp"]]
  }
};
function imageFor(code, chapterIdx, imageIdx) {
  return PROJECT_MEDIA[code]?.chapters?.[chapterIdx]?.[imageIdx];
}
function mediaClassFor(code, chapterIdx, imageIdx, assetType) {
  if (code === "07" && chapterIdx === 0) return "aspect-2-3";
  if (code === "07" && chapterIdx === 1) return "aspect-landscape";
  if (code === "02" && chapterIdx === 0 && imageIdx === 0) return "aspect-16-9";
  if (code === "02" && chapterIdx === 0 && imageIdx === 1) return "aspect-2-4";
  if (code === "02" && chapterIdx === 0 && imageIdx === 2) return "aspect-2-4";
  if (code === "04") return "aspect-long-x300u";
  if (code === "05" && imageIdx === 2) return "aspect-3-4";
  if (code === "05" && imageIdx === 3) return "aspect-2-3";
  if (code === "01" && chapterIdx === 0 && imageIdx === 5) return "aspect-16-9";
  if (code === "01" && chapterIdx === 0 && imageIdx === 7) return "aspect-2-3";
  if (code === "01" && chapterIdx === 0 && imageIdx === 8) return "aspect-16-9";
  return ASPECT_FOR[assetType] || "aspect-portrait";
}
function ProjectMedia({
  src,
  alt
}) {
  if (!src) return null;
  const resolvedSrc = window.__resources && window.__resources[src] || src;
  const resolvedPoster = null;
  const mediaStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover"
  };
  if (src.endsWith(".mp4")) {
    return /*#__PURE__*/React.createElement("video", {
      src: resolvedSrc,
      poster: resolvedPoster,
      "aria-label": alt,
      autoPlay: true,
      muted: true,
      loop: true,
      playsInline: true,
      style: mediaStyle
    });
  }
  return /*#__PURE__*/React.createElement("img", {
    src: resolvedSrc,
    alt: alt,
    loading: "lazy",
    style: mediaStyle
  });
}
function ProjectCover({
  project
}) {
  if (!project?.cover) return null;
  const resolvedSrc = window.__resources && window.__resources[project.cover] || project.cover;
  return /*#__PURE__*/React.createElement("div", {
    className: "detail-cover"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolvedSrc,
    alt: `${project.titleCn} 封面`,
    loading: "eager"
  }));
}
const PROJECT_CAPTIONS = {
  "01": [["开场先把产品放回梳妆台的环境里，绿色背景压住了玫瑰金的甜度，看起来更日常。", "这一张把瓶身和刷头并排立起来，右侧的小物件只是陪衬，重点还是金属外壳的反光。", "我想要一点礼盒开箱的感觉，所以用了布料和花盒，把粉色做得柔一些。", "天空和粉墙让产品变得更轻，画面几乎没有杂物，像一张很干净的夏日海报。", "这里把背景做成暖粉渐变，配一点花瓣，产品会更像放在化妆品广告里的物件。", "这一版是情绪板式的横构图，包装、模特和产品放在一起，更适合讲完整的色彩方向。", "包装躺在花丛里会更有送礼的感觉，我保留了周围的虚化，让盒子的纹理先被看到。", "这张故意把水面和泡沫放大，产品只露出一部分，让清洁感不要太直白。", "后段换成深紫夜景，银色产品被压得很冷，和前面的粉色画面形成一次转调。"], ["绿色极光是这组里最偏概念的一张，包装和产品都贴着低光走，氛围更安静。", "最后用床面和人物收尾，包装回到生活场景里，整套视觉不会一直停在棚拍感上。"]],
  "02": [["主视觉用了黑色岩石和盒装陈列，红紫色只留在产品上，开场会更有分量。", "这里把灯压到很低，只留一圈轮廓光，想先建立黑莓系列的神秘感。", "这一组开始把人物状态放进画面里，想让产品不只是单独展示。模特和产品之间更像一种情绪关系，而不是单纯的功能表达。"], ["这张像隔着水面看人物，洋红反光比较浓，画面情绪也跟着更大胆。", "收尾直接用大面积玫红背景，把人物剪影拉开，产品在手里变成唯一的亮点。"]],
  "03": [["第一张先只看透明舱体和水珠，银灰背景很克制，像刚拆封的设备。", "包装盒和流体放在一起，想把太空题材做得有一点漫画感，不至于太冰冷。", "这里回到产品本身，细密的横向光纹让透明外壳更像一件精密仪器。", "这张用了柔软的泡泡形状托住产品，硬质舱体和软背景放在一起会更有张力。", "进入人物段落后我把人像压成剪影，透明产品在颈侧发光，重点会非常集中。", "侧脸与产品形成一条斜线，留白偏多，是想让画面有一点失重感。", "这一张人和产品靠得更近，舱体的亮边刚好接住人物轮廓，情绪更静。", "手套与透明舱体是整组里偏戏剧性的一张，黑场留得多，让动作更明确。", "产品落到月面之后，冷光和圆形轨道把太空主题真正推到前景。", "刷头细节被放得很大，发光的刷毛像实验样本，也让功能画面没那么常规。", "银色沙发和星空把生活场景变成舱内休息区，人物出现后整组更完整。"], ["这一段用循环动效接住静态画面，让透明舱体真的有一点漂浮和呼吸的感觉。"], ["横版收尾把包装和产品一起排到海面上，像整组视觉的正式发布画面。"]],
  "05": [["首图把接口和线材全部摊开，白底下结构很清楚，也方便先认清产品是什么。", "接到显示器和电脑后，功能关系一下就直观了，画面仍然保持很干净。", "这一张落到真实桌面里，窗边光线比较软，拓展坞看起来更接近实际使用状态。", "便携场景我选了放进通勤包的瞬间，比单纯白底多一点随身携带的理由。", "双屏画面保留了大片白底，线材只轻轻露出来，不让信息抢过产品。", "这里强调办公桌面的正面组合，显示器、电脑和拓展坞像一套完整工作位。", "最后一张把连接设备摊开说明，仍旧用白底收束，让系列结束得利落。"]],
  "06": [["第一张把摄像头挂在屋檐下，蓝天和白墙很清爽，安防设备不会显得压迫。", "移到室内角落后，产品更像家里自然存在的一部分，阳光也让气氛放松下来。", "这张靠柜子和花材带出生活感，摄像头没有被刻意放大，状态更真实。", "外墙特写把阴影留得很明确，我喜欢这种装好之后安静工作的感觉。", "最后拉远看完整屋檐，设备被建筑线条包住，画面会更像实际安装案例。"]],
  "07": [["这一张像户外拍摄的开场，人物拿着镜头面对阳光，整体感觉比较轻松。", "把设备放到网球场边，是想让运动场景自然带出随拍和记录的需求。", "旅行包这一幕更偏出发前的瞬间，产品尺寸和随身携带的感觉都能看出来。"], ["这张把秋千和湖面留得很开，镜头只是安静地挂在场景里。横版铺开之后，画面更像一段慢下来的户外片段。", "最后一张我想把节奏拉回来，所以用了人物奔跑的瞬间。金黄的树影和手里的设备一起入画，收尾会更有活力一点。"]]
};
function captionFor(code, chapterIdx, imageIdx) {
  return PROJECT_CAPTIONS[code]?.[chapterIdx]?.[imageIdx] || "";
}

// ---------------- standard row ----------------
function StaggeredImageRow({
  assetType,
  code,
  chapterIdx,
  imgIdx,
  total,
  label,
  isLandscape
}) {
  const aspectCls = mediaClassFor(code, chapterIdx, imgIdx, assetType);
  const mirrorWide = code === "01" && chapterIdx === 0 && (imgIdx === 5 || imgIdx === 8);
  const blackberryHeroWide = code === "02" && chapterIdx === 0 && imgIdx === 0;
  const displayAsLandscape = isLandscape || mirrorWide || blackberryHeroWide;
  const sizeCap = displayAsLandscape ? SIZE_CAP_FOR["landscape-single"] : SIZE_CAP_FOR[assetType] || "min(620px, 100%)";
  const sideRight = !displayAsLandscape && imgIdx % 2 === 1;
  const caption = captionFor(code, chapterIdx, imgIdx);
  const imageSrc = imageFor(code, chapterIdx, imgIdx);
  if (displayAsLandscape) {
    return /*#__PURE__*/React.createElement("div", {
      className: "wc-row poster"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-cap-head"
    }, /*#__PURE__*/React.createElement("p", {
      className: "wc-cap"
    }, caption)), /*#__PURE__*/React.createElement("div", {
      className: "wc-img-col center"
    }, /*#__PURE__*/React.createElement("div", {
      className: `ph has-media ${aspectCls}`,
      style: {
        width: sizeCap
      }
    }, /*#__PURE__*/React.createElement(ProjectMedia, {
      src: imageSrc,
      alt: `${label} ${imgIdx + 1}`
    }), /*#__PURE__*/React.createElement("span", {
      className: "ph-corner"
    }, String(imgIdx + 1).padStart(2, "0"), " / ", String(total).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
      className: "ph-tag"
    }, code, " \xB7 ", label))));
  }

  // Portrait / square: image on one side, caption mirrored to the opposite
  // side of the 1320 safe area for horizontal reading rhythm.
  return /*#__PURE__*/React.createElement("div", {
    className: `wc-row${sideRight ? " right" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: `ph has-media ${aspectCls}`,
    style: {
      width: sizeCap
    }
  }, /*#__PURE__*/React.createElement(ProjectMedia, {
    src: imageSrc,
    alt: `${label} ${imgIdx + 1}`
  }), /*#__PURE__*/React.createElement("span", {
    className: "ph-corner"
  }, String(imgIdx + 1).padStart(2, "0"), " / ", String(total).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    className: "ph-tag"
  }, code, " \xB7 ", label)), /*#__PURE__*/React.createElement("p", {
    className: "wc-cap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ci"
  }, "Frame ", String(imgIdx + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", null, caption)));
}

// ---------------- long-form (project 04 x300u) ----------------
function LongFormRow({
  code,
  label
}) {
  const captions = ["这张长图从主视觉一路往下铺，镜头配件和手柄的关系能顺着滚动慢慢看清楚。", "中段把结构和使用状态拆开讲，信息比较多，所以我让背景和排版尽量克制。", "尾段回到成套使用的画面，想让用户看完参数以后，还能记住它实际拿在手里的样子。"];
  return /*#__PURE__*/React.createElement("div", {
    className: "wc-longform"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wc-longform-img"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph has-media aspect-long-x300u",
    style: {
      width: "min(520px, 100%)"
    }
  }, /*#__PURE__*/React.createElement(ProjectMedia, {
    src: imageFor(code, 0, 0),
    alt: label
  }), /*#__PURE__*/React.createElement("span", {
    className: "ph-corner"
  }, "01 / 01"), /*#__PURE__*/React.createElement("span", {
    className: "ph-tag"
  }, code, " \xB7 ", label))), /*#__PURE__*/React.createElement("aside", {
    className: "wc-longform-side"
  }, captions.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "wc-longform-block",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "ci"
  }, "Section ", String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("p", null, c)))));
}
function WorkChapter({
  chapter,
  idx,
  code,
  projectCode
}) {
  const {
    type,
    count,
    label
  } = chapter.assets;
  const isLandscape = type === "landscape-single" || type === "landscape-pair";
  const isLongDetail = type === "detail-single" && projectCode === "04";

  // Project 01 (镜空粉) gets a tall hero placeholder block (2560×4962 ratio)
  // at the very top of its first chapter — silent, no caption.
  const showHero01 = projectCode === "01" && idx === 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "work-chapter-stack",
    "data-chapter-num": chapter.num,
    "data-chapter-kind": isLandscape ? "landscape" : isLongDetail ? "longform" : "portrait"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wc-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "wc-num"
  }, "Chapter ", chapter.num), /*#__PURE__*/React.createElement("h3", {
    className: "wc-title"
  }, chapter.title), /*#__PURE__*/React.createElement("p", {
    className: "wc-desc"
  }, chapter.desc), /*#__PURE__*/React.createElement("div", {
    className: "wc-meta"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, label)))), /*#__PURE__*/React.createElement("div", {
    className: "wc-stack"
  }, showHero01 && /*#__PURE__*/React.createElement("div", {
    className: "wc-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ph has-media hero-tall"
  }, /*#__PURE__*/React.createElement(ProjectMedia, {
    src: PROJECT_MEDIA[projectCode].hero,
    alt: PROJECT_MEDIA[projectCode].hero
  }))), isLongDetail ? /*#__PURE__*/React.createElement(LongFormRow, {
    code: code,
    label: label
  }) : Array.from({
    length: count
  }).map((_, i) => /*#__PURE__*/React.createElement(StaggeredImageRow, {
    key: i,
    assetType: type,
    code: code,
    chapterIdx: idx,
    imgIdx: i,
    total: count,
    label: label,
    isLandscape: isLandscape
  }))));
}
function ProductDetail({
  project,
  onClose,
  onNav
}) {
  const overlayRef = _de_useRef(null);
  const [showSkip, setShowSkip] = React.useState(false);
  _de_useEffect(() => {
    if (!project) return;
    if (overlayRef.current) overlayRef.current.scrollTop = 0;
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose, onNav]);

  // Keep the shortcut available until the landscape chapter reaches the
  // detail reading position near the top of the viewport.
  _de_useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !project) return;
    const hasLandscape = project.chapters.some(c => c.assets.type === "landscape-single" || c.assets.type === "landscape-pair");
    if (!hasLandscape) {
      setShowSkip(false);
      return;
    }
    const checkVisibility = () => {
      const target = overlay.querySelector('[data-chapter-kind="landscape"]');
      if (!target) {
        setShowSkip(false);
        return;
      }
      const rect = target.getBoundingClientRect();
      setShowSkip(rect.top > 96);
    };
    checkVisibility();
    overlay.addEventListener("scroll", checkVisibility, {
      passive: true
    });
    return () => overlay.removeEventListener("scroll", checkVisibility);
  }, [project]);
  const scrollToLandscape = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const target = overlay.querySelector('[data-chapter-kind="landscape"]');
    if (!target) return;
    const top = target.getBoundingClientRect().top + overlay.scrollTop - 96;
    overlay.scrollTo({
      top,
      behavior: "smooth"
    });
  };
  if (!project) return null;
  const totalDeliverables = project.chapters.reduce((s, c) => s + c.assets.count, 0);
  const idx = PROJECTS.findIndex(p => p.code === project.code);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  return /*#__PURE__*/React.createElement("div", {
    className: "detail-overlay open",
    ref: overlayRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "detail-orb"
  }), /*#__PURE__*/React.createElement("button", {
    className: `skip-to-kv${showSkip ? " visible" : ""}`,
    type: "button",
    onClick: scrollToLandscape,
    "aria-label": "\u8DF3\u5230\u6A2A\u5C4F KV"
  }, /*#__PURE__*/React.createElement("span", {
    className: "skip-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 5 L7 9 L11 5",
    stroke: "currentColor",
    strokeWidth: "1.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "skip-meta"
  }, "Skip"), /*#__PURE__*/React.createElement("span", {
    className: "skip-text"
  }, "\u8DF3\u5230\u6A2A\u5C4F KV")), /*#__PURE__*/React.createElement("div", {
    className: "detail-topbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttb-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "code"
  }, project.code, " / 07"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }), /*#__PURE__*/React.createElement("span", null, project.categoryCn)), /*#__PURE__*/React.createElement("div", {
    className: "ttb-right"
  }, /*#__PURE__*/React.createElement("button", {
    className: "detail-nav-btn",
    onClick: () => onNav(-1)
  }, "\u2190 \u4E0A\u4E00\u9879"), /*#__PURE__*/React.createElement("button", {
    className: "detail-nav-btn",
    onClick: () => onNav(1)
  }, "\u4E0B\u4E00\u9879 \u2192"), /*#__PURE__*/React.createElement("button", {
    className: "detail-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", null, "\u5173\u95ED"), /*#__PURE__*/React.createElement("span", {
    className: "x"
  }, "\xD7")))), /*#__PURE__*/React.createElement("div", {
    className: "detail-inner"
  }, /*#__PURE__*/React.createElement("header", {
    className: "detail-hero"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dh-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, project.code), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, project.categoryCn), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, project.year)), /*#__PURE__*/React.createElement("h1", null, project.titleCn), /*#__PURE__*/React.createElement("p", {
    className: "dh-cn"
  }, project.titleEn)), /*#__PURE__*/React.createElement("div", {
    className: "detail-side"
  }, /*#__PURE__*/React.createElement(ProjectCover, {
    project: project
  }), /*#__PURE__*/React.createElement("dl", {
    className: "dh-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("dt", null, "\u5E74\u4EFD"), /*#__PURE__*/React.createElement("dd", null, project.year)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("dt", null, "\u89D2\u8272"), /*#__PURE__*/React.createElement("dd", null, project.role)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("dt", null, "\u5BA2\u6237"), /*#__PURE__*/React.createElement("dd", null, project.client)), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("dt", null, "\u4EA7\u51FA"), /*#__PURE__*/React.createElement("dd", null, totalDeliverables, " \u4EF6 \xB7 ", project.chapters.length, " \u7EC4"))))), /*#__PURE__*/React.createElement("section", {
    className: "detail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, "01 \xB7 \u9879\u76EE\u65B9\u5411"), /*#__PURE__*/React.createElement("div", {
    className: "titles"
  }, /*#__PURE__*/React.createElement("h2", null, "\u5B9A\u4F4D\u4E0E\u7075\u611F"))), /*#__PURE__*/React.createElement("div", {
    className: "ds-cols"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ds-col-label"
  }, "\u54C1\u724C\u5B9A\u4F4D"), /*#__PURE__*/React.createElement("p", null, project.positioning)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ds-col-label"
  }, "\u521B\u610F\u7075\u611F"), /*#__PURE__*/React.createElement("p", null, project.inspiration), /*#__PURE__*/React.createElement("p", {
    className: "col-quote"
  }, "\u300C", project.tagline, "\u300D")))), /*#__PURE__*/React.createElement("section", {
    className: "detail-section alt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, "02 \xB7 \u5DE5\u5177"), /*#__PURE__*/React.createElement("div", {
    className: "titles"
  }, /*#__PURE__*/React.createElement("h2", null, "\u4F7F\u7528\u5230\u7684\u8F6F\u4EF6"))), /*#__PURE__*/React.createElement("ul", {
    className: "software-list"
  }, project.software.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "idx"
  }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", null, s))))), /*#__PURE__*/React.createElement("section", {
    className: "detail-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, "03 \xB7 \u4F5C\u54C1"), /*#__PURE__*/React.createElement("div", {
    className: "titles"
  }, /*#__PURE__*/React.createElement("h2", null, "\u6210\u7247 \xB7 ", totalDeliverables, " \u4EF6"))), /*#__PURE__*/React.createElement("div", {
    className: "work-narrative"
  }, project.chapters.map((c, i) => /*#__PURE__*/React.createElement(WorkChapter, {
    key: i,
    chapter: c,
    idx: i,
    code: project.code,
    projectCode: project.code
  })))), /*#__PURE__*/React.createElement("nav", {
    className: "detail-foot-nav"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-card prev",
    onClick: () => onNav(-1)
  }, /*#__PURE__*/React.createElement("span", {
    className: "dir-label"
  }, "\u2190 \u4E0A\u4E00\u9879"), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, prev.titleCn), /*#__PURE__*/React.createElement("span", {
    className: "cn"
  }, prev.code, " \xB7 ", prev.categoryCn)), /*#__PURE__*/React.createElement("button", {
    className: "nav-card next",
    onClick: () => onNav(1)
  }, /*#__PURE__*/React.createElement("span", {
    className: "dir-label"
  }, "\u4E0B\u4E00\u9879 \u2192"), /*#__PURE__*/React.createElement("span", {
    className: "name"
  }, next.titleCn), /*#__PURE__*/React.createElement("span", {
    className: "cn"
  }, next.code, " \xB7 ", next.categoryCn)))));
}
window.ProductDetail = ProductDetail;

// ---- 51ff8236-e78c-40d7-a71b-24732699710f.js ----
// portfolio.jsx — App + Hero + About + Tools + Workflow + Contact + nav chrome
// QIQI wordmark, digital index navigation, footer-style contact.

const {
  useState,
  useEffect,
  useRef,
  useMemo
} = React;

// ---------------- 00 Cover ----------------
function Hero({
  totalAssets
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "screen hero",
    "data-screen-label": "00 Cover"
  }, /*#__PURE__*/React.createElement("img", {
    className: "hero-bg",
    src: window.__resources && window.__resources["./图片/封面背景.webp"] || "./图片/封面背景.webp",
    alt: "",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "orb",
    style: {
      left: "-12vw",
      top: "-8vh"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "orb lg",
    style: {
      right: "-22vw",
      bottom: "-22vh",
      opacity: 0.16
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-eyebrow"
  }, /*#__PURE__*/React.createElement("span", null, "Selected Works \xB7 2025 \u2014 2026")), /*#__PURE__*/React.createElement("div", {
    className: "hero-mid"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "hero-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "line-1"
  }, "\u54C1\u724C\u89C6\u89C9"), /*#__PURE__*/React.createElement("span", {
    className: "line-2 soft"
  }, "\u514B\u5236\u7684\u53D1\u58F0\u3002")), /*#__PURE__*/React.createElement("p", {
    className: "hero-sub"
  }, "\u4E03\u4E2A\u9879\u76EE\uFF0C\u5173\u4E8E\u5149\u3001\u6750\u8D28\u4E0E\u514B\u5236\u3002\u5728\u4EA7\u54C1\u5468\u56F4\u7B51\u4E00\u7247\u5B89\u9759\u7684\u89C6\u89C9\u6C14\u5019 \u2014\u2014 \u8BA9\u6D88\u8D39\u54C1\u50CF\u4E00\u4EF6\u4F5C\u54C1\u88AB\u8BA4\u771F\u51DD\u89C6\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "hero-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, "07"), /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "\u9879\u76EE")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, String(totalAssets).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "\u4EA4\u4ED8\u6210\u679C")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, "02"), /*#__PURE__*/React.createElement("span", {
    className: "l"
  }, "\u5E74"))));
}

// ---------------- 02 About ----------------
function AboutSection({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "screen sec",
    "data-screen-label": "02 About"
  }, /*#__PURE__*/React.createElement("div", {
    className: "orb",
    style: {
      right: "-10vw",
      top: "10vh"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "code"
  }, String(idx).padStart(2, "0"), " / ", String(total).padStart(2, "0")), " \xA0\u2014\xA0 \u5173\u4E8E\u6211"), /*#__PURE__*/React.createElement("span", null, "About")), /*#__PURE__*/React.createElement("div", {
    className: "about-stack"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-portrait"
  }, /*#__PURE__*/React.createElement("img", {
    className: "about-portrait-img",
    src: window.__resources && window.__resources["./图片/水珠.webp"] || "./图片/水珠.webp",
    alt: "\u6C34\u73E0\u89C6\u89C9\u4F5C\u54C1"
  })), /*#__PURE__*/React.createElement("div", {
    className: "about-text"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "about-headline"
  }, "\u4E00\u4F4D\u54C1\u724C\u89C6\u89C9\u8BBE\u8BA1\u5E08\uFF0C", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "soft"
  }, "\u4E60\u60EF\u7528\u753B\u9762\u5EFA\u7ACB\u54C1\u724C\u611F\u53D7\u3002")), /*#__PURE__*/React.createElement("p", null, "QIQI \xB7 \u4E3B\u8981\u505A\u6D88\u8D39\u7535\u5B50\u548C\u751F\u6D3B\u65B9\u5F0F\u65B9\u5411\u7684\u54C1\u724C\u89C6\u89C9\u4E0E\u4E09\u7EF4\u6E32\u67D3\u3002 \u8FD9\u4E24\u5E74\u9646\u7EED\u53C2\u4E0E\u4E86\u51E0\u4E2A\u72EC\u7ACB\u9879\u76EE\uFF0C \u4ECE\u4EA7\u54C1\u4E0A\u5E02\u5230\u540E\u7EED\u4EA7\u54C1\u7EBF\u5EF6\u5C55\uFF0C\u90FD\u4F1A\u6BD4\u8F83\u6DF1\u5730\u4ECB\u5165\u6574\u4F53\u89C6\u89C9\u3002"), /*#__PURE__*/React.createElement("p", null, "\u6BD4\u8D77\u5355\u7EAF\u505A\u8BBE\u8BA1\uFF0C \u6211\u66F4\u504F\u5411\u53BB\u7EDF\u4E00\u54C1\u724C\u7684\u89C6\u89C9\u6C14\u8D28\u3001\u753B\u9762\u8282\u594F\u548C\u6700\u7EC8\u5448\u73B0\u3002 \u4F1A\u6BD4\u8F83\u5728\u610F\u7EC6\u8282\uFF0C\u4E5F\u5E0C\u671B\u6BCF\u5F20\u753B\u9762\u90FD\u8DB3\u591F\u5B8C\u6574\u3002"))), /*#__PURE__*/React.createElement("div", {
    className: "about-anchor"
  }, /*#__PURE__*/React.createElement("div", {
    className: "aa-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\u4EA4\u4ED8"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "49 \u4EF6"), /*#__PURE__*/React.createElement("span", {
    className: "s"
  }, "\u7AD6\u5C4F \xB7 \u6A2A\u5C4F \xB7 \u8BE6\u60C5 \xB7 \u6E32\u67D3")), /*#__PURE__*/React.createElement("div", {
    className: "aa-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\u9879\u76EE"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "07 \u4E2A"), /*#__PURE__*/React.createElement("span", {
    className: "s"
  }, "2025 \u2014 2026 \xB7 \u72EC\u7ACB\u4E3B\u5BFC")), /*#__PURE__*/React.createElement("div", {
    className: "aa-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\u534F\u4F5C"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "Anker \xB7 eufy"), /*#__PURE__*/React.createElement("span", {
    className: "s"
  }, "+ 5 \u4E2A\u4FDD\u5BC6\u9879\u76EE")), /*#__PURE__*/React.createElement("div", {
    className: "aa-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "\u73B0\u72B6"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "\u5F00\u653E\u5408\u4F5C"), /*#__PURE__*/React.createElement("span", {
    className: "s"
  }, "\u5168\u804C / \u957F\u671F\u5408\u4F5C\u5747\u53EF")))));
}

// ---------------- 03 Tools ----------------
function ToolsSection({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "screen sec",
    "data-screen-label": "03 Tools"
  }, /*#__PURE__*/React.createElement("div", {
    className: "orb",
    style: {
      left: "20vw",
      bottom: "-20vh"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "code"
  }, String(idx).padStart(2, "0"), " / ", String(total).padStart(2, "0")), " \xA0\u2014\xA0 \u5DE5\u5177\u4E0E\u6280\u80FD"), /*#__PURE__*/React.createElement("span", null, "Tools & Skills")), /*#__PURE__*/React.createElement("div", {
    className: "tools-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tools-lede"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "sec-title"
  }, "\u5DE5\u5177\uFF0C", /*#__PURE__*/React.createElement("span", {
    className: "soft"
  }, "\u5373\u8BED\u6C47\u3002")), /*#__PURE__*/React.createElement("p", {
    className: "sec-sub"
  }, "\u4E09\u7EC4\u8BED\u6C47\uFF0C\u5BF9\u5E94\u4E09\u79CD\u5DE5\u4F5C\u65B9\u5F0F \u2014\u2014 \u89C6\u89C9\u65B9\u5411\u8D1F\u8D23\u628A\u547D\u9898\u7FFB\u8BD1\u6210\u753B\u9762\uFF0C\u4E09\u7EF4\u8BED\u8A00\u8D1F\u8D23\u628A\u753B\u9762\u5177\u8C61\u6210\u6750\u8D28\uFF0CAI \u5DE5\u4F5C\u6D41\u8D1F\u8D23\u628A\u4EA7\u80FD\u5EF6\u5C55\u5230\u66F4\u591A\u573A\u666F\u3002")), /*#__PURE__*/React.createElement("div", {
    className: "tools-grid"
  }, TOOLS.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "tool-card",
    style: {
      "--w": t.weight
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tc-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tc-meta"
  }, String(i + 1).padStart(2, "0"), " \xB7 ", t.cn), /*#__PURE__*/React.createElement("h3", {
    className: "tc-name"
  }, t.name)), /*#__PURE__*/React.createElement("ul", {
    className: "tc-list"
  }, t.items.map((it, j) => /*#__PURE__*/React.createElement("li", {
    key: j,
    className: `tc-item tc-item-${it.w.toLowerCase()}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "tc-tool"
  }, it.k), /*#__PURE__*/React.createElement("span", {
    className: "tc-w"
  }, it.w)))))))));
}

// ---------------- 04 Workflow ----------------
function WorkflowSection({
  idx,
  total
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "screen sec",
    "data-screen-label": "04 Workflow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "orb",
    style: {
      right: "5vw",
      top: "-15vh"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "code"
  }, String(idx).padStart(2, "0"), " / ", String(total).padStart(2, "0")), " \xA0\u2014\xA0 \u5DE5\u4F5C\u6D41\u7A0B"), /*#__PURE__*/React.createElement("span", null, "Workflow")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "sec-title"
  }, "\u4E94\u6B65\u8282\u62CD\uFF0C", /*#__PURE__*/React.createElement("span", {
    className: "soft"
  }, "\u4E00\u79CD\u6C14\u8D28\u3002")), /*#__PURE__*/React.createElement("p", {
    className: "sec-sub"
  }, "\u4E00\u5957\u4ECE\u7406\u89E3\u5230\u6536\u5C3E\u7684\u7A33\u5B9A\u8282\u594F\u3002\u6BCF\u4E00\u6B65\u90FD\u4E3A\u4E0B\u4E00\u6B65\u7559\u51FA\u56DE\u58F0 \u2014\u2014 \u8FD9\u662F\u8BA9\u5927\u4F53\u91CF\u9879\u76EE\u4FDD\u6301\u6C14\u8D28\u7684\u65B9\u5F0F\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "workflow-body",
    style: {
      marginTop: 56
    }
  }, WORKFLOW.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "wf-step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wf-num"
  }, w.n), /*#__PURE__*/React.createElement("h3", {
    className: "wf-title"
  }, w.t), /*#__PURE__*/React.createElement("span", {
    className: "wf-cn"
  }, w.cn), /*#__PURE__*/React.createElement("p", {
    className: "wf-desc"
  }, w.d))))));
}

// ---------------- 05 Contact — footer style ----------------
function ContactSection({
  idx,
  total
}) {
  const year = new Date().getFullYear();
  return /*#__PURE__*/React.createElement("section", {
    className: "screen contact-screen",
    "data-screen-label": "05 Contact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "orb lg",
    style: {
      left: "50%",
      top: "40%",
      transform: "translate(-50%,-50%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "contact-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "contact-eyebrow"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, String(idx).padStart(2, "0"), " / ", String(total).padStart(2, "0")), " \xA0\xB7\xA0 \u8054\u7CFB\u6211")), /*#__PURE__*/React.createElement("h2", {
    className: "contact-big"
  }, /*#__PURE__*/React.createElement("span", {
    className: "soft"
  }, "\u8BA9\u6211\u4EEC\u4E00\u8D77\uFF0C\u628A\u5B89\u9759\u7684\u4E1C\u897F\uFF0C"), /*#__PURE__*/React.createElement("br", null), "\u505A\u5F97\u66F4\u54CD\u4EAE\u3002"), /*#__PURE__*/React.createElement("h2", {
    className: "contact-big",
    style: {
      fontSize: "clamp(28px, 3.2vw, 56px)",
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "email",
    href: "mailto:hello@qiqi.studio"
  }, "hello@qiqi.studio"))), /*#__PURE__*/React.createElement("footer", {
    className: "contact-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Email"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, "3527892923@qq.com")), /*#__PURE__*/React.createElement("div", {
    className: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Phone"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, "+86 185 7396 2623")), /*#__PURE__*/React.createElement("div", {
    className: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Based"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, "\u6DF1\u5733 \xB7 Remote")), /*#__PURE__*/React.createElement("div", {
    className: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "label"
  }, "Open for"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, "\u54C1\u724C\u89C6\u89C9 \xB7 \u89C6\u89C9\u4E3B\u521B")), /*#__PURE__*/React.createElement("div", {
    className: "copyright"
  }, "\xA9 ", year, " \xA0\xB7\xA0 QIQI", /*#__PURE__*/React.createElement("br", null), "All rights reserved")));
}

// ---------------- Chrome ----------------
function BrandMark() {
  return /*#__PURE__*/React.createElement("div", {
    className: "brand-mark"
  }, /*#__PURE__*/React.createElement("span", null, "QIQI"), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "role"
  }, "Brand Visual Direction"));
}
function DigitalNav({
  items,
  active,
  onJump
}) {
  const navRef = useRef(null);
  const trackFillRef = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const nav = navRef.current;
    const fill = trackFillRef.current;
    if (!nav || !fill) return;
    const itemEls = nav.querySelectorAll(".dn-item");
    const target = itemEls[active];
    if (target) {
      const offset = target.offsetTop;
      fill.style.transform = `translateY(${offset}px)`;
    }
  }, [active]);
  const toggleAudio = async e => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try {
        await a.play();
      } catch (err) {/* ignore */}
    } else {
      a.pause();
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "digital-nav",
    ref: navRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "dn-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dn-track-fill",
    ref: trackFillRef
  })), items.map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: it.code,
    className: `dn-item${i === active ? " active" : ""}`,
    onClick: () => onJump(i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "dn-label"
  }, it.label), /*#__PURE__*/React.createElement("span", {
    className: "dn-line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "dn-num"
  }, it.code))), /*#__PURE__*/React.createElement("button", {
    className: `music-toggle${playing ? " is-playing" : ""}`,
    type: "button",
    onClick: toggleAudio,
    "aria-label": playing ? "暂停浆果" : "播放浆果"
  }, /*#__PURE__*/React.createElement("span", {
    className: "music-icon",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "music-text"
  }, playing ? "Pause" : "Play")), /*#__PURE__*/React.createElement("audio", {
    ref: audioRef,
    src: "TINY7 - \u6D46\u679C.mp3",
    preload: "metadata",
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: e => {
      e.currentTarget.currentTime = 0;
      setPlaying(false);
    }
  }));
}
function FootMeta({
  items,
  active
}) {
  const cur = items[active] || items[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "footmeta"
  }, /*#__PURE__*/React.createElement("span", null, "INDEX \xB7 ", cur.code), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 10,
      background: "var(--fg-14)"
    }
  }), /*#__PURE__*/React.createElement("span", null, cur.label));
}

// ---------------- App ----------------
function App() {
  const [t, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const stageRef = useRef(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [openProject, setOpenProject] = useState(null);

  // Palette → CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const [bg, fg, accent] = t.palette || ["#0e0e10", "#f1efea", "#7c7c8a"];
    root.style.setProperty("--bg", bg);
    root.style.setProperty("--fg", fg);
    root.style.setProperty("--accent", accent);
    const hex2rgb = hex => {
      const m = hex.replace("#", "");
      return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
    };
    const [r, g, b] = hex2rgb(fg);
    root.style.setProperty("--fg-04", `rgba(${r},${g},${b},0.04)`);
    root.style.setProperty("--fg-08", `rgba(${r},${g},${b},0.08)`);
    root.style.setProperty("--fg-14", `rgba(${r},${g},${b},0.14)`);
    root.style.setProperty("--fg-22", `rgba(${r},${g},${b},0.22)`);
    root.style.setProperty("--fg-30", `rgba(${r},${g},${b},0.30)`);
    root.style.setProperty("--fg-55", `rgba(${r},${g},${b},0.55)`);
    root.style.setProperty("--fg-72", `rgba(${r},${g},${b},0.72)`);
    document.body.classList.toggle("light", !t.dark);
  }, [t.palette, t.dark]);

  // Scroll tracking
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const handler = () => {
      const sh = stage.scrollTop;
      const vh = window.innerHeight;
      const i = Math.round(sh / vh);
      const total = stage.scrollHeight - vh;
      setProgress(total > 0 ? sh / total * 100 : 0);
      setActive(i);
    };
    stage.addEventListener("scroll", handler, {
      passive: true
    });
    handler();
    return () => stage.removeEventListener("scroll", handler);
  }, []);

  // Hash routing
  useEffect(() => {
    const sync = () => {
      const m = window.location.hash.match(/^#\/project\/(\d{2})$/);
      if (m) {
        const p = PROJECTS.find(pp => pp.code === m[1]);
        setOpenProject(p || null);
      } else {
        setOpenProject(null);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    document.body.style.overflow = openProject ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openProject]);
  const jump = i => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.scrollTo({
      top: i * window.innerHeight,
      behavior: "smooth"
    });
  };
  const openProjectByCode = code => {
    window.location.hash = `#/project/${code}`;
  };
  const closeProject = () => {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setOpenProject(null);
  };
  const navProject = dir => {
    if (!openProject) return;
    const i = PROJECTS.findIndex(p => p.code === openProject.code);
    const nxt = PROJECTS[(i + dir + PROJECTS.length) % PROJECTS.length];
    window.location.hash = `#/project/${nxt.code}`;
  };
  const totalAssets = useMemo(() => PROJECTS.reduce((s, p) => s + p.chapters.reduce((a, c) => a + c.assets.count, 0), 0), []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "progress",
    style: {
      width: `${progress}%`
    }
  }), /*#__PURE__*/React.createElement(BrandMark, null), /*#__PURE__*/React.createElement(DigitalNav, {
    items: SECTIONS,
    active: active,
    onJump: jump
  }), /*#__PURE__*/React.createElement(FootMeta, {
    items: SECTIONS,
    active: active
  }), /*#__PURE__*/React.createElement("div", {
    className: "stage",
    ref: stageRef
  }, /*#__PURE__*/React.createElement(Hero, {
    totalAssets: totalAssets
  }), /*#__PURE__*/React.createElement(DirectorySection, {
    idx: 1,
    total: SECTIONS.length,
    onOpen: openProjectByCode
  }), /*#__PURE__*/React.createElement(AboutSection, {
    idx: 2,
    total: SECTIONS.length
  }), /*#__PURE__*/React.createElement(ToolsSection, {
    idx: 3,
    total: SECTIONS.length
  }), /*#__PURE__*/React.createElement(WorkflowSection, {
    idx: 4,
    total: SECTIONS.length
  }), /*#__PURE__*/React.createElement(ContactSection, {
    idx: 5,
    total: SECTIONS.length
  })), openProject && /*#__PURE__*/React.createElement(ProductDetail, {
    project: openProject,
    onClose: closeProject,
    onNav: navProject
  }), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Theme"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Palette",
    value: t.palette,
    options: PALETTES,
    onChange: v => setTweak("palette", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Dark mode",
    value: t.dark,
    onChange: v => setTweak("dark", v)
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));