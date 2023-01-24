let isFilterMode = false;
let filteredItem;

let checkedIds = [];
let isBulkEdit = false;
let timerId;

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

function showErrorToast(err) {
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
}

function showSuccessToast(isBulk) {
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
}

function shareEmail(email, link) {
  let mailLink =
    "mailto:" +
    encodeURIComponent(email) +
    "?subject=" +
    encodeURIComponent("Voicemail") +
    "&body=" +
    encodeURIComponent(link);
  window.open(mailLink, "_blank");
}

async function bulkDeleteVoicemails() {
  try {
    let values = fetch(`${backendApi}/voicemail/messages/bulk-delete`, {
      method: "PATCH",
      headers: {
        Authorization: id_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message_ids: checkedIds }),
    });
    if (values.ok) {
      const finalData = await values.json();
      return finalData;
    } else {
      return { error: true };
    }
  } catch (err) {
    return err;
  }
}

function toggleVoicemailOpts(e) {
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
}

async function bulkUpdateVoicemailsRead(bool) {
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
}

async function deleteVoicemail(id) {
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
}

async function setVoicemailListened(id) {
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
}

async function handleBulkActions(action, listItems, cb) {
  document.body.click(); //click to body to close the options modal;

  if (action !== "delete") {
    bulkUpdateVoicemailsRead(action === "read")
      .then((res) => {
        cb();
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
        cb();
        console.log(err, "error");
      });
  } else {
    bulkDeleteVoicemails()
      .then((res) => {
        if (res.error) {
          cb();
          showErrorToast();
          drawVoicemails(listItems);
          return;
        }
        const newData = listItems.filter(
          (item) => !checkedIds.includes(item._id)
        );
        cb();
        showSuccessToast(true);
        drawVoicemails(newData);
      })
      .catch((err) => {
        console.log(err, "err");
        showErrorToast(err);
        cb();
      });
  }
}

