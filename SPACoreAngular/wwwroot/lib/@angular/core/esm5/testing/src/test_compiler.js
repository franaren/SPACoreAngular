/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Compiler, Injectable } from '@angular/core';
function unimplemented() {
    throw Error('unimplemented');
}
/**
 * Special interface to the compiler only used by testing
 *
 * @experimental
 */
var TestingCompiler = /** @class */ (function (_super) {
    tslib_1.__extends(TestingCompiler, _super);
    function TestingCompiler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(TestingCompiler.prototype, "injector", {
        get: function () { throw unimplemented(); },
        enumerable: true,
        configurable: true
    });
    TestingCompiler.prototype.overrideModule = function (module, overrides) {
        throw unimplemented();
    };
    TestingCompiler.prototype.overrideDirective = function (directive, overrides) {
        throw unimplemented();
    };
    TestingCompiler.prototype.overrideComponent = function (component, overrides) {
        throw unimplemented();
    };
    TestingCompiler.prototype.overridePipe = function (directive, overrides) {
        throw unimplemented();
    };
    /**
     * Allows to pass the compile summary from AOT compilation to the JIT compiler,
     * so that it can use the code generated by AOT.
     */
    TestingCompiler.prototype.loadAotSummaries = function (summaries) { throw unimplemented(); };
    /**
     * Gets the component factory for the given component.
     * This assumes that the component has been compiled before calling this call using
     * `compileModuleAndAllComponents*`.
     */
    TestingCompiler.prototype.getComponentFactory = function (component) { throw unimplemented(); };
    /**
     * Returns the component type that is stored in the given error.
     * This can be used for errors created by compileModule...
     */
    TestingCompiler.prototype.getComponentFromError = function (error) { throw unimplemented(); };
    TestingCompiler.decorators = [
        { type: Injectable }
    ];
    return TestingCompiler;
}(Compiler));
export { TestingCompiler };
/**
 * A factory for creating a Compiler
 *
 * @experimental
 */
