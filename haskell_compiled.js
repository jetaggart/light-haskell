if(!lt.util.load.provided_QMARK_('goog.disposable.IDisposable')) {
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the disposable interface.  A disposable object
 * has a dispose method to to clean up references and resources.
 * @author nnaze@google.com (Nathan Naze)
 */


goog.provide('goog.disposable.IDisposable');



/**
 * Interface for a disposable object.  If a instance requires cleanup
 * (references COM objects, DOM notes, or other disposable objects), it should
 * implement this interface (it may subclass goog.Disposable).
 * @interface
 */
goog.disposable.IDisposable = function() {};


/**
 * Disposes of the object and its resources.
 * @return {void} Nothing.
 */
goog.disposable.IDisposable.prototype.dispose;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.disposable.IDisposable.prototype.isDisposed;
}
if(!lt.util.load.provided_QMARK_('goog.Disposable')) {
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implements the disposable interface. The dispose method is used
 * to clean up references and resources.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.Disposable');
/** @suppress {extraProvide} */
goog.provide('goog.dispose');
/** @suppress {extraProvide} */
goog.provide('goog.disposeAll');

goog.require('goog.disposable.IDisposable');



/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface (defined in goog.disposable.IDisposable).
 * @constructor
 * @implements {goog.disposable.IDisposable}
 */
goog.Disposable = function() {
  if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    if (goog.Disposable.INCLUDE_STACK_ON_CREATION) {
      this.creationStack = new Error().stack;
    }
    goog.Disposable.instances_[goog.getUid(this)] = this;
  }
};


/**
 * @enum {number} Different monitoring modes for Disposable.
 */
goog.Disposable.MonitoringMode = {
  /**
   * No monitoring.
   */
  OFF: 0,
  /**
   * Creating and disposing the goog.Disposable instances is monitored. All
   * disposable objects need to call the {@code goog.Disposable} base
   * constructor. The PERMANENT mode must be switched on before creating any
   * goog.Disposable instances.
   */
  PERMANENT: 1,
  /**
   * INTERACTIVE mode can be switched on and off on the fly without producing
   * errors. It also doesn't warn if the disposable objects don't call the
   * {@code goog.Disposable} base constructor.
   */
  INTERACTIVE: 2
};


/**
 * @define {number} The monitoring mode of the goog.Disposable
 *     instances. Default is OFF. Switching on the monitoring is only
 *     recommended for debugging because it has a significant impact on
 *     performance and memory usage. If switched off, the monitoring code
 *     compiles down to 0 bytes.
 */
goog.define('goog.Disposable.MONITORING_MODE', 0);


/**
 * @define {boolean} Whether to attach creation stack to each created disposable
 *     instance; This is only relevant for when MonitoringMode != OFF.
 */
goog.define('goog.Disposable.INCLUDE_STACK_ON_CREATION', true);


/**
 * Maps the unique ID of every undisposed {@code goog.Disposable} object to
 * the object itself.
 * @type {!Object.<number, !goog.Disposable>}
 * @private
 */
goog.Disposable.instances_ = {};


/**
 * @return {!Array.<!goog.Disposable>} All {@code goog.Disposable} objects that
 *     haven't been disposed of.
 */
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for (var id in goog.Disposable.instances_) {
    if (goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)]);
    }
  }
  return ret;
};


/**
 * Clears the registry of undisposed objects but doesn't dispose of them.
 */
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {};
};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
goog.Disposable.prototype.disposed_ = false;


/**
 * Callbacks to invoke when this object is disposed.
 * @type {Array.<!Function>}
 * @private
 */
goog.Disposable.prototype.onDisposeCallbacks_;


/**
 * If monitoring the goog.Disposable instances is enabled, stores the creation
 * stack trace of the Disposable instance.
 * @type {string}
 */
goog.Disposable.prototype.creationStack;


/**
 * @return {boolean} Whether the object has been disposed of.
 * @override
 */
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend {@code goog.Disposable} should
 * override {@link #disposeInternal} in order to delete references to COM
 * objects, DOM nodes, and other disposable objects. Reentrant.
 *
 * @return {void} Nothing.
 * @override
 */
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = true;
    this.disposeInternal();
    if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.getUid(this);
      if (goog.Disposable.MONITORING_MODE ==
          goog.Disposable.MonitoringMode.PERMANENT &&
          !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + ' did not call the goog.Disposable base ' +
            'constructor or was disposed of after a clearUndisposedObjects ' +
            'call');
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};


/**
 * Associates a disposable object with this object so that they will be disposed
 * together.
 * @param {goog.disposable.IDisposable} disposable that will be disposed when
 *     this object is disposed.
 */
goog.Disposable.prototype.registerDisposable = function(disposable) {
  this.addOnDisposeCallback(goog.partial(goog.dispose, disposable));
};


/**
 * Invokes a callback function when this object is disposed. Callbacks are
 * invoked in the order in which they were added.
 * @param {function(this:T):?} callback The callback function.
 * @param {T=} opt_scope An optional scope to call the callback in.
 * @template T
 */
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  if (!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = [];
  }
  this.onDisposeCallbacks_.push(goog.bind(callback, opt_scope));
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code goog.Disposable} should
 * override this method.
 * Not reentrant. To avoid calling it twice, it must only be called from the
 * subclass' {@code disposeInternal} method. Everywhere else the public
 * {@code dispose} method must be used.
 * For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     goog.base(this);
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   goog.inherits(mypackage.MyClass, goog.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     // Dispose logic specific to MyClass.
 *     ...
 *     // Call superclass's disposeInternal at the end of the subclass's, like
 *     // in C++, to avoid hard-to-catch issues.
 *     goog.base(this, 'disposeInternal');
 *   };
 * </pre>
 * @protected
 */
goog.Disposable.prototype.disposeInternal = function() {
  if (this.onDisposeCallbacks_) {
    while (this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()();
    }
  }
};


/**
 * Returns True if we can verify the object is disposed.
 * Calls {@code isDisposed} on the argument if it supports it.  If obj
 * is not an object with an isDisposed() method, return false.
 * @param {*} obj The object to investigate.
 * @return {boolean} True if we can verify the object is disposed.
 */
goog.Disposable.isDisposed = function(obj) {
  if (obj && typeof obj.isDisposed == 'function') {
    return obj.isDisposed();
  }
  return false;
};


/**
 * Calls {@code dispose} on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == 'function') {
    obj.dispose();
  }
};


/**
 * Calls {@code dispose} on each member of the list that supports it. (If the
 * member is an ArrayLike, then {@code goog.disposeAll()} will be called
 * recursively on each of its members.) If the member is not an object with a
 * {@code dispose()} method, then it is ignored.
 * @param {...*} var_args The list.
 */
goog.disposeAll = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    var disposable = arguments[i];
    if (goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable);
    } else {
      goog.dispose(disposable);
    }
  }
};
}
if(!lt.util.load.provided_QMARK_('goog.events.EventId')) {
// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.events.EventId');



/**
 * A templated class that is used when registering for events. Typical usage:
 * <code>
 *   /** @type {goog.events.EventId.<MyEventObj>}
 *   var myEventId = new goog.events.EventId(
 *       goog.events.getUniqueId(('someEvent'));
 *
 *   // No need to cast or declare here since the compiler knows the correct
 *   // type of 'evt' (MyEventObj).
 *   something.listen(myEventId, function(evt) {});
 * </code>
 *
 * @param {string} eventId
 * @template T
 * @constructor
 * @struct
 * @final
 */
goog.events.EventId = function(eventId) {
  /** @const */ this.id = eventId;
};


/**
 * @override
 */
goog.events.EventId.prototype.toString = function() {
  return this.id;
};
}
if(!lt.util.load.provided_QMARK_('goog.events.Event')) {
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A base class for event objects.
 *
 */


goog.provide('goog.events.Event');
goog.provide('goog.events.EventLike');

/**
 * goog.events.Event no longer depends on goog.Disposable. Keep requiring
 * goog.Disposable here to not break projects which assume this dependency.
 * @suppress {extraRequire}
 */
goog.require('goog.Disposable');
goog.require('goog.events.EventId');


/**
 * A typedef for event like objects that are dispatchable via the
 * goog.events.dispatchEvent function. strings are treated as the type for a
 * goog.events.Event. Objects are treated as an extension of a new
 * goog.events.Event with the type property of the object being used as the type
 * of the Event.
 * @typedef {string|Object|goog.events.Event|goog.events.EventId}
 */
goog.events.EventLike;



/**
 * A base class for event objects, so that they can support preventDefault and
 * stopPropagation.
 *
 * @param {string|!goog.events.EventId} type Event Type.
 * @param {Object=} opt_target Reference to the object that is the target of
 *     this event. It has to implement the {@code EventTarget} interface
 *     declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
 * @constructor
 */
goog.events.Event = function(type, opt_target) {
  /**
   * Event type.
   * @type {string}
   */
  this.type = type instanceof goog.events.EventId ? String(type) : type;

  /**
   * Target of the event.
   * @type {Object|undefined}
   */
  this.target = opt_target;

  /**
   * Object that had the listener attached.
   * @type {Object|undefined}
   */
  this.currentTarget = this.target;

  /**
   * Whether to cancel the event in internal capture/bubble processing for IE.
   * @type {boolean}
   * @public
   * @suppress {underscore|visibility} Technically public, but referencing this
   *     outside this package is strongly discouraged.
   */
  this.propagationStopped_ = false;

  /**
   * Whether the default action has been prevented.
   * This is a property to match the W3C specification at
   * {@link http://www.w3.org/TR/DOM-Level-3-Events/
   * #events-event-type-defaultPrevented}.
   * Must be treated as read-only outside the class.
   * @type {boolean}
   */
  this.defaultPrevented = false;

  /**
   * Return value for in internal capture/bubble processing for IE.
   * @type {boolean}
   * @public
   * @suppress {underscore|visibility} Technically public, but referencing this
   *     outside this package is strongly discouraged.
   */
  this.returnValue_ = true;
};


/**
 * For backwards compatibility (goog.events.Event used to inherit
 * goog.Disposable).
 * @deprecated Events don't need to be disposed.
 */
goog.events.Event.prototype.disposeInternal = function() {
};


/**
 * For backwards compatibility (goog.events.Event used to inherit
 * goog.Disposable).
 * @deprecated Events don't need to be disposed.
 */
goog.events.Event.prototype.dispose = function() {
};


/**
 * Stops event propagation.
 */
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};


/**
 * Prevents the default action, for example a link redirecting to a url.
 */
goog.events.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.returnValue_ = false;
};


/**
 * Stops the propagation of the event. It is equivalent to
 * {@code e.stopPropagation()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation();
};


/**
 * Prevents the default action. It is equivalent to
 * {@code e.preventDefault()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.preventDefault = function(e) {
  e.preventDefault();
};
}
if(!lt.util.load.provided_QMARK_('goog.debug.Error')) {
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Attempt to ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    var stack = new Error().stack;
    if (stack) {
      this.stack = stack;
    }
  }

  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';
}
if(!lt.util.load.provided_QMARK_('goog.dom.NodeType')) {
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of goog.dom.NodeType.
 */

goog.provide('goog.dom.NodeType');