async function openVoicemailDetails(data, id, isListened, target) {
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
  let closeDeleteVoicemailBtn = document.getElementById(
    "close-voicemail-delete"
  );
  let cancelDeleteVoicemailBtn = document.getElementById(
    "delete-voicemail-cancel"
  );
  let confirmDeleteVoicemailBtn = document.getElementById(
    "delete-voicemail-confirm"
  );
  let voicemailModal = document.getElementById("voicemail-delete");
  let shareVoiceMailBtn = document.getElementById("share-voicemail-btn");
  let callVoiceMailBtn = document.getElementById("call-voicemail-btn");
  let audioDest = document.getElementById("audio-dest");

  const activeItem = data.find((item) => item._id === id);
  voiceMailDetails.classList.remove("hidden");
  voiceMailDetails.classList.add("flex");
  voiceMailDetails.querySelector("#voicemail-number").innerText =
    activeItem.extension_source;
  voiceMailDetails.querySelector("#voicemail-message span").innerText =
    activeItem.transcription || 'No transcription available';
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
    voicemailModal.classList.remove("hidden");
    voicemailModal.classList.add("grid");
  };

  const closeVoicemailModal = () => {
    voicemailModal.classList.remove("grid");
    voicemailModal.classList.add("hidden");
  };

  closeDeleteVoicemailBtn.onclick = closeVoicemailModal;
  cancelDeleteVoicemailBtn.onclick = closeVoicemailModal;

  confirmDeleteVoicemailBtn.onclick = () => {
    confirmDeleteVoicemailBtn.disabled = true;
    confirmDeleteVoicemailBtn.innerText = "Loading...";

    confirmDeleteVoicemailBtn.insertAdjacentHTML(
      `afterbegin`,
      `
      <svg 
      id="delete-loading"
      class="inline w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      `
    );

    deleteVoicemail(id)
      .then((res) => {
        confirmDeleteVoicemailBtn.innerText = "Delete";
        confirmDeleteVoicemailBtn.disabled = false;
        closeVoicemailModal();
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
        confirmDeleteVoicemailBtn.innerText = "Delete";
        confirmDeleteVoicemailBtn.disabled = false;
        closeVoicemailModal();
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
}

function drawVoicemails(values) {
  let voiceMailLoader = document.getElementById("voicemail-list-loader");
  let voiceMailList = document.getElementById("voicemail-list");
  let bulkSelect = document.getElementById("select_all");
  let actionMenu = document.getElementById("action-menu");
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

  let readBtn = document.getElementById("bulk-read");
  let unReadBtn = document.getElementById("bulk-unread");
  let bulkDelete = document.getElementById("bulk-delete");

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
                  <p class="text-[#4D4D4D]">${
                    item.source_representation_name
                  }</p>
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
  applyFilters.disabled = true;
  document.getElementById("settings-filters").classList.remove("hidden");
  document.getElementById("settings-filters").classList.add("flex");

  clearFilters.disabled = !fromDate.value && !toDate.value && !filteredItem;

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
      clearFilters.disabled = false;
      applyFilters.disabled = false;
    });
  });

  const bulkUpdateCb = () => {
    isBulkEdit = false;
    actionMenu.classList.add("hidden");
    bulkSelect.checked = false;
  };

  readBtn.onclick = (e) => {
    e.stopPropagation();
    handleBulkActions("read", values, bulkUpdateCb);
  };

  unReadBtn.onclick = (e) => {
    e.stopPropagation();
    handleBulkActions("unread", values, bulkUpdateCb);
  };

  bulkDelete.onclick = (e) => {
    e.stopPropagation();
    handleBulkActions("delete", values, bulkUpdateCb);
  };

  bulkSelect.onchange = (e) => {
    isBulkEdit = e.target.checked;
    voiceMailList.querySelectorAll(".voicemail-list-item").forEach((item) => {
      if (e.target.checked) {
        item.querySelector("input").parentNode.classList.remove("hidden");
      } else {
        item.querySelector("input").checked = false;
        item.querySelector("input").parentNode.classList.add("hidden");
        actionMenu.classList.add("hidden");
      }
    });
  };

  setInterval(() => {
    if(fromDate.value && toDate.value){
      applyFilters.disabled = false;
      clearFilters.disabled = false;
    } 
  },1500)
  
  
  let datePicker = document.querySelector(".datepicker-dropdown");
  filterTrigger.onclick = () => {
    filterModal.classList.remove("hidden");
    filterModal.classList.add("flex");
    datePicker.classList.add("shadow");
    document
      .querySelector(".datepicker-main")
      .classList.add("overflow-y-auto", "max-h-62.5");
    filterExtTrigger.querySelector("span").innerText = isFilterMode
      ? filteredItem || getCookie("user_id")
      : getCookie("user_id");
  };

  filterModal.onclick = () => {
    filterExtList.classList.add("hidden");
    filterExtList.classList.remove("flex");
  };

  filterExtList.innerHTML = `
      <div
      class="flex filter-ext-item p-4 justify-between cursor-pointer border-b border-gray-500"
    >
      <input
        class="peer input-ext"
        type="radio"
        id="all_ext"
        value="All"
        name="extension_filter"
      />
      <label
        for="all_ext"
        class="text-sm label-item relative font-medium pl-10 duration-200 ease-in transition-colors select-none text-[#3C3C3C] cursor-pointer peer-checked:text-[#3B9EF7]"
      >
        All
      </label>
    </div>
  
  `;

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
    if (isFilterMode && filteredItem) {
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
        !isFilterMode &&
        (!fromDate.value || !toDate.value);
      if (isFilterMode) {
        document.querySelector(
          `input[value="${filteredItem || getCookie("user_id")}"]`
        ).checked = false;
      }
      clearFilters.disabled = false;
      this.querySelector("input").checked =
        !this.querySelector("input").checked;
      console.log(this.dataset.ext);
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
    clearFilters.disabled = true;
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
        clearFilters.disabled = false;
      });
  };

  clearFilters.onclick = () => {
    clearFilters.innerHTML = `
    <svg 
      id="clear-loading"
      class="inline w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      Loading...
    `;
    clearFilters.disabled = true;
    applyFilters.disabled = true;
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
    getVoicemails(true).then((res) => {
      clearFilters.innerHTML = "Clear filters";
    });
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
}

async function getVoicemails(isFromFilter) {
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
