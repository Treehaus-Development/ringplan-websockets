const isLocalhost =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";
const isDev = location.hostname === "webphone.dev.ringplan.com";
const isProd = location.hostname === "webphone.ringplan.com";

const getLoginUrl = () => {
  let url = "";
  if (isDev || isLocalhost) {
    url = "https://b2clogin.dev.ringplan.com";
  }

  if (isProd) {
    url = "https://b2clogin.ringplan.com";
  }

  return url;
};

const getGoBackUrl = () => {
  let url = "";
  if (isLocalhost) {
    url = "http://localhost:5500/callback.html";
  }
  if (isDev) {
    url = "https://webphone.dev.ringplan.com/callback.html";
  }
  if (isProd) {
    url = "https://webphone.ringplan.com/callback.html";
  }

  return url;
};

const getBackendUrl = () => {
  let url = "";

  if (isDev || isLocalhost) {
    url = "https://ssp-backend.dev.ringplan.com";
  }
  if (isProd) {
    url = "https://ssp-backend.ringplan.com";
  }
  return url;
};
