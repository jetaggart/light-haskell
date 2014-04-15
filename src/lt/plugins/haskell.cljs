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
            [lt.objs.platform :as platform]
            [lt.objs.editor.pool :as pool]
            [lt.objs.clients.tcp :as tcp]
            [lt.objs.tabs :as tabs]
            [lt.plugins.doc :as doc]
            [lt.objs.clients :as clients]
            [goog.events :as events]
            [goog.string :as string]
            [clojure.string :as clj-string]
            [lt.util.load :as load])

  (:require-macros [lt.macros :refer [behavior]]))

(def shell (load/node-module "shelljs"))

(.which shell "cabal")

(def plugin-dir (plugins/find-plugin "Haskell"))
(def binary-path (files/join plugin-dir
                             (if (platform/win?)
                               "run-server.bat"
                               "./run-server.sh")))

;; **************************************
;; API searching
;; **************************************

(defn perform-api-search [base-url query handler]
  (let [xhr (goog.net.XhrIo.)]
    (events/listen xhr "complete" (wrap-handler handler))
    (.send xhr (str base-url (string/urlEncode query)))))

(defn wrap-handler [handler]
  (fn [event]
    (let [response (.-target event)]
      (if (.isSuccess response)
          (handler response)
          (notifos/done-working "Failed to connect to handler. Try again")))))

;; Hayoo

(def hayoo->url "http://holumbus.fh-wedel.de/hayoo/hayoo.json?query=")

(defn hayoo [query handler]
  (perform-api-search hayoo->url query handler))

(defn hayoo->parse [response]
  (-> response .getResponseJson .-functions))

(defn hayoo->convert-doc [hayoo-doc]
  (if (nil? hayoo-doc)
    nil
    (let [location (.-uri hayoo-doc)
          func-name (str (.-name hayoo-doc) " :: " (.-signature hayoo-doc))]
     {:name func-name
     :ns [:a {:href location} (str "Hayoo(" (.-module hayoo-doc) ")")]
     :doc (.-description hayoo-doc)})))

;; Hoogle

(def hoogle->url "http://www.haskell.org/hoogle?mode=json&count=10&start=1&hoogle=")

(defn hoogle [query handler]
  (perform-api-search hoogle->url query handler))

(defn hoogle->parse [response]
  (-> response .getResponseJson .-results))

