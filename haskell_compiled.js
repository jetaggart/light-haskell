if(!lt.util.load.provided_QMARK_('lt.plugins.haskell')) {
goog.provide('lt.plugins.haskell');
goog.require('cljs.core');
goog.require('lt.objs.plugins');
goog.require('lt.objs.files');
goog.require('lt.util.dom');
goog.require('goog.events');
goog.require('lt.objs.popup');
goog.require('lt.objs.dialogs');
goog.require('lt.objs.popup');
goog.require('lt.objs.notifos');
goog.require('lt.objs.proc');
goog.require('lt.objs.notifos');
goog.require('lt.util.dom');
goog.require('lt.objs.files');
goog.require('lt.objs.sidebar.clients');
goog.require('lt.objs.plugins');
goog.require('lt.objs.clients');
goog.require('lt.util.load');
goog.require('lt.objs.editor');
goog.require('lt.object');
goog.require('lt.object');
goog.require('lt.objs.dialogs');
goog.require('lt.util.load');
goog.require('lt.objs.proc');
goog.require('lt.objs.clients');
goog.require('lt.objs.sidebar.clients');
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

lt.plugins.haskell.escape_spaces = (function escape_spaces(s){if(cljs.core._EQ_.call(null,lt.objs.files.separator,"\\"))
{return [cljs.core.str("\""),cljs.core.str(s),cljs.core.str("\"")].join('');
} else
{return s;
}
});

lt.plugins.haskell.shell = lt.util.load.node_module.call(null,"shelljs");

lt.plugins.haskell.harbor = lt.util.load.node_module.call(null,"harbor").call(null,49152,65000);

lt.plugins.haskell.lt_haskell_path = "/Applications/LightTable.app/Contents/Resources/app.nw/plugins/haskell/haskell/LTHaskellClient.hs";

lt.plugins.haskell.open_port = (function open_port(id,cb){return lt.plugins.haskell.harbor.claim([cljs.core.str(id)].join(''),(function (p1__7484_SHARP_,p2__7483_SHARP_){return cb.call(null,p2__7483_SHARP_);
}));
});

lt.object.object_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","connecting-notifier","lt.plugins.haskell/connecting-notifier",4244447005),new cljs.core.Keyword(null,"triggers","triggers",2516997421),cljs.core.PersistentVector.EMPTY,new cljs.core.Keyword(null,"behaviors","behaviors",607554515),cljs.core.PersistentVector.EMPTY,new cljs.core.Keyword(null,"init","init",1017141378),(function (this$,info){lt.object.merge_BANG_.call(null,this$,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"info","info",1017141280),info], null));
return null;
}));

lt.plugins.haskell.run_haskell = (function run_haskell(p__7485){var map__7487 = p__7485;var map__7487__$1 = ((cljs.core.seq_QMARK_.call(null,map__7487))?cljs.core.apply.call(null,cljs.core.hash_map,map__7487):map__7487);var info = map__7487__$1;var client = cljs.core.get.call(null,map__7487__$1,new cljs.core.Keyword(null,"client","client",3951159101));var name = cljs.core.get.call(null,map__7487__$1,new cljs.core.Keyword(null,"name","name",1017277949));var path = cljs.core.get.call(null,map__7487__$1,new cljs.core.Keyword(null,"path","path",1017337751));return lt.plugins.haskell.open_port.call(null,lt.objs.clients.__GT_id.call(null,client),(function (port){var obj = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","connecting-notifier","lt.plugins.haskell/connecting-notifier",4244447005),info);var client_id = lt.objs.clients.__GT_id.call(null,client);lt.object.merge_BANG_.call(null,client,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"port","port",1017351155),port,new cljs.core.Keyword(null,"proc","proc",1017353928),obj], null));
lt.objs.notifos.working.call(null,"Connecting..");
return lt.objs.proc.exec.call(null,new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"command","command",1964298941),"runhaskell",new cljs.core.Keyword(null,"args","args",1016906831),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [lt.plugins.haskell.lt_haskell_path,port,client_id], null),new cljs.core.Keyword(null,"cwd","cwd",1014003170),lt.objs.files.parent.call(null,path),new cljs.core.Keyword(null,"env","env",1014004831),new cljs.core.PersistentArrayMap(null, 1, ["HASKELL_PATH",lt.objs.files.join.call(null,lt.objs.files.parent.call(null,path))], null),new cljs.core.Keyword(null,"obj","obj",1014014057),obj], null));
}));
});

