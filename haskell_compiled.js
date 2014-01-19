if(!lt.util.load.provided_QMARK_('lt.plugins.haskell')) {
goog.provide('lt.plugins.haskell');
goog.require('cljs.core');
goog.require('lt.objs.plugins');
goog.require('lt.objs.files');
goog.require('goog.events');
goog.require('lt.objs.tabs');
goog.require('goog.string');
goog.require('lt.objs.popup');
goog.require('lt.objs.dialogs');
goog.require('lt.objs.popup');
goog.require('lt.objs.notifos');
goog.require('lt.objs.proc');
goog.require('lt.objs.notifos');
goog.require('lt.objs.editor.pool');
goog.require('goog.string');
goog.require('lt.objs.command');
goog.require('lt.objs.files');
goog.require('lt.objs.clients.tcp');
goog.require('lt.objs.sidebar.clients');
goog.require('lt.objs.plugins');
goog.require('lt.objs.eval');
goog.require('lt.objs.clients');
goog.require('lt.objs.clients.tcp');
goog.require('lt.util.load');
goog.require('clojure.string');
goog.require('clojure.string');
goog.require('lt.objs.editor');
goog.require('lt.object');
goog.require('lt.object');
goog.require('lt.objs.dialogs');
goog.require('lt.util.load');
goog.require('lt.objs.proc');
goog.require('lt.objs.tabs');
goog.require('lt.objs.eval');
goog.require('lt.objs.clients');
goog.require('lt.objs.editor.pool');
goog.require('lt.objs.sidebar.clients');
goog.require('goog.events');
goog.require('lt.objs.command');
goog.require('lt.plugins.doc');
goog.require('lt.objs.editor');
goog.require('lt.plugins.doc');

lt.plugins.haskell.perform_api_search = (function perform_api_search(base_url,query,handler){var xhr = (new goog.net.XhrIo());goog.events.listen(xhr,"complete",lt.plugins.haskell.wrap_handler.call(null,handler));
return xhr.send([cljs.core.str(base_url),cljs.core.str(goog.string.urlEncode(query))].join(''));
});

lt.plugins.haskell.wrap_handler = (function wrap_handler(handler){return (function (event){var response = event.target;if(cljs.core.truth_(response.isSuccess()))
{return handler.call(null,response);
} else
{return lt.objs.notifos.done_working.call(null,"Failed to connect to handler. Try again");
}
});
});

lt.plugins.haskell.hayoo__GT_url = "http://holumbus.fh-wedel.de/hayoo/hayoo.json?query=";

lt.plugins.haskell.hayoo = (function hayoo(query,handler){return lt.plugins.haskell.perform_api_search.call(null,lt.plugins.haskell.hayoo__GT_url,query,handler);
});

lt.plugins.haskell.hayoo__GT_parse = (function hayoo__GT_parse(response){return response.getResponseJson().functions;
});

lt.plugins.haskell.hayoo__GT_convert_doc = (function hayoo__GT_convert_doc(hayoo_doc){if((hayoo_doc == null))
{return null;
} else
{var location = hayoo_doc.uri;var func_name = [cljs.core.str(hayoo_doc.name),cljs.core.str(" :: "),cljs.core.str(hayoo_doc.signature)].join('');return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),func_name,new cljs.core.Keyword(null,"ns","ns",1013907767),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"a","a",1013904339),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"href","href",1017115293),location], null),[cljs.core.str("Hayoo("),cljs.core.str(hayoo_doc.module),cljs.core.str(")")].join('')], null),new cljs.core.Keyword(null,"doc","doc",1014003882),hayoo_doc.description], null);
}
});

lt.plugins.haskell.hoogle__GT_url = "http://www.haskell.org/hoogle?mode=json&count=10&start=1&hoogle=";

lt.plugins.haskell.hoogle = (function hoogle(query,handler){return lt.plugins.haskell.perform_api_search.call(null,lt.plugins.haskell.hoogle__GT_url,query,handler);
});