(defn hoogle->convert-doc [hoogle-doc]
  (if (nil? hoogle-doc)
    nil
    (let [location (.-location hoogle-doc)
          [with-mod mod-package module-name] (.exec #"http://hackage.haskell.org/packages/archive/(.+)/latest/doc/html/(.+).html" location)
          explanation (if (nil? with-mod) "" (str " (" mod-package ": " (clj-string/replace module-name "-" ".") ")"))]
    {:name (.-self hoogle-doc)
     :ns   [:a {:href location} (str "Hoogle" explanation)]
     :doc  (.-docs hoogle-doc)})))

;; **************************************
;; Sidebar Docs
;; **************************************

(defn convert-hoogle-results [results]
  (let [parsed-results (hoogle->parse results)]
   (map hoogle->convert-doc parsed-results)))

(defn convert-hayoo-results [results]
  (let [parsed-results (hayoo->parse results)]
   (map hayoo->convert-doc parsed-results)))

(defn sidebar-hoogle-response [results]
  (object/raise doc/doc-search :doc.search.results (convert-hoogle-results results)))

(defn sidebar-hayoo-response [results]
  (object/raise doc/doc-search :doc.search.results (convert-hayoo-results results)))

(defn haskell-doc-hoogle-exec [query]
  (notifos/working (str "Hoogling: " query)
  (hoogle query sidebar-hoogle-response)))

(defn haskell-doc-hayoo-exec [query]
  (notifos/working (str "Hayooing: " query)
  (hayoo query sidebar-hayoo-response)))

(defn haskell-doc-search [this cur]
  (conj cur {:label "hsh" :trigger haskell-doc-hoogle-exec :file-types #{"Haskell"}}
            {:label "hsy" :trigger haskell-doc-hayoo-exec :file-types #{"Haskell"}}))

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
        doc (-> results hoogle->parse first hoogle->convert-doc)]
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
;; inline errors
;; ***********************************

(defn format-inline-error [error]
  (let [split-error (.split error ":")
        message-only (->> split-error
                          (drop 3)
                          (clj-string/join ":")
                          clj-string/trim)
        message (clj-string/replace message-only "\u0000" "\n")]
    {:msg message
     :loc {:line (-> (nth split-error 1) js/parseInt dec)
           :ch 1
           :start-line (-> (nth split-error 1) js/parseInt dec)}}))

(defn print-inline-error [editor error]
  (let [formatted-error (format-inline-error error)]
    (object/raise editor :editor.exception (:msg formatted-error) (:loc formatted-error))))

(defn print-inline-errors [editor data]
  (doseq [error data]
    (print-inline-error editor error)))

(defn handle-inline-errors [editor result]
  (let [data (:data result)]
    (if (empty? data)
      (notifos/done-working "")
      (do
        (notifos/set-msg! "Haskell: please check inline syntax errors" {:class "error"})
        (print-inline-errors editor data)))))

;; check syntax

(behavior ::editor-syntax-result
          :triggers #{:editor.haskell.syntax.result}
          :reaction handle-inline-errors)

(behavior ::haskell-syntax
          :triggers #{:haskell.syntax}
          :reaction (fn [editor]
                      (object/raise haskell :haskell.send.syntax {:origin editor})))

(behavior ::haskell-send-syntax
          :triggers #{:haskell.send.syntax}
          :reaction (fn [_ event]
                      (send-whole-file-command event :haskell.api.syntax)))

(cmd/command {:command :check-syntax
              :desc "Haskell: Check syntax"
              :exec (fn []
                      (when-let [ed (pool/last-active)]
                        (object/raise ed :haskell.syntax)))})

;; lint

(behavior ::editor-lint-result
          :triggers #{:editor.haskell.lint.result}
          :reaction handle-inline-errors)

(behavior ::haskell-send-lint
          :triggers #{:haskell.send.lint}
          :reaction (fn [this event]
                      (send-whole-file-command event :haskell.api.lint)))

(behavior ::haskell-lint
          :triggers #{:haskell.lint}
          :reaction (fn [editor]
                      (object/raise haskell :haskell.send.lint {:origin editor})))


(cmd/command {:command :check-lint
              :desc "Haskell: Check lint"
              :exec (fn []
                      (when-let [ed (pool/last-active)]
                        (object/raise ed :haskell.lint)))})

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
                      (send-api-command event :haskell.api.reformat (current-buffer-content))))

(cmd/command {:command :reformat-file
              :desc "Haskell: Reformat file"
              :exec (fn []
                      (when-let [ed (pool/last-active)]
                        (object/raise ed :haskell.reformat)))})

;; **************************************
;; evaluate code
;; **************************************

(behavior ::haskell-success
          :triggers #{:editor.eval.haskell.success}
          :reaction (fn [editor result]
                      (notifos/done-working)
                      (object/raise editor :editor.result "✓" {:line (:line result)})))

(behavior ::haskell-result
          :triggers #{:editor.eval.haskell.result}
          :reaction (fn [editor result]
                      (notifos/done-working)
                      (object/raise editor :editor.result (:data result) {:line (:line result)})))

(behavior ::haskell-exception
          :triggers #{:editor.eval.haskell.exception}
          :reaction (fn [editor result]
                      (notifos/done-working)
                      (object/raise editor :editor.exception (:data result) {:line (:line result)})))

(defn selection-info [editor]
  (let [pos (ed/->cursor editor)
        info (:info @editor)
        info (if (ed/selection? editor)
               (assoc info
                 :line (-> (ed/->cursor editor "end") :line)
                 :code (ed/selection editor))
               (assoc info
                 :line (:line pos)
                 :code (ed/line editor (:line pos))))]
    info))

(defn prepare-code [code]
  (clj-string/replace code #"^(\w+)(\s+)?=" "let $1 ="))

(defn clear-result [editor line]
  (when-let [result (get (@editor :widgets) [(ed/line-handle editor line) :inline])]
    (object/raise result :clear!)))

(behavior ::on-eval-one
          :triggers #{:eval.one}
          :reaction (fn [editor]
                      (let [info (selection-info editor)
                            data {:data (prepare-code (:code info))
                                  :line (:line info)}]
                        (when-not (clj-string/blank? (:code info))
                          (clear-result editor (:line info))
                          (send-api-command {:info info :origin editor} :haskell.api.eval data)))))

(behavior ::haskell-type
          :triggers #{:editor.eval.haskell.type}
          :reaction (fn [editor result]
                      (notifos/done-working)
                      (object/raise :editor.result (:data result) {:line (:line result)})))

(behavior ::on-eval-type
          :triggers #{:eval.type}
          :reaction (fn [editor]
                      (let [info (selection-info editor)
                            data {:data (:code info)
                                  :line (:line info)}]
                        (when-not (clj-string/blank? (:code info))
                          (clear-result editor (:line info))
                          (send-api-command {:info info :origin editor} :haskell.api.type data)))))

(cmd/command {:command :editor-type-form
              :desc "Haskell: Get the type of a form in editor"
              :exec (fn []
                      (when-let [ed (pool/last-active)]
                        (object/raise ed :eval.type)))})

;; **************************************
;; haskell client
;; **************************************

(def lt-haskell-path (files/join plugin-dir "haskell/LTHaskellClient.hs"))

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

(defn find-project-dir [file]
  (let [roots (files/get-roots)]
    (loop [cur (files/parent file)
           prev ""]
      (if (or (empty? cur)
              (roots cur)
              (= cur prev))
        nil
        (if (some #(.endsWith % ".cabal") (files/ls-sync cur))
          cur
          (recur (files/parent cur) cur))))))

(defn run-haskell [{:keys [path name client] :as info}]
  (let [obj (object/create ::connecting-notifier info)
        client-id (clients/->id client)
        project-dir (or (find-project-dir path) (files/parent path))]
    (object/merge! client {:port tcp/port
                           :proc obj})
    (notifos/working "Connecting..")
    (proc/exec {:command binary-path
                :args [tcp/port client-id project-dir]
                :cwd plugin-dir
                :env {"HASKELL_PATH" (files/join (files/parent path))}
                :obj obj})))

(defn check-haskell [obj]
  (assoc obj :haskell (.which shell "cabal")))

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

(defn send-api-command [event command data]
  (let [{:keys [info origin]} event
        client (-> @origin :client :default)
        data (if (map? data) data {:data data})]
    (notifos/working "")
    (clients/send (eval/get-client! {:command command
                                     :origin origin
                                     :info info
                                     :create try-connect})
                  command data :only origin)))

(defn send-whole-file-command [event command]
  (let [{:keys [origin]} event]
    (send-api-command event command (tabs/->path origin))))

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
