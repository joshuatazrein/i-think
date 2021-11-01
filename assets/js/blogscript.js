var index = {};
var found = [];
var searches = [];
var tooltiptimer;
var dirIndex = {};

function followLink(link, text) {
  let frame
  let linkclass = 'link'
  if (/^z\//.test(dirIndex[link])) {
    frame = '#bookmarks'
  } else if (/^b\//.test(dirIndex[link])) {
    frame = '#bibliography'
  }
  $('#zettels').html('<h4>' + link + '</h4>' + text);
  $('#backlinks').empty()
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
  $('#tooltip').hide(300)
  $('#tags > button').on('click', followTag)
}

function followTag(ev) {
  el = $(ev.target)
  if (!el.hasClass('selectedTag')) {
    $('#tags > button').removeClass('selectedTag')
    el.addClass('selectedTag')
    $('#zettels li').toArray().forEach(x => {
      if (!$(x).attr('tag').includes(el.attr('name'))) {
        $(x).hide(300)
      } else {
        $(x).show(300)
      }
    })
  } else {
    $('#tags > button').removeClass('selectedTag')
    $('#zettels li').show(300)
  }
}

function setLinks(selector, tooltip) {
  // sets links as clickable
  if (!selector) selector = ''
  $(selector + ' .link').on(
    'mouseup', function (ev) {
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
      dirIndex[link],
      function (t, s, xhr) {
        followLink(link, xhr.responseText, 'link')
      }
    );
  });
  if (tooltip != false) {
    $(selector + ' .link').on('mouseover', 
      function (ev) { tooltiptimer = setTimeout(toolTip, 1000, ev) })
    $(selector + ' .link').on('mouseleave', 
      function (ev) { clearTimeout(tooltiptimer) })
  }
}

function hideToolTip() {
  $('#tooltip').stop(true)
  $('#tooltip').hide(300)
  clearTimeout(tooltiptimer)
}

function toolTip(ev) {
  const el = $(ev.target)
  let title
  if (el.attr('href')) {
    title = el.attr('href')
  } else {
    title = el.text()
  }
  let location = dirIndex[title]
  $.get(location, 
    function (s, m, xhr) {
      if (!el.parents().toArray().includes($('#tooltip')[0])) {
        // move tooltip
        $('#tooltip').css('top', '')
        $('#tooltip').css('left', '')
        $('#tooltip').css('right', '')
        $('#tooltip').css('bottom', '')
        if (ev.clientY > window.innerHeight - $('#tooltip').height()) {
          $('#tooltip').css('bottom', '10px')
        } else {
          $('#tooltip').css('top', Number(ev.clientY - 30) + 'px')
        }
        if (ev.clientX > window.innerWidth - $('#tooltip').width()) {
          $('#tooltip').css('right', '10px')
        } else {
          $('#tooltip').css('left', Number(ev.clientX - 30) + 'px')
        }
      }
      $('#tooltip').html(
        '<h3>' + title + '</h3>' + 
        xhr.responseText)
      setLinks('#tooltip')
      if (!el.parents().toArray().includes($('#tooltip')[0])) {
        $('#tooltip').show(300)
      }
      $('#tooltip').scrollTop(0)
    }
  )
}

function selectRandom() {
  const children = $('#bookmarks .link')
  const linkselect = Math.floor(Math.random() * children.length)
  $.get(dirIndex[$(children[linkselect]).text()], function(s, a, xhr) {
    followLink($(children[linkselect]).text(), xhr.responseText)
    $('#zettels').animate({opacity: 1}, 1000)
  })
}

function search(ev) {
  if (ev.key == 'Backspace') {
    $('#searchbar').val('')
    $('#results').empty()
    $('#results').hide()
    found = searches.concat()
  } else {
    $('#results').show()
    const searchtext = $('#searchbar').val().split(' ')
    const titles = []
    found = found.filter(x => {
      for (y of searchtext) {
        const regexp = new RegExp(y, 'i')
        if (regexp.test(x[0])) {
          // in title, move to top
          titles.push(x)
          return false
        }
        if (!regexp.test(x[1])) { 
          return false }
      }
      return true
    })
    found = titles.concat(['* * *'], found)
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
  } 
}

