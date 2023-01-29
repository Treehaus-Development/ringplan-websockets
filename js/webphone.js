let classesStr = `items-center text-[#0D0D54] font-bold bg-[#F7F7FB] border-r-4 border-[#3B9EF7] active-tab`;
let activeClasses = classesStr.split(" ");
let subMenuClassesStr = `bg-[#F7F7FB] text-[#0D0D54] active-submenu`;
let activeSubMenuClasses = subMenuClassesStr.split(" ");

const svgLoader = `<svg
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
</svg>`;
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

function makeCall(num) {
  let myContainer = document.getElementById("my-container");
  removeActiveTab();
  setActiveTab(document.getElementById("phone-tab"));
  myContainer.classList.remove("hidden");
  myContainer.classList.add("flex", "active-container");

  document.querySelector(".webphone-digits").value = num;
  document.getElementById("webphone-call-btn").click();
}

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

const getDetailedCallHistory = async (src, dst) => {
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
      return data;
    }
  } catch (error) {
    return error;
  }
};

const setActiveTab = (ele) => {
  ele.classList.remove("gap-5");
  ele.classList.add(...activeClasses, "gap-16");
  ele.querySelector("img").classList.remove("grayscale");
  let voiceMailContainer = document.getElementById("voicemail-container");
  if (!voiceMailContainer.classList.contains("active-container")) {
    document.removeEventListener("click", toggleVoicemailOpts);
  }
};

const removeActiveTab = () => {
  let ele = document.querySelector(".active-tab");
  let activeContainer = document.querySelector(".active-container");
  if (ele.id === "settings-tab") {
    ele = ele.children[0];
  }

  activeContainer.classList.remove("active-container", "flex");
  activeContainer.classList.add("hidden");

  ele.classList.remove(...activeClasses, "gap-16");
  ele.classList.add("gap-5", "font-medium");
  ele.querySelector("img").classList.add("grayscale");
};

const drawDetailedLog = (data) => {
  let callLogList = document.getElementById("call-log-list");

  let html = data
    .map((el) => {
      let formatedDate = formatHistoryDate(el.cdr.starttime);
      return `
        <div class="flex justify-between select-none px-8 py-4 items-start"> 
          <div>
            <p class="text-[#565656]">${formatedDate}</p>
          </div>
          <span class="text-[#7A7A7A]">${el.cdr.duration} secs</span>
        </div>
  `;
    })
    .join(" ");

  callLogList.classList.remove("hidden");
  callLogList.innerHTML = html;
};

