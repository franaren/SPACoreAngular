/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SimpleChange } from '../change_detection/change_detection_util';
import { ChangeDetectionStrategy } from '../change_detection/constants';
import { resolveRendererType2 } from '../view/util';
import { diPublic } from './di';
/**
 * Create a component definition object.
 *
 *
 * # Example
 * ```
 * class MyDirective {
 *   // Generated by Angular Template Compiler
 *   // [Symbol] syntax will not be supported by TypeScript until v2.7
 *   static ngComponentDef = defineComponent({
 *     ...
 *   });
 * }
 * ```
 */
export function defineComponent(componentDefinition) {
    var type = componentDefinition.type;
    var pipeTypes = componentDefinition.pipes;
    var directiveTypes = componentDefinition.directives;
    var def = {
        type: type,
        diPublic: null,
        factory: componentDefinition.factory,
        template: componentDefinition.template || null,
        hostBindings: componentDefinition.hostBindings || null,
        attributes: componentDefinition.attributes || null,
        inputs: invertObject(componentDefinition.inputs),
        outputs: invertObject(componentDefinition.outputs),
        rendererType: resolveRendererType2(componentDefinition.rendererType) || null,
        exportAs: componentDefinition.exportAs,
        onInit: type.prototype.ngOnInit || null,
        doCheck: type.prototype.ngDoCheck || null,
        afterContentInit: type.prototype.ngAfterContentInit || null,
        afterContentChecked: type.prototype.ngAfterContentChecked || null,
        afterViewInit: type.prototype.ngAfterViewInit || null,
        afterViewChecked: type.prototype.ngAfterViewChecked || null,
        onDestroy: type.prototype.ngOnDestroy || null,
        onPush: componentDefinition.changeDetection === ChangeDetectionStrategy.OnPush,
        directiveDefs: directiveTypes ?
            function () { return (typeof directiveTypes === 'function' ? directiveTypes() : directiveTypes)
                .map(extractDirectiveDef); } :
            null,
        pipeDefs: pipeTypes ?
            function () { return (typeof pipeTypes === 'function' ? pipeTypes() : pipeTypes).map(extractPipeDef); } :
            null,
        selectors: componentDefinition.selectors
    };
    var feature = componentDefinition.features;
    feature && feature.forEach(function (fn) { return fn(def); });
    return def;
}
export function extractDirectiveDef(type) {
    var def = type.ngComponentDef || type.ngDirectiveDef;
    if (ngDevMode && !def) {
        throw new Error("'" + type.name + "' is neither 'ComponentType' or 'DirectiveType'.");
    }
    return def;
}
export function extractPipeDef(type) {
    var def = type.ngPipeDef;
    if (ngDevMode && !def) {
        throw new Error("'" + type.name + "' is not a 'PipeType'.");
    }
    return def;
}
var PRIVATE_PREFIX = '__ngOnChanges_';
/**
 * Creates an NgOnChangesFeature function for a component's features list.
 *
 * It accepts an optional map of minified input property names to original property names,
 * if any input properties have a public alias.
 *
 * The NgOnChangesFeature function that is returned decorates a component with support for
 * the ngOnChanges lifecycle hook, so it should be included in any component that implements
 * that hook.
 *
 * Example usage:
 *
 * ```
 * static ngComponentDef = defineComponent({
 *   ...
 *   inputs: {name: 'publicName'},
 *   features: [NgOnChangesFeature({name: 'name'})]
 * });
 * ```
 *
 * @param inputPropertyNames Map of input property names, if they are aliased
 * @returns DirectiveDefFeature
 */
export function NgOnChangesFeature(inputPropertyNames) {
    return function (definition) {
        var inputs = definition.inputs;
        var proto = definition.type.prototype;
        // Place where we will store SimpleChanges if there is a change
        Object.defineProperty(proto, PRIVATE_PREFIX, { value: undefined, writable: true });
        var _loop_1 = function (pubKey) {
            var minKey = inputs[pubKey];
            var propertyName = inputPropertyNames && inputPropertyNames[minKey] || pubKey;
            var privateMinKey = PRIVATE_PREFIX + minKey;
            // Create a place where the actual value will be stored and make it non-enumerable
            Object.defineProperty(proto, privateMinKey, { value: undefined, writable: true });
            var existingDesc = Object.getOwnPropertyDescriptor(proto, minKey);
            // create a getter and setter for property
            Object.defineProperty(proto, minKey, {
                get: function () {
                    return (existingDesc && existingDesc.get) ? existingDesc.get.call(this) :
                        this[privateMinKey];
                },
                set: function (value) {
                    var simpleChanges = this[PRIVATE_PREFIX];
                    var isFirstChange = simpleChanges === undefined;
                    if (simpleChanges == null) {
                        simpleChanges = this[PRIVATE_PREFIX] = {};
                    }
                    simpleChanges[propertyName] = new SimpleChange(this[privateMinKey], value, isFirstChange);
                    (existingDesc && existingDesc.set) ? existingDesc.set.call(this, value) :
                        this[privateMinKey] = value;
                }
            });
        };
        for (var pubKey in inputs) {
            _loop_1(pubKey);
        }
        // If an onInit hook is defined, it will need to wrap the ngOnChanges call
        // so the call order is changes-init-check in creation mode. In subsequent
        // change detection runs, only the check wrapper will be called.
        if (definition.onInit != null) {
            definition.onInit = onChangesWrapper(definition.onInit);
        }
        definition.doCheck = onChangesWrapper(definition.doCheck);
    };
    function onChangesWrapper(delegateHook) {
        return function () {
            var simpleChanges = this[PRIVATE_PREFIX];
            if (simpleChanges != null) {
                this.ngOnChanges(simpleChanges);
                this[PRIVATE_PREFIX] = null;
            }
            delegateHook && delegateHook.apply(this);
        };
    }
}
export function PublicFeature(definition) {
    definition.diPublic = diPublic;
}
var EMPTY = {};
/** Swaps the keys and values of an object. */
function invertObject(obj) {
    if (obj == null)
        return EMPTY;
    var newObj = {};
    for (var minifiedKey in obj) {
        newObj[obj[minifiedKey]] = minifiedKey;
    }
    return newObj;
}
/**
 * Create a directive definition object.
 *
 * # Example
 * ```
 * class MyDirective {
 *   // Generated by Angular Template Compiler
 *   // [Symbol] syntax will not be supported by TypeScript until v2.7
 *   static ngDirectiveDef = defineDirective({
 *     ...
 *   });
 * }
 * ```
 */