/**
 * Constants for the nodeType attribute in the Node interface.
 *
 * These constants match those specified in the Node interface. These are
 * usually present on the Node object in recent browsers, but not in older
 * browsers (specifically, early IEs) and thus are given here.
 *
 * In some browsers (early IEs), these are not defined on the Node object,
 * so they are provided here.
 *
 * See http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};
}
if(!lt.util.load.provided_QMARK_('goog.asserts')) {
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.dom.NodeType');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.define('goog.asserts.ENABLE_ASSERTS', goog.DEBUG);



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array.<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permenantly modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array.<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array.<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  throw new goog.asserts.AssertionError('' + message, args || []);
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {T} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is a DOM Element if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) ||
      value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_('Expected Element but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Element} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 *
 * The compiler may tighten the type returned by this function.
 *
 * @param {*} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 * @return {!T}
 * @template T
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('instanceof check failed.', null,
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};


/**
 * Checks that no enumerable keys are present in Object.prototype. Such keys
 * would break most code that use {@code for (var ... in ...)} loops.
 */
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + ' should not be enumerable in Object.prototype.');
  }
};
}
if(!lt.util.load.provided_QMARK_('goog.debug.entryPointRegistry')) {
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A global registry for entry points into a program,
 * so that they can be instrumented. Each module should register their
 * entry points with this registry. Designed to be compiled out
 * if no instrumentation is requested.
 *
 * Entry points may be registered before or after a call to
 * goog.debug.entryPointRegistry.monitorAll. If an entry point is registered
 * later, the existing monitor will instrument the new entry point.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.debug.EntryPointMonitor');
goog.provide('goog.debug.entryPointRegistry');

goog.require('goog.asserts');



/**
 * @interface
 */
goog.debug.EntryPointMonitor = function() {};


/**
 * Instruments a function.
 *
 * @param {!Function} fn A function to instrument.
 * @return {!Function} The instrumented function.
 */
goog.debug.EntryPointMonitor.prototype.wrap;


/**
 * Try to remove an instrumentation wrapper created by this monitor.
 * If the function passed to unwrap is not a wrapper created by this
 * monitor, then we will do nothing.
 *
 * Notice that some wrappers may not be unwrappable. For example, if other
 * monitors have applied their own wrappers, then it will be impossible to
 * unwrap them because their wrappers will have captured our wrapper.
 *
 * So it is important that entry points are unwrapped in the reverse
 * order that they were wrapped.
 *
 * @param {!Function} fn A function to unwrap.
 * @return {!Function} The unwrapped function, or {@code fn} if it was not
 *     a wrapped function created by this monitor.
 */
goog.debug.EntryPointMonitor.prototype.unwrap;


/**
 * An array of entry point callbacks.
 * @type {!Array.<function(!Function)>}
 * @private
 */
goog.debug.entryPointRegistry.refList_ = [];


/**
 * Monitors that should wrap all the entry points.
 * @type {!Array.<!goog.debug.EntryPointMonitor>}
 * @private
 */
goog.debug.entryPointRegistry.monitors_ = [];


/**
 * Whether goog.debug.entryPointRegistry.monitorAll has ever been called.
 * Checking this allows the compiler to optimize out the registrations.
 * @type {boolean}
 * @private
 */
goog.debug.entryPointRegistry.monitorsMayExist_ = false;


/**
 * Register an entry point with this module.
 *
 * The entry point will be instrumented when a monitor is passed to
 * goog.debug.entryPointRegistry.monitorAll. If this has already occurred, the
 * entry point is instrumented immediately.
 *
 * @param {function(!Function)} callback A callback function which is called
 *     with a transforming function to instrument the entry point. The callback
 *     is responsible for wrapping the relevant entry point with the
 *     transforming function.
 */
goog.debug.entryPointRegistry.register = function(callback) {
  // Don't use push(), so that this can be compiled out.
  goog.debug.entryPointRegistry.refList_[
      goog.debug.entryPointRegistry.refList_.length] = callback;
  // If no one calls monitorAll, this can be compiled out.
  if (goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for (var i = 0; i < monitors.length; i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]));
    }
  }
};


/**
 * Configures a monitor to wrap all entry points.
 *
 * Entry points that have already been registered are immediately wrapped by
 * the monitor. When an entry point is registered in the future, it will also
 * be wrapped by the monitor when it is registered.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor An entry point monitor.
 */
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor);
};


/**
 * Try to unmonitor all the entry points that have already been registered. If
 * an entry point is registered in the future, it will not be wrapped by the
 * monitor when it is registered. Note that this may fail if the entry points
 * have additional wrapping.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor The last monitor to wrap
 *     the entry points.
 * @throws {Error} If the monitor is not the most recently configured monitor.
 */
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1],
      'Only the most recent monitor can be unwrapped.');
  var transformer = goog.bind(monitor.unwrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  monitors.length--;
};
}
if(!lt.util.load.provided_QMARK_('goog.events.Listener')) {
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Listener object.
 * @see ../demos/events.html
 */

goog.provide('goog.events.Listener');

goog.require('goog.events.ListenableKey');



/**
 * Simple class that stores information about a listener
 * @param {!Function} listener Callback function.
 * @param {Function} proxy Wrapper for the listener that patches the event.
 * @param {EventTarget|goog.events.Listenable} src Source object for
 *     the event.
 * @param {string} type Event type.
 * @param {boolean} capture Whether in capture or bubble phase.
 * @param {Object=} opt_handler Object in whose context to execute the callback.
 * @implements {goog.events.ListenableKey}
 * @constructor
 */
goog.events.Listener = function(
    listener, proxy, src, type, capture, opt_handler) {
  if (goog.events.Listener.ENABLE_MONITORING) {
    this.creationStack = new Error().stack;
  }

  /**
   * Callback function.
   * @type {Function}
   */
  this.listener = listener;

  /**
   * A wrapper over the original listener. This is used solely to
   * handle native browser events (it is used to simulate the capture
   * phase and to patch the event object).
   * @type {Function}
   */
  this.proxy = proxy;

  /**
   * Object or node that callback is listening to
   * @type {EventTarget|goog.events.Listenable}
   */
  this.src = src;

  /**
   * The event type.
   * @const {string}
   */
  this.type = type;

  /**
   * Whether the listener is being called in the capture or bubble phase
   * @const {boolean}
   */
  this.capture = !!capture;

  /**
   * Optional object whose context to execute the listener in
   * @type {Object|undefined}
   */
  this.handler = opt_handler;

  /**
   * The key of the listener.
   * @const {number}
   * @override
   */
  this.key = goog.events.ListenableKey.reserveKey();

  /**
   * Whether to remove the listener after it has been called.
   * @type {boolean}
   */
  this.callOnce = false;

  /**
   * Whether the listener has been removed.
   * @type {boolean}
   */
  this.removed = false;
};


/**
 * @define {boolean} Whether to enable the monitoring of the
 *     goog.events.Listener instances. Switching on the monitoring is only
 *     recommended for debugging because it has a significant impact on
 *     performance and memory usage. If switched off, the monitoring code
 *     compiles down to 0 bytes.
 */
goog.define('goog.events.Listener.ENABLE_MONITORING', false);


/**
 * If monitoring the goog.events.Listener instances is enabled, stores the
 * creation stack trace of the Disposable instance.
 * @type {string}
 */
goog.events.Listener.prototype.creationStack;


/**
 * Marks this listener as removed. This also remove references held by
 * this listener object (such as listener and event source).
 */
goog.events.Listener.prototype.markAsRemoved = function() {
  this.removed = true;
  this.listener = null;
  this.proxy = null;
  this.src = null;
  this.handler = null;
};
}
if(!lt.util.load.provided_QMARK_('goog.object')) {
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object.<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object.<K,V>):?} f The function to call
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the object) and the return value is ignored.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @template T,K,V
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object.<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object.<K,V>):boolean} f The function to call
 *     for every element. This
 *     function takes 3 arguments (the element, the index and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object.<K,V>} a new object in which only elements that passed the
 *     test are present.
 * @template T,K,V
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object.<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object.<K,V>):R} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object.<K,R>} a new object with the results from f.
 * @template T,K,V,R
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object.<K,V>} obj The object to check.
 * @param {function(this:T,V,?,Object.<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 * @template T,K,V
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object.<K,V>} obj The object to check.
 * @param {?function(this:T,V,?,Object.<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 * @template T,K,V
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object.<K,V>} obj The object to pick a value from.
 * @return {V|undefined} The value or undefined if the object is empty.
 * @template K,V
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object.<K,V>} obj The object in which to look for val.
 * @param {V} val The object for which to check.
 * @return {boolean} true if val is present.
 * @template K,V
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object.<K,V>} obj The object from which to get the values.
 * @return {!Array.<V>} The values in the object/map/hash.
 * @template K,V
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array.<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 *
 * @param {!Object} obj An object to get the value from.  Can be array-like.
 * @param {...(string|number|!Array.<number|string>)} var_args A number of keys
 *     (as strings, or numbers, for array-like objects).  Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value.  If, at any point, the value for a key
 *     is undefined, returns undefined.
 */
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }

  return obj;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {*} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object.<K,V>} obj The object in which to look for val.
 * @param {V} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 * @template K,V
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object.<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object.<K,V>):boolean} f The
 *      function to call for every element. Takes 3 arguments (the value,
 *     the key and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object.<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object.<K,V>):boolean} f The function
 *     to call for every element. Takes 3 arguments (the value, the key
 *     and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {V} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object.<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} val The value to add.
 * @template K,V
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object.<K,V>} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {R=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {V|R|undefined} The value for the given key.
 * @template K,V,R
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object.<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add.
 * @template K,V
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object.<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object.<K,V>} obj Object to clone.
 * @return {!Object.<K,V>} Clone of the input object.
 * @template K,V
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.object.unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 *
 * <code>goog.object.unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 */
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array.<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {b: 2, c: 3});
 * o; // {a: 0, b: 2, c: 3}
 *
 * @param {Object} target The object to modify. Existing properties will be
 *     overwritten if they are also present in one of the objects in
 *     {@code var_args}.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }

  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};


/**
 * Creates an immutable view of the underlying object, if the browser
 * supports immutable objects.
 *
 * In default mode, writes to this view will fail silently. In strict mode,
 * they will throw an error.
 *
 * @param {!Object.<K,V>} obj An object.
 * @return {!Object.<K,V>} An immutable view of that object, or the
 *     original object if this browser does not support immutables.
 * @template K,V
 */
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
};


/**
 * @param {!Object} obj An object.
 * @return {boolean} Whether this is an immutable view of the object.
 */
