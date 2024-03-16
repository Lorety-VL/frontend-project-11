import { uniqueId } from 'lodash';

export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response, 'text/xml');

  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(error);
  }
  const id = uniqueId();
  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const postId = uniqueId();
    const title = item.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const pubDateStr = doc.querySelector('pubDate').textContent;
    const link = doc.querySelector('link');
    const pubDate = Date.parse(pubDateStr);
    return {
      id: postId, feedId: id, title, description, pubDate, link,
    };
  });

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const pubDateStr = doc.querySelector('pubDate').textContent;
  const pubDate = Date.parse(pubDateStr);
  const feed = {
    title, description, pubDate, id,
  };

  return { feed, posts };
};