export var defineDirective = defineComponent;
/**
 * Create a pipe definition object.
 *
 * # Example
 * ```
 * class MyPipe implements PipeTransform {
 *   // Generated by Angular Template Compiler
 *   static ngPipeDef = definePipe({
 *     ...
 *   });
 * }
 * ```
 * @param pipeDef Pipe definition generated by the compiler
 */
export function definePipe(pipeDef) {
    return {
        name: pipeDef.name,
        n: pipeDef.factory,
        pure: pipeDef.pure !== false,
        onDestroy: pipeDef.type.prototype.ngOnDestroy || null
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5pdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvZGVmaW5pdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sMkNBQTJDLENBQUM7QUFDdkUsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFNdEUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRWxELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFNOUI7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLDBCQUE2QixtQkE4SGxDO0lBQ0MsSUFBTSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDO0lBQ3RDLElBQU0sU0FBUyxHQUFHLG1CQUFtQixDQUFDLEtBQU8sQ0FBQztJQUM5QyxJQUFNLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQyxVQUFZLENBQUM7SUFDeEQsSUFBTSxHQUFHLEdBQXNCO1FBQzdCLElBQUksRUFBRSxJQUFJO1FBQ1YsUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsbUJBQW1CLENBQUMsT0FBTztRQUNwQyxRQUFRLEVBQUUsbUJBQW1CLENBQUMsUUFBUSxJQUFJLElBQU07UUFDaEQsWUFBWSxFQUFFLG1CQUFtQixDQUFDLFlBQVksSUFBSSxJQUFJO1FBQ3RELFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxVQUFVLElBQUksSUFBSTtRQUNsRCxNQUFNLEVBQUUsWUFBWSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztRQUNoRCxPQUFPLEVBQUUsWUFBWSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztRQUNsRCxZQUFZLEVBQUUsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLElBQUksSUFB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QUMxRCxVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUNqQyxDQUFDO0FBRUQsSUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBRWpCLDhDQUE4QztBQUM5QyxzQkFBc0IsR0FBUTtJQUM1QixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUM5QixJQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFDdkIsR0FBRyxDQUFDLENBQUMsSUFBSSxXQUFXLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO0lBQ3pDLENBQUM7SUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLGVBZ0VwQixDQUFDO0FBRVo7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILE1BQU0scUJBQXdCLE9BWTdCO0lBQ0MsTUFBTSxDQUFjO1FBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtRQUNsQixDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU87UUFDbEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEtBQUssS0FBSztRQUM1QixTQUFTLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLElBQUk7S0FDNUMsQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2ltcGxlQ2hhbmdlfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge1BpcGVUcmFuc2Zvcm19IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vcGlwZV90cmFuc2Zvcm0nO1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge09uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlc30gZnJvbSAnLi4vbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7UmVuZGVyZXJUeXBlMn0gZnJvbSAnLi4vcmVuZGVyL2FwaSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL3R5cGUnO1xuaW1wb3J0IHtyZXNvbHZlUmVuZGVyZXJUeXBlMn0gZnJvbSAnLi4vdmlldy91dGlsJztcblxuaW1wb3J0IHtkaVB1YmxpY30gZnJvbSAnLi9kaSc7XG5pbXBvcnQge0NvbXBvbmVudERlZiwgQ29tcG9uZW50RGVmRmVhdHVyZSwgQ29tcG9uZW50VGVtcGxhdGUsIENvbXBvbmVudFR5cGUsIERpcmVjdGl2ZURlZiwgRGlyZWN0aXZlRGVmRmVhdHVyZSwgRGlyZWN0aXZlRGVmTGlzdE9yRmFjdG9yeSwgRGlyZWN0aXZlVHlwZSwgRGlyZWN0aXZlVHlwZXNPckZhY3RvcnksIFBpcGVEZWYsIFBpcGVUeXBlLCBQaXBlVHlwZXNPckZhY3Rvcnl9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7Q3NzU2VsZWN0b3JMaXN0LCBTZWxlY3RvckZsYWdzfSBmcm9tICcuL2ludGVyZmFjZXMvcHJvamVjdGlvbic7XG5cblxuXG4vKipcbiAqIENyZWF0ZSBhIGNvbXBvbmVudCBkZWZpbml0aW9uIG9iamVjdC5cbiAqXG4gKlxuICogIyBFeGFtcGxlXG4gKiBgYGBcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgLy8gR2VuZXJhdGVkIGJ5IEFuZ3VsYXIgVGVtcGxhdGUgQ29tcGlsZXJcbiAqICAgLy8gW1N5bWJvbF0gc3ludGF4IHdpbGwgbm90IGJlIHN1cHBvcnRlZCBieSBUeXBlU2NyaXB0IHVudGlsIHYyLjdcbiAqICAgc3RhdGljIG5nQ29tcG9uZW50RGVmID0gZGVmaW5lQ29tcG9uZW50KHtcbiAqICAgICAuLi5cbiAqICAgfSk7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUNvbXBvbmVudDxUPihjb21wb25lbnREZWZpbml0aW9uOiB7XG4gIC8qKlxuICAgKiBEaXJlY3RpdmUgdHlwZSwgbmVlZGVkIHRvIGNvbmZpZ3VyZSB0aGUgaW5qZWN0b3IuXG4gICAqL1xuICB0eXBlOiBUeXBlPFQ+O1xuXG4gIC8qKiBUaGUgc2VsZWN0b3JzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1hdGNoIG5vZGVzIHRvIHRoaXMgY29tcG9uZW50LiAqL1xuICBzZWxlY3RvcnM6IENzc1NlbGVjdG9yTGlzdDtcblxuICAvKipcbiAgICogRmFjdG9yeSBtZXRob2QgdXNlZCB0byBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgZGlyZWN0aXZlLlxuICAgKi9cbiAgZmFjdG9yeTogKCkgPT4gVCB8ICh7MDogVH0gJiBhbnlbXSk7IC8qIHRyeWluZyB0byBzYXkgVCB8IFtULCAuLi5hbnldICovXG5cbiAgLyoqXG4gICAqIFN0YXRpYyBhdHRyaWJ1dGVzIHRvIHNldCBvbiBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogYXR0cmlidXRlIG5hbWVcbiAgICogT2RkIGluZGljZXM6IGF0dHJpYnV0ZSB2YWx1ZVxuICAgKi9cbiAgYXR0cmlidXRlcz86IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBBIG1hcCBvZiBpbnB1dCBuYW1lcy5cbiAgICpcbiAgICogVGhlIGZvcm1hdCBpcyBpbjogYHtbYWN0dWFsUHJvcGVydHlOYW1lOiBzdHJpbmddOnN0cmluZ31gLlxuICAgKlxuICAgKiBXaGljaCB0aGUgbWluaWZpZXIgbWF5IHRyYW5zbGF0ZSB0bzogYHtbbWluaWZpZWRQcm9wZXJ0eU5hbWU6IHN0cmluZ106c3RyaW5nfWAuXG4gICAqXG4gICAqIFRoaXMgYWxsb3dzIHRoZSByZW5kZXIgdG8gcmUtY29uc3RydWN0IHRoZSBtaW5pZmllZCBhbmQgbm9uLW1pbmlmaWVkIG5hbWVzXG4gICAqIG9mIHByb3BlcnRpZXMuXG4gICAqL1xuICBpbnB1dHM/OiB7W1AgaW4ga2V5b2YgVF0/OiBzdHJpbmd9O1xuXG4gIC8qKlxuICAgKiBBIG1hcCBvZiBvdXRwdXQgbmFtZXMuXG4gICAqXG4gICAqIFRoZSBmb3JtYXQgaXMgaW46IGB7W2FjdHVhbFByb3BlcnR5TmFtZTogc3RyaW5nXTpzdHJpbmd9YC5cbiAgICpcbiAgICogV2hpY2ggdGhlIG1pbmlmaWVyIG1heSB0cmFuc2xhdGUgdG86IGB7W21pbmlmaWVkUHJvcGVydHlOYW1lOiBzdHJpbmddOnN0cmluZ31gLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB0aGUgcmVuZGVyIHRvIHJlLWNvbnN0cnVjdCB0aGUgbWluaWZpZWQgYW5kIG5vbi1taW5pZmllZCBuYW1lc1xuICAgKiBvZiBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgb3V0cHV0cz86IHtbUCBpbiBrZXlvZiBUXT86IHN0cmluZ307XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGV4ZWN1dGVkIGJ5IHRoZSBwYXJlbnQgdGVtcGxhdGUgdG8gYWxsb3cgY2hpbGQgZGlyZWN0aXZlIHRvIGFwcGx5IGhvc3QgYmluZGluZ3MuXG4gICAqL1xuICBob3N0QmluZGluZ3M/OiAoZGlyZWN0aXZlSW5kZXg6IG51bWJlciwgZWxlbWVudEluZGV4OiBudW1iZXIpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIG5hbWUgdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUgdG8gYXNzaWduIHRoaXMgZGlyZWN0aXZlIHRvIGEgdmFyaWFibGUuXG4gICAqXG4gICAqIFNlZToge0BsaW5rIERpcmVjdGl2ZS5leHBvcnRBc31cbiAgICovXG4gIGV4cG9ydEFzPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUZW1wbGF0ZSBmdW5jdGlvbiB1c2UgZm9yIHJlbmRlcmluZyBET00uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gaGFzIGZvbGxvd2luZyBzdHJ1Y3R1cmUuXG4gICAqXG4gICAqIGBgYFxuICAgKiBmdW5jdGlvbiBUZW1wbGF0ZTxUPihjdHg6VCwgY3JlYXRpb25Nb2RlOiBib29sZWFuKSB7XG4gICAqICAgaWYgKGNyZWF0aW9uTW9kZSkge1xuICAgKiAgICAgLy8gQ29udGFpbnMgY3JlYXRpb24gbW9kZSBpbnN0cnVjdGlvbnMuXG4gICAqICAgfVxuICAgKiAgIC8vIENvbnRhaW5zIGJpbmRpbmcgdXBkYXRlIGluc3RydWN0aW9uc1xuICAgKiB9XG4gICAqIGBgYFxuICAgKlxuICAgKiBDb21tb24gaW5zdHJ1Y3Rpb25zIGFyZTpcbiAgICogQ3JlYXRpb24gbW9kZSBpbnN0cnVjdGlvbnM6XG4gICAqICAtIGBlbGVtZW50U3RhcnRgLCBgZWxlbWVudEVuZGBcbiAgICogIC0gYHRleHRgXG4gICAqICAtIGBjb250YWluZXJgXG4gICAqICAtIGBsaXN0ZW5lcmBcbiAgICpcbiAgICogQmluZGluZyB1cGRhdGUgaW5zdHJ1Y3Rpb25zOlxuICAgKiAtIGBiaW5kYFxuICAgKiAtIGBlbGVtZW50QXR0cmlidXRlYFxuICAgKiAtIGBlbGVtZW50UHJvcGVydHlgXG4gICAqIC0gYGVsZW1lbnRDbGFzc2BcbiAgICogLSBgZWxlbWVudFN0eWxlYFxuICAgKlxuICAgKi9cbiAgdGVtcGxhdGU6IENvbXBvbmVudFRlbXBsYXRlPFQ+O1xuXG4gIC8qKlxuICAgKiBBIGxpc3Qgb2Ygb3B0aW9uYWwgZmVhdHVyZXMgdG8gYXBwbHkuXG4gICAqXG4gICAqIFNlZToge0BsaW5rIE5nT25DaGFuZ2VzRmVhdHVyZX0sIHtAbGluayBQdWJsaWNGZWF0dXJlfVxuICAgKi9cbiAgZmVhdHVyZXM/OiBDb21wb25lbnREZWZGZWF0dXJlW107XG5cbiAgcmVuZGVyZXJUeXBlPzogUmVuZGVyZXJUeXBlMjtcblxuICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgc2V0IG9mIGluamVjdGFibGUgb2JqZWN0cyB0aGF0IGFyZSB2aXNpYmxlIHRvIGEgRGlyZWN0aXZlIGFuZCBpdHMgbGlnaHQgRE9NXG4gICAqIGNoaWxkcmVuLlxuICAgKi9cbiAgcHJvdmlkZXJzPzogUHJvdmlkZXJbXTtcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgc2V0IG9mIGluamVjdGFibGUgb2JqZWN0cyB0aGF0IGFyZSB2aXNpYmxlIHRvIGl0cyB2aWV3IERPTSBjaGlsZHJlbi5cbiAgICovXG4gIHZpZXdQcm92aWRlcnM/OiBQcm92aWRlcltdO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RyeSBvZiBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzIHRoYXQgbWF5IGJlIGZvdW5kIGluIHRoaXMgY29tcG9uZW50J3Mgdmlldy5cbiAgICpcbiAgICogVGhlIHByb3BlcnR5IGlzIGVpdGhlciBhbiBhcnJheSBvZiBgRGlyZWN0aXZlRGVmYHMgb3IgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIHRoZSBhcnJheSBvZlxuICAgKiBgRGlyZWN0aXZlRGVmYHMuIFRoZSBmdW5jdGlvbiBpcyBuZWNlc3NhcnkgdG8gYmUgYWJsZSB0byBzdXBwb3J0IGZvcndhcmQgZGVjbGFyYXRpb25zLlxuICAgKi9cbiAgZGlyZWN0aXZlcz86IERpcmVjdGl2ZVR5cGVzT3JGYWN0b3J5IHwgbnVsbDtcblxuICAvKipcbiAgICogUmVnaXN0cnkgb2YgcGlwZXMgdGhhdCBtYXkgYmUgZm91bmQgaW4gdGhpcyBjb21wb25lbnQncyB2aWV3LlxuICAgKlxuICAgKiBUaGUgcHJvcGVydHkgaXMgZWl0aGVyIGFuIGFycmF5IG9mIGBQaXBlRGVmc2BzIG9yIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyB0aGUgYXJyYXkgb2ZcbiAgICogYFBpcGVEZWZzYHMuIFRoZSBmdW5jdGlvbiBpcyBuZWNlc3NhcnkgdG8gYmUgYWJsZSB0byBzdXBwb3J0IGZvcndhcmQgZGVjbGFyYXRpb25zLlxuICAgKi9cbiAgcGlwZXM/OiBQaXBlVHlwZXNPckZhY3RvcnkgfCBudWxsO1xufSk6IG5ldmVyIHtcbiAgY29uc3QgdHlwZSA9IGNvbXBvbmVudERlZmluaXRpb24udHlwZTtcbiAgY29uc3QgcGlwZVR5cGVzID0gY29tcG9uZW50RGVmaW5pdGlvbi5waXBlcyAhO1xuICBjb25zdCBkaXJlY3RpdmVUeXBlcyA9IGNvbXBvbmVudERlZmluaXRpb24uZGlyZWN0aXZlcyAhO1xuICBjb25zdCBkZWYgPSA8Q29tcG9uZW50RGVmPGFueT4+e1xuICAgIHR5cGU6IHR5cGUsXG4gICAgZGlQdWJsaWM6IG51bGwsXG4gICAgZmFjdG9yeTogY29tcG9uZW50RGVmaW5pdGlvbi5mYWN0b3J5LFxuICAgIHRlbXBsYXRlOiBjb21wb25lbnREZWZpbml0aW9uLnRlbXBsYXRlIHx8IG51bGwgISxcbiAgICBob3N0QmluZGluZ3M6IGNvbXBvbmVudERlZmluaXRpb24uaG9zdEJpbmRpbmdzIHx8IG51bGwsXG4gICAgYXR0cmlidXRlczogY29tcG9uZW50RGVmaW5pdGlvbi5hdHRyaWJ1dGVzIHx8IG51bGwsXG4gICAgaW5wdXRzOiBpbnZlcnRPYmplY3QoY29tcG9uZW50RGVmaW5pdGlvbi5pbnB1dHMpLFxuICAgIG91dHB1dHM6IGludmVydE9iamVjdChjb21wb25lbnREZWZpbml0aW9uLm91dHB1dHMpLFxuICAgIHJlbmRlcmVyVHlwZTogcmVzb2x2ZVJlbmRlcmVyVHlwZTIoY29tcG9uZW50RGVmaW5pdGlvbi5yZW5kZXJlclR5cGUpIHx8IG51bGwsXG4gICAgZXhwb3J0QXM6IGNvbXBvbmVudERlZmluaXRpb24uZXhwb3J0QXMsXG4gICAgb25Jbml0OiB0eXBlLnByb3RvdHlwZS5uZ09uSW5pdCB8fCBudWxsLFxuICAgIGRvQ2hlY2s6IHR5cGUucHJvdG90eXBlLm5nRG9DaGVjayB8fCBudWxsLFxuICAgIGFmdGVyQ29udGVudEluaXQ6IHR5cGUucHJvdG90eXBlLm5nQWZ0ZXJDb250ZW50SW5pdCB8fCBudWxsLFxuICAgIGFmdGVyQ29udGVudENoZWNrZWQ6IHR5cGUucHJvdG90eXBlLm5nQWZ0ZXJDb250ZW50Q2hlY2tlZCB8fCBudWxsLFxuICAgIGFmdGVyVmlld0luaXQ6IHR5cGUucHJvdG90eXBlLm5nQWZ0ZXJWaWV3SW5pdCB8fCBudWxsLFxuICAgIGFmdGVyVmlld0NoZWNrZWQ6IHR5cGUucHJvdG90eXBlLm5nQWZ0ZXJWaWV3Q2hlY2tlZCB8fCBudWxsLFxuICAgIG9uRGVzdHJveTogdHlwZS5wcm90b3R5cGUubmdPbkRlc3Ryb3kgfHwgbnVsbCxcbiAgICBvblB1c2g6IGNvbXBvbmVudERlZmluaXRpb24uY2hhbmdlRGV0ZWN0aW9uID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gICAgZGlyZWN0aXZlRGVmczogZGlyZWN0aXZlVHlwZXMgP1xuICAgICAgICAoKSA9PiAodHlwZW9mIGRpcmVjdGl2ZVR5cGVzID09PSAnZnVuY3Rpb24nID8gZGlyZWN0aXZlVHlwZXMoKSA6IGRpcmVjdGl2ZVR5cGVzKVxuICAgICAgICAgICAgICAgICAgLm1hcChleHRyYWN0RGlyZWN0aXZlRGVmKSA6XG4gICAgICAgIG51bGwsXG4gICAgcGlwZURlZnM6IHBpcGVUeXBlcyA/XG4gICAgICAgICgpID0+ICh0eXBlb2YgcGlwZVR5cGVzID09PSAnZnVuY3Rpb24nID8gcGlwZVR5cGVzKCkgOiBwaXBlVHlwZXMpLm1hcChleHRyYWN0UGlwZURlZikgOlxuICAgICAgICBudWxsLFxuICAgIHNlbGVjdG9yczogY29tcG9uZW50RGVmaW5pdGlvbi5zZWxlY3RvcnNcbiAgfTtcbiAgY29uc3QgZmVhdHVyZSA9IGNvbXBvbmVudERlZmluaXRpb24uZmVhdHVyZXM7XG4gIGZlYXR1cmUgJiYgZmVhdHVyZS5mb3JFYWNoKChmbikgPT4gZm4oZGVmKSk7XG4gIHJldHVybiBkZWYgYXMgbmV2ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RGlyZWN0aXZlRGVmKHR5cGU6IERpcmVjdGl2ZVR5cGU8YW55PiYgQ29tcG9uZW50VHlwZTxhbnk+KTpcbiAgICBEaXJlY3RpdmVEZWY8YW55PnxDb21wb25lbnREZWY8YW55PiB7XG4gIGNvbnN0IGRlZiA9IHR5cGUubmdDb21wb25lbnREZWYgfHwgdHlwZS5uZ0RpcmVjdGl2ZURlZjtcbiAgaWYgKG5nRGV2TW9kZSAmJiAhZGVmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAnJHt0eXBlLm5hbWV9JyBpcyBuZWl0aGVyICdDb21wb25lbnRUeXBlJyBvciAnRGlyZWN0aXZlVHlwZScuYCk7XG4gIH1cbiAgcmV0dXJuIGRlZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RQaXBlRGVmKHR5cGU6IFBpcGVUeXBlPGFueT4pOiBQaXBlRGVmPGFueT4ge1xuICBjb25zdCBkZWYgPSB0eXBlLm5nUGlwZURlZjtcbiAgaWYgKG5nRGV2TW9kZSAmJiAhZGVmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAnJHt0eXBlLm5hbWV9JyBpcyBub3QgYSAnUGlwZVR5cGUnLmApO1xuICB9XG4gIHJldHVybiBkZWY7XG59XG5cblxuXG5jb25zdCBQUklWQVRFX1BSRUZJWCA9ICdfX25nT25DaGFuZ2VzXyc7XG5cbnR5cGUgT25DaGFuZ2VzRXhwYW5kbyA9IE9uQ2hhbmdlcyAmIHtcbiAgX19uZ09uQ2hhbmdlc186IFNpbXBsZUNoYW5nZXN8bnVsbHx1bmRlZmluZWQ7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBOZ09uQ2hhbmdlc0ZlYXR1cmUgZnVuY3Rpb24gZm9yIGEgY29tcG9uZW50J3MgZmVhdHVyZXMgbGlzdC5cbiAqXG4gKiBJdCBhY2NlcHRzIGFuIG9wdGlvbmFsIG1hcCBvZiBtaW5pZmllZCBpbnB1dCBwcm9wZXJ0eSBuYW1lcyB0byBvcmlnaW5hbCBwcm9wZXJ0eSBuYW1lcyxcbiAqIGlmIGFueSBpbnB1dCBwcm9wZXJ0aWVzIGhhdmUgYSBwdWJsaWMgYWxpYXMuXG4gKlxuICogVGhlIE5nT25DaGFuZ2VzRmVhdHVyZSBmdW5jdGlvbiB0aGF0IGlzIHJldHVybmVkIGRlY29yYXRlcyBhIGNvbXBvbmVudCB3aXRoIHN1cHBvcnQgZm9yXG4gKiB0aGUgbmdPbkNoYW5nZXMgbGlmZWN5Y2xlIGhvb2ssIHNvIGl0IHNob3VsZCBiZSBpbmNsdWRlZCBpbiBhbnkgY29tcG9uZW50IHRoYXQgaW1wbGVtZW50c1xuICogdGhhdCBob29rLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKlxuICogYGBgXG4gKiBzdGF0aWMgbmdDb21wb25lbnREZWYgPSBkZWZpbmVDb21wb25lbnQoe1xuICogICAuLi5cbiAqICAgaW5wdXRzOiB7bmFtZTogJ3B1YmxpY05hbWUnfSxcbiAqICAgZmVhdHVyZXM6IFtOZ09uQ2hhbmdlc0ZlYXR1cmUoe25hbWU6ICduYW1lJ30pXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gaW5wdXRQcm9wZXJ0eU5hbWVzIE1hcCBvZiBpbnB1dCBwcm9wZXJ0eSBuYW1lcywgaWYgdGhleSBhcmUgYWxpYXNlZFxuICogQHJldHVybnMgRGlyZWN0aXZlRGVmRmVhdHVyZVxuICovXG5leHBvcnQgZnVuY3Rpb24gTmdPbkNoYW5nZXNGZWF0dXJlKGlucHV0UHJvcGVydHlOYW1lcz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTpcbiAgICBEaXJlY3RpdmVEZWZGZWF0dXJlIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRlZmluaXRpb246IERpcmVjdGl2ZURlZjxhbnk+KTogdm9pZCB7XG4gICAgY29uc3QgaW5wdXRzID0gZGVmaW5pdGlvbi5pbnB1dHM7XG4gICAgY29uc3QgcHJvdG8gPSBkZWZpbml0aW9uLnR5cGUucHJvdG90eXBlO1xuICAgIC8vIFBsYWNlIHdoZXJlIHdlIHdpbGwgc3RvcmUgU2ltcGxlQ2hhbmdlcyBpZiB0aGVyZSBpcyBhIGNoYW5nZVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgUFJJVkFURV9QUkVGSVgsIHt2YWx1ZTogdW5kZWZpbmVkLCB3cml0YWJsZTogdHJ1ZX0pO1xuICAgIGZvciAobGV0IHB1YktleSBpbiBpbnB1dHMpIHtcbiAgICAgIGNvbnN0IG1pbktleSA9IGlucHV0c1twdWJLZXldO1xuICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gaW5wdXRQcm9wZXJ0eU5hbWVzICYmIGlucHV0UHJvcGVydHlOYW1lc1ttaW5LZXldIHx8IHB1YktleTtcbiAgICAgIGNvbnN0IHByaXZhdGVNaW5LZXkgPSBQUklWQVRFX1BSRUZJWCArIG1pbktleTtcbiAgICAgIC8vIENyZWF0ZSBhIHBsYWNlIHdoZXJlIHRoZSBhY3R1YWwgdmFsdWUgd2lsbCBiZSBzdG9yZWQgYW5kIG1ha2UgaXQgbm9uLWVudW1lcmFibGVcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgcHJpdmF0ZU1pbktleSwge3ZhbHVlOiB1bmRlZmluZWQsIHdyaXRhYmxlOiB0cnVlfSk7XG5cbiAgICAgIGNvbnN0IGV4aXN0aW5nRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIG1pbktleSk7XG5cbiAgICAgIC8vIGNyZWF0ZSBhIGdldHRlciBhbmQgc2V0dGVyIGZvciBwcm9wZXJ0eVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBtaW5LZXksIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbih0aGlzOiBPbkNoYW5nZXNFeHBhbmRvKSB7XG4gICAgICAgICAgcmV0dXJuIChleGlzdGluZ0Rlc2MgJiYgZXhpc3RpbmdEZXNjLmdldCkgPyBleGlzdGluZ0Rlc2MuZ2V0LmNhbGwodGhpcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1twcml2YXRlTWluS2V5XTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih0aGlzOiBPbkNoYW5nZXNFeHBhbmRvLCB2YWx1ZTogYW55KSB7XG4gICAgICAgICAgbGV0IHNpbXBsZUNoYW5nZXMgPSB0aGlzW1BSSVZBVEVfUFJFRklYXTtcbiAgICAgICAgICBsZXQgaXNGaXJzdENoYW5nZSA9IHNpbXBsZUNoYW5nZXMgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgICBpZiAoc2ltcGxlQ2hhbmdlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICBzaW1wbGVDaGFuZ2VzID0gdGhpc1tQUklWQVRFX1BSRUZJWF0gPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2ltcGxlQ2hhbmdlc1twcm9wZXJ0eU5hbWVdID0gbmV3IFNpbXBsZUNoYW5nZSh0aGlzW3ByaXZhdGVNaW5LZXldLCB2YWx1ZSwgaXNGaXJzdENoYW5nZSk7XG4gICAgICAgICAgKGV4aXN0aW5nRGVzYyAmJiBleGlzdGluZ0Rlc2Muc2V0KSA/IGV4aXN0aW5nRGVzYy5zZXQuY2FsbCh0aGlzLCB2YWx1ZSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3ByaXZhdGVNaW5LZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIElmIGFuIG9uSW5pdCBob29rIGlzIGRlZmluZWQsIGl0IHdpbGwgbmVlZCB0byB3cmFwIHRoZSBuZ09uQ2hhbmdlcyBjYWxsXG4gICAgLy8gc28gdGhlIGNhbGwgb3JkZXIgaXMgY2hhbmdlcy1pbml0LWNoZWNrIGluIGNyZWF0aW9uIG1vZGUuIEluIHN1YnNlcXVlbnRcbiAgICAvLyBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMsIG9ubHkgdGhlIGNoZWNrIHdyYXBwZXIgd2lsbCBiZSBjYWxsZWQuXG4gICAgaWYgKGRlZmluaXRpb24ub25Jbml0ICE9IG51bGwpIHtcbiAgICAgIGRlZmluaXRpb24ub25Jbml0ID0gb25DaGFuZ2VzV3JhcHBlcihkZWZpbml0aW9uLm9uSW5pdCk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbi5kb0NoZWNrID0gb25DaGFuZ2VzV3JhcHBlcihkZWZpbml0aW9uLmRvQ2hlY2spO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG9uQ2hhbmdlc1dyYXBwZXIoZGVsZWdhdGVIb29rOiAoKCkgPT4gdm9pZCkgfCBudWxsKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IE9uQ2hhbmdlc0V4cGFuZG8pIHtcbiAgICAgIGxldCBzaW1wbGVDaGFuZ2VzID0gdGhpc1tQUklWQVRFX1BSRUZJWF07XG4gICAgICBpZiAoc2ltcGxlQ2hhbmdlcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMubmdPbkNoYW5nZXMoc2ltcGxlQ2hhbmdlcyk7XG4gICAgICAgIHRoaXNbUFJJVkFURV9QUkVGSVhdID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGRlbGVnYXRlSG9vayAmJiBkZWxlZ2F0ZUhvb2suYXBwbHkodGhpcyk7XG4gICAgfTtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBQdWJsaWNGZWF0dXJlPFQ+KGRlZmluaXRpb246IERpcmVjdGl2ZURlZjxUPikge1xuICBkZWZpbml0aW9uLmRpUHVibGljID0gZGlQdWJsaWM7XG59XG5cbmNvbnN0IEVNUFRZID0ge307XG5cbi8qKiBTd2FwcyB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gKi9cbmZ1bmN0aW9uIGludmVydE9iamVjdChvYmo6IGFueSk6IGFueSB7XG4gIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIEVNUFRZO1xuICBjb25zdCBuZXdPYmo6IGFueSA9IHt9O1xuICBmb3IgKGxldCBtaW5pZmllZEtleSBpbiBvYmopIHtcbiAgICBuZXdPYmpbb2JqW21pbmlmaWVkS2V5XV0gPSBtaW5pZmllZEtleTtcbiAgfVxuICByZXR1cm4gbmV3T2JqO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRpcmVjdGl2ZSBkZWZpbml0aW9uIG9iamVjdC5cbiAqXG4gKiAjIEV4YW1wbGVcbiAqIGBgYFxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICAvLyBHZW5lcmF0ZWQgYnkgQW5ndWxhciBUZW1wbGF0ZSBDb21waWxlclxuICogICAvLyBbU3ltYm9sXSBzeW50YXggd2lsbCBub3QgYmUgc3VwcG9ydGVkIGJ5IFR5cGVTY3JpcHQgdW50aWwgdjIuN1xuICogICBzdGF0aWMgbmdEaXJlY3RpdmVEZWYgPSBkZWZpbmVEaXJlY3RpdmUoe1xuICogICAgIC4uLlxuICogICB9KTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgZGVmaW5lRGlyZWN0aXZlID0gZGVmaW5lQ29tcG9uZW50IGFzIGFueSBhczxUPihkaXJlY3RpdmVEZWZpbml0aW9uOiB7XG4gIC8qKlxuICAgKiBEaXJlY3RpdmUgdHlwZSwgbmVlZGVkIHRvIGNvbmZpZ3VyZSB0aGUgaW5qZWN0b3IuXG4gICAqL1xuICB0eXBlOiBUeXBlPFQ+O1xuXG4gIC8qKiBUaGUgc2VsZWN0b3JzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1hdGNoIG5vZGVzIHRvIHRoaXMgZGlyZWN0aXZlLiAqL1xuICBzZWxlY3RvcnM6IENzc1NlbGVjdG9yTGlzdDtcblxuICAvKipcbiAgICogRmFjdG9yeSBtZXRob2QgdXNlZCB0byBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgZGlyZWN0aXZlLlxuICAgKi9cbiAgZmFjdG9yeTogKCkgPT4gVCB8ICh7MDogVH0gJiBhbnlbXSk7IC8qIHRyeWluZyB0byBzYXkgVCB8IFtULCAuLi5hbnldICovXG5cbiAgLyoqXG4gICAqIFN0YXRpYyBhdHRyaWJ1dGVzIHRvIHNldCBvbiBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogYXR0cmlidXRlIG5hbWVcbiAgICogT2RkIGluZGljZXM6IGF0dHJpYnV0ZSB2YWx1ZVxuICAgKi9cbiAgYXR0cmlidXRlcz86IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBBIG1hcCBvZiBpbnB1dCBuYW1lcy5cbiAgICpcbiAgICogVGhlIGZvcm1hdCBpcyBpbjogYHtbYWN0dWFsUHJvcGVydHlOYW1lOiBzdHJpbmddOnN0cmluZ31gLlxuICAgKlxuICAgKiBXaGljaCB0aGUgbWluaWZpZXIgbWF5IHRyYW5zbGF0ZSB0bzogYHtbbWluaWZpZWRQcm9wZXJ0eU5hbWU6IHN0cmluZ106c3RyaW5nfWAuXG4gICAqXG4gICAqIFRoaXMgYWxsb3dzIHRoZSByZW5kZXIgdG8gcmUtY29uc3RydWN0IHRoZSBtaW5pZmllZCBhbmQgbm9uLW1pbmlmaWVkIG5hbWVzXG4gICAqIG9mIHByb3BlcnRpZXMuXG4gICAqL1xuICBpbnB1dHM/OiB7W1AgaW4ga2V5b2YgVF0/OiBzdHJpbmd9O1xuXG4gIC8qKlxuICAgKiBBIG1hcCBvZiBvdXRwdXQgbmFtZXMuXG4gICAqXG4gICAqIFRoZSBmb3JtYXQgaXMgaW46IGB7W2FjdHVhbFByb3BlcnR5TmFtZTogc3RyaW5nXTpzdHJpbmd9YC5cbiAgICpcbiAgICogV2hpY2ggdGhlIG1pbmlmaWVyIG1heSB0cmFuc2xhdGUgdG86IGB7W21pbmlmaWVkUHJvcGVydHlOYW1lOiBzdHJpbmddOnN0cmluZ31gLlxuICAgKlxuICAgKiBUaGlzIGFsbG93cyB0aGUgcmVuZGVyIHRvIHJlLWNvbnN0cnVjdCB0aGUgbWluaWZpZWQgYW5kIG5vbi1taW5pZmllZCBuYW1lc1xuICAgKiBvZiBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgb3V0cHV0cz86IHtbUCBpbiBrZXlvZiBUXT86IHN0cmluZ307XG5cbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBvcHRpb25hbCBmZWF0dXJlcyB0byBhcHBseS5cbiAgICpcbiAgICogU2VlOiB7QGxpbmsgTmdPbkNoYW5nZXNGZWF0dXJlfSwge0BsaW5rIFB1YmxpY0ZlYXR1cmV9XG4gICAqL1xuICBmZWF0dXJlcz86IERpcmVjdGl2ZURlZkZlYXR1cmVbXTtcblxuICAvKipcbiAgICogRnVuY3Rpb24gZXhlY3V0ZWQgYnkgdGhlIHBhcmVudCB0ZW1wbGF0ZSB0byBhbGxvdyBjaGlsZCBkaXJlY3RpdmUgdG8gYXBwbHkgaG9zdCBiaW5kaW5ncy5cbiAgICovXG4gIGhvc3RCaW5kaW5ncz86IChkaXJlY3RpdmVJbmRleDogbnVtYmVyLCBlbGVtZW50SW5kZXg6IG51bWJlcikgPT4gdm9pZDtcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgbmFtZSB0aGF0IGNhbiBiZSB1c2VkIGluIHRoZSB0ZW1wbGF0ZSB0byBhc3NpZ24gdGhpcyBkaXJlY3RpdmUgdG8gYSB2YXJpYWJsZS5cbiAgICpcbiAgICogU2VlOiB7QGxpbmsgRGlyZWN0aXZlLmV4cG9ydEFzfVxuICAgKi9cbiAgZXhwb3J0QXM/OiBzdHJpbmc7XG59KSA9PiBuZXZlcjtcblxuLyoqXG4gKiBDcmVhdGUgYSBwaXBlIGRlZmluaXRpb24gb2JqZWN0LlxuICpcbiAqICMgRXhhbXBsZVxuICogYGBgXG4gKiBjbGFzcyBNeVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAqICAgLy8gR2VuZXJhdGVkIGJ5IEFuZ3VsYXIgVGVtcGxhdGUgQ29tcGlsZXJcbiAqICAgc3RhdGljIG5nUGlwZURlZiA9IGRlZmluZVBpcGUoe1xuICogICAgIC4uLlxuICogICB9KTtcbiAqIH1cbiAqIGBgYFxuICogQHBhcmFtIHBpcGVEZWYgUGlwZSBkZWZpbml0aW9uIGdlbmVyYXRlZCBieSB0aGUgY29tcGlsZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVBpcGU8VD4ocGlwZURlZjoge1xuICAvKiogTmFtZSBvZiB0aGUgcGlwZS4gVXNlZCBmb3IgbWF0Y2hpbmcgcGlwZXMgaW4gdGVtcGxhdGUgdG8gcGlwZSBkZWZzLiAqL1xuICBuYW1lOiBzdHJpbmcsXG5cbiAgLyoqIFBpcGUgY2xhc3MgcmVmZXJlbmNlLiBOZWVkZWQgdG8gZXh0cmFjdCBwaXBlIGxpZmVjeWNsZSBob29rcy4gKi9cbiAgdHlwZTogVHlwZTxUPixcblxuICAvKiogQSBmYWN0b3J5IGZvciBjcmVhdGluZyBhIHBpcGUgaW5zdGFuY2UuICovXG4gIGZhY3Rvcnk6ICgpID0+IFQsXG5cbiAgLyoqIFdoZXRoZXIgdGhlIHBpcGUgaXMgcHVyZS4gKi9cbiAgcHVyZT86IGJvb2xlYW5cbn0pOiBuZXZlciB7XG4gIHJldHVybiAoPFBpcGVEZWY8VD4+e1xuICAgIG5hbWU6IHBpcGVEZWYubmFtZSxcbiAgICBuOiBwaXBlRGVmLmZhY3RvcnksXG4gICAgcHVyZTogcGlwZURlZi5wdXJlICE9PSBmYWxzZSxcbiAgICBvbkRlc3Ryb3k6IHBpcGVEZWYudHlwZS5wcm90b3R5cGUubmdPbkRlc3Ryb3kgfHwgbnVsbFxuICB9KSBhcyBuZXZlcjtcbn1cbiJdfQ==