goog.object.isImmutableView = function(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
};
}
if(!lt.util.load.provided_QMARK_('goog.events.ListenerMap')) {
// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A map of listeners that provides utility functions to
 * deal with listeners on an event target. Used by
 * {@code goog.events.EventTarget}.
 *
 * WARNING: Do not use this class from outside goog.events package.
 *
 * @visibility {//closure/goog/bin/sizetests:__pkg__}
 * @visibility {//closure/goog/events:__pkg__}
 * @visibility {//closure/goog/labs/events:__pkg__}
 */

goog.provide('goog.events.ListenerMap');

goog.require('goog.array');
goog.require('goog.events.Listener');
goog.require('goog.object');



/**
 * Creates a new listener map.
 * @param {EventTarget|goog.events.Listenable} src The src object.
 * @constructor
 * @final
 */
goog.events.ListenerMap = function(src) {
  /** @type {EventTarget|goog.events.Listenable} */
  this.src = src;

  /**
   * Maps of event type to an array of listeners.
   * @type {Object.<string, !Array.<!goog.events.Listener>>}
   */
  this.listeners = {};

  /**
   * The count of types in this map that have registered listeners.
   * @private {number}
   */
  this.typeCount_ = 0;
};


/**
 * @return {number} The count of event types in this map that actually
 *     have registered listeners.
 */
goog.events.ListenerMap.prototype.getTypeCount = function() {
  return this.typeCount_;
};


/**
 * @return {number} Total number of registered listeners.
 */
goog.events.ListenerMap.prototype.getListenerCount = function() {
  var count = 0;
  for (var type in this.listeners) {
    count += this.listeners[type].length;
  }
  return count;
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned.
 *
 * Note that a one-off listener will not change an existing listener,
 * if any. On the other hand a normal listener will change existing
 * one-off listener to become a normal listener.
 *
 * @param {string|!goog.events.EventId} type The listener event type.
 * @param {!Function} listener This listener callback method.
 * @param {boolean} callOnce Whether the listener is a one-off
 *     listener.
 * @param {boolean=} opt_useCapture The capture mode of the listener.
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 */
goog.events.ListenerMap.prototype.add = function(
    type, listener, callOnce, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  var listenerArray = this.listeners[typeStr];
  if (!listenerArray) {
    listenerArray = this.listeners[typeStr] = [];
    this.typeCount_++;
  }

  var listenerObj;
  var index = goog.events.ListenerMap.findListenerIndex_(
      listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    listenerObj = listenerArray[index];
    if (!callOnce) {
      // Ensure that, if there is an existing callOnce listener, it is no
      // longer a callOnce listener.
      listenerObj.callOnce = false;
    }
  } else {
    listenerObj = new goog.events.Listener(
        listener, null, this.src, typeStr, !!opt_useCapture, opt_listenerScope);
    listenerObj.callOnce = callOnce;
    listenerArray.push(listenerObj);
  }
  return listenerObj;
};


/**
 * Removes a matching listener.
 * @param {string|!goog.events.EventId} type The listener event type.
 * @param {!Function} listener This listener callback method.
 * @param {boolean=} opt_useCapture The capture mode of the listener.
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {boolean} Whether any listener was removed.
 */
goog.events.ListenerMap.prototype.remove = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  if (!(typeStr in this.listeners)) {
    return false;
  }

  var listenerArray = this.listeners[typeStr];
  var index = goog.events.ListenerMap.findListenerIndex_(
      listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    var listenerObj = listenerArray[index];
    listenerObj.markAsRemoved();
    goog.array.removeAt(listenerArray, index);
    if (listenerArray.length == 0) {
      delete this.listeners[typeStr];
      this.typeCount_--;
    }
    return true;
  }
  return false;
};


/**
 * Removes the given listener object.
 * @param {goog.events.ListenableKey} listener The listener to remove.
 * @return {boolean} Whether the listener is removed.
 */
goog.events.ListenerMap.prototype.removeByKey = function(listener) {
  var type = listener.type;
  if (!(type in this.listeners)) {
    return false;
  }

  var removed = goog.array.remove(this.listeners[type], listener);
  if (removed) {
    listener.markAsRemoved();
    if (this.listeners[type].length == 0) {
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return removed;
};


/**
 * Removes all listeners from this map. If opt_type is provided, only
 * listeners that match the given type are removed.
 * @param {string|!goog.events.EventId=} opt_type Type of event to remove.
 * @return {number} Number of listeners removed.
 */
goog.events.ListenerMap.prototype.removeAll = function(opt_type) {
  var typeStr = opt_type && opt_type.toString();
  var count = 0;
  for (var type in this.listeners) {
    if (!typeStr || type == typeStr) {
      var listenerArray = this.listeners[type];
      for (var i = 0; i < listenerArray.length; i++) {
        ++count;
        listenerArray[i].markAsRemoved();
      }
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return count;
};


/**
 * Gets all listeners that match the given type and capture mode. The
 * returned array is a copy (but the listener objects are not).
 * @param {string|!goog.events.EventId} type The type of the listeners
 *     to retrieve.
 * @param {boolean} capture The capture mode of the listeners to retrieve.
 * @return {!Array.<goog.events.ListenableKey>} An array of matching
 *     listeners.
 */
goog.events.ListenerMap.prototype.getListeners = function(type, capture) {
  var listenerArray = this.listeners[type.toString()];
  var rv = [];
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; ++i) {
      var listenerObj = listenerArray[i];
      if (listenerObj.capture == capture) {
        rv.push(listenerObj);
      }
    }
  }
  return rv;
};


/**
 * Gets the goog.events.ListenableKey for the event or null if no such
 * listener is in use.
 *
 * @param {string|!goog.events.EventId} type The type of the listener
 *     to retrieve.
 * @param {!Function} listener The listener function to get.
 * @param {boolean} capture Whether the listener is a capturing listener.
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 */
goog.events.ListenerMap.prototype.getListener = function(
    type, listener, capture, opt_listenerScope) {
  var listenerArray = this.listeners[type.toString()];
  var i = -1;
  if (listenerArray) {
    i = goog.events.ListenerMap.findListenerIndex_(
        listenerArray, listener, capture, opt_listenerScope);
  }
  return i > -1 ? listenerArray[i] : null;
};


/**
 * Whether there is a matching listener. If either the type or capture
 * parameters are unspecified, the function will match on the
 * remaining criteria.
 *
 * @param {string|!goog.events.EventId=} opt_type The type of the listener.
 * @param {boolean=} opt_capture The capture mode of the listener.
 * @return {boolean} Whether there is an active listener matching
 *     the requested type and/or capture phase.
 */
goog.events.ListenerMap.prototype.hasListener = function(
    opt_type, opt_capture) {
  var hasType = goog.isDef(opt_type);
  var typeStr = hasType ? opt_type.toString() : '';
  var hasCapture = goog.isDef(opt_capture);

  return goog.object.some(
      this.listeners, function(listenerArray, type) {
        for (var i = 0; i < listenerArray.length; ++i) {
          if ((!hasType || listenerArray[i].type == typeStr) &&
              (!hasCapture || listenerArray[i].capture == opt_capture)) {
            return true;
          }
        }

        return false;
      });
};


/**
 * Finds the index of a matching goog.events.Listener in the given
 * listenerArray.
 * @param {!Array.<!goog.events.Listener>} listenerArray Array of listener.
 * @param {!Function} listener The listener function.
 * @param {boolean=} opt_useCapture The capture flag for the listener.
 * @param {Object=} opt_listenerScope The listener scope.
 * @return {number} The index of the matching listener within the
 *     listenerArray.
 * @private
 */
goog.events.ListenerMap.findListenerIndex_ = function(
    listenerArray, listener, opt_useCapture, opt_listenerScope) {
  for (var i = 0; i < listenerArray.length; ++i) {
    var listenerObj = listenerArray[i];
    if (!listenerObj.removed &&
        listenerObj.listener == listener &&
        listenerObj.capture == !!opt_useCapture &&
        listenerObj.handler == opt_listenerScope) {
      return i;
    }
  }
  return -1;
};
}
if(!lt.util.load.provided_QMARK_('goog.reflect')) {
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Useful compiler idioms.
 *
 */

goog.provide('goog.reflect');


/**
 * Syntax for object literal casts.
 * @see http://go/jscompiler-renaming
 * @see http://code.google.com/p/closure-compiler/wiki/
 *      ExperimentalTypeBasedPropertyRenaming
 *
 * Use this if you have an object literal whose keys need to have the same names
 * as the properties of some class even after they are renamed by the compiler.
 *
 * @param {!Function} type Type to cast to.
 * @param {Object} object Object literal to cast.
 * @return {Object} The object literal.
 */
goog.reflect.object = function(type, object) {
  return object;
};


/**
 * To assert to the compiler that an operation is needed when it would
 * otherwise be stripped. For example:
 * <code>
 *     // Force a layout
 *     goog.reflect.sinkValue(dialog.offsetHeight);
 * </code>
 * @type {!Function}
 */
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[' '](x);
  return x;
};


/**
 * The compiler should optimize this function away iff no one ever uses
 * goog.reflect.sinkValue.
 */
goog.reflect.sinkValue[' '] = goog.nullFunction;


/**
 * Check if a property can be accessed without throwing an exception.
 * @param {Object} obj The owner of the property.
 * @param {string} prop The property name.
 * @return {boolean} Whether the property is accessible. Will also return true
 *     if obj is null.
 */
goog.reflect.canAccessProperty = function(obj, prop) {
  /** @preserveTry */
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true;
  } catch (e) {}
  return false;
};
}
if(!lt.util.load.provided_QMARK_('goog.events.Listenable')) {
// Copyright 2012 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview An interface for a listenable JavaScript object.
 */

goog.provide('goog.events.Listenable');
goog.provide('goog.events.ListenableKey');

/** @suppress {extraRequire} */
goog.require('goog.events.EventId');



/**
 * A listenable interface. A listenable is an object with the ability
 * to dispatch/broadcast events to "event listeners" registered via
 * listen/listenOnce.
 *
 * The interface allows for an event propagation mechanism similar
 * to one offered by native browser event targets, such as
 * capture/bubble mechanism, stopping propagation, and preventing
 * default actions. Capture/bubble mechanism depends on the ancestor
 * tree constructed via {@code #getParentEventTarget}; this tree
 * must be directed acyclic graph. The meaning of default action(s)
 * in preventDefault is specific to a particular use case.
 *
 * Implementations that do not support capture/bubble or can not have
 * a parent listenable can simply not implement any ability to set the
 * parent listenable (and have {@code #getParentEventTarget} return
 * null).
 *
 * Implementation of this class can be used with or independently from
 * goog.events.
 *
 * Implementation must call {@code #addImplementation(implClass)}.
 *
 * @interface
 * @see goog.events
 * @see http://www.w3.org/TR/DOM-Level-2-Events/events.html
 */
goog.events.Listenable = function() {};


/**
 * An expando property to indicate that an object implements
 * goog.events.Listenable.
 *
 * See addImplementation/isImplementedBy.
 *
 * @type {string}
 * @const
 */
goog.events.Listenable.IMPLEMENTED_BY_PROP =
    'closure_listenable_' + ((Math.random() * 1e6) | 0);


/**
 * Marks a given class (constructor) as an implementation of
 * Listenable, do that we can query that fact at runtime. The class
 * must have already implemented the interface.
 * @param {!Function} cls The class constructor. The corresponding
 *     class must have already implemented the interface.
 */
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP] = true;
};


/**
 * @param {Object} obj The object to check.
 * @return {boolean} Whether a given instance implements
 *     Listenable. The class/superclass of the instance must call
 *     addImplementation.
 */
goog.events.Listenable.isImplementedBy = function(obj) {
  try {
    return !!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP]);
  } catch (e) {
    return false;
  }
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.listen;


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.listenOnce;


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.unlisten;


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
goog.events.Listenable.prototype.unlistenByKey;


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 */
goog.events.Listenable.prototype.dispatchEvent;


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
goog.events.Listenable.prototype.removeAllListeners;


/**
 * Returns the parent of this event target to use for capture/bubble
 * mechanism.
 *
 * NOTE(user): The name reflects the original implementation of
 * custom event target ({@code goog.events.EventTarget}). We decided
 * that changing the name is not worth it.
 *
 * @return {goog.events.Listenable} The parent EventTarget or null if
 *     there is no parent.
 */
goog.events.Listenable.prototype.getParentEventTarget;


/**
 * Fires all registered listeners in this listenable for the given
 * type and capture mode, passing them the given eventObject. This
 * does not perform actual capture/bubble. Only implementors of the
 * interface should be using this.
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The type of the
 *     listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @param {EVENTOBJ} eventObject The event object to fire.
 * @return {boolean} Whether all listeners succeeded without
 *     attempting to prevent default behavior. If any listener returns
 *     false or called goog.events.Event#preventDefault, this returns
 *     false.
 * @template EVENTOBJ
 */
goog.events.Listenable.prototype.fireListeners;


/**
 * Gets all listeners in this listenable for the given type and
 * capture mode.
 *
 * @param {string|!goog.events.EventId} type The type of the listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @return {!Array.<goog.events.ListenableKey>} An array of registered
 *     listeners.
 * @template EVENTOBJ
 */
goog.events.Listenable.prototype.getListeners;


/**
 * Gets the goog.events.ListenableKey for the event or null if no such
 * listener is in use.
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The name of the event
 *     without the 'on' prefix.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener The
 *     listener function to get.
 * @param {boolean} capture Whether the listener is a capturing listener.
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.getListener;


/**
 * Whether there is any active listeners matching the specified
 * signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble
 *     listeners.
 * @return {boolean} Whether there is any active listeners matching
 *     the requested type and/or capture phase.
 * @template EVENTOBJ
 */
goog.events.Listenable.prototype.hasListener;



/**
 * An interface that describes a single registered listener.
 * @interface
 */
goog.events.ListenableKey = function() {};


/**
 * Counter used to create a unique key
 * @type {number}
 * @private
 */
goog.events.ListenableKey.counter_ = 0;


/**
 * Reserves a key to be used for ListenableKey#key field.
 * @return {number} A number to be used to fill ListenableKey#key
 *     field.
 */
goog.events.ListenableKey.reserveKey = function() {
  return ++goog.events.ListenableKey.counter_;
};


/**
 * The source event target.
 * @type {!(Object|goog.events.Listenable|goog.events.EventTarget)}
 */
goog.events.ListenableKey.prototype.src;


/**
 * The event type the listener is listening to.
 * @type {string}
 */
goog.events.ListenableKey.prototype.type;


/**
 * The listener function.
 * @type {function(?):?|{handleEvent:function(?):?}|null}
 */
goog.events.ListenableKey.prototype.listener;


/**
 * Whether the listener works on capture phase.
 * @type {boolean}
 */
goog.events.ListenableKey.prototype.capture;


/**
 * The 'this' object for the listener function's scope.
 * @type {Object}
 */
goog.events.ListenableKey.prototype.handler;


/**
 * A globally unique number to identify the key.
 * @type {number}
 */
goog.events.ListenableKey.prototype.key;
}
if(!lt.util.load.provided_QMARK_('goog.userAgent')) {
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.define('goog.userAgent.ASSUME_IE', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.define('goog.userAgent.ASSUME_GECKO', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.define('goog.userAgent.ASSUME_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.define('goog.userAgent.ASSUME_MOBILE_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.define('goog.userAgent.ASSUME_OPERA', false);


/**
 * @define {boolean} Whether the
 *     {@code goog.userAgent.isVersionOrHigher}
 *     function will return true for any version.
 */
goog.define('goog.userAgent.ASSUME_ANY_VERSION', false);


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 * Some user agents (I'm thinking of you, Gears WorkerPool) do not expose a
 * navigator object off the global scope.  In that case we return null.
 *
 * @return {?string} The userAgent string or null if there is none.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : null;
};


/**
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (in a WorkerPool, for example).
  return goog.global['navigator'];
};


/**
 * Initializer for goog.userAgent.
 *
 * This is a named function so that it can be stripped via the jscompiler
 * option for stripping types.
 * @private
 */
goog.userAgent.init_ = function() {
  /**
   * Whether the user agent string denotes Opera.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedOpera_ = false;

  /**
   * Whether the user agent string denotes Internet Explorer. This includes
   * other browsers using Trident as its rendering engine. For example AOL
   * and Netscape 8
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIe_ = false;

  /**
   * Whether the user agent string denotes WebKit. WebKit is the rendering
   * engine that Safari, Android and others use.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWebkit_ = false;

  /**
   * Whether the user agent string denotes a mobile device.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMobile_ = false;

  /**
   * Whether the user agent string denotes Gecko. Gecko is the rendering
   * engine used by Mozilla, Mozilla Firefox, Camino and many more.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedGecko_ = false;

  var ua;
  if (!goog.userAgent.BROWSER_KNOWN_ &&
      (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = goog.string.startsWith(ua, 'Opera');
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ &&
        (goog.string.contains(ua, 'MSIE') ||
         goog.string.contains(ua, 'Trident'));
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ &&
        goog.string.contains(ua, 'WebKit');
    // WebKit also gives navigator.product string equal to 'Gecko'.
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ &&
        goog.string.contains(ua, 'Mobile');
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ &&
        !goog.userAgent.detectedWebkit_ && !goog.userAgent.detectedIe_ &&
        navigator.product == 'Gecko';
  }
};


if (!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_();
}


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;


/**
 * Whether the user agent is Internet Explorer. This includes other browsers
 * using Trident as its rendering engine. For example AOL and Netscape 8
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Mozilla Firefox, Camino and many more.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.userAgent.detectedGecko_;


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.userAgent.detectedWebkit_;


/**
 * Whether the user agent is running on a mobile device.
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.detectedMobile_;


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_MAC', false);


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_WINDOWS', false);


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_LINUX', false);


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.define('goog.userAgent.ASSUME_X11', false);


/**
 * @define {boolean} Whether the user agent is running on Android.
 */
goog.define('goog.userAgent.ASSUME_ANDROID', false);


/**
 * @define {boolean} Whether the user agent is running on an iPhone.
 */
goog.define('goog.userAgent.ASSUME_IPHONE', false);


/**
 * @define {boolean} Whether the user agent is running on an iPad.
 */
goog.define('goog.userAgent.ASSUME_IPAD', false);


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11 ||
    goog.userAgent.ASSUME_ANDROID ||
    goog.userAgent.ASSUME_IPHONE ||
    goog.userAgent.ASSUME_IPAD;


/**
 * Initialize the goog.userAgent constants that define which platform the user
 * agent is running on.
 * @private
 */
goog.userAgent.initPlatform_ = function() {
  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Mac');

  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWindows_ = goog.string.contains(
      goog.userAgent.PLATFORM, 'Win');

  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Linux');

  /**
   * Whether the user agent is running on a X11 windowing system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() &&
      goog.string.contains(goog.userAgent.getNavigator()['appVersion'] || '',
          'X11');

  // Need user agent string for Android/IOS detection
  var ua = goog.userAgent.getUserAgentString();

  /**
   * Whether the user agent is running on Android.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedAndroid_ = !!ua &&
      goog.string.contains(ua, 'Android');

  /**
   * Whether the user agent is running on an iPhone.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIPhone_ = !!ua && goog.string.contains(ua, 'iPhone');

  /**
   * Whether the user agent is running on an iPad.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIPad_ = !!ua && goog.string.contains(ua, 'iPad');
};


if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;


/**
 * Whether the user agent is running on a Linux operating system.
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;


/**
 * Whether the user agent is running on Android.
 * @type {boolean}
 */
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_ANDROID : goog.userAgent.detectedAndroid_;


/**
 * Whether the user agent is running on an iPhone.
 * @type {boolean}
 */
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPHONE : goog.userAgent.detectedIPhone_;


/**
 * Whether the user agent is running on an iPad.
 * @type {boolean}
 */
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPAD : goog.userAgent.detectedIPad_;


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re;

  if (goog.userAgent.OPERA && goog.global['opera']) {
    var operaVersion = goog.global['opera'].version;
    version = typeof operaVersion == 'function' ? operaVersion() : operaVersion;
  } else {
    if (goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/;
    } else if (goog.userAgent.IE) {
      re = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/;
    } else if (goog.userAgent.WEBKIT) {
      // WebKit/125.4
      re = /WebKit\/(\S+)/;
    }
    if (re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : '';
    }
  }
  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : undefined;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersionOrHigher}.
 * Calls to compareVersions are surprisingly expensive and, as a browser's
 * version number is unlikely to change during a session, we cache the results.
 * @const
 * @private
 */
goog.userAgent.isVersionOrHigherCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION ||
      goog.userAgent.isVersionOrHigherCache_[version] ||
      (goog.userAgent.isVersionOrHigherCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Deprecated alias to {@code goog.userAgent.isVersionOrHigher}.
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 * @deprecated Use goog.userAgent.isVersionOrHigher().
 */
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode;
};


/**
 * Deprecated alias to {@code goog.userAgent.isDocumentModeOrHigher}.
 * @param {number} version The version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *      same as the given version.
 * @deprecated Use goog.userAgent.isDocumentModeOrHigher().
 */
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;


/**
 * For IE version < 7, documentMode is undefined, so attempt to use the
 * CSS1Compat property to see if we are in standards mode. If we are in
 * standards mode, treat the browser version as the document mode. Otherwise,
 * IE is emulating version 5.
 * @type {number|undefined}
 * @const
 */
goog.userAgent.DOCUMENT_MODE = (function() {
  var doc = goog.global['document'];
  if (!doc || !goog.userAgent.IE) {
    return undefined;
  }
  var mode = goog.userAgent.getDocumentMode_();
  return mode || (doc['compatMode'] == 'CSS1Compat' ?
      parseInt(goog.userAgent.VERSION, 10) : 5);
})();
}
if(!lt.util.load.provided_QMARK_('goog.events.BrowserFeature')) {
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the events package.
 *
 */


goog.provide('goog.events.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.events.BrowserFeature = {
  /**
   * Whether the button attribute of the event is W3C compliant.  False in
   * Internet Explorer prior to version 9; document-version dependent.
   */
  HAS_W3C_BUTTON: !goog.userAgent.IE ||
      goog.userAgent.isDocumentModeOrHigher(9),

  /**
   * Whether the browser supports full W3C event model.
   */
  HAS_W3C_EVENT_SUPPORT: !goog.userAgent.IE ||
      goog.userAgent.isDocumentModeOrHigher(9),

  /**
   * To prevent default in IE7-8 for certain keydown events we need set the
   * keyCode to -1.
   */
  SET_KEY_CODE_TO_PREVENT_DEFAULT: goog.userAgent.IE &&
      !goog.userAgent.isVersionOrHigher('9'),

  /**
   * Whether the {@code navigator.onLine} property is supported.
   */
  HAS_NAVIGATOR_ONLINE_PROPERTY: !goog.userAgent.WEBKIT ||
      goog.userAgent.isVersionOrHigher('528'),

  /**
   * Whether HTML5 network online/offline events are supported.
   */
  HAS_HTML5_NETWORK_EVENT_SUPPORT:
      goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9b') ||
      goog.userAgent.IE && goog.userAgent.isVersionOrHigher('8') ||
      goog.userAgent.OPERA && goog.userAgent.isVersionOrHigher('9.5') ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('528'),

  /**
   * Whether HTML5 network events fire on document.body, or otherwise the
   * window.
   */
  HTML5_NETWORK_EVENTS_FIRE_ON_BODY:
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('8') ||
      goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9'),

  /**
   * Whether touch is enabled in the browser.
   */
  TOUCH_ENABLED:
      ('ontouchstart' in goog.global ||
          !!(goog.global['document'] &&
             document.documentElement &&
             'ontouchstart' in document.documentElement) ||
          // IE10 uses non-standard touch events, so it has a different check.
          !!(goog.global['navigator'] &&
              goog.global['navigator']['msMaxTouchPoints']))
};
}
if(!lt.util.load.provided_QMARK_('goog.events.EventType')) {
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Event Types.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author mirkov@google.com (Mirko Visontai)
 */


goog.provide('goog.events.EventType');

goog.require('goog.userAgent');


/**
 * Returns a prefixed event name for the current browser.
 * @param {string} eventName The name of the event.
 * @return {string} The prefixed event name.
 * @suppress {missingRequire|missingProvide}
 * @private
 */
goog.events.getVendorPrefixedName_ = function(eventName) {
  return goog.userAgent.WEBKIT ? 'webkit' + eventName :
      (goog.userAgent.OPERA ? 'o' + eventName.toLowerCase() :
          eventName.toLowerCase());
};


/**
 * Constants for event names.
 * @enum {string}
 */
goog.events.EventType = {
  // Mouse events
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',
  MOUSEENTER: 'mouseenter',
  MOUSELEAVE: 'mouseleave',
  // Select start is non-standard.
  // See http://msdn.microsoft.com/en-us/library/ie/ms536969(v=vs.85).aspx.
  SELECTSTART: 'selectstart', // IE, Safari, Chrome

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',
  DEACTIVATE: 'deactivate', // IE only
  // NOTE: The following two events are not stable in cross-browser usage.
  //     WebKit and Opera implement DOMFocusIn/Out.
  //     IE implements focusin/out.
  //     Gecko implements neither see bug at
  //     https://bugzilla.mozilla.org/show_bug.cgi?id=396927.
  // The DOM Events Level 3 Draft deprecates DOMFocusIn in favor of focusin:
  //     http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html
  // You can use FOCUS in Capture phase until implementations converge.
  FOCUSIN: goog.userAgent.IE ? 'focusin' : 'DOMFocusIn',
  FOCUSOUT: goog.userAgent.IE ? 'focusout' : 'DOMFocusOut',

  // Forms
  CHANGE: 'change',
  SELECT: 'select',
  SUBMIT: 'submit',
  INPUT: 'input',
  PROPERTYCHANGE: 'propertychange', // IE only

  // Drag and drop
  DRAGSTART: 'dragstart',
  DRAG: 'drag',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DRAGLEAVE: 'dragleave',
  DROP: 'drop',
  DRAGEND: 'dragend',

  // WebKit touch events.
  TOUCHSTART: 'touchstart',
  TOUCHMOVE: 'touchmove',
  TOUCHEND: 'touchend',
  TOUCHCANCEL: 'touchcancel',

  // Misc
  BEFOREUNLOAD: 'beforeunload',
  CONSOLEMESSAGE: 'consolemessage',
  CONTEXTMENU: 'contextmenu',
  DOMCONTENTLOADED: 'DOMContentLoaded',
  ERROR: 'error',
  HELP: 'help',
  LOAD: 'load',
  LOSECAPTURE: 'losecapture',
  ORIENTATIONCHANGE: 'orientationchange',
  READYSTATECHANGE: 'readystatechange',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  UNLOAD: 'unload',

  // HTML 5 History events
  // See http://www.w3.org/TR/html5/history.html#event-definitions
  HASHCHANGE: 'hashchange',
  PAGEHIDE: 'pagehide',
  PAGESHOW: 'pageshow',
  POPSTATE: 'popstate',

  // Copy and Paste
  // Support is limited. Make sure it works on your favorite browser
  // before using.
  // http://www.quirksmode.org/dom/events/cutcopypaste.html
  COPY: 'copy',
  PASTE: 'paste',
  CUT: 'cut',
  BEFORECOPY: 'beforecopy',
  BEFORECUT: 'beforecut',
  BEFOREPASTE: 'beforepaste',

  // HTML5 online/offline events.
  // http://www.w3.org/TR/offline-webapps/#related
  ONLINE: 'online',
  OFFLINE: 'offline',

  // HTML 5 worker events
  MESSAGE: 'message',
  CONNECT: 'connect',

  // CSS animation events.
  /** @suppress {missingRequire} */
  ANIMATIONSTART: goog.events.getVendorPrefixedName_('AnimationStart'),
  /** @suppress {missingRequire} */
  ANIMATIONEND: goog.events.getVendorPrefixedName_('AnimationEnd'),
  /** @suppress {missingRequire} */
  ANIMATIONITERATION: goog.events.getVendorPrefixedName_('AnimationIteration'),

  // CSS transition events. Based on the browser support described at:
  // https://developer.mozilla.org/en/css/css_transitions#Browser_compatibility
  /** @suppress {missingRequire} */
  TRANSITIONEND: goog.events.getVendorPrefixedName_('TransitionEnd'),

  // W3C Pointer Events
  // http://www.w3.org/TR/pointerevents/
  POINTERDOWN: 'pointerdown',
  POINTERUP: 'pointerup',
  POINTERCANCEL: 'pointercancel',
  POINTERMOVE: 'pointermove',
  POINTEROVER: 'pointerover',
  POINTEROUT: 'pointerout',
  POINTERENTER: 'pointerenter',
  POINTERLEAVE: 'pointerleave',
  GOTPOINTERCAPTURE: 'gotpointercapture',
  LOSTPOINTERCAPTURE: 'lostpointercapture',

  // IE specific events.
  // See http://msdn.microsoft.com/en-us/library/ie/hh772103(v=vs.85).aspx
  // Note: these events will be supplanted in IE11.
  MSGESTURECHANGE: 'MSGestureChange',
  MSGESTUREEND: 'MSGestureEnd',
  MSGESTUREHOLD: 'MSGestureHold',
  MSGESTURESTART: 'MSGestureStart',
  MSGESTURETAP: 'MSGestureTap',
  MSGOTPOINTERCAPTURE: 'MSGotPointerCapture',
  MSINERTIASTART: 'MSInertiaStart',
  MSLOSTPOINTERCAPTURE: 'MSLostPointerCapture',
  MSPOINTERCANCEL: 'MSPointerCancel',
  MSPOINTERDOWN: 'MSPointerDown',
  MSPOINTERENTER: 'MSPointerEnter',
  MSPOINTERHOVER: 'MSPointerHover',
  MSPOINTERLEAVE: 'MSPointerLeave',
  MSPOINTERMOVE: 'MSPointerMove',
  MSPOINTEROUT: 'MSPointerOut',
  MSPOINTEROVER: 'MSPointerOver',
  MSPOINTERUP: 'MSPointerUp',

  // Native IMEs/input tools events.
  TEXTINPUT: 'textinput',
  COMPOSITIONSTART: 'compositionstart',
  COMPOSITIONUPDATE: 'compositionupdate',
  COMPOSITIONEND: 'compositionend',

  // Webview tag events
  // See http://developer.chrome.com/dev/apps/webview_tag.html
  EXIT: 'exit',
  LOADABORT: 'loadabort',
  LOADCOMMIT: 'loadcommit',
  LOADREDIRECT: 'loadredirect',
  LOADSTART: 'loadstart',
  LOADSTOP: 'loadstop',
  RESPONSIVE: 'responsive',
  SIZECHANGED: 'sizechanged',
  UNRESPONSIVE: 'unresponsive',

  // HTML5 Page Visibility API.  See details at
  // {@code goog.labs.dom.PageVisibilityMonitor}.
  VISIBILITYCHANGE: 'visibilitychange',

  // LocalStorage event.
  STORAGE: 'storage'
};
}
if(!lt.util.load.provided_QMARK_('goog.events.BrowserEvent')) {
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A patched, standardized event object for browser events.
 *
 * <pre>
 * The patched event object contains the following members:
 * - type           {string}    Event type, e.g. 'click'
 * - timestamp      {Date}      A date object for when the event was fired
 * - target         {Object}    The element that actually triggered the event
 * - currentTarget  {Object}    The element the listener is attached to
 * - relatedTarget  {Object}    For mouseover and mouseout, the previous object
 * - offsetX        {number}    X-coordinate relative to target
 * - offsetY        {number}    Y-coordinate relative to target
 * - clientX        {number}    X-coordinate relative to viewport
 * - clientY        {number}    Y-coordinate relative to viewport
 * - screenX        {number}    X-coordinate relative to the edge of the screen
 * - screenY        {number}    Y-coordinate relative to the edge of the screen
 * - button         {number}    Mouse button. Use isButton() to test.
 * - keyCode        {number}    Key-code
 * - ctrlKey        {boolean}   Was ctrl key depressed
 * - altKey         {boolean}   Was alt key depressed
 * - shiftKey       {boolean}   Was shift key depressed
 * - metaKey        {boolean}   Was meta key depressed
 * - defaultPrevented {boolean} Whether the default action has been prevented
 * - state          {Object}    History state object
 *
 * NOTE: The keyCode member contains the raw browser keyCode. For normalized
 * key and character code use {@link goog.events.KeyHandler}.
 * </pre>
 *
 */

goog.provide('goog.events.BrowserEvent');
goog.provide('goog.events.BrowserEvent.MouseButton');

goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.reflect');
goog.require('goog.userAgent');



/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * The content of this object will not be initialized if no event object is
 * provided. If this is the case, init() needs to be invoked separately.
 * @param {Event=} opt_e Browser event object.
 * @param {EventTarget=} opt_currentTarget Current target for event.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  goog.events.BrowserEvent.base(this, 'constructor', opt_e ? opt_e.type : '');

  /**
   * Target that fired the event.
   * @override
   * @type {Node}
   */
  this.target = null;

  /**
   * Node that had the listener attached.
   * @override
   * @type {Node|undefined}
   */
  this.currentTarget = null;

  /**
   * For mouseover and mouseout events, the related object for the event.
   * @type {Node}
   */
  this.relatedTarget = null;

  /**
   * X-coordinate relative to target.
   * @type {number}
   */
  this.offsetX = 0;

  /**
   * Y-coordinate relative to target.
   * @type {number}
   */
  this.offsetY = 0;

  /**
   * X-coordinate relative to the window.
   * @type {number}
   */
  this.clientX = 0;

  /**
   * Y-coordinate relative to the window.
   * @type {number}
   */
  this.clientY = 0;

  /**
   * X-coordinate relative to the monitor.
   * @type {number}
   */
  this.screenX = 0;

  /**
   * Y-coordinate relative to the monitor.
   * @type {number}
   */
  this.screenY = 0;

  /**
   * Which mouse button was pressed.
   * @type {number}
   */
  this.button = 0;

  /**
   * Keycode of key press.
   * @type {number}
   */
  this.keyCode = 0;

  /**
   * Keycode of key press.
   * @type {number}
   */
  this.charCode = 0;

  /**
   * Whether control was pressed at time of event.
   * @type {boolean}
   */
  this.ctrlKey = false;

  /**
   * Whether alt was pressed at time of event.
   * @type {boolean}
   */
  this.altKey = false;

  /**
   * Whether shift was pressed at time of event.
   * @type {boolean}
   */
  this.shiftKey = false;

  /**
   * Whether the meta key was pressed at time of event.
   * @type {boolean}
   */
  this.metaKey = false;

  /**
   * History state object, only set for PopState events where it's a copy of the
   * state object provided to pushState or replaceState.
   * @type {Object}
   */
  this.state = null;

  /**
   * Whether the default platform modifier key was pressed at time of event.
   * (This is control for all platforms except Mac, where it's Meta.)
   * @type {boolean}
   */
  this.platformModifierKey = false;

  /**
   * The browser event object.
   * @private {Event}
   */
  this.event_ = null;

  if (opt_e) {
    this.init(opt_e, opt_currentTarget);
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);


/**
 * Normalized button constants for the mouse.
 * @enum {number}
 */
goog.events.BrowserEvent.MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Static data for mapping mouse buttons.
 * @type {!Array.<number>}
 */
goog.events.BrowserEvent.IEButtonMap = [
  1, // LEFT
  4, // MIDDLE
  2  // RIGHT
];


/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * @param {Event} e Browser event object.
 * @param {EventTarget=} opt_currentTarget Current target for event.
 */
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;

  // TODO(nicksantos): Change this.target to type EventTarget.
  this.target = /** @type {Node} */ (e.target) || e.srcElement;

  // TODO(nicksantos): Change this.currentTarget to type EventTarget.
  this.currentTarget = /** @type {Node} */ (opt_currentTarget);

  var relatedTarget = /** @type {Node} */ (e.relatedTarget);
  if (relatedTarget) {
    // There's a bug in FireFox where sometimes, relatedTarget will be a
    // chrome element, and accessing any property of it will get a permission
    // denied exception. See:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=497780
    if (goog.userAgent.GECKO) {
      if (!goog.reflect.canAccessProperty(relatedTarget, 'nodeName')) {
        relatedTarget = null;
      }
    }
    // TODO(arv): Use goog.events.EventType when it has been refactored into its
    // own file.
  } else if (type == goog.events.EventType.MOUSEOVER) {
    relatedTarget = e.fromElement;
  } else if (type == goog.events.EventType.MOUSEOUT) {
    relatedTarget = e.toElement;
  }

  this.relatedTarget = relatedTarget;

  // Webkit emits a lame warning whenever layerX/layerY is accessed.
  // http://code.google.com/p/chromium/issues/detail?id=101733
  this.offsetX = (goog.userAgent.WEBKIT || e.offsetX !== undefined) ?
      e.offsetX : e.layerX;
  this.offsetY = (goog.userAgent.WEBKIT || e.offsetY !== undefined) ?
      e.offsetY : e.layerY;

  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;

  this.button = e.button;

  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == 'keypress' ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  if (e.defaultPrevented) {
    this.preventDefault();
  }
};


/**
 * Tests to see which button was pressed during the event. This is really only
 * useful in IE and Gecko browsers. And in IE, it's only useful for
 * mousedown/mouseup events, because click only fires for the left mouse button.
 *
 * Safari 2 only reports the left button being clicked, and uses the value '1'
 * instead of 0. Opera only reports a mousedown event for the middle button, and
 * no mouse events for the right button. Opera has default behavior for left and
 * middle click that can only be overridden via a configuration setting.
 *
 * There's a nice table of this mess at http://www.unixpapa.com/js/mouse.html.
 *
 * @param {goog.events.BrowserEvent.MouseButton} button The button
 *     to test for.
 * @return {boolean} True if button was pressed.
 */
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if (this.type == 'click') {
      return button == goog.events.BrowserEvent.MouseButton.LEFT;
    } else {
      return !!(this.event_.button &
          goog.events.BrowserEvent.IEButtonMap[button]);
    }
  } else {
    return this.event_.button == button;
  }
};


/**
 * Whether this has an "action"-producing mouse button.
 *
 * By definition, this includes left-click on windows/linux, and left-click
 * without the ctrl key on Macs.
 *
 * @return {boolean} The result.
 */
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  // Webkit does not ctrl+click to be a right-click, so we
  // normalize it to behave like Gecko and Opera.
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) &&
      !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey);
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if (!be.preventDefault) {
    be.returnValue = false;
    if (goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      /** @preserveTry */
      try {
        // Most keys can be prevented using returnValue. Some special keys
        // require setting the keyCode to -1 as well:
        //
        // In IE7:
        // F3, F5, F10, F11, Ctrl+P, Crtl+O, Ctrl+F (these are taken from IE6)
        //
        // In IE8:
        // Ctrl+P, Crtl+O, Ctrl+F (F1-F12 cannot be stopped through the event)
        //
        // We therefore do this for all function keys as well as when Ctrl key
        // is pressed.
        var VK_F1 = 112;
        var VK_F12 = 123;
        if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1;
        }
      } catch (ex) {
        // IE throws an 'access denied' exception when trying to change
        // keyCode in some situations (e.g. srcElement is input[type=file],
        // or srcElement is an anchor tag rewritten by parent's innerHTML).
        // Do nothing in this case.
      }
    }
  } else {
    be.preventDefault();
  }
};


