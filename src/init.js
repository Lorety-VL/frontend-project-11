import * as yup from 'yup';
import onChange from 'on-change';

const validate = (state) => {
  const schema = yup.string().required().url().notOneOf(state.usedRss);
  return schema.isValid(state.inputValue);
};

export default () => {
  const state = {
    formState: 'filling',
    inputValue: '',
    usedRss: [],
  };

  const form = document.querySelector('form');
  const input = form.elements.url;
  const schema = yup.string().required().url().notOneOf(state.usedRss);

  const wathedState = onChange(state, (_path, value) => {
    
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.inputValue = input.value;
    validate(state)
      .then((result) => {
        if (result) state.usedRss.push(input.value);
      });
  });
};
