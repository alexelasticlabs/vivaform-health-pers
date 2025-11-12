import React from "react";
import ReactDOM from "react-dom/client";
import {RouterProvider} from "react-router-dom";
import "@radix-ui/themes/styles.css";

import {AppProviders} from "@/providers/app-providers";
import {createAppRouter} from "@/routes/router";
import {initSentry} from '@/lib/sentry';
import "./styles/tailwind.css";
import "./styles/animations.css";

const router = createAppRouter();

initSentry();

const enableDevToolbox = import.meta.env.DEV && import.meta.env.VITE_DEV_TOOLBOX === '1';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
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