lt.plugins.haskell.hoogle__GT_parse = (function hoogle__GT_parse(response){return response.getResponseJson().results;
});

lt.plugins.haskell.hoogle__GT_convert_doc = (function hoogle__GT_convert_doc(hoogle_doc){if((hoogle_doc == null))
{return null;
} else
{var location = hoogle_doc.location;var vec__8498 = /http:\/\/hackage.haskell.org\/packages\/archive\/(.+)\/latest\/doc\/html\/(.+).html/.exec(location);var with_mod = cljs.core.nth.call(null,vec__8498,0,null);var mod_package = cljs.core.nth.call(null,vec__8498,1,null);var module_name = cljs.core.nth.call(null,vec__8498,2,null);var explanation = (((with_mod == null))?"":[cljs.core.str(" ("),cljs.core.str(mod_package),cljs.core.str(": "),cljs.core.str(module_name.replace("-",".")),cljs.core.str(")")].join(''));return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),hoogle_doc.self,new cljs.core.Keyword(null,"ns","ns",1013907767),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"a","a",1013904339),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"href","href",1017115293),location], null),[cljs.core.str("Hoogle"),cljs.core.str(explanation)].join('')], null),new cljs.core.Keyword(null,"doc","doc",1014003882),hoogle_doc.docs], null);
}
});

lt.plugins.haskell.convert_results = (function convert_results(results){var parsed_results = lt.plugins.haskell.hoogle__GT_parse.call(null,results);return cljs.core.map.call(null,lt.plugins.haskell.hoogle__GT_convert_doc,parsed_results);
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

lt.plugins.haskell.inline_hayoo_doc = (function inline_hayoo_doc(editor,results){var loc = lt.objs.editor.__GT_cursor.call(null,editor);var doc = lt.plugins.haskell.hayoo__GT_convert_doc.call(null,cljs.core.first.call(null,lt.plugins.haskell.hayoo__GT_parse.call(null,results)));if((doc == null))
{return lt.objs.notifos.set_msg_BANG_.call(null,"No docs found",new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"class","class",1108647146),"error"], null));
} else
{return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.doc.show!","editor.doc.show!",1417900223),cljs.core.assoc.call(null,doc,new cljs.core.Keyword(null,"loc","loc",1014011570),loc));
}
});

lt.plugins.haskell.haskell_inline_doc = (function haskell_inline_doc(editor){var token = new cljs.core.Keyword(null,"string","string",4416885635).cljs$core$IFn$_invoke$arity$1(lt.plugins.haskell.find_symbol_at_cursor.call(null,editor));if((token == null))
{return lt.objs.notifos.set_msg_BANG_.call(null,"No docs found",new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"class","class",1108647146),"error"], null));
} else
{return lt.plugins.haskell.hayoo.call(null,token,lt.plugins.haskell.with_editor.call(null,editor,lt.plugins.haskell.inline_hayoo_doc));
}
});

lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-doc","lt.plugins.haskell/haskell-doc",3239168865),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.haskell_inline_doc,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.doc","editor.doc",3751347369),null], null), null));

lt.plugins.haskell.format_inline_error = (function format_inline_error(error){var split_error = error.split(":");return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"msg","msg",1014012659),clojure.string.replace.call(null,clojure.string.join.call(null,cljs.core.drop.call(null,3,split_error)),/\s+/," "),new cljs.core.Keyword(null,"loc","loc",1014011570),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",1017226086),(parseInt(cljs.core.nth.call(null,split_error,1)) - 1),new cljs.core.Keyword(null,"ch","ch",1013907415),1,new cljs.core.Keyword(null,"start-line","start-line",3689311729),(parseInt(cljs.core.nth.call(null,split_error,1)) - 1)], null)], null);
});

