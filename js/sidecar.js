function handleToggleSidecar(e) {
  localStorage.setItem("sidecarEnabled", e.target.checked);
  if (e.target.checked) {
    let sidecarElem = document.createElement("li");
    sidecarElem.innerHTML = `<li
    id="sidecar-tab"
    class="mt-0.5 cursor-pointer w-full px-6 py-3 flex gap-5 items-center font-bold bg-white"
  >
    <div class="flex items-center w-7">
      <img class="grayscale" src="../images/sidecar.svg" />
    </div>
    <span>Sidecar</span>
  </li>`;

    document
      .getElementById("settings-tab")
      .parentNode.insertBefore(
        sidecarElem,
        document.getElementById("settings-tab")
      );
    document.getElementById("sidecar-tab").onclick = function () {
      handleSidecarTabClick(this);
    };
  } else {
    document.getElementById("sidecar-tab").remove();
  }
}
