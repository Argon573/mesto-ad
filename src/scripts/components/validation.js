// Показывает сообщение об ошибке
const showInputError = (formElement, inputElement, errorMessage, config) => {
    const errorElement = formElement.querySelector(
        `#${inputElement.id}-error`
    );

    inputElement.classList.add(config.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(config.errorClass);
};

// Скрывает сообщение об ошибке
const hideInputError = (formElement, inputElement, config) => {
    const errorElement = formElement.querySelector(
        `#${inputElement.id}-error`
    );

    inputElement.classList.remove(config.inputErrorClass);
    errorElement.classList.remove(config.errorClass);
    errorElement.textContent = '';
};

// Проверяет валидность одного поля
const checkInputValidity = (formElement, inputElement, config) => {
    if (!inputElement.validity.valid) {
        showInputError(
            formElement,
            inputElement,
            inputElement.validationMessage,
            config
        );
    } else {
        hideInputError(formElement, inputElement, config);
    }
};

// Проверяет, есть ли невалидные поля
const hasInvalidInput = (inputList) => {
    return inputList.some((inputElement) => !inputElement.validity.valid);
};

// Включает / выключает кнопку сабмита
const toggleButtonState = (inputList, buttonElement, config) => {
    if (hasInvalidInput(inputList)) {
        buttonElement.classList.add(config.inactiveButtonClass);
        buttonElement.disabled = true;
    } else {
        buttonElement.classList.remove(config.inactiveButtonClass);
        buttonElement.disabled = false;
    }
};

// Навешивает обработчики на поля формы
const setEventListeners = (formElement, config) => {
    const inputList = Array.from(
        formElement.querySelectorAll(config.inputSelector)
    );
    const buttonElement = formElement.querySelector(
        config.submitButtonSelector
    );

    toggleButtonState(inputList, buttonElement, config);

    inputList.forEach((inputElement) => {
        inputElement.addEventListener('input', () => {
            checkInputValidity(formElement, inputElement, config);
            toggleButtonState(inputList, buttonElement, config);
        });
    });
};

// Включает валидацию всех форм
const enableValidation = (config) => {
    const formList = Array.from(
        document.querySelectorAll(config.formSelector)
    );

    formList.forEach((formElement) => {
        setEventListeners(formElement, config);
    });
};

// Очищает ошибки и блокирует кнопку
const clearValidation = (formElement, config) => {
    const inputList = Array.from(
        formElement.querySelectorAll(config.inputSelector)
    );
    const buttonElement = formElement.querySelector(
        config.submitButtonSelector
    );

    inputList.forEach((inputElement) => {
        hideInputError(formElement, inputElement, config);
    });

    toggleButtonState(inputList, buttonElement, config);
};

export { enableValidation, clearValidation };
