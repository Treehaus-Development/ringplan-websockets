let prevActiveNumber;
const statuses = Object.freeze({
  available: "Available",
  away: "Away",
  do_not_disturb: "Do not disturb",
});

function formatHistoryDate(date, isVoicemail) {
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
}

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

function generateAvatar(text) {
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
}

let beforeHistory = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDay() - 15
).toISOString();

const additionalStatuses = Object.freeze({
  in_a_meeting: "In a meeting",
  on_a_call: "On a call",
  lunch: "Lunch",
  holiday: "Holiday",
  afk: "AFK",
});

const userApi = getLoginUrl();
const backendApi = getBackendUrl();
let prevName;
let uuid = localStorage.getItem("uuid");
const cookiesObj = Object.fromEntries(
  document.cookie
    .split("; ")
    .map((v) => v.split(/=(.*)/s).map(decodeURIComponent))
);
const id_token =
  cookiesObj.id_token ||
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImVHeXkwR1Z0YXZHeFVnX3FMbUdqXzgyODNDWEoyWTdnLW1CdVFSZlNjV0EifQ.eyJleHAiOjE2NzQyNTAyNzksIm5iZiI6MTY3NDIyMTQ3OSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9yaW5ncGxhbi5iMmNsb2dpbi5jb20vZGQ4Mzk3ODktMWMxMS00OGFmLWE0MTMtZWU1YThkYzNiOTE5L3YyLjAvIiwic3ViIjoiZjZkNzE1ZGMtZDRlZi00MzU0LTkxN2EtMzI4NjA5MmEzMWY0IiwiYXVkIjoiNzM2YzM3ZDMtY2ExYy00NjViLThiMzYtNWVkZDA0ZDEyOWYzIiwiaWF0IjoxNjc0MjIxNDc5LCJhdXRoX3RpbWUiOjE2NzQyMjE0NzgsImdpdmVuX25hbWUiOiJIZWxsbyIsImZhbWlseV9uYW1lIjoiU3RhcnR4bGFicyIsImV4dGVuc2lvbl9jb21wYW55IjoiU3RhcnR4bGFicyIsImVtYWlscyI6WyJoZWxsb0BzdGFydHhsYWJzLmNvbSJdLCJ0aWQiOiJkZDgzOTc4OS0xYzExLTQ4YWYtYTQxMy1lZTVhOGRjM2I5MTkiLCJhdF9oYXNoIjoicDhFd1lBc1ppUUJnX0s5U05zYjhEdyJ9.E8rr5X0TLCwsVJfCDk8WHjEvQrtIEjC_L7Eui3WXzr-tqgPBB0KWDTfo4Bhgi1dkBmNZALLOz-yS9kSNYfGOgP3Nlq4BMXnlOM39mz6r-YrMxDDJLgKSc3AxxSBS84Qs843fQMiFF1ZsNgJ7-dOOz5cHnjLn0vSIXirTUuL44j2_Tw5XBABtgF3PdJRUwr1IewxdgSpsgewP3vnuEm_saXom02juUfMUk9Ny24N_AAWE8psTu1C2tQOECFZ8zWlUsKmGe3knvswTwpodT1hAjH5p9irDF7LAmI9accwylT3YT-LCwdQq6teEFwwKD2ZguTu2r7OdG2qyNAoblMExTQ";
let activeExtension = localStorage.getItem("activeExtension");

