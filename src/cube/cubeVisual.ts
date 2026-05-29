import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { FaceId } from "./colors";
import { FACE_HEX, UNPAINTED } from "./colors";
import type { CubeController } from "./cubeController";
import { Facelet, isCenterFacelet } from "./faceletEnum";
import { FACE_GEOMETRY, meshToFaceletId } from "./faceletLayout";

const STICKER = 0.94;
const GAP = 0.07;
const OFFSET = 1.52;
const BLACK_PLASTIC = 0x050507;

interface Sticker {
  faceletId: Facelet;
  mesh: THREE.Mesh;
}

export class CubeVisual {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;
  private readonly root = new THREE.Group();
  private readonly stickers = new Map<Facelet, Sticker>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private paintColor: FaceId = "U";
  private paintingEnabled = false;
  private dragging = false;
  private busy = false;

  constructor(
    canvas: HTMLCanvasElement,
    readonly controller: CubeController,
  ) {
    this.scene.background = new THREE.Color(0xf0f0ea);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(5, 4.5, 6);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 14;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 4);
    this.scene.add(key);

    this.scene.add(this.root);
    this.buildStickers();
    this.syncFromController();

    canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    canvas.addEventListener("click", (e) => this.onClick(e));
    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.animate();
  }

  setPaintColor(face: FaceId): void {
    this.paintColor = face;
  }

  setPaintingEnabled(enabled: boolean): void {
    this.paintingEnabled = enabled;
  }

  get isBusy(): boolean {
    return this.busy;
  }

  applyMoveInstant(moveIdx: number): void {
    this.controller.applyMoveIndex(moveIdx);
    this.syncFromController();
  }

  syncFromController(): void {
    const str = this.controller.getFaceletString();
    for (const [id, st] of this.stickers) {
      const ch = str[id];
      const mats = st.mesh.material as THREE.MeshStandardMaterial[];
      const mat = mats[4];
      if (!ch || !"URFDLB".includes(ch)) {
        mat.color.setHex(UNPAINTED);
      } else {
        mat.color.setHex(FACE_HEX[ch as FaceId]);
      }
      mat.emissive.setHex(isCenterFacelet(id) ? 0x151518 : 0x000000);
    }
  }

  async applyMoveWithFlash(moveIdx: number): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.controls.enabled = false;
    this.controller.applyMoveIndex(moveIdx);
    this.syncFromController();
    await sleep(40);
    this.busy = false;
    this.controls.enabled = true;
  }

  private buildStickers(): void {
    const geo = new THREE.BoxGeometry(STICKER, STICKER, 0.1);
    const faces: FaceId[] = ["U", "R", "F", "D", "L", "B"];
    for (const face of faces) {
      const { normal: n, right: r, up: u } = FACE_GEOMETRY[face];
      const normal = new THREE.Vector3(...n);
      const right = new THREE.Vector3(...r);
      const up = new THREE.Vector3(...u);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const faceletId = meshToFaceletId(face, row, col);
          const stickerMat = new THREE.MeshStandardMaterial({
            color: UNPAINTED,
            metalness: 0.12,
            roughness: 0.5,
          });
          const plasticMat = new THREE.MeshStandardMaterial({
            color: BLACK_PLASTIC,
            metalness: 0.1,
            roughness: 0.62,
          });
          const mesh = new THREE.Mesh(geo, [
            plasticMat,
            plasticMat,
            plasticMat,
            plasticMat,
            stickerMat,
            plasticMat,
          ]);
          mesh.position
            .addScaledVector(right, (col - 1) * (STICKER + GAP))
            .addScaledVector(up, (1 - row) * (STICKER + GAP))
            .addScaledVector(normal, OFFSET);
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
          mesh.userData.faceletId = faceletId;
          this.root.add(mesh);
          this.stickers.set(faceletId, { faceletId, mesh });
        }
      }
    }
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(2.55, 2.55, 2.55),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0e }),
    );
    this.root.add(core);
  }

  resize(): void {
    const parent = this.renderer.domElement.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private paintAt(clientX: number, clientY: number): void {
    const id = this.pickFacelet(clientX, clientY);
    if (id === null || isCenterFacelet(id)) return;
    this.controller.setPaintedFacelet(id, this.paintColor);
    this.syncFromController();
  }

  private pickFacelet(clientX: number, clientY: number): Facelet | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = [...this.stickers.values()].map((s) => s.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;
    return hits[0].object.userData.faceletId as Facelet;
  }

  private onPointerDown(e: PointerEvent): void {
    this.dragging = false;
    const sx = e.clientX;
    const sy = e.clientY;
    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) this.dragging = true;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  private onClick(e: MouseEvent): void {
    if (!this.paintingEnabled || this.dragging || this.busy) return;
    this.paintAt(e.clientX, e.clientY);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
