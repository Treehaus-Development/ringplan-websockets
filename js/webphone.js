let classesStr = `items-center text-[#0D0D54] font-bold bg-[#F7F7FB] border-r-4 border-[#3B9EF7]`;
let activeClasses = classesStr.split(" ");
let subMenuClassesStr = `bg-[#F7F7FB] text-[#0D0D54]`;
let activeSubMenuClasses = subMenuClassesStr.split(" ");

async function login() {
  let user = document.getElementById("user_id");
  let pwd = document.getElementById("user_pwd");
  let cname = document.getElementById("user_cname");
  let domain = document.getElementById("user_domain");

  return new Promise((resolve, reject) => {
    $("#my-container").webphone.login(
      user.value,
      pwd.value,
      cname.value,
      domain.value.length > 0 ? domain.value : null,
      async () => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        sessionStorage.setItem("user", user.value);
        if (params.error) {
          urlSearchParams.delete("error");
          history.pushState({}, "", window.location.pathname);
        }
        user.value = "";
        pwd.value = "";
        resolve();
      },
      async () => {
        reject();
      }
    );
  });
}

const logout = async () => {
  $("#my-container").webphone.logout();
  $("#login-content").removeClass("hidden");
  $("#my-container").removeClass("px-2 md:px-4 lg:px-6 py-6");
  let container = document.getElementById("my-container");
  let dialpadContent = document.getElementById("dialpad-content");
  dialpadContent.classList.add("hidden");
  dialpadContent.innerHTML = "";
  dialpadContent.appendChild(container);

  sessionStorage.clear();

  setCookie("user_id", "", 1);
  setCookie("secret", "", 1);
  setCookie("cname", "", 1);
  setCookie("domain", "", 1);
};

async function updateUI() {
  try {
    await login();
    document.getElementById("login-content").classList.add("hidden");
    const data = await fetch("/dialpad/index.html");
    const html = await data.text();
    document.getElementById("dialpad-content").classList.remove("hidden");
    if (!document.getElementById("main")) {
      document
        .getElementById("dialpad-content")
        .insertAdjacentHTML("afterbegin", html);
    }
    document.getElementById("error-message").style.display = "none";
    document.getElementById("loading-progress").classList.remove("grid");
    document.getElementById("loading-progress").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    $("#my-container").removeClass("hidden");
    $("#my-container").addClass("flex px-2 md:px-4 lg:px-6 py-6");

    $("#webphone-keypad").removeClass("hidden");
    $("#webphone-keypad").addClass("flex");

    let extensionOpts = document.getElementById("extension-options");
    let phoneTab = document.getElementById("phone-tab");
    let settingsTab = document.getElementById("settings-tab");
    let subMenu = document.getElementById("settings-submenu");
    let pageTitle = document.getElementById("page-title");
    let mainContainer = document.getElementById("main");
    let settingsInfo = document.getElementById("settings-info");
    let mainWrapper = document.getElementById("main-wrapper");
    let logoutPopupTrigger = document.getElementById("logout-trigger");
    let modal = document.getElementById("logout-modal");
    let logoutConfirm = document.getElementById("logout-confirm");
    let logoutCancel = document.getElementById("logout-cancel");
    let container = document.getElementById("my-container");
    mainWrapper.appendChild(container);

    let versionInfoBtn = document.getElementById("version-info");
    let sidebar = document.getElementById("sidebar");
    let hamburgerBtn = document.getElementById("hamburger");

    extensionOpts.querySelector("span").innerText =
      sessionStorage.getItem("user") || getCookie("user_id");

    const cancelLogout = () => {
      modal.classList.remove("grid");
      modal.classList.add("hidden");
      pageTitle.innerText = "Settings - Version Info";
      settingsInfo.classList.remove("!hidden");
      versionInfoBtn.classList.add(...activeSubMenuClasses);
      logoutPopupTrigger.classList.remove(...activeSubMenuClasses);
    };

    // tabs functionality

    settingsTab.onclick = () => {
      settingsTab.children[0].classList.remove("gap-5");
      settingsTab.children[0].classList.add(...activeClasses, "gap-16");
      phoneTab.classList.remove(...activeClasses);
      phoneTab.classList.add("gap-5", "font-medium");
      phoneTab.querySelector("img").classList.add("grayscale");
      settingsTab.querySelector("img").classList.remove("grayscale");
      subMenu.classList.remove("hidden");
      pageTitle.innerText = "Settings - Version Info";
      extensionOpts.classList.add("hidden");
      $("#my-container").addClass("hidden");
      mainContainer.classList.add("!bg-[#F2F2F2]");
      settingsInfo.classList.remove("hidden");
      settingsInfo.classList.add("flex");
      mainWrapper.classList.add("h-main", "grid", "place-items-center");
    };

    phoneTab.onclick = () => {
      phoneTab.classList.remove("gap-5");
      phoneTab.classList.add(...activeClasses, "gap-16");
      settingsTab.children[0].classList.remove(...activeClasses);
      settingsTab.children[0].classList.add("gap-5", "font-medium");
      phoneTab.querySelector("img").classList.remove("grayscale");
      settingsTab.querySelector("img").classList.add("grayscale");
      subMenu.classList.add("hidden");
      pageTitle.innerText = "Phone";
      extensionOpts.classList.remove("hidden");
      $("#my-container").removeClass("hidden");
      mainContainer.classList.remove("!bg-[#F2F2F2]");
      settingsInfo.classList.add("hidden");
      settingsInfo.classList.remove("flex");
      mainWrapper.classList.remove("h-main", "grid", "place-items-center");
    };

    logoutPopupTrigger.onclick = (e) => {
      e.stopPropagation();
      modal.classList.remove("hidden");
      modal.classList.add("grid");
      pageTitle.innerText = "Settings - Logout";
      settingsInfo.classList.add("!hidden");
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      logoutPopupTrigger.classList.add(...activeSubMenuClasses);
    };

    logoutConfirm.onclick = () => {
      logout();
    };
    logoutCancel.onclick = () => {
      cancelLogout();
    };

    hamburgerBtn.onclick = () => {
      sidebar.classList.toggle("-translate-x-full");
    };
  } catch (error) {
    document.getElementById("dialpad-content").classList.add("hidden");
    document.getElementById("login-content").classList.remove("hidden");
    document.getElementById("loading-progress").classList.remove("grid");
    document.getElementById("loading-progress").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    document.getElementById("error-message").style.display = "inline";
  }
}

