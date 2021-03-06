/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export var LifecycleHooks;
(function (LifecycleHooks) {
    LifecycleHooks[LifecycleHooks["OnInit"] = 0] = "OnInit";
    LifecycleHooks[LifecycleHooks["OnDestroy"] = 1] = "OnDestroy";
    LifecycleHooks[LifecycleHooks["DoCheck"] = 2] = "DoCheck";
    LifecycleHooks[LifecycleHooks["OnChanges"] = 3] = "OnChanges";
    LifecycleHooks[LifecycleHooks["AfterContentInit"] = 4] = "AfterContentInit";
    LifecycleHooks[LifecycleHooks["AfterContentChecked"] = 5] = "AfterContentChecked";
    LifecycleHooks[LifecycleHooks["AfterViewInit"] = 6] = "AfterViewInit";
    LifecycleHooks[LifecycleHooks["AfterViewChecked"] = 7] = "AfterViewChecked";
})(LifecycleHooks || (LifecycleHooks = {}));
export var LIFECYCLE_HOOKS_VALUES = [
    LifecycleHooks.OnInit, LifecycleHooks.OnDestroy, LifecycleHooks.DoCheck, LifecycleHooks.OnChanges,
    LifecycleHooks.AfterContentInit, LifecycleHooks.AfterContentChecked, LifecycleHooks.AfterViewInit,
    LifecycleHooks.AfterViewChecked
];
export function hasLifecycleHook(reflector, hook, token) {
    return reflector.hasLifecycleHook(token, getHookName(hook));
}
export function getAllLifecycleHooks(reflector, token) {
    return LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return hasLifecycleHook(reflector, hook, token); });
}
function getHookName(hook) {
    switch (hook) {
        case LifecycleHooks.OnInit:
            return 'ngOnInit';
        case LifecycleHooks.OnDestroy:
            return 'ngOnDestroy';
        case LifecycleHooks.DoCheck:
            return 'ngDoCheck';
        case LifecycleHooks.OnChanges:
            return 'ngOnChanges';
        case LifecycleHooks.AfterContentInit:
            return 'ngAfterContentInit';
        case LifecycleHooks.AfterContentChecked:
            return 'ngAfterContentChecked';
        case LifecycleHooks.AfterViewInit:
            return 'ngAfterViewInit';
        case LifecycleHooks.AfterViewChecked:
            return 'ngAfterViewChecked';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlX3JlZmxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9saWZlY3ljbGVfcmVmbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE1BQU0sQ0FBTixJQUFZLGNBU1g7QUFURCxXQUFZLGNBQWM7SUFDeEIsdURBQU0sQ0FBQTtJQUNOLDZEQUFTLENBQUE7SUFDVCx5REFBTyxDQUFBO0lBQ1AsNkRBQVMsQ0FBQTtJQUNULDJFQUFnQixDQUFBO0lBQ2hCLGlGQUFtQixDQUFBO0lBQ25CLHFFQUFhLENBQUE7SUFDYiwyRUFBZ0IsQ0FBQTtBQUNsQixDQUFDLEVBVFcsY0FBYyxLQUFkLGNBQWMsUUFTekI7QUFFRCxNQUFNLENBQUMsSUFBTSxzQkFBc0IsR0FBRztJQUNwQyxjQUFjLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsU0FBUztJQUNqRyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxhQUFhO0lBQ2pHLGNBQWMsQ0FBQyxnQkFBZ0I7Q0FDaEMsQ0FBQztBQUVGLE1BQU0sMkJBQ0YsU0FBMkIsRUFBRSxJQUFvQixFQUFFLEtBQVU7SUFDL0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUVELE1BQU0sK0JBQStCLFNBQTJCLEVBQUUsS0FBVTtJQUMxRSxNQUFNLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFBeEMsQ0FBd0MsQ0FBQyxDQUFDO0FBQ3pGLENBQUM7QUFFRCxxQkFBcUIsSUFBb0I7SUFDdkMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNiLEtBQUssY0FBYyxDQUFDLE1BQU07WUFDeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQixLQUFLLGNBQWMsQ0FBQyxTQUFTO1lBQzNCLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDdkIsS0FBSyxjQUFjLENBQUMsT0FBTztZQUN6QixNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3JCLEtBQUssY0FBYyxDQUFDLFNBQVM7WUFDM0IsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUN2QixLQUFLLGNBQWMsQ0FBQyxnQkFBZ0I7WUFDbEMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO1FBQzlCLEtBQUssY0FBYyxDQUFDLG1CQUFtQjtZQUNyQyxNQUFNLENBQUMsdUJBQXVCLENBQUM7UUFDakMsS0FBSyxjQUFjLENBQUMsYUFBYTtZQUMvQixNQUFNLENBQUMsaUJBQWlCLENBQUM7UUFDM0IsS0FBSyxjQUFjLENBQUMsZ0JBQWdCO1lBQ2xDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztJQUNoQyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuL2NvbXBpbGVfcmVmbGVjdG9yJztcblxuZXhwb3J0IGVudW0gTGlmZWN5Y2xlSG9va3Mge1xuICBPbkluaXQsXG4gIE9uRGVzdHJveSxcbiAgRG9DaGVjayxcbiAgT25DaGFuZ2VzLFxuICBBZnRlckNvbnRlbnRJbml0LFxuICBBZnRlckNvbnRlbnRDaGVja2VkLFxuICBBZnRlclZpZXdJbml0LFxuICBBZnRlclZpZXdDaGVja2VkXG59XG5cbmV4cG9ydCBjb25zdCBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTID0gW1xuICBMaWZlY3ljbGVIb29rcy5PbkluaXQsIExpZmVjeWNsZUhvb2tzLk9uRGVzdHJveSwgTGlmZWN5Y2xlSG9va3MuRG9DaGVjaywgTGlmZWN5Y2xlSG9va3MuT25DaGFuZ2VzLFxuICBMaWZlY3ljbGVIb29rcy5BZnRlckNvbnRlbnRJbml0LCBMaWZlY3ljbGVIb29rcy5BZnRlckNvbnRlbnRDaGVja2VkLCBMaWZlY3ljbGVIb29rcy5BZnRlclZpZXdJbml0LFxuICBMaWZlY3ljbGVIb29rcy5BZnRlclZpZXdDaGVja2VkXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gaGFzTGlmZWN5Y2xlSG9vayhcbiAgICByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIGhvb2s6IExpZmVjeWNsZUhvb2tzLCB0b2tlbjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiByZWZsZWN0b3IuaGFzTGlmZWN5Y2xlSG9vayh0b2tlbiwgZ2V0SG9va05hbWUoaG9vaykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsTGlmZWN5Y2xlSG9va3MocmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLCB0b2tlbjogYW55KTogTGlmZWN5Y2xlSG9va3NbXSB7XG4gIHJldHVybiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTLmZpbHRlcihob29rID0+IGhhc0xpZmVjeWNsZUhvb2socmVmbGVjdG9yLCBob29rLCB0b2tlbikpO1xufVxuXG5mdW5jdGlvbiBnZXRIb29rTmFtZShob29rOiBMaWZlY3ljbGVIb29rcyk6IHN0cmluZyB7XG4gIHN3aXRjaCAoaG9vaykge1xuICAgIGNhc2UgTGlmZWN5Y2xlSG9va3MuT25Jbml0OlxuICAgICAgcmV0dXJuICduZ09uSW5pdCc7XG4gICAgY2FzZSBMaWZlY3ljbGVIb29rcy5PbkRlc3Ryb3k6XG4gICAgICByZXR1cm4gJ25nT25EZXN0cm95JztcbiAgICBjYXNlIExpZmVjeWNsZUhvb2tzLkRvQ2hlY2s6XG4gICAgICByZXR1cm4gJ25nRG9DaGVjayc7XG4gICAgY2FzZSBMaWZlY3ljbGVIb29rcy5PbkNoYW5nZXM6XG4gICAgICByZXR1cm4gJ25nT25DaGFuZ2VzJztcbiAgICBjYXNlIExpZmVjeWNsZUhvb2tzLkFmdGVyQ29udGVudEluaXQ6XG4gICAgICByZXR1cm4gJ25nQWZ0ZXJDb250ZW50SW5pdCc7XG4gICAgY2FzZSBMaWZlY3ljbGVIb29rcy5BZnRlckNvbnRlbnRDaGVja2VkOlxuICAgICAgcmV0dXJuICduZ0FmdGVyQ29udGVudENoZWNrZWQnO1xuICAgIGNhc2UgTGlmZWN5Y2xlSG9va3MuQWZ0ZXJWaWV3SW5pdDpcbiAgICAgIHJldHVybiAnbmdBZnRlclZpZXdJbml0JztcbiAgICBjYXNlIExpZmVjeWNsZUhvb2tzLkFmdGVyVmlld0NoZWNrZWQ6XG4gICAgICByZXR1cm4gJ25nQWZ0ZXJWaWV3Q2hlY2tlZCc7XG4gIH1cbn1cbiJdfQ==