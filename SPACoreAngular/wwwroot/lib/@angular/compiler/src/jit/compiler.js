/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/jit/compiler", ["require", "exports", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/constant_pool", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/output/output_interpreter", "@angular/compiler/src/output/output_jit", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var constant_pool_1 = require("@angular/compiler/src/constant_pool");
    var ir = require("@angular/compiler/src/output/output_ast");
    var output_interpreter_1 = require("@angular/compiler/src/output/output_interpreter");
    var output_jit_1 = require("@angular/compiler/src/output/output_jit");
    var util_1 = require("@angular/compiler/src/util");
    /**
     * An internal module of the Angular compiler that begins with component types,
     * extracts templates, and eventually produces a compiled version of the component
     * ready for linking into an application.
     *
     * @security  When compiling templates at runtime, you must ensure that the entire template comes
     * from a trusted source. Attacker-controlled data introduced by a template could expose your
     * application to XSS risks.  For more detail, see the [Security Guide](http://g.co/ng/security).
     */
    var JitCompiler = /** @class */ (function () {
        function JitCompiler(_metadataResolver, _templateParser, _styleCompiler, _viewCompiler, _ngModuleCompiler, _summaryResolver, _reflector, _compilerConfig, _console, getExtraNgModuleProviders) {
            this._metadataResolver = _metadataResolver;
            this._templateParser = _templateParser;
            this._styleCompiler = _styleCompiler;
            this._viewCompiler = _viewCompiler;
            this._ngModuleCompiler = _ngModuleCompiler;
            this._summaryResolver = _summaryResolver;
            this._reflector = _reflector;
            this._compilerConfig = _compilerConfig;
            this._console = _console;
            this.getExtraNgModuleProviders = getExtraNgModuleProviders;
            this._compiledTemplateCache = new Map();
            this._compiledHostTemplateCache = new Map();
            this._compiledDirectiveWrapperCache = new Map();
            this._compiledNgModuleCache = new Map();
            this._sharedStylesheetCount = 0;
            this._addedAotSummaries = new Set();
        }
        JitCompiler.prototype.compileModuleSync = function (moduleType) {
            return util_1.SyncAsync.assertSync(this._compileModuleAndComponents(moduleType, true));
        };
        JitCompiler.prototype.compileModuleAsync = function (moduleType) {
            return Promise.resolve(this._compileModuleAndComponents(moduleType, false));
        };
        JitCompiler.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
            return util_1.SyncAsync.assertSync(this._compileModuleAndAllComponents(moduleType, true));
        };
        JitCompiler.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
            return Promise.resolve(this._compileModuleAndAllComponents(moduleType, false));
        };
        JitCompiler.prototype.getComponentFactory = function (component) {
            var summary = this._metadataResolver.getDirectiveSummary(component);
            return summary.componentFactory;
        };
        JitCompiler.prototype.loadAotSummaries = function (summaries) {
            this.clearCache();
            this._addAotSummaries(summaries);
        };
        JitCompiler.prototype._addAotSummaries = function (fn) {
            if (this._addedAotSummaries.has(fn)) {
                return;
            }
            this._addedAotSummaries.add(fn);
            var summaries = fn();
            for (var i = 0; i < summaries.length; i++) {
                var entry = summaries[i];
                if (typeof entry === 'function') {
                    this._addAotSummaries(entry);
                }
                else {
                    var summary = entry;
                    this._summaryResolver.addSummary({ symbol: summary.type.reference, metadata: null, type: summary });
                }
            }
        };
        JitCompiler.prototype.hasAotSummary = function (ref) { return !!this._summaryResolver.resolveSummary(ref); };
        JitCompiler.prototype._filterJitIdentifiers = function (ids) {
            var _this = this;
            return ids.map(function (mod) { return mod.reference; }).filter(function (ref) { return !_this.hasAotSummary(ref); });
        };
        JitCompiler.prototype._compileModuleAndComponents = function (moduleType, isSync) {
            var _this = this;
            return util_1.SyncAsync.then(this._loadModules(moduleType, isSync), function () {
                _this._compileComponents(moduleType, null);
                return _this._compileModule(moduleType);
            });
        };
        JitCompiler.prototype._compileModuleAndAllComponents = function (moduleType, isSync) {
            var _this = this;
            return util_1.SyncAsync.then(this._loadModules(moduleType, isSync), function () {
                var componentFactories = [];
                _this._compileComponents(moduleType, componentFactories);
                return {
                    ngModuleFactory: _this._compileModule(moduleType),
                    componentFactories: componentFactories
                };
            });
        };
        JitCompiler.prototype._loadModules = function (mainModule, isSync) {
            var _this = this;
            var loading = [];
            var mainNgModule = this._metadataResolver.getNgModuleMetadata(mainModule);
            // Note: for runtime compilation, we want to transitively compile all modules,
            // so we also need to load the declared directives / pipes for all nested modules.
            this._filterJitIdentifiers(mainNgModule.transitiveModule.modules).forEach(function (nestedNgModule) {
                // getNgModuleMetadata only returns null if the value passed in is not an NgModule
                var moduleMeta = _this._metadataResolver.getNgModuleMetadata(nestedNgModule);
                _this._filterJitIdentifiers(moduleMeta.declaredDirectives).forEach(function (ref) {
                    var promise = _this._metadataResolver.loadDirectiveMetadata(moduleMeta.type.reference, ref, isSync);
                    if (promise) {
                        loading.push(promise);
                    }
                });
                _this._filterJitIdentifiers(moduleMeta.declaredPipes)
                    .forEach(function (ref) { return _this._metadataResolver.getOrLoadPipeMetadata(ref); });
            });
            return util_1.SyncAsync.all(loading);
        };
        JitCompiler.prototype._compileModule = function (moduleType) {
            var ngModuleFactory = this._compiledNgModuleCache.get(moduleType);
            if (!ngModuleFactory) {
                var moduleMeta = this._metadataResolver.getNgModuleMetadata(moduleType);
                // Always provide a bound Compiler
                var extraProviders = this.getExtraNgModuleProviders(moduleMeta.type.reference);
                var outputCtx = createOutputContext();
                var compileResult = this._ngModuleCompiler.compile(outputCtx, moduleMeta, extraProviders);
                ngModuleFactory = this._interpretOrJit(compile_metadata_1.ngModuleJitUrl(moduleMeta), outputCtx.statements)[compileResult.ngModuleFactoryVar];
                this._compiledNgModuleCache.set(moduleMeta.type.reference, ngModuleFactory);
            }
            return ngModuleFactory;
        };
        /**
         * @internal
         */
        JitCompiler.prototype._compileComponents = function (mainModule, allComponentFactories) {
            var _this = this;
            var ngModule = this._metadataResolver.getNgModuleMetadata(mainModule);
            var moduleByJitDirective = new Map();
            var templates = new Set();
            var transJitModules = this._filterJitIdentifiers(ngModule.transitiveModule.modules);
            transJitModules.forEach(function (localMod) {
                var localModuleMeta = _this._metadataResolver.getNgModuleMetadata(localMod);
                _this._filterJitIdentifiers(localModuleMeta.declaredDirectives).forEach(function (dirRef) {
                    moduleByJitDirective.set(dirRef, localModuleMeta);
                    var dirMeta = _this._metadataResolver.getDirectiveMetadata(dirRef);
                    if (dirMeta.isComponent) {
                        templates.add(_this._createCompiledTemplate(dirMeta, localModuleMeta));
                        if (allComponentFactories) {
                            var template = _this._createCompiledHostTemplate(dirMeta.type.reference, localModuleMeta);
                            templates.add(template);
                            allComponentFactories.push(dirMeta.componentFactory);
                        }
                    }
                });
            });
            transJitModules.forEach(function (localMod) {
                var localModuleMeta = _this._metadataResolver.getNgModuleMetadata(localMod);
                _this._filterJitIdentifiers(localModuleMeta.declaredDirectives).forEach(function (dirRef) {
                    var dirMeta = _this._metadataResolver.getDirectiveMetadata(dirRef);
                    if (dirMeta.isComponent) {
                        dirMeta.entryComponents.forEach(function (entryComponentType) {
                            var moduleMeta = moduleByJitDirective.get(entryComponentType.componentType);
                            templates.add(_this._createCompiledHostTemplate(entryComponentType.componentType, moduleMeta));
                        });
                    }
                });
                localModuleMeta.entryComponents.forEach(function (entryComponentType) {
                    if (!_this.hasAotSummary(entryComponentType.componentType.reference)) {
                        var moduleMeta = moduleByJitDirective.get(entryComponentType.componentType);
                        templates.add(_this._createCompiledHostTemplate(entryComponentType.componentType, moduleMeta));
                    }
                });
            });
            templates.forEach(function (template) { return _this._compileTemplate(template); });
        };
        JitCompiler.prototype.clearCacheFor = function (type) {
            this._compiledNgModuleCache.delete(type);
            this._metadataResolver.clearCacheFor(type);
            this._compiledHostTemplateCache.delete(type);
            var compiledTemplate = this._compiledTemplateCache.get(type);
            if (compiledTemplate) {
                this._compiledTemplateCache.delete(type);
            }
        };
        JitCompiler.prototype.clearCache = function () {
            // Note: don't clear the _addedAotSummaries, as they don't change!
            this._metadataResolver.clearCache();
            this._compiledTemplateCache.clear();
            this._compiledHostTemplateCache.clear();
            this._compiledNgModuleCache.clear();
        };
        JitCompiler.prototype._createCompiledHostTemplate = function (compType, ngModule) {
            if (!ngModule) {
                throw new Error("Component " + util_1.stringify(compType) + " is not part of any NgModule or the module has not been imported into your module.");
            }
            var compiledTemplate = this._compiledHostTemplateCache.get(compType);
            if (!compiledTemplate) {
                var compMeta = this._metadataResolver.getDirectiveMetadata(compType);
                assertComponent(compMeta);
                var hostMeta = this._metadataResolver.getHostComponentMetadata(compMeta, compMeta.componentFactory.viewDefFactory);
                compiledTemplate =
                    new CompiledTemplate(true, compMeta.type, hostMeta, ngModule, [compMeta.type]);
                this._compiledHostTemplateCache.set(compType, compiledTemplate);
            }
            return compiledTemplate;
        };
        JitCompiler.prototype._createCompiledTemplate = function (compMeta, ngModule) {
            var compiledTemplate = this._compiledTemplateCache.get(compMeta.type.reference);
            if (!compiledTemplate) {
                assertComponent(compMeta);
                compiledTemplate = new CompiledTemplate(false, compMeta.type, compMeta, ngModule, ngModule.transitiveModule.directives);
                this._compiledTemplateCache.set(compMeta.type.reference, compiledTemplate);
            }
            return compiledTemplate;
        };
        JitCompiler.prototype._compileTemplate = function (template) {
            var _this = this;
            if (template.isCompiled) {
                return;
            }
            var compMeta = template.compMeta;
            var externalStylesheetsByModuleUrl = new Map();
            var outputContext = createOutputContext();
            var componentStylesheet = this._styleCompiler.compileComponent(outputContext, compMeta);
            compMeta.template.externalStylesheets.forEach(function (stylesheetMeta) {
                var compiledStylesheet = _this._styleCompiler.compileStyles(createOutputContext(), compMeta, stylesheetMeta);
                externalStylesheetsByModuleUrl.set(stylesheetMeta.moduleUrl, compiledStylesheet);
            });
            this._resolveStylesCompileResult(componentStylesheet, externalStylesheetsByModuleUrl);
            var pipes = template.ngModule.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
            var _a = this._parseTemplate(compMeta, template.ngModule, template.directives), parsedTemplate = _a.template, usedPipes = _a.pipes;
            var compileResult = this._viewCompiler.compileComponent(outputContext, compMeta, parsedTemplate, ir.variable(componentStylesheet.stylesVar), usedPipes);
            var evalResult = this._interpretOrJit(compile_metadata_1.templateJitUrl(template.ngModule.type, template.compMeta), outputContext.statements);
            var viewClass = evalResult[compileResult.viewClassVar];
            var rendererType = evalResult[compileResult.rendererTypeVar];
            template.compiled(viewClass, rendererType);
        };
        JitCompiler.prototype._parseTemplate = function (compMeta, ngModule, directiveIdentifiers) {
            var _this = this;
            // Note: ! is ok here as components always have a template.
            var preserveWhitespaces = compMeta.template.preserveWhitespaces;
            var directives = directiveIdentifiers.map(function (dir) { return _this._metadataResolver.getDirectiveSummary(dir.reference); });
            var pipes = ngModule.transitiveModule.pipes.map(function (pipe) { return _this._metadataResolver.getPipeSummary(pipe.reference); });
            return this._templateParser.parse(compMeta, compMeta.template.htmlAst, directives, pipes, ngModule.schemas, compile_metadata_1.templateSourceUrl(ngModule.type, compMeta, compMeta.template), preserveWhitespaces);
        };
        JitCompiler.prototype._resolveStylesCompileResult = function (result, externalStylesheetsByModuleUrl) {
            var _this = this;
            result.dependencies.forEach(function (dep, i) {
                var nestedCompileResult = externalStylesheetsByModuleUrl.get(dep.moduleUrl);
                var nestedStylesArr = _this._resolveAndEvalStylesCompileResult(nestedCompileResult, externalStylesheetsByModuleUrl);
                dep.setValue(nestedStylesArr);
            });
        };
        JitCompiler.prototype._resolveAndEvalStylesCompileResult = function (result, externalStylesheetsByModuleUrl) {
            this._resolveStylesCompileResult(result, externalStylesheetsByModuleUrl);
            return this._interpretOrJit(compile_metadata_1.sharedStylesheetJitUrl(result.meta, this._sharedStylesheetCount++), result.outputCtx.statements)[result.stylesVar];
        };
        JitCompiler.prototype._interpretOrJit = function (sourceUrl, statements) {
            if (!this._compilerConfig.useJit) {
                return output_interpreter_1.interpretStatements(statements, this._reflector);
            }
            else {
                return output_jit_1.jitStatements(sourceUrl, statements, this._reflector, this._compilerConfig.jitDevMode);
            }
        };
        return JitCompiler;
    }());
    exports.JitCompiler = JitCompiler;
    var CompiledTemplate = /** @class */ (function () {
        function CompiledTemplate(isHost, compType, compMeta, ngModule, directives) {
            this.isHost = isHost;
            this.compType = compType;
            this.compMeta = compMeta;
            this.ngModule = ngModule;
            this.directives = directives;
            this._viewClass = null;
            this.isCompiled = false;
        }
        CompiledTemplate.prototype.compiled = function (viewClass, rendererType) {
            this._viewClass = viewClass;
            this.compMeta.componentViewType.setDelegate(viewClass);
            for (var prop in rendererType) {
                this.compMeta.rendererType[prop] = rendererType[prop];
            }
            this.isCompiled = true;
        };
        return CompiledTemplate;
    }());
    function assertComponent(meta) {
        if (!meta.isComponent) {
            throw new Error("Could not compile '" + compile_metadata_1.identifierName(meta.type) + "' because it is not a component.");
        }
    }
    function createOutputContext() {
        var importExpr = function (symbol) {
            return ir.importExpr({ name: compile_metadata_1.identifierName(symbol), moduleName: null, runtime: symbol });
        };
        return { statements: [], genFilePath: '', importExpr: importExpr, constantPool: new constant_pool_1.ConstantPool() };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaml0L2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsMkVBQWtVO0lBR2xVLHFFQUE4QztJQUk5Qyw0REFBMkM7SUFDM0Msc0ZBQWlFO0lBQ2pFLHNFQUFtRDtJQUtuRCxtREFBcUU7SUFRckU7Ozs7Ozs7O09BUUc7SUFDSDtRQVFFLHFCQUNZLGlCQUEwQyxFQUFVLGVBQStCLEVBQ25GLGNBQTZCLEVBQVUsYUFBMkIsRUFDbEUsaUJBQW1DLEVBQVUsZ0JBQXVDLEVBQ3BGLFVBQTRCLEVBQVUsZUFBK0IsRUFDckUsUUFBaUIsRUFDakIseUJBQXVFO1lBTHZFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBeUI7WUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBZ0I7WUFDbkYsbUJBQWMsR0FBZCxjQUFjLENBQWU7WUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBYztZQUNsRSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1lBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF1QjtZQUNwRixlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUFVLG9CQUFlLEdBQWYsZUFBZSxDQUFnQjtZQUNyRSxhQUFRLEdBQVIsUUFBUSxDQUFTO1lBQ2pCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBOEM7WUFiM0UsMkJBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7WUFDM0QsK0JBQTBCLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7WUFDL0QsbUNBQThCLEdBQUcsSUFBSSxHQUFHLEVBQWMsQ0FBQztZQUN2RCwyQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBZ0IsQ0FBQztZQUNqRCwyQkFBc0IsR0FBRyxDQUFDLENBQUM7WUFDM0IsdUJBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQWUs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QUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQUM7UUFBaEYsQ0FBZ0YsQ0FBQztRQUNyRixNQUFNLENBQUMsRUFBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsVUFBVSxZQUFBLEVBQUUsWUFBWSxFQUFFLElBQUksNEJBQVksRUFBRSxFQUFDLENBQUM7SUFDekYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLCBDb21waWxlUGlwZVN1bW1hcnksIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhLCBDb21waWxlVHlwZVN1bW1hcnksIFByb3ZpZGVyTWV0YSwgUHJveHlDbGFzcywgaWRlbnRpZmllck5hbWUsIG5nTW9kdWxlSml0VXJsLCBzaGFyZWRTdHlsZXNoZWV0Sml0VXJsLCB0ZW1wbGF0ZUppdFVybCwgdGVtcGxhdGVTb3VyY2VVcmx9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtDb21waWxlUmVmbGVjdG9yfSBmcm9tICcuLi9jb21waWxlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0NvbXBpbGVyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7Q29tcGlsZU1ldGFkYXRhUmVzb2x2ZXJ9IGZyb20gJy4uL21ldGFkYXRhX3Jlc29sdmVyJztcbmltcG9ydCB7TmdNb2R1bGVDb21waWxlcn0gZnJvbSAnLi4vbmdfbW9kdWxlX2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7aW50ZXJwcmV0U3RhdGVtZW50c30gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9pbnRlcnByZXRlcic7XG5pbXBvcnQge2ppdFN0YXRlbWVudHN9IGZyb20gJy4uL291dHB1dC9vdXRwdXRfaml0JztcbmltcG9ydCB7Q29tcGlsZWRTdHlsZXNoZWV0LCBTdHlsZUNvbXBpbGVyfSBmcm9tICcuLi9zdHlsZV9jb21waWxlcic7XG5pbXBvcnQge1N1bW1hcnlSZXNvbHZlcn0gZnJvbSAnLi4vc3VtbWFyeV9yZXNvbHZlcic7XG5pbXBvcnQge1RlbXBsYXRlQXN0fSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7VGVtcGxhdGVQYXJzZXJ9IGZyb20gJy4uL3RlbXBsYXRlX3BhcnNlci90ZW1wbGF0ZV9wYXJzZXInO1xuaW1wb3J0IHtDb25zb2xlLCBPdXRwdXRDb250ZXh0LCBTeW5jQXN5bmMsIHN0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge1ZpZXdDb21waWxlcn0gZnJvbSAnLi4vdmlld19jb21waWxlci92aWV3X2NvbXBpbGVyJztcblxuZXhwb3J0IGludGVyZmFjZSBNb2R1bGVXaXRoQ29tcG9uZW50RmFjdG9yaWVzIHtcbiAgbmdNb2R1bGVGYWN0b3J5OiBvYmplY3Q7XG4gIGNvbXBvbmVudEZhY3Rvcmllczogb2JqZWN0W107XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgbW9kdWxlIG9mIHRoZSBBbmd1bGFyIGNvbXBpbGVyIHRoYXQgYmVnaW5zIHdpdGggY29tcG9uZW50IHR5cGVzLFxuICogZXh0cmFjdHMgdGVtcGxhdGVzLCBhbmQgZXZlbnR1YWxseSBwcm9kdWNlcyBhIGNvbXBpbGVkIHZlcnNpb24gb2YgdGhlIGNvbXBvbmVudFxuICogcmVhZHkgZm9yIGxpbmtpbmcgaW50byBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAc2VjdXJpdHkgIFdoZW4gY29tcGlsaW5nIHRlbXBsYXRlcyBhdCBydW50aW1lLCB5b3UgbXVzdCBlbnN1cmUgdGhhdCB0aGUgZW50aXJlIHRlbXBsYXRlIGNvbWVzXG4gKiBmcm9tIGEgdHJ1c3RlZCBzb3VyY2UuIEF0dGFja2VyLWNvbnRyb2xsZWQgZGF0YSBpbnRyb2R1Y2VkIGJ5IGEgdGVtcGxhdGUgY291bGQgZXhwb3NlIHlvdXJcbiAqIGFwcGxpY2F0aW9uIHRvIFhTUyByaXNrcy4gIEZvciBtb3JlIGRldGFpbCwgc2VlIHRoZSBbU2VjdXJpdHkgR3VpZGVdKGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5KS5cbiAqL1xuZXhwb3J0IGNsYXNzIEppdENvbXBpbGVyIHtcbiAgcHJpdmF0ZSBfY29tcGlsZWRUZW1wbGF0ZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBDb21waWxlZFRlbXBsYXRlPigpO1xuICBwcml2YXRlIF9jb21waWxlZEhvc3RUZW1wbGF0ZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBDb21waWxlZFRlbXBsYXRlPigpO1xuICBwcml2YXRlIF9jb21waWxlZERpcmVjdGl2ZVdyYXBwZXJDYWNoZSA9IG5ldyBNYXA8VHlwZSwgVHlwZT4oKTtcbiAgcHJpdmF0ZSBfY29tcGlsZWROZ01vZHVsZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBvYmplY3Q+KCk7XG4gIHByaXZhdGUgX3NoYXJlZFN0eWxlc2hlZXRDb3VudCA9IDA7XG4gIHByaXZhdGUgX2FkZGVkQW90U3VtbWFyaWVzID0gbmV3IFNldDwoKSA9PiBhbnlbXT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX21ldGFkYXRhUmVzb2x2ZXI6IENvbXBpbGVNZXRhZGF0YVJlc29sdmVyLCBwcml2YXRlIF90ZW1wbGF0ZVBhcnNlcjogVGVtcGxhdGVQYXJzZXIsXG4gICAgICBwcml2YXRlIF9zdHlsZUNvbXBpbGVyOiBTdHlsZUNvbXBpbGVyLCBwcml2YXRlIF92aWV3Q29tcGlsZXI6IFZpZXdDb21waWxlcixcbiAgICAgIHByaXZhdGUgX25nTW9kdWxlQ29tcGlsZXI6IE5nTW9kdWxlQ29tcGlsZXIsIHByaXZhdGUgX3N1bW1hcnlSZXNvbHZlcjogU3VtbWFyeVJlc29sdmVyPFR5cGU+LFxuICAgICAgcHJpdmF0ZSBfcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yLCBwcml2YXRlIF9jb21waWxlckNvbmZpZzogQ29tcGlsZXJDb25maWcsXG4gICAgICBwcml2YXRlIF9jb25zb2xlOiBDb25zb2xlLFxuICAgICAgcHJpdmF0ZSBnZXRFeHRyYU5nTW9kdWxlUHJvdmlkZXJzOiAobmdNb2R1bGU6IGFueSkgPT4gQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSkge31cblxuICBjb21waWxlTW9kdWxlU3luYyhtb2R1bGVUeXBlOiBUeXBlKTogb2JqZWN0IHtcbiAgICByZXR1cm4gU3luY0FzeW5jLmFzc2VydFN5bmModGhpcy5fY29tcGlsZU1vZHVsZUFuZENvbXBvbmVudHMobW9kdWxlVHlwZSwgdHJ1ZSkpO1xuICB9XG5cbiAgY29tcGlsZU1vZHVsZUFzeW5jKG1vZHVsZVR5cGU6IFR5cGUpOiBQcm9taXNlPG9iamVjdD4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fY29tcGlsZU1vZHVsZUFuZENvbXBvbmVudHMobW9kdWxlVHlwZSwgZmFsc2UpKTtcbiAgfVxuXG4gIGNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzU3luYyhtb2R1bGVUeXBlOiBUeXBlKTogTW9kdWxlV2l0aENvbXBvbmVudEZhY3RvcmllcyB7XG4gICAgcmV0dXJuIFN5bmNBc3luYy5hc3NlcnRTeW5jKHRoaXMuX2NvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzKG1vZHVsZVR5cGUsIHRydWUpKTtcbiAgfVxuXG4gIGNvbXBpbGVNb2R1bGVBbmRBbGxDb21wb25lbnRzQXN5bmMobW9kdWxlVHlwZTogVHlwZSk6IFByb21pc2U8TW9kdWxlV2l0aENvbXBvbmVudEZhY3Rvcmllcz4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHMobW9kdWxlVHlwZSwgZmFsc2UpKTtcbiAgfVxuXG4gIGdldENvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50OiBUeXBlKTogb2JqZWN0IHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVTdW1tYXJ5KGNvbXBvbmVudCk7XG4gICAgcmV0dXJuIHN1bW1hcnkuY29tcG9uZW50RmFjdG9yeSBhcyBvYmplY3Q7XG4gIH1cblxuICBsb2FkQW90U3VtbWFyaWVzKHN1bW1hcmllczogKCkgPT4gYW55W10pIHtcbiAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICB0aGlzLl9hZGRBb3RTdW1tYXJpZXMoc3VtbWFyaWVzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZEFvdFN1bW1hcmllcyhmbjogKCkgPT4gYW55W10pIHtcbiAgICBpZiAodGhpcy5fYWRkZWRBb3RTdW1tYXJpZXMuaGFzKGZuKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hZGRlZEFvdFN1bW1hcmllcy5hZGQoZm4pO1xuICAgIGNvbnN0IHN1bW1hcmllcyA9IGZuKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdW1tYXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gc3VtbWFyaWVzW2ldO1xuICAgICAgaWYgKHR5cGVvZiBlbnRyeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9hZGRBb3RTdW1tYXJpZXMoZW50cnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGVudHJ5IGFzIENvbXBpbGVUeXBlU3VtbWFyeTtcbiAgICAgICAgdGhpcy5fc3VtbWFyeVJlc29sdmVyLmFkZFN1bW1hcnkoXG4gICAgICAgICAgICB7c3ltYm9sOiBzdW1tYXJ5LnR5cGUucmVmZXJlbmNlLCBtZXRhZGF0YTogbnVsbCwgdHlwZTogc3VtbWFyeX0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhc0FvdFN1bW1hcnkocmVmOiBUeXBlKSB7IHJldHVybiAhIXRoaXMuX3N1bW1hcnlSZXNvbHZlci5yZXNvbHZlU3VtbWFyeShyZWYpOyB9XG5cbiAgcHJpdmF0ZSBfZmlsdGVySml0SWRlbnRpZmllcnMoaWRzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGlkcy5tYXAobW9kID0+IG1vZC5yZWZlcmVuY2UpLmZpbHRlcigocmVmKSA9PiAhdGhpcy5oYXNBb3RTdW1tYXJ5KHJlZikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZU1vZHVsZUFuZENvbXBvbmVudHMobW9kdWxlVHlwZTogVHlwZSwgaXNTeW5jOiBib29sZWFuKTogU3luY0FzeW5jPG9iamVjdD4ge1xuICAgIHJldHVybiBTeW5jQXN5bmMudGhlbih0aGlzLl9sb2FkTW9kdWxlcyhtb2R1bGVUeXBlLCBpc1N5bmMpLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jb21waWxlQ29tcG9uZW50cyhtb2R1bGVUeXBlLCBudWxsKTtcbiAgICAgIHJldHVybiB0aGlzLl9jb21waWxlTW9kdWxlKG1vZHVsZVR5cGUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHMobW9kdWxlVHlwZTogVHlwZSwgaXNTeW5jOiBib29sZWFuKTpcbiAgICAgIFN5bmNBc3luYzxNb2R1bGVXaXRoQ29tcG9uZW50RmFjdG9yaWVzPiB7XG4gICAgcmV0dXJuIFN5bmNBc3luYy50aGVuKHRoaXMuX2xvYWRNb2R1bGVzKG1vZHVsZVR5cGUsIGlzU3luYyksICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3Rvcmllczogb2JqZWN0W10gPSBbXTtcbiAgICAgIHRoaXMuX2NvbXBpbGVDb21wb25lbnRzKG1vZHVsZVR5cGUsIGNvbXBvbmVudEZhY3Rvcmllcyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuZ01vZHVsZUZhY3Rvcnk6IHRoaXMuX2NvbXBpbGVNb2R1bGUobW9kdWxlVHlwZSksXG4gICAgICAgIGNvbXBvbmVudEZhY3RvcmllczogY29tcG9uZW50RmFjdG9yaWVzXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfbG9hZE1vZHVsZXMobWFpbk1vZHVsZTogYW55LCBpc1N5bmM6IGJvb2xlYW4pOiBTeW5jQXN5bmM8YW55PiB7XG4gICAgY29uc3QgbG9hZGluZzogUHJvbWlzZTxhbnk+W10gPSBbXTtcbiAgICBjb25zdCBtYWluTmdNb2R1bGUgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldE5nTW9kdWxlTWV0YWRhdGEobWFpbk1vZHVsZSkgITtcbiAgICAvLyBOb3RlOiBmb3IgcnVudGltZSBjb21waWxhdGlvbiwgd2Ugd2FudCB0byB0cmFuc2l0aXZlbHkgY29tcGlsZSBhbGwgbW9kdWxlcyxcbiAgICAvLyBzbyB3ZSBhbHNvIG5lZWQgdG8gbG9hZCB0aGUgZGVjbGFyZWQgZGlyZWN0aXZlcyAvIHBpcGVzIGZvciBhbGwgbmVzdGVkIG1vZHVsZXMuXG4gICAgdGhpcy5fZmlsdGVySml0SWRlbnRpZmllcnMobWFpbk5nTW9kdWxlLnRyYW5zaXRpdmVNb2R1bGUubW9kdWxlcykuZm9yRWFjaCgobmVzdGVkTmdNb2R1bGUpID0+IHtcbiAgICAgIC8vIGdldE5nTW9kdWxlTWV0YWRhdGEgb25seSByZXR1cm5zIG51bGwgaWYgdGhlIHZhbHVlIHBhc3NlZCBpbiBpcyBub3QgYW4gTmdNb2R1bGVcbiAgICAgIGNvbnN0IG1vZHVsZU1ldGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldE5nTW9kdWxlTWV0YWRhdGEobmVzdGVkTmdNb2R1bGUpICE7XG4gICAgICB0aGlzLl9maWx0ZXJKaXRJZGVudGlmaWVycyhtb2R1bGVNZXRhLmRlY2xhcmVkRGlyZWN0aXZlcykuZm9yRWFjaCgocmVmKSA9PiB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPVxuICAgICAgICAgICAgdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5sb2FkRGlyZWN0aXZlTWV0YWRhdGEobW9kdWxlTWV0YS50eXBlLnJlZmVyZW5jZSwgcmVmLCBpc1N5bmMpO1xuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgIGxvYWRpbmcucHVzaChwcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9maWx0ZXJKaXRJZGVudGlmaWVycyhtb2R1bGVNZXRhLmRlY2xhcmVkUGlwZXMpXG4gICAgICAgICAgLmZvckVhY2goKHJlZikgPT4gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRPckxvYWRQaXBlTWV0YWRhdGEocmVmKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFN5bmNBc3luYy5hbGwobG9hZGluZyk7XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlTW9kdWxlKG1vZHVsZVR5cGU6IFR5cGUpOiBvYmplY3Qge1xuICAgIGxldCBuZ01vZHVsZUZhY3RvcnkgPSB0aGlzLl9jb21waWxlZE5nTW9kdWxlQ2FjaGUuZ2V0KG1vZHVsZVR5cGUpICE7XG4gICAgaWYgKCFuZ01vZHVsZUZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IG1vZHVsZU1ldGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldE5nTW9kdWxlTWV0YWRhdGEobW9kdWxlVHlwZSkgITtcbiAgICAgIC8vIEFsd2F5cyBwcm92aWRlIGEgYm91bmQgQ29tcGlsZXJcbiAgICAgIGNvbnN0IGV4dHJhUHJvdmlkZXJzID0gdGhpcy5nZXRFeHRyYU5nTW9kdWxlUHJvdmlkZXJzKG1vZHVsZU1ldGEudHlwZS5yZWZlcmVuY2UpO1xuICAgICAgY29uc3Qgb3V0cHV0Q3R4ID0gY3JlYXRlT3V0cHV0Q29udGV4dCgpO1xuICAgICAgY29uc3QgY29tcGlsZVJlc3VsdCA9IHRoaXMuX25nTW9kdWxlQ29tcGlsZXIuY29tcGlsZShvdXRwdXRDdHgsIG1vZHVsZU1ldGEsIGV4dHJhUHJvdmlkZXJzKTtcbiAgICAgIG5nTW9kdWxlRmFjdG9yeSA9IHRoaXMuX2ludGVycHJldE9ySml0KFxuICAgICAgICAgIG5nTW9kdWxlSml0VXJsKG1vZHVsZU1ldGEpLCBvdXRwdXRDdHguc3RhdGVtZW50cylbY29tcGlsZVJlc3VsdC5uZ01vZHVsZUZhY3RvcnlWYXJdO1xuICAgICAgdGhpcy5fY29tcGlsZWROZ01vZHVsZUNhY2hlLnNldChtb2R1bGVNZXRhLnR5cGUucmVmZXJlbmNlLCBuZ01vZHVsZUZhY3RvcnkpO1xuICAgIH1cbiAgICByZXR1cm4gbmdNb2R1bGVGYWN0b3J5O1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2NvbXBpbGVDb21wb25lbnRzKG1haW5Nb2R1bGU6IFR5cGUsIGFsbENvbXBvbmVudEZhY3Rvcmllczogb2JqZWN0W118bnVsbCkge1xuICAgIGNvbnN0IG5nTW9kdWxlID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXROZ01vZHVsZU1ldGFkYXRhKG1haW5Nb2R1bGUpICE7XG4gICAgY29uc3QgbW9kdWxlQnlKaXREaXJlY3RpdmUgPSBuZXcgTWFwPGFueSwgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE+KCk7XG4gICAgY29uc3QgdGVtcGxhdGVzID0gbmV3IFNldDxDb21waWxlZFRlbXBsYXRlPigpO1xuXG4gICAgY29uc3QgdHJhbnNKaXRNb2R1bGVzID0gdGhpcy5fZmlsdGVySml0SWRlbnRpZmllcnMobmdNb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5tb2R1bGVzKTtcbiAgICB0cmFuc0ppdE1vZHVsZXMuZm9yRWFjaCgobG9jYWxNb2QpID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsTW9kdWxlTWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShsb2NhbE1vZCkgITtcbiAgICAgIHRoaXMuX2ZpbHRlckppdElkZW50aWZpZXJzKGxvY2FsTW9kdWxlTWV0YS5kZWNsYXJlZERpcmVjdGl2ZXMpLmZvckVhY2goKGRpclJlZikgPT4ge1xuICAgICAgICBtb2R1bGVCeUppdERpcmVjdGl2ZS5zZXQoZGlyUmVmLCBsb2NhbE1vZHVsZU1ldGEpO1xuICAgICAgICBjb25zdCBkaXJNZXRhID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkaXJSZWYpO1xuICAgICAgICBpZiAoZGlyTWV0YS5pc0NvbXBvbmVudCkge1xuICAgICAgICAgIHRlbXBsYXRlcy5hZGQodGhpcy5fY3JlYXRlQ29tcGlsZWRUZW1wbGF0ZShkaXJNZXRhLCBsb2NhbE1vZHVsZU1ldGEpKTtcbiAgICAgICAgICBpZiAoYWxsQ29tcG9uZW50RmFjdG9yaWVzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlQ29tcGlsZWRIb3N0VGVtcGxhdGUoZGlyTWV0YS50eXBlLnJlZmVyZW5jZSwgbG9jYWxNb2R1bGVNZXRhKTtcbiAgICAgICAgICAgIHRlbXBsYXRlcy5hZGQodGVtcGxhdGUpO1xuICAgICAgICAgICAgYWxsQ29tcG9uZW50RmFjdG9yaWVzLnB1c2goZGlyTWV0YS5jb21wb25lbnRGYWN0b3J5IGFzIG9iamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0cmFuc0ppdE1vZHVsZXMuZm9yRWFjaCgobG9jYWxNb2QpID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsTW9kdWxlTWV0YSA9IHRoaXMuX21ldGFkYXRhUmVzb2x2ZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShsb2NhbE1vZCkgITtcbiAgICAgIHRoaXMuX2ZpbHRlckppdElkZW50aWZpZXJzKGxvY2FsTW9kdWxlTWV0YS5kZWNsYXJlZERpcmVjdGl2ZXMpLmZvckVhY2goKGRpclJlZikgPT4ge1xuICAgICAgICBjb25zdCBkaXJNZXRhID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXREaXJlY3RpdmVNZXRhZGF0YShkaXJSZWYpO1xuICAgICAgICBpZiAoZGlyTWV0YS5pc0NvbXBvbmVudCkge1xuICAgICAgICAgIGRpck1ldGEuZW50cnlDb21wb25lbnRzLmZvckVhY2goKGVudHJ5Q29tcG9uZW50VHlwZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlTWV0YSA9IG1vZHVsZUJ5Sml0RGlyZWN0aXZlLmdldChlbnRyeUNvbXBvbmVudFR5cGUuY29tcG9uZW50VHlwZSkgITtcbiAgICAgICAgICAgIHRlbXBsYXRlcy5hZGQoXG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlQ29tcGlsZWRIb3N0VGVtcGxhdGUoZW50cnlDb21wb25lbnRUeXBlLmNvbXBvbmVudFR5cGUsIG1vZHVsZU1ldGEpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbE1vZHVsZU1ldGEuZW50cnlDb21wb25lbnRzLmZvckVhY2goKGVudHJ5Q29tcG9uZW50VHlwZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaGFzQW90U3VtbWFyeShlbnRyeUNvbXBvbmVudFR5cGUuY29tcG9uZW50VHlwZS5yZWZlcmVuY2UpKSB7XG4gICAgICAgICAgY29uc3QgbW9kdWxlTWV0YSA9IG1vZHVsZUJ5Sml0RGlyZWN0aXZlLmdldChlbnRyeUNvbXBvbmVudFR5cGUuY29tcG9uZW50VHlwZSkgITtcbiAgICAgICAgICB0ZW1wbGF0ZXMuYWRkKFxuICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVDb21waWxlZEhvc3RUZW1wbGF0ZShlbnRyeUNvbXBvbmVudFR5cGUuY29tcG9uZW50VHlwZSwgbW9kdWxlTWV0YSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0ZW1wbGF0ZXMuZm9yRWFjaCgodGVtcGxhdGUpID0+IHRoaXMuX2NvbXBpbGVUZW1wbGF0ZSh0ZW1wbGF0ZSkpO1xuICB9XG5cbiAgY2xlYXJDYWNoZUZvcih0eXBlOiBUeXBlKSB7XG4gICAgdGhpcy5fY29tcGlsZWROZ01vZHVsZUNhY2hlLmRlbGV0ZSh0eXBlKTtcbiAgICB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmNsZWFyQ2FjaGVGb3IodHlwZSk7XG4gICAgdGhpcy5fY29tcGlsZWRIb3N0VGVtcGxhdGVDYWNoZS5kZWxldGUodHlwZSk7XG4gICAgY29uc3QgY29tcGlsZWRUZW1wbGF0ZSA9IHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVDYWNoZS5nZXQodHlwZSk7XG4gICAgaWYgKGNvbXBpbGVkVGVtcGxhdGUpIHtcbiAgICAgIHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVDYWNoZS5kZWxldGUodHlwZSk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXJDYWNoZSgpOiB2b2lkIHtcbiAgICAvLyBOb3RlOiBkb24ndCBjbGVhciB0aGUgX2FkZGVkQW90U3VtbWFyaWVzLCBhcyB0aGV5IGRvbid0IGNoYW5nZSFcbiAgICB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmNsZWFyQ2FjaGUoKTtcbiAgICB0aGlzLl9jb21waWxlZFRlbXBsYXRlQ2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLl9jb21waWxlZEhvc3RUZW1wbGF0ZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcGlsZWROZ01vZHVsZUNhY2hlLmNsZWFyKCk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVDb21waWxlZEhvc3RUZW1wbGF0ZShjb21wVHlwZTogVHlwZSwgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKTpcbiAgICAgIENvbXBpbGVkVGVtcGxhdGUge1xuICAgIGlmICghbmdNb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ29tcG9uZW50ICR7c3RyaW5naWZ5KGNvbXBUeXBlKX0gaXMgbm90IHBhcnQgb2YgYW55IE5nTW9kdWxlIG9yIHRoZSBtb2R1bGUgaGFzIG5vdCBiZWVuIGltcG9ydGVkIGludG8geW91ciBtb2R1bGUuYCk7XG4gICAgfVxuICAgIGxldCBjb21waWxlZFRlbXBsYXRlID0gdGhpcy5fY29tcGlsZWRIb3N0VGVtcGxhdGVDYWNoZS5nZXQoY29tcFR5cGUpO1xuICAgIGlmICghY29tcGlsZWRUZW1wbGF0ZSkge1xuICAgICAgY29uc3QgY29tcE1ldGEgPSB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKGNvbXBUeXBlKTtcbiAgICAgIGFzc2VydENvbXBvbmVudChjb21wTWV0YSk7XG5cbiAgICAgIGNvbnN0IGhvc3RNZXRhID0gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRIb3N0Q29tcG9uZW50TWV0YWRhdGEoXG4gICAgICAgICAgY29tcE1ldGEsIChjb21wTWV0YS5jb21wb25lbnRGYWN0b3J5IGFzIGFueSkudmlld0RlZkZhY3RvcnkpO1xuICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9XG4gICAgICAgICAgbmV3IENvbXBpbGVkVGVtcGxhdGUodHJ1ZSwgY29tcE1ldGEudHlwZSwgaG9zdE1ldGEsIG5nTW9kdWxlLCBbY29tcE1ldGEudHlwZV0pO1xuICAgICAgdGhpcy5fY29tcGlsZWRIb3N0VGVtcGxhdGVDYWNoZS5zZXQoY29tcFR5cGUsIGNvbXBpbGVkVGVtcGxhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZWRUZW1wbGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUNvbXBpbGVkVGVtcGxhdGUoXG4gICAgICBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBuZ01vZHVsZTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEpOiBDb21waWxlZFRlbXBsYXRlIHtcbiAgICBsZXQgY29tcGlsZWRUZW1wbGF0ZSA9IHRoaXMuX2NvbXBpbGVkVGVtcGxhdGVDYWNoZS5nZXQoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpO1xuICAgIGlmICghY29tcGlsZWRUZW1wbGF0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50KGNvbXBNZXRhKTtcbiAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBuZXcgQ29tcGlsZWRUZW1wbGF0ZShcbiAgICAgICAgICBmYWxzZSwgY29tcE1ldGEudHlwZSwgY29tcE1ldGEsIG5nTW9kdWxlLCBuZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXMpO1xuICAgICAgdGhpcy5fY29tcGlsZWRUZW1wbGF0ZUNhY2hlLnNldChjb21wTWV0YS50eXBlLnJlZmVyZW5jZSwgY29tcGlsZWRUZW1wbGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiBjb21waWxlZFRlbXBsYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlOiBDb21waWxlZFRlbXBsYXRlKSB7XG4gICAgaWYgKHRlbXBsYXRlLmlzQ29tcGlsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY29tcE1ldGEgPSB0ZW1wbGF0ZS5jb21wTWV0YTtcbiAgICBjb25zdCBleHRlcm5hbFN0eWxlc2hlZXRzQnlNb2R1bGVVcmwgPSBuZXcgTWFwPHN0cmluZywgQ29tcGlsZWRTdHlsZXNoZWV0PigpO1xuICAgIGNvbnN0IG91dHB1dENvbnRleHQgPSBjcmVhdGVPdXRwdXRDb250ZXh0KCk7XG4gICAgY29uc3QgY29tcG9uZW50U3R5bGVzaGVldCA9IHRoaXMuX3N0eWxlQ29tcGlsZXIuY29tcGlsZUNvbXBvbmVudChvdXRwdXRDb250ZXh0LCBjb21wTWV0YSk7XG4gICAgY29tcE1ldGEudGVtcGxhdGUgIS5leHRlcm5hbFN0eWxlc2hlZXRzLmZvckVhY2goKHN0eWxlc2hlZXRNZXRhKSA9PiB7XG4gICAgICBjb25zdCBjb21waWxlZFN0eWxlc2hlZXQgPVxuICAgICAgICAgIHRoaXMuX3N0eWxlQ29tcGlsZXIuY29tcGlsZVN0eWxlcyhjcmVhdGVPdXRwdXRDb250ZXh0KCksIGNvbXBNZXRhLCBzdHlsZXNoZWV0TWV0YSk7XG4gICAgICBleHRlcm5hbFN0eWxlc2hlZXRzQnlNb2R1bGVVcmwuc2V0KHN0eWxlc2hlZXRNZXRhLm1vZHVsZVVybCAhLCBjb21waWxlZFN0eWxlc2hlZXQpO1xuICAgIH0pO1xuICAgIHRoaXMuX3Jlc29sdmVTdHlsZXNDb21waWxlUmVzdWx0KGNvbXBvbmVudFN0eWxlc2hlZXQsIGV4dGVybmFsU3R5bGVzaGVldHNCeU1vZHVsZVVybCk7XG4gICAgY29uc3QgcGlwZXMgPSB0ZW1wbGF0ZS5uZ01vZHVsZS50cmFuc2l0aXZlTW9kdWxlLnBpcGVzLm1hcChcbiAgICAgICAgcGlwZSA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldFBpcGVTdW1tYXJ5KHBpcGUucmVmZXJlbmNlKSk7XG4gICAgY29uc3Qge3RlbXBsYXRlOiBwYXJzZWRUZW1wbGF0ZSwgcGlwZXM6IHVzZWRQaXBlc30gPVxuICAgICAgICB0aGlzLl9wYXJzZVRlbXBsYXRlKGNvbXBNZXRhLCB0ZW1wbGF0ZS5uZ01vZHVsZSwgdGVtcGxhdGUuZGlyZWN0aXZlcyk7XG4gICAgY29uc3QgY29tcGlsZVJlc3VsdCA9IHRoaXMuX3ZpZXdDb21waWxlci5jb21waWxlQ29tcG9uZW50KFxuICAgICAgICBvdXRwdXRDb250ZXh0LCBjb21wTWV0YSwgcGFyc2VkVGVtcGxhdGUsIGlyLnZhcmlhYmxlKGNvbXBvbmVudFN0eWxlc2hlZXQuc3R5bGVzVmFyKSxcbiAgICAgICAgdXNlZFBpcGVzKTtcbiAgICBjb25zdCBldmFsUmVzdWx0ID0gdGhpcy5faW50ZXJwcmV0T3JKaXQoXG4gICAgICAgIHRlbXBsYXRlSml0VXJsKHRlbXBsYXRlLm5nTW9kdWxlLnR5cGUsIHRlbXBsYXRlLmNvbXBNZXRhKSwgb3V0cHV0Q29udGV4dC5zdGF0ZW1lbnRzKTtcbiAgICBjb25zdCB2aWV3Q2xhc3MgPSBldmFsUmVzdWx0W2NvbXBpbGVSZXN1bHQudmlld0NsYXNzVmFyXTtcbiAgICBjb25zdCByZW5kZXJlclR5cGUgPSBldmFsUmVzdWx0W2NvbXBpbGVSZXN1bHQucmVuZGVyZXJUeXBlVmFyXTtcbiAgICB0ZW1wbGF0ZS5jb21waWxlZCh2aWV3Q2xhc3MsIHJlbmRlcmVyVHlwZSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVRlbXBsYXRlKFxuICAgICAgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLFxuICAgICAgZGlyZWN0aXZlSWRlbnRpZmllcnM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSk6XG4gICAgICB7dGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXX0ge1xuICAgIC8vIE5vdGU6ICEgaXMgb2sgaGVyZSBhcyBjb21wb25lbnRzIGFsd2F5cyBoYXZlIGEgdGVtcGxhdGUuXG4gICAgY29uc3QgcHJlc2VydmVXaGl0ZXNwYWNlcyA9IGNvbXBNZXRhLnRlbXBsYXRlICEucHJlc2VydmVXaGl0ZXNwYWNlcztcbiAgICBjb25zdCBkaXJlY3RpdmVzID1cbiAgICAgICAgZGlyZWN0aXZlSWRlbnRpZmllcnMubWFwKGRpciA9PiB0aGlzLl9tZXRhZGF0YVJlc29sdmVyLmdldERpcmVjdGl2ZVN1bW1hcnkoZGlyLnJlZmVyZW5jZSkpO1xuICAgIGNvbnN0IHBpcGVzID0gbmdNb2R1bGUudHJhbnNpdGl2ZU1vZHVsZS5waXBlcy5tYXAoXG4gICAgICAgIHBpcGUgPT4gdGhpcy5fbWV0YWRhdGFSZXNvbHZlci5nZXRQaXBlU3VtbWFyeShwaXBlLnJlZmVyZW5jZSkpO1xuICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZVBhcnNlci5wYXJzZShcbiAgICAgICAgY29tcE1ldGEsIGNvbXBNZXRhLnRlbXBsYXRlICEuaHRtbEFzdCAhLCBkaXJlY3RpdmVzLCBwaXBlcywgbmdNb2R1bGUuc2NoZW1hcyxcbiAgICAgICAgdGVtcGxhdGVTb3VyY2VVcmwobmdNb2R1bGUudHlwZSwgY29tcE1ldGEsIGNvbXBNZXRhLnRlbXBsYXRlICEpLCBwcmVzZXJ2ZVdoaXRlc3BhY2VzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVTdHlsZXNDb21waWxlUmVzdWx0KFxuICAgICAgcmVzdWx0OiBDb21waWxlZFN0eWxlc2hlZXQsIGV4dGVybmFsU3R5bGVzaGVldHNCeU1vZHVsZVVybDogTWFwPHN0cmluZywgQ29tcGlsZWRTdHlsZXNoZWV0Pikge1xuICAgIHJlc3VsdC5kZXBlbmRlbmNpZXMuZm9yRWFjaCgoZGVwLCBpKSA9PiB7XG4gICAgICBjb25zdCBuZXN0ZWRDb21waWxlUmVzdWx0ID0gZXh0ZXJuYWxTdHlsZXNoZWV0c0J5TW9kdWxlVXJsLmdldChkZXAubW9kdWxlVXJsKSAhO1xuICAgICAgY29uc3QgbmVzdGVkU3R5bGVzQXJyID0gdGhpcy5fcmVzb2x2ZUFuZEV2YWxTdHlsZXNDb21waWxlUmVzdWx0KFxuICAgICAgICAgIG5lc3RlZENvbXBpbGVSZXN1bHQsIGV4dGVybmFsU3R5bGVzaGVldHNCeU1vZHVsZVVybCk7XG4gICAgICBkZXAuc2V0VmFsdWUobmVzdGVkU3R5bGVzQXJyKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVBbmRFdmFsU3R5bGVzQ29tcGlsZVJlc3VsdChcbiAgICAgIHJlc3VsdDogQ29tcGlsZWRTdHlsZXNoZWV0LFxuICAgICAgZXh0ZXJuYWxTdHlsZXNoZWV0c0J5TW9kdWxlVXJsOiBNYXA8c3RyaW5nLCBDb21waWxlZFN0eWxlc2hlZXQ+KTogc3RyaW5nW10ge1xuICAgIHRoaXMuX3Jlc29sdmVTdHlsZXNDb21waWxlUmVzdWx0KHJlc3VsdCwgZXh0ZXJuYWxTdHlsZXNoZWV0c0J5TW9kdWxlVXJsKTtcbiAgICByZXR1cm4gdGhpcy5faW50ZXJwcmV0T3JKaXQoXG4gICAgICAgIHNoYXJlZFN0eWxlc2hlZXRKaXRVcmwocmVzdWx0Lm1ldGEsIHRoaXMuX3NoYXJlZFN0eWxlc2hlZXRDb3VudCsrKSxcbiAgICAgICAgcmVzdWx0Lm91dHB1dEN0eC5zdGF0ZW1lbnRzKVtyZXN1bHQuc3R5bGVzVmFyXTtcbiAgfVxuXG4gIHByaXZhdGUgX2ludGVycHJldE9ySml0KHNvdXJjZVVybDogc3RyaW5nLCBzdGF0ZW1lbnRzOiBpci5TdGF0ZW1lbnRbXSk6IGFueSB7XG4gICAgaWYgKCF0aGlzLl9jb21waWxlckNvbmZpZy51c2VKaXQpIHtcbiAgICAgIHJldHVybiBpbnRlcnByZXRTdGF0ZW1lbnRzKHN0YXRlbWVudHMsIHRoaXMuX3JlZmxlY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBqaXRTdGF0ZW1lbnRzKHNvdXJjZVVybCwgc3RhdGVtZW50cywgdGhpcy5fcmVmbGVjdG9yLCB0aGlzLl9jb21waWxlckNvbmZpZy5qaXREZXZNb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ29tcGlsZWRUZW1wbGF0ZSB7XG4gIHByaXZhdGUgX3ZpZXdDbGFzczogRnVuY3Rpb24gPSBudWxsICE7XG4gIGlzQ29tcGlsZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBpc0hvc3Q6IGJvb2xlYW4sIHB1YmxpYyBjb21wVHlwZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgICAgIHB1YmxpYyBjb21wTWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBwdWJsaWMgbmdNb2R1bGU6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhLFxuICAgICAgcHVibGljIGRpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSkge31cblxuICBjb21waWxlZCh2aWV3Q2xhc3M6IEZ1bmN0aW9uLCByZW5kZXJlclR5cGU6IGFueSkge1xuICAgIHRoaXMuX3ZpZXdDbGFzcyA9IHZpZXdDbGFzcztcbiAgICAoPFByb3h5Q2xhc3M+dGhpcy5jb21wTWV0YS5jb21wb25lbnRWaWV3VHlwZSkuc2V0RGVsZWdhdGUodmlld0NsYXNzKTtcbiAgICBmb3IgKGxldCBwcm9wIGluIHJlbmRlcmVyVHlwZSkge1xuICAgICAgKDxhbnk+dGhpcy5jb21wTWV0YS5yZW5kZXJlclR5cGUpW3Byb3BdID0gcmVuZGVyZXJUeXBlW3Byb3BdO1xuICAgIH1cbiAgICB0aGlzLmlzQ29tcGlsZWQgPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydENvbXBvbmVudChtZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpIHtcbiAgaWYgKCFtZXRhLmlzQ29tcG9uZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQ291bGQgbm90IGNvbXBpbGUgJyR7aWRlbnRpZmllck5hbWUobWV0YS50eXBlKX0nIGJlY2F1c2UgaXQgaXMgbm90IGEgY29tcG9uZW50LmApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU91dHB1dENvbnRleHQoKTogT3V0cHV0Q29udGV4dCB7XG4gIGNvbnN0IGltcG9ydEV4cHIgPSAoc3ltYm9sOiBhbnkpID0+XG4gICAgICBpci5pbXBvcnRFeHByKHtuYW1lOiBpZGVudGlmaWVyTmFtZShzeW1ib2wpLCBtb2R1bGVOYW1lOiBudWxsLCBydW50aW1lOiBzeW1ib2x9KTtcbiAgcmV0dXJuIHtzdGF0ZW1lbnRzOiBbXSwgZ2VuRmlsZVBhdGg6ICcnLCBpbXBvcnRFeHByLCBjb25zdGFudFBvb2w6IG5ldyBDb25zdGFudFBvb2woKX07XG59XG4iXX0=