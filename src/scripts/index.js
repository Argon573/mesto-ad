/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { createCardElement, likeCard, deleteCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from './components/validation.js';
import { getUserInfo, getCardList, setUserInfo, setAvatar, setCard, deleteCardFromServ, changeLikeCardStatus } from "./components/api.js";

// Валидация
const validationConfig = {
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible'
};

enableValidation(validationConfig);


// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");


const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoCloseButton = infoModalWindow.querySelector(".popup__close");
const infoDefinitionList = infoModalWindow.querySelector(".popup__info");
const infoUserList = infoModalWindow.querySelector(".popup__list");

const infoDefinitionTemplate = document.getElementById("popup-info-definition-template").content.querySelector(".popup__info-item");
const infoUserPreviewTemplate = document.getElementById("popup-info-user-preview-template").content.querySelector(".popup__list-item");

const logoButton = document.querySelector(".header__logo");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const renderLoading = (button, isLoading, defaultText, loadingText) => {
  button.textContent = isLoading ? loadingText : defaultText;
};


const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Сохранить", "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
      .then((userData) => {
        profileTitle.textContent = userData.name;
        profileDescription.textContent = userData.about;
        closeModalWindow(profileFormModalWindow);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        renderLoading(submitButton, false, "Сохранить", "Сохранение...");
      });
};


const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Сохранить", "Сохранение...");

  setAvatar({ avatar: avatarInput.value })
      .then((userData) => {
        profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
        closeModalWindow(avatarFormModalWindow);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        renderLoading(submitButton, false, "Сохранить", "Сохранение...");
      });
};


const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Создать", "Создание...");

  setCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
      .then((cardData) => {
        const cardElement = createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (btn, counter) =>
              handleLikeChange(btn, counter, cardData, currentUserId),
          onDeleteCard: (el) => handleDeleteCard(el, cardData),
        });
        placesWrap.prepend(cardElement);
        closeModalWindow(cardFormModalWindow);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        renderLoading(submitButton, false, "Создать", "Создание...");
      });
};


const handleDeleteCard = (cardElement, cardData) => {
  deleteCardFromServ(cardData._id)
      .then(() => {
        cardElement.remove();
      })
      .catch((err) => {
        console.error(err);
      })
}

const handleLikeChange = (likeButton, likeCountElement, cardData, currentUserId) => {
  // Проверяем, лайкнута ли карточка сейчас
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardData._id, isLiked)
      .then((updatedCard) => {
        // Проверяем, лайкнул ли текущий пользователь
        const isLikedNow = updatedCard.likes.some(user => user._id === currentUserId);

        // Проставляем класс кнопки
        likeButton.classList.toggle("card__like-button_is-active", isLikedNow);

        // Обновляем счетчик лайков
        likeCountElement.textContent = updatedCard.likes.length;
      })
      .catch(err => console.error(err));
};



// Обработчик клика по логотипу для открытия статистики
const handleInfoModalOpen = () => {
  infoDefinitionList.innerHTML = "";
  infoUserList.innerHTML = "";

  getCardList()
      .then((cards) => {
        // Считаем статистику
        const usersMap = new Map();
        let totalLikes = 0;

        cards.forEach((card) => {
          if (!usersMap.has(card.owner._id)) {
            usersMap.set(card.owner._id, {
              name: card.owner.name,
              totalLikesByUser: 0,
            });
          }
          const userData = usersMap.get(card.owner._id);
          userData.totalLikesByUser += card.likes.length;
          totalLikes += card.likes.length;
        });

        const totalUsers = usersMap.size;

        // Чемпион лайков
        let championUser = null;
        let maxLikes = 0;
        usersMap.forEach((user) => {
          if (user.totalLikesByUser > maxLikes) {
            maxLikes = user.totalLikesByUser;
            championUser = user;
          }
        });

        // Функция добавления строки статистики
        const addStatItem = (term, description) => {
          const statElement = infoDefinitionTemplate.cloneNode(true);
          statElement.querySelector(".popup__info-term").textContent = term;
          statElement.querySelector(".popup__info-description").textContent = description;
          infoDefinitionList.appendChild(statElement);
        };

        addStatItem("Всего пользователей:", totalUsers);
        addStatItem("Всего лайков:", totalLikes);
        addStatItem("Максимально лайков от одного:", maxLikes);
        addStatItem("Чемпион лайков:", championUser ? championUser.name : "—");

        // Топ-3 популярных карточек по лайкам
        const topCards = [...cards].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3);

        topCards.forEach((card) => {
          const userPreviewElement = infoUserPreviewTemplate.cloneNode(true);
          userPreviewElement.textContent = card.name;
          infoUserList.appendChild(userPreviewElement);
        });

        openModalWindow(infoModalWindow);
      })
      .catch((err) => {
        console.error(err);
      });
};

// Закрытие статистики по кнопке
infoCloseButton.addEventListener("click", () => closeModalWindow(infoModalWindow));

// Открытие по клику на логотип
logoButton.addEventListener("click", handleInfoModalOpen);




// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
    profileTitleInput.value = profileTitle.textContent;
    profileDescriptionInput.value = profileDescription.textContent;

    clearValidation(profileForm, validationConfig);
    openModalWindow(profileFormModalWindow);
});


profileAvatar.addEventListener("click", () => {
    avatarForm.reset();

    clearValidation(avatarForm, validationConfig);
    openModalWindow(avatarFormModalWindow);
});


openCardFormButton.addEventListener("click", () => {
    cardForm.reset();

    clearValidation(cardForm, validationConfig);
    openModalWindow(cardFormModalWindow);
});


//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});



Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
      let currentUserId = userData._id;
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

      cards.forEach((card) => {
        const cardElement = createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (btn, counter) =>
              handleLikeChange(btn, counter, card, currentUserId), // передаем ID текущего пользователя
          onDeleteCard: (el) => handleDeleteCard(el, card),
        });

        // Скрываем кнопку удаления для чужих карточек
        if (card.owner._id !== currentUserId) {
          const deleteButton = cardElement.querySelector(
              ".card__control-button_type_delete"
          );
          deleteButton.remove();
        }

        // Отображаем, если текущий пользователь уже лайкнул карточку
        if (card.likes.some((user) => user._id === currentUserId)) {
          const likeButton = cardElement.querySelector(".card__like-button");
          likeButton.classList.add("card__like-button_is-active");
        }

        // Счетчик лайков
        const likeCountElement = cardElement.querySelector(".card__like-count");
        likeCountElement.textContent = card.likes.length;

        placesWrap.prepend(cardElement);
      });
    })
    .catch((err) => {
      console.error(err);
    });

