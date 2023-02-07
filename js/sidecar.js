let extensionsData = localStorage.getItem("extensions");
let actions = [
  "dial",
  "pause",
  "transfer",
  "merge",
  "hangup",
  "keypress",
  "hold",
  "send_message",
  "modify_status",
];

let numberOrContactHtml = `  
    <div class="flex flex-col gap-3">
      <div class="flex flex-col">
        <span class="text-sm text-[#686868]">Select contact</span>
        <input id="select-contact" />
      </div>
      <div class="flex gap-2 items-center">
        <input id="type-number" type="checkbox" />
        <label for="type-number" class="text-[#898989] text-sm select-none">
          Or type a number
        </label>
      </div>
      <input 
      id="dial-number"
      disabled 
      type="number"
      class="p-3 border select-none disabled:text-gray-500 border-gray-200 rounded-2.5 outline-none"/>
    </div>
  `;
let activeActions = [];

let addBtnClasses =
  `rounded-full p-4 cursor-pointer bg-blue-500 shadow-soft-md absolute bottom-12 right-12 w-14 h-14 flex justify-center items-center`.split(
    " "
  );

let sidecarBtnClasses =
  `w-40 h-36 bg-[#FDFDFD] rounded-xl sidecar-btn border border-[#A9A9A9] cursor-pointer flex flex-col items-center justify-between p-6 relative`.split(
    " "
  );

function removeOptionsSubmenu() {
  document.querySelectorAll(".sidecar-sub-menu").forEach((el) => {
    el.classList.remove("flex");
    el.classList.add("hidden");
  });
}

function updateAddEditSaveButton(isAdd) {
  let saveBtn = document.getElementById("save-sidecar-btn");
  let btnName = document.getElementById("button-name");
  if (isAdd) {
    saveBtn.disabled = activeActions.length === 0 || btnName.value.length === 0;
    return;
  }
}

function getContactOrInputValue() {
  let dialInput = document.getElementById("dial-number");
  let isManualNumber = document.querySelector("#type-number").checked;

  let finalValue = isManualNumber
    ? dialInput.value
    : document.getElementById("select-contact").value;

  return finalValue;
}

function addDialTransferActions() {
  let saveBtn = document.querySelector("#save-action-btn");

  if (cachedContacts) {
    let showData = JSON.parse(cachedContacts)
      .filter((el) => !!el.phone)
      .map((el) => {
        return {
          phone: el.phone,
        };
      });

    console.log(showData, "showdata");

    $("#select-contact").selectize({
      options: showData,
      maxItems: 1,
      allowEmptyOption: true,
      searchField: ["phone"],
      labelField: "phone",
      valueField: "phone",
      plugins: ["clear_button"],
      placeholder: "None",
      onChange: function () {
        saveBtn.disabled = $("#select-contact").val().length === 0;
      },
    });
  }

  let dialInput = document.getElementById("dial-number");

  document.querySelector("#type-number").onchange = function (e) {
    dialInput.disabled = !e.target.checked;
    saveBtn.disabled = dialInput.value.length === 0;
    if (e.target.checked) {
      $("#select-contact")[0].selectize.disable();
    } else {
      $("#select-contact")[0].selectize.enable();
    }
  };

  dialInput.oninput = function () {
    saveBtn.disabled = this.value.length === 0;
  };
}

