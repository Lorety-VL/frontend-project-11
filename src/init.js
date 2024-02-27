import * as yup from 'yup';
import onChange from 'on-change';

const validate = (state, inputVal) => {
  const schema = yup.string().required().url('Ссылка должна быть валидным URL').notOneOf(state.usedRss, 'RSS уже существует');
  return schema.validate(inputVal);
};

const renderMessage = (state, container) => {
  container.textContent = state.message;
};

const renderInput = (state, input) => {
  if (state.formState === 'valid') {
    input.classList.remove('is-invalid');
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
        wathedState.message = '';
      }).catch((err) => {
        wathedState.message = err.message;
        wathedState.formState = 'invalid';
      });
  });
};
