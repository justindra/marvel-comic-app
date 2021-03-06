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
            data: json.data && json.data.results && json.data.results[0] || {}
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
            data: json.data && json.data.results
        };
    }
    
    function fetchComic(comicId) {
      return function (dispatch) {
        dispatch(requestComic(comicId));
        return fetch(`http://gateway.marvel.com:80/v1/public/comics/` + comicId + `?` +
            `apikey=` + API_KEY)
          .then(function (response) {
            if (response.status === 200) return response.json();
            else throw new Error(response.status);
          })
          .then(function (json) { return dispatch(receiveComic(json)); })
          .then(function (action) {
            dispatch(requestComicCharacters(comicId));
            return fetch(`http://gateway.marvel.com:80/v1/public/comics/` + comicId + `/characters?` +
            `apikey=` + API_KEY)
              .then(function (response) {
                if (response.status === 200) return response.json();
                else throw new Error(response.status);
              })
              .then(function (json) { return dispatch(receiveComicCharacters(json)); });
          })
          .catch(function (error) {
            console.log(error);
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

    function requestComics (details) {
        return {
            type: REQUEST_COMICS,
            offset: details.offset || 0,
            format: details.format || '',
            newComics: details.newComics || false,
            titleStartsWith: details.titleStartsWith || undefined
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
    
    function fetchComics(details) {
      return function (dispatch) {
        dispatch(requestComics(details));
        return fetch(`http://gateway.marvel.com:80/v1/public/comics?` +
            (details.format && (`format=` + (details.format || '')) || '') +
            `&offset=` + (details.offset || 0) + 
            (details.newComics && `&dateDescriptor=thisMonth` || '') +
            (details.titleStartsWith && `&titleStartsWith=` + details.titleStartsWith || '') +
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
                    newComics: action.newComics,
                    titleStartsWith: action.titleStartsWith
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

    var REQUEST_CHARACTER = 'REQUEST_CHARACTER';
    var RECEIVE_CHARACTER = 'RECEIVE_CHARACTER';
    var REQUEST_CHARACTER_COMICS = 'REQUEST_CHARACTER_COMICS';
    var RECEIVE_CHARACTER_COMICS = 'RECEIVE_CHARACTER_COMICS';

    function requestCharacter (characterId) {
        return {
            type: REQUEST_CHARACTER,
            characterId: characterId
        };
    }

    function receiveCharacter (json) {
        return {
            type: RECEIVE_CHARACTER,
            data: json.data && json.data.results && json.data.results[0] || {}
        };
    }

    function requestCharacterComics (characterId) {
        return {
            type: REQUEST_CHARACTER_COMICS,
            characterId: characterId
        };
    }

    function receiveCharacterComics (json) {
        return {
            type: RECEIVE_CHARACTER_COMICS,
            data: json.data.results
        };
    }
    
    function fetchCharacter(characterId) {
      return function (dispatch) {
        dispatch(requestCharacter(characterId));
        return fetch(`http://gateway.marvel.com:80/v1/public/characters/` + characterId + `?` +
            `apikey=` + API_KEY)
          .then(function (response) {
            if (response.status === 200) return response.json();
            else throw new Error(response.statusText);
          })
          .then(function (json) { return dispatch(receiveCharacter(json)); })
          .then(function (action) {
            dispatch(requestCharacterComics(action.data.id));
            return fetch(`http://gateway.marvel.com:80/v1/public/characters/` + action.data.id + `/comics?` +
            `apikey=` + API_KEY)
              .then(function (response) {
                if (response.status === 200) return response.json();
                else throw new Error(response.statusText); 
              })
              .then(function (json) { return dispatch(receiveCharacterComics(json)); });
          })
          .catch(function(error) {
            console.log(error);
          });
      };
    }

    function curCharacter (state, action) {
        switch (action.type) {
            case REQUEST_CHARACTER:
                var series = [].concat(state.series);
                var comics = [].concat(state.comics);
                return Object.assign({}, state, {
                    id: action.characterId,
                    loading: true,
                    series: series,
                    comics: comics
                });
            case RECEIVE_CHARACTER:
                return Object.assign({}, state, {
                    loading: false,
                    characterId: action.data.id,
                    name: action.data.name,
                    description: action.data.description,
                    thumbnail: action.data.thumbnail,
                    series: action.data.series.items,
                    comics: action.data.comics.items,
                    comicsExists: (action.data.comics.available > 0),
                    comicsLoading: false
                });
            case REQUEST_CHARACTER_COMICS:
                return Object.assign({}, state, {
                    comicsLoading: true
                });
            case RECEIVE_CHARACTER_COMICS:
                return Object.assign({}, state, {
                    comicsLoading: false,
                    comics: action.data
                });
            default:
                return state || { loading: false };
        }
    }

    var REQUEST_CHARACTERS = 'REQUEST_CHARACTERS';
    var RECEIVE_CHARACTERS = 'RECEIVE_CHARACTERS';

    function requestCharacters (details) {
        return {
            type: REQUEST_CHARACTERS,
            offset: details.offset || 0,
            format: details.format || '',
            newCharacters: details.newCharacters || false,
            nameStartsWith: details.nameStartsWith || undefined
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
    
    function fetchCharacters(details) {
      return function (dispatch) {
        dispatch(requestCharacters(details));
        return fetch(`http://gateway.marvel.com:80/v1/public/characters?` +
            (details.format && (`format=` + (details.format || '')) || '') +
            `&offset=` + (details.offset || 0) + 
            (details.newCharacters && `&dateDescriptor=thisMonth` || '') +
            (details.nameStartsWith && `&nameStartsWith=` + details.nameStartsWith || '') +
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
                    format: action.format,
                    newCharacters: action.newCharacters,
                    nameStartsWith: action.nameStartsWith
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
        curCharacter: curCharacter,
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

    MarvelStore.actions.getComics = function (details) {
        var cur = MarvelStore.getState().curComics;
        if ((details.offset && (cur.offset != details.offset) || true) ||
            (details.format && (cur.format != details.format)) ||
            (details.newComics && (cur.new != details.newComics) || true)) {
            MarvelStore.dispatch(fetchComics(details));
        }
    }

    MarvelStore.actions.getSeries = function (offset, format, newSeries) {
        MarvelStore.dispatch(fetchSeries(offset, format, newSeries));
    }

    MarvelStore.actions.getCharacter = function (characterId) {
        MarvelStore.dispatch(fetchCharacter(characterId));
    }

    MarvelStore.actions.getCharacters = function (details) {
        MarvelStore.dispatch(fetchCharacters(details));
    }

    return MarvelStore;
}