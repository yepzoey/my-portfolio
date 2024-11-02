console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

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
