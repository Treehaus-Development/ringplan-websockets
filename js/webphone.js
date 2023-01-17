let classesStr = `items-center text-[#0D0D54] font-bold bg-[#F7F7FB] border-r-4 border-[#3B9EF7] active-tab`;
let activeClasses = classesStr.split(" ");
let subMenuClassesStr = `bg-[#F7F7FB] text-[#0D0D54] active-submenu`;
let activeSubMenuClasses = subMenuClassesStr.split(" ");
let isFilterMode = false;
let currentFilter;
let filteredItem;

function dateFormat(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return month + "/" + day + "/" + year;
}

function copyToClipboard(text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}

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
let checkedIds = [];
let isBulkEdit = false;

let beforeHistory = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDay() - 15
).toISOString();

function makeCall(num) {
  let myContainer = document.getElementById("my-container");
  removeActiveTab();
  setActiveTab(document.getElementById("phone-tab"));
  myContainer.classList.remove("hidden");
  myContainer.classList.add("flex", "active-container");

  document.querySelector(".webphone-digits").innerText = num;
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

const formatHistoryDate = (date, isVoicemail) => {
  let origDate = new Date(date).toLocaleString("en-us", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  });
  if (isVoicemail) {
    origDate = new Date(date)
      .toLocaleString("en-us", {
        weekday: "short",
        month: "2-digit",
        year: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
      })
      .replace(/\//g, "-")
      .replace(/,/, "");
  }
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

function shareEmail(email, link) {
  let mailLink =
    "mailto:" +
    encodeURIComponent(email) +
    "?subject=" +
    encodeURIComponent("Voicemail") +
    "&body=" +
    encodeURIComponent(link);
  window.location.href = mailLink;
}

const deleteVoicemail = async (id) => {
  try {
    let values = fetch(`${backendApi}/voicemail/messages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: id_token,
      },
    });
    return values;
  } catch (err) {
    return err;
  }
};

const setVoicemailListened = async (id) => {
  try {
    let values = fetch(`${backendApi}/voicemail/messages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: id_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listened: true }),
    });
    return values;
  } catch (err) {
    return err;
  }
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

const toggleVoicemailOpts = (e) => {
  let voiceMailSubmenu = document.getElementById("voicemail-submenu");
  let actionGroup = document.getElementById("action-group");
  if (
    e.target.parentNode.id === "voicemail-options" ||
    e.target.id === "voicemail-options"
  ) {
    voiceMailSubmenu.classList.toggle("hidden");
    voiceMailSubmenu.classList.toggle("flex");
  } else {
    voiceMailSubmenu.classList.remove("flex");
    voiceMailSubmenu.classList.add("hidden");
  }

  if (
    e.target.parentNode.id === "action-trigger" ||
    e.target.id === "action-trigger"
  ) {
    actionGroup.classList.toggle("hidden");
  } else {
    actionGroup.classList.add("hidden");
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

const showErrorToast = (err) => {
  let errorToast = document.getElementById("toast-error");
  errorToast.classList.remove("animate-fade-out");
  errorToast.classList.add("animate-fade-up");
  errorToast.querySelector("span").innerText =
    err?.message || "Something went wrong, please try again";
  setTimeout(() => {
    errorToast.classList.add("animate-fade-out");
  }, 3000);
  setTimeout(() => {
    errorToast.querySelector("span").innerText = "";
  }, 4500);
};

const showSuccessToast = (isBulk) => {
  let successToast = document.getElementById("toast-success");
  successToast.classList.remove("animate-fade-out");
  successToast.classList.add("animate-fade-up");
  successToast.querySelector("span").innerText = `Voicemail${
    isBulk ? "s" : ""
  } deleted successfully`;
  setTimeout(() => {
    successToast.classList.add("animate-fade-out");
  }, 3000);
  setTimeout(() => {
    successToast.querySelector("span").innerText = "";
  }, 4500);
};

const bulkUpdateVoicemailsRead = async (bool) => {
  try {
    let values = await fetch(`${backendApi}/voicemail/messages/bulk-update`, {
      method: "PATCH",
      headers: {
        Authorization: id_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listened: bool, message_ids: checkedIds }),
    });

    const item = await values.json();
    return item;
  } catch (err) {
    return err;
  }
};

const bulkDeleteVoicemails = async () => {
  try {
    let values = fetch(`${backendApi}/voicemail/messages/bulk-delete`, {
      method: "PATCH",
      headers: {
        Authorization: id_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message_ids: checkedIds }),
    });
    return values;
  } catch (err) {
    return err;
  }
};

