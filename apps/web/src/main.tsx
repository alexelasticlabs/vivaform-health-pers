import React from "react";
import ReactDOM from "react-dom/client";
import {RouterProvider} from "react-router-dom";
import "@radix-ui/themes/styles.css";

import {AppProviders} from "@/providers/app-providers";
import {createAppRouter} from "@/routes/router-v2";
import {initSentry} from '@/lib/sentry';
import "./styles/tailwind.css";
import "./styles/animations.css";
import "./styles/quiz-fallback.css";

// Reset one-time reload flag after successful app start
try { sessionStorage.removeItem('vivaform:dynamic-import-reloaded'); } catch {}

const router = createAppRouter();

// Safely create/reuse root to avoid "createRoot() called twice" during HMR
function getOrCreateRoot(container: HTMLElement) {
  const key = '__vivaform_app_root__';
  const w = window as any;
  if (!w[key]) {
    w[key] = ReactDOM.createRoot(container);
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        try { w[key]?.unmount?.(); } catch {}
        w[key] = undefined;
      });
    }
  }
  return w[key] as ReturnType<typeof ReactDOM.createRoot>;
}

initSentry();

const enableDevToolbox = import.meta.env.DEV && import.meta.env.VITE_DEV_TOOLBOX === '1';

const root = getOrCreateRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <AppProviders>
            {enableDevToolbox ? <DevToolbox router={router}/> : <RouterProvider router={router}/>}
        </AppProviders>
    </React.StrictMode>
);

function DevToolbox({router}: { router: ReturnType<typeof createAppRouter> }) {
    const [Comp, setComp] = React.useState<React.ReactNode>(null);
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            const [{DevSupport}, {ComponentPreviews, useInitial}] = await Promise.all([
                import("@react-buddy/ide-toolbox"),
                import("./dev")
            ]);
            if (mounted) {
                setComp(
                    <DevSupport ComponentPreviews={ComponentPreviews} useInitialHook={useInitial}>
                        <RouterProvider router={router}/>
                    </DevSupport>
                );
            }
        })();
        return () => {
            mounted = false;
        };
    }, [router]);
    return <>{Comp}</>;
}
