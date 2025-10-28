export interface WebXRSupportStatus {
  secureContext: boolean;
  hasXR: boolean;
  immersiveArSupported: boolean;
}

export interface SupportGuidance {
  status: WebXRSupportStatus;
  supported: boolean;
  message: string;
  buttonLabel?: string;
}

const isNavigatorXR = (nav: Navigator): nav is Navigator & { xr: XRSystem } =>
  "xr" in nav && nav.xr !== undefined;

/**
 * Detects whether the current browser can run immersive WebXR sessions.
 */
export const checkWebXRSupport = async (): Promise<WebXRSupportStatus> => {
  const secureContext = typeof window !== "undefined" ? window.isSecureContext : false;
  const hasXR =
    typeof navigator !== "undefined" && typeof window !== "undefined" && isNavigatorXR(navigator);

  let immersiveArSupported = false;

  if (hasXR) {
    try {
      immersiveArSupported = await navigator.xr.isSessionSupported("immersive-ar");
    } catch (error) {
      console.warn("Failed to query immersive-ar support", error);
      immersiveArSupported = false;
    }
  }

  return { secureContext, hasXR, immersiveArSupported };
};

const iosSupportMessage =
  "On iOS 17+, enable Settings → Safari → Advanced → Feature Flags → WebXR + WebXR Hit Test, then relaunch Safari.";

/**
 * Generates human-friendly guidance for the detected WebXR support status.
 */
export const getSupportGuidance = (status: WebXRSupportStatus): SupportGuidance => {
  if (!status.secureContext) {
    return {
      status,
      supported: false,
      message:
        "WebXR needs a secure context. Use `npm run start:tunnel` (HTTPS) or serve via HTTPS/mkcert.",
      buttonLabel: "Secure context required"
    };
  }

  if (!status.hasXR) {
    return {
      status,
      supported: false,
      message: `This browser does not expose WebXR. Use Safari 17+ or Chrome (Android). ${iosSupportMessage}`,
      buttonLabel: "Browser missing WebXR"
    };
  }

  if (!status.immersiveArSupported) {
    return {
      status,
      supported: false,
      message: `Immersive AR is disabled. ${iosSupportMessage}`,
      buttonLabel: "Enable WebXR features"
    };
  }

  return {
    status,
    supported: true,
    message: "Move your device to detect a surface."
  };
};