function openTransferModal(modal) {
  let saveBtn = modal.querySelector("#save-action-btn");
  modal.classList.remove("hidden");
  modal.classList.add("grid");
  modal.querySelector("h2").innerText = "Transfer";

  let transferHtml = `
      <div class="flex flex-col gap-2">
        <div
          id="transfer-toggle-btn"
          class="w-full flex justify-between p-3 bg-white border-b
          border-[#BBBBBB] select-none cursor-pointer relative"
        >
          <span class="text-[#686868] text-lg transfer-call-val">Transfer Call</span>
          <img
            class="duration-200 ease-in transition-transform"
            src="../images/chevron-down.svg"
          />
        <div
          id="transfer-options"
          class="absolute w-full top-10
          left-0 hidden bg-white shadow-nav flex-col z-100"
        >
          <div class="flex p-4 justify-between cursor-pointer border-b border-gray-500">
            <input
              type="radio" 
              class="peer" 
              name="transfer-call" 
              value="Transfer Call"
              id="transfer_call" /> 
            <label 
              class="text-sm label-item relative font-medium pl-10 duration-200 ease-in transition-colors
              select-none text-[#3C3C3C] cursor-pointer peer-checked:text-[#3B9EF7]"
              for="transfer_call">Transfer call
            </label>
          </div>
        </div>
      </div>
      ${numberOrContactHtml}
    </div>
  `;

  modal.querySelector("main").innerHTML = transferHtml;
  let transferCallInput = document.querySelector("[name='transfer-call']");
  let transferToggleBtn = document.getElementById("transfer-toggle-btn");
  transferCallInput.checked =
    transferCallInput.value ===
    transferToggleBtn.querySelector(".transfer-call-val").innerText;

  let transferRadioList = document.getElementById("transfer-options");
  transferToggleBtn.onclick = function () {
    this.querySelector("img").classList.toggle("rotate-180");
    transferRadioList.classList.toggle("hidden");
    transferRadioList.classList.toggle("flex");
  };

  addDialTransferActions();

  saveBtn.onclick = function () {
    const finalValue = getContactOrInputValue();

    activeActions.push({
      type: "transfer",
      value: finalValue,
      id: generateUUID(),
    });

    modal.querySelector("#close-select-sidecar").click();
    drawActiveActionsList();
  };
}

function drawActiveActionsList() {
  let activeActionList = document.getElementById("active-actions");
  activeActionList.classList.remove("hidden");
  activeActionList.classList.add("flex");

  let html = activeActions
    .map((el) => {
      return `
      <div data-value="${el.value}" data-id="${
        el.id
      }" class="flex w-full py-6 px-8 active-action-item cursor-pointer select-none 
      justify-between items-center
     rounded-1.5 bg-opacity-5 bg-[#00A2DD]">
        <div class="flex gap-2 items-center">
          <div class="w-5 h-5">
            <img src="../images/drag.svg"/>
          </div>
          <span class="text-lg">${capitalizeAndRemoveUnderscores(el.type)}: ${
        typeof el.value === "string" ? el.value : ""
      } </span>
        </div>
        <div class="w-5 h-5 delete-active-action">
          <img
            src="/images/delete.svg"
            class="w-full h-full object-contain brightness-50"
          />
        </div>
      </div>
    `;
    })
    .join(" ");

  updateAddEditSaveButton(true);

  activeActionList.innerHTML = html;
  if (activeActions.length === 0) {
    activeActionList.classList.remove("flex");
    activeActionList.classList.add("hidden");
    return;
  }

  new Sortable(activeActionList, {
    animation: 150,
    ghostClass: "blue-background-class",
    onEnd: function (evt) {
      var oldIndex = evt.oldIndex;
      var newIndex = evt.newIndex;

      var temp = activeActions[oldIndex];
      activeActions[oldIndex] = activeActions[newIndex];
      activeActions[newIndex] = temp;
    },
  });

  document.querySelectorAll(".active-action-item").forEach((el) => {
    el.onclick = function (e) {
      if (
        e.target.classList.contains("delete-active-action") ||
        e.target.parentNode.classList.contains("delete-active-action")
      ) {
        activeActions = activeActions.filter((el) => el.id !== this.dataset.id);
        drawActiveActionsList();
      }
    };
  });

  console.log(activeActions, "active");
}

