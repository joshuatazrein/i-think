var index = {};
var found = [];
var searches = [];

function updateLinks() {
  $.get(
    'bookmarks.html',
    function(message, status, xhr) {
      $('#bookmarks').html(xhr.responseText);
      setLinks('#bookmarks');
      $('#bookmarks').append('<p class="buffer"></p>');
      updateBacklinks();
    }
  );
  
  $.get(
    'bibliography.html',
    function(message, status, xhr) {
      $('#bibliography').html(xhr.responseText);
      setLinks('#bibliography')
    }
  );
}

function followLink(link, text, type) {
  let frame
  let linkclass
  if (type == 'link') {
    frame = '#bookmarks'
    linkclass = 'link'
  } else if (type == 'b-link') {
    frame = '#bibliography'
    linkclass = 'b-link'
  }
  $('#zettels').html('<h4>' + link + '</h4>' + text);
  if (index[link]) {
    $('#backlinks').html(
      // list of backlinks
      '<p class="link">' + 
      index[link].join('</p><p class="link">') + '</p>');
  }
  setLinks('#zettels')
  setLinks('#backlinks')
  $('#zettels').scrollTop(0)
  const child = $($(frame).find('.' + linkclass).toArray()
    .find(x => { return $(x).text().includes(link) }))
  $(frame).scrollTop(
    $(frame).scrollTop() + (child.position().top) - window.innerHeight / 2)
  $('html, body').animate({scrollTop: $('#header').height() + 25}, 500)
  $('.currentlink').removeClass('currentlink')
  child.addClass('currentlink')
  const prevlink = $('#history').find('p').toArray().find(x => {
    return $(x).text() == link
  })
  if (prevlink) prevlink.remove();
  $('#history').prepend('<p class="' + linkclass + '">' + link + '</p>');
  setLinks('#history');
  setLinks('#backlinks');
}

function setLinks(selector) {
  if (!selector) selector = ''
  $(selector + ' .link').on('mouseup', function (ev) {
    let el = $(ev.target)
    while (!['SPAN', 'P'].includes(el[0].tagName)) {
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
        followLink(link, xhr.responseText, 'link')
      }
    );
  });
  $(selector + ' .b-link').on('mouseup', function (ev) {
    let link
    let el = $(ev.target)
    while (!['SPAN', 'P'].includes(el[0].tagName)) {
      el = el.parent()
    }
    if (el.attr('href')) {
      link = el.attr('href')
    } else {
      link = el.text()
    }
    $.get(
      'b/' + link + '.html',
      function (t, s, xhr) {
        followLink(link, xhr.responseText, 'b-link')
      }
    );
  });
}

function updateBacklinks() {
  // indexes backlinks
  index = {}
  searches = []
  $('#bookmarks .link').toArray().forEach(x => {
    const title = $(x).text();
    $.get('./z/' + title + '.html', 
    function (s, m, xhr) {
      // find all backlinks
      $('#test').html(xhr.responseText);
      searches.push([title, $('#test').text()])
      $('#test').find('.link').toArray().forEach(y => {
        // add link text
        const el = $(y);
        let text;
        if (el.attr('href')) { text = el.attr('href') }
        else { text = el.text() }
        // add to dict: [article], [backlinks]
        if (!index[text]) { index[text] = [title]}
        else { index[text].push(title) }
      })
      found = searches.concat()
    })
  })
}

function selectRandom() {
  const children = $('#bookmarks .link')
  const linkselect = Math.floor(Math.random() * children.length)
  console.log(linkselect, children);
  $.get(
    './z/' + $(children[linkselect]).text() + '.html',
    function (s, m, xhr) {
      followLink($(children[linkselect]).text(), xhr.responseText, 'link')
    }
  )
  console.log($(children[linkselect]).text());
}

function search(ev) {
  if (ev.key == 'Backspace') {
    $('#searchbar').val('')
    $('#results').empty()
    $('#results').hide()
    found = searches.concat()
    console.log(found);
  } else {
    $('#results').show()
    console.log(found);
    const searchtext = $('#searchbar').val().split(' ')
    console.log(searchtext);
    found = found.filter(x => {
      for (y of searchtext) {
        console.log(x[1], new RegExp(y, 'i'));
        if (!new RegExp(y, 'i').test(x[1])) { 
          console.log(x[0], 'false');
          return false }
      }
      console.log(x[0], 'true');
      return true
    })
    $('#results').empty()
    $('#results').html(
      '<p class="link">' + 
      found.map(x => { return x[0] }).join('</p><p class="link">') +
      '</p>'
    )
    setLinks('#results')
  }
}

function keyDown(ev) {
  if (ev.key == 'Escape') {
    $('#searchbar').val('')
    $('#results').empty()
    $('#results').hide()
    $('#searchbar').blur()
    found = searches.concat()
    console.log(found);
  } 
}

$('#results').hide()
updateLinks();
setTimeout(selectRandom, 100)
$('#searchbar').on('keydown', search)
$(document).on('keydown', keyDown)