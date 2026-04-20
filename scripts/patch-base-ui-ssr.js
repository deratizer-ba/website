/**
 * @base-ui/react useRenderElement skips useMergedRefs when `document` is undefined (SSR).
 * That changes hook order vs the client and desynchronizes React useId — hydration mismatches
 * on Menu/Dialog triggers (e.g. base-ui-_R_* id attributes).
 * Always run useMergedRefs; ref callbacks are inert during SSR.
 * @see https://github.com/mui/base-ui (upstream may fix in a future release)
 */
const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")

const esmPatch = {
  file: path.join(root, "node_modules/@base-ui/react/esm/utils/useRenderElement.js"),
  from: `  // This also skips the \`useMergedRefs\` call on the server, which is fine because
  // refs are not used on the server side.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (typeof document !== 'undefined') {
    if (!enabled) {
      useMergedRefs(null, null);
    } else if (Array.isArray(ref)) {
      outProps.ref = useMergedRefsN([outProps.ref, getReactElementRef(renderProp), ...ref]);
    } else {
      outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
    }
  }`,
  to: `  // Always call useMergedRefs on server and client so hook order matches (required for
  // React useId / hydration). Ref callbacks are inert during SSR.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (!enabled) {
    useMergedRefs(null, null);
  } else if (Array.isArray(ref)) {
    outProps.ref = useMergedRefsN([outProps.ref, getReactElementRef(renderProp), ...ref]);
  } else {
    outProps.ref = useMergedRefs(outProps.ref, getReactElementRef(renderProp), ref);
  }`,
}

const cjsPatch = {
  file: path.join(root, "node_modules/@base-ui/react/utils/useRenderElement.js"),
  from: `  // This also skips the \`useMergedRefs\` call on the server, which is fine because
  // refs are not used on the server side.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (typeof document !== 'undefined') {
    if (!enabled) {
      (0, _useMergedRefs.useMergedRefs)(null, null);
    } else if (Array.isArray(ref)) {
      outProps.ref = (0, _useMergedRefs.useMergedRefsN)([outProps.ref, (0, _getReactElementRef.getReactElementRef)(renderProp), ...ref]);
    } else {
      outProps.ref = (0, _useMergedRefs.useMergedRefs)(outProps.ref, (0, _getReactElementRef.getReactElementRef)(renderProp), ref);
    }
  }`,
  to: `  // Always call useMergedRefs on server and client so hook order matches (required for
  // React useId / hydration). Ref callbacks are inert during SSR.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (!enabled) {
    (0, _useMergedRefs.useMergedRefs)(null, null);
  } else if (Array.isArray(ref)) {
    outProps.ref = (0, _useMergedRefs.useMergedRefsN)([outProps.ref, (0, _getReactElementRef.getReactElementRef)(renderProp), ...ref]);
  } else {
    outProps.ref = (0, _useMergedRefs.useMergedRefs)(outProps.ref, (0, _getReactElementRef.getReactElementRef)(renderProp), ref);
  }`,
}

function applyPatch({ file, from, to }) {
  if (!fs.existsSync(file)) {
    return
  }
  const src = fs.readFileSync(file, "utf8")
  if (src.includes("Always call useMergedRefs on server and client")) {
    return
  }
  if (!src.includes(from)) {
    console.warn(
      "[patch-base-ui-ssr] Skipped:",
      path.relative(root, file),
      "(pattern not found — check @base-ui/react version)"
    )
    return
  }
  fs.writeFileSync(file, src.replace(from, to), "utf8")
  console.log("[patch-base-ui-ssr] Applied:", path.relative(root, file))
}

for (const p of [esmPatch, cjsPatch]) {
  applyPatch(p)
}
