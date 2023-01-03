const cookiesObj = Object.fromEntries(
  document.cookie
    .split("; ")
    .map((v) => v.split(/=(.*)/s).map(decodeURIComponent))
);
const id_token = cookiesObj.id_token;
const access_token = cookiesObj.refresh_token;
const key = "b6ae17b92f60d3110c2cDsI90!dK5!1P";
let cacheUuid = "1c637229-52ba-56e3-a91f-ca10297eede1";
let prevActiveNumber;
const userApi = getLoginUrl();
const backendApi = getBackendUrl();

const loginWithApi = async () => {
  const data = {
    access_token,
    id_token,
    key,
  };

  try {
    const response = await fetch(`${userApi}/api/user/store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
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
    }
  } catch (error) {
    console.log(error.message, "error");
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
  numberBtn.onclick = () => {
    numberList.classList.toggle("hidden");
  };

  closeEdit.onclick = () => {
    modal.classList.add("grid");
    modal.classList.remove("hidden");
    editModal.classList.add("hidden");
    editModal.classList.remove("grid");
  };

  const getAvailableNumbers = async () => {
    try {
      const numbers = await fetch(
        `${backendApi}/instances/${cacheUuid}/bulks/dids/callerids`,
        {
          method: "POST",
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
    saveEdit.disabled = Number(number) === Number(prevActiveNumber);
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

  const editExtension = async (id, activeNumber, name) => {
    modal.classList.remove("grid");
    modal.classList.add("hidden");
    editModal.classList.remove("hidden");
    editModal.classList.add("grid");

    await getAvailableNumbers();
    nameInput.placeholder = name;
    numberBtn.children[0].innerText = activeNumber;

    setSelectHtml(activeNumber);

    console.log(numberList, "numberList");
  };

  loginWithApi()
    .then((res) => {
      console.log(res, "res");
    })
    .catch((error) => {
      console.log(error, "error");
    })
    .finally(() => {
      console.log(extensionsList);

      modal.classList.remove("hidden");
      modal.classList.add("grid");
      let extensionsWrapper = document.getElementById("extension-list");
      let html = extensionsList
        .map((item) => {
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
                data-caller-id="${item.location?.callerid}"
                data-name="${item.data.name}"
                class="cursor-pointer"
              >
                <img src="/images/edit.svg"/>
              </div>
            </div>     
        `;
        })
        .join(" ");
      extensionsWrapper.innerHTML = html;

      const saveBtn = document.getElementById("save");
      const inputs = [].slice.call(
        document.getElementById("extension-list").querySelectorAll("input")
      );

      inputs.forEach((input) => {
        let editBtn = input.parentNode.parentNode.querySelector(
          `#edit-ext-${input.id}`
        );
        editBtn.addEventListener("click", function () {
          prevActiveNumber = this.dataset.callerId;
          editExtension(input.id, this.dataset.callerId, this.dataset.name);
        });
        input.addEventListener("change", function () {
          saveBtn.disabled = false;
        });
      });

      saveBtn.onclick = () => {
        const checkedInput = inputs.find((input) => input.checked);
        const id = checkedInput.id;
        const activeExtension = extensionsList.find((item) => item._id === id);
        window.location = `/webphone.html?user=${activeExtension.data.extension}&pass=${activeExtension.data.secret}`;
      };
    });
});
