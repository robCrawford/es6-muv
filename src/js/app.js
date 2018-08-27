/*
  @flow
  Root component
*/
import type { Config } from "./lib/muv";
import { init } from "./lib/muv";
import { h } from "./lib/vdom";
import counter from "./components/counter";


type Model = {
    theme: Theme;
};

type Msg = "SetTheme";

type Theme = "default" | "dark";


export default () =>

    init("root", action => ({

        initialModel: {
            theme: "default"
        },

        initialAction: undefined,

        update: {
            SetTheme: (model, { theme }: { theme: Theme }) => {
                model.theme = theme;
            }
        },

        view(model) {
            return h("div.page." + model.theme, [
                counter("counter-0", { start: 0 }),
                counter("counter-1", { start: -1 }),
                h("button",
                    { on: { click: action("SetTheme", { theme: "default" }) } },
                    "Light theme"),
                h("button",
                    { on: { click: action("SetTheme", { theme: "dark" }) } },
                    "Dark theme")
            ]);
        }

    }: Config<Model, Msg>)
);
