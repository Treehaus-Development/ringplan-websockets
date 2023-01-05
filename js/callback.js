const cookiesObj = Object.fromEntries(
  document.cookie
    .split("; ")
    .map((v) => v.split(/=(.*)/s).map(decodeURIComponent))
);
const id_token =
  cookiesObj.id_token || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImVHeXkwR1Z0YXZHeFVnX3FMbUdqXzgyODNDWEoyWTdnLW1CdVFSZlNjV0EifQ.eyJleHAiOjE2NzI5MzEwOTksIm5iZiI6MTY3MjkwMjI5OSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9yaW5ncGxhbi5iMmNsb2dpbi5jb20vZGQ4Mzk3ODktMWMxMS00OGFmLWE0MTMtZWU1YThkYzNiOTE5L3YyLjAvIiwic3ViIjoiZjZkNzE1ZGMtZDRlZi00MzU0LTkxN2EtMzI4NjA5MmEzMWY0IiwiYXVkIjoiNzM2YzM3ZDMtY2ExYy00NjViLThiMzYtNWVkZDA0ZDEyOWYzIiwiaWF0IjoxNjcyOTAyMjk5LCJhdXRoX3RpbWUiOjE2NzI5MDIyOTgsImdpdmVuX25hbWUiOiJIZWxsbyIsImZhbWlseV9uYW1lIjoiU3RhcnR4bGFicyIsImV4dGVuc2lvbl9jb21wYW55IjoiU3RhcnR4bGFicyIsImVtYWlscyI6WyJoZWxsb0BzdGFydHhsYWJzLmNvbSJdLCJ0aWQiOiJkZDgzOTc4OS0xYzExLTQ4YWYtYTQxMy1lZTVhOGRjM2I5MTkiLCJhdF9oYXNoIjoiWkRrNjk1Y05mUHF3bWlOQXVremZvZyJ9.BDG1TXk1amBwiXH-LtbFaaIlpykYkXvcoJhob-3PhPC3XureR9nVAdW7AqKcLBOSdlrtEpDY4azOFgQlXnL5xRpxxqPx-gacQeJA-q6Iio9sTbAe0DnXlGEquOq_9YL0VoB9BBwrhZceAaIJWIb53K30zdFXato-Fa4Y5034dLud6fBL5L9xyg9XyNEzdLKsvby0fcweVu2vPW1XVJDwEgaME_9xNcILkbV2FJHwdeVC-QOSqjtzoRrNVv4q0mzz9-Zzi3QF9i3lcDPJTCdoXQlGizPz74P2iW8L8rHuyE8GJNhxsfzN2vHyTcjLSpSdqRJEPSK62FxCoQnPWs3jPQ'
const access_token = cookiesObj.refresh_token;
const key = "b6ae17b92f60d3110c2cDsI90!dK5!1P";
let cacheUuid = "1c637229-52ba-56e3-a91f-ca10297eede1";
let prevActiveNumber;
const userApi = getLoginUrl();
const backendApi = getBackendUrl();
let isDisabled;
let prevName;

