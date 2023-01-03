document.addEventListener("DOMContentLoaded", () => {
  let extensionBtn = document.getElementById("extension-btn");
  let ringplanBtn = document.getElementById("ringplan-btn");
  let logoContainer = document.querySelector(".logo-container");
  extensionBtn.onclick = async () => {
    window.location = "/webphone.html";
  };
  ringplanBtn.onclick = () => {
    const loginUrl = getLoginUrl();
    const backUrl = getGoBackUrl();
    window.location = `${loginUrl}/login?back=${backUrl}`;
  };

  logoContainer.addEventListener("animationend", (e) => {
    let img = logoContainer.querySelector("img");
    img.src = "/images/ringplan-green.svg";
  });
});
