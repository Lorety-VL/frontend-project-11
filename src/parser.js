import { uniqueId } from 'lodash';

export default (xmlData, url) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlData, 'text/xml');

  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(error);
  }
  const id = uniqueId();
  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const postId = uniqueId();
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const pubDateStr = item.querySelector('pubDate').textContent;
    const link = item.querySelector('link');
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
    title, description, pubDate, id, url,
  };

  return { feed, posts };
};
