import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import parseHtml from './parser.js';
import {
  renderInput, renderMessage, renderData, rendermodal,
} from './renders.js';

const routes = {
  pathWithProxy: (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
};

yup.setLocale({
  mixed: {
    notOneOf: 'message.already_downloaded',
    required: 'message.empty',
  },
  string: {
    url: 'message.invalid_url',
  },
});

const validate = (state, inputVal) => {
  const schema = yup.string().required().url().notOneOf(state.usedRss);
  return schema.validate(inputVal);
};

const setIdToPosts = (posts, feedId) => posts.map((post) => {
  const postId = uniqueId();
  return { id: postId, feedId, ...post };
});

const setIdToFeedData = ({ feed, posts }) => {
  const id = uniqueId();
  const newFeed = { id, ...feed };
  const postsWithId = setIdToPosts(posts, id);
  return { feed: newFeed, posts: postsWithId };
};

const isUpdated = (updateTime, newUpdateTime) => updateTime < newUpdateTime;

const getUpdatedPosts = (updateTime, updatedPosts) => {
  const newPosts = updatedPosts.filter((post) => isUpdated(updateTime, post.pubDate));
  return setIdToPosts(newPosts);
};

const updateFeeds = (wathedState) => {
  const promises = wathedState.feeds
    .map((feed, id) => axios.get(routes.pathWithProxy(feed.url))
      .then((response) => {
        const { feed: newFeed, posts: newPosts } = parseHtml(response.data.contents);
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

export default () => {
  const state = {
    formState: 'filling',
    message: '',
    usedRss: [],
    feeds: [],
    posts: [],
    uiState: {
      visitedPostsId: new Set(),
      modalPostId: null,
    },
    startChecking: false,
  };

  const wathedState = onChange(state, (path) => {
    switch (path) {
      case 'formState':
        renderInput(state, input, submitButton);
        break;

      case 'message':
        renderMessage(state, messageContainer);
        break;

      case 'feeds':
        renderData(state, feedContainer, 'feeds');
        break;

      case 'posts':
      case 'uiState.visitedPostsId':
        renderData(wathedState, postsContainer, 'posts');
        break;

      case 'startChecking':
        setTimeout(updateFeeds, 5000, wathedState);
        break;

      case 'uiState.modalPostId':
        rendermodal(wathedState, modalBody, modalTitle, modallink);
        break;

      default:
        throw new Error(`Unknown path: ${path}`);
    }
  });

  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (e.target.tagName === 'A') {
      wathedState.uiState.visitedPostsId.add(id);
    }
    if (e.target.tagName === 'BUTTON') {
      state.uiState.visitedPostsId.add(id);
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
              const htmlData = parseHtml(response.data.contents);
              const { feed, posts } = setIdToFeedData(htmlData);
              feed.url = input.value;
              wathedState.feeds.unshift(feed);
              wathedState.posts.unshift(...posts);
              wathedState.formState = 'valid';
              wathedState.message = 'message.success';
              wathedState.startChecking = true;
            } catch (err) {
              wathedState.formState = 'invalid';
              wathedState.message = 'message.invalid_resource';
            }
          }).catch(() => {
            wathedState.formState = 'invalid';
            wathedState.message = 'message.network_error';
          });
      }).catch((err) => {
        wathedState.formState = 'invalid';
        wathedState.message = err.message;
      });
  });
};
