(() => {
  "use strict";

  const root = document.querySelector("[data-data-search]");
  const indexNode = document.getElementById("nisp-data-search-index");

  if (!root || !indexNode) {
    return;
  }

  let searchIndex;

  try {
    searchIndex = JSON.parse(indexNode.textContent);
  } catch (error) {
    console.error("Could not parse the Data-page search index.", error);
    return;
  }

  const input = document.getElementById("nisp-data-search-input");
  const clearButton = document.getElementById("nisp-data-search-clear");
  const status = document.getElementById("nisp-data-search-status");
  const emptyState = document.getElementById("nisp-data-search-empty");
  const rows = Array.from(
    document.querySelectorAll(".nisp-data-dataset-row[data-dataset-id]")
  );
  const families = Array.from(
    document.querySelectorAll(".nisp-data-dataset-family")
  );

  const indexByDataset = new Map(
    searchIndex.map((item) => [item.dataset_id, item])
  );

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[–—]/g, "-")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenMatchesText(token, text) {
    if (token.length === 3) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `(^|[^a-z0-9])${escaped}[a-z0-9]*`
      );
      return pattern.test(text);
    }

    return text.includes(token);
  }

  function unique(values) {
    return [...new Set(values)];
  }

  function resultWord(count) {
    return count === 1 ? "dataset" : "datasets";
  }

  function ensureMatchNode(row) {
    let node = row.querySelector(".nisp-data-search-match");

    if (!node) {
      node = document.createElement("span");
      node.className = "nisp-data-search-match";
      node.hidden = true;

      const identity = row.querySelector(".nisp-data-dataset-identity");
      if (identity) {
        identity.appendChild(node);
      }
    }

    return node;
  }

  function matchedReasons(item, normalizedQuery, tokens) {
    if (!item) {
      return [];
    }

    const prepared = item.entries.map((entry, position) => {
      const text = normalize(entry.text);
      const matchedTokens = tokens.filter(
        (token) => tokenMatchesText(token, text)
      );

      return {
        ...entry,
        position,
        text,
        matchedTokens,
        exactPhrase: normalizedQuery.length > 0 &&
          (
            normalizedQuery.length <= 3
              ? tokenMatchesText(normalizedQuery, text)
              : text.includes(normalizedQuery)
          )
      };
    });

    const exact = prepared.filter((entry) => entry.exactPhrase);

    if (exact.length > 0) {
      return unique(exact.map((entry) => entry.label)).slice(0, 2);
    }

    const contributing = prepared
      .filter((entry) => entry.matchedTokens.length > 0)
      .sort((a, b) => {
        if (b.matchedTokens.length !== a.matchedTokens.length) {
          return b.matchedTokens.length - a.matchedTokens.length;
        }
        return a.position - b.position;
      });

    return unique(contributing.map((entry) => entry.label)).slice(0, 2);
  }

  function updateFamilies() {
    families.forEach((family) => {
      const familyRows = Array.from(
        family.querySelectorAll(".nisp-data-dataset-row")
      );

      family.hidden = !familyRows.some((row) => !row.hidden);
    });
  }

  function runSearch() {
    const rawQuery = input.value.trim();
    const normalizedQuery = normalize(rawQuery);
    const tokens = normalizedQuery
      ? normalizedQuery.split(" ").filter(Boolean)
      : [];
    const waitingForMoreInput =
      normalizedQuery.length > 0 &&
      normalizedQuery.length < 3 &&
      tokens.length === 1;

    let visibleCount = 0;

    rows.forEach((row) => {
      const datasetId = row.dataset.datasetId;
      const item = indexByDataset.get(datasetId);
      const matchNode = ensureMatchNode(row);

      if (!item || tokens.length === 0 || waitingForMoreInput) {
        row.hidden = false;
        matchNode.hidden = true;
        matchNode.textContent = "";
        visibleCount += 1;
        return;
      }

      const combinedText = normalize(
        item.entries.map((entry) => entry.text).join(" ")
      );

      const matches = tokens.every(
        (token) => tokenMatchesText(token, combinedText)
      );
      row.hidden = !matches;

      if (!matches) {
        matchNode.hidden = true;
        matchNode.textContent = "";
        return;
      }

      visibleCount += 1;

      const reasons = matchedReasons(item, normalizedQuery, tokens);

      if (reasons.length > 0) {
        matchNode.textContent = `Match: ${reasons.join(" · ")}`;
        matchNode.hidden = false;
      } else {
        matchNode.hidden = true;
        matchNode.textContent = "";
      }
    });

    updateFamilies();

    clearButton.hidden = rawQuery.length === 0;
    emptyState.hidden = visibleCount !== 0 || rawQuery.length === 0;

    if (rawQuery.length === 0) {
      status.textContent = `${visibleCount} ${resultWord(visibleCount)}`;
    } else if (waitingForMoreInput) {
      const remaining = 3 - normalizedQuery.length;
      status.textContent =
        `Type ${remaining} more ${remaining === 1 ? "character" : "characters"} to search`;
    } else {
      status.textContent =
        `${visibleCount} ${resultWord(visibleCount)} match “${rawQuery}”`;
    }
  }

  input.addEventListener("input", runSearch);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      runSearch();
    }
  });

  clearButton.addEventListener("click", () => {
    input.value = "";
    runSearch();
    input.focus();
  });

  runSearch();
})();
