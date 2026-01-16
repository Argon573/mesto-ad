// Показывает сообщение об ошибке
function showInputError(formElement, inputElement, errorMessage, settings) {
    const errorElement = formElement.querySelector(
        `#${inputElement.id}-error`
    );


    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
}

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
function checkInputValidity(formElement, inputElement, settings) {
    if (!inputElement.validity.valid) {
        // Если ошибка по паттерну, показать кастомный текст из data-error-message
        if (inputElement.validity.patternMismatch) {
            showInputError(formElement, inputElement, inputElement.dataset.errorMessage, settings);
        } else {
            // Иначе показать стандартное сообщение браузера
            showInputError(formElement, inputElement, inputElement.validationMessage, settings);
        }
    } else {
        hideInputError(formElement, inputElement, settings);
    }
}

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
