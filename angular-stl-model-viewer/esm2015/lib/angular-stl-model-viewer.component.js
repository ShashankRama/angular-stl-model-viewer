import { __awaiter, __decorate } from "tslib";
import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const defaultMeshOptions = {
    castShadow: true,
    position: new THREE.Vector3(0, 0, 0),
    receiveShadow: true,
    scale: new THREE.Vector3(0.03, 0.03, 0.03)
};
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    }
    catch (e) {
        return false;
    }
}
let StlModelViewerComponent = class StlModelViewerComponent {
    constructor(cdr, eleRef, ngZone) {
        this.cdr = cdr;
        this.eleRef = eleRef;
        this.ngZone = ngZone;
        this.stlModels = [];
        this.hasControls = true;
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 15);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.light = new THREE.PointLight(0xffffff);
        this.material = new THREE.MeshPhongMaterial({ color: 0xc4c4c4, shininess: 100, specular: 0x111111 });
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.meshOptions = [];
        this.rendered = new EventEmitter();
        this.hasWebGL = isWebGLAvailable();
        this.meshGroup = new THREE.Object3D();
        this.isRendered = false;
        this.showStlModel = true;
        this.stlLoader = new STLLoader();
        this.render = () => {
            this.renderer.render(this.scene, this.camera);
        };
        this.onWindowResize = () => {
            this.setSizes();
            this.render();
        };
        this.cdr.detach();
        // default light position
        this.light.position.set(1, 1, 2);
        // default camera position
        this.camera.position.set(3, 3, 3);
        // default scene background
        this.scene.background = new THREE.Color(0xffffff);
        // default renderer options
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
    }
    ngOnInit() {
        if (!this.hasWebGL) {
            console.error('stl-model-viewer: Seems like your system does not support webgl.');
            return;
        }
        this.ngZone.runOutsideAngular(() => {
            this.init();
        });
    }
    ngOnDestroy() {
        window.removeEventListener('resize', this.onWindowResize, false);
        this.meshGroup.remove();
        if (this.renderer) {
            this.renderer.renderLists.dispose();
            this.renderer.dispose();
        }
        if (this.camera) {
            this.camera.remove();
        }
        if (this.light) {
            this.light.remove();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (this.controls) {
            this.controls.removeEventListener('change', this.render);
            this.controls.dispose();
        }
        if (this.scene) {
            this.scene.children.forEach((child) => {
                this.scene.remove(child);
            });
            this.scene.dispose();
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.camera.add(this.light);
            this.scene.add(this.camera);
            // use default controls
            if (this.hasControls && !this.controls) {
                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableZoom = true;
                this.controls.minDistance = 1;
                this.controls.maxDistance = 7;
                this.controls.addEventListener('change', this.render);
            }
            window.addEventListener('resize', this.onWindowResize, false);
            const meshCreations = this.stlModels.map((modelPath, index) => this.createMesh(modelPath, this.meshOptions[index]));
            const meshes = yield Promise.all(meshCreations);
            meshes.map((mesh) => this.meshGroup.add(mesh));
            this.scene.add(this.meshGroup);
            this.eleRef.nativeElement.appendChild(this.renderer.domElement);
            this.setSizes();
            this.render();
            this.ngZone.run(() => {
                this.isRendered = true;
                this.rendered.emit();
                this.cdr.detectChanges();
            });
        });
    }
    createMesh(path, meshOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const geometry = yield this.stlLoader.loadAsync(path);
            const mesh = new THREE.Mesh(geometry, this.material);
            const vectorOptions = ['position', 'scale', 'up'];
            const options = Object.assign({}, defaultMeshOptions, meshOptions);
            Object.getOwnPropertyNames(options).forEach((option) => {
                if (vectorOptions.indexOf(option) > -1) {
                    const vector = options[option];
                    const meshVectorOption = mesh[option];
                    meshVectorOption.set(vector.x, vector.y, vector.z);
                }
                else {
                    mesh[option] = options[option];
                }
            });
            return mesh;
        });
    }
    setSizes() {
        const width = this.eleRef.nativeElement.offsetWidth;
        const height = this.eleRef.nativeElement.offsetHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
};
StlModelViewerComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: ElementRef },
    { type: NgZone }
];
__decorate([
    Input()
], StlModelViewerComponent.prototype, "stlModels", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "hasControls", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "camera", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "cameraTarget", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "light", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "material", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "scene", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "renderer", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "controls", void 0);
__decorate([
    Input()
], StlModelViewerComponent.prototype, "meshOptions", void 0);
__decorate([
    Output()
], StlModelViewerComponent.prototype, "rendered", void 0);
StlModelViewerComponent = __decorate([
    Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        selector: 'stl-model-viewer',
        template: '',
        styles: [`
:host {
  width: 100%;
  height: 100%;
  display: block;
}
  `]
    })
], StlModelViewerComponent);
export { StlModelViewerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1zdGwtbW9kZWwtdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItc3RsLW1vZGVsLXZpZXdlci8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyLXN0bC1tb2RlbC12aWV3ZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsTUFBTSxFQUNOLE1BQU0sRUFDTix1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZSxDQUFBO0FBRXRCLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFjekUsTUFBTSxrQkFBa0IsR0FBRztJQUN6QixVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLGFBQWEsRUFBRSxJQUFJO0lBQ25CLEtBQUssRUFBRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7Q0FDM0MsQ0FBQTtBQUVELFNBQVMsZ0JBQWdCO0lBQ3ZCLElBQUk7UUFDRixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQy9DLE9BQU8sQ0FBQyxDQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3JIO0lBQUMsT0FBTyxDQUFD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REFBdUM7QUFDdEM7SUFBUixLQUFLLEVBQUU7eURBQTZFO0FBQzVFO0lBQVIsS0FBSyxFQUFFO3lEQUE0QjtBQUMzQjtJQUFSLEtBQUssRUFBRTs0REFBZ0M7QUFFOUI7SUFBVCxNQUFNLEVBQUU7eURBQW9DO0FBWmxDLHVCQUF1QjtJQVpuQyxTQUFTLENBQUM7UUFDVCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtRQUMvQyxRQUFRLEVBQUUsa0JBQWtCO1FBUTVCLFFBQVEsRUFBRSxFQUFFO2lCQVBIOzs7Ozs7R0FNUjtLQUVGLENBQUM7R0FDVyx1QkFBdUIsQ0EySm5DO1NBM0pZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSdcblxuaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnXG5cbmltcG9ydCB7IFNUTExvYWRlciB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL1NUTExvYWRlcidcbmltcG9ydCB7IE9yYml0Q29udHJvbHMgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vY29udHJvbHMvT3JiaXRDb250cm9scydcblxuaW1wb3J0IHsgVmVjdG9yMyB9IGZyb20gJ3RocmVlJ1xuXG5leHBvcnQgaW50ZXJmYWNlIE1lc2hPcHRpb25zIHtcbiAgY2FzdFNoYWRvdz86IGJvb2xlYW5cbiAgcG9zaXRpb24/OiBUSFJFRS5WZWN0b3IzXG4gIHJlY2VpdmVTaGFkb3c/OiBib29sZWFuXG4gIHNjYWxlPzogVEhSRUUuVmVjdG9yM1xuICB1cD86IFRIUkVFLlZlY3RvcjNcbiAgdXNlckRhdGE/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB2aXNpYmxlPzogYm9vbGVhblxufVxuXG5jb25zdCBkZWZhdWx0TWVzaE9wdGlvbnMgPSB7XG4gIGNhc3RTaGFkb3c6IHRydWUsXG4gIHBvc2l0aW9uOiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSxcbiAgcmVjZWl2ZVNoYWRvdzogdHJ1ZSxcbiAgc2NhbGU6IG5ldyBUSFJFRS5WZWN0b3IzKDAuMDMsIDAuMDMsIDAuMDMpXG59XG5cbmZ1bmN0aW9uIGlzV2ViR0xBdmFpbGFibGUoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgICByZXR1cm4gISEgKHdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgJiYgKGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcpIHx8IGNhbnZhcy5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJykpKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQENvbXBvbmVudCh7XG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzZWxlY3RvcjogJ3N0bC1tb2RlbC12aWV3ZXInLFxuICBzdHlsZXM6IFtgXG46aG9zdCB7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuICBgXSxcbiAgdGVtcGxhdGU6ICcnXG59KVxuZXhwb3J0IGNsYXNzIFN0bE1vZGVsVmlld2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBzdGxNb2RlbHM6IHN0cmluZ1tdID0gW11cbiAgQElucHV0KCkgaGFzQ29udHJvbHMgPSB0cnVlXG4gIEBJbnB1dCgpIGNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzUsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCAxNSlcbiAgQElucHV0KCkgY2FtZXJhVGFyZ2V0OiBUSFJFRS5WZWN0b3IzID0gbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKVxuICBASW5wdXQoKSBsaWdodDogVEhSRUUuTGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCggMHhmZmZmZmYgKVxuICBASW5wdXQoKSBtYXRlcmlhbDogVEhSRUUuTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoeyBjb2xvcjogMHhjNGM0YzQsIHNoaW5pbmVzczogMTAwLCBzcGVjdWxhcjogMHgxMTExMTEgfSlcbiAgQElucHV0KCkgc2NlbmU6IFRIUkVFLlNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKClcbiAgQElucHV0KCkgcmVuZGVyZXI6IFRIUkVFLldlYkdMUmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogdHJ1ZSB9KVxuICBASW5wdXQoKSBjb250cm9sczogYW55IHwgbnVsbCA9IG51bGxcbiAgQElucHV0KCkgbWVzaE9wdGlvbnM6IE1lc2hPcHRpb25zW10gPSBbXVxuXG4gIEBPdXRwdXQoKSByZW5kZXJlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKVxuXG4gIGhhc1dlYkdMID0gaXNXZWJHTEF2YWlsYWJsZSgpXG4gIG1lc2hHcm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpXG4gIGlzUmVuZGVyZWQgPSBmYWxzZVxuICBzaG93U3RsTW9kZWwgPSB0cnVlXG4gIHN0bExvYWRlciA9IG5ldyBTVExMb2FkZXIoKVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIGVsZVJlZjogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIG5nWm9uZTogTmdab25lXG4gICkge1xuICAgIHRoaXMuY2RyLmRldGFjaCgpXG4gICAgLy8gZGVmYXVsdCBsaWdodCBwb3NpdGlvblxuICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KDEsIDEsIDIpXG5cbiAgICAvLyBkZWZhdWx0IGNhbWVyYSBwb3NpdGlvblxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnNldCgzLCAzLCAzKVxuXG4gICAgLy8gZGVmYXVsdCBzY2VuZSBiYWNrZ3JvdW5kXG4gICAgdGhpcy5zY2VuZS5iYWNrZ3JvdW5kID0gbmV3IFRIUkVFLkNvbG9yKDB4ZmZmZmZmKVxuXG4gICAgLy8gZGVmYXVsdCByZW5kZXJlciBvcHRpb25zXG4gICAgdGhpcy5yZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKVxuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB0cnVlXG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzV2ViR0wpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3N0bC1tb2RlbC12aWV3ZXI6IFNlZW1zIGxpa2UgeW91ciBzeXN0ZW0gZG9lcyBub3Qgc3VwcG9ydCB3ZWJnbC4nKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgdGhpcy5pbml0KClcbiAgICB9KVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25XaW5kb3dSZXNpemUsIGZhbHNlKVxuXG4gICAgdGhpcy5tZXNoR3JvdXAucmVtb3ZlKClcblxuICAgIGlmICh0aGlzLnJlbmRlcmVyKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlckxpc3RzLmRpc3Bvc2UoKVxuICAgICAgdGhpcy5yZW5kZXJlci5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jYW1lcmEpIHtcbiAgICAgIHRoaXMuY2FtZXJhLnJlbW92ZSgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGlnaHQpIHtcbiAgICAgIHRoaXMubGlnaHQucmVtb3ZlKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tYXRlcmlhbCkge1xuICAgICAgdGhpcy5tYXRlcmlhbC5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb250cm9scykge1xuICAgICAgdGhpcy5jb250cm9scy5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLnJlbmRlcilcbiAgICAgIHRoaXMuY29udHJvbHMuZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2NlbmUpIHtcbiAgICAgIHRoaXMuc2NlbmUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUoY2hpbGQpXG4gICAgICB9KVxuICAgICAgdGhpcy5zY2VuZS5kaXNwb3NlKClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5jYW1lcmEuYWRkKHRoaXMubGlnaHQpXG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5jYW1lcmEpXG5cbiAgICAvLyB1c2UgZGVmYXVsdCBjb250cm9sc1xuICAgIGlmICh0aGlzLmhhc0NvbnRyb2xzICYmICF0aGlzLmNvbnRyb2xzKSB7XG4gICAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHModGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudClcbiAgICAgIHRoaXMuY29udHJvbHMuZW5hYmxlWm9vbSA9IHRydWVcbiAgICAgIHRoaXMuY29udHJvbHMubWluRGlzdGFuY2UgPSAxXG4gICAgICB0aGlzLmNvbnRyb2xzLm1heERpc3RhbmNlID0gN1xuXG4gICAgICB0aGlzLmNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMucmVuZGVyKVxuICAgIH1cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uV2luZG93UmVzaXplLCBmYWxzZSlcblxuICAgIGNvbnN0IG1lc2hDcmVhdGlvbnMgPSB0aGlzLnN0bE1vZGVscy5tYXAoKG1vZGVsUGF0aCwgaW5kZXgpID0+IHRoaXMuY3JlYXRlTWVzaChtb2RlbFBhdGgsIHRoaXMubWVzaE9wdGlvbnNbaW5kZXhdKSlcbiAgICBjb25zdCBtZXNoZXM6IFRIUkVFLk9iamVjdDNEW10gPSBhd2FpdCBQcm9taXNlLmFsbChtZXNoQ3JlYXRpb25zKVxuXG4gICAgbWVzaGVzLm1hcCgobWVzaCkgPT4gdGhpcy5tZXNoR3JvdXAuYWRkKG1lc2gpKVxuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMubWVzaEdyb3VwKVxuICAgIHRoaXMuZWxlUmVmLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlci5kb21FbGVtZW50KVxuICAgIHRoaXMuc2V0U2l6ZXMoKVxuICAgIHRoaXMucmVuZGVyKClcbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5pc1JlbmRlcmVkID0gdHJ1ZVxuICAgICAgdGhpcy5yZW5kZXJlZC5lbWl0KClcbiAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBjcmVhdGVNZXNoKHBhdGg6IHN0cmluZywgbWVzaE9wdGlvbnM6IE1lc2hPcHRpb25zID0ge30pOiBQcm9taXNlPFRIUkVFLk1lc2g+IHtcbiAgICBjb25zdCBnZW9tZXRyeTogVEhSRUUuQnVmZmVyR2VvbWV0cnkgPSBhd2FpdCB0aGlzLnN0bExvYWRlci5sb2FkQXN5bmMocGF0aClcbiAgICBjb25zdCBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpXG5cbiAgICBjb25zdCB2ZWN0b3JPcHRpb25zID0gWydwb3NpdGlvbicsICdzY2FsZScsICd1cCddXG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRNZXNoT3B0aW9ucywgbWVzaE9wdGlvbnMpXG5cbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvcHRpb25zKS5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgIGlmICh2ZWN0b3JPcHRpb25zLmluZGV4T2Yob3B0aW9uKSA+IC0xKSB7XG4gICAgICAgIGNvbnN0IHZlY3RvciA9IG9wdGlvbnNbb3B0aW9uXSBhcyBWZWN0b3IzXG4gICAgICAgIGNvbnN0IG1lc2hWZWN0b3JPcHRpb24gPSBtZXNoW29wdGlvbl0gYXMgVmVjdG9yM1xuICAgICAgICBtZXNoVmVjdG9yT3B0aW9uLnNldCh2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVzaFtvcHRpb25dID0gb3B0aW9uc1tvcHRpb25dXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBtZXNoXG4gIH1cblxuICByZW5kZXIgPSAoKSA9PiB7XG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpXG4gIH1cblxuICBzZXRTaXplcygpIHtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuZWxlUmVmLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGhcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmVsZVJlZi5uYXRpdmVFbGVtZW50Lm9mZnNldEhlaWdodFxuXG4gICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2lkdGggLyBoZWlnaHRcbiAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KClcblxuICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KVxuICB9XG5cbiAgb25XaW5kb3dSZXNpemUgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTaXplcygpXG4gICAgdGhpcy5yZW5kZXIoKVxuICB9XG59XG4iXX0=