/**
 * @return {Event} The underlying browser event object.
 */
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};


/** @override */
goog.events.BrowserEvent.prototype.disposeInternal = function() {
};
}
if(!lt.util.load.provided_QMARK_('goog.events')) {
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview An event manager for both native browser event
 * targets and custom JavaScript event targets
 * ({@code goog.events.Listenable}). This provides an abstraction
 * over browsers' event systems.
 *
 * It also provides a simulation of W3C event model's capture phase in
 * Internet Explorer (IE 8 and below). Caveat: the simulation does not
 * interact well with listeners registered directly on the elements
 * (bypassing goog.events) or even with listeners registered via
 * goog.events in a separate JS binary. In these cases, we provide
 * no ordering guarantees.
 *
 * The listeners will receive a "patched" event object. Such event object
 * contains normalized values for certain event properties that differs in
 * different browsers.
 *
 * Example usage:
 * <pre>
 * goog.events.listen(myNode, 'click', function(e) { alert('woo') });
 * goog.events.listen(myNode, 'mouseover', mouseHandler, true);
 * goog.events.unlisten(myNode, 'mouseover', mouseHandler, true);
 * goog.events.removeAll(myNode);
 * </pre>
 *
 *                                            in IE and event object patching]
 *
 * @see ../demos/events.html
 * @see ../demos/event-propagation.html
 * @see ../demos/stopevent.html
 */

