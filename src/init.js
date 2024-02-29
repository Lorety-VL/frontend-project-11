import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';

yup.setLocale({
  mixed: {
    notOneOf: 'already_downloaded',
  },
  string: {
    url: 'invalid_url',
  },
});

i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        already_downloaded: 'RSS уже существует',
        invalid_url: 'Ссылка должна быть валидным URL',
        success: 'RSS успешно загружен',
      },
    },
  },
});

const validate = (state, inputVal) => {
  const schema = yup.string().required().url().notOneOf(state.usedRss);
  return schema.validate(inputVal);
};

const renderMessage = (state, container) => {
  if (state.formState === 'valid') {
    container.classList.remove('text-danger');
    container.classList.add('text-success');
  }
  if (state.formState === 'invalid') {
    container.classList.remove('text-success');
    container.classList.add('text-danger');
  }
  container.textContent = i18next.t(state.message);
};

const renderInput = (state, input) => {
  if (state.formState === 'valid') {
    input.classList.remove('is-invalid');
    input.value = '';
    input.focus();
  }
  if (state.formState === 'invalid') {
    input.classList.add('is-invalid');
  }
};

export default () => {
  const state = {
    formState: 'filling',
    message: '',
    usedRss: [],
  };

  const form = document.querySelector('form');
  const input = form.elements.url;
  const messageContainer = document.querySelector('.feedback');

  const wathedState = onChange(state, (path) => {
    if (path === 'formState') {
      renderInput(state, input);
    }
    if (path === 'message') {
      renderMessage(state, messageContainer);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validate(state, input.value)
      .then(() => {
        state.usedRss.push(input.value);
        wathedState.formState = 'valid';
        wathedState.message = 'success';
      }).catch((err) => {
        wathedState.formState = 'invalid';
        wathedState.message = err.message;
        return false;
      });
  });
};