const openDetailedOptions = async (id) => {
  const list = localStorage.getItem("call_history");
  let callDetailsContainer = document.getElementById("call-details");
  let callLogList = document.getElementById("call-log-list");
  let activeElem = document.querySelector(`[data-id="${id}"]`);
  let destImg = document.getElementById("img-dest");
  let activeImageSrc = activeElem.querySelector("img").src;
  let destNumber = document.getElementById("dest-number");
  let goBack = document.getElementById("go-back");
  let spinnerLoader = document.getElementById("spinner-loader");
  const listData = JSON.parse(list);
  let activeItem = listData.find((el) => el.cdr.id === id);
  destImg.src = activeImageSrc;
  destNumber.innerText = activeItem.cdr.dst;
  callDetailsContainer.classList.remove("hidden");
  callDetailsContainer.classList.add("flex");
  callLogList.classList.add("hidden");

  goBack.onclick = () => {
    callDetailsContainer.classList.add("hidden");
    callDetailsContainer.classList.remove("flex");
  };
  spinnerLoader.classList.remove("hidden");
  spinnerLoader.classList.add("grid");

  const loaderElement = document.createElement("div");
  loaderElement.id = "log-loader";
  loaderElement.innerHTML = svgLoader;

  if (!document.getElementById("log-loader")) {
    spinnerLoader.insertAdjacentElement("afterbegin", loaderElement);
  }

  let callBtn = document.getElementById("call-detail-btn");

  callBtn.onclick = () => {
    makeCall(activeItem.cdr.dst);
  };

  const data = await getDetailedCallHistory(
    activeItem.cdr.src,
    activeItem.cdr.dst
  );
  spinnerLoader.innerHTML = "";
  spinnerLoader.classList.add("hidden");
  spinnerLoader.classList.remove("grid");

  drawDetailedLog(data);
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
        class="flex history-list-item cursor-pointer justify-between select-none px-6 py-2 
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
                <p class="text-[#232323]">${el.cdr.pbx_cnam || el.cdr.dst}</p>
                <span class="text-[#A3A3A3]">${
                  el.cdr.src
                }, ${formatedDate}</span>
            </div>
          </div>
        </div>
      `;
      })
      .join(" ");

    historyListContainer.innerHTML = html;

    historyListContainer
      .querySelectorAll(".history-list-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          historyListContainer
            .querySelectorAll(".history-list-item")
            .forEach((el) => {
              el.classList.add("pointer-events-none");
            });
          openDetailedOptions(item.dataset.id)
            .then((res) => {
              historyListContainer
                .querySelectorAll(".history-list-item")
                .forEach((el) => {
                  el.classList.remove("pointer-events-none");
                });
            })
            .catch((err) => {
              console.log(err, "err");
              historyListContainer
                .querySelectorAll(".history-list-item")
                .forEach((el) => {
                  el.classList.remove("pointer-events-none");
                });
            });
        });
      });
  }
};

async function getCallHistory() {
  try {
    const history = await fetch(
      `${backendApi}/cdrs/v3/cdrs?from_date=${beforeHistory}&to_date=${new Date().toISOString()}&src=${getCookie(
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
    let script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?libraries=places&language=en&region=US&key=AIzaSyA8GVNT40QJeOAQzp0IHNMJEZlxsmYtVb8&callback=initMap";
    document.body.appendChild(script);

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

    document.getElementById("my-container").insertAdjacentHTML(
      "afterbegin",
      `
      <div id="filter-results-wrapper" class="absolute hidden top-4 left-4 p-3
      bg-white shadow-soft-md rounded ">
        <span class="font-medium text-sm">
          Filtered results
        </span>
        <div id="filter-results" class="max-h-120 overflow-y-auto">
        </div>
      </div>
    `
    );

    $("#webphone-keypad").removeClass("hidden");
    $("#webphone-keypad").addClass("flex");

    let extensionOpts = document.getElementById("extension-options");
    let phoneTab = document.getElementById("phone-tab");
    let settingsTab = document.getElementById("settings-tab");
    let callHistoryTab = document.getElementById("call-history");
    let mainContainer = document.getElementById("main");
    let settingsInfo = document.getElementById("settings-info");
    let mainWrapper = document.getElementById("main-wrapper");
    let logoutPopupTrigger = document.getElementById("logout-trigger");
    let modal = document.getElementById("logout-modal");
    let logoutConfirm = document.getElementById("logout-confirm");
    let logoutCancel = document.getElementById("logout-cancel");
    let container = document.getElementById("my-container");
    let callHistoryContainer = document.getElementById("history-container");
    let voiceMailTab = document.getElementById("voicemail-tab");
    let voiceMailContainer = document.getElementById("voicemail-container");
    let contactsTab = document.getElementById("contacts-tab");
    let contactsContainer = document.getElementById("contacts-container");
    mainWrapper.appendChild(container);

    let versionInfoBtn = document.getElementById("version-info");
    let sidebar = document.getElementById("sidebar");
    let hamburgerBtn = document.getElementById("hamburger");

    extensionOpts.querySelector("span").innerText =
      sessionStorage.getItem("user") || getCookie("user_id");

    let statusBadge = document.querySelector("#status-badge");
    let additionalBadge = document.querySelector("#additional-badge");

    let ctrlDown = false;
    document.addEventListener("keydown", (event) => {
      if (event.code === "ControlLeft" || event.code === "ControlRight") {
        ctrlDown = true;
      }
    });
    document.addEventListener("keyup", (event) => {
      if (event.code === "ControlLeft" || event.code === "ControlRight") {
        ctrlDown = false;
      }
    });

    document.addEventListener("paste", (event) => {
      if (ctrlDown) {
        const pastedContent = event.clipboardData.getData("text/plain");
        if (
          !isNaN(Number(pastedContent)) &&
          phoneTab.classList.contains("active-tab") &&
          !pastedContent.includes(".")
        ) {
          document.querySelector(".webphone-digits").value = pastedContent;
          document
            .getElementById("webphone-backspace-btn")
            .classList.remove("hidden");
        }
      }
    });

    if (isFromSSO) {
      extensionOpts.addEventListener("click", handleOpenExtensions);
      getAccount()
        .then((res) => {
          return res.id;
        })
        .then((id) => {
          getUserStatus(id).then((data) => {
            let mainStatus = data.mainStatus;
            let additionalStatus = data.additionalStatus;
            statusBadge.src = `/images/status-icons/${mainStatus}.svg`;
            if (additionalStatus) {
              additionalBadge.classList.remove("hidden");
              additionalBadge.src = `/images/status-icons/${additionalStatus}.svg`;
            }
          });
        });
      const activeExtension = localStorage.getItem("activeExtension");
      if (activeExtension) {
        let vals = JSON.parse(activeExtension);
        let activeNum =
          vals.outbound_callerid?.number || vals.location.callerid;
        let name = vals.data.name;
        let callerId = document.getElementById("caller-id");
        callerId.innerHTML = `Caller ID: “${name}” &lt;${activeNum}&gt;`;
        callerId.onclick = () => {
          const editExtension = triggerModalUpdates(null, null, null, true);
          editExtension(vals._id, activeNum, name, vals.location?.id);
        };
      }
    } else {
      callHistoryTab.remove();
      voiceMailTab.remove();
      extensionOpts.querySelector("div:last-child").classList.add("hidden");
    }

    const cancelLogout = () => {
      modal.classList.remove("grid");
      modal.classList.add("hidden");

      settingsInfo.classList.remove("!hidden");

      removeActiveTab();
      setActiveTab(phoneTab);

      mainContainer.classList.remove("!bg-[#F2F2F2]");
      $("#my-container").removeClass("hidden");
      $("#my-container").addClass("active-container");
      $("#my-container").addClass("flex");

      logoutPopupTrigger.classList.remove(...activeSubMenuClasses);
      mainWrapper.classList.add("grid");
      mainWrapper.classList.remove("hidden");
    };

    settingsTab.onclick = function () {
      removeActiveTab();
      setActiveTab(this.children[0]);
      versionInfoBtn.classList.add(...activeSubMenuClasses);
      callHistoryContainer.classList.add("hidden");
      callHistoryContainer.classList.remove("flex");
      mainContainer.classList.add("!bg-[#F2F2F2]");
      settingsInfo.classList.remove("hidden");
      settingsInfo.classList.add("flex", "active-container");
      mainWrapper.classList.remove("overflow-hidden");
    };

    contactsTab.onclick = function () {
      let contactsLoader = document.getElementById("contacts-list-loader");
      const loaderElement = document.createElement("div");
      loaderElement.id = "contacts-loader";
      loaderElement.innerHTML = svgLoader;

      if (!document.getElementById("contacts-loader")) {
        contactsLoader.insertAdjacentElement("afterbegin", loaderElement);
      }

      if (this.dataset.shouldFetch !== "false") {
        if (sessionStorage.getItem("contacts")) {
          const data = JSON.parse(sessionStorage.getItem("contacts"));
          drawContacts(data);
          this.dataset.shouldFetch = "false";
          return;
        }
        getContacts();
        this.dataset.shouldFetch = "false";
      }
      removeActiveTab();
      setActiveTab(this);
      mainWrapper.classList.add("overflow-hidden");
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      contactsContainer.classList.remove("hidden");
      contactsContainer.classList.add("flex", "active-container");
    };

    phoneTab.onclick = function () {
      removeActiveTab();
      setActiveTab(this);
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      $("#my-container").removeClass("hidden");
      $("#my-container").addClass("active-container");
      $("#my-container").addClass("flex");
      mainContainer.classList.remove("!bg-[#F2F2F2]");
      mainWrapper.classList.remove("overflow-hidden");
    };

    callHistoryTab.onclick = function () {
      if (this.dataset.shouldFetch !== "false") {
        getCallHistory();
        this.dataset.shouldFetch = "false";
      }

      removeActiveTab();
      setActiveTab(this);
      mainWrapper.classList.add("overflow-hidden");
      callHistoryContainer.classList.remove("hidden");
      callHistoryContainer.classList.add("flex", "active-container");

      versionInfoBtn.classList.remove(...activeSubMenuClasses);
    };

    voiceMailTab.onclick = function () {
      let voiceMailLoader = document.getElementById("voicemail-list-loader");
      const loaderElement = document.createElement("div");
      loaderElement.id = "voicemail-loader";
      loaderElement.innerHTML = svgLoader;

      if (!document.getElementById("voicemail-loader")) {
        voiceMailLoader.insertAdjacentElement("afterbegin", loaderElement);
      }

      if (this.dataset.shouldFetch !== "false") {
        getVoicemails();
        this.dataset.shouldFetch = "false";
      }
      removeActiveTab();
      setActiveTab(this);
      mainWrapper.classList.add("overflow-hidden");
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      voiceMailContainer.classList.remove("hidden");
      voiceMailContainer.classList.add("flex", "active-container");
    };

    logoutPopupTrigger.onclick = (e) => {
      removeActiveTab();
      setActiveTab(settingsTab.children[0]);
      e.stopPropagation();
      modal.classList.remove("hidden");
      modal.classList.add("grid", "active-container");
      settingsInfo.classList.add("!hidden");
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      logoutPopupTrigger.classList.add(...activeSubMenuClasses);
      mainWrapper.classList.remove("grid");
      mainWrapper.classList.add("hidden");
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
