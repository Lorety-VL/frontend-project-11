import i18nextInstance from './locales/index.js';

const rendermodal = (wathedState, modalBody, modalTitle, modallink) => {
  const selectedPostId = wathedState.uiState.modalPostId;
  const selectedPost = wathedState.posts.find((post) => post.id === selectedPostId);

  modalBody.textContent = selectedPost.description;
  modalTitle.textContent = selectedPost.title;
  modallink.href = selectedPost.link;
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
    const visited = wathedState.uiState.visitedPostsId.has(post.id);

    const li = document.createElement('li');
    li.classList = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

    const a = document.createElement('a');
    a.classList = visited ? 'fw-normal link-secondary' : 'fw-bold';
    a.href = post.link;
    a.dataset.id = post.id;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = post.title;

    const button = document.createElement('button');
    button.classList = 'btn btn-outline-primary btn-sm';
    button.type = 'button';
    button.classList = 'btn btn-outline-primary btn-sm';
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18nextInstance.t('ui.watch');

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
  cardTitle.textContent = i18nextInstance.t(`ui.${title}_title`);

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

export {
  renderInput,
  renderMessage,
  renderData,
  rendermodal,
};