lt.plugins.haskell.print_inline_error = (function print_inline_error(editor,error){var formatted_error = lt.plugins.haskell.format_inline_error.call(null,error);return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.exception","editor.exception",3983021184),new cljs.core.Keyword(null,"msg","msg",1014012659).cljs$core$IFn$_invoke$arity$1(formatted_error),new cljs.core.Keyword(null,"loc","loc",1014011570).cljs$core$IFn$_invoke$arity$1(formatted_error));
});

lt.plugins.haskell.print_inline_errors = (function print_inline_errors(editor,data){var seq__8503 = cljs.core.seq.call(null,data);var chunk__8504 = null;var count__8505 = 0;var i__8506 = 0;while(true){
if((i__8506 < count__8505))
{var error = cljs.core._nth.call(null,chunk__8504,i__8506);lt.plugins.haskell.print_syntax_error.call(null,editor,error);
{
var G__8519 = seq__8503;
var G__8520 = chunk__8504;
var G__8521 = count__8505;
var G__8522 = (i__8506 + 1);
seq__8503 = G__8519;
chunk__8504 = G__8520;
count__8505 = G__8521;
i__8506 = G__8522;
continue;
}
} else
{var temp__4092__auto__ = cljs.core.seq.call(null,seq__8503);if(temp__4092__auto__)
{var seq__8503__$1 = temp__4092__auto__;if(cljs.core.chunked_seq_QMARK_.call(null,seq__8503__$1))
{var c__6528__auto__ = cljs.core.chunk_first.call(null,seq__8503__$1);{
var G__8523 = cljs.core.chunk_rest.call(null,seq__8503__$1);
var G__8524 = c__6528__auto__;
var G__8525 = cljs.core.count.call(null,c__6528__auto__);
var G__8526 = 0;
seq__8503 = G__8523;
chunk__8504 = G__8524;
count__8505 = G__8525;
i__8506 = G__8526;
continue;
}
} else
{var error = cljs.core.first.call(null,seq__8503__$1);lt.plugins.haskell.print_syntax_error.call(null,editor,error);
{
var G__8527 = cljs.core.next.call(null,seq__8503__$1);
var G__8528 = null;
var G__8529 = 0;
var G__8530 = 0;
seq__8503 = G__8527;
chunk__8504 = G__8528;
count__8505 = G__8529;
i__8506 = G__8530;
continue;
}
}
} else
{return null;
}
}
break;
}
});

lt.plugins.haskell.handle_inline_errors = (function handle_inline_errors(editor,result){var data = new cljs.core.Keyword(null,"data","data",1016980252).cljs$core$IFn$_invoke$arity$1(result);if(cljs.core.empty_QMARK_.call(null,data))
{return lt.objs.notifos.done_working.call(null,"");
} else
{lt.objs.notifos.set_msg_BANG_.call(null,"Haskell: please check inline syntax errors",new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"class","class",1108647146),"error"], null));
return lt.plugins.haskell.print_inline_errors.call(null,editor,data);
}
});

lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","editor-syntax-result","lt.plugins.haskell/editor-syntax-result",3171586153),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.handle_inline_errors,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.haskell.syntax.result","editor.haskell.syntax.result",1272671167),null], null), null));

lt.plugins.haskell.__BEH__haskell_syntax = (function __BEH__haskell_syntax(editor){return lt.object.raise.call(null,lt.plugins.haskell.haskell,new cljs.core.Keyword(null,"haskell.send.syntax","haskell.send.syntax",1628714881),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"origin","origin",4300251800),editor], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-syntax","lt.plugins.haskell/haskell-syntax",3328222046),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_syntax,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.syntax","haskell.syntax",4762798223),null], null), null));

lt.plugins.haskell.__BEH__haskell_send_syntax = (function __BEH__haskell_send_syntax(_,event){return lt.plugins.haskell.send_whole_file_command.call(null,event,new cljs.core.Keyword(null,"haskell.api.syntax","haskell.api.syntax",2629162467));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-send-syntax","lt.plugins.haskell/haskell-send-syntax",4443909361),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_send_syntax,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.send.syntax","haskell.send.syntax",1628714881),null], null), null));

