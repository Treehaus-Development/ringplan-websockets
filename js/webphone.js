let classesStr = `items-center text-[#0D0D54] font-bold bg-[#F7F7FB] border-r-4 border-[#3B9EF7]`;
let activeClasses = classesStr.split(" ");
let subMenuClassesStr = `bg-[#F7F7FB] text-[#0D0D54]`;
let activeSubMenuClasses = subMenuClassesStr.split(" ");

const toggleCSSclasses = (el, ...cls) =>
  cls.map((cl) => el.classList.toggle(cl));

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

let beforeHistory = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDay() - 15
).toISOString();


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
  localStorage.clear();
  window.location = "/";
  $("#my-container").webphone.logout();
  sessionStorage.clear();

  setCookie("user_id", "", 1);
  setCookie("secret", "", 1);
  setCookie("cname", "", 1);
  setCookie("domain", "", 1);
};

const handleOpenExtensions = () => {
  let closeBtn = document.getElementById("close-select");
  let modal = document.getElementById("select-extension");

  modal.classList.remove("hidden");
  modal.classList.add("grid");
  let list = localStorage.getItem("extensions");
  if (list) {
    let data = JSON.parse(list);
    let isLoggedIn = true;
    triggerModalUpdates(modal, data, isLoggedIn);
  }

  closeBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("grid");
  };
};

const formatHistoryDate = (date) => {
  let origDate = new Date(date).toLocaleString("en-us", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
  return origDate;
};

const generateAvatar = (text) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 200;
  canvas.height = 200;

  let grd = context.createLinearGradient(0, 0, 200, 0);
  grd.addColorStop(0, "#07a2de");
  grd.addColorStop(1, "#1dd3b3");

  context.fillStyle = grd;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = "bold 100px Roboto";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 1.8);

  return canvas.toDataURL("image/png");
};

const getDetailedCallHistory = async (src,dst) => {
  try {
    const history = await fetch(
      `${backendApi}/cdrs/v3/cdrs?from_date=${beforeHistory}&to_date=${new Date().toISOString()}&src=${src}&dst=${dst}
    `,
      {
        headers: {
          Authorization: id_token,
        },
      }
    );
    if (history.ok) {
      const data = await history.json();
      return data
    }
  } catch(error){
    return error
  }
}


const drawDetailedLog = (data) => {

  let callLogList = document.getElementById("call-log-list")

}

const openDetailedOptions = async (id) => {
  const list = localStorage.getItem("call_history");
  let callDetailsContainer = document.getElementById("call-details")

  let activeElem = document.querySelector(`[data-id="${id}"]`)
  let destImg = document.getElementById("img-dest")
  let activeImageSrc = activeElem.querySelector("img").src
  destImg.src = activeImageSrc
  let destNumber = document.getElementById("dest-number")
  let goBack = document.getElementById("go-back")
  let spinnerLoader = document.getElementById("spinner-loader")
  const listData = JSON.parse(list);
  let activeItem = listData.find((el) => el.cdr.id === id);
  destNumber.innerText = activeItem.cdr.src
  console.log(activeItem, "activeitem");
  callDetailsContainer.classList.remove('hidden')
  callDetailsContainer.classList.add('flex')

  goBack.onclick = () => {
    callDetailsContainer.classList.add('hidden')
    callDetailsContainer.classList.remove('flex')
  }
  spinnerLoader.classList.remove('hidden')
  spinnerLoader.classList.add('grid')
  spinnerLoader.insertAdjacentHTML(`afterbegin`, ` 
      <svg
      aria-hidden="true"
      role="status"
      class="w-10 h-10 mr-3 text-[#00A2DD] animate-spin"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="#E5E7EB"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentColor"
      />
    </svg>
  `)
  const data = await getDetailedCallHistory(activeItem.cdr.src, activeItem.cdr.dst)
  spinnerLoader.innerHTML = ''
  spinnerLoader.classList.add('hidden')
  spinnerLoader.classList.remove('grid')

  drawDetailedLog(data)
};

const drawCallHistory = () => {
  let historyListContainer = document.getElementById("history-list");

  document.getElementById("spinner-list").classList.remove("grid");
  document.getElementById("spinner-list").classList.add("hidden");
  historyListContainer.classList.remove("hidden");
  historyListContainer.classList.add("flex");

  const list = localStorage.getItem("call_history");
  if (list) {
    const listData = JSON.parse(list);
    let html = listData
      .map((el) => {
        let formatedDate = formatHistoryDate(el.cdr.starttime);
        let acronym = el.cdr.pbx_cnam
          ?.match(/(\b\S)?/g)
          .join("")
          .match(/(^\S|\S$)?/g)
          .join("")
          .toUpperCase();
        return `
        <div 
        data-id="${el.cdr.id}" 
        class="flex history-list-item justify-between select-none px-6 py-2 
        items-center border-b border-[#D3D3D3]">
          <div class="flex gap-4 items-center">
            <div class="w-11 h-11">
              <img class="rounded-full" src="${
                el.cdr.pbx_cnam
                  ? generateAvatar(acronym)
                  : "/images/profile.svg"
              }"/>
            </div>
            <div class="flex flex-col">
                <p class="text-[#232323]">${el.cdr.pbx_cnam || el.cdr.src}</p>
                <span class="text-[#A3A3A3]">${
                  el.cdr.dst
                }, ${formatedDate}</span>
            </div>
          </div>
          <div class="cursor-pointer" id="btn-${el.cdr.id}">
            <img src="/images/options.svg"/>
          </div>
        </div>
      `;
      })
      .join(" ");

    historyListContainer.innerHTML = html;

    historyListContainer
      .querySelectorAll(".history-list-item")
      .forEach((item) => {
        let optionsBtn = item.querySelector(`#btn-${item.dataset.id}`);
        optionsBtn.addEventListener("click", () => {
          openDetailedOptions(item.dataset.id);
        });
      });
  }
};

