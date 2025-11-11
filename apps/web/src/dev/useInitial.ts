import type { InitialHookStatus } from "@react-buddy/ide-toolbox";
import { useState } from "react";

export const useInitial: () => InitialHookStatus = () => {
    const [status] = useState<InitialHookStatus>({
        loading: false,
        error: false,
    });
    return status;
};