const handleBulkActions = async (action, listItems) => {
  if (action !== "delete") {
    bulkUpdateVoicemailsRead(action === "read")
      .then((res) => {
        console.log(res, "res");
        document.body.click();

        const newData = listItems.map((item) => {
          const newItem = res.find((el) => el.message_id === item._id);
          return newItem
            ? {
                ...item,
                listened: action === "read",
              }
            : item;
        });
        drawVoicemails(newData);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  } else {
    bulkDeleteVoicemails()
      .then((res) => {
        const newData = listItems.filter(
          (item) => !checkedIds.includes(item._id)
        );
        showSuccessToast(true);
        drawVoicemails(newData);
      })
      .catch((err) => {
        console.log(err, "err");
        showErrorToast(err);
      });
  }
};

const openVoicemailDetails = async (data, id, isListened, target) => {
  if (isListened === "false") {
    target.classList.add("pointer-events-none");
    setVoicemailListened(id)
      .then((res) => {
        if (res.ok) {
          const newData = [...data].map((item) => {
            if (item._id === id) {
              return {
                ...item,
                listened: true,
              };
            }
            return item;
          });
          drawVoicemails(newData);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        target.classList.remove("pointer-events-none");
      });
  }
  let voiceMailDetails = document.getElementById("voicemail-details");
  let voiceMailSubmenu = document.getElementById("voicemail-submenu");
  let deleteVoicemailBtn = document.getElementById("delete-voicemail-btn");
  let shareVoiceMailBtn = document.getElementById("share-voicemail-btn");
  let callVoiceMailBtn = document.getElementById("call-voicemail-btn");
  let audioDest = document.getElementById("audio-dest");
  const activeItem = data.find((item) => item._id === id);
  voiceMailDetails.classList.remove("hidden");
  voiceMailDetails.classList.add("flex");
  voiceMailDetails.querySelector("#voicemail-number").innerText =
    activeItem.extension_source;
  voiceMailDetails.querySelector("#voicemail-message span").innerText =
    activeItem.source_representation_name;
  audioDest.innerHTML = "";
  let audio = document.createElement("audio");
  audio.className = "fc-media";
  audio.id = activeItem.voicemail_file.id;
  audio.controls = true;
  audio.name = activeItem.voicemail_file.name;
  audio.preload = "auto";
  const source = document.createElement("source");
  source.src = activeItem.voicemail_file.link;
  audio.appendChild(source);
  audioDest.insertAdjacentElement("afterbegin", audio);
  audioPlayer.init();

  voiceMailSubmenu
    .querySelectorAll(".voicemail-submenu-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        handleVoiceMailActions(item.id, activeItem);
      });
    });

  deleteVoicemailBtn.onclick = () => {
    deleteVoicemail(id)
      .then((res) => {
        if (res.ok) {
          showSuccessToast();
          const newData = [...data].filter((item) => item._id !== id);
          drawVoicemails(newData);
          voiceMailDetails.classList.remove("flex");
          voiceMailDetails.classList.add("hidden");
        } else {
          showErrorToast();
        }
      })
      .catch((err) => {
        console.log(err, "err");
        showErrorToast(err);
      });
  };
  callVoiceMailBtn.onclick = () => {
    voiceMailDetails.classList.remove("flex");
    voiceMailDetails.classList.add("hidden");
    makeCall(activeItem.extension_source);
  };
  shareVoiceMailBtn.onclick = () => {
    shareEmail(activeItem.voicemail_email, activeItem.voicemail_file.link);
  };
};

function handleVoiceMailActions(id, activeItem) {
  let successToast = document.getElementById("toast-success");
  if (id.includes("link")) {
    copyToClipboard(activeItem.voicemail_file.link);
    successToast.classList.remove("animate-fade-out");
    successToast.classList.add("animate-fade-up");
    successToast.querySelector("span").innerText = "Link copied successfully";
  } else if (id.includes("text")) {
    copyToClipboard(activeItem.source_representation_name);
    successToast.classList.remove("animate-fade-out");
    successToast.classList.add("animate-fade-up");
    successToast.querySelector("span").innerText = "Text copied successfully";
  } else {
    shareEmail(activeItem.voicemail_email, activeItem.voicemail_file.link);
    successToast.click();
    return;
  }

  successToast.click();
  setTimeout(() => {
    successToast.classList.add("animate-fade-out");
  }, 3000);
  setTimeout(() => {
    successToast.querySelector("span").innerText = "";
  }, 4500);
}

