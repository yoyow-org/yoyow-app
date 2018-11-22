import alt from "../altInstance";

var locales = {};

class IntlActions {
    switchLocale(locale) {
        if (locale === "zh") {
            return {locale};
        }
        return (dispatch) => {
            this.__fetchLocal("locale-" + locale + ".json").then(result => {
                dispatch({
                    locale,
                    localeData: result
                });
            }).catch(err => {
                dispatch({locale: "zh"});
            })
            // fetch("locale-" + locale + ".json").then((reply) => {
            //     return reply.json().then(result => {
            //         dispatch({
            //             locale,
            //             localeData: result
            //         });
            //     }).catch(err => {
            //     });
            // }).catch(err => {
            //     return (dispatch) => {
            //         dispatch({locale: "zh"});
            //     };
            // });
        };
    }

    getLocale(locale) {
        return locale;
    }

    __fetchLocal(url) {
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest
          xhr.onload = function() {
            resolve(JSON.parse(xhr.responseText))
          }
          xhr.onerror = function() {
            reject(new TypeError('Local request failed'))
          }
          xhr.open('GET', url)
          xhr.send(null)
        })
      }
}

export default alt.createActions(IntlActions);