function assembleList(masterDir) {
  var doneloading = undefined
  // scans a directory to generate an object
  async function scanDir(selectedDir, selectedList) {
    if (doneloading) clearTimeout(doneloading)
    let myPromise = new Promise(function(resolve) {
      $.ajax('assets/php/listdir.php',
        {
          data: {dir: selectedDir},
          success: function(a,s,xhr) {
            // return full list
            var list = JSON.parse(xhr.responseText).filter(x => {
              return x.charAt(0) != '.'})
            var listObject = {
              name: selectedDir,
              contents: list.filter(x => 
                { return x.slice(x.length - 5) == '.html' })
            }
            for (x of listObject.contents) {
              // update links
              const title = x;
              const shortitle = x.slice(0, x.length - 5)
              // add correct link to directory links: strip leading punc.
              let dir = selectedDir.replace(/^[\.\/]+/, '')
              dirIndex[shortitle] = dir + '/' + title
              $.get(dir + '/' + title, 
              function (s, m, xhr) {
                // find all backlinks
                $('#test').html(xhr.responseText);
                searches.push([shortitle, 
                  $('#test').html()])
                $('#test').find('.link').toArray().forEach(y => {
                  // add link text
                  const el = $(y);
                  let text;
                  if (el.attr('href')) { text = el.attr('href') }
                  else { text = el.text() }
                  // add to dict: [article], [backlinks]
                  if (!index[text]) { index[text] = [shortitle]}
                  else { index[text].push(shortitle) }
                })
                found = searches.concat()
              })
            }
            // add to master list
            selectedList.contents.push(listObject)
            // update the scan - RETURN on function
            // scan all subdirectories of list
            for (dir of list.filter(x => {
              return x.slice(x.length - 5) != '.html'})) {
              scanDir(selectedDir + '/' + dir, listObject)
            }
            resolve(listObject)
          },
          async: false,
        }
      )
    })
    const thing = await myPromise;
    return thing
  }
  function formatList(list, level) {
    // formats list of a single object
    let joinList
    if (level == 'init') {
      joinList = []
      level = 2
    } else if (level == 4) {
      joinList = ['<h4>' + list.name.slice(list.name.lastIndexOf('/') + 1) + 
        '</h4>']
    } else if (level == 5) {
      joinList = ['<h5>' + list.name.slice(list.name.lastIndexOf('/') + 1) + 
        '</h5>']
    } else if (level >= 6) {
      joinList = ['<h6>' + list.name.slice(list.name.lastIndexOf('/') + 1) + 
        '</h6>']
    } else {
      joinList = ['<h3>' + list.name.slice(list.name.lastIndexOf('/') + 1) + 
        '</h3>']
      level = 3
    }
    for (entry of list.contents.filter(
      x => { return typeof x != 'object' })) {
      // push entries onto list
      joinList.push('<p class="link">' + 
        entry.slice(0, entry.length - 5) + '</p>')
    }
    for (entry of list.contents.filter(x => 
      { return typeof x === 'object' })) {
      // scan objects and add them to the list
      joinList.push(formatList(entry, level + 1))
    }
    return joinList.join('')
  }
  // do thing
  let masterList = scanDir(masterDir, {name: 'master', contents: []})
  setTimeout(function () {
    masterList.then((result) => 
    {
      if (/\/z/.test(masterDir)) {
        notesList = formatList(result, 'init') 
      } else if (/\/b/.test(masterDir)) {
        sourcesList = formatList(result, 'init')
      }
    }), 1000 
  })
}

var notesList
var sourcesList

// make lists
assembleList('../../z')
assembleList('../../b')

const notesInterval = setInterval(function() {
  // notes
  if (notesList) {
    $('#bookmarks').html(notesList)
    clearInterval(notesInterval)
    setLinks('#bookmarks')
    setTimeout(selectRandom, 500)
  }
}, 500)
const sourcesInterval = setInterval(function() {
  // sources
  if (sourcesList) {
    $('#bibliography').html(sourcesList)
    clearInterval(sourcesInterval)
    setLinks('#bibliography')
  }
}, 500)

$('#results').hide()
$('#searchbar').on('keydown', search)
$(document).on('keydown', keyDown)
hideToolTip()
$('#tooltip').on('mouseleave', hideToolTip)
$(document).on('mouseup', function (ev) {
  if (ev.target != $('#tooltip')[0] && 
    !$(ev.target).parents().toArray().includes($('#tooltip')[0])) {
    hideToolTip() 
  }
})