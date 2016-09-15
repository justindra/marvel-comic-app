function  buildStore() {
    "use strict";

    var API_KEY = 'bb7b0d40bc2bdfbb870e9955e97c381a';

    var REQUEST_COMIC = 'REQUEST_COMIC';
    var RECEIVE_COMIC = 'RECEIVE_COMIC';
    var REQUEST_COMIC_CHARACTERS = 'REQUEST_COMIC_CHARACTERS';
    var RECEIVE_COMIC_CHARACTERS = 'RECEIVE_COMIC_CHARACTERS';

    function requestComic (comicId) {
        return {
            type: REQUEST_COMIC,
            comicId: comicId
        };
    }

    function receiveComic (json) {
        return {
            type: RECEIVE_COMIC,
            data: json.data.results[0]
        };
    }

    function requestComicCharacters (comicId) {
        return {
            type: REQUEST_COMIC_CHARACTERS,
            comicId: comicId
        };
    }

    function receiveComicCharacters (json) {
        return {
            type: RECEIVE_COMIC_CHARACTERS,
            data: json.data.results
        };
    }
    
    function fetchComic(comicId) {
      return function (dispatch) {
        dispatch(requestComic(comicId));
        return fetch(`http://gateway.marvel.com:80/v1/public/comics/` + comicId + `?` +
            `&apikey=` + API_KEY)
          .then(function (response) { return response.json(); })
          .then(function (json) { return dispatch(receiveComic(json)); })
          .then(function (action) {
            dispatch(requestComicCharacters(action.data.id));
            return fetch(`http://gateway.marvel.com:80/v1/public/comics/` + action.data.id + `/characters?` +
            `&apikey=` + API_KEY)
              .then(function (response) { return response.json(); })
              .then(function (json) { return dispatch(receiveComicCharacters(json)); });
          });
      };
    }

    function curComic (state, action) {
        switch (action.type) {
            case REQUEST_COMIC:
                var series = [].concat(state.series);
                var characters = [].concat(state.characters);
                return Object.assign({}, state, {
                    id: action.comicId,
                    loading: true,
                    series: series,
                    characters: characters
                });
            case RECEIVE_COMIC:
                var items = action.data
                if (action.offset > 0) {
                    items = [].concat(state.items, action.data);
                }
                return Object.assign({}, state, {
                    loading: false,
                    comicId: action.data.id,
                    title: action.data.title,
                    issueNumber: action.data.issueNumber,
                    description: action.data.description,
                    series: action.data.series.name,
                    thumbnail: action.data.thumbnail,
                    characters: action.data.characters.items,
                    charactersExists: (action.data.characters.available > 0),
                    charactersLoading: false
                });
            case REQUEST_COMIC_CHARACTERS:
                return Object.assign({}, state, {
                    charactersLoading: true
                });
            case RECEIVE_COMIC_CHARACTERS:
                return Object.assign({}, state, {
                    charactersLoading: false,
                    characters: action.data
                });
            default:
                return state || { loading: false };
        }
    }

    var REQUEST_COMICS = 'REQUEST_COMICS';
    var RECEIVE_COMICS = 'RECEIVE_COMICS';

    function requestComics (offset, format, newComics) {
        return {
            type: REQUEST_COMICS,
            offset: offset || 0,
            format: format || '',
            newComics: newComics || false
        };
    }

    function receiveComics (json) {
        return {
            type: RECEIVE_COMICS,
            data: json.data.results,
            offset: json.data.offset,
            total: json.data.total,
            count: json.data.count
        };
    }
    
    function fetchComics(offset, format, newComics) {
      return function (dispatch) {
        dispatch(requestComics(offset, format, newComics));
        return fetch(`http://gateway.marvel.com:80/v1/public/comics?` +
            (format && (`format=` + (format || '')) || '') +
            `&offset=` + (offset || 0) + 
            (newComics && `&dateDescriptor=thisMonth` || '') +
            `&apikey=` + API_KEY)
          .then(function (response) { return response.json(); })
          .then(function (json) { return dispatch(receiveComics(json)); });
      };
    }

    function curComics (state, action) {
        switch (action.type) {
            case REQUEST_COMICS:
                var items = [].concat(state.items);
                if (action.offset <= 0) {
                    items = []
                }
                return Object.assign({}, state, {
                    loading: true,
                    items: items,
                    more: false,
                    format: action.format,
                    offset: action.offset,
                    new: action.newComics
                });
            case RECEIVE_COMICS:
                var more = (action.offset + action.count) < action.total;
                var items = action.data
                if (action.offset > 0) {
                    items = [].concat(state.items, action.data);
                }
                return Object.assign({}, state, {
                    loading: false,
                    items: items,
                    more: more,
                    count: (action.offset + action.count),
                    offset: action.offset
                });
            default:
                return state || { loading: false, items: [] };
        }
    }

    var REQUEST_SERIES = 'REQUEST_SERIES';
    var RECEIVE_SERIES = 'RECEIVE_SERIES';

    function requestSeries (offset, format, newSeries) {
        return {
            type: REQUEST_SERIES,
            offset: offset || 0,
            format: format || '',
            newSeries: newSeries || false
        };
    }

    function receiveSeries (json) {
        return {
            type: RECEIVE_SERIES,
            data: json.data.results,
            offset: json.data.offset,
            total: json.data.total,
            count: json.data.count
        };
    }
    
    function fetchSeries(offset, format, newSeries) {
      return function (dispatch) {
        dispatch(requestSeries(offset, format, newSeries));
        return fetch(`http://gateway.marvel.com:80/v1/public/series?` +
            (format && (`format=` + (format || '')) || '') +
            `&offset=` + (offset || 0) + 
            (newSeries && `&dateDescriptor=thisMonth` || '') +
            `&apikey=` + API_KEY)
          .then(function (response) { return response.json(); })
          .then(function (json) { return dispatch(receiveSeries(json)); });
      };
    }

    function curSeries (state, action) {
        switch (action.type) {
            case REQUEST_SERIES:
                var items = [].concat(state.items);
                if (action.offset <= 0) {
                    items = []
                }
                return Object.assign({}, state, {
                    loading: true,
                    items: items,
                    more: false,
                    format: action.format
                });
            case RECEIVE_SERIES:
                var more = (action.offset + action.count) < action.total;
                var items = action.data
                if (action.offset > 0) {
                    items = [].concat(state.items, action.data);
                }
                return Object.assign({}, state, {
                    loading: false,
                    items: items,
                    more: more,
                    count: (action.offset + action.count)
                });
            default:
                return state || { loading: false, items: [] };
        }
    }

    var REQUEST_CHARACTERS = 'REQUEST_CHARACTERS';
    var RECEIVE_CHARACTERS = 'RECEIVE_CHARACTERS';

    function requestCharacters (offset, format, newCharacters) {
        return {
            type: REQUEST_CHARACTERS,
            offset: offset || 0,
            format: format || '',
            newCharacters: newCharacters || false
        };
    }

    function receiveCharacters (json) {
        return {
            type: RECEIVE_CHARACTERS,
            data: json.data.results,
            offset: json.data.offset,
            total: json.data.total,
            count: json.data.count
        };
    }
    
    function fetchCharacters(offset, format, newCharacters) {
      return function (dispatch) {
        dispatch(requestCharacters(offset, format, newCharacters));
        return fetch(`http://gateway.marvel.com:80/v1/public/characters?` +
            (format && (`format=` + (format || '')) || '') +
            `&offset=` + (offset || 0) + 
            (newCharacters && `&dateDescriptor=thisMonth` || '') +
            `&apikey=` + API_KEY)
          .then(function (response) { return response.json(); })
          .then(function (json) { return dispatch(receiveCharacters(json)); });
      };
    }

    function curCharacters (state, action) {
        switch (action.type) {
            case REQUEST_CHARACTERS:
                var items = [].concat(state.items);
                if (action.offset <= 0) {
                    items = []
                }
                return Object.assign({}, state, {
                    loading: true,
                    items: items,
                    more: false,
                    format: action.format
                });
            case RECEIVE_CHARACTERS:
                var more = (action.offset + action.count) < action.total;
                var items = action.data
                if (action.offset > 0) {
                    items = [].concat(state.items, action.data);
                }
                return Object.assign({}, state, {
                    loading: false,
                    items: items,
                    more: more,
                    count: (action.offset + action.count)
                });
            default:
                return state || { loading: false, items: [] };
        }
    }
    var rootReducer = Redux.combineReducers({
        curComic: curComic,
        curComics: curComics,
        curSeries: curSeries,
        curCharacters: curCharacters
    });

    var middleware = Redux.applyMiddleware(ReduxThunk.default);

    var MarvelStore = Redux.createStore(rootReducer, undefined, 
        Redux.compose(
            middleware, window.devToolsExtension && window.devToolsExtension() || function (a) { return a; }
        )
    );

    MarvelStore.actions = {};

    MarvelStore.actions.getComic = function (comicId) {
        MarvelStore.dispatch(fetchComic(comicId));
    }

    MarvelStore.actions.getComics = function (offset, format, newComics) {
        var cur = MarvelStore.getState().curComics;
        if ((offset && (cur.offset != offset) || true) || (format && (cur.format != format)) || (newComics && (cur.new != newComics) || true)) {
            MarvelStore.dispatch(fetchComics(offset, format, newComics));
        }
    }

    MarvelStore.actions.getSeries = function (offset, format, newSeries) {
        MarvelStore.dispatch(fetchSeries(offset, format, newSeries));
    }

    MarvelStore.actions.getCharacters = function (offset, format, newCharacters) {
        MarvelStore.dispatch(fetchCharacters(offset, format, newCharacters));
    }

    return MarvelStore;
}