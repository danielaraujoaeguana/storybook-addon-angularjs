//@ts-expect-error
import angular from "angular";

import { makeDecorator } from "@storybook/addons";

import { buildElement, updateElement, destroyElement } from "./utils/angularjs";

let cache: {
  template: string,
  element: HTMLDivElement,
} | null = null;

interface StorybookAddonAngularJs {
  modules: string[]
}

export default makeDecorator({
  name: "withAngularJs",
  parameterName: "angularjs",
  skipIfNoParametersOrOptions: true,

  wrapper: (getStory, context, { parameters, options }) => {
    const storyOptions: StorybookAddonAngularJs = structuredClone(options);

    const story = getStory(context.args);

    const { template, args = {} } =
      typeof story === "string" ? { template: story } : story;

    const key = context.id;

    const currentPhase = context.hooks.currentPhase;

    console.log("withAngularJs", currentPhase, context.hooks);

    const hooks = {};

    if (currentPhase === "MOUNT") {
      if (cache) {
        console.log("withAngularJs", "Destroy")
        destroyElement(cache.element);
        angular.element(cache.element).remove();
        cache = null
      }

      console.log("withAngularJs", "Build")
      const element = document.createElement("div");

      angular.bootstrap(element, storyOptions.modules);

      cache = { template, element };

      return buildElement(cache.element, template, args, hooks);
    } else if (currentPhase === "UPDATE" && cache) {
      console.log("withAngularJs", "Update")
      return updateElement(cache.element, args, hooks);
    }
  },
}) as (options: StorybookAddonAngularJs) => any;
