// Keeps the download page pointed at the newest files.
// Ember and its launcher are released separately, so each button looks for
// the newest release that actually holds its file.
// If GitHub can't be reached, the links already in the page stay.
(function () {
  var links = document.querySelectorAll("[data-dl]");
  if (!links.length || !window.fetch) return;

  var name = document.querySelector("[data-release-name]");
  var date = document.querySelector("[data-release-date]");

  function newestWith(releases, file) {
    for (var i = 0; i < releases.length; i++) {
      var assets = releases[i].assets || [];
      for (var j = 0; j < assets.length; j++) {
        if (assets[j].name === file) return { release: releases[i], url: assets[j].browser_download_url };
      }
    }
    return null;
  }

  fetch("https://api.github.com/repos/Gageformer/Ember/releases?per_page=20")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (releases) {
      if (!releases || !releases.length) return;

      for (var i = 0; i < links.length; i++) {
        var hit = newestWith(releases, links[i].getAttribute("data-dl"));
        if (hit) links[i].href = hit.url;
      }

      // the heading shows the release ember.elf comes from
      var ember = newestWith(releases, "ember.elf");
      if (!ember) return;
      if (name && ember.release.name) name.textContent = ember.release.name;
      if (date && ember.release.published_at) {
        date.textContent = new Date(ember.release.published_at).toLocaleDateString(undefined, {
          year: "numeric", month: "long", day: "numeric"
        });
      }
    })
    .catch(function () {});
})();
