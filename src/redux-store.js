function  buildStore() {
    "use strict";

    var API_KEY = 'bb7b0d40bc2bdfbb870e9955e97c381a';

    var REQUEST_COMICS = 'REQUEST_COMICS';
    var RECEIVE_COMICS = 'RECEIVE_COMICS';

    function requestComics () {
        return {
            type: REQUEST_COMICS
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

    function fetchNewComics(offset) {
      return function (dispatch) {
        dispatch(requestComics());
        return fetch(`http://gateway.marvel.com:80/v1/public/comics?dateDescriptor=thisMonth&orderBy=-onsaleDate&&offset=` + (offset || 0) + `&apikey=` + API_KEY)
          .then(function (response) { return response.json(); })
          .then(function (json) { return dispatch(receiveComics(json)); });
      };
    }

    function curComics (state, action) {
        switch (action.type) {
            case REQUEST_COMICS:
                return Object.assign({}, state, {
                    loading: true
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

    MarvelStore.actions.getNewComics = function (offset) {
        MarvelStore.dispatch(fetchNewComics(offset));
    }

    return MarvelStore;
}