// IMPLEMENTATION NOTES:
// goog.events stores an auxiliary data structure on each EventTarget
// source being listened on. This allows us to take advantage of GC,
// having the data structure GC'd when the EventTarget is GC'd. This
// GC behavior is equivalent to using W3C DOM Events directly.

goog.provide('goog.events');
goog.provide('goog.events.CaptureSimulationMode');
goog.provide('goog.events.Key');
goog.provide('goog.events.ListenableType');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Listenable');
goog.require('goog.events.ListenerMap');


/**
 * @typedef {number|goog.events.ListenableKey}
 */
goog.events.Key;


/**
 * @typedef {EventTarget|goog.events.Listenable}
 */
goog.events.ListenableType;


/**
 * Container for storing event listeners and their proxies
 *
 * TODO(user): Remove this when all external usage is
 * purged. goog.events no longer use goog.events.listeners_ for
 * anything meaningful.
 *
 * @private {!Object.<goog.events.ListenableKey>}
 */
goog.events.listeners_ = {};


/**
 * Property name on a native event target for the listener map
 * associated with the event target.
 * @const
 * @private
 */
goog.events.LISTENER_MAP_PROP_ = 'closure_lm_' + ((Math.random() * 1e6) | 0);


/**
 * String used to prepend to IE event types.
 * @const
 * @private
 */
goog.events.onString_ = 'on';


/**
 * Map of computed "on<eventname>" strings for IE event types. Caching
 * this removes an extra object allocation in goog.events.listen which
 * improves IE6 performance.
 * @const
 * @dict
 * @private
 */
goog.events.onStringMap_ = {};


/**
 * @enum {number} Different capture simulation mode for IE8-.
 */
