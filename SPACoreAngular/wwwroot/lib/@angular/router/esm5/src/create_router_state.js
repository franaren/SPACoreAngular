/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, RouterState } from './router_state';
import { TreeNode } from './utils/tree';
export function createRouterState(routeReuseStrategy, curr, prevState) {
    var root = createNode(routeReuseStrategy, curr._root, prevState ? prevState._root : undefined);
    return new RouterState(root, curr);
}
function createNode(routeReuseStrategy, curr, prevState) {
    // reuse an activated route that is currently displayed on the screen
    if (prevState && routeReuseStrategy.shouldReuseRoute(curr.value, prevState.value.snapshot)) {
        var value = prevState.value;
        value._futureSnapshot = curr.value;
        var children = createOrReuseChildren(routeReuseStrategy, curr, prevState);
        return new TreeNode(value, children);
        // retrieve an activated route that is used to be displayed, but is not currently displayed
    }
    else {
        var detachedRouteHandle = routeReuseStrategy.retrieve(curr.value);
        if (detachedRouteHandle) {
            var tree = detachedRouteHandle.route;
            setFutureSnapshotsOfActivatedRoutes(curr, tree);
            return tree;
        }
        else {
            var value = createActivatedRoute(curr.value);
            var children = curr.children.map(function (c) { return createNode(routeReuseStrategy, c); });
            return new TreeNode(value, children);
        }
    }
}
function setFutureSnapshotsOfActivatedRoutes(curr, result) {
    if (curr.value.routeConfig !== result.value.routeConfig) {
        throw new Error('Cannot reattach ActivatedRouteSnapshot created from a different route');
    }
    if (curr.children.length !== result.children.length) {
        throw new Error('Cannot reattach ActivatedRouteSnapshot with a different number of children');
    }
    result.value._futureSnapshot = curr.value;
    for (var i = 0; i < curr.children.length; ++i) {
        setFutureSnapshotsOfActivatedRoutes(curr.children[i], result.children[i]);
    }
}
function createOrReuseChildren(routeReuseStrategy, curr, prevState) {
    return curr.children.map(function (child) {
        try {
            for (var _a = tslib_1.__values(prevState.children), _b = _a.next(); !_b.done; _b = _a.next()) {
                var p = _b.value;
                if (routeReuseStrategy.shouldReuseRoute(p.value.snapshot, child.value)) {
                    return createNode(routeReuseStrategy, child, p);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return createNode(routeReuseStrategy, child);
        var e_1, _c;
    });
}
function createActivatedRoute(c) {
    return new ActivatedRoute(new BehaviorSubject(c.url), new BehaviorSubject(c.params), new BehaviorSubject(c.queryParams), new BehaviorSubject(c.fragment), new BehaviorSubject(c.data), c.outlet, c.component, c);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX3JvdXRlcl9zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvY3JlYXRlX3JvdXRlcl9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUdyQyxPQUFPLEVBQUMsY0FBYyxFQUEwQixXQUFXLEVBQXNCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUV0QyxNQUFNLDRCQUNGLGtCQUFzQyxFQUFFLElBQXlCLEVBQ2pFLFNBQXNCO0lBQ3hCLElBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakcsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsb0JBQ0ksa0JBQXNDLEVBQUUsSUFBc0MsRUFDOUUsU0FBb0M7SUFDdEMscUVBQXFFO0lBQ3JFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLElBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDOUIsS0FBSyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25DLElBQU0sUUFBUSxHQUFHLHFCQUFxQixDQUFDLGtCQUFrQixFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1RSxN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QyxFQUFFLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFDN0YsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCZWhhdmlvclN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0RldGFjaGVkUm91dGVIYW5kbGVJbnRlcm5hbCwgUm91dGVSZXVzZVN0cmF0ZWd5fSBmcm9tICcuL3JvdXRlX3JldXNlX3N0cmF0ZWd5JztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGUsIEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIFJvdXRlclN0YXRlLCBSb3V0ZXJTdGF0ZVNuYXBzaG90fSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1RyZWVOb2RlfSBmcm9tICcuL3V0aWxzL3RyZWUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm91dGVyU3RhdGUoXG4gICAgcm91dGVSZXVzZVN0cmF0ZWd5OiBSb3V0ZVJldXNlU3RyYXRlZ3ksIGN1cnI6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICAgcHJldlN0YXRlOiBSb3V0ZXJTdGF0ZSk6IFJvdXRlclN0YXRlIHtcbiAgY29uc3Qgcm9vdCA9IGNyZWF0ZU5vZGUocm91dGVSZXVzZVN0cmF0ZWd5LCBjdXJyLl9yb290LCBwcmV2U3RhdGUgPyBwcmV2U3RhdGUuX3Jvb3QgOiB1bmRlZmluZWQpO1xuICByZXR1cm4gbmV3IFJvdXRlclN0YXRlKHJvb3QsIGN1cnIpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOb2RlKFxuICAgIHJvdXRlUmV1c2VTdHJhdGVneTogUm91dGVSZXVzZVN0cmF0ZWd5LCBjdXJyOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PixcbiAgICBwcmV2U3RhdGU/OiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4pOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4ge1xuICAvLyByZXVzZSBhbiBhY3RpdmF0ZWQgcm91dGUgdGhhdCBpcyBjdXJyZW50bHkgZGlzcGxheWVkIG9uIHRoZSBzY3JlZW5cbiAgaWYgKHByZXZTdGF0ZSAmJiByb3V0ZVJldXNlU3RyYXRlZ3kuc2hvdWxkUmV1c2VSb3V0ZShjdXJyLnZhbHVlLCBwcmV2U3RhdGUudmFsdWUuc25hcHNob3QpKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwcmV2U3RhdGUudmFsdWU7XG4gICAgdmFsdWUuX2Z1dHVyZVNuYXBzaG90ID0gY3Vyci52YWx1ZTtcbiAgICBjb25zdCBjaGlsZHJlbiA9IGNyZWF0ZU9yUmV1c2VDaGlsZHJlbihyb3V0ZVJldXNlU3RyYXRlZ3ksIGN1cnIsIHByZXZTdGF0ZSk7XG4gICAgcmV0dXJuIG5ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4odmFsdWUsIGNoaWxkcmVuKTtcblxuICAgIC8vIHJldHJpZXZlIGFuIGFjdGl2YXRlZCByb3V0ZSB0aGF0IGlzIHVzZWQgdG8gYmUgZGlzcGxheWVkLCBidXQgaXMgbm90IGN1cnJlbnRseSBkaXNwbGF5ZWRcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkZXRhY2hlZFJvdXRlSGFuZGxlID1cbiAgICAgICAgPERldGFjaGVkUm91dGVIYW5kbGVJbnRlcm5hbD5yb3V0ZVJldXNlU3RyYXRlZ3kucmV0cmlldmUoY3Vyci52YWx1ZSk7XG4gICAgaWYgKGRldGFjaGVkUm91dGVIYW5kbGUpIHtcbiAgICAgIGNvbnN0IHRyZWU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPiA9IGRldGFjaGVkUm91dGVIYW5kbGUucm91dGU7XG4gICAgICBzZXRGdXR1cmVTbmFwc2hvdHNPZkFjdGl2YXRlZFJvdXRlcyhjdXJyLCB0cmVlKTtcbiAgICAgIHJldHVybiB0cmVlO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gY3JlYXRlQWN0aXZhdGVkUm91dGUoY3Vyci52YWx1ZSk7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGN1cnIuY2hpbGRyZW4ubWFwKGMgPT4gY3JlYXRlTm9kZShyb3V0ZVJldXNlU3RyYXRlZ3ksIGMpKTtcbiAgICAgIHJldHVybiBuZXcgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+KHZhbHVlLCBjaGlsZHJlbik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldEZ1dHVyZVNuYXBzaG90c09mQWN0aXZhdGVkUm91dGVzKFxuICAgIGN1cnI6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LCByZXN1bHQ6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPik6IHZvaWQge1xuICBpZiAoY3Vyci52YWx1ZS5yb3V0ZUNvbmZpZyAhPT0gcmVzdWx0LnZhbHVlLnJvdXRlQ29uZmlnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcmVhdHRhY2ggQWN0aXZhdGVkUm91dGVTbmFwc2hvdCBjcmVhdGVkIGZyb20gYSBkaWZmZXJlbnQgcm91dGUnKTtcbiAgfVxuICBpZiAoY3Vyci5jaGlsZHJlbi5sZW5ndGggIT09IHJlc3VsdC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZWF0dGFjaCBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHdpdGggYSBkaWZmZXJlbnQgbnVtYmVyIG9mIGNoaWxkcmVuJyk7XG4gIH1cbiAgcmVzdWx0LnZhbHVlLl9mdXR1cmVTbmFwc2hvdCA9IGN1cnIudmFsdWU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY3Vyci5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgIHNldEZ1dHVyZVNuYXBzaG90c09mQWN0aXZhdGVkUm91dGVzKGN1cnIuY2hpbGRyZW5baV0sIHJlc3VsdC5jaGlsZHJlbltpXSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlT3JSZXVzZUNoaWxkcmVuKFxuICAgIHJvdXRlUmV1c2VTdHJhdGVneTogUm91dGVSZXVzZVN0cmF0ZWd5LCBjdXJyOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PixcbiAgICBwcmV2U3RhdGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPikge1xuICByZXR1cm4gY3Vyci5jaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgIGZvciAoY29uc3QgcCBvZiBwcmV2U3RhdGUuY2hpbGRyZW4pIHtcbiAgICAgIGlmIChyb3V0ZVJldXNlU3RyYXRlZ3kuc2hvdWxkUmV1c2VSb3V0ZShwLnZhbHVlLnNuYXBzaG90LCBjaGlsZC52YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU5vZGUocm91dGVSZXVzZVN0cmF0ZWd5LCBjaGlsZCwgcCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVOb2RlKHJvdXRlUmV1c2VTdHJhdGVneSwgY2hpbGQpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQWN0aXZhdGVkUm91dGUoYzogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCkge1xuICByZXR1cm4gbmV3IEFjdGl2YXRlZFJvdXRlKFxuICAgICAgbmV3IEJlaGF2aW9yU3ViamVjdChjLnVybCksIG5ldyBCZWhhdmlvclN1YmplY3QoYy5wYXJhbXMpLCBuZXcgQmVoYXZpb3JTdWJqZWN0KGMucXVlcnlQYXJhbXMpLFxuICAgICAgbmV3IEJlaGF2aW9yU3ViamVjdChjLmZyYWdtZW50KSwgbmV3IEJlaGF2aW9yU3ViamVjdChjLmRhdGEpLCBjLm91dGxldCwgYy5jb21wb25lbnQsIGMpO1xufVxuIl19