document.addEventListener("DOMContentLoaded", () => {
  let extensionBtn = document.getElementById("extension-btn");
  let ringplanBtn = document.getElementById("ringplan-btn");
  let logoContainer = document.querySelector(".logo-container");
  extensionBtn.onclick = async () => {
    window.location = "/webphone.html";
  };
  ringplanBtn.onclick = () => {
    const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    console.log(isDev,"isdev");
    console.log(window.location);
    window.location = `https://b2clogin.dev.ringplan.com/login?back=${
      isDev
        ? "http://localhost:5500/callback.html"
        : "https://webphone.dev.ringplan.com/callback.html"
    }`;
  };
  
  logoContainer.addEventListener("animationend", (e) => {
    let img = logoContainer.querySelector("img");
    img.src = "/images/ringplan-green.svg";
  });
});