const loginWithApi = async () => {
  const data = {
    access_token,
    id_token,
    key,
  };

  try {
    const getInstances = await fetch(`${backendApi}/system/instances`, {
      headers: {
        Authorization: data.id_token,
      },
    });

    console.log(getInstances, "getexts");

    if (getInstances.ok) {
      try {
        const extension = await getInstances.json();
        const uuid = extension[0].uuid;
        cacheUuid = uuid;
        try {
          const fetchList = await fetch(
            `${backendApi}/instances/${uuid}/bulks/extensions`,
            {
              headers: {
                Authorization: data.id_token,
              },
            }
          );

          if (fetchList.ok) {
            const list = await fetchList.json();
            return (extensionsList = [...list]);
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
};

document.addEventListener("DOMContentLoaded", () => {
  let modal = document.getElementById("select-extension");
  let editModal = document.getElementById("edit-modal");
  let closeEdit = document.getElementById("close-edit");
  let nameInput = document.getElementById("name-edit");
  let numberBtn = document.getElementById("active-number");
  let numberList = document.getElementById("number-list");
  let saveEdit = document.getElementById("save-edit");
  let callerInfo = document.getElementById("caller-info");
  let message = document.getElementById("message");
  let spinner = document.getElementById("loading-spinner");
  numberBtn.onclick = () => {
    numberList.classList.toggle("hidden");
  };

  const closeEditModal = (isError, fromApi) => {
    modal.classList.add("grid");
    modal.classList.remove("hidden");
    editModal.classList.add("hidden");
    editModal.classList.remove("grid");
    if (fromApi) {
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
    const postData = await fetch(
      `${backendApi}/instances/${cacheUuid}/bulks/extensions/${extId}`,
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

      extensionsList = [
        ...extensionsList.map((ext) => {
          if (ext._id === res._id) {
            return {
              ...ext,
              ...res,
            };
          }
          return ext;
        }),
      ];

      closeEditModal(false, true);
    } else {
      closeEditModal(true, true);
    }
    spinner.classList.add("hidden");
    spinner.classList.remove("inline");
    saveEdit.querySelector("span").innerText = "Save";
  };

  const getAvailableNumbers = async () => {
    try {
      const numbers = await fetch(
        `${backendApi}/instances/${cacheUuid}/dids/callerids`,
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

  const handleInputChange = (newName, prevName) => {
    saveEdit.disabled =
      (newName === prevName || newName.length === 0) &&
      Number(prevActiveNumber) === Number(numberBtn.children[0].innerText);
  };

  const editExtension = async (id, activeNumber, name, locationId) => {
    modal.classList.remove("grid");
    modal.classList.add("hidden");
    editModal.classList.remove("hidden");
    editModal.classList.add("grid");

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
  };

  const updateDom = () => {
    console.log(extensionsList, "extensionslist");
    modal.classList.remove("hidden");
    modal.classList.add("grid");
    let extensionsWrapper = document.getElementById("extension-list");
    let html = extensionsList
      .map((item) => {
        if (
          !!item["qr-config"] &&
          item?.["qr-config"].server &&
          item?.["qr-config"].outbound_server
        ) {
          return `
            <div class="flex justify-between items-center">
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
                  class="text-sm relative font-medium pl-10 duration-200 ease-in transition-colors
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
                data-location_id="${item.location.id}"
                class="cursor-pointer"
              >
                <img src="/images/edit.svg"/>
              </div>
            </div>     
        `;
        }
      })
      .join(" ");
    extensionsWrapper.innerHTML = html;

    const saveBtn = document.getElementById("save");
    const inputs = [].slice.call(
      document.getElementById("extension-list").querySelectorAll("input")
    );

    inputs[0].checked = true;

    inputs.forEach((input) => {
      let editBtn = input.parentNode.parentNode.querySelector(
        `#edit-ext-${input.id}`
      );
      editBtn.addEventListener("click", function () {
        prevActiveNumber = this.dataset.callerId;
        editExtension(
          input.id,
          this.dataset.callerId,
          this.dataset.name,
          this.dataset.location_id
        );
      });
    });

    saveBtn.onclick = () => {
      localStorage.setItem('fromSSO', true)
      const checkedInput = inputs.find((input) => input.checked);
      const id = checkedInput.id;
      const activeExtension = extensionsList.find((item) => item._id === id);
      window.location = `/webphone.html?user=${activeExtension.data.extension}&pass=${activeExtension.data.secret}&domain=${activeExtension["qr-config"].server}&outbound_server=${activeExtension["qr-config"].outbound_server}`;
    };
  };

  loginWithApi()
    .then((res) => {
      updateDom();
    })
    .catch((error) => {
      console.log(error, "error");
    })
    .finally(() => {
      if (isLocalhost) {
        updateDom();
      }
    });
});