function openPauseModal(modal) {
  let saveBtn = modal.querySelector("#save-action-btn");
  modal.classList.remove("hidden");
  modal.classList.add("grid");
  modal.querySelector("h2").innerText = "Pause";

  let pauseContent = `
    <div class="flex w-full justify-center">
      <input min="0" max="20" class="px-10 py-6 outline-none w-44 text-2xl 
      border border-[#4CA3EB] rounded-2.5" type="number" id="pause-value" />
    </div>
  `;

  modal.querySelector("main").innerHTML = pauseContent;

  let pauseInput = document.getElementById("pause-value");

  pauseInput.onkeydown = function (e) {
    blockInvalidChar(e);
  };

  pauseInput.oninput = function (e) {
    saveBtn.disabled =
      e.target.valueAsNumber === 0 || e.target.value.length < 1;
  };

  saveBtn.onclick = function () {
    activeActions.push({
      type: "pause",
      value: pauseInput.value,
      id: generateUUID(),
    });

    modal.querySelector("#close-select-sidecar").click();

    drawActiveActionsList();
  };
}

function openDialActionModal(modal) {
  let saveBtn = modal.querySelector("#save-action-btn");
  modal.classList.remove("hidden");
  modal.classList.add("grid");
  modal.querySelector("h2").innerText = "Dial";

  let dialContent = numberOrContactHtml;

  modal.querySelector("main").innerHTML = dialContent;

  addDialTransferActions();
  saveBtn.onclick = function () {
    const finalValue = getContactOrInputValue();

    activeActions.push({
      type: "dial",
      value: finalValue,
      id: generateUUID(),
    });

    modal.querySelector("#close-select-sidecar").click();

    drawActiveActionsList();
  };
}

function openKeyPressModal(modal) {
  let saveBtn = modal.querySelector("#save-action-btn");
  modal.classList.remove("hidden");
  modal.classList.add("grid");
  modal.querySelector("h2").innerText = "Keypress";

  let keypressContainer = document.createElement("div");
  keypressContainer.classList.add("grid", "grid-cols-3", "place-items-center");

  let html = dialpadArr
    .map((el) => {
      return `
      <label 
      for="keypress-${el}"
      class="w-16 h-16 text-2xl 
      items-center select-none duration-200 transition-colors 
      ease-in flex justify-center cursor-pointer 
      rounded-full before:!hidden after:!hidden">
        <input 
          value="${el}" 
          type="radio" 
          class="hidden" 
          name="keypress-num"
          id="keypress-${el}"
        />
        <span>${el}</span>
      </label>
    `;
    })
    .join(" ");

  keypressContainer.innerHTML = html;

  modal.querySelector("main").appendChild(keypressContainer);
  var previouslyChecked;

  keypressContainer.querySelectorAll("input").forEach((el) => {
    el.onchange = function () {
      if (previouslyChecked) {
        previouslyChecked.parentElement.classList.remove(
          "bg-blue-400",
          "text-white"
        );
      }
      this.parentElement.classList.add("bg-blue-400", "text-white");
      previouslyChecked = this;
      saveBtn.disabled = false;
    };
  });

  saveBtn.onclick = function () {
    const activeValue = keypressContainer.querySelector("input:checked").value;
    activeActions.push({
      type: "keypress",
      value: activeValue,
      id: generateUUID(),
    });

    modal.querySelector("#close-select-sidecar").click();
    drawActiveActionsList();
  };
}

function handleActions(key) {
  let actionModal = document.getElementById("sidecar-action-modal");
  let closeModal = document.getElementById("close-select-sidecar");
  let saveBtn = document.querySelector("#save-action-btn");

  switch (key) {
    case "dial":
      openDialActionModal(actionModal);
      break;
    case "pause":
      openPauseModal(actionModal);
      break;
    case "transfer":
      openTransferModal(actionModal);
      break;
    case "merge":
    case "hangup":
    case "hold":
      activeActions.push({
        type: key,
        value: "",
        id: generateUUID(),
      });
      drawActiveActionsList();
      break;
    case "keypress":
      openKeyPressModal(actionModal);
      break;
    default:
      break;
  }

  closeModal.onclick = function () {
    actionModal.classList.remove("grid");
    actionModal.classList.add("hidden");
    actionModal.querySelector("h2").innerText = "";
    actionModal.querySelector("main").innerHTML = "";
    saveBtn.disabled = true;
  };
}