lt.objs.command.command.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"command","command",1964298941),new cljs.core.Keyword(null,"check-syntax","check-syntax",3979045818),new cljs.core.Keyword(null,"desc","desc",1016984067),"Haskell: Check syntax",new cljs.core.Keyword(null,"exec","exec",1017031683),(function (){var temp__4092__auto__ = lt.objs.editor.pool.last_active.call(null);if(cljs.core.truth_(temp__4092__auto__))
{var ed = temp__4092__auto__;return lt.object.raise.call(null,ed,new cljs.core.Keyword(null,"haskell.syntax","haskell.syntax",4762798223));
} else
{return null;
}
})], null));

lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","editor-lint-result","lt.plugins.haskell/editor-lint-result",3355086921),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.handle_inline_errors,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.haskell.lint.result","editor.haskell.lint.result",2200318175),null], null), null));

lt.plugins.haskell.__BEH__haskell_send_lint = (function __BEH__haskell_send_lint(this$,event){return lt.plugins.haskell.send_whole_file_command.call(null,event,new cljs.core.Keyword(null,"haskell.api.lint","haskell.api.lint",3607537027));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-send-lint","lt.plugins.haskell/haskell-send-lint",4154958481),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_send_lint,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.send.lint","haskell.send.lint",1278006945),null], null), null));

lt.plugins.haskell.__BEH__haskell_lint = (function __BEH__haskell_lint(editor){return lt.object.raise.call(null,lt.plugins.haskell.haskell,new cljs.core.Keyword(null,"haskell.send.lint","haskell.send.lint",1278006945),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"origin","origin",4300251800),editor], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lint","lt.plugins.haskell/haskell-lint",681514942),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_lint,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.lint","haskell.lint",2228753199),null], null), null));

lt.objs.command.command.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"command","command",1964298941),new cljs.core.Keyword(null,"check-lint","check-lint",4744135962),new cljs.core.Keyword(null,"desc","desc",1016984067),"Haskell: Check lint",new cljs.core.Keyword(null,"exec","exec",1017031683),(function (){var temp__4092__auto__ = lt.objs.editor.pool.last_active.call(null);if(cljs.core.truth_(temp__4092__auto__))
{var ed = temp__4092__auto__;return lt.object.raise.call(null,ed,new cljs.core.Keyword(null,"haskell.lint","haskell.lint",2228753199));
} else
{return null;
}
})], null));

lt.plugins.haskell.__BEH__editor_reformat_result = (function __BEH__editor_reformat_result(editor,result){return lt.plugins.haskell.replace_buffer.call(null,new cljs.core.Keyword(null,"data","data",1016980252).cljs$core$IFn$_invoke$arity$1(result));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","editor-reformat-result","lt.plugins.haskell/editor-reformat-result",4029576450),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__editor_reformat_result,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.haskell.reformat.result","editor.haskell.reformat.result",3863060632),null], null), null));

lt.plugins.haskell.__BEH__haskell_reformat = (function __BEH__haskell_reformat(editor){return lt.object.raise.call(null,lt.plugins.haskell.haskell,new cljs.core.Keyword(null,"haskell.send.reformat","haskell.send.reformat",890242184),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"origin","origin",4300251800),editor], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-reformat","lt.plugins.haskell/haskell-reformat",3458152869),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_reformat,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.reformat","haskell.reformat",1972259350),null], null), null));

lt.plugins.haskell.__BEH__haskell_send_reformat = (function __BEH__haskell_send_reformat(this$,event){return lt.plugins.haskell.send_api_command.call(null,event,new cljs.core.Keyword(null,"haskell.api.reformat","haskell.api.reformat",4542665322),lt.plugins.haskell.current_buffer_content.call(null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-send-reformat","lt.plugins.haskell/haskell-send-reformat",2387814392),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_send_reformat,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.send.reformat","haskell.send.reformat",890242184),null], null), null));

