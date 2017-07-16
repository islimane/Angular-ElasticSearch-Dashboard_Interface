var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ViewContainerRef, TemplateRef, Renderer } from '@angular/core';
import { autorun } from 'mobx';
import { MobxAutorunDirective } from './mobx-autorun.directive';
var MobxAutorunSyncDirective = (function (_super) {
    __extends(MobxAutorunSyncDirective, _super);
    function MobxAutorunSyncDirective(templateRef, viewContainer, renderer) {
        var _this = _super.call(this, templateRef, viewContainer, renderer) || this;
        _this.templateRef = templateRef;
        _this.viewContainer = viewContainer;
        _this.renderer = renderer;
        return _this;
    }
    MobxAutorunSyncDirective.prototype.autoDetect = function (view) {
        console.warn('mobxAutorunSync is deprected, please use mobxAutorun instead - it\'s doing exactly the same thing');
        this.dispose = autorun(function () {
            view['detectChanges']();
        });
    };
    return MobxAutorunSyncDirective;
}(MobxAutorunDirective));
MobxAutorunSyncDirective = __decorate([
    Directive({ selector: '[mobxAutorunSync]' }),
    __metadata("design:paramtypes", [TemplateRef,
        ViewContainerRef,
        Renderer])
], MobxAutorunSyncDirective);
export { MobxAutorunSyncDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ieC1hdXRvcnVuLXN5bmMuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RpcmVjdGl2ZXMvbW9ieC1hdXRvcnVuLXN5bmMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25GLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFHOUQsSUFBYSx3QkFBd0I7SUFBUyw0Q0FBb0I7SUFDaEUsa0NBQ1ksV0FBNkIsRUFDN0IsYUFBK0IsRUFDL0IsUUFBa0I7UUFIOUIsWUFHaUMsa0JBQU0sV0FBVyxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsU0FBRztRQUZuRSxpQkFBVyxHQUFYLFdBQVcsQ0FBa0I7UUFDN0IsbUJBQWEsR0FBYixhQUFhLENBQWtCO1FBQy9CLGNBQVEsR0FBUixRQUFRLENBQVU7O0lBQWdELENBQUM7SUFFL0UsNkNBQVUsR0FBVixVQUFXLElBQUk7UUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLG1HQUFtRyxDQUFDLENBQUM7UUFFbEgsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDckIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsK0JBQUM7QUFBRCxDQUFDLEFBYkQsQ0FBOEMsb0JBQW9CLEdBYWpFO0FBYlksd0JBQXdCO0lBRHBDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxDQUFDO3FDQUdsQixXQUFXO1FBQ1QsZ0JBQWdCO1FBQ3JCLFFBQVE7R0FKbkIsd0JBQXdCLENBYXBDO1NBYlksd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZiwgUmVuZGVyZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGF1dG9ydW4gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7TW9ieEF1dG9ydW5EaXJlY3RpdmV9IGZyb20gJy4vbW9ieC1hdXRvcnVuLmRpcmVjdGl2ZSc7XG5cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1ttb2J4QXV0b3J1blN5bmNdJyB9KVxuZXhwb3J0IGNsYXNzIE1vYnhBdXRvcnVuU3luY0RpcmVjdGl2ZSBleHRlbmRzIE1vYnhBdXRvcnVuRGlyZWN0aXZlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgIHByb3RlY3RlZCB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByb3RlY3RlZCByZW5kZXJlcjogUmVuZGVyZXIpIHtzdXBlcih0ZW1wbGF0ZVJlZiwgdmlld0NvbnRhaW5lciwgcmVuZGVyZXIpOyB9XG5cbiAgYXV0b0RldGVjdCh2aWV3KSB7XG4gICAgY29uc29sZS53YXJuKCdtb2J4QXV0b3J1blN5bmMgaXMgZGVwcmVjdGVkLCBwbGVhc2UgdXNlIG1vYnhBdXRvcnVuIGluc3RlYWQgLSBpdFxcJ3MgZG9pbmcgZXhhY3RseSB0aGUgc2FtZSB0aGluZycpO1xuXG4gICAgdGhpcy5kaXNwb3NlID0gYXV0b3J1bigoKSA9PiB7XG4gICAgICB2aWV3WydkZXRlY3RDaGFuZ2VzJ10oKTtcbiAgICB9KTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgRGVjb3JhdG9ySW52b2NhdGlvbiB7XG4gIHR5cGU6IEZ1bmN0aW9uO1xuICBhcmdzPzogYW55W107XG59XG4iXX0=