function modifySidecarConfig(data) {
  return axios
    .put(`https://storage-service.ringplan.com/resources`, data, {
      params: {
        unique_name: `Sidecar_${uuid}`,
      },
      headers: {
        Authorization: id_token,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err.response.data;
    });
}

function getSidecarConfig() {
  return axios
    .get(`https://storage-service.ringplan.com/resources`, {
      params: {
        unique_name: `Sidecar_${uuid}`,
      },
      headers: {
        Authorization: id_token,
      },
    })
    .then((res) => {
      const fileUrl = res.data.url;
      return axios.get(fileUrl, { responseType: "blob" }).then((res) => {
        const blob = new Blob([res.data], { type: "application/xml" });
        return { success: true, blob };
      });
    })
    .catch((err) => {
      console.log(err, "err");
      return err;
    });
}

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

function validateXML(xmlString) {
  let result = {
    isValid: true,
  };
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xmlString, "text/xml");
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    result = {
      error: true,
      message: "The XML is not valid",
    };
    return result;
  }
  console.log("The XML is valid");

  var root = xmlDoc.documentElement;

  if (root.nodeName !== "SidecarConfig") {
    result = {
      error: true,
      message: "Invalid xml file format, root element should be SidecarConfig",
    };
    return result;
  }

  let buttons = root.querySelectorAll("*");
  buttons = Array.from(buttons).filter(function (el) {
    return el.tagName.startsWith("Button_");
  });

  if (buttons.length === 0) {
    result = {
      error: true,
      message: "Invalid xml file format, there should be at least one button",
    };
    return result;
  }

  const validateNumber = (value) => {
    return !isNaN(value) || /^\+\d+$/.test(value);
  };

  const validateButton = (button) => {
    const name = button.getAttribute("name");
    const extension = button.getAttribute("extension");
    if (!name || typeof name !== "string") {
      return false;
    }
    if (!extension || !validateNumber(extension)) {
      return false;
    }
    let hasValidAction = false;
    for (const child of button.children) {
      switch (child.nodeName) {
        case "DIAL":
          const dialNumber = child.getAttribute("number");
          if (!dialNumber || !validateNumber(dialNumber)) {
            return false;
          }
          hasValidAction = true;
          break;
        case "PAUSE":
          const pauseSeconds = child.getAttribute("seconds");
          if (!pauseSeconds || !validateNumber(pauseSeconds)) {
            return false;
          }
          hasValidAction = true;
          break;
        case "KEYPRESS":
          const keyPressNumber = child.getAttribute("number");
          if (!keyPressNumber || !/^[0-9]$/.test(keyPressNumber)) {
            return false;
          }
          hasValidAction = true;
          break;
        case "HOLD":
        case "MERGE":
        case "HANGUP":
          const activeAttr = child.getAttribute("active");
          if (!activeAttr || !/^[01]$/.test(activeAttr)) {
            return false;
          }
          hasValidAction = true;
          break;
        case "SEND_MESSAGE":
          const fromNumber = child.getAttribute("fromNumber");
          const toNumber = child.getAttribute("toNumber");
          const message = child.getAttribute("message");
          if (!fromNumber || !validateNumber(fromNumber)) {
            return false;
          }
          if (!toNumber || !validateNumber(toNumber)) {
            return false;
          }
          if (!message || typeof message !== "string") {
            return false;
          }
          hasValidAction = true;
          break;
        case "MODIFY_STATUS":
          const toggleMode = child.getAttribute("toggleMode");
          const fromStatuses = child.getAttribute("fromStatuses");
          const toStatus = child.getAttribute("toStatus");
          if (!toggleMode || !/^[01]$/.test(toggleMode)) {
            return false;
          }
          // compare fromStatuses and toStatus to match the real key from status map object later
          if (!fromStatuses || typeof fromStatuses !== "string") {
            return false;
          }
          if (!toStatus || typeof toStatus !== "string") {
            return false;
          }
          hasValidAction = true;
          break;
      }
    }
    return hasValidAction;
  };

  buttons.forEach((button) => {
    let isValidBtn = validateButton(button);
    if (!isValidBtn) {
      result = {
        error: true,
        message: `Invalid configuration in ${button.tagName}`,
      };
    }
  });

  return result;
}