lt.objs.command.command.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"command","command",1964298941),new cljs.core.Keyword(null,"reformat-file","reformat-file",3490158833),new cljs.core.Keyword(null,"desc","desc",1016984067),"Haskell: Reformat file",new cljs.core.Keyword(null,"exec","exec",1017031683),(function (){var temp__4092__auto__ = lt.objs.editor.pool.last_active.call(null);if(cljs.core.truth_(temp__4092__auto__))
{var ed = temp__4092__auto__;return lt.object.raise.call(null,ed,new cljs.core.Keyword(null,"haskell.reformat","haskell.reformat",1972259350));
} else
{return null;
}
})], null));

lt.plugins.haskell.shell = lt.util.load.node_module.call(null,"shelljs");

lt.plugins.haskell.lt_haskell_path = lt.objs.files.join.call(null,lt.objs.plugins._STAR_plugin_dir_STAR_,"haskell/LTHaskellClient.hs");

lt.plugins.haskell.__BEH__on_out = (function __BEH__on_out(this$,data){var out = data.toString();lt.object.update_BANG_.call(null,this$,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"buffer","buffer",3930752946)], null),cljs.core.str,out);
if((out.indexOf("Connected") > -1))
{lt.objs.notifos.done_working.call(null);
return lt.object.merge_BANG_.call(null,this$,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"connected","connected",4729661051),true], null));
} else
{return null;
}
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-out","lt.plugins.haskell/on-out",3479204322),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_out,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"proc.out","proc.out",4302083112),null], null), null));

lt.plugins.haskell.__BEH__on_error = (function __BEH__on_error(this$,data){var out = data.toString();return cljs.core.println.call(null,"Process errored: ",out);
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-error","lt.plugins.haskell/on-error",4176683164),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_error,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"proc.error","proc.error",4143512802),null], null), null));

lt.plugins.haskell.__BEH__on_exit = (function __BEH__on_exit(this$,data){return cljs.core.println.call(null,"Process exited: ",data);
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-exit","lt.plugins.haskell/on-exit",3263426510),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_exit,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"proc.exit","proc.exit",4162906152),null], null), null));

lt.object.object_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","connecting-notifier","lt.plugins.haskell/connecting-notifier",4244447005),new cljs.core.Keyword(null,"triggers","triggers",2516997421),cljs.core.PersistentVector.EMPTY,new cljs.core.Keyword(null,"behaviors","behaviors",607554515),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword("lt.plugins.haskell","on-out","lt.plugins.haskell/on-out",3479204322),new cljs.core.Keyword("lt.plugins.haskell","on-error","lt.plugins.haskell/on-error",4176683164),new cljs.core.Keyword("lt.plugins.haskell","on-exit","lt.plugins.haskell/on-exit",3263426510)], null),new cljs.core.Keyword(null,"init","init",1017141378),(function (this$,info){lt.object.merge_BANG_.call(null,this$,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"info","info",1017141280),info], null));
return null;
}));

lt.plugins.haskell.run_haskell = (function run_haskell(p__8507){var map__8509 = p__8507;var map__8509__$1 = ((cljs.core.seq_QMARK_.call(null,map__8509))?cljs.core.apply.call(null,cljs.core.hash_map,map__8509):map__8509);var info = map__8509__$1;var client = cljs.core.get.call(null,map__8509__$1,new cljs.core.Keyword(null,"client","client",3951159101));var name = cljs.core.get.call(null,map__8509__$1,new cljs.core.Keyword(null,"name","name",1017277949));var path = cljs.core.get.call(null,map__8509__$1,new cljs.core.Keyword(null,"path","path",1017337751));var obj = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","connecting-notifier","lt.plugins.haskell/connecting-notifier",4244447005),info);var client_id = lt.objs.clients.__GT_id.call(null,client);lt.object.merge_BANG_.call(null,client,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"port","port",1017351155),lt.objs.clients.tcp.port,new cljs.core.Keyword(null,"proc","proc",1017353928),obj], null));
lt.objs.notifos.working.call(null,"Connecting..");
return lt.objs.proc.exec.call(null,new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"command","command",1964298941),"runhaskell",new cljs.core.Keyword(null,"args","args",1016906831),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [lt.plugins.haskell.lt_haskell_path,lt.objs.clients.tcp.port,client_id], null),new cljs.core.Keyword(null,"cwd","cwd",1014003170),lt.objs.files.parent.call(null,path),new cljs.core.Keyword(null,"env","env",1014004831),new cljs.core.PersistentArrayMap(null, 1, ["HASKELL_PATH",lt.objs.files.join.call(null,lt.objs.files.parent.call(null,path))], null),new cljs.core.Keyword(null,"obj","obj",1014014057),obj], null));
});