const drawVoicemails = (values) => {
  let voiceMailLoader = document.getElementById("voicemail-list-loader");
  let voiceMailList = document.getElementById("voicemail-list");
  let bulkSelect = document.getElementById("select_all");
  let actionMenu = document.getElementById("action-menu");
  let actionGroup = document.getElementById("action-group");
  let filterTrigger = document.getElementById("filter-trigger");
  let filterModal = document.getElementById("filters-modal");
  let closeFilter = document.getElementById("close-filter");
  let filterExtList = document.getElementById("filter-ext-list");
  let filterExtTrigger = document.getElementById("filter-ext-trigger");
  let applyFilters = document.getElementById("apply-filters");
  let simpleFilters = document.getElementById("simple-filters");
  let clearFilters = document.getElementById("clear-filters");
  let fromDate = document.getElementById("start_date");
  let toDate = document.getElementById("end_date");
  voiceMailLoader.classList.add("hidden");
  voiceMailLoader.classList.remove("grid");

  document.addEventListener("click", toggleVoicemailOpts);

  let html = values
    .map((item) => {
      let formatedDate = formatHistoryDate(item.time_received, true);

      return `
      <div 
        data-id="${item._id}" 
        data-listened="${item.listened}"
        class="flex voicemail-list-item cursor-pointer relative justify-between select-none px-6 py-2 
        items-center border-b border-[#D3D3D3]">
          <div class="absolute top-2 right-2 hidden">
            <input type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100
            border-gray-300 rounded focus:ring-blue-500
            focus:ring-2" />
          </div>
          <div class="flex gap-4 items-start w-full">
            <div class="w-14 h-14">
              <img class="rounded-full" src="/images/profile.svg"/>
            </div>
            <div class="flex flex-col w-full gap-2">
              <div class="flex justify-between w-full">
                <p class="text-[#232323]">${item.extension_source}</p>
                <div class="w-3.5 h-3.5 rounded-full bg-[#6FC316] ${
                  !item.listened ? "block" : "hidden"
                }"></div>
              </div>
              <div class="flex justify-between w-full">
                <p class="text-[#4D4D4D]">${item.source_representation_name}</p>
                <span class="text-sm text-[#939393]">${formatedDate}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join(" ");

  if (values.length === 0) {
    document.getElementById("empty-voicemail").classList.remove("hidden");
    document.getElementById("empty-voicemail").innerText = isFilterMode
      ? "You have no voicemails for selected filter"
      : "No data found for your extension";
  } else {
    document.getElementById("empty-voicemail").classList.add("hidden");
  }

  voiceMailList.classList.remove("hidden");
  voiceMailList.classList.add("flex");
  if (values.length > 0) {
    document.getElementById("settings-filters").classList.remove("hidden");
    document.getElementById("settings-filters").classList.add("flex");
  }

  voiceMailList.innerHTML = html;

  voiceMailList.querySelectorAll(".voicemail-list-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      if (isBulkEdit) {
        if (checkedIds.includes(this.dataset.id)) {
          checkedIds = checkedIds.filter((item) => item !== this.dataset.id);
          item.querySelector("input").checked = false;
        } else {
          item.querySelector("input").checked = true;
          checkedIds.push(this.dataset.id);
        }
        if (checkedIds.length > 0) {
          actionMenu.classList.remove("hidden");
        } else {
          actionMenu.classList.add("hidden");
        }
      } else {
        openVoicemailDetails(
          values,
          this.dataset.id,
          this.dataset.listened,
          item
        );
      }
    });
  });

  simpleFilters.querySelectorAll("div").forEach((item) => {
    item.addEventListener("click", (e) => {
      let finalFrom = dateFormat(new Date());
      let finalTo = dateFormat(new Date());
      if (item.dataset.filter === "7" || item.dataset.filter === "30") {
        finalFrom = dateFormat(
          new Date(
            Date.now() - Number(item.dataset.filter) * 24 * 60 * 60 * 1000
          )
        );
      }
      fromDate.value = finalFrom;
      toDate.value = finalTo;
    });
  });

  actionGroup.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      handleBulkActions(item.dataset.action, values).then((res) => {
        isBulkEdit = false;
        actionMenu.classList.add("hidden");
        bulkSelect.checked = false;
      });
    });
  });

  bulkSelect.onchange = (e) => {
    isBulkEdit = e.target.checked;
    voiceMailList.querySelectorAll(".voicemail-list-item").forEach((item) => {
      if (e.target.checked) {
        item.querySelector("input").parentNode.classList.remove("hidden");
      } else {
        item.querySelector("input").parentNode.classList.add("hidden");
      }
    });
  };

  let datePicker = document.querySelector(".datepicker-dropdown");
  filterTrigger.onclick = () => {
    filterModal.classList.remove("hidden");
    filterModal.classList.add("flex");
    datePicker.classList.add("shadow");
    document
      .querySelector(".datepicker-main")
      .classList.add("overflow-y-auto", "max-h-62.5");
    filterExtTrigger.querySelector("span").innerText = isFilterMode
      ? filteredItem
      : getCookie("user_id");
  };

  filterModal.onclick = () => {
    filterExtList.classList.add("hidden");
    filterExtList.classList.remove("flex");
  };

  let extensions = JSON.parse(localStorage.getItem("extensions"));

  let extList = extensions
    .map((item) => {
      return `
      <div data-ext=${item.data.id}  
      class="flex filter-ext-item p-4 justify-between cursor-pointer border-b border-gray-500">
      <input
                    class="peer input-ext"
                    type="radio"
                    id=${item._id}
                    value=${item.data.extension}
                    name="extension_filter"
                  />
                  <label
                    for=${item._id}
                    class="text-sm label-item relative font-medium pl-10 duration-200 ease-in transition-colors
                    select-none text-[#3C3C3C] cursor-pointer peer-checked:text-[#3B9EF7]
                    "
                  >
                    ${item.data.extension}
                  </label>
      </div>
    `;
    })
    .join(" ");

  filterExtList.insertAdjacentHTML("beforeend", extList);
  filterExtList.querySelectorAll(".filter-ext-item").forEach((item) => {
    if (isFilterMode) {
      document.querySelector(`input[value="${filteredItem}"]`).checked = true;
    } else {
      if (item.dataset.ext === getCookie("user_id")) {
        item.querySelector("input").checked = true;
      }
    }
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      applyFilters.disabled =
        this.dataset.ext === getCookie("user_id") &&
        (!fromDate.value || !toDate.value);
      if (isFilterMode) {
        document.querySelector(
          `input[value="${filteredItem}"]`
        ).checked = false;
      }
      this.querySelector("input").checked =
        !this.querySelector("input").checked;
      filteredItem = !this.dataset.ext ? "All" : Number(this.dataset.ext);
      filterExtTrigger.querySelector("span").innerText = filteredItem;
    });
  });

  applyFilters.onclick = () => {
    let baseVoicemailUrl = `${backendApi}/voicemail/messages`;
    let searchParams = new URLSearchParams();
    isFilterMode = true;

    let from = fromDate.value;
    let to = toDate.value;

    if (from && to) {
      searchParams.append(
        "from_date",
        new Date(from).toISOString().split("T")[0]
      );
      searchParams.append("to_date", new Date(to).toISOString().split("T")[0]);
    }

    searchParams.append(
      "extension_destination",
      filteredItem || getCookie("user_id")
    );

    if (filteredItem === "All") {
      searchParams.delete("extension_destination");
    }

    let url = new URL(baseVoicemailUrl);
    url.search = searchParams.toString();
    applyFilters.disabled = true;

    applyFilters.innerText = "Loading...";

    applyFilters.insertAdjacentHTML(
      `afterbegin`,
      `
    <svg 
    id="apply-loading"
    class="inline w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    `
    );

    fetch(url, {
      headers: {
        Authorization: id_token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        filterModal.classList.add("hidden");
        filterModal.classList.remove("flex");
        drawVoicemails(data);
      })
      .finally(() => {
        applyFilters.querySelector("#apply-loading").remove();
        applyFilters.innerText = "Apply";
      });
  };

  clearFilters.onclick = () => {
    fromDate.value = "";
    toDate.value = "";
    filteredItem = null;
    document.querySelector(
      'input[name="extension_filter"]:checked'
    ).checked = false;
    filterExtList.querySelector(
      `input[value="${getCookie("user_id")}"]`
    ).checked = true;
    isFilterMode = false;
    filterExtTrigger.querySelector("span").innerText = getCookie("user_id");
    getVoicemails(true);
  };

  filterExtTrigger.onclick = (e) => {
    e.stopPropagation();
    filterExtList.classList.toggle("hidden");
    filterExtList.classList.toggle("flex");
  };

  closeFilter.onclick = () => {
    filterModal.classList.add("hidden");
    filterModal.classList.remove("flex");
  };
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

async function getVoicemails(isFromFilter) {
  let filterModal = document.getElementById("filters-modal");

  try {
    const history = await fetch(
      `${backendApi}/voicemail/messages?from_date=${
        beforeHistory.split("T")[0]
      }&to_date=${
        new Date().toISOString().split("T")[0]
      }&extension_destination=${getCookie("user_id")}
    `,
      {
        headers: {
          Authorization: id_token,
        },
      }
    );
    if (history.ok) {
      const data = await history.json();
      if (!isFromFilter) {
        localStorage.setItem("voicemails", JSON.stringify(data));
      }
      drawVoicemails(data);
    }
  } catch (error) {
    if (isLocalhost) {
      localStorage.setItem("voicemails", JSON.stringify(mockHistory));
      drawVoicemails(mockHistory);
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
    let voiceMailTab = document.getElementById("voicemail-tab");
    let voiceMailContainer = document.getElementById("voicemail-container");
    mainWrapper.appendChild(container);

    let versionInfoBtn = document.getElementById("version-info");
    let sidebar = document.getElementById("sidebar");
    let hamburgerBtn = document.getElementById("hamburger");

    extensionOpts.querySelector("span").innerText =
      sessionStorage.getItem("user") || getCookie("user_id");

    let statusBadge = document.querySelector("#status-badge");

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
          document.querySelector(".webphone-digits").innerText = pastedContent;
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
            statusBadge.src = `/images/status-icons/${mainStatus}.svg`;
          });
        });
    } else {
      callHistoryTab.remove();
      voiceMailTab.remove();
      extensionOpts.querySelector("div:last-child").classList.add("hidden");
    }

    const cancelLogout = () => {
      modal.classList.remove("grid");
      modal.classList.add("hidden");

      pageTitle.innerText = `Phone`;
      settingsInfo.classList.remove("!hidden");

      removeActiveTab();
      setActiveTab(phoneTab);

      mainContainer.classList.remove("!bg-[#F2F2F2]");
      mainWrapper.classList.remove("h-main", "grid", "place-items-center");
      $("#my-container").removeClass("hidden");
      $("#my-container").addClass("active-container");
      $("#my-container").addClass("flex");

      extensionOpts.classList.remove("hidden");

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
      pageTitle.innerText = "Settings - Version Info";
      extensionOpts.classList.add("hidden");

      mainContainer.classList.add("!bg-[#F2F2F2]");
      settingsInfo.classList.remove("hidden");
      settingsInfo.classList.add("flex", "active-container");
      mainWrapper.classList.add("h-main", "grid", "place-items-center");
    };

    phoneTab.onclick = function () {
      removeActiveTab();
      setActiveTab(this);
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      pageTitle.innerText = "Phone";
      extensionOpts.classList.remove("hidden");
      $("#my-container").removeClass("hidden");
      $("#my-container").addClass("active-container");
      $("#my-container").addClass("flex");
      mainContainer.classList.remove("!bg-[#F2F2F2]");
      mainWrapper.classList.remove("h-main", "grid", "place-items-center");
    };

    callHistoryTab.onclick = function () {
      if (this.dataset.shouldFetch !== "false") {
        getCallHistory();
        this.dataset.shouldFetch = "false";
      }

      removeActiveTab();
      setActiveTab(this);
      callHistoryContainer.classList.remove("hidden");
      callHistoryContainer.classList.add("flex", "active-container");

      pageTitle.innerText = "Phone";
      extensionOpts.classList.remove("hidden");
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
      pageTitle.innerText = "Voicemail";
      versionInfoBtn.classList.remove(...activeSubMenuClasses);
      extensionOpts.classList.add("hidden");
      voiceMailContainer.classList.remove("hidden");
      voiceMailContainer.classList.add("flex", "active-container");
    };

    logoutPopupTrigger.onclick = (e) => {
      removeActiveTab();
      setActiveTab(settingsTab.children[0]);
      e.stopPropagation();
      modal.classList.remove("hidden");
      modal.classList.add("grid", "active-container");
      pageTitle.innerText = "Settings - Logout";
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
