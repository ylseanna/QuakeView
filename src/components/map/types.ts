export type ControllerOptions = {
  /** Enable zooming with mouse wheel. Default `true`. */
  scrollZoom?:
    | boolean
    | {
        /** Scaler that translates wheel delta to the change of viewport scale. Default `0.01`. */
        speed?: number;
        /** Smoothly transition to the new zoom. If enabled, will provide a slightly lagged but smoother experience. Default `false`. */
        smooth?: boolean;
      };
  /** Enable panning with pointer drag. Default `true` */
  dragPan?: boolean;
  /** Enable rotating with pointer drag. Default `true` */
  dragRotate?: boolean;
  /** Enable zooming with double click. Default `true` */
  doubleClickZoom?: boolean;
  /** Enable zooming with multi-touch. Default `true` */
  touchZoom?: boolean;
  /** Enable rotating with multi-touch. Use two-finger rotating gesture for horizontal and three-finger swiping gesture for vertical rotation. Default `false` */
  touchRotate?: boolean;
  /** Enable interaction with keyboard. Default `true`. */
  keyboard?:
    | boolean
    | {
        /** Speed of zoom using +/- keys. Default `2` */
        zoomSpeed?: number;
        /** Speed of movement using arrow keys, in pixels. */
        moveSpeed?: number;
        /** Speed of rotation using shift + left/right arrow keys, in degrees. Default 15. */
        rotateSpeedX?: number;
        /** Speed of rotation using shift + up/down arrow keys, in degrees. Default 10. */
        rotateSpeedY?: number;
      };
  /** Drag behavior without pressing function keys, one of `pan` and `rotate`. */
  dragMode?: "pan" | "rotate";
  /** Enable inertia after panning/pinching. If a number is provided, indicates the duration of time over which the velocity reduces to zero, in milliseconds. Default `false`. */
  inertia?: boolean | number;
};