lt.plugins.haskell.check_haskell = (function check_haskell(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell","haskell",1711527270),lt.plugins.haskell.shell.which("runhaskell"));
});

lt.plugins.haskell.check_client = (function check_client(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell-client","haskell-client",3405059382),lt.objs.files.exists_QMARK_.call(null,lt.plugins.haskell.lt_haskell_path));
});

lt.plugins.haskell.handle_no_haskell = (function handle_no_haskell(client){lt.objs.clients.rem_BANG_.call(null,client);
return lt.objs.popup.popup_BANG_.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"header","header",4087600639),"We couldn't find runhaskell.",new cljs.core.Keyword(null,"body","body",1016933652),"In order to start a haskell client, you have to have the haskell and haskell-platform installed and on your system's PATH.",new cljs.core.Keyword(null,"buttons","buttons",1255256819),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"label","label",1116631654),"Download Haskell Platform",new cljs.core.Keyword(null,"action","action",3885920680),(function (){return platform.open.call(null,"http://www.haskell.org/platform/");
})], null),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"label","label",1116631654),"ok"], null)], null)], null));
});

lt.plugins.haskell.notify = (function notify(obj){var map__8511 = obj;var map__8511__$1 = ((cljs.core.seq_QMARK_.call(null,map__8511))?cljs.core.apply.call(null,cljs.core.hash_map,map__8511):map__8511);var client = cljs.core.get.call(null,map__8511__$1,new cljs.core.Keyword(null,"client","client",3951159101));var path = cljs.core.get.call(null,map__8511__$1,new cljs.core.Keyword(null,"path","path",1017337751));var haskell = cljs.core.get.call(null,map__8511__$1,new cljs.core.Keyword(null,"haskell","haskell",1711527270));if((cljs.core.not.call(null,haskell)) || (cljs.core.empty_QMARK_.call(null,haskell)))
{lt.plugins.haskell.handle_no_haskell.call(null,client);
} else
{if(new cljs.core.Keyword(null,"else","else",1017020587))
{lt.plugins.haskell.run_haskell.call(null,obj);
} else
{}
}
return obj;
});

lt.plugins.haskell.check_all = (function check_all(obj){return lt.plugins.haskell.notify.call(null,lt.plugins.haskell.check_client.call(null,lt.plugins.haskell.check_haskell.call(null,obj)));
});

lt.plugins.haskell.try_connect = (function try_connect(p__8512){var map__8514 = p__8512;var map__8514__$1 = ((cljs.core.seq_QMARK_.call(null,map__8514))?cljs.core.apply.call(null,cljs.core.hash_map,map__8514):map__8514);var info = cljs.core.get.call(null,map__8514__$1,new cljs.core.Keyword(null,"info","info",1017141280));var path = new cljs.core.Keyword(null,"path","path",1017337751).cljs$core$IFn$_invoke$arity$1(info);var client = lt.objs.clients.client_BANG_.call(null,new cljs.core.Keyword(null,"haskell.client","haskell.client",4292563063));lt.plugins.haskell.check_all.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"path","path",1017337751),path,new cljs.core.Keyword(null,"client","client",3951159101),client], null));
return client;
});

