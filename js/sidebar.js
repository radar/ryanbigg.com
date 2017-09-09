function openSidebar() {
  $('body')
    .removeClass('sidebar-closed')
    .addClass('sidebar-opened')
}

function closeSidebar() {
  $('body')
    .removeClass('sidebar-opened')
    .addClass('sidebar-closed')
}

function setDefaultSidebarState() {
  $('body').removeClass('sidebar-opened sidebar-closed')
  $('body').addClass(window.innerWidth > 768 ? 'sidebar-opened' : 'sidebar-closed')
}

$(document).ready(function () {
  setDefaultSidebarState();

  var lastWindowWidth = window.innerWidth;

  $(window).resize(_.throttle(function () {
    if (lastWindowWidth !== window.innerWidth) {
      lastWindowWidth = window.innerWidth
      setDefaultSidebarState()
    }
  }, 100))

  $('.sidebar-toggle').click(function () {
    var bodyClass = $('body').attr('class') || ''

    if (bodyClass.includes('sidebar-closed')) {
      openSidebar();
    } else {
      closeSidebar();
    }
  })
});