goog.events.CaptureSimulationMode = {
  /**
   * Does not perform capture simulation. Will asserts in IE8- when you
   * add capture listeners.
   */
  OFF_AND_FAIL: 0,

  /**
   * Does not perform capture simulation, silently ignore capture
   * listeners.
   */
  OFF_AND_SILENT: 1,

  /**
   * Performs capture simulation.
   */
  ON: 2
};


/**
 * @define {number} The capture simulation mode for IE8-. By default,
 *     this is ON.
 */
goog.define('goog.events.CAPTURE_SIMULATION_MODE', 2);


/**
 * Estimated count of total native listeners.
 * @private {number}
 */
goog.events.listenerCountEstimate_ = 0;


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}. A listener can only be added once
 * to an object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {EventTarget|goog.events.Listenable} src The node to listen
 *     to events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {function(this:T, ?):?|{handleEvent:function(?):?}|null} listener
 *     Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 * @template T
 */
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listen(
        /** @type {string} */ (type), listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_(
        /** @type {EventTarget} */ (src),
        type, listener, /* callOnce */ false, opt_capt, opt_handler);
  }
};


/**
 * Adds an event listener for a specific event on a native event
 * target. A listener can only be added once to an object and if it
 * is added again the key for the listener is returned.
 *
 * Note that a one-off listener will not change an existing listener,
 * if any. On the other hand a normal listener will change existing
 * one-off listener to become a normal listener.
 *
 * @param {EventTarget} src The node to listen to events on.
 * @param {?string} type Event type or array of event types.
 * @param {!Function} listener Callback function.
 * @param {boolean} callOnce Whether the listener is a one-off
 *     listener or otherwise.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @private
 */
goog.events.listen_ = function(
    src, type, listener, callOnce, opt_capt, opt_handler) {
  if (!type) {
    throw Error('Invalid event type');
  }

  var capture = !!opt_capt;
  if (capture && !goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    if (goog.events.CAPTURE_SIMULATION_MODE ==
        goog.events.CaptureSimulationMode.OFF_AND_FAIL) {
      goog.asserts.fail('Can not register capture listener in IE8-.');
      return null;
    } else if (goog.events.CAPTURE_SIMULATION_MODE ==
        goog.events.CaptureSimulationMode.OFF_AND_SILENT) {
      return null;
    }
  }

  var listenerMap = goog.events.getListenerMap_(src);
  if (!listenerMap) {
    src[goog.events.LISTENER_MAP_PROP_] = listenerMap =
        new goog.events.ListenerMap(src);
  }

  var listenerObj = listenerMap.add(
      type, listener, callOnce, opt_capt, opt_handler);

  // If the listenerObj already has a proxy, it has been set up
  // previously. We simply return.
  if (listenerObj.proxy) {
    return listenerObj;
  }

  var proxy = goog.events.getProxy();
  listenerObj.proxy = proxy;

  proxy.src = src;
  proxy.listener = listenerObj;

  // Attach the proxy through the browser's API
  if (src.addEventListener) {
    src.addEventListener(type, proxy, capture);
  } else {
    // The else above used to be else if (src.attachEvent) and then there was
    // another else statement that threw an exception warning the developer
    // they made a mistake. This resulted in an extra object allocation in IE6
    // due to a wrapper object that had to be implemented around the element
    // and so was removed.
    src.attachEvent(goog.events.getOnString_(type), proxy);
  }

  goog.events.listenerCountEstimate_++;
  return listenerObj;
};


/**
 * Helper function for returning a proxy function.
 * @return {Function} A new or reused function object.
 */
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  // Use a local var f to prevent one allocation.
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ?
      function(eventObject) {
        return proxyCallbackFunction.call(f.src, f.listener, eventObject);
      } :
      function(eventObject) {
        var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
        // NOTE(user): In IE, we hack in a capture phase. However, if
        // there is inline event handler which tries to prevent default (for
        // example <a href="..." onclick="return false">...</a>) in a
        // descendant element, the prevent default will be overridden
        // by this listener if this listener were to return true. Hence, we
        // return undefined.
        if (!v) return v;
      };
  return f;
};


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}. After the event has fired the event
 * listener is removed from the target.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {EventTarget|goog.events.Listenable} src The node to listen
 *     to events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {function(this:T, ?):?|{handleEvent:function(?):?}|null} listener
 *     Callback method.
 * @param {boolean=} opt_capt Fire in capture phase?.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 * @template T
 */
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listenOnce(
        /** @type {string} */ (type), listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_(
        /** @type {EventTarget} */ (src),
        type, listener, /* callOnce */ true, opt_capt, opt_handler);
  }
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.Listenable}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.Listenable} src The target to
 *     listen to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(this:T, ?):?|{handleEvent:function(?):?}|null} listener
 *     Callback method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T
 */
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {EventTarget|goog.events.Listenable} src The target to stop
 *     listening to events on.
 * @param {string|Array.<string>} type The name of the event without the 'on'
 *     prefix.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?boolean} indicating whether the listener was there to remove.
 */
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten(
        /** @type {string} */ (type), listener, opt_capt, opt_handler);
  }

  if (!src) {
    // TODO(user): We should tighten the API to only accept
    // non-null objects, or add an assertion here.
    return false;
  }

  var capture = !!opt_capt;
  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (src));
  if (listenerMap) {
    var listenerObj = listenerMap.getListener(
        /** @type {string} */ (type), listener, capture, opt_handler);
    if (listenerObj) {
      return goog.events.unlistenByKey(listenerObj);
    }
  }

  return false;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.Key} key The key returned by listen() for this
 *     event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 */
goog.events.unlistenByKey = function(key) {
  // TODO(user): Remove this check when tests that rely on this
  // are fixed.
  if (goog.isNumber(key)) {
    return false;
  }

  var listener = /** @type {goog.events.ListenableKey} */ (key);
  if (!listener || listener.removed) {
    return false;
  }

  var src = listener.src;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlistenByKey(listener);
  }

  var type = listener.type;
  var proxy = listener.proxy;
  if (src.removeEventListener) {
    src.removeEventListener(type, proxy, listener.capture);
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  }
  goog.events.listenerCountEstimate_--;

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (src));
  // TODO(user): Try to remove this conditional and execute the
  // first branch always. This should be safe.
  if (listenerMap) {
    listenerMap.removeByKey(listener);
    if (listenerMap.getTypeCount() == 0) {
      // Null the src, just because this is simple to do (and useful
      // for IE <= 7).
      listenerMap.src = null;
      // We don't use delete here because IE does not allow delete
      // on a window object.
      src[goog.events.LISTENER_MAP_PROP_] = null;
    }
  } else {
    listener.markAsRemoved();
  }

  return true;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.Listenable} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};


/**
 * Removes all listeners from an object. You can also optionally
 * remove listeners of a particular type.
 *
 * @param {Object=} opt_obj Object to remove listeners from. Not
 *     specifying opt_obj is now DEPRECATED (it used to remove all
 *     registered listeners).
 * @param {string=} opt_type Type of event to, default is all types.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(opt_obj, opt_type) {
  // TODO(user): Change the type of opt_obj from Object= to
  // !EventTarget|goog.events.Listenable). And replace this with an
  // assertion.
  if (!opt_obj) {
    return 0;
  }

  if (goog.events.Listenable.isImplementedBy(opt_obj)) {
    return opt_obj.removeAllListeners(opt_type);
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (opt_obj));
  if (!listenerMap) {
    return 0;
  }

  var count = 0;
  for (var type in listenerMap.listeners) {
    if (!opt_type || type == opt_type) {
      // Clone so that we don't need to worry about unlistenByKey
      // changing the content of the ListenerMap.
      var listeners = goog.array.clone(listenerMap.listeners[type]);
      for (var i = 0; i < listeners.length; ++i) {
        if (goog.events.unlistenByKey(listeners[i])) {
          ++count;
        }
      }
    }
  }
  return count;
};


/**
 * Removes all native listeners registered via goog.events. Native
 * listeners are listeners on native browser objects (such as DOM
 * elements). In particular, goog.events.Listenable and
 * goog.events.EventTarget listeners will NOT be removed.
 * @return {number} Number of listeners removed.
 * @deprecated This doesn't do anything, now that Closure no longer
 * stores a central listener registry.
 */
goog.events.removeAllNativeListeners = function() {
  goog.events.listenerCountEstimate_ = 0;
  return 0;
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.getListeners(type, capture);
  } else {
    if (!obj) {
      // TODO(user): We should tighten the API to accept
      // !EventTarget|goog.events.Listenable, and add an assertion here.
      return [];
    }

    var listenerMap = goog.events.getListenerMap_(
        /** @type {EventTarget} */ (obj));
    return listenerMap ? listenerMap.getListeners(type, capture) : [];
  }
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {EventTarget|goog.events.Listenable} src The target from
 *     which to get listeners.
 * @param {?string} type The name of the event without the 'on' prefix.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to get.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  // TODO(user): Change type from ?string to string, or add assertion.
  type = /** @type {string} */ (type);
  listener = goog.events.wrapListener(listener);
  var capture = !!opt_capt;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener(type, listener, capture, opt_handler);
  }

  if (!src) {
    // TODO(user): We should tighten the API to only accept
    // non-null objects, or add an assertion here.
    return null;
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (src));
  if (listenerMap) {
    return listenerMap.getListener(type, listener, capture, opt_handler);
  }
  return null;
};


/**
 * Returns whether an event target has any active listeners matching the
 * specified signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {EventTarget|goog.events.Listenable} obj Target to get
 *     listeners for.
 * @param {string=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble-phase
 *     listeners.
 * @return {boolean} Whether an event target has one or more listeners matching
 *     the requested type and/or capture phase.
 */
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture);
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (obj));
  return !!listenerMap && listenerMap.hasListener(opt_type, opt_capture);
};


/**
 * Provides a nice string showing the normalized event objects public members
 * @param {Object} e Event Object.
 * @return {string} String of the public members of the normalized event object.
 */
goog.events.expose = function(e) {
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + ' = ' + e[key] + ' (' + e[key].id + ')');
    } else {
      str.push(key + ' = ' + e[key]);
    }
  }
  return str.join('\n');
};


/**
 * Returns a string with on prepended to the specified type. This is used for IE
 * which expects "on" to be prepended. This function caches the string in order
 * to avoid extra allocations in steady state.
 * @param {string} type Event type.
 * @return {string} The type string with 'on' prepended.
 * @private
 */
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};


/**
 * Fires an object's listeners of a particular type and phase
 *
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.fireListeners(type, capture, eventObject);
  }

  return goog.events.fireListeners_(obj, type, capture, eventObject);
};


/**
 * Fires an object's listeners of a particular type and phase.
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 * @private
 */
goog.events.fireListeners_ = function(obj, type, capture, eventObject) {
  var retval = 1;

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (obj));
  if (listenerMap) {
    // TODO(user): Original code avoids array creation when there
    // is no listener, so we do the same. If this optimization turns
    // out to be not required, we can replace this with
    // listenerMap.getListeners(type, capture) instead, which is simpler.
    var listenerArray = listenerMap.listeners[type];
    if (listenerArray) {
      listenerArray = goog.array.clone(listenerArray);
      for (var i = 0; i < listenerArray.length; i++) {
        var listener = listenerArray[i];
        // We might not have a listener if the listener was removed.
        if (listener && listener.capture == capture && !listener.removed) {
          retval &=
              goog.events.fireListener(listener, eventObject) !== false;
        }
      }
    }
  }
  return Boolean(retval);
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.events.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {boolean} Result of listener.
 */
goog.events.fireListener = function(listener, eventObject) {
  var listenerFn = listener.listener;
  var listenerHandler = listener.handler || listener.src;

  if (listener.callOnce) {
    goog.events.unlistenByKey(listener);
  }
  return listenerFn.call(listenerHandler, eventObject);
};


/**
 * Gets the total number of listeners currently in the system.
 * @return {number} Number of listeners.
 * @deprecated This returns estimated count, now that Closure no longer
 * stores a central listener registry. We still return an estimation
 * to keep existing listener-related tests passing. In the near future,
 * this function will be removed.
 */
goog.events.getTotalListenerCount = function() {
  return goog.events.listenerCountEstimate_;
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.Listenable} src The event target.
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false) this will also return false.
 *     If there are no handlers, or if all handlers return true, this returns
 *     true.
 */
goog.events.dispatchEvent = function(src, e) {
  goog.asserts.assert(
      goog.events.Listenable.isImplementedBy(src),
      'Can not use goog.events.dispatchEvent with ' +
      'non-goog.events.Listenable instance.');
  return src.dispatchEvent(e);
};


/**
 * Installs exception protection for the browser event entry point using the
 * given error handler.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point.
 */
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(
      goog.events.handleBrowserEvent_);
};


