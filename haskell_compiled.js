if(!lt.util.load.provided_QMARK_('lt.plugins.haskell')) {
goog.provide('lt.plugins.haskell');
goog.require('cljs.core');
goog.require('lt.util.dom');
goog.require('goog.events');
goog.require('lt.objs.notifos');
goog.require('lt.objs.notifos');
goog.require('lt.util.dom');
goog.require('lt.objs.editor');
goog.require('lt.object');
goog.require('lt.object');
goog.require('goog.events');
goog.require('lt.plugins.doc');
goog.require('lt.objs.editor');
goog.require('lt.plugins.doc');

lt.plugins.haskell.hoogle__GT_url = "http://www.haskell.org/hoogle?mode=json&count=10&start=1&hoogle=";

lt.plugins.haskell.hoogle = (function hoogle(query,handler){var xhr = (new goog.net.XhrIo());goog.events.listen(xhr,"complete",lt.plugins.haskell.hoogle__GT_wrap_handler.call(null,handler));
return xhr.send([cljs.core.str(lt.plugins.haskell.hoogle__GT_url),cljs.core.str(query)].join(''));
});

lt.plugins.haskell.hoogle__GT_parse = (function hoogle__GT_parse(response){return response.getResponseJson().results;
});

lt.plugins.haskell.hoogle__GT_wrap_handler = (function hoogle__GT_wrap_handler(handler){return (function (event){var response = event.target;if(cljs.core.truth_(response.isSuccess()))
{return handler.call(null,lt.plugins.haskell.hoogle__GT_parse.call(null,response));
} else
{return lt.objs.notifos.done_working.call(null,"Failed to connect to hoogle. Try again");
}
});
});

lt.plugins.haskell.convert_doc_result = (function convert_doc_result(hoogle_doc){if((hoogle_doc == null))
{return null;
} else
{return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),hoogle_doc.self,new cljs.core.Keyword(null,"ns","ns",1013907767),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"a","a",1013904339),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"href","href",1017115293),hoogle_doc.location], null),"hoogle"], null),new cljs.core.Keyword(null,"doc","doc",1014003882),hoogle_doc.docs], null);
}
});

lt.plugins.haskell.convert_results = (function convert_results(results){return cljs.core.map.call(null,lt.plugins.haskell.convert_doc_result,results);
});

lt.plugins.haskell.sidebar_hoogle_response = (function sidebar_hoogle_response(results){return lt.object.raise.call(null,lt.plugins.doc.doc_search,new cljs.core.Keyword(null,"doc.search.results","doc.search.results",3363305624),lt.plugins.haskell.convert_results.call(null,results));
});

lt.plugins.haskell.haskell_doc_search_exec = (function haskell_doc_search_exec(query){return lt.objs.notifos.working.call(null,[cljs.core.str("Searching for haskell docs: "),cljs.core.str(query)].join(''),lt.plugins.haskell.hoogle.call(null,query,lt.plugins.haskell.sidebar_hoogle_response));
});

lt.plugins.haskell.haskell_doc_search = (function haskell_doc_search(this$,cur){return cljs.core.conj.call(null,cur,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"label","label",1116631654),"hs",new cljs.core.Keyword(null,"trigger","trigger",4248979754),lt.plugins.haskell.haskell_doc_search_exec,new cljs.core.Keyword(null,"file-types","file-types",1727875162),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, ["Haskell",null], null), null)], null));
});

lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-doc-search","lt.plugins.haskell/haskell-doc-search",2214663896),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.haskell_doc_search,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"types+","types+",4450069060),null], null), null));

lt.plugins.haskell.symbol_token_QMARK_ = (function symbol_token_QMARK_(s){return cljs.core.re_seq.call(null,/[\w\$_\-\.\*\+\\/\?\><!]/,s);
});

lt.plugins.haskell.find_symbol_at_cursor = (function find_symbol_at_cursor(editor){var loc = lt.objs.editor.__GT_cursor.call(null,editor);var token_left = lt.objs.editor.__GT_token.call(null,editor,loc);var token_right = lt.objs.editor.__GT_token.call(null,editor,cljs.core.update_in.call(null,loc,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"ch","ch",1013907415)], null),cljs.core.inc));var or__5799__auto__ = (cljs.core.truth_(lt.plugins.haskell.symbol_token_QMARK_.call(null,new cljs.core.Keyword(null,"string","string",4416885635).cljs$core$IFn$_invoke$arity$1(token_right)))?cljs.core.assoc.call(null,token_right,new cljs.core.Keyword(null,"loc","loc",1014011570),loc):null);if(cljs.core.truth_(or__5799__auto__))
{return or__5799__auto__;
} else
{if(cljs.core.truth_(lt.plugins.haskell.symbol_token_QMARK_.call(null,new cljs.core.Keyword(null,"string","string",4416885635).cljs$core$IFn$_invoke$arity$1(token_left))))
{return cljs.core.assoc.call(null,token_left,new cljs.core.Keyword(null,"loc","loc",1014011570),loc);
} else
{return null;
}
}
});

lt.plugins.haskell.with_editor = (function with_editor(editor,func){return (function (results){return func.call(null,editor,results);
});
});

lt.plugins.haskell.inline_hoogle_doc = (function inline_hoogle_doc(editor,results){var loc = lt.objs.editor.__GT_cursor.call(null,editor);var doc = lt.plugins.haskell.convert_doc_result.call(null,cljs.core.first.call(null,results));if((doc == null))
{return lt.objs.notifos.set_msg_BANG_.call(null,"No docs found",new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"class","class",1108647146),"error"], null));
} else
{return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.doc.show!","editor.doc.show!",1417900223),cljs.core.assoc.call(null,doc,new cljs.core.Keyword(null,"loc","loc",1014011570),loc));
}
});

lt.plugins.haskell.haskell_inline_doc = (function haskell_inline_doc(editor){var token = new cljs.core.Keyword(null,"string","string",4416885635).cljs$core$IFn$_invoke$arity$1(lt.plugins.haskell.find_symbol_at_cursor.call(null,editor));if((token == null))
{return lt.objs.notifos.set_msg_BANG_.call(null,"No docs found",new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"class","class",1108647146),"error"], null));
} else
{return lt.plugins.haskell.hoogle.call(null,token,lt.plugins.haskell.with_editor.call(null,editor,lt.plugins.haskell.inline_hoogle_doc));
}
});

lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-doc","lt.plugins.haskell/haskell-doc",3239168865),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.haskell_inline_doc,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.doc","editor.doc",3751347369),null], null), null));

}

//# sourceMappingURL=