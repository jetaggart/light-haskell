(ns lt.plugins.haskell
  (:require [lt.objs.notifos :as notifos]
            [lt.object :as object]
            [lt.objs.editor :as ed]
            [lt.plugins.doc :as doc]
            [goog.events :as events]
            [lt.util.dom :as dom])

  (:require-macros [lt.macros :refer [behavior]]))

(def hoogle->url "http://www.haskell.org/hoogle?mode=json&count=10&start=1&hoogle=")

(defn hoogle [query handler]
  (let [xhr (goog.net.XhrIo.)]
    (events/listen xhr "complete" (hoogle->wrap-handler handler))
    (.send xhr (str hoogle->url query))))

(defn hoogle->parse [response]
  (-> response .getResponseJson .-results))

(defn hoogle->wrap-handler [handler]
  (fn [event]
    (let [response (.-target event)]
      (if (.isSuccess response)
          (handler (hoogle->parse response))
          (notifos/done-working "Failed to connect to hoogle. Try again")))))

;; Sidebar Docs

(defn convert-doc-result [hoogle-doc]
  {:name (.-self hoogle-doc)
   :ns   [:a {:href (.-location hoogle-doc)} "hoogle"]
   :doc  (.-docs hoogle-doc)})

(defn convert-results [results]
  (map convert-doc-result results))

(defn sidebar-hoogle-response [results]
  (object/raise doc/doc-search :doc.search.results (convert-results results)))

(defn haskell-doc-search-exec [query]
  (notifos/working (str "Searching for haskell docs: " query)
  (hoogle query sidebar-hoogle-response)))

(defn haskell-doc-search [this cur]
  (conj cur {:label "hs" :trigger haskell-doc-search-exec :file-types #{"Haskell"}}))

(behavior ::haskell-doc-search
          :triggers #{:types+}
          :reaction haskell-doc-search)

;; Inline doc search

(defn symbol-token? [s]
  (re-seq #"[\w\$_\-\.\*\+\/\?\><!]" s))

(defn find-symbol-at-cursor [editor]
  (let [loc (ed/->cursor editor)
        token-left (ed/->token editor loc)
        token-right (ed/->token editor (update-in loc [:ch] inc))]
    (or (when (symbol-token? (:string token-right))
          (assoc token-right :loc loc))
        (when (symbol-token? (:string token-left))
          (assoc token-left :loc loc)))))

(defn with-editor [editor func]
  (fn [results]
    (func editor results)))

(defn inline-hoogle-doc [editor results]
  (let [loc (ed/->cursor editor)
        doc (-> results first convert-doc-result)]
    (notifos/done-working (str "Found result: " (:loc (assoc doc :loc loc))))
    (object/raise editor :editor.doc.show! (assoc doc :loc loc))))

(defn haskell-inline-doc [editor]
  (let [token (-> editor find-symbol-at-cursor :string)]
    (if (nil? token)
        (object/raise editor :editor.doc.show! {:name "Nothing"})
        (hoogle token (with-editor editor inline-hoogle-doc)))))

(behavior ::haskell-doc
          :triggers #{:editor.doc}
          :reaction haskell-inline-doc)
