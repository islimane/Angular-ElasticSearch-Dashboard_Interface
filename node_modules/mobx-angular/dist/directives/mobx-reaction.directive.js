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
import { Directive, ViewContainerRef, TemplateRef, Input, Renderer } from '@angular/core';
import { reaction } from 'mobx';
import { MobxAutorunDirective } from './mobx-autorun.directive';
var MobxReactionDirective = (function (_super) {
    __extends(MobxReactionDirective, _super);
    function MobxReactionDirective(templateRef, viewContainer, renderer) {
        var _this = _super.call(this, templateRef, viewContainer, renderer) || this;
        _this.templateRef = templateRef;
        _this.viewContainer = viewContainer;
        _this.renderer = renderer;
        return _this;
    }
    MobxReactionDirective.prototype.autoDetect = function (view) {
        this.dispose = reaction(this.mobxReaction, function () {
            view['detectChanges']();
        }, { fireImmediately: true });
    };
    return MobxReactionDirective;
}(MobxAutorunDirective));
__decorate([
    Input(),
    __metadata("design:type", Object)
], MobxReactionDirective.prototype, "mobxReaction", void 0);
MobxReactionDirective = __decorate([
    Directive({ selector: '[mobxReaction]' }),
    __metadata("design:paramtypes", [TemplateRef,
        ViewContainerRef,
        Renderer])
], MobxReactionDirective);
export { MobxReactionDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ieC1yZWFjdGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvZGlyZWN0aXZlcy9tb2J4LXJlYWN0aW9uLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNoQyxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUc5RCxJQUFhLHFCQUFxQjtJQUFTLHlDQUFvQjtJQUc3RCwrQkFDWSxXQUE2QixFQUM3QixhQUErQixFQUMvQixRQUFrQjtRQUg5QixZQUdpQyxrQkFBTSxXQUFXLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxTQUFHO1FBRm5FLGlCQUFXLEdBQVgsV0FBVyxDQUFrQjtRQUM3QixtQkFBYSxHQUFiLGFBQWEsQ0FBa0I7UUFDL0IsY0FBUSxHQUFSLFFBQVEsQ0FBVTs7SUFBZ0QsQ0FBQztJQUUvRSwwQ0FBVSxHQUFWLFVBQVcsSUFBSTtRQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDekMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7UUFDMUIsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQWJELENBQTJDLG9CQUFvQixHQWE5RDtBQVpVO0lBQVIsS0FBSyxFQUFFOzsyREFBYztBQURYLHFCQUFxQjtJQURqQyxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztxQ0FLZixXQUFXO1FBQ1QsZ0JBQWdCO1FBQ3JCLFFBQVE7R0FObkIscUJBQXFCLENBYWpDO1NBYlkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZiwgSW5wdXQsIFJlbmRlcmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyByZWFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtNb2J4QXV0b3J1bkRpcmVjdGl2ZX0gZnJvbSAnLi9tb2J4LWF1dG9ydW4uZGlyZWN0aXZlJztcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW21vYnhSZWFjdGlvbl0nIH0pXG5leHBvcnQgY2xhc3MgTW9ieFJlYWN0aW9uRGlyZWN0aXZlIGV4dGVuZHMgTW9ieEF1dG9ydW5EaXJlY3RpdmUge1xuICBASW5wdXQoKSBtb2J4UmVhY3Rpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+LFxuICAgIHByb3RlY3RlZCB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByb3RlY3RlZCByZW5kZXJlcjogUmVuZGVyZXIpIHtzdXBlcih0ZW1wbGF0ZVJlZiwgdmlld0NvbnRhaW5lciwgcmVuZGVyZXIpOyB9XG5cbiAgYXV0b0RldGVjdCh2aWV3KSB7XG4gICAgdGhpcy5kaXNwb3NlID0gcmVhY3Rpb24odGhpcy5tb2J4UmVhY3Rpb24sICgpID0+IHtcbiAgICAgIHZpZXdbJ2RldGVjdENoYW5nZXMnXSgpO1xuICAgIH0sIHsgZmlyZUltbWVkaWF0ZWx5OiB0cnVlIH0pO1xuICB9XG59XG5cbmludGVyZmFjZSBEZWNvcmF0b3JJbnZvY2F0aW9uIHtcbiAgdHlwZTogRnVuY3Rpb247XG4gIGFyZ3M/OiBhbnlbXTtcbn1cbiJdfQ==