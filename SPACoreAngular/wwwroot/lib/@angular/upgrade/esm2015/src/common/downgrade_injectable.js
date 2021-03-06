/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { INJECTOR_KEY } from './constants';
/**
 * \@description
 *
 * A helper function to allow an Angular service to be accessible from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function that provides access to the Angular
 * service identified by the `token` parameter.
 *
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {\@example upgrade/static/ts/full/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {\@example upgrade/static/ts/full/module.ts region="example-app"}
 *
 * \@experimental
 * @param {?} token an `InjectionToken` that identifies a service provided from Angular.
 *
 * @return {?} a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 */
export function downgradeInjectable(token) {
    const /** @type {?} */ factory = function (i) { return i.get(token); };
    (/** @type {?} */ (factory))['$inject'] = [INJECTOR_KEY];
    return factory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vZG93bmdyYWRlX2luamVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBDekMsTUFBTSw4QkFBOEIsS0FBVTtJQUM1Qyx1QkFBTSxPQUFPLEdBQUcsVUFBUyxDQUFXLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9ELG1CQUFDLE9BQWMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFN0MsTUFBTSxDQUFDLE9BQU8sQ0FBQztDQUNoQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0lOSkVDVE9SX0tFWX0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGFsbG93IGFuIEFuZ3VsYXIgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBBbmd1bGFyXG4gKiBzZXJ2aWNlIGlkZW50aWZpZWQgYnkgdGhlIGB0b2tlbmAgcGFyYW1ldGVyLlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIEZpcnN0IGVuc3VyZSB0aGF0IHRoZSBzZXJ2aWNlIHRvIGJlIGRvd25ncmFkZWQgaXMgcHJvdmlkZWQgaW4gYW4gYE5nTW9kdWxlYFxuICogdGhhdCB3aWxsIGJlIHBhcnQgb2YgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uIEZvciBleGFtcGxlLCBsZXQncyBhc3N1bWUgd2UgaGF2ZVxuICogZGVmaW5lZCBgSGVyb2VzU2VydmljZWBcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lcy1zZXJ2aWNlXCJ9XG4gKlxuICogYW5kIHRoYXQgd2UgaGF2ZSBpbmNsdWRlZCB0aGlzIGluIG91ciB1cGdyYWRlIGFwcCBgTmdNb2R1bGVgXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1tb2R1bGVcIn1cbiAqXG4gKiBOb3cgd2UgY2FuIHJlZ2lzdGVyIHRoZSBgZG93bmdyYWRlSW5qZWN0YWJsZWAgZmFjdG9yeSBmdW5jdGlvbiBmb3IgdGhlIHNlcnZpY2VcbiAqIG9uIGFuIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cImRvd25ncmFkZS1uZzItaGVyb2VzLXNlcnZpY2VcIn1cbiAqXG4gKiBJbnNpZGUgYW4gQW5ndWxhckpTIGNvbXBvbmVudCdzIGNvbnRyb2xsZXIgd2UgY2FuIGdldCBob2xkIG9mIHRoZVxuICogZG93bmdyYWRlZCBzZXJ2aWNlIHZpYSB0aGUgbmFtZSB3ZSBnYXZlIHdoZW4gZG93bmdyYWRpbmcuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cImV4YW1wbGUtYXBwXCJ9XG4gKlxuICogQHBhcmFtIHRva2VuIGFuIGBJbmplY3Rpb25Ub2tlbmAgdGhhdCBpZGVudGlmaWVzIGEgc2VydmljZSBwcm92aWRlZCBmcm9tIEFuZ3VsYXIuXG4gKlxuICogQHJldHVybnMgYSBbZmFjdG9yeSBmdW5jdGlvbl0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGkpIHRoYXQgY2FuIGJlXG4gKiB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBzZXJ2aWNlIG9uIGFuIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlSW5qZWN0YWJsZSh0b2tlbjogYW55KTogRnVuY3Rpb24ge1xuICBjb25zdCBmYWN0b3J5ID0gZnVuY3Rpb24oaTogSW5qZWN0b3IpIHsgcmV0dXJuIGkuZ2V0KHRva2VuKTsgfTtcbiAgKGZhY3RvcnkgYXMgYW55KVsnJGluamVjdCddID0gW0lOSkVDVE9SX0tFWV07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59XG4iXX0=