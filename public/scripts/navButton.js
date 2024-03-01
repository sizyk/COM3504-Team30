const navButton = document.getElementById('nav-button');
const navLinks = document.getElementById('nav-links');
const navShadow = document.getElementById('nav-shadow');

if (navLinks !== null && navButton !== null) {
  navButton.onclick = () => {
    navLinks.classList.toggle('active');

    if (navShadow !== null) {
      navShadow.classList.toggle('active');
    }
  };
}
