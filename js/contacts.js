let salutationList = [];

function removePlus(str) {
  return str.replace(/\+/g, "");
}

function findActiveReportTo(data, activeContact) {
  return data.find(
    (item) =>
      item.first_name + " " + item.last_name ===
        activeContact.job_details?.reports_to ||
      item.phone === activeContact.job_details?.reports_to ||
      item.email === activeContact.job_details?.reports_to
  );
}

async function getContacts() {
  try {
    const contacts = await fetch(`${backendApi}/company/directory/contacts`, {
      headers: {
        Authorization: id_token,
      },
    });
    if (contacts.ok) {
      const data = await contacts.json();

      drawContacts(data);
    }
  } catch (error) {
    console.log(error, "error");
  }
}

async function getOptions() {
  try {
    let values = fetch(`${backendApi}/company/directory/contacts/options`, {
      headers: {
        Authorization: id_token,
      },
    });
    return values;
  } catch (err) {
    return { err, error: true };
  }
}

async function deleteContact(id) {
  try {
    let values = fetch(`${backendApi}/company/directory/contacts/${id}`, {
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

async function updateContact(id, data) {
  try {
    let values = fetch(`${backendApi}/company/directory/contacts/${id}`, {
      method: "PUT",
      headers: {
        Authorization: id_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return values;
  } catch (err) {
    return err;
  }
}

function filterContacts(contacts, input) {
  return contacts.filter(function (contact) {
    return (
      contact.first_name?.toLowerCase()?.includes(input.toLowerCase()) ||
      contact.last_name?.toLowerCase()?.includes(input.toLowerCase()) ||
      contact.phone?.includes(input) ||
      contact.email?.toLowerCase()?.includes(input.toLowerCase())
    );
  });
}

const removeActiveMark = () => {
  document.querySelectorAll(".contact-list-item").forEach((item) => {
    item.classList.remove("bg-gray-100");
  });
};

const toggleEmailPhone = (target, value) => {
  if (!!value) {
    target.classList.remove("hidden");
    target.classList.add("flex");
    target.querySelector("p").innerText = value;
  } else {
    target.classList.add("hidden");
    target.classList.remove("flex");
    target.querySelector("p").innerText = "";
  }
};

function updateSaveButton(activeContact) {
  let saveEdit = document.getElementById("save-contact-edit");
  let editMode = document.getElementById("edit-mode");

  let { address, job_details, organization_details, ...rest } = activeContact;
  if (!address) {
    address = {
      country: "",
      state: "",
      city: "",
      street: "",
      zipcode: "",
    };
  }
  if (!job_details) {
    job_details = {
      position: "",
      department: "",
      reports_to: "",
    };
  }
  if (!organization_details) {
    organization_details = {
      organization: "",
      parent_organization: "",
    };
  }
  const tmpContact = {
    ...rest,
    phone: removePlus(rest.phone || ""),
    ...address,
    ...job_details,
    ...organization_details,
    mailing_address: rest.mailing_address || "",
  };

  const inputs = editMode.querySelectorAll("input");
  const inputValues = Array.from(inputs).map((input) => ({
    name: input.name,
    value: input.value,
  }));

  const match = inputValues.every((inputVal) => {
    if (tmpContact.hasOwnProperty(inputVal.name)) {
      if (!inputVal.value && !tmpContact[inputVal.name]) {
        return true;
      }
      return inputVal.value === tmpContact[inputVal.name];
    }
    return true;
  });

  saveEdit.disabled = match;
}

function openContactDetails(id, data, activeContact) {
  let contactDetails = document.getElementById("contacts-details");
  let contactAvatar = document.getElementById("contact-avatar");
  let activeElem = document.querySelector(`[data-id="${id}"]`);
  let contactNumber = document.getElementById("contact-number");
  let activeImageSrc = activeElem.querySelector("img").src;
  let contactPhone = document.getElementById("contact-mobile");
  let contactEmail = document.getElementById("contact-email");
  let contactCallBtn = document.getElementById("call-contact-btn");
  let deleteContactTrigger = document.getElementById("delete-contact-btn");
  let deleteContactModal = document.getElementById("delete-confirm-modal");
  let closeContactModal = document.getElementById("close-confirm-modal");
  let cancelAction = document.getElementById("cancel-action");
  let confirmDelete = document.getElementById("confirm-action");
  let viewMode = document.getElementById("view-mode");
  let editMode = document.getElementById("edit-mode");
  let editTrigger = document.getElementById("edit-trigger");
  let cancelEdit = document.getElementById("cancel-changes");
  let saveEdit = document.getElementById("save-contact-edit");
  let detailActions = document.getElementById("detail-actions");

  let fieldWrappers = document.querySelectorAll(".field-wrapper");
  contactDetails.classList.remove("hidden");
  contactDetails.classList.add("flex");
  editMode.classList.add("hidden");
  viewMode.classList.remove("hidden");

  contactAvatar.src = activeImageSrc;
  contactNumber.innerHTML = activeContact.phone || activeContact.email;

  removeActiveMark();

  activeElem.classList.add("bg-gray-100");

  toggleEmailPhone(contactEmail, activeContact.email);
  toggleEmailPhone(contactPhone, activeContact.phone);

  fieldWrappers.forEach((wrapper) => {
    wrapper.children[0]
      .querySelector("img")
      .classList.add("ease", "duration-300", "transition-transform");
    wrapper.querySelector(".field-child").classList.remove("flex", "grid");
    wrapper.querySelector(".field-child").classList.add("hidden");
    wrapper.children[0].querySelector("img").classList.remove("rotate-180");
    wrapper.onclick = function (e) {
      let fieldChild = this.querySelector(".field-child");
      this.children[0].querySelector("img").classList.toggle("rotate-180");
      fieldChild.classList.toggle("hidden");
      if (fieldChild.dataset.grid === "true") {
        fieldChild.classList.toggle("grid");
      } else {
        fieldChild.classList.toggle("flex");
      }
      fieldChild.onclick = (e) => {
        e.stopPropagation();
      };
    };
  });

  contactCallBtn.onclick = () => {
    removeActiveMark();
    contactDetails.classList.remove("flex");
    contactDetails.classList.add("hidden");
    makeCall(activeContact.phone);
  };

  const closeConfirmModal = () => {
    deleteContactModal.classList.remove("grid");
    deleteContactModal.classList.add("hidden");
    confirmDelete.innerText = "Delete";
    cancelAction.innerText = "Cancel";
  };

  deleteContactTrigger.onclick = () => {
    deleteContactModal.classList.remove("hidden");
    deleteContactModal.classList.add("grid");
    deleteContactModal.querySelector("h3").innerText =
      "Are you sure to delete this contact?";
  };

  closeContactModal.onclick = () => {
    closeConfirmModal();
  };

  cancelAction.onclick = () => {
    closeConfirmModal();
  };

  confirmDelete.onclick = function () {
    if (this.dataset.isEdit === "true") {
      viewMode.classList.remove("hidden");
      editMode.classList.add("hidden");
      detailActions.classList.remove("hidden");
      detailActions.classList.add("flex");
      this.dataset.isEdit = false;
      closeConfirmModal();
      return;
    }
    confirmDelete.disabled = true;
    confirmDelete.innerText = "Loading...";

    confirmDelete.insertAdjacentHTML(
      `afterbegin`,
      `
      <svg 
      id="delete-contact-loading"
      class="inline w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      `
    );
    deleteContact(id)
      .then((res) => {
        confirmDelete.innerText = "Delete";
        confirmDelete.disabled = false;
        closeConfirmModal();
        if (res.ok) {
          showSuccessToast(null, true);
          const newData = [...data].filter((item) => item.id !== id);
          drawContacts(newData);
          contactDetails.classList.remove("flex");
          contactDetails.classList.add("hidden");
        } else {
          showErrorToast();
        }
      })
      .catch((err) => {
        confirmDelete.innerText = "Delete";
        confirmDelete.disabled = false;
        closeConfirmModal();
        console.log(err, "err");
        showErrorToast(err);
      });
  };

  editTrigger.onclick = () => {
    viewMode.classList.add("hidden");
    editMode.classList.remove("hidden");

    $("#salutation")[0].selectize?.clear();
    $("#reports_to")[0].selectize?.clear();

    if (activeContact.salutation) {
      $("#salutation")[0].selectize.setValue(activeContact.salutation);
    }
    if (activeContact.job_details?.reports_to) {
      const activeReportsTo = findActiveReportTo(data, activeContact);
      if (activeReportsTo) {
        $("#reports_to")[0].selectize.setValue(
          activeReportsTo.phone || activeReportsTo.email
        );
      }
    }

    detailActions.classList.remove("flex");
    detailActions.classList.add("hidden");
    editMode.querySelectorAll("input").forEach((el) => {
      let finalVal = activeContact[el.name] || "";

      switch (el.name) {
        case "phone":
        case "fax":
          el.value = removePlus(finalVal);
          break;
        case "position":
        case "department":
          el.value = activeContact.job_details?.[el.name] || "";
          break;
        case "organization":
        case "parent_organization":
          el.value = activeContact.organization_details?.[el.name] || "";
          break;
        case "country":
        case "street":
        case "city":
        case "zipcode":
        case "state":
          el.value = activeContact.address?.[el.name] || "";
          break;
        default:
          el.value = finalVal;
      }
    });
    updateSaveButton(activeContact);

    editMode.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        updateSaveButton(activeContact);
      });
    });
  };
  cancelEdit.onclick = () => {
    deleteContactModal.classList.remove("hidden");
    deleteContactModal.classList.add("grid");
    confirmDelete.innerText = "Yes";
    confirmDelete.dataset.isEdit = true;
    cancelAction.innerText = "No";
    deleteContactModal.querySelector(
      "h3"
    ).innerText = `Are you sure? your changes won't be saved`;
  };
  saveEdit.onclick = function () {
    this.disabled = true;
    this.innerText = "Loading...";

    this.insertAdjacentHTML(
      `afterbegin`,
      `
      <svg 
      id="update-contact-loading"
      class="inline w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      `
    );
    const inputs = editMode.querySelectorAll("input");
    const inputValues = Array.from(inputs).map((input) => ({
      [input.name]: input.value,
    }));

    let sendData = {};

    inputValues.forEach((item) => {
      for (const [key, value] of Object.entries(item)) {
        if (!!value) {
          switch (key) {
            case "country":
            case "state":
            case "zipcode":
            case "city":
            case "street":
              sendData["address"] = {
                ...sendData["address"],
                [key]: value,
              };
              break;
            case "reports_to":
            case "position":
            case "department":
              sendData["job_details"] = {
                ...sendData["job_details"],
                [key]: value,
              };
              break;
            case "organization":
            case "parent_organization":
              sendData["organization_details"] = {
                ...sendData["organization_details"],
                [key]: value,
              };
              break;
            case "autocomplete-location":
              break;
            default:
              sendData[key] = value;
          }
        }
      }
    });

    console.log(sendData, "send");

    updateContact(id, sendData)
      .then((res) => {
        console.log(res, "res");
        if (res.ok) {
          saveEdit.innerText = "Save";
          showSuccessToast(null, true, true);
          const newData = [...data].map((item) => {
            if (item.id === id) {
              return {
                ...item,
                ...sendData,
              };
            }
            return item;
          });
          viewMode.classList.remove("hidden");
          editMode.classList.add("hidden");
          contactDetails.classList.add("hidden");
          contactDetails.classList.remove("flex");
          drawContacts(newData);
        }
        return res.json();
      })
      .then((res) => {
        let isError = res.status?.toString().startsWith("4");
        if (isError) {
          showErrorToast({ message: res.detail });
        } else {
          detailActions.classList.remove("hidden");
          detailActions.classList.add("flex");
          showSuccessToast(null, true, true);
        }
        saveEdit.innerText = "Save";
      })
      .catch((err) => {
        saveEdit.innerText = "Save";
        showErrorToast(err);
      });
  };
}

function template(data) {
  return data
    .map((el) => {
      let acronym =
        el.first_name?.charAt(0)?.toUpperCase() +
        el.last_name?.charAt(0)?.toUpperCase();
      return `
      <div 
      data-id="${el.id}" 
      class="flex contact-list-item cursor-pointer justify-between select-none 
      px-6 py-2 
      items-center border-b border-[#D3D3D3]">
        <div class="flex gap-4 items-center">
          <div class="w-11 h-11">
            <img class="rounded-full" src="${
              el.first_name && el.last_name
                ? generateAvatar(acronym)
                : "/images/profile.svg"
            }"/>
          </div>
          <div class="flex flex-col">
              <p class="text-[#232323]">${
                el.first_name && el.last_name
                  ? el.first_name + " " + el.last_name
                  : el.phone || el.email
              }</p>
              <span class="text-[#A3A3A3] ${
                el.first_name && el.last_name ? "inline" : "hidden"
              }">${el.phone || el.email}</span>
          </div>
        </div>
      </div>
    `;
    })
    .join(" ");
}

function drawContacts(data, isSearch, prevData) {
  let contactsLoader = document.getElementById("contacts-list-loader");
  let contactsList = document.getElementById("contacts-list");
  let searchBar = document.getElementById("search-bar");
  let emptyContacts = document.getElementById("empty-contacts");
  let clearSearch = document.getElementById("clear-search");

  contactsLoader.classList.add("hidden");
  contactsLoader.classList.remove("grid");

  contactsList.classList.remove("hidden");

  if (isSearch) {
    clearSearch.classList.remove("hidden");
    clearSearch.classList.add("flex");
    clearSearch.onclick = () => {
      drawContacts(prevData);
    };
  }

  if (data.length === 0) {
    emptyContacts.classList.remove("hidden");
    emptyContacts.innerText = isSearch
      ? "No contact matches with your input"
      : `You don't have any contacts`;
    contactsList.classList.add("hidden");
    return;
  } else {
    contactsList.classList.remove("hidden");
    emptyContacts.classList.add("hidden");
    emptyContacts.innerText = "";
  }

  $("#contacts-list").pagination({
    dataSource: data,
    pageSize: isSearch ? 50 : data.length / 20,
    autoHidePrevious: true,
    autoHideNext: true,
    callback: function (values, pagination) {
      var html = template(values);
      $("#contacts-list-wrapper").html(html);
      contactsList.querySelectorAll(".contact-list-item").forEach((item) => {
        item.addEventListener("click", () => {
          const activeContact = data.find((el) => el.id === item.dataset.id);

          if (item.dataset.shouldFetch !== "false") {
            getOptions()
              .then((res) => {
                return res.json();
              })
              .then((data) => {
                var items = data.possible_salutations.map(function (x) {
                  return { item: x };
                });
                sessionStorage.setItem("salutations", JSON.stringify(items));
              });
            contactsList
              .querySelectorAll(".contact-list-item")
              .forEach((el) => {
                el.dataset.shouldFetch = false;
              });
          }

          let selectedItems = [{ item: activeContact.salutation }];
          let items = sessionStorage.getItem("salutations");
          if (items) {
            items = JSON.parse(sessionStorage.getItem("salutations"));
          }

          $("#salutation").selectize({
            options: items,
            items: selectedItems,
            maxItems: 1,
            allowEmptyOption: true,
            labelField: "item",
            valueField: "item",
            searchField: "item",
            plugins: ["clear_button"],
            onChange: function () {
              updateSaveButton(activeContact);
            },
          });

          let showSelectData = isSearch ? prevData : data;
          let finalVals = showSelectData.map((el) => {
            return {
              ...el,
              phone: el.phone || el.email,
            };
          });

          const activeReportsTo = data.find(
            (item) =>
              item.first_name + " " + item.last_name ===
                activeContact.job_details?.reports_to ||
              item.phone === activeContact.job_details?.reports_to ||
              item.email === activeContact.job_details?.reports_to
          );

          let selectedReportsTo = [
            { phone: activeReportsTo?.phone || activeReportsTo?.email },
          ];

          $("#reports_to").selectize({
            options: finalVals,
            items: selectedReportsTo,
            maxItems: 1,
            allowEmptyOption: true,
            searchField: ["phone"],
            labelField: "phone",
            valueField: "phone",
            plugins: ["clear_button"],
            onChange: function () {
              updateSaveButton(activeContact);
            },
          });

          openContactDetails(item.dataset.id, data, activeContact);
        });
      });
    },
  });

  let searchContent = `
  <div class="relative w-full">
    <div class="absolute inset-y-0 right-4 flex items-center pl-3 pointer-events-none">
        <svg aria-hidden="true" class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
    </div>
    <div id="clear-search" 
    class="hidden items-center cursor-pointer absolute inset-y-0 right-12">
        <svg
        aria-hidden="true"
        class="w-4 h-4"
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
    </div>
    <input type="text" id="contact-search" 
    class="bg-white border border-gray-300 text-4 text-gray-900 text-sm rounded-lg
    focus:ring-blue-500 focus:border-blue-500 placeholder-[#9A9A9A]
    block w-full p-4" placeholder="Search contacts..." required>
   </div>
  `;
  if (!isSearch) {
    searchBar.innerHTML = searchContent;
    searchBar.classList.remove("hidden");
    searchBar.style.maxWidth = "420px";
  }

  let searchField = document.getElementById("contact-search");
  var timeout;

  searchField.addEventListener("input", function (e) {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      let contactDetails = document.getElementById("contacts-details");
      let prevData = [...data];
      const newData = filterContacts(data, e.target.value);
      contactDetails.classList.remove("flex");
      contactDetails.classList.add("hidden");
      drawContacts(newData, true, prevData);
    }, 500);
  });
}