lt.plugins.haskell.check_haskell = (function check_haskell(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell","haskell",1711527270),lt.plugins.haskell.shell.which("runhaskell"));
});

lt.plugins.haskell.check_client = (function check_client(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell-client","haskell-client",3405059382),lt.objs.files.exists_QMARK_.call(null,lt.plugins.haskell.lt_haskell_path));
});

lt.plugins.haskell.handle_no_haskell = (function handle_no_haskell(client){lt.objs.clients.rem_BANG_.call(null,client);
return lt.objs.popup.popup_BANG_.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"header","header",4087600639),"We couldn't find runhaskell.",new cljs.core.Keyword(null,"body","body",1016933652),"In order to start a haskell client, you have to have the haskell and haskell-platform installed and on your system's PATH.",new cljs.core.Keyword(null,"buttons","buttons",1255256819),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"label","label",1116631654),"Download Haskell Platform",new cljs.core.Keyword(null,"action","action",3885920680),(function (){return platform.open.call(null,"http://www.haskell.org/platform/");
})], null),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"label","label",1116631654),"ok"], null)], null)], null));
});

lt.plugins.haskell.notify = (function notify(obj){var map__7489 = obj;var map__7489__$1 = ((cljs.core.seq_QMARK_.call(null,map__7489))?cljs.core.apply.call(null,cljs.core.hash_map,map__7489):map__7489);var client = cljs.core.get.call(null,map__7489__$1,new cljs.core.Keyword(null,"client","client",3951159101));var path = cljs.core.get.call(null,map__7489__$1,new cljs.core.Keyword(null,"path","path",1017337751));var haskell = cljs.core.get.call(null,map__7489__$1,new cljs.core.Keyword(null,"haskell","haskell",1711527270));if((cljs.core.not.call(null,haskell)) || (cljs.core.empty_QMARK_.call(null,haskell)))
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

lt.plugins.haskell.try_connect = (function try_connect(p__7490){var map__7492 = p__7490;var map__7492__$1 = ((cljs.core.seq_QMARK_.call(null,map__7492))?cljs.core.apply.call(null,cljs.core.hash_map,map__7492):map__7492);var info = cljs.core.get.call(null,map__7492__$1,new cljs.core.Keyword(null,"info","info",1017141280));var path = new cljs.core.Keyword(null,"path","path",1017337751).cljs$core$IFn$_invoke$arity$1(info);var client = lt.objs.clients.client_BANG_.call(null,new cljs.core.Keyword(null,"haskell.client","haskell.client",4292563063));lt.object.merge_BANG_.call(null,client,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"path","path",1017337751),path], null));
lt.plugins.haskell.check_all.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"path","path",1017337751),path,new cljs.core.Keyword(null,"client","client",3951159101),client], null));
return client;
});

lt.plugins.haskell.__BEH__connect = (function __BEH__connect(this$,path){return lt.plugins.haskell.try_connect.call(null,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"info","info",1017141280),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"path","path",1017337751),path], null)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","connect","lt.plugins.haskell/connect",1510312044),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__connect,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"connect","connect",1965255772),null], null), null));

lt.object.object_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705),new cljs.core.Keyword(null,"tags","tags",1017456523),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.lang","haskell.lang",2228745498),null], null), null));

lt.plugins.haskell.haskell = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705));

lt.objs.sidebar.clients.add_connector.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),"Haskell",new cljs.core.Keyword(null,"desc","desc",1016984067),"Select a directory to serve as the root of your haskell project.",new cljs.core.Keyword(null,"connect","connect",1965255772),(function (){return lt.objs.dialogs.dir.call(null,lt.plugins.haskell.haskell,new cljs.core.Keyword(null,"connect","connect",1965255772));
})], null));

}

//# sourceMappingURL=