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
          const holdActive = child.getAttribute("active");
          if (!holdActive || !/^[01]$/.test(holdActive)) {
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
        case "HANGUP":
          const hangupActive = child.getAttribute("active");
          if (!hangupActive || !/^[01]$/.test(hangupActive)) {
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
  let sidecarContainer = document.getElementById("sidecar-container");
  const root = xml.documentElement;

  let buttons = root.querySelectorAll("*");
  buttons = Array.from(buttons).filter(function (el) {
    return el.tagName.startsWith("Button_");
  });

  buttons.forEach((button, index) => {
    const name = button.getAttribute("name");
    const extension = button.getAttribute("extension");

    let buttonElem = document.createElement("div");
    buttonElem.classList.add(
      "w-40",
      "h-36",
      "bg-[#FDFDFD]",
      "rounded-xl",
      "border",
      "border-[#A9A9A9]",
      "cursor-pointer",
      "flex",
      "flex-col",
      "items-center",
      "justify-between",
      "p-6"
    );
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
      <div class="flex justify-between w-full">
        <span class="text-[#000000] font-medium">
          Button ${index + 1}
        </span>
        <div class="w-6 h-6">
          <img src="../images/options.svg" />
        </div>
      </div>
      <div class="flex justify-between w-full items-center">
        <div>
          <img src="../images/call-sm.svg"/>
        </div>
        <div>
          <img src="../images/play-sm.svg"/>
        </div>
      </div>
    `;
    sidecarContainer.classList.add("grid", "active-container");
  });
}
