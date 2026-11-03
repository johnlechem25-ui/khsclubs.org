/* KHS Clubs — search and filter logic.
   Data lives in clubs.json so a sponsor can update
   information without touching any code. */

(function () {
  'use strict';

  var state = {
    query: '',
    category: 'All'
  };

  var clubs = [];

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'text') node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) {
      node.appendChild(child);
    });
    return node;
  }

  function plural(n) {
    return n === 1 ? '' : 's';
  }

  function render() {
    var list = document.getElementById('club-results');
    var empty = document.getElementById('club-empty');
    var count = document.getElementById('club-count');
    list.innerHTML = '';

    var q = state.query.trim().toLowerCase();
    var matches = clubs.filter(function (club) {
      var inCategory =
        state.category === 'All' || club.category === state.category;
      var haystack = (
        club.name +
        ' ' +
        club.category +
        ' ' +
        club.description +
        ' ' +
        club.meetingDay
      ).toLowerCase();
      var matchesQuery = !q || haystack.indexOf(q) !== -1;
      return inCategory && matchesQuery;
    });

    if (matches.length === 0) {
      empty.classList.add('visible');
    } else {
      empty.classList.remove('visible');
    }

    matches.forEach(function (club) {
      var details = el('dl', { class: 'detail-list' }, [
        el('dt', { text: 'Meets' }),
        el('dd', { text: club.meetingDay + ', ' + club.meetingTime }),
        el('dt', { text: 'Where' }),
        el('dd', { text: club.location }),
        el('dt', { text: 'Sponsor' }),
        el('dd', { text: club.sponsor }),
        el('dt', { text: 'How to join' }),
        el('dd', { text: club.join })
      ]);

      var card = el('li', { class: 'club-card' }, [
        el('div', { class: 'card-top' }, [
          el('h2', { text: club.name }),
          el('span', { class: 'badge', text: club.category })
        ]),
        el('p', { text: club.description }),
        details
      ]);

      if (club.link) {
        card.appendChild(
          el('a', {
            class: 'card-link',
            href: club.link,
            target: '_blank',
            rel: 'noopener noreferrer',
            text: 'Official club page'
          })
        );
      }

      card.appendChild(
        el('p', { class: 'verified', text: 'Last verified ' + club.verified })
      );

      list.appendChild(card);
    });

    count.textContent =
      'Showing ' +
      matches.length +
      ' of ' +
      clubs.length +
      ' club' +
      plural(clubs.length);
  }

  function init() {
    document
      .getElementById('club-search')
      .addEventListener('input', function (event) {
        state.query = event.target.value;
        render();
      });

    document.getElementById('club-reset').addEventListener('click', function () {
      state.query = '';
      state.category = 'All';
      document.getElementById('club-search').value = '';
      var chips = document.querySelectorAll('#club-filters .chip');
      chips.forEach(function (chip) {
        chip.setAttribute(
          'aria-pressed',
          chip.getAttribute('data-category') === 'All' ? 'true' : 'false'
        );
      });
      render();
      document.getElementById('club-search').focus();
    });

    var row = document.getElementById('club-filters');
    row.addEventListener('click', function (event) {
      var chip = event.target.closest('.chip');
      if (!chip || !row.contains(chip)) return;
      Array.prototype.forEach.call(row.querySelectorAll('.chip'), function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      state.category = chip.getAttribute('data-category');
      render();
    });

    fetch('./clubs.json')
      .then(function (r) {
        if (!r.ok) throw new Error('clubs.json ' + r.status);
        return r.json();
      })
      .then(function (data) {
        clubs = data.clubs;
        render();
      })
      .catch(function (error) {
        console.error(error);
        document.getElementById('club-count').textContent =
          'Could not load clubs. Please refresh the page.';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