/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * @param {goog.events.Listener} listener The listener object.
 * @param {Event=} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {boolean} Result of the event handler.
 * @this {EventTarget} The object or Element that fired the event.
 * @private
 */
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if (listener.removed) {
    return true;
  }

  // Synthesize event propagation if the browser does not support W3C
  // event model.
  if (!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt ||
        /** @type {Event} */ (goog.getObjectByName('window.event'));
    var evt = new goog.events.BrowserEvent(ieEvent, this);
    var retval = true;

    if (goog.events.CAPTURE_SIMULATION_MODE ==
            goog.events.CaptureSimulationMode.ON) {
      // If we have not marked this event yet, we should perform capture
      // simulation.
      if (!goog.events.isMarkedIeEvent_(ieEvent)) {
        goog.events.markIeEvent_(ieEvent);

        var ancestors = [];
        for (var parent = evt.currentTarget; parent;
             parent = parent.parentNode) {
          ancestors.push(parent);
        }

        // Fire capture listeners.
        var type = listener.type;
        for (var i = ancestors.length - 1; !evt.propagationStopped_ && i >= 0;
             i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, true, evt);
        }

        // Fire bubble listeners.
        //
        // We can technically rely on IE to perform bubble event
        // propagation. However, it turns out that IE fires events in
        // opposite order of attachEvent registration, which broke
        // some code and tests that rely on the order. (While W3C DOM
        // Level 2 Events TR leaves the event ordering unspecified,
        // modern browsers and W3C DOM Level 3 Events Working Draft
        // actually specify the order as the registration order.)
        for (var i = 0; !evt.propagationStopped_ && i < ancestors.length; i++) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, false, evt);
        }
      }
    } else {
      retval = goog.events.fireListener(listener, evt);
    }
    return retval;
  }

  // Otherwise, simply fire the listener.
  return goog.events.fireListener(
      listener, new goog.events.BrowserEvent(opt_evt, this));
};


/**
 * This is used to mark the IE event object so we do not do the Closure pass
 * twice for a bubbling event.
 * @param {Event} e The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
  // Only the keyCode and the returnValue can be changed. We use keyCode for
  // non keyboard events.
  // event.returnValue is a bit more tricky. It is undefined by default. A
  // boolean false prevents the default action. In a window.onbeforeunload and
  // the returnValue is non undefined it will be alerted. However, we will only
  // modify the returnValue for keyboard events. We can get a problem if non
  // closure events sets the keyCode or the returnValue

  var useReturnValue = false;

  if (e.keyCode == 0) {
    // We cannot change the keyCode in case that srcElement is input[type=file].
    // We could test that that is the case but that would allocate 3 objects.
    // If we use try/catch we will only allocate extra objects in the case of a
    // failure.
    /** @preserveTry */
    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }

  if (useReturnValue ||
      /** @type {boolean|undefined} */ (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};


/**
 * This is used to check if an IE event has already been handled by the Closure
 * system so we do not do the Closure pass twice for a bubbling event.
 * @param {Event} e  The IE browser event.
 * @return {boolean} True if the event object has been marked.
 * @private
 */
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};


/**
 * Counter to create unique event ids.
 * @private {number}
 */
goog.events.uniqueIdCounter_ = 0;


/**
 * Creates a unique event id.
 *
 * @param {string} identifier The identifier.
 * @return {string} A unique identifier.
 * @idGenerator
 */
goog.events.getUniqueId = function(identifier) {
  return identifier + '_' + goog.events.uniqueIdCounter_++;
};


/**
 * @param {EventTarget} src The source object.
 * @return {goog.events.ListenerMap} A listener map for the given
 *     source object, or null if none exists.
 * @private
 */
goog.events.getListenerMap_ = function(src) {
  var listenerMap = src[goog.events.LISTENER_MAP_PROP_];
  // IE serializes the property as well (e.g. when serializing outer
  // HTML). So we must check that the value is of the correct type.
  return listenerMap instanceof goog.events.ListenerMap ? listenerMap : null;
};


/**
 * Expando property for listener function wrapper for Object with
 * handleEvent.
 * @const
 * @private
 */
goog.events.LISTENER_WRAPPER_PROP_ = '__closure_events_fn_' +
    ((Math.random() * 1e9) >>> 0);


/**
 * @param {Object|Function} listener The listener function or an
 *     object that contains handleEvent method.
 * @return {!Function} Either the original function or a function that
 *     calls obj.handleEvent. If the same listener is passed to this
 *     function more than once, the same function is guaranteed to be
 *     returned.
 */
goog.events.wrapListener = function(listener) {
  goog.asserts.assert(listener, 'Listener can not be null.');

  if (goog.isFunction(listener)) {
    return listener;
  }

  goog.asserts.assert(
      listener.handleEvent, 'An object listener must have handleEvent method.');
  return listener[goog.events.LISTENER_WRAPPER_PROP_] ||
      (listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
        return listener.handleEvent(e);
      });
};


