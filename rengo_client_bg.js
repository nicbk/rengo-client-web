import * as wasm from './rengo_client_bg.wasm';

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_22(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3f14580c764af9d5(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_25(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3f14580c764af9d5(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_28(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3f14580c764af9d5(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_31(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hccdae6337601f684(arg0, arg1);
}

function __wbg_adapter_34(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3f14580c764af9d5(arg0, arg1, addHeapObject(arg2));
}

/**
*/
export function main() {
    wasm.main();
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    var ret = false;
    return ret;
};

export const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbg_new_59cb74e423758ede = function() {
    var ret = new Error();
    return addHeapObject(ret);
};

export const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(arg0, arg1);
    }
};

export const __wbg_instanceof_Window_9c4fd26090e1d029 = function(arg0) {
    var ret = getObject(arg0) instanceof Window;
    return ret;
};

export const __wbg_document_249e9cf340780f93 = function(arg0) {
    var ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export const __wbg_innerWidth_2bb09626230de7ba = handleError(function(arg0) {
    var ret = getObject(arg0).innerWidth;
    return addHeapObject(ret);
});

export const __wbg_innerHeight_e73b06bc6aaff2f6 = handleError(function(arg0) {
    var ret = getObject(arg0).innerHeight;
    return addHeapObject(ret);
});

export const __wbg_devicePixelRatio_ea9c0157a379b3ec = function(arg0) {
    var ret = getObject(arg0).devicePixelRatio;
    return ret;
};

export const __wbg_setonresize_c2dd4184ad28d141 = function(arg0, arg1) {
    getObject(arg0).onresize = getObject(arg1);
};

export const __wbg_body_0d97f334de622953 = function(arg0) {
    var ret = getObject(arg0).body;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export const __wbg_createElement_ba61aad8af6be7f4 = handleError(function(arg0, arg1, arg2) {
    var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
});

export const __wbg_getElementById_2ee254bbb67b6ae1 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export const __wbg_length_1c5944bb87506137 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

export const __wbg_item_69e0d8da7ede7f58 = function(arg0, arg1) {
    var ret = getObject(arg0).item(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export const __wbg_new_9497c8053cedcfe7 = handleError(function(arg0, arg1) {
    var ret = new WebSocket(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
});

export const __wbg_close_9388a184d4069e23 = handleError(function(arg0) {
    getObject(arg0).close();
});

export const __wbg_send_97b2cbaff81f3a5d = handleError(function(arg0, arg1, arg2) {
    getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
});

export const __wbg_instanceof_FileReader_7ba1bf69a8c0df3f = function(arg0) {
    var ret = getObject(arg0) instanceof FileReader;
    return ret;
};

export const __wbg_result_3a3dcd3d16085edf = handleError(function(arg0) {
    var ret = getObject(arg0).result;
    return addHeapObject(ret);
});

export const __wbg_new_bb43866946dacad0 = handleError(function() {
    var ret = new FileReader();
    return addHeapObject(ret);
});

export const __wbg_readAsArrayBuffer_7a5cb1486bb22eb0 = handleError(function(arg0, arg1) {
    getObject(arg0).readAsArrayBuffer(getObject(arg1));
});

export const __wbg_data_b7536deeccc3c114 = function(arg0) {
    var ret = getObject(arg0).data;
    return addHeapObject(ret);
};

export const __wbg_keyCode_d0dfa05e731b6eb3 = function(arg0) {
    var ret = getObject(arg0).keyCode;
    return ret;
};

export const __wbg_target_93bfa3ef068c44dc = function(arg0) {
    var ret = getObject(arg0).target;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export const __wbg_instanceof_HtmlCanvasElement_e0e251da2aa0b541 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLCanvasElement;
    return ret;
};

export const __wbg_getContext_d778ffc8203f64ae = handleError(function(arg0, arg1, arg2) {
    var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
});

export const __wbg_instanceof_HtmlImageElement_f015022e1924dfb4 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLImageElement;
    return ret;
};

export const __wbg_appendChild_6ae001e6d3556190 = handleError(function(arg0, arg1) {
    var ret = getObject(arg0).appendChild(getObject(arg1));
    return addHeapObject(ret);
});

export const __wbg_setid_16518c90432c2f8e = function(arg0, arg1, arg2) {
    getObject(arg0).id = getStringFromWasm0(arg1, arg2);
};

export const __wbg_setclassName_5f8aa8af1f203c85 = function(arg0, arg1, arg2) {
    getObject(arg0).className = getStringFromWasm0(arg1, arg2);
};

export const __wbg_setinnerHTML_bd35babb04d64bb9 = function(arg0, arg1, arg2) {
    getObject(arg0).innerHTML = getStringFromWasm0(arg1, arg2);
};

export const __wbg_children_ec4385edb54a950a = function(arg0) {
    var ret = getObject(arg0).children;
    return addHeapObject(ret);
};

export const __wbg_setAttribute_0b50656f1ccc45bf = handleError(function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
});

export const __wbg_remove_eabff3d9e444a826 = function(arg0) {
    getObject(arg0).remove();
};

export const __wbg_instanceof_HtmlElement_200e517773f426b8 = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLElement;
    return ret;
};

export const __wbg_scrollHeight_f63d0dee5867e6d5 = function(arg0) {
    var ret = getObject(arg0).scrollHeight;
    return ret;
};

export const __wbg_setscrollTop_37d5a0745bddabab = function(arg0, arg1) {
    getObject(arg0).scrollTop = arg1;
};

export const __wbg_setinnerText_2b882d068fbfe608 = function(arg0, arg1, arg2) {
    getObject(arg0).innerText = getStringFromWasm0(arg1, arg2);
};

export const __wbg_sethidden_a129339d9baf7ff0 = function(arg0, arg1) {
    getObject(arg0).hidden = arg1 !== 0;
};

export const __wbg_style_9290c51fe7cb7783 = function(arg0) {
    var ret = getObject(arg0).style;
    return addHeapObject(ret);
};

export const __wbg_setonclick_f7640fd857729311 = function(arg0, arg1) {
    getObject(arg0).onclick = getObject(arg1);
};

export const __wbg_setonkeydown_3c920436bf1cd5ad = function(arg0, arg1) {
    getObject(arg0).onkeydown = getObject(arg1);
};

export const __wbg_setonmousemove_db51cab5518dc0b5 = function(arg0, arg1) {
    getObject(arg0).onmousemove = getObject(arg1);
};

export const __wbg_setonmouseout_41d4d8bc7c3169dd = function(arg0, arg1) {
    getObject(arg0).onmouseout = getObject(arg1);
};

export const __wbg_setonmouseup_533906f192bf4b41 = function(arg0, arg1) {
    getObject(arg0).onmouseup = getObject(arg1);
};

export const __wbg_click_3707ebaf7994a010 = function(arg0) {
    getObject(arg0).click();
};

export const __wbg_instanceof_CanvasRenderingContext2d_eea9cd931eb496b7 = function(arg0) {
    var ret = getObject(arg0) instanceof CanvasRenderingContext2D;
    return ret;
};

export const __wbg_setglobalAlpha_6b6fb9a57a09df9d = function(arg0, arg1) {
    getObject(arg0).globalAlpha = arg1;
};

export const __wbg_setfillStyle_5306396b0368ba08 = function(arg0, arg1) {
    getObject(arg0).fillStyle = getObject(arg1);
};

export const __wbg_setfont_781d8a4777f9b05d = function(arg0, arg1, arg2) {
    getObject(arg0).font = getStringFromWasm0(arg1, arg2);
};

export const __wbg_drawImage_b62fb868b3db8b55 = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).drawImage(getObject(arg1), arg2, arg3, arg4, arg5);
});

export const __wbg_beginPath_0dcd4a1d09e0223c = function(arg0) {
    getObject(arg0).beginPath();
};

export const __wbg_fill_f27264f4c10c34c2 = function(arg0) {
    getObject(arg0).fill();
};

export const __wbg_arc_64f30227509b406b = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).arc(arg1, arg2, arg3, arg4, arg5);
});

