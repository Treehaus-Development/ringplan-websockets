function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name +
    "=" +
    (value || "") +
    expires +
    +`;domain=${location.hostname};path=/`;
}

const access_token = cookiesObj.refresh_token;
const key = "b6ae17b92f60d3110c2cDsI90!dK5!1P";

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
        localStorage.setItem("uuid", uuid);
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
            return (extensionsList = [...list].filter((item) => {
              return !!item["qr-config"] && !!item["qr-config"].server;
            }));
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

  const updateDom = () => {
    triggerModalUpdates(modal, extensionsList);
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
