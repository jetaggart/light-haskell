(ns lt.plugins.haskell
  (:require [lt.objs.notifos :as notifos]
            [lt.object :as object]
            [lt.objs.editor :as ed]
            [lt.objs.files :as files]
            [lt.objs.sidebar.clients :as scl]
            [lt.objs.dialogs :as dialogs]
            [lt.objs.popup :as popup]
            [lt.objs.proc :as proc]
            [lt.objs.plugins :as plugins]
            [lt.plugins.doc :as doc]
            [lt.objs.clients :as clients]
            [goog.events :as events]
            [lt.util.load :as load]
            [lt.util.dom :as dom])

  (:require-macros [lt.macros :refer [behavior]]))

;; **************************************
;; Hoogle
;; **************************************

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

;; **************************************
;; Sidebar Docs
;; **************************************

(defn convert-doc-result [hoogle-doc]
  (if (nil? hoogle-doc)
    nil
    {:name (.-self hoogle-doc)
     :ns   [:a {:href (.-location hoogle-doc)} "hoogle"]
     :doc  (.-docs hoogle-doc)}))


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

;; **************************************
;; Inline doc search
;; **************************************

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
    (if (nil? doc)
        (notifos/set-msg! "No docs found" {:class "error"})
        (object/raise editor :editor.doc.show! (assoc doc :loc loc)))))

(defn haskell-inline-doc [editor]
  (let [token (-> editor find-symbol-at-cursor :string)]
    (if (nil? token)
        (notifos/set-msg! "No docs found" {:class "error"})
        (hoogle token (with-editor editor inline-hoogle-doc)))))

(behavior ::haskell-doc
          :triggers #{:editor.doc}
          :reaction haskell-inline-doc)


;; **************************************
;; haskell client
;; **************************************

(defn escape-spaces [s]
  (if (= files/separator "\\")
    (str "\"" s "\"")
    s))


(def shell (load/node-module "shelljs"))
(def harbor ((load/node-module "harbor") 49152 65000))
(def lt-haskell-path "/Applications/LightTable.app/Contents/Resources/app.nw/plugins/haskell/haskell/LTHaskellClient.hs") ; plugin-dir seems to be broken

(defn open-port [id cb]
  (.claim harbor
          (str id)
          #(cb %2)))

(behavior ::on-out
          :triggers #{:proc.out}
          :reaction (fn [this data]
                      (let [out (.toString data)]
                        (println "Got some output: " out)
                        (object/update! this [:buffer] str out)
                        (do
                          (notifos/done-working)
                          (object/merge! this {:connected true})
                          ;(object/destroy! this)
                          ))))

(behavior ::on-error
          :triggers #{:proc.error}
          :reaction (fn [this data]
                      (let [out (.toString data)]
                        (println "Process errored: " out))))

(behavior ::on-exit
          :triggers #{:proc.exit}
          :reaction (fn [this data]
                      (println "Process exited: " data)))

(object/object* ::connecting-notifier
                :triggers []
                :behaviors [::on-out, ::on-error, ::on-exit]
                :init (fn [this info]
                        (object/merge! this {:info info})
                        nil))


(defn run-haskell [{:keys [path name client] :as info}]
  (open-port (clients/->id client)
             (fn [port]
               (let [obj (object/create ::connecting-notifier info)
                     client-id (clients/->id client)]
                 (object/merge! client {:port port
                                        :proc obj})
                 (notifos/working "Connecting..")
                 (proc/exec {:command "runhaskell"
                             :args [lt-haskell-path port client-id]
                             :cwd (files/parent path)
                             :env {"HASKELL_PATH" (files/join (files/parent path))}
                             :obj obj})))))

(defn check-haskell [obj]
  (assoc obj :haskell (.which shell "runhaskell")))

(defn check-client [obj]
  (assoc obj :haskell-client (files/exists? lt-haskell-path)))

(defn handle-no-haskell [client]
  (clients/rem! client)
  (popup/popup! {:header "We couldn't find runhaskell."
                 :body "In order to start a haskell client, you have to have the haskell and haskell-platform installed and on your system's PATH."
                 :buttons [{:label "Download Haskell Platform"
                            :action (fn []
                                      (platform/open "http://www.haskell.org/platform/"))}
                           {:label "ok"}]}))
(defn notify [obj]
  (let [{:keys [haskell path client]} obj]
    (cond
     (or (not haskell) (empty? haskell)) (handle-no-haskell client)
     :else (run-haskell obj))
    obj))

(defn check-all [obj]
  (-> obj
      (check-haskell)
      (check-client)
      (notify)))

(defn try-connect [{:keys [info]}]
  (let [path (:path info)
        client (clients/client! :haskell.client)]
    (object/merge! client {:path path})
    (check-all {:path path
                :client client})
    client))

(behavior ::connect
          :triggers #{:connect}
          :reaction (fn [this path]
                      (try-connect {:info {:path path}})))


(object/object* ::haskell-lang
                :tags #{:haskell.lang})

(def haskell (object/create ::haskell-lang))

(scl/add-connector {:name "Haskell"
                    :desc "Select a directory to serve as the root of your haskell project."
                    :connect (fn []
                               (dialogs/dir haskell :connect))})
