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
lt.plugins.haskell.shell = lt.util.load.node_module.call(null,"shelljs");
lt.plugins.haskell.shell.which("cabal");
lt.plugins.haskell.plugin_dir = lt.objs.plugins._STAR_plugin_dir_STAR_;
lt.plugins.haskell.binary_path = lt.objs.files.join.call(null,lt.plugins.haskell.plugin_dir,"./run-server.sh");
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
{var location = hoogle_doc.location;var vec__8191 = /http:\/\/hackage.haskell.org\/packages\/archive\/(.+)\/latest\/doc\/html\/(.+).html/.exec(location);var with_mod = cljs.core.nth.call(null,vec__8191,0,null);var mod_package = cljs.core.nth.call(null,vec__8191,1,null);var module_name = cljs.core.nth.call(null,vec__8191,2,null);var explanation = (((with_mod == null))?"":[cljs.core.str(" ("),cljs.core.str(mod_package),cljs.core.str(": "),cljs.core.str(clojure.string.replace.call(null,module_name,"-",".")),cljs.core.str(")")].join(''));return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),hoogle_doc.self,new cljs.core.Keyword(null,"ns","ns",1013907767),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"a","a",1013904339),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"href","href",1017115293),location], null),[cljs.core.str("Hoogle"),cljs.core.str(explanation)].join('')], null),new cljs.core.Keyword(null,"doc","doc",1014003882),hoogle_doc.docs], null);
}
});
lt.plugins.haskell.convert_hoogle_results = (function convert_hoogle_results(results){var parsed_results = lt.plugins.haskell.hoogle__GT_parse.call(null,results);return cljs.core.map.call(null,lt.plugins.haskell.hoogle__GT_convert_doc,parsed_results);
});
lt.plugins.haskell.convert_hayoo_results = (function convert_hayoo_results(results){var parsed_results = lt.plugins.haskell.hayoo__GT_parse.call(null,results);return cljs.core.map.call(null,lt.plugins.haskell.hayoo__GT_convert_doc,parsed_results);
});
lt.plugins.haskell.sidebar_hoogle_response = (function sidebar_hoogle_response(results){return lt.object.raise.call(null,lt.plugins.doc.doc_search,new cljs.core.Keyword(null,"doc.search.results","doc.search.results",3363305624),lt.plugins.haskell.convert_hoogle_results.call(null,results));
});
lt.plugins.haskell.sidebar_hayoo_response = (function sidebar_hayoo_response(results){return lt.object.raise.call(null,lt.plugins.doc.doc_search,new cljs.core.Keyword(null,"doc.search.results","doc.search.results",3363305624),lt.plugins.haskell.convert_hayoo_results.call(null,results));
});
lt.plugins.haskell.haskell_doc_hoogle_exec = (function haskell_doc_hoogle_exec(query){return lt.objs.notifos.working.call(null,[cljs.core.str("Hoogling: "),cljs.core.str(query)].join(''),lt.plugins.haskell.hoogle.call(null,query,lt.plugins.haskell.sidebar_hoogle_response));
});
lt.plugins.haskell.haskell_doc_hayoo_exec = (function haskell_doc_hayoo_exec(query){return lt.objs.notifos.working.call(null,[cljs.core.str("Hayooing: "),cljs.core.str(query)].join(''),lt.plugins.haskell.hayoo.call(null,query,lt.plugins.haskell.sidebar_hayoo_response));
});
lt.plugins.haskell.haskell_doc_search = (function haskell_doc_search(this$,cur){return cljs.core.conj.call(null,cur,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"label","label",1116631654),"hsh",new cljs.core.Keyword(null,"trigger","trigger",4248979754),lt.plugins.haskell.haskell_doc_hoogle_exec,new cljs.core.Keyword(null,"file-types","file-types",1727875162),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, ["Haskell",null], null), null)], null),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"label","label",1116631654),"hsy",new cljs.core.Keyword(null,"trigger","trigger",4248979754),lt.plugins.haskell.haskell_doc_hayoo_exec,new cljs.core.Keyword(null,"file-types","file-types",1727875162),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, ["Haskell",null], null), null)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-doc-search","lt.plugins.haskell/haskell-doc-search",2214663896),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.haskell_doc_search,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"types+","types+",4450069060),null], null), null));
lt.plugins.haskell.symbol_token_QMARK_ = (function symbol_token_QMARK_(s){return cljs.core.re_seq.call(null,/[\w\$_\-\.\*\+\\/\?\><!]/,s);
});
lt.plugins.haskell.find_symbol_at_cursor = (function find_symbol_at_cursor(editor){var loc = lt.objs.editor.__GT_cursor.call(null,editor);var token_left = lt.objs.editor.__GT_token.call(null,editor,loc);var token_right = lt.objs.editor.__GT_token.call(null,editor,cljs.core.update_in.call(null,loc,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"ch","ch",1013907415)], null),cljs.core.inc));var or__6744__auto__ = (cljs.core.truth_(lt.plugins.haskell.symbol_token_QMARK_.call(null,new cljs.core.Keyword(null,"string","string",4416885635).cljs$core$IFn$_invoke$arity$1(token_right)))?cljs.core.assoc.call(null,token_right,new cljs.core.Keyword(null,"loc","loc",1014011570),loc):null);if(cljs.core.truth_(or__6744__auto__))
{return or__6744__auto__;
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
lt.plugins.haskell.format_inline_error = (function format_inline_error(error){var split_error = error.split(":");var message_only = clojure.string.trim.call(null,clojure.string.join.call(null,":",cljs.core.drop.call(null,3,split_error)));var message = clojure.string.replace.call(null,message_only,"\u0000","\n");return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"msg","msg",1014012659),message,new cljs.core.Keyword(null,"loc","loc",1014011570),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",1017226086),(parseInt(cljs.core.nth.call(null,split_error,1)) - 1),new cljs.core.Keyword(null,"ch","ch",1013907415),1,new cljs.core.Keyword(null,"start-line","start-line",3689311729),(parseInt(cljs.core.nth.call(null,split_error,1)) - 1)], null)], null);
});
lt.plugins.haskell.print_inline_error = (function print_inline_error(editor,error){var formatted_error = lt.plugins.haskell.format_inline_error.call(null,error);return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.exception","editor.exception",3983021184),new cljs.core.Keyword(null,"msg","msg",1014012659).cljs$core$IFn$_invoke$arity$1(formatted_error),new cljs.core.Keyword(null,"loc","loc",1014011570).cljs$core$IFn$_invoke$arity$1(formatted_error));
});
lt.plugins.haskell.print_inline_errors = (function print_inline_errors(editor,data){var seq__8196 = cljs.core.seq.call(null,data);var chunk__8197 = null;var count__8198 = 0;var i__8199 = 0;while(true){
if((i__8199 < count__8198))
{var error = cljs.core._nth.call(null,chunk__8197,i__8199);lt.plugins.haskell.print_inline_error.call(null,editor,error);
{
var G__8224 = seq__8196;
var G__8225 = chunk__8197;
var G__8226 = count__8198;
var G__8227 = (i__8199 + 1);
seq__8196 = G__8224;
chunk__8197 = G__8225;
count__8198 = G__8226;
i__8199 = G__8227;
continue;
}
} else
{var temp__4092__auto__ = cljs.core.seq.call(null,seq__8196);if(temp__4092__auto__)
{var seq__8196__$1 = temp__4092__auto__;if(cljs.core.chunked_seq_QMARK_.call(null,seq__8196__$1))
{var c__7486__auto__ = cljs.core.chunk_first.call(null,seq__8196__$1);{
var G__8228 = cljs.core.chunk_rest.call(null,seq__8196__$1);
var G__8229 = c__7486__auto__;
var G__8230 = cljs.core.count.call(null,c__7486__auto__);
var G__8231 = 0;
seq__8196 = G__8228;
chunk__8197 = G__8229;
count__8198 = G__8230;
i__8199 = G__8231;
continue;
}
} else
{var error = cljs.core.first.call(null,seq__8196__$1);lt.plugins.haskell.print_inline_error.call(null,editor,error);
{
var G__8232 = cljs.core.next.call(null,seq__8196__$1);
var G__8233 = null;
var G__8234 = 0;
var G__8235 = 0;
seq__8196 = G__8232;
chunk__8197 = G__8233;
count__8198 = G__8234;
i__8199 = G__8235;
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
lt.plugins.haskell.__BEH__on_proc_out = (function __BEH__on_proc_out(this$,data){return lt.object.update_BANG_.call(null,this$,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.Keyword(null,"out","out",1014014656)], null),cljs.core.str,data.toString());
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-proc-out","lt.plugins.haskell/on-proc-out",939381895),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_proc_out,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"proc.out","proc.out",4302083112),null], null), null));
lt.plugins.haskell.__BEH__on_proc_error = (function __BEH__on_proc_error(this$,data){return lt.object.update_BANG_.call(null,this$,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.Keyword(null,"error","error",1110689146)], null),cljs.core.str,data.toString());
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-proc-error","lt.plugins.haskell/on-proc-error",1921027969),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_proc_error,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"proc.error","proc.error",4143512802),null], null), null));
lt.plugins.haskell.__BEH__on_proc_exit = (function __BEH__on_proc_exit(this$,data){return lt.object.update_BANG_.call(null,this$,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"running","running",2564688177)], null),cljs.core.constantly.call(null,false));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-proc-exit","lt.plugins.haskell/on-proc-exit",4665789001),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_proc_exit,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"proc.exit","proc.exit",4162906152),null], null), null));
lt.object.object_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","runner","lt.plugins.haskell/runner",2843816242),new cljs.core.Keyword(null,"behaviors","behaviors",607554515),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword("lt.plugins.haskell","on-proc-out","lt.plugins.haskell/on-proc-out",939381895),new cljs.core.Keyword("lt.plugins.haskell","on-proc-error","lt.plugins.haskell/on-proc-error",1921027969),new cljs.core.Keyword("lt.plugins.haskell","on-proc-exit","lt.plugins.haskell/on-proc-exit",4665789001)], null),new cljs.core.Keyword(null,"running","running",2564688177),true,new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"process","process",704385505),null,new cljs.core.Keyword(null,"out","out",1014014656),null,new cljs.core.Keyword(null,"error","error",1110689146),null], null),new cljs.core.Keyword(null,"init","init",1017141378),(function (this$,command,args,init_fn){var p = lt.objs.proc.simple_spawn_STAR_.call(null,this$,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"command","command",1964298941),command,new cljs.core.Keyword(null,"args","args",1016906831),args], null),null,cljs.core.PersistentArrayMap.EMPTY);if(cljs.core.truth_(init_fn))
{init_fn.call(null,p);
} else
{}
lt.object.update_BANG_.call(null,this$,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.Keyword(null,"process","process",704385505)], null),(function (_,n){return n;
}),p);
lt.objs.notifos.done_working.call(null,[cljs.core.str(command),cljs.core.str(" started")].join(''));
return null;
}));
lt.plugins.haskell.ghci_process = (function ghci_process(cb){var o = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","runner","lt.plugins.haskell/runner",2843816242),"ghci",cljs.core.PersistentVector.EMPTY,(function (p){return p.stdin.write(":set prompt \"--EvalFinished--\\n\"\n");
}));cljs.core.add_watch.call(null,o,new cljs.core.Keyword(null,"ghci-watch","ghci-watch",4090499067),(function (_,___$1,old,new$){var old_out = cljs.core.get_in.call(null,old,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.Keyword(null,"out","out",1014014656)], null));var new_out = cljs.core.get_in.call(null,new$,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.Keyword(null,"out","out",1014014656)], null));var err_out = cljs.core.get_in.call(null,new$,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.Keyword(null,"error","error",1110689146)], null));if(cljs.core.truth_((function (){var and__6732__auto__ = new_out;if(cljs.core.truth_(and__6732__auto__))
{var and__6732__auto____$1 = cljs.core.not_EQ_.call(null,old_out,new_out);if(and__6732__auto____$1)
{return new_out.contains("--EvalFinished--");
} else
{return and__6732__auto____$1;
}
} else
{return and__6732__auto__;
}
})()))
{return cb.call(null,new_out,err_out);
} else
{return null;
}
}));
return o;
});
lt.plugins.haskell.ghci_command = (function ghci_command(ghci_obj,command){var stdin = cljs.core.get_in.call(null,cljs.core.deref.call(null,ghci_obj),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928),new cljs.core.Keyword(null,"process","process",704385505)], null)).stdin;lt.object.update_BANG_.call(null,ghci_obj,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"proc","proc",1017353928)], null),(function (p){return cljs.core.assoc.call(null,p,new cljs.core.Keyword(null,"out","out",1014014656),null,new cljs.core.Keyword(null,"error","error",1110689146),null);
}));
return stdin.write([cljs.core.str(command),cljs.core.str("\n")].join(''));
});
lt.plugins.haskell.selection_info = (function selection_info(editor){var pos = lt.objs.editor.__GT_cursor.call(null,editor);var info = new cljs.core.Keyword(null,"info","info",1017141280).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,editor));var info__$1 = (cljs.core.truth_(lt.objs.editor.selection_QMARK_.call(null,editor))?cljs.core.assoc.call(null,info,new cljs.core.Keyword(null,"meta","meta",1017252215),new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"start","start",1123661780),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(lt.objs.editor.__GT_cursor.call(null,editor,"start")),new cljs.core.Keyword(null,"end","end",1014004813),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(lt.objs.editor.__GT_cursor.call(null,editor,"end"))], null),new cljs.core.Keyword(null,"code","code",1016963423),lt.objs.editor.selection.call(null,editor)):cljs.core.assoc.call(null,info,new cljs.core.Keyword(null,"pos","pos",1014015430),pos,new cljs.core.Keyword(null,"code","code",1016963423),lt.objs.editor.line.call(null,editor,new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(pos))));return info__$1;
});
lt.plugins.haskell.show_result = (function show_result(editor,loc){return (function (output,error_output){var results = clojure.string.split.call(null,output,"--EvalFinished--\n");var res = cljs.core.peek.call(null,results);var res__$1 = (cljs.core.truth_(clojure.string.blank_QMARK_.call(null,res))?"-- ok":res);if(cljs.core.truth_(error_output))
{return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.exception","editor.exception",3983021184),error_output,loc);
} else
{return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.result","editor.result",4030217008),res__$1,loc);
}
});
});
lt.plugins.haskell.prepare_code = (function prepare_code(code){return clojure.string.replace.call(null,code,/^(\w+)(\s+)?=/,"let $1 =");
});
lt.plugins.haskell.get_ghci = (function get_ghci(editor){var ghci = new cljs.core.Keyword(null,"haskell.client","haskell.client",4292563063).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,editor));var ghci__$1 = ((cljs.core.not.call(null,ghci))?(function (){var ghci__$1 = lt.plugins.haskell.ghci_process.call(null,((function (ghci){
return (function (p1__8200_SHARP_,p2__8201_SHARP_){return cljs.core.get_in.call(null,cljs.core.deref.call(null,editor),new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"haskell.result-fn","haskell.result-fn",3772146800)], null)).call(null,p1__8200_SHARP_,p2__8201_SHARP_);
});})(ghci))
);lt.object.update_BANG_.call(null,editor,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"haskell.client","haskell.client",4292563063)], null),((function (ghci__$1,ghci){
return (function (_,n){return n;
});})(ghci__$1,ghci))
,ghci__$1);
return ghci__$1;
})():ghci);return ghci__$1;
});
lt.plugins.haskell.__BEH__on_eval_one = (function __BEH__on_eval_one(editor){var info = lt.plugins.haskell.selection_info.call(null,editor);var loc = new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"line","line",1017226086),(function (){var or__6744__auto__ = cljs.core.get_in.call(null,info,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"meta","meta",1017252215),new cljs.core.Keyword(null,"end","end",1014004813)], null));if(cljs.core.truth_(or__6744__auto__))
{return or__6744__auto__;
} else
{return cljs.core.get_in.call(null,info,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"pos","pos",1014015430),new cljs.core.Keyword(null,"line","line",1017226086)], null));
}
})()], null);var ghci = lt.plugins.haskell.get_ghci.call(null,editor);if(cljs.core.truth_(clojure.string.blank_QMARK_.call(null,new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info))))
{return null;
} else
{lt.object.update_BANG_.call(null,editor,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"haskell.result-fn","haskell.result-fn",3772146800)], null),(function (_,n){return n;
}),lt.plugins.haskell.show_result.call(null,editor,loc));
return lt.plugins.haskell.ghci_command.call(null,ghci,lt.plugins.haskell.prepare_code.call(null,new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info)));
}
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-eval-one","lt.plugins.haskell/on-eval-one",1888933733),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_eval_one,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"eval.one","eval.one",1173589382),null], null), null));
lt.plugins.haskell.__BEH__on_eval_type = (function __BEH__on_eval_type(editor){var info = lt.plugins.haskell.selection_info.call(null,editor);var loc = new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"line","line",1017226086),(function (){var or__6744__auto__ = cljs.core.get_in.call(null,info,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"meta","meta",1017252215),new cljs.core.Keyword(null,"end","end",1014004813)], null));if(cljs.core.truth_(or__6744__auto__))
{return or__6744__auto__;
} else
{return cljs.core.get_in.call(null,info,new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"pos","pos",1014015430),new cljs.core.Keyword(null,"line","line",1017226086)], null));
}
})()], null);var ghci = lt.plugins.haskell.get_ghci.call(null,editor);if(cljs.core.truth_(clojure.string.blank_QMARK_.call(null,new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info))))
{return null;
} else
{lt.object.update_BANG_.call(null,editor,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"haskell.result-fn","haskell.result-fn",3772146800)], null),(function (_,n){return n;
}),lt.plugins.haskell.show_result.call(null,editor,loc));
return lt.plugins.haskell.ghci_command.call(null,ghci,[cljs.core.str(":type "),cljs.core.str(lt.plugins.haskell.prepare_code.call(null,new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info)))].join(''));
}
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-eval-type","lt.plugins.haskell/on-eval-type",2289744095),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_eval_type,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"eval.type","eval.type",1669336254),null], null), null));
lt.objs.command.command.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"command","command",1964298941),new cljs.core.Keyword(null,"editor-type-form","editor-type-form",3170690697),new cljs.core.Keyword(null,"desc","desc",1016984067),"Haskell: Get the type of a form in editor",new cljs.core.Keyword(null,"exec","exec",1017031683),(function (){var temp__4092__auto__ = lt.objs.editor.pool.last_active.call(null);if(cljs.core.truth_(temp__4092__auto__))
{var ed = temp__4092__auto__;return lt.object.raise.call(null,ed,new cljs.core.Keyword(null,"eval.type","eval.type",1669336254));
} else
{return null;
}
})], null));
lt.plugins.haskell.lt_haskell_path = lt.objs.files.join.call(null,lt.plugins.haskell.plugin_dir,"haskell/LTHaskellClient.hs");
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
lt.plugins.haskell.run_haskell = (function run_haskell(p__8202){var map__8204 = p__8202;var map__8204__$1 = ((cljs.core.seq_QMARK_.call(null,map__8204))?cljs.core.apply.call(null,cljs.core.hash_map,map__8204):map__8204);var info = map__8204__$1;var client = cljs.core.get.call(null,map__8204__$1,new cljs.core.Keyword(null,"client","client",3951159101));var name = cljs.core.get.call(null,map__8204__$1,new cljs.core.Keyword(null,"name","name",1017277949));var path = cljs.core.get.call(null,map__8204__$1,new cljs.core.Keyword(null,"path","path",1017337751));var obj = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","connecting-notifier","lt.plugins.haskell/connecting-notifier",4244447005),info);var client_id = lt.objs.clients.__GT_id.call(null,client);lt.object.merge_BANG_.call(null,client,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"port","port",1017351155),lt.objs.clients.tcp.port,new cljs.core.Keyword(null,"proc","proc",1017353928),obj], null));
lt.objs.notifos.working.call(null,"Connecting..");
return lt.objs.proc.exec.call(null,new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"command","command",1964298941),lt.plugins.haskell.binary_path,new cljs.core.Keyword(null,"args","args",1016906831),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [lt.objs.clients.tcp.port,client_id], null),new cljs.core.Keyword(null,"cwd","cwd",1014003170),lt.plugins.haskell.plugin_dir,new cljs.core.Keyword(null,"env","env",1014004831),new cljs.core.PersistentArrayMap(null, 1, ["HASKELL_PATH",lt.objs.files.join.call(null,lt.objs.files.parent.call(null,path))], null),new cljs.core.Keyword(null,"obj","obj",1014014057),obj], null));
});
lt.plugins.haskell.check_haskell = (function check_haskell(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell","haskell",1711527270),lt.plugins.haskell.shell.which("cabal"));
});
lt.plugins.haskell.check_client = (function check_client(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell-client","haskell-client",3405059382),lt.objs.files.exists_QMARK_.call(null,lt.plugins.haskell.lt_haskell_path));
});
lt.plugins.haskell.handle_no_haskell = (function handle_no_haskell(client){lt.objs.clients.rem_BANG_.call(null,client);
return lt.objs.popup.popup_BANG_.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"header","header",4087600639),"We couldn't find runhaskell.",new cljs.core.Keyword(null,"body","body",1016933652),"In order to start a haskell client, you have to have the haskell and haskell-platform installed and on your system's PATH.",new cljs.core.Keyword(null,"buttons","buttons",1255256819),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"label","label",1116631654),"Download Haskell Platform",new cljs.core.Keyword(null,"action","action",3885920680),(function (){return platform.open.call(null,"http://www.haskell.org/platform/");
})], null),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"label","label",1116631654),"ok"], null)], null)], null));
});
lt.plugins.haskell.notify = (function notify(obj){var map__8206 = obj;var map__8206__$1 = ((cljs.core.seq_QMARK_.call(null,map__8206))?cljs.core.apply.call(null,cljs.core.hash_map,map__8206):map__8206);var client = cljs.core.get.call(null,map__8206__$1,new cljs.core.Keyword(null,"client","client",3951159101));var path = cljs.core.get.call(null,map__8206__$1,new cljs.core.Keyword(null,"path","path",1017337751));var haskell = cljs.core.get.call(null,map__8206__$1,new cljs.core.Keyword(null,"haskell","haskell",1711527270));if((cljs.core.not.call(null,haskell)) || (cljs.core.empty_QMARK_.call(null,haskell)))
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
lt.plugins.haskell.try_connect = (function try_connect(p__8207){var map__8209 = p__8207;var map__8209__$1 = ((cljs.core.seq_QMARK_.call(null,map__8209))?cljs.core.apply.call(null,cljs.core.hash_map,map__8209):map__8209);var info = cljs.core.get.call(null,map__8209__$1,new cljs.core.Keyword(null,"info","info",1017141280));var path = new cljs.core.Keyword(null,"path","path",1017337751).cljs$core$IFn$_invoke$arity$1(info);var client = lt.objs.clients.client_BANG_.call(null,new cljs.core.Keyword(null,"haskell.client","haskell.client",4292563063));lt.plugins.haskell.check_all.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"path","path",1017337751),path,new cljs.core.Keyword(null,"client","client",3951159101),client], null));
return client;
});
lt.plugins.haskell.__BEH__connect = (function __BEH__connect(this$,path){return lt.plugins.haskell.try_connect.call(null,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"info","info",1017141280),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"path","path",1017337751),path], null)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","connect","lt.plugins.haskell/connect",1510312044),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__connect,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"connect","connect",1965255772),null], null), null));
lt.object.object_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705),new cljs.core.Keyword(null,"tags","tags",1017456523),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.lang","haskell.lang",2228745498),null], null), null));
lt.plugins.haskell.haskell = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705));
lt.objs.sidebar.clients.add_connector.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),"Haskell",new cljs.core.Keyword(null,"desc","desc",1016984067),"Select a directory to serve as the root of your haskell project.",new cljs.core.Keyword(null,"connect","connect",1965255772),(function (){return lt.objs.dialogs.dir.call(null,lt.plugins.haskell.haskell,new cljs.core.Keyword(null,"connect","connect",1965255772));
})], null));
lt.plugins.haskell.send_api_command = (function send_api_command(event,command,data){var map__8211 = event;var map__8211__$1 = ((cljs.core.seq_QMARK_.call(null,map__8211))?cljs.core.apply.call(null,cljs.core.hash_map,map__8211):map__8211);var origin = cljs.core.get.call(null,map__8211__$1,new cljs.core.Keyword(null,"origin","origin",4300251800));var info = cljs.core.get.call(null,map__8211__$1,new cljs.core.Keyword(null,"info","info",1017141280));var client = new cljs.core.Keyword(null,"default","default",2558708147).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"client","client",3951159101).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,origin)));lt.objs.notifos.working.call(null,"");
return lt.objs.clients.send.call(null,lt.objs.eval.get_client_BANG_.call(null,new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"command","command",1964298941),command,new cljs.core.Keyword(null,"origin","origin",4300251800),origin,new cljs.core.Keyword(null,"info","info",1017141280),info,new cljs.core.Keyword(null,"create","create",3956577390),lt.plugins.haskell.try_connect], null)),command,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"data","data",1016980252),data], null),new cljs.core.Keyword(null,"only","only",1017320222),origin);
});
lt.plugins.haskell.send_whole_file_command = (function send_whole_file_command(event,command){var map__8213 = event;var map__8213__$1 = ((cljs.core.seq_QMARK_.call(null,map__8213))?cljs.core.apply.call(null,cljs.core.hash_map,map__8213):map__8213);var origin = cljs.core.get.call(null,map__8213__$1,new cljs.core.Keyword(null,"origin","origin",4300251800));return lt.plugins.haskell.send_api_command.call(null,event,command,lt.objs.tabs.__GT_path.call(null,origin));
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

//# sourceMappingURL=haskell_compiled.js.map