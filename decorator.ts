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

    const hooks = {};

    if (currentPhase === "MOUNT") {
      if (cache) {
        destroyElement(cache.element);
        angular.element(cache.element).remove();
        cache = null
      }

      const element = document.createElement("div");

      angular.bootstrap(element, storyOptions.modules);

      cache = { template, element };

      return buildElement(cache.element, template, args, hooks);
    } else if (currentPhase === "UPDATE" && cache) {
      return updateElement(cache.element, args, hooks);
    }
  },
}) as (options: StorybookAddonAngularJs) => any;
