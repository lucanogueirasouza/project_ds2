document.querySelector('.btn').addEventListener('click', function(e) {
  e.preventDefault();
  const target = document.querySelector('#sobre');
  target.scrollIntoView({ behavior: 'smooth' });
});