const loginWithApi = async () => {
  const id_token =
    getCookie("id_token") ||
    `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjNpUDRvM2cyZHpQOFQxcXJYWjFZQXNzN1dhY19zSmNpcldkaGRiRDBqa1EifQ.eyJleHAiOjE2NzI2NjI2NTEsIm5iZiI6MTY3MjY1OTA1MSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9kZXZyaW5ncGxhbi5iMmNsb2dpbi5jb20vZTdiZmZlNmEtN2M5ZC00ODY0LThmYmYtNmIzNmVjMjJkODExL3YyLjAvIiwic3ViIjoiNjQzZThjZmItZDBhZC00YTY1LWJjYjktYThkZTkxNzc4YTgwIiwiYXVkIjoiZGQwN2U1NTUtZTFiNi00ZTViLWJhOGItYjUyZDJhZmVkOWI4IiwiYWNyIjoiYjJjXzFhX3NpZ25pbm9ubHkiLCJpYXQiOjE2NzI2NTkwNTEsImF1dGhfdGltZSI6MTY3MjY1OTA1MCwiZ2l2ZW5fbmFtZSI6IkRlZXAiLCJmYW1pbHlfbmFtZSI6IkNoYW5kIiwiZXh0ZW5zaW9uX2NvbXBhbnkiOiJTdGFydHhsYWJzIFRlY2hub2xvZ2llcyIsImVtYWlscyI6WyJoZWxsb0BzdGFydHhsYWJzLmNvbSJdLCJ0aWQiOiJlN2JmZmU2YS03YzlkLTQ4NjQtOGZiZi02YjM2ZWMyMmQ4MTEiLCJhdF9oYXNoIjoiMUZHb1hJTXgzMUR4SHlUa1ZoaU9VQSJ9.VM2MqiZINWl6FL8dUMP3LnHehSyrbF_J4rL_48G5FBeEPgKLlGaCbJlaI4dXEJLY66FyFZe_FUQqJMYUSLJ4_Mj1DhZvM0yVburMW5uEO8LM4CeTsuUbh0VQSBxrdhdfBuh9S-_AdYt-I6Wxlf_Vvu2ofaHU0d7E6Iphjz458JuiiDy95myxCqzVDxr_uQS8_Y96_aRNUWuCHl4f25lDCS48FSBPiITEXVaAvOOymyi3P5o1bBjb4TjRiQcwRGWtTM74RiOUI8SaTvz5OU4WQvtX8XCkK7zoI2auV3vnoF5P_bJezz45PsnzmUvs6lQRtM0uM5bEdSOvEnQ9N6OfAw`;
  const access_token =
    getCookie("refresh_token") ||
    `eyJraWQiOiJ3Q0RtM0lnTjZaT0NRYzI2di1lbFZPUUtxcU85TXAwOUcwS3lZZk02MEswIiwidmVyIjoiMS4wIiwiemlwIjoiRGVmbGF0ZSIsInNlciI6IjEuMCJ9.RbTz_VzgQaRtBr7Gfsv1HKjZ0lSB1sr3ThgidRzCKMerIvL-uKU8i1y280Y1HXEce9laehG1cOVPfHTLjXGHaw6q_nVhyzNYnB8vk8GUG8ton56rQpsDupC5rq_GONEB9cScXMJPurbmCdNbLSaznebPAeoti0iTzg_27EnDkdf82ueZm2Adn78BsNUfTNzNu696C69FqCBHsssR3kWGgKKkhOcFVwaJZXHVha5TgY1LcNpjIbSBjhG0H-Oi_-LvHZHUxazdcMrhXVIoMUJapeCbZftrXnnhcn5YDGpmGsq7O4C_TNEbxk3znK39A1kUsTZETAfhongHbPQXOf7d0w.P9mgkae-K7bR31VW.5_zOrPf8Q0Hy9p3B9z8uTdfK_nEeyqMuJzfIepHWmfhfm1i6mW_fJyO88J0vlixDGo9vGMrICAYCmd_CAyQqfJSo_3TWje6oQdL5qd8vHE5v8cLQLARDn2lZF-jO5NaMDHgSvsxoYbo6IMMX953iqUabckrQVqcurqJsybeDi4DgElGABUbWc_1NiYPqD6Zh2MvQNMVrjCuXviN0VVmT4kgFL0hy2xzJyJZCqeVJGNXMnjDwcS1llxF2eAIvovW97a3YIYWPd91NZTJtYjAUuxr-Cmo_L4zLplvgMsQ2CEM0mO_Wja07lpg_8ohUDIQaqT9u7xl9a89CEBIE5xoKArbz_JiClOiormrFGCe8Tyry8jg6jKiRxXBIA2RpUfkQQMbKKbawhkp_xkistL_RFzlxUUzyUwws-PCY4CJleVTy9mmw8NKx5xRLV9rt78Oge_mLGs0OyUVf4MatBjGbYvOpceRLXGH3C0GB36EODLTTUDyRTwOlbdekC-eph9Z4CQAd5XK5Hu1NyR-2CscuA5OM75oMaZAChELvizE_hN1nfhOUiGtNvMH6c_rn5MBrvo4LjUEiPKZYDfzmvwKuDW7oQi7hDzR8sHN1M6WS_7q1ndHzY4c8BxkYejCDpr4MhlXPbr698Ghy_IRWzSdiiD7rDv3UwN7E4TC8ZfHDsCacqAicwUha8xFmBQxkFr7nX_V1yWKfGeyv.CnBz526n92gtQOGnbtL9Uw`;
  const key = "b6ae17b92f60d3110c2cDsI90!dK5!1P";

  const data = {
    access_token,
    id_token,
    key,
  };

  const response = await fetch(
    "https://b2clogin.dev.ringplan.com/api/user/store",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (response.ok) {
    try {
      const getInstances = await fetch(
        "https://ssp-backend.dev.ringplan.com/system/instances",
        {
          headers: {
            Authorization: data.id_token,
          },
        }
      );

      console.log(getInstances, "getexts");

      if (getInstances.ok) {
        try {
          const extension = await getInstances.json();
          const uuid = extension[0].uuid;

          try {
            const fetchList = await fetch(
              `https://ssp-backend.dev.ringplan.com/instances/${uuid}/bulks/extensions`,
              {
                headers: {
                  Authorization: data.id_token,
                },
              }
            );

            if (fetchList.ok) {
              const list = await fetchList.json();
              console.log(list, "list");
            }
          } catch (error) {
            console.log(error.message, "error");
          }
        } catch (error) {
          console.log(error.message, "error getting instances");
        }
      }
    } catch (e) {
      console.log(e.message);
    }
  }
};

window.onload = function () {
  let userDomain = document.getElementById("user_domain");

  userDomain.value = "zraytechnoloDoobh.ringplan.com";
  let uname = getCookie("user_id") || "",
    pass = getCookie("secret") || "",
    cname = getCookie("cname") || "",
    domain = getCookie("domain") || "";

  if (
    window.location.search.length > 1 &&
    window.location.search.toLowerCase().indexOf("user=") > -1 &&
    window.location.search.toLowerCase().indexOf("pass=") > -1
  ) {
    let query_params = window.location.search.split("&");
    for (var i = 0; i < query_params.length; i++) {
      if (query_params[i].toLowerCase().indexOf("user=") > -1) {
        uname = query_params[i].split("=")[1];
      } else if (query_params[i].toLowerCase().indexOf("pass=") > -1) {
        pass = query_params[i].split("=")[1];
      } else if (query_params[i].toLowerCase().indexOf("cname=") > -1) {
        cname = query_params[i].split("=")[1].replace("%20", " ");
      } else if (query_params[i].toLowerCase().indexOf("domain=") > -1) {
        domain = query_params[i].split("=")[1];
      }
    }
  }

  let userId = document.getElementById("user_id");
  let password = document.getElementById("user_pwd");
  let cnameInput = document.getElementById("user_cname");
  let domainInput = document.getElementById("user_domain");

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  if (uname.length > 1 && pass.length > 1 && !params.error) {
    userId.value = uname;
    password.value = pass;
    cnameInput.value = cname;
    domainInput.value = domain;
    updateUI();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  $("#my-container").webphone(["sip.ringplan.com"]);

  if (document.referrer.includes("callback")) {
    loginWithApi();
  }

  let userId = document.getElementById("user_id");
  let password = document.getElementById("user_pwd");
  let loginBtn = document.getElementById("login-btn");
  let loader = document.getElementById("loading-progress");

  loginBtn.onclick = () => {
    loader.classList.remove("hidden");
    loader.classList.add("grid");
    document.body.classList.add("overflow-hidden");

    updateUI();
  };

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  if (params.error) {
    $("#error-message").show();
    userId.value = "";
    password.value = "";
  }
});
