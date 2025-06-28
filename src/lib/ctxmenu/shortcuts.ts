import type { CtxShortcut } from "./types";

// Comprehensive shortcuts object with all possible key combinations
export const shortcuts = {
    // Basic keys
    space: { key: " " } as CtxShortcut,
    enter: { key: "Enter" } as CtxShortcut,
    escape: { key: "Escape" } as CtxShortcut,
    backspace: { key: "Backspace" } as CtxShortcut,
    delete: { key: "Delete" } as CtxShortcut,
    tab: { key: "Tab" } as CtxShortcut,
    capsLock: { key: "CapsLock" } as CtxShortcut,
    home: { key: "Home" } as CtxShortcut,
    end: { key: "End" } as CtxShortcut,
    pageUp: { key: "PageUp" } as CtxShortcut,
    pageDown: { key: "PageDown" } as CtxShortcut,
    insert: { key: "Insert" } as CtxShortcut,
    pause: { key: "Pause" } as CtxShortcut,
    printScreen: { key: "PrintScreen" } as CtxShortcut,
    scrollLock: { key: "ScrollLock" } as CtxShortcut,
    numLock: { key: "NumLock" } as CtxShortcut,
    contextMenu: { key: "ContextMenu" } as CtxShortcut,

    // Function keys
    f1: { key: "F1" } as CtxShortcut,
    f2: { key: "F2" } as CtxShortcut,
    f3: { key: "F3" } as CtxShortcut,
    f4: { key: "F4" } as CtxShortcut,
    f5: { key: "F5" } as CtxShortcut,
    f6: { key: "F6" } as CtxShortcut,
    f7: { key: "F7" } as CtxShortcut,
    f8: { key: "F8" } as CtxShortcut,
    f9: { key: "F9" } as CtxShortcut,
    f10: { key: "F10" } as CtxShortcut,
    f11: { key: "F11" } as CtxShortcut,
    f12: { key: "F12" } as CtxShortcut,

    // Arrow keys
    arrowUp: { key: "ArrowUp" } as CtxShortcut,
    arrowDown: { key: "ArrowDown" } as CtxShortcut,
    arrowLeft: { key: "ArrowLeft" } as CtxShortcut,
    arrowRight: { key: "ArrowRight" } as CtxShortcut,

    // Number keys (0-9)
    0: { key: "0" } as CtxShortcut,
    1: { key: "1" } as CtxShortcut,
    2: { key: "2" } as CtxShortcut,
    3: { key: "3" } as CtxShortcut,
    4: { key: "4" } as CtxShortcut,
    5: { key: "5" } as CtxShortcut,
    6: { key: "6" } as CtxShortcut,
    7: { key: "7" } as CtxShortcut,
    8: { key: "8" } as CtxShortcut,
    9: { key: "9" } as CtxShortcut,

    // Letter keys (a-z)
    a: { key: "a" } as CtxShortcut,
    b: { key: "b" } as CtxShortcut,
    c: { key: "c" } as CtxShortcut,
    d: { key: "d" } as CtxShortcut,
    e: { key: "e" } as CtxShortcut,
    f: { key: "f" } as CtxShortcut,
    g: { key: "g" } as CtxShortcut,
    h: { key: "h" } as CtxShortcut,
    i: { key: "i" } as CtxShortcut,
    j: { key: "j" } as CtxShortcut,
    k: { key: "k" } as CtxShortcut,
    l: { key: "l" } as CtxShortcut,
    m: { key: "m" } as CtxShortcut,
    n: { key: "n" } as CtxShortcut,
    o: { key: "o" } as CtxShortcut,
    p: { key: "p" } as CtxShortcut,
    q: { key: "q" } as CtxShortcut,
    r: { key: "r" } as CtxShortcut,
    s: { key: "s" } as CtxShortcut,
    t: { key: "t" } as CtxShortcut,
    u: { key: "u" } as CtxShortcut,
    v: { key: "v" } as CtxShortcut,
    w: { key: "w" } as CtxShortcut,
    x: { key: "x" } as CtxShortcut,
    y: { key: "y" } as CtxShortcut,
    z: { key: "z" } as CtxShortcut,

    // Symbol keys
    minus: { key: "-" } as CtxShortcut,
    equal: { key: "=" } as CtxShortcut,
    bracketLeft: { key: "[" } as CtxShortcut,
    bracketRight: { key: "]" } as CtxShortcut,
    backslash: { key: "\\" } as CtxShortcut,
    semicolon: { key: ";" } as CtxShortcut,
    quote: { key: "'" } as CtxShortcut,
    comma: { key: "," } as CtxShortcut,
    period: { key: "." } as CtxShortcut,
    slash: { key: "/" } as CtxShortcut,
    backtick: { key: "`" } as CtxShortcut,

    // Numpad keys
    numpad0: { key: "Numpad0" } as CtxShortcut,
    numpad1: { key: "Numpad1" } as CtxShortcut,
    numpad2: { key: "Numpad2" } as CtxShortcut,
    numpad3: { key: "Numpad3" } as CtxShortcut,
    numpad4: { key: "Numpad4" } as CtxShortcut,
    numpad5: { key: "Numpad5" } as CtxShortcut,
    numpad6: { key: "Numpad6" } as CtxShortcut,
    numpad7: { key: "Numpad7" } as CtxShortcut,
    numpad8: { key: "Numpad8" } as CtxShortcut,
    numpad9: { key: "Numpad9" } as CtxShortcut,
    numpadAdd: { key: "NumpadAdd" } as CtxShortcut,
    numpadSubtract: { key: "NumpadSubtract" } as CtxShortcut,
    numpadMultiply: { key: "NumpadMultiply" } as CtxShortcut,
    numpadDivide: { key: "NumpadDivide" } as CtxShortcut,
    numpadDecimal: { key: "NumpadDecimal" } as CtxShortcut,
    numpadEnter: { key: "NumpadEnter" } as CtxShortcut,

    // Ctrl combinations
    ctrl: {
        // Letters
        a: { key: "a", ctrlKey: true } as CtxShortcut,
        b: { key: "b", ctrlKey: true } as CtxShortcut,
        c: { key: "c", ctrlKey: true } as CtxShortcut,
        d: { key: "d", ctrlKey: true } as CtxShortcut,
        e: { key: "e", ctrlKey: true } as CtxShortcut,
        f: { key: "f", ctrlKey: true } as CtxShortcut,
        g: { key: "g", ctrlKey: true } as CtxShortcut,
        h: { key: "h", ctrlKey: true } as CtxShortcut,
        i: { key: "i", ctrlKey: true } as CtxShortcut,
        j: { key: "j", ctrlKey: true } as CtxShortcut,
        k: { key: "k", ctrlKey: true } as CtxShortcut,
        l: { key: "l", ctrlKey: true } as CtxShortcut,
        m: { key: "m", ctrlKey: true } as CtxShortcut,
        n: { key: "n", ctrlKey: true } as CtxShortcut,
        o: { key: "o", ctrlKey: true } as CtxShortcut,
        p: { key: "p", ctrlKey: true } as CtxShortcut,
        q: { key: "q", ctrlKey: true } as CtxShortcut,
        r: { key: "r", ctrlKey: true } as CtxShortcut,
        s: { key: "s", ctrlKey: true } as CtxShortcut,
        t: { key: "t", ctrlKey: true } as CtxShortcut,
        u: { key: "u", ctrlKey: true } as CtxShortcut,
        v: { key: "v", ctrlKey: true } as CtxShortcut,
        w: { key: "w", ctrlKey: true } as CtxShortcut,
        x: { key: "x", ctrlKey: true } as CtxShortcut,
        y: { key: "y", ctrlKey: true } as CtxShortcut,
        z: { key: "z", ctrlKey: true } as CtxShortcut,

        // Numbers
        0: { key: "0", ctrlKey: true } as CtxShortcut,
        1: { key: "1", ctrlKey: true } as CtxShortcut,
        2: { key: "2", ctrlKey: true } as CtxShortcut,
        3: { key: "3", ctrlKey: true } as CtxShortcut,
        4: { key: "4", ctrlKey: true } as CtxShortcut,
        5: { key: "5", ctrlKey: true } as CtxShortcut,
        6: { key: "6", ctrlKey: true } as CtxShortcut,
        7: { key: "7", ctrlKey: true } as CtxShortcut,
        8: { key: "8", ctrlKey: true } as CtxShortcut,
        9: { key: "9", ctrlKey: true } as CtxShortcut,

        // Special keys
        enter: { key: "Enter", ctrlKey: true } as CtxShortcut,
        space: { key: " ", ctrlKey: true } as CtxShortcut,
        tab: { key: "Tab", ctrlKey: true } as CtxShortcut,
        backspace: { key: "Backspace", ctrlKey: true } as CtxShortcut,
        delete: { key: "Delete", ctrlKey: true } as CtxShortcut,
        home: { key: "Home", ctrlKey: true } as CtxShortcut,
        end: { key: "End", ctrlKey: true } as CtxShortcut,
        pageUp: { key: "PageUp", ctrlKey: true } as CtxShortcut,
        pageDown: { key: "PageDown", ctrlKey: true } as CtxShortcut,

        // Arrow keys
        arrowUp: { key: "ArrowUp", ctrlKey: true } as CtxShortcut,
        arrowDown: { key: "ArrowDown", ctrlKey: true } as CtxShortcut,
        arrowLeft: { key: "ArrowLeft", ctrlKey: true } as CtxShortcut,
        arrowRight: { key: "ArrowRight", ctrlKey: true } as CtxShortcut,

        // Function keys
        f1: { key: "F1", ctrlKey: true } as CtxShortcut,
        f2: { key: "F2", ctrlKey: true } as CtxShortcut,
        f3: { key: "F3", ctrlKey: true } as CtxShortcut,
        f4: { key: "F4", ctrlKey: true } as CtxShortcut,
        f5: { key: "F5", ctrlKey: true } as CtxShortcut,
        f6: { key: "F6", ctrlKey: true } as CtxShortcut,
        f7: { key: "F7", ctrlKey: true } as CtxShortcut,
        f8: { key: "F8", ctrlKey: true } as CtxShortcut,
        f9: { key: "F9", ctrlKey: true } as CtxShortcut,
        f10: { key: "F10", ctrlKey: true } as CtxShortcut,
        f11: { key: "F11", ctrlKey: true } as CtxShortcut,
        f12: { key: "F12", ctrlKey: true } as CtxShortcut,

        // Symbols
        minus: { key: "-", ctrlKey: true } as CtxShortcut,
        equal: { key: "=", ctrlKey: true } as CtxShortcut,
        bracketLeft: { key: "[", ctrlKey: true } as CtxShortcut,
        bracketRight: { key: "]", ctrlKey: true } as CtxShortcut,
        backslash: { key: "\\", ctrlKey: true } as CtxShortcut,
        semicolon: { key: ";", ctrlKey: true } as CtxShortcut,
        quote: { key: "'", ctrlKey: true } as CtxShortcut,
        comma: { key: ",", ctrlKey: true } as CtxShortcut,
        period: { key: ".", ctrlKey: true } as CtxShortcut,
        slash: { key: "/", ctrlKey: true } as CtxShortcut,
        backtick: { key: "`", ctrlKey: true } as CtxShortcut
    },

    // Shift combinations
    shift: {
        // Letters (uppercase)
        a: { key: "A", shiftKey: true } as CtxShortcut,
        b: { key: "B", shiftKey: true } as CtxShortcut,
        c: { key: "C", shiftKey: true } as CtxShortcut,
        d: { key: "D", shiftKey: true } as CtxShortcut,
        e: { key: "E", shiftKey: true } as CtxShortcut,
        f: { key: "F", shiftKey: true } as CtxShortcut,
        g: { key: "G", shiftKey: true } as CtxShortcut,
        h: { key: "H", shiftKey: true } as CtxShortcut,
        i: { key: "I", shiftKey: true } as CtxShortcut,
        j: { key: "J", shiftKey: true } as CtxShortcut,
        k: { key: "K", shiftKey: true } as CtxShortcut,
        l: { key: "L", shiftKey: true } as CtxShortcut,
        m: { key: "M", shiftKey: true } as CtxShortcut,
        n: { key: "N", shiftKey: true } as CtxShortcut,
        o: { key: "O", shiftKey: true } as CtxShortcut,
        p: { key: "P", shiftKey: true } as CtxShortcut,
        q: { key: "Q", shiftKey: true } as CtxShortcut,
        r: { key: "R", shiftKey: true } as CtxShortcut,
        s: { key: "S", shiftKey: true } as CtxShortcut,
        t: { key: "T", shiftKey: true } as CtxShortcut,
        u: { key: "U", shiftKey: true } as CtxShortcut,
        v: { key: "V", shiftKey: true } as CtxShortcut,
        w: { key: "W", shiftKey: true } as CtxShortcut,
        x: { key: "X", shiftKey: true } as CtxShortcut,
        y: { key: "Y", shiftKey: true } as CtxShortcut,
        z: { key: "Z", shiftKey: true } as CtxShortcut,

        // Numbers with symbols
        1: { key: "!", shiftKey: true } as CtxShortcut, // Shift+1 = !
        2: { key: "@", shiftKey: true } as CtxShortcut, // Shift+2 = @
        3: { key: "#", shiftKey: true } as CtxShortcut, // Shift+3 = #
        4: { key: "$", shiftKey: true } as CtxShortcut, // Shift+4 = $
        5: { key: "%", shiftKey: true } as CtxShortcut, // Shift+5 = %
        6: { key: "^", shiftKey: true } as CtxShortcut, // Shift+6 = ^
        7: { key: "&", shiftKey: true } as CtxShortcut, // Shift+7 = &
        8: { key: "*", shiftKey: true } as CtxShortcut, // Shift+8 = *
        9: { key: "(", shiftKey: true } as CtxShortcut, // Shift+9 = (
        0: { key: ")", shiftKey: true } as CtxShortcut, // Shift+0 = )

        // Special keys
        enter: { key: "Enter", shiftKey: true } as CtxShortcut,
        space: { key: " ", shiftKey: true } as CtxShortcut,
        tab: { key: "Tab", shiftKey: true } as CtxShortcut,
        backspace: { key: "Backspace", shiftKey: true } as CtxShortcut,
        delete: { key: "Delete", shiftKey: true } as CtxShortcut,
        home: { key: "Home", shiftKey: true } as CtxShortcut,
        end: { key: "End", shiftKey: true } as CtxShortcut,
        pageUp: { key: "PageUp", shiftKey: true } as CtxShortcut,
        pageDown: { key: "PageDown", shiftKey: true } as CtxShortcut,
        insert: { key: "Insert", shiftKey: true } as CtxShortcut,

        // Arrow keys
        arrowUp: { key: "ArrowUp", shiftKey: true } as CtxShortcut,
        arrowDown: { key: "ArrowDown", shiftKey: true } as CtxShortcut,
        arrowLeft: { key: "ArrowLeft", shiftKey: true } as CtxShortcut,
        arrowRight: { key: "ArrowRight", shiftKey: true } as CtxShortcut,

        // Function keys
        f1: { key: "F1", shiftKey: true } as CtxShortcut,
        f2: { key: "F2", shiftKey: true } as CtxShortcut,
        f3: { key: "F3", shiftKey: true } as CtxShortcut,
        f4: { key: "F4", shiftKey: true } as CtxShortcut,
        f5: { key: "F5", shiftKey: true } as CtxShortcut,
        f6: { key: "F6", shiftKey: true } as CtxShortcut,
        f7: { key: "F7", shiftKey: true } as CtxShortcut,
        f8: { key: "F8", shiftKey: true } as CtxShortcut,
        f9: { key: "F9", shiftKey: true } as CtxShortcut,
        f10: { key: "F10", shiftKey: true } as CtxShortcut,
        f11: { key: "F11", shiftKey: true } as CtxShortcut,
        f12: { key: "F12", shiftKey: true } as CtxShortcut,

        // Symbols (with shift)
        minus: { key: "_", shiftKey: true } as CtxShortcut, // Shift+- = _
        equal: { key: "+", shiftKey: true } as CtxShortcut, // Shift+= = +
        bracketLeft: { key: "{", shiftKey: true } as CtxShortcut, // Shift+[ = {
        bracketRight: { key: "}", shiftKey: true } as CtxShortcut, // Shift+] = }
        backslash: { key: "|", shiftKey: true } as CtxShortcut, // Shift+\ = |
        semicolon: { key: ":", shiftKey: true } as CtxShortcut, // Shift+; = :
        quote: { key: '"', shiftKey: true } as CtxShortcut, // Shift+' = "
        comma: { key: "<", shiftKey: true } as CtxShortcut, // Shift+, = <
        period: { key: ">", shiftKey: true } as CtxShortcut, // Shift+. = >
        slash: { key: "?", shiftKey: true } as CtxShortcut, // Shift+/ = ?
        backtick: { key: "~", shiftKey: true } as CtxShortcut // Shift+` = ~
    },

    // Alt combinations
    alt: {
        // Letters
        a: { key: "a", altKey: true } as CtxShortcut,
        b: { key: "b", altKey: true } as CtxShortcut,
        c: { key: "c", altKey: true } as CtxShortcut,
        d: { key: "d", altKey: true } as CtxShortcut,
        e: { key: "e", altKey: true } as CtxShortcut,
        f: { key: "f", altKey: true } as CtxShortcut,
        g: { key: "g", altKey: true } as CtxShortcut,
        h: { key: "h", altKey: true } as CtxShortcut,
        i: { key: "i", altKey: true } as CtxShortcut,
        j: { key: "j", altKey: true } as CtxShortcut,
        k: { key: "k", altKey: true } as CtxShortcut,
        l: { key: "l", altKey: true } as CtxShortcut,
        m: { key: "m", altKey: true } as CtxShortcut,
        n: { key: "n", altKey: true } as CtxShortcut,
        o: { key: "o", altKey: true } as CtxShortcut,
        p: { key: "p", altKey: true } as CtxShortcut,
        q: { key: "q", altKey: true } as CtxShortcut,
        r: { key: "r", altKey: true } as CtxShortcut,
        s: { key: "s", altKey: true } as CtxShortcut,
        t: { key: "t", altKey: true } as CtxShortcut,
        u: { key: "u", altKey: true } as CtxShortcut,
        v: { key: "v", altKey: true } as CtxShortcut,
        w: { key: "w", altKey: true } as CtxShortcut,
        x: { key: "x", altKey: true } as CtxShortcut,
        y: { key: "y", altKey: true } as CtxShortcut,
        z: { key: "z", altKey: true } as CtxShortcut,

        // Numbers
        0: { key: "0", altKey: true } as CtxShortcut,
        1: { key: "1", altKey: true } as CtxShortcut,
        2: { key: "2", altKey: true } as CtxShortcut,
        3: { key: "3", altKey: true } as CtxShortcut,
        4: { key: "4", altKey: true } as CtxShortcut,
        5: { key: "5", altKey: true } as CtxShortcut,
        6: { key: "6", altKey: true } as CtxShortcut,
        7: { key: "7", altKey: true } as CtxShortcut,
        8: { key: "8", altKey: true } as CtxShortcut,
        9: { key: "9", altKey: true } as CtxShortcut,

        // Special keys
        enter: { key: "Enter", altKey: true } as CtxShortcut,
        space: { key: " ", altKey: true } as CtxShortcut,
        tab: { key: "Tab", altKey: true } as CtxShortcut,
        backspace: { key: "Backspace", altKey: true } as CtxShortcut,
        delete: { key: "Delete", altKey: true } as CtxShortcut,

        // Arrow keys
        arrowUp: { key: "ArrowUp", altKey: true } as CtxShortcut,
        arrowDown: { key: "ArrowDown", altKey: true } as CtxShortcut,
        arrowLeft: { key: "ArrowLeft", altKey: true } as CtxShortcut,
        arrowRight: { key: "ArrowRight", altKey: true } as CtxShortcut,

        // Function keys
        f1: { key: "F1", altKey: true } as CtxShortcut,
        f2: { key: "F2", altKey: true } as CtxShortcut,
        f3: { key: "F3", altKey: true } as CtxShortcut,
        f4: { key: "F4", altKey: true } as CtxShortcut,
        f5: { key: "F5", altKey: true } as CtxShortcut,
        f6: { key: "F6", altKey: true } as CtxShortcut,
        f7: { key: "F7", altKey: true } as CtxShortcut,
        f8: { key: "F8", altKey: true } as CtxShortcut,
        f9: { key: "F9", altKey: true } as CtxShortcut,
        f10: { key: "F10", altKey: true } as CtxShortcut,
        f11: { key: "F11", altKey: true } as CtxShortcut,
        f12: { key: "F12", altKey: true } as CtxShortcut
    },

    // Meta/Cmd combinations (mainly for macOS)
    meta: {
        // Letters
        a: { key: "a", metaKey: true } as CtxShortcut,
        b: { key: "b", metaKey: true } as CtxShortcut,
        c: { key: "c", metaKey: true } as CtxShortcut,
        d: { key: "d", metaKey: true } as CtxShortcut,
        e: { key: "e", metaKey: true } as CtxShortcut,
        f: { key: "f", metaKey: true } as CtxShortcut,
        g: { key: "g", metaKey: true } as CtxShortcut,
        h: { key: "h", metaKey: true } as CtxShortcut,
        i: { key: "i", metaKey: true } as CtxShortcut,
        j: { key: "j", metaKey: true } as CtxShortcut,
        k: { key: "k", metaKey: true } as CtxShortcut,
        l: { key: "l", metaKey: true } as CtxShortcut,
        m: { key: "m", metaKey: true } as CtxShortcut,
        n: { key: "n", metaKey: true } as CtxShortcut,
        o: { key: "o", metaKey: true } as CtxShortcut,
        p: { key: "p", metaKey: true } as CtxShortcut,
        q: { key: "q", metaKey: true } as CtxShortcut,
        r: { key: "r", metaKey: true } as CtxShortcut,
        s: { key: "s", metaKey: true } as CtxShortcut,
        t: { key: "t", metaKey: true } as CtxShortcut,
        u: { key: "u", metaKey: true } as CtxShortcut,
        v: { key: "v", metaKey: true } as CtxShortcut,
        w: { key: "w", metaKey: true } as CtxShortcut,
        x: { key: "x", metaKey: true } as CtxShortcut,
        y: { key: "y", metaKey: true } as CtxShortcut,
        z: { key: "z", metaKey: true } as CtxShortcut,

        // Numbers
        0: { key: "0", metaKey: true } as CtxShortcut,
        1: { key: "1", metaKey: true } as CtxShortcut,
        2: { key: "2", metaKey: true } as CtxShortcut,
        3: { key: "3", metaKey: true } as CtxShortcut,
        4: { key: "4", metaKey: true } as CtxShortcut,
        5: { key: "5", metaKey: true } as CtxShortcut,
        6: { key: "6", metaKey: true } as CtxShortcut,
        7: { key: "7", metaKey: true } as CtxShortcut,
        8: { key: "8", metaKey: true } as CtxShortcut,
        9: { key: "9", metaKey: true } as CtxShortcut,

        // Arrow keys
        arrowUp: { key: "ArrowUp", metaKey: true } as CtxShortcut,
        arrowDown: { key: "ArrowDown", metaKey: true } as CtxShortcut,
        arrowLeft: { key: "ArrowLeft", metaKey: true } as CtxShortcut,
        arrowRight: { key: "ArrowRight", metaKey: true } as CtxShortcut
    },

    // Multi-modifier combinations
    ctrlShift: {
        // Letters
        a: { key: "a", ctrlKey: true, shiftKey: true } as CtxShortcut,
        b: { key: "b", ctrlKey: true, shiftKey: true } as CtxShortcut,
        c: { key: "c", ctrlKey: true, shiftKey: true } as CtxShortcut,
        d: { key: "d", ctrlKey: true, shiftKey: true } as CtxShortcut,
        e: { key: "e", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f: { key: "f", ctrlKey: true, shiftKey: true } as CtxShortcut,
        g: { key: "g", ctrlKey: true, shiftKey: true } as CtxShortcut,
        h: { key: "h", ctrlKey: true, shiftKey: true } as CtxShortcut,
        i: { key: "i", ctrlKey: true, shiftKey: true } as CtxShortcut,
        j: { key: "j", ctrlKey: true, shiftKey: true } as CtxShortcut,
        k: { key: "k", ctrlKey: true, shiftKey: true } as CtxShortcut,
        l: { key: "l", ctrlKey: true, shiftKey: true } as CtxShortcut,
        m: { key: "m", ctrlKey: true, shiftKey: true } as CtxShortcut,
        n: { key: "n", ctrlKey: true, shiftKey: true } as CtxShortcut,
        o: { key: "o", ctrlKey: true, shiftKey: true } as CtxShortcut,
        p: { key: "p", ctrlKey: true, shiftKey: true } as CtxShortcut,
        q: { key: "q", ctrlKey: true, shiftKey: true } as CtxShortcut,
        r: { key: "r", ctrlKey: true, shiftKey: true } as CtxShortcut,
        s: { key: "s", ctrlKey: true, shiftKey: true } as CtxShortcut,
        t: { key: "t", ctrlKey: true, shiftKey: true } as CtxShortcut,
        u: { key: "u", ctrlKey: true, shiftKey: true } as CtxShortcut,
        v: { key: "v", ctrlKey: true, shiftKey: true } as CtxShortcut,
        w: { key: "w", ctrlKey: true, shiftKey: true } as CtxShortcut,
        x: { key: "x", ctrlKey: true, shiftKey: true } as CtxShortcut,
        y: { key: "y", ctrlKey: true, shiftKey: true } as CtxShortcut,
        z: { key: "z", ctrlKey: true, shiftKey: true } as CtxShortcut,

        // Special keys
        tab: { key: "Tab", ctrlKey: true, shiftKey: true } as CtxShortcut,
        enter: { key: "Enter", ctrlKey: true, shiftKey: true } as CtxShortcut,
        space: { key: " ", ctrlKey: true, shiftKey: true } as CtxShortcut,

        // Function keys
        f1: { key: "F1", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f2: { key: "F2", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f3: { key: "F3", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f4: { key: "F4", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f5: { key: "F5", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f6: { key: "F6", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f7: { key: "F7", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f8: { key: "F8", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f9: { key: "F9", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f10: { key: "F10", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f11: { key: "F11", ctrlKey: true, shiftKey: true } as CtxShortcut,
        f12: { key: "F12", ctrlKey: true, shiftKey: true } as CtxShortcut
    },

    ctrlAlt: {
        // Letters
        a: { key: "a", ctrlKey: true, altKey: true } as CtxShortcut,
        b: { key: "b", ctrlKey: true, altKey: true } as CtxShortcut,
        c: { key: "c", ctrlKey: true, altKey: true } as CtxShortcut,
        d: { key: "d", ctrlKey: true, altKey: true } as CtxShortcut,
        e: { key: "e", ctrlKey: true, altKey: true } as CtxShortcut,
        f: { key: "f", ctrlKey: true, altKey: true } as CtxShortcut,
        g: { key: "g", ctrlKey: true, altKey: true } as CtxShortcut,
        h: { key: "h", ctrlKey: true, altKey: true } as CtxShortcut,
        i: { key: "i", ctrlKey: true, altKey: true } as CtxShortcut,
        j: { key: "j", ctrlKey: true, altKey: true } as CtxShortcut,
        k: { key: "k", ctrlKey: true, altKey: true } as CtxShortcut,
        l: { key: "l", ctrlKey: true, altKey: true } as CtxShortcut,
        m: { key: "m", ctrlKey: true, altKey: true } as CtxShortcut,
        n: { key: "n", ctrlKey: true, altKey: true } as CtxShortcut,
        o: { key: "o", ctrlKey: true, altKey: true } as CtxShortcut,
        p: { key: "p", ctrlKey: true, altKey: true } as CtxShortcut,
        q: { key: "q", ctrlKey: true, altKey: true } as CtxShortcut,
        r: { key: "r", ctrlKey: true, altKey: true } as CtxShortcut,
        s: { key: "s", ctrlKey: true, altKey: true } as CtxShortcut,
        t: { key: "t", ctrlKey: true, altKey: true } as CtxShortcut,
        u: { key: "u", ctrlKey: true, altKey: true } as CtxShortcut,
        v: { key: "v", ctrlKey: true, altKey: true } as CtxShortcut,
        w: { key: "w", ctrlKey: true, altKey: true } as CtxShortcut,
        x: { key: "x", ctrlKey: true, altKey: true } as CtxShortcut,
        y: { key: "y", ctrlKey: true, altKey: true } as CtxShortcut,
        z: { key: "z", ctrlKey: true, altKey: true } as CtxShortcut,

        // Function keys
        f1: { key: "F1", ctrlKey: true, altKey: true } as CtxShortcut,
        f2: { key: "F2", ctrlKey: true, altKey: true } as CtxShortcut,
        f3: { key: "F3", ctrlKey: true, altKey: true } as CtxShortcut,
        f4: { key: "F4", ctrlKey: true, altKey: true } as CtxShortcut,
        f5: { key: "F5", ctrlKey: true, altKey: true } as CtxShortcut,
        f6: { key: "F6", ctrlKey: true, altKey: true } as CtxShortcut,
        f7: { key: "F7", ctrlKey: true, altKey: true } as CtxShortcut,
        f8: { key: "F8", ctrlKey: true, altKey: true } as CtxShortcut,
        f9: { key: "F9", ctrlKey: true, altKey: true } as CtxShortcut,
        f10: { key: "F10", ctrlKey: true, altKey: true } as CtxShortcut,
        f11: { key: "F11", ctrlKey: true, altKey: true } as CtxShortcut,
        f12: { key: "F12", ctrlKey: true, altKey: true } as CtxShortcut
    },

    shiftAlt: {
        // Letters
        a: { key: "a", shiftKey: true, altKey: true } as CtxShortcut,
        b: { key: "b", shiftKey: true, altKey: true } as CtxShortcut,
        c: { key: "c", shiftKey: true, altKey: true } as CtxShortcut,
        d: { key: "d", shiftKey: true, altKey: true } as CtxShortcut,
        e: { key: "e", shiftKey: true, altKey: true } as CtxShortcut,
        f: { key: "f", shiftKey: true, altKey: true } as CtxShortcut,
        g: { key: "g", shiftKey: true, altKey: true } as CtxShortcut,
        h: { key: "h", shiftKey: true, altKey: true } as CtxShortcut,
        i: { key: "i", shiftKey: true, altKey: true } as CtxShortcut,
        j: { key: "j", shiftKey: true, altKey: true } as CtxShortcut,
        k: { key: "k", shiftKey: true, altKey: true } as CtxShortcut,
        l: { key: "l", shiftKey: true, altKey: true } as CtxShortcut,
        m: { key: "m", shiftKey: true, altKey: true } as CtxShortcut,
        n: { key: "n", shiftKey: true, altKey: true } as CtxShortcut,
        o: { key: "o", shiftKey: true, altKey: true } as CtxShortcut,
        p: { key: "p", shiftKey: true, altKey: true } as CtxShortcut,
        q: { key: "q", shiftKey: true, altKey: true } as CtxShortcut,
        r: { key: "r", shiftKey: true, altKey: true } as CtxShortcut,
        s: { key: "s", shiftKey: true, altKey: true } as CtxShortcut,
        t: { key: "t", shiftKey: true, altKey: true } as CtxShortcut,
        u: { key: "u", shiftKey: true, altKey: true } as CtxShortcut,
        v: { key: "v", shiftKey: true, altKey: true } as CtxShortcut,
        w: { key: "w", shiftKey: true, altKey: true } as CtxShortcut,
        x: { key: "x", shiftKey: true, altKey: true } as CtxShortcut,
        y: { key: "y", shiftKey: true, altKey: true } as CtxShortcut,
        z: { key: "z", shiftKey: true, altKey: true } as CtxShortcut,

        // Function keys
        f1: { key: "F1", shiftKey: true, altKey: true } as CtxShortcut,
        f2: { key: "F2", shiftKey: true, altKey: true } as CtxShortcut,
        f3: { key: "F3", shiftKey: true, altKey: true } as CtxShortcut,
        f4: { key: "F4", shiftKey: true, altKey: true } as CtxShortcut,
        f5: { key: "F5", shiftKey: true, altKey: true } as CtxShortcut,
        f6: { key: "F6", shiftKey: true, altKey: true } as CtxShortcut,
        f7: { key: "F7", shiftKey: true, altKey: true } as CtxShortcut,
        f8: { key: "F8", shiftKey: true, altKey: true } as CtxShortcut,
        f9: { key: "F9", shiftKey: true, altKey: true } as CtxShortcut,
        f10: { key: "F10", shiftKey: true, altKey: true } as CtxShortcut,
        f11: { key: "F11", shiftKey: true, altKey: true } as CtxShortcut,
        f12: { key: "F12", shiftKey: true, altKey: true } as CtxShortcut
    }
};

// Utility functions for shortcut handling
export function parseShortcut(shortcut: string | CtxShortcut): CtxShortcut {
    if (typeof shortcut === "object") {
        return shortcut;
    }

    // Parse string shortcuts like "Ctrl+C", "Space", "F2", etc.
    const parts = shortcut.split("+");
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);

    return {
        key,
        ctrlKey: modifiers.some((m) => m.toLowerCase() === "ctrl"),
        shiftKey: modifiers.some((m) => m.toLowerCase() === "shift"),
        altKey: modifiers.some((m) => m.toLowerCase() === "alt"),
        metaKey: modifiers.some((m) => ["meta", "cmd"].includes(m.toLowerCase()))
    };
}

export function matchesShortcut(e: KeyboardEvent, shortcut: string | CtxShortcut): boolean {
    const parsed = parseShortcut(shortcut);

    // Special handling for some keys
    const keyMatches =
        e.key.toLowerCase() === parsed.key.toLowerCase() ||
        e.code.toLowerCase() === parsed.key.toLowerCase() ||
        (parsed.key === "Space" && e.key === " ") ||
        (parsed.key === "Del" && e.key === "Delete");

    return (
        keyMatches &&
        e.ctrlKey === (parsed.ctrlKey || false) &&
        e.shiftKey === (parsed.shiftKey || false) &&
        e.altKey === (parsed.altKey || false) &&
        e.metaKey === (parsed.metaKey || false)
    );
}

// Helper function to format shortcuts for display
export function formatShortcut(shortcut: string | CtxShortcut): string {
    if (typeof shortcut === "string") {
        return shortcut;
    }

    const parts: string[] = [];

    // Add modifiers in the right order
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.altKey) parts.push("Alt");
    if (shortcut.shiftKey) parts.push("Shift");
    if (shortcut.metaKey) parts.push("Cmd");

    // Format the key
    let key = shortcut.key;
    if (key === " ") key = "Space";
    else if (key === "Delete") key = "Del";
    else if (key === "ArrowUp") key = "↑";
    else if (key === "ArrowDown") key = "↓";
    else if (key === "ArrowLeft") key = "←";
    else if (key === "ArrowRight") key = "→";
    else if (key.length === 1) key = key.toUpperCase();

    parts.push(key);
    return parts.join("+");
}
