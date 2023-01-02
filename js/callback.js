const cookiesObj = Object.fromEntries(
  document.cookie
    .split("; ")
    .map((v) => v.split(/=(.*)/s).map(decodeURIComponent))
);
const id_token =
  cookiesObj.id_token ||
  `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjNpUDRvM2cyZHpQOFQxcXJYWjFZQXNzN1dhY19zSmNpcldkaGRiRDBqa1EifQ.eyJleHAiOjE2NzI2OTEwNDcsIm5iZiI6MTY3MjY4NzQ0NywidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9kZXZyaW5ncGxhbi5iMmNsb2dpbi5jb20vZTdiZmZlNmEtN2M5ZC00ODY0LThmYmYtNmIzNmVjMjJkODExL3YyLjAvIiwic3ViIjoiNjQzZThjZmItZDBhZC00YTY1LWJjYjktYThkZTkxNzc4YTgwIiwiYXVkIjoiZGQwN2U1NTUtZTFiNi00ZTViLWJhOGItYjUyZDJhZmVkOWI4IiwiYWNyIjoiYjJjXzFhX3NpZ25pbm9ubHkiLCJpYXQiOjE2NzI2ODc0NDcsImF1dGhfdGltZSI6MTY3MjY4NzQ0NiwiZ2l2ZW5fbmFtZSI6IkRlZXAiLCJmYW1pbHlfbmFtZSI6IkNoYW5kIiwiZXh0ZW5zaW9uX2NvbXBhbnkiOiJTdGFydHhsYWJzIFRlY2hub2xvZ2llcyIsImVtYWlscyI6WyJoZWxsb0BzdGFydHhsYWJzLmNvbSJdLCJ0aWQiOiJlN2JmZmU2YS03YzlkLTQ4NjQtOGZiZi02YjM2ZWMyMmQ4MTEiLCJhdF9oYXNoIjoibHRFWjBXY3NaTWk1NlNuOTZZUkhTdyJ9.iwhBi5BC6NwzvOs7OOhTXwYOH_DF6WP_RydIc_ntEaQ2E2j51ZZntdc0Eqta4_tgnEZaYWPcqF3kW49gOK7-Ltu5jGIuv47QWLNRYgnGf6rzIXUYxCIK7pL43XByiTdF6SsZVGYnmjb5BBHdtHD7an8jyl3g9wgZPPGsbCBCFFPccv3dEXHoIGjw40uwEfrqcgU29cFL-0vAFT-y6TPYL6fHvX1YNO86vKFLdF8UZJvXg40-c0JpYVFhzoXKX5bAjeoBedYt6UUfWZIRiVwsX2k55u1iKUbM5F9HCW-TsTwjFEQkyP-CGXW8br8LHTV9UUV-xwDZfXsUgm85b-TfHA`;
const access_token = cookiesObj.refresh_token;
const key = "b6ae17b92f60d3110c2cDsI90!dK5!1P";
let cacheUuid = "1c637229-52ba-56e3-a91f-ca10297eede1";

const loginWithApi = async () => {
  const data = {
    access_token,
    id_token,
    key,
  };

  try {
    const response = await fetch(
      "https://b2clogin.dev.ringplan.com/api/user/store",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      try {
        const getInstances = await fetch(
          "https://ssp-backend.dev.ringplan.com/system/instances",
          {
            headers: {
              Authorization: data.id_token,
            },
          }
        );

        console.log(getInstances, "getexts");

        if (getInstances.ok) {
          try {
            const extension = await getInstances.json();
            const uuid = extension[0].uuid;
            cacheUuid = uuid;
            try {
              const fetchList = await fetch(
                `https://ssp-backend.dev.ringplan.com/instances/${uuid}/bulks/extensions`,
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

  closeEdit.onclick = () => {
    modal.classList.add("grid");
    modal.classList.remove("hidden");
    editModal.classList.add("hidden");
    editModal.classList.remove("grid");
  };

  const getAvailableNumbers = async () => {
    try {
      const numbers = await fetch(
        `https://ssp-backend.dev.ringplan.com/instances/${cacheUuid}/bulks/extensions/available-ids`,
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

  const editExtension = async (id, activeNumber, name) => {
    modal.classList.remove("grid");
    modal.classList.add("hidden");
    editModal.classList.remove("hidden");
    editModal.classList.add("grid");

    await getAvailableNumbers();
    console.log(availableNumbers, "available");
    nameInput.placeholder = name;
    numberBtn.children[0].innerText = activeNumber;
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
