const config = {
    baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
    headers: {
        authorization: "26efdee1-0352-49fa-bd68-c48546b949b9",
        "Content-Type": "application/json",
    },
};

const getResponseData = (res) => {
    return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
    return fetch(`${config.baseUrl}//users//me`, { // Запрос к API-серверу
        headers: config.headers, // Подставляем заголовки
    }).then(getResponseData);  // Проверяем успешность выполнения запроса
};

export const getCardList = () => {
    return fetch(`${config.baseUrl}/cards`, { // Запрос к API-серверу
        headers: config.headers, // Подставляем заголовки
    }).then(getResponseData);  // Проверяем успешность выполнения запроса
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name,
      about,
    }),
  }).then(getResponseData);
};

export const setAvatar = ({ avatar }) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      avatar,
    })
  }).then(getResponseData);
}