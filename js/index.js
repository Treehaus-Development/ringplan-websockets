document.addEventListener("DOMContentLoaded", () => {
  let extensionBtn = document.getElementById("extension-btn");
  let ringplanBtn = document.getElementById("ringplan-btn");
  let logoContainer = document.querySelector(".logo-container");
  extensionBtn.onclick = async () => {
    window.location = "/webphone.html";
  };
  ringplanBtn.onclick = () => {
    const isDev = location.hostname === "localhost";
    window.location = `https://b2clogin.ringplan.com/login?back=${
      isDev
        ? "http://localhost:5500/webphone.html"
        : "https://webphone.dev.ringplan.com/webphone.html"
    }`;
  };
  
  logoContainer.addEventListener("animationend", (e) => {
    let img = logoContainer.querySelector("img");
    img.src = "/images/ringplan-green.svg";
  });
});