lt.plugins.haskell.__BEH__connect = (function __BEH__connect(this$,path){return lt.plugins.haskell.try_connect.call(null,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"info","info",1017141280),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"path","path",1017337751),path], null)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","connect","lt.plugins.haskell/connect",1510312044),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__connect,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"connect","connect",1965255772),null], null), null));

lt.object.object_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705),new cljs.core.Keyword(null,"tags","tags",1017456523),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.lang","haskell.lang",2228745498),null], null), null));

lt.plugins.haskell.haskell = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705));

lt.objs.sidebar.clients.add_connector.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),"Haskell",new cljs.core.Keyword(null,"desc","desc",1016984067),"Select a directory to serve as the root of your haskell project.",new cljs.core.Keyword(null,"connect","connect",1965255772),(function (){return lt.objs.dialogs.dir.call(null,lt.plugins.haskell.haskell,new cljs.core.Keyword(null,"connect","connect",1965255772));
})], null));

lt.plugins.haskell.send_api_command = (function send_api_command(event,command,data){var map__8516 = event;var map__8516__$1 = ((cljs.core.seq_QMARK_.call(null,map__8516))?cljs.core.apply.call(null,cljs.core.hash_map,map__8516):map__8516);var origin = cljs.core.get.call(null,map__8516__$1,new cljs.core.Keyword(null,"origin","origin",4300251800));var info = cljs.core.get.call(null,map__8516__$1,new cljs.core.Keyword(null,"info","info",1017141280));var client = new cljs.core.Keyword(null,"default","default",2558708147).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"client","client",3951159101).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,origin)));lt.objs.notifos.working.call(null,"");
return lt.objs.clients.send.call(null,lt.objs.eval.get_client_BANG_.call(null,new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"command","command",1964298941),command,new cljs.core.Keyword(null,"origin","origin",4300251800),origin,new cljs.core.Keyword(null,"info","info",1017141280),info,new cljs.core.Keyword(null,"create","create",3956577390),lt.plugins.haskell.try_connect], null)),command,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"data","data",1016980252),data], null),new cljs.core.Keyword(null,"only","only",1017320222),origin);
});

lt.plugins.haskell.send_whole_file_command = (function send_whole_file_command(event,command){var map__8518 = event;var map__8518__$1 = ((cljs.core.seq_QMARK_.call(null,map__8518))?cljs.core.apply.call(null,cljs.core.hash_map,map__8518):map__8518);var origin = cljs.core.get.call(null,map__8518__$1,new cljs.core.Keyword(null,"origin","origin",4300251800));return lt.plugins.haskell.send_api_command.call(null,event,command,lt.objs.tabs.__GT_path.call(null,origin));
});

lt.plugins.haskell.current_buffer_content = (function current_buffer_content(){var cm = lt.objs.editor.__GT_cm_ed.call(null,lt.objs.editor.pool.last_active.call(null));return cm.getRange({"ch": 0, "line": 0},{"ch": 0, "line": lt.objs.editor.__GT_cm_ed.call(null,lt.objs.editor.pool.last_active.call(null)).lineCount()});
});

lt.plugins.haskell.replace_buffer = (function replace_buffer(string){var temp__4092__auto__ = lt.objs.editor.pool.last_active.call(null);if(cljs.core.truth_(temp__4092__auto__))
{var ed = temp__4092__auto__;return lt.objs.editor.__GT_cm_ed.call(null,ed).replaceRange(string,{"ch": 0, "line": 0},{"ch": 0, "line": lt.objs.editor.__GT_cm_ed.call(null,lt.objs.editor.pool.last_active.call(null)).lineCount()});
} else
{return null;
}
});

}

//# sourceMappingURL=