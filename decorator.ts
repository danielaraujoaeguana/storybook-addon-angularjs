//@ts-expect-error
import angular from "angular";

//@ts-expect-error
import { makeDecorator } from "@storybook/addons";

import { buildElement, updateElement } from "./utils/angularjs";

const cache = {};

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

    const rebuild = "always";

    const hooks = {};

    if (
      rebuild === "always" ||
      (rebuild === "mount" && currentPhase === "MOUNT") ||
      (rebuild === "update" && currentPhase === "UPDATE") ||
      !cache[key] ||
      cache[key].template !== template
    ) {
      const element = document.createElement("div");

      angular.bootstrap(element, storyOptions.modules);

      cache[key] = { template, element };

      return buildElement(cache[key].element, template, args, hooks);
    }

    return updateElement(cache[key].element, args, hooks);
  },
}) as (options: StorybookAddonAngularJs) => any;
