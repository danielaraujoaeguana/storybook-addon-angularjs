//@ts-expect-error
import angular from "angular";

/**
 * Compiles the given template with the given props into the given element.
 *
 * @param {HTMLElement} element the root element to compile
 * @param {string} template the new HTML to compile
 * @param {any} props the props to inject in the scope
 * @param {Object} hooks hooks
 * @param {Function} hooks.beforeCompile injectable function to invoke before the compiler
 */
export function buildElement(element, template, props = {}, hooks) {
  const $element = angular.element(element);
  const $injector = $element.injector();

  if (hooks && typeof hooks.beforeCompile === "function") {
    $injector.invoke(hooks.beforeCompile);
  }

  const compiler = function ($compile, $rootScope) {
    // get the scope of the target, use the rootScope if it does not exists
    const $scope = $element.scope() || $rootScope;

    // compile the new template and link it with the updated scope
    $compile($element.html(template))(Object.assign($scope, props));

    $rootScope.$digest();
  };

  compiler.$inject = ["$compile", "$rootScope"];

  $injector.invoke(compiler);

  return element;
}

/**
 * Updates the given element with the given props.
 *
 * @param {HTMLElement} element the root element to update
 * @param {any} props the new props to inject in the scope
 * @param {Object} hooks hooks
 * @param {Function} hooks.beforeUpdate an injectable function to invoke before the update
 */
export function updateElement(element, props = {}, hooks) {
  const $element = angular.element(element);
  const $injector = $element.injector();

  if (hooks && typeof hooks.beforeUpdate === "function") {
    $injector.invoke(hooks.beforeUpdate);
  }

  const updater = function () {
    const $scope = $element.scope();

    $scope.$applyAsync(() => {
      Object.assign($scope, props);
    });
  };

  updater.$inject = [];

  $injector.invoke(updater);

  return element;
}

export function destroyElement(element: HTMLElement) {
  const injector = angular.element(element).injector();

  if (!injector) {
    throw new Error('Already destroyed')
  }

  const $rootScope = injector.get('$rootScope');

  // Destroy all scopes
  $rootScope.$destroy();
}
