export default (xmlData) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlData, 'text/xml');

  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(error);
  }
  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const pubDateStr = item.querySelector('pubDate').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = Date.parse(pubDateStr);
    return {
      title, description, pubDate, link,
    };
  });

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const pubDateStr = doc.querySelector('pubDate').textContent;
  const pubDate = Date.parse(pubDateStr);
  const feed = {
    title, description, pubDate,
  };

  return { feed, posts };
};
