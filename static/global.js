console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
      </select>
  </label>
`
);

function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  localStorage.setItem('colorScheme', scheme);
}

let select = document.querySelector('#theme-switcher');

if (localStorage.getItem('colorScheme')) {
  let savedScheme = localStorage.getItem('colorScheme');
  select.value = savedScheme;
  setColorScheme(savedScheme);
} else {
  setColorScheme('light dark');
}

select.addEventListener('input', (event) => {
  let scheme = event.target.value;
  setColorScheme(scheme);
});

let form = document.getElementById('contactForm');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);

  let mailtoUrl = form.action + '?';

  for (let [name, value] of data) {
    mailtoUrl += `${name}=${encodeURIComponent(value)}&`;
  }

  mailtoUrl = mailtoUrl.slice(0, -1);
  location.href = mailtoUrl;
});
