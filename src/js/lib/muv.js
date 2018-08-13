/*
  @flow
  `Model, Update, View` wiring
*/
import { patch } from "../lib/vdom";
import { h } from "./vdom";
import app from "../app";


type Thunk = () => void;

type Next =
    Thunk | Promise<any> | Array<Thunk | Promise<any>> | void;

export type Action<msg> =
    (tag: msg, ...data: any[]) => Thunk;

export type Config<a, msg> = {|
    +initialModel: a,
    +initialAction?: Next,
    +update: { +[tag: msg]: (a, ...data: any[]) => Next },
    +view: (model: a) => void
|}


export function init<a, msg>(getConfig: Action<msg> => Config<a, msg>) {
    const config = getConfig(action);
    let model: a = config.initialModel;
    let componentRoot;
    let noRender: number = 0;

    function action(tag, ...data) {
        return () => update(tag, data);
    }

    function update(tag: msg, data: any[]): void {
        // Lines marked `@Dev-only` are removed by `prod` build
        model = clone(model); // @Dev-only
        const next = config.update[tag]
            .apply(null, [model, ...data]);
        deepFreeze(model); // @Dev-only
        run(next);
    }

    function run(next: Next): void {
        if (!next) {
            render();
        }
        else if (typeof next === "function") {
            next();
        }
        else if (Array.isArray(next)) {
            noRender++;
            next.forEach(run);
            noRender--;
            render();
        }
        else if (typeof next.then === "function") {
            next.then(run);
            render(); // End of sync chain
        }
    }

    function render(): void {
        if (!noRender) {
            patch(
                componentRoot,
                componentRoot = config.view(model)
            );
        }
    }

    if (config.initialAction) {
        noRender++;
        run(config.initialAction);
        noRender--;
    }
    return componentRoot = config.view(model);
}

document.addEventListener("DOMContentLoaded", () => {
    patch(
        document.getElementById("app"),
        h("div#app", [ app() ])
    );
});

function clone(o: any) {
    return JSON.parse(JSON.stringify(o));
}

function deepFreeze(o: any) {
    Object.freeze(o);
    Object.getOwnPropertyNames(o).forEach(
        p => {
            if (o.hasOwnProperty(p)
                && o[p] !== null
                && (typeof o[p] === "object" || typeof o[p] === "function")
                && !Object.isFrozen(o[p])
            ) {
                deepFreeze(o[p]);
            }
    });
    return o;
}