function drawSidecarButtons(xml) {
  let addEditContainer = document.getElementById("add-edit-container");
  let sidecarContainer = document.getElementById("sidecar-container");
  const root = xml.documentElement;

  let buttons = root.querySelectorAll("*");
  buttons = Array.from(buttons).filter(function (el) {
    return el.tagName.startsWith("Button_");
  });

  buttons.forEach((button) => {
    const name = button.getAttribute("name");
    const extension = button.getAttribute("extension");

    let buttonElem = document.createElement("div");
    buttonElem.classList.add(...sidecarBtnClasses);
    buttonElem.id = `button_${name}_${extension}`;
    buttonElem.dataset.name = name;
    buttonElem.dataset.extension = extension;
    let actions = button.children;
    for (let j = 0; j < actions.length; j++) {
      let action = actions[j];

      let actionName = action.nodeName.toLowerCase();
      let actionAttributes = action.attributes;

      var attrObj = {};
      for (var i = 0; i < actionAttributes.length; i++) {
        attrObj[actionAttributes[i].name] = actionAttributes[i].value;
      }

      buttonElem.dataset[actionName] = JSON.stringify(attrObj);
    }

    if (document.getElementById("sidecar-loader")) {
      document.getElementById("sidecar-loader").remove();
    }

    if (!document.getElementById(`button_${name}_${extension}`)) {
      sidecarContainer.appendChild(buttonElem);
    }
    buttonElem.innerHTML = `
      <div class="flex justify-between w-full items-center">
        <span class="text-[#000000] font-medium">
          ${name}
        </span>
        <div class="w-6 h-6 sidecar-options-trigger">
          <img src="../images/options.svg" />
        </div>
        <div 
        class="absolute sidecar-sub-menu hidden flex-col top-3 left-[-1.5rem] w-full z-100">
          <div data-edit="true" class="py-3 px-2 duration-200 ease-in transition-colors sidecar-submenu-item hover:bg-gray-300
           cursor-pointer shadow bg-white">
            Edit
          </div>
          <div data-delete="true" class="py-3 px-2 duration-200 ease-in transition-colors sidecar-submenu-item hover:bg-gray-300
          cursor-pointer shadow bg-white">
            Delete
         </div>
        </div>
      </div>
      <div class="flex justify-between w-full items-center relative">
        <div>
          <img src="../images/call-sm.svg"/>
        </div>
        <div>
          <img src="../images/play-sm.svg"/>
        </div>
      </div>
      `;
    sidecarContainer.classList.add("grid");
  });

  document.querySelectorAll(".sidecar-btn").forEach((el) => {
    el.onclick = function (e) {
      if (
        e.target.parentNode.classList.contains("sidecar-options-trigger") ||
        e.target.classList.contains("sidecar-options-trigger")
      ) {
        e.stopPropagation();
        removeOptionsSubmenu();
        this.querySelector(
          ".sidecar-options-trigger"
        ).nextElementSibling.classList.remove("hidden");
        this.querySelector(
          ".sidecar-options-trigger"
        ).nextElementSibling.classList.remove("flex");
      }
      if (
        e.target.classList.contains("sidecar-submenu-item") ||
        e.target.parentNode.classList.contains("sidecar-submenu-item")
      ) {
        console.log(e.target);
        e.stopPropagation();
        if (e.target.dataset.delete === "true") {
          let btnName = el.dataset.name;
          let elementToRemove = root.querySelector(`[name='${btnName}']`);
          elementToRemove.parentNode.removeChild(elementToRemove);

          let updatedXmlText = new XMLSerializer().serializeToString(xml);
          let blob = new Blob([updatedXmlText], { type: "application/xml" });
          const formData = new FormData();
          formData.append("upfile", blob, "sidecarConfig.xml");
          formData.append("unique_name", `Sidecar_${uuid}`);
          modifySidecarConfig(formData)
            .then((res) => {
              showSuccessToast("Button was deleted successfully");
              localStorage.setItem(
                "sidecarConfig",
                JSON.stringify(updatedXmlText)
              );
              el.remove();
            })
            .catch((err) => {
              console.log(err, "err");
              showErrorToast({ message: "Something went wrong" });
            });
        }
      }
    };
  });
  document.addEventListener("click", function (e) {
    if (
      !e.target.parentNode?.classList.contains("sidecar-options-trigger") ||
      !e.target.classList.contains("sidecar-options-trigger")
    ) {
      removeOptionsSubmenu();
    }
  });

  const addButton = document.createElement("div");
  addButton.classList.add(...addBtnClasses);
  addButton.id = "add-sidecar-btn";

  const actionListTrigger = document.getElementById("add-action");

  addButton.innerHTML = `<span class="text-3xl text-white select-none">+</span>`;
  sidecarContainer.appendChild(addButton);
  let actionsList = document.getElementById("actions-list");
  let actionlistData = actions
    .map((el) => {
      return `
    <div data-action="${el}" class="w-full cursor-pointer select-none
     p-3 bg-white border-b
     duration-200 ease-in border-[#D9D9D9] action-list-item 
     transition-background hover:bg-gray-100">
      ${capitalizeAndRemoveUnderscores(el)}
    </div>
    `;
    })
    .join(" ");

  actionsList.innerHTML = actionlistData;

  addButton.onclick = function (e) {
    if (!addEditContainer.classList.contains("hidden")) return;
    updateAddEditSaveButton(true);
    addEditContainer.classList.remove("hidden");
    addEditContainer.querySelector("#header-title").innerText = `Button ${
      buttons.length + 1
    } programming`;

    if (extensionsData) {
      let showExtVals = JSON.parse(extensionsData).map((el) => {
        return {
          ext: el.data.extension,
        };
      });
      $("#watch-extension").selectize({
        options: showExtVals,
        maxItems: 1,
        searchField: ["ext"],
        labelField: "ext",
        valueField: "ext",
        plugins: ["clear_button"],
        placeholder: "Select extension",
      });
    }
  };

  document.getElementById("button-name").oninput = function () {
    updateAddEditSaveButton(true);
  };

  let revertChanges = document.getElementById("revert-changes");
  let confirmModal = document.getElementById("confirm-modal");
  let confirmAction = document.getElementById("confirm-action");
  let cancelAction = document.getElementById("cancel-action");
  let activeActionList = document.getElementById("active-actions");

  actionListTrigger.onclick = function (e) {
    if (e.target.classList.contains("action-list-item")) {
      handleActions(e.target.dataset.action);
    }
    this.querySelector("img").classList.toggle("rotate-180");
    actionsList.classList.toggle("hidden");
    actionsList.classList.toggle("flex");
  };

  revertChanges.onclick = function () {
    confirmModal.classList.remove("hidden");
    confirmModal.classList.add("grid");
    confirmModal.querySelector("h3").innerText =
      "You will lose all of your changes. Are you sure?";
    confirmAction.innerText = "Yes";
  };

  cancelAction.onclick = function () {
    confirmModal.classList.remove("grid");
    confirmModal.classList.add("hidden");
    confirmModal.querySelector("h3").innerText = "";
    confirmAction.innerText = "Delete";
  };

  document.getElementById("close-confirm-modal").onclick = function () {
    cancelAction.click();
  };

  confirmAction.onclick = function () {
    cancelAction.click();
    addEditContainer.classList.add("hidden");
    activeActionList.innerHTML = "";
    activeActions = [];
    $("#watch-extension")[0].selectize?.clear();
    document.getElementById("button-name").value = "";
    actionsList.classList.remove("flex");
    actionsList.classList.add("hidden");
  };
}