async function getCallHistory() {

  try {
    const history = await fetch(
      `${backendApi}/cdrs/v3/cdrs?from_date=${beforeHistory}&to_date=${new Date().toISOString()}&extension=${getCookie(
        "user_id"
      )}
    `,
      {
        headers: {
          Authorization: id_token,
        },
      }
    );
    if (history.ok) {
      const data = await history.json();
      localStorage.setItem("call_history", JSON.stringify(data));
      drawCallHistory();
    }
  } catch (error) {
    if (isLocalhost) {
      localStorage.setItem("call_history", JSON.stringify(mockHistory));
      drawCallHistory();
    }
  }
}

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
    let callHistoryTab = document.getElementById("call-history");
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
    let callHistoryContainer = document.getElementById("history-container");
    let phoneSubMenu = document.getElementById("phone-submenu");
    mainWrapper.appendChild(container);

    let versionInfoBtn = document.getElementById("version-info");
    let sidebar = document.getElementById("sidebar");
    let hamburgerBtn = document.getElementById("hamburger");

    extensionOpts.querySelector("span").innerText =
      sessionStorage.getItem("user") || getCookie("user_id");

    let statusBadge = document.querySelector("#status-badge");

    if (isFromSSO) {
      extensionOpts.addEventListener("click", handleOpenExtensions);
      getAccount()
        .then((res) => {
          return res.id;
        })
        .then((id) => {
          getUserStatus(id).then((data) => {
            let mainStatus = data.mainStatus;
            statusBadge.src = `/images/status-icons/${mainStatus}.svg`;
          });
        });

      getCallHistory();
    } else {
      extensionOpts.querySelector("div:last-child").classList.add("hidden");
    }

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
      phoneTab.classList.remove(...activeClasses, "gap-16");
      phoneTab.classList.add("gap-5", "font-medium");
      phoneTab.querySelector("img").classList.add("grayscale");
      settingsTab.querySelector("img").classList.remove("grayscale");
      callHistoryTab.classList.remove(...activeClasses, "gap-16", "flex");
      callHistoryContainer.classList.add("hidden");

      phoneSubMenu.classList.add("hidden");
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
      settingsTab.children[0].classList.remove(...activeClasses, "gap-16");
      settingsTab.children[0].classList.add("gap-5", "font-medium");
      phoneTab.querySelector("img").classList.remove("grayscale");
      settingsTab.querySelector("img").classList.add("grayscale");
      phoneSubMenu.classList.remove("hidden");
      subMenu.classList.add("hidden");
      pageTitle.innerText = "Phone";
      extensionOpts.classList.remove("hidden");
      $("#my-container").removeClass("hidden");
      mainContainer.classList.remove("!bg-[#F2F2F2]");
      settingsInfo.classList.add("hidden");
      settingsInfo.classList.remove("flex");
      mainWrapper.classList.remove("h-main", "grid", "place-items-center");
    };

    callHistoryTab.onclick = () => {
      callHistoryContainer.classList.toggle("hidden");
      callHistoryContainer.classList.toggle("flex");
      settingsTab.children[0].classList.remove(...activeClasses, "gap-16");
      settingsTab.children[0].classList.add("gap-5", "font-medium");
      settingsTab.querySelector("img").classList.add("grayscale");
      subMenu.classList.add("hidden");
      activeSubMenuClasses.map((cx) => callHistoryTab.classList.toggle(cx));
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
      if (sidebar.classList.contains("-translate-x-full")) {
        callHistoryContainer.classList.remove("left-[252px]");
      } else {
        callHistoryContainer.classList.add("left-[252px]");
      }
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

window.onload = function () {
  let userDomain = document.getElementById("user_domain");

  userDomain.value = "zraytechnoloDoobh.ringplan.com";
  let uname = getCookie("user_id") || "",
    pass = getCookie("secret") || "",
    cname = getCookie("cname") || "",
    domain = getCookie("domain") || "";

  let userId = document.getElementById("user_id");
  let password = document.getElementById("user_pwd");
  let cnameInput = document.getElementById("user_cname");

  if (params.user) {
    uname = params.user;
    setCookie("user_id", uname);
  }
  if (params.pass) {
    pass = params.pass;
  }

  /**
   *
   * Change domain value from query params
   */
  if (params.domain) {
    let domainValues = params.domain.split(".");
    domainValues.shift();
    let finalValue = domainValues.join(".");
    userDomain.value = finalValue;
  }
  let loader = document.getElementById("loading-progress");
  let loginContent = document.getElementById("login-content");

  if (params.progress) {
    loginContent.classList.add("hidden");
    loader.classList.remove("hidden");
    loader.classList.add("grid");
  }

  if (uname.length > 1 && pass.length > 1 && !params.error) {
    userId.value = uname;
    password.value = pass;
    cnameInput.value = cname;
    updateUI();
  }
};

document.addEventListener("DOMContentLoaded", (e) => {
  /**
   *
   * Change outbound server value from query params
   */
  // let serverUrl = getServerUrl();
  // if (params.outbound_server) {
  //   serverUrl = params.outbound_server;
  // }
  $("#my-container").webphone(["sip.ringplan.com"]);

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

  if (params.error) {
    $("#error-message").show();
    userId.value = "";
    password.value = "";
  }
});
