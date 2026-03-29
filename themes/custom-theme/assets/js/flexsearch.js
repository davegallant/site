//! Source: https://github.com/h-enk/doks/blob/master/assets/js/index.js

import { Document } from "flexsearch";

const search = document.getElementById("search__text");
const suggestions = document.getElementById("search__suggestions");

if (!search || !suggestions) {
  throw new Error("Search UI elements not found");
}

const backdrop = document.createElement("div");
backdrop.classList.add("search__backdrop");
document.body.appendChild(backdrop);
backdrop.addEventListener("click", () => hideSuggestions());

function hideSuggestions() {
  suggestions.classList.add("search__suggestions--hidden");
  backdrop.classList.remove("search__backdrop--visible");
}

function showSuggestions() {
  suggestions.classList.remove("search__suggestions--hidden");
  backdrop.classList.add("search__backdrop--visible");
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "/") {
    // Focus search bar with CTRL + /
    e.preventDefault();
    search.focus();
  } else if (e.key === "Escape") {
    // Unfocus search bar with ESC
    search.blur();
    hideSuggestions();
  }
});

document.addEventListener("click", (e) => {
  const clickInsideSuggestions = suggestions.contains(e.target);
  if (!clickInsideSuggestions) {
    // Hide search suggestions if clicking elsewhere
    hideSuggestions();
  }
});

/*! Source: https://dev.to/shubhamprakash/trap-focus-using-javascript-6a3 */
document.addEventListener("keydown", (e) => {
  const suggestionsHidden = suggestions.classList.contains(
    "search__suggestions--hidden"
  );
  if (suggestionsHidden) return;

  const focusableSuggestions = [...suggestions.querySelectorAll("a")];
  if (focusableSuggestions.length === 0) return;

  const currentIndex = focusableSuggestions.indexOf(document.activeElement);

  if (e.key === "ArrowDown") {
    // Focus next suggestion
    e.preventDefault();
    const nextIndex =
      currentIndex + 1 < focusableSuggestions.length
        ? currentIndex + 1
        : currentIndex;
    focusableSuggestions[nextIndex].focus();
  } else if (e.key === "ArrowUp") {
    // Focus previous suggestion
    e.preventDefault();
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    focusableSuggestions[nextIndex].focus();
  }
});

(function () {
  const index = new Document({
    tokenize: "forward",
    cache: 100,
    document: {
      id: "id",
      store: ["href", "title", "description"],
      index: ["title", "description", "content"],
    },
  });

  //! Source: https://discourse.gohugo.io/t/range-length-or-last-element/3803/2
  {{ $list := (where .Site.RegularPages "Type" "in" .Site.MainSections) }}
  {{ $len := (len $list) }}

  index.add(
    {{ range $index, $element := $list }}
      {
        id: {{ $index }},
        href: "{{ .RelPermalink }}",
        title: {{ .Title | jsonify }},
        {{ with .Description }}
          description: {{ . | jsonify }},
        {{ else }}
          description: {{ .Summary | plainify | htmlUnescape | jsonify }},
        {{ end }}
        content: {{ .Plain | jsonify }}
      })
      {{ if ne (add $index 1) $len }}
        .add(
      {{ end }}
    {{ end }}
    {{ if eq 0 $len }}
      )
    {{ end }}
  ;

  search.addEventListener("input", function () {
    const maxResultsCount = {{ $.Site.Params.flexsearch.maxResultsCount | default 5 }};
    const searchText = this.value;

    if (!searchText) {
      suggestions.innerHTML = "";
      hideSuggestions();
      return;
    }

    const searchResults = index.search(searchText, maxResultsCount, { enrich: true });
    const searchResultsMap = new Map();

    // Deduplicate search results by href
    for (const searchResult of searchResults.flatMap((r) => r.result)) {
      if (searchResultsMap.has(searchResult.href)) continue;
      searchResultsMap.set(searchResult.doc.href, searchResult.doc);
    }

    suggestions.innerHTML = "";
    showSuggestions();

    if (searchResultsMap.size === 0 && searchText) {
      const noResultsMessage = document.createElement("div");
      const prefix = document.createTextNode('No results for "');
      const strong = document.createElement("strong");
      strong.textContent = searchText;
      const suffix = document.createTextNode('"');
      noResultsMessage.append(prefix, strong, suffix);
      noResultsMessage.classList.add("search__no-results");
      suggestions.appendChild(noResultsMessage);
      return;
    }

    for (const [href, searchResult] of searchResultsMap) {
      const suggestion = document.createElement("a");
      suggestion.href = href;
      suggestion.classList.add("search__suggestion-item");
      suggestions.appendChild(suggestion);

      const title = document.createElement("div");
      title.textContent = searchResult.title;
      title.classList.add("search__suggestion-title");
      suggestion.appendChild(title);

      const description = document.createElement("div");
      description.textContent = searchResult.description;
      description.classList.add("search__suggestion-description");
      suggestion.appendChild(description);

      if (suggestions.childElementCount === maxResultsCount) break;
    }
  });
})();
