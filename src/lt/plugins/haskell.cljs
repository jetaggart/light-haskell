(ns lt.plugins.haskell
  (:require [lt.objs.notifos :as notifos]
            [lt.object :as object]
            [lt.objs.editor :as ed]
            [lt.objs.command :as cmd]
            [lt.objs.files :as files]
            [lt.objs.sidebar.clients :as scl]
            [lt.objs.eval :as eval]
            [lt.objs.dialogs :as dialogs]
            [lt.objs.popup :as popup]
            [lt.objs.proc :as proc]
            [lt.objs.plugins :as plugins]
            [lt.objs.editor.pool :as pool]
            [lt.objs.clients.tcp :as tcp]
            [lt.plugins.doc :as doc]
            [lt.objs.clients :as clients]
            [goog.events :as events]
            [goog.string :as string]
            [lt.util.load :as load])

  (:require-macros [lt.macros :refer [behavior]]))

;; **************************************
;; Hoogle
;; **************************************

(def hoogle->url "http://www.haskell.org/hoogle?mode=json&count=10&start=1&hoogle=")

(defn hoogle [query handler]
  (let [xhr (goog.net.XhrIo.)]
    (events/listen xhr "complete" (hoogle->wrap-handler handler))
    (.send xhr (str hoogle->url (string/urlEncode query)))))

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
    (let [location (.-location hoogle-doc)
          [with-mod mod-package module-name] (.exec #"http://hackage.haskell.org/packages/archive/(.+)/latest/doc/html/(.+).html" location)
          explanation (if (nil? with-mod) "" (str " (" mod-package ": " (.replace module-name "-" ".") ")"))]
    {:name (.-self hoogle-doc)
     :ns   [:a {:href location} (str "Hoogle" explanation)]
     :doc  (.-docs hoogle-doc)})))


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

;; ***********************************
;; check syntax
;; ***********************************

(defn format-syntax-error [error]
  (let [split-error (.split error ":")]
    {:msg (str (nth split-error 4) ":" (nth split-error 5))
     :loc {:line (-> (nth split-error 1) js/parseInt dec)
           :ch 1
           :start-line (-> (nth split-error 1) js/parseInt dec)}}))

(defn print-syntax-error [editor error]
  (let [formatted-error (format-syntax-error error)]
    (object/raise editor :editor.exception (:msg formatted-error) (:loc formatted-error))))

(defn print-syntax-errors [editor data]
  (doseq [error data]
    (print-syntax-error editor error)))

(behavior ::editor-syntax-result
          :triggers #{:editor.haskell.syntax.result}
          :reaction (fn [editor result]
                      (let [data (:data result)]
                        (if (empty? data)
                          (notifos/done-working "")
                          (do
                            (notifos/set-msg! "Haskell: please check inline syntax errors" {:class "error"})
                            (print-syntax-errors editor data))))))

(behavior ::haskell-syntax
          :triggers #{:haskell.syntax}
          :reaction (fn [editor]
                      (object/raise haskell :haskell.send.syntax {:origin editor})))

(behavior ::haskell-send-syntax
          :triggers #{:haskell.send.syntax}
          :reaction (fn [this event]
                      (let [{:keys [info origin]} event
                                    client (-> @origin :client :default)]
                              (notifos/working "")
                              (clients/send (eval/get-client! {:command :haskell.api.syntax
                                                               :origin origin
                                                               :info info
                                                               :create try-connect})
                                            :haskell.api.syntax {:data (->path origin)} :only origin))))

(cmd/command {:command :check-syntax
              :desc "Haskell: Check syntax"
              :exec (fn []
                      (when-let [ed (pool/last-active)]
                        (object/raise ed :haskell.syntax)))})

;; ***********************************
;; reformat code
;; ***********************************

(behavior ::editor-reformat-result
          :triggers #{:editor.haskell.reformat.result}
          :reaction (fn [editor result]
                      (replace-buffer (:data result))))

(behavior ::haskell-reformat
          :triggers #{:haskell.reformat}
          :reaction (fn [editor]
                      (object/raise haskell :haskell.send.reformat {:origin editor})))

(behavior ::haskell-send-reformat
          :triggers #{:haskell.send.reformat}
          :reaction (fn [this event]
                      (let [{:keys [info origin]} event
                                    client (-> @origin :client :default)]
                              (notifos/working "")
                              (clients/send (eval/get-client! {:command :haskell.api.reformat
                                                               :origin origin
                                                               :info info
                                                               :create try-connect})
                                            :haskell.api.reformat {:data (current-buffer-content)} :only origin))))

(cmd/command {:command :reformat-file
              :desc "Haskell: Reformat file"
              :exec (fn []
                      (when-let [ed (pool/last-active)]
                        (object/raise ed :haskell.reformat)))})

;; **************************************
;; haskell client
;; **************************************

(def shell (load/node-module "shelljs"))
;;(def lt-haskell-path "/Applications/LightTable.app/Contents/Resources/app.nw/plugins/haskell/haskell/LTHaskellClient.hs") ; plugin-dir seems to be broken
(def lt-haskell-path (files/join plugins/*plugin-dir* "haskell/LTHaskellClient.hs"))

(behavior ::on-out
          :triggers #{:proc.out}
          :reaction (fn [this data]
                      (let [out (.toString data)]
                        (object/update! this [:buffer] str out)
                        (when (> (.indexOf out "Connected") -1)
                          (do
                            (notifos/done-working)
                            (object/merge! this {:connected true}))))))


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
                :behaviors [::on-out ::on-error ::on-exit]
                :init (fn [this info]
                        (object/merge! this {:info info})
                        nil))


(defn run-haskell [{:keys [path name client] :as info}]
  (let [obj (object/create ::connecting-notifier info)
        client-id (clients/->id client)]
    (object/merge! client {:port tcp/port
                           :proc obj})
    (notifos/working "Connecting..")
    (proc/exec {:command "runhaskell"
                :args [lt-haskell-path tcp/port client-id]
                :cwd (files/parent path)
                :env {"HASKELL_PATH" (files/join (files/parent path))}
                :obj obj})))

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

;; ****************************
;; Util
;; ****************************

(defn current-buffer-content []
  "Returns content of the current buffer"
  (let [cm (ed/->cm-ed (pool/last-active))]
    (.getRange cm #js {:line 0 :ch 0} #js {:line (.lineCount (ed/->cm-ed (pool/last-active))) :ch 0})))

(defn replace-buffer [string]
  (when-let [ed (pool/last-active)]
    (.replaceRange (ed/->cm-ed ed)
                   string
                   #js {:line 0 :ch 0}
                   #js {:line (.lineCount (ed/->cm-ed (pool/last-active))) :ch 0})))

(defn ->path [e]
  (or
   (-> @e :info :path)
   (@e :path)
   ""))