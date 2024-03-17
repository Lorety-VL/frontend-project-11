import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import parseHtml from './parser.js';

const routes = {
  pathWithProxy: (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
};

yup.setLocale({
  mixed: {
    notOneOf: 'already_downloaded',
  },
  string: {
    url: 'invalid_url',
  },
});

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        already_downloaded: 'RSS уже существует',
        invalid_url: 'Ссылка должна быть валидным URL',
        invalid_resource: 'Ресурс не содержит валидный RSS',
        network_error: 'Ошибка сети',
        success: 'RSS успешно загружен',
        feeds_title: 'Фиды',
        posts_title: 'Посты',
        watch: 'Просмотр',
      },
    },
  },
});

const validate = (state, inputVal) => {
  const schema = yup.string().required().url().notOneOf(state.usedRss);
  return schema.validate(inputVal);
};

const buildFeed = (feeds) => feeds
  .map((feed) => {
    const li = document.createElement('li');
    li.classList = 'list-group-item border-0 border-end-0';

    const h3 = document.createElement('h3');
    h3.classList = 'h6 m-0';
    h3.textContent = feed.title;

    const p = document.createElement('p');
    p.classList = 'm-0 small text-black-50';
    p.textContent = feed.description;

    li.append(h3, p);
    return li;
  });

const buildPosts = (wathedState) => wathedState.posts
  .map((post) => {
    const visited = wathedState.uiState.visitedPostsId[post.id] === true;

    const li = document.createElement('li');
    li.classList = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

    const a = document.createElement('a');
    a.classList = visited ? 'fw-normal link-secondary' : 'fw-bold';
    a.href = post.link;
    a.dataset.id = post.id;
    a.bsTarget = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = post.title;

    const button = document.createElement('button');
    button.classList = 'btn btn-outline-primary btn-sm';
    button.type = 'button';
    button.classList = 'btn btn-outline-primary btn-sm';
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18nextInstance.t('watch');

    li.append(a, button);
    return li;
  });

const renderData = (wathedState, container, title) => {
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.classList = 'list-group border-0 rounded-0';

  const card = document.createElement('div');
  card.classList = 'card border-0';

  const cardBody = document.createElement('div');
  cardBody.classList = 'card-body';

  const cardTitle = document.createElement('h2');
  cardTitle.classList = 'card-title h4';
  cardTitle.textContent = i18nextInstance.t(`${title}_title`);

  cardBody.append(cardTitle);

  const data = title === 'feeds' ? buildFeed(wathedState.feeds) : buildPosts(wathedState);
  ul.append(...data);
  card.append(cardBody, ul);
  container.append(card);
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
  container.textContent = i18nextInstance.t(state.message);
};

const renderInput = (state, input, btn) => {
  if (state.formState === 'valid') {
    btn.disabled = false;
    input.classList.remove('is-invalid');
    input.value = '';
    input.focus();
  }
  if (state.formState === 'invalid') {
    input.classList.add('is-invalid');
    btn.disabled = false;
  }
  if (state.formState === 'loading') {
    btn.disabled = true;
  }
};

const isUpdated = (updateTime, newUpdateTime) => updateTime < newUpdateTime;

const getUpdatedPosts = (updateTime, updatedPosts) => updatedPosts
  .filter((post) => isUpdated(updateTime, post.pubDate));

const updateFeeds = (wathedState) => {
  const promises = wathedState.feeds
    .map((feed, id) => axios.get(routes.pathWithProxy(feed.url))
      .then((response) => {
        const { feed: newFeed, posts: newPosts } = parseHtml(response.data.contents, feed.url);
        if (!isUpdated(feed.pubDate, newFeed.pubDate)) return;
        wathedState.posts.unshift(...getUpdatedPosts(feed.pubDate, newPosts));
        onChange.target(wathedState).feeds[id].pubDate = newFeed.pubDate;
      })
      .catch(() => null));
  Promise.all(promises).then(() => setTimeout(updateFeeds, 5000, wathedState));
};

const form = document.querySelector('form');
const input = form.elements.url;
const submitButton = document.querySelector('[type="submit"]');
const messageContainer = document.querySelector('.feedback');
const feedContainer = document.querySelector('.feeds');
const postsContainer = document.querySelector('.posts');
const modalTitle = document.querySelector('.modal-title');
const modalBody = document.querySelector('.modal-body');
const modallink = document.querySelector('.modal-footer > a');

const rendermodal = (wathedState) => {
  const selectedPostId = wathedState.uiState.modalPostId;
  const selectedPost = wathedState.posts.find((post) => post.id === selectedPostId);

  modalBody.textContent = selectedPost.description;
  modalTitle.textContent = selectedPost.title;
  modallink.href = selectedPost.link;
};

export default () => {
  const state = {
    formState: 'filling',
    message: '',
    usedRss: [],
    feeds: [],
    posts: [],
    uiState: {
      visitedPostsId: {},
      modalPostId: null,
    },
    startChecking: false,
  };

  const wathedState = onChange(state, (path) => {
    if (path === 'formState') {
      renderInput(state, input, submitButton);
    }
    if (path === 'message') {
      renderMessage(state, messageContainer);
    }
    if (path === 'feeds') {
      renderData(state, feedContainer, 'feeds');
    }
    if (path === 'posts' || path.startsWith('uiState.visitedPostsId')) {
      renderData(wathedState, postsContainer, 'posts');
    }
    if (path === 'startChecking') {
      setTimeout(updateFeeds, 5000, wathedState);
    }
    if (path === 'uiState.modalPostId') {
      rendermodal(wathedState);
    }
  });

  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (e.target.tagName === 'A') {
      wathedState.uiState.visitedPostsId[id] = true;
    }
    if (e.target.tagName === 'BUTTON') {
      wathedState.uiState.visitedPostsId[id] = true;
      wathedState.uiState.modalPostId = id;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    wathedState.formState = 'loading';
    validate(state, input.value)
      .then((res) => {
        axios.get(routes.pathWithProxy(res))
          .then((response) => {
            state.usedRss.push(input.value);
            try {
              const { feed, posts } = parseHtml(response.data.contents, input.value);
              wathedState.feeds.unshift(feed);
              wathedState.posts.unshift(...posts);
              wathedState.formState = 'valid';
              wathedState.message = 'success';
              wathedState.startChecking = true;
            } catch (err) {
              wathedState.formState = 'invalid';
              wathedState.message = 'invalid_resource';
            }
            wathedState.disableButton = false;
          }).catch(() => {
            wathedState.formState = 'invalid';
            wathedState.message = 'network_error';
            wathedState.disableButton = false;
          });
      }).catch((err) => {
        wathedState.formState = 'invalid';
        wathedState.message = err.message;
        wathedState.disableButton = false;
      });
  });
};
