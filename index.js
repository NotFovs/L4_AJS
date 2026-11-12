// index.js
const https = require('https');
const BASE = 'https://jsonplaceholder.typicode.com';


function getJson(path, callback) {
  https.get(`${BASE}${path}`, (res) => {
    let raw = '';
    res.on('data', (chunk) => (raw += chunk));
    res.on('end', () => {
      try {
        callback(null, JSON.parse(raw));
      } catch (e) {
        callback(e);
      }
    });
  }).on('error', callback);
}

function sortPostsByTitleLengthDesc(posts) {
  return [...posts].sort((a, b) => b.title.length - a.title.length);
}

function sortCommentsByName(comments) {
  return [...comments].sort((a, b) => a.name.localeCompare(b.name));
}

function getPostsCb(callback) {
  getJson('/posts', (err, posts) => {
    if (err) return callback(err);
    callback(null, sortPostsByTitleLengthDesc(posts));
  });
}

function getCommentsCb(callback) {
  getJson('/comments', (err, comments) => {
    if (err) return callback(err);
    callback(null, sortCommentsByName(comments));
  });
}

/* ---------- 2. Промисы ---------- */
function fetchJson(path) {
  return fetch(`${BASE}${path}`).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

function pickUserFields({ id, name, username, email, phone }) {
  return { id, name, username, email, phone };
}

function getUsersPromise() {
  return fetchJson('/users').then((users) => users.map(pickUserFields));
}

function getUncompletedTodosPromise() {
  return fetchJson('/todos').then((todos) => todos.filter((t) => !t.completed));
}


async function getPostsAsync() {
  return sortPostsByTitleLengthDesc(await fetchJson('/posts'));
}

async function getCommentsAsync() {
  return sortCommentsByName(await fetchJson('/comments'));
}

async function getUsersAsync() {
  return (await fetchJson('/users')).map(pickUserFields);
}

async function getUncompletedTodosAsync() {
  return (await fetchJson('/todos')).filter((t) => !t.completed);
}


getPostsCb((err, data) => console.log('posts cb', err || data.slice(0, 3)));
getCommentsCb((err, data) => console.log('comments cb', err || data.slice(0, 3)));
getUsersPromise().then((d) => console.log('users promise', d.slice(0, 2))).catch(console.error);
getUncompletedTodosPromise().then((d) => console.log('todos promise', d.length)).catch(console.error);

(async () => {
  try {
    console.log('posts async', (await getPostsAsync()).slice(0, 3));
    console.log('comments async', (await getCommentsAsync()).slice(0, 3));
    console.log('users async', (await getUsersAsync()).slice(0, 2));
    console.log('todos async', (await getUncompletedTodosAsync()).length);
  } catch (e) {
    console.error(e);
  }
})();
