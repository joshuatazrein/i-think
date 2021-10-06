$.get(
  'bookmarks.html',
  function(message, status, xhr) {
    $('#bookmarks').html(xhr.responseText);
    setLinks('#bookmarks')
    $('#bookmarks').append('<p class="buffer"></p>')
  }
);

$.get(
  'bibliography.html',
  function(message, status, xhr) {
    $('#bibliography').html(xhr.responseText);
    setLinks('#bibliography')
  }
);

function setLinks(selector) {
  if (!selector) selector = ''
  $(selector + ' .link').on('mouseup', function (ev) {
    let el = $(ev.target)
    while (el[0].tagName != 'SPAN') {
      el = el.parent()
    }
    let link
    if (el.attr('href')) {
      link = el.attr('href')
    } else {
      link = el.text()
    }
    $.get(
      'z/' + link + '.html',
      function (t, s, xhr) {
        const splitlist = xhr.responseText.split('<hr>')
        $('#zettels').html(splitlist[0]);
        if (splitlist[1]) {
          $('#backlinks').html(splitlist[1]);
        }
        setLinks('#container')
        $('#zettels').scrollTop(0)
        const child = $($('#bookmarks').find('.link').toArray()
          .find(x => { return $(x).text().includes(link) }))
        $('#bookmarks').scrollTop(
          $('#bookmarks').scrollTop() + (child.position().top) - window.innerHeight / 2)
        $('html, body').animate({scrollTop: $('#header').height() }, 500)
        $('.currentlink').removeClass('currentlink')
        child.addClass('currentlink')
      }
    );
  });
  $(selector + ' .b-link').on('mouseup', function (ev) {
    let link
    let el = $(ev.target)
    while (el[0].tagName != 'SPAN') {
      el = el.parent()
    }
    if (el.attr('href')) {
      link = el.attr('href')
    } else {
      link = el.text()
    }
    console.log(link, el.text());
    $.get(
      'b/' + link + '.html',
      function (t, s, xhr) {
        const splitlist = xhr.responseText.split('<hr>')
        $('#zettels').html(splitlist[0]);
        if (splitlist[1]) {
          $('#backlinks').html(splitlist[1]);
        }
        setLinks('#container')
        $('#zettels').scrollTop(0)
        const child = $($('#bibliography').find('.b-link').toArray()
          .find(x => { return $(x).text().includes(link) }))
        $('#bibliography').scrollTop(
          $('#bibliography').scrollTop() + (child.position().top) - window.innerHeight / 2)
        $('html, body').animate({scrollTop: $('#header').height() }, 500)
        $('.currentlink').removeClass('currentlink')
        child.addClass('currentlink')
      }
    );
  });
}