const reDrawList = (data, editFn, isLoggedIn) => {
  let extensionsWrapper = document.getElementById("extension-list");
  const saveBtn = document.getElementById("save");

  if (isLoggedIn) {
    extensionsWrapper.classList.add("pr-2");
  }
  let html = data
    .map((item) => {
      return `
              <div 
              class="flex 
              justify-between 
              ${
                isLoggedIn
                  ? "p-3 rounded-2.5 border cursor-pointer border-[#C7C7C7]"
                  : ""
              } 
              items-center">
                <div class="flex gap-2 items-center">
                  <input
                    class="peer input-ext"
                    type="radio"
                    id=${item._id}
                    value=${item.data.extension}
                    name="extension"
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
                <div
                  id="edit-ext-${item._id}" 
                  data-caller-id="${item.outbound_callerid?.number}"
                  data-name="${item.data.name}"
                  data-location_id="${item.location?.id}"
                  class="cursor-pointer select-none"
                >
                  <img src="/images/edit.svg"/>
                </div>
              </div>     
          `;
    })
    .join(" ");

  extensionsWrapper.innerHTML = html;

  const inputs = [].slice.call(extensionsWrapper.querySelectorAll("input"));
  if (isLoggedIn) {
    const vals = JSON.parse(activeExtension);
    const activeInput = inputs.find((input) => input.id === vals._id);
    activeInput.checked = true;
    saveBtn.disabled = true;
  } else {
    inputs[0].checked = true;
  }

  inputs.forEach((input) => {
    let parentTop = input.parentNode.parentNode;
    if (isLoggedIn) {
      const vals = JSON.parse(activeExtension);
      parentTop.addEventListener("click", (e) => {
        if (e.target.localName === "input" || e.target.localName === "label")
          return;
        e.target.querySelector("input").checked = true;
        saveBtn.disabled = e.target.querySelector("input").id === vals._id;
      });
      input.addEventListener("change", function (e) {
        saveBtn.disabled = this.id === vals._id;
      });
    }
    let editBtn = parentTop.querySelector(`#edit-ext-${input.id}`);
    editBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      prevActiveNumber = this.dataset.callerId;
      editFn(
        input.id,
        this.dataset.callerId,
        this.dataset.name,
        this.dataset.location_id
      );
    });
  });
};

const buildStatusHtml = (data) => {
  return Object.entries(data)
    .map(([key, value], idx) => {
      return `
      <div data-id="${key}" data-value="${value}" class="px-6 status-list-item 
       py-4 flex justify-between ${idx > 0 ? "border-t border-[#C7C7C7]" : ""}">
        <div class="flex gap-4">
          <div class="w-6 h-6">
            <img class="object-none w-full h-full" src="/images/status-icons/${key}.svg"/>
          </div>
          <span class="font-medium text-[#3C3C3C]">${value}</span>
        </div>               
      </div>
    `;
    })
    .join(" ");
};