var TestingCompilerFactory = /** @class */ (function () {
    function TestingCompilerFactory() {
    }
    return TestingCompilerFactory;
}());
export { TestingCompilerFactory };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvdGVzdGluZy9zcmMvdGVzdF9jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBMkQsVUFBVSxFQUFpQyxNQUFNLGVBQWUsQ0FBQztBQUk1STtJQUNFLE1BQU0sS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFFRDs7OztHQUlHO0FBQ0g7SUFDcUMsMkNBQVE7SUFEN0M7O0lBaUNBLENBQUM7SUEvQkMsc0JBQUkscUNBQVE7YUFBWixjQUEyQixNQUFNLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDbkQsd0NBQWMsR0FBZCxVQUFlLE1BQWlCLEVBQUUsU0FBcUM7UUFDckUsTUFBTSxhQUFhLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0QsMkNBQWlCLEdBQWpCLFVBQWtCLFNBQW9CLEVBQUUsU0FBc0M7UUFDNUUsTUFBTSxhQUFhLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0QsMkNBQWlCLEdBQWpCLFVBQWtCLFNBQW9CLEVBQUUsU0FBc0M7UUFDNUUsTUFBTSxhQUFhLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0Qsc0NBQVksR0FBWixVQUFhLFNBQW9CLEVBQUUsU0FBaUM7UUFDbEUsTUFBTSxhQUFhLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsMENBQWdCLEdBQWhCLFVBQWlCLFNBQXNCLElBQUksTUFBTSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFbkU7Ozs7T0FJRztJQUNILDZDQUFtQixHQUFuQixVQUF1QixTQUFrQixJQUF5QixNQUFNLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUxRjs7O09BR0c7SUFDSCwrQ0FBcUIsR0FBckIsVUFBc0IsS0FBWSxJQUFvQixNQUFNLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Z0JBaEMvRSxVQUFVOztJQWlDWCxzQkFBQztDQUFBLEFBakNELENBQ3FDLFFBQVEsR0FnQzVDO1NBaENZLGVBQWU7QUFrQzVCOzs7O0dBSUc7QUFDSDtJQUFBO0lBRUEsQ0FBQztJQUFELDZCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZXIsIENvbXBpbGVyT3B0aW9ucywgQ29tcG9uZW50LCBDb21wb25lbnRGYWN0b3J5LCBEaXJlY3RpdmUsIEluamVjdGFibGUsIEluamVjdG9yLCBOZ01vZHVsZSwgUGlwZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7TWV0YWRhdGFPdmVycmlkZX0gZnJvbSAnLi9tZXRhZGF0YV9vdmVycmlkZSc7XG5cbmZ1bmN0aW9uIHVuaW1wbGVtZW50ZWQoKTogYW55IHtcbiAgdGhyb3cgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKTtcbn1cblxuLyoqXG4gKiBTcGVjaWFsIGludGVyZmFjZSB0byB0aGUgY29tcGlsZXIgb25seSB1c2VkIGJ5IHRlc3RpbmdcbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0aW5nQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlciB7XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHRocm93IHVuaW1wbGVtZW50ZWQoKTsgfVxuICBvdmVycmlkZU1vZHVsZShtb2R1bGU6IFR5cGU8YW55Piwgb3ZlcnJpZGVzOiBNZXRhZGF0YU92ZXJyaWRlPE5nTW9kdWxlPik6IHZvaWQge1xuICAgIHRocm93IHVuaW1wbGVtZW50ZWQoKTtcbiAgfVxuICBvdmVycmlkZURpcmVjdGl2ZShkaXJlY3RpdmU6IFR5cGU8YW55Piwgb3ZlcnJpZGVzOiBNZXRhZGF0YU92ZXJyaWRlPERpcmVjdGl2ZT4pOiB2b2lkIHtcbiAgICB0aHJvdyB1bmltcGxlbWVudGVkKCk7XG4gIH1cbiAgb3ZlcnJpZGVDb21wb25lbnQoY29tcG9uZW50OiBUeXBlPGFueT4sIG92ZXJyaWRlczogTWV0YWRhdGFPdmVycmlkZTxDb21wb25lbnQ+KTogdm9pZCB7XG4gICAgdGhyb3cgdW5pbXBsZW1lbnRlZCgpO1xuICB9XG4gIG92ZXJyaWRlUGlwZShkaXJlY3RpdmU6IFR5cGU8YW55Piwgb3ZlcnJpZGVzOiBNZXRhZGF0YU92ZXJyaWRlPFBpcGU+KTogdm9pZCB7XG4gICAgdGhyb3cgdW5pbXBsZW1lbnRlZCgpO1xuICB9XG4gIC8qKlxuICAgKiBBbGxvd3MgdG8gcGFzcyB0aGUgY29tcGlsZSBzdW1tYXJ5IGZyb20gQU9UIGNvbXBpbGF0aW9uIHRvIHRoZSBKSVQgY29tcGlsZXIsXG4gICAqIHNvIHRoYXQgaXQgY2FuIHVzZSB0aGUgY29kZSBnZW5lcmF0ZWQgYnkgQU9ULlxuICAgKi9cbiAgbG9hZEFvdFN1bW1hcmllcyhzdW1tYXJpZXM6ICgpID0+IGFueVtdKSB7IHRocm93IHVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjb21wb25lbnQgZmFjdG9yeSBmb3IgdGhlIGdpdmVuIGNvbXBvbmVudC5cbiAgICogVGhpcyBhc3N1bWVzIHRoYXQgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBjb21waWxlZCBiZWZvcmUgY2FsbGluZyB0aGlzIGNhbGwgdXNpbmdcbiAgICogYGNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzKmAuXG4gICAqL1xuICBnZXRDb21wb25lbnRGYWN0b3J5PFQ+KGNvbXBvbmVudDogVHlwZTxUPik6IENvbXBvbmVudEZhY3Rvcnk8VD4geyB0aHJvdyB1bmltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IHR5cGUgdGhhdCBpcyBzdG9yZWQgaW4gdGhlIGdpdmVuIGVycm9yLlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIGZvciBlcnJvcnMgY3JlYXRlZCBieSBjb21waWxlTW9kdWxlLi4uXG4gICAqL1xuICBnZXRDb21wb25lbnRGcm9tRXJyb3IoZXJyb3I6IEVycm9yKTogVHlwZTxhbnk+fG51bGwgeyB0aHJvdyB1bmltcGxlbWVudGVkKCk7IH1cbn1cblxuLyoqXG4gKiBBIGZhY3RvcnkgZm9yIGNyZWF0aW5nIGEgQ29tcGlsZXJcbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUZXN0aW5nQ29tcGlsZXJGYWN0b3J5IHtcbiAgYWJzdHJhY3QgY3JlYXRlVGVzdGluZ0NvbXBpbGVyKG9wdGlvbnM/OiBDb21waWxlck9wdGlvbnNbXSk6IFRlc3RpbmdDb21waWxlcjtcbn1cbiJdfQ==