export const __wbg_fillRect_33b210367d4a0063 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).fillRect(arg1, arg2, arg3, arg4);
};

export const __wbg_fillText_1a4eaffef23bd8b7 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
});

export const __wbg_scale_8d56361ac5b8a5b2 = handleError(function(arg0, arg1, arg2) {
    getObject(arg0).scale(arg1, arg2);
});

export const __wbg_instanceof_HtmlInputElement_6dfc5638bc87076f = function(arg0) {
    var ret = getObject(arg0) instanceof HTMLInputElement;
    return ret;
};

export const __wbg_value_2577d9319a38ca2e = function(arg0, arg1) {
    var ret = getObject(arg1).value;
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbg_setvalue_7adbd4552719bd8e = function(arg0, arg1, arg2) {
    getObject(arg0).value = getStringFromWasm0(arg1, arg2);
};

export const __wbg_instanceof_Blob_5c5b4a28e3ada477 = function(arg0) {
    var ret = getObject(arg0) instanceof Blob;
    return ret;
};

export const __wbg_setProperty_84c0a22125c731d6 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
});

export const __wbg_addEventListener_b334b84e6525699c = handleError(function(arg0, arg1, arg2, arg3) {
    getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
});

export const __wbg_offsetX_951495e9516f0aeb = function(arg0) {
    var ret = getObject(arg0).offsetX;
    return ret;
};

export const __wbg_offsetY_0377a1f53f902a1e = function(arg0) {
    var ret = getObject(arg0).offsetY;
    return ret;
};

export const __wbg_call_cb478d88f3068c91 = handleError(function(arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
});

export const __wbindgen_object_clone_ref = function(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

export const __wbg_newwithargs_a45d0198ed0d0b76 = function(arg0, arg1, arg2, arg3) {
    var ret = new Function(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
    return addHeapObject(ret);
};

export const __wbg_newnoargs_3efc7bfa69a681f9 = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbg_call_f5e0576f61ee7461 = handleError(function(arg0, arg1, arg2) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
});

export const __wbg_self_05c54dcacb623b9a = handleError(function() {
    var ret = self.self;
    return addHeapObject(ret);
});

export const __wbg_window_9777ce446d12989f = handleError(function() {
    var ret = window.window;
    return addHeapObject(ret);
});

export const __wbg_globalThis_f0ca0bbb0149cf3d = handleError(function() {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
});

export const __wbg_global_c3c8325ae8c7f1a9 = handleError(function() {
    var ret = global.global;
    return addHeapObject(ret);
});

export const __wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

export const __wbg_buffer_ebc6c8e75510eae3 = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export const __wbg_length_317f0dd77f7a6673 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

export const __wbg_new_135e963dedf67b22 = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export const __wbg_set_4a5072a31008e0cb = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export const __wbindgen_number_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export const __wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export const __wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

export const __wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper181 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 73, __wbg_adapter_22);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper183 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 73, __wbg_adapter_25);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper185 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 73, __wbg_adapter_28);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper187 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 73, __wbg_adapter_31);
    return addHeapObject(ret);
};

export const __wbindgen_closure_wrapper189 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 73, __wbg_adapter_34);
    return addHeapObject(ret);
};