// Register the browser event handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.events.handleBrowserEvent_ = transformer(
          goog.events.handleBrowserEvent_);
    });
}
if(!lt.util.load.provided_QMARK_('lt.plugins.haskell')) {
goog.provide('lt.plugins.haskell');
goog.require('cljs.core');
goog.require('lt.objs.plugins');
goog.require('lt.objs.files');
goog.require('lt.objs.platform');
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
goog.require('lt.objs.platform');
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
lt.plugins.haskell.plugin_dir = lt.objs.plugins.find_plugin.call(null,"Haskell");
lt.plugins.haskell.binary_path = lt.objs.files.join.call(null,lt.plugins.haskell.plugin_dir,(cljs.core.truth_(lt.objs.platform.win_QMARK_.call(null))?"run-server.bat":"./run-server.sh"));
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
{var location = hoogle_doc.location;var vec__7953 = /http:\/\/hackage.haskell.org\/packages\/archive\/(.+)\/latest\/doc\/html\/(.+).html/.exec(location);var with_mod = cljs.core.nth.call(null,vec__7953,0,null);var mod_package = cljs.core.nth.call(null,vec__7953,1,null);var module_name = cljs.core.nth.call(null,vec__7953,2,null);var explanation = (((with_mod == null))?"":[cljs.core.str(" ("),cljs.core.str(mod_package),cljs.core.str(": "),cljs.core.str(clojure.string.replace.call(null,module_name,"-",".")),cljs.core.str(")")].join(''));return new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),hoogle_doc.self,new cljs.core.Keyword(null,"ns","ns",1013907767),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"a","a",1013904339),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"href","href",1017115293),location], null),[cljs.core.str("Hoogle"),cljs.core.str(explanation)].join('')], null),new cljs.core.Keyword(null,"doc","doc",1014003882),hoogle_doc.docs], null);
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
lt.plugins.haskell.find_symbol_at_cursor = (function find_symbol_at_cursor(editor){var loc = lt.objs.editor.__GT_cursor.call(null,editor);var token_left = lt.objs.editor.__GT_token.call(null,editor,loc);var token_right = lt.objs.editor.__GT_token.call(null,editor,cljs.core.update_in.call(null,loc,new cljs.core.PersistentVector(null, 1, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.Keyword(null,"ch","ch",1013907415)], null),cljs.core.inc));var or__6364__auto__ = (cljs.core.truth_(lt.plugins.haskell.symbol_token_QMARK_.call(null,new cljs.core.Keyword(null,"string","string",4416885635).cljs$core$IFn$_invoke$arity$1(token_right)))?cljs.core.assoc.call(null,token_right,new cljs.core.Keyword(null,"loc","loc",1014011570),loc):null);if(cljs.core.truth_(or__6364__auto__))
{return or__6364__auto__;
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
lt.plugins.haskell.inline_hoogle_doc = (function inline_hoogle_doc(editor,results){var loc = lt.objs.editor.__GT_cursor.call(null,editor);var doc = lt.plugins.haskell.hoogle__GT_convert_doc.call(null,cljs.core.first.call(null,lt.plugins.haskell.hoogle__GT_parse.call(null,results)));if((doc == null))
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
lt.plugins.haskell.format_inline_error = (function format_inline_error(error){var error_unified = clojure.string.replace.call(null,error,":\\","_\\");var split_error = error_unified.split(":");var message_only = clojure.string.trim.call(null,clojure.string.join.call(null,":",cljs.core.drop.call(null,3,split_error)));var message = clojure.string.replace.call(null,message_only,"\u0000","\n");return new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"msg","msg",1014012659),message,new cljs.core.Keyword(null,"loc","loc",1014011570),new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"line","line",1017226086),(parseInt(cljs.core.nth.call(null,split_error,1)) - 1),new cljs.core.Keyword(null,"ch","ch",1013907415),1,new cljs.core.Keyword(null,"start-line","start-line",3689311729),(parseInt(cljs.core.nth.call(null,split_error,1)) - 1)], null)], null);
});
lt.plugins.haskell.print_inline_error = (function print_inline_error(editor,error){var formatted_error = lt.plugins.haskell.format_inline_error.call(null,error);return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.exception","editor.exception",3983021184),new cljs.core.Keyword(null,"msg","msg",1014012659).cljs$core$IFn$_invoke$arity$1(formatted_error),new cljs.core.Keyword(null,"loc","loc",1014011570).cljs$core$IFn$_invoke$arity$1(formatted_error));
});
lt.plugins.haskell.print_inline_errors = (function print_inline_errors(editor,data){var seq__7958 = cljs.core.seq.call(null,data);var chunk__7959 = null;var count__7960 = 0;var i__7961 = 0;while(true){
if((i__7961 < count__7960))
{var error = cljs.core._nth.call(null,chunk__7959,i__7961);lt.plugins.haskell.print_inline_error.call(null,editor,error);
{
var G__7975 = seq__7958;
var G__7976 = chunk__7959;
var G__7977 = count__7960;
var G__7978 = (i__7961 + 1);
seq__7958 = G__7975;
chunk__7959 = G__7976;
count__7960 = G__7977;
i__7961 = G__7978;
continue;
}
} else
{var temp__4092__auto__ = cljs.core.seq.call(null,seq__7958);if(temp__4092__auto__)
{var seq__7958__$1 = temp__4092__auto__;if(cljs.core.chunked_seq_QMARK_.call(null,seq__7958__$1))
{var c__7112__auto__ = cljs.core.chunk_first.call(null,seq__7958__$1);{
var G__7979 = cljs.core.chunk_rest.call(null,seq__7958__$1);
var G__7980 = c__7112__auto__;
var G__7981 = cljs.core.count.call(null,c__7112__auto__);
var G__7982 = 0;
seq__7958 = G__7979;
chunk__7959 = G__7980;
count__7960 = G__7981;
i__7961 = G__7982;
continue;
}
} else
{var error = cljs.core.first.call(null,seq__7958__$1);lt.plugins.haskell.print_inline_error.call(null,editor,error);
{
var G__7983 = cljs.core.next.call(null,seq__7958__$1);
var G__7984 = null;
var G__7985 = 0;
var G__7986 = 0;
seq__7958 = G__7983;
chunk__7959 = G__7984;
count__7960 = G__7985;
i__7961 = G__7986;
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
lt.plugins.haskell.__BEH__haskell_success = (function __BEH__haskell_success(editor,result){lt.objs.notifos.done_working.call(null);
return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.result","editor.result",4030217008),"\u2713",new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(result)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-success","lt.plugins.haskell/haskell-success",1936333612),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_success,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.eval.haskell.success","editor.eval.haskell.success",2473581066),null], null), null));
lt.plugins.haskell.__BEH__haskell_result = (function __BEH__haskell_result(editor,result){lt.objs.notifos.done_working.call(null);
return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.result","editor.result",4030217008),new cljs.core.Keyword(null,"data","data",1016980252).cljs$core$IFn$_invoke$arity$1(result),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(result)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-result","lt.plugins.haskell/haskell-result",3373598232),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_result,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.eval.haskell.result","editor.eval.haskell.result",2680647258),null], null), null));
lt.plugins.haskell.__BEH__haskell_exception = (function __BEH__haskell_exception(editor,result){lt.objs.notifos.done_working.call(null);
return lt.object.raise.call(null,editor,new cljs.core.Keyword(null,"editor.exception","editor.exception",3983021184),new cljs.core.Keyword(null,"data","data",1016980252).cljs$core$IFn$_invoke$arity$1(result),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(result)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-exception","lt.plugins.haskell/haskell-exception",2654191032),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_exception,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.eval.haskell.exception","editor.eval.haskell.exception",4139456790),null], null), null));
lt.plugins.haskell.selection_info = (function selection_info(editor){var pos = lt.objs.editor.__GT_cursor.call(null,editor);var info = new cljs.core.Keyword(null,"info","info",1017141280).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,editor));var info__$1 = (cljs.core.truth_(lt.objs.editor.selection_QMARK_.call(null,editor))?cljs.core.assoc.call(null,info,new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(lt.objs.editor.__GT_cursor.call(null,editor,"end")),new cljs.core.Keyword(null,"code","code",1016963423),lt.objs.editor.selection.call(null,editor)):cljs.core.assoc.call(null,info,new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(pos),new cljs.core.Keyword(null,"code","code",1016963423),lt.objs.editor.line.call(null,editor,new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(pos))));return info__$1;
});
lt.plugins.haskell.clear_result = (function clear_result(editor,line){var temp__4092__auto__ = cljs.core.get.call(null,cljs.core.deref.call(null,editor).call(null,new cljs.core.Keyword(null,"widgets","widgets",2354242081)),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [lt.objs.editor.line_handle.call(null,editor,line),new cljs.core.Keyword(null,"inline","inline",4124874251)], null));if(cljs.core.truth_(temp__4092__auto__))
{var result = temp__4092__auto__;return lt.object.raise.call(null,result,new cljs.core.Keyword(null,"clear!","clear!",3951036134));
} else
{return null;
}
});
lt.plugins.haskell.__BEH__on_eval_one = (function __BEH__on_eval_one(editor){var info = lt.plugins.haskell.selection_info.call(null,editor);var data = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"data","data",1016980252),new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info),new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(info)], null);if(cljs.core.truth_(clojure.string.blank_QMARK_.call(null,new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info))))
{return null;
} else
{lt.plugins.haskell.clear_result.call(null,editor,new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(info));
return lt.plugins.haskell.send_api_command.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"info","info",1017141280),info,new cljs.core.Keyword(null,"origin","origin",4300251800),editor], null),new cljs.core.Keyword(null,"haskell.api.eval","haskell.api.eval",3607340572),data);
}
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","on-eval-one","lt.plugins.haskell/on-eval-one",1888933733),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__on_eval_one,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"eval.one","eval.one",1173589382),null], null), null));
lt.plugins.haskell.__BEH__haskell_type = (function __BEH__haskell_type(editor,result){lt.objs.notifos.done_working.call(null);
return lt.object.raise.call(null,new cljs.core.Keyword(null,"editor.result","editor.result",4030217008),new cljs.core.Keyword(null,"data","data",1016980252).cljs$core$IFn$_invoke$arity$1(result),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(result)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-type","lt.plugins.haskell/haskell-type",682834165),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__haskell_type,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"editor.eval.haskell.type","editor.eval.haskell.type",600075319),null], null), null));
lt.plugins.haskell.__BEH__on_eval_type = (function __BEH__on_eval_type(editor){var info = lt.plugins.haskell.selection_info.call(null,editor);var data = new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"data","data",1016980252),new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info),new cljs.core.Keyword(null,"line","line",1017226086),new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(info)], null);if(cljs.core.truth_(clojure.string.blank_QMARK_.call(null,new cljs.core.Keyword(null,"code","code",1016963423).cljs$core$IFn$_invoke$arity$1(info))))
{return null;
} else
{lt.plugins.haskell.clear_result.call(null,editor,new cljs.core.Keyword(null,"line","line",1017226086).cljs$core$IFn$_invoke$arity$1(info));
return lt.plugins.haskell.send_api_command.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"info","info",1017141280),info,new cljs.core.Keyword(null,"origin","origin",4300251800),editor], null),new cljs.core.Keyword(null,"haskell.api.type","haskell.api.type",3607790778),data);
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
lt.plugins.haskell.find_project_dir = (function find_project_dir(file){var roots = lt.objs.files.get_roots.call(null);var cur = lt.objs.files.parent.call(null,file);var prev = "";while(true){
if(cljs.core.truth_((function (){var or__6364__auto__ = cljs.core.empty_QMARK_.call(null,cur);if(or__6364__auto__)
{return or__6364__auto__;
} else
{var or__6364__auto____$1 = roots.call(null,cur);if(cljs.core.truth_(or__6364__auto____$1))
{return or__6364__auto____$1;
} else
{return cljs.core._EQ_.call(null,cur,prev);
}
}
})()))
{return null;
} else
{if(cljs.core.truth_(cljs.core.some.call(null,((function (cur,prev,roots){
return (function (p1__7962_SHARP_){return p1__7962_SHARP_.endsWith(".cabal");
});})(cur,prev,roots))
,lt.objs.files.ls_sync.call(null,cur))))
{return cur;
} else
{{
var G__7987 = lt.objs.files.parent.call(null,cur);
var G__7988 = cur;
cur = G__7987;
prev = G__7988;
continue;
}
}
}
break;
}
});
lt.plugins.haskell.run_haskell = (function run_haskell(p__7963){var map__7965 = p__7963;var map__7965__$1 = ((cljs.core.seq_QMARK_.call(null,map__7965))?cljs.core.apply.call(null,cljs.core.hash_map,map__7965):map__7965);var info = map__7965__$1;var client = cljs.core.get.call(null,map__7965__$1,new cljs.core.Keyword(null,"client","client",3951159101));var name = cljs.core.get.call(null,map__7965__$1,new cljs.core.Keyword(null,"name","name",1017277949));var path = cljs.core.get.call(null,map__7965__$1,new cljs.core.Keyword(null,"path","path",1017337751));var obj = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","connecting-notifier","lt.plugins.haskell/connecting-notifier",4244447005),info);var client_id = lt.objs.clients.__GT_id.call(null,client);var project_dir = (function (){var or__6364__auto__ = lt.plugins.haskell.find_project_dir.call(null,path);if(cljs.core.truth_(or__6364__auto__))
{return or__6364__auto__;
} else
{return lt.objs.files.parent.call(null,path);
}
})();lt.object.merge_BANG_.call(null,client,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"port","port",1017351155),lt.objs.clients.tcp.port,new cljs.core.Keyword(null,"proc","proc",1017353928),obj], null));
lt.objs.notifos.working.call(null,"Connecting..");
return lt.objs.proc.exec.call(null,new cljs.core.PersistentArrayMap(null, 5, [new cljs.core.Keyword(null,"command","command",1964298941),lt.plugins.haskell.binary_path,new cljs.core.Keyword(null,"args","args",1016906831),new cljs.core.PersistentVector(null, 3, 5, cljs.core.PersistentVector.EMPTY_NODE, [lt.objs.clients.tcp.port,client_id,project_dir], null),new cljs.core.Keyword(null,"cwd","cwd",1014003170),lt.plugins.haskell.plugin_dir,new cljs.core.Keyword(null,"env","env",1014004831),new cljs.core.PersistentArrayMap(null, 1, ["HASKELL_PATH",lt.objs.files.join.call(null,lt.objs.files.parent.call(null,path))], null),new cljs.core.Keyword(null,"obj","obj",1014014057),obj], null));
});
lt.plugins.haskell.check_haskell = (function check_haskell(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell","haskell",1711527270),lt.plugins.haskell.shell.which("cabal"));
});
lt.plugins.haskell.check_client = (function check_client(obj){return cljs.core.assoc.call(null,obj,new cljs.core.Keyword(null,"haskell-client","haskell-client",3405059382),lt.objs.files.exists_QMARK_.call(null,lt.plugins.haskell.lt_haskell_path));
});
lt.plugins.haskell.handle_no_haskell = (function handle_no_haskell(client){lt.objs.clients.rem_BANG_.call(null,client);
return lt.objs.popup.popup_BANG_.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"header","header",4087600639),"We couldn't find runhaskell.",new cljs.core.Keyword(null,"body","body",1016933652),"In order to start a haskell client, you have to have the haskell and haskell-platform installed and on your system's PATH.",new cljs.core.Keyword(null,"buttons","buttons",1255256819),new cljs.core.PersistentVector(null, 2, 5, cljs.core.PersistentVector.EMPTY_NODE, [new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"label","label",1116631654),"Download Haskell Platform",new cljs.core.Keyword(null,"action","action",3885920680),(function (){return lt.objs.platform.open.call(null,"http://www.haskell.org/platform/");
})], null),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"label","label",1116631654),"ok"], null)], null)], null));
});
lt.plugins.haskell.notify = (function notify(obj){var map__7967 = obj;var map__7967__$1 = ((cljs.core.seq_QMARK_.call(null,map__7967))?cljs.core.apply.call(null,cljs.core.hash_map,map__7967):map__7967);var client = cljs.core.get.call(null,map__7967__$1,new cljs.core.Keyword(null,"client","client",3951159101));var path = cljs.core.get.call(null,map__7967__$1,new cljs.core.Keyword(null,"path","path",1017337751));var haskell = cljs.core.get.call(null,map__7967__$1,new cljs.core.Keyword(null,"haskell","haskell",1711527270));if((cljs.core.not.call(null,haskell)) || (cljs.core.empty_QMARK_.call(null,haskell)))
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
lt.plugins.haskell.try_connect = (function try_connect(p__7968){var map__7970 = p__7968;var map__7970__$1 = ((cljs.core.seq_QMARK_.call(null,map__7970))?cljs.core.apply.call(null,cljs.core.hash_map,map__7970):map__7970);var info = cljs.core.get.call(null,map__7970__$1,new cljs.core.Keyword(null,"info","info",1017141280));var path = new cljs.core.Keyword(null,"path","path",1017337751).cljs$core$IFn$_invoke$arity$1(info);var client = lt.objs.clients.client_BANG_.call(null,new cljs.core.Keyword(null,"haskell.client","haskell.client",4292563063));lt.plugins.haskell.check_all.call(null,new cljs.core.PersistentArrayMap(null, 2, [new cljs.core.Keyword(null,"path","path",1017337751),path,new cljs.core.Keyword(null,"client","client",3951159101),client], null));
return client;
});
lt.plugins.haskell.__BEH__connect = (function __BEH__connect(this$,path){return lt.plugins.haskell.try_connect.call(null,new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"info","info",1017141280),new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"path","path",1017337751),path], null)], null));
});
lt.object.behavior_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","connect","lt.plugins.haskell/connect",1510312044),new cljs.core.Keyword(null,"reaction","reaction",4441361819),lt.plugins.haskell.__BEH__connect,new cljs.core.Keyword(null,"triggers","triggers",2516997421),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"connect","connect",1965255772),null], null), null));
lt.object.object_STAR_.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705),new cljs.core.Keyword(null,"tags","tags",1017456523),new cljs.core.PersistentHashSet(null, new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"haskell.lang","haskell.lang",2228745498),null], null), null));
lt.plugins.haskell.haskell = lt.object.create.call(null,new cljs.core.Keyword("lt.plugins.haskell","haskell-lang","lt.plugins.haskell/haskell-lang",681521705));
lt.objs.sidebar.clients.add_connector.call(null,new cljs.core.PersistentArrayMap(null, 3, [new cljs.core.Keyword(null,"name","name",1017277949),"Haskell",new cljs.core.Keyword(null,"desc","desc",1016984067),"Select a directory to serve as the root of your haskell project.",new cljs.core.Keyword(null,"connect","connect",1965255772),(function (){return lt.objs.dialogs.dir.call(null,lt.plugins.haskell.haskell,new cljs.core.Keyword(null,"connect","connect",1965255772));
})], null));
lt.plugins.haskell.send_api_command = (function send_api_command(event,command,data){var map__7972 = event;var map__7972__$1 = ((cljs.core.seq_QMARK_.call(null,map__7972))?cljs.core.apply.call(null,cljs.core.hash_map,map__7972):map__7972);var origin = cljs.core.get.call(null,map__7972__$1,new cljs.core.Keyword(null,"origin","origin",4300251800));var info = cljs.core.get.call(null,map__7972__$1,new cljs.core.Keyword(null,"info","info",1017141280));var client = new cljs.core.Keyword(null,"default","default",2558708147).cljs$core$IFn$_invoke$arity$1(new cljs.core.Keyword(null,"client","client",3951159101).cljs$core$IFn$_invoke$arity$1(cljs.core.deref.call(null,origin)));var data__$1 = ((cljs.core.map_QMARK_.call(null,data))?data:new cljs.core.PersistentArrayMap(null, 1, [new cljs.core.Keyword(null,"data","data",1016980252),data], null));lt.objs.notifos.working.call(null,"");
return lt.objs.clients.send.call(null,lt.objs.eval.get_client_BANG_.call(null,new cljs.core.PersistentArrayMap(null, 4, [new cljs.core.Keyword(null,"command","command",1964298941),command,new cljs.core.Keyword(null,"origin","origin",4300251800),origin,new cljs.core.Keyword(null,"info","info",1017141280),info,new cljs.core.Keyword(null,"create","create",3956577390),lt.plugins.haskell.try_connect], null)),command,data__$1,new cljs.core.Keyword(null,"only","only",1017320222),origin);
});
lt.plugins.haskell.send_whole_file_command = (function send_whole_file_command(event,command){var map__7974 = event;var map__7974__$1 = ((cljs.core.seq_QMARK_.call(null,map__7974))?cljs.core.apply.call(null,cljs.core.hash_map,map__7974):map__7974);var origin = cljs.core.get.call(null,map__7974__$1,new cljs.core.Keyword(null,"origin","origin",4300251800));return lt.plugins.haskell.send_api_command.call(null,event,command,lt.objs.tabs.__GT_path.call(null,origin));
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