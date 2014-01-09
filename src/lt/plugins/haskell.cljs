(ns lt.plugins.haskell
  (:require [lt.objs.notifos :as notifos]
            [lt.object :as object]
            [lt.plugins.doc :as doc]
            [goog.events :as events]
            [lt.util.dom :as dom])

  (:require-macros [lt.macros :refer [behavior]]))

(defn convert-doc-result [hoogle-doc]
  {:name (.-self hoogle-doc)
   :ns [:a {:href (.-location hoogle-doc)} "hoogle"]
   :doc  (.-docs hoogle-doc)})

(defn convert-response [response]
  (let [results (-> response .-target .getResponseJson .-results)]
    (map convert-doc-result results)))

(defn handle-hoogle-response [response]
  (object/raise doc/doc-search
                :doc.search.results
                (convert-response response)))

(defn hoogle [query]
  (let [xhr (goog.net.XhrIo.)]
    (println "Hoogl google")
    (events/listen xhr "complete" handle-hoogle-response)
    (.send xhr (str "http://www.haskell.org/hoogle?mode=json&count=10&start=1&hoogle=" query))))

(defn haskell-doc-search-exec [query]
  (notifos/working (str "Searching for haskell docs: " query)
  (hoogle query)))

(behavior ::haskell-doc-search
          :triggers #{:types+}
          :reaction (fn [this cur]
                      (conj cur {:label "hs" :trigger haskell-doc-search-exec :file-types #{"Haskell"}})
                    ))
