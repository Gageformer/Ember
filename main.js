// Shows the newest release name and date on the download page.
// If GitHub can't be reached, the text already in the page stays.
(function () {
  var name = document.querySelector("[data-release-name]");
  var date = document.querySelector("[data-release-date]");
  if (!name || !window.fetch) return;

  fetch("https://api.github.com/repos/Gageformer/Ember/releases/latest")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rel) {
      if (!rel || !rel.name) return;
      name.textContent = rel.name;
      if (date && rel.published_at) {
        date.textContent = new Date(rel.published_at).toLocaleDateString(undefined, {
          year: "numeric", month: "long", day: "numeric"
        });
      }
    })
    .catch(function () {});
})();
