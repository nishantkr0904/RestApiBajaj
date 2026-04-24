const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const USER_ID = "nishantkumar_09042006";
const EMAIL_ID = "nishant_k@srmap.edu.in";
const COLLEGE_ROLL = "AP23110010593";

const EDGE_RE = /^([A-Z])->([A-Z])$/;

function validateEntry(raw) {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return { valid: false, original: raw };
  const m = trimmed.match(EDGE_RE);
  if (!m) return { valid: false, original: raw };
  if (m[1] === m[2]) return { valid: false, original: raw };
  return { valid: true, parent: m[1], child: m[2], edge: `${m[1]}->${m[2]}`, original: raw };
}

function processData(data) {
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const dupRecorded = new Set();
  const edges = [];

  for (const entry of data) {
    const result = validateEntry(entry);
    if (!result.valid) {
      invalidEntries.push(result.original);
      continue;
    }
    if (seenEdges.has(result.edge)) {
      if (!dupRecorded.has(result.edge)) {
        duplicateEdges.push(result.edge);
        dupRecorded.add(result.edge);
      }
      continue;
    }
    seenEdges.add(result.edge);
    edges.push(result);
  }

  const childHasParent = new Map();
  const adj = new Map();
  const allNodes = new Set();
  const childNodes = new Set();

  for (const e of edges) {
    if (childHasParent.has(e.child)) continue;
    childHasParent.set(e.child, e.parent);

    allNodes.add(e.parent);
    allNodes.add(e.child);

    if (!adj.has(e.parent)) adj.set(e.parent, []);
    adj.get(e.parent).push(e.child);
    childNodes.add(e.child);
  }

  const visited = new Set();
  const components = [];

  function bfs(start) {
    const comp = new Set();
    const queue = [start];
    comp.add(start);
    while (queue.length > 0) {
      const node = queue.shift();
      const neighbors = [];
      if (adj.has(node)) neighbors.push(...adj.get(node));
      for (const [child, parent] of childHasParent.entries()) {
        if (parent === node && !neighbors.includes(child)) neighbors.push(child);
      }
      if (childHasParent.has(node)) {
        const p = childHasParent.get(node);
        if (!neighbors.includes(p)) neighbors.push(p);
      }
      for (const n of neighbors) {
        if (!comp.has(n)) {
          comp.add(n);
          queue.push(n);
        }
      }
    }
    return comp;
  }

  for (const node of allNodes) {
    if (!visited.has(node)) {
      const comp = bfs(node);
      for (const n of comp) visited.add(n);
      components.push(comp);
    }
  }

  const hierarchies = [];

  for (const comp of components) {
    const roots = [];
    for (const node of comp) {
      if (!childNodes.has(node)) roots.push(node);
    }

    let hasCycle = false;
    let root;

    if (roots.length === 0) {
      hasCycle = true;
      root = [...comp].sort()[0];
    } else {
      root = roots.sort()[0];
      hasCycle = detectCycle(root, adj, comp);
    }

    if (hasCycle) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = buildTree(root, adj);
      const depth = calcDepth(tree);
      hierarchies.push({ root, tree, depth });
    }
  }

  let totalTrees = 0;
  let totalCycles = 0;
  let largestRoot = "";
  let largestDepth = 0;

  for (const h of hierarchies) {
    if (h.has_cycle) {
      totalCycles++;
    } else {
      totalTrees++;
      if (h.depth > largestDepth || (h.depth === largestDepth && (largestRoot === "" || h.root < largestRoot))) {
        largestDepth = h.depth;
        largestRoot = h.root;
      }
    }
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot,
    },
  };
}

function detectCycle(root, adj, comp) {
  const white = new Set(comp);
  const gray = new Set();
  const black = new Set();

  function dfs(node) {
    white.delete(node);
    gray.add(node);
    const children = adj.get(node) || [];
    for (const c of children) {
      if (!comp.has(c)) continue;
      if (gray.has(c)) return true;
      if (white.has(c)) {
        if (dfs(c)) return true;
      }
    }
    gray.delete(node);
    black.add(node);
    return false;
  }

  for (const node of comp) {
    if (white.has(node)) {
      if (dfs(node)) return true;
    }
  }
  return false;
}

function buildTree(node, adj) {
  const children = adj.get(node) || [];
  const subtree = {};
  for (const c of children) {
    Object.assign(subtree, buildTree(c, adj));
  }
  return { [node]: subtree };
}

function calcDepth(tree) {
  const keys = Object.keys(tree);
  if (keys.length === 0) return 0;
  const node = keys[0];
  const children = tree[node];
  const childKeys = Object.keys(children);
  if (childKeys.length === 0) return 1;
  let maxChildDepth = 0;
  for (const ck of childKeys) {
    const d = calcDepth({ [ck]: children[ck] });
    if (d > maxChildDepth) maxChildDepth = d;
  }
  return 1 + maxChildDepth;
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body;
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid request: 'data' must be an array" });
  }
  const result = processData(data);
  res.json(result);
});

app.get("/bfhl", (req, res) => {
  res.json({ operation_code: 1 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
