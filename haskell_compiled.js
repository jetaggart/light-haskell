if(!lt.util.load.provided_QMARK_('lt.plugins.haskell')) {
goog.provide('lt.plugins.haskell');
goog.require('cljs.core');
goog.require('lt.util.dom');
goog.require('goog.events');
goog.require('lt.objs.notifos');
goog.require('lt.objs.notifos');
goog.require('lt.util.dom');
goog.require('lt.object');
goog.require('lt.object');
goog.require('goog.events');
goog.require('lt.plugins.doc');
goog.require('lt.plugins.doc');

lt.plugins.haskell.convert_doc_result = (function convert_doc_result(hoogle_doc){return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),hoogle_doc.self,new cljs.core.Keyword(null,"ns","ns",1013907767),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"a","a",1013904339),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"href","href",1017115293),hoogle_doc.location], null),"hoogle"], null),new cljs.core.Keyword(null,"doc","doc",1014003882),hoogle_doc.docs], null);
});

lt.plugins.haskell.convert_response = (function convert_response(response){var results = response.target.getResponseJson().results;return cljs.core.map.call(null,lt.plugins.haskell.convert_doc_result,results);
});

lt.plugins.haskell.handle_hoogle_response = (function handle_hoogle_response(response){return lt.object.raise.call(null,lt.plugins.doc.doc_search,new cljs.core.Keyword(null,"doc.search.results","doc.search.results",3363305624),lt.plugins.haskell.convert_response.call(null,response));
});

lt.plugins.haskell.hoogle = (function hoogle(query){var xhr = (new goog.net.XhrIo());cljs.core.println.call(null,"Hoogl google");
goog.events.listen(xhr,"complete",lt.plugins.haskell.handle_hoogle_response);
return xhr.send([cljs.core.str("http://www.haskell.org/hoogle?mode=json&count=10&start=1&hoogle="),cljs.core.str(query)].join(''));
});

lt.plugins.haskell.haskell_doc_search_exec = (function haskell_doc_search_exec(query){return lt.objs.notifos.working.call(null,[cljs.core.str("Searching for haskell docs: "),cljs.core.str(query)].join(''),lt.plugins.haskell.hoogle.call(null,query));
});

lt.plugins.haskell.__BEH__haskell_doc_search = (function __BEH__haskell_doc_search(this$,cur){return cljs.core.conj.call(null,cur,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"label","label",1116631654),"hs",new cljs.core.Keyword(null,"trigger","trigger",4248979754),lt.plugins.haskell.haskell_doc_search_exec,new cljs.core.Keyword(null,"file-types","file-types",1727875162),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, ["Haskell",null], null), null)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-doc-search","lt.plugins.haskell/haskell-doc-search",2214663896),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_doc_search,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"types+","types+",4450069060),null], null), null));

}

//# sourceMappingURL=