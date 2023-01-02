const loginWithApi = async () => {
  const cookiesObj = Object.fromEntries(
    document.cookie
      .split("; ")
      .map((v) => v.split(/=(.*)/s).map(decodeURIComponent))
  );

  const id_token =
    cookiesObj.id_token ||
    `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjNpUDRvM2cyZHpQOFQxcXJYWjFZQXNzN1dhY19zSmNpcldkaGRiRDBqa1EifQ.eyJleHAiOjE2NzI2NjI2NTEsIm5iZiI6MTY3MjY1OTA1MSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9kZXZyaW5ncGxhbi5iMmNsb2dpbi5jb20vZTdiZmZlNmEtN2M5ZC00ODY0LThmYmYtNmIzNmVjMjJkODExL3YyLjAvIiwic3ViIjoiNjQzZThjZmItZDBhZC00YTY1LWJjYjktYThkZTkxNzc4YTgwIiwiYXVkIjoiZGQwN2U1NTUtZTFiNi00ZTViLWJhOGItYjUyZDJhZmVkOWI4IiwiYWNyIjoiYjJjXzFhX3NpZ25pbm9ubHkiLCJpYXQiOjE2NzI2NTkwNTEsImF1dGhfdGltZSI6MTY3MjY1OTA1MCwiZ2l2ZW5fbmFtZSI6IkRlZXAiLCJmYW1pbHlfbmFtZSI6IkNoYW5kIiwiZXh0ZW5zaW9uX2NvbXBhbnkiOiJTdGFydHhsYWJzIFRlY2hub2xvZ2llcyIsImVtYWlscyI6WyJoZWxsb0BzdGFydHhsYWJzLmNvbSJdLCJ0aWQiOiJlN2JmZmU2YS03YzlkLTQ4NjQtOGZiZi02YjM2ZWMyMmQ4MTEiLCJhdF9oYXNoIjoiMUZHb1hJTXgzMUR4SHlUa1ZoaU9VQSJ9.VM2MqiZINWl6FL8dUMP3LnHehSyrbF_J4rL_48G5FBeEPgKLlGaCbJlaI4dXEJLY66FyFZe_FUQqJMYUSLJ4_Mj1DhZvM0yVburMW5uEO8LM4CeTsuUbh0VQSBxrdhdfBuh9S-_AdYt-I6Wxlf_Vvu2ofaHU0d7E6Iphjz458JuiiDy95myxCqzVDxr_uQS8_Y96_aRNUWuCHl4f25lDCS48FSBPiITEXVaAvOOymyi3P5o1bBjb4TjRiQcwRGWtTM74RiOUI8SaTvz5OU4WQvtX8XCkK7zoI2auV3vnoF5P_bJezz45PsnzmUvs6lQRtM0uM5bEdSOvEnQ9N6OfAw`;
  const access_token =
    cookiesObj.refresh_token ||
    `eyJraWQiOiJ3Q0RtM0lnTjZaT0NRYzI2di1lbFZPUUtxcU85TXAwOUcwS3lZZk02MEswIiwidmVyIjoiMS4wIiwiemlwIjoiRGVmbGF0ZSIsInNlciI6IjEuMCJ9.RbTz_VzgQaRtBr7Gfsv1HKjZ0lSB1sr3ThgidRzCKMerIvL-uKU8i1y280Y1HXEce9laehG1cOVPfHTLjXGHaw6q_nVhyzNYnB8vk8GUG8ton56rQpsDupC5rq_GONEB9cScXMJPurbmCdNbLSaznebPAeoti0iTzg_27EnDkdf82ueZm2Adn78BsNUfTNzNu696C69FqCBHsssR3kWGgKKkhOcFVwaJZXHVha5TgY1LcNpjIbSBjhG0H-Oi_-LvHZHUxazdcMrhXVIoMUJapeCbZftrXnnhcn5YDGpmGsq7O4C_TNEbxk3znK39A1kUsTZETAfhongHbPQXOf7d0w.P9mgkae-K7bR31VW.5_zOrPf8Q0Hy9p3B9z8uTdfK_nEeyqMuJzfIepHWmfhfm1i6mW_fJyO88J0vlixDGo9vGMrICAYCmd_CAyQqfJSo_3TWje6oQdL5qd8vHE5v8cLQLARDn2lZF-jO5NaMDHgSvsxoYbo6IMMX953iqUabckrQVqcurqJsybeDi4DgElGABUbWc_1NiYPqD6Zh2MvQNMVrjCuXviN0VVmT4kgFL0hy2xzJyJZCqeVJGNXMnjDwcS1llxF2eAIvovW97a3YIYWPd91NZTJtYjAUuxr-Cmo_L4zLplvgMsQ2CEM0mO_Wja07lpg_8ohUDIQaqT9u7xl9a89CEBIE5xoKArbz_JiClOiormrFGCe8Tyry8jg6jKiRxXBIA2RpUfkQQMbKKbawhkp_xkistL_RFzlxUUzyUwws-PCY4CJleVTy9mmw8NKx5xRLV9rt78Oge_mLGs0OyUVf4MatBjGbYvOpceRLXGH3C0GB36EODLTTUDyRTwOlbdekC-eph9Z4CQAd5XK5Hu1NyR-2CscuA5OM75oMaZAChELvizE_hN1nfhOUiGtNvMH6c_rn5MBrvo4LjUEiPKZYDfzmvwKuDW7oQi7hDzR8sHN1M6WS_7q1ndHzY4c8BxkYejCDpr4MhlXPbr698Ghy_IRWzSdiiD7rDv3UwN7E4TC8ZfHDsCacqAicwUha8xFmBQxkFr7nX_V1yWKfGeyv.CnBz526n92gtQOGnbtL9Uw`;
  const key = "b6ae17b92f60d3110c2cDsI90!dK5!1P";

  const data = {
    access_token,
    id_token,
    key,
  };

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
              console.log(list, "list");
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
};

document.addEventListener("DOMContentLoaded", () => {
  loginWithApi();
});
