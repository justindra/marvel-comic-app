function  buildStore() {
    "use strict";

    var API_KEY = 'bb7b0d40bc2bdfbb870e9955e97c381a';

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
                    format: action.format
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
                    count: (action.offset + action.count)
                });
            default:
                return state || { loading: false, items: [] };
        }
    }

    var rootReducer = Redux.combineReducers({
        curComics: curComics
    });

    var middleware = Redux.applyMiddleware(ReduxThunk.default);

    var MarvelStore = Redux.createStore(rootReducer, undefined, 
        Redux.compose(
            middleware, window.devToolsExtension && window.devToolsExtension() || function (a) { return a; }
        )
    );

    MarvelStore.actions = {};

    MarvelStore.actions.getComics = function (offset, format, newComics) {
        MarvelStore.dispatch(fetchComics(offset, format, newComics));
    }

    return MarvelStore;
}