const patchStatus = async (data) => {
  return fetch(`${backendApi}/status/v2/current-user`, {
    method: "PATCH",
    headers: {
      Authorization: id_token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

const handleStatusChange = async (value, type, target) => {
  let sendData = {};

  sendData = {
    [type]: {
      status: value,
    },
  };
  if (type.includes("additional")) {
    sendData[type] = {
      ...sendData[type],
      action: "set",
      action_type: "manual",
    };
  }
  target.classList.add("hidden");

  const data = await patchStatus(sendData);
  if (data.ok) {
    const finalData = await data.json();
    const { main_status, additional_status } = finalData;
    return {
      main_status: main_status.status,
      additional_status: additional_status.status,
    };
  } else {
    console.log("error", data);
  }
};

const insertAdditionalStatus = (item) => {
  item.dataset.checked = true;
  item.classList.add("items-center", "bg-zinc-100");
  item.insertAdjacentHTML(
    "beforeend",
    `  
       <button
          type="button"
          class=" text-gray-600 h-5 bg-transparent hover:bg-gray-200
           hover:text-gray-900 rounded-lg text-sm inline-flex items-center"
          id="delete-status"
        >
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
  `
  );
};

const drawStatusList = (mainStatus, additionalStatus) => {
  let mainStatuses = document.getElementById("main-statuses");
  let additionalWrapper = document.getElementById("additional-statuses");
  let statusList = document.getElementById("status-list");

  let mainHtml = buildStatusHtml(statuses);
  let additionalHtml = buildStatusHtml(additionalStatuses);

  mainStatuses.innerHTML = mainHtml;
  additionalWrapper.innerHTML = additionalHtml;

  statusList.querySelectorAll(".status-list-item").forEach((item) => {
    if (item.dataset.id === mainStatus) {
      item.classList.add("opacity-50", "!cursor-not-allowed");
      item.dataset.disabled = true;
    } else {
      item.classList.remove("opacity-50", "!cursor-not-allowed");
      item.dataset.disabled = false;
    }
    if (item.dataset.id === additionalStatus) {
      insertAdditionalStatus(item);
    }
    let type = item.parentElement.id.includes("main")
      ? "main_status"
      : "additional_status";

    item.addEventListener("click", (e) => {
      let target = e.target.closest(".status-list-item");
      let value = target.dataset.checked === "true" ? null : target.dataset.id;
      e.stopPropagation();
      if (target.dataset.disabled === "true") return;
      handleStatusChange(value, type, statusList).then((res) => {
        document
          .getElementById("status-bar")
          .querySelector(
            "img"
          ).src = `/images/status-icons/${res.main_status}.svg`;

        document.querySelector(
          "#status-badge"
        ).src = `/images/status-icons/${res.main_status}.svg`;

        if (!!res.additional_status) {
          document
            .querySelector("#additional-badge")
            .classList.remove("hidden");
          document.querySelector(
            "#additional-badge"
          ).src = `/images/status-icons/${res.additional_status}.svg`;
          if (item.dataset.id === res.additional_status) {
            statusList
              .querySelectorAll("#additional-statuses .status-list-item")
              .forEach((el) => {
                if (el.dataset.checked === "true") {
                  el.dataset.checked = false;
                  el.querySelector("#delete-status").remove();
                  el.classList.remove("items-center", "bg-zinc-100");
                }
              });
            insertAdditionalStatus(item);
          }
          document.querySelector("#additional-icon").classList.remove("hidden");
          let additionalImg = document.querySelector("#additional-icon img");
          if (additionalImg) {
            additionalImg.src = `/images/status-icons/${res.additional_status}.svg`;
          } else {
            let newImg = document.createElement("img");
            newImg.src = `/images/status-icons/${res.additional_status}.svg`;
            newImg.id = "additional-img";
            document.querySelector("#additional-icon").appendChild(newImg);
          }
        } else {
          document.querySelector("#additional-badge").classList.add("hidden");
          document.querySelector("#additional-icon").classList.add("hidden");
          if (item.dataset.checked === "true") {
            item.querySelector("#delete-status").remove();
            item.classList.remove("items-center", "bg-zinc-100");
            item.dataset.checked = false;
          }
        }
        document.getElementById("status-bar").querySelector("span").innerText =
          statuses[res.main_status];
        statusList.querySelectorAll(".status-list-item").forEach((listItem) => {
          if (listItem.dataset.id === res.main_status) {
            listItem.classList.add("opacity-50", "!cursor-not-allowed");
            listItem.dataset.disabled = true;
          } else {
            listItem.classList.remove("opacity-50", "!cursor-not-allowed");
            listItem.dataset.disabled = false;
          }
        });
      });
    });
  });
};

const getUserStatus = async (id) => {
  const getStatusInfo = await fetch(
    `${backendApi}/statuses/v2/users?user_id=${id}`,
    {
      headers: {
        Authorization: id_token,
      },
    }
  );
  if (getStatusInfo.ok) {
    const data = await getStatusInfo.json();
    return {
      mainStatus: data[0].main_status.status,
      additionalStatus: data[0].additional_status.status,
    };
  }
};

const getAccount = async () => {
  const accountInfo = await fetch(`${backendApi}/system/account`, {
    headers: {
      Authorization: id_token,
    },
  });
  if (accountInfo.ok) {
    const data = await accountInfo.json();
    return data;
  } else {
    console.log("error retrieving account", accountInfo);
  }
};

const triggerModalUpdates = (target, listValues, isLoggedIn, isCallerId) => {
  let editModal = document.getElementById("edit-modal");
  let closeEdit = document.getElementById("close-edit");
  let nameInput = document.getElementById("name-edit");
  let numberBtn = document.getElementById("active-number");
  let numberList = document.getElementById("number-list");

  numberBtn.onclick = () => {
    numberList.classList.toggle("hidden");
  };

  let saveEdit = document.getElementById("save-edit");
  let callerInfo = document.getElementById("caller-info");
  let message = document.getElementById("message");
  let spinner = document.getElementById("loading-spinner");
  let statusContainer = document.getElementById("status-container");
  let statusList = document.getElementById("status-list");

  let statusBar = document.getElementById("status-bar");

  if (!isCallerId) {
    if (isLoggedIn) {
      getAccount()
        .then((res) => {
          return res.id;
        })
        .then((id) => {
          getUserStatus(id)
            .then((data) => {
              let mainStatus = data.mainStatus;
              let additionalStatus = data.additionalStatus;
              let img = document.createElement("img");
              img.id = "main-icon";
              img.src = `/images/status-icons/${mainStatus}.svg`;
              let additionalImg = document.createElement("img");
              additionalImg.src = `/images/status-icons/${additionalStatus}.svg`;
              additionalImg.id = "additional-img";
              if (!statusBar.querySelector("#main-icon")) {
                statusBar.insertAdjacentElement("afterbegin", img);
              }
              statusBar.querySelector("span").innerText = statuses[mainStatus];
              if (!!additionalStatus) {
                statusBar
                  .querySelector("#additional-icon")
                  .classList.remove("hidden");
                if (!statusBar.querySelector("#additional-img")) {
                  statusBar
                    .querySelector("#additional-icon")
                    .appendChild(additionalImg);
                }
              }
              drawStatusList(mainStatus, additionalStatus);

              statusContainer.onclick = () => {
                statusList.classList.toggle("hidden");
                statusList.classList.toggle("flex");
              };
            })
            .catch((err) => {
              console.log(err);
            });
        });
    }

    target.classList.remove("hidden");
    target.classList.add("grid");
  }

  const setSelectHtml = (activeNumber) => {
    const html = availableNumbers
      .map((item) => {
        if (
          !isNaN(Number(item.number)) &&
          Number(item.number) !== Number(activeNumber)
        ) {
          return `
        <div id=${
          item.number
        } class="ease-in number-item select-none duration-250 p-3
         transition-colors hover:bg-gray-100" >${Number(item.number)}</div>
      `;
        }
      })
      .join(" ");

    numberList.innerHTML = html;

    numberList.querySelectorAll(".number-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        handleSelectNumber(item.id);
      });
    });
  };

  const getAvailableNumbers = async () => {
    try {
      const numbers = await fetch(
        `${backendApi}/instances/${uuid}/dids/callerids`,
        {
          headers: {
            Authorization: id_token,
          },
        }
      );

      if (numbers.ok) {
        let data = await numbers.json();
        availableNumbers = [...data];
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectNumber = (number) => {
    numberBtn.children[0].innerText = number;
    setSelectHtml(number);

    saveEdit.disabled =
      Number(number) === Number(prevActiveNumber) &&
      nameInput.value === prevName;
  };

  const handleInputChange = (newName, prevName) => {
    saveEdit.disabled =
      (newName === prevName || newName.length === 0) &&
      Number(prevActiveNumber) === Number(numberBtn.children[0].innerText);
  };

  async function editExtension(id, activeNumber, name, locationId) {
    if (!isCallerId) {
      target.classList.remove("grid");
      target.classList.add("hidden");
    }
    editModal.classList.remove("hidden");
    editModal.classList.add("grid");
    let activeExt = localStorage.getItem('activeExtension')
    let exts = JSON.parse(activeExt);
    if(isCallerId){
      activeNumber = exts.outbound_callerid.number
      name = exts.data.name
    }
    await getAvailableNumbers();
    nameInput.placeholder = name;
    nameInput.value = name;
    prevName = name;
    numberBtn.children[0].innerText = activeNumber;
    callerInfo.innerHTML = `Caller ID: “${name}” <br/> &lt;${activeNumber}&gt;`;
    saveEdit.dataset.id = id;
    saveEdit.dataset.location_id = locationId;
    setSelectHtml(activeNumber);
    nameInput.oninput = (e) => {
      handleInputChange(e.target.value, name);
    };
  }

  if (!isCallerId) {
    reDrawList(listValues, editExtension, isLoggedIn);
  }

  closeEdit.onclick = () => {
    closeEditModal();
  };

  saveEdit.onclick = async function () {
    const extId = this.dataset.id;
    const name = nameInput.value;
    const callerId = numberBtn.children[0].innerText;
    const locationId = this.dataset.location_id;
    spinner.classList.remove("hidden");
    spinner.classList.add("inline");
    saveEdit.querySelector("span").innerText = "Loading...";
    saveEdit.disabled = true;
    const postData = await fetch(
      `${backendApi}/instances/${uuid}/bulks/extensions/${extId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          data: {
            name,
          },
          location_id: locationId,
          outbound_callerid: {
            number: callerId,
          },
        }),
        headers: {
          Authorization: id_token,
          "Content-Type": "application/json",
        },
      }
    );
    if (postData.ok) {
      const res = await postData.json();
      if (!isCallerId) {
        listValues = [
          ...listValues.map((ext) => {
            if (ext._id === res._id) {
              return {
                ...ext,
                ...res,
              };
            }
            return ext;
          }),
        ];
      }
      if (isCallerId) {
        localStorage.setItem("activeExtension", JSON.stringify(res));
      }
      let callerIdWrapper = document.getElementById("caller-id");
      callerIdWrapper.innerHTML = `Caller ID: “${name}” &lt;${callerId}&gt;`;

      closeEditModal(false, true);
    } else {
      closeEditModal(true, true);
    }
    saveEdit.disabled = false;
    spinner.classList.add("hidden");
    spinner.classList.remove("inline");
    saveEdit.querySelector("span").innerText = "Save";
  };

  const closeEditModal = (isError, fromApi) => {
    if (!isCallerId) {
      target.classList.add("grid");
      target.classList.remove("hidden");
    }

    editModal.classList.add("hidden");
    editModal.classList.remove("grid");
    if (fromApi) {
      if (!isCallerId) {
        reDrawList(listValues, editExtension, isLoggedIn);
      }
      message.classList.remove("hidden");
      message.classList.add("animate-fade-up");
      if (isError) {
        message.innerText = "Something went wrong.Try again";
        message.classList.add("text-red-400");
      } else {
        message.innerText = "Successfully changed extension data";
        message.classList.add("text-green-500");
      }

      setTimeout(() => {
        message.classList.add("animate-fade-out");
        message.onanimationend = () => {
          message.innerText = "";
        };
      }, 5000);
    }
  };

  if (isCallerId) {
    return editExtension;
  }

  const saveBtn = document.getElementById("save");

  saveBtn.onclick = () => {
    setCookie("token", id_token, 1);

    let newInputList = [].slice.call(
      document.getElementById("extension-list").querySelectorAll("input")
    );

    const checkedInput = newInputList.find((input) => input.checked);
    const id = checkedInput.id;
    const activeExtension = listValues.find((item) => item._id === id);
    localStorage.setItem("fromSSO", true);
    localStorage.setItem("extensions", JSON.stringify(listValues));
    localStorage.setItem("activeExtension", JSON.stringify(activeExtension));
    window.location = `/webphone.html?user=${activeExtension.data.extension}&pass=${activeExtension.data.secret}&domain=${activeExtension["qr-config"].server}&outbound_server=${activeExtension["qr-config"].outbound_server}&progress=